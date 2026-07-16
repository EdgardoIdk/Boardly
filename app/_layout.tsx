import { ErrorBoundary } from '@/components/ErrorBoundary';
import { themeVars } from '@/constants/themes';
import { useThemeStore } from '@/store/useThemeStore';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme as useNWColorScheme } from 'nativewind';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import "../global.css";

import { useAuthStore } from '@/store/useAuthStore';
import { registerForPushNotifications } from '@/utils/notifications';
import { supabase } from '@/utils/supabase';

export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  const theme = useThemeStore((s) => s.theme);
  const loaded = useThemeStore((s) => s.loaded);
  const loadTheme = useThemeStore((s) => s.loadTheme);
  const { setColorScheme } = useNWColorScheme();
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  useEffect(() => {
    setColorScheme(theme);
  }, [theme, setColorScheme]);

  useEffect(() => {
    const { setUser, clearUser } = useAuthStore.getState();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data } = await supabase.from('users').select('role').eq('id', session.user.id).single();
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          fullName: session.user.user_metadata?.full_name ?? session.user.email ?? 'Agente',
          role: data?.role ?? 'agent',
        });
        registerForPushNotifications(session.user.id);
        router.replace('/(tabs)/inicio');
      } else if (event === 'SIGNED_OUT') {
        clearUser();
        router.replace('/(auth)/login');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const tripId = response.notification.request.content.data?.tripId;
      if (tripId) {
        router.push(`/(tabs)/viajes/${tripId}`);
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  if (!loaded) return null;

  return (
    <ErrorBoundary>
      <View style={themeVars[theme]} className="flex-1">
        <SafeAreaProvider>
          <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
          </ThemeProvider>
        </SafeAreaProvider>
      </View>
    </ErrorBoundary>
  );
}
