import { searchTrips, type Trip } from '@/api/trips';
import { FlightCard } from '@/components/viajes/FlightCard';
import { useThemeColors } from '@/hooks/useThemeColors';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BuscarViajeScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const handler = setTimeout(async () => {
      const q = query.trim();
      if (!q) {
        setResults([]);
        setHasSearched(false);
        setLoading(false);
        return;
      }
      setLoading(true);
      setHasSearched(true);
      try {
        const data = await searchTrips(q);
        setResults(data);
      } catch (e) {
        console.error('Error searching trips:', e);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [query]);

  const handleCardPress = (id: string) => {
    router.push(`/(tabs)/viajes/${id}`);
  };

  const renderItem = useCallback(
    ({ item }: { item: Trip }) => (
      <View className="mx-5 mb-4">
        <FlightCard trip={item} onPress={handleCardPress} />
      </View>
    ),
    [],
  );

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      {/* Header con Buscador */}
      <View className="flex-row items-center gap-x-3 px-5 pt-2 pb-4 border-b border-bd/10">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="w-10 h-10 rounded-2xl bg-surface-card border border-bd/20 items-center justify-center"
        >
          <MaterialIcons name="arrow-back" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        
        <View className="flex-1 flex-row items-center bg-input-bg border border-bd/12 rounded-2xl px-4 h-11">
          <MaterialIcons name="search" size={20} color={colors.placeholder} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar por cliente o PNR..."
            placeholderTextColor={colors.placeholder}
            autoFocus
            autoCapitalize="sentences"
            className="flex-1 ml-2 text-primary text-sm"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} className="p-1">
              <MaterialIcons name="close" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Resultados */}
      {loading ? (
        <View className="flex-1 items-center justify-center py-16">
          <ActivityIndicator size="large" color={colors.accent} />
          <Text className="text-secondary text-sm mt-3">Buscando...</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: insets.bottom + 16,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            hasSearched ? (
              <View className="flex-1 items-center px-10 py-16">
                <MaterialIcons name="search-off" size={40} color={colors.textSecondary} />
                <Text className="text-secondary text-base font-semibold mt-3">Sin resultados</Text>
                <Text className="text-secondary/80 text-xs mt-1 text-center">
                  No encontramos viajes registrados para "{query}"
                </Text>
              </View>
            ) : (
              <View className="flex-1 items-center py-16">
                <MaterialIcons name="search" size={40} color={colors.textSecondary} />
                <Text className="text-secondary text-sm mt-3">Ingresa el nombre del cliente o PNR</Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
}
