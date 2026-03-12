import { type Trip } from '@/api/trips';
import { NotificationBadge } from '@/components/viajes/StatusBadge';
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
  return (
    <TouchableOpacity
      onPress={() => onPress(trip.id)}
      activeOpacity={0.75}
      className="bg-[#0d1629] border border-[#0da2e7]/15 rounded-2xl p-4 mb-3"
    >
      {/* Row 1: nombre + badge notificación */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-x-2 flex-1">
          <View className="w-8 h-8 rounded-xl bg-[#0da2e7]/10 items-center justify-center">
            <MaterialIcons name="person" size={16} color="#0da2e7" />
          </View>
          <Text className="text-white font-bold text-base flex-shrink" numberOfLines={1}>
            {trip.clientName}
          </Text>
        </View>
        <NotificationBadge checkInDone={trip.checkInDone} />
      </View>

      {/* Row 2: fecha + hora + aerolínea */}
      <View className="flex-row items-center gap-x-1.5 mb-3">
        <MaterialIcons name="schedule" size={13} color="#4a6fa5" />
        <Text className="text-[#4a6fa5] text-xs">
          {formatDeparture(trip.departureAt)} • {trip.airline}
        </Text>
      </View>

      {/* Row 3: ruta */}
      <View className="flex-row items-center bg-[#0a0f1e] rounded-xl px-3 py-2 gap-x-2 mb-3">
        <Text className="text-white font-bold text-sm">{trip.fromCode}</Text>
        <Text className="text-[#4a6fa5] text-xs">{trip.fromCity}</Text>
        <MaterialIcons name="flight-takeoff" size={14} color="#0da2e7" />
        <View className="flex-1 h-px bg-[#0da2e7]/20" />
        <MaterialIcons name="flight-land" size={14} color="#4a6fa5" />
        <Text className="text-[#4a6fa5] text-xs">{trip.toCity}</Text>
        <Text className="text-[#4a6fa5] font-semibold text-sm">{trip.toCode}</Text>
      </View>

      {/* Row 4: PNR + detalles */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-x-1">
          <MaterialIcons name="confirmation-number" size={13} color="#4a6fa5" />
          <Text className="text-[#4a6fa5] text-xs font-mono">{trip.pnr}</Text>
        </View>
        <View className="flex-row items-center gap-x-0.5">
          <Text className="text-[#0da2e7] text-xs font-medium">Detalles</Text>
          <MaterialIcons name="chevron-right" size={14} color="#0da2e7" />
        </View>
      </View>
    </TouchableOpacity>
  );
}
