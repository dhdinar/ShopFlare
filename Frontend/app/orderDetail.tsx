import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { ShopFlareColors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getOrder, getBrandOrder, cancelOrder, Order } from '@/services/orderService';
import { formatTk } from '@/utils/currency';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { accessToken, user } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isBrand = user?.user_type === 'brand';

  useEffect(() => {
    loadOrder();
  }, [accessToken, id, isBrand]);

  const loadOrder = async () => {
    const orderId = Number(Array.isArray(id) ? id[0] : id);
    if (!accessToken || !orderId || Number.isNaN(orderId)) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = isBrand
        ? await getBrandOrder(accessToken, orderId)
        : await getOrder(accessToken, orderId);
      setOrder(data);
    } catch (err: any) {
      setOrder(null);
      Alert.alert('Error', err?.message || 'Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (!accessToken || !order) return;
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No' },
      {
        text: 'Yes, cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            const updated = await cancelOrder(accessToken, order.id);
            setOrder(updated);
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to cancel');
          }
        },
      },
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadOrder();
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: ShopFlareColors.statusPending,
      confirmed: ShopFlareColors.statusConfirmed,
      processing: ShopFlareColors.statusProcessing,
      shipped: ShopFlareColors.statusShipped,
      delivered: ShopFlareColors.statusDelivered,
      cancelled: ShopFlareColors.statusCancelled,
      refunded: ShopFlareColors.statusRefunded,
    };
    return map[status] || ShopFlareColors.textLight;
  };

  const getStatusBgColor = (status: string) => {
    const map: Record<string, string> = {
      pending: ShopFlareColors.statusPendingLight,
      confirmed: ShopFlareColors.statusConfirmedLight,
      processing: ShopFlareColors.statusProcessingLight,
      shipped: ShopFlareColors.statusShippedLight,
      delivered: ShopFlareColors.statusDeliveredLight,
      cancelled: ShopFlareColors.statusCancelledLight,
      refunded: ShopFlareColors.statusRefundedLight,
    };
    return map[status] || ShopFlareColors.background;
  };

  const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={ShopFlareColors.secondary} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Order Details</ThemedText>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={ShopFlareColors.primary} />
        </View>
      </ThemedView>
    );
  }

  if (!order) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={ShopFlareColors.secondary} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Order Details</ThemedText>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={ShopFlareColors.border} />
          <ThemedText style={{ color: ShopFlareColors.textLight, marginTop: 12 }}>Order not found</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const canCancel = !isBrand && ['pending', 'confirmed'].includes(order.status);
  const stepIndex = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'cancelled' || order.status === 'refunded';

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={ShopFlareColors.secondary} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Order #{order.id}</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={ShopFlareColors.primary}
            colors={[ShopFlareColors.primary]}
          />
        }
      >
        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: getStatusBgColor(order.status) }]}>
          <Ionicons
            name={
              order.status === 'delivered'
                ? 'checkmark-circle'
                : order.status === 'cancelled'
                ? 'close-circle'
                : 'time'
            }
            size={28}
            color={getStatusColor(order.status)}
          />
          <View style={{ marginLeft: 12 }}>
            <ThemedText style={[styles.statusTitle, { color: getStatusColor(order.status) }]}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </ThemedText>
            <ThemedText style={styles.statusDate}>
              Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </ThemedText>
          </View>
        </View>

        {/* Progress Tracker */}
        {!isCancelled && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Order Progress</ThemedText>
            <View style={styles.progressRow}>
              {STATUS_STEPS.map((step, idx) => {
                const active = idx <= stepIndex;
                return (
                  <View key={step} style={styles.progressStep}>
                    <View style={[styles.progressDot, active && styles.progressDotActive]} />
                    {idx < STATUS_STEPS.length - 1 && (
                      <View style={[styles.progressLine, active && styles.progressLineActive]} />
                    )}
                    <ThemedText style={[styles.progressLabel, active && styles.progressLabelActive]}>
                      {step.charAt(0).toUpperCase() + step.slice(1)}
                    </ThemedText>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Items */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Items</ThemedText>
          {order.items.map(item => (
            <View key={item.id} style={styles.itemCard}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.itemName}>{item.product_name}</ThemedText>
                <ThemedText style={styles.itemMeta}>
                  {[item.selected_size, item.selected_color].filter(Boolean).join(' / ') || ''}
                </ThemedText>
                <ThemedText style={styles.itemQty}>Qty: {item.quantity}</ThemedText>
              </View>
              <ThemedText style={styles.itemPrice}>
                {formatTk(item.line_total)}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* Payment */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Payment Summary</ThemedText>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Payment Method</ThemedText>
              <ThemedText style={styles.infoValue}>
                {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method === 'card' ? 'Card' : 'Wallet'}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Subtotal</ThemedText>
              <ThemedText style={styles.infoValue}>{formatTk(order.subtotal)}</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Shipping</ThemedText>
              <ThemedText style={[styles.infoValue, Number(order.shipping_cost) === 0 && { color: ShopFlareColors.success }]}> 
                {Number(order.shipping_cost) === 0 ? 'FREE' : formatTk(order.shipping_cost)}
              </ThemedText>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <ThemedText style={styles.totalLabel}>Total</ThemedText>
              <ThemedText style={styles.totalValue}>{formatTk(order.total_amount)}</ThemedText>
            </View>
          </View>
        </View>

        {/* Shipping Address */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Shipping Address</ThemedText>
          <View style={styles.infoCard}>
            <ThemedText style={styles.addrName}>{order.shipping_full_name}</ThemedText>
            <ThemedText style={styles.addrLine}>{order.shipping_address_line1}</ThemedText>
            {order.shipping_address_line2 ? (
              <ThemedText style={styles.addrLine}>{order.shipping_address_line2}</ThemedText>
            ) : null}
            <ThemedText style={styles.addrLine}>
              {order.shipping_city}
              {order.shipping_state ? `, ${order.shipping_state}` : ''}{' '}
              {order.shipping_postal_code || ''}
            </ThemedText>
            <ThemedText style={styles.addrLine}>{order.shipping_country}</ThemedText>
            {order.shipping_phone ? (
              <ThemedText style={styles.addrPhone}>{order.shipping_phone}</ThemedText>
            ) : null}
          </View>
        </View>

        {/* Notes */}
        {order.notes ? (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Notes</ThemedText>
            <View style={styles.infoCard}>
              <ThemedText style={{ color: ShopFlareColors.textSecondary, lineHeight: 20 }}>{order.notes}</ThemedText>
            </View>
          </View>
        ) : null}

        {/* Cancel Button */}
        {canCancel && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Ionicons name="close-circle-outline" size={20} color={ShopFlareColors.statusCancelled} />
            <ThemedText style={styles.cancelButtonText}>Cancel Order</ThemedText>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ShopFlareColors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 40, paddingHorizontal: 20, paddingBottom: 20,
    backgroundColor: ShopFlareColors.primary,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: ShopFlareColors.secondary },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, padding: 16 },

  statusBanner: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 14,
    padding: 16, marginBottom: 20,
  },
  statusTitle: { fontSize: 18, fontWeight: '700' },
  statusDate: { fontSize: 13, color: ShopFlareColors.textSecondary, marginTop: 2 },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: ShopFlareColors.text, marginBottom: 10 },

  // Progress
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  progressStep: { alignItems: 'center', flex: 1 },
  progressDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: ShopFlareColors.borderLight },
  progressDotActive: { backgroundColor: ShopFlareColors.primary },
  progressLine: {
    position: 'absolute', top: 6, left: '55%', right: '-45%', height: 2,
    backgroundColor: ShopFlareColors.borderLight, zIndex: -1,
  },
  progressLineActive: { backgroundColor: ShopFlareColors.primary },
  progressLabel: { fontSize: 10, color: ShopFlareColors.textLight, marginTop: 6, textAlign: 'center' },
  progressLabelActive: { color: ShopFlareColors.primary, fontWeight: '600' },

  // Items
  itemCard: {
    flexDirection: 'row', backgroundColor: ShopFlareColors.secondary, borderRadius: 12,
    padding: 14, marginBottom: 8, alignItems: 'center',
  },
  itemName: { fontSize: 14, fontWeight: '600', color: ShopFlareColors.text },
  itemMeta: { fontSize: 12, color: ShopFlareColors.textLight, marginTop: 2 },
  itemQty: { fontSize: 12, color: ShopFlareColors.textSecondary, marginTop: 4 },
  itemPrice: { fontSize: 15, fontWeight: '700', color: ShopFlareColors.primary },

  // Info card
  infoCard: { backgroundColor: ShopFlareColors.secondary, borderRadius: 14, padding: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoLabel: { fontSize: 14, color: ShopFlareColors.textLight },
  infoValue: { fontSize: 14, fontWeight: '500', color: ShopFlareColors.text },
  divider: { height: 1, backgroundColor: ShopFlareColors.borderLight, marginVertical: 10 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: ShopFlareColors.text },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: ShopFlareColors.primary },

  // Address
  addrName: { fontWeight: '700', fontSize: 15, color: ShopFlareColors.text, marginBottom: 4 },
  addrLine: { fontSize: 13, color: ShopFlareColors.textSecondary, lineHeight: 20 },
  addrPhone: { fontSize: 13, color: ShopFlareColors.textLight, marginTop: 6 },

  // Cancel
  cancelButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: ShopFlareColors.statusCancelled, borderRadius: 14,
    paddingVertical: 14, gap: 8, marginTop: 4,
  },
  cancelButtonText: { fontSize: 15, fontWeight: '600', color: ShopFlareColors.statusCancelled },
});
