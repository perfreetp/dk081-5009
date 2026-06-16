import React, { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import { mockCarModels } from '@/data/parts';
import type { CarModel } from '@/types';
import styles from './index.module.scss';

type Step = 'upload' | 'recognizing' | 'result';

const CarIdentifyPage = () => {
  const { setCurrentCar } = useAppStore();
  const [step, setStep] = useState<Step>('upload');
  const [selectedCar, setSelectedCar] = useState<CarModel | null>(null);
  const [recognizedCars] = useState<CarModel[]>(() => mockCarModels.slice(0, 4));

  const handleChooseImage = () => {
    console.info('[CarIdentify] choose image');
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

  const handleSelectCar = (car: CarModel) => {
    setSelectedCar(car);
    console.info('[CarIdentify] selected car:', car.brand, car.model);
  };

  const handleConfirm = () => {
    if (!selectedCar) return;
    setCurrentCar(selectedCar);
    console.info('[CarIdentify] confirmed car:', selectedCar.brand, selectedCar.model);
    Taro.showToast({
      title: '车型设置成功',
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
            <Text className={styles.uploadIcon}>📷</Text>
            <Text className={styles.uploadTitle}>上传行驶证照片</Text>
            <Text className={styles.uploadDesc}>
              请将行驶证正面平放拍摄{'\n'}
              确保号牌、品牌、型号等信息清晰可见{'\n'}
              系统将自动识别车型信息
            </Text>
            <View className={styles.uploadBtn} onClick={handleChooseImage}>
              <Text>📸 拍照或上传</Text>
            </View>
          </View>
        )}

        {step === 'recognizing' && (
          <View className={styles.recognizingSection}>
            <View className={styles.recognizingAnimation}>
              <Image
                className={styles.recognizingImg}
                src="https://picsum.photos/id/3/200/200"
                mode="aspectFill"
              />
              <View className={styles.recognizingOverlay}>
                <View className={styles.scanLine} />
              </View>
            </View>
            <Text className={styles.recognizingText}>正在识别行驶证信息...</Text>
            <Text className={styles.recognizingHint}>
              正在提取品牌、型号、车架号等信息，请稍候
            </Text>
          </View>
        )}

        {step === 'result' && (
          <>
            <View className={styles.resultSection}>
              <Text className={styles.resultTitle}>识别到以下车型</Text>
              <Text className={styles.resultHint}>请选择您的车型</Text>
              {recognizedCars.map((car, idx) => (
                <View
                  key={car.id}
                  className={classnames(
                    styles.carOption,
                    selectedCar?.id === car.id && styles.selected
                  )}
                  onClick={() => handleSelectCar(car)}
                >
                  <View className={styles.carRadio}>
                    <View className={styles.carRadioDot} />
                  </View>
                  <View className={styles.carInfo}>
                    <Text className={styles.carModel}>
                      {car.brand} {car.model}
                    </Text>
                    <Text className={styles.carDetail}>
                      {car.year}年款 | {car.displacement}
                      {car.vin && ` | ${car.vin}`}
                    </Text>
                  </View>
                  <Text className={styles.confidence}>
                    {idx === 0 ? '98%匹配' : idx === 1 ? '92%匹配' : '85%匹配'}
                  </Text>
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
            disabled={!selectedCar}
          >
            <Text>{selectedCar ? '确认，用该车找配件' : '请选择车型'}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default CarIdentifyPage;
