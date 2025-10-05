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

  // Login function
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // For development/testing - simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock authentication logic
      if (credentials.phoneNumber && credentials.password) {
        let mockUser: User;

        // Different users based on phone number for testing
        if (credentials.phoneNumber.includes('01762602056') || credentials.phoneNumber.includes('teacher')) {
          mockUser = {
            id: 'teacher-001',
            firstName: 'Golam Sarowar',
            lastName: 'Sir',
            phoneNumber: '01762602056',
            role: 'teacher',
            email: 'teacher@example.com',
            smsCredits: 1000,
            isActive: true
          };
        } else if (credentials.phoneNumber.includes('super') || credentials.phoneNumber.includes('admin')) {
          mockUser = {
            id: 'super-001',
            firstName: 'Admin',
            lastName: 'User',
            phoneNumber: credentials.phoneNumber,
            role: 'super_user',
            email: 'admin@example.com',
            smsCredits: 5000,
            isActive: true
          };
        } else {
          mockUser = {
            id: 'student-001',
            firstName: 'Student',
            lastName: 'User',
            phoneNumber: credentials.phoneNumber,
            role: 'student',
            email: 'student@example.com',
            isActive: true
          };
        }

        // Store in localStorage for persistence
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
        
        setAuthState({
          user: mockUser,
          isLoading: false,
          error: null
        });

        return { success: true, user: mockUser };
      } else {
        throw new Error('Invalid credentials provided');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed. Please try again.';
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
