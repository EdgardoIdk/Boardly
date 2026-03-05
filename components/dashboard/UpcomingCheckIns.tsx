import { type CheckInStatus, type UpcomingCheckIn } from '@/api/dashboard';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

const STATUS_CONFIG: Record<CheckInStatus, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Pendiente', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  notified: { label: 'Notificado', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
};

function CheckInRow({ item }: { item: UpcomingCheckIn }) {
  const status = STATUS_CONFIG[item.status];

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(tabs)/inicio/cliente/${item.id}`)}
      activeOpacity={0.75}
      className="flex-row items-center py-3.5 border-b border-[#0da2e7]/08"
    >
      <View className="w-9 h-9 rounded-xl bg-[#0da2e7]/10 items-center justify-center mr-3">
        <MaterialIcons name="flight" size={18} color="#0da2e7" />
      </View>
      <View className="flex-1">
        <Text className="text-white text-sm font-semibold">{item.clientName}</Text>
        <Text className="text-[#4a6fa5] text-xs mt-0.5">
          {item.flightCode} • {item.date}
        </Text>
      </View>
      <View style={{ backgroundColor: status.bg }} className="px-2.5 py-1 rounded-lg">
        <Text style={{ color: status.color }} className="text-xs font-semibold">
          {status.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

interface UpcomingCheckInsProps {
  items: UpcomingCheckIn[];
}

export function UpcomingCheckIns({ items }: UpcomingCheckInsProps) {
  return (
    <View className="mx-5 mt-2">
      {/* Encabezado de sección */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-white text-base font-bold">Próximos check-ins</Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/viajes')}
          className="flex-row items-center gap-x-1"
        >
          <Text className="text-[#0da2e7] text-xs font-medium">Ver todos</Text>
          <MaterialIcons name="chevron-right" size={16} color="#0da2e7" />
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <View className="rounded-2xl bg-[#0d1629] border border-[#0da2e7]/15 px-4">
        {items.map((item) => (
          <CheckInRow key={item.id} item={item} />
        ))}
      </View>

      {/* Botón agregar cliente */}
      <TouchableOpacity
        onPress={() => router.push('/(tabs)/inicio/nuevo-cliente')}
        activeOpacity={0.85}
        className="flex-row items-center justify-center mt-3 rounded-2xl border border-dashed border-[#0da2e7]/30 py-3.5 gap-x-2"
      >
        <MaterialIcons name="add" size={18} color="#0da2e7" />
        <Text className="text-[#0da2e7] text-sm font-medium">Agregar cliente</Text>
      </TouchableOpacity>
    </View>
  );
}
