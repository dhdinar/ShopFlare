import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
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
import { useRouter } from 'expo-router';
import { ApiError } from '@/services/authService';
import InlineMessage from '@/components/ui/inline-message';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
}

export default function LoginScreen({ onNavigateToRegister }: LoginScreenProps) {
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | 'info'>('error');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLogin = async () => {
    setFormMessage('');
    setUsernameError('');
    setPasswordError('');

    let hasError = false;
    if (!username || !password) {
      if (!username) {
        setUsernameError('Username is required.');
        hasError = true;
      }
      if (!password) {
        setPasswordError('Password is required.');
        hasError = true;
      }

      if (hasError) {
        setMessageType('error');
        setFormMessage('Please correct the highlighted fields.');
        return;
      }
    }

    try {
      await login(username, password);
      // The layout will automatically navigate to tabs when isSignedIn becomes true
    } catch (error: any) {
      if (error instanceof ApiError && error.code === 'email_not_verified') {
        const accountEmail = error.data?.email;
        const accountType = error.data?.user_type;
        if (accountEmail && accountType) {
          router.push({
            pathname: '/verify-email',
            params: {
              email: accountEmail,
              userType: accountType,
            },
          });
          return;
        }
      }

      setMessageType('error');
      setFormMessage(error.message || 'Login failed. Please try again.');
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
            <Ionicons name="bag" size={40} color={ShopFlareColors.primary} />
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
              onChangeText={(text) => {
                setUsername(text);
                if (usernameError) setUsernameError('');
                if (formMessage) setFormMessage('');
              }}
              editable={!isLoading}
              autoCapitalize="none"
            />
          </View>
          {!!usernameError && <Text style={styles.fieldError}>{usernameError}</Text>}

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={ShopFlareColors.textLight} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, isLoading && styles.inputDisabled]}
              placeholder="Password"
              placeholderTextColor={ShopFlareColors.textLight}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError('');
                if (formMessage) setFormMessage('');
              }}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword((prev) => !prev)}
              disabled={isLoading}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={ShopFlareColors.textLight}
              />
            </TouchableOpacity>
          </View>
          {!!passwordError && <Text style={styles.fieldError}>{passwordError}</Text>}

          {!!formMessage && <InlineMessage message={formMessage} variant={messageType} />}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={ShopFlareColors.secondary} />
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

          <TouchableOpacity onPress={() => router.push('/forgot-password')}>
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
    backgroundColor: ShopFlareColors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: ShopFlareColors.secondary,
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
    backgroundColor: ShopFlareColors.secondary,
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
  eyeButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  fieldError: {
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 8,
    color: ShopFlareColors.error,
    fontSize: 12,
    fontWeight: '500',
  },
  button: {
    backgroundColor: ShopFlareColors.accent,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: ShopFlareColors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: ShopFlareColors.secondary,
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
    color: ShopFlareColors.accent,
    fontWeight: '600',
  },
  forgotPassword: {
    marginBottom: 0,
    color: ShopFlareColors.accent,
  },
});
