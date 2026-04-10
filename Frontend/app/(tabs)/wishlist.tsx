import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { ShopFlareColors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useFashion, Product } from '@/context/FashionContext';
import { useState, useCallback } from 'react';
import { formatTk } from '@/utils/currency';

// Category emojis for products without images
const CATEGORY_EMOJIS: Record<string, string> = {
  'Clothes': '👕',
  'Electronics': '📱',
  'Shoes': '👟',
  'Watch': '⌚',
  'Accessories': '🎧',
  'default': '🛍️',
};

export default function WishlistScreen() {
  const router = useRouter();
  const { 
    products, 
    wishlist, 
    toggleWishlist, 
    addToCart, 
    isLoadingProducts,
    fetchProducts,
    refreshWishlist,
  } = useFashion();
  const [refreshing, setRefreshing] = useState(false);

  // Get wishlisted products
  const wishlistItems = products.filter(p => wishlist.includes(p.id));

  const getProductEmoji = (category?: string) => {
    if (!category) return CATEGORY_EMOJIS.default;
    return CATEGORY_EMOJIS[category] || CATEGORY_EMOJIS.default;
  };

  const getProductImage = (product: Product) => {
    if (product.images && product.images.length > 0 && product.images[0].image_base64) {
      return `data:${product.images[0].image_type};base64,${product.images[0].image_base64}`;
    }
    if (product.image) {
      return product.image;
    }
    return null;
  };

  const handleAddToCart = (product: Product) => {
    const defaultSize = product.sizes?.[0] || 'M';
    const defaultColor = product.colors?.[0] || 'Black';
    addToCart(product, defaultSize, defaultColor, 1);
    // Remove from wishlist after adding to cart
    toggleWishlist(product.id);
  };

  const handleRemoveFromWishlist = (productId: string) => {
    toggleWishlist(productId);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchProducts(), refreshWishlist()]);
    } finally {
      setRefreshing(false);
    }
  }, [fetchProducts, refreshWishlist]);

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>My Wishlist</ThemedText>
        <ThemedText style={styles.itemCount}>{wishlistItems.length} items</ThemedText>
      </View>

      {isLoadingProducts ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ShopFlareColors.primary} />
          <ThemedText style={styles.loadingText}>Loading wishlist...</ThemedText>
        </View>
      ) : wishlistItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color={ShopFlareColors.error} />
          <ThemedText style={styles.emptyTitle}>Your wishlist is empty</ThemedText>
          <ThemedText style={styles.emptySubtitle}>Save items you love by tapping the heart icon</ThemedText>
          <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/(tabs)')}>
            <ThemedText style={styles.shopButtonText}>Start Shopping</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={ShopFlareColors.primary}
              colors={[ShopFlareColors.primary]}
            />
          }
        >
          {wishlistItems.map((item) => {
            const imageUrl = getProductImage(item);
            return (
              <TouchableOpacity 
                key={item.id} 
                style={styles.wishlistCard}
                onPress={() => router.push(`/productDetail?id=${item.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.productImageContainer}>
                  {imageUrl ? (
                    <Image source={imageUrl} style={styles.productImageStyle} contentFit="cover" />
                  ) : (
                    <ThemedText style={styles.productEmoji}>{getProductEmoji(item.category)}</ThemedText>
                  )}
                </View>
                <View style={styles.productInfo}>
                  <ThemedText style={styles.productName} numberOfLines={2}>{item.name}</ThemedText>
                  {item.brand_name && (
                    <ThemedText style={styles.brandName}>{item.brand_name}</ThemedText>
                  )}
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color={ShopFlareColors.warning} />
                    <ThemedText style={styles.ratingText}>{item.rating ? parseFloat(String(item.rating)).toFixed(1) : '4.5'}</ThemedText>
                  </View>
                  <View style={styles.priceRow}>
                    <ThemedText style={styles.price}>{formatTk(item.price)}</ThemedText>
                    {item.originalPrice && (
                      <ThemedText style={styles.originalPrice}>{formatTk(item.originalPrice)}</ThemedText>
                    )}
                  </View>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity 
                    style={styles.cartButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleAddToCart(item);
                    }}
                  >
                    <Ionicons name="bag-add-outline" size={20} color={ShopFlareColors.secondary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.removeButton} 
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRemoveFromWishlist(item.id);
                    }}
                  >
                    <Ionicons name="trash-outline" size={20} color={ShopFlareColors.primary} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ShopFlareColors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: ShopFlareColors.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ShopFlareColors.secondary,
  },
  itemCount: {
    fontSize: 14,
    color: ShopFlareColors.secondary,
    opacity: 0.9,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: ShopFlareColors.textSecondary,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ShopFlareColors.text,
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: ShopFlareColors.textLight,
    textAlign: 'center',
    marginTop: 8,
  },
  shopButton: {
    backgroundColor: ShopFlareColors.accent,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 24,
    shadowColor: ShopFlareColors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  shopButtonText: {
    color: ShopFlareColors.secondary,
    fontWeight: '600',
    fontSize: 16,
  },
  listContainer: {
    padding: 20,
  },
  wishlistCard: {
    flexDirection: 'row',
    backgroundColor: ShopFlareColors.secondary,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  productImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: ShopFlareColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  productImageStyle: {
    width: '100%',
    height: '100%',
  },
  productEmoji: {
    fontSize: 40,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: ShopFlareColors.text,
  },
  brandName: {
    fontSize: 12,
    color: ShopFlareColors.textLight,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    color: ShopFlareColors.textSecondary,
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: ShopFlareColors.primary,
  },
  originalPrice: {
    fontSize: 12,
    color: ShopFlareColors.textLight,
    textDecorationLine: 'line-through',
  },
  actions: {
    justifyContent: 'center',
    gap: 8,
  },
  cartButton: {
    backgroundColor: ShopFlareColors.accent,
    padding: 10,
    borderRadius: 10,
  },
  removeButton: {
    backgroundColor: ShopFlareColors.secondary,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: ShopFlareColors.border,
  },
});
