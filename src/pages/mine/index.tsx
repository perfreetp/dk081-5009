import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store';
import styles from './index.module.scss';

const MinePage = () => {
  const { currentCar } = useAppStore();
  const userCars = currentCar ? [currentCar] : [];

  const handleCarIdentify = () => {
    Taro.navigateTo({ url: '/pages/car-identify/index' });
  };

  const handleDispute = () => {
    Taro.navigateTo({ url: '/pages/dispute/index' });
  };

  const handleMenuTap = (action: string) => {
    console.info('[Mine] menu tap', action);
    switch (action) {
      case 'dispute':
        handleDispute();
        break;
      case 'car':
        handleCarIdentify();
        break;
      default:
        break;
    }
  };

  return (
    <View className={styles.page}>
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

      <View className={styles.menuSection}>
        <View className={styles.menuGroup}>
          <View className={styles.menuItem} onClick={() => handleMenuTap('car')}>
            <Text className={styles.menuIcon}>🚘</Text>
            <Text className={styles.menuText}>管理车型</Text>
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
          <View className={styles.menuItem} onClick={() => handleMenuTap('dispute')}>
            <Text className={styles.menuIcon}>⚖️</Text>
            <View style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <Text className={styles.menuText}>维权申诉</Text>
              <Text className={styles.disputeBadge}>1件进行中</Text>
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
    </View>
  );
};

export default MinePage;
