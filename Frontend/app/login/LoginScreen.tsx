import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { ShopFlareColors } from '@/constants/theme';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
}

export default function LoginScreen({ onNavigateToRegister }: LoginScreenProps) {
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    try {
      console.log('LoginScreen: Attempting login...');
      await login(username, password);
      console.log('LoginScreen: Login returned, app should navigate automatically');
      // The layout will automatically navigate to tabs when isSignedIn becomes true
    } catch (error: any) {
      console.error('LoginScreen: Login failed:', error);
      Alert.alert('Login Failed', error.message || JSON.stringify(error));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="bag" size={40} color="#FFF" />
          </View>
          <Text style={styles.brandName}>ShopFlare</Text>
        </View>

        <ThemedView style={styles.innerContainer}>
          <ThemedText type="title" style={styles.title}>
            Welcome Back
          </ThemedText>

          <ThemedText style={styles.subtitle}>
            Sign in to your account
          </ThemedText>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={ShopFlareColors.textLight} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, isLoading && styles.inputDisabled]}
              placeholder="Username"
              placeholderTextColor={ShopFlareColors.textLight}
              value={username}
              onChangeText={setUsername}
              editable={!isLoading}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={ShopFlareColors.textLight} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, isLoading && styles.inputDisabled]}
              placeholder="Password"
              placeholderTextColor={ShopFlareColors.textLight}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity onPress={onNavigateToRegister}>
            <ThemedText style={styles.link}>
              Don't have an account? <Text style={styles.linkBold}>Create one</Text>
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity>
            <ThemedText style={[styles.link, styles.forgotPassword]}>
              Forgot Password?
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ShopFlareColors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: ShopFlareColors.primary,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  innerContainer: {
    flex: 1,
    padding: 24,
    paddingTop: 32,
    backgroundColor: 'transparent',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 26,
    fontWeight: 'bold',
    color: ShopFlareColors.text,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    fontSize: 14,
    color: ShopFlareColors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: ShopFlareColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    paddingLeft: 16,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: ShopFlareColors.text,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  button: {
    backgroundColor: ShopFlareColors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: ShopFlareColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: ShopFlareColors.border,
    marginVertical: 24,
  },
  link: {
    textAlign: 'center',
    marginBottom: 12,
    color: ShopFlareColors.textSecondary,
    fontSize: 14,
  },
  linkBold: {
    color: ShopFlareColors.primary,
    fontWeight: '600',
  },
  forgotPassword: {
    marginBottom: 0,
  },
});
