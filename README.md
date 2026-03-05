<div align="center">

# ✈️ Boardly

### Tu Asistente de Check-in

**Internal mobile app for travel agency agents to manage clients, upcoming flights, and automated check-in reminders.**

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![NativeWind](https://img.shields.io/badge/NativeWind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</div>

---

## 📱 About

Boardly is a mobile application built for travel agency agents, providing a centralized hub to manage clients, track upcoming flights, and send automated push notification reminders 24 hours before departure.

No more missed check-ins. No more manual follow-ups.

---

## ⚡ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK ~54 + Expo Router v6 |
| Language | TypeScript (strict) |
| Styling | NativeWind v4 (Tailwind CSS for RN) |
| Backend | Supabase (Auth + PostgreSQL + RLS) |
| State | Zustand |
| Notifications | expo-notifications |

---

## 🗂️ Project Structure

```
app/
├── index.tsx              # Animated splash screen
├── (auth)/
│   ├── login.tsx          # Login screen
│   └── register.tsx       # Register screen
└── (tabs)/
    ├── inicio/            # Dashboard + client management
    ├── viajes/            # Trips management
    ├── actividad.tsx      # Activity & notifications log
    └── ajustes.tsx        # Settings

api/                       # All data-fetching functions (Supabase)
components/
└── dashboard/             # Reusable dashboard components
store/
└── useAuthStore.ts        # Zustand global auth state
utils/
└── supabase.ts            # Supabase client singleton
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- A Supabase project

### Installation

```bash
# Clone the repo
git clone https://github.com/EdgardoIdk/Boardly.git
cd Boardly

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
```

### Run

```bash
npx expo start --clear
```

---

## 🗄️ Database Schema

```sql
public.users
├── id          uuid  (references auth.users)
├── full_name   text
├── email       text
├── role        text  ('agent' | 'admin')
└── created_at  timestamptz
```

Row Level Security enabled — agents can only read and update their own data.

---

## 📋 Roadmap

- [x] Splash screen with animation
- [x] Authentication (login / register)
- [x] Session management with Supabase
- [x] Dashboard with stats and upcoming check-ins
- [x] Settings screen
- [ ] Client management (add / view / edit)
- [ ] Trips management
- [ ] Push notifications 24h before departure
- [ ] Activity & notification history
- [ ] Admin role panel

---

<div align="center">
  <sub>Built with ☕ by <a href="https://github.com/EdgardoIdk">EdgardoIdk</a></sub>
</div>

