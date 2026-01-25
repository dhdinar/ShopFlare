import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, FlatList, Image, ActivityIndicator, Alert, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useFashion, Product } from '@/context/FashionContext';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { ShopFlareColors } from '@/constants/theme';
import { getProduct, getProductReviews, createReview, Review, ReviewsResponse } from '@/services/productService';
import { API_BASE_URL } from '@/services/productService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Category emojis for products without images
const CATEGORY_EMOJIS: Record<string, string> = {
  'Clothes': '👕',
  'Electronics': '📱',
  'Shoes': '👟',
  'Watch': '⌚',
  'Accessories': '🎧',
  'Shirts': '👔',
  'Pants': '👖',
  'Jackets': '🧥',
  'Dresses': '👗',
  'Sweaters': '🧶',
  'default': '🛍️',
};

interface Message {
  id: number;
  message: string;
  sender_username: string;
  receiver_username: string;
  is_from_brand: boolean;
  timestamp: string;
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart, toggleWishlist, isInWishlist, products, getProductById, fetchProducts } = useFashion();
  const { accessToken, isSignedIn, user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [showChat, setShowChat] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(0); // 0 = Details, 1 = Reviews
  
  // Review state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const isWishlisted = product ? isInWishlist(product.id) : false;

  useEffect(() => {
    loadProduct();
  }, [id, products]);
  
  // Reload reviews when accessToken becomes available to get user's rating
  useEffect(() => {
    loadReviews();
  }, [id, accessToken]);

  const loadReviews = async () => {
    try {
      const productId = Number(id);
      if (productId) {
        const response = await getProductReviews(productId, accessToken);
        setReviews(response.reviews);
        setAverageRating(response.average_rating);
        setTotalReviews(response.total_reviews);
        setTotalRatings(response.total_ratings || 0);
        // Set user's previous rating if exists
        if (response.user_rating) {
          setReviewRating(response.user_rating);
        }
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };

  const handleRatingPress = async (rating: number) => {
    setReviewRating(rating);
    
    // Save rating immediately to database
    if (!isSignedIn || !accessToken) {
      Alert.alert('Login Required', 'Please login to rate this product');
      return;
    }
    
    try {
      // Only send rating - don't send empty comment to preserve existing comment
      await createReview(accessToken, {
        product_id: Number(id),
        rating: rating,
      });
      loadReviews(); // Refresh to show updated rating
      fetchProducts(); // Refresh products list to update rating on home page
    } catch (error: any) {
      console.error('Failed to save rating:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!isSignedIn || !accessToken) {
      Alert.alert('Login Required', 'Please login to submit a review');
      return;
    }
    
    if (reviewRating < 1 || reviewRating > 5) {
      Alert.alert('Invalid Rating', 'Please select a rating between 1 and 5 stars');
      return;
    }
    
    setIsSubmittingReview(true);
    try {
      await createReview(accessToken, {
        product_id: Number(id),
        rating: reviewRating,
        comment: reviewComment,
      });
      Alert.alert('Success', 'Your review has been submitted!');
      setShowReviewForm(false);
      setReviewComment('');
      setReviewRating(5);
      loadReviews(); // Refresh reviews
      fetchProducts(); // Refresh products list to update rating on home page
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const loadProduct = async () => {
    setIsLoading(true);
    try {
      // First try to get from context
      const contextProduct = getProductById(String(id));
      if (contextProduct) {
        setProduct(contextProduct);
        if (contextProduct.sizes && contextProduct.sizes.length > 0) {
          setSelectedSize(contextProduct.sizes[0]);
        }
        if (contextProduct.colors && contextProduct.colors.length > 0) {
          setSelectedColor(contextProduct.colors[0]);
        }
      } else {
        // If not in context, fetch from backend
        try {
          const backendProduct = await getProduct(Number(id));
          const converted: Product = {
            id: String(backendProduct.id),
            name: backendProduct.name,
            category: backendProduct.category || 'General',
            price: backendProduct.sale_price || backendProduct.price,
            originalPrice: backendProduct.is_on_sale ? backendProduct.price : undefined,
            description: backendProduct.description || '',
            rating: 4.5,
            stock: backendProduct.stock,
            brand_name: backendProduct.brand_name,
            colors: ['Black', 'White', 'Blue'],
            sizes: ['S', 'M', 'L', 'XL'],
            images: backendProduct.images?.map(img => ({
              id: img.id,
              image_base64: img.image_base64,
              image_type: img.image_type,
            })),
          };
          setProduct(converted);
          if (converted.sizes && converted.sizes.length > 0) {
            setSelectedSize(converted.sizes[0]);
          }
          if (converted.colors && converted.colors.length > 0) {
            setSelectedColor(converted.colors[0]);
          }
        } catch (error) {
          console.error('Failed to fetch product:', error);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!product) return;
    setLoadingMessages(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
      const res = await fetch(`${API_BASE_URL}/auth/products/${product.id}/messages/`, { headers });
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessages(data);
    } catch (e) {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !product) return;
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
      const body = {
        product_id: product.id,
        message: messageText,
      };
      const res = await fetch(`${API_BASE_URL}/auth/messages/send/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to send message');
      setMessageText('');
      fetchMessages();
    } catch (e) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const getProductEmoji = (category?: string) => {
    if (!category) return CATEGORY_EMOJIS.default;
    return CATEGORY_EMOJIS[category] || CATEGORY_EMOJIS.default;
  };

  const getProductImages = () => {
    if (product?.images && product.images.length > 0) {
      return product.images.map(img => 
        `data:${img.image_type};base64,${img.image_base64}`
      );
    }
    if (product?.image) {
      return [product.image];
    }
    return [];
  };

  const handleAddToCart = () => {
    if (product && selectedSize && selectedColor) {
      addToCart(product, selectedSize, selectedColor, quantity);
      Alert.alert('Success', 'Added to cart!', [{ text: 'OK' }]);
    } else {
      Alert.alert('Please Select', 'Please select size and color', [{ text: 'OK' }]);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = (user?.username && item.sender_username === user.username) || (user?.user_type === 'brand' && item.is_from_brand);
    return (
      <View style={[styles.messageBubble, isMine ? styles.customerMessage : styles.sellerMessage]}>
        <ThemedText style={[styles.messageText, !isMine && styles.sellerMessageText]}>{item.message}</ThemedText>
        <ThemedText style={[styles.messageTime, !isMine && styles.sellerMessageTime]}>
          {new Date(item.timestamp).toLocaleTimeString()}
        </ThemedText>
      </View>
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ShopFlareColors.primary} />
        <ThemedText style={styles.loadingText}>Loading product...</ThemedText>
      </ThemedView>
    );
  }

  if (!product) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#999" />
        <ThemedText style={styles.errorText}>Product not found</ThemedText>
        <TouchableOpacity style={styles.backHomeButton} onPress={() => router.back()}>
          <ThemedText style={styles.backHomeButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const productImages = getProductImages();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={ShopFlareColors.primary} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle} numberOfLines={1}>{product.name}</ThemedText>
        <TouchableOpacity onPress={() => toggleWishlist(product.id)}>
          <Ionicons 
            name={isWishlisted ? 'heart' : 'heart-outline'} 
            size={28} 
            color={ShopFlareColors.primary} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image Carousel */}
        <View style={styles.imageContainer}>
          {productImages.length > 0 ? (
            <>
              <FlatList
                data={productImages}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, index) => index.toString()}
                onMomentumScrollEnd={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
                  const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                  setCurrentImageIndex(index);
                }}
                renderItem={({ item }) => (
                  <Image 
                    source={{ uri: item }} 
                    style={[styles.productImage, { width: SCREEN_WIDTH }]}
                    resizeMode="cover"
                  />
                )}
              />
              {productImages.length > 1 && (
                <View style={styles.imagePagination}>
                  {productImages.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setCurrentImageIndex(index)}
                      style={[
                        styles.imageDot,
                        index === currentImageIndex && styles.imageDotActive
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <ThemedText style={styles.imagePlaceholder}>{getProductEmoji(product.category)}</ThemedText>
          )}
        </View>

        {/* Swipeable Content */}
        <FlatList
          data={[0, 1]}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={true}
          keyExtractor={(item) => item.toString()}
          onMomentumScrollEnd={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setActiveTab(index);
          }}
          renderItem={({ item: tabIndex }) => (
            <View style={{ width: SCREEN_WIDTH }}>
              {tabIndex === 0 ? (
                /* Details Tab */
                <View style={styles.infoContainer}>
                  <View style={styles.titleRow}>
                    <ThemedText style={styles.productTitle}>{product.name}</ThemedText>
                    {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
                      <View style={styles.lowStockBadge}>
                        <ThemedText style={styles.lowStockText}>Only {product.stock} left</ThemedText>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.brandSwipeRow}>
                    {product.brand_name && (
                      <ThemedText style={styles.brandName}>by {product.brand_name}</ThemedText>
                    )}
                    <View style={styles.swipeHintTop}>
                      <ThemedText style={styles.swipeHintTextBold}>Swipe Left for Reviews</ThemedText>
                      <Ionicons name="arrow-forward" size={14} color="#1A1A1A" />
                    </View>
                  </View>
                  
                  <ThemedText style={styles.category}>{product.category}</ThemedText>
                  
                  <View style={styles.priceContainer}>
                    <ThemedText style={styles.price}>${parseFloat(String(product.price)).toFixed(2)}</ThemedText>
                    {product.originalPrice && (
                      <ThemedText style={styles.originalPrice}>${parseFloat(String(product.originalPrice)).toFixed(2)}</ThemedText>
                    )}
                    {product.originalPrice && (
                      <View style={styles.discountBadge}>
                        <ThemedText style={styles.discountText}>
                          {Math.round((1 - parseFloat(String(product.price)) / parseFloat(String(product.originalPrice))) * 100)}% OFF
                        </ThemedText>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.ratingRowContainer}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <ThemedText style={styles.ratingText}>{averageRating > 0 ? averageRating.toFixed(1) : '0.0'}</ThemedText>
                      <ThemedText style={styles.reviewCount}>({totalReviews} reviews)</ThemedText>
                    </View>
                  </View>

                  <ThemedText style={styles.description}>{product.description}</ThemedText>

                  {/* Color Selection */}
                  {product.colors && product.colors.length > 0 && (
                    <View style={styles.optionContainer}>
                      <ThemedText style={styles.optionLabel}>Colors:</ThemedText>
                      <View style={styles.optionValues}>
                        {product.colors.map((color: string) => (
                          <TouchableOpacity
                            key={color}
                            onPress={() => setSelectedColor(color)}
                            style={[
                              styles.optionButton, 
                              selectedColor === color && styles.selectedOption
                            ]}
                          >
                            <ThemedText style={[
                              styles.optionText,
                              selectedColor === color && styles.selectedOptionText
                            ]}>{color}</ThemedText>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Size Selection */}
                  {product.sizes && product.sizes.length > 0 && (
                    <View style={styles.optionContainer}>
                      <ThemedText style={styles.optionLabel}>Sizes:</ThemedText>
                      <View style={styles.optionValues}>
                        {product.sizes.map((size: string) => (
                          <TouchableOpacity
                            key={size}
                            onPress={() => setSelectedSize(size)}
                            style={[
                              styles.optionButton, 
                              selectedSize === size && styles.selectedOption
                            ]}
                          >
                            <ThemedText style={[
                              styles.optionText,
                              selectedSize === size && styles.selectedOptionText
                            ]}>{size}</ThemedText>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Hide Add to Cart, Ask a Question for brand accounts */}
                  {user?.user_type !== 'brand' && (
                    <>
                      {/* Quantity */}
                      <View style={styles.quantityContainer}>
                        <ThemedText style={styles.optionLabel}>Quantity:</ThemedText>
                        <View style={styles.quantityControls}>
                          <TouchableOpacity 
                            onPress={() => setQuantity(Math.max(1, quantity - 1))} 
                            style={styles.quantityButton}
                          >
                            <Ionicons name="remove" size={20} color="#666" />
                          </TouchableOpacity>
                          <ThemedText style={styles.quantityValue}>{quantity}</ThemedText>
                          <TouchableOpacity 
                            onPress={() => setQuantity(quantity + 1)} 
                            style={[styles.quantityButton, styles.quantityButtonPlus]}
                          >
                            <Ionicons name="add" size={20} color="#FFF" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Add to Cart Button */}
                      <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                        <Ionicons name="cart" size={20} color="#FFFFFF" />
                        <ThemedText style={styles.addToCartText}>Add to Cart</ThemedText>
                      </TouchableOpacity>

                      {/* Chat Button */}
                      <TouchableOpacity 
                        style={styles.chatButton}
                        onPress={() => setShowChat(!showChat)}
                      >
                        <Ionicons name="chatbubble-outline" size={20} color={ShopFlareColors.primary} />
                        <ThemedText style={styles.chatButtonText}>Ask a Question</ThemedText>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              ) : (
                /* Reviews Tab */
                <View style={styles.reviewsContainer}>
                  <View style={styles.swipeHintTop}>
                    <Ionicons name="arrow-back" size={14} color="#1A1A1A" />
                    <ThemedText style={styles.swipeHintTextBold}>Swipe Right for Details</ThemedText>
                  </View>
                  
                  {/* Review Summary with Rating Selector */}
                  <View style={styles.reviewSummary}>
                    <View style={styles.reviewSummaryLeft}>
                      <ThemedText style={styles.avgRatingBig}>{averageRating > 0 ? averageRating.toFixed(1) : '0.0'}</ThemedText>
                      <ThemedText style={styles.ratingsLabel}>Ratings ({totalRatings})</ThemedText>
                      <ThemedText style={styles.totalReviewsText}>{totalReviews} reviews</ThemedText>
                    </View>
                    
                    {/* Hide review form for brand accounts */}
                    {user?.user_type !== 'brand' && (
                      <View style={styles.yourRatingSection}>
                        <View style={styles.starSelector}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => handleRatingPress(star)}>
                              <Ionicons 
                                name={star <= reviewRating ? "star" : "star-outline"} 
                                size={24} 
                                color="#FFD700" 
                              />
                            </TouchableOpacity>
                          ))}
                        </View>
                        <ThemedText style={styles.yourRatingLabel}>Your Rating</ThemedText>
                      </View>
                    )}
                  </View>
                  
                  {/* Reviews List */}
                  {reviews.length > 0 ? (
                    <View style={styles.reviewsList}>
                      {reviews.map((review) => (
                        <View key={review.id} style={styles.reviewItem}>
                          <View style={styles.reviewHeader}>
                            <View style={styles.reviewerInfo}>
                              <View style={styles.reviewerAvatar}>
                                <ThemedText style={styles.reviewerInitial}>
                                  {review.username.charAt(0).toUpperCase()}
                                </ThemedText>
                              </View>
                              <View>
                                <ThemedText style={styles.reviewerName}>{review.username}</ThemedText>
                                <ThemedText style={styles.reviewDate}>
                                  {new Date(review.created_at).toLocaleDateString()}
                                </ThemedText>
                              </View>
                            </View>
                            <View style={styles.reviewStars}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Ionicons 
                                  key={star}
                                  name={star <= review.rating ? "star" : "star-outline"} 
                                  size={14} 
                                  color="#FFD700" 
                                />
                              ))}
                            </View>
                          </View>
                          {review.title && (
                            <ThemedText style={styles.reviewTitle}>{review.title}</ThemedText>
                          )}
                          {review.comment && (
                            <ThemedText style={styles.reviewComment}>{review.comment}</ThemedText>
                          )}
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.noReviews}>
                      <Ionicons name="chatbubble-outline" size={48} color="#CCC" />
                      <ThemedText style={styles.noReviewsText}>No reviews yet</ThemedText>
                      <ThemedText style={styles.noReviewsSubtext}>Be the first to review this product!</ThemedText>
                    </View>
                  )}
                  
                  {/* Hide review form for brand accounts */}
                  {user?.user_type !== 'brand' && (
                    <View style={styles.reviewInputContainer}>
                      <TextInput
                        style={styles.reviewInput}
                        placeholder="Write your review..."
                        placeholderTextColor="#999"
                        value={reviewComment}
                        onChangeText={setReviewComment}
                        multiline
                        maxLength={500}
                      />
                      <TouchableOpacity 
                        style={[styles.reviewSendButton, isSubmittingReview && styles.sendButtonDisabled]}
                        onPress={handleSubmitReview}
                        disabled={isSubmittingReview}
                      >
                        {isSubmittingReview ? (
                          <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                          <Ionicons name="send" size={18} color="#FFFFFF" />
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
        />
      </ScrollView>

      {/* Chat Modal/Portal */}
      {showChat && (
        <View style={styles.chatContainer}>
          <View style={styles.chatHeader}>
            <ThemedText style={styles.chatTitle}>Chat with Seller</ThemedText>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowChat(false)}>
              <Ionicons name="close" size={24} color={ShopFlareColors.primary} />
            </TouchableOpacity>
          </View>
          {loadingMessages ? (
            <ActivityIndicator size="small" color={ShopFlareColors.primary} />
          ) : (
            <FlatList
              data={messages}
              renderItem={renderMessage}
              keyExtractor={item => item.id.toString()}
              style={{ maxHeight: 250 }}
            />
          )}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              value={messageText}
              onChangeText={setMessageText}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage} disabled={!messageText.trim()}>
              <Ionicons name="send" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  errorText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
  },
  backHomeButton: {
    marginTop: 20,
    backgroundColor: ShopFlareColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  backHomeButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    color: '#1A1A1A',
    marginHorizontal: 8,
  },
  imageContainer: {
    height: 320,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    fontSize: 120,
  },
  imagePagination: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DDD',
    marginHorizontal: 4,
  },
  imageDotActive: {
    backgroundColor: ShopFlareColors.primary,
    width: 20,
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFF',
    marginTop: 8,
    borderRadius: 16,
    marginHorizontal: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  productTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    flex: 1,
  },
  lowStockBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  lowStockText: {
    color: '#FF9800',
    fontSize: 11,
    fontWeight: '600',
  },
  brandSwipeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 14,
    color: ShopFlareColors.primary,
    fontWeight: '500',
  },
  category: {
    fontSize: 14,
    color: '#999',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  price: {
    fontSize: 26,
    fontWeight: 'bold',
    color: ShopFlareColors.primary,
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: ShopFlareColors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  ratingRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  swipeHintTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  swipeHintTextBold: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  reviewCount: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  optionContainer: {
    gap: 10,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  optionValues: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  selectedOption: {
    backgroundColor: ShopFlareColors.primary,
    borderColor: ShopFlareColors.primary,
  },
  optionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  quantityContainer: {
    gap: 10,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonPlus: {
    backgroundColor: ShopFlareColors.primary,
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    minWidth: 40,
    textAlign: 'center',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: ShopFlareColors.primary,
    shadowColor: ShopFlareColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: ShopFlareColors.primary,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: ShopFlareColors.primary,
  },
  chatContainer: {
    marginHorizontal: 12,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    gap: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  chatTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    marginVertical: 4,
  },
  customerMessage: {
    alignSelf: 'flex-end',
    backgroundColor: ShopFlareColors.primary,
    borderBottomRightRadius: 4,
  },
  sellerMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F5F5',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  sellerMessageText: {
    color: '#1A1A1A',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
    color: '#FFF',
  },
  sellerMessageTime: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-end',
    marginTop: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 14,
    backgroundColor: '#F8F9FA',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ShopFlareColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: ShopFlareColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  // Reviews styles
  reviewsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFF',
    marginTop: 8,
    borderRadius: 16,
    marginHorizontal: 12,
    marginBottom: 12,
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 8,
  },
  swipeHintText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
  reviewSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 16,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  reviewSummaryLeft: {
    alignItems: 'flex-start',
  },
  avgRatingBig: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  ratingsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 2,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  totalReviewsText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  yourRatingSection: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  yourRatingLabel: {
    fontSize: 12,
    color: '#1A1A1A',
    marginTop: 8,
    fontWeight: '700',
  },
  // Removed duplicate starSelector
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ShopFlareColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  writeReviewText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  reviewInputContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-end',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  reviewInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 14,
    backgroundColor: '#F8F9FA',
  },
  reviewSendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ShopFlareColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: ShopFlareColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewForm: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  reviewFormTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  ratingSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: 12, // Removed duplicate property
  },
  ratingSelectorLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  starSelector: {
    flexDirection: 'row',
    gap: 6,
  },
  reviewTitleInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  reviewCommentInput: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 80,
    marginBottom: 12,
  },
  submitReviewButtonFull: {
    backgroundColor: ShopFlareColors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitReviewText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  reviewsList: {
    marginTop: 8,
  },
  reviewItem: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ShopFlareColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewerInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  reviewComment: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  noReviews: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noReviewsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
  },
  noReviewsSubtext: {
    fontSize: 14,
    color: '#BBB',
    marginTop: 4,
  },
});
