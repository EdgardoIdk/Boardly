import { type Trip } from '@/api/trips';
import { NotificationBadge } from '@/components/viajes/StatusBadge';
import { useThemeColors } from '@/hooks/useThemeColors';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

function formatDeparture(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' · '
    + d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

interface FlightCardProps {
  trip: Trip;
  onPress: (id: string) => void;
}

export function FlightCard({ trip, onPress }: FlightCardProps) {
  const colors = useThemeColors();
  return (
    <TouchableOpacity
      onPress={() => onPress(trip.id)}
      activeOpacity={0.75}
      className="bg-surface-card border border-bd/15 rounded-2xl p-4 mb-3"
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-x-2 flex-1">
          <View className="w-8 h-8 rounded-xl bg-accent/10 items-center justify-center">
            <MaterialIcons name="person" size={16} color={colors.accent} />
          </View>
          <Text className="text-primary font-bold text-base flex-shrink" numberOfLines={1}>
            {trip.clientName}
          </Text>
        </View>
        <NotificationBadge checkInDone={trip.checkInDone} departureAt={trip.departureAt} />
      </View>

      <View className="flex-row items-center gap-x-1.5 mb-3">
        <MaterialIcons name="schedule" size={13} color={colors.textSecondary} />
        <Text className="text-secondary text-xs">
          {formatDeparture(trip.departureAt)} • {trip.airline}
        </Text>
      </View>

      <View className="flex-row items-center bg-surface rounded-xl px-3 py-2 gap-x-2 mb-3">
        <Text className="text-primary font-bold text-sm">{trip.fromCode}</Text>
        <MaterialIcons name="flight-takeoff" size={14} color={colors.accent} />
        <View className="flex-1 h-px bg-accent/20" />
        <MaterialIcons name="flight-land" size={14} color={colors.textSecondary} />
        <Text className="text-secondary font-semibold text-sm">{trip.toCode}</Text>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-x-1">
          <MaterialIcons name="confirmation-number" size={13} color={colors.textSecondary} />
          <Text className="text-secondary text-xs font-mono">{trip.pnr}</Text>
        </View>
        <View className="flex-row items-center gap-x-0.5">
          <Text className="text-accent text-xs font-medium">Detalles</Text>
          <MaterialIcons name="chevron-right" size={14} color={colors.accent} />
        </View>
      </View>
    </TouchableOpacity>
  );
}
