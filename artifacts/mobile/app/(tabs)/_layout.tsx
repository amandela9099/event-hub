import { Slot } from 'expo-router';

// Legacy route group — kept to satisfy file-based routing.
// Individual screens under (tabs)/ redirect to root.
export default function LegacyTabsLayout() {
  return <Slot />;
}
