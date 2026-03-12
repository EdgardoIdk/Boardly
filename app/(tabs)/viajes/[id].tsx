import { getTripById, markCheckInDone, type Trip } from '@/api/trips';
import { NotificationBadge } from '@/components/viajes/StatusBadge';
import { useTripsStore } from '@/store/useTripsStore';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Linking,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// URLs de check-in por aerolínea (fallback cuando el viaje no tiene URL propia)
const AIRLINE_CHECKIN_URLS: Record<string, string> = {
  'iberia':          'https://www.iberia.com/es/check-in/',
  'ita airways':     'https://checkin.ita-airways.com/',
  'alitalia':        'https://checkin.ita-airways.com/',
  'cathay pacific':  'https://www.cathaypacific.com/cx/en_US/manage-booking/check-in.html',
  'british airways': 'https://www.britishairways.com/travel/managebooking/public/en_gb',
  'aeromexico':      'https://checkin.aeromexico.com/',
  'american airlines': 'https://www.aa.com/checkin',
  'delta':           'https://www.delta.com/us/en/check-in/overview',
  'united':          'https://www.united.com/en/us/checkin',
  'lufthansa':       'https://www.lufthansa.com/xx/en/online-check-in',
  'air france':      'https://wwws.airfrance.com/en/online-check-in',
  'klm':             'https://www.klm.com/travel/en_en/prepare_for_travel/on_the_day_of_travel/check_in_online/index.htm',
  'emirates':        'https://www.emirates.com/english/manage-booking/online-check-in/',
  'ryanair':         'https://www.ryanair.com/gb/en/trip/check-in',
  'volaris':         'https://www.volaris.com/en/check-in',
};

