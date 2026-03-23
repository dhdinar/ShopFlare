import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, BackHandler, Keyboard } from 'react-native';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { ShopFlareColors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { getConversations, getProductMessages, getProductMessagesWithUser, sendMessage, sendMessageToUser, Conversation, Message } from '@/services/messageService';
import { Image } from 'expo-image';

const CHAT_POLL_INTERVAL_MS = 3000;

export default function ChatScreen() {
  const { accessToken, isSignedIn, user } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ productId?: string; brandName?: string; productName?: string; reviewerUsername?: string }>();

  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // Chat detail state
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [inputBarHeight, setInputBarHeight] = useState(68);
  const deepLinkHandled = useRef<string | null>(null);
  const messageListRef = useRef<FlatList<Message>>(null);

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

  useFocusEffect(
    useCallback(() => {
      if (!accessToken) return;

      let isActive = true;

      const refreshConversations = async () => {
        if (!isActive || activeChat) return;
        try {
          const data = await getConversations(accessToken);
          if (isActive) {
            setConversations(data);
          }
        } catch (e) {
          console.error('Failed to refresh conversations:', e);
        }
      };

      refreshConversations();
      const intervalId = setInterval(refreshConversations, CHAT_POLL_INTERVAL_MS);

      return () => {
        isActive = false;
        clearInterval(intervalId);
      };
    }, [accessToken, activeChat])
  );

  const fetchMessagesForChat = useCallback(async (conv: Conversation): Promise<Message[]> => {
    if (!accessToken) return [];

    if (conv.chat_type === 'user') {
      return getProductMessagesWithUser(accessToken, conv.product_id, conv.other_party_name);
    }

    return getProductMessages(accessToken, conv.product_id);
  }, [accessToken]);

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
    setConversations((prev) => prev.map((c) => {
      const sameConversation = (
        c.product_id === conv.product_id &&
        (c.chat_type || 'brand') === (conv.chat_type || 'brand') &&
        c.other_party_name === conv.other_party_name
      );

      return sameConversation ? { ...c, unread_count: 0 } : c;
    }));

    setActiveChat(conv);
    setMessages([]);
    setLoadingMessages(true);
    try {
      const data = await fetchMessagesForChat(conv);
      setMessages(data);
    } catch (e) {
      console.error('Failed to load messages:', e);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (!activeChat || !accessToken) return;

    const intervalId = setInterval(async () => {
      try {
        const latestMessages = await fetchMessagesForChat(activeChat);
        setMessages((prev) => {
          if (prev.length === latestMessages.length) {
            const prevLast = prev[prev.length - 1];
            const nextLast = latestMessages[latestMessages.length - 1];
            if (
              prevLast &&
              nextLast &&
              prevLast.id === nextLast.id &&
              prevLast.timestamp === nextLast.timestamp
            ) {
              return prev;
            }
          }
          return latestMessages;
        });
      } catch (e) {
        console.error('Failed to refresh messages:', e);
      }
    }, CHAT_POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [activeChat, accessToken, fetchMessagesForChat]);

  useEffect(() => {
    if (!activeChat) return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setActiveChat(null);
      deepLinkHandled.current = null;
      fetchConversations();
      return true;
    });

    return () => subscription.remove();
  }, [activeChat, fetchConversations]);

  const scrollMessagesToBottom = useCallback((animated = true, delay = 0) => {
    const runScroll = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          messageListRef.current?.scrollToEnd({ animated });
        });
      });
    };

    if (delay > 0) {
      setTimeout(runScroll, delay);
      return;
    }

    runScroll();
  }, []);

  useEffect(() => {
    if (!activeChat || loadingMessages || messages.length === 0) return;
    scrollMessagesToBottom(true, 0);
  }, [messages.length, activeChat, loadingMessages, scrollMessagesToBottom]);

  useEffect(() => {
    if (!activeChat) return;

    const handleKeyboardShow = () => {
      scrollMessagesToBottom(false, Platform.OS === 'ios' ? 40 : 20);
    };

    const handleKeyboardHide = () => {
      scrollMessagesToBottom(false, Platform.OS === 'ios' ? 70 : 35);
    };

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, handleKeyboardShow);
    const hideSub = Keyboard.addListener(hideEvent, handleKeyboardHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [activeChat, scrollMessagesToBottom]);

  useEffect(() => {
    const parentNavigation = navigation.getParent();
    if (!parentNavigation) return;

    parentNavigation.setOptions({
      tabBarStyle: activeChat ? { display: 'none' } : undefined,
    });

    return () => {
      parentNavigation.setOptions({ tabBarStyle: undefined });
    };
  }, [activeChat, navigation]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeChat || !accessToken) return;
    try {
      let sentMessage: Message;
      if (activeChat.chat_type === 'user') {
        sentMessage = await sendMessageToUser(accessToken, activeChat.product_id, activeChat.other_party_name, messageText.trim());
      } else {
        sentMessage = await sendMessage(accessToken, activeChat.product_id, messageText.trim());
      }

      setMessages((prev) => [...prev, sentMessage]);
      setMessageText('');

      // Re-sync with server list to avoid duplicates or ordering mismatch
      const data = await fetchMessagesForChat(activeChat);
      setMessages(data);
      scrollMessagesToBottom(false, 0);

      // Refresh conversations list
      fetchConversations();
    } catch (e) {
      console.error('Failed to send message:', e);
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.other_party_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.brand_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLastMessagePrefix = (conv: Conversation) => {
    const isFromMe =
      typeof conv.is_last_from_me === 'boolean'
        ? conv.is_last_from_me
        : (conv.last_sender_name && user?.username
          ? conv.last_sender_name === user.username
          : false);

    if (isFromMe) return 'You: ';
    return `${conv.last_sender_name || conv.other_party_name}: `;
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = (user?.username && item.sender_username === user.username) ||
      (user?.user_type === 'brand' && item.is_from_brand);
    return (
      <View style={[styles.messageBubble, isMine ? styles.myMessage : styles.theirMessage]}>
        <ThemedText style={[styles.messageText, isMine ? styles.myMessageText : styles.theirMessageText]}>
          {item.message}
        </ThemedText>
        <ThemedText style={[styles.messageTime, isMine ? styles.myMessageTime : styles.theirMessageTime]}>
          {new Date(item.timestamp).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}
        </ThemedText>
      </View>
    );
  };

  // ============ Chat Detail View ============
  if (activeChat) {
    return (
      <ThemedView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.chatDetailWrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {/* Chat Header */}
          <View style={styles.chatDetailHeader}>
            <TouchableOpacity onPress={() => { setActiveChat(null); deepLinkHandled.current = null; fetchConversations(); }} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={28} color={ShopFlareColors.secondary} />
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
              <Ionicons name="chatbubble-ellipses-outline" size={60} color={ShopFlareColors.border} />
              <ThemedText style={styles.emptyText}>No messages yet</ThemedText>
              <ThemedText style={styles.emptySubText}>Start the conversation!</ThemedText>
            </View>
          ) : (
            <FlatList
              ref={messageListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={styles.messagesList}
              ListFooterComponent={<View style={{ height: Math.max(8, Math.round(inputBarHeight * 0.16)) }} />}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => scrollMessagesToBottom(false)}
              keyboardShouldPersistTaps="handled"
              inverted={false}
            />
          )}

          {/* Input */}
          <View
            style={styles.inputBar}
            onLayout={(event) => {
              const nextHeight = Math.ceil(event.nativeEvent.layout.height);
              if (nextHeight !== inputBarHeight) {
                setInputBarHeight(nextHeight);
              }
            }}
          >
            <TextInput
              style={styles.chatInput}
              placeholder="Type a message..."
              placeholderTextColor={ShopFlareColors.textLight}
              value={messageText}
              onChangeText={setMessageText}
              onFocus={() => scrollMessagesToBottom(false, Platform.OS === 'ios' ? 40 : 20)}
              onBlur={() => scrollMessagesToBottom(false, Platform.OS === 'ios' ? 70 : 35)}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !messageText.trim() && styles.sendBtnDisabled]}
              onPress={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <Ionicons name="send" size={20} color={ShopFlareColors.secondary} />
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
          <Ionicons name="chatbubbles-outline" size={60} color={ShopFlareColors.border} />
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
        <Ionicons name="search-outline" size={20} color={ShopFlareColors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
          placeholderTextColor={ShopFlareColors.textLight}
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
          <Ionicons name="chatbubbles-outline" size={60} color={ShopFlareColors.border} />
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
                  <View style={styles.titleRow}>
                    <ThemedText style={styles.conversationName} numberOfLines={1}>
                      {conv.chat_type === 'user'
                        ? conv.other_party_name
                        : user?.user_type === 'brand' ? conv.other_party_name : conv.brand_name}
                    </ThemedText>
                    <ThemedText style={styles.productInline} numberOfLines={1}> • {conv.product_name}</ThemedText>
                  </View>
                  <ThemedText style={styles.conversationTime}>{formatTime(conv.last_message_time)}</ThemedText>
                </View>
                <View style={styles.conversationFooter}>
                  <ThemedText
                    style={[styles.lastMessage, conv.unread_count > 0 && styles.lastMessageUnread]}
                    numberOfLines={1}
                  >
                    {getLastMessagePrefix(conv)}{conv.last_message}
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
    backgroundColor: ShopFlareColors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: ShopFlareColors.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ShopFlareColors.secondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ShopFlareColors.secondary,
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    color: ShopFlareColors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ShopFlareColors.text,
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
    color: ShopFlareColors.textLight,
    marginTop: 12,
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 14,
    color: ShopFlareColors.textLight,
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
    color: ShopFlareColors.secondary,
    fontWeight: '600',
    fontSize: 16,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ShopFlareColors.secondary,
    marginHorizontal: 20,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ShopFlareColors.background,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ShopFlareColors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 20,
  },
  conversationInfo: {
    flex: 1,
    marginLeft: 10,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
 
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
  },
  conversationName: {
    fontSize: 15,
    fontWeight: '600',
    color: ShopFlareColors.text,
    flexShrink: 1,
  },
  productInline: {
    fontSize: 11,
    color: ShopFlareColors.primary,
    flexShrink: 1,
  },
  conversationTime: {
    fontSize: 11,
    color: ShopFlareColors.textLight,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 1,
  },
  lastMessage: {
    fontSize: 13,
    color: ShopFlareColors.textSecondary,
    flex: 1,
    marginRight: 6,
  },
  lastMessageUnread: {
    fontWeight: '700',
    color: ShopFlareColors.text,
  },
  unreadBadge: {
    backgroundColor: ShopFlareColors.accent,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: ShopFlareColors.secondary,
    fontSize: 11,
    fontWeight: '600',
  },
  // ===== Chat Detail Styles =====
  chatDetailWrapper: {
    flex: 1,
  },
  chatDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 27,
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: ShopFlareColors.primary,
  },
  backBtn: {
    padding: 0,
    marginRight: 12,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ShopFlareColors.secondary,
  },
  chatHeaderProduct: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  chatHeaderImage: {
    width: 42,
    height: 42,
    borderRadius: 16,
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
    position: 'relative',
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 8,
    paddingBottom: 14,
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
    backgroundColor: ShopFlareColors.borderLight,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    paddingRight: 46,
  },
  myMessageText: {
    color: ShopFlareColors.secondary,
  },
  theirMessageText: {
    color: ShopFlareColors.text,
  },
  messageTime: {
    position: 'absolute',
    right: 10,
    bottom: 4,
    fontSize: 11,
    opacity: 0.7,
  },
  myMessageTime: {
    color: ShopFlareColors.secondary,
  },
  theirMessageTime: {
    color: ShopFlareColors.textLight,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: ShopFlareColors.secondary,
    borderTopWidth: 1,
    borderTopColor: ShopFlareColors.borderLight,
    gap: 10,
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: ShopFlareColors.border,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 15,
    backgroundColor: ShopFlareColors.background,
    color: ShopFlareColors.text,
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
