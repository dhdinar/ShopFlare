import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { ShopFlareColors } from '@/constants/theme';
import { useRouter } from 'expo-router';

// Sample cart items
const CART_ITEMS = [
  { id: '1', name: 'Classic White Sneakers', price: 79.99, image: '👟', quantity: 1, size: 'US 10', color: 'White' },
  { id: '2', name: 'Elegant Watch', price: 149.99, image: '⌚', quantity: 1, size: 'One Size', color: 'Silver' },
  { id: '3', name: 'Summer T-Shirt', price: 29.99, image: '👕', quantity: 2, size: 'L', color: 'Black' },
];

export default function CartScreen() {
  const router = useRouter();
  const [cart, setCart] = useState(CART_ITEMS);

  const updateQuantity = (id: string, change: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>My Cart</ThemedText>
        <ThemedText style={styles.itemCount}>{cart.length} items</ThemedText>
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-outline" size={80} color="#DDD" />
          <ThemedText style={styles.emptyTitle}>Your cart is empty</ThemedText>
          <ThemedText style={styles.emptySubtitle}>Add items to your cart to see them here</ThemedText>
          <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/(tabs)')}>
            <ThemedText style={styles.shopButtonText}>Start Shopping</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.listContainer}>
            {cart.map((item) => (
              <View key={item.id} style={styles.cartCard}>
                <View style={styles.productImage}>
                  <ThemedText style={styles.productEmoji}>{item.image}</ThemedText>
                </View>
                <View style={styles.productInfo}>
                  <ThemedText style={styles.productName} numberOfLines={2}>{item.name}</ThemedText>
                  <ThemedText style={styles.productVariant}>{item.size} • {item.color}</ThemedText>
                  <ThemedText style={styles.price}>${item.price}</ThemedText>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.removeBtn} onPress={() => removeFromCart(item.id)}>
                    <Ionicons name="trash-outline" size={18} color="#999" />
                  </TouchableOpacity>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity 
                      style={styles.quantityBtn} 
                      onPress={() => updateQuantity(item.id, -1)}
                    >
                      <Ionicons name="remove" size={16} color="#666" />
                    </TouchableOpacity>
                    <ThemedText style={styles.quantity}>{item.quantity}</ThemedText>
                    <TouchableOpacity 
                      style={[styles.quantityBtn, styles.quantityBtnPlus]} 
                      onPress={() => updateQuantity(item.id, 1)}
                    >
                      <Ionicons name="add" size={16} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
            
            {/* Promo Code */}
            <View style={styles.promoContainer}>
              <View style={styles.promoInput}>
                <Ionicons name="pricetag-outline" size={20} color="#999" />
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
              <ThemedText style={styles.summaryValue}>${subtotal.toFixed(2)}</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Shipping</ThemedText>
              <ThemedText style={styles.summaryValue}>
                {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
              </ThemedText>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <ThemedText style={styles.totalLabel}>Total</ThemedText>
              <ThemedText style={styles.totalValue}>${total.toFixed(2)}</ThemedText>
            </View>
            <TouchableOpacity style={styles.checkoutButton}>
              <ThemedText style={styles.checkoutButtonText}>Proceed to Checkout</ThemedText>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  itemCount: {
    fontSize: 14,
    color: '#999',
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
    color: '#1A1A1A',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  shopButton: {
    backgroundColor: ShopFlareColors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 24,
  },
  shopButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  listContainer: {
    padding: 20,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#1A1A1A',
  },
  productVariant: {
    fontSize: 12,
    color: '#999',
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
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  quantityBtn: {
    padding: 8,
  },
  quantityBtnPlus: {
    backgroundColor: ShopFlareColors.primary,
    borderRadius: 8,
  },
  quantity: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 12,
  },
  promoContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
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
    color: '#999',
    marginLeft: 8,
  },
  applyButton: {
    backgroundColor: ShopFlareColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  applyButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  summaryContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
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
    color: '#999',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ShopFlareColors.primary,
  },
  checkoutButton: {
    flexDirection: 'row',
    backgroundColor: ShopFlareColors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  checkoutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
