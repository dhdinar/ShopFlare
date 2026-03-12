import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { ShopFlareColors } from '@/constants/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const isBrand = user?.user_type === 'brand';

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to logout');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>&#x1F464;</Text>
          </View>
          <ThemedText style={styles.emptyTitle}>No Account</ThemedText>
          <ThemedText style={styles.emptyMessage}>Please sign in to view your profile</ThemedText>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signupButton} onPress={() => router.push('/register')}>
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  if (isBrand) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.brandHeader}>
            <View style={styles.brandAvatar}>
              <Ionicons name="storefront" size={36} color="#000" />
            </View>
            <ThemedText style={styles.brandName}>{user?.username}</ThemedText>
            <ThemedText style={styles.email}>{user?.email}</ThemedText>
            <View style={styles.brandBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
              <Text style={styles.brandBadgeText}>Brand Account</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.section} onPress={() => router.push('/editProfile')}>
            <View style={styles.sectionHeader}>
              <Ionicons name="storefront-outline" size={24} color={ShopFlareColors.primary} />
              <ThemedText style={styles.sectionTitle}>Brand Profile</ThemedText>
              <Ionicons name="chevron-forward-outline" size={20} color="#999" />
            </View>
            <ThemedText style={styles.sectionSubtitle}>Update your brand information</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.section} onPress={() => router.push('/settings')}>
            <View style={styles.sectionHeader}>
              <Ionicons name="settings-outline" size={24} color={ShopFlareColors.primary} />
              <ThemedText style={styles.sectionTitle}>Brand Settings</ThemedText>
              <Ionicons name="chevron-forward-outline" size={20} color="#999" />
            </View>
            <ThemedText style={styles.sectionSubtitle}>Manage your brand preferences</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.section} onPress={() => router.push('/brandAnalytics')}>
            <View style={styles.sectionHeader}>
              <Ionicons name="analytics-outline" size={24} color={ShopFlareColors.primary} />
              <ThemedText style={styles.sectionTitle}>Analytics</ThemedText>
              <Ionicons name="chevron-forward-outline" size={20} color="#999" />
            </View>
            <ThemedText style={styles.sectionSubtitle}>View sales and performance data</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.section} onPress={() => router.push('/helpSupport')}>
            <View style={styles.sectionHeader}>
              <Ionicons name="help-circle-outline" size={24} color={ShopFlareColors.primary} />
              <ThemedText style={styles.sectionTitle}>Help & Support</ThemedText>
              <Ionicons name="chevron-forward-outline" size={20} color="#999" />
            </View>
            <ThemedText style={styles.sectionSubtitle}>Get help and contact support</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
            <ThemedText style={styles.logoutText}>Logout</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.username?.charAt(0).toUpperCase() ?? '?'}</Text>
          </View>
          <ThemedText style={styles.username}>{user?.username}</ThemedText>
          <ThemedText style={styles.email}>{user?.email}</ThemedText>
          {(user?.first_name || user?.last_name) && (
            <ThemedText style={styles.fullName}>
              {[user.first_name, user.last_name].filter(Boolean).join(' ')}
            </ThemedText>
          )}
        </View>

        <TouchableOpacity style={styles.section} onPress={() => router.push('/(tabs)/orders')}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bag-outline" size={24} color={ShopFlareColors.primary} />
            <ThemedText style={styles.sectionTitle}>My Orders</ThemedText>
            <Ionicons name="chevron-forward-outline" size={20} color="#999" />
          </View>
          <ThemedText style={styles.sectionSubtitle}>View your order history and status</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.section} onPress={() => router.push('/addresses')}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={24} color={ShopFlareColors.primary} />
            <ThemedText style={styles.sectionTitle}>My Addresses</ThemedText>
            <Ionicons name="chevron-forward-outline" size={20} color="#999" />
          </View>
          <ThemedText style={styles.sectionSubtitle}>Manage delivery addresses</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.section} onPress={() => router.push('/myReviews')}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star-outline" size={24} color={ShopFlareColors.primary} />
            <ThemedText style={styles.sectionTitle}>Reviews & Ratings</ThemedText>
            <Ionicons name="chevron-forward-outline" size={20} color="#999" />
          </View>
          <ThemedText style={styles.sectionSubtitle}>View your product reviews</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.section} onPress={() => router.push('/editProfile')}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={24} color={ShopFlareColors.primary} />
            <ThemedText style={styles.sectionTitle}>Edit Profile</ThemedText>
            <Ionicons name="chevron-forward-outline" size={20} color="#999" />
          </View>
          <ThemedText style={styles.sectionSubtitle}>Update your personal information</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.section} onPress={() => router.push('/settings')}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings-outline" size={24} color={ShopFlareColors.primary} />
            <ThemedText style={styles.sectionTitle}>Settings</ThemedText>
            <Ionicons name="chevron-forward-outline" size={20} color="#999" />
          </View>
          <ThemedText style={styles.sectionSubtitle}>App preferences and notifications</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.section} onPress={() => router.push('/helpSupport')}>
          <View style={styles.sectionHeader}>
            <Ionicons name="help-circle-outline" size={24} color={ShopFlareColors.primary} />
            <ThemedText style={styles.sectionTitle}>Help & Support</ThemedText>
            <Ionicons name="chevron-forward-outline" size={20} color="#999" />
          </View>
          <ThemedText style={styles.sectionSubtitle}>Get help and contact support</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <ThemedText style={styles.logoutText}>Logout</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContent: { paddingBottom: 40 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 16, marginBottom: 8, textAlign: 'center' },
  emptyMessage: { fontSize: 16, textAlign: 'center', marginBottom: 32, opacity: 0.6 },
  loginButton: {
    backgroundColor: ShopFlareColors.accent,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: ShopFlareColors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signupButton: {
    borderWidth: 2,
    borderColor: ShopFlareColors.accent,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  signupButtonText: { fontSize: 16, fontWeight: '600', color: ShopFlareColors.accent },
  profileHeader: { alignItems: 'center', marginBottom: 32, paddingTop: 24 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: ShopFlareColors.accentLight,
    borderWidth: 3,
    borderColor: ShopFlareColors.accent,
  },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: ShopFlareColors.accent },
  username: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  email: { fontSize: 14, opacity: 0.6 },
  fullName: { fontSize: 15, color: '#555', marginTop: 4 },
  section: {
    marginHorizontal: 16,
    marginVertical: 6,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '600', flex: 1, color: '#1A1A1A' },
  sectionSubtitle: { fontSize: 13, opacity: 0.6, marginTop: 8, marginLeft: 38, color: '#000000' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: ShopFlareColors.primary,
    shadowColor: ShopFlareColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  brandAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: ShopFlareColors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: ShopFlareColors.accent,
  },
  brandName: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  brandBadgeText: { fontSize: 12, color: '#4CAF50', marginLeft: 4, fontWeight: '500' },
});
