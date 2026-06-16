import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { mockQuoteSessions } from '@/data/quotes';
import PartTypeTag from '@/components/PartTypeTag';
import UrgentTag from '@/components/UrgentTag';
import styles from './index.module.scss';

type TabType = 'active' | 'closed';

const QuotePage = () => {
  const [tab, setTab] = useState<TabType>('active');

  const activeSessions = useMemo(
    () => mockQuoteSessions.filter((s) => s.status === 'active'),
    []
  );
  const closedSessions = useMemo(
    () => mockQuoteSessions.filter((s) => s.status === 'closed'),
    []
  );

  const currentSessions = tab === 'active' ? activeSessions : closedSessions;
  const totalUnread = activeSessions.reduce((sum, s) => sum + s.unreadCount, 0);

  const handleSessionTap = (id: string) => {
    const session = mockQuoteSessions.find((s) => s.id === id);
    if (session && session.quotes.length >= 2) {
      Taro.navigateTo({ url: `/pages/quote-compare/index?sessionId=${id}` });
    }
  };

  const handleCompare = (sessionId: string) => {
    Taro.navigateTo({ url: `/pages/quote-compare/index?sessionId=${sessionId}` });
  };

  return (
    <View className={styles.page}>
      <View className={styles.tabBar}>
        {(['active', 'closed'] as TabType[]).map((t) => (
          <View key={t} className={styles.tabItem} onClick={() => setTab(t)}>
            <Text className={classnames(styles.tabText, t === tab && styles.tabTextActive)}>
              {t === 'active' ? '进行中' : '已结束'}
            </Text>
            {t === tab && <View className={styles.tabUnderline} />}
            {t === 'active' && totalUnread > 0 && (
              <View className={styles.unreadDot}>
                <Text className={styles.unreadDotText}>{totalUnread}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 160rpx)' }}>
        <View className={styles.sessionList}>
          {currentSessions.map((session) => (
            <View key={session.id} className={styles.sessionCard} onClick={() => handleSessionTap(session.id)}>
              <View className={styles.sessionTop}>
                <Text className={styles.sessionPartName}>{session.commonName}</Text>
                <Text
                  className={classnames(
                    styles.sessionBadge,
                    session.status === 'active' ? styles.badgeActive : styles.badgeClosed
                  )}
                >
                  {session.status === 'active' ? '进行中' : '已结束'}
                </Text>
              </View>

              <Text className={styles.sessionCarModel}>🚗 {session.carModel}</Text>

              <View className={styles.sessionTags}>
                {session.budget && session.budget > 0 && (
                  <Text className={classnames(styles.sessionTag, styles.tagBudget)}>
                    预算 ¥{session.budget}
                  </Text>
                )}
                {session.isUrgent && <UrgentTag size="small" />}
              </View>

              {session.quotes.length > 0 ? (
                <>
                  {session.quotes.slice(0, 2).map((quote) => (
                    <View key={quote.id} className={styles.quoteCard}>
                      <View className={styles.quoteCardTop}>
                        <Image className={styles.quoteAvatar} src={quote.merchantAvatar} mode="aspectFill" />
                        <Text className={styles.quoteMerchantName}>{quote.merchantName}</Text>
                        <Text className={styles.quotePriceInline}>¥{quote.price}</Text>
                      </View>
                      <View className={styles.quoteCardMeta}>
                        <PartTypeTag type={quote.partType} size="small" />
                        <Text className={styles.quoteMetaText}>{quote.warranty}</Text>
                        <Text className={styles.quoteMetaText}>
                          {quote.isLocal ? '同城' : `${quote.deliveryDays}天到`}
                        </Text>
                      </View>
                      {quote.message && (
                        <Text className={styles.quoteMessage}>{quote.message}</Text>
                      )}
                    </View>
                  ))}

                  <View className={styles.quoteSummary}>
                    <Text className={styles.quoteCount}>共{session.quotes.length}家报价</Text>
                    {session.quotes.length >= 2 && (
                      <View className={styles.quoteBtn} onClick={(e) => { e.stopPropagation(); handleCompare(session.id); }}>
                        <Text style={{ fontSize: '24rpx', color: '#fff' }}>一键对比</Text>
                      </View>
                    )}
                  </View>
                </>
              ) : (
                <View className={styles.noQuotes}>
                  <Text className={styles.noQuotesText}>等待商家报价中...</Text>
                  <Text className={styles.noQuotesHint}>已向附近商家发送询价</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default QuotePage;
