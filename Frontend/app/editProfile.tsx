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

export default function EditProfileScreen() {
  const { user, accessToken, updateProfile, updateBrandProfile } = useAuth();
  const router = useRouter();
  const isBrand = user?.user_type === 'brand';

  // Profile fields
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [brandDescription, setBrandDescription] = useState(user?.brand_description || '');
  const [brandWebsite, setBrandWebsite] = useState(user?.brand_website || '');
  const [brandAddress, setBrandAddress] = useState(user?.brand_address || '');

  // Password change fields
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showNew2, setShowNew2] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveProfile = async () => {
    if (!accessToken) return;
    setSavingProfile(true);
    try {
      if (isBrand) {
        await updateBrandProfile({
          phone_number: phone,
          brand_description: brandDescription,
          brand_website: brandWebsite,
          brand_address: brandAddress,
        } as any);
      } else {
        await updateProfile({
          first_name: firstName,
          last_name: lastName,
          phone_number: phone,
          bio,
        });
      }
      Alert.alert('Success', 'Profile updated successfully');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!accessToken) return;
    if (!oldPassword || !newPassword || !newPassword2) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }
    setSavingPassword(true);
    try {
      if (isBrand) {
        await profileService.changeBrandPassword(accessToken, oldPassword, newPassword, newPassword2);
      } else {
        await profileService.changePassword(accessToken, oldPassword, newPassword, newPassword2);
      }
      Alert.alert('Success', 'Password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setNewPassword2('');
      setShowPasswordSection(false);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={ShopFlareColors.secondary} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Edit Profile</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            {isBrand ? (
              <Ionicons name="storefront" size={36} color={ShopFlareColors.primary} />
            ) : (
              <ThemedText style={styles.avatarText}>
                {user?.username?.charAt(0).toUpperCase() || '?'}
              </ThemedText>
            )}
          </View>
          <ThemedText style={styles.username}>{user?.username}</ThemedText>
          <ThemedText style={styles.email}>{user?.email}</ThemedText>
        </View>

        {/* Customer Fields */}
        {!isBrand && (
          <>
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>First Name</ThemedText>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter first name"
                placeholderTextColor={ShopFlareColors.textLight}
              />
            </View>
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>Last Name</ThemedText>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter last name"
                placeholderTextColor={ShopFlareColors.textLight}
              />
            </View>
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>Phone Number</ThemedText>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter phone number"
                placeholderTextColor={ShopFlareColors.textLight}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>Bio</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself"
                placeholderTextColor={ShopFlareColors.textLight}
                multiline
                numberOfLines={3}
              />
            </View>
          </>
        )}

        {/* Brand Fields */}
        {isBrand && (
          <>
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>Phone Number</ThemedText>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter phone number"
                placeholderTextColor={ShopFlareColors.textLight}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>Brand Description</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={brandDescription}
                onChangeText={setBrandDescription}
                placeholder="Describe your brand"
                placeholderTextColor={ShopFlareColors.textLight}
                multiline
                numberOfLines={3}
              />
            </View>
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>Website</ThemedText>
              <TextInput
                style={styles.input}
                value={brandWebsite}
                onChangeText={setBrandWebsite}
                placeholder="https://yourbrand.com"
                placeholderTextColor={ShopFlareColors.textLight}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>Brand Address</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={brandAddress}
                onChangeText={setBrandAddress}
                placeholder="Enter brand address"
                placeholderTextColor={ShopFlareColors.textLight}
                multiline
                numberOfLines={2}
              />
            </View>
          </>
        )}

        {/* Save Profile Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveProfile}
          disabled={savingProfile}
        >
          {savingProfile ? (
            <ActivityIndicator color={ShopFlareColors.secondary} />
          ) : (
            <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
          )}
        </TouchableOpacity>

        {/* Change Password Section */}
        <TouchableOpacity
          style={styles.passwordToggle}
          onPress={() => setShowPasswordSection(!showPasswordSection)}
        >
          <Ionicons name="lock-closed-outline" size={20} color={ShopFlareColors.primary} />
          <ThemedText style={styles.passwordToggleText}>Change Password</ThemedText>
          <Ionicons
            name={showPasswordSection ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={ShopFlareColors.primary}
          />
        </TouchableOpacity>

        {showPasswordSection && (
          <View style={styles.passwordSection}>
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
                  value={newPassword2}
                  onChangeText={setNewPassword2}
                  placeholder="Confirm new password"
                  placeholderTextColor={ShopFlareColors.textLight}
                  secureTextEntry={!showNew2}
                />
                <TouchableOpacity onPress={() => setShowNew2(!showNew2)} style={styles.eyeIcon}>
                  <Ionicons name={showNew2 ? 'eye-off' : 'eye'} size={20} color={ShopFlareColors.textLight} />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleChangePassword}
              disabled={savingPassword}
            >
              {savingPassword ? (
                <ActivityIndicator color={ShopFlareColors.secondary} />
              ) : (
                <ThemedText style={styles.saveButtonText}>Update Password</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        )}
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
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: ShopFlareColors.secondary },
  content: { padding: 20, paddingBottom: 60 },
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: ShopFlareColors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 3,
    borderColor: ShopFlareColors.accent,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: ShopFlareColors.accent },
  username: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  email: { fontSize: 14, color: ShopFlareColors.textSecondary },
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
    backgroundColor: ShopFlareColors.background,
  },
  textArea: { height: 80, textAlignVertical: 'top', paddingTop: 12 },
  passwordInputWrapper: { position: 'relative' },
  passwordInput: { paddingRight: 46 },
  eyeIcon: { position: 'absolute', right: 14, top: 14 },
  saveButton: {
    backgroundColor: ShopFlareColors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: ShopFlareColors.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonText: { color: ShopFlareColors.secondary, fontSize: 16, fontWeight: '700' },
  passwordToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    backgroundColor: ShopFlareColors.background,
    borderRadius: 12,
    marginBottom: 16,
  },
  passwordToggleText: { flex: 1, fontSize: 15, fontWeight: '600' },
  passwordSection: { marginBottom: 16 },
});
