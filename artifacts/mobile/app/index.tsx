import { ActivityIndicator, View } from 'react-native';
import { useColors } from '../hooks/useColors';

// AuthGate in _layout.tsx handles all auth-based redirects.
// This screen shows only while fonts/auth are loading.
export default function Index() {
  const colors = useColors();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
