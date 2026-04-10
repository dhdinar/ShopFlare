import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { ShopFlareColors } from '@/constants/theme';

type InlineMessageVariant = 'error' | 'success' | 'info';

interface InlineMessageProps {
  message: string;
  variant?: InlineMessageVariant;
}

export default function InlineMessage({ message, variant = 'info' }: InlineMessageProps) {
  const isError = variant === 'error';
  const isSuccess = variant === 'success';

  return (
    <View
      style={[
        styles.container,
        isError && styles.errorContainer,
        isSuccess && styles.successContainer,
      ]}
    >
      <Text
        style={[
          styles.message,
          isError && styles.errorText,
          isSuccess && styles.successText,
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: ShopFlareColors.info,
    backgroundColor: ShopFlareColors.infoLight,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  errorContainer: {
    borderColor: ShopFlareColors.error,
    backgroundColor: ShopFlareColors.errorLight,
  },
  successContainer: {
    borderColor: ShopFlareColors.success,
    backgroundColor: ShopFlareColors.successLight,
  },
  message: {
    color: ShopFlareColors.info,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  errorText: {
    color: ShopFlareColors.error,
  },
  successText: {
    color: ShopFlareColors.success,
  },
});
