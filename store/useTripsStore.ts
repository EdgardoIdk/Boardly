import { create } from 'zustand';

interface TripsState {
  version: number;
  bump: () => void;
}

export const useTripsStore = create<TripsState>((set) => ({
  version: 0,
  bump: () => set((s) => ({ version: s.version + 1 })),
}));
