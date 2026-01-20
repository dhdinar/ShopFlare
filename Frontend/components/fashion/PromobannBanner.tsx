import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/fashionData';

interface PromoBannerProps {
  discount?: string;
  onPress?: () => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ discount = '40% Sale', onPress }) => {
  return (
    <TouchableOpacity style={styles.banner} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.content}>
        <Text style={styles.discount}>{discount}</Text>
        <Text style={styles.subtext}>On All Items</Text>
      </View>
      <View style={styles.decoration}>
        <Text style={styles.emoji}>🎉</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  content: {
    flex: 1,
  },
  discount: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
  },
  subtext: {
    fontSize: 14,
    color: COLORS.white,
    marginTop: 4,
    opacity: 0.9,
  },
  decoration: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 40,
  },
});
