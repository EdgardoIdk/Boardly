import { useThemeColors } from '@/hooks/useThemeColors';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

interface DashboardHeaderProps {
  fullName: string;
}

export function DashboardHeader({ fullName }: DashboardHeaderProps) {
  const colors = useThemeColors();
  const firstName = fullName.split(' ')[0];

  return (
    <View className="flex-row items-center justify-between px-5 py-4">
      <View className="flex-row items-center gap-x-3">
        <View className="w-11 h-11 rounded-2xl bg-accent/15 items-center justify-center border border-accent/20">
          <MaterialIcons name="person" size={22} color={colors.accent} />
        </View>
        <View>
          <Text className="text-secondary text-xs font-medium tracking-wide">Panel de Control</Text>
          <Text className="text-primary text-lg font-bold">
            Hola, {firstName} 👋
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => router.push('/(tabs)/actividad')}
        activeOpacity={0.7}
        className="w-10 h-10 rounded-2xl bg-surface-card border border-bd/20 items-center justify-center"
      >
        <MaterialIcons name="notifications-none" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}
