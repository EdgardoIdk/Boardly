import { register } from '@/api/auth';
import { useThemeColors } from '@/hooks/useThemeColors';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
  if (password.length === 0) return { label: '', color: 'transparent', width: 'w-0' };
  if (password.length < 6) return { label: 'Débil', color: '#ef4444', width: 'w-1/4' };
  if (password.length < 10 || !/[A-Z]/.test(password) || !/[0-9]/.test(password))
    return { label: 'Seguridad media', color: '#f59e0b', width: 'w-1/2' };
  return { label: 'Fuerte', color: '#22c55e', width: 'w-full' };
}

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const strength = getPasswordStrength(password);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'El nombre es requerido';
    if (!email.trim()) newErrors.email = 'El correo es requerido';
    if (password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    if (!acceptedTerms) newErrors.terms = 'Debes aceptar los términos';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    const error = await register({ email, password, fullName });
    setLoading(false);
    if (error) {
      Alert.alert('Error al registrarse', error.message);
    } else {
      Alert.alert(
        'Cuenta creada',
        'Revisa tu correo para confirmar tu cuenta y luego inicia sesión.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface"
    >
      <StatusBar style="auto" />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 pb-10" style={{ paddingTop: insets.top + 8 }}>
          {/* Botón volver */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-6 flex-row items-center gap-x-1"
          >
            <MaterialIcons name="arrow-back" size={22} color={colors.accent} />
            <Text className="text-accent text-sm">Registro</Text>
          </TouchableOpacity>

          {/* Encabezado */}
          <View className="mb-8">
            <Text className="text-primary text-3xl font-bold">Crear cuenta en Boardly</Text>
            <Text className="text-secondary text-sm mt-2">
              Completa tus datos para empezar tu experiencia.
            </Text>
          </View>

          {/* Formulario */}
          <View className="gap-y-4">
            {/* Nombre completo */}
            <View>
              <View className="rounded-xl border border-bd/20 bg-surface-card flex-row items-center px-4">
                <MaterialIcons name="person-outline" size={18} color={colors.textSecondary} />
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Nombre completo"
                  placeholderTextColor={colors.placeholder}
                  autoCapitalize="words"
                  className="flex-1 text-primary py-4 px-3"
                />
                {fullName.length > 2 && (
                  <MaterialIcons name="check-circle" size={18} color="#22c55e" />
                )}
              </View>
              {errors.fullName && (
                <Text className="text-red-400 text-xs mt-1 ml-1">{errors.fullName}</Text>
              )}
            </View>

            {/* Email */}
            <View>
              <View className="rounded-xl border border-bd/20 bg-surface-card flex-row items-center px-4">
                <MaterialIcons name="mail-outline" size={18} color={colors.textSecondary} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder={'Correo electrónico'}
                  placeholderTextColor={colors.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="flex-1 text-primary py-4 px-3"
                />
              </View>
              {errors.email && (
                <Text className="text-red-400 text-xs mt-1 ml-1">{errors.email}</Text>
              )}
            </View>

            {/* Contraseña */}
            <View>
              <View className="rounded-xl border border-bd/20 bg-surface-card flex-row items-center px-4">
                <MaterialIcons name="lock-outline" size={18} color={colors.textSecondary} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder={'Contraseña'}
                  placeholderTextColor={colors.placeholder}
                  secureTextEntry={!showPassword}
                  textContentType="newPassword"
                  autoComplete="new-password"
                  autoCorrect={false}
                  autoCapitalize="none"
                  className="flex-1 text-primary py-4 px-3"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialIcons
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {/* Indicador de seguridad */}
              {password.length > 0 && (
                <View className="mt-2 flex-row items-center gap-x-2">
                  <View className="flex-1 h-1 rounded-full bg-surface-card">
                    <View
                      className={`h-1 rounded-full ${strength.width}`}
                      style={{ backgroundColor: strength.color }}
                    />
                  </View>
                  <Text className="text-xs" style={{ color: strength.color }}>
                    {strength.label}
                  </Text>
                </View>
              )}
              {errors.password && (
                <Text className="text-red-400 text-xs mt-1 ml-1">{errors.password}</Text>
              )}
            </View>

            {/* Confirmar contraseña */}
            <View>
              <View className="rounded-xl border border-bd/20 bg-surface-card flex-row items-center px-4">
                <MaterialIcons name="lock-outline" size={18} color={colors.textSecondary} />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder={'Confirmar contraseña'}
                  placeholderTextColor={colors.placeholder}
                  secureTextEntry={!showPassword}
                  textContentType="newPassword"
                  autoComplete="new-password"
                  autoCorrect={false}
                  autoCapitalize="none"
                  className="flex-1 text-primary py-4 px-3"
                />
              </View>
              {errors.confirmPassword && (
                <Text className="text-red-400 text-xs mt-1 ml-1">{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Términos y condiciones */}
            <View>
              <TouchableOpacity
                onPress={() => setAcceptedTerms(!acceptedTerms)}
                className="flex-row items-center gap-x-3"
              >
                <View
                  className={`w-5 h-5 rounded border items-center justify-center ${
                    acceptedTerms
                      ? 'bg-accent border-bd'
                      : 'border-bd/40 bg-transparent'
                  }`}
                >
                  {acceptedTerms && <MaterialIcons name="check" size={13} color="#fff" />}
                </View>
                <Text className="text-secondary text-sm flex-1">
                  Acepto los{' '}
                  <Text className="text-accent">{'Términos de Servicio'}</Text>{' y la '}
                  <Text className="text-accent">{'Política de Privacidad'}</Text>{'.'}
                </Text>
              </TouchableOpacity>
              {errors.terms && (
                <Text className="text-red-400 text-xs mt-1 ml-1">{errors.terms}</Text>
              )}
            </View>

            {/* Botón crear cuenta */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              className="rounded-xl bg-accent py-4 items-center mt-2"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-base">Crear cuenta</Text>
              )}
            </TouchableOpacity>

            {/* Ir a login */}
            <View className="flex-row justify-center mt-2">
              <Text className="text-secondary">{'¿Ya tienes una cuenta? '}</Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                <Text className="text-accent font-medium">{'Inicia sesión aquí'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer de seguridad */}
          <View className="mt-10 flex-row items-center justify-center gap-x-2">
            <MaterialIcons name="lock" size={13} color={colors.textSecondary} />
            <Text className="text-secondary text-xs text-center">
              {'Boardly utiliza cifrado de extremo a extremo para proteger toda tu información personal.'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
