import { getCurrentSession } from '@/api/auth';
import { supabase } from '@/utils/supabase';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore } from '@/store/useAuthStore';
import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ALTITUDE_TARGET = 32000;
const SPEED_TARGET = 840;
const COUNTER_DURATION = 1800;
const PROGRESS_DURATION = 3000;
const TICK_INTERVAL = 50;

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [altitude, setAltitude] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: PROGRESS_DURATION,
        useNativeDriver: false,
      }),
    ]).start();

    const steps = COUNTER_DURATION / TICK_INTERVAL;
    let currentStep = 0;

    const counterInterval = setInterval(() => {
      currentStep += 1;
      const progress = Math.min(currentStep / steps, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAltitude(Math.floor(eased * ALTITUDE_TARGET));
      setSpeed(Math.floor(eased * SPEED_TARGET));
      if (currentStep >= steps) clearInterval(counterInterval);
    }, TICK_INTERVAL);

      const timer = setTimeout(async () => {
      const session = await getCurrentSession();
      if (session) {
        const { data } = await supabase.from('users').select('role').eq('id', session.user.id).single();
        useAuthStore.getState().setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          fullName: session.user.user_metadata?.full_name ?? session.user.email ?? 'Agente',
          role: data?.role ?? 'agent'
        });
        router.replace('/(tabs)/inicio');
      } else {
        router.replace('/(auth)/login');
      }
    }, 3500);

    return () => {
      clearInterval(counterInterval);
      clearTimeout(timer);
    };
  }, [fadeAnim, slideAnim, progressAnim]);

  return (
    <View className="flex-1 bg-surface">
      <StatusBar style="auto" />

      <Animated.View
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        className="flex-1 items-center justify-center px-8"
      >
        <View className="w-24 h-24 rounded-2xl bg-accent/10 items-center justify-center border border-accent/30 mb-8">
          <MaterialIcons name="flight-takeoff" size={48} color={colors.accent} />
        </View>

        <Text className="text-primary text-5xl font-bold tracking-widest">Boardly</Text>

        <Text className="text-accent text-xs mt-3 tracking-widest uppercase">
          Tu Asistente de Check-in
        </Text>

        <View className="mt-10 w-full rounded-xl border border-bd/20 bg-surface-card p-4">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="font-mono text-xs font-bold tracking-widest text-accent uppercase">
              System Check
            </Text>
            <Text className="font-mono text-xs text-secondary">
              v{Constants.expoConfig?.version ?? '1.0.0'}
            </Text>
          </View>

          <View
            className="mb-3 h-2 w-full overflow-hidden rounded-full bg-bd/20"
            onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
          >
            <Animated.View
              style={{
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, barWidth],
                }),
                shadowColor: 'rgb(13 162 231)',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 6,
                elevation: 4,
              }}
              className="h-full rounded-full bg-accent"
            />
          </View>

          <Text className="font-mono text-xs italic text-secondary">
            Connecting to flight databases...
          </Text>
        </View>
      </Animated.View>

      <View className="px-6" style={{ paddingBottom: insets.bottom + 16 }}>
        <View className="flex-row justify-between rounded-xl border border-bd/20 bg-surface-card px-4 py-3">
          <View className="items-center">
            <Text className="text-xs text-secondary">ALTITUD</Text>
            <Text className="text-sm font-bold text-primary">
              {altitude.toLocaleString('en-US')} FT
            </Text>
          </View>
          <View className="items-center">
            <MaterialIcons name="wifi-tethering" size={14} color={colors.accent} />
            <Text className="mt-1 text-xs text-primary">Online</Text>
          </View>
          <View className="items-center">
            <MaterialIcons name="location-on" size={14} color={colors.accent} />
            <Text className="text-sm font-bold text-primary">SAP</Text>
          </View>
          <View className="items-center">
            <Text className="text-xs text-secondary">VELOCIDAD</Text>
            <Text className="text-sm font-bold text-primary">{speed} KM/H</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
