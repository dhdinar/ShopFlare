import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ShopFlareColors } from '@/constants/theme';
import * as profileService from '@/services/profileService';
import { BrandAnalytics } from '@/services/profileService';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  iconBg?: string;
}

function StatCard({ icon, label, value, iconBg }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: iconBg || '#F0F0F0' }]}>
        <Ionicons name={icon as any} size={22} color={ShopFlareColors.primary} />
      </View>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(i => {
        const filled = i <= Math.floor(rating);
        const half = !filled && i - 0.5 <= rating;
        return (
          <Ionicons
            key={i}
            name={filled ? 'star' : half ? 'star-half' : 'star-outline'}
            size={16}
            color={filled || half ? '#FFC107' : '#CCC'}
          />
        );
      })}
    </View>
  );
}

export default function BrandAnalyticsScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<BrandAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalytics = useCallback(
    async (silent = false) => {
      if (!accessToken) return;
      if (!silent) setLoading(true);
      else setRefreshing(true);
      try {
        const result = await profileService.getBrandAnalytics(accessToken);
        setData(result);
      } catch (e: any) {
        Alert.alert('Error', e.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken]
  );

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={ShopFlareColors.primary} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Analytics</ThemedText>
        <TouchableOpacity
          onPress={() => loadAnalytics(true)}
          style={styles.refreshButton}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={ShopFlareColors.primary} />
          ) : (
            <Ionicons name="refresh-outline" size={22} color={ShopFlareColors.primary} />
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} size="large" color={ShopFlareColors.primary} />
      ) : data ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

          {/* Overview grid */}
          <ThemedText style={styles.sectionLabel}>Overview</ThemedText>
          <View style={styles.statsGrid}>
            <StatCard icon="cube-outline" label="Total Products" value={data.total_products} iconBg="#E8F4FD" />
            <StatCard icon="checkmark-circle-outline" label="Active" value={data.active_products} iconBg="#E8FDE8" />
            <StatCard icon="heart-outline" label="Wishlist Saves" value={data.wishlist_saves} iconBg="#FDE8E8" />
            <StatCard icon="cart-outline" label="Cart Adds" value={data.cart_adds} iconBg="#FDF5E8" />
          </View>

          {/* Reviews summary */}
          <ThemedText style={styles.sectionLabel}>Customer Reviews</ThemedText>
          <View style={styles.reviewCard}>
            <View style={styles.reviewTop}>
              <View style={styles.ratingBig}>
                <ThemedText style={styles.ratingNumber}>
                  {data.average_rating.toFixed(1)}
                </ThemedText>
                <ThemedText style={styles.ratingOutOf}>/5</ThemedText>
              </View>
              <View style={styles.ratingDetails}>
                <RatingStars rating={data.average_rating} />
                <ThemedText style={styles.totalReviews}>
                  {data.total_reviews} review{data.total_reviews !== 1 ? 's' : ''}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Top products */}
          {data.top_products.length > 0 && (
            <>
              <ThemedText style={styles.sectionLabel}>Top Products by Saves</ThemedText>
              <View style={styles.topProductsList}>
                {data.top_products.map((product, index) => (
                  <View key={product.id} style={styles.topProductRow}>
                    <View style={styles.rankBadge}>
                      <ThemedText style={styles.rankText}>#{index + 1}</ThemedText>
                    </View>
                    <View style={styles.productInfo}>
                      <ThemedText style={styles.productName} numberOfLines={1}>
                        {product.name}
                      </ThemedText>
                      <ThemedText style={styles.productPrice}>${product.price}</ThemedText>
                    </View>
                    <View style={styles.savesCount}>
                      <Ionicons name="heart" size={14} color="#F44336" />
                      <ThemedText style={styles.savesText}>{product.saves}</ThemedText>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Empty products hint */}
          {data.total_products === 0 && (
            <View style={styles.emptyHint}>
              <Ionicons name="information-circle-outline" size={20} color="#888" />
              <ThemedText style={styles.emptyHintText}>
                Add products to start tracking analytics
              </ThemedText>
            </View>
          )}

        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: { padding: 8 },
  refreshButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 60 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 20,
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '44%',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  statIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 28, fontWeight: '800', color: ShopFlareColors.primary },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2, textAlign: 'center' },
  reviewCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  reviewTop: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  ratingBig: { flexDirection: 'row', alignItems: 'baseline' },
  ratingNumber: { fontSize: 48, fontWeight: '800', color: ShopFlareColors.primary },
  ratingOutOf: { fontSize: 20, color: '#999', marginLeft: 2 },
  ratingDetails: { gap: 6 },
  totalReviews: { fontSize: 13, color: '#888' },
  topProductsList: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  topProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: ShopFlareColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { fontSize: 12, fontWeight: '800', color: '#FFF' },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: '600' },
  productPrice: { fontSize: 13, color: '#666', marginTop: 2 },
  savesCount: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  savesText: { fontSize: 14, fontWeight: '700', color: '#F44336' },
  emptyHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF8F0',
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
  },
  emptyHintText: { fontSize: 13, color: '#888', flex: 1 },
});
