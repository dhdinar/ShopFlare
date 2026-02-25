import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView, TextInput, Modal, FlatList, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct, Product, ProductCreateData } from '@/services/productService';
import * as ImagePicker from 'expo-image-picker';

export default function ProductsScreen() {
  const { user, accessToken } = useAuth();
  const router = useRouter();
  
  // Product management state
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Product form state
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productSalePrice, setProductSalePrice] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productImage, setProductImage] = useState('');
  const [productStock, setProductStock] = useState('');
  const [selectedImages, setSelectedImages] = useState<{uri: string, base64: string, type: string}[]>([]);
  
  const isBrand = user?.user_type === 'brand';

  const loadProducts = useCallback(async () => {
    if (!isBrand || !accessToken) return;
    
    setIsLoading(true);
    try {
      const data = await getProducts(accessToken);
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isBrand, accessToken]);

  useEffect(() => {
    if (isBrand) {
      loadProducts();
    }
  }, [isBrand, loadProducts]);

  const resetProductForm = () => {
    setProductName('');
    setProductDescription('');
    setProductPrice('');
    setProductSalePrice('');
    setProductCategory('');
    setProductImage('');
    setProductStock('');
    setSelectedImages([]);
    setEditingProduct(null);
  };

  const openAddProduct = () => {
    resetProductForm();
    setShowProductModal(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductName(product.name);
    setProductDescription(product.description || '');
    setProductPrice(product.price.toString());
    setProductSalePrice(product.sale_price?.toString() || '');
    setProductCategory(product.category || '');
    setProductImage(product.image || '');
    setProductStock(product.stock.toString());
    setSelectedImages([]);
    setShowProductModal(true);
  };

  const pickImages = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images');
      return;
    }

    // Check if already at max
    if (selectedImages.length >= 4) {
      Alert.alert('Limit reached', 'Maximum 4 images allowed per product');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 4 - selectedImages.length,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets
        .filter(asset => asset.base64)
        .map(asset => ({
          uri: asset.uri,
          base64: asset.base64!,
          type: asset.mimeType || 'image/jpeg',
        }));
      
      setSelectedImages(prev => [...prev, ...newImages].slice(0, 4));
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveProduct = async () => {
    if (!productName || !productPrice || !accessToken) {
      Alert.alert('Error', 'Product name and price are required');
      return;
    }

    const productData: ProductCreateData = {
      name: productName,
      description: productDescription || undefined,
      price: parseFloat(productPrice),
      sale_price: productSalePrice ? parseFloat(productSalePrice) : undefined,
      category: productCategory || undefined,
      image: productImage || undefined,
      stock: parseInt(productStock) || 0,
      is_active: true,
      images: selectedImages.map(img => ({
        data: img.base64,
        type: img.type,
      })),
    };

    setIsLoading(true);
    try {
      if (editingProduct) {
        await updateProduct(accessToken, editingProduct.id, productData);
        Alert.alert('Success', 'Product updated successfully');
      } else {
        await createProduct(accessToken, productData);
        Alert.alert('Success', 'Product created successfully');
      }
      setShowProductModal(false);
      resetProductForm();
      loadProducts();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!accessToken) return;
            setIsLoading(true);
            try {
              await deleteProduct(accessToken, product.id);
              Alert.alert('Success', 'Product deleted');
              loadProducts();
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  // Not a brand - redirect or show message
  if (!isBrand) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="storefront-outline" size={64} color="#CCC" />
          <ThemedText style={styles.emptyTitle}>Brand Only</ThemedText>
          <ThemedText style={styles.emptyMessage}>This section is only available for brand accounts</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>My Products</ThemedText>
        <TouchableOpacity style={styles.addButton} onPress={openAddProduct}>
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={styles.addButtonText}>Add Product</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <ThemedText style={styles.statNumber}>{products.length}</ThemedText>
          <ThemedText style={styles.statLabel}>Total Products</ThemedText>
        </View>
        <View style={styles.statCard}>
          <ThemedText style={styles.statNumber}>{products.filter(p => p.is_active).length}</ThemedText>
          <ThemedText style={styles.statLabel}>Active</ThemedText>
        </View>
        <View style={styles.statCard}>
          <ThemedText style={styles.statNumber}>{products.filter(p => p.stock > 0).length}</ThemedText>
          <ThemedText style={styles.statLabel}>In Stock</ThemedText>
        </View>
      </View>

      {/* Product List */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 40 }} />
      ) : products.length === 0 ? (
        <View style={styles.emptyProducts}>
          <Ionicons name="cube-outline" size={64} color="#CCC" />
          <ThemedText style={styles.emptyProductsText}>No products yet</ThemedText>
          <ThemedText style={styles.emptyProductsSubtext}>Add your first product to start selling</ThemedText>
          <TouchableOpacity style={styles.addFirstButton} onPress={openAddProduct}>
            <Ionicons name="add-circle" size={20} color="#FFF" />
            <Text style={styles.addFirstButtonText}>Add Your First Product</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <View style={styles.productImagePlaceholder}>
                {item.image ? (
                  <Ionicons name="image" size={32} color="#999" />
                ) : (
                  <Ionicons name="cube" size={32} color="#999" />
                )}
              </View>
              <View style={styles.productInfo}>
                <ThemedText style={styles.productName}>{item.name}</ThemedText>
                <ThemedText style={styles.productCategory}>{item.category || 'Uncategorized'}</ThemedText>
                <View style={styles.priceRow}>
                  <ThemedText style={styles.productPrice}>${parseFloat(String(item.price || 0)).toFixed(2)}</ThemedText>
                  {item.sale_price && (
                    <ThemedText style={styles.salePrice}>${parseFloat(String(item.sale_price)).toFixed(2)}</ThemedText>
                  )}
                </View>
                <View style={styles.stockRow}>
                  <View style={[styles.stockBadge, item.stock > 0 ? styles.inStock : styles.outOfStock]}>
                    <Text style={styles.stockText}>{item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}</Text>
                  </View>
                  {!item.is_active && (
                    <View style={styles.inactiveBadge}>
                      <Text style={styles.inactiveText}>Inactive</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.productActions}>
                <TouchableOpacity 
                  style={styles.actionBtn} 
                  onPress={() => openEditProduct(item)}
                >
                  <Ionicons name="pencil" size={20} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDeleteProduct(item)}
                >
                  <Ionicons name="trash" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Product Modal */}
      <Modal
        visible={showProductModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowProductModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowProductModal(false)}>
              <ThemedText style={styles.modalCancel}>Cancel</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </ThemedText>
            <TouchableOpacity onPress={handleSaveProduct} disabled={isLoading}>
              <ThemedText style={[styles.modalSave, isLoading && { opacity: 0.5 }]}>
                {isLoading ? 'Saving...' : 'Save'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.inputLabel}>Product Name *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter product name"
              value={productName}
              onChangeText={setProductName}
              placeholderTextColor="#999"
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="Enter product description"
              value={productDescription}
              onChangeText={setProductDescription}
              multiline
              numberOfLines={3}
              placeholderTextColor="#999"
            />

            <Text style={styles.inputLabel}>Price *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="0.00"
              value={productPrice}
              onChangeText={setProductPrice}
              keyboardType="decimal-pad"
              placeholderTextColor="#999"
            />

            <Text style={styles.inputLabel}>Sale Price (optional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="0.00"
              value={productSalePrice}
              onChangeText={setProductSalePrice}
              keyboardType="decimal-pad"
              placeholderTextColor="#999"
            />

            <Text style={styles.inputLabel}>Category</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g., Clothing, Accessories"
              value={productCategory}
              onChangeText={setProductCategory}
              placeholderTextColor="#999"
            />

            <Text style={styles.inputLabel}>Product Images (Max 4)</Text>
            <View style={styles.imagePickerContainer}>
              {selectedImages.map((img, index) => (
                <View key={index} style={styles.imagePreviewContainer}>
                  <Image source={img.uri} style={styles.imagePreview} contentFit="cover" />
                  <TouchableOpacity 
                    style={styles.removeImageBtn}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}
              {selectedImages.length < 4 && (
                <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
                  <Ionicons name="camera" size={32} color="#666" />
                  <Text style={styles.addImageText}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.inputLabel}>Stock Quantity</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="0"
              value={productStock}
              onChangeText={setProductStock}
              keyboardType="number-pad"
              placeholderTextColor="#999"
            />
            
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  productList: {
    padding: 16,
    paddingBottom: 100,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  salePrice: {
    fontSize: 14,
    color: '#FF3B30',
    textDecorationLine: 'line-through',
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  inStock: {
    backgroundColor: '#E8F5E9',
  },
  outOfStock: {
    backgroundColor: '#FFEBEE',
  },
  stockText: {
    fontSize: 11,
    fontWeight: '500',
  },
  inactiveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FFF3E0',
  },
  inactiveText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#E65100',
  },
  productActions: {
    justifyContent: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    backgroundColor: '#FFF0F0',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyProducts: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyProductsText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyProductsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
  },
  addFirstButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalCancel: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalSave: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
    color: '#333',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imagePickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  imagePreviewContainer: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  addImageBtn: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#DDD',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  addImageText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
});
