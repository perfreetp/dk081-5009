import React, { useState, useMemo } from 'react';
import { View, Text, Image, Textarea, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import { mockParts } from '@/data/parts';
import { mockMerchants } from '@/data/merchants';
import type { OrderItem } from '@/types';
import styles from './index.module.scss';

type QuestionType = 'mismatch' | 'quality' | 'shipping' | 'other';

const questionTypeList = [
  { value: 'mismatch' as const, label: '配件型号不符' },
  { value: 'quality' as const, label: '配件质量问题' },
  { value: 'shipping' as const, label: '物流配送问题' },
  { value: 'other' as const, label: '其他问题' },
];

const disputeStatusMap = {
  pending: { label: '待处理', className: 'statusPending' },
  reviewing: { label: '审核中', className: 'statusReviewing' },
  processing: { label: '处理中', className: 'statusProcessing' },
  resolved: { label: '已解决', className: 'statusResolved' },
  rejected: { label: '已驳回', className: 'statusRejected' },
};

const DisputePage = () => {
  const router = useRouter();
  const orderId = router.params.orderId as string;
  const disputeIdParam = router.params.disputeId as string | undefined;
  const { orders, updateOrder, addDispute, getDisputeByOrderId, getDisputeById } = useAppStore();

  const [questionType, setQuestionType] = useState<QuestionType>('mismatch');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const order = useMemo((): OrderItem | undefined => {
    return orders.find(o => o.id === orderId);
  }, [orderId, orders]);

  const merchant = useMemo(() => {
    if (!order) return null;
    return mockMerchants.find(m => m.id === order.merchantId) || null;
  }, [order]);

  const part = useMemo(() => {
    if (!order) return null;
    return mockParts.find(p => p.commonName === order.partName) || mockParts[0];
  }, [order]);

  const existingDispute = useMemo(() => {
    if (disputeIdParam) {
      return getDisputeById(disputeIdParam);
    }
    if (order) {
      return getDisputeByOrderId(order.id);
    }
    return null;
  }, [order, disputeIdParam, getDisputeById, getDisputeByOrderId]);

  const isViewMode = !!existingDispute;

  const canSubmit = useMemo(() => {
    return description.trim().length >= 10 && !isViewMode;
  }, [description, isViewMode]);

  const handleChooseImage = () => {
    console.info('[Dispute] choose image');
    const mockImage = `https://picsum.photos/seed/dispute-${Date.now()}/400`;
    if (images.length < 3) {
      setImages([...images, mockImage]);
    }
  };

  const handleRemoveImage = (index: number) => {
    console.info('[Dispute] remove image:', index);
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!canSubmit || !order) return;

    console.info('[Dispute] submit dispute:', { questionType, description, images });

    const id = `DIS${Date.now()}`;

    addDispute({
      id,
      orderId: order.id,
      merchantId: order.merchantId,
      questionType,
      description,
      images,
      status: 'pending',
      createdAt: new Date().toLocaleString('zh-CN'),
      progressNotes: [
        { time: new Date().toLocaleString('zh-CN'), operator: '用户', content: '提交维权申请' },
        { time: new Date().toLocaleString('zh-CN'), operator: '系统', content: '已受理，平台客服将在1-3个工作日内处理' },
      ],
    });

    updateOrder(order.id, {
      status: 'dispute',
      disputeId: id,
    });

    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  const handleBack = () => {
    Taro.navigateBack({ delta: 1 });
  };

  const handleGoOrder = () => {
    if (order) {
      Taro.redirectTo({ url: `/pages/order-detail/index?id=${order.id}` });
    } else {
      handleBack();
    }
  };

  const handleGoMerchant = () => {
    if (merchant) {
      Taro.navigateTo({ url: `/pages/merchant-detail/index?id=${merchant.id}` });
    }
  };

  if (!order) {
    return (
      <View className={styles.page}>
        <View className={styles.orderCard}>
          <Text className={styles.sectionTitle}>订单不存在</Text>
        </View>
      </View>
    );
  }

  const currentQuestionType = isViewMode ? existingDispute!.questionType : questionType;
  const currentDescription = isViewMode ? existingDispute!.description : description;
  const currentImages = isViewMode ? existingDispute!.images : images;
  const currentStatus = isViewMode ? existingDispute!.status : 'pending';
  const statusInfo = disputeStatusMap[currentStatus];

  return (
    <View className={styles.page}>
      <View className={styles.orderCard}>
        <View className={styles.orderHeader} onClick={handleGoOrder}>
          <Image
            className={styles.partImage}
            src={part?.imageUrl || 'https://picsum.photos/seed/car-part/200'}
            mode="aspectFill"
          />
          <View className={styles.orderInfo}>
            <Text className={styles.partName}>{order.partName}</Text>
            <Text className={styles.orderNo}>订单号：{order.id}</Text>
            <View className={styles.merchantRow} onClick={(e) => { e.stopPropagation(); handleGoMerchant(); }}>
              <Text className={styles.merchantText}>商家：{order.merchantName}</Text>
              <Text className={styles.merchantArrow}>›</Text>
            </View>
          </View>
          <Text className={styles.orderArrow}>›</Text>
        </View>

        {isViewMode && (
          <View className={styles.disputeHeader}>
            <View className={styles.disputeHeaderLeft}>
              <Text className={classnames(styles.statusBadge, styles[statusInfo.className])}>
                {statusInfo.label}
              </Text>
              <View>
                <Text className={styles.disputeIdText}>维权编号：{existingDispute!.id}</Text>
                <Text className={styles.disputeTimeText}>提交时间：{existingDispute!.createdAt}</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {!isViewMode ? (
        <ScrollView scrollY style={{ height: 'calc(100vh - 420rpx)' }}>
          <View className={styles.formSection}>
            <Text className={styles.sectionTitle}>申请平台介入</Text>

            <Text className={styles.formLabel}>请选择问题类型</Text>
            <View className={styles.questionTypeRow}>
              {questionTypeList.map((item) => (
                <View
                  key={item.value}
                  className={classnames(
                    styles.questionType,
                    questionType === item.value && styles.selected
                  )}
                  onClick={() => setQuestionType(item.value)}
                >
                  <Text>{item.label}</Text>
                </View>
              ))}
            </View>

            <Text className={styles.formLabel} style={{ marginTop: 40 }}>请详细描述问题（至少10字）</Text>
            <View className={styles.textAreaWrapper}>
              <Textarea
                className={styles.textArea}
                placeholder="请详细描述遇到的问题，包括配件情况、安装过程中发现的问题等，以便我们更快地为您处理"
                value={description}
                onInput={(e) => setDescription(e.detail.value)}
                maxlength={500}
                autoHeight
              />
              <Text className={styles.charCount}>{description.length}/500</Text>
            </View>

            <Text className={styles.formLabel} style={{ marginTop: 40 }}>上传凭证（最多3张）</Text>
            <View className={styles.imageUploader}>
              {currentImages.map((img, idx) => (
                <View key={idx} className={styles.uploadItem}>
                  <Image
                    className={styles.uploadedImage}
                    src={img}
                    mode="aspectFill"
                    onClick={() => handleRemoveImage(idx)}
                  />
                </View>
              ))}
              {currentImages.length < 3 && (
                <View className={styles.uploadItem} onClick={handleChooseImage}>
                  <Text className={styles.uploadIcon}>📷</Text>
                  <Text className={styles.uploadText}>点击上传</Text>
                </View>
              )}
            </View>
          </View>

          <View className={styles.tipsSection}>
            <Text className={styles.tipsTitle}>💡 温馨提示</Text>
            <View className={styles.tipsItem}>
              <Text className={styles.tipsIcon}>•</Text>
              <Text>请在24小时内提交维权申请，逾期将无法受理</Text>
            </View>
            <View className={styles.tipsItem}>
              <Text className={styles.tipsIcon}>•</Text>
              <Text>请保留好配件包装、标签等原始证据</Text>
            </View>
            <View className={styles.tipsItem}>
              <Text className={styles.tipsIcon}>•</Text>
              <Text>平台审核时间通常为1-3个工作日，请耐心等待</Text>
            </View>
            <View className={styles.tipsItem}>
              <Text className={styles.tipsIcon}>•</Text>
              <Text>如需紧急处理，请联系客服电话：400-888-8888</Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        <ScrollView scrollY style={{ height: 'calc(100vh - 420rpx)' }}>
          <View className={styles.progressSection}>
            <Text className={styles.sectionTitle}>维权详情</Text>

            <View className={styles.detailRow}>
              <Text className={styles.detailLabel}>问题类型</Text>
              <Text className={styles.detailValue}>
                {questionTypeList.find(t => t.value === currentQuestionType)?.label}
              </Text>
            </View>
            <View className={styles.detailRow}>
              <Text className={styles.detailLabel}>问题描述</Text>
              <Text className={classnames(styles.detailValue, styles.detailMulti)}>
                {currentDescription}
              </Text>
            </View>
            {currentImages && currentImages.length > 0 && (
              <View className={styles.detailRow}>
                <Text className={styles.detailLabel}>凭证图片</Text>
                <View className={styles.evidenceImages}>
                  {currentImages.map((img, idx) => (
                    <Image
                      key={idx}
                      className={styles.evidenceImage}
                      src={img}
                      mode="aspectFill"
                    />
                  ))}
                </View>
              </View>
            )}

            {existingDispute!.result && (
              <View className={styles.detailRow}>
                <Text className={styles.detailLabel}>处理结果</Text>
                <Text className={classnames(styles.detailValue, styles.detailResult)}>
                  {existingDispute!.result}
                </Text>
              </View>
            )}
          </View>

          <View className={styles.progressSection}>
            <Text className={styles.sectionTitle}>处理进度</Text>
            <View className={styles.timeline}>
              {existingDispute!.progressNotes && existingDispute!.progressNotes.map((note, idx) => (
                <View
                  key={idx}
                  className={classnames(
                    styles.timelineItem,
                    idx === 0 && styles.timelineActive
                  )}
                >
                  <View className={styles.timelineDot} />
                  <View className={styles.timelineContent}>
                    <Text className={styles.timelineTitle}>{note.operator}</Text>
                    <Text className={styles.timelineDesc}>{note.content}</Text>
                    <Text className={styles.timelineTime}>{note.time}</Text>
                  </View>
                </View>
              ))}
              {(!existingDispute!.progressNotes || existingDispute!.progressNotes.length === 0) && (
                <View className={styles.emptyTimeline}>
                  <Text className={styles.emptyText}>暂无处理进度</Text>
                </View>
              )}
            </View>
          </View>

          <View className={styles.contactSection}>
            <Text className={styles.contactTitle}>📞 客服联系方式</Text>
            <View className={styles.contactItem}>
              <Text className={styles.contactLabel}>客服电话</Text>
              <Text className={styles.contactValue}>400-888-8888</Text>
            </View>
            <View className={styles.contactItem}>
              <Text className={styles.contactLabel}>服务时间</Text>
              <Text className={styles.contactValue}>周一至周日 09:00-21:00</Text>
            </View>
          </View>
        </ScrollView>
      )}

      <View className={styles.footer}>
        <View
          className={classnames(styles.footerBtn, styles.btnSecondary)}
          onClick={handleBack}
        >
          <Text>返回</Text>
        </View>
        {!isViewMode && (
          <View
            className={classnames(styles.footerBtn, styles.btnPrimary)}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            <Text>提交申请</Text>
          </View>
        )}
        {isViewMode && (
          <View
            className={classnames(styles.footerBtn, styles.btnPrimary)}
            onClick={handleGoOrder}
          >
            <Text>查看订单</Text>
          </View>
        )}
      </View>

      {showSuccess && (
        <View className={styles.modalOverlay}>
          <View className={styles.modal}>
            <View className={styles.successIcon}>
              <Text className={styles.successIconText}>✓</Text>
            </View>
            <Text className={styles.successText}>提交成功</Text>
            <Text className={styles.successDesc}>
              您的维权申请已提交，平台将在1-3个工作日内处理，
              请保持手机畅通，工作人员会与您联系
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default DisputePage;
