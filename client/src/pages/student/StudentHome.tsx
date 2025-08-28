import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  LogOut, 
  GraduationCap, 
  Moon, 
  Sun,
  ArrowLeft
} from 'lucide-react';
import { MobileWrapper } from '@/components/MobileWrapper';
import { ResponsiveIconGrid, getStudentIcons } from '@/components/ResponsiveIconGrid';
import { useDeviceRatio } from '@/hooks/useDeviceRatio';
import { useLocation } from 'wouter';

export default function StudentHome() {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const deviceRatio = useDeviceRatio();
  const [, setLocation] = useLocation();

  const { logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
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
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isDarkMode 
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-400' 
                  : 'bg-gradient-to-r from-orange-500 to-red-400'
                } shadow-lg`}>
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {user?.firstName || 'Student'} ছাত্র/ছাত্রী
                  </h1>
                  <p className={`text-sm ${isDarkMode ? 'text-emerald-400' : 'text-orange-600'}`}>
                    Chemistry & ICT Care
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
                  data-testid="theme-toggle"
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
                  data-testid="logout-button"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="force-mobile-layout px-3 py-4">
          {/* All Features Grid - Full Page Display */}
          <div className={`mb-6 p-4 rounded-2xl ${isDarkMode 
            ? 'bg-slate-800/50 border border-emerald-400/30' 
            : 'bg-white border border-emerald-200 shadow-lg'
          }`}>
            <div className="mb-3">
              <h2 className={`text-lg font-bold text-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                সকল ফিচার
              </h2>
              <p className={`text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                যেকোনো ফিচারে ক্লিক করুন
              </p>
            </div>
            <ResponsiveIconGrid 
              items={getStudentIcons(setLocation)}
              isDarkMode={isDarkMode}
              activeTab="overview"
            />
          </div>

          {/* Welcome Content */}
          <div className="space-y-6 px-1">
            <Card className={`force-mobile-card ${isDarkMode 
              ? 'bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-400/30' 
              : 'bg-gradient-to-br from-emerald-50 to-cyan-50 border border-emerald-200 shadow-lg'
            }`}>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h2 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  স্বাগতম, {user?.firstName || 'ছাত্র/ছাত্রী'}!
                </h2>
                <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                  Chemistry & ICT Care এ আপনাকে স্বাগতম
                </p>
                <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
                  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/80'}`}>
                    <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                      📚 আজকের লক্ষ্য
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      উপরের আইকনগুলো ব্যবহার করে পড়াশোনা শুরু করুন
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </MobileWrapper>
  );
}