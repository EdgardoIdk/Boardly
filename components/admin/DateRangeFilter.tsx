import { useThemeColors } from '@/hooks/useThemeColors';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';

export type DateRange = '7d' | 'this_month' | 'custom';

interface DateRangeFilterProps {
  onFilterChange: (startDate?: Date, endDate?: Date) => void;
}

export function DateRangeFilter({ onFilterChange }: DateRangeFilterProps) {
  const colors = useThemeColors();
  const [activeRange, setActiveRange] = useState<DateRange>('this_month');
  
  // Custom range states
  const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);
  const [customStart, setCustomStart] = useState<Date>(new Date());
  const [customEnd, setCustomEnd] = useState<Date>(new Date());

  const handlePresetSelect = (range: '7d' | 'this_month') => {
    setActiveRange(range);
    
    if (range === '7d') {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 7);
      onFilterChange(start, end);
    } else if (range === 'this_month') {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of month
      onFilterChange(start, end);
    }
  };

  const handleCustomChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(null);
    }
    if (selectedDate) {
      if (showPicker === 'start') {
        setCustomStart(selectedDate);
        setActiveRange('custom');
        onFilterChange(selectedDate, customEnd);
      } else if (showPicker === 'end') {
        setCustomEnd(selectedDate);
        setActiveRange('custom');
        onFilterChange(customStart, selectedDate);
      }
    }
  };

  return (
    <View className="px-5 mb-4">
      <View className="flex-row items-center gap-x-2">
        <TouchableOpacity
          onPress={() => handlePresetSelect('this_month')}
          className={`flex-1 py-2 px-3 rounded-xl border ${
            activeRange === 'this_month' ? 'bg-primary border-primary' : 'bg-surface-card border-bd/10'
          }`}
        >
          <Text className={`text-center font-medium text-xs ${activeRange === 'this_month' ? 'text-surface' : 'text-primary'}`}>
            Este Mes
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => handlePresetSelect('7d')}
          className={`flex-reverse py-2 px-3 rounded-xl border ${
            activeRange === '7d' ? 'bg-primary border-primary' : 'bg-surface-card border-bd/10'
          }`}
        >
          <Text className={`text-center font-medium text-xs ${activeRange === '7d' ? 'text-surface' : 'text-primary'}`}>
            Últimos 7 días
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center gap-x-2 mt-2">
         <TouchableOpacity
            onPress={() => setShowPicker('start')}
            className={`flex-1 flex-row items-center justify-center py-2 px-3 rounded-xl border ${
              activeRange === 'custom' ? 'border-primary bg-primary/5' : 'bg-surface-card border-bd/10'
           }`}
          >
            <MaterialIcons name="event" size={14} color={activeRange === 'custom' ? colors.accent : colors.textSecondary} className="mr-1.5" />
            <Text className={`text-xs ${activeRange === 'custom' ? 'text-primary font-medium' : 'text-secondary'}`}>
               {activeRange === 'custom' ? customStart.toLocaleDateString() : 'Desde'}
            </Text>
         </TouchableOpacity>

         <TouchableOpacity
            onPress={() => setShowPicker('end')}
            className={`flex-1 flex-row items-center justify-center py-2 px-3 rounded-xl border ${
              activeRange === 'custom' ? 'border-primary bg-primary/5' : 'bg-surface-card border-bd/10'
           }`}
          >
            <MaterialIcons name="event" size={14} color={activeRange === 'custom' ? colors.accent : colors.textSecondary} className="mr-1.5" />
            <Text className={`text-xs ${activeRange === 'custom' ? 'text-primary font-medium' : 'text-secondary'}`}>
               {activeRange === 'custom' ? customEnd.toLocaleDateString() : 'Hasta'}
            </Text>
         </TouchableOpacity>
      </View>

      {showPicker && (
        <DateTimePicker
          value={showPicker === 'start' ? customStart : customEnd}
          mode="date"
          display="default"
          onChange={handleCustomChange}
        />
      )}
    </View>
  );
}
