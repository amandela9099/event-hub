import { Redirect } from 'expo-router';

// This legacy route group is replaced by (student), (faculty), (admin) layouts.
// Redirect any stray traffic to the root which handles auth.
export default function LegacyTabsLayout() {
  return <Redirect href="/" />;
}
