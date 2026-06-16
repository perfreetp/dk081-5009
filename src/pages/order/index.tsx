import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import PartTypeTag from '@/components/PartTypeTag';
import styles from './index.module.scss';

type OrderTab = 'all' | 'pending_pay' | 'pending_ship' | 'pending_receive' | 'pending_install' | 'completed' | 'dispute';

const statusMap: Record<string, { label: string; className: string }> = {
  pending_pay: { label: '待付订金', className: 'statusPendingPay' },
  pending_ship: { label: '待发货', className: 'statusPendingShip' },
  pending_receive: { label: '待收货', className: 'statusPendingReceive' },
  pending_install: { label: '待安装', className: 'statusPendingReceive' },
  completed: { label: '已完成', className: 'statusCompleted' },
  dispute: { label: '维权中', className: 'statusDisputed' },
};

const tabs: { key: OrderTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending_pay', label: '待付款' },
  { key: 'pending_ship', label: '待发货' },
  { key: 'pending_receive', label: '待收货' },
  { key: 'pending_install', label: '待安装' },
  { key: 'completed', label: '已完成' },
  { key: 'dispute', label: '维权' },
];

const OrderPage = () => {
  const [tab, setTab] = useState<OrderTab>('all');
  const { orders } = useAppStore();

  const filteredOrders = useMemo(() => {
    if (tab === 'all') return orders;
    return orders.filter((o) => o.status === tab);
  }, [tab, orders]);

  const handleOrderTap = (id: string) => {
    console.info('[Order] tap order:', id);
    Taro.navigateTo({ url: `/pages/order-detail/index?id=${id}` });
  };

  const handlePay = (id: string) => {
    console.info('[Order] pay deposit', id);
    Taro.navigateTo({ url: `/pages/order-detail/index?id=${id}` });
  };

  const handleDispute = (id: string) => {
    console.info('[Order] view dispute', id);
    Taro.navigateTo({ url: `/pages/dispute/index?orderId=${id}` });
  };

  return (
    <View className={styles.page}>
      <ScrollView scrollX className={styles.tabBar}>
        {tabs.map((t) => (
          <View key={t.key} className={styles.tabItem} onClick={() => setTab(t.key)}>
            <Text className={classnames(styles.tabText, t === tab && styles.tabTextActive)}>
              {t.label}
            </Text>
            {t === tab && <View className={styles.tabUnderline} />}
          </View>
        ))}
      </ScrollView>

      <ScrollView scrollY style={{ height: 'calc(100vh - 120rpx)' }}>
        <View className={styles.orderList}>
          {filteredOrders.map((order) => {
            const status = statusMap[order.status] || statusMap.pending_pay;
            return (
              <View key={order.id} className={styles.orderCard} onClick={() => handleOrderTap(order.id)}>
                <View className={styles.orderHeader}>
                  <Text className={styles.orderId}>{order.id}</Text>
                  <Text className={classnames(styles.orderStatus, styles[status.className])}>
                    {status.label}
                  </Text>
                </View>

                <View className={styles.orderBody}>
                  <View className={styles.orderPartInfo}>
                    <Text className={styles.orderPartName}>{order.partName}</Text>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '8rpx', marginTop: '8rpx' }}>
                      <PartTypeTag type={order.partType} size="small" />
                      <Text className={styles.orderMerchant}>{order.merchantName}</Text>
                    </View>
                    {order.installDate && (
                      <Text className={styles.orderInstallDate}>
                        📅 预约安装：{order.installDate}
                      </Text>
                    )}
                  </View>
                  <View className={styles.orderPriceSection}>
                    <Text className={styles.orderPrice}>¥{order.price}</Text>
                    <Text className={styles.orderDeposit}>订金 ¥{order.deposit}</Text>
                  </View>
                </View>

                {order.status === 'pending_receive' && (
                  <View className={styles.installReminder}>
                    <Text className={styles.reminderIcon}>⚠️</Text>
                    <Text className={styles.reminderText}>
                      签收前请确认配件与车型适配，检查外观无损后再确认收货
                    </Text>
                  </View>
                )}

                <View className={styles.orderFooter}>
                  <Text className={styles.orderDate}>{order.createdAt}</Text>
                  <View className={styles.orderActions}>
                    {order.status === 'pending_pay' && (
                      <View
                        className={classnames(styles.actionBtn, styles.btnPrimary)}
                        onClick={(e) => { e.stopPropagation(); handlePay(order.id); }}
                      >
                        <Text style={{ fontSize: '24rpx', color: '#fff' }}>付订金</Text>
                      </View>
                    )}
                    {order.status === 'dispute' && (
                      <View
                        className={classnames(styles.actionBtn, styles.btnWarning)}
                        onClick={(e) => { e.stopPropagation(); handleDispute(order.id); }}
                      >
                        <Text style={{ fontSize: '24rpx', color: '#fff' }}>查看进度</Text>
                      </View>
                    )}
                    <View
                      className={classnames(styles.actionBtn, styles.btnSecondary)}
                      onClick={(e) => { e.stopPropagation(); handleOrderTap(order.id); }}
                    >
                      <Text style={{ fontSize: '24rpx' }}>详情</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
          {filteredOrders.length === 0 && (
            <View style={{ padding: '160rpx 0', textAlign: 'center' }}>
              <Text style={{ fontSize: '80rpx', opacity: 0.3 }}>📋</Text>
              <Text style={{ fontSize: '28rpx', color: '#86909C', marginTop: '24rpx', display: 'block' }}>
                暂无相关订单
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default OrderPage;
