import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { ShopFlareColors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getConversations, getProductMessages, getProductMessagesWithUser, sendMessage, sendMessageToUser, Conversation, Message } from '@/services/messageService';
import { Image } from 'expo-image';

export default function ChatScreen() {
  const { accessToken, isSignedIn, user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ productId?: string; brandName?: string; productName?: string; reviewerUsername?: string }>();

  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // Chat detail state
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageText, setMessageText] = useState('');
  const deepLinkHandled = useRef<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    try {
      const data = await getConversations(accessToken);
      setConversations(data);
    } catch (e) {
      console.error('Failed to fetch conversations:', e);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Handle deep link: open chat for a specific product (only once per productId)
  useEffect(() => {
    const deepLinkKey = params.reviewerUsername
      ? `${params.productId}_user_${params.reviewerUsername}`
      : params.productId || '';
    if (params.productId && accessToken && !loading && deepLinkHandled.current !== deepLinkKey) {
      deepLinkHandled.current = deepLinkKey;
      const pid = Number(params.productId);
      const chatType = params.reviewerUsername ? 'user' : 'brand';
      // Try to find existing conversation
      const existing = conversations.find(c => {
        if (c.product_id !== pid) return false;
        if (chatType === 'user') return c.chat_type === 'user' && c.other_party_name === params.reviewerUsername;
        return c.chat_type !== 'user';
      });
      if (existing) {
        openChat(existing);
      } else {
        // Create a virtual conversation entry
        openChat({
          product_id: pid,
          product_name: params.productName || 'Product',
          product_image: null,
          brand_name: params.brandName || 'Brand',
          other_party_name: params.reviewerUsername || params.brandName || 'Brand',
          last_message: '',
          last_message_time: new Date().toISOString(),
          is_last_from_brand: false,
          unread_count: 0,
          chat_type: chatType,
        });
      }
    }
  }, [params.productId, params.reviewerUsername, loading, accessToken]);

  const openChat = async (conv: Conversation) => {
    setActiveChat(conv);
    setMessages([]);
    setLoadingMessages(true);
    try {
      if (accessToken) {
        let data: Message[];
        if (conv.chat_type === 'user') {
          data = await getProductMessagesWithUser(accessToken, conv.product_id, conv.other_party_name);
        } else {
          data = await getProductMessages(accessToken, conv.product_id);
        }
        setMessages(data);
      }
    } catch (e) {
      console.error('Failed to load messages:', e);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeChat || !accessToken) return;
    try {
      if (activeChat.chat_type === 'user') {
        await sendMessageToUser(accessToken, activeChat.product_id, activeChat.other_party_name, messageText.trim());
      } else {
        await sendMessage(accessToken, activeChat.product_id, messageText.trim());
      }
      setMessageText('');
      // Refresh messages
      let data: Message[];
      if (activeChat.chat_type === 'user') {
        data = await getProductMessagesWithUser(accessToken, activeChat.product_id, activeChat.other_party_name);
      } else {
        data = await getProductMessages(accessToken, activeChat.product_id);
      }
      setMessages(data);
      // Refresh conversations list
      fetchConversations();
    } catch (e) {
      console.error('Failed to send message:', e);
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter(conv =>
    conv.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.other_party_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.brand_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = (user?.username && item.sender_username === user.username) ||
      (user?.user_type === 'brand' && item.is_from_brand);
    return (
      <View style={[styles.messageBubble, isMine ? styles.myMessage : styles.theirMessage]}>
        {!isMine && (
          <ThemedText style={styles.messageSender}>{item.sender_username}</ThemedText>
        )}
        <ThemedText style={[styles.messageText, isMine ? styles.myMessageText : styles.theirMessageText]}>
          {item.message}
        </ThemedText>
        <ThemedText style={[styles.messageTime, isMine ? styles.myMessageTime : styles.theirMessageTime]}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </ThemedText>
      </View>
    );
  };

  // ============ Chat Detail View ============
  if (activeChat) {
    return (
      <ThemedView style={styles.container}>
        {/* Chat Header */}
        <View style={styles.chatDetailHeader}>
          <TouchableOpacity onPress={() => { setActiveChat(null); deepLinkHandled.current = null; fetchConversations(); }} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={28} color={ShopFlareColors.primary} />
          </TouchableOpacity>
          <View style={styles.chatHeaderInfo}>
            <ThemedText style={styles.chatHeaderName} numberOfLines={1}>
              {activeChat.chat_type === 'user'
                ? activeChat.other_party_name
                : user?.user_type === 'brand' ? activeChat.other_party_name : activeChat.brand_name}
            </ThemedText>
            <ThemedText style={styles.chatHeaderProduct} numberOfLines={1}>
              {activeChat.product_name}
            </ThemedText>
          </View>
          {activeChat.product_image && (
            <Image source={{ uri: activeChat.product_image }} style={styles.chatHeaderImage} />
          )}
        </View>

        {/* Messages */}
        {loadingMessages ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={ShopFlareColors.primary} />
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyMessages}>
            <Ionicons name="chatbubble-ellipses-outline" size={60} color="#DDD" />
            <ThemedText style={styles.emptyText}>No messages yet</ThemedText>
            <ThemedText style={styles.emptySubText}>Start the conversation!</ThemedText>
          </View>
        ) : (
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            inverted={false}
          />
        )}

        {/* Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={90}
        >
          <View style={styles.inputBar}>
            <TextInput
              style={styles.chatInput}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !messageText.trim() && styles.sendBtnDisabled]}
              onPress={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <Ionicons name="send" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ThemedView>
    );
  }

  // ============ Conversations List View ============
  if (!isSignedIn) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Messages</ThemedText>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={60} color="#DDD" />
          <ThemedText style={styles.emptyText}>Login to view messages</ThemedText>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
            <ThemedText style={styles.loginButtonText}>Login</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Messages</ThemedText>
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

      {/* Conversations */}
      <ThemedText style={styles.sectionTitle}>Recent Chats</ThemedText>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ShopFlareColors.primary} />
        </View>
      ) : filteredConversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={60} color="#DDD" />
          <ThemedText style={styles.emptyText}>No conversations yet</ThemedText>
          <ThemedText style={styles.emptySubText}>Ask a question on any product to start chatting!</ThemedText>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredConversations.map((conv) => (
            <TouchableOpacity key={`${conv.product_id}_${conv.chat_type || 'brand'}_${conv.other_party_name}`} style={styles.conversationCard} onPress={() => openChat(conv)}>
              <View style={styles.avatarContainer}>
                {conv.product_image ? (
                  <Image source={{ uri: conv.product_image }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <ThemedText style={styles.avatarEmoji}>🛍️</ThemedText>
                  </View>
                )}
              </View>
              <View style={styles.conversationInfo}>
                <View style={styles.conversationHeader}>
                  <ThemedText style={styles.conversationName} numberOfLines={1}>
                    {conv.chat_type === 'user'
                      ? conv.other_party_name
                      : user?.user_type === 'brand' ? conv.other_party_name : conv.brand_name}
                  </ThemedText>
                  <ThemedText style={styles.conversationTime}>{formatTime(conv.last_message_time)}</ThemedText>
                </View>
                <ThemedText style={styles.productLabel} numberOfLines={1}>{conv.product_name}</ThemedText>
                <View style={styles.conversationFooter}>
                  <ThemedText style={styles.lastMessage} numberOfLines={1}>
                    {conv.is_last_from_brand ? `${conv.brand_name}: ` : 'You: '}{conv.last_message}
                  </ThemedText>
                  {conv.unread_count > 0 && (
                    <View style={styles.unreadBadge}>
                      <ThemedText style={styles.unreadText}>{conv.unread_count}</ThemedText>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 14,
    color: '#BBB',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  loginButton: {
    marginTop: 20,
    backgroundColor: ShopFlareColors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
  },
  loginButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
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
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 24,
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
    flex: 1,
    marginRight: 8,
  },
  conversationTime: {
    fontSize: 12,
    color: '#999',
  },
  productLabel: {
    fontSize: 12,
    color: ShopFlareColors.primary,
    marginTop: 2,
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
    backgroundColor: ShopFlareColors.accent,
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
  // ===== Chat Detail Styles =====
  chatDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    padding: 4,
    marginRight: 8,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  chatHeaderProduct: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  chatHeaderImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginLeft: 12,
  },
  emptyMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    marginVertical: 4,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: ShopFlareColors.primary,
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: 4,
  },
  messageSender: {
    fontSize: 11,
    fontWeight: '600',
    color: ShopFlareColors.primary,
    marginBottom: 2,
  },
  messageText: {
    fontSize: 15,
  },
  myMessageText: {
    color: '#FFF',
  },
  theirMessageText: {
    color: '#1A1A1A',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  myMessageTime: {
    color: '#FFF',
    textAlign: 'right',
  },
  theirMessageTime: {
    color: '#999',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 10,
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 15,
    backgroundColor: '#F8F9FA',
    color: '#1A1A1A',
  },
  sendBtn: {
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
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
