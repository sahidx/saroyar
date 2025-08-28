import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, queryClient, apiRequest } from "@/lib/queryClient";

export function useAuth() {
  // Fetch current user from session-based API with faster retry
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
    staleTime: 30000, // Cache for 30 seconds
    queryFn: getQueryFn({ on401: "returnNull" }), // Return null on 401 instead of throwing
  });

  const isAuthenticated = !!user;

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { phoneNumber: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error) => {
      console.error('Login failed:', error);
      throw error;
    },
  });

  // Logout mutation - improved cleanup
  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log('🔄 Starting logout process...');
      await apiRequest('POST', '/api/auth/logout');
    },
    onSuccess: () => {
      console.log('✅ Logout API successful');
      // Clear ALL query cache to prevent stale data
      queryClient.clear();
      // Redirect to home
      window.location.replace('/');
    },
    onError: (error) => {
      console.error('❌ Logout API failed:', error);
      // Clear cache anyway and redirect
      queryClient.clear();
      window.location.replace('/');
    },
  });

  const login = async (credentials: { phoneNumber: string; password: string }) => {
    return loginMutation.mutateAsync(credentials);
  };

  const logout = async () => {
    return logoutMutation.mutateAsync();
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    loginMutation,
    logoutMutation,
  };
}
