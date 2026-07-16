import { getAirlines, type Airline } from '@/api/airlines';
import { createTrip, updateTrip, getTripById } from '@/api/trips';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore } from '@/store/useAuthStore';
import { useTripsStore } from '@/store/useTripsStore';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
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

interface FormState {
  clientName: string;
  clientPhonePrefix: string;
  clientPhoneNumber: string;
  pnr: string;
  fromCode: string;
  toCode: string;
  notes: string;
  customAirlineName: string;
  customCheckInUrl: string;
}

const EMPTY: FormState = {
  clientName: '', clientPhonePrefix: '+504', clientPhoneNumber: '', pnr: '',
  fromCode: '', toCode: '',
  notes: '', customAirlineName: '', customCheckInUrl: '',
};

function validate(form: FormState, selectedAirline: string, depDateTime: Date | null): string | null {
  if (!form.clientName.trim()) return 'El nombre del cliente es obligatorio.';
  if (!form.clientPhoneNumber.trim()) return 'El teléfono del cliente es obligatorio.';
  if (!selectedAirline) return 'Selecciona una aerolínea.';
  if (selectedAirline === 'Otro' && !form.customAirlineName.trim()) return 'Ingresa el nombre de la aerolínea.';
  if (!form.pnr.trim()) return 'El PNR/localizador es obligatorio.';
  if (form.fromCode.trim().length !== 3) return 'El código IATA origen debe tener 3 letras.';
  if (form.toCode.trim().length !== 3) return 'El código IATA destino debe tener 3 letras.';
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
  { label: 'Nombre del cliente', placeholder: 'Ej. Juan Pérez', key: 'clientName', autoCapitalize: 'words' },
];

const FIELDS_AFTER: FieldConfig[] = [
  { label: 'PNR / Localizador', placeholder: 'Ej. ABC123', key: 'pnr', autoCapitalize: 'characters' },
  { label: 'Código IATA origen', placeholder: 'Ej. MAD', key: 'fromCode', autoCapitalize: 'characters', hint: '3 letras' },
  { label: 'Código IATA destino', placeholder: 'Ej. CDG', key: 'toCode', autoCapitalize: 'characters', hint: '3 letras' },
];

function InputField({
  config,
  value,
  onChange,
  divider = true,
  placeholderColor,
}: {
  config: FieldConfig;
  value: string;
  onChange: (v: string) => void;
  divider?: boolean;
  placeholderColor: string;
}) {
  return (
    <View className={divider ? 'mb-5' : ''}>
      <View className="flex-row items-center justify-between mb-1.5">
        <Text className="text-secondary text-xs font-medium uppercase tracking-wider">
          {config.label}
        </Text>
        {config.hint && (
          <Text className="text-secondary/60 text-[10px]">{config.hint}</Text>
        )}
      </View>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={config.placeholder}
        placeholderTextColor={placeholderColor}
        keyboardType={config.keyboardType ?? 'default'}
        autoCapitalize={config.autoCapitalize ?? 'sentences'}
        className="bg-input-bg border border-bd/12 rounded-xl px-4 py-3 text-primary text-sm"
      />
    </View>
  );
}

