import { getAgentMetrics, type AgentDetailedMetrics } from '@/api/admin';
import { DateRangeFilter } from '@/components/admin/DateRangeFilter';
import { useThemeColors } from '@/hooks/useThemeColors';
import { MaterialIcons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AgentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  
  const [data, setData] = useState<AgentDetailedMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Date states for the specific agent's timeline
  const now = new Date();
  const [startDate, setStartDate] = useState<Date>(new Date(now.getFullYear(), now.getMonth(), 1));
  const [endDate, setEndDate] = useState<Date>(new Date(now.getFullYear(), now.getMonth() + 1, 0));

  const load = useCallback(async (start?: Date, end?: Date) => {
    if (!id) return;
    try {
      const res = await getAgentMetrics(id, start || startDate, end || endDate);
      setData(res);
    } catch (e) {
      console.error('Error loading agent metrics:', e);
    }
  }, [id, startDate, endDate]);

  useEffect(() => {
    setLoading(true);
    load(startDate, endDate).finally(() => setLoading(false));
  }, [load, startDate, endDate]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const onFilterChange = (start?: Date, end?: Date) => {
    if (start && end) {
      setStartDate(start);
      setEndDate(end);
    }
  };

  if (loading && !data) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!loading && (!data || !data.profile)) {
    return (
      <View className="flex-1 bg-surface">
        <Stack.Screen options={{ headerShown: false }} />
        <View 
          style={{ paddingTop: insets.top }} 
          className="px-4 pb-4 flex-row items-center border-b border-bd/10 bg-surface"
        >
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="p-2 -ml-2 rounded-full"
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text className="text-primary font-bold text-lg ml-2">Regresar</Text>
        </View>
        <View className="flex-1 items-center justify-center p-6 pb-20">
          <MaterialIcons name="person-off" size={48} color={colors.textTertiary} className="mb-4" />
          <Text className="text-primary text-xl font-bold mb-2">Sin datos disponibles</Text>
          <Text className="text-secondary text-center text-sm">
            Este agente no existe o aún no cuenta con historial de métricas guardado en la base de datos.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header with Back Button */}
      <View 
        style={{ paddingTop: insets.top }} 
        className="px-4 pb-4 flex-row items-center border-b border-bd/10 bg-surface"
      >
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="p-2 -ml-2 rounded-full"
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-primary font-bold text-lg ml-2">Perfil Asesor</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {/* Agent Info Card */}
        {data?.profile && (
          <View className="items-center py-6 px-4">
            <View className="w-16 h-16 rounded-full bg-accent/10 items-center justify-center border border-accent/20 mb-3">
              <Text className="text-accent font-bold text-2xl">
                {data.profile.fullName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text className="text-primary text-xl font-bold">{data.profile.fullName}</Text>
            <Text className="text-secondary text-sm mt-1">{data.profile.email}</Text>
          </View>
        )}

        {/* Date Filter specifically for this agent's stats */}
        <View className="px-1 mt-2 mb-2">
            <DateRangeFilter onFilterChange={onFilterChange} />
        </View>

        {/* Metrics Row */}
        {data?.metrics && (
          <View className="px-5 flex-row gap-x-3 mb-6">
            <View className="flex-1 bg-surface-card border border-bd/10 p-3 rounded-2xl items-center">
               <Text className="text-primary text-xl font-bold">{data.metrics.totalTrips}</Text>
               <Text className="text-secondary text-[10px] text-center uppercase mt-1">Total</Text>
            </View>
             <View className="flex-1 bg-surface-card border border-success/30 bg-success/5 p-3 rounded-2xl items-center">
               <Text className="text-success text-xl font-bold">{data.metrics.checkinsDone}</Text>
               <Text className="text-success/80 text-[10px] text-center uppercase tracking-wide mt-1">Listos</Text>
            </View>
             <View className="flex-1 bg-surface-card border border-red-500/30 bg-red-500/5 p-3 rounded-2xl items-center">
               <Text className="text-red-500 text-xl font-bold">{data.metrics.pendingCheckins}</Text>
               <Text className="text-red-500/80 text-[10px] text-center uppercase tracking-wide mt-1">Pendientes</Text>
            </View>
          </View>
        )}

        <View className="px-6 pb-2">
          <Text className="text-primary text-lg font-bold">Vuelos Activos de este Periodo</Text>
          <Text className="text-secondary text-xs">Vuelos del asesor cuyo check-in sigue pendiente</Text>
        </View>

        <View className="px-5 mt-2 gap-y-3">
          {data?.priorityTrips?.length === 0 ? (
             <Text className="text-secondary text-sm text-center py-8">No hay vuelos pendientes en este rango.</Text>
          ) : (
            data?.priorityTrips?.map(trip => {
              // calc hours left roughly
              const diffMs = new Date(trip.departureAt).getTime() - new Date().getTime();
              const hoursLeft = Math.floor(diffMs / 3600000);
              const isUrgent = hoursLeft > 0 && hoursLeft <= 24;

              return (
                <View key={trip.id} className="bg-surface-card border border-bd/10 rounded-2xl p-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-primary font-semibold text-base">{trip.clientName}</Text>
                    {isUrgent ? (
                      <View className="bg-red-500/10 px-2 py-1 rounded-md border border-red-500/20">
                        <Text className="text-red-500 text-[10px] font-bold uppercase">{hoursLeft}h left</Text>
                      </View>
                    ) : (
                       <Text className="text-tertiary text-xs">{new Date(trip.departureAt).toLocaleDateString()}</Text>
                    )}
                  </View>
                  <View className="flex-row items-center justify-between mt-2">
                    <Text className="text-secondary text-sm">{trip.fromCode} → {trip.toCode}</Text>
                    <Text className="text-secondary text-sm font-medium">{trip.airline}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

      </ScrollView>
    </View>
  );
}
