import { getTrips, type Trip } from '@/api/trips';
import { FlightCard } from '@/components/viajes/FlightCard';
import { TripsHeader } from '@/components/viajes/TripsHeader';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTripsStore } from '@/store/useTripsStore';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ViajesScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const pageRef = useRef(0);
  const version = useTripsStore((s) => s.version);

  const loadPage = useCallback(async (page: number, append: boolean) => {
    const result = await getTrips(page);
    setTrips((prev) => (append ? [...prev, ...result.trips] : result.trips));
    setHasMore(result.hasMore);
    pageRef.current = page;
  }, []);

  useEffect(() => {
    setLoading(true);
    loadPage(0, false).finally(() => setLoading(false));
  }, [version, loadPage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPage(0, false);
    setRefreshing(false);
  }, [loadPage]);

  const onEndReached = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      await loadPage(pageRef.current + 1, true);
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, hasMore, loadPage]);

  const handleCardPress = (id: string) => {
    router.push(`/(tabs)/viajes/${id}`);
  };

  const pendingCount = trips.filter((t) => !t.checkInDone).length;

  const renderItem = useCallback(
    ({ item }: { item: Trip }) => (
      <View className="mx-5">
        <FlightCard trip={item} onPress={handleCardPress} />
      </View>
    ),
    [],
  );

  const ListHeader = (
    <>
      <TripsHeader onSearchPress={() => router.push('/(tabs)/viajes/buscar')} />
      <View className="mx-5 mt-4 mb-4 flex-row items-center justify-between">
        <Text className="text-primary font-bold text-base">Todos los viajes</Text>
        <View className="flex-row items-center gap-x-2">
          {!loading && pendingCount > 0 && (
            <View className="flex-row items-center gap-x-1.5 bg-warning/10 border border-warning/25 rounded-xl px-3 py-1">
              <MaterialIcons name="notifications-none" size={12} color={colors.warning} />
              <Text className="text-warning text-[10px] font-bold">
                {pendingCount} sin check-in
              </Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/viajes/nuevo-viaje')}
            activeOpacity={0.8}
            className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/30 items-center justify-center"
          >
            <MaterialIcons name="add" size={20} color={colors.accent} />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  const ListEmpty = loading ? (
    <View className="items-center justify-center py-16">
      <ActivityIndicator size="large" color={colors.accent} />
      <Text className="text-secondary text-sm mt-3">Cargando viajes…</Text>
    </View>
  ) : (
    <View className="items-center justify-center py-16">
      <MaterialIcons name="flight-takeoff" size={40} color={colors.textSecondary} />
      <Text className="text-secondary text-sm mt-3">No hay viajes registrados</Text>
    </View>
  );

  const ListFooter = loadingMore ? (
    <View className="items-center py-6">
      <ActivityIndicator size="small" color={colors.accent} />
    </View>
  ) : null;

  return (
    <FlatList
      data={trips}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={ListEmpty}
      ListFooterComponent={ListFooter}
      contentContainerStyle={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 16,
        flexGrow: 1,
      }}
      showsVerticalScrollIndicator={false}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
        />
      }
      className="flex-1 bg-surface"
    />
  );
}