export default function NuevoViajeScreen() {
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [loadingAirlines, setLoadingAirlines] = useState(true);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [selectedAirline, setSelectedAirline] = useState('');
  const [selectedAirlineUrl, setSelectedAirlineUrl] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [departureDateTime, setDepartureDateTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAirlines()
      .then(setAirlines)
      .catch(() => {})
      .finally(() => setLoadingAirlines(false));
  }, []);

  useEffect(() => {
    if (editId) {
      getTripById(editId).then(trip => {
        if (!trip) return;
        
        let prefix = '+504';
        let number = trip.clientPhone || '';
        if (trip.clientPhone && trip.clientPhone.includes(' ')) {
          const parts = trip.clientPhone.split(' ');
          prefix = parts[0];
          number = parts.slice(1).join('');
        }
        
        setForm({
          clientName: trip.clientName,
          clientPhonePrefix: prefix,
          clientPhoneNumber: number,
          pnr: trip.pnr,
          fromCode: trip.fromCode,
          toCode: trip.toCode,
          notes: trip.notes || '',
          customAirlineName: '',
          customCheckInUrl: trip.airlineCheckInUrl || '',
        });
        
        setSelectedAirline(trip.airline);
        setSelectedAirlineUrl(trip.airlineCheckInUrl);
        setDepartureDateTime(new Date(trip.departureAt));
      });
    }
  }, [editId]);

  function set(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  function selectAirline(airlineName: string) {
    setSelectedAirline(airlineName);
    setDropdownOpen(false);
    setError(null);
    setSelectedAirlineUrl(null);
    if (airlineName !== 'Otro') {
      setForm((prev) => ({ ...prev, customAirlineName: '', customCheckInUrl: '' }));
    }
  }



  async function handleSave() {
    const err = validate(form, selectedAirline, departureDateTime);
    if (err) { setError(err); return; }

    const departureAt = departureDateTime!.toISOString();

    setSaving(true);
    try {
      const agentId = useAuthStore.getState().user!.id;
      const isCustom = selectedAirline === 'Otro';
      const airline = isCustom ? form.customAirlineName : selectedAirline;
      const airlineCheckInUrl = isCustom
        ? (form.customCheckInUrl.trim() || null)
        : selectedAirlineUrl;
      const payload = {
        agentId,
        clientName: form.clientName,
        clientPhone: `${form.clientPhonePrefix} ${form.clientPhoneNumber.trim()}`,
        airline,
        airlineCheckInUrl,
        pnr: form.pnr,
        fromCode: form.fromCode.toUpperCase(),
        toCode: form.toCode.toUpperCase(),
        departureAt,
        notes: form.notes,
      };
      
      if (editId) {
        await updateTrip(editId, payload);
      } else {
        await createTrip(payload);
      }
      useTripsStore.getState().bump();
      router.back();
    } catch (e) {
      setError('No se pudo guardar el viaje. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  const isOtro = selectedAirline === 'Otro';
  const airlineNames = airlines.map((a) => a.name);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface"
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
            <MaterialIcons name="arrow-back" size={22} color={colors.accent} />
            <Text className="text-accent text-sm font-medium">Viajes</Text>
          </TouchableOpacity>
        </View>

        <View className="mx-5">
          <Text className="text-primary text-2xl font-bold mb-1">{editId ? 'Editar viaje' : 'Nuevo viaje'}</Text>
          <Text className="text-secondary text-sm mb-6">Completa los datos del cliente y el vuelo.</Text>

          <View className="bg-surface-card border border-bd/15 rounded-2xl px-5 py-4 mb-4">

            {FIELDS_BEFORE.map((f) => (
              <InputField key={f.key} config={f} value={form[f.key]} onChange={(v) => set(f.key, v)} placeholderColor={colors.placeholder} />
            ))}

            <View className="mb-5 relative z-10">
              <Text className="text-secondary text-xs font-medium uppercase tracking-wider mb-1.5">
                Teléfono de contacto
              </Text>
              <View className="flex-row items-center gap-x-2">
                <View className="relative">
                  <TextInput
                    value={form.clientPhonePrefix}
                    onChangeText={(v) => {
                      const cleaned = v.replace(/[^\d+]/g, '');
                      const formatted = cleaned.startsWith('+') ? cleaned : (cleaned ? '+' + cleaned : '+');
                      set('clientPhonePrefix', formatted);
                    }}
                    keyboardType="phone-pad"
                    className="bg-input-bg border border-bd/12 rounded-xl px-3 py-3 text-primary text-sm text-center"
                    style={{ minWidth: 70 }}
                    maxLength={6}
                  />
                  <Text className="absolute -bottom-4 left-1 text-[9px] text-secondary/60">*editable</Text>
                </View>

                <TextInput
                  value={form.clientPhoneNumber}
                  onChangeText={(v) => set('clientPhoneNumber', v)}
                  placeholder="Ej. 99887766"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="numeric"
                  className="flex-1 bg-input-bg border border-bd/12 rounded-xl px-4 py-3 text-primary text-sm"
                />
              </View>
            </View>

            {/* Aerolínea dropdown */}
            <View className="mb-5 z-0">
              <Text className="text-secondary text-xs font-medium uppercase tracking-wider mb-1.5">
                {'Aerolínea'}
              </Text>

              <TouchableOpacity
                onPress={() => setDropdownOpen((v) => !v)}
                activeOpacity={0.8}
                className="bg-input-bg border border-bd/12 rounded-xl px-4 py-3 flex-row items-center justify-between"
              >
                <Text style={{ color: selectedAirline ? colors.textPrimary : colors.placeholder }} className="text-sm">
                  {selectedAirline || 'Selecciona una aerolínea'}
                </Text>
                <MaterialIcons
                  name={dropdownOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              {dropdownOpen && (
                <ScrollView
                  nestedScrollEnabled
                  className="bg-input-bg border border-bd/15 rounded-xl mt-1 overflow-hidden"
                  style={{ maxHeight: 280 }}
                >
                  {loadingAirlines ? (
                    <View className="items-center py-4">
                      <ActivityIndicator size="small" color={colors.accent} />
                    </View>
                  ) : [...airlineNames, 'Otro'].map((airline, idx, arr) => (
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
                              ? colors.textSecondary
                              : selectedAirline === airline
                              ? colors.accent
                              : colors.textPrimary,
                        }}
                        className="text-sm"
                      >
                        {airline}
                      </Text>
                      {selectedAirline === airline && (
                        <MaterialIcons name="check" size={16} color={colors.accent} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {isOtro && (
                <View className="mt-3 gap-y-3">
                  <View>
                    <Text className="text-secondary text-xs font-medium uppercase tracking-wider mb-1.5">
                      {'Nombre de la aerolínea'}
                    </Text>
                    <TextInput
                      value={form.customAirlineName}
                      onChangeText={(v) => set('customAirlineName', v)}
                      placeholder="Ej. Sky Airlines"
                      placeholderTextColor={colors.placeholder}
                      autoCapitalize="words"
                      className="bg-input-bg border border-bd/12 rounded-xl px-4 py-3 text-primary text-sm"
                    />
                  </View>
                  <View>
                    <View className="flex-row items-center justify-between mb-1.5">
                      <Text className="text-secondary text-xs font-medium uppercase tracking-wider">
                        URL de check-in
                      </Text>
                      <Text className="text-secondary/60 text-[10px]">Opcional</Text>
                    </View>
                    <TextInput
                      value={form.customCheckInUrl}
                      onChangeText={(v) => set('customCheckInUrl', v)}
                      placeholder="https://aerolinea.com/check-in"
                      placeholderTextColor={colors.placeholder}
                      autoCapitalize="none"
                      keyboardType="url"
                      className="bg-input-bg border border-bd/12 rounded-xl px-4 py-3 text-primary text-sm"
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
                placeholderColor={colors.placeholder}
              />
            ))}

            {/* Fecha de salida */}
            <View className="mt-5">
              <Text className="text-secondary text-xs font-medium uppercase tracking-wider mb-1.5">
                Fecha de salida
              </Text>
              <TouchableOpacity
                onPress={() => { setShowDatePicker((v) => !v); setShowTimePicker(false); }}
                activeOpacity={0.8}
                className="bg-input-bg border border-bd/12 rounded-xl px-4 py-3 flex-row items-center justify-between"
              >
                <Text style={{ color: departureDateTime ? colors.textPrimary : colors.placeholder }} className="text-sm">
                  {departureDateTime
                    ? departureDateTime.toLocaleDateString('es', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })
                    : 'Selecciona una fecha'}
                </Text>
                <MaterialIcons name="calendar-today" size={18} color={colors.textSecondary} />
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
              <Text className="text-secondary text-xs font-medium uppercase tracking-wider mb-1.5">
                Hora de salida
              </Text>
              <TouchableOpacity
                onPress={() => { setShowTimePicker((v) => !v); setShowDatePicker(false); }}
                activeOpacity={0.8}
                className="bg-input-bg border border-bd/12 rounded-xl px-4 py-3 flex-row items-center justify-between"
              >
                <Text style={{ color: departureDateTime ? colors.textPrimary : colors.placeholder }} className="text-sm">
                  {departureDateTime
                    ? departureDateTime.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', hour12: false })
                    : 'Selecciona una hora'}
                </Text>
                <MaterialIcons name="access-time" size={18} color={colors.textSecondary} />
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
          <View className="bg-surface-card border border-bd/15 rounded-2xl px-5 py-4 mb-4">
            <Text className="text-secondary text-xs font-medium uppercase tracking-wider mb-1.5">
              Notas del agente
            </Text>
            <TextInput
              value={form.notes}
              onChangeText={(v) => set('notes', v)}
              placeholder="Indicaciones especiales, equipaje, asistencia..."
              placeholderTextColor={colors.placeholder}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="bg-input-bg border border-bd/12 rounded-xl px-4 py-3 text-primary text-sm"
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
            className="flex-row items-center justify-center gap-x-2 bg-accent rounded-2xl py-4 mb-10"
            style={{ opacity: saving ? 0.7 : 1 }}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialIcons name="check" size={18} color="#fff" />
            )}
            <Text className="text-white font-bold text-base">
              {saving ? 'Guardando...' : editId ? 'Actualizar viaje' : 'Guardar viaje'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
