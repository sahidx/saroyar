import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FlaskConical, Smartphone, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface LoginFormData {
  phoneNumber: string;
  password: string;
}

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const { loginMutation } = useAuth();

  const form = useForm<LoginFormData>({
    defaultValues: {
      phoneNumber: '',
      password: ''
    }
  });

  const handleLogin = async (data: LoginFormData) => {
    console.log('=== UNIFIED LOGIN FORM SUBMIT ===');
    console.log('Login data:', data);
    
    // Validate data
    if (!data.phoneNumber || !data.password) {
      alert('Please fill in both phone number and password');
      return;
    }

    console.log('🔍 Login attempt for phone:', data.phoneNumber);
    
    loginMutation.mutate(data, {
      onSuccess: (data) => {
        console.log('🎉 Login successful, user role:', data?.user?.role);
        form.reset();
        
        // Redirect based on role
        if (data?.user?.role === 'teacher') {
          console.log('Redirecting to teacher dashboard...');
          setLocation('/teacher');
        } else if (data?.user?.role === 'student') {
          console.log('Redirecting to student dashboard...');
          setLocation('/student');
        } else {
          console.log('Redirecting to home...');
          setLocation('/');
        }
      },
      onError: (error: any) => {
        console.error('❌ Login mutation error:', error);
        const message = error.message || 'Login failed. Please check your credentials.';
        alert(`Login Failed: ${message}`);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Lightweight Background Effects */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute top-10 left-10 w-16 h-16 bg-blue-500/10 rounded-full"></div>
        <div className="absolute top-32 right-16 w-12 h-12 bg-green-500/10 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-20 h-20 bg-purple-500/10 rounded-full"></div>
        <div className="absolute bottom-40 right-8 w-10 h-10 bg-yellow-500/10 rounded-full"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-emerald-500 to-blue-600 p-4 rounded-2xl shadow-lg">
              <FlaskConical className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Chemistry & ICT Care
          </h1>
          <p className="text-slate-300 text-lg">
            by Belal Sir
          </p>
        </div>

        {/* Login Card */}
        <Card className="w-full max-w-md bg-gray-800/90 border-gray-700 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-2xl text-white">Login</CardTitle>
            <CardDescription className="text-gray-300">
              Enter your phone number and password to access your account
            </CardDescription>
            
          </CardHeader>

          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-emerald-300 text-sm">Phone Number</FormLabel>
                      <FormControl>
                        <input 
                          type="text"
                          placeholder="Enter your phone number" 
                          value={field.value || ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          className="flex h-12 w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-base text-white placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                          data-testid="input-phone"
                          autoComplete="tel"
                          inputMode="tel"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-emerald-300 text-sm">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password" 
                            value={field.value || ''}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            className="flex h-12 w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 pr-12 text-base text-white placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                            data-testid="input-password"
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  disabled={loginMutation.isPending}
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 font-semibold text-lg rounded-lg"
                  data-testid="login-submit"
                >
                  {loginMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Logging in...
                    </div>
                  ) : (
                    'Login'
                  )}
                </Button>
              </form>
            </Form>

            <div className="text-center">
              <button 
                onClick={() => setLocation('/')}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                ← Back to Home
              </button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}