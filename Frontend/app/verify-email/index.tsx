import React, { useEffect, useMemo, useState } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import InlineMessage from '@/components/ui/inline-message';
import { ShopFlareColors } from '@/constants/theme';
import { resendVerificationCode, verifyEmailCode, ApiError, UserType } from '@/services/authService';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; userType?: string }>();

  const email = typeof params.email === 'string' ? params.email : '';
  const userType: UserType = params.userType === 'brand' ? 'brand' : 'user';

  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [formMessage, setFormMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | 'info'>('error');
  const [codeError, setCodeError] = useState('');

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const maskedEmail = useMemo(() => {
    if (!email.includes('@')) return email;
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) return `${localPart[0] || ''}***@${domain}`;
    return `${localPart.slice(0, 2)}***@${domain}`;
  }, [email]);

  const handleVerify = async () => {
    setFormMessage('');
    setCodeError('');

    if (!email) {
      setMessageType('error');
      setFormMessage('Email is required for verification. Please register or login again.');
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setCodeError('Enter the 6-digit verification code.');
      setMessageType('error');
      setFormMessage('Please correct the highlighted field.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await verifyEmailCode({ email, user_type: userType, code });
      setMessageType('success');
      setFormMessage(result.message || 'Email verified successfully. Redirecting to login...');
      setTimeout(() => {
        router.replace('/login');
      }, 1200);
    } catch (error: any) {
      setMessageType('error');
      setFormMessage(error.message || 'Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email || cooldown > 0) return;

    setFormMessage('');
    setCodeError('');
    setIsResending(true);
    try {
      await resendVerificationCode(email, userType);
      setCooldown(60);
      setMessageType('success');
      setFormMessage('A new verification code was sent to your email.');
    } catch (error: any) {
      if (error instanceof ApiError && error.status === 429) {
        const retryAfter = Number(error.data?.retry_after || 60);
        setCooldown(retryAfter);
      }
      setMessageType('error');
      setFormMessage(error.message || 'Could not resend code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="mail-open-outline" size={40} color={ShopFlareColors.primary} />
          </View>
          <Text style={styles.brandName}>ShopFlare</Text>
        </View>

        <ThemedView style={styles.innerContainer}>
          <ThemedText type="title" style={styles.title}>Verify Your Email</ThemedText>
          <ThemedText style={styles.subtitle}>
            Enter the 6-digit code sent to {maskedEmail || 'your email'}
          </ThemedText>

          <View style={styles.inputContainer}>
            <Ionicons name="key-outline" size={20} color={ShopFlareColors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="123456"
              placeholderTextColor={ShopFlareColors.textLight}
              value={code}
              onChangeText={(text) => {
                setCode(text.replace(/[^0-9]/g, '').slice(0, 6));
                if (codeError) setCodeError('');
                if (formMessage) setFormMessage('');
              }}
              keyboardType="number-pad"
              maxLength={6}
              editable={!isSubmitting}
            />
          </View>
          {!!codeError && <Text style={styles.fieldError}>{codeError}</Text>}

          {!!formMessage && <InlineMessage message={formMessage} variant={messageType} />}

          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={isSubmitting}
          >
            {isSubmitting ? <ActivityIndicator color={ShopFlareColors.secondary} /> : <Text style={styles.buttonText}>Verify Email</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, (isResending || cooldown > 0) && styles.buttonDisabled]}
            onPress={handleResend}
            disabled={isResending || cooldown > 0}
          >
            <Text style={styles.secondaryButtonText}>
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/login')}>
            <ThemedText style={styles.link}>Back to login</ThemedText>
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
  },
  inputIcon: {
    paddingLeft: 16,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 20,
    letterSpacing: 8,
    color: ShopFlareColors.text,
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
    marginTop: 12,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: ShopFlareColors.accent,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: ShopFlareColors.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: ShopFlareColors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  link: {
    textAlign: 'center',
    marginTop: 20,
    color: ShopFlareColors.textSecondary,
    fontSize: 14,
  },
});
