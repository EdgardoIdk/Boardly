
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const REDACTED_FIELDS = new Set(['password', 'access_token', 'refresh_token', 'token', 'api_key']);

function redact(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') return obj;
  return Object.fromEntries(
    Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
      k,
      REDACTED_FIELDS.has(k.toLowerCase()) ? '[REDACTED]' : redact(v),
    ])
  );
}

async function loggedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (__DEV__) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    let body: unknown = undefined;
    if (init?.body) {
      try { body = redact(JSON.parse(init.body as string)); } catch { body = '[non-JSON body]'; }
    }
    console.group(`[Supabase] ${init?.method ?? 'GET'} ${url}`);
    console.log('Headers:', init?.headers ?? {});
    if (body !== undefined) console.log('Body:', body);

    const response = await fetch(input, init);
    const clone = response.clone();
    try {
      const data = await clone.json();
      console.log('Response.data:', data);
    } catch {
      console.log('Response: (non-JSON)');
    }
    console.groupEnd();
    return response;
  }
  return fetch(input, init);
}

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
    global: { fetch: loggedFetch },
  })
        