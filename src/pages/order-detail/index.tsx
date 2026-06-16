import React, { useState, useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import dayjs from 'dayjs';
import { useAppStore } from '@/store';
import { mockParts } from '@/data/parts';
import { mockMerchants } from '@/data/merchants';
import PartTypeTag from '@/components/PartTypeTag';
import type { OrderItem } from '@/types';
import styles from './index.module.scss';

type PayMethod = 'wechat' | 'alipay';
type ModalType = 'pay' | 'install' | 'success' | null;

const statusMap = {
  pending_pay: { title: '待支付订金', desc: '请在30分钟内完成支付，超时订单将自动取消' },
  pending_confirm: { title: '商家备货中', desc: '您已支付订金，商家正在确认并准备配件' },
  pending_ship: { title: '待发货', desc: '商家已确认订单，正在准备配件即将发货' },
  pending_receive: { title: '待收货', desc: '配件正在配送中，请注意查收' },
  pending_install: { title: '待安装', desc: '已签收，请尽快预约安装' },
  completed: { title: '已完成', desc: '订单已完成，感谢您的使用' },
  dispute: { title: '维权处理中', desc: '平台正在处理您的维权申请' },
};

const timelineTemplate = [
  { key: 'pay', title: '支付订金', desc: '订单已创建，等待您支付订金' },
  { key: 'confirm', title: '商家确认', desc: '商家已确认订单，正在准备配件' },
  { key: 'ship', title: '商家发货', desc: '商家已发货，配件正在途中' },
  { key: 'receive', title: '确认收货', desc: '您已签收配件，请检查配件完整性' },
  { key: 'install', title: '预约安装', desc: '已预约安装时间，请按时到店' },
  { key: 'complete', title: '订单完成', desc: '安装完成，订单已确认' },
];

const OrderDetailPage = () => {
  const router = useRouter();
  const orderId = router.params.id as string;
  const {
    orders,
    updateOrder,
    getDisputeByOrderId,
    confirmOrderByMerchant,
    shipOrder,
    receiveOrder,
    scheduleInstallForOrder,
    completeOrder,
  } = useAppStore();

  const [modalType, setModalType] = useState<ModalType>(null);
  const [payMethod, setPayMethod] = useState<PayMethod>('wechat');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const order = useMemo((): OrderItem | undefined => {
    return orders.find(o => o.id === orderId);
  }, [orderId, orders]);

  const merchant = useMemo(() => {
    if (!order) return null;
    return mockMerchants.find(m => m.id === order.merchantId) || null;
  }, [order]);

  const part = useMemo(() => {
    if (!order) return null;
    return mockParts.find(p => p.commonName === order.partName) || mockParts[0];
  }, [order]);

  const existingDispute = useMemo(() => {
    if (!order) return null;
    return getDisputeByOrderId(order.id);
  }, [order, getDisputeByOrderId]);

  const statusInfo = order ? statusMap[order.status] : statusMap.pending_pay;

  const dates = useMemo(() => {
    const result = [];
    for (let i = 0; i < 7; i++) {
      const d = dayjs().add(i, 'day');
      result.push({
        value: d.format('YYYY-MM-DD'),
        label: i === 0 ? '今天' : i === 1 ? '明天' : d.format('MM月DD日'),
        week: d.format('dddd'),
      });
    }
    return result;
  }, []);

  const timeSlots = useMemo(() => {
    return [
      { value: '09:00', label: '09:00' },
      { value: '10:00', label: '10:00' },
      { value: '11:00', label: '11:00' },
      { value: '14:00', label: '14:00' },
      { value: '15:00', label: '15:00' },
      { value: '16:00', label: '16:00' },
      { value: '17:00', label: '17:00' },
    ];
  }, []);

  const timeline = useMemo(() => {
    if (!order) return timelineTemplate.map(t => ({ ...t, active: false, time: '' }));

    const statusOrder: Array<keyof typeof statusMap> = [
      'pending_pay', 'pending_confirm', 'pending_ship', 'pending_receive',
      'pending_install', 'completed', 'dispute'
    ];
    const currentIdx = statusOrder.indexOf(order.status);

    return timelineTemplate.map((item, idx) => {
      let active = false;
      let time = '';

      if (item.key === 'pay') {
        active = order.status !== 'pending_pay';
        time = order.payAt || '';
      } else if (item.key === 'confirm') {
        active = ['pending_confirm', 'pending_ship', 'pending_receive', 'pending_install', 'completed', 'dispute'].includes(order.status);
        time = order.confirmAt || '';
      } else if (item.key === 'ship') {
        active = ['pending_ship', 'pending_receive', 'pending_install', 'completed', 'dispute'].includes(order.status);
        time = order.shipAt || '';
      } else if (item.key === 'receive') {
        active = ['pending_receive', 'pending_install', 'completed'].includes(order.status) || currentIdx >= 3;
        time = order.receiveAt || '';
      } else if (item.key === 'install') {
        active = ['pending_install', 'completed'].includes(order.status);
        time = order.installDate || '';
      } else if (item.key === 'complete') {
        active = order.status === 'completed';
        time = order.completeAt || '';
      }

      if (order.status === 'dispute') {
        active = ['pay', 'confirm', 'ship'].includes(item.key);
      }

      return { ...item, active, time };
    });
  }, [order]);

  const handleCopyOrderNo = () => {
    if (!order) return;
    console.info('[OrderDetail] copy orderNo:', order.id);
    Taro.setClipboardData({ data: order.id });
  };

  const handleCopyTrackingNo = () => {
    if (!order?.trackingNo) return;
    console.info('[OrderDetail] copy trackingNo:', order.trackingNo);
    Taro.setClipboardData({ data: order.trackingNo });
  };

  const handleMerchantTap = () => {
    if (!merchant) return;
    console.info('[OrderDetail] go to merchant:', merchant.id);
    Taro.navigateTo({ url: `/pages/merchant-detail/index?id=${merchant.id}` });
  };

  const handlePay = () => {
    console.info('[OrderDetail] open pay modal');
    setModalType('pay');
  };

  const handleConfirmPay = () => {
    if (!order) return;
    console.info('[OrderDetail] confirm pay with method:', payMethod);

    const payAt = new Date().toLocaleString('zh-CN');
    const confirmAt = new Date(Date.now() + 5 * 60 * 1000).toLocaleString('zh-CN');

    updateOrder(order.id, {
      status: 'pending_confirm',
      payAt,
      payMethod,
      confirmAt,
    });

    setModalType('success');

    setTimeout(() => {
      setModalType(null);
    }, 2000);
  };

  const handleScheduleInstall = () => {
    console.info('[OrderDetail] open install modal');
    setModalType('install');
    setSelectedDate('');
    setSelectedTime('');
  };

  const handleConfirmInstall = () => {
    if (!order || !selectedDate || !selectedTime) {
      Taro.showToast({ title: '请选择安装时间', icon: 'none' });
      return;
    }

    const installDate = `${selectedDate} ${selectedTime}`;
    console.info('[OrderDetail] schedule install:', installDate);

    scheduleInstallForOrder(order.id, installDate);

    setModalType('success');
    setTimeout(() => {
      setModalType(null);
    }, 1500);
  };

  const handleConfirmReceive = () => {
    if (!order) return;
    console.info('[OrderDetail] confirm receive');
    receiveOrder(order.id);
    Taro.showToast({ title: '已确认收货', icon: 'success' });
  };

  const handleMerchantConfirm = () => {
    if (!order) return;
    console.info('[OrderDetail] simulate merchant confirm');
    const ok = confirmOrderByMerchant(order.id);
    Taro.showToast({ title: ok ? '商家已确认' : '操作失败', icon: ok ? 'success' : 'none' });
  };

  const handleMerchantShip = () => {
    if (!order) return;
    console.info('[OrderDetail] simulate merchant ship');
    const ok = shipOrder(order.id);
    Taro.showToast({ title: ok ? '商家已发货' : '操作失败', icon: ok ? 'success' : 'none' });
  };

  const handleDispute = () => {
    if (!order) return;
    console.info('[OrderDetail] go to dispute page, orderId:', order.id);
    if (existingDispute) {
      Taro.navigateTo({ url: `/pages/dispute/index?orderId=${order.id}&disputeId=${existingDispute.id}` });
    } else {
      Taro.navigateTo({ url: `/pages/dispute/index?orderId=${order.id}` });
    }
  };

  const handleComplete = () => {
    if (!order) return;
    console.info('[OrderDetail] complete order');
    const ok = completeOrder(order.id);
    Taro.showToast({ title: ok ? '订单已完成' : '操作失败', icon: ok ? 'success' : 'none' });
  };

  if (!order) {
    return (
      <View className={styles.page}>
        <View className={styles.statusHeader}>
          <Text className={styles.statusTitle}>订单不存在</Text>
        </View>
      </View>
    );
  }

  const showPayBtn = order.status === 'pending_pay';
  const showMerchantConfirmBtn = ['pending_pay', 'pending_confirm'].includes(order.status);
  const showMerchantShipBtn = ['pending_confirm', 'pending_ship'].includes(order.status);
  const showReceiveBtn = order.status === 'pending_receive';
  const showInstallBtn = order.status === 'pending_install' || order.status === 'pending_receive';
  const showCompleteBtn = order.status === 'pending_install';
  const showDisputeBtn = order.status !== 'dispute' && order.status !== 'completed';
  const showLogistics = ['pending_receive', 'pending_install', 'completed'].includes(order.status);

  return (
    <View className={styles.page}>
      <View className={styles.statusHeader}>
        <Text className={styles.statusTitle}>{statusInfo.title}</Text>
        <Text className={styles.statusDesc}>{statusInfo.desc}</Text>
      </View>

      <View className={styles.orderCard}>
        <View className={styles.orderNoRow}>
          <Text className={styles.orderNo}>订单号：{order.id}</Text>
          <View className={styles.copyBtn} onClick={handleCopyOrderNo}>
            <Text>复制</Text>
          </View>
        </View>

        <View className={styles.partRow}>
          <Image
            className={styles.partImage}
            src={part?.imageUrl || 'https://picsum.photos/seed/car-part/200'}
            mode="aspectFill"
          />
          <View className={styles.partInfo}>
            <View>
              <Text className={styles.partName}>{order.partName}</Text>
              <View className={styles.partTypeRow}>
                <PartTypeTag type={order.partType} />
                <Text className={styles.depositBadge}>订金留货</Text>
              </View>
            </View>
          </View>
        </View>

        {merchant && (
          <View className={styles.merchantRow} onClick={handleMerchantTap}>
            <Image className={styles.merchantAvatar} src={merchant.avatar} mode="aspectFill" />
            <View className={styles.merchantInfo}>
              <Text className={styles.merchantName}>{merchant.name}</Text>
              <Text className={styles.merchantMeta}>⭐ {merchant.rating} · {merchant.partCount}件在售</Text>
            </View>
            <Text className={styles.merchantArrow}>›</Text>
          </View>
        )}

        <View className={styles.priceRow}>
          <Text className={styles.priceLabel}>订单总价</Text>
          <Text className={styles.priceValue}>¥{order.price}</Text>
        </View>

        <View className={styles.orderInfoSection}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>配送方式</Text>
            <Text className={styles.infoValue}>
              {order.isLocal ? '同城自提' : '外地发货（快递配送）'}
            </Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>订金金额</Text>
            <Text className={styles.infoValue} style={{ color: '#1A6DFF', fontWeight: 600 }}>
              ¥{order.deposit}（30%）
            </Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>余款</Text>
            <Text className={styles.infoValue}>¥{order.price - order.deposit}（签收后支付给商家）</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>下单时间</Text>
            <Text className={styles.infoValue}>{order.createdAt}</Text>
          </View>
          {order.payAt && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>支付时间</Text>
              <Text className={styles.infoValue}>{order.payAt}</Text>
            </View>
          )}
          {order.trackingNo && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>物流单号</Text>
              <View className={styles.trackingRow}>
                <Text className={styles.infoValue}>{order.logisticsCompany} {order.trackingNo}</Text>
                <Text className={styles.copyText} onClick={handleCopyTrackingNo}>复制</Text>
              </View>
            </View>
          )}
          {order.installDate && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>预约安装</Text>
              <Text className={styles.infoValue}>{order.installDate}</Text>
            </View>
          )}
        </View>
      </View>

      {showLogistics && order.logisticsNodes && order.logisticsNodes.length > 0 && (
        <View className={styles.logisticsSection}>
          <View className={styles.sectionHeaderRow}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>🚚</Text>
              物流信息
            </Text>
            {order.logisticsCompany && order.trackingNo && (
              <Text className={styles.logisticsMeta}>
                {order.logisticsCompany} {order.trackingNo}
              </Text>
            )}
          </View>
          <View className={styles.logisticsTimeline}>
            {order.logisticsNodes.map((node, idx) => (
              <View
                key={idx}
                className={classnames(
                  styles.logisticsItem,
                  idx === 0 && styles.logisticsLatest
                )}
              >
                <View className={styles.logisticsDot} />
                <View className={styles.logisticsContent}>
                  <Text className={styles.logisticsStatus}>{node.status}</Text>
                  <Text className={styles.logisticsDesc}>{node.description}</Text>
                  <Text className={styles.logisticsTime}>{node.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.timelineSection}>
        <Text className={styles.sectionTitle}>订单进度</Text>
        <View className={styles.timeline}>
          {timeline.map((item, idx) => (
            <View key={item.key} className={styles.timelineItem}>
              <View className={classnames(styles.timelineDot, item.active && styles.active)} />
              <View className={classnames(styles.timelineContent, item.active && styles.active)}>
                <Text className={styles.timelineTitle}>{item.title}</Text>
                {item.desc && <Text className={styles.timelineDesc}>{item.desc}</Text>}
                {item.time && <Text className={styles.timelineTime}>{item.time}</Text>}
              </View>
            </View>
          ))}
        </View>
        {order.installDate && (
          <View className={styles.installInfo}>
            <Text className={styles.installText}>
              📅 已预约安装：{order.installDate}，请按时到店，商家会提前准备好配件
            </Text>
          </View>
        )}
      </View>

      {(order.status === 'pending_receive' || order.status === 'pending_install') && (
        <View className={styles.alertSection}>
          <Text className={styles.alertTitle}>🔔 签收前适配提醒</Text>
          <View className={styles.alertItem}>
            <Text className={styles.alertIcon}>1.</Text>
            <Text>请先检查外包装是否完好，配件有无磕碰、损坏</Text>
          </View>
          <View className={styles.alertItem}>
            <Text className={styles.alertIcon}>2.</Text>
            <Text>核对配件型号、件号是否与订单一致</Text>
          </View>
          <View className={styles.alertItem}>
            <Text className={styles.alertIcon}>3.</Text>
            <Text>拆车件请先试装确认适配后，再安装固定</Text>
          </View>
          <View className={styles.alertItem}>
            <Text className={styles.alertIcon}>4.</Text>
            <Text>如有任何问题，请在24小时内联系客服或申请平台介入</Text>
          </View>
          <View className={styles.alertItem}>
            <Text className={styles.alertIcon}>5.</Text>
            <Text>安装完成前请保留好包装和配件标签</Text>
          </View>
        </View>
      )}

      {existingDispute && (
        <View className={styles.disputeBanner} onClick={handleDispute}>
          <View className={styles.disputeBannerLeft}>
            <Text className={styles.disputeBannerIcon}>⚠️</Text>
            <View>
              <Text className={styles.disputeBannerTitle}>维权处理中</Text>
              <Text className={styles.disputeBannerDesc}>编号：{existingDispute.id}</Text>
            </View>
          </View>
          <Text className={styles.disputeBannerArrow}>查看详情 ›</Text>
        </View>
      )}

      <View className={styles.footer}>
        {showDisputeBtn && (
          <View
            className={classnames(styles.footerBtn, styles.btnDanger)}
            onClick={handleDispute}
          >
            <Text>申请介入</Text>
          </View>
        )}
        {showMerchantConfirmBtn && !order.confirmAt && (
          <View
            className={classnames(styles.footerBtn, styles.btnOutline)}
            onClick={handleMerchantConfirm}
          >
            <Text>模拟商家确认</Text>
          </View>
        )}
        {showMerchantShipBtn && order.confirmAt && !order.trackingNo && (
          <View
            className={classnames(styles.footerBtn, styles.btnOutline)}
            onClick={handleMerchantShip}
          >
            <Text>模拟商家发货</Text>
          </View>
        )}
        {showReceiveBtn && (
          <View
            className={classnames(styles.footerBtn, styles.btnSecondary)}
            onClick={handleConfirmReceive}
          >
            <Text>确认收货</Text>
          </View>
        )}
        {showInstallBtn && (
          <View
            className={classnames(styles.footerBtn, styles.btnSecondary)}
            onClick={handleScheduleInstall}
          >
            <Text>预约安装</Text>
          </View>
        )}
        {showCompleteBtn && (
          <View
            className={classnames(styles.footerBtn, styles.btnPrimary)}
            onClick={handleComplete}
          >
            <Text>确认完成</Text>
          </View>
        )}
        {showPayBtn && (
          <View
            className={classnames(styles.footerBtn, styles.btnPrimary)}
            onClick={handlePay}
          >
            <Text>支付订金 ¥{order.deposit}</Text>
          </View>
        )}
      </View>

      {modalType === 'pay' && (
        <View className={styles.modalOverlay} onClick={() => setModalType(null)}>
          <View className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>支付订金</Text>
            <View className={styles.modalContent}>
              <View className={styles.payAmountRow}>
                <Text className={styles.payLabel}>订金金额</Text>
                <Text className={styles.payAmount}>¥{order.deposit}</Text>
                <Text className={styles.payFull}>（订单总价 ¥{order.price}，已优惠 ¥0）</Text>
              </View>
              <View className={styles.payMethods}>
                <View
                  className={classnames(styles.payMethod, payMethod === 'wechat' && styles.selected)}
                  onClick={() => setPayMethod('wechat')}
                >
                  <Text className={styles.payIcon}>💚</Text>
                  <Text className={styles.payMethodName}>微信支付</Text>
                  <View className={styles.payRadio}>
                    <Text className={styles.payRadioCheck}>✓</Text>
                  </View>
                </View>
                <View
                  className={classnames(styles.payMethod, payMethod === 'alipay' && styles.selected)}
                  onClick={() => setPayMethod('alipay')}
                >
                  <Text className={styles.payIcon}>💙</Text>
                  <Text className={styles.payMethodName}>支付宝</Text>
                  <View className={styles.payRadio}>
                    <Text className={styles.payRadioCheck}>✓</Text>
                  </View>
                </View>
              </View>
            </View>
            <View className={styles.modalActions}>
              <View
                className={classnames(styles.modalBtn, styles.btnSecondary)}
                onClick={() => setModalType(null)}
              >
                <Text>取消</Text>
              </View>
              <View
                className={classnames(styles.modalBtn, styles.btnPrimary)}
                onClick={handleConfirmPay}
              >
                <Text>确认支付</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {modalType === 'install' && (
        <View className={styles.modalOverlay} onClick={() => setModalType(null)}>
          <View className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>选择安装时间</Text>
            <View className={styles.modalContent}>
              <View className={styles.datePickerSection}>
                <Text className={styles.dateLabel}>选择日期</Text>
                <View className={styles.dateOptions}>
                  {dates.map((d) => (
                    <View
                      key={d.value}
                      className={classnames(styles.dateOption, selectedDate === d.value && styles.selected)}
                      onClick={() => {
                        setSelectedDate(d.value);
                        setSelectedTime('');
                      }}
                    >
                      <Text>{d.label}</Text>
                      <Text style={{ fontSize: '22rpx', color: '#86909C', marginTop: '4rpx', display: 'block' }}>{d.week}</Text>
                    </View>
                  ))}
                </View>
              </View>
              {selectedDate && (
                <View className={styles.datePickerSection}>
                  <Text className={styles.dateLabel}>选择时段</Text>
                  <View className={styles.timeOptions}>
                    {timeSlots.map((t) => {
                      const isToday = selectedDate === dates[0].value;
                      const currentHour = new Date().getHours();
                      const slotHour = parseInt(t.value);
                      const isPast = isToday && slotHour <= currentHour;
                      return (
                        <View
                          key={t.value}
                          className={classnames(
                            styles.timeOption,
                            selectedTime === t.value && styles.selected
                          )}
                          onClick={() => !isPast && setSelectedTime(t.value)}
                          disabled={isPast}
                        >
                          <Text>{t.label}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
            <View className={styles.modalActions}>
              <View
                className={classnames(styles.modalBtn, styles.btnSecondary)}
                onClick={() => setModalType(null)}
              >
                <Text>取消</Text>
              </View>
              <View
                className={classnames(styles.modalBtn, styles.btnPrimary)}
                onClick={handleConfirmInstall}
              >
                <Text>确定预约</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {modalType === 'success' && (
        <View className={styles.modalOverlay}>
          <View className={styles.modal}>
            <View className={styles.successIcon}>
              <Text className={styles.successIconText}>✓</Text>
            </View>
            <Text className={styles.successText}>操作成功</Text>
            <Text className={styles.successDesc}>
              {order.status === 'pending_confirm' ? '订金支付成功，商家正在备货' : '安装预约成功，请按时到店'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default OrderDetailPage;
