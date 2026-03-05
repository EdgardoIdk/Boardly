import { logout } from '@/api/auth';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SettingRowProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  description: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
};

function SettingRow({ icon, label, description, onPress, rightElement }: SettingRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center px-4 py-4 border-b border-[#0da2e7]/10"
    >
      <View className="w-9 h-9 rounded-xl bg-[#0da2e7]/10 items-center justify-center mr-4">
        <MaterialIcons name={icon} size={20} color="#0da2e7" />
      </View>
      <View className="flex-1">
        <Text className="text-white text-sm font-medium">{label}</Text>
        <Text className="text-[#4a6fa5] text-xs mt-0.5">{description}</Text>
      </View>
      {rightElement ?? <MaterialIcons name="chevron-right" size={20} color="#4a6fa5" />}
    </TouchableOpacity>
  );
}

export default function AjustesScreen() {
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <ScrollView
      className="flex-1 bg-[#0a0f1e]"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom }}
    >
      {/* Header */}
      <View className="px-6 pb-6" style={{ paddingTop: insets.top + 16 }}>
        <Text className="text-white text-2xl font-bold">Ajustes</Text>
        <Text className="text-[#4a6fa5] text-sm mt-1">Gestiona tu cuenta y preferencias</Text>
      </View>

      {/* Perfil */}
      <View className="mx-4 rounded-2xl bg-[#0d1629] border border-[#0da2e7]/20 mb-4 overflow-hidden">
        <View className="flex-row items-center px-4 py-5">
          {/* Avatar */}
          <View className="w-16 h-16 rounded-2xl bg-[#0da2e7]/20 items-center justify-center mr-4">
            <MaterialIcons name="person" size={36} color="#0da2e7" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-base font-bold">Agente</Text>
            <Text className="text-[#4a6fa5] text-xs mt-0.5">Agente Senior</Text>
            <Text className="text-[#0da2e7] text-xs mt-0.5">agente@boardly.io</Text>
          </View>
          <TouchableOpacity className="w-8 h-8 rounded-xl bg-[#0da2e7]/10 items-center justify-center">
            <MaterialIcons name="edit" size={16} color="#0da2e7" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity className="mx-4 mb-4 border border-[#0da2e7]/30 rounded-xl py-2.5 items-center">
          <Text className="text-[#0da2e7] text-sm font-medium">Ver perfil</Text>
        </TouchableOpacity>
      </View>

      {/* Seguridad */}
      <View className="mx-4 rounded-2xl bg-[#0d1629] border border-[#0da2e7]/20 mb-4 overflow-hidden">
        <Text className="text-[#4a6fa5] text-xs font-semibold uppercase tracking-widest px-4 pt-4 pb-2">
          Seguridad de la cuenta
        </Text>
        <SettingRow
          icon="lock-reset"
          label="Cambiar contraseña"
          description="Actualiza la contraseña de tu cuenta"
        />
      </View>

      {/* Preferencias */}
      <View className="mx-4 rounded-2xl bg-[#0d1629] border border-[#0da2e7]/20 mb-4 overflow-hidden">
        <Text className="text-[#4a6fa5] text-xs font-semibold uppercase tracking-widest px-4 pt-4 pb-2">
          Preferencias
        </Text>
        <SettingRow
          icon="notifications-none"
          label="Preferencias de notificaciones"
          description="Gestiona alertas y mensajes push"
        />
        <SettingRow
          icon="dark-mode"
          label="Tema de visualización"
          description="Actualmente en modo oscuro"
          rightElement={
            <View className="bg-[#0da2e7]/20 px-2.5 py-1 rounded-lg">
              <Text className="text-[#0da2e7] text-xs font-medium">Activo</Text>
            </View>
          }
        />
      </View>

      {/* Cerrar sesión */}
      <View className="mx-4 rounded-2xl bg-[#0d1629] border border-[#0da2e7]/20 mb-4 overflow-hidden">
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center px-4 py-4"
        >
          <View className="w-9 h-9 rounded-xl bg-red-500/10 items-center justify-center mr-4">
            <MaterialIcons name="logout" size={20} color="#ef4444" />
          </View>
          <View className="flex-1">
            <Text className="text-red-400 text-sm font-medium">Cerrar sesión</Text>
            <Text className="text-[#4a6fa5] text-xs mt-0.5">Salir de tu sesión actual</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View className="items-center py-6">
        <View className="flex-row items-center gap-x-2 mb-1">
          <MaterialIcons name="dashboard-customize" size={14} color="#4a6fa5" />
          <Text className="text-[#4a6fa5] text-xs font-bold tracking-widest">Boardly</Text>
        </View>
        <Text className="text-[#4a6fa5] text-xs">Versión 1.0.0 • Build 1</Text>
      </View>
    </ScrollView>
  );
}

