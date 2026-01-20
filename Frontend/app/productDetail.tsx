import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useFashion } from '@/context/FashionContext';
import { Ionicons } from '@expo/vector-icons';

const SAMPLE_PRODUCTS: any[] = [
  { id: '1', name: 'Classic T-Shirt', category: 'Shirts', price: 29.99, rating: 4.5, description: 'Comfortable and stylish cotton t-shirt', colors: ['White', 'Black', 'Blue'], sizes: ['XS', 'S', 'M', 'L', 'XL'] },
  { id: '2', name: 'Denim Jeans', category: 'Pants', price: 59.99, rating: 4.8, description: 'Classic blue denim jeans', colors: ['Blue', 'Black'], sizes: ['28', '30', '32', '34', '36'] },
  { id: '3', name: 'Leather Jacket', category: 'Jackets', price: 129.99, rating: 4.6, description: 'Premium leather jacket', colors: ['Black', 'Brown'], sizes: ['XS', 'S', 'M', 'L', 'XL'] },
  { id: '4', name: 'Summer Dress', category: 'Dresses', price: 49.99, rating: 4.7, description: 'Lightweight summer dress', colors: ['Red', 'Yellow', 'Blue'], sizes: ['XS', 'S', 'M', 'L'] },
  { id: '5', name: 'Casual Sneakers', category: 'Shoes', price: 79.99, rating: 4.4, description: 'Comfortable casual sneakers', colors: ['White', 'Black', 'Gray'], sizes: ['6', '7', '8', '9', '10'] },
  { id: '6', name: 'Winter Sweater', category: 'Sweaters', price: 59.99, rating: 4.9, description: 'Cozy winter sweater', colors: ['Gray', 'Navy', 'Burgundy'], sizes: ['XS', 'S', 'M', 'L', 'XL'] },
];

interface Message {
  id: string;
  message: string;
  senderType: 'customer' | 'seller';
  timestamp: string;
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart, toggleWishlist, isInWishlist } = useFashion();
  const [product, setProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [showChat, setShowChat] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', message: 'Hi! Do you have this in size M?', senderType: 'customer', timestamp: new Date(Date.now() - 300000).toISOString() },
    { id: '2', message: 'Yes! We have all sizes in stock.', senderType: 'seller', timestamp: new Date(Date.now() - 240000).toISOString() },
  ]);
  const isWishlisted = isInWishlist(String(id));

  useEffect(() => {
    const foundProduct = SAMPLE_PRODUCTS.find(p => p.id === id);
    if (foundProduct) {
      setProduct(foundProduct);
      if (foundProduct.sizes && foundProduct.sizes.length > 0) {
        setSelectedSize(foundProduct.sizes[0]);
      }
      if (foundProduct.colors && foundProduct.colors.length > 0) {
        setSelectedColor(foundProduct.colors[0]);
      }
    }
  }, [id]);

  const handleAddToCart = () => {
    if (product && selectedSize && selectedColor) {
      addToCart(product, selectedSize, selectedColor, quantity);
      alert('Added to cart!');
    }
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        message: messageText,
        senderType: 'customer',
        timestamp: new Date().toISOString(),
      };
      setMessages([...messages, newMessage]);
      setMessageText('');
      
      // Simulate seller response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          message: 'Thanks for your question! We\'ll get back to you soon.',
          senderType: 'seller',
          timestamp: new Date().toISOString(),
        }]);
      }, 1000);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageBubble, item.senderType === 'customer' ? styles.customerMessage : styles.sellerMessage]}>
      <ThemedText style={styles.messageText}>{item.message}</ThemedText>
      <ThemedText style={styles.messageTime}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </ThemedText>
    </View>
  );

  if (!product) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000000" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>{product.name}</ThemedText>
        <TouchableOpacity onPress={() => toggleWishlist(String(product.id))}>
          <Ionicons name={isWishlisted ? 'heart' : 'heart-outline'} size={28} color="#000000" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <ThemedText style={styles.imagePlaceholder}>👕</ThemedText>
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <ThemedText type="title">{product.name}</ThemedText>
          <ThemedText style={styles.category}>{product.category}</ThemedText>
          <View style={styles.priceContainer}>
            <ThemedText style={styles.price}>${product.price}</ThemedText>
            <ThemedText style={styles.rating}>⭐ {product.rating}</ThemedText>
          </View>

          <ThemedText style={styles.description}>{product.description}</ThemedText>

          {/* Color Selection */}
          {product.colors && (
            <View style={styles.optionContainer}>
              <ThemedText style={styles.optionLabel}>Colors:</ThemedText>
              <View style={styles.optionValues}>
                {product.colors.map((color: string) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    style={[styles.optionButton, selectedColor === color && styles.selectedOption]}
                  >
                    <ThemedText style={styles.optionText}>{color}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Size Selection */}
          {product.sizes && (
            <View style={styles.optionContainer}>
              <ThemedText style={styles.optionLabel}>Sizes:</ThemedText>
              <View style={styles.optionValues}>
                {product.sizes.map((size: string) => (
                  <TouchableOpacity
                    key={size}
                    onPress={() => setSelectedSize(size)}
                    style={[styles.optionButton, selectedSize === size && styles.selectedOption]}
                  >
                    <ThemedText style={styles.optionText}>{size}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Quantity */}
          <View style={styles.quantityContainer}>
            <ThemedText style={styles.optionLabel}>Quantity:</ThemedText>
            <View style={styles.quantityControls}>
              <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.quantityButton}>
                <ThemedText style={styles.quantityButtonText}>−</ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.quantityValue}>{quantity}</ThemedText>
              <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.quantityButton}>
                <ThemedText style={styles.quantityButtonText}>+</ThemedText>
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
            <Ionicons name="chatbubble-outline" size={20} color="#000000" />
            <ThemedText style={styles.chatButtonText}>Ask a Question</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Chat Section */}
        {showChat && (
          <View style={styles.chatContainer}>
            <ThemedText style={styles.chatTitle}>Questions & Answers</ThemedText>
            <FlatList
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              inverted
              scrollEnabled={false}
            />
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ask a question..."
                placeholderTextColor="#999"
                value={messageText}
                onChangeText={setMessageText}
                multiline
              />
              <TouchableOpacity 
                style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
                onPress={handleSendMessage}
                disabled={!messageText.trim()}
              >
                <Ionicons name="send" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    color: '#000000',
  },
  imageContainer: {
    height: 300,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    fontSize: 120,
  },
  infoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  category: {
    fontSize: 14,
    opacity: 0.6,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  rating: {
    fontSize: 16,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  optionContainer: {
    gap: 8,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  optionValues: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedOption: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  optionText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  quantityContainer: {
    gap: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
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
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  chatContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginVertical: 6,
  },
  customerMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#000000',
  },
  sellerMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
  },
  messageText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.6,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
