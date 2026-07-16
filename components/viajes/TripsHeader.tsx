import { useThemeColors } from '@/hooks/useThemeColors';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface TripsHeaderProps {
  onSearchPress: () => void;
}

export function TripsHeader({ onSearchPress }: TripsHeaderProps) {
  const colors = useThemeColors();
  return (
    <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
      <View>
        <Text className="text-secondary text-xs font-medium tracking-wide uppercase">
          Flight Log / Manifest
        </Text>
        <Text className="text-primary text-2xl font-bold mt-0.5">Viajes</Text>
      </View>
      <View className="flex-row items-center gap-x-2">
        <TouchableOpacity
          onPress={onSearchPress}
          className="w-10 h-10 rounded-2xl bg-surface-card border border-bd/20 items-center justify-center"
        >
          <MaterialIcons name="search" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
