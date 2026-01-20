import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

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
            <Text style={styles.avatarText}>👤</Text>
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

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.username?.charAt(0).toUpperCase() || '👤'}</Text>
          </View>
          <ThemedText style={styles.username}>{user?.username}</ThemedText>
          <ThemedText style={styles.email}>{user?.email}</ThemedText>
        </View>

        {/* E-commerce Sections */}
        <TouchableOpacity style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bag-outline" size={24} color="#000000" />
            <ThemedText style={styles.sectionTitle}>My Orders</ThemedText>
            <Ionicons name="chevron-forward-outline" size={20} color="#999" />
          </View>
          <ThemedText style={styles.sectionSubtitle}>View your order history and status</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={24} color="#000000" />
            <ThemedText style={styles.sectionTitle}>My Addresses</ThemedText>
            <Ionicons name="chevron-forward-outline" size={20} color="#999" />
          </View>
          <ThemedText style={styles.sectionSubtitle}>Manage delivery addresses</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card-outline" size={24} color="#000000" />
            <ThemedText style={styles.sectionTitle}>Payment Methods</ThemedText>
            <Ionicons name="chevron-forward-outline" size={20} color="#999" />
          </View>
          <ThemedText style={styles.sectionSubtitle}>Add or manage payment options</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star-outline" size={24} color="#000000" />
            <ThemedText style={styles.sectionTitle}>Reviews & Ratings</ThemedText>
            <Ionicons name="chevron-forward-outline" size={20} color="#999" />
          </View>
          <ThemedText style={styles.sectionSubtitle}>View your product reviews</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={24} color="#000000" />
            <ThemedText style={styles.sectionTitle}>Edit Profile</ThemedText>
            <Ionicons name="chevron-forward-outline" size={20} color="#999" />
          </View>
          <ThemedText style={styles.sectionSubtitle}>Update your personal information</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings-outline" size={24} color="#000000" />
            <ThemedText style={styles.sectionTitle}>Settings</ThemedText>
            <Ionicons name="chevron-forward-outline" size={20} color="#999" />
          </View>
          <ThemedText style={styles.sectionSubtitle}>App preferences and notifications</ThemedText>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <ThemedText style={styles.logoutText}>Logout</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.6,
  },
  loginButton: {
    backgroundColor: '#000000',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  signupButton: {
    borderWidth: 2,
    borderColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: '#F0F0F0',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#999999',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    opacity: 0.6,
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    color: '#000000',
  },
  sectionSubtitle: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 8,
    marginLeft: 38,
    color: '#000000',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
