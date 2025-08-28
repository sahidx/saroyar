import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Calendar,
  Target,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import { MobileWrapper } from '@/components/MobileWrapper';
import { useLocation } from 'wouter';

export default function StudentReports() {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    window.location.href = '/api/logout';
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
                    রিপোর্ট ও অগ্রগতি
                  </h1>
                  <p className={`text-sm ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    আপনার পারফরম্যান্স দেখুন
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
        <main className="force-mobile-layout px-3 py-4">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Overall Performance */}
            <Card className={`force-mobile-card ${isDarkMode 
              ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-400/30' 
              : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 shadow-lg'
            }`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                  <TrendingUp className="w-5 h-5" />
                  সামগ্রিক পারফরম্যান্স
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className={`p-4 rounded-xl text-center ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/80'}`}>
                    <div className={`text-3xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      0%
                    </div>
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      গড় স্কোর
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl text-center ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/80'}`}>
                    <div className={`text-3xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      0
                    </div>
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      সম্পন্ন পরীক্ষা
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Chemistry</span>
                    <span className={`font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>0%</span>
                  </div>
                  <Progress value={0} className="h-3" />
                  
                  <div className="flex justify-between items-center">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>ICT</span>
                    <span className={`font-bold ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>0%</span>
                  </div>
                  <Progress value={0} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Monthly Progress */}
            <Card className={`force-mobile-card ${isDarkMode 
              ? 'bg-gradient-to-br from-green-500/10 to-teal-500/10 border border-green-400/30' 
              : 'bg-gradient-to-br from-green-50 to-teal-50 border border-green-200 shadow-md'
            }`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                  <Calendar className="w-5 h-5" />
                  মাসিক অগ্রগতি
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">মাসিক রিপোর্ট এখানে দেখানো হবে</p>
                  <p className="text-xs mt-1">পরীক্ষা দিলে চার্ট ও গ্রাফ দেখতে পাবেন</p>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Report */}
            <Card className={`force-mobile-card ${isDarkMode ? 'bg-slate-800/80 border-slate-600' : 'bg-white border-gray-200 shadow-md'}`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-700'}`}>
                  <Target className="w-5 h-5" />
                  উপস্থিতি রিপোর্ট
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className={`p-3 rounded-lg text-center ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                    <div className={`text-xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      100%
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      উপস্থিতি
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg text-center ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                    <div className={`text-xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      1
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      মোট দিন
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg text-center ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                    <div className={`text-xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                      0
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      অনুপস্থিত
                    </div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </MobileWrapper>
  );
}