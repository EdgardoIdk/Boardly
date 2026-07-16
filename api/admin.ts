import { supabase } from '@/utils/supabase';

export interface AdminMetrics {
  general: {
    totalTrips: number;
    checkinsDone: number;
    successRate: number;
    totalAgents: number;
    totalNotifications: number;
  };
  topAirlines: Array<{
    name: string;
    count: number;
  }>;
  globalUrgentTrips: Array<{
    id: string;
    clientName: string;
    airline: string;
    departureAt: string;
    fromCode: string;
    toCode: string;
    agentName: string;
  }>;
  agents: Array<{
    id: string;
    fullName: string;
    email: string;
    role: string;
    totalTrips: number;
    checkinsDone: number;
  }>;
}

export interface AgentDetailedMetrics {
  profile: {
    id: string;
    fullName: string;
    email: string;
  };
  metrics: {
    totalTrips: number;
    checkinsDone: number;
    pendingCheckins: number;
  };
  priorityTrips: Array<{
    id: string;
    clientName: string;
    airline: string;
    departureAt: string;
    fromCode: string;
    toCode: string;
  }>;
}

export type MissedCheckin = {
  id: string;
  clientName: string;
  airline: string;
  departureAt: string;
  fromCode: string;
  toCode: string;
  agentName: string;
};

export interface ExportTrip {
  id: string;
  clientName: string;
  pnr: string;
  airline: string;
  fromCode: string;
  toCode: string;
  departureAt: string;
  checkInDone: boolean;
  createdAt: string;
  agentName: string;
};

export async function getAdminMetrics(startDate?: Date, endDate?: Date): Promise<AdminMetrics> {
  const params: any = {};
  if (startDate) params.p_start_date = startDate.toISOString();
  if (endDate) params.p_end_date = endDate.toISOString();

  const { data, error } = await supabase.rpc('get_admin_metrics', params);
  if (error) throw error;
  return data as AdminMetrics;
}

export async function getMissedCheckins(startDate?: Date, endDate?: Date): Promise<MissedCheckin[]> {
  const params: any = {};
  if (startDate) params.p_start_date = startDate.toISOString();
  if (endDate) params.p_end_date = endDate.toISOString();

  const { data, error } = await supabase.rpc('get_missed_checkins', params);
  if (error) throw error;
  return data as MissedCheckin[];
}

export async function getAgentMetrics(agentId: string, startDate?: Date, endDate?: Date): Promise<AgentDetailedMetrics> {
  const params: any = { p_agent_id: agentId };
  if (startDate) params.p_start_date = startDate.toISOString();
  if (endDate) params.p_end_date = endDate.toISOString();

  const { data, error } = await supabase.rpc('get_agent_metrics', params);
  if (error) throw error;
  return data as AgentDetailedMetrics;
}

export async function getTripsForExport(startDate: Date, endDate: Date): Promise<ExportTrip[]> {
  const params: any = { 
    p_start_date: startDate.toISOString(), 
    p_end_date: endDate.toISOString() 
  };
  const { data, error } = await supabase.rpc('get_trips_for_export', params);
  if (error) throw error;
  return data as ExportTrip[];
}
