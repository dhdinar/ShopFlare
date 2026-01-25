import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as authService from '../services/authService';
import * as tokenStorage from '../services/tokenStorage';

export type UserType = 'user' | 'brand';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  bio?: string;
  is_email_verified: boolean;
  user_type: UserType;
  // Brand-specific fields
  brand_name?: string;
  brand_description?: string;
  brand_logo?: string;
  brand_website?: string;
  brand_address?: string;
  is_brand_verified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  isBrand: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  
  // Actions
  login: (username: string, password: string) => Promise<void>;
  register: (data: authService.RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string, newPassword2: string) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('AuthContext: Checking auth status...');
      setIsLoading(true);
      const token = await tokenStorage.getAccessToken();
      const storedUser = await tokenStorage.getUser();

      console.log('AuthContext: Token exists:', !!token);
      console.log('AuthContext: User exists:', !!storedUser);

      if (token && storedUser) {
        setAccessToken(token);
        setUser(storedUser);
        console.log('AuthContext: User restored from storage:', storedUser.username);
      } else {
        console.log('AuthContext: No stored auth data');
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
    } finally {
      setIsLoading(false);
      console.log('AuthContext: Auth check complete');
    }
  };

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('AuthContext: Attempting login for', username);
      const { user: userData, tokens } = await authService.login({
        username,
        password,
      });

      console.log('AuthContext: Login successful, user data:', userData);
      console.log('AuthContext: Setting user and tokens...');
      
      setAccessToken(tokens.access);
      setRefreshToken(tokens.refresh);
      setUser(userData);

      await tokenStorage.saveTokens(tokens.access, tokens.refresh);
      await tokenStorage.saveUser(userData);
      
      console.log('AuthContext: Auth state updated, isSignedIn should be true now');
    } catch (error: any) {
      console.error('AuthContext: Login error:', error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: authService.RegisterData) => {
    setIsLoading(true);
    try {
      const { user: userData, tokens } = await authService.register(data);

      setAccessToken(tokens.access);
      setRefreshToken(tokens.refresh);
      setUser(userData);

      await tokenStorage.saveTokens(tokens.access, tokens.refresh);
      await tokenStorage.saveUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (accessToken) {
        await authService.logout(accessToken);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      await tokenStorage.clearTokens();
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!accessToken) throw new Error('Not authenticated');

    setIsLoading(true);
    try {
      const updatedUser = await authService.updateProfile(accessToken, data);
      setUser(updatedUser);
      await tokenStorage.saveUser(updatedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string, newPassword2: string) => {
    if (!accessToken) throw new Error('Not authenticated');

    setIsLoading(true);
    try {
      await authService.changePassword(accessToken, {
        old_password: oldPassword,
        new_password: newPassword,
        new_password2: newPassword2,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isSignedIn: !!user,
    isBrand: user?.user_type === 'brand',
    accessToken,
    refreshToken,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
