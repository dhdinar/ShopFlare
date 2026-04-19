import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ShopFlareColors } from '@/constants/theme';

export default function PrivacyControlsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [profileVisible, setProfileVisible] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [orderAndSecurityAlerts, setOrderAndSecurityAlerts] = useState(true);

  const handleSave = () => {
    Alert.alert('Saved', 'Your privacy preferences have been updated.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={ShopFlareColors.secondary} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Privacy & Controls</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.cardDisabled} pointerEvents="none">
          <View style={styles.cardTitleRow}>
            <Ionicons name="person-circle-outline" size={20} color={ShopFlareColors.accent} />
            <ThemedText style={styles.cardTitle}>Account Privacy</ThemedText>
          </View>

          <View style={styles.optionRowDisabled}>
            <View style={styles.optionTextWrap}>
              <ThemedText style={styles.optionTitleDisabled}>Profile Visibility</ThemedText>
              <ThemedText style={styles.optionSubtitleDisabled}>
                Allow your public profile details to be visible in the app.
              </ThemedText>
            </View>
            <Switch
              value={profileVisible}
              onValueChange={undefined}
              trackColor={{ false: ShopFlareColors.border, true: ShopFlareColors.accentLight }}
              thumbColor={profileVisible ? ShopFlareColors.accent : ShopFlareColors.textLight}
              disabled
            />
          </View>
        </View>

        <View style={styles.cardDisabled} pointerEvents="none">
          <View style={styles.cardTitleRow}>
            <Ionicons name="notifications-outline" size={20} color={ShopFlareColors.accent} />
            <ThemedText style={styles.cardTitle}>Notifications</ThemedText>
          </View>

          <View style={styles.optionRowDisabled}>
            <View style={styles.optionTextWrap}>
              <ThemedText style={styles.optionTitleDisabled}>Order & Security Alerts</ThemedText>
              <ThemedText style={styles.optionSubtitleDisabled}>
                Receive important alerts about orders and account security.
              </ThemedText>
            </View>
            <Switch
              value={orderAndSecurityAlerts}
              onValueChange={undefined}
              trackColor={{ false: ShopFlareColors.border, true: ShopFlareColors.accentLight }}
              thumbColor={orderAndSecurityAlerts ? ShopFlareColors.accent : ShopFlareColors.textLight}
              disabled
            />
          </View>

          <View style={styles.optionRowDisabled}>
            <View style={styles.optionTextWrap}>
              <ThemedText style={styles.optionTitleDisabled}>Marketing Emails</ThemedText>
              <ThemedText style={styles.optionSubtitleDisabled}>
                Receive offers, launches, and feature updates from ShopFlare.
              </ThemedText>
            </View>
            <Switch
              value={marketingEmails}
              onValueChange={undefined}
              trackColor={{ false: ShopFlareColors.border, true: ShopFlareColors.accentLight }}
              thumbColor={marketingEmails ? ShopFlareColors.accent : ShopFlareColors.textLight}
              disabled
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="shield-checkmark-outline" size={20} color={ShopFlareColors.accent} />
            <ThemedText style={styles.cardTitle}>Security Actions</ThemedText>
          </View>

          <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/changePassword')}>
            <Ionicons name="key-outline" size={20} color={ShopFlareColors.primary} />
            <ThemedText style={styles.linkText}>Change Password</ThemedText>
            <Ionicons name="chevron-forward" size={18} color={ShopFlareColors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => Alert.alert('Coming Soon', 'Session management will be available soon.')}
          >
            <Ionicons name="phone-portrait-outline" size={20} color={ShopFlareColors.primary} />
            <ThemedText style={styles.linkText}>Manage Active Sessions</ThemedText>
            <Ionicons name="chevron-forward" size={18} color={ShopFlareColors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/helpSupport')}>
            <Ionicons name="help-circle-outline" size={20} color={ShopFlareColors.primary} />
            <ThemedText style={styles.linkText}>Privacy Help</ThemedText>
            <Ionicons name="chevron-forward" size={18} color={ShopFlareColors.textLight} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <ThemedText style={styles.saveButtonText}>Save Privacy Preferences</ThemedText>
        </TouchableOpacity>

        <ThemedText style={styles.footerText}>
          Signed in as {user?.email}
        </ThemedText>
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
  headerTitle: { fontSize: 21, fontWeight: '700', color: ShopFlareColors.secondary },
  headerSpacer: { width: 40 },
  content: { padding: 16, paddingBottom: 60 },
  card: {
    backgroundColor: ShopFlareColors.secondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ShopFlareColors.border,
    padding: 14,
    marginBottom: 12,
  },
  cardDisabled: {
    backgroundColor: ShopFlareColors.secondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ShopFlareColors.border,
    padding: 14,
    marginBottom: 12,
    opacity: 0.5,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: ShopFlareColors.text },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: ShopFlareColors.borderLight,
  },
  optionRowDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: ShopFlareColors.borderLight,
    opacity: 0.7,
  },
  optionTextWrap: { flex: 1, paddingRight: 12 },
  optionTitle: { fontSize: 14, fontWeight: '600', color: ShopFlareColors.text },
  optionTitleDisabled: { fontSize: 14, fontWeight: '600', color: ShopFlareColors.textLight },
  optionSubtitle: { fontSize: 12, color: ShopFlareColors.textSecondary, marginTop: 2, lineHeight: 17 },
  optionSubtitleDisabled: { fontSize: 12, color: ShopFlareColors.textLight, marginTop: 2, lineHeight: 17 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: ShopFlareColors.borderLight,
    paddingVertical: 12,
  },
  linkText: { flex: 1, fontSize: 14, fontWeight: '600', color: ShopFlareColors.text },
  saveButton: {
    backgroundColor: ShopFlareColors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  saveButtonText: { color: ShopFlareColors.secondary, fontSize: 15, fontWeight: '700' },
  footerText: { textAlign: 'center', color: ShopFlareColors.textSecondary, fontSize: 12 },
});
