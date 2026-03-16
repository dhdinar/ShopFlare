import React, { useCallback, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ShopFlareColors } from '@/constants/theme';
import {
  AppNotification,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/services/notificationService';

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString();
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const data = await getNotifications(accessToken);
      setItems(data);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  const handleOpenNotification = async (n: AppNotification) => {
    if (!accessToken) return;
    try {
      if (!n.is_read) {
        await markNotificationRead(accessToken, n.id);
        setItems(prev => prev.map(item => (item.id === n.id ? { ...item, is_read: true } : item)));
      }

      if (n.related_order) {
        router.push(`/orderDetail?id=${n.related_order}`);
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to open notification');
    }
  };

  const handleMarkAll = async () => {
    if (!accessToken) return;
    setMarkingAll(true);
    try {
      await markAllNotificationsRead(accessToken);
      setItems(prev => prev.map(item => ({ ...item, is_read: true })));
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to mark all as read');
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = items.filter(n => !n.is_read).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={ShopFlareColors.secondary} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Notifications</ThemedText>
        <TouchableOpacity
          style={[styles.markAllButton, unreadCount === 0 && styles.markAllButtonDisabled]}
          onPress={handleMarkAll}
          disabled={markingAll || unreadCount === 0}
        >
          <ThemedText style={styles.markAllText}>{markingAll ? '...' : 'Read all'}</ThemedText>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={ShopFlareColors.primary} style={{ marginTop: 40 }} />
      ) : items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="notifications-off-outline" size={52} color={ShopFlareColors.textLight} />
          <ThemedText style={styles.emptyTitle}>No notifications</ThemedText>
          <ThemedText style={styles.emptySub}>You are all caught up.</ThemedText>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, !item.is_read && styles.cardUnread]}
              onPress={() => handleOpenNotification(item)}
              activeOpacity={0.88}
            >
              <View style={styles.cardHeader}>
                <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
                {!item.is_read && <View style={styles.unreadDot} />}
              </View>
              {item.body ? <ThemedText style={styles.cardBody}>{item.body}</ThemedText> : null}
              <ThemedText style={styles.cardTime}>{formatTime(item.created_at)}</ThemedText>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ShopFlareColors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 18,
    backgroundColor: ShopFlareColors.primary,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: ShopFlareColors.secondary },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: ShopFlareColors.accent,
  },
  markAllButtonDisabled: { opacity: 0.5 },
  markAllText: { color: ShopFlareColors.secondary, fontWeight: '700', fontSize: 12 },
  listContent: { padding: 14, gap: 10, paddingBottom: 40 },
  card: {
    backgroundColor: ShopFlareColors.secondary,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: ShopFlareColors.borderLight,
  },
  cardUnread: {
    borderColor: ShopFlareColors.accent,
    backgroundColor: ShopFlareColors.accentLight,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: ShopFlareColors.text },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: ShopFlareColors.accent,
  },
  cardBody: { marginTop: 6, fontSize: 13, color: ShopFlareColors.textSecondary, lineHeight: 18 },
  cardTime: { marginTop: 8, fontSize: 11, color: ShopFlareColors.textLight },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  emptyTitle: { marginTop: 12, fontSize: 18, fontWeight: '700', color: ShopFlareColors.text },
  emptySub: { marginTop: 4, fontSize: 13, color: ShopFlareColors.textSecondary },
});
