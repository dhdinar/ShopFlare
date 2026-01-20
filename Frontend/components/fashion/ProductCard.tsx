import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/fashionData';
import { useFashion } from '@/context/FashionContext';
import { Product } from '@/constants/fashionData';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const { toggleWishlist, isInWishlist } = useFashion();
  const inWishlist = isInWishlist(product.id);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.image} />
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={() => toggleWishlist(product.id)}
        >
          <Ionicons
            name={inWishlist ? 'heart' : 'heart-outline'}
            size={24}
            color={inWishlist ? COLORS.primary : COLORS.white}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>${product.originalPrice.toFixed(2)}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: COLORS.gray,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  wishlistButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 12,
  },
  category: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginVertical: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  originalPrice: {
    fontSize: 12,
    color: COLORS.darkGray,
    textDecorationLine: 'line-through',
  },
});
