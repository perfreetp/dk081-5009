import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { mockMerchants } from '@/data/merchants';
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

  const handleCall = () => {
    console.info('[MerchantDetail] call merchant:', merchant.phone);
    Taro.makePhoneCall({
      phoneNumber: merchant.phone,
    });
  };

  const handleQuote = () => {
    console.info('[MerchantDetail] start quote with merchant:', merchant.name);
    Taro.showToast({
      title: '已发送询价',
      icon: 'success',
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
      </View>

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
        <View className={styles.tagsRow}>
          {merchant.tags.map((tag, idx) => (
            <Text key={idx} className={styles.tag}>{tag}</Text>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>🚚</Text>
          配送方式
        </Text>
        <View className={styles.deliveryMethods}>
          {(['self_pickup', 'local_delivery', 'national_shipping'] as const).map((method) => {
            const available = merchant.deliveryMethods.includes(method);
            const config = deliveryMethodMap[method];
            return (
              <View
                key={method}
                className={classnames(
                  styles.deliveryMethod,
                  available && styles.active
                )}
              >
                <Text className={styles.deliveryIcon}>{config.icon}</Text>
                <Text className={styles.deliveryText}>
                  {config.label}
                  {available ? '' : '\n暂不支持'}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📜</Text>
          营业资质
        </Text>
        {merchant.hasCert ? (
          <View className={styles.certCard}>
            <View className={styles.certItem}>
              <Text className={styles.certIcon}>✅</Text>
              <View className={styles.certContent}>
                <Text className={styles.certTitle}>营业执照</Text>
                <Text className={styles.certDesc}>执照编号：{merchant.licenseNo}</Text>
                <Text className={styles.certDesc}>有效期至：{merchant.licenseExpiry}</Text>
              </View>
            </View>
            <View className={styles.certItem}>
              <Text className={styles.certIcon}>🔄</Text>
              <View className={styles.certContent}>
                <Text className={styles.certTitle}>再生资源经营备案</Text>
                <Text className={styles.certDesc}>已取得废旧物资回收经营资质</Text>
              </View>
            </View>
            {merchant.certDescription && (
              <View className={styles.certItem}>
                <Text className={styles.certIcon}>ℹ️</Text>
                <View className={styles.certContent}>
                  <Text className={styles.certTitle}>资质说明</Text>
                  <Text className={styles.certDesc}>{merchant.certDescription}</Text>
                </View>
              </View>
            )}
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

      {merchant.recycleSource && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>♻️</Text>
            配件回收来源
          </Text>
          <View className={styles.certCard}>
            <View className={styles.certItem}>
              <Text className={styles.certIcon}>📦</Text>
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
          <Text>💬 发起询价</Text>
        </View>
      </View>
    </View>
  );
};

export default MerchantDetailPage;
