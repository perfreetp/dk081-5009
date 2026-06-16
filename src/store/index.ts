import { create } from 'zustand';
import type { CarModel, OrderItem, DisputeItem } from '@/types';
import { mockOrders } from '@/data/orders';
import { mockDisputes } from '@/data/disputes';

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
  getOrderById: (orderId: string) => OrderItem | undefined;
  getOrdersByMerchantId: (merchantId: string) => OrderItem[];
  selectedQuoteId: string | null;
  setSelectedQuoteId: (id: string | null) => void;
  disputes: DisputeItem[];
  addDispute: (dispute: DisputeItem) => void;
  updateDispute: (disputeId: string, updates: Partial<DisputeItem>) => void;
  getDisputeById: (disputeId: string) => DisputeItem | undefined;
  getDisputeByOrderId: (orderId: string) => DisputeItem | undefined;
  getDisputesByMerchantId: (merchantId: string) => DisputeItem[];
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
  orders: mockOrders,
  updateOrder: (orderId, updates) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, ...updates } : o)),
    })),
  addOrder: (order) =>
    set((state) => ({
      orders: [order, ...state.orders],
    })),
  getOrderById: (orderId) => {
    const { orders } = get();
    return orders.find((o) => o.id === orderId);
  },
  getOrdersByMerchantId: (merchantId) => {
    const { orders } = get();
    return orders.filter((o) => o.merchantId === merchantId);
  },
  selectedQuoteId: null,
  setSelectedQuoteId: (id) => set({ selectedQuoteId: id }),
  disputes: mockDisputes,
  addDispute: (dispute) =>
    set((state) => ({
      disputes: [dispute, ...state.disputes],
    })),
  updateDispute: (disputeId, updates) =>
    set((state) => ({
      disputes: state.disputes.map((d) => (d.id === disputeId ? { ...d, ...updates } : d)),
    })),
  getDisputeById: (disputeId) => {
    const { disputes } = get();
    return disputes.find((d) => d.id === disputeId);
  },
  getDisputeByOrderId: (orderId) => {
    const { disputes } = get();
    return disputes.find((d) => d.orderId === orderId);
  },
  getDisputesByMerchantId: (merchantId) => {
    const { disputes } = get();
    return disputes.filter((d) => d.merchantId === merchantId);
  },
}));
