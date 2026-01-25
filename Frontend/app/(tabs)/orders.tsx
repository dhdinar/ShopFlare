import { StyleSheet, View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';

// Mock order data - replace with actual API later
interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  productName: string;
  quantity: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
}

const mockOrders: Order[] = [
  // Empty for now - will be populated from API
];

export default function OrdersScreen() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  
  const isBrand = user?.user_type === 'brand';

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return '#FFA726';
      case 'confirmed': return '#42A5F5';
      case 'shipped': return '#7E57C2';
      case 'delivered': return '#66BB6A';
      case 'cancelled': return '#EF5350';
      default: return '#999';
    }
  };

  const getStatusBgColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return '#FFF3E0';
      case 'confirmed': return '#E3F2FD';
      case 'shipped': return '#EDE7F6';
      case 'delivered': return '#E8F5E9';
      case 'cancelled': return '#FFEBEE';
      default: return '#F5F5F5';
    }
  };

  const filteredOrders = selectedFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === selectedFilter);

  // Not a brand - show message
  if (!isBrand) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="storefront-outline" size={64} color="#CCC" />
          <ThemedText style={styles.emptyTitle}>Brand Only</ThemedText>
          <ThemedText style={styles.emptyMessage}>This section is only available for brand accounts</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Orders</ThemedText>
        <TouchableOpacity style={styles.refreshButton}>
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
                selectedFilter === item.key && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(item.key)}
            >
              <ThemedText style={[
                styles.filterText,
                selectedFilter === item.key && styles.filterTextActive
              ]}>
                {item.label}
              </ThemedText>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Orders List */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 40 }} />
      ) : filteredOrders.length === 0 ? (
        <View style={styles.emptyOrders}>
          <Ionicons name="receipt-outline" size={64} color="#CCC" />
          <ThemedText style={styles.emptyOrdersText}>No orders yet</ThemedText>
          <ThemedText style={styles.emptyOrdersSubtext}>
            When customers order your products, they'll appear here
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.orderList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <ThemedText style={styles.orderNumber}>#{item.orderNumber}</ThemedText>
                <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(item.status) }]}>
                  <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </ThemedText>
                </View>
              </View>
              
              <View style={styles.orderInfo}>
                <View style={styles.orderRow}>
                  <Ionicons name="person-outline" size={16} color="#666" />
                  <ThemedText style={styles.orderRowText}>{item.customerName}</ThemedText>
                </View>
                <View style={styles.orderRow}>
                  <Ionicons name="cube-outline" size={16} color="#666" />
                  <ThemedText style={styles.orderRowText}>
                    {item.productName} x{item.quantity}
                  </ThemedText>
                </View>
                <View style={styles.orderRow}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <ThemedText style={styles.orderRowText}>{item.date}</ThemedText>
                </View>
              </View>
              
              <View style={styles.orderFooter}>
                <ThemedText style={styles.orderTotal}>${item.total.toFixed(2)}</ThemedText>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
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
    backgroundColor: '#000',
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
});
