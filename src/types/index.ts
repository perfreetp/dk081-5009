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
  phone: string;
  licenseNo: string;
  licenseExpiry: string;
  businessHours: string;
  tags: string[];
  recycleSource?: string;
  certDescription?: string;
  deliveryMethods: ('self_pickup' | 'local_delivery' | 'national_shipping')[];
  parts?: MerchantPart[];
}

export interface MerchantPart {
  id: string;
  name: string;
  commonName: string;
  partType: 'used' | 'remanufactured' | 'aftermarket';
  price: number;
  warranty: string;
  imageUrl: string;
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

export interface LogisticsNode {
  status: string;
  time: string;
  description: string;
}

export interface OrderItem {
  id: string;
  partName: string;
  partType: 'used' | 'remanufactured' | 'aftermarket';
  merchantId: string;
  merchantName: string;
  merchantAvatar?: string;
  price: number;
  deposit: number;
  status: 'pending_pay' | 'pending_confirm' | 'pending_ship' | 'pending_receive' | 'pending_install' | 'completed' | 'dispute';
  createdAt: string;
  installDate?: string;
  payAt?: string;
  payMethod?: string;
  confirmAt?: string;
  shipAt?: string;
  trackingNo?: string;
  logisticsCompany?: string;
  logisticsNodes?: LogisticsNode[];
  receiveAt?: string;
  completeAt?: string;
  disputeId?: string;
  quoteId?: string;
  sessionId?: string;
  isLocal: boolean;
}

export interface DisputeItem {
  id: string;
  orderId: string;
  merchantId?: string;
  questionType: 'mismatch' | 'quality' | 'shipping' | 'other';
  description: string;
  images: string[];
  status: 'pending' | 'reviewing' | 'processing' | 'resolved' | 'rejected';
  createdAt: string;
  progressNotes?: DisputeProgressNote[];
  result?: string;
}

export interface DisputeProgressNote {
  time: string;
  operator: string;
  content: string;
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
