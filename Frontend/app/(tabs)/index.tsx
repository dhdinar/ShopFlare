import { StyleSheet, TouchableOpacity, View, ScrollView, TextInput, Dimensions, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { ShopFlareColors } from '@/constants/theme';
import { useFashion } from '@/context/FashionContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 60;

// Categories data
const CATEGORIES = [
  { id: '1', name: 'Clothes', icon: 'shirt-outline' },
  { id: '2', name: 'Electronics', icon: 'phone-portrait-outline' },
  { id: '3', name: 'Shoes', icon: 'footsteps-outline' },
  { id: '4', name: 'Watch', icon: 'watch-outline' },
];

// Special offers data
const SPECIAL_OFFERS = [
  {
    id: '1',
    discount: '40%',
    title: 'Get Special Offer',
    subtitle: 'All Services Available | 24hr Available',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400',
  },
  {
    id: '2',
    discount: '50%',
    title: 'Summer Sale',
    subtitle: 'Fashion & Accessories | Limited Time',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400',
  },
  {
    id: '3',
    discount: '30%',
    title: 'New Arrivals',
    subtitle: 'Electronics & Gadgets | Free Shipping',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
  },
];

// Category emojis for products without images
const CATEGORY_EMOJIS: Record<string, string> = {
  'Clothes': '👕',
  'Electronics': '📱',
  'Shoes': '👟',
  'Watch': '⌚',
  'Accessories': '🎧',
  'default': '🛍️',
};

// Filter tabs
const FILTER_TABS = ['All', 'Newest', 'Popular', 'Clothes'];

export default function HomeScreen() {
  const router = useRouter();
  const { products, isLoadingProducts, toggleWishlist, isInWishlist } = useFashion();
  const [activeOfferIndex, setActiveOfferIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState('All');
  const [countdown, setCountdown] = useState({ hours: 2, minutes: 12, seconds: 56 });
  const [searchQuery, setSearchQuery] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Get filtered products
  const getFilteredProducts = () => {
    let filtered = [...products];
    
    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Category filter
    if (activeFilter !== 'All') {
      if (activeFilter === 'Newest') {
        filtered = filtered.slice(0, 8);
      } else if (activeFilter === 'Popular') {
        filtered = filtered.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0)).slice(0, 8);
      } else {
        filtered = filtered.filter(p => 
          p.category?.toLowerCase().includes(activeFilter.toLowerCase())
        );
      }
    }
    
    return filtered.slice(0, 8);
  };

  const displayProducts = getFilteredProducts();

  const getProductEmoji = (category?: string) => {
    if (!category) return CATEGORY_EMOJIS.default;
    return CATEGORY_EMOJIS[category] || CATEGORY_EMOJIS.default;
  };

  const getProductImage = (product: any) => {
    if (product.images && product.images.length > 0 && product.images[0].image_base64) {
      return `data:${product.images[0].image_type};base64,${product.images[0].image_base64}`;
    }
    if (product.image) {
      return product.image;
    }
    return null;
  };

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveOfferIndex(prev => (prev + 1) % SPECIAL_OFFERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / CARD_WIDTH);
    setActiveOfferIndex(index);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <ThemedText style={styles.appName}>ShopFlare</ThemedText>
              <TouchableOpacity style={styles.locationContainer}>
                <Ionicons name="location-outline" size={16} color="#FFF" />
                <ThemedText style={styles.locationText}>New York, USA</ThemedText>
                <Ionicons name="chevron-down" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#FFF" />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={20} color="#999" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="options-outline" size={22} color={ShopFlareColors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Special Offers Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>#SpecialForYou</ThemedText>
            <TouchableOpacity>
              <ThemedText style={styles.seeAll}>See All</ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.carouselContainer}
          >
            {SPECIAL_OFFERS.map((offer, index) => (
              <TouchableOpacity key={offer.id} style={styles.offerCard}>
                <Image
                  source={{ uri: offer.image }}
                  style={styles.offerImage}
                  resizeMode="cover"
                />
                <View style={styles.offerOverlay}>
                  <View style={styles.limitedBadge}>
                    <ThemedText style={styles.limitedText}>Limited time!</ThemedText>
                  </View>
                  <View style={styles.offerContent}>
                    <ThemedText style={styles.discountText}>Up to {offer.discount}</ThemedText>
                    <ThemedText style={styles.offerTitle}>{offer.title}</ThemedText>
                    <ThemedText style={styles.offerSubtitle}>{offer.subtitle}</ThemedText>
                    <TouchableOpacity style={styles.claimButton}>
                      <ThemedText style={styles.claimButtonText}>Claim</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Pagination dots */}
          <View style={styles.pagination}>
            {SPECIAL_OFFERS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === activeOfferIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Category Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Category</ThemedText>
            <TouchableOpacity>
              <ThemedText style={styles.seeAll}>See All</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.categoryGrid}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity key={category.id} style={styles.categoryItem}>
                <View style={styles.categoryIcon}>
                  <Ionicons name={category.icon as any} size={28} color={ShopFlareColors.primary} />
                </View>
                <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Flash Sale Section */}
        <View style={styles.section}>
          <View style={styles.flashSaleHeader}>
            <ThemedText style={styles.sectionTitle}>Flash Sale</ThemedText>
            <View style={styles.countdownContainer}>
              <ThemedText style={styles.closingText}>Closing in: </ThemedText>
              <View style={styles.timerBox}>
                <ThemedText style={styles.timerText}>{formatTime(countdown.hours)}</ThemedText>
              </View>
              <ThemedText style={styles.timerSeparator}>:</ThemedText>
              <View style={styles.timerBox}>
                <ThemedText style={styles.timerText}>{formatTime(countdown.minutes)}</ThemedText>
              </View>
              <ThemedText style={styles.timerSeparator}>:</ThemedText>
              <View style={styles.timerBox}>
                <ThemedText style={styles.timerText}>{formatTime(countdown.seconds)}</ThemedText>
              </View>
            </View>
          </View>

          {/* Filter Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
            {FILTER_TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.filterTab, activeFilter === tab && styles.filterTabActive]}
                onPress={() => setActiveFilter(tab)}
              >
                <ThemedText style={[styles.filterTabText, activeFilter === tab && styles.filterTabTextActive]}>
                  {tab}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Flash Sale Products */}
          {isLoadingProducts ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={ShopFlareColors.primary} />
              <ThemedText style={styles.loadingText}>Loading products...</ThemedText>
            </View>
          ) : displayProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="bag-outline" size={48} color="#DDD" />
              <ThemedText style={styles.emptyText}>No products available</ThemedText>
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {displayProducts.map((product) => {
                const imageUrl = getProductImage(product);
                const isWishlisted = isInWishlist(product.id);
                return (
                  <TouchableOpacity
                    key={product.id}
                    style={styles.productCard}
                    onPress={() => router.push(`/productDetail?id=${product.id}`)}
                  >
                    <View style={styles.productImageContainer}>
                      {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.productImage} resizeMode="cover" />
                      ) : (
                        <ThemedText style={styles.productEmoji}>{getProductEmoji(product.category)}</ThemedText>
                      )}
                      <TouchableOpacity 
                        style={styles.wishlistIcon}
                        onPress={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                      >
                        <Ionicons 
                          name={isWishlisted ? "heart" : "heart-outline"} 
                          size={18} 
                          color={ShopFlareColors.primary} 
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.productInfo}>
                      <ThemedText style={styles.productName} numberOfLines={2}>{product.name}</ThemedText>
                      <View style={styles.priceRow}>
                        <ThemedText style={styles.productPrice}>${parseFloat(String(product.price)).toFixed(2)}</ThemedText>
                        {product.originalPrice && (
                          <ThemedText style={styles.originalPrice}>${parseFloat(String(product.originalPrice)).toFixed(2)}</ThemedText>
                        )}
                      </View>
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <ThemedText style={styles.ratingText}>
                          {product.average_rating ? parseFloat(String(product.average_rating)).toFixed(1) : '0.0'}
                        </ThemedText>
                        {product.brand_name && (
                          <ThemedText style={styles.brandNameText} numberOfLines={1}>By {product.brand_name}</ThemedText>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: ShopFlareColors.primary,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    color: '#FFF',
    fontSize: 14,
    marginHorizontal: 4,
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 13,
    color: '#333',
  },
  filterButton: {
    backgroundColor: '#FFF',
    padding: 6,
    borderRadius: 8,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  seeAll: {
    fontSize: 14,
    color: ShopFlareColors.primary,
    fontWeight: '600',
  },
  carouselContainer: {
    paddingRight: 20,
  },
  offerCard: {
    width: CARD_WIDTH,
    height: 180,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
  },
  offerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  offerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 16,
  },
  limitedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: ShopFlareColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  limitedText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  offerContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  discountText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 4,
  },
  offerSubtitle: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.9,
    marginTop: 2,
  },
  claimButton: {
    alignSelf: 'flex-start',
    backgroundColor: ShopFlareColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  claimButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DDD',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: ShopFlareColors.primary,
    width: 24,
  },
  categoryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryItem: {
    alignItems: 'center',
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryName: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  flashSaleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closingText: {
    fontSize: 12,
    color: '#666',
  },
  timerBox: {
    backgroundColor: ShopFlareColors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timerText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  timerSeparator: {
    fontSize: 14,
    fontWeight: 'bold',
    color: ShopFlareColors.primary,
    marginHorizontal: 2,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  filterTabActive: {
    backgroundColor: ShopFlareColors.primary,
    borderColor: ShopFlareColors.primary,
  },
  filterTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#FFF',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 12,
    color: '#999',
    fontSize: 14,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageContainer: {
    height: 140,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productEmoji: {
    fontSize: 56,
  },
  wishlistIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFF',
    padding: 6,
    borderRadius: 20,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: ShopFlareColors.primary,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  ratingCountText: {
    fontSize: 11,
    color: '#999',
    marginLeft: 2,
  },
  brandNameText: {
    fontSize: 11,
    color: ShopFlareColors.primary,
    flex: 1,
    textAlign: 'right',
    fontWeight: 'bold',
  },
});
