import React, { useState } from 'react';
import { View, Text, Image, Slider, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import { mockHotCategories, mockParts } from '@/data/parts';
import PartTypeTag from '@/components/PartTypeTag';
import styles from './index.module.scss';

const FindPage = () => {
  const { currentCar, budget, setBudget, isUrgent, setIsUrgent, addSearchHistory, identifiedPart, setIdentifiedPart } = useAppStore();
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = () => {
    if (!searchValue.trim()) return;
    addSearchHistory(searchValue.trim());
    Taro.navigateTo({ url: `/pages/search/index?keyword=${encodeURIComponent(searchValue.trim())}` });
    setSearchValue('');
  };

  const handleCarIdentify = () => {
    Taro.navigateTo({ url: '/pages/car-identify/index' });
  };

  const handlePhotoIdentify = () => {
    Taro.navigateTo({ url: '/pages/photo-identify/index' });
  };

  const handleCategoryTap = (name: string) => {
    addSearchHistory(name);
    Taro.navigateTo({ url: `/pages/search/index?keyword=${encodeURIComponent(name)}` });
  };

  const handlePartTap = (id: string) => {
    Taro.navigateTo({ url: `/pages/part-detail/index?id=${id}` });
  };

  const clearIdentifiedPart = () => {
    setIdentifiedPart(null);
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.carInfoCard}>
          {currentCar ? (
            <View className={styles.carInfoFilled}>
              <View className={styles.carInfoTop}>
                <Text className={styles.carModelText}>
                  {currentCar.brand} {currentCar.model}
                </Text>
                <View className={styles.carChangeBtn} onClick={handleCarIdentify}>
                  <Text style={{ fontSize: '22rpx', color: '#fff' }}>更换车型</Text>
                </View>
              </View>
              <Text className={styles.carDetailText}>
                {currentCar.year}年 | {currentCar.displacement}
              </Text>
            </View>
          ) : (
            <View className={styles.carInfoTop}>
              <View className={styles.carInfoEmpty}>
                <Text className={styles.carInfoEmptyText}>添加您的爱车，精准匹配配件</Text>
              </View>
              <View className={styles.carInfoAddBtn} onClick={handleCarIdentify}>
                <Text style={{ fontSize: '24rpx', color: '#fff' }}>行驶证识别</Text>
              </View>
            </View>
          )}
        </View>

        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索配件名称，如发动机、方向机"
            placeholderClass={styles.searchPlaceholder}
            value={searchValue}
            onInput={(e) => setSearchValue(e.detail.value)}
            onConfirm={handleSearch}
            confirmType="search"
          />
          {searchValue && (
            <View className={styles.searchBtn} onClick={handleSearch}>
              <Text style={{ fontSize: '28rpx', color: '#fff' }}>搜索</Text>
            </View>
          )}
        </View>

        {identifiedPart && (
          <View className={styles.identifiedResult}>
            <View className={styles.identifiedInfo}>
              <Text className={styles.identifiedIcon}>✅</Text>
              <View style={{ flex: 1 }}>
                <Text className={styles.identifiedTitle}>已识别：{identifiedPart.name}</Text>
                <Text className={styles.identifiedCategory}>{identifiedPart.category}</Text>
              </View>
            </View>
            <View className={styles.identifiedActions}>
              <View className={styles.identifiedBtn} onClick={clearIdentifiedPart}>
                <Text style={{ fontSize: '24rpx', color: '#86909C' }}>清除</Text>
              </View>
              <View className={styles.identifiedBtnPrimary} onClick={() => handleCategoryTap(identifiedPart.name)}>
                <Text style={{ fontSize: '24rpx', color: '#fff' }}>去询价</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <View className={styles.quickActions}>
        <View className={styles.actionCard} onClick={handleCarIdentify}>
          <Text className={styles.actionIcon}>📷</Text>
          <Text className={styles.actionTitle}>行驶证识车</Text>
          <Text className={styles.actionDesc}>拍照识别车型</Text>
        </View>
        <View className={styles.actionCard} onClick={handlePhotoIdentify}>
          <Text className={styles.actionIcon}>🖼️</Text>
          <Text className={styles.actionTitle}>拍照识件</Text>
          <Text className={styles.actionDesc}>识别损坏部位</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>热门总成</Text>
          <Text className={styles.sectionMore}>更多 ›</Text>
        </View>
        <View className={styles.categoryGrid}>
          {mockHotCategories.slice(0, 8).map((cat) => (
            <View
              key={cat.id}
              className={styles.categoryItem}
              onClick={() => handleCategoryTap(cat.name)}
            >
              <Text className={styles.categoryIcon}>{cat.icon}</Text>
              <Text className={styles.categoryName}>{cat.name}</Text>
              <Text className={styles.categoryCount}>{cat.count}件</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>件型说明</Text>
        </View>
        <View className={styles.partTypesCard}>
          <View className={styles.partTypeRow}>
            <View className={styles.partTypeLabel}>
              <PartTypeTag type="used" />
            </View>
            <View className={styles.partTypeContent}>
              <Text className={styles.partTypeTitle}>拆车件</Text>
              <Text className={styles.partTypeDesc}>原车拆下，性能稳定，价格最低，适合预算有限的车主</Text>
            </View>
          </View>
          <View className={styles.partTypeRow}>
            <View className={styles.partTypeLabel}>
              <PartTypeTag type="remanufactured" />
            </View>
            <View className={styles.partTypeContent}>
              <Text className={styles.partTypeTitle}>再制造件</Text>
              <Text className={styles.partTypeDesc}>核心部件全新更换，质保更长，可靠性接近新件</Text>
            </View>
          </View>
          <View className={styles.partTypeRow}>
            <View className={styles.partTypeLabel}>
              <PartTypeTag type="aftermarket" />
            </View>
            <View className={styles.partTypeContent}>
              <Text className={styles.partTypeTitle}>副厂件</Text>
              <Text className={styles.partTypeDesc}>品牌副厂生产，性价比高，质保期较短</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>找件设置</Text>
        </View>
        <View className={styles.budgetSection}>
          <View className={styles.budgetRow}>
            <Text className={styles.budgetLabel}>预算上限</Text>
            <Text className={styles.budgetValue}>
              {budget > 0 ? `¥${budget}` : '不限'}
            </Text>
          </View>
          <Slider
            className={styles.budgetSlider}
            min={0}
            max={10000}
            step={100}
            value={budget}
            activeColor="#1A6DFF"
            blockSize={20}
            onInput={(e) => setBudget(e.detail.value)}
          />
          <View className={styles.urgentRow}>
            <Text className={styles.urgentLabel}>急件标签</Text>
            <View
              className={classnames(styles.urgentToggle, isUrgent && styles.active)}
              onClick={() => setIsUrgent(!isUrgent)}
            >
              <View className={styles.urgentToggleCircle} />
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>推荐配件</Text>
          <Text className={styles.sectionMore}>更多 ›</Text>
        </View>
        <View className={styles.hotPartsList}>
          {mockParts.slice(0, 4).map((part) => (
            <View key={part.id} className={styles.hotPartCard} onClick={() => handlePartTap(part.id)}>
              <Image
                className={styles.hotPartImage}
                src={part.imageUrl}
                mode="aspectFill"
              />
              <View className={styles.hotPartInfo}>
                <View>
                  <Text className={styles.hotPartName}>{part.commonName}</Text>
                  <Text className={styles.hotPartCategory}>{part.category}</Text>
                </View>
                <View className={styles.hotPartTypes}>
                  {part.partTypes.map((pt) => (
                    <PartTypeTag key={pt.type} type={pt.type} size="small" />
                  ))}
                </View>
                <View className={styles.hotPartPriceRow}>
                  <Text className={styles.hotPartPriceLabel}>拆车件</Text>
                  <Text className={styles.hotPartPrice}>
                    ¥{part.partTypes[0].priceRange.split('-')[0]}起
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default FindPage;
