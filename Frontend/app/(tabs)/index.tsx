import { StyleSheet, TouchableOpacity, View, ScrollView, TextInput, Dimensions, ActivityIndicator, Pressable, Alert, Platform, ToastAndroid } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { ShopFlareColors } from '@/constants/theme';
import { useFashion } from '@/context/FashionContext';
import { FASHION_CATEGORIES, FASHION_SUBCATEGORIES, FILTER_CATEGORIES } from '@/constants/fashionData';
import { useAuth } from '@/context/AuthContext';
import { getUnreadNotificationsCount } from '@/services/notificationService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 60;

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
    subtitle: 'Trending Fashion | Free Shipping',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
  },
];

// Category emojis for products without images
const CATEGORY_EMOJIS: Record<string, string> = {
  'Men': '🧔',
  'Women': '👩',
  'Children': '🧸',
  'default': '🛍️',
};

export default function HomeScreen() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const { products, isLoadingProducts, toggleWishlist, isInWishlist, addToCart } = useFashion();
  const [activeOfferIndex, setActiveOfferIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [countdown, setCountdown] = useState({ hours: 2, minutes: 12, seconds: 56 });
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const loadUnreadNotifications = useCallback(async () => {
    if (!accessToken) {
      setUnreadCount(0);
      return;
    }
    try {
      const count = await getUnreadNotificationsCount(accessToken);
      setUnreadCount(count);
    } catch (e) {
      setUnreadCount(0);
    }
  }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      loadUnreadNotifications();
    }, [loadUnreadNotifications])
  );

  // Get subcategories for the active main category
  const currentSubcategories = activeFilter !== 'All' ? FASHION_SUBCATEGORIES[activeFilter] || [] : [];

  // Reset subcategory when main category changes
  useEffect(() => {
    setActiveSubcategory(null);
  }, [activeFilter]);

  // Get filtered products
  const getFilteredProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.subcategory?.toLowerCase().includes(q) ||
        p.brand_name?.toLowerCase().includes(q)
      );
    }

    // Main category filter
    if (activeFilter !== 'All') {
      filtered = filtered.filter(p =>
        p.category?.toLowerCase() === activeFilter.toLowerCase()
      );
    }

    // Subcategory filter
    if (activeSubcategory) {
      filtered = filtered.filter(p =>
        p.subcategory?.toLowerCase() === activeSubcategory.toLowerCase()
      );
    }

    return filtered.slice(0, 12);
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
      setActiveOfferIndex(prev => {
        const next = (prev + 1) % SPECIAL_OFFERS.length;
        scrollViewRef.current?.scrollTo({ x: next * CARD_WIDTH, animated: true });
        return next;
      });
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
                <Ionicons name="location-outline" size={16} color={ShopFlareColors.secondary} />
                <ThemedText style={styles.locationText}>Dhaka, Bangladesh</ThemedText>
                <Ionicons name="chevron-down" size={16} color={ShopFlareColors.primary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => router.push('/notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color={ShopFlareColors.secondary} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <ThemedText style={styles.notificationBadgeText}>
                    {unreadCount > 99 ? '99+' : String(unreadCount)}
                  </ThemedText>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={20} color="rgba(255,255,255,0.6)" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search products…"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="options-outline" size={20} color={ShopFlareColors.secondary} />
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
                  source={offer.image}
                  style={styles.offerImage}
                  contentFit="cover"
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
          </View>

          <View style={styles.categoryGrid}>
            {FASHION_CATEGORIES.map((category) => (
              <TouchableOpacity 
                key={category.id} 
                style={[
                  styles.categoryItem,
                  activeFilter === category.name && styles.categoryItemActive,
                ]}
                onPress={() => setActiveFilter(activeFilter === category.name ? 'All' : category.name)}
              >
                <View style={[
                  styles.categoryIcon,
                  activeFilter === category.name && styles.categoryIconActive,
                ]}>
                  <Ionicons name={category.icon as any} size={28} color={activeFilter === category.name ? ShopFlareColors.secondary : ShopFlareColors.accent} />
                </View>
                <ThemedText style={[
                  styles.categoryName,
                  activeFilter === category.name && styles.categoryNameActive,
                ]}>{category.name}</ThemedText>
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
            {FILTER_CATEGORIES.map((tab) => (
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

          {/* Subcategory Chips */}
          {currentSubcategories.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subcategoryContainer}>
              {currentSubcategories.map((sub) => (
                <TouchableOpacity
                  key={sub}
                  style={[styles.subcategoryChip, activeSubcategory === sub && styles.subcategoryChipActive]}
                  onPress={() => setActiveSubcategory(activeSubcategory === sub ? null : sub)}
                >
                  <ThemedText style={[styles.subcategoryText, activeSubcategory === sub && styles.subcategoryTextActive]}>
                    {sub}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Flash Sale Products */}
          {isLoadingProducts ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={ShopFlareColors.primary} />
              <ThemedText style={styles.loadingText}>Loading products...</ThemedText>
            </View>
          ) : displayProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="bag-outline" size={48} color={ShopFlareColors.border} />
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
                        <Image source={imageUrl} style={styles.productImage} contentFit="cover" />
                      ) : (
                        <ThemedText style={styles.productEmoji}>{getProductEmoji(product.category)}</ThemedText>
                      )}
                      <Pressable 
                        style={styles.wishlistIcon}
                        onPress={() => {
                          toggleWishlist(product.id);
                        }}
                        hitSlop={8}
                      >
                        <Ionicons 
                          name={isWishlisted ? "heart" : "heart-outline"} 
                          size={18} 
                          color={ShopFlareColors.primary} 
                        />
                      </Pressable>
                    </View>
                    <View style={styles.productInfo}>
                      <ThemedText style={styles.productName} numberOfLines={2}>{product.name}</ThemedText>
                      <View style={styles.ratingRow}>
                        {product.brand_name && (
                          <ThemedText style={styles.brandNameText} numberOfLines={1}>By {product.brand_name}</ThemedText>
                        )}
                        <View style={styles.ratingInline}>
                          <Ionicons name="star" size={14} color={ShopFlareColors.warning} />
                          <ThemedText style={styles.ratingText}>
                            {product.average_rating ? parseFloat(String(product.average_rating)).toFixed(1) : '0.0'}
                          </ThemedText>
                        </View>
                      </View>
                      <View style={styles.priceRow}>
                        <ThemedText style={styles.productPrice}>${parseFloat(String(product.price)).toFixed(2)}</ThemedText>
                        {product.originalPrice && (
                          <ThemedText style={styles.originalPrice}>${parseFloat(String(product.originalPrice)).toFixed(2)}</ThemedText>
                        )}
                      </View>
                      <TouchableOpacity
                        style={styles.addToCartButton}
                        onPress={(event) => {
                          event.stopPropagation();
                          addToCart(product, product.sizes?.[0] || 'M', product.colors?.[0] || 'Black', 1);
                          if (Platform.OS === 'android') {
                            ToastAndroid.show('Product added to cart', ToastAndroid.SHORT);
                          } else {
                            Alert.alert('Added to Cart', 'Product added to cart');
                          }
                        }}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="cart" size={16} color={ShopFlareColors.secondary} />
                        <ThemedText style={styles.addToCartText}>Add to Cart</ThemedText>
                      </TouchableOpacity>
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
    backgroundColor: ShopFlareColors.background,
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
    color: ShopFlareColors.secondary,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    color: ShopFlareColors.secondary,
    fontSize: 14,
    marginHorizontal: 4,
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: ShopFlareColors.error,
    borderWidth: 1.5,
    borderColor: ShopFlareColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: ShopFlareColors.secondary,
    lineHeight: 12,
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
    backgroundColor: 'rgba(255, 255, 255, 0.11)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: ShopFlareColors.secondary,
  },
  filterButton: {
    backgroundColor: ShopFlareColors.accent,
    padding: 10,
    borderRadius: 12,
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
    color: ShopFlareColors.text,
  },
  seeAll: {
    fontSize: 14,
    color: ShopFlareColors.accent,
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
    backgroundColor: ShopFlareColors.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  limitedText: {
    color: ShopFlareColors.secondary,
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
    color: ShopFlareColors.secondary,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ShopFlareColors.secondary,
    marginTop: 4,
  },
  offerSubtitle: {
    fontSize: 12,
    color: ShopFlareColors.secondary,
    opacity: 0.9,
    marginTop: 2,
  },
  claimButton: {
    alignSelf: 'flex-start',
    backgroundColor: ShopFlareColors.accent,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
    marginTop: 12,
    shadowColor: ShopFlareColors.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  claimButtonText: {
    color: ShopFlareColors.secondary,
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
    backgroundColor: ShopFlareColors.borderLight,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: ShopFlareColors.accent,
    width: 24,
  },
  categoryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 0,
  },
  categoryItem: {
    alignItems: 'center',
  },
  categoryItemActive: {},
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: ShopFlareColors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: ShopFlareColors.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryIconActive: {
    backgroundColor: ShopFlareColors.accent,
  },
  categoryName: {
    marginTop: 6,
    fontSize: 12,
    color: ShopFlareColors.textSecondary,
    fontWeight: '500',
  },
  categoryNameActive: {
    color: ShopFlareColors.accent,
    fontWeight: '700',
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
    color: ShopFlareColors.textSecondary,
  },
  timerBox: {
    backgroundColor: ShopFlareColors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timerText: {
    color: ShopFlareColors.secondary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  timerSeparator: {
    fontSize: 14,
    fontWeight: 'bold',
    color: ShopFlareColors.accent,
    marginHorizontal: 2,
  },
  filterContainer: {
    marginBottom: 12,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: ShopFlareColors.secondary,
    marginRight: 12,
    borderWidth: 1,
    borderColor: ShopFlareColors.border,
  },
  filterTabActive: {
    backgroundColor: ShopFlareColors.primary,
    borderColor: ShopFlareColors.primary,
    shadowColor: ShopFlareColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  filterTabText: {
    fontSize: 14,
    color: ShopFlareColors.textSecondary,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: ShopFlareColors.secondary,
  },
  subcategoryContainer: {
    marginBottom: 16,
  },
  subcategoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: ShopFlareColors.secondary,
    marginRight: 8,
    borderWidth: 1,
    borderColor: ShopFlareColors.accent,
  },
  subcategoryChipActive: {
    backgroundColor: ShopFlareColors.accent,
  },
  subcategoryText: {
    fontSize: 12,
    color: ShopFlareColors.accent,
    fontWeight: '500',
  },
  subcategoryTextActive: {
    color: ShopFlareColors.secondary,
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
    color: ShopFlareColors.textSecondary,
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 12,
    color: ShopFlareColors.textSecondary,
    fontSize: 14,
  },
  productCard: {
    width: '48.5%',
    backgroundColor: ShopFlareColors.secondary,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  productImageContainer: {
    height: 140,
    backgroundColor: ShopFlareColors.background,
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
    backgroundColor: ShopFlareColors.secondary,
    padding: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 17,
    fontWeight: '700',
    color: ShopFlareColors.text,
    marginBottom: 0,
    lineHeight: 19,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: ShopFlareColors.primary,
  },
  originalPrice: {
    fontSize: 12,
    color: ShopFlareColors.textLight,
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  ratingInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: ShopFlareColors.textSecondary,
    marginLeft: 4,
  },
  ratingCountText: {
    fontSize: 11,
    color: ShopFlareColors.textLight,
    marginLeft: 2,
  },
  brandNameText: {
    fontSize: 12,
    color: ShopFlareColors.textSecondary,
    flex: 1,
    marginRight: 8,
    fontWeight: '500',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 10,
    backgroundColor: ShopFlareColors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  addToCartText: {
    color: ShopFlareColors.secondary,
    fontSize: 13,
    fontWeight: '700',
  },
});
