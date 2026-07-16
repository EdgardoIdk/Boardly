import { logout, updatePassword, updateProfile } from '@/api/auth';
import { themeVars } from '@/constants/themes';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SettingRowProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  iconBg?: string;
  label: string;
  description: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  themeColors: { accent: string; textSecondary: string };
};

function SettingRow({ icon, iconColor, iconBg = 'rgba(13,162,231,0.1)', label, description, onPress, rightElement, themeColors }: SettingRowProps) {
  const iconClr = iconColor ?? themeColors.accent;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
      className="flex-row items-center px-4 py-4 border-b border-bd/10"
    >
      <View
        style={{ backgroundColor: iconBg }}
        className="w-9 h-9 rounded-xl items-center justify-center mr-4"
      >
        <MaterialIcons name={icon} size={20} color={iconClr} />
      </View>
      <View className="flex-1">
        <Text className="text-primary text-sm font-medium">{label}</Text>
        <Text className="text-secondary text-xs mt-0.5">{description}</Text>
      </View>
      {rightElement ?? (onPress ? <MaterialIcons name="chevron-right" size={20} color={themeColors.textSecondary} /> : null)}
    </TouchableOpacity>
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

interface EditModalProps {
  visible: boolean;
  title: string;
  fields: { key: string; label: string; placeholder: string; secure?: boolean }[];
  onCancel: () => void;
  onSubmit: (values: Record<string, string>) => Promise<void>;
  submitLabel?: string;
  placeholderColor: string;
  modalThemeStyle: Record<string, string>;
}

function EditModal({ visible, title, fields, onCancel, onSubmit, submitLabel = 'Guardar', placeholderColor, modalThemeStyle }: EditModalProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSubmit(values);
      setValues({});
    } catch (e: any) {
      setError(e.message ?? 'Error inesperado');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setValues({});
    setError(null);
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={modalThemeStyle} className="flex-1 bg-black/60 items-center justify-center px-6">
        <View className="bg-surface-card border border-bd/20 rounded-2xl w-full max-w-sm px-5 py-5">
          <Text className="text-primary text-lg font-bold mb-4">{title}</Text>

          {fields.map((f) => (
            <View key={f.key} className="mb-3">
              <Text className="text-secondary text-xs font-medium uppercase tracking-wider mb-1.5">
                {f.label}
              </Text>
              <TextInput
                value={values[f.key] ?? ''}
                onChangeText={(v) => setValues((prev) => ({ ...prev, [f.key]: v }))}
                placeholder={f.placeholder}
                placeholderTextColor={placeholderColor}
                secureTextEntry={f.secure}
                autoCapitalize={f.secure ? 'none' : 'words'}
                className="bg-input-bg border border-bd/12 rounded-xl px-4 py-3 text-primary text-sm"
              />
            </View>
          ))}

          {error && (
            <View className="flex-row items-center gap-x-2 bg-danger/10 border border-danger/25 rounded-xl px-3 py-2 mb-3">
              <MaterialIcons name="error-outline" size={14} color="#ef4444" />
              <Text className="text-danger text-xs flex-1">{error}</Text>
            </View>
          )}

          <View className="flex-row gap-x-3 mt-2">
            <TouchableOpacity
              onPress={handleCancel}
              disabled={saving}
              activeOpacity={0.8}
              className="flex-1 border border-secondary/30 rounded-xl py-3 items-center"
            >
              <Text className="text-secondary text-sm font-medium">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={saving}
              activeOpacity={0.8}
              className="flex-1 bg-accent rounded-xl py-3 items-center"
              style={{ opacity: saving ? 0.7 : 1 }}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white text-sm font-bold">{submitLabel}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function AjustesScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const user = useAuthStore((s) => s.user);
  const updateName = useAuthStore((s) => s.updateName);

  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const [editNameVisible, setEditNameVisible] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);

  const displayName = user?.fullName || 'Agente';
  const displayEmail = user?.email || '';
  const initials = getInitials(displayName);

  const handleEditName = async (values: Record<string, string>) => {
    const name = values.name?.trim();
    if (!name) throw new Error('El nombre no puede estar vacío.');
    const err = await updateProfile(name);
    if (err) throw new Error(err.message);
    updateName(name);
    setEditNameVisible(false);
    Alert.alert('Listo', 'Tu nombre se actualizó correctamente.');
  };

  const handleChangePassword = async (values: Record<string, string>) => {
    const pwd = values.password?.trim();
    const confirm = values.confirm?.trim();
    if (!pwd || pwd.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres.');
    if (pwd !== confirm) throw new Error('Las contraseñas no coinciden.');
    const err = await updatePassword(pwd);
    if (err) throw new Error(err.message);
    setChangePasswordVisible(false);
    Alert.alert('Listo', 'Tu contraseña se actualizó correctamente.');
  };

  const handleNotificationSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const handleLogout = () => {
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
    <>
      <ScrollView
        className="flex-1 bg-surface"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      >
        <View className="px-6 pb-6" style={{ paddingTop: insets.top + 16 }}>
          <Text className="text-primary text-2xl font-bold">Ajustes</Text>
          <Text className="text-secondary text-sm mt-1">Gestiona tu cuenta y preferencias</Text>
        </View>

        {/* Perfil */}
        <View className="mx-4 rounded-2xl bg-surface-card border border-bd/20 mb-4 overflow-hidden">
          <View className="flex-row items-center px-4 py-5">
            <View className="w-16 h-16 rounded-2xl bg-accent/20 items-center justify-center mr-4">
              <Text className="text-accent text-xl font-bold">{initials}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-primary text-base font-bold">{displayName}</Text>
              <Text className="text-accent text-xs mt-0.5">{displayEmail}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setEditNameVisible(true)}
              activeOpacity={0.7}
              className="w-8 h-8 rounded-xl bg-accent/10 items-center justify-center"
            >
              <MaterialIcons name="edit" size={16} color={colors.accent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Seguridad */}
        <View className="mx-4 rounded-2xl bg-surface-card border border-bd/20 mb-4 overflow-hidden">
          <Text className="text-secondary text-xs font-semibold uppercase tracking-widest px-4 pt-4 pb-2">
            Seguridad de la cuenta
          </Text>
          <SettingRow
            icon="lock-reset"
            label={'Cambiar contraseña'}
            description={'Actualiza la contraseña de tu cuenta'}
            onPress={() => setChangePasswordVisible(true)}
            themeColors={colors}
          />
        </View>

        {/* Preferencias */}
        <View className="mx-4 rounded-2xl bg-surface-card border border-bd/20 mb-4 overflow-hidden">
          <Text className="text-secondary text-xs font-semibold uppercase tracking-widest px-4 pt-4 pb-2">
            Preferencias
          </Text>
          <SettingRow
            icon="notifications-none"
            label="Notificaciones"
            description="Gestiona alertas y permisos push"
            onPress={handleNotificationSettings}
            themeColors={colors}
          />
          <SettingRow
            icon={theme === 'dark' ? 'dark-mode' : 'light-mode'}
            label={'Tema de visualización'}
            description={theme === 'dark' ? 'Modo oscuro' : 'Modo claro'}
            themeColors={colors}
            rightElement={
              <Switch
                value={theme === 'dark'}
                onValueChange={(v) => setTheme(v ? 'dark' : 'light')}
                trackColor={{ false: '#cbd5e1', true: '#0da2e7' }}
                thumbColor="#fff"
              />
            }
          />
        </View>

        {/* Cerrar sesion */}
        <View className="mx-4 rounded-2xl bg-surface-card border border-bd/20 mb-4 overflow-hidden">
          <SettingRow
            icon="logout"
            iconColor="#ef4444"
            iconBg="rgba(239,68,68,0.1)"
            label={'Cerrar sesión'}
            description={'Salir de tu sesión actual'}
            onPress={handleLogout}
            rightElement={null}
            themeColors={colors}
          />
        </View>

        {/* Footer */}
        <View className="items-center py-6">
          <View className="flex-row items-center gap-x-2 mb-1">
            <MaterialIcons name="dashboard-customize" size={14} color={colors.textSecondary} />
            <Text className="text-secondary text-xs font-bold tracking-widest">Boardly</Text>
          </View>
          <Text className="text-secondary text-xs">{'Versión 1.0.0 • Build 1'}</Text>
        </View>
      </ScrollView>

      <EditModal
        visible={editNameVisible}
        title="Editar nombre"
        fields={[
          { key: 'name', label: 'Nombre completo', placeholder: displayName },
        ]}
        onCancel={() => setEditNameVisible(false)}
        onSubmit={handleEditName}
        placeholderColor={colors.placeholder}
        modalThemeStyle={themeVars[theme]}
      />

      <EditModal
        visible={changePasswordVisible}
        title={'Cambiar contraseña'}
        fields={[
          { key: 'password', label: 'Nueva contraseña', placeholder: 'Mínimo 6 caracteres', secure: true },
          { key: 'confirm', label: 'Confirmar contraseña', placeholder: 'Repite la contraseña', secure: true },
        ]}
        onCancel={() => setChangePasswordVisible(false)}
        onSubmit={handleChangePassword}
        submitLabel="Cambiar"
        placeholderColor={colors.placeholder}
        modalThemeStyle={themeVars[theme]}
      />
    </>
  );
}
