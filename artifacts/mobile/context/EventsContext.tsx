import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { MOCK_EVENTS } from '../constants/mockData';
import { AppNotification, Certificate, Event, Feedback, Registration } from '../constants/types';

interface EventsContextType {
  events: Event[];
  registrations: Registration[];
  certificates: Certificate[];
  notifications: AppNotification[];
  feedbacks: Feedback[];
  isLoading: boolean;
  registerForEvent: (eventId: string, userId: string) => Promise<{ success: boolean; error?: string }>;
  unregisterFromEvent: (eventId: string, userId: string) => Promise<void>;
  isRegistered: (eventId: string, userId: string) => boolean;
  getRegistration: (eventId: string, userId: string) => Registration | undefined;
  getUserRegistrations: (userId: string) => Registration[];
  getUserCertificates: (userId: string) => Certificate[];
  getUserNotifications: (userId: string) => AppNotification[];
  markNotificationRead: (notificationId: string) => Promise<void>;
  submitFeedback: (feedback: Omit<Feedback, 'id' | 'createdAt'>) => Promise<void>;
  markAttendance: (qrCode: string) => Promise<{ success: boolean; message: string }>;
  addEvent: (event: Omit<Event, 'id' | 'registered'>) => Promise<Event>;
  getOrganizerEvents: (organizerId: string) => Event[];
  getEventRegistrations: (eventId: string) => Registration[];
  issueCertificate: (userId: string, eventId: string, userName: string, eventTitle: string) => Promise<void>;
}

const EventsContext = createContext<EventsContextType | null>(null);

