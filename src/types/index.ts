export interface CarModel {
  id: string;
  brand: string;
  model: string;
  year: string;
  displacement: string;
  vin?: string;
}

export interface PartItem {
  id: string;
  name: string;
  commonName: string;
  category: string;
  imageUrl: string;
  partTypes: PartTypeItem[];
}

export interface PartTypeItem {
  type: 'used' | 'remanufactured' | 'aftermarket';
  label: string;
  priceRange: string;
  warranty: string;
  description: string;
}

export interface Merchant {
  id: string;
  name: string;
  avatar: string;
  distance: number;
  rating: number;
  reviewCount: number;
  partCount: number;
  isLocal: boolean;
  hasCert: boolean;
  address: string;
  tags: string[];
  recycleSource?: string;
}

export interface QuoteItem {
  id: string;
  merchantId: string;
  merchantName: string;
  merchantAvatar: string;
  partName: string;
  partType: 'used' | 'remanufactured' | 'aftermarket';
  price: number;
  originalPrice?: number;
  warranty: string;
  deliveryDays: number;
  isLocal: boolean;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  message?: string;
}

export interface QuoteSession {
  id: string;
  partName: string;
  commonName: string;
  carModel: string;
  quotes: QuoteItem[];
  unreadCount: number;
  budget?: number;
  isUrgent: boolean;
  status: 'active' | 'closed';
  createdAt: string;
}

export interface OrderItem {
  id: string;
  partName: string;
  partType: 'used' | 'remanufactured' | 'aftermarket';
  merchantName: string;
  price: number;
  deposit: number;
  status: 'pending_pay' | 'pending_ship' | 'pending_receive' | 'completed' | 'disputed';
  createdAt: string;
  installDate?: string;
  isLocal: boolean;
}

export interface HotCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface SearchHistory {
  keyword: string;
  time: string;
}
