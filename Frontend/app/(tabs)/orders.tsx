import { StyleSheet, View, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { ShopFlareColors } from '@/constants/theme';
import { useState, useEffect, useCallback } from 'react';
import { getOrders, getBrandOrders, cancelOrder, updateOrderStatus, Order } from '@/services/orderService';

export default function OrdersScreen() {
  const { user, accessToken } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const isBrand = user?.user_type === 'brand';

  useEffect(() => {
    if (accessToken) fetchOrders();
  }, [accessToken]);

  const fetchOrders = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const data = isBrand ? await getBrandOrders(accessToken) : await getOrders(accessToken);
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, isBrand]);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA726';
      case 'confirmed': return '#42A5F5';
      case 'processing': return '#AB47BC';
      case 'shipped': return '#7E57C2';
      case 'delivered': return '#66BB6A';
      case 'cancelled': return '#EF5350';
      case 'refunded': return '#78909C';
      default: return '#999';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFF3E0';
      case 'confirmed': return '#E3F2FD';
      case 'processing': return '#F3E5F5';
      case 'shipped': return '#EDE7F6';
      case 'delivered': return '#E8F5E9';
      case 'cancelled': return '#FFEBEE';
      case 'refunded': return '#ECEFF1';
      default: return '#F5F5F5';
    }
  };

  const filteredOrders =
    selectedFilter === 'all' ? orders : orders.filter(o => o.status === selectedFilter);

  const handleCancel = (orderId: number) => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No' },
      {
        text: 'Yes, cancel',
        style: 'destructive',
        onPress: async () => {
          if (!accessToken) return;
          try {
            await cancelOrder(accessToken, orderId);
            fetchOrders();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to cancel order');
          }
        },
      },
    ]);
  };

  const handleStatusUpdate = (orderId: number, newStatus: string) => {
    if (!accessToken) return;
    Alert.alert('Update Status', `Mark this order as "${newStatus}"?`, [
      { text: 'No' },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            await updateOrderStatus(accessToken, orderId, newStatus);
            fetchOrders();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to update status');
          }
        },
      },
    ]);
  };

  const getNextStatus = (current: string): string | null => {
    const flow: Record<string, string> = {
      pending: 'confirmed',
      confirmed: 'processing',
      processing: 'shipped',
      shipped: 'delivered',
    };
    return flow[current] || null;
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const itemSummary = item.items.map(i => `${i.product_name} ×${i.quantity}`).join(', ');
    const nextStatus = isBrand ? getNextStatus(item.status) : null;
    const canCancel = !isBrand && ['pending', 'confirmed'].includes(item.status);

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => router.push(`/orderDetail?id=${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.orderHeader}>
          <ThemedText style={styles.orderNumber}>Order #{item.id}</ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(item.status) }]}>
            <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.orderInfo}>
          {isBrand && (
            <View style={styles.orderRow}>
              <Ionicons name="person-outline" size={16} color="#666" />
              <ThemedText style={styles.orderRowText}>{item.username}</ThemedText>
            </View>
          )}
          <View style={styles.orderRow}>
            <Ionicons name="cube-outline" size={16} color="#666" />
            <ThemedText style={styles.orderRowText} numberOfLines={2}>{itemSummary}</ThemedText>
          </View>
          <View style={styles.orderRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <ThemedText style={styles.orderRowText}>
              {new Date(item.created_at).toLocaleDateString()}
            </ThemedText>
          </View>
        </View>

        <View style={styles.orderFooter}>
          <ThemedText style={styles.orderTotal}>${Number(item.total_amount).toFixed(2)}</ThemedText>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {canCancel && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => handleCancel(item.id)}
              >
                <ThemedText style={styles.cancelBtnText}>Cancel</ThemedText>
              </TouchableOpacity>
            )}
            {nextStatus && (
              <TouchableOpacity
                style={styles.nextStatusBtn}
                onPress={() => handleStatusUpdate(item.id, nextStatus)}
              >
                <ThemedText style={styles.nextStatusBtnText}>
                  Mark {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                </ThemedText>
              </TouchableOpacity>
            )}
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // --- Not signed in ---
  if (!accessToken) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="log-in-outline" size={64} color="#CCC" />
          <ThemedText style={styles.emptyTitle}>Sign in</ThemedText>
          <ThemedText style={styles.emptyMessage}>Sign in to view your orders</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>
          {isBrand ? 'Customer Orders' : 'My Orders'}
        </ThemedText>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchOrders}>
          <Ionicons name="refresh" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="time-outline" size={20} color="#FFA726" />
          </View>
          <ThemedText style={styles.statNumber}>
            {orders.filter(o => o.status === 'pending').length}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Pending</ThemedText>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#42A5F5" />
          </View>
          <ThemedText style={styles.statNumber}>
            {orders.filter(o => o.status === 'confirmed').length}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Confirmed</ThemedText>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#EDE7F6' }]}>
            <Ionicons name="airplane-outline" size={20} color="#7E57C2" />
          </View>
          <ThemedText style={styles.statNumber}>
            {orders.filter(o => o.status === 'shipped').length}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Shipped</ThemedText>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="checkmark-done-outline" size={20} color="#66BB6A" />
          </View>
          <ThemedText style={styles.statNumber}>
            {orders.filter(o => o.status === 'delivered').length}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Delivered</ThemedText>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === item.key && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(item.key)}
            >
              <ThemedText
                style={[
                  styles.filterText,
                  selectedFilter === item.key && styles.filterTextActive,
                ]}
              >
                {item.label}
              </ThemedText>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Orders List */}
      {isLoading ? (
        <ActivityIndicator size="large" color={ShopFlareColors.primary} style={{ marginTop: 40 }} />
      ) : filteredOrders.length === 0 ? (
        <View style={styles.emptyOrders}>
          <Ionicons name="receipt-outline" size={64} color="#CCC" />
          <ThemedText style={styles.emptyOrdersText}>No orders yet</ThemedText>
          <ThemedText style={styles.emptyOrdersSubtext}>
            {isBrand
              ? "When customers order your products, they'll appear here"
              : 'Your placed orders will appear here'}
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.orderList}
          showsVerticalScrollIndicator={false}
          renderItem={renderOrder}
        />
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  filterContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: ShopFlareColors.accent,
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFF',
  },
  orderList: {
    padding: 16,
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderInfo: {
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderRowText: {
    fontSize: 14,
    color: '#333',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyOrders: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyOrdersText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyOrdersSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#EF5350',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF5350',
  },
  nextStatusBtn: {
    backgroundColor: ShopFlareColors.accent,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  nextStatusBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
});
