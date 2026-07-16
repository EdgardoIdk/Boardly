import { getAirlineByName } from '@/api/airlines';
import { getTripById, markCheckInDone, type Trip } from '@/api/trips';
import { NotificationBadge } from '@/components/viajes/StatusBadge';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTripsStore } from '@/store/useTripsStore';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Linking,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    Modal,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString('es', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  const time = d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  return { date: date.charAt(0).toUpperCase() + date.slice(1), time };
}

function daysUntil(iso: string): number {
  const now = new Date();
  const dep = new Date(iso);
  return Math.ceil((dep.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function ViajeDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [checkInUrl, setCheckInUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);

  function handleCall() {
    if (!trip?.clientPhone) return;
    const phone = trip.clientPhone.replace(/\s+/g, '');
    Linking.openURL(`tel:${phone}`);
    setContactModalVisible(false);
  }

  function handleWhatsApp() {
    if (!trip?.clientPhone) return;
    // For WhatsApp we usually just remove spaces and extra characters; keep digits and plus sign
    const phone = trip.clientPhone.replace(/[^\d+]/g, '');
    Linking.openURL(`https://wa.me/${phone}`);
    setContactModalVisible(false);
  }

  async function handleCopyPhone() {
    if (!trip?.clientPhone) return;
    await Clipboard.setStringAsync(trip.clientPhone);
    setContactModalVisible(false);
  }

  const resolveCheckInUrl = useCallback(async (t: Trip) => {
    if (t.airlineCheckInUrl) {
      setCheckInUrl(t.airlineCheckInUrl);
      return;
    }
    const airline = await getAirlineByName(t.airline);
    if (airline?.checkInUrl) {
      setCheckInUrl(airline.checkInUrl);
    } else {
      setCheckInUrl(`https://www.google.com/search?q=${encodeURIComponent(t.airline + ' online check-in')}`);
    }
  }, []);

  useEffect(() => {
    getTripById(id)
      .then((t) => {
        setTrip(t);
        if (t) resolveCheckInUrl(t);
      })
      .finally(() => setLoading(false));
  }, [id, resolveCheckInUrl]);

  if (loading) {
    return (
      <View
        style={{ paddingTop: insets.top }}
        className="flex-1 bg-surface items-center justify-center"
      >
        <ActivityIndicator size="large" color="#0da2e7" />
      </View>
    );
  }

  if (!trip) {
    return (
      <View
        style={{ paddingTop: insets.top }}
        className="flex-1 bg-surface items-center justify-center"
      >
        <MaterialIcons name="flight-takeoff" size={40} color={colors.textSecondary} />
        <Text className="text-secondary text-sm mt-3">Viaje no encontrado</Text>
      </View>
    );
  }

  const { date, time } = formatDateTime(trip.departureAt);
  const days = daysUntil(trip.departureAt);
  const hoursUntil = (new Date(trip.departureAt).getTime() - Date.now()) / (1000 * 60 * 60);
  const checkInAvailable = hoursUntil <= 24 && hoursUntil > 0;
  const hasDeparted = hoursUntil <= 0;
  const countdownLabel =
    days < 0  ? 'Ya salió' :
    days === 0 ? 'Hoy' :
    days === 1 ? 'Mañana' :
    `En ${days} días`;

  async function handleCheckInDone() {
    if (!trip || saving || trip.checkInDone) return;
    setSaving(true);
    const updated = await markCheckInDone(trip.id);
    if (updated) {
      setTrip(updated);
      useTripsStore.getState().bump();
    }
    setSaving(false);
  }

  return (
    <ScrollView
      className="flex-1 bg-surface"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}
    >
      {/* Botón volver */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="flex-row items-center gap-x-1 px-4 pt-2 pb-1"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MaterialIcons name="arrow-back" size={22} color={colors.accent} />
        <Text className="text-accent text-sm font-medium">Viajes</Text>
      </TouchableOpacity>

      {/* Header: cliente + badge */}
      <View className="mx-5 mt-3 bg-surface-card border border-bd/15 rounded-2xl p-5">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-secondary text-xs font-medium tracking-widest uppercase">
            Detalle del Viaje
          </Text>
          <NotificationBadge checkInDone={trip.checkInDone} departureAt={trip.departureAt} size="md" />
        </View>

        <View className="flex-row items-center gap-x-4">
          <View className="w-14 h-14 rounded-2xl bg-accent/15 border border-bd/25 items-center justify-center">
            <MaterialIcons name="person" size={26} color={colors.accent} />
          </View>
          <View className="flex-1">
            <Text className="text-primary text-xl font-bold">{trip.clientName}</Text>
            <View className="flex-row items-center gap-x-2 mt-1">
              <MaterialIcons name="confirmation-number" size={13} color={colors.textSecondary} />
              <Text className="text-secondary text-xs font-mono">{trip.pnr}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Ruta */}
      <View className="mx-5 mt-4 bg-surface-card border border-bd/15 rounded-2xl p-5">
        <Text className="text-secondary text-xs font-medium tracking-widest uppercase mb-4">
          Itinerario
        </Text>

        <View className="flex-row items-center justify-between mb-5">
          <View className="items-center flex-1">
            <Text className="text-primary text-3xl font-bold">{trip.fromCode}</Text>
          </View>
          <View className="items-center px-3">
            <MaterialIcons name="flight-takeoff" size={22} color={colors.accent} />
            <View className="flex-row items-center mt-2 gap-x-1">
              <View className="w-10 h-px bg-accent/30" />
              <View className="w-2 h-2 rounded-full bg-accent/50" />
              <View className="w-10 h-px bg-accent/30" />
            </View>
            <Text className="text-secondary text-[10px] mt-1">{trip.airline}</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-secondary text-3xl font-bold">{trip.toCode}</Text>
          </View>
        </View>

        {/* Fecha + hora + countdown */}
        <View className="flex-row gap-x-3">
          <View className="flex-1 bg-surface rounded-xl p-3 border border-bd/10">
            <Text className="text-secondary text-[10px] uppercase tracking-wider mb-1">Fecha de salida</Text>
            <Text className="text-primary font-semibold text-sm">{date}</Text>
          </View>
          <View className="bg-surface rounded-xl p-3 border border-bd/10 items-center justify-center px-4">
            <Text className="text-secondary text-[10px] uppercase tracking-wider mb-1">Hora</Text>
            <Text className="text-primary font-bold text-lg">{time}</Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: days <= 1 && days >= 0 ? 'rgba(245,158,11,0.08)' : 'rgba(13,162,231,0.08)',
            borderColor: days <= 1 && days >= 0 ? 'rgba(245,158,11,0.20)' : 'rgba(13,162,231,0.15)',
          }}
          className="flex-row items-center gap-x-2 mt-3 rounded-xl px-4 py-3 border"
        >
          <MaterialIcons
            name="schedule"
            size={16}
            color={days <= 1 && days >= 0 ? '#f59e0b' : '#0da2e7'}
          />
          <Text
            style={{ color: days <= 1 && days >= 0 ? '#f59e0b' : '#0da2e7' }}
            className="text-sm font-semibold"
          >
            {countdownLabel}
          </Text>
          {days > 1 && (
            <Text className="text-secondary text-xs ml-1 flex-1">
              {'— el agente recibirá un recordatorio 24h antes del vuelo'}
            </Text>
          )}
        </View>
      </View>

      {/* Notas del agente */}
      <View className="mx-5 mt-4 bg-surface-card border border-bd/15 rounded-2xl p-5">
        <Text className="text-secondary text-xs font-medium tracking-widest uppercase mb-3">
          Notas del agente
        </Text>
        {trip.notes ? (
          <View className="flex-row gap-x-3">
            <MaterialIcons name="notes" size={16} color={colors.textSecondary} style={{ marginTop: 2 }} />
            <Text className="text-primary text-sm leading-5 flex-1">{trip.notes}</Text>
          </View>
        ) : (
          <Text className="text-secondary/60 text-sm italic">Sin notas registradas.</Text>
        )}
      </View>

      {/* Estado del Check-in */}
      <View className="mx-5 mt-4 bg-surface-card border border-bd/15 rounded-2xl p-5">
        <Text className="text-secondary text-xs font-medium tracking-widest uppercase mb-4">
          Estado del Check-in
        </Text>

        {/* Indicador de estado */}
        <View
          style={{
            backgroundColor: trip.checkInDone
              ? 'rgba(34,197,94,0.08)'
              : checkInAvailable
              ? 'rgba(13,162,231,0.08)'
              : 'rgba(74,111,165,0.06)',
            borderColor: trip.checkInDone
              ? 'rgba(34,197,94,0.20)'
              : checkInAvailable
              ? 'rgba(13,162,231,0.20)'
              : 'rgba(74,111,165,0.15)',
          }}
          className="flex-row items-center gap-x-3 rounded-xl border px-4 py-3 mb-4"
        >
          <MaterialIcons
            name={trip.checkInDone ? 'task-alt' : checkInAvailable ? 'lock-open' : 'lock'}
            size={20}
            color={trip.checkInDone ? colors.success : checkInAvailable ? colors.accent : colors.textSecondary}
          />
          <View className="flex-1">
            <Text
              style={{ color: trip.checkInDone ? '#22c55e' : checkInAvailable ? '#0da2e7' : '#4a6fa5' }}
              className="font-semibold text-sm"
            >
              {trip.checkInDone
                ? 'Check-in completado'
                : checkInAvailable
                ? 'Check-in disponible'
                : 'Check-in bloqueado'}
            </Text>
            <Text className="text-secondary text-xs mt-0.5">
              {trip.checkInDone && trip.checkInDoneAt
                ? `Realizado el ${new Date(trip.checkInDoneAt).toLocaleDateString('es', { day: '2-digit', month: 'short' })} · ${new Date(trip.checkInDoneAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}`
                : checkInAvailable
                ? 'El check-in está abierto — realízalo en el sitio de la aerolínea'
                : hoursUntil <= 0
                ? 'El vuelo ya ocurrió o el tiempo de check-in cerró'
                : hoursUntil > 48
                ? `Disponible en aprox. ${days} días`
                : `Disponible en aprox. ${Math.round(hoursUntil)}h`}
            </Text>
          </View>
        </View>

        {/* Casilla de check */}
        <TouchableOpacity
          onPress={checkInAvailable && !trip.checkInDone ? handleCheckInDone : undefined}
          activeOpacity={checkInAvailable && !trip.checkInDone ? 0.7 : 1}
          className="flex-row items-center gap-x-3"
        >
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              backgroundColor: trip.checkInDone ? '#22c55e' : 'transparent',
              borderWidth: trip.checkInDone ? 0 : 2,
              borderColor: checkInAvailable && !trip.checkInDone ? '#0da2e7' : '#4a6fa5',
              opacity: !checkInAvailable && !trip.checkInDone ? 0.4 : 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {trip.checkInDone && <MaterialIcons name="check" size={14} color="#fff" />}
          </View>
          <Text
            style={{
              color: trip.checkInDone ? '#22c55e' : checkInAvailable ? '#e2e8f0' : '#4a6fa5',
              opacity: !checkInAvailable && !trip.checkInDone ? 0.5 : 1,
            }}
            className="text-sm font-medium flex-1"
          >
            {trip.checkInDone ? 'Check-in realizado' : 'Marcar check-in como realizado'}
          </Text>
          {saving && <ActivityIndicator size="small" color="#0da2e7" />}
        </TouchableOpacity>
      </View>

      {/* Acciones */}
      <View className="mx-5 mt-4 flex-row gap-x-3">
        <TouchableOpacity
          onPress={hasDeparted ? undefined : () => router.push({ pathname: '/viajes/nuevo-viaje', params: { editId: trip.id } })}
          activeOpacity={hasDeparted ? 1 : 0.75}
          className={`flex-1 flex-row items-center justify-center gap-x-2 rounded-xl py-3.5 ${
            hasDeparted
              ? 'bg-surface-card border border-secondary/30'
              : 'bg-accent/10 border border-bd/25'
          }`}
        >
          <MaterialIcons name="edit" size={16} color={hasDeparted ? '#4a6fa5' : colors.accent} />
          <Text
            style={{ color: hasDeparted ? '#4a6fa5' : colors.accent }}
            className="text-sm font-semibold"
          >
            Editar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => checkInUrl && Linking.openURL(checkInUrl)}
          activeOpacity={0.75}
          className={`flex-1 flex-row items-center justify-center gap-x-2 rounded-xl py-3.5 ${
            trip.checkInDone
              ? 'bg-success/10 border border-success/25'
              : checkInAvailable
              ? 'bg-accent border border-bd'
              : 'bg-surface-card border border-secondary/30'
          }`}
        >
          <MaterialIcons
            name={trip.checkInDone ? 'task-alt' : 'open-in-new'}
            size={16}
            color={trip.checkInDone ? '#22c55e' : checkInAvailable ? '#fff' : '#4a6fa5'}
          />
          <Text
            style={{ color: trip.checkInDone ? '#22c55e' : checkInAvailable ? '#fff' : '#4a6fa5' }}
            className="text-sm font-semibold"
          >
            {trip.checkInDone ? 'Check-in hecho' : `Check-in ${trip.airline}`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contactar Cliente */}
      {trip.clientPhone ? (
        <TouchableOpacity
          onPress={() => setContactModalVisible(true)}
          activeOpacity={0.75}
          className="mx-5 mt-3 flex-row items-center justify-center gap-x-2 bg-[#25D366]/10 border border-[#25D366]/25 rounded-xl py-3.5"
        >
          <MaterialIcons name="perm-contact-calendar" size={16} color="#25D366" />
          <Text style={{ color: '#25D366' }} className="text-sm font-semibold">Contactar al cliente</Text>
        </TouchableOpacity>
      ) : null}

      {/* Prechequeo Migratorio Honduras */}
      <TouchableOpacity
        onPress={() => Linking.openURL('https://sistemas.aduanas.gob.hn/Pech/#/plataforma/otra_gestiones/formularioDJRV')}
        activeOpacity={0.75}
        className="mx-5 mt-3 flex-row items-center justify-center gap-x-2 bg-warning/10 border border-warning/25 rounded-xl py-3.5"
      >
        <MaterialIcons name="assignment" size={16} color="#f59e0b" />
        <Text style={{ color: '#f59e0b' }} className="text-sm font-semibold">
          {'Declaración Jurada / Prechequeo Migratorio'}
        </Text>
        <MaterialIcons name="open-in-new" size={12} color="#f59e0b" />
      </TouchableOpacity>

      {/* Contact Modal */}
      <Modal
        visible={contactModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setContactModalVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-surface-card border border-bd/15 rounded-2xl w-full p-5 shadow-lg">
            <Text className="text-primary text-xl font-bold mb-1">Contactar cliente</Text>
            <Text className="text-secondary text-sm mb-5">
              Elige un método de contacto para {trip.clientName}
            </Text>

            <TouchableOpacity 
              onPress={handleCall}
              activeOpacity={0.7}
              className="flex-row items-center gap-x-3 bg-surface border border-bd/10 p-4 rounded-xl mb-3"
            >
              <MaterialIcons name="phone" size={24} color={colors.accent} />
              <View className="flex-1">
                <Text className="text-primary font-medium text-base">Llamada telefónica</Text>
                <Text className="text-secondary text-xs mt-0.5">{trip.clientPhone}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleWhatsApp}
              activeOpacity={0.7}
              className="flex-row items-center gap-x-3 bg-[#25D366]/10 border border-[#25D366]/20 p-4 rounded-xl mb-3"
            >
              <MaterialIcons name="chat" size={24} color="#25D366" />
              <View className="flex-1">
                <Text style={{ color: '#25D366' }} className="font-medium text-base">WhatsApp</Text>
                <Text className="text-[#25D366]/80 text-xs mt-0.5">{trip.clientPhone}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleCopyPhone}
              activeOpacity={0.7}
              className="flex-row items-center gap-x-3 bg-surface border border-bd/10 p-4 rounded-xl mb-5"
            >
              <MaterialIcons name="content-copy" size={24} color={colors.textSecondary} />
              <View className="flex-1">
                <Text className="text-primary font-medium text-base">Copiar número</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setContactModalVisible(false)}
              activeOpacity={0.7}
              className="w-full py-3.5 bg-surface border border-bd/10 rounded-xl items-center"
            >
              <Text className="text-primary font-semibold text-sm">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
