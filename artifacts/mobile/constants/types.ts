export type UserRole = 'student' | 'faculty' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  studentId?: string;
  employeeId?: string;
  department: string;
  year?: string;
  phone?: string;
  bio?: string;
  joinedAt: string;
}

export type EventCategory = 'Technical' | 'Cultural' | 'Sports' | 'Workshop' | 'Seminar' | 'Other';
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  endTime: string;
  venue: string;
  organizer: string;
  organizerId: string;
  category: EventCategory;
  capacity: number;
  registered: number;
  image?: string;
  status: EventStatus;
  tags: string[];
  requirements?: string;
  speakers?: string[];
  hasCertificate: boolean;
}

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  registeredAt: string;
  attended: boolean;
  qrCode: string;
  checkedInAt?: string;
}

export interface Certificate {
  id: string;
  userId: string;
  eventId: string;
  issuedAt: string;
  certificateNumber: string;
  eventTitle: string;
  userName: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'registration' | 'reminder' | 'certificate' | 'announcement' | 'update';
  read: boolean;
  createdAt: string;
}

export interface Feedback {
  id: string;
  userId: string;
  eventId: string;
  rating: number;
  comment: string;
  createdAt: string;
}
