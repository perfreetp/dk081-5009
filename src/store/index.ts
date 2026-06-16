import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Taro from '@tarojs/taro';
import type { CarModel, OrderItem, DisputeItem, QuoteSession, QuoteItem, LogisticsNode } from '@/types';
import { mockOrders } from '@/data/orders';
import { mockDisputes } from '@/data/disputes';
import { mockQuoteSessions } from '@/data/quotes';
import { mockMerchants } from '@/data/merchants';
import { mockParts } from '@/data/parts';

const taroStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const res = await Taro.getStorage({ key: name });
      return res.data;
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await Taro.setStorage({ key: name, data: value });
    } catch {
      // ignore
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await Taro.removeStorage({ key: name });
    } catch {
      // ignore
    }
  },
};

const getRandomLogisticsNodes = (trackingNo: string): LogisticsNode[] => {
  const now = new Date();
  const fmt = (d: Date) => d.toLocaleString('zh-CN');
  const t1 = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const t2 = new Date(now.getTime() - 26 * 60 * 60 * 1000);
  const t3 = new Date(now.getTime() - 50 * 60 * 60 * 1000);
  const t4 = new Date(now.getTime() - 72 * 60 * 60 * 1000);
  return [
    { status: '已到达', time: fmt(t1), description: `快件已到达【${['北京', '上海', '广州', '深圳', '杭州'][Math.floor(Math.random() * 5)]}转运中心】` },
    { status: '运输中', time: fmt(t2), description: '快件正在运输中，下一站：当地配送站' },
    { status: '已发出', time: fmt(t3), description: `【商家仓库】已揽收，快递单号：${trackingNo}` },
    { status: '已下单', time: fmt(t4), description: '商家已发货，等待物流公司揽收' },
  ];
};

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
  addOrder: (order: OrderItem) => void;
  updateOrder: (orderId: string, updates: Partial<OrderItem>) => void;
  getOrderById: (orderId: string) => OrderItem | undefined;
  getOrdersByMerchantId: (merchantId: string) => OrderItem[];

  confirmOrderByMerchant: (orderId: string) => boolean;
  shipOrder: (orderId: string) => boolean;
  receiveOrder: (orderId: string) => boolean;
  scheduleInstallForOrder: (orderId: string, date: string) => boolean;
  completeOrder: (orderId: string) => boolean;

  quoteSessions: QuoteSession[];
  addQuoteSession: (session: QuoteSession) => void;
  getQuoteSessionById: (sessionId: string) => QuoteSession | undefined;
  getQuoteSessionsByMerchantId: (merchantId: string) => QuoteSession[];
  addQuoteToSession: (sessionId: string, quote: QuoteItem) => void;

  selectedQuoteId: string | null;
  setSelectedQuoteId: (id: string | null) => void;

  disputes: DisputeItem[];
  addDispute: (dispute: DisputeItem) => void;
  updateDispute: (disputeId: string, updates: Partial<DisputeItem>) => void;
  getDisputeById: (disputeId: string) => DisputeItem | undefined;
  getDisputeByOrderId: (orderId: string) => DisputeItem | undefined;
  getDisputesByMerchantId: (merchantId: string) => DisputeItem[];

  resetAllData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
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
      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),
      updateOrder: (orderId, updates) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === orderId ? { ...o, ...updates } : o)),
        })),
      getOrderById: (orderId) => {
        const { orders } = get();
        return orders.find((o) => o.id === orderId);
      },
      getOrdersByMerchantId: (merchantId) => {
        const { orders } = get();
        return orders.filter((o) => o.merchantId === merchantId);
      },

      confirmOrderByMerchant: (orderId) => {
        const order = get().getOrderById(orderId);
        if (!order || order.status !== 'pending_pay' && order.status !== 'pending_confirm') {
          return false;
        }
        get().updateOrder(orderId, {
          status: 'pending_confirm',
          confirmAt: new Date().toLocaleString('zh-CN'),
        });
        return true;
      },
      shipOrder: (orderId) => {
        const order = get().getOrderById(orderId);
        if (!order || (order.status !== 'pending_confirm' && order.status !== 'pending_ship')) {
          return false;
        }
        const companies = ['顺丰速运', '中通快递', '圆通速递', '德邦物流'];
        const logisticsCompany = companies[Math.floor(Math.random() * companies.length)];
        const trackingNo = `SF${Date.now()}`.slice(0, 15);
        const logisticsNodes = getRandomLogisticsNodes(trackingNo);
        get().updateOrder(orderId, {
          status: 'pending_receive',
          shipAt: new Date().toLocaleString('zh-CN'),
          trackingNo,
          logisticsCompany,
          logisticsNodes,
        });
        return true;
      },
      receiveOrder: (orderId) => {
        const order = get().getOrderById(orderId);
        if (!order || order.status !== 'pending_receive') {
          return false;
        }
        get().updateOrder(orderId, {
          status: 'pending_install',
          receiveAt: new Date().toLocaleString('zh-CN'),
        });
        return true;
      },
      scheduleInstallForOrder: (orderId, date) => {
        const order = get().getOrderById(orderId);
        if (!order || (order.status !== 'pending_install' && order.status !== 'pending_receive')) {
          return false;
        }
        get().updateOrder(orderId, {
          installDate: date,
        });
        return true;
      },
      completeOrder: (orderId) => {
        const order = get().getOrderById(orderId);
        if (!order || order.status !== 'pending_install') {
          return false;
        }
        get().updateOrder(orderId, {
          status: 'completed',
          completeAt: new Date().toLocaleString('zh-CN'),
        });
        return true;
      },

      quoteSessions: mockQuoteSessions,
      addQuoteSession: (session) =>
        set((state) => ({
          quoteSessions: [session, ...state.quoteSessions],
        })),
      getQuoteSessionById: (sessionId) => {
        const { quoteSessions } = get();
        return quoteSessions.find((s) => s.id === sessionId);
      },
      getQuoteSessionsByMerchantId: (merchantId) => {
        const { quoteSessions } = get();
        return quoteSessions.filter((s) =>
          s.quotes.some((q) => q.merchantId === merchantId)
        );
      },
      addQuoteToSession: (sessionId, quote) =>
        set((state) => ({
          quoteSessions: state.quoteSessions.map((s) =>
            s.id === sessionId
              ? { ...s, quotes: [...s.quotes, quote], unreadCount: s.unreadCount + 1 }
              : s
          ),
        })),

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

      resetAllData: () => {
        set({
          orders: mockOrders,
          disputes: mockDisputes,
          quoteSessions: mockQuoteSessions,
        });
      },
    }),
    {
      name: 'auto-parts-storage',
      storage: createJSONStorage(() => taroStorage),
      partialize: (state) => ({
        currentCar: state.currentCar,
        searchHistory: state.searchHistory,
        budget: state.budget,
        isUrgent: state.isUrgent,
        identifiedPart: state.identifiedPart,
        orders: state.orders,
        quoteSessions: state.quoteSessions,
        selectedQuoteId: state.selectedQuoteId,
        disputes: state.disputes,
      }),
    }
  )
);

export { mockMerchants, mockParts };
