import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

export default function ViajeDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 bg-[#0a0f1e] items-center justify-center">
      <Text className="text-white text-lg">Detalle Viaje #{id}</Text>
    </View>
  );
}
