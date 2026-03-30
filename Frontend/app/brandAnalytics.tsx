import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
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
  tone?: string;
}

function StatCard({ icon, label, value, tone }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: tone || ShopFlareColors.accentLight }]}>
        <Ionicons name={icon as any} size={18} color={ShopFlareColors.primary} />
      </View>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
  );
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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

  useFocusEffect(
    useCallback(() => {
      loadAnalytics(true);
    }, [loadAnalytics])
  );

  const totalProducts = data?.total_products ?? 0;
  const activeProducts = data?.active_products ?? 0;
  const wishlistSaves = data?.wishlist_saves ?? 0;
  const cartAdds = data?.cart_adds ?? 0;
  const totalSales = Number(data?.total_sales ?? 0);
  const totalOrders = data?.total_orders ?? 0;
  const unitsSold = data?.units_sold ?? 0;
  const avgOrderValue = Number(data?.avg_order_value ?? 0);
  const activationRate = totalProducts > 0 ? Math.round((activeProducts / totalProducts) * 100) : 0;
  const engagementRate = totalProducts > 0
    ? Math.min(100, Math.round(((wishlistSaves + cartAdds) / totalProducts) * 10))
    : 0;
  const topSelling = data?.top_selling_products ?? [];

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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadAnalytics(true)}
              tintColor={ShopFlareColors.primary}
              colors={[ShopFlareColors.primary]}
            />
          }
        >
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View>
                <ThemedText style={styles.heroTitle}>Sales Overview</ThemedText>
                <ThemedText style={styles.heroSubTitle}>Delivered-order performance at a glance</ThemedText>
              </View>
              <View style={styles.heroBadge}>
                <Ionicons name="trending-up-outline" size={14} color={ShopFlareColors.secondary} />
                <ThemedText style={styles.heroBadgeText}>Live</ThemedText>
              </View>
            </View>
            <ThemedText style={styles.heroAmount}>{formatCurrency(totalSales)}</ThemedText>
            <ThemedText style={styles.heroCaption}>Completed Sales</ThemedText>
          </View>

          <ThemedText style={styles.sectionLabel}>Core Metrics</ThemedText>
          <View style={styles.statsGrid}>
            <StatCard icon="receipt-outline" label="Delivered Orders" value={totalOrders} tone={ShopFlareColors.infoLight} />
            <StatCard icon="cube-outline" label="Units Sold" value={unitsSold} tone={ShopFlareColors.successLight} />
            <StatCard icon="wallet-outline" label="Avg Order Value" value={formatCurrency(avgOrderValue)} tone={ShopFlareColors.warningLight} />
            <StatCard icon="albums-outline" label="Products" value={`${activeProducts}/${totalProducts}`} tone={ShopFlareColors.accentLight} />
          </View>

          <ThemedText style={styles.sectionLabel}>Performance Funnel</ThemedText>
          <View style={styles.funnelCard}>
            <View style={styles.progressBlock}>
              <View style={styles.progressLabelRow}>
                <ThemedText style={styles.progressLabel}>Catalog Activation</ThemedText>
                <ThemedText style={styles.progressValue}>{activationRate}%</ThemedText>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${activationRate}%` }]} />
              </View>
            </View>

            <View style={styles.progressBlock}>
              <View style={styles.progressLabelRow}>
                <ThemedText style={styles.progressLabel}>Engagement Score</ThemedText>
                <ThemedText style={styles.progressValue}>{engagementRate}%</ThemedText>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFillAlt, { width: `${engagementRate}%` }]} />
              </View>
            </View>

            <View style={styles.funnelStatsRow}>
              <View style={styles.funnelMiniStat}>
                <Ionicons name="heart-outline" size={14} color={ShopFlareColors.error} />
                <ThemedText style={styles.funnelMiniText}>{wishlistSaves} saves</ThemedText>
              </View>
              <View style={styles.funnelMiniStat}>
                <Ionicons name="cart-outline" size={14} color={ShopFlareColors.warning} />
                <ThemedText style={styles.funnelMiniText}>{cartAdds} cart adds</ThemedText>
              </View>
            </View>
          </View>

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
                  {data.total_reviews} review{data.total_reviews !== 1 ? 's' : ''} total
                </ThemedText>
              </View>
            </View>
          </View>

          {topSelling.length > 0 && (
            <>
              <ThemedText style={styles.sectionLabel}>Top Selling Products</ThemedText>
              <View style={styles.topProductsList}>
                {topSelling.map((product, index) => (
                  <View key={product.id} style={styles.topProductRow}>
                    <View style={styles.rankBadge}>
                      <ThemedText style={styles.rankText}>#{index + 1}</ThemedText>
                    </View>
                    <View style={styles.productInfo}>
                      <ThemedText style={styles.productName} numberOfLines={1}>
                        {product.name}
                      </ThemedText>
                      <ThemedText style={styles.productPrice}>{formatCurrency(Number(product.revenue || 0))}</ThemedText>
                    </View>
                    <View style={styles.savesCount}>
                      <Ionicons name="cube-outline" size={14} color={ShopFlareColors.success} />
                      <ThemedText style={styles.savesText}>{product.units_sold}</ThemedText>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {data.top_products.length > 0 && (
            <>
              <ThemedText style={styles.sectionLabel}>Most Wishlisted</ThemedText>
              <View style={styles.topProductsList}>
                {data.top_products.map((product, index) => (
                  <View key={product.id} style={styles.topProductRow}>
                    <View style={[styles.rankBadge, styles.rankBadgeSoft]}>
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

          {totalProducts === 0 && (
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
  headerTitle: { fontSize: 22, fontWeight: '700', color: ShopFlareColors.secondary },
  content: { padding: 16, paddingBottom: 60 },
  heroCard: {
    backgroundColor: ShopFlareColors.primary,
    borderRadius: 16,
    padding: 16,
    marginTop: 6,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  heroTitle: { fontSize: 15, fontWeight: '700', color: ShopFlareColors.secondary },
  heroSubTitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  heroBadgeText: { fontSize: 11, color: ShopFlareColors.secondary, fontWeight: '700' },
  heroAmount: { fontSize: 30, fontWeight: '800', color: ShopFlareColors.secondary },
  heroCaption: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
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
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ShopFlareColors.borderLight,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 18, fontWeight: '800', color: ShopFlareColors.text, textAlign: 'center' },
  statLabel: { fontSize: 12, color: ShopFlareColors.textSecondary, marginTop: 3, textAlign: 'center' },
  funnelCard: {
    backgroundColor: ShopFlareColors.secondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ShopFlareColors.borderLight,
    padding: 14,
    gap: 12,
  },
  progressBlock: { gap: 8 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontSize: 13, fontWeight: '600', color: ShopFlareColors.text },
  progressValue: { fontSize: 12, fontWeight: '700', color: ShopFlareColors.textSecondary },
  progressTrack: {
    height: 8,
    backgroundColor: ShopFlareColors.borderLight,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ShopFlareColors.success,
  },
  progressFillAlt: {
    height: '100%',
    backgroundColor: ShopFlareColors.primary,
  },
  funnelStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  funnelMiniStat: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: ShopFlareColors.background,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: ShopFlareColors.borderLight,
  },
  funnelMiniText: { fontSize: 12, fontWeight: '600', color: ShopFlareColors.text },
  reviewCard: {
    backgroundColor: ShopFlareColors.secondary,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: ShopFlareColors.borderLight,
  },
  reviewTop: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  ratingBig: { flexDirection: 'row', alignItems: 'baseline' },
  ratingNumber: { fontSize: 40, fontWeight: '800', color: ShopFlareColors.primary },
  ratingOutOf: { fontSize: 16, color: ShopFlareColors.textSecondary, marginLeft: 2 },
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
  rankBadgeSoft: {
    backgroundColor: ShopFlareColors.accent,
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
