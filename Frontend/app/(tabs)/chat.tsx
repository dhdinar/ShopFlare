import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { ShopFlareColors } from '@/constants/theme';

// Sample chat conversations
const CONVERSATIONS = [
  {
    id: '1',
    name: 'ShopFlare Support',
    avatar: '🛍️',
    lastMessage: 'Your order #1234 has been shipped!',
    time: '2m ago',
    unread: 2,
    isOnline: true,
  },
  {
    id: '2',
    name: 'Fashion Store',
    avatar: '👗',
    lastMessage: 'Thank you for your purchase!',
    time: '1h ago',
    unread: 0,
    isOnline: true,
  },
  {
    id: '3',
    name: 'Tech Gadgets',
    avatar: '📱',
    lastMessage: 'Your refund has been processed',
    time: '3h ago',
    unread: 1,
    isOnline: false,
  },
  {
    id: '4',
    name: 'Sneaker Hub',
    avatar: '👟',
    lastMessage: 'New arrivals are here! Check them out',
    time: 'Yesterday',
    unread: 0,
    isOnline: false,
  },
];

export default function ChatScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState(CONVERSATIONS);

  const filteredConversations = conversations.filter(conv => 
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Messages</ThemedText>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="create-outline" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickAction}>
          <View style={[styles.quickActionIcon, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="help-circle-outline" size={24} color="#4CAF50" />
          </View>
          <ThemedText style={styles.quickActionText}>Help</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <View style={[styles.quickActionIcon, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="cube-outline" size={24} color="#FF9800" />
          </View>
          <ThemedText style={styles.quickActionText}>Orders</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <View style={[styles.quickActionIcon, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="return-up-back-outline" size={24} color="#2196F3" />
          </View>
          <ThemedText style={styles.quickActionText}>Returns</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <View style={[styles.quickActionIcon, { backgroundColor: '#FCE4EC' }]}>
            <Ionicons name="gift-outline" size={24} color={ShopFlareColors.primary} />
          </View>
          <ThemedText style={styles.quickActionText}>Offers</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Conversations */}
      <ThemedText style={styles.sectionTitle}>Recent Chats</ThemedText>
      
      {filteredConversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={60} color="#DDD" />
          <ThemedText style={styles.emptyText}>No conversations yet</ThemedText>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredConversations.map((conv) => (
            <TouchableOpacity key={conv.id} style={styles.conversationCard}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <ThemedText style={styles.avatarEmoji}>{conv.avatar}</ThemedText>
                </View>
                {conv.isOnline && <View style={styles.onlineDot} />}
              </View>
              <View style={styles.conversationInfo}>
                <View style={styles.conversationHeader}>
                  <ThemedText style={styles.conversationName}>{conv.name}</ThemedText>
                  <ThemedText style={styles.conversationTime}>{conv.time}</ThemedText>
                </View>
                <View style={styles.conversationFooter}>
                  <ThemedText style={styles.lastMessage} numberOfLines={1}>
                    {conv.lastMessage}
                  </ThemedText>
                  {conv.unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <ThemedText style={styles.unreadText}>{conv.unread}</ThemedText>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
          <View style={{ height: 100 }} />
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
  headerButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#1A1A1A',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  quickAction: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  conversationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  conversationTime: {
    fontSize: 12,
    color: '#999',
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: ShopFlareColors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
