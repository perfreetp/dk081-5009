import { create } from 'zustand';
import type { CarModel, OrderItem } from '@/types';

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
  identifiedPart: { name: string; category: string } | null;
  setIdentifiedPart: (part: { name: string; category: string } | null) => void;
  orders: OrderItem[];
  updateOrder: (orderId: string, updates: Partial<OrderItem>) => void;
  addOrder: (order: OrderItem) => void;
  selectedQuoteId: string | null;
  setSelectedQuoteId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
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
  identifiedPart: null,
  setIdentifiedPart: (part) => set({ identifiedPart: part }),
  orders: [],
  updateOrder: (orderId, updates) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, ...updates } : o)),
    })),
  addOrder: (order) =>
    set((state) => ({
      orders: [order, ...state.orders],
    })),
  selectedQuoteId: null,
  setSelectedQuoteId: (id) => set({ selectedQuoteId: id }),
}));
