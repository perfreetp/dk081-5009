import type { CarModel, HotCategory, PartItem } from '@/types';

export const mockCarModels: CarModel[] = [
  { id: '1', brand: '大众', model: '朗逸', year: '2019', displacement: '1.5L', vin: 'LSVNV2182N2' },
  { id: '2', brand: '丰田', model: '卡罗拉', year: '2020', displacement: '1.2T' },
  { id: '3', brand: '本田', model: '思域', year: '2021', displacement: '1.5T' },
  { id: '4', brand: '日产', model: '轩逸', year: '2020', displacement: '1.6L' },
  { id: '5', brand: '别克', model: '英朗', year: '2018', displacement: '1.4T' },
  { id: '6', brand: '长安', model: 'CS75', year: '2022', displacement: '1.5T' },
  { id: '7', brand: '哈弗', model: 'H6', year: '2021', displacement: '1.5T' },
  { id: '8', brand: '宝马', model: '3系', year: '2019', displacement: '2.0T' },
  { id: '9', brand: '奔驰', model: 'C级', year: '2020', displacement: '1.5T' },
  { id: '10', brand: '奥迪', model: 'A4L', year: '2019', displacement: '2.0T' },
];

export const mockHotCategories: HotCategory[] = [
  { id: '1', name: '发动机总成', icon: '⚙️', count: 1280 },
  { id: '2', name: '变速箱', icon: '🔧', count: 960 },
  { id: '3', name: '方向机', icon: '🎯', count: 750 },
  { id: '4', name: '发电机', icon: '⚡', count: 620 },
  { id: '5', name: '空调压缩机', icon: '❄️', count: 580 },
  { id: '6', name: '大灯总成', icon: '💡', count: 890 },
  { id: '7', name: '车门', icon: '🚪', count: 450 },
  { id: '8', name: '保险杠', icon: '🛡️', count: 720 },
  { id: '9', name: '减震器', icon: '🔩', count: 660 },
  { id: '10', name: '起动机', icon: '🔑', count: 530 },
  { id: '11', name: '散热器', icon: '🌡️', count: 410 },
  { id: '12', name: '天窗总成', icon: '🪟', count: 320 },
];

