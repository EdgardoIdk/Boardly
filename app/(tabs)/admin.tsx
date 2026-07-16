import { getAdminMetrics, getMissedCheckins, getTripsForExport, type AdminMetrics, type MissedCheckin } from '@/api/admin';
import { DateRangeFilter } from '@/components/admin/DateRangeFilter';
import { useThemeColors } from '@/hooks/useThemeColors';
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Date states
  const now = new Date();
  const [startDate, setStartDate] = useState<Date>(new Date(now.getFullYear(), now.getMonth(), 1));
  const [endDate, setEndDate] = useState<Date>(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  
  const [missedStartDate, setMissedStartDate] = useState<Date>(new Date(now.getFullYear(), now.getMonth(), 1));
  const [missedEndDate, setMissedEndDate] = useState<Date>(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  const [missedCheckins, setMissedCheckins] = useState<MissedCheckin[]>([]);

  const load = useCallback(async (start?: Date, end?: Date) => {
    try {
      const data = await getAdminMetrics(start || startDate, end || endDate);
      setMetrics(data);
    } catch (e) {
      console.error('Error loading admin metrics:', e);
    }
  }, [startDate, endDate]);

  const loadMissed = useCallback(async (start?: Date, end?: Date) => {
    try {
      const data = await getMissedCheckins(start || missedStartDate, end || missedEndDate);
      setMissedCheckins(data);
    } catch (e) {
      console.error('Error loading missed checkins:', e);
    }
  }, [missedStartDate, missedEndDate]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      load(startDate, endDate),
      loadMissed(missedStartDate, missedEndDate)
    ]).finally(() => setLoading(false));
  }, [startDate, endDate, load, loadMissed, missedStartDate, missedEndDate]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([load(), loadMissed()]);
    setRefreshing(false);
  }, [load, loadMissed]);

  const onFilterChange = (start?: Date, end?: Date) => {
    if (start && end) {
      setStartDate(start);
      setEndDate(end);
    }
  };

  const onMissedFilterChange = (start?: Date, end?: Date) => {
    if (start && end) {
      setMissedStartDate(start);
      setMissedEndDate(end);
    }
  };

  const handleExport = async () => {
    try {
      const data = await getTripsForExport(startDate, endDate);
      if (!data || data.length === 0) {
        alert('No hay datos para exportar en este rango de fechas.');
        return;
      }

      try {
        // Preparamos los datos estructurados para Excel
        const excelData = data.map(t => ({
          ID: t.id,
          Cliente: t.clientName,
          PNR: t.pnr,
          Aerolinea: t.airline,
          Desde: t.fromCode,
          Hacia: t.toCode,
          'F. Despegue': t.departureAt,
          'Check-in Listo': t.checkInDone ? 'Si' : 'No',
          'F. Creacion': t.createdAt,
          Agente: t.agentName
        }));

        // 1. Creamos el libro (workbook) y la hoja (worksheet)
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Viajes");

        // 2. Generamos el archivo subyacente en formato Base64 para bypass de codificación nativa
        const wbout = XLSX.write(wb, { type: 'base64', bookType: "xlsx" });

        // 3. Escribimos al sistema local
        const filename = `Reporte_Boardly_${startDate.toISOString().split('T')[0]}.xlsx`;
        const fileUri = FileSystem.documentDirectory + filename;
        
        await FileSystem.writeAsStringAsync(fileUri, wbout, {
          encoding: 'base64' as any
        });

        // 4. Disparamos la acción de Compartir a Excel/Directorios
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            dialogTitle: 'Exportar Reporte Boardly',
            UTI: 'com.microsoft.excel.xlsx' // Requisito estricto para iOS
          });
        } else {
          Alert.alert('Error', 'El uso compartido no está disponible en este dispositivo.');
        }
      } catch (err: any) {
        console.error('Error nativo al exportar Excel:', err);
        Alert.alert('Error', 'Fallo general al procesar la exportación del paquete de datos.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudieron exportar los datos.');
    }
  };

  if (loading && !metrics) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerStyle={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 100,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
        />
      }
    >
      <View className="px-6 pt-4 pb-4">
        <Text className="text-secondary text-xs font-medium tracking-wide uppercase">
          Workspace
        </Text>
        <View className="flex-row items-center justify-between mt-0.5">
          <Text className="text-primary text-2xl font-bold">Admin Panel</Text>
          <TouchableOpacity 
            onPress={handleExport}
            activeOpacity={0.7}
            className="flex-row items-center bg-accent/10 hover:bg-accent/20 px-3 py-1.5 rounded-full border border-accent/20"
          >
            <MaterialIcons name="file-download" size={16} color={colors.accent} />
            <Text className="text-accent text-[11px] font-bold ml-1.5 uppercase tracking-wide">Descargar CSV</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-secondary text-xs mt-2">
          Las métricas se calculan basándose en la fecha en que se registraron los viajes en la red (ventas).
        </Text>
      </View>

      <DateRangeFilter onFilterChange={onFilterChange} />

      {/* Success Rate Widget */}
      <View className="px-5 mb-4">
        <View className="bg-surface-card border border-bd/10 p-5 rounded-3xl flex-row items-center justify-between shadow-sm">
          <View>
             <Text className="text-secondary tracking-widest text-[10px] uppercase font-bold mb-1">Tasa de Éxito Global</Text>
             <Text className="text-primary text-4xl font-black">{metrics?.general.successRate || 0}%</Text>
          </View>
          <View className="w-14 h-14 rounded-full bg-success/10 items-center justify-center border border-success/20">
             <MaterialIcons name="verified" size={28} color={colors.success} />
          </View>
        </View>
      </View>

      {/* General Metrics Row */}
      <View className="px-5 flex-row gap-x-3 mb-6">
        <View className="flex-1 bg-surface-card border border-bd/10 p-4 rounded-2xl items-center">
           <MaterialIcons name="flight-takeoff" size={24} color={colors.textPrimary} className="mb-2 opacity-80" />
          <Text className="text-primary text-xl font-bold">{metrics?.general.totalTrips}</Text>
          <Text className="text-secondary text-[9px] text-center uppercase tracking-wide mt-1">
            Nuevos Viajes
          </Text>
        </View>
        <View className="flex-1 bg-surface-card border border-bd/10 p-4 rounded-2xl items-center">
           <MaterialIcons name="fact-check" size={24} color={colors.success} className="mb-2 opacity-80" />
          <Text className="text-primary text-xl font-bold">{metrics?.general.checkinsDone}</Text>
          <Text className="text-secondary text-[9px] text-center uppercase tracking-wide mt-1">
            Check-ins Listos
          </Text>
        </View>
        <View className="flex-1 bg-surface-card border border-bd/10 p-4 rounded-2xl items-center">
          <MaterialIcons name="group" size={24} color="#f59e0b" className="mb-2 opacity-80" />
          <Text className="text-primary text-xl font-bold">{metrics?.general.totalAgents}</Text>
          <Text className="text-secondary text-[9px] text-center uppercase tracking-wide mt-1">
            Agentes Registrados
          </Text>
        </View>
      </View>

      {/* Global Radar */}
      <View className="px-6 pb-2">
        <Text className="text-primary text-lg font-bold">Radar Crítico Global</Text>
        <Text className="text-secondary text-xs">Próximos vuelos de la agencia en riesgo inminente</Text>
      </View>

      <View className="px-5 mt-2 gap-y-3 mb-8">
        {!metrics?.globalUrgentTrips || metrics?.globalUrgentTrips.length === 0 ? (
           <View className="bg-success/10 border border-success/20 p-4 rounded-2xl flex-row items-center">
             <MaterialIcons name="check-circle" size={20} color={colors.success} className="mr-3" />
             <Text className="text-success font-medium flex-1">Sin vuelos críticos pendientes.</Text>
           </View>
        ) : (
          metrics?.globalUrgentTrips.map(trip => {
             const diffMs = new Date(trip.departureAt).getTime() - new Date().getTime();
             const hoursLeft = Math.floor(diffMs / 3600000);
             const isVeryUrgent = hoursLeft <= 24;

             return (
               <View key={trip.id} className="bg-surface-card border border-bd/10 rounded-2xl p-4">
                 <View className="flex-row items-center justify-between mb-2">
                   <View className="flex-row items-center">
                     <View className={`w-2 h-2 rounded-full ${isVeryUrgent ? 'bg-red-500' : 'bg-orange-500'} mr-2`} />
                     <Text className="text-primary font-bold">{trip.clientName}</Text>
                   </View>
                   {hoursLeft > 0 ? (
                     <View className={`${isVeryUrgent ? 'bg-red-500/10 border-red-500/20' : 'bg-orange-500/10 border-orange-500/20'} px-2 py-1 rounded-md border`}>
                       <Text className={`${isVeryUrgent ? 'text-red-500' : 'text-orange-500'} text-[10px] font-bold uppercase`}>{hoursLeft}h left</Text>
                     </View>
                   ) : (
                     <Text className="text-red-500 text-xs font-bold uppercase">Ya partió</Text>
                   )}
                 </View>
                 <View className="flex-row justify-between items-center">
                   <Text className="text-secondary text-xs">{trip.fromCode} → {trip.toCode} • {trip.airline}</Text>
                   <View className="flex-row items-center">
                     <MaterialIcons name="person" size={12} color={colors.textTertiary} className="mr-1" />
                     <Text className="text-tertiary text-[10px] font-medium">{trip.agentName}</Text>
                   </View>
                 </View>
               </View>
             );
          })
        )}
      </View>

      {/* Missed Checkins */}
      <View className="px-6 pb-2">
        <Text className="text-red-500 text-lg font-bold">Check-ins Perdidos</Text>
        <Text className="text-secondary text-xs mt-1">
          Busca vuelos que ya partieron y no fueron gestionados a tiempo. Basado en fecha de despegue.
        </Text>
      </View>

      <DateRangeFilter onFilterChange={onMissedFilterChange} />

      <View className="px-5 mt-2 gap-y-3 mb-8">
        {missedCheckins.length === 0 ? (
           <View className="bg-success/10 border border-success/20 p-4 rounded-2xl flex-row items-center">
             <MaterialIcons name="done-all" size={20} color={colors.success} className="mr-3" />
             <Text className="text-success font-medium flex-1">Impecable. Cero check-ins perdidos.</Text>
           </View>
        ) : (
          missedCheckins.map(trip => (
             <View key={trip.id} className="bg-surface-card border border-red-500/30 rounded-2xl p-4">
               <View className="flex-row items-center justify-between mb-2">
                 <View className="flex-row items-center">
                   <View className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                   <Text className="text-primary font-bold">{trip.clientName}</Text>
                 </View>
                 <View className="bg-red-500/10 border-red-500/20 px-2 py-1 rounded-md border">
                   <Text className="text-red-500 text-[10px] font-bold uppercase">Fallido</Text>
                 </View>
               </View>
               <View className="flex-row justify-between items-center mt-1">
                 <Text className="text-secondary text-xs">{trip.fromCode} → {trip.toCode} • {trip.airline}</Text>
                 <View className="flex-row items-center">
                   <MaterialIcons name="person" size={12} color={colors.textTertiary} className="mr-1" />
                   <Text className="text-tertiary text-[10px] font-medium">{trip.agentName}</Text>
                 </View>
               </View>
             </View>
          ))
        )}
      </View>

      {/* Agents Performance */}
      <View className="px-6 pb-2">
        <Text className="text-primary text-lg font-bold">Rendimiento por Agente</Text>
      </View>

      <View className="px-5 mt-2 gap-y-3 mb-8">
        {metrics?.agents.length === 0 ? (
           <Text className="text-secondary text-sm text-center py-4">No hay agentes con racha en esta fecha.</Text>
        ) : (
          metrics?.agents.map(agent => (
            <TouchableOpacity 
               key={agent.id} 
               activeOpacity={0.7}
               onPress={() => router.push(`/admin/agent/${agent.id}` as any)}
               className="bg-surface-card border border-bd/10 rounded-2xl p-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1 pr-4">
                 <View className="w-10 h-10 rounded-full bg-accent/10 items-center justify-center mr-3 border border-accent/20">
                    <Text className="text-accent font-bold text-sm">
                      {agent.fullName.charAt(0).toUpperCase()}
                    </Text>
                 </View>
                 <View>
                    <View className="flex-row items-center gap-x-2">
                       <Text className="text-primary font-semibold text-sm">{agent.fullName}</Text>
                       {agent.role === 'admin' && (
                         <View className="bg-primary/10 px-1.5 py-0.5 rounded-sm">
                           <Text className="text-primary text-[9px] uppercase font-bold">Admin</Text>
                         </View>
                       )}
                    </View>
                    <Text className="text-secondary text-xs">{agent.email}</Text>
                 </View>
              </View>
              
              <View className="items-end bg-surface border border-bd/10 rounded-lg px-2 py-1 flex-row gap-x-3">
                <View className="items-center">
                  <Text className="text-primary font-bold text-sm">{agent.totalTrips}</Text>
                  <Text className="text-secondary text-[9px] uppercase tracking-wide">Viajes</Text>
                </View>
                <View className="items-center">
                  <Text className="text-success font-bold text-sm">{agent.checkinsDone}</Text>
                  <Text className="text-secondary text-[9px] uppercase tracking-wide">Listo</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
      
      {/* Top Airlines */}
      <View className="px-6 pb-2">
        <Text className="text-primary text-lg font-bold">Top Aerolíneas</Text>
      </View>
      <View className="px-5 mt-2 mb-6">
         <View className="bg-surface-card border border-bd/10 rounded-2xl p-5 flex-row justify-around">
           {!metrics?.topAirlines || metrics?.topAirlines.length === 0 ? (
             <Text className="text-secondary text-sm my-2">Sin aerolíneas registradas en el periodo.</Text>
           ) : (
             metrics?.topAirlines.map((al, idx) => (
                <View key={idx} className="items-center">
                   <View className="w-12 h-12 bg-primary/5 rounded-full items-center justify-center mb-2">
                      <MaterialIcons name="airlines" size={24} color={colors.textPrimary} />
                   </View>
                   <Text className="text-primary font-semibold text-xs text-center">{al.name}</Text>
                   <Text className="text-secondary text-[10px] mt-0.5">{al.count} vuelos</Text>
                </View>
             ))
           )}
         </View>
      </View>
      
    </ScrollView>
  );
}
