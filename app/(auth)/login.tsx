import { login } from '@/api/auth';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
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

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    const error = await login({ email, password });
    setLoading(false);
    if (error) {
      Alert.alert('Error al iniciar sesión', error.message);
    } else {
      router.replace('/(tabs)/inicio');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-[#0a0f1e]"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-between px-6 py-8">
        {/* Logo + título */}
        <View className="flex-1 justify-center">
          <View className="items-center mb-12">
            <View className="w-20 h-20 rounded-3xl bg-[#0da2e7]/10 items-center justify-center border border-[#0da2e7]/30 mb-5">
              <MaterialIcons name="flight-takeoff" size={38} color="#0da2e7" />
            </View>
            <Text className="text-white text-4xl font-bold tracking-widest">Boardly</Text>
            <Text className="text-[#4a6fa5] text-sm mt-2 tracking-wide">
              Tu asistente de check-in
            </Text>
          </View>

          {/* Formulario */}
          <View className="gap-y-3">
            {/* Label email */}
            <Text className="text-[#4a6fa5] text-xs font-semibold uppercase tracking-widest ml-1 mb-0.5">
              Correo electrónico
            </Text>
            <View className="rounded-2xl border border-[#0da2e7]/20 bg-[#0d1629] flex-row items-center px-4 mb-2">
              <MaterialIcons name="mail-outline" size={18} color="#4a6fa5" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="agente@boardly.io"
                placeholderTextColor="#2a4a6a"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
                className="flex-1 text-white py-4 px-3 text-base"
              />
            </View>

            {/* Label contraseña */}
            <Text className="text-[#4a6fa5] text-xs font-semibold uppercase tracking-widest ml-1 mb-0.5">
              Contraseña
            </Text>
            <View className="rounded-2xl border border-[#0da2e7]/20 bg-[#0d1629] flex-row items-center px-4">
              <MaterialIcons name="lock-outline" size={18} color="#4a6fa5" />
              <TextInput
                ref={passwordRef}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#2a4a6a"
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                className="flex-1 text-white py-4 px-3 text-base"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialIcons
                  name={showPassword ? 'visibility-off' : 'visibility'}
                  size={18}
                  color="#4a6fa5"
                />
              </TouchableOpacity>
            </View>

            {/* ¿Olvidaste tu contraseña? */}
            <TouchableOpacity className="items-end mt-1">
              <Text className="text-[#0da2e7] text-sm">¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            {/* Botón iniciar sesión */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
              className="rounded-2xl bg-[#0da2e7] py-4 items-center mt-4"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View className="flex-row items-center gap-x-2">
                  <Text className="text-white font-bold text-base">Iniciar sesión</Text>
                  <MaterialIcons name="arrow-forward" size={18} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Registrarse */}
        <View className="flex-row justify-center items-center pt-6 border-t border-[#0da2e7]/10">
          <Text className="text-[#4a6fa5]">¿No tienes cuenta? </Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Text className="text-[#0da2e7] font-semibold">Crear cuenta</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
