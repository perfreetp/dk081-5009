import React, { useState, useMemo } from 'react';
import { View, Text, Image, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import { mockParts } from '@/data/parts';
import type { OrderItem } from '@/types';
import styles from './index.module.scss';

type QuestionType = 'mismatch' | 'quality' | 'shipping' | 'other';

const questionTypeList = [
  { value: 'mismatch' as const, label: '配件型号不符' },
  { value: 'quality' as const, label: '配件质量问题' },
  { value: 'shipping' as const, label: '物流配送问题' },
  { value: 'other' as const, label: '其他问题' },
];

const disputeTimeline = [
  { key: 'submit', title: '提交申请', desc: '您的维权申请已提交' },
  { key: 'review', title: '平台审核', desc: '平台正在核实您提交的信息' },
  { key: 'process', title: '协调处理', desc: '平台正在协调商家与您沟通解决方案' },
  { key: 'complete', title: '处理完成', desc: '维权申请已处理完成' },
];

const DisputePage = () => {
  const router = useRouter();
  const orderId = router.params.orderId as string;
  const { orders, updateOrder, addDispute } = useAppStore();

  const [questionType, setQuestionType] = useState<QuestionType>('mismatch');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [disputeId, setDisputeId] = useState<string>('');
  const [createdAt, setCreatedAt] = useState<string>('');

  const order = useMemo((): OrderItem | undefined => {
    return orders.find(o => o.id === orderId);
  }, [orderId, orders]);

  const part = useMemo(() => {
    if (!order) return null;
    return mockParts.find(p => p.commonName === order.partName) || mockParts[0];
  }, [order]);

  const canSubmit = useMemo(() => {
    return description.trim().length >= 10 && !submitted;
  }, [description, submitted]);

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
    setDisputeId(id);
    setCreatedAt(new Date().toLocaleString('zh-CN'));

    addDispute({
      id,
      orderId: order.id,
      questionType,
      description,
      images,
      status: 'pending',
      createdAt: new Date().toLocaleString('zh-CN'),
    });

    updateOrder(order.id, {
      status: 'dispute',
      disputeId: id,
    });

    setSubmitted(true);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  const handleBack = () => {
    Taro.navigateBack({ delta: 1 });
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

  const currentStep = submitted ? 1 : -1;

  return (
    <View className={styles.page}>
      <View className={styles.orderCard}>
        <View className={styles.orderHeader}>
          <Image
            className={styles.partImage}
            src={part?.imageUrl || 'https://picsum.photos/seed/car-part/200'}
            mode="aspectFill"
          />
          <View className={styles.orderInfo}>
            <Text className={styles.partName}>{order.partName}</Text>
            <Text className={styles.orderNo}>订单号：{order.id}</Text>
            <Text className={styles.orderNo}>商家：{order.merchantName}</Text>
          </View>
        </View>
      </View>

      {!submitted ? (
        <>
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
              {images.map((img, idx) => (
                <View key={idx} className={styles.uploadItem}>
                  <Image
                    className={styles.uploadedImage}
                    src={img}
                    mode="aspectFill"
                    onClick={() => handleRemoveImage(idx)}
                  />
                </View>
              ))}
              {images.length < 3 && (
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
        </>
      ) : (
        <View className={styles.progressSection}>
          <Text className={styles.statusBadge}>处理中</Text>
          <Text className={styles.sectionTitle}>维权申请进度</Text>
          <Text className={styles.formLabel}>维权编号：{disputeId}</Text>
          <Text className={styles.formLabel}>提交时间：{createdAt}</Text>
          <Text className={styles.formLabel}>问题类型：{questionTypeList.find(t => t.value === questionType)?.label}</Text>

          <View className={styles.timeline}>
            {disputeTimeline.map((item, idx) => {
              const active = idx <= currentStep;
              return (
                <View
                  key={item.key}
                  className={classnames(styles.timelineItem, active && styles.active)}
                >
                  <View className={styles.timelineDot} />
                  <View className={styles.timelineContent}>
                    <Text className={styles.timelineTitle}>{item.title}</Text>
                    <Text className={styles.timelineDesc}>{item.desc}</Text>
                    {active && (
                      <Text className={styles.timelineTime}>
                        {idx === 0 ? createdAt : '预计1-3个工作日'}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      <View className={styles.footer}>
        <View
          className={classnames(styles.footerBtn, styles.btnSecondary)}
          onClick={handleBack}
        >
          <Text>{submitted ? '返回订单' : '取消'}</Text>
        </View>
        {!submitted && (
          <View
            className={classnames(styles.footerBtn, styles.btnPrimary)}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            <Text>提交申请</Text>
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
