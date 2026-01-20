import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/fashionData';

interface ProductChatButtonProps {
  productId: string;
  productName: string;
}

export const ProductChatButton: React.FC<ProductChatButtonProps> = ({ productId, productName }) => {
  const router = useRouter();

  const handleOpenChat = () => {
    router.push({
      pathname: '/(tabs)/chat',
      params: { productId, productName },
    });
  };

  return (
    <TouchableOpacity style={styles.chatButton} onPress={handleOpenChat}>
      <Ionicons name="chatbubble-ellipses-outline" size={20} color={COLORS.white} />
      <Text style={styles.chatButtonText}>Ask Question</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    marginTop: 12,
  },
  chatButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
