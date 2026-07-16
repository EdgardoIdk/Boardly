import { HapticTab } from '@/components/haptic-tab';
import { useThemeStore } from '@/store/useThemeStore';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import { Tabs } from 'expo-router';

const THEME_COLORS = {
  light: {
    tabBarBackground: '#ffffff',
    tabBarBorder: 'rgba(203,213,225,0.4)',
    active: '#0da2e7',
    inactive: '#64748b',
  },
  dark: {
    tabBarBackground: '#0d1629',
    tabBarBorder: 'rgba(13,162,231,0.2)',
    active: '#0da2e7',
    inactive: '#4a6fa5',
  },
};

export default function TabLayout() {
  const theme = useThemeStore((s) => s.theme);
  const user = useAuthStore((s) => s.user);
  const colors = THEME_COLORS[theme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: { backgroundColor: colors.tabBarBackground, borderTopColor: colors.tabBarBorder },
        tabBarActiveTintColor: colors.active,
        tabBarInactiveTintColor: colors.inactive,
      }}
    >
      <Tabs.Screen
        name="inicio"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <MaterialIcons name="home" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="viajes"
        options={{
          title: 'Viajes',
          tabBarIcon: ({ color }) => <MaterialIcons name="flight" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="actividad"
        options={{
          title: 'Actividad',
          tabBarIcon: ({ color }) => <MaterialIcons name="notifications" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ajustes"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color }) => <MaterialIcons name="settings" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          href: user?.role === 'admin' ? '/(tabs)/admin' : null,
          tabBarIcon: ({ color }) => <MaterialIcons name="admin-panel-settings" size={26} color={color} />,
        }}
      />
    </Tabs>
  );
}
