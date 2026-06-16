import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface UrgentTagProps {
  size?: 'small' | 'normal';
}

const UrgentTag: React.FC<UrgentTagProps> = ({ size = 'normal' }) => {
  return (
    <View className={classnames(styles.tag, size === 'small' && styles.tagSmall)}>
      <Text className={styles.tagText}>急</Text>
    </View>
  );
};

export default UrgentTag;
