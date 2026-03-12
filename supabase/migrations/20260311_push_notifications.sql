-- Tokens de push notification por agente/dispositivo
create table if not exists push_tokens (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references auth.users(id) on delete cascade,
  expo_token text not null,
  created_at timestamptz default now(),
  unique(agent_id, expo_token)
);

alter table push_tokens enable row level security;

create policy "Agents manage own tokens"
  on push_tokens for all
  using (auth.uid() = agent_id)
  with check (auth.uid() = agent_id);

-- Registro de recordatorios ya enviados (evita duplicados)
create table if not exists sent_reminders (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  hours_before int not null check (hours_before in (24, 16, 8, 4)),
  sent_at timestamptz default now(),
  unique(trip_id, hours_before)
);

alter table sent_reminders enable row level security;

-- Solo el servidor (service_role) escribe en sent_reminders
create policy "Service role only"
  on sent_reminders for all
  using (false);

-- Indice para la consulta del cron
create index idx_trips_departure_pending
  on trips (departure_at)
  where check_in_done = false;

-- pg_cron: ejecutar Edge Function cada hora en punto
select cron.schedule(
  'send-checkin-reminders',
  '0 * * * *',
  $$
  select net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/send-checkin-reminders',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
