import { create } from 'zustand';
import type { CarModel } from '@/types';

interface AppState {
  currentCar: CarModel | null;
  setCurrentCar: (car: CarModel | null) => void;
  searchHistory: string[];
  addSearchHistory: (keyword: string) => void;
  clearSearchHistory: () => void;
  budget: number;
  setBudget: (budget: number) => void;
  isUrgent: boolean;
  setIsUrgent: (urgent: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentCar: null,
  setCurrentCar: (car) => set({ currentCar: car }),
  searchHistory: [],
  addSearchHistory: (keyword) =>
    set((state) => {
      const filtered = state.searchHistory.filter((k) => k !== keyword);
      return { searchHistory: [keyword, ...filtered].slice(0, 10) };
    }),
  clearSearchHistory: () => set({ searchHistory: [] }),
  budget: 0,
  setBudget: (budget) => set({ budget }),
  isUrgent: false,
  setIsUrgent: (urgent) => set({ isUrgent: urgent }),
}));
