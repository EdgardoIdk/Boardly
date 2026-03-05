export interface DashboardStatsData {
  totalClients: number;
  totalClientsChange: string;
  upcomingTrips: number;
  upcomingTripsLabel: string;
  pendingCheckIns: number;
  pendingCheckInsLabel: string;
}

export type CheckInStatus = 'pending' | 'notified';

export interface UpcomingCheckIn {
  id: string;
  clientName: string;
  flightCode: string;
  date: string;
  status: CheckInStatus;
}

// Mock — reemplazar con llamada real a Supabase
export async function getDashboardStats(): Promise<DashboardStatsData> {
  return {
    totalClients: 124,
    totalClientsChange: '+12% vs el mes pasado',
    upcomingTrips: 18,
    upcomingTripsLabel: 'Próximos 7 días',
    pendingCheckIns: 5,
    pendingCheckInsLabel: 'Requiere atención',
  };
}

// Mock — reemplazar con llamada real a Supabase
export async function getUpcomingCheckIns(): Promise<UpcomingCheckIn[]> {
  return [
    { id: '1', clientName: 'Juan Pérez',      flightCode: 'IB1234', date: '25 Oct 2023', status: 'pending' },
    { id: '2', clientName: 'María García',    flightCode: 'UX4521', date: '26 Oct 2023', status: 'notified' },
    { id: '3', clientName: 'Carlos Rodríguez', flightCode: 'AF1820', date: '28 Oct 2023', status: 'pending' },
    { id: '4', clientName: 'Ana Belén',       flightCode: 'LH2410', date: '30 Oct 2023', status: 'pending' },
  ];
}
