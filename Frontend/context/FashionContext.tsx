import React, { createContext, useContext, useState } from 'react';
import { Product } from '@/constants/fashionData';

interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

interface Order {
  id: string;
  items: CartItem[];
  totalPrice: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress: string;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  productId: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
}

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  isDefault: boolean;
}

interface FashionContextType {
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  userProfile: UserProfile | null;
  messages: Message[];
  addToCart: (product: Product, size: string, color: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  getTotalPrice: () => number;
  checkout: (address: Address, paymentMethod: PaymentMethod) => void;
  setUserProfile: (profile: UserProfile) => void;
  addAddress: (address: Address) => void;
  addPaymentMethod: (method: PaymentMethod) => void;
  addMessage: (message: Message) => void;
  getProductMessages: (productId: string) => Message[];
}

const FashionContext = createContext<FashionContextType | undefined>(undefined);

export const FashionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const addToCart = (product: Product, size: string, color: string, quantity: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.id === product.id && item.selectedSize === size && item.selectedColor === color
      );

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id && item.selectedSize === size && item.selectedColor === color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prevCart, { ...product, quantity, selectedSize: size, selectedColor: color }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prevWishlist) =>
      prevWishlist.includes(productId) ? prevWishlist.filter((id) => id !== productId) : [...prevWishlist, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const checkout = (address: Address, paymentMethod: PaymentMethod) => {
    if (cart.length === 0) return;

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      items: [...cart],
      totalPrice: getTotalPrice(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      shippingAddress: `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`,
    };

    setOrders((prevOrders) => [...prevOrders, newOrder]);
    setCart([]);
  };

  const addAddress = (address: Address) => {
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        addresses: [...userProfile.addresses, address],
      });
    }
  };

  const addPaymentMethod = (method: PaymentMethod) => {
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        paymentMethods: [...userProfile.paymentMethods, method],
      });
    }
  };

  const addMessage = (message: Message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const getProductMessages = (productId: string) => {
    return messages.filter((msg) => msg.productId === productId);
  };

  return (
    <FashionContext.Provider
      value={{
        cart,
        wishlist,
        orders,
        userProfile,
        messages,
        addToCart,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isInWishlist,
        getTotalPrice,
        checkout,
        setUserProfile,
        addAddress,
        addPaymentMethod,
        addMessage,
        getProductMessages,
      }}
    >
      {children}
    </FashionContext.Provider>
  );
};

export const useFashion = () => {
  const context = useContext(FashionContext);
  if (!context) {
    throw new Error('useFashion must be used within FashionProvider');
  }
  return context;
};

export { FashionContext };
export type { CartItem, Order, Message, UserProfile, Address, PaymentMethod };
