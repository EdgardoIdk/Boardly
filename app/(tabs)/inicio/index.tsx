import { getDashboardStats, getUpcomingCheckIns, type DashboardStatsData, type UpcomingCheckIn } from '@/api/dashboard';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { useThemeColors } from '@/hooks/useThemeColors';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { UpcomingCheckIns } from '@/components/dashboard/UpcomingCheckIns';
import { UrgentAlert } from '@/components/dashboard/UrgentAlert';
import { useAuthStore } from '@/store/useAuthStore';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [checkIns, setCheckIns] = useState<UpcomingCheckIn[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    const [s, c] = await Promise.all([getDashboardStats(), getUpcomingCheckIns()]);
    setStats(s);
    setCheckIns(c);
  }

  useEffect(() => { load(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, []);

  return (
    <ScrollView
      className="flex-1 bg-surface"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent}
          colors={['#0da2e7']}
        />
      }
    >
      <DashboardHeader fullName={user?.fullName ?? 'Agente'} />
      <UrgentAlert items={checkIns} />
      
      {!stats ? (
        <DashboardSkeleton />
      ) : (
        <>
          <DashboardStats
            totalClients={stats.totalClients}
            totalClientsChange={stats.totalClientsChange}
            upcomingTrips={stats.upcomingTrips}
            upcomingTripsLabel={stats.upcomingTripsLabel}
            pendingCheckIns={stats.pendingCheckIns}
            pendingCheckInsLabel={stats.pendingCheckInsLabel}
          />
          {checkIns.length > 0 && <UpcomingCheckIns items={checkIns} />}
        </>
      )}
    </ScrollView>
  );
}
