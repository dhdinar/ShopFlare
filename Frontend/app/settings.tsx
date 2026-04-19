import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ShopFlareColors } from '@/constants/theme';

interface SettingRowProps {
  icon: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  value?: boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => void;
  showArrow?: boolean;
  danger?: boolean;
}

function SettingRow({
  icon,
  iconColor,
  title,
  subtitle,
  value,
  onToggle,
  onPress,
  showArrow = false,
  danger = false,
}: SettingRowProps) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress && !onToggle}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <View style={[styles.settingIcon, { backgroundColor: (iconColor || ShopFlareColors.primary) + '15' }]}>
        <Ionicons name={icon as any} size={20} color={iconColor || ShopFlareColors.primary} />
      </View>
      <View style={styles.settingText}>
        <ThemedText style={[styles.settingTitle, danger && { color: ShopFlareColors.error }]}>{title}</ThemedText>
        {subtitle && <ThemedText style={styles.settingSubtitle}>{subtitle}</ThemedText>}
      </View>
      {onToggle !== undefined && value !== undefined ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: ShopFlareColors.border, true: ShopFlareColors.accent }}
          thumbColor={ShopFlareColors.secondary}
        />
      ) : showArrow ? (
        <Ionicons name="chevron-forward" size={18} color={ShopFlareColors.textLight} />
      ) : null}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const isBrand = user?.user_type === 'brand';

  // Notification prefs
  const [orderNotif, setOrderNotif] = useState(true);
  const [promoNotif, setPromoNotif] = useState(true);
  const [chatNotif, setChatNotif] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(false);

  // Privacy
  const [activityStatus, setActivityStatus] = useState(true);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. All your data will be removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => Alert.alert('Request Sent', 'Account deletion request has been submitted.'),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={ShopFlareColors.secondary} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Settings</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Notifications */}
        <ThemedText style={styles.sectionLabel}>Notifications</ThemedText>
        <View style={styles.sectionCardDisabled}>
          <SettingRow
            icon="bag-check-outline"
            title="Order Updates"
            subtitle="Shipping and delivery alerts"
            value={orderNotif}
            onToggle={undefined}
            showArrow={false}
            // @ts-ignore
            disabled
            style={styles.settingRowDisabled}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="chatbubble-outline"
            title="Messages"
            subtitle="New chat messages"
            value={chatNotif}
            onToggle={undefined}
            showArrow={false}
            // @ts-ignore
            disabled
            style={styles.settingRowDisabled}
          />
          <View style={styles.divider} />
          {!isBrand && (
            <>
              <SettingRow
                icon="pricetag-outline"
                title="Promotions & Offers"
                subtitle="Deals and discount alerts"
                value={promoNotif}
                onToggle={undefined}
                showArrow={false}
                // @ts-ignore
                disabled
                style={styles.settingRowDisabled}
              />
              <View style={styles.divider} />
              <SettingRow
                icon="trending-down-outline"
                title="Price Drop Alerts"
                subtitle="When wishlist items go on sale"
                value={priceAlerts}
                onToggle={undefined}
                showArrow={false}
                // @ts-ignore
                disabled
                style={styles.settingRowDisabled}
              />
            </>
          )}
        </View>

        {/* Privacy */}
        <ThemedText style={styles.sectionLabel}>Privacy</ThemedText>
        <View style={styles.sectionCardDisabled}>
          <SettingRow
            icon="eye-outline"
            title="Activity Status"
            subtitle="Show when you're online"
            value={activityStatus}
            onToggle={undefined}
            showArrow={false}
            // @ts-ignore
            disabled
            style={styles.settingRowDisabled}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="lock-closed-outline"
            title="Privacy Policy"
            onPress={undefined}
            showArrow
            // @ts-ignore
            disabled
            style={styles.settingRowDisabled}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="document-text-outline"
            title="Terms of Service"
            onPress={undefined}
            showArrow
            // @ts-ignore
            disabled
            style={styles.settingRowDisabled}
          />
        </View>

        {/* Account */}
        <ThemedText style={styles.sectionLabel}>Account</ThemedText>
        <View style={styles.sectionCard}>
          <SettingRow
            icon="person-outline"
            title="Edit Profile"
            onPress={() => router.push('/editProfile')}
            showArrow
          />
          <View style={styles.divider} />
          <SettingRow
            icon="information-circle-outline"
            title="App Version"
            subtitle="1.0.0"
          />
          <View style={styles.divider} />
          <SettingRow
            icon="trash-outline"
            title="Delete Account"
            iconColor={ShopFlareColors.error}
            danger
            onPress={handleDeleteAccount}
            showArrow
          />
        </View>

      </ScrollView>
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
    paddingBottom: 20,
    backgroundColor: ShopFlareColors.primary,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: ShopFlareColors.secondary },
  content: { padding: 16, paddingBottom: 60 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: ShopFlareColors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: ShopFlareColors.secondary,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: ShopFlareColors.borderLight,
  },
  sectionCardDisabled: {
    backgroundColor: ShopFlareColors.secondary,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: ShopFlareColors.borderLight,
    opacity: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  settingRowDisabled: {
    opacity: 0.6,
  },
  settingIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: { flex: 1 },
  settingTitle: { fontSize: 15, color: ShopFlareColors.text, fontWeight: '600' },
  settingSubtitle: { fontSize: 12, color: ShopFlareColors.textLight, marginTop: 1 },
  divider: { height: 1, backgroundColor: ShopFlareColors.borderLight, marginLeft: 64 },
});
