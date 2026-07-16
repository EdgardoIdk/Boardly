import { supabase } from '@/utils/supabase';

export interface Airline {
  id: string;
  name: string;
  checkInUrl?: string | null;
}

export async function getAirlines(): Promise<Airline[]> {
  const { data, error } = await supabase
    .from('airlines')
    .select('id, name')
    .order('name');

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
  }));
}

export async function getAirlineByName(name: string): Promise<Airline | null> {
  const { data, error } = await supabase
    .from('airlines')
    .select('id, name, checkin_url')
    .ilike('name', name)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    checkInUrl: data.checkin_url ?? null,
  };
}
