import { MaterialIcons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ActividadScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-[#0a0f1e]"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 16,
        flexGrow: 1,
      }}
    >
      <View className="px-6 pt-4 pb-2">
        <Text className="text-[#4a6fa5] text-xs font-medium tracking-wide uppercase">
          Historial
        </Text>
        <Text className="text-white text-2xl font-bold mt-0.5">Actividad</Text>
      </View>

      <View className="flex-1 items-center justify-center">
        <MaterialIcons name="history" size={40} color="#4a6fa5" />
        <Text className="text-[#4a6fa5] text-sm mt-3">Sin actividad reciente</Text>
      </View>
    </ScrollView>
  );
}
