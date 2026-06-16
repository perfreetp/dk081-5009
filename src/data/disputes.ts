import type { DisputeItem } from '@/types';

export const mockDisputes: DisputeItem[] = [
  {
    id: 'DIS20260607001',
    orderId: 'ORD20260605001',
    merchantId: '2',
    questionType: 'mismatch',
    description: '收到的大灯总成型号与订单不符，订单下单的是2019款大众帕萨特大灯，但收到的是2017款的，接口位置不一样，无法安装。已拍照留证，希望能尽快处理换货或退款。',
    images: [
      'https://picsum.photos/seed/dispute1-1/400',
      'https://picsum.photos/seed/dispute1-2/400',
      'https://picsum.photos/seed/dispute1-3/400',
    ],
    status: 'processing',
    createdAt: '2026-06-07 10:30',
    progressNotes: [
      { time: '2026-06-07 10:30', operator: '用户', content: '提交维权申请，上传了3张凭证图片' },
      { time: '2026-06-07 14:00', operator: '平台客服-小王', content: '已受理您的维权申请，正在联系商家核实情况' },
      { time: '2026-06-08 09:15', operator: '平台客服-小王', content: '商家已确认发错型号，同意为您换货处理，请将原配件寄回指定地址，运费由商家承担' },
    ],
    result: '商家同意换货，等待用户寄回原配件',
  },
];
