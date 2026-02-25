// API configuration and service functions
const API_BASE_URL = 'https://shopflare-api.onrender.com/api';

export type UserType = 'user' | 'brand';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  bio?: string;
  is_email_verified?: boolean;
  user_type: UserType;
  // Brand-specific fields (username is the brand name for brands)
  brand_description?: string;
  brand_logo?: string;
  brand_website?: string;
  brand_address?: string;
  is_brand_verified?: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface RegisterData {
  username: string;  // For brands, this is the brand name
  email: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
  user_type?: UserType;
  // Brand-specific fields
  brand_description?: string;
  brand_website?: string;
  brand_address?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
  new_password2: string;
}

// Register new user or brand
export const register = async (data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> => {
  // Use different endpoint for brand registration
  const endpoint = data.user_type === 'brand' 
    ? `${API_BASE_URL}/auth/register/brand/`
    : `${API_BASE_URL}/auth/register/`;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(Object.values(error).flat().join(', '));
  }

  const result = await response.json();
  return {
    user: result.user,
    tokens: { access: result.access, refresh: result.refresh },
  };
};

// Login user
export const login = async (data: LoginData): Promise<{ user: User; tokens: AuthTokens }> => {
  try {
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('Sending login request to:', `${API_BASE_URL}/auth/login/`);
    console.log('Request data:', data);
    
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('Response status:', response.status);
    
    // Get response text first to see what we're getting
    const responseText = await response.text();
    console.log('Response text:', responseText.substring(0, 500)); // First 500 chars

    if (!response.ok) {
      try {
        const error = JSON.parse(responseText);
        console.error('Login error response:', error);
        throw new Error(error.detail || error.message || 'Login failed');
      } catch (parseError) {
        // If not JSON, it's HTML error page
        console.error('Non-JSON error response, status:', response.status);
        throw new Error(`Login failed with status ${response.status}`);
      }
    }

    try {
      const result = JSON.parse(responseText);
      console.log('Login successful, user:', result.user?.username);
      return {
        user: result.user,
        tokens: { access: result.access, refresh: result.refresh },
      };
    } catch (parseError) {
      throw new Error('Invalid JSON response from server');
    }
  } catch (error: any) {
    console.error('Login request error:', error.message);
    throw error;
  }
};

// Get current user info
export const getCurrentUser = async (accessToken: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/auth/me/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }

  return await response.json();
};

// Update user profile
export const updateProfile = async (
  accessToken: string,
  data: Partial<User>,
): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/auth/update-profile/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(Object.values(error).flat().join(', '));
  }

  const result = await response.json();
  return result.user;
};

// Change password
export const changePassword = async (
  accessToken: string,
  data: ChangePasswordData,
): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/change-password/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to change password');
  }

  return await response.json();
};

// Logout (just clear tokens on client side)
export const logout = async (accessToken: string): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/auth/logout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    // Logout is optional on server, client-side token removal is enough
    console.error('Logout request failed:', error);
  }
};
