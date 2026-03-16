import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ShopFlareColors } from '@/constants/theme';
import * as profileService from '@/services/profileService';

export default function ChangePasswordScreen() {
  const { user, accessToken } = useAuth();
  const router = useRouter();
  const isBrand = user?.user_type === 'brand';

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (!accessToken) {
      Alert.alert('Error', 'You are not authenticated. Please log in again.');
      return;
    }

    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirmation do not match.');
      return;
    }

    setSaving(true);
    try {
      if (isBrand) {
        await profileService.changeBrandPassword(accessToken, oldPassword, newPassword, confirmPassword);
      } else {
        await profileService.changePassword(accessToken, oldPassword, newPassword, confirmPassword);
      }

      Alert.alert('Success', 'Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={ShopFlareColors.secondary} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Change Password</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={20} color={ShopFlareColors.accent} />
          <ThemedText style={styles.infoText}>
            Use a strong password with at least 8 characters.
          </ThemedText>
        </View>

        <View style={styles.fieldGroup}>
          <ThemedText style={styles.label}>Current Password</ThemedText>
          <View style={styles.passwordInputWrapper}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder="Enter current password"
              placeholderTextColor={ShopFlareColors.textLight}
              secureTextEntry={!showOld}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowOld(!showOld)} style={styles.eyeIcon}>
              <Ionicons name={showOld ? 'eye-off' : 'eye'} size={20} color={ShopFlareColors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <ThemedText style={styles.label}>New Password</ThemedText>
          <View style={styles.passwordInputWrapper}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              placeholderTextColor={ShopFlareColors.textLight}
              secureTextEntry={!showNew}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeIcon}>
              <Ionicons name={showNew ? 'eye-off' : 'eye'} size={20} color={ShopFlareColors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <ThemedText style={styles.label}>Confirm New Password</ThemedText>
          <View style={styles.passwordInputWrapper}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor={ShopFlareColors.textLight}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeIcon}>
              <Ionicons name={showConfirm ? 'eye-off' : 'eye'} size={20} color={ShopFlareColors.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleChangePassword}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={ShopFlareColors.secondary} />
          ) : (
            <ThemedText style={styles.saveButtonText}>Update Password</ThemedText>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  headerTitle: { fontSize: 22, fontWeight: '700', color: ShopFlareColors.secondary },
  headerSpacer: { width: 40 },
  content: { padding: 20, paddingBottom: 60 },
  infoCard: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: ShopFlareColors.accentLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ShopFlareColors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
  },
  infoText: { flex: 1, fontSize: 13, color: ShopFlareColors.textSecondary, lineHeight: 18 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: ShopFlareColors.textSecondary, marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: ShopFlareColors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: ShopFlareColors.text,
    backgroundColor: ShopFlareColors.secondary,
  },
  passwordInputWrapper: { position: 'relative' },
  passwordInput: { paddingRight: 46 },
  eyeIcon: { position: 'absolute', right: 14, top: 14 },
  saveButton: {
    backgroundColor: ShopFlareColors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: ShopFlareColors.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonDisabled: { opacity: 0.75 },
  saveButtonText: { color: ShopFlareColors.secondary, fontSize: 16, fontWeight: '700' },
});
