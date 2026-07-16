import { getRecentActivity, type ActivityItem } from '@/api/activity';
import { useThemeColors } from '@/hooks/useThemeColors';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days}d`;
}

function sectionTitle(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(date, today)) return 'Hoy';
  if (isSameDay(date, yesterday)) return 'Ayer';
  return date.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
}

function groupByDay(items: ActivityItem[]): { title: string; data: ActivityItem[] }[] {
  const groups: Record<string, ActivityItem[]> = {};
  const order: string[] = [];

  for (const item of items) {
    const key = sectionTitle(item.createdAt);
    if (!groups[key]) {
      groups[key] = [];
      order.push(key);
    }
    groups[key].push(item);
  }

  return order.map((title) => ({ title, data: groups[title] }));
}

function hoursBadgeColor(hours: number | null) {
  if (hours === 4) return { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#ef4444' };
  if (hours === 8) return { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#f59e0b' };
  return { bg: 'rgba(13,162,231,0.12)', border: 'rgba(13,162,231,0.3)', text: '#0da2e7' };
}

function ActivityCard({ item }: { item: ActivityItem }) {
  const colors = hoursBadgeColor(item.hoursBefore);
  const time = formatRelativeTime(item.createdAt);

  return (
    <TouchableOpacity
      activeOpacity={item.tripId ? 0.7 : 1}
      onPress={() => item.tripId && router.push(`/(tabs)/viajes/${item.tripId}`)}
      className="mx-5 mb-3"
    >
      <View className="bg-surface-card border border-bd/10 rounded-2xl px-4 py-3.5">
        <View className="flex-row items-start gap-x-3">
          <View
            style={{ backgroundColor: colors.bg, borderColor: colors.border, borderWidth: 1 }}
            className="w-9 h-9 rounded-xl items-center justify-center mt-0.5"
          >
            <MaterialIcons name="notifications" size={18} color={colors.text} />
          </View>

          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-primary font-semibold text-sm flex-1" numberOfLines={1}>
                {item.title}
              </Text>
              <Text className="text-secondary text-[10px] ml-2">{time}</Text>
            </View>
            <Text className="text-tertiary text-xs" numberOfLines={2}>
              {item.body}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ActividadScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getRecentActivity();
      setItems(data);
    } catch (e) {
      console.error('Error loading activity:', e);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const sections = groupByDay(items);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ActivityCard item={item} />}
      renderSectionHeader={({ section }) => (
        <View className="px-5 pt-4 pb-2">
          <Text className="text-secondary text-xs font-semibold uppercase tracking-wider">
            {section.title}
          </Text>
        </View>
      )}
      ListHeaderComponent={
        <View className="px-6 pt-4 pb-2">
          <Text className="text-secondary text-xs font-medium tracking-wide uppercase">
            Historial
          </Text>
          <Text className="text-primary text-2xl font-bold mt-0.5">Actividad</Text>
          <Text className="text-secondary text-xs mt-1">
            {'Últimos 3 días'}
          </Text>
        </View>
      }
      ListEmptyComponent={
        loading ? (
          <View className="items-center justify-center py-16">
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : (
          <View className="flex-1 items-center justify-center py-16">
            <MaterialIcons name="notifications-off" size={40} color={colors.textSecondary} />
            <Text className="text-secondary text-sm mt-3">
              Sin actividad reciente
            </Text>
            <Text className="text-secondary/60 text-xs mt-1">
              {'Las notificaciones de check-in aparecerán aquí'}
            </Text>
          </View>
        )
      }
      contentContainerStyle={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 16,
        flexGrow: 1,
      }}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={false}
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
