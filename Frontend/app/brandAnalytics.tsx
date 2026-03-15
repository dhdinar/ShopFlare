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
      <View style={[styles.statIcon, { backgroundColor: iconBg || ShopFlareColors.borderLight }]}>
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
            color={filled || half ? ShopFlareColors.warning : ShopFlareColors.border}
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
          <Ionicons name="arrow-back" size={24} color={ShopFlareColors.secondary} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Analytics</ThemedText>
        <TouchableOpacity
          onPress={() => loadAnalytics(true)}
          style={styles.refreshButton}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={ShopFlareColors.secondary} />
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
            <StatCard icon="cube-outline" label="Total Products" value={data.total_products} iconBg={ShopFlareColors.infoLight} />
            <StatCard icon="checkmark-circle-outline" label="Active" value={data.active_products} iconBg={ShopFlareColors.successLight} />
            <StatCard icon="heart-outline" label="Wishlist Saves" value={data.wishlist_saves} iconBg={ShopFlareColors.errorLight} />
            <StatCard icon="cart-outline" label="Cart Adds" value={data.cart_adds} iconBg={ShopFlareColors.warningLight} />
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
                      <Ionicons name="heart" size={14} color={ShopFlareColors.error} />
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
              <Ionicons name="information-circle-outline" size={20} color={ShopFlareColors.warning} />
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
  container: { flex: 1, backgroundColor: ShopFlareColors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: ShopFlareColors.primary,
  },
  backButton: { padding: 8 },
  refreshButton: { padding: 8 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: ShopFlareColors.secondary },
  content: { padding: 16, paddingBottom: 60 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: ShopFlareColors.textSecondary,
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
    backgroundColor: ShopFlareColors.secondary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ShopFlareColors.borderLight,
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
  statLabel: { fontSize: 12, color: ShopFlareColors.textSecondary, marginTop: 2, textAlign: 'center' },
  reviewCard: {
    backgroundColor: ShopFlareColors.secondary,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: ShopFlareColors.borderLight,
  },
  reviewTop: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  ratingBig: { flexDirection: 'row', alignItems: 'baseline' },
  ratingNumber: { fontSize: 48, fontWeight: '800', color: ShopFlareColors.primary },
  ratingOutOf: { fontSize: 20, color: ShopFlareColors.textSecondary, marginLeft: 2 },
  ratingDetails: { gap: 6 },
  totalReviews: { fontSize: 13, color: ShopFlareColors.textSecondary },
  topProductsList: {
    backgroundColor: ShopFlareColors.secondary,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: ShopFlareColors.borderLight,
  },
  topProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: ShopFlareColors.borderLight,
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: ShopFlareColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { fontSize: 12, fontWeight: '800', color: ShopFlareColors.secondary },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: '600' },
  productPrice: { fontSize: 13, color: ShopFlareColors.textSecondary, marginTop: 2 },
  savesCount: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  savesText: { fontSize: 14, fontWeight: '700', color: ShopFlareColors.error },
  emptyHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: ShopFlareColors.warningLight,
    borderRadius: 10,
    padding: 14,
    marginTop: 8,
  },
  emptyHintText: { fontSize: 13, color: ShopFlareColors.textSecondary, flex: 1 },
});
