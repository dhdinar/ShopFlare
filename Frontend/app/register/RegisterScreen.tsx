import React, { useState, useRef, useEffect } from 'react';
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
  Animated,
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
  const [isBrandRegistration, setIsBrandRegistration] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // Common fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
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
      Alert.alert('Success', `${isBrandRegistration ? 'Brand' : 'Account'} created successfully!`);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'An error occurred');
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
            <Ionicons name={isBrandRegistration ? "storefront" : "bag"} size={40} color="#FFF" />
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
                color={!isBrandRegistration ? '#FFF' : ShopFlareColors.textLight} 
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
                color={isBrandRegistration ? '#FFF' : ShopFlareColors.textLight} 
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
    backgroundColor: '#F8F9FA',
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
    marginBottom: 24,
    fontSize: 14,
    color: ShopFlareColors.textSecondary,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
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
    color: '#FFF',
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputDisabled: {
    opacity: 0.6,
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
    color: ShopFlareColors.accent,
    fontWeight: '600',
  },
});
