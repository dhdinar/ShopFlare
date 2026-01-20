import { StyleSheet, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { ShopFlareColors } from '@/constants/theme';
import { useRouter } from 'expo-router';

// Sample wishlist items
const WISHLIST_ITEMS = [
  { id: '1', name: 'Classic White Sneakers', price: 79.99, originalPrice: 129.99, image: '👟', rating: 4.8 },
  { id: '2', name: 'Elegant Watch', price: 149.99, originalPrice: 249.99, image: '⌚', rating: 4.9 },
  { id: '3', name: 'Summer T-Shirt', price: 29.99, originalPrice: 49.99, image: '👕', rating: 4.5 },
  { id: '4', name: 'Wireless Earbuds', price: 59.99, originalPrice: 99.99, image: '🎧', rating: 4.7 },
];

export default function WishlistScreen() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState(WISHLIST_ITEMS);

  const removeFromWishlist = (id: string) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>My Wishlist</ThemedText>
        <ThemedText style={styles.itemCount}>{wishlist.length} items</ThemedText>
      </View>

      {wishlist.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color="#DDD" />
          <ThemedText style={styles.emptyTitle}>Your wishlist is empty</ThemedText>
          <ThemedText style={styles.emptySubtitle}>Save items you love by tapping the heart icon</ThemedText>
          <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/(tabs)')}>
            <ThemedText style={styles.shopButtonText}>Start Shopping</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
          {wishlist.map((item) => (
            <View key={item.id} style={styles.wishlistCard}>
              <View style={styles.productImage}>
                <ThemedText style={styles.productEmoji}>{item.image}</ThemedText>
              </View>
              <View style={styles.productInfo}>
                <ThemedText style={styles.productName} numberOfLines={2}>{item.name}</ThemedText>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <ThemedText style={styles.ratingText}>{item.rating}</ThemedText>
                </View>
                <View style={styles.priceRow}>
                  <ThemedText style={styles.price}>${item.price}</ThemedText>
                  <ThemedText style={styles.originalPrice}>${item.originalPrice}</ThemedText>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.cartButton}>
                  <Ionicons name="bag-add-outline" size={20} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.removeButton} onPress={() => removeFromWishlist(item.id)}>
                  <Ionicons name="trash-outline" size={20} color={ShopFlareColors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
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
  wishlistCard: {
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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: ShopFlareColors.primary,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  actions: {
    justifyContent: 'center',
    gap: 8,
  },
  cartButton: {
    backgroundColor: ShopFlareColors.primary,
    padding: 10,
    borderRadius: 10,
  },
  removeButton: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: ShopFlareColors.primary,
  },
});
