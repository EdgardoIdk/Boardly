import { supabase } from '@/utils/supabase';

export interface DashboardStatsData {
  totalClients: number;
  totalClientsChange: string;
  upcomingTrips: number;
  upcomingTripsLabel: string;
  pendingCheckIns: number;
  pendingCheckInsLabel: string;
}

export interface UpcomingCheckIn {
  id: string;
  clientName: string;
  airline: string;
  /** ISO 8601 */
  departureAt: string;
  isNotified?: boolean;
}

export async function getDashboardStats(): Promise<DashboardStatsData> {
  const now = new Date().toISOString();
  const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const [allTrips, upcoming, pending] = await Promise.all([
    supabase.from('trips').select('client_name'),
    supabase
      .from('trips')
      .select('*', { count: 'exact', head: true })
      .gte('departure_at', now)
      .lte('departure_at', in7Days),
    supabase
      .from('trips')
      .select('*', { count: 'exact', head: true })
      .gte('departure_at', now)
      .eq('check_in_done', false),
  ]);

  const uniqueClients = allTrips.data
    ? new Set(allTrips.data.map((r: any) => r.client_name)).size
    : 0;

  return {
    totalClients: uniqueClients,
    totalClientsChange: 'Clientes \u00fanicos',
    upcomingTrips: upcoming.count ?? 0,
    upcomingTripsLabel: 'Pr\u00f3ximos 7 d\u00edas',
    pendingCheckIns: pending.count ?? 0,
    pendingCheckInsLabel: 'Requiere atenci\u00f3n',
  };
}

export async function getUpcomingCheckIns(): Promise<UpcomingCheckIn[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('trips')
    .select('id, client_name, airline, departure_at')
    .gte('departure_at', now)
    .eq('check_in_done', false)
    .order('departure_at', { ascending: true })
    .limit(10);

  if (error) return [];

  return (data ?? []).map((row: any) => ({
    id: row.id,
    clientName: row.client_name,
    airline: row.airline,
    departureAt: row.departure_at,
  }));
}
