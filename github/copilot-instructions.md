# Boardly — GitHub Copilot Instructions

## ¿Qué es este proyecto?
Boardly es una aplicación móvil para uso interno de una agencia de viajes. Permite a los agentes registrar clientes con sus fechas de vuelo y enviarles automáticamente notificaciones push reales 24 horas antes del vuelo como recordatorio de check-in.

---

## Stack Tecnológico

### Mobile
- **Framework:** React Native con Expo (SDK 51+)
- **Lenguaje:** TypeScript estricto
- **Navegación:** React Navigation (Stack + Bottom Tabs)
- **Estado global:** Zustand
- **Estilos:** NativeWind (Tailwind para React Native)
- **Notificaciones:** expo-notifications
- **Almacenamiento local:** AsyncStorage (solo para sesión)

### Backend
- **BaaS:** Supabase
  - PostgreSQL como base de datos
  - Supabase Auth para autenticación (email/password)
  - Row Level Security (RLS) en todas las tablas
  - Edge Functions (Deno/TypeScript) para lógica de negocio
  - pg_cron para jobs programados

### Notificaciones Push
- **Servicio:** Expo Push Notification Service (api.expo.dev)
- Las notificaciones son push reales (no locales), entregadas via APNs (iOS) y FCM (Android)
- El servidor (Supabase Edge Function) es quien dispara las notificaciones, no el dispositivo

---

## Estructura de carpetas

```
boardly/
├── .github/
│   └── copilot-instructions.md
├── app/                        # Pantallas (Expo Router) o screens/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (app)/
│       ├── index.tsx           # Dashboard / Home
│       ├── add-client.tsx
│       ├── client/[id].tsx     # Detalle de cliente
│       ├── notifications.tsx
│       └── settings.tsx
├── components/                 # Componentes reutilizables
├── lib/
│   ├── supabase.ts             # Cliente de Supabase
│   └── notifications.ts        # Lógica de push tokens
├── stores/                     # Zustand stores
├── types/                      # Tipos TypeScript globales
├── supabase/
│   ├── functions/
│   │   └── send-checkin/       # Edge Function principal
│   └── migrations/             # SQL migrations
└── .env.local                  # Variables de entorno (no commitear)
```

---

## Modelo de Datos (PostgreSQL)

```sql
-- Agentes de la agencia (usuarios del sistema)
users (
  id uuid PRIMARY KEY,          -- auth.users.id
  full_name text,
  email text,
  role text DEFAULT 'agent',    -- 'agent' | 'admin'
  created_at timestamptz
)

-- Clientes registrados por los agentes
clients (
  id uuid PRIMARY KEY,
  agent_id uuid REFERENCES users(id),
  full_name text NOT NULL,
  phone text,
  email text,
  created_at timestamptz
)

-- Viajes / vuelos de los clientes
trips (
  id uuid PRIMARY KEY,
  client_id uuid REFERENCES clients(id),
  airline text NOT NULL,
  flight_number text,
  flight_date timestamptz NOT NULL,   -- fecha y hora exacta del vuelo
  checkin_notified_at timestamptz,    -- null = aún no notificado
  created_at timestamptz
)

-- Tokens de push notification por dispositivo
push_tokens (
  id uuid PRIMARY KEY,
  client_id uuid REFERENCES clients(id),
  expo_token text NOT NULL,
  platform text,                       -- 'ios' | 'android'
  created_at timestamptz
)
```

---

## Seguridad

### Reglas generales
- La `SUPABASE_ANON_KEY` puede estar en el cliente móvil — es segura porque RLS está activo en todas las tablas
- La `SUPABASE_SERVICE_ROLE_KEY` **solo** va en Edge Functions del servidor, nunca en el cliente
- Variables de entorno en Expo usan el prefijo `EXPO_PUBLIC_` para las que van al cliente

### Políticas RLS
- Cada agente solo puede ver y modificar sus propios clientes (`agent_id = auth.uid()`)
- Los trips solo son visibles para el agente dueño del cliente
- Las Edge Functions usan `service_role` para bypass de RLS cuando es necesario (cron jobs)

### Variables de entorno
```
# .env.local — nunca commitear
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...         # va al cliente
SUPABASE_SERVICE_ROLE_KEY=eyJ...             # solo Edge Functions
```

---

## Cliente de Supabase (lib/supabase.ts)

```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
```

---

## Flujo de Notificaciones Push

1. Al iniciar sesión, la app registra el `ExponentPushToken` del dispositivo en la tabla `push_tokens`
2. Un `pg_cron` corre cada hora en Supabase
3. Detecta vuelos cuya `flight_date` está entre `now() + 23h` y `now() + 25h` con `checkin_notified_at IS NULL`
4. Llama a la Edge Function `send-checkin`
5. La Edge Function hace POST a `https://exp.host/--/api/v2/push/send` con los tokens
6. Expo entrega la notificación vía APNs (iOS) o FCM (Android)
7. Se actualiza `checkin_notified_at` en la DB para no re-enviar

---

## Pantallas de la App

| Pantalla | Ruta | Descripción |
|----------|------|-------------|
| Login | `/login` | Email + password, maneja errores de Supabase Auth |
| Register | `/register` | Crear cuenta de agente |
| Dashboard | `/` | Resumen: total clientes, check-ins del día, lista de próximos viajes |
| Agregar cliente | `/add-client` | Form con datos del cliente + vuelo |
| Detalle cliente | `/client/[id]` | Info del cliente, estado del viaje, countdown |
| Notificaciones | `/notifications` | Historial de notificaciones enviadas |
| Configuración | `/settings` | Perfil del agente, cerrar sesión |

---

## Convenciones de Código

- TypeScript estricto, siempre tipar props e interfaces
- Componentes funcionales con arrow functions
- Nombres de componentes en PascalCase, archivos en kebab-case
- Queries a Supabase siempre con manejo de errores (`const { data, error } = await supabase...`)
- No usar `any`, preferir `unknown` si es necesario
- Zustand stores en `stores/`, un archivo por dominio (ej: `useAuthStore.ts`, `useClientsStore.ts`)
- Comentarios en español para lógica de negocio, en inglés para comentarios técnicos

---

## Comandos Útiles

```bash
# Iniciar en desarrollo
npx expo start

# Build para iOS
eas build --platform ios

# Build para Android
eas build --platform android

# Deploy Edge Function
supabase functions deploy send-checkin

# Correr migraciones
supabase db push
```

---

## Lo que NO está implementado aún (roadmap)
- [ ] Adjuntar itinerario en PDF a la notificación
- [ ] Soporte multi-agencia (tenants)
- [ ] Notificación también por WhatsApp/SMS
- [ ] Panel web para administradores
- [ ] Estadísticas de check-ins completados