function getCheckInUrl(airline: string, customUrl?: string | null): string {
  if (customUrl) return customUrl;
  return AIRLINE_CHECKIN_URLS[airline.toLowerCase()] ?? `https://www.google.com/search?q=${encodeURIComponent(airline + ' online check-in')}`;
}

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
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getTripById(id)
      .then(setTrip)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View
        style={{ paddingTop: insets.top }}
        className="flex-1 bg-[#0a0f1e] items-center justify-center"
      >
        <ActivityIndicator size="large" color="#0da2e7" />
      </View>
    );
  }

  if (!trip) {
    return (
      <View
        style={{ paddingTop: insets.top }}
        className="flex-1 bg-[#0a0f1e] items-center justify-center"
      >
        <MaterialIcons name="flight-takeoff" size={40} color="#4a6fa5" />
        <Text className="text-[#4a6fa5] text-sm mt-3">Viaje no encontrado</Text>
      </View>
    );
  }

  const { date, time } = formatDateTime(trip.departureAt);
  const days = daysUntil(trip.departureAt);
  const hoursUntil = (new Date(trip.departureAt).getTime() - Date.now()) / (1000 * 60 * 60);
  const checkInAvailable = hoursUntil <= 24 && hoursUntil > 0;
  const countdownLabel =
    days < 0  ? 'Ya sali\u00f3' :
    days === 0 ? 'Hoy' :
    days === 1 ? 'Ma\u00f1ana' :
    `En ${days} d\u00edas`;

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
      className="flex-1 bg-[#0a0f1e]"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}
    >
      {/* Botón volver */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="flex-row items-center gap-x-1 px-4 pt-2 pb-1"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MaterialIcons name="arrow-back" size={22} color="#0da2e7" />
        <Text className="text-[#0da2e7] text-sm font-medium">Viajes</Text>
      </TouchableOpacity>

      {/* Header: cliente + badge */}
      <View className="mx-5 mt-3 bg-[#0d1629] border border-[#0da2e7]/15 rounded-2xl p-5">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-[#4a6fa5] text-xs font-medium tracking-widest uppercase">
            Detalle del Viaje
          </Text>
          <NotificationBadge checkInDone={trip.checkInDone} size="md" />
        </View>

        <View className="flex-row items-center gap-x-4">
          <View className="w-14 h-14 rounded-2xl bg-[#0da2e7]/15 border border-[#0da2e7]/25 items-center justify-center">
            <MaterialIcons name="person" size={26} color="#0da2e7" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-xl font-bold">{trip.clientName}</Text>
            <View className="flex-row items-center gap-x-2 mt-1">
              <MaterialIcons name="confirmation-number" size={13} color="#4a6fa5" />
              <Text className="text-[#4a6fa5] text-xs font-mono">{trip.pnr}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Ruta */}
      <View className="mx-5 mt-4 bg-[#0d1629] border border-[#0da2e7]/15 rounded-2xl p-5">
        <Text className="text-[#4a6fa5] text-xs font-medium tracking-widest uppercase mb-4">
          Itinerario
        </Text>

        <View className="flex-row items-center justify-between mb-5">
          <View className="items-center flex-1">
            <Text className="text-white text-3xl font-bold">{trip.fromCode}</Text>
            <Text className="text-[#4a6fa5] text-xs mt-1 text-center">{trip.fromCity}</Text>
          </View>
          <View className="items-center px-3">
            <MaterialIcons name="flight-takeoff" size={22} color="#0da2e7" />
            <View className="flex-row items-center mt-2 gap-x-1">
              <View className="w-10 h-px bg-[#0da2e7]/30" />
              <View className="w-2 h-2 rounded-full bg-[#0da2e7]/50" />
              <View className="w-10 h-px bg-[#0da2e7]/30" />
            </View>
            <Text className="text-[#4a6fa5] text-[10px] mt-1">{trip.airline}</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-[#4a6fa5] text-3xl font-bold">{trip.toCode}</Text>
            <Text className="text-[#4a6fa5] text-xs mt-1 text-center">{trip.toCity}</Text>
          </View>
        </View>

        {/* Fecha + hora + countdown */}
        <View className="flex-row gap-x-3">
          <View className="flex-1 bg-[#0a0f1e] rounded-xl p-3 border border-[#0da2e7]/10">
            <Text className="text-[#4a6fa5] text-[10px] uppercase tracking-wider mb-1">Fecha de salida</Text>
            <Text className="text-white font-semibold text-sm">{date}</Text>
          </View>
          <View className="bg-[#0a0f1e] rounded-xl p-3 border border-[#0da2e7]/10 items-center justify-center px-4">
            <Text className="text-[#4a6fa5] text-[10px] uppercase tracking-wider mb-1">Hora</Text>
            <Text className="text-white font-bold text-lg">{time}</Text>
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
            <Text className="text-[#4a6fa5] text-xs ml-1">{'— el agente recibir\u00e1 un recordatorio 24h antes del vuelo'}</Text>
          )}
        </View>
      </View>

      {/* Notas del agente */}
      <View className="mx-5 mt-4 bg-[#0d1629] border border-[#0da2e7]/15 rounded-2xl p-5">
        <Text className="text-[#4a6fa5] text-xs font-medium tracking-widest uppercase mb-3">
          Notas del agente
        </Text>
        {trip.notes ? (
          <View className="flex-row gap-x-3">
            <MaterialIcons name="notes" size={16} color="#4a6fa5" style={{ marginTop: 2 }} />
            <Text className="text-white text-sm leading-5 flex-1">{trip.notes}</Text>
          </View>
        ) : (
          <Text className="text-[#4a6fa5]/60 text-sm italic">Sin notas registradas.</Text>
        )}
      </View>

      {/* Estado del Check-in */}
      <View className="mx-5 mt-4 bg-[#0d1629] border border-[#0da2e7]/15 rounded-2xl p-5">
        <Text className="text-[#4a6fa5] text-xs font-medium tracking-widest uppercase mb-4">
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
            color={trip.checkInDone ? '#22c55e' : checkInAvailable ? '#0da2e7' : '#4a6fa5'}
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
            <Text className="text-[#4a6fa5] text-xs mt-0.5">
              {trip.checkInDone && trip.checkInDoneAt
                ? `Realizado el ${new Date(trip.checkInDoneAt).toLocaleDateString('es', { day: '2-digit', month: 'short' })} · ${new Date(trip.checkInDoneAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}`
                : checkInAvailable
                ? 'El check-in est\u00e1 abierto \u2014 real\u00edzalo en el sitio de la aerol\u00ednea'
                : hoursUntil > 48
                ? `Disponible en aprox. ${days} d\u00edas`
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
          activeOpacity={0.75}
          className="flex-1 flex-row items-center justify-center gap-x-2 bg-[#0da2e7]/10 border border-[#0da2e7]/25 rounded-xl py-3.5"
        >
          <MaterialIcons name="edit" size={16} color="#0da2e7" />
          <Text className="text-[#0da2e7] text-sm font-semibold">Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Linking.openURL(getCheckInUrl(trip.airline, trip.airlineCheckInUrl))}
          activeOpacity={0.75}
          className={`flex-1 flex-row items-center justify-center gap-x-2 rounded-xl py-3.5 ${
            trip.checkInDone
              ? 'bg-[#22c55e]/10 border border-[#22c55e]/25'
              : checkInAvailable
              ? 'bg-[#0da2e7] border border-[#0da2e7]'
              : 'bg-[#0d1629] border border-[#4a6fa5]/30'
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
    </ScrollView>
  );
}

