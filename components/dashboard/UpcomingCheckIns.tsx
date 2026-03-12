import { type UpcomingCheckIn } from '@/api/dashboard';
import { NotificationBadge } from '@/components/viajes/StatusBadge';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

function timeUntilDeparture(iso: string): string {
  const now = new Date();
  const dep = new Date(iso);
  const diffMs = dep.getTime() - now.getTime();
  const diffH = diffMs / (1000 * 60 * 60);
  const timeStr = dep.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

  if (diffH < 0) return 'Ya sali\u00f3';
  if (diffH < 1) return `en ${Math.round(diffMs / 60000)}min`;
  if (diffH < 24) return `Hoy · ${timeStr}`;
  if (diffH < 48) return `Ma\u00f1ana \u00b7 ${timeStr}`;
  return (
    dep.toLocaleDateString('es', { day: '2-digit', month: 'short' }) + ' · ' + timeStr
  );
}

function CheckInRow({ item }: { item: UpcomingCheckIn }) {
  const isUrgent = new Date(item.departureAt).getTime() - Date.now() < 24 * 60 * 60 * 1000;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(tabs)/viajes/${item.id}`)}
      activeOpacity={0.75}
      className="flex-row items-center py-3.5 border-b border-[#0da2e7]/08"
    >
      <View
        className="w-9 h-9 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: isUrgent ? 'rgba(245,158,11,0.15)' : 'rgba(13,162,231,0.10)' }}
      >
        <MaterialIcons
          name="flight"
          size={18}
          color={isUrgent ? '#f59e0b' : '#0da2e7'}
        />
      </View>

      <View className="flex-1">
        <Text className="text-white text-sm font-semibold">{item.clientName}</Text>
        <Text className="text-[#4a6fa5] text-xs mt-0.5">
          {item.airline}
        </Text>
      </View>

      <View className="items-end gap-y-1">
        <Text
          style={{ color: isUrgent ? '#f59e0b' : '#4a6fa5' }}
          className="text-xs font-medium"
        >
          {timeUntilDeparture(item.departureAt)}
        </Text>
        <NotificationBadge checkInDone={false} />
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
        <Text className="text-white text-base font-bold">{'Pr\u00f3ximos check-ins'}</Text>
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

      <TouchableOpacity
        onPress={() => router.push('/(tabs)/viajes/nuevo-viaje')}
        activeOpacity={0.85}
        className="flex-row items-center justify-center mt-3 rounded-2xl border border-dashed border-[#0da2e7]/30 py-3.5 gap-x-2"
      >
        <MaterialIcons name="add" size={18} color="#0da2e7" />
        <Text className="text-[#0da2e7] text-sm font-medium">Agregar viaje</Text>
      </TouchableOpacity>
    </View>
  );
}
