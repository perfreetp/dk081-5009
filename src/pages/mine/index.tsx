import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import styles from './index.module.scss';

const orderStatusMap: Record<string, { label: string; icon: string }> = {
  pending_pay: { label: '待付款', icon: '💰' },
  pending_confirm: { label: '备货中', icon: '📦' },
  pending_ship: { label: '待发货', icon: '🚚' },
  pending_receive: { label: '待收货', icon: '📬' },
  pending_install: { label: '待安装', icon: '🔧' },
  dispute: { label: '维权中', icon: '⚖️' },
};

const disputeStatusMap: Record<string, { label: string; className: string }> = {
  pending: { label: '待处理', className: 'statusPending' },
  reviewing: { label: '审核中', className: 'statusReviewing' },
  processing: { label: '处理中', className: 'statusProcessing' },
  resolved: { label: '已解决', className: 'statusResolved' },
  rejected: { label: '已驳回', className: 'statusRejected' },
};

const MinePage = () => {
  const { currentCar, orders, disputes, getDisputeById } = useAppStore();
  const userCars = currentCar ? [currentCar] : [];

  const orderStats = useMemo(() => {
    const stats: Record<string, number> = {};
    orders.forEach((o) => {
      stats[o.status] = (stats[o.status] || 0) + 1;
    });
    return stats;
  }, [orders]);

  const activeDisputes = useMemo(() => {
    return disputes.filter(d => d.status === 'pending' || d.status === 'reviewing' || d.status === 'processing');
  }, [disputes]);

  const resolvedDisputes = useMemo(() => {
    return disputes.filter(d => d.status === 'resolved' || d.status === 'rejected');
  }, [disputes]);

  const handleCarIdentify = () => {
    Taro.navigateTo({ url: '/pages/car-identify/index' });
  };

  const handleGoOrders = (status?: string) => {
    if (status) {
      Taro.navigateTo({ url: `/pages/order/index?status=${status}` });
    } else {
      Taro.navigateTo({ url: '/pages/order/index' });
    }
  };

  const handleGoDispute = (disputeId: string, orderId: string) => {
    Taro.navigateTo({ url: `/pages/dispute/index?orderId=${orderId}&disputeId=${disputeId}` });
  };

  const handleGoDisputeList = () => {
    Taro.navigateTo({ url: '/pages/order/index?status=dispute' });
  };

  const handleGoMerchantList = () => {
    Taro.switchTab({ url: '/pages/merchant/index' });
  };

  const handleMenuTap = (action: string) => {
    console.info('[Mine] menu tap', action);
    switch (action) {
      case 'car':
        handleCarIdentify();
        break;
      case 'merchant':
        handleGoMerchantList();
        break;
      case 'help':
      case 'about':
      case 'settings':
      case 'address':
      case 'install':
        Taro.showToast({ title: '功能开发中', icon: 'none' });
        break;
      default:
        break;
    }
  };

  return (
    <View className={styles.page}>
      <ScrollView scrollY style={{ height: '100vh' }}>
        <View className={styles.profileHeader}>
          <View className={styles.profileInfo}>
            <Text style={{ fontSize: '120rpx' }}>👤</Text>
            <View className={styles.profileText}>
              <Text className={styles.profileName}>车主用户</Text>
              <Text className={styles.profilePhone}>138****6789</Text>
            </View>
            <View className={styles.profileEdit}>
              <Text style={{ fontSize: '24rpx', color: '#fff' }}>编辑</Text>
            </View>
          </View>
        </View>

        <View className={styles.myCarSection}>
          <Text className={styles.sectionTitle}>我的车型</Text>
          {userCars.map((car, idx) => (
            <View key={idx} className={styles.carCard} onClick={() => handleMenuTap('car')}>
              <Text className={styles.carIcon}>🚗</Text>
              <View className={styles.carInfo}>
                <Text className={styles.carModelText}>{car.brand} {car.model}</Text>
                <Text className={styles.carDetail}>{car.year}年 | {car.displacement}</Text>
              </View>
            </View>
          ))}
          <View className={styles.addCarBtn} onClick={handleCarIdentify}>
            <Text style={{ fontSize: '28rpx', color: '#1A6DFF' }}>+ 添加爱车</Text>
          </View>
        </View>

        <View className={styles.orderSection}>
          <View className={styles.sectionHeader} onClick={() => handleGoOrders()}>
            <Text className={styles.sectionTitle}>我的订单</Text>
            <Text className={styles.sectionArrow}>查看全部 ›</Text>
          </View>
          <View className={styles.orderShortcuts}>
            {Object.entries(orderStatusMap).map(([status, info]) => {
              const count = orderStats[status] || 0;
              return (
                <View
                  key={status}
                  className={styles.orderShortcut}
                  onClick={() => handleGoOrders(status)}
                >
                  <View className={styles.shortcutIcon}>
                    <Text style={{ fontSize: '44rpx' }}>{info.icon}</Text>
                    {count > 0 && (
                      <View className={styles.shortcutBadge}>
                        <Text className={styles.shortcutBadgeText}>{count > 99 ? '99+' : count}</Text>
                      </View>
                    )}
                  </View>
                  <Text className={styles.shortcutLabel}>{info.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {(activeDisputes.length > 0 || resolvedDisputes.length > 0) && (
          <View className={styles.disputeSection}>
            <View className={styles.sectionHeader} onClick={handleGoDisputeList}>
              <Text className={styles.sectionTitle}>我的售后</Text>
              {disputes.length > 0 && (
                <Text className={styles.sectionArrow}>共 {disputes.length} 条 ›</Text>
              )}
            </View>

            {activeDisputes.length > 0 && (
              <>
                <Text className={styles.disputeGroupTitle}>进行中 ({activeDisputes.length})</Text>
                {activeDisputes.map((dispute) => {
                  const order = orders.find(o => o.id === dispute.orderId);
                  const statusInfo = disputeStatusMap[dispute.status] || disputeStatusMap.pending;
                  return (
                    <View
                      key={dispute.id}
                      className={styles.disputeCard}
                      onClick={() => handleGoDispute(dispute.id, dispute.orderId)}
                    >
                      <View className={styles.disputeCardHeader}>
                        <Text className={styles.disputeId}>维权编号：{dispute.id}</Text>
                        <Text className={classnames(styles.disputeStatus, styles[statusInfo.className])}>
                          {statusInfo.label}
                        </Text>
                      </View>
                      <View className={styles.disputeCardBody}>
                        <Text className={styles.disputePartName}>
                          {order?.partName || '相关配件'}
                        </Text>
                        <Text className={styles.disputeDesc}>
                          {dispute.description.length > 30 ? `${dispute.description.slice(0, 30)}...` : dispute.description}
                        </Text>
                        <Text className={styles.disputeTime}>提交时间：{dispute.createdAt}</Text>
                      </View>
                    </View>
                  );
                })}
              </>
            )}

            {resolvedDisputes.length > 0 && (
              <>
                <Text className={styles.disputeGroupTitle}>已完成 ({resolvedDisputes.length})</Text>
                {resolvedDisputes.map((dispute) => {
                  const order = orders.find(o => o.id === dispute.orderId);
                  const statusInfo = disputeStatusMap[dispute.status] || disputeStatusMap.resolved;
                  return (
                    <View
                      key={dispute.id}
                      className={classnames(styles.disputeCard, styles.disputeCardDone)}
                      onClick={() => handleGoDispute(dispute.id, dispute.orderId)}
                    >
                      <View className={styles.disputeCardHeader}>
                        <Text className={styles.disputeId}>维权编号：{dispute.id}</Text>
                        <Text className={classnames(styles.disputeStatus, styles[statusInfo.className])}>
                          {statusInfo.label}
                        </Text>
                      </View>
                      <View className={styles.disputeCardBody}>
                        <Text className={styles.disputePartName}>
                          {order?.partName || '相关配件'}
                        </Text>
                        {dispute.result && (
                          <Text className={styles.disputeResult}>
                            处理结果：{dispute.result.length > 40 ? `${dispute.result.slice(0, 40)}...` : dispute.result}
                          </Text>
                        )}
                        <Text className={styles.disputeTime}>提交时间：{dispute.createdAt}</Text>
                      </View>
                    </View>
                  );
                })}
              </>
            )}
          </View>
        )}

        <View className={styles.menuSection}>
          <View className={styles.menuGroup}>
            <View className={styles.menuItem} onClick={() => handleMenuTap('car')}>
              <Text className={styles.menuIcon}>🚘</Text>
              <Text className={styles.menuText}>管理车型</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
            <View className={styles.menuItem} onClick={() => handleMenuTap('merchant')}>
              <Text className={styles.menuIcon}>🏪</Text>
              <Text className={styles.menuText}>附近商家</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
            <View className={styles.menuItem} onClick={() => handleMenuTap('address')}>
              <Text className={styles.menuIcon}>📍</Text>
              <Text className={styles.menuText}>收货地址</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
            <View className={styles.menuItem} onClick={() => handleMenuTap('install')}>
              <Text className={styles.menuIcon}>🔧</Text>
              <Text className={styles.menuText}>预约安装</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>

          <View className={styles.menuGroup}>
            <View className={styles.menuItem} onClick={() => handleGoDisputeList()}>
              <Text className={styles.menuIcon}>⚖️</Text>
              <View style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <Text className={styles.menuText}>维权申诉</Text>
                {activeDisputes.length > 0 && (
                  <Text className={styles.disputeBadge}>{activeDisputes.length}件进行中</Text>
                )}
              </View>
              <Text className={styles.menuArrow}>›</Text>
            </View>
            <View className={styles.menuItem} onClick={() => handleMenuTap('help')}>
              <Text className={styles.menuIcon}>❓</Text>
              <Text className={styles.menuText}>帮助中心</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
            <View className={styles.menuItem} onClick={() => handleMenuTap('about')}>
              <Text className={styles.menuIcon}>ℹ️</Text>
              <Text className={styles.menuText}>关于拆车找件</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>

          <View className={styles.menuGroup}>
            <View className={styles.menuItem} onClick={() => handleMenuTap('settings')}>
              <Text className={styles.menuIcon}>⚙️</Text>
              <Text className={styles.menuText}>设置</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default MinePage;
