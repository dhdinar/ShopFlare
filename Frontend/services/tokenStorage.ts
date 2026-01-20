// Token storage utility functions
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_KEY = 'auth_user';

export const saveTokens = async (access: string, refresh: string): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.setItem(ACCESS_TOKEN_KEY, access),
      AsyncStorage.setItem(REFRESH_TOKEN_KEY, refresh),
    ]);
  } catch (error) {
    console.error('Failed to save tokens:', error);
    throw error;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to get access token:', error);
    return null;
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to get refresh token:', error);
    return null;
  }
};

export const clearTokens = async (): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(ACCESS_TOKEN_KEY),
      AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ]);
  } catch (error) {
    console.error('Failed to clear tokens:', error);
    throw error;
  }
};

export const saveUser = async (user: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save user:', error);
    throw error;
  }
};

export const getUser = async (): Promise<any | null> => {
  try {
    const user = await AsyncStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Failed to get user:', error);
    return null;
  }
};

export const clearUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Failed to clear user:', error);
  }
};
