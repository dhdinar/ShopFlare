import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ShopFlareColors } from '@/constants/theme';
import * as profileService from '@/services/profileService';
import { UserReview } from '@/services/profileService';

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={14}
          color={i <= rating ? ShopFlareColors.warning : ShopFlareColors.border}
        />
      ))}
    </View>
  );
}

export default function MyReviewsScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();

  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReviews = useCallback(async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const data = await profileService.getMyReviews(accessToken);
      setReviews(data);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleDelete = (review: UserReview) => {
    Alert.alert('Delete Review', 'Are you sure you want to delete this review?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!accessToken) return;
          try {
            await profileService.deleteReview(accessToken, review.id);
            setReviews(prev => prev.filter(r => r.id !== review.id));
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to delete review');
          }
        },
      },
    ]);
  };

  const renderReview = ({ item }: { item: UserReview }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardInfo}>
          <View style={styles.productRow}>
            <Ionicons name="bag-outline" size={14} color={ShopFlareColors.textSecondary} />
            <ThemedText style={styles.productId}>Product #{item.product}</ThemedText>
          </View>
          <StarRating rating={item.rating} />
        </View>
        <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={18} color={ShopFlareColors.error} />
        </TouchableOpacity>
      </View>

      {item.title ? (
        <ThemedText style={styles.reviewTitle}>{item.title}</ThemedText>
      ) : null}
      {item.comment ? (
        <ThemedText style={styles.reviewComment}>{item.comment}</ThemedText>
      ) : null}

      <ThemedText style={styles.reviewDate}>
        {new Date(item.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </ThemedText>
    </View>
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadReviews();
    } finally {
      setRefreshing(false);
    }
  }, [loadReviews]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={ShopFlareColors.secondary} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>My Reviews</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} size="large" color={ShopFlareColors.primary} />
      ) : reviews.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="star-outline" size={64} color={ShopFlareColors.warning} />
          <ThemedText style={styles.emptyTitle}>No Reviews Yet</ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            Your product reviews will appear here
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={item => String(item.id)}
          renderItem={renderReview}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={ShopFlareColors.primary}
              colors={[ShopFlareColors.primary]}
            />
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <ThemedText style={styles.countText}>
              {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </ThemedText>
          }
        />
      )}
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
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: ShopFlareColors.secondary },
  list: { padding: 16, gap: 12, paddingBottom: 40 },
  countText: { fontSize: 13, color: ShopFlareColors.textLight, marginBottom: 4 },
  card: {
    backgroundColor: ShopFlareColors.background,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: ShopFlareColors.borderLight,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardInfo: { flex: 1, gap: 6 },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  productId: { fontSize: 13, color: ShopFlareColors.textLight },
  deleteBtn: { padding: 4 },
  reviewTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  reviewComment: { fontSize: 14, color: ShopFlareColors.textSecondary, lineHeight: 20, marginBottom: 8 },
  reviewDate: { fontSize: 12, color: ShopFlareColors.textLight },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginTop: 16, marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: ShopFlareColors.textSecondary, textAlign: 'center' },
});
