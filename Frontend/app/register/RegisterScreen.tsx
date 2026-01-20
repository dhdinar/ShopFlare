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

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
}

export default function RegisterScreen({ onNavigateToLogin }: RegisterScreenProps) {
  const { register, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleRegister = async () => {
    if (!username || !email || !password || !password2) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== password2) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      await register({
        username,
        email,
        password,
        password2,
        first_name: firstName,
        last_name: lastName,
      });
      Alert.alert('Success', 'Account created successfully!');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'An error occurred');
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
            Create Account
          </ThemedText>

          <ThemedText style={styles.subtitle}>
            Sign up to get started
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
            <Ionicons name="mail-outline" size={20} color={ShopFlareColors.textLight} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, isLoading && styles.inputDisabled]}
              placeholder="Email"
              placeholderTextColor={ShopFlareColors.textLight}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfInput]}>
              <TextInput
                style={[styles.input, isLoading && styles.inputDisabled]}
                placeholder="First Name"
                placeholderTextColor={ShopFlareColors.textLight}
                value={firstName}
                onChangeText={setFirstName}
                editable={!isLoading}
              />
            </View>
            <View style={[styles.inputContainer, styles.halfInput]}>
              <TextInput
                style={[styles.input, isLoading && styles.inputDisabled]}
                placeholder="Last Name"
                placeholderTextColor={ShopFlareColors.textLight}
                value={lastName}
                onChangeText={setLastName}
                editable={!isLoading}
              />
            </View>
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

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={ShopFlareColors.textLight} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, isLoading && styles.inputDisabled]}
              placeholder="Confirm Password"
              placeholderTextColor={ShopFlareColors.textLight}
              secureTextEntry
              value={password2}
              onChangeText={setPassword2}
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity onPress={onNavigateToLogin}>
            <ThemedText style={styles.link}>
              Already have an account? <Text style={styles.linkBold}>Sign in</Text>
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
  row: {
    flexDirection: 'row',
    gap: 12,
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
  halfInput: {
    flex: 1,
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
    color: ShopFlareColors.textSecondary,
    fontSize: 14,
  },
  linkBold: {
    color: ShopFlareColors.primary,
    fontWeight: '600',
  },
});
