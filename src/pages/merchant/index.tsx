import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { mockMerchants } from '@/data/merchants';
import styles from './index.module.scss';

type FilterType = 'all' | 'local' | 'ship';

const MerchantPage = () => {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredMerchants = useMemo(() => {
    let list = [...mockMerchants];
    if (filter === 'local') list = list.filter((m) => m.isLocal);
    if (filter === 'ship') list = list.filter((m) => !m.isLocal);
    return list.sort((a, b) => a.distance - b.distance);
  }, [filter]);

  const handleMerchantTap = (id: string) => {
    Taro.navigateTo({ url: `/pages/merchant-detail/index?id=${id}` });
  };

  return (
    <View className={styles.page}>
      <View className={styles.filterBar}>
        {(['all', 'local', 'ship'] as FilterType[]).map((type) => (
          <View
            key={type}
            className={classnames(styles.filterBtn, filter === type && styles.active)}
            onClick={() => setFilter(type)}
          >
            <Text style={{ fontSize: '24rpx' }}>
              {type === 'all' ? '全部' : type === 'local' ? '同城自提' : '外地发货'}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView scrollY className={styles.merchantList} style={{ height: 'calc(100vh - 120rpx)' }}>
        {filteredMerchants.map((merchant) => (
          <View
            key={merchant.id}
            className={styles.merchantCard}
            onClick={() => handleMerchantTap(merchant.id)}
          >
            <View className={styles.merchantTop}>
              <Image className={styles.merchantAvatar} src={merchant.avatar} mode="aspectFill" />
              <View className={styles.merchantInfo}>
                <View style={{ display: 'flex', alignItems: 'center' }}>
                  <Text className={styles.merchantName}>{merchant.name}</Text>
                  {merchant.isLocal ? (
                    <Text className={styles.localBadge}>同城自提</Text>
                  ) : (
                    <Text className={styles.shipBadge}>外地发货</Text>
                  )}
                </View>
                <View className={styles.merchantMeta}>
                  <Text className={styles.merchantRating}>⭐ {merchant.rating}</Text>
                  <Text className={styles.merchantDistance}>{merchant.distance}km</Text>
                  <Text className={styles.merchantPartCount}>在售{merchant.partCount}件</Text>
                </View>
                {merchant.hasCert && (
                  <Text className={styles.merchantCertBadge}>✓ 已认证</Text>
                )}
              </View>
            </View>

            <View className={styles.merchantTags}>
              {merchant.tags.map((tag, idx) => (
                <Text key={idx} className={styles.merchantTag}>{tag}</Text>
              ))}
            </View>

            <Text className={styles.merchantAddress}>📍 {merchant.address}</Text>

            {merchant.recycleSource && (
              <View className={styles.merchantSource}>
                <Text className={styles.sourceIcon}>♻️</Text>
                <Text className={styles.sourceText}>回收来源：{merchant.recycleSource}</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default MerchantPage;
