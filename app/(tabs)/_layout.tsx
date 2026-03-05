import { HapticTab } from '@/components/haptic-tab';
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: { backgroundColor: '#0d1629', borderTopColor: '#0da2e7' + '33' },
        tabBarActiveTintColor: '#0da2e7',
        tabBarInactiveTintColor: '#4a6fa5',
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
    </Tabs>
  );
}

