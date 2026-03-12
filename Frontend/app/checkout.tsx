import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { ShopFlareColors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useFashion } from '@/context/FashionContext';
import { getAddresses, Address } from '@/services/profileService';
import { checkout, CheckoutData } from '@/services/orderService';

export default function CheckoutScreen() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const { cart, getTotalPrice, getCartItemCount, clearCart, fetchProducts } = useFashion();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'wallet'>('cod');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacing, setIsPlacing] = useState(false);

  const subtotal = getTotalPrice();
  const shipping = 0; // free shipping
  const total = subtotal + shipping;

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const data = await getAddresses(accessToken);
      setAddresses(data);
      // Auto-select default address
      const defaultAddr = data.find(a => a.is_default);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      else if (data.length > 0) setSelectedAddressId(data[0].id);
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!accessToken) return;

    if (!selectedAddressId) {
      Alert.alert('No Address', 'Please select or add a shipping address before placing your order.');
      return;
    }

    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty.');
      return;
    }

    setIsPlacing(true);
    try {
      const checkoutData: CheckoutData = {
        address_id: selectedAddressId,
        payment_method: paymentMethod,
        notes: notes.trim() || undefined,
      };

      const order = await checkout(accessToken, checkoutData);

      // Cart is already cleared by the backend; refresh local state
      await clearCart();
      await fetchProducts(); // refresh stock

      Alert.alert(
        'Order Placed!',
        `Your order #${order.id} has been placed successfully.`,
        [{ text: 'View Orders', onPress: () => router.replace('/(tabs)/orders') },
         { text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (err: any) {
      Alert.alert('Checkout Failed', err.message || 'Something went wrong.');
    } finally {
      setIsPlacing(false);
    }
  };

  const paymentMethods = [
    { key: 'cod' as const, label: 'Cash on Delivery', icon: 'cash-outline' as const },
    { key: 'card' as const, label: 'Credit / Debit Card', icon: 'card-outline' as const },
    { key: 'wallet' as const, label: 'Wallet', icon: 'wallet-outline' as const },
  ];

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Checkout</ThemedText>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={ShopFlareColors.primary} />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Checkout</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Shipping Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color={ShopFlareColors.primary} />
            <ThemedText style={styles.sectionTitle}>Shipping Address</ThemedText>
          </View>

          {addresses.length === 0 ? (
            <TouchableOpacity style={styles.addAddressCard} onPress={() => router.push('/addresses')}>
              <Ionicons name="add-circle-outline" size={32} color={ShopFlareColors.primary} />
              <ThemedText style={styles.addAddressText}>Add a shipping address</ThemedText>
            </TouchableOpacity>
          ) : (
            addresses.map(addr => (
              <TouchableOpacity
                key={addr.id}
                style={[
                  styles.addressCard,
                  selectedAddressId === addr.id && styles.addressCardSelected,
                ]}
                onPress={() => setSelectedAddressId(addr.id)}
              >
                <View style={styles.addressRadio}>
                  <Ionicons
                    name={selectedAddressId === addr.id ? 'radio-button-on' : 'radio-button-off'}
                    size={22}
                    color={selectedAddressId === addr.id ? ShopFlareColors.primary : '#CCC'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.addressLabelRow}>
                    <ThemedText style={styles.addressName}>{addr.full_name}</ThemedText>
                    <View style={[styles.labelBadge, { backgroundColor: addr.label === 'home' ? '#E3F2FD' : '#FFF3E0' }]}>
                      <ThemedText style={[styles.labelText, { color: addr.label === 'home' ? '#1976D2' : '#F57C00' }]}>
                        {addr.label.charAt(0).toUpperCase() + addr.label.slice(1)}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={styles.addressLine}>{addr.address_line1}</ThemedText>
                  {addr.address_line2 ? <ThemedText style={styles.addressLine}>{addr.address_line2}</ThemedText> : null}
                  <ThemedText style={styles.addressLine}>
                    {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postal_code || ''}
                  </ThemedText>
                  <ThemedText style={styles.addressLine}>{addr.country}</ThemedText>
                  {addr.phone ? <ThemedText style={styles.addressPhone}>{addr.phone}</ThemedText> : null}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card-outline" size={20} color={ShopFlareColors.primary} />
            <ThemedText style={styles.sectionTitle}>Payment Method</ThemedText>
          </View>
          {paymentMethods.map(pm => (
            <TouchableOpacity
              key={pm.key}
              style={[styles.paymentCard, paymentMethod === pm.key && styles.paymentCardSelected]}
              onPress={() => setPaymentMethod(pm.key)}
            >
              <Ionicons
                name={paymentMethod === pm.key ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={paymentMethod === pm.key ? ShopFlareColors.primary : '#CCC'}
              />
              <Ionicons name={pm.icon} size={22} color="#555" style={{ marginLeft: 12 }} />
              <ThemedText style={styles.paymentLabel}>{pm.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Order Summary Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt-outline" size={20} color={ShopFlareColors.primary} />
            <ThemedText style={styles.sectionTitle}>Order Summary</ThemedText>
          </View>
          <View style={styles.summaryCard}>
            {cart.map(item => (
              <View key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} style={styles.summaryItem}>
                <ThemedText style={styles.summaryItemName} numberOfLines={1}>
                  {item.name} × {item.quantity}
                </ThemedText>
                <ThemedText style={styles.summaryItemPrice}>
                  ${(parseFloat(String(item.price)) * item.quantity).toFixed(2)}
                </ThemedText>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Subtotal ({getCartItemCount()} items)</ThemedText>
              <ThemedText style={styles.summaryValue}>${subtotal.toFixed(2)}</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Shipping</ThemedText>
              <ThemedText style={[styles.summaryValue, { color: '#66BB6A' }]}>FREE</ThemedText>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <ThemedText style={styles.totalLabel}>Total</ThemedText>
              <ThemedText style={styles.totalValue}>${total.toFixed(2)}</ThemedText>
            </View>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="chatbox-outline" size={20} color={ShopFlareColors.primary} />
            <ThemedText style={styles.sectionTitle}>Order Notes (optional)</ThemedText>
          </View>
          <TextInput
            style={styles.notesInput}
            placeholder="Any special instructions…"
            placeholderTextColor="#AAA"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.footerContainer}>
        <View style={styles.footerRow}>
          <ThemedText style={styles.footerTotal}>Total: ${total.toFixed(2)}</ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.placeOrderButton, isPlacing && { opacity: 0.7 }]}
          onPress={handlePlaceOrder}
          disabled={isPlacing}
        >
          {isPlacing ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color="#FFF" />
              <ThemedText style={styles.placeOrderText}>Place Order</ThemedText>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 18,
    backgroundColor: ShopFlareColors.primary,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, padding: 16 },

  // Section
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },

  // Address
  addAddressCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  addAddressText: { marginTop: 8, color: ShopFlareColors.primary, fontWeight: '600' },
  addressCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#EEE',
  },
  addressCardSelected: { borderColor: ShopFlareColors.primary },
  addressRadio: { marginRight: 12, marginTop: 2 },
  addressLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  addressName: { fontWeight: '700', fontSize: 15, color: '#1A1A1A' },
  labelBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  labelText: { fontSize: 11, fontWeight: '600' },
  addressLine: { fontSize: 13, color: '#666', lineHeight: 20 },
  addressPhone: { fontSize: 13, color: '#888', marginTop: 4 },

  // Payment
  paymentCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EEE',
  },
  paymentCardSelected: { borderColor: ShopFlareColors.primary },
  paymentLabel: { marginLeft: 12, fontSize: 14, fontWeight: '500', color: '#333' },

  // Summary
  summaryCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 16 },
  summaryItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryItemName: { flex: 1, fontSize: 13, color: '#555', marginRight: 8 },
  summaryItemPrice: { fontSize: 13, fontWeight: '600', color: '#333' },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryLabel: { fontSize: 14, color: '#999' },
  summaryValue: { fontSize: 14, fontWeight: '500', color: '#333' },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: ShopFlareColors.primary },

  // Notes
  notesInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Footer
  footerContainer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 16,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  footerRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10 },
  footerTotal: { fontSize: 18, fontWeight: 'bold', color: ShopFlareColors.primary },
  placeOrderButton: {
    flexDirection: 'row',
    backgroundColor: ShopFlareColors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: ShopFlareColors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  placeOrderText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});
