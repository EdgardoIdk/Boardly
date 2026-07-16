import { useThemeColors } from '@/hooks/useThemeColors';
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

function StatCard({ label, value, subtitle, icon, iconColor, subtitleColor }: StatCardProps) {
  return (
    <View className="rounded-2xl bg-surface-card border border-bd/15 p-5 mb-3">
      <View className="flex-row items-start justify-between mb-3">
        <Text className="text-secondary text-sm font-medium">{label}</Text>
        <MaterialIcons name={icon} size={24} color={iconColor} />
      </View>
      <Text className="text-primary text-4xl font-bold mb-1">{value}</Text>
      <Text style={subtitleColor ? { color: subtitleColor } : undefined} className={`text-sm font-medium ${!subtitleColor ? 'text-secondary' : ''}`}>{subtitle}</Text>
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
  const colors = useThemeColors();
  return (
    <View className="px-5">
      <StatCard
        label="Total Clients"
        value={totalClients}
        subtitle={totalClientsChange}
        icon="group"
        iconColor={colors.accent}
        subtitleColor={colors.success}
      />
      <StatCard
        label="Upcoming Trips"
        value={upcomingTrips}
        subtitle={upcomingTripsLabel}
        icon="flight-takeoff"
        iconColor={colors.accent}
      />
      <StatCard
        label="Pending Check-ins"
        value={pendingCheckIns}
        subtitle={pendingCheckInsLabel}
        icon="assignment-late"
        iconColor={colors.warning}
        subtitleColor={colors.warning}
      />
    </View>
  );
}
