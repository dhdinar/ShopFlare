import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/fashionData';

interface FashionHeaderProps {
  showGreeting?: boolean;
  onNotificationPress?: () => void;
  onCartPress?: () => void;
  cartCount?: number;
}

export const FashionHeader: React.FC<FashionHeaderProps> = ({
  showGreeting = true,
  onNotificationPress,
  onCartPress,
  cartCount = 0,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        {showGreeting && (
          <View>
            <Text style={styles.greeting}>Good Morning</Text>
            <Text style={styles.userName}>Sarah</Text>
          </View>
        )}
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity onPress={onNotificationPress}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cartButton} onPress={onCartPress}>
          <Ionicons name="bag-outline" size={24} color={COLORS.black} />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
  },
  greeting: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cartButton: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
});
