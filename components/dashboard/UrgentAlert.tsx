import { type UpcomingCheckIn } from '@/api/dashboard';
import { useThemeColors } from '@/hooks/useThemeColors';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

interface UrgentAlertProps {
  items: UpcomingCheckIn[];
}

export function UrgentAlert({ items }: UrgentAlertProps) {
  const colors = useThemeColors();
  const urgent = items.filter(
    (i) =>
      !i.isNotified &&
      new Date(i.departureAt).getTime() - Date.now() < 24 * 60 * 60 * 1000 &&
      new Date(i.departureAt).getTime() > Date.now(),
  );

  if (urgent.length === 0) return null;

  const label =
    urgent.length === 1
      ? `${urgent[0].clientName} tiene check-in en menos de 24h`
      : `${urgent.length} clientes tienen check-in en menos de 24h`;

  return (
    <TouchableOpacity
      onPress={() => router.push('/(tabs)/viajes')}
      activeOpacity={0.8}
      className="mx-5 mt-3 mb-1 rounded-2xl border border-warning/30 bg-warning/8 px-4 py-3.5"
    >
      <View className="flex-row items-center gap-x-3">
        <View className="w-9 h-9 rounded-xl items-center justify-center flex-shrink-0 bg-warning/18">
          <MaterialIcons name="notification-important" size={18} color={colors.warning} />
        </View>
        <View className="flex-1">
          <Text className="text-warning text-sm font-bold">{'\u00a1Acci\u00f3n requerida!'}</Text>
          <Text className="text-warning/80 text-xs mt-0.5">{label}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={18} color={colors.warning} />
      </View>
    </TouchableOpacity>
  );
}
