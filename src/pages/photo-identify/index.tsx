import React, { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import styles from './index.module.scss';

type Step = 'upload' | 'recognizing' | 'result';

interface IdentifiedPart {
  name: string;
  category: string;
  desc: string;
  confidence: string;
}

const PhotoIdentifyPage = () => {
  const { setIdentifiedPart } = useAppStore();
  const [step, setStep] = useState<Step>('upload');
  const [selectedPart, setSelectedPart] = useState<IdentifiedPart | null>(null);

  const recognizedParts: IdentifiedPart[] = [
    { name: '发电机', category: '发电机', desc: '皮带轮侧可见明显损坏，线圈外露', confidence: '96%' },
    { name: '空调压缩机', category: '空调压缩机', desc: '泵体有渗漏痕迹，插头破损', confidence: '88%' },
    { name: '方向机', category: '方向机', desc: '转向拉杆球头防尘套破裂', confidence: '75%' },
  ];

  const handleChooseImage = () => {
    console.info('[PhotoIdentify] choose image');
    Taro.showActionSheet({
      itemList: ['拍照', '从相册选择'],
      success: () => {
        setStep('recognizing');
        setTimeout(() => {
          setStep('result');
        }, 2500);
      },
    });
  };

  const handleSelectPart = (part: IdentifiedPart) => {
    setSelectedPart(part);
    console.info('[PhotoIdentify] selected part:', part.name);
  };

  const handleConfirm = () => {
    if (!selectedPart) return;
    setIdentifiedPart({
      name: selectedPart.name,
      category: selectedPart.category,
    });
    console.info('[PhotoIdentify] confirmed part:', selectedPart.name);
    Taro.showToast({
      title: '识别成功',
      icon: 'success',
      duration: 1500,
    });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: 'upload', label: '上传' },
      { key: 'recognizing', label: '识别' },
      { key: 'result', label: '确认' },
    ];
    const stepOrder = ['upload', 'recognizing', 'result'];
    const currentIdx = stepOrder.indexOf(step);

    return (
      <View className={styles.stepIndicator}>
        {steps.map((s, idx) => {
          const isDone = idx < currentIdx;
          const isActive = idx === currentIdx;
          return (
            <React.Fragment key={s.key}>
              <View
                className={classnames(
                  styles.step,
                  isActive && styles.stepActive,
                  isDone && styles.stepDone
                )}
              >
                <View className={styles.stepCircle}>
                  <Text>{isDone ? '✓' : idx + 1}</Text>
                </View>
                <Text className={styles.stepText}>{s.label}</Text>
              </View>
              {idx < steps.length - 1 && (
                <View
                  className={classnames(
                    styles.stepLine,
                    idx < currentIdx && styles.stepLineDone
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  return (
    <View className={styles.page}>
      {renderStepIndicator()}

      <View className={styles.content}>
        {step === 'upload' && (
          <View className={styles.uploadSection}>
            <Text className={styles.uploadIcon}>🖼️</Text>
            <Text className={styles.uploadTitle}>上传损坏部位照片</Text>
            <Text className={styles.uploadDesc}>
              请拍摄损坏部位的清晰照片{'\n'}
              多角度拍摄识别更准确{'\n'}
              系统将智能识别需要更换的配件
            </Text>
            <View className={styles.uploadBtn} onClick={handleChooseImage}>
              <Text>📸 拍照或上传</Text>
            </View>
            <View className={styles.tipsCard}>
              <Text className={styles.tipsTitle}>💡 拍照小贴士</Text>
              <Text className={styles.tipsText}>
                1. 确保光线充足，对焦清晰{'\n'}
                2. 拍摄损坏部位的特写和整体位置{'\n'}
                3. 如有多角度照片，识别更精准
              </Text>
            </View>
          </View>
        )}

        {step === 'recognizing' && (
          <View className={styles.recognizingSection}>
            <View className={styles.recognizingAnimation}>
              <Image
                className={styles.recognizingImg}
                src="https://picsum.photos/id/201/300/300"
                mode="aspectFill"
              />
              <View className={styles.recognizingOverlay}>
                <View className={styles.scanLine} />
              </View>
            </View>
            <Text className={styles.recognizingText}>正在智能识别损坏部位...</Text>
            <Text className={styles.recognizingHint}>
              AI正在分析照片特征，匹配配件数据库，请稍候
            </Text>
          </View>
        )}

        {step === 'result' && (
          <>
            <View className={styles.resultSection}>
              <Text className={styles.resultTitle}>识别到以下可能损坏的配件</Text>
              <Text className={styles.resultHint}>请确认需要更换的配件</Text>
              {recognizedParts.map((part, idx) => (
                <View
                  key={idx}
                  className={classnames(
                    styles.partOption,
                    selectedPart?.name === part.name && styles.selected
                  )}
                  onClick={() => handleSelectPart(part)}
                >
                  <View className={styles.partRadio}>
                    <View className={styles.partRadioDot} />
                  </View>
                  <View className={styles.partInfo}>
                    <Text className={styles.partName}>{part.name}</Text>
                    <Text className={styles.partCategory}>{part.category}</Text>
                    <Text className={styles.partDesc}>{part.desc}</Text>
                  </View>
                  <Text className={styles.confidence}>{part.confidence}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>

      {step === 'result' && (
        <View className={styles.footer}>
          <View
            className={styles.confirmBtn}
            onClick={handleConfirm}
            disabled={!selectedPart}
          >
            <Text>{selectedPart ? '确认，去询价' : '请选择配件'}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default PhotoIdentifyPage;
