import { createTrip } from '@/api/trips';
import { useAuthStore } from '@/store/useAuthStore';
import { useTripsStore } from '@/store/useTripsStore';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AIRLINES = [
  'Aeromexico',
  'Air France',
  'Alitalia / ITA Airways',
  'American Airlines',
  'British Airways',
  'Cathay Pacific',
  'Delta',
  'Emirates',
  'Iberia',
  'KLM',
  'Lufthansa',
  'Ryanair',
  'United',
  'Volaris',
];

interface FormState {
  clientName: string;
  pnr: string;
  fromCode: string;
  fromCity: string;
  toCode: string;
  toCity: string;
  notes: string;
  customAirlineName: string;
  customCheckInUrl: string;
}

const EMPTY: FormState = {
  clientName: '', pnr: '',
  fromCode: '', fromCity: '', toCode: '', toCity: '',
  notes: '', customAirlineName: '', customCheckInUrl: '',
};

function validate(form: FormState, selectedAirline: string, depDateTime: Date | null): string | null {
  if (!form.clientName.trim()) return 'El nombre del cliente es obligatorio.';
  if (!selectedAirline) return 'Selecciona una aerol\u00ednea.';
  if (selectedAirline === 'Otro' && !form.customAirlineName.trim()) return 'Ingresa el nombre de la aerol\u00ednea.';
  if (!form.pnr.trim()) return 'El PNR/localizador es obligatorio.';
  if (form.fromCode.trim().length !== 3) return 'El c\u00f3digo IATA origen debe tener 3 letras.';
  if (form.toCode.trim().length !== 3) return 'El c\u00f3digo IATA destino debe tener 3 letras.';
  if (!form.fromCity.trim()) return 'La ciudad origen es obligatoria.';
  if (!form.toCity.trim()) return 'La ciudad destino es obligatoria.';
  if (!depDateTime) return 'Selecciona fecha y hora de salida.';
  return null;
}

interface FieldConfig {
  label: string;
  placeholder: string;
  key: keyof FormState;
  keyboardType?: 'default' | 'numeric' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  hint?: string;
}

const FIELDS_BEFORE: FieldConfig[] = [
  { label: 'Nombre del cliente', placeholder: 'Ej. Juan P\u00e9rez', key: 'clientName', autoCapitalize: 'words' },
];

const FIELDS_AFTER: FieldConfig[] = [
  { label: 'PNR / Localizador', placeholder: 'Ej. ABC123', key: 'pnr', autoCapitalize: 'characters' },
  { label: 'C\u00f3digo IATA origen', placeholder: 'Ej. MAD', key: 'fromCode', autoCapitalize: 'characters', hint: '3 letras' },
  { label: 'Ciudad origen', placeholder: 'Ej. Madrid', key: 'fromCity', autoCapitalize: 'words' },
  { label: 'C\u00f3digo IATA destino', placeholder: 'Ej. CDG', key: 'toCode', autoCapitalize: 'characters', hint: '3 letras' },
  { label: 'Ciudad destino', placeholder: 'Ej. Par\u00eds', key: 'toCity', autoCapitalize: 'words' },
];

function InputField({
  config,
  value,
  onChange,
  divider = true,
}: {
  config: FieldConfig;
  value: string;
  onChange: (v: string) => void;
  divider?: boolean;
}) {
  return (
    <View className={divider ? 'mb-5' : ''}>
      <View className="flex-row items-center justify-between mb-1.5">
        <Text className="text-[#4a6fa5] text-xs font-medium uppercase tracking-wider">
          {config.label}
        </Text>
        {config.hint && (
          <Text className="text-[#4a6fa5]/60 text-[10px]">{config.hint}</Text>
        )}
      </View>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={config.placeholder}
        placeholderTextColor="#2d4a6e"
        keyboardType={config.keyboardType ?? 'default'}
        autoCapitalize={config.autoCapitalize ?? 'sentences'}
        className="bg-[#0a0f1e] border border-[#0da2e7]/12 rounded-xl px-4 py-3 text-white text-sm"
      />
    </View>
  );
}

