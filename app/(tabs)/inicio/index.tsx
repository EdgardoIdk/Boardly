import { getDashboardStats, getUpcomingCheckIns, type DashboardStatsData, type UpcomingCheckIn } from '@/api/dashboard';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { UpcomingCheckIns } from '@/components/dashboard/UpcomingCheckIns';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [checkIns, setCheckIns] = useState<UpcomingCheckIn[]>([]);

  useEffect(() => {
    getDashboardStats().then(setStats);
    getUpcomingCheckIns().then(setCheckIns);
  }, []);

  return (
    <ScrollView
      className="flex-1 bg-[#0a0f1e]"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}
    >
      <DashboardHeader fullName={user?.fullName ?? 'Agente'} />
      {stats && (
        <DashboardStats
          totalClients={stats.totalClients}
          totalClientsChange={stats.totalClientsChange}
          upcomingTrips={stats.upcomingTrips}
          upcomingTripsLabel={stats.upcomingTripsLabel}
          pendingCheckIns={stats.pendingCheckIns}
          pendingCheckInsLabel={stats.pendingCheckInsLabel}
        />
      )}
      {checkIns.length > 0 && <UpcomingCheckIns items={checkIns} />}
    </ScrollView>
  );
}
