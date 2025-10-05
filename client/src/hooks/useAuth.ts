import { useState, useEffect } from 'react';

// User type
interface User {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'teacher' | 'student' | 'super_user';
  email?: string;
  smsCredits?: number;
  isActive: boolean;
}

// Auth state type
interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Login credentials type
interface LoginCredentials {
  phoneNumber: string;
  password: string;
}

// Storage key for persisting auth
const AUTH_STORAGE_KEY = 'coach_manager_auth';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null
  });

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setAuthState({
          user: parsed,
          isLoading: false,
          error: null
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading auth from storage:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Login function - Real API call
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('🔐 Attempting real API login for:', credentials.phoneNumber);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Login response received:', data);
      
      if (data.user) {
        const user: User = {
          id: data.user.id,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          phoneNumber: data.user.phoneNumber,
          role: data.user.role,
          email: data.user.email,
          smsCredits: data.user.smsCredits || 0,
          isActive: data.user.isActive ?? true
        };

        // Store in localStorage and update state
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        setAuthState({
          user,
          isLoading: false,
          error: null
        });

        console.log('✅ User authenticated successfully:', user.firstName, user.lastName);
        return { success: true, user };
      } else {
        throw new Error('No user data received from server');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error - please check your connection';
      console.error('❌ Login error:', errorMessage);
      
      setAuthState({
        user: null,
        isLoading: false,
        error: errorMessage
      });
      
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      // Clear localStorage
      localStorage.removeItem(AUTH_STORAGE_KEY);
      
      // Reset auth state
      setAuthState({
        user: null,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Login mutation object (for compatibility with existing code)
  const loginMutation = {
    isPending: authState.isLoading,
    mutate: (
      credentials: LoginCredentials,
      options?: {
        onSuccess?: (data: { user: User; message: string }) => void;
        onError?: (error: { message: string }) => void;
      }
    ) => {
      login(credentials).then(result => {
        if (result.success && result.user) {
          options?.onSuccess?.({ 
            user: result.user, 
            message: 'Login successful' 
          });
        } else {
          options?.onError?.({ 
            message: result.error || 'Login failed' 
          });
        }
      });
    },
    mutateAsync: login
  };

  // Logout mutation object (for compatibility)
  const logoutMutation = {
    isPending: false,
    mutate: logout,
    mutateAsync: logout
  };

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    isAuthenticated: !!authState.user,
    error: authState.error,
    login,
    logout,
    loginMutation,
    logoutMutation,
  };
}
