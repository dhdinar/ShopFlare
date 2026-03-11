import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
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
          color={i <= rating ? '#FFC107' : '#CCC'}
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
            <Ionicons name="bag-outline" size={14} color="#888" />
            <ThemedText style={styles.productId}>Product #{item.product}</ThemedText>
          </View>
          <StarRating rating={item.rating} />
        </View>
        <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={18} color="#F44336" />
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={ShopFlareColors.primary} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>My Reviews</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} size="large" color={ShopFlareColors.primary} />
      ) : reviews.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="star-outline" size={64} color="#CCC" />
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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  list: { padding: 16, gap: 12, paddingBottom: 40 },
  countText: { fontSize: 13, color: '#888', marginBottom: 4 },
  card: {
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardInfo: { flex: 1, gap: 6 },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  productId: { fontSize: 13, color: '#888' },
  deleteBtn: { padding: 4 },
  reviewTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  reviewComment: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 8 },
  reviewDate: { fontSize: 12, color: '#999' },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginTop: 16, marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#777', textAlign: 'center' },
});
