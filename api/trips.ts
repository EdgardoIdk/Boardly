import { supabase } from '@/utils/supabase';

export interface Trip {
  id: string;
  clientName: string;
  clientPhone: string | null;
  airline: string;
  airlineCheckInUrl: string | null;
  pnr: string;
  fromCode: string;
  toCode: string;
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
  clientPhone: string;
  airline: string;
  airlineCheckInUrl?: string | null;
  pnr: string;
  fromCode: string;
  toCode: string;
  departureAt: string;
  notes: string;
}

function fromRow(row: any): Trip {
  return {
    id: row.id,
    clientName: row.client_name,
    clientPhone: row.client_phone ?? null,
    airline: row.airline,
    airlineCheckInUrl: row.airline_checkin_url ?? null,
    pnr: row.pnr,
    fromCode: row.from_code,
    toCode: row.to_code,
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
      client_phone: input.clientPhone,
      airline: input.airline,
      airline_checkin_url: input.airlineCheckInUrl ?? null,
      pnr: input.pnr,
      from_code: input.fromCode,
      to_code: input.toCode,
      departure_at: input.departureAt,
      notes: input.notes || null,
    })
    .select()
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateTrip(tripId: string, input: Partial<CreateTripInput>): Promise<Trip> {
  const updates: any = {};
  if (input.clientName !== undefined) updates.client_name = input.clientName;
  if (input.clientPhone !== undefined) updates.client_phone = input.clientPhone;
  if (input.airline !== undefined) updates.airline = input.airline;
  if (input.airlineCheckInUrl !== undefined) updates.airline_checkin_url = input.airlineCheckInUrl;
  if (input.pnr !== undefined) updates.pnr = input.pnr;
  if (input.fromCode !== undefined) updates.from_code = input.fromCode;
  if (input.toCode !== undefined) updates.to_code = input.toCode;
  if (input.departureAt !== undefined) updates.departure_at = input.departureAt;
  if (input.notes !== undefined) updates.notes = input.notes || null;

  const { data, error } = await supabase
    .from('trips')
    .update(updates)
    .eq('id', tripId)
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

export async function searchTrips(query: string): Promise<Trip[]> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .or(`client_name.ilike.%${query}%,pnr.ilike.%${query}%`)
    .order('departure_at', { ascending: true })
    .limit(20);

  if (error) throw error;
  return (data ?? []).map(fromRow);
}