export const mockParts: PartItem[] = [
  {
    id: '1',
    name: '发动机总成(LSVNV2182N2)',
    commonName: '发动机',
    category: '发动机总成',
    imageUrl: 'https://picsum.photos/id/1/300/300',
    partTypes: [
      { type: 'used', label: '拆车件', priceRange: '2800-4500', warranty: '6个月/1万公里', description: '原车拆下，性能稳定' },
      { type: 'remanufactured', label: '再制造件', priceRange: '5200-7800', warranty: '1年/2万公里', description: '核心部件全新，可靠性高' },
      { type: 'aftermarket', label: '副厂件', priceRange: '1500-2800', warranty: '3个月/5000公里', description: '品牌副厂，性价比高' },
    ],
  },
  {
    id: '2',
    name: '变速箱总成(CVT)',
    commonName: '变速箱',
    category: '变速箱',
    imageUrl: 'https://picsum.photos/id/2/300/300',
    partTypes: [
      { type: 'used', label: '拆车件', priceRange: '3200-5800', warranty: '6个月/1万公里', description: '原厂拆车，匹配度高' },
      { type: 'remanufactured', label: '再制造件', priceRange: '6500-9800', warranty: '1年/2万公里', description: '摩擦片全新更换' },
      { type: 'aftermarket', label: '副厂件', priceRange: '2000-3500', warranty: '3个月/5000公里', description: '兼容型号，经济实惠' },
    ],
  },
  {
    id: '3',
    name: '方向机总成(电动助力)',
    commonName: '方向机',
    category: '方向机',
    imageUrl: 'https://picsum.photos/id/3/300/300',
    partTypes: [
      { type: 'used', label: '拆车件', priceRange: '800-1500', warranty: '6个月/1万公里', description: '原厂拆车，转向精准' },
      { type: 'remanufactured', label: '再制造件', priceRange: '1800-2800', warranty: '1年/2万公里', description: '电机全新，稳定可靠' },
      { type: 'aftermarket', label: '副厂件', priceRange: '500-900', warranty: '3个月/5000公里', description: '通用型号，价格实惠' },
    ],
  },
  {
    id: '4',
    name: '发电机总成(12V 90A)',
    commonName: '发电机',
    category: '发电机',
    imageUrl: 'https://picsum.photos/id/6/300/300',
    partTypes: [
      { type: 'used', label: '拆车件', priceRange: '350-600', warranty: '6个月/1万公里', description: '原厂拆车，发电稳定' },
      { type: 'remanufactured', label: '再制造件', priceRange: '700-1100', warranty: '1年/2万公里', description: '线圈重绕，性能如新' },
      { type: 'aftermarket', label: '副厂件', priceRange: '200-400', warranty: '3个月/5000公里', description: '品牌副厂，性价比高' },
    ],
  },
  {
    id: '5',
    name: '空调压缩机(定排量)',
    commonName: '空调压缩机',
    category: '空调压缩机',
    imageUrl: 'https://picsum.photos/id/8/300/300',
    partTypes: [
      { type: 'used', label: '拆车件', priceRange: '500-900', warranty: '6个月/1万公里', description: '原厂拆车，制冷效果好' },
      { type: 'remanufactured', label: '再制造件', priceRange: '1000-1600', warranty: '1年/2万公里', description: '密封件全新更换' },
      { type: 'aftermarket', label: '副厂件', priceRange: '300-600', warranty: '3个月/5000公里', description: '兼容型号，经济实惠' },
    ],
  },
  {
    id: '6',
    name: '大灯总成(LED)',
    commonName: '大灯',
    category: '大灯总成',
    imageUrl: 'https://picsum.photos/id/9/300/300',
    partTypes: [
      { type: 'used', label: '拆车件', priceRange: '600-1200', warranty: '6个月/1万公里', description: '原厂拆车，亮度正常' },
      { type: 'remanufactured', label: '再制造件', priceRange: '1300-2000', warranty: '1年/2万公里', description: '灯珠全新更换' },
      { type: 'aftermarket', label: '副厂件', priceRange: '250-550', warranty: '3个月/5000公里', description: '通用款，亮度足够' },
    ],
  },
  {
    id: '7',
    name: '前保险杠总成',
    commonName: '保险杠',
    category: '保险杠',
    imageUrl: 'https://picsum.photos/id/119/300/300',
    partTypes: [
      { type: 'used', label: '拆车件', priceRange: '300-600', warranty: '6个月/1万公里', description: '原厂拆车，无修补' },
      { type: 'remanufactured', label: '再制造件', priceRange: '800-1200', warranty: '1年/2万公里', description: '全新喷漆处理' },
      { type: 'aftermarket', label: '副厂件', priceRange: '150-350', warranty: '3个月/5000公里', description: '注塑成型，原厂规格' },
    ],
  },
  {
    id: '8',
    name: '减震器总成(前左)',
    commonName: '减震器',
    category: '减震器',
    imageUrl: 'https://picsum.photos/id/160/300/300',
    partTypes: [
      { type: 'used', label: '拆车件', priceRange: '200-450', warranty: '6个月/1万公里', description: '原厂拆车，阻尼正常' },
      { type: 'remanufactured', label: '再制造件', priceRange: '500-800', warranty: '1年/2万公里', description: '油封全新，阻尼可调' },
      { type: 'aftermarket', label: '副厂件', priceRange: '120-280', warranty: '3个月/5000公里', description: '品牌副厂，经济实用' },
    ],
  },
  {
    id: '9',
    name: '起动机总成(1.4KW)',
    commonName: '起动机',
    category: '起动机',
    imageUrl: 'https://picsum.photos/id/201/300/300',
    partTypes: [
      { type: 'used', label: '拆车件', priceRange: '250-500', warranty: '6个月/1万公里', description: '原厂拆车，启动有力' },
      { type: 'remanufactured', label: '再制造件', priceRange: '550-850', warranty: '1年/2万公里', description: '碳刷全新更换' },
      { type: 'aftermarket', label: '副厂件', priceRange: '150-300', warranty: '3个月/5000公里', description: '通用型号，价格实惠' },
    ],
  },
  {
    id: '10',
    name: '散热器总成(铝制)',
    commonName: '散热器',
    category: '散热器',
    imageUrl: 'https://picsum.photos/id/3/300/300',
    partTypes: [
      { type: 'used', label: '拆车件', priceRange: '300-550', warranty: '6个月/1万公里', description: '原厂拆车，无渗漏' },
      { type: 'remanufactured', label: '再制造件', priceRange: '600-1000', warranty: '1年/2万公里', description: '芯体全新更换' },
      { type: 'aftermarket', label: '副厂件', priceRange: '180-350', warranty: '3个月/5000公里', description: '铝制散热，性价比高' },
    ],
  },
];
