import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { mockMerchants } from '@/data/merchants';
import { useAppStore } from '@/store';
import PartTypeTag from '@/components/PartTypeTag';
import styles from './index.module.scss';

const deliveryMethodMap = {
  self_pickup: { icon: '🏪', label: '到店自提' },
  local_delivery: { icon: '🚚', label: '同城配送' },
  national_shipping: { icon: '📦', label: '全国发货' },
};

const MerchantDetailPage = () => {
  const router = useRouter();
  const merchantId = router.params.id as string;
  const merchant = mockMerchants.find(m => m.id === merchantId) || mockMerchants[0];
  const { getOrdersByMerchantId, getDisputesByMerchantId } = useAppStore();

  const orders = useMemo(() => getOrdersByMerchantId(merchant.id), [merchant.id, getOrdersByMerchantId]);
  const disputes = useMemo(() => getDisputesByMerchantId(merchant.id), [merchant.id, getDisputesByMerchantId]);

  const handleCall = () => {
    console.info('[MerchantDetail] call merchant:', merchant.phone);
    Taro.makePhoneCall({
      phoneNumber: merchant.phone,
    });
  };

  const handleQuote = () => {
    console.info('[MerchantDetail] start quote with merchant:', merchant.name);
    Taro.showToast({
      title: '已向商家发起询价',
      icon: 'success',
    });
  };

  const handleOrderTap = (orderId: string) => {
    console.info('[MerchantDetail] go to order:', orderId);
    Taro.navigateTo({ url: `/pages/order-detail/index?id=${orderId}` });
  };

  const handlePartTap = (part) => {
    console.info('[MerchantDetail] tap part:', part.id, part.name);
    Taro.showActionSheet({
      itemList: ['发起询价', '直接下单（定金30%）'],
      success: (res) => {
        if (res.tapIndex === 0) {
          Taro.showToast({ title: `已询价：${part.name}`, icon: 'success' });
        } else if (res.tapIndex === 1) {
          const newOrder = {
            id: `ORD${Date.now()}`,
            partName: part.commonName,
            partType: part.partType,
            merchantId: merchant.id,
            merchantName: merchant.name,
            merchantAvatar: merchant.avatar,
            price: part.price,
            deposit: Math.round(part.price * 0.3),
            status: 'pending_pay' as const,
            createdAt: new Date().toLocaleString('zh-CN'),
            isLocal: merchant.isLocal,
          };
          const { addOrder } = useAppStore.getState();
          addOrder(newOrder);
          Taro.showToast({ title: '下单成功', icon: 'success' });
          setTimeout(() => {
            Taro.navigateTo({ url: `/pages/order-detail/index?id=${newOrder.id}` });
          }, 1000);
        }
      },
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.merchantInfo}>
          <Image className={styles.merchantAvatar} src={merchant.avatar} mode="aspectFill" />
          <View className={styles.merchantBase}>
            <Text className={styles.merchantName}>{merchant.name}</Text>
            <View className={styles.merchantMeta}>
              <Text className={styles.merchantRating}>⭐ {merchant.rating}</Text>
              <Text className={styles.merchantReview}>{merchant.reviewCount}条评价</Text>
              <Text className={styles.merchantDistance}>{merchant.distance}km</Text>
            </View>
            {merchant.hasCert ? (
              <Text className={styles.certBadge}>✓ 已认证商家</Text>
            ) : (
              <Text className={classnames(styles.certBadge, styles.noCertBadge)}>未认证</Text>
            )}
          </View>
        </View>
        <View className={styles.deliveryTags}>
          {merchant.deliveryMethods.map((method) => (
            <Text key={method} className={styles.deliveryTag}>
              {deliveryMethodMap[method].icon} {deliveryMethodMap[method].label}
            </Text>
          ))}
        </View>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 420rpx)' }}>
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📋</Text>
            基本信息
          </Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>营业地址</Text>
            <Text className={styles.infoValue}>{merchant.address}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>联系电话</Text>
            <Text className={styles.infoValue}>{merchant.phone}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>营业时间</Text>
            <Text className={styles.infoValue}>{merchant.businessHours}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>在售配件</Text>
            <Text className={styles.infoValue}>{merchant.partCount}件</Text>
          </View>
          {orders.length > 0 && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>我的订单</Text>
              <Text className={styles.infoValueLink}>{orders.length}单，点击查看 ›</Text>
            </View>
          )}
          {disputes.length > 0 && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>维权记录</Text>
              <Text className={styles.infoValueLink}>{disputes.length}条，点击查看 ›</Text>
            </View>
          )}
          <View className={styles.tagsRow}>
            {merchant.tags.map((tag, idx) => (
              <Text key={idx} className={styles.tag}>{tag}</Text>
            ))}
          </View>
        </View>

        {merchant.hasCert && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>🛡️</Text>
              营业资质
            </Text>
            {merchant.hasCert ? (
              <View className={styles.certCard}>
                <View className={styles.certItem}>
                  <Text className={styles.certIcon}>✅</Text>
                  <View className={styles.certContent}>
                    <Text className={styles.certTitle}>资质证书齐全</Text>
                    <Text className={styles.certDesc}>
                      许可证号：{merchant.licenseNo}
                    </Text>
                    <Text className={styles.certDesc}>
                      有效期至：{merchant.licenseExpiry}
                    </Text>
                    {merchant.certDescription && (
                      <Text className={styles.certDesc}>{merchant.certDescription}</Text>
                    )}
                  </View>
                </View>
              </View>
            ) : (
              <View className={styles.certCard}>
                <View className={styles.certItem}>
                  <Text className={styles.certIcon}>⚠️</Text>
                  <View className={styles.certContent}>
                    <Text className={styles.certTitle}>该商家暂未上传资质认证</Text>
                    <Text className={styles.certDesc}>
                      建议优先选择已认证商家，配件来源更有保障
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {merchant.recycleSource && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>♻️</Text>
              配件回收来源
            </Text>
            <View className={styles.certCard}>
              <View className={styles.certItem}>
                <Text className={styles.certIcon}>�</Text>
                <View className={styles.certContent}>
                  <Text className={styles.certTitle}>{merchant.recycleSource}</Text>
                  <Text className={styles.certDesc}>
                    所有拆车件均来自正规渠道，每件配件都有来源记录，可追溯。
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {merchant.parts && merchant.parts.length > 0 && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>🔧</Text>
              在售配件（{merchant.parts.length}）
            </Text>
            <View className={styles.partList}>
              {merchant.parts.map((part) => (
                <View
                  key={part.id}
                  className={styles.partCard}
                  onClick={() => handlePartTap(part)}
                >
                  <Image className={styles.partImage} src={part.imageUrl} mode="aspectFill" />
                  <View className={styles.partInfo}>
                    <Text className={styles.partName}>{part.name}</Text>
                    <View className={styles.partMetaRow}>
                      <PartTypeTag type={part.partType} size="small" />
                      <Text className={styles.partWarranty}>{part.warranty}</Text>
                    </View>
                    <Text className={styles.partPrice}>¥{part.price}</Text>
                  </View>
                  <View className={styles.partAction}>
                    <Text className={styles.partActionText}>询价/下单</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {orders.length > 0 && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>📦</Text>
              我的订单（{orders.length}）
            </Text>
            <View className={styles.orderList}>
              {orders.map((order) => (
                <View
                  key={order.id}
                  className={styles.orderCard}
                  onClick={() => handleOrderTap(order.id)}
                >
                  <View className={styles.orderTop}>
                    <Text className={styles.orderNo}>{order.id}</Text>
                    <Text className={styles.orderStatus}>{
                      {
                        pending_pay: '待付款',
                        pending_confirm: '备货中',
                        pending_ship: '待发货',
                        pending_receive: '待收货',
                        pending_install: '待安装',
                        completed: '已完成',
                        dispute: '维权中',
                      }[order.status]
                    }</Text>
                  </View>
                  <Text className={styles.orderPart}>{order.partName}</Text>
                  <Text className={styles.orderPrice}>¥{order.price} · 订金 ¥{order.deposit}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View className={styles.footer}>
        <View
          className={classnames(styles.footerBtn, styles.btnSecondary)}
          onClick={handleCall}
        >
          <Text>📞 联系商家</Text>
        </View>
        <View
          className={classnames(styles.footerBtn, styles.btnPrimary)}
          onClick={handleQuote}
        >
          <Text>发起询价</Text>
        </View>
      </View>
    </View>
  );
};

export default MerchantDetailPage;