export default function NuevoViajeScreen() {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [selectedAirline, setSelectedAirline] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [departureDateTime, setDepartureDateTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  function selectAirline(airline: string) {
    setSelectedAirline(airline);
    setDropdownOpen(false);
    setError(null);
    if (airline !== 'Otro') {
      setForm((prev) => ({ ...prev, customAirlineName: '', customCheckInUrl: '' }));
    }
  }

  async function handleSave() {
    const err = validate(form, selectedAirline, departureDateTime);
    if (err) { setError(err); return; }

    const pad = (n: number) => String(n).padStart(2, '0');
    const dep = departureDateTime!;
    const departureAt = `${dep.getFullYear()}-${pad(dep.getMonth() + 1)}-${pad(dep.getDate())}T${pad(dep.getHours())}:${pad(dep.getMinutes())}:00`;

    setSaving(true);
    try {
      const agentId = useAuthStore.getState().user!.id;
      const airline = selectedAirline === 'Otro' ? form.customAirlineName : selectedAirline;
      const airlineCheckInUrl = selectedAirline === 'Otro' ? (form.customCheckInUrl.trim() || null) : null;
      await createTrip({
        agentId,
        clientName: form.clientName,
        airline,
        airlineCheckInUrl,
        pnr: form.pnr,
        fromCode: form.fromCode.toUpperCase(),
        fromCity: form.fromCity,
        toCode: form.toCode.toUpperCase(),
        toCity: form.toCity,
        departureAt,
        notes: form.notes,
      });
      useTripsStore.getState().bump();
      router.back();
    } catch (e) {
      setError('No se pudo guardar el viaje. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  const isOtro = selectedAirline === 'Otro';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#0a0f1e]"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 32 }}
      >
        {/* Cabecera */}
        <View className="flex-row items-center gap-x-2 px-4 pt-2 pb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="flex-row items-center gap-x-1"
          >
            <MaterialIcons name="arrow-back" size={22} color="#0da2e7" />
            <Text className="text-[#0da2e7] text-sm font-medium">Viajes</Text>
          </TouchableOpacity>
        </View>

        <View className="mx-5">
          <Text className="text-white text-2xl font-bold mb-1">Nuevo viaje</Text>
          <Text className="text-[#4a6fa5] text-sm mb-6">Completa los datos del cliente y el vuelo.</Text>

          <View className="bg-[#0d1629] border border-[#0da2e7]/15 rounded-2xl px-5 py-4 mb-4">

            {FIELDS_BEFORE.map((f) => (
              <InputField key={f.key} config={f} value={form[f.key]} onChange={(v) => set(f.key, v)} />
            ))}

            {/* Aerol\u00ednea dropdown */}
            <View className="mb-5">
              <Text className="text-[#4a6fa5] text-xs font-medium uppercase tracking-wider mb-1.5">
                {'Aerol\u00ednea'}
              </Text>

              <TouchableOpacity
                onPress={() => setDropdownOpen((v) => !v)}
                activeOpacity={0.8}
                className="bg-[#0a0f1e] border border-[#0da2e7]/12 rounded-xl px-4 py-3 flex-row items-center justify-between"
              >
                <Text style={{ color: selectedAirline ? '#fff' : '#2d4a6e' }} className="text-sm">
                  {selectedAirline || 'Selecciona una aerol\u00ednea'}
                </Text>
                <MaterialIcons
                  name={dropdownOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={20}
                  color="#4a6fa5"
                />
              </TouchableOpacity>

              {dropdownOpen && (
                <View className="bg-[#0a0f1e] border border-[#0da2e7]/15 rounded-xl mt-1 overflow-hidden">
                  {[...AIRLINES, 'Otro'].map((airline, idx, arr) => (
                    <TouchableOpacity
                      key={airline}
                      onPress={() => selectAirline(airline)}
                      activeOpacity={0.7}
                      style={{
                        backgroundColor:
                          selectedAirline === airline ? 'rgba(13,162,231,0.10)' : 'transparent',
                        borderBottomWidth: idx < arr.length - 1 ? 1 : 0,
                        borderBottomColor: 'rgba(13,162,231,0.08)',
                      }}
                      className="flex-row items-center justify-between px-4 py-3"
                    >
                      <Text
                        style={{
                          color:
                            airline === 'Otro'
                              ? '#4a6fa5'
                              : selectedAirline === airline
                              ? '#0da2e7'
                              : '#e2e8f0',
                        }}
                        className="text-sm"
                      >
                        {airline}
                      </Text>
                      {selectedAirline === airline && (
                        <MaterialIcons name="check" size={16} color="#0da2e7" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {isOtro && (
                <View className="mt-3 gap-y-3">
                  <View>
                    <Text className="text-[#4a6fa5] text-xs font-medium uppercase tracking-wider mb-1.5">
                      {'Nombre de la aerol\u00ednea'}
                    </Text>
                    <TextInput
                      value={form.customAirlineName}
                      onChangeText={(v) => set('customAirlineName', v)}
                      placeholder="Ej. Sky Airlines"
                      placeholderTextColor="#2d4a6e"
                      autoCapitalize="words"
                      className="bg-[#0a0f1e] border border-[#0da2e7]/12 rounded-xl px-4 py-3 text-white text-sm"
                    />
                  </View>
                  <View>
                    <View className="flex-row items-center justify-between mb-1.5">
                      <Text className="text-[#4a6fa5] text-xs font-medium uppercase tracking-wider">
                        URL de check-in
                      </Text>
                      <Text className="text-[#4a6fa5]/60 text-[10px]">Opcional</Text>
                    </View>
                    <TextInput
                      value={form.customCheckInUrl}
                      onChangeText={(v) => set('customCheckInUrl', v)}
                      placeholder="https://aerolinea.com/check-in"
                      placeholderTextColor="#2d4a6e"
                      autoCapitalize="none"
                      keyboardType="url"
                      className="bg-[#0a0f1e] border border-[#0da2e7]/12 rounded-xl px-4 py-3 text-white text-sm"
                    />
                  </View>
                </View>
              )}
            </View>

            {FIELDS_AFTER.map((f, idx) => (
              <InputField
                key={f.key}
                config={f}
                value={form[f.key]}
                onChange={(v) => set(f.key, v)}
                divider={idx < FIELDS_AFTER.length - 1}
              />
            ))}

            {/* Fecha de salida */}
            <View className="mt-5">
              <Text className="text-[#4a6fa5] text-xs font-medium uppercase tracking-wider mb-1.5">
                Fecha de salida
              </Text>
              <TouchableOpacity
                onPress={() => { setShowDatePicker((v) => !v); setShowTimePicker(false); }}
                activeOpacity={0.8}
                className="bg-[#0a0f1e] border border-[#0da2e7]/12 rounded-xl px-4 py-3 flex-row items-center justify-between"
              >
                <Text style={{ color: departureDateTime ? '#fff' : '#2d4a6e' }} className="text-sm">
                  {departureDateTime
                    ? departureDateTime.toLocaleDateString('es', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })
                    : 'Selecciona una fecha'}
                </Text>
                <MaterialIcons name="calendar-today" size={18} color="#4a6fa5" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={departureDateTime ?? new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  minimumDate={new Date()}
                  themeVariant="dark"
                  onChange={(_, date) => {
                    if (Platform.OS === 'android') setShowDatePicker(false);
                    if (date) {
                      setDepartureDateTime((prev) => {
                        const merged = new Date(prev ?? date);
                        merged.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                        return new Date(merged);
                      });
                    }
                  }}
                />
              )}
            </View>

            {/* Hora de salida */}
            <View className="mt-5">
              <Text className="text-[#4a6fa5] text-xs font-medium uppercase tracking-wider mb-1.5">
                Hora de salida
              </Text>
              <TouchableOpacity
                onPress={() => { setShowTimePicker((v) => !v); setShowDatePicker(false); }}
                activeOpacity={0.8}
                className="bg-[#0a0f1e] border border-[#0da2e7]/12 rounded-xl px-4 py-3 flex-row items-center justify-between"
              >
                <Text style={{ color: departureDateTime ? '#fff' : '#2d4a6e' }} className="text-sm">
                  {departureDateTime
                    ? departureDateTime.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', hour12: false })
                    : 'Selecciona una hora'}
                </Text>
                <MaterialIcons name="access-time" size={18} color="#4a6fa5" />
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={departureDateTime ?? new Date()}
                  mode="time"
                  is24Hour
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  themeVariant="dark"
                  onChange={(_, date) => {
                    if (Platform.OS === 'android') setShowTimePicker(false);
                    if (date) {
                      setDepartureDateTime((prev) => {
                        const merged = new Date(prev ?? date);
                        merged.setHours(date.getHours(), date.getMinutes(), 0, 0);
                        return new Date(merged);
                      });
                    }
                  }}
                />
              )}
            </View>
          </View>

          {/* Notas */}
          <View className="bg-[#0d1629] border border-[#0da2e7]/15 rounded-2xl px-5 py-4 mb-4">
            <Text className="text-[#4a6fa5] text-xs font-medium uppercase tracking-wider mb-1.5">
              Notas del agente
            </Text>
            <TextInput
              value={form.notes}
              onChangeText={(v) => set('notes', v)}
              placeholder="Indicaciones especiales, equipaje, asistencia..."
              placeholderTextColor="#2d4a6e"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="bg-[#0a0f1e] border border-[#0da2e7]/12 rounded-xl px-4 py-3 text-white text-sm"
              style={{ minHeight: 96 }}
            />
          </View>

          {error && (
            <View className="flex-row items-center gap-x-2 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 mb-4">
              <MaterialIcons name="error-outline" size={16} color="#ef4444" />
              <Text className="text-red-400 text-sm flex-1">{error}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
            className="flex-row items-center justify-center gap-x-2 bg-[#0da2e7] rounded-2xl py-4"
            style={{ opacity: saving ? 0.7 : 1 }}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialIcons name="check" size={18} color="#fff" />
            )}
            <Text className="text-white font-bold text-base">
              {saving ? 'Guardando...' : 'Guardar viaje'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
