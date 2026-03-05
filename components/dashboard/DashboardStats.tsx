import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  subtitleColor?: string;
}

function StatCard({ label, value, subtitle, icon, iconColor, subtitleColor = '#4a6fa5' }: StatCardProps) {
  return (
    <View className="rounded-2xl bg-[#0d1629] border border-[#0da2e7]/15 p-5 mb-3">
      <View className="flex-row items-start justify-between mb-3">
        <Text className="text-[#4a6fa5] text-sm font-medium">{label}</Text>
        <MaterialIcons name={icon} size={24} color={iconColor} />
      </View>
      <Text className="text-white text-4xl font-bold mb-1">{value}</Text>
      <Text style={{ color: subtitleColor }} className="text-sm font-medium">{subtitle}</Text>
    </View>
  );
}

interface DashboardStatsProps {
  totalClients: number;
  totalClientsChange: string;
  upcomingTrips: number;
  upcomingTripsLabel: string;
  pendingCheckIns: number;
  pendingCheckInsLabel: string;
}

export function DashboardStats({
  totalClients,
  totalClientsChange,
  upcomingTrips,
  upcomingTripsLabel,
  pendingCheckIns,
  pendingCheckInsLabel,
}: DashboardStatsProps) {
  return (
    <View className="px-5">
      <StatCard
        label="Total Clients"
        value={totalClients}
        subtitle={totalClientsChange}
        icon="group"
        iconColor="#0da2e7"
        subtitleColor="#22c55e"
      />
      <StatCard
        label="Upcoming Trips"
        value={upcomingTrips}
        subtitle={upcomingTripsLabel}
        icon="flight-takeoff"
        iconColor="#0da2e7"
      />
      <StatCard
        label="Pending Check-ins"
        value={pendingCheckIns}
        subtitle={pendingCheckInsLabel}
        icon="assignment-late"
        iconColor="#f59e0b"
        subtitleColor="#f59e0b"
      />
    </View>
  );
}
