import { useThemeStore } from '@/store/useThemeStore';

const COLORS = {
  light: {
    surface: '#f9fafb',
    surfaceCard: '#ffffff',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    textTertiary: '#94a3b8',
    accent: '#0da2e7',
    border: '#cbd5e1',
    inputBg: '#f1f5f9',
    placeholder: '#94a3b8',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
  },
  dark: {
    surface: '#0a0f1e',
    surfaceCard: '#0d1629',
    textPrimary: '#ffffff',
    textSecondary: '#4a6fa5',
    textTertiary: '#8ba3c4',
    accent: '#0da2e7',
    border: '#0da2e7',
    inputBg: '#0a0f1e',
    placeholder: '#2d4a6e',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
  },
};

export type ThemeColors = typeof COLORS.light;

export function useThemeColors(): ThemeColors {
  const theme = useThemeStore((s) => s.theme);
  return COLORS[theme];
}
