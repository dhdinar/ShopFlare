import React, { useState, useRef, useEffect } from 'react';
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
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import InlineMessage from '@/components/ui/inline-message';
import { useAuth } from '@/context/AuthContext';
import { ShopFlareColors } from '@/constants/theme';
import { useRouter } from 'expo-router';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
}

export default function RegisterScreen({ onNavigateToLogin }: RegisterScreenProps) {
  const { register, isLoading } = useAuth();
  const router = useRouter();
  const [isBrandRegistration, setIsBrandRegistration] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // Common fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | 'info'>('error');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [password2Error, setPassword2Error] = useState('');
  
  // Brand-specific fields (username is the brand name for brands)
  const [brandDescription, setBrandDescription] = useState('');
  const [brandWebsite, setBrandWebsite] = useState('');
  const [brandAddress, setBrandAddress] = useState('');

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isBrandRegistration ? 1 : 0,
      useNativeDriver: false,
      tension: 50,
      friction: 10,
    }).start();
  }, [isBrandRegistration]);

  const handleRegister = async () => {
    setFormMessage('');
    setUsernameError('');
    setEmailError('');
    setPasswordError('');
    setPassword2Error('');

    let hasError = false;
    if (!username || !email || !password || !password2) {
      if (!username) {
        setUsernameError(isBrandRegistration ? 'Brand name is required.' : 'Username is required.');
        hasError = true;
      }
      if (!email) {
        setEmailError('Email is required.');
        hasError = true;
      }
      if (!password) {
        setPasswordError('Password is required.');
        hasError = true;
      }
      if (!password2) {
        setPassword2Error('Confirm your password.');
        hasError = true;
      }

      if (hasError) {
        setMessageType('error');
        setFormMessage('Please complete all required fields.');
        return;
      }
    }

    if (password !== password2) {
      setPassword2Error('Passwords do not match.');
      setMessageType('error');
      setFormMessage('Please correct the highlighted fields.');
      return;
    }

    try {
      const result = await register({
        username,  // For brands, this IS the brand name
        email,
        password,
        password2,
        first_name: firstName,
        last_name: lastName,
        user_type: isBrandRegistration ? 'brand' : 'user',
        ...(isBrandRegistration && {
          brand_description: brandDescription,
          brand_website: brandWebsite,
          brand_address: brandAddress,
        }),
      });
      setMessageType('success');
      setFormMessage(result.message || 'Registration successful. Please verify your email.');
      router.push({
        pathname: '/verify-email',
        params: {
          email: result.email,
          userType: result.user_type,
        },
      });
    } catch (error: any) {
      setMessageType('error');
      setFormMessage(error.message || 'Registration failed. Please try again.');
    }
  };

  const sliderLeft = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['2%', '50%'],
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name={isBrandRegistration ? "storefront" : "bag"} size={40} color={ShopFlareColors.primary} />
          </View>
          <Text style={styles.brandName}>ShopFlare</Text>
        </View>

        <ThemedView style={styles.innerContainer}>
          <ThemedText type="title" style={styles.title}>
            {isBrandRegistration ? 'Register Your Brand' : 'Create Account'}
          </ThemedText>

          <ThemedText style={styles.subtitle}>
            {isBrandRegistration ? 'Set up your shop on ShopFlare' : 'Sign up to get started'}
          </ThemedText>

          {/* Segmented Control for User/Brand */}
          <View style={styles.segmentedContainer}>
            <Animated.View 
              style={[
                styles.segmentedSlider,
                { left: sliderLeft }
              ]} 
            />
            <TouchableOpacity 
              style={styles.segmentedButton}
              onPress={() => setIsBrandRegistration(false)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="person" 
                size={18} 
                color={!isBrandRegistration ? ShopFlareColors.secondary : ShopFlareColors.textLight} 
                style={styles.segmentedIcon}
              />
              <Text style={[
                styles.segmentedText,
                !isBrandRegistration && styles.segmentedTextActive
              ]}>
                Customer
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.segmentedButton}
              onPress={() => setIsBrandRegistration(true)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="storefront" 
                size={18} 
                color={isBrandRegistration ? ShopFlareColors.secondary : ShopFlareColors.textLight} 
                style={styles.segmentedIcon}
              />
              <Text style={[
                styles.segmentedText,
                isBrandRegistration && styles.segmentedTextActive
              ]}>
                Brand
              </Text>
            </TouchableOpacity>
          </View>

          {/* Username / Brand Name Field */}
          <View style={styles.inputContainer}>
            <Ionicons name={isBrandRegistration ? "storefront-outline" : "person-outline"} size={20} color={ShopFlareColors.textLight} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, isLoading && styles.inputDisabled]}
              placeholder={isBrandRegistration ? "Brand Name *" : "Username"}
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
            <Ionicons name="mail-outline" size={20} color={ShopFlareColors.textLight} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, isLoading && styles.inputDisabled]}
              placeholder="Email"
              placeholderTextColor={ShopFlareColors.textLight}
              keyboardType="email-address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError('');
                if (formMessage) setFormMessage('');
              }}
              editable={!isLoading}
              autoCapitalize="none"
            />
          </View>
          {!!emailError && <Text style={styles.fieldError}>{emailError}</Text>}

          {!isBrandRegistration && (
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
          )}

          {/* Brand-specific Fields */}
          {isBrandRegistration && (
            <>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <Ionicons name="document-text-outline" size={20} color={ShopFlareColors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.textArea, isLoading && styles.inputDisabled]}
                  placeholder="Brand Description"
                  placeholderTextColor={ShopFlareColors.textLight}
                  value={brandDescription}
                  onChangeText={setBrandDescription}
                  editable={!isLoading}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="globe-outline" size={20} color={ShopFlareColors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, isLoading && styles.inputDisabled]}
                  placeholder="Website (optional)"
                  placeholderTextColor={ShopFlareColors.textLight}
                  value={brandWebsite}
                  onChangeText={setBrandWebsite}
                  editable={!isLoading}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="location-outline" size={20} color={ShopFlareColors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, isLoading && styles.inputDisabled]}
                  placeholder="Business Address (optional)"
                  placeholderTextColor={ShopFlareColors.textLight}
                  value={brandAddress}
                  onChangeText={setBrandAddress}
                  editable={!isLoading}
                />
              </View>
            </>
          )}

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

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={ShopFlareColors.textLight} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, isLoading && styles.inputDisabled]}
              placeholder="Confirm Password"
              placeholderTextColor={ShopFlareColors.textLight}
              secureTextEntry={!showConfirmPassword}
              value={password2}
              onChangeText={(text) => {
                setPassword2(text);
                if (password2Error) setPassword2Error('');
                if (formMessage) setFormMessage('');
              }}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword((prev) => !prev)}
              disabled={isLoading}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={ShopFlareColors.textLight}
              />
            </TouchableOpacity>
          </View>
          {!!password2Error && <Text style={styles.fieldError}>{password2Error}</Text>}

          {!!formMessage && <InlineMessage message={formMessage} variant={messageType} />}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={ShopFlareColors.secondary} />
            ) : (
              <Text style={styles.buttonText}>
                {isBrandRegistration ? 'Register Brand' : 'Create Account'}
              </Text>
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
    marginBottom: 24,
    fontSize: 14,
    color: ShopFlareColors.textSecondary,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: ShopFlareColors.borderLight,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    position: 'relative',
  },
  segmentedSlider: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: '48%',
    backgroundColor: ShopFlareColors.accent,
    borderRadius: 10,
    shadowColor: ShopFlareColors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentedButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    zIndex: 1,
  },
  segmentedIcon: {
    marginRight: 6,
  },
  segmentedText: {
    fontSize: 14,
    fontWeight: '600',
    color: ShopFlareColors.textLight,
  },
  segmentedTextActive: {
    color: ShopFlareColors.secondary,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
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
  textAreaContainer: {
    alignItems: 'flex-start',
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
  eyeButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
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
    color: ShopFlareColors.textSecondary,
    fontSize: 14,
  },
  linkBold: {
    color: ShopFlareColors.accent,
    fontWeight: '600',
  },
});
