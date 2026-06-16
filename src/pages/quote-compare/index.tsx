import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { mockQuoteSessions } from '@/data/quotes';
import { useAppStore } from '@/store';
import PartTypeTag from '@/components/PartTypeTag';
import styles from './index.module.scss';

const QuoteComparePage = () => {
  const router = useRouter();
  const sessionId = router.params.sessionId as string;
  const { addOrder } = useAppStore();
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);

  const session = useMemo(() => {
    return mockQuoteSessions.find(s => s.id === sessionId) || mockQuoteSessions[0];
  }, [sessionId]);

  const quotes = session?.quotes || [];
  const selectedQuote = quotes.find(q => q.id === selectedQuoteId);

  const handleSelectQuote = (quoteId: string) => {
    setSelectedQuoteId(quoteId === selectedQuoteId ? null : quoteId);
    console.info('[QuoteCompare] selected quote:', quoteId);
  };

  const handlePlaceOrder = () => {
    if (!selectedQuote) return;

    const newOrder = {
      id: `ORD${Date.now()}`,
      partName: session.partName,
      partType: selectedQuote.partType,
      merchantName: selectedQuote.merchantName,
      price: selectedQuote.price,
      deposit: Math.round(selectedQuote.price * 0.3),
      status: 'pending_pay' as const,
      createdAt: new Date().toLocaleString('zh-CN'),
      isLocal: selectedQuote.isLocal,
    };

    addOrder(newOrder);
    console.info('[QuoteCompare] created order:', newOrder.id);

    Taro.showToast({
      title: '下单成功',
      icon: 'success',
      duration: 1500,
    });

    setTimeout(() => {
      Taro.navigateTo({ url: `/pages/order-detail/index?id=${newOrder.id}` });
    }, 1500);
  };

  if (quotes.length < 2) {
    return (
      <View className={styles.page}>
        <View className={styles.noQuotes}>
          <Text className={styles.noQuotesIcon}>📋</Text>
          <Text className={styles.noQuotesText}>至少需要2家报价才能对比</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.partInfo}>
          <Text className={styles.partName}>{session.commonName}</Text>
          <Text className={styles.partCar}>🚗 {session.carModel}</Text>
        </View>
        <View className={styles.tipsRow}>
          <Text className={styles.tipsIcon}>💡</Text>
          <Text className={styles.tipsText}>
            对比价格、件型、质保等信息，选择最适合的商家下单
          </Text>
        </View>
      </View>

      <ScrollView scrollX className={styles.compareTable}>
        <View style={{ minWidth: `${quotes.length * 220 + 160}rpx` }}>
          <View className={styles.tableHeader}>
            <View className={classnames(styles.tableHeaderCell, styles.tableLabelCell)}>
              <Text className={styles.tableHeaderText}>对比项</Text>
            </View>
            {quotes.map((quote) => (
              <View key={quote.id} className={styles.tableHeaderCell}>
                <Text className={styles.tableHeaderText}>报价{quotes.indexOf(quote) + 1}</Text>
              </View>
            ))}
          </View>

          <View className={styles.tableBody}>
            <View className={styles.tableRow}>
              <View className={classnames(styles.tableCell, styles.tableLabelCell)}>
                <Text className={styles.tableLabel}>商家</Text>
              </View>
              {quotes.map((quote) => (
                <View key={quote.id} className={styles.tableCell}>
                  <Image
                    className={styles.merchantAvatar}
                    src={quote.merchantAvatar}
                    mode="aspectFill"
                  />
                  <Text className={styles.merchantName}>{quote.merchantName}</Text>
                </View>
              ))}
            </View>

            <View className={styles.tableRow}>
              <View className={classnames(styles.tableCell, styles.tableLabelCell)}>
                <Text className={styles.tableLabel}>件型</Text>
              </View>
              {quotes.map((quote) => (
                <View key={quote.id} className={styles.tableCell}>
                  <PartTypeTag type={quote.partType} />
                </View>
              ))}
            </View>

            <View className={styles.tableRow}>
              <View className={classnames(styles.tableCell, styles.tableLabelCell)}>
                <Text className={styles.tableLabel}>价格</Text>
              </View>
              {quotes.map((quote) => (
                <View key={quote.id} className={styles.tableCell}>
                  <Text className={styles.priceValue}>¥{quote.price}</Text>
                  {quote.originalPrice && (
                    <Text className={styles.originalPrice}>¥{quote.originalPrice}</Text>
                  )}
                </View>
              ))}
            </View>

            <View className={styles.tableRow}>
              <View className={classnames(styles.tableCell, styles.tableLabelCell)}>
                <Text className={styles.tableLabel}>质保</Text>
              </View>
              {quotes.map((quote) => (
                <View key={quote.id} className={styles.tableCell}>
                  <Text className={styles.warrantyText}>{quote.warranty}</Text>
                </View>
              ))}
            </View>

            <View className={styles.tableRow}>
              <View className={classnames(styles.tableCell, styles.tableLabelCell)}>
                <Text className={styles.tableLabel}>到货时间</Text>
              </View>
              {quotes.map((quote) => (
                <View key={quote.id} className={styles.tableCell}>
                  <Text className={styles.deliveryDays}>
                    {quote.isLocal ? '当日' : `${quote.deliveryDays}天`}
                  </Text>
                  <Text className={styles.merchantMeta}>
                    {quote.isLocal ? '同城自提' : '外地发货'}
                  </Text>
                </View>
              ))}
            </View>

            <View className={styles.tableRow}>
              <View className={classnames(styles.tableCell, styles.tableLabelCell)}>
                <Text className={styles.tableLabel}>商家说明</Text>
              </View>
              {quotes.map((quote) => (
                <View key={quote.id} className={styles.tableCell}>
                  {quote.message ? (
                    <Text className={styles.messageBox}>{quote.message}</Text>
                  ) : (
                    <Text className={styles.tableValue}>—</Text>
                  )}
                </View>
              ))}
            </View>

            <View className={styles.tableRow}>
              <View className={classnames(styles.tableCell, styles.tableLabelCell, styles.selectCell)}>
                <Text className={styles.tableLabel}>选择</Text>
              </View>
              {quotes.map((quote) => (
                <View key={quote.id} className={classnames(styles.tableCell, styles.selectCell)}>
                  <View
                    className={classnames(
                      styles.selectBtn,
                      selectedQuoteId === quote.id && styles.selected
                    )}
                    onClick={() => handleSelectQuote(quote.id)}
                  >
                    <Text className={styles.selectCheck}>✓</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View className={styles.footer}>
        <Text className={styles.selectedInfo}>
          {selectedQuote ? (
            <>
              已选择：{selectedQuote.merchantName}，
              <Text className={styles.selectedPrice}>¥{selectedQuote.price}</Text>
            </>
          ) : (
            '请选择一家报价进行下单'
          )}
        </Text>
        <View
          className={styles.placeOrderBtn}
          onClick={handlePlaceOrder}
          disabled={!selectedQuote}
        >
          <Text>确定下单</Text>
        </View>
      </View>
    </View>
  );
};

export default QuoteComparePage;
