import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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
    ]).start();

    const timer = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 3500);

    return () => clearTimeout(timer);
  }, [fadeAnim, slideAnim]);

  return (
    <View className="flex-1 bg-[#0a0f1e]">
      <StatusBar style="light" />

      {/* Contenido principal */}
      <Animated.View
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        className="flex-1 items-center justify-center px-8"
      >
        {/* Icono */}
        <View className="w-24 h-24 rounded-2xl bg-[#0da2e7]/10 items-center justify-center border border-[#0da2e7]/30 mb-8">
          <MaterialIcons name="flight-takeoff" size={48} color="#0da2e7" />
        </View>

        {/* Nombre de la app */}
        <Text className="text-white text-5xl font-bold tracking-widest">Boardly</Text>

        {/* Subtítulo */}
        <Text className="text-[#0da2e7] text-xs mt-3 tracking-widest uppercase">
          Tu Asistente de Check-in
        </Text>

        {/* Caja terminal */}
        <View className="mt-10 w-full rounded-xl border border-[#0da2e7]/20 bg-[#0d1629] p-4">
          <View className="mb-2 flex-row items-center">
            <View className="mr-2 h-2 w-2 rounded-full bg-[#0da2e7]" />
            <Text className="font-mono text-xs text-[#0da2e7]">System Check v2.4.0</Text>
          </View>
          <Text className="font-mono text-xs text-[#4a6fa5]">
            Connecting to flight databases...
          </Text>
        </View>
      </Animated.View>

      {/* HUD inferior */}
      <View className="px-6" style={{ paddingBottom: insets.bottom + 16 }}>
        <View className="flex-row justify-between rounded-xl border border-[#0da2e7]/20 bg-[#0d1629] px-4 py-3">
          <View className="items-center">
            <Text className="text-xs text-[#4a6fa5]">ALTITUD</Text>
            <Text className="text-sm font-bold text-white">32,000 FT</Text>
          </View>
          <View className="items-center">
            <MaterialIcons name="wifi-tethering" size={14} color="#0da2e7" />
            <Text className="mt-1 text-xs text-white">Online</Text>
          </View>
          <View className="items-center">
            <MaterialIcons name="location-on" size={14} color="#0da2e7" />
            <Text className="text-sm font-bold text-white">MAD</Text>
          </View>
          <View className="items-center">
            <Text className="text-xs text-[#4a6fa5]">VELOCIDAD</Text>
            <Text className="text-sm font-bold text-white">840 KM/H</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
