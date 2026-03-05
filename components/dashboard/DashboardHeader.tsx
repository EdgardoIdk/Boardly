import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface DashboardHeaderProps {
  fullName: string;
}

export function DashboardHeader({ fullName }: DashboardHeaderProps) {
  const firstName = fullName.split(' ')[0];

  return (
    <View className="flex-row items-center justify-between px-5 py-4">
      <View className="flex-row items-center gap-x-3">
        <View className="w-11 h-11 rounded-2xl bg-[#0da2e7]/15 items-center justify-center border border-[#0da2e7]/20">
          <MaterialIcons name="person" size={22} color="#0da2e7" />
        </View>
        <View>
          <Text className="text-[#4a6fa5] text-xs font-medium tracking-wide">Panel de Control</Text>
          <Text className="text-white text-lg font-bold">
            Hola, {firstName} 👋
          </Text>
        </View>
      </View>

      <TouchableOpacity className="w-10 h-10 rounded-2xl bg-[#0d1629] border border-[#0da2e7]/20 items-center justify-center">
        <MaterialIcons name="notifications-none" size={20} color="#4a6fa5" />
      </TouchableOpacity>
    </View>
  );
}
