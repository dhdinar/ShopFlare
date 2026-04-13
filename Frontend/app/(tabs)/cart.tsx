import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { ShopFlareColors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useFashion, CartItem } from '@/context/FashionContext';
import { useState, useCallback } from 'react';
import { formatTk } from '@/utils/currency';
import { calculateShippingCharge } from '@/utils/shipping';

// Category emojis for products without images
const CATEGORY_EMOJIS: Record<string, string> = {
  'Clothes': '👕',
  'Electronics': '📱',
  'Shoes': '👟',
  'Watch': '⌚',
  'Accessories': '🎧',
  'default': '🛍️',
};

export default function CartScreen() {
  const router = useRouter();
  const { 
    cart, 
    removeFromCart, 
    updateCartItemQuantity, 
    getTotalPrice,
    getCartItemCount,
    isLoadingProducts,
    fetchProducts,
    refreshCart,
  } = useFashion();
  const [refreshing, setRefreshing] = useState(false);

  const getProductEmoji = (category?: string) => {
    if (!category) return CATEGORY_EMOJIS.default;
    return CATEGORY_EMOJIS[category] || CATEGORY_EMOJIS.default;
  };

  const getProductImage = (item: CartItem) => {
    if (item.images && item.images.length > 0 && item.images[0].image_base64) {
      return `data:${item.images[0].image_type};base64,${item.images[0].image_base64}`;
    }
    if (item.image) {
      return item.image;
    }
    return null;
  };

  const handleUpdateQuantity = (productId: string, change: number, currentQuantity: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateCartItemQuantity(productId, newQuantity);
    }
  };

  const subtotal = getTotalPrice();
  const shipping = calculateShippingCharge(subtotal);
  const total = subtotal + shipping;
  const totalItems = getCartItemCount();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchProducts(), refreshCart()]);
    } finally {
      setRefreshing(false);
    }
  }, [fetchProducts, refreshCart]);

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>My Cart</ThemedText>
        <ThemedText style={styles.itemCount}>{totalItems} items</ThemedText>
      </View>

      {isLoadingProducts ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ShopFlareColors.primary} />
          <ThemedText style={styles.loadingText}>Loading cart...</ThemedText>
        </View>
      ) : cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-outline" size={80} color={ShopFlareColors.border} />
          <ThemedText style={styles.emptyTitle}>Your cart is empty</ThemedText>
          <ThemedText style={styles.emptySubtitle}>Add items to your cart to see them here</ThemedText>
          <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/(tabs)')}>
            <ThemedText style={styles.shopButtonText}>Start Shopping</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={ShopFlareColors.primary}
                colors={[ShopFlareColors.primary]}
              />
            }
          >
            {cart.map((item) => {
              const imageUrl = getProductImage(item);
              return (
                <TouchableOpacity 
                  key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} 
                  style={styles.cartCard}
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
                    <ThemedText style={styles.productVariant}>{item.selectedSize} • {item.selectedColor}</ThemedText>
                    <ThemedText style={styles.price}>{formatTk(item.price)}</ThemedText>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity 
                      style={styles.removeBtn} 
                      onPress={(e) => {
                        e.stopPropagation();
                        removeFromCart(item.id);
                      }}
                    >
                      <Ionicons name="trash-outline" size={18} color={ShopFlareColors.error} />
                    </TouchableOpacity>
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity 
                        style={styles.quantityBtn} 
                        onPress={(e) => {
                          e.stopPropagation();
                          handleUpdateQuantity(item.id, -1, item.quantity);
                        }}
                      >
                        <Ionicons name="remove" size={16} color={ShopFlareColors.textSecondary} />
                      </TouchableOpacity>
                      <ThemedText style={styles.quantity}>{item.quantity}</ThemedText>
                      <TouchableOpacity 
                        style={[styles.quantityBtn, styles.quantityBtnPlus]} 
                        onPress={(e) => {
                          e.stopPropagation();
                          handleUpdateQuantity(item.id, 1, item.quantity);
                        }}
                      >
                        <Ionicons name="add" size={16} color={ShopFlareColors.secondary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
            
            {/* Promo Code */}
            <View style={styles.promoContainer}>
              <View style={styles.promoInput}>
                <Ionicons name="pricetag-outline" size={20} color={ShopFlareColors.textSecondary} />
                <ThemedText style={styles.promoPlaceholder}>Enter promo code</ThemedText>
              </View>
              <TouchableOpacity style={styles.applyButton}>
                <ThemedText style={styles.applyButtonText}>Apply</ThemedText>
              </TouchableOpacity>
            </View>
            
            <View style={{ height: 200 }} />
          </ScrollView>

          {/* Order Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Subtotal</ThemedText>
              <ThemedText style={styles.summaryValue}>{formatTk(subtotal)}</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Shipping</ThemedText>
              <ThemedText style={styles.summaryValue}>
                {shipping === 0 ? 'FREE' : formatTk(shipping)}
              </ThemedText>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <ThemedText style={styles.totalLabel}>Total</ThemedText>
              <ThemedText style={styles.totalValue}>{formatTk(total)}</ThemedText>
            </View>
            <TouchableOpacity style={styles.checkoutButton} onPress={() => router.push('/checkout')}>
              <ThemedText style={styles.checkoutButtonText}>Proceed to Checkout</ThemedText>
              <Ionicons name="arrow-forward" size={20} color={ShopFlareColors.secondary} />
            </TouchableOpacity>
          </View>
        </>
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
  cartCard: {
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
  productVariant: {
    fontSize: 12,
    color: ShopFlareColors.textLight,
    marginTop: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: ShopFlareColors.primary,
    marginTop: 4,
  },
  actions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  removeBtn: {
    padding: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ShopFlareColors.background,
    borderRadius: 8,
  },
  quantityBtn: {
    padding: 8,
  },
  quantityBtnPlus: {
    backgroundColor: ShopFlareColors.accent,
    borderRadius: 8,
  },
  quantity: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 12,
  },
  promoContainer: {
    flexDirection: 'row',
    backgroundColor: ShopFlareColors.secondary,
    borderRadius: 12,
    padding: 4,
    marginTop: 8,
  },
  promoInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  promoPlaceholder: {
    color: ShopFlareColors.textLight,
    marginLeft: 8,
  },
  applyButton: {
    backgroundColor: ShopFlareColors.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  applyButtonText: {
    color: ShopFlareColors.secondary,
    fontWeight: '600',
  },
  summaryContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: ShopFlareColors.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: ShopFlareColors.textLight,
  },
  summaryValue: {
    fontSize: 14,
    color: ShopFlareColors.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: ShopFlareColors.borderLight,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: ShopFlareColors.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ShopFlareColors.primary,
  },
  checkoutButton: {
    flexDirection: 'row',
    backgroundColor: ShopFlareColors.accent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
    shadowColor: ShopFlareColors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  checkoutButtonText: {
    color: ShopFlareColors.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
});
