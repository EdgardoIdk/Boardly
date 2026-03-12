import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

interface CheckInBadgeProps {
  checkInDone: boolean;
  size?: 'sm' | 'md';
}

export function NotificationBadge({ checkInDone, size = 'sm' }: CheckInBadgeProps) {
  const isLarge = size === 'md';

  if (checkInDone) {
    return (
      <View
        style={{ backgroundColor: 'rgba(34,197,94,0.12)' }}
        className={`flex-row items-center gap-x-1 rounded-lg ${isLarge ? 'px-3 py-1.5' : 'px-2.5 py-1'}`}
      >
        <MaterialIcons name="check-circle" size={isLarge ? 14 : 11} color="#22c55e" />
        <Text
          style={{ color: '#22c55e' }}
          className={`font-bold ${isLarge ? 'text-sm' : 'text-[10px]'}`}
        >
          Check-in completado
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{ backgroundColor: 'rgba(245,158,11,0.10)' }}
      className={`flex-row items-center gap-x-1 rounded-lg ${isLarge ? 'px-3 py-1.5' : 'px-2.5 py-1'}`}
    >
      <MaterialIcons name="assignment-late" size={isLarge ? 14 : 11} color="#f59e0b" />
      <Text
        style={{ color: '#f59e0b' }}
        className={`font-bold ${isLarge ? 'text-sm' : 'text-[10px]'}`}
      >
        Check-in pendiente
      </Text>
    </View>
  );
}
