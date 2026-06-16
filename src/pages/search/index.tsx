import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Input, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import { mockParts, mockHotCategories } from '@/data/parts';
import PartTypeTag from '@/components/PartTypeTag';
import styles from './index.module.scss';

const hotKeywords = [
  { keyword: '发动机总成', count: 3280 },
  { keyword: '变速箱', count: 2450 },
  { keyword: '方向机', count: 1890 },
  { keyword: '发电机', count: 1620 },
  { keyword: '空调压缩机', count: 1350 },
  { keyword: '大灯总成', count: 1280 },
  { keyword: '保险杠', count: 1100 },
  { keyword: '减震器', count: 980 },
];

const SearchPage = () => {
  const router = useRouter();
  const { searchHistory, addSearchHistory, clearSearchHistory } = useAppStore();
  const [keyword, setKeyword] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const initialKeyword = router.params.keyword as string;
    if (initialKeyword) {
      const decoded = decodeURIComponent(initialKeyword);
      setKeyword(decoded);
      setHasSearched(true);
    }
  }, [router.params.keyword]);

  const searchResults = useMemo(() => {
    if (!keyword.trim()) return [];
    const kw = keyword.trim().toLowerCase();
    return mockParts.filter(
      (p) =>
        p.commonName.toLowerCase().includes(kw) ||
        p.name.toLowerCase().includes(kw) ||
        p.category.toLowerCase().includes(kw)
    );
  }, [keyword]);

  const handleSearch = () => {
    if (!keyword.trim()) return;
    addSearchHistory(keyword.trim());
    setHasSearched(true);
    console.info('[Search] search keyword:', keyword.trim());
  };

  const handleHistoryTap = (kw: string) => {
    setKeyword(kw);
    addSearchHistory(kw);
    setHasSearched(true);
  };

  const handleClearHistory = () => {
    Taro.showModal({
      title: '提示',
      content: '确定清空搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          clearSearchHistory();
        }
      },
    });
  };

  const handleCancel = () => {
    Taro.navigateBack();
  };

  const handleResultTap = (id: string) => {
    Taro.navigateTo({ url: `/pages/part-detail/index?id=${id}` });
  };

  const showHistory = !hasSearched && !keyword.trim();

  return (
    <View className={styles.page}>
      <View className={styles.searchHeader}>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索配件名称"
            placeholderClass={styles.searchPlaceholder}
            value={keyword}
            onInput={(e) => setKeyword(e.detail.value)}
            onConfirm={handleSearch}
            confirmType="search"
            focus
          />
        </View>
        <View className={styles.cancelBtn} onClick={handleCancel}>
          <Text>取消</Text>
        </View>
      </View>

      <View className={styles.content}>
        {showHistory ? (
          <>
            {searchHistory.length > 0 && (
              <View className={styles.historySection}>
                <View className={styles.sectionHeader}>
                  <Text className={styles.sectionTitle}>搜索历史</Text>
                  <View className={styles.clearBtn} onClick={handleClearHistory}>
                    <Text>清空</Text>
                  </View>
                </View>
                <View className={styles.historyTags}>
                  {searchHistory.map((kw, idx) => (
                    <View
                      key={idx}
                      className={styles.historyTag}
                      onClick={() => handleHistoryTap(kw)}
                    >
                      <Text>{kw}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View className={styles.hotSection}>
              <View className={styles.sectionHeader}>
                <Text className={styles.sectionTitle}>热门搜索</Text>
              </View>
              <View className={styles.hotList}>
                {hotKeywords.map((item, idx) => (
                  <View
                    key={idx}
                    className={styles.hotItem}
                    onClick={() => handleHistoryTap(item.keyword)}
                  >
                    <Text
                      className={classnames(
                        styles.hotRank,
                        idx === 0 && styles.rankTop1,
                        idx === 1 && styles.rankTop2,
                        idx === 2 && styles.rankTop3,
                        idx > 2 && styles.rankOther
                      )}
                    >
                      {idx + 1}
                    </Text>
                    <Text className={styles.hotKeyword}>{item.keyword}</Text>
                    <Text className={styles.hotCount}>{item.count}人搜过</Text>
                  </View>
                ))}
              </View>
            </View>

            {searchHistory.length === 0 && (
              <View className={styles.noContent}>
                <Text className={styles.noContentIcon}>🔎</Text>
                <Text className={styles.noContentText}>输入关键词开始搜索</Text>
              </View>
            )}
          </>
        ) : (
          <>
            {searchResults.length > 0 ? (
              <View className={styles.resultList}>
                {searchResults.map((part) => (
                  <View
                    key={part.id}
                    className={styles.resultCard}
                    onClick={() => handleResultTap(part.id)}
                  >
                    <Image
                      className={styles.resultImage}
                      src={part.imageUrl}
                      mode="aspectFill"
                    />
                    <View className={styles.resultInfo}>
                      <View>
                        <Text className={styles.resultName}>{part.commonName}</Text>
                        <Text className={styles.resultCommonName}>{part.category}</Text>
                        <View className={styles.resultTypes}>
                          {part.partTypes.map((pt) => (
                            <PartTypeTag key={pt.type} type={pt.type} size="small" />
                          ))}
                        </View>
                      </View>
                      <Text className={styles.resultPrice}>
                        <Text className={styles.resultPriceLabel}>拆车件</Text>
                        ¥{part.partTypes[0].priceRange.split('-')[0]}起
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className={styles.noResult}>
                <Text className={styles.noResultIcon}>😕</Text>
                <Text className={styles.noResultTitle}>没有找到相关配件</Text>
                <Text className={styles.noResultDesc}>换个关键词试试，如"发动机"、"变速箱"</Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};

export default SearchPage;
