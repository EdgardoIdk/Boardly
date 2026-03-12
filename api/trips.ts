import { supabase } from '@/utils/supabase';

export interface Trip {
  id: string;
  clientName: string;
  airline: string;
  airlineCheckInUrl: string | null;
  pnr: string;
  fromCode: string;
  fromCity: string;
  toCode: string;
  toCity: string;
  /** ISO 8601 */
  departureAt: string;
  /** true cuando el agente ya realizó el check-in en el sitio de la aerolínea */
  checkInDone: boolean;
  checkInDoneAt: string | null;
  notes: string;
}

export interface CreateTripInput {
  agentId: string;
  clientName: string;
  airline: string;
  airlineCheckInUrl?: string | null;
  pnr: string;
  fromCode: string;
  fromCity: string;
  toCode: string;
  toCity: string;
  departureAt: string;
  notes: string;
}

function fromRow(row: any): Trip {
  return {
    id: row.id,
    clientName: row.client_name,
    airline: row.airline,
    airlineCheckInUrl: row.airline_checkin_url ?? null,
    pnr: row.pnr,
    fromCode: row.from_code,
    fromCity: row.from_city,
    toCode: row.to_code,
    toCity: row.to_city,
    departureAt: row.departure_at,
    checkInDone: row.check_in_done,
    checkInDoneAt: row.check_in_done_at ?? null,
    notes: row.notes ?? '',
  };
}

const PAGE_SIZE = 15;

export interface PaginatedTrips {
  trips: Trip[];
  total: number;
  hasMore: boolean;
}

export async function getTrips(page = 0): Promise<PaginatedTrips> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from('trips')
    .select('*', { count: 'exact' })
    .order('departure_at', { ascending: true })
    .range(from, to);

  if (error) throw error;

  const total = count ?? 0;
  const trips = (data ?? []).map(fromRow);

  return { trips, total, hasMore: from + trips.length < total };
}

export async function getTripById(id: string): Promise<Trip | null> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return fromRow(data);
}

export async function createTrip(input: CreateTripInput): Promise<Trip> {
  const { data, error } = await supabase
    .from('trips')
    .insert({
      agent_id: input.agentId,
      client_name: input.clientName,
      airline: input.airline,
      airline_checkin_url: input.airlineCheckInUrl ?? null,
      pnr: input.pnr,
      from_code: input.fromCode,
      from_city: input.fromCity,
      to_code: input.toCode,
      to_city: input.toCity,
      departure_at: input.departureAt,
      notes: input.notes || null,
    })
    .select()
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function markCheckInDone(id: string): Promise<Trip | null> {
  const { data, error } = await supabase
    .from('trips')
    .update({ check_in_done: true, check_in_done_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) return null;
  return fromRow(data);
}
