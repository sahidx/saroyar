import { useState, useEffect } from 'react';
import { ArrowLeft, Key, Save, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function APISettings() {
  const [, setLocation] = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [apiKeys, setApiKeys] = useState<Array<{
    id: number;
    key: string;
    name: string;
    status: 'active' | 'inactive';
    showKey: boolean;
  }>>([
    { id: 1, key: '', name: 'GEMINI_API_KEY_1', status: 'inactive', showKey: false },
    { id: 2, key: '', name: 'GEMINI_API_KEY_2', status: 'inactive', showKey: false },
    { id: 3, key: '', name: 'GEMINI_API_KEY_3', status: 'inactive', showKey: false },
    { id: 4, key: '', name: 'GEMINI_API_KEY_4', status: 'inactive', showKey: false },
    { id: 5, key: '', name: 'GEMINI_API_KEY_5', status: 'inactive', showKey: false },
    { id: 6, key: '', name: 'GEMINI_API_KEY_6', status: 'inactive', showKey: false },
    { id: 7, key: '', name: 'GEMINI_API_KEY_7', status: 'inactive', showKey: false },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Toggle theme based on system preference
  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(isDark);
  }, []);

  // Load existing API keys on component mount
  useEffect(() => {
    const loadApiKeys = async () => {
      try {
        const response = await apiRequest('GET', '/api/praggo-ai/keys');
        if (response && Array.isArray(response)) {
          setApiKeys(response);
          console.log('✅ Loaded API keys:', response.filter((k: any) => k.hasKey).length, 'active');
        } else if (response) {
          console.log('⚠️ Unexpected response format:', response);
          // Handle non-array response by showing default keys
          setApiKeys(prev => prev.map(item => ({ ...item, hasKey: false, status: 'inactive' })));
        }
      } catch (error) {
        console.error('Error loading API keys:', error);
        toast({
          title: "তথ্য লোড ত্রুটি",
          description: "API keys লোড করতে সমস্যা হয়েছে।",
          variant: "destructive"
        });
      }
    };
    
    loadApiKeys();
  }, []);

  const updateApiKey = (id: number, key: string) => {
    setApiKeys(prev => prev.map(item => 
      item.id === id 
        ? { ...item, key, status: key.trim() ? 'active' : 'inactive' }
        : item
    ));
  };

  const toggleKeyVisibility = (id: number) => {
    setApiKeys(prev => prev.map(item => 
      item.id === id 
        ? { ...item, showKey: !item.showKey }
        : item
    ));
  };

  const handleSaveKeys = async () => {
    setIsSaving(true);
    try {
      const activeKeys = apiKeys.filter(k => k.key && k.key.trim().length > 10);
      
      if (activeKeys.length === 0) {
        toast({
          title: "সতর্কতা",
          description: "কমপক্ষে একটি বৈধ API key প্রয়োজন (কমপক্ষে ১০ অক্ষর)।",
          variant: "destructive"
        });
        setIsSaving(false);
        return;
      }

      console.log('💾 Saving API keys:', activeKeys.length, 'keys');

      // Make API call to save the keys
      const response = await apiRequest('POST', '/api/praggo-ai/keys', { keys: activeKeys });
      
      if (response && response.success) {
        toast({
          title: "🎯 Praggo AI Configured!",
          description: response.message || `${response.savedCount}টি API key সফলভাবে সংরক্ষণ করা হয়েছে`,
        });
        
        // Refresh the key status after a short delay
        setTimeout(async () => {
          try {
            const updatedKeys = await apiRequest('GET', '/api/praggo-ai/keys');
            if (updatedKeys && Array.isArray(updatedKeys)) {
              setApiKeys(updatedKeys);
            }
          } catch (refreshError) {
            console.warn('Failed to refresh key status:', refreshError);
          }
        }, 500);
      } else {
        throw new Error(response?.message || 'Save failed');
      }
    } catch (error: any) {
      console.error('API key save error:', error);
      
      let errorMessage = "API keys সংরক্ষণে সমস্যা হয়েছে।";
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: "সংরক্ষণ ত্রুটি",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const clearAllKeys = () => {
    setApiKeys(prev => prev.map(item => ({ 
      ...item, 
      key: '', 
      status: 'inactive' as const,
      showKey: false
    })));
  };

  const activeKeyCount = apiKeys.filter(k => k.status === 'active').length;

  return (
    <div className={`min-h-screen ${isDarkMode 
      ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900' 
      : 'bg-gradient-to-br from-blue-50 via-white to-green-50'
    }`}>
      {/* Header */}
      <header className={`backdrop-blur-sm border-b ${isDarkMode 
        ? 'bg-gray-800/95 border-blue-400/30' 
        : 'bg-white/95 border-blue-300/50 shadow-sm'
      }`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/teacher-dashboard')}
              className={`${isDarkMode 
                ? 'text-blue-300 hover:bg-blue-900/30' 
                : 'text-blue-600 hover:bg-blue-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              ড্যাশবোর্ড
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            🔐 Praggo AI API Keys সেটিংস
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Praggo AI ব্যবহারের জন্য Gemini API keys কনফিগার করুন
          </p>
        </div>

        <Card className={`border ${isDarkMode 
          ? 'bg-slate-800/50 border-blue-400/30' 
          : 'bg-white border-blue-200'
        }`}>
          <CardHeader>
            <CardTitle className={`flex items-center justify-between ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
              <div className="flex items-center">
                <Key className="w-5 h-5 mr-2" />
                API Keys Management
              </div>
              <Badge variant={activeKeyCount > 0 ? 'default' : 'secondary'}>
                {activeKeyCount}/7 Active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Instructions */}
            <div className={`p-4 rounded-lg border ${isDarkMode 
              ? 'bg-blue-900/20 border-blue-500/30' 
              : 'bg-blue-50 border-blue-200'
            }`}>
              <h3 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">
                📋 API Key সেটআপ নির্দেশনা:
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-600 dark:text-blue-300">
                <li>Google AI Studio থেকে Gemini API key সংগ্রহ করুন</li>
                <li>প্রতিটি API key আলাদা Google অ্যাকাউন্ট থেকে নিন (বেশি quota পেতে)</li>
                <li>নিচে API keys গুলো পেস্ট করুন</li>
                <li>Save করে Praggo AI ব্যবহার শুরু করুন</li>
              </ol>
            </div>

            {/* API Key Inputs */}
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className={`p-4 rounded-lg border ${isDarkMode 
                  ? 'bg-slate-900/50 border-slate-600' 
                  : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="font-medium text-sm">
                      {apiKey.name}
                    </Label>
                    <Badge variant={apiKey.status === 'active' ? 'default' : 'secondary'}>
                      {apiKey.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Input
                        type={apiKey.showKey ? 'text' : 'password'}
                        placeholder="AIzaSy... (Gemini API Key)"
                        value={apiKey.key}
                        onChange={(e) => updateApiKey(apiKey.id, e.target.value)}
                        className={`${isDarkMode 
                          ? 'bg-slate-800 border-slate-600' 
                          : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                      className="px-3"
                    >
                      {apiKey.showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleSaveKeys}
                disabled={isSaving || activeKeyCount === 0}
                className={`flex-1 ${isDarkMode 
                  ? 'bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600' 
                  : 'bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600'
                } text-white`}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    সংরক্ষণ হচ্ছে...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    API Keys সংরক্ষণ করুন
                  </>
                )}
              </Button>
              
              <Button
                onClick={clearAllKeys}
                variant="outline"
                className={`${isDarkMode 
                  ? 'border-red-400/30 text-red-300 hover:bg-red-900/30' 
                  : 'border-red-300 text-red-600 hover:bg-red-50'
                }`}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                সব Keys মুছুন
              </Button>
            </div>

            {/* Status Information */}
            {activeKeyCount > 0 && (
              <div className={`p-4 rounded-lg border ${isDarkMode 
                ? 'bg-green-900/20 border-green-500/30' 
                : 'bg-green-50 border-green-200'
              }`}>
                <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                  ✅ Praggo AI Ready!
                </h4>
                <p className="text-sm text-green-600 dark:text-green-300">
                  {activeKeyCount}টি API key সক্রিয় আছে। এখন আপনি Praggo AI ব্যবহার করে প্রশ্ন তৈরি করতে পারবেন।
                  স্মার্ট রোটেশন সিস্টেম প্রতিদিন ২৪ হাজার প্রশ্ন পর্যন্ত সাপোর্ট করবে।
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}