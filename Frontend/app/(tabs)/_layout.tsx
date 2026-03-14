import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { ShopFlareColors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function TabLayout() {
  const { user } = useAuth();
  const isBrand = user?.user_type === 'brand';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ShopFlareColors.accent,
        tabBarInactiveTintColor: '#AAAAAA',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.2,
        },
      }}>
      {/* Home - visible to all */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={26} color={color} />
          ),
        }}
      />
      
      {/* Customer tabs - Wishlist and Cart */}
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          href: isBrand ? null : '/wishlist',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'heart' : 'heart-outline'} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          href: isBrand ? null : '/cart',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.cartIconContainer}>
              <View style={[styles.cartIconBg, focused && styles.cartIconBgActive]}>
                <Ionicons name={focused ? 'bag' : 'bag-outline'} size={24} color={focused ? '#FFF' : color} />
              </View>
            </View>
          ),
        }}
      />
      
      {/* Brand tabs - Products and Orders */}
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          href: isBrand ? '/products' : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'cube' : 'cube-outline'} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          href: isBrand ? '/orders' : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={26} color={color} />
          ),
        }}
      />
      
      {/* Chat - visible to all */}
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'} size={26} color={color} />
          ),
        }}
      />
      
      {/* Profile - visible to all */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  cartIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  cartIconBgActive: {
    backgroundColor: ShopFlareColors.accent,
    marginTop: -12,
    shadowColor: ShopFlareColors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});


