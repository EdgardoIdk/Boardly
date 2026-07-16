import { useThemeStore } from '@/store/useThemeStore';

export function useColorScheme() {
  return useThemeStore((s) => s.theme);
}
