import { useThemeColors } from '@/hooks/useThemeColors';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

interface CheckInBadgeProps {
  checkInDone: boolean;
  departureAt?: string;
  size?: 'sm' | 'md';
}

export function NotificationBadge({ checkInDone, departureAt, size = 'sm' }: CheckInBadgeProps) {
  const colors = useThemeColors();
  const isLarge = size === 'md';

  if (checkInDone) {
    return (
      <View
        className={`flex-row items-center gap-x-1 rounded-lg bg-success/12 ${isLarge ? 'px-3 py-1.5' : 'px-2.5 py-1'}`}
      >
        <MaterialIcons name="check-circle" size={isLarge ? 14 : 11} color={colors.success} />
        <Text
          className={`text-success font-bold ${isLarge ? 'text-sm' : 'text-[10px]'}`}
        >
          Check-in completado
        </Text>
      </View>
    );
  }

  const isFailed = departureAt ? new Date(departureAt).getTime() <= Date.now() : false;

  if (isFailed) {
    return (
      <View
        className={`flex-row items-center gap-x-1 rounded-lg bg-red-500/10 ${isLarge ? 'px-3 py-1.5' : 'px-2.5 py-1'}`}
      >
        <MaterialIcons name="error" size={isLarge ? 14 : 11} color="#ef4444" />
        <Text
          className={`text-red-500 font-bold ${isLarge ? 'text-sm' : 'text-[10px]'}`}
        >
          Check-in fallido
        </Text>
      </View>
    );
  }

  return (
    <View
      className={`flex-row items-center gap-x-1 rounded-lg bg-warning/10 ${isLarge ? 'px-3 py-1.5' : 'px-2.5 py-1'}`}
    >
      <MaterialIcons name="assignment-late" size={isLarge ? 14 : 11} color={colors.warning} />
      <Text
        className={`text-warning font-bold ${isLarge ? 'text-sm' : 'text-[10px]'}`}
      >
        Check-in pendiente
      </Text>
    </View>
  );
}