const REGS_KEY = '@eventhub_registrations';
const CERTS_KEY = '@eventhub_certificates';
const NOTIFS_KEY = '@eventhub_notifications';
const FEEDBACK_KEY = '@eventhub_feedback';
const EVENTS_KEY = '@eventhub_events';

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [regs, certs, notifs, feedbs, evts] = await Promise.all([
        AsyncStorage.getItem(REGS_KEY),
        AsyncStorage.getItem(CERTS_KEY),
        AsyncStorage.getItem(NOTIFS_KEY),
        AsyncStorage.getItem(FEEDBACK_KEY),
        AsyncStorage.getItem(EVENTS_KEY),
      ]);
      if (regs) setRegistrations(JSON.parse(regs));
      if (certs) setCertificates(JSON.parse(certs));
      if (notifs) setNotifications(JSON.parse(notifs));
      if (feedbs) setFeedbacks(JSON.parse(feedbs));
      if (evts) {
        const custom: Event[] = JSON.parse(evts);
        setEvents([...MOCK_EVENTS, ...custom]);
      }
    } catch {}
    finally { setIsLoading(false); }
  };

  const save = async (key: string, data: unknown) => {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  };

  const registerForEvent = useCallback(async (eventId: string, userId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return { success: false, error: 'Event not found' };
    if (event.registered >= event.capacity) return { success: false, error: 'Event is full' };
    if (registrations.find(r => r.eventId === eventId && r.userId === userId)) {
      return { success: false, error: 'Already registered' };
    }
    const reg: Registration = {
      id: `reg_${Date.now()}`,
      eventId,
      userId,
      registeredAt: new Date().toISOString(),
      attended: false,
      qrCode: `EVH-${eventId}-${userId}-${Date.now()}`,
    };
    const newRegs = [...registrations, reg];
    setRegistrations(newRegs);
    await save(REGS_KEY, newRegs);

    const updatedEvents = events.map(e =>
      e.id === eventId ? { ...e, registered: e.registered + 1 } : e
    );
    setEvents(updatedEvents);

    const notif: AppNotification = {
      id: `n_${Date.now()}`,
      userId,
      title: 'Registration Confirmed!',
      message: `You are registered for "${event.title}" on ${event.date}.`,
      type: 'registration',
      read: false,
      createdAt: new Date().toISOString(),
    };
    const newNotifs = [...notifications, notif];
    setNotifications(newNotifs);
    await save(NOTIFS_KEY, newNotifs);

    return { success: true };
  }, [events, registrations, notifications]);

  const unregisterFromEvent = useCallback(async (eventId: string, userId: string) => {
    const newRegs = registrations.filter(r => !(r.eventId === eventId && r.userId === userId));
    setRegistrations(newRegs);
    await save(REGS_KEY, newRegs);
    const updatedEvents = events.map(e =>
      e.id === eventId ? { ...e, registered: Math.max(0, e.registered - 1) } : e
    );
    setEvents(updatedEvents);
  }, [registrations, events]);

  const isRegistered = useCallback((eventId: string, userId: string) =>
    registrations.some(r => r.eventId === eventId && r.userId === userId), [registrations]);

  const getRegistration = useCallback((eventId: string, userId: string) =>
    registrations.find(r => r.eventId === eventId && r.userId === userId), [registrations]);

  const getUserRegistrations = useCallback((userId: string) =>
    registrations.filter(r => r.userId === userId), [registrations]);

  const getUserCertificates = useCallback((userId: string) =>
    certificates.filter(c => c.userId === userId), [certificates]);

  const getUserNotifications = useCallback((userId: string) =>
    notifications.filter(n => n.userId === userId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ), [notifications]);

  const markNotificationRead = useCallback(async (notificationId: string) => {
    const updated = notifications.map(n => n.id === notificationId ? { ...n, read: true } : n);
    setNotifications(updated);
    await save(NOTIFS_KEY, updated);
  }, [notifications]);

  const submitFeedback = useCallback(async (fb: Omit<Feedback, 'id' | 'createdAt'>) => {
    const newFb: Feedback = { ...fb, id: `fb_${Date.now()}`, createdAt: new Date().toISOString() };
    const updated = [...feedbacks, newFb];
    setFeedbacks(updated);
    await save(FEEDBACK_KEY, updated);
  }, [feedbacks]);

  const markAttendance = useCallback(async (qrCode: string) => {
    const reg = registrations.find(r => r.qrCode === qrCode);
    if (!reg) return { success: false, message: 'Invalid QR code' };
    if (reg.attended) return { success: false, message: 'Attendance already marked' };
    const updated = registrations.map(r =>
      r.qrCode === qrCode ? { ...r, attended: true, checkedInAt: new Date().toISOString() } : r
    );
    setRegistrations(updated);
    await save(REGS_KEY, updated);
    return { success: true, message: 'Attendance marked successfully!' };
  }, [registrations]);

  const addEvent = useCallback(async (eventData: Omit<Event, 'id' | 'registered'>) => {
    const newEvent: Event = { ...eventData, id: `e_${Date.now()}`, registered: 0 };
    const customEvents = events.filter(e => e.id.startsWith('e_'));
    const updatedCustom = [...customEvents, newEvent];
    await save(EVENTS_KEY, updatedCustom);
    setEvents(prev => [...prev, newEvent]);
    return newEvent;
  }, [events]);

  const getOrganizerEvents = useCallback((organizerId: string) =>
    events.filter(e => e.organizerId === organizerId), [events]);

  const getEventRegistrations = useCallback((eventId: string) =>
    registrations.filter(r => r.eventId === eventId), [registrations]);

  const issueCertificate = useCallback(async (userId: string, eventId: string, userName: string, eventTitle: string) => {
    if (certificates.find(c => c.userId === userId && c.eventId === eventId)) return;
    const cert: Certificate = {
      id: `cert_${Date.now()}`,
      userId,
      eventId,
      issuedAt: new Date().toISOString(),
      certificateNumber: `EVH-${eventId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
      eventTitle,
      userName,
    };
    const updated = [...certificates, cert];
    setCertificates(updated);
    await save(CERTS_KEY, updated);

    const notif: AppNotification = {
      id: `n_${Date.now()}`,
      userId,
      title: 'Certificate Issued!',
      message: `Your certificate for "${eventTitle}" is ready.`,
      type: 'certificate',
      read: false,
      createdAt: new Date().toISOString(),
    };
    const newNotifs = [...notifications, notif];
    setNotifications(newNotifs);
    await save(NOTIFS_KEY, newNotifs);
  }, [certificates, notifications]);

  return (
    <EventsContext.Provider value={{
      events, registrations, certificates, notifications, feedbacks, isLoading,
      registerForEvent, unregisterFromEvent, isRegistered, getRegistration,
      getUserRegistrations, getUserCertificates, getUserNotifications,
      markNotificationRead, submitFeedback, markAttendance, addEvent,
      getOrganizerEvents, getEventRegistrations, issueCertificate,
    }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents must be used inside EventsProvider');
  return ctx;
}
