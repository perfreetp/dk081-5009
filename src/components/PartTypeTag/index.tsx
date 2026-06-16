import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface PartTypeTagProps {
  type: 'used' | 'remanufactured' | 'aftermarket';
  size?: 'small' | 'normal';
}

const typeMap: Record<string, { label: string; className: string }> = {
  used: { label: '拆车件', className: 'tagUsed' },
  remanufactured: { label: '再制造件', className: 'tagRemanufactured' },
  aftermarket: { label: '副厂件', className: 'tagAftermarket' },
};

const PartTypeTag: React.FC<PartTypeTagProps> = ({ type, size = 'normal' }) => {
  const config = typeMap[type];
  return (
    <View className={classnames(styles.tag, styles[config.className], size === 'small' && styles.tagSmall)}>
      <Text className={styles.tagText}>{config.label}</Text>
    </View>
  );
};

export default PartTypeTag;
