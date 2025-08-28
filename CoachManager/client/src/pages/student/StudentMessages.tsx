import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft,
  MessageSquare,
  Send,
  User,
  Clock,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import { MobileWrapper } from '@/components/MobileWrapper';
import { useLocation } from 'wouter';

export default function StudentMessages() {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [, setLocation] = useLocation();
  const [newMessage, setNewMessage] = useState('');

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // Here you would typically send the message to the backend
    console.log('Sending message:', newMessage);
    setNewMessage('');
  };

  return (
    <MobileWrapper>
      <div className={`min-h-screen ${isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' 
        : 'bg-gradient-to-br from-white via-gray-50 to-cyan-50'
      } transition-colors duration-300`}>
        
        {/* Header */}
        <header className={`sticky top-0 z-50 force-mobile-header ${isDarkMode 
          ? 'bg-slate-800/95 backdrop-blur-sm border-b border-emerald-400/30' 
          : 'bg-white/95 backdrop-blur-sm border-b border-emerald-200 shadow-sm'
        }`}>
          <div className="mobile-header-content force-mobile-padding px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation('/student')}
                  className={`w-9 h-9 ${isDarkMode 
                    ? 'hover:bg-slate-700 text-emerald-400' 
                    : 'hover:bg-gray-100 text-emerald-600'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    বার্তা
                  </h1>
                  <p className={`text-sm ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    শিক্ষকের সাথে যোগাযোগ
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`w-9 h-9 ${isDarkMode 
                    ? 'hover:bg-slate-700 text-yellow-400' 
                    : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className={`w-9 h-9 ${isDarkMode 
                    ? 'hover:bg-slate-700 text-red-400' 
                    : 'hover:bg-gray-100 text-red-600'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="force-mobile-layout px-3 py-4 pb-24">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Messages List */}
            <Card className={`force-mobile-card ${isDarkMode 
              ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-400/30' 
              : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 shadow-md'
            }`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                  <MessageSquare className="w-5 h-5" />
                  শিক্ষকের বার্তা সমূহ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">কোনো বার্তা নেই</p>
                  <p className="text-xs mt-1">শিক্ষক বার্তা পাঠালে এখানে দেখানো হবে</p>
                </div>
              </CardContent>
            </Card>

            {/* Send Message Section */}
            <Card className={`force-mobile-card ${isDarkMode 
              ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30' 
              : 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 shadow-md'
            }`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                  <Send className="w-5 h-5" />
                  শিক্ষককে বার্তা পাঠান
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      প্রাপক: বেলাল স্যার
                    </label>
                    <Input
                      value="বেলাল স্যার (Chemistry & ICT Teacher)"
                      disabled
                      className={`${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-gray-100 border-gray-300'}`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      আপনার বার্তা
                    </label>
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="এখানে আপনার বার্তা লিখুন..."
                      className={`min-h-[100px] ${isDarkMode 
                        ? 'bg-slate-800 border-slate-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    disabled={!newMessage.trim()}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    বার্তা পাঠান
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Message Guidelines */}
            <Card className={`force-mobile-card ${isDarkMode ? 'bg-slate-800/80 border-slate-600' : 'bg-white border-gray-200 shadow-md'}`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-700'}`}>
                  <User className="w-5 h-5" />
                  বার্তা নির্দেশনা
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    📝 বার্তা পাঠানোর নিয়ম:
                  </h4>
                  <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <li>• সম্মানজনক ভাষা ব্যবহার করুন</li>
                    <li>• স্পষ্ট করে প্রশ্ন জিজ্ঞাসা করুন</li>
                    <li>• প্রয়োজনীয় তথ্য উল্লেখ করুন</li>
                  </ul>
                </div>
                
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    ⏰ উত্তরের সময়:
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    সাধারণত ২৪ ঘন্টার মধ্যে উত্তর পাবেন
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </MobileWrapper>
  );
}