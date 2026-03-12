import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

const REMINDER_WINDOWS = [24, 16, 8, 4] as const;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface PendingReminder {
  tripId: string;
  agentId: string;
  clientName: string;
  airline: string;
  fromCode: string;
  toCode: string;
  departureAt: string;
  hoursBefore: number;
}

function buildMessage(r: PendingReminder) {
  const labels: Record<number, string> = {
    24: "24 horas",
    16: "16 horas",
    8: "8 horas",
    4: "4 horas",
  };
  return {
    title: `Check-in en ${labels[r.hoursBefore]}`,
    body: `${r.clientName} \u00b7 ${r.airline} ${r.fromCode}\u2192${r.toCode}`,
    data: { tripId: r.tripId },
  };
}

async function findPendingReminders(): Promise<PendingReminder[]> {
  const now = new Date();
  const pending: PendingReminder[] = [];

  for (const hours of REMINDER_WINDOWS) {
    const windowCenter = new Date(now.getTime() + hours * 60 * 60 * 1000);
    const windowStart = new Date(windowCenter.getTime() - 30 * 60 * 1000);
    const windowEnd = new Date(windowCenter.getTime() + 30 * 60 * 1000);

    const { data: trips, error } = await supabase
      .from("trips")
      .select("id, agent_id, client_name, airline, from_code, to_code, departure_at")
      .eq("check_in_done", false)
      .gte("departure_at", windowStart.toISOString())
      .lte("departure_at", windowEnd.toISOString());

    if (error) {
      console.error(`Error querying trips for ${hours}h window:`, error.message);
      continue;
    }

    if (!trips?.length) continue;

    const tripIds = trips.map((t: any) => t.id);
    const { data: alreadySent } = await supabase
      .from("sent_reminders")
      .select("trip_id")
      .in("trip_id", tripIds)
      .eq("hours_before", hours);

    const sentSet = new Set((alreadySent ?? []).map((r: any) => r.trip_id));

    for (const t of trips) {
      if (sentSet.has(t.id)) continue;
      pending.push({
        tripId: t.id,
        agentId: t.agent_id,
        clientName: t.client_name,
        airline: t.airline,
        fromCode: t.from_code,
        toCode: t.to_code,
        departureAt: t.departure_at,
        hoursBefore: hours,
      });
    }
  }

  return pending;
}

async function getTokensForAgent(agentId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("push_tokens")
    .select("expo_token")
    .eq("agent_id", agentId);

  if (error || !data) return [];
  return data.map((r: any) => r.expo_token);
}

async function sendPushBatch(messages: { to: string; title: string; body: string; data: any; channelId: string }[]) {
  if (!messages.length) return;

  const res = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(messages),
  });

  if (!res.ok) {
    console.error("Expo Push API error:", await res.text());
  }
}

Deno.serve(async (_req) => {
  try {
    const reminders = await findPendingReminders();

    if (!reminders.length) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const pushMessages: { to: string; title: string; body: string; data: any; channelId: string }[] = [];
    const toLog: { trip_id: string; hours_before: number }[] = [];

    for (const r of reminders) {
      const tokens = await getTokensForAgent(r.agentId);
      if (!tokens.length) continue;

      const msg = buildMessage(r);

      for (const token of tokens) {
        pushMessages.push({
          to: token,
          title: msg.title,
          body: msg.body,
          data: msg.data,
          channelId: "checkin-reminders",
        });
      }

      toLog.push({ trip_id: r.tripId, hours_before: r.hoursBefore });
    }

    await sendPushBatch(pushMessages);

    if (toLog.length) {
      const { error } = await supabase.from("sent_reminders").insert(toLog);
      if (error) console.error("Error logging sent reminders:", error.message);
    }

    console.log(`Sent ${pushMessages.length} push(es) for ${toLog.length} reminder(s)`);

    return new Response(
      JSON.stringify({ sent: pushMessages.length, reminders: toLog.length }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
