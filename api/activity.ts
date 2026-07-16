import { supabase } from '@/utils/supabase';

export interface ActivityItem {
  id: string;
  tripId: string | null;
  type: string;
  title: string;
  body: string;
  hoursBefore: number | null;
  createdAt: string;
}

function fromRow(row: any): ActivityItem {
  return {
    id: row.id,
    tripId: row.trip_id,
    type: row.type,
    title: row.title,
    body: row.body,
    hoursBefore: row.hours_before,
    createdAt: row.created_at,
  };
}

export async function getRecentActivity(): Promise<ActivityItem[]> {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .gte('created_at', threeDaysAgo)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(fromRow);
}
