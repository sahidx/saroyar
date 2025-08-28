import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Clock, 
  MessageSquare, 
  Calendar, 
  Download,
  FileText,
  Trophy,
  Target,
  Bell,
  LogOut,
  GraduationCap,
  Play,
  CheckCircle,
  AlertCircle,
  Users,
  BarChart3,
  Moon,
  Sun,
  Brain,
  Sparkles,
  Home,
  Bot,
  TrendingUp,
  Award,
  Star,
  Activity,
  PieChart
} from 'lucide-react';

// AI Doubt Solver Component
function AIDoubtSolver({ isDarkMode }: { isDarkMode: boolean }) {
  const [doubt, setDoubt] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [aiProvider, setAiProvider] = useState('claude');
  const [solution, setSolution] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const solveMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/ai/solve-doubt', data);
      return await response.json();
    },
    onSuccess: (data) => {
      setSolution(data.solution);
      setIsExpanded(true);
    },
    onError: (error) => {
      console.error('Error solving doubt:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubt.trim() || !subject || !difficulty) return;
    
    solveMutation.mutate({
      doubt: doubt.trim(),
      subject,
      difficulty,
      aiProvider
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className={`${isDarkMode 
        ? 'bg-slate-800/50 border-purple-400/30' 
        : 'bg-white border-purple-200 shadow-sm'
      }`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
            <Brain className="w-5 h-5" />
            Ask Your Doubt
          </CardTitle>
          <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Get instant help with Chemistry and ICT problems using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Subject</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className={isDarkMode 
                    ? 'bg-slate-900/50 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                  }>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="ict">ICT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className={isDarkMode 
                    ? 'bg-slate-900/50 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                  }>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>AI Provider</Label>
              <Select value={aiProvider} onValueChange={setAiProvider}>
                <SelectTrigger className={isDarkMode 
                  ? 'bg-slate-900/50 border-gray-600 text-white' 
                  : 'bg-white border-gray-300'
                }>
                  <SelectValue placeholder="Select AI" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claude">Claude (Anthropic)</SelectItem>
                  <SelectItem value="gemini">Gemini (Google)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Your Doubt/Question</Label>
              <Textarea
                value={doubt}
                onChange={(e) => setDoubt(e.target.value)}
                placeholder="Describe your question or the concept you're struggling with..."
                className={`min-h-[120px] ${isDarkMode 
                  ? 'bg-slate-900/50 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 placeholder-gray-500'
                }`}
                data-testid="input-doubt"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={solveMutation.isPending || !doubt.trim() || !subject || !difficulty}
              className={`w-full ${isDarkMode 
                ? 'bg-purple-600 hover:bg-purple-700' 
                : 'bg-purple-600 hover:bg-purple-700'
              }`}
              data-testid="button-solve-doubt"
            >
              {solveMutation.isPending ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  {aiProvider === 'gemini' ? 'Gemini' : 'Claude'} is thinking...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Solve with {aiProvider === 'gemini' ? 'Gemini' : 'Claude'}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className={`${isDarkMode 
        ? 'bg-slate-800/50 border-cyan-400/30' 
        : 'bg-white border-cyan-200 shadow-sm'
      }`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>
            <Sparkles className="w-5 h-5" />
            AI Solution
          </CardTitle>
          <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Detailed explanation and step-by-step solution
          </CardDescription>
        </CardHeader>
        <CardContent>
          {solution ? (
            <div className={`space-y-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              <div className="prose prose-sm max-w-none">
                <div 
                  className={`whitespace-pre-wrap ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
                  data-testid="text-solution"
                >
                  {solution}
                </div>
              </div>
              <div className="pt-4 border-t border-gray-600">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDoubt('');
                    setSolution('');
                    setSubject('');
                    setDifficulty('');
                    setAiProvider('claude');
                  }}
                  className={isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }
                  data-testid="button-ask-another"
                >
                  Ask Another Question
                </Button>
              </div>
            </div>
          ) : (
            <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Ask a question to get an AI-powered solution</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLogout = () => {
    // Clear any stored auth tokens
    localStorage.clear();
    sessionStorage.clear();
    // Redirect to landing page
    window.location.href = '/';
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`mobile-dashboard-wrapper emergency-mobile-content min-h-screen w-full max-w-full overflow-x-hidden ${isDarkMode 
      ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900' 
      : 'bg-gradient-to-br from-blue-50 via-white to-emerald-50'
    }`}>
      <style>{`
        @media (max-width: 639px) {
          .force-mobile-layout * {
            box-sizing: border-box !important;
          }
          .force-mobile-layout {
            padding: 8px !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .force-mobile-grid {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 16px !important;
            width: 100% !important;
          }
          .force-mobile-card {
            width: 100% !important;
            margin: 8px 0 !important;
            padding: 16px !important;
            box-sizing: border-box !important;
          }
          .force-mobile-heading {
            font-size: 18px !important;
            font-weight: 700 !important;
            line-height: 1.3 !important;
            margin-bottom: 12px !important;
          }
          .force-mobile-button {
            width: 100% !important;
            min-height: 48px !important;
            padding: 12px 16px !important;
            font-size: 16px !important;
            touch-action: manipulation !important;
          }
          .force-mobile-tabs {
            display: flex !important;
            overflow-x: auto !important;
            gap: 4px !important;
            padding: 8px 0 !important;
            scrollbar-width: none !important;
          }
          .force-mobile-tabs::-webkit-scrollbar {
            display: none !important;
          }
          .force-mobile-tab {
            min-width: 80px !important;
            height: 44px !important;
            padding: 8px 12px !important;
            font-size: 13px !important;
            white-space: nowrap !important;
            flex-shrink: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 2px !important;
          }
        }
        @media (min-width: 640px) {
          .force-mobile-layout { padding: 16px !important; }
          .force-mobile-grid { grid-template-columns: 1fr 1fr !important; gap: 20px !important; }
          .force-mobile-card { margin: 12px 0 !important; padding: 20px !important; }
          .force-mobile-heading { font-size: 22px !important; margin-bottom: 16px !important; }
          .force-mobile-button { width: auto !important; min-width: 120px !important; }
          .force-mobile-tab { min-width: 100px !important; height: 48px !important; font-size: 14px !important; }
        }
        @media (min-width: 1024px) {
          .force-mobile-layout { padding: 24px !important; }
          .force-mobile-grid { grid-template-columns: 1fr 1fr 1fr !important; gap: 24px !important; }
          .force-mobile-heading { font-size: 28px !important; margin-bottom: 20px !important; }
        }
      `}</style>
      {/* Mobile-Optimized Header */}
      <header className={`mobile-header border-b ${isDarkMode 
        ? 'bg-gray-900/95 border-emerald-400/30' 
        : 'bg-white/95 border-emerald-300/50 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className={`mobile-title font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Student Portal</h1>
              <p className={`mobile-subtitle ${isDarkMode ? 'text-emerald-300' : 'text-emerald-600'}`}>Chemistry & ICT Care</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              onClick={toggleTheme}
              variant="outline" 
              size="sm" 
              className={`px-3 rounded-xl ${isDarkMode 
                ? 'text-yellow-300 border-yellow-400/50 hover:bg-yellow-500/20' 
                : 'text-blue-600 border-blue-300 hover:bg-blue-50'
              }`}
              data-testid="theme-toggle"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button 
              onClick={handleLogout}
              variant="outline" 
              size="sm" 
              className={`px-3 rounded-xl ${isDarkMode 
                ? 'text-red-300 border-red-400/50 hover:bg-red-500/20' 
                : 'text-red-500 border-red-300 hover:bg-red-50'
              }`}
              data-testid="logout-button"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile-Optimized Main Content */}
      <main className="force-mobile-layout px-3 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className={`force-mobile-tabs responsive-tabs border rounded-2xl overflow-x-auto scrollbar-hide ${isDarkMode 
            ? 'bg-gray-800/80 border-emerald-400/40' 
            : 'bg-white/90 border-emerald-200 shadow-sm'
          }`}>
            <TabsTrigger value="overview" className={`force-mobile-tab responsive-tab ${isDarkMode 
              ? 'data-[state=active]:bg-emerald-500/30 data-[state=active]:text-white hover:bg-emerald-500/10' 
              : 'data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800 hover:bg-emerald-50 text-gray-700'
            }`} data-testid="student-tab-overview">
              <Home className="responsive-tab-icon" />
              <span className="responsive-tab-text">Home</span>
            </TabsTrigger>
            
            <TabsTrigger value="ai-doubts" className={`force-mobile-tab responsive-tab ${isDarkMode 
              ? 'data-[state=active]:bg-emerald-500/30 data-[state=active]:text-white hover:bg-emerald-500/10' 
              : 'data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800 hover:bg-emerald-50 text-gray-700'
            }`} data-testid="student-tab-ai-doubts">
              <Brain className="responsive-tab-icon" />
              <span className="responsive-tab-text">AI Help</span>
            </TabsTrigger>
            
            <TabsTrigger value="exams" className={`force-mobile-tab responsive-tab ${isDarkMode 
              ? 'data-[state=active]:bg-emerald-500/30 data-[state=active]:text-white hover:bg-emerald-500/10' 
              : 'data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800 hover:bg-emerald-50 text-gray-700'
            }`} data-testid="student-tab-exams">
              <FileText className="responsive-tab-icon" />
              <span className="responsive-tab-text">Exams</span>
            </TabsTrigger>
            
            <TabsTrigger value="quest" className={`force-mobile-tab responsive-tab ${isDarkMode 
              ? 'data-[state=active]:bg-emerald-500/30 data-[state=active]:text-white hover:bg-emerald-500/10' 
              : 'data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800 hover:bg-emerald-50 text-gray-700'
            }`} data-testid="student-tab-quest">
              <Target className="responsive-tab-icon" />
              <span className="responsive-tab-text">Quest</span>
            </TabsTrigger>
            
            <TabsTrigger value="progress" className={`force-mobile-tab responsive-tab ${isDarkMode 
              ? 'data-[state=active]:bg-emerald-500/30 data-[state=active]:text-white hover:bg-emerald-500/10' 
              : 'data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800 hover:bg-emerald-50 text-gray-700'
            }`} data-testid="student-tab-progress">
              <TrendingUp className="responsive-tab-icon" />
              <span className="responsive-tab-text">Reports</span>
            </TabsTrigger>
            
            <TabsTrigger value="messages" className={`force-mobile-tab responsive-tab ${isDarkMode 
              ? 'data-[state=active]:bg-emerald-500/30 data-[state=active]:text-white hover:bg-emerald-500/10' 
              : 'data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800 hover:bg-emerald-50 text-gray-700'
            }`} data-testid="student-tab-messages">
              <MessageSquare className="responsive-tab-icon" />
              <span className="responsive-tab-text">Messages</span>
            </TabsTrigger>
            
            <TabsTrigger value="resources" className={`force-mobile-tab responsive-tab ${isDarkMode 
              ? 'data-[state=active]:bg-emerald-500/30 data-[state=active]:text-white hover:bg-emerald-500/10' 
              : 'data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800 hover:bg-emerald-50 text-gray-700'
            }`} data-testid="student-tab-resources">
              <BookOpen className="responsive-tab-icon" />
              <span className="responsive-tab-text">Study</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - Matching Teacher Dashboard Style */}
          <TabsContent value="overview" className="space-y-6 px-1">
            {/* Main Dashboard Cards - 2x2 Grid */}
            <div className="force-mobile-grid grid grid-cols-2 gap-4">
              {/* My Progress Card */}
              <Card className={`force-mobile-card ${isDarkMode 
                ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/30' 
                : 'bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 shadow-md'
              } hover:scale-105 transition-transform duration-200`}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-blue-800'}`}>87.5%</div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>My Progress</p>
                </CardContent>
              </Card>

              {/* Active Exams Card */}
              <Card className={`force-mobile-card ${isDarkMode 
                ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30' 
                : 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 shadow-md'
              } hover:scale-105 transition-transform duration-200`}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-green-800'}`}>3</div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>Active Exams</p>
                </CardContent>
              </Card>

              {/* Study Resources Card */}
              <Card className={`force-mobile-card ${isDarkMode 
                ? 'bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-400/30' 
                : 'bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 shadow-md'
              } hover:scale-105 transition-transform duration-200`}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-purple-800'}`}>127</div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>Study Resources</p>
                </CardContent>
              </Card>

              {/* New Messages Card */}
              <Card className={`force-mobile-card ${isDarkMode 
                ? 'bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-400/30' 
                : 'bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 shadow-md'
              } hover:scale-105 transition-transform duration-200`}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-orange-800'}`}>5</div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>Messages</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities Section */}
            <Card className={`force-mobile-card ${isDarkMode ? 'bg-slate-800/80 border-slate-600' : 'bg-white border-gray-200 shadow-md'}`}>
              <CardHeader>
                <CardTitle className={`${isDarkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Chemistry exam completed</div>
                    <div className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>2 hours ago</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>New study material available</div>
                    <div className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>5 hours ago</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Assignment submission reminder</div>
                    <div className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>1 day ago</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Section */}
            <Card className={`force-mobile-card ${isDarkMode ? 'bg-slate-800/80 border-slate-600' : 'bg-white border-gray-200 shadow-md'}`}>
              <CardHeader>
                <CardTitle className={`${isDarkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white justify-start" data-testid="take-exam-button">
                  <Play className="w-4 h-4 mr-2" />
                  Take Available Exam
                </Button>
                
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white justify-start" data-testid="view-resources-button">
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Study Resources
                </Button>
                
                <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white justify-start" data-testid="ask-ai-button">
                  <Brain className="w-4 h-4 mr-2" />
                  Ask AI for Help
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Doubts Tab - Enhanced */}
          <TabsContent value="ai-doubts" className="space-y-6 px-1">
            <AIDoubtSolver isDarkMode={isDarkMode} />
          </TabsContent>

          {/* Exams Tab */}
          <TabsContent value="exams" className="space-y-6 px-1">
            <div className="grid gap-6">
              {/* Available Exams */}
              <Card className={`force-mobile-card ${isDarkMode 
                ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/30' 
                : 'bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 shadow-md'
              }`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                    <FileText className="w-5 h-5" />
                    Available Exams
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-slate-900/50 border-slate-600' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Chemistry Mid-term Exam</h4>
                      <Badge className="bg-green-500 text-white">Available</Badge>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Duration: 2 hours • Questions: 50 MCQ + 5 Written</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Deadline: Jan 30, 2024</span>
                      <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">Start Exam</Button>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-slate-900/50 border-slate-600' : 'bg-green-50 border-green-200'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>ICT Programming Test</h4>
                      <Badge className="bg-yellow-500 text-white">Upcoming</Badge>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Duration: 90 minutes • Questions: 30 MCQ + 3 Coding</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Starts: Feb 5, 2024</span>
                      <Button size="sm" disabled>Not Yet Available</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Results */}
              <Card className={`force-mobile-card ${isDarkMode 
                ? 'bg-slate-800/50 border-green-400/30' 
                : 'bg-white border-green-200 shadow-md'
              }`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                    <Trophy className="w-5 h-5" />
                    Recent Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className={`flex justify-between items-center p-3 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-green-50'}`}>
                    <div>
                      <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Organic Chemistry Quiz</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Jan 20, 2024</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>92%</div>
                      <div className={`text-xs ${isDarkMode ? 'text-green-300' : 'text-green-500'}`}>A Grade</div>
                    </div>
                  </div>
                  
                  <div className={`flex justify-between items-center p-3 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-blue-50'}`}>
                    <div>
                      <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Database Design Test</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Jan 15, 2024</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>88%</div>
                      <div className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-500'}`}>A- Grade</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Bell className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-orange-800'}`}>2</div>
                      <p className={`text-xs font-medium ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>New Notices</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mobile-adaptive-grid">
              <Card className={`mobile-full-card ${isDarkMode 
                ? 'bg-slate-800/50 border border-cyan-400/30' 
                : 'bg-white/90 border border-cyan-200 shadow-md'
              }`}>
                <CardHeader className="mobile-card-header">
                  <CardTitle className={`mobile-adaptive-heading ${isDarkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>Recent Exam Results</CardTitle>
                </CardHeader>
                <CardContent className="mobile-card-content space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                    <div>
                      <div className="font-medium text-white">Chemistry Periodic Table</div>
                      <div className="text-sm text-cyan-300">MCQ • 25 questions</div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold">92%</div>
                      <div className="text-xs text-gray-400">2 days ago</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                    <div>
                      <div className="font-medium text-white">ICT Programming Basics</div>
                      <div className="text-sm text-cyan-300">MCQ • 30 questions</div>
                    </div>
                    <div className="text-right">
                      <div className="text-blue-400 font-bold">85%</div>
                      <div className="text-xs text-gray-400">1 week ago</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                    <div>
                      <div className="font-medium text-white">Organic Chemistry Essay</div>
                      <div className="text-sm text-cyan-300">Written • 5 questions</div>
                    </div>
                    <div className="text-right">
                      <div className="text-purple-400 font-bold">89%</div>
                      <div className="text-xs text-gray-400">2 weeks ago</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mobile-progress-card bg-slate-800/50 border border-cyan-400/30">
                <CardHeader className="mobile-card-header">
                  <CardTitle className="mobile-adaptive-heading text-cyan-300">Subject Progress</CardTitle>
                </CardHeader>
                <CardContent className="mobile-card-content space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">Chemistry</span>
                      <span className="text-green-400 font-bold">89%</span>
                    </div>
                    <Progress value={89} className="h-2" />
                    <p className="text-xs text-green-300 mt-1">Excellent progress</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">ICT</span>
                      <span className="text-blue-400 font-bold">86%</span>
                    </div>
                    <Progress value={86} className="h-2" />
                    <p className="text-xs text-blue-300 mt-1">Good progress</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">Overall Performance</span>
                      <span className="text-cyan-400 font-bold">87.5%</span>
                    </div>
                    <Progress value={87.5} className="h-2" />
                    <p className="text-xs text-cyan-300 mt-1">Above average student</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Doubt Solver Tab */}
          <TabsContent value="ai-doubts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                AI Doubt Solver
              </h2>
              <Badge className={`${isDarkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                <Brain className="w-4 h-4 mr-1" />
                Powered by AI
              </Badge>
            </div>
            
            <AIDoubtSolver isDarkMode={isDarkMode} />
          </TabsContent>

          {/* Exams Tab */}
          <TabsContent value="exams" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Online Exams</h2>
              <Badge className="bg-cyan-500/20 text-cyan-300">3 Pending</Badge>
            </div>

            <div className="mobile-adaptive-grid gap-6">
              {/* MCQ Exams */}
              <Card className="mobile-exam-card bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30">
                <CardHeader className="mobile-card-header">
                  <CardTitle className="mobile-adaptive-heading text-green-300 flex items-center justify-between">
                    <span>MCQ Exams</span>
                    <Badge className="bg-green-500/20 text-green-300">Available</Badge>
                  </CardTitle>
                  <CardDescription className="mobile-adaptive-text text-green-200">
                    Multiple choice questions with instant results
                  </CardDescription>
                </CardHeader>
                <CardContent className="mobile-card-content space-y-4">
                  <div className="p-4 bg-slate-900/50 rounded-lg border border-green-400/20">
                    <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-start sm:space-y-0 mb-3">
                      <div>
                        <div className="mobile-adaptive-text font-medium text-white">Chemistry Bonding</div>
                        <div className="text-sm text-green-300">20 questions • 25 min</div>
                      </div>
                      <Button className="mobile-button-large bg-green-500/20 hover:bg-green-500/30 text-green-300 w-full sm:w-auto">
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                    </div>
                    <div className="text-xs text-gray-400">Due: Tomorrow 11:59 PM</div>
                  </div>
                  
                  <div className="p-4 bg-slate-900/50 rounded-lg border border-green-400/20">
                    <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-start sm:space-y-0 mb-3">
                      <div>
                        <div className="mobile-adaptive-text font-medium text-white">ICT Database Design</div>
                        <div className="text-sm text-green-300">25 questions • 30 min</div>
                      </div>
                      <Button className="mobile-button-large bg-green-500/20 hover:bg-green-500/30 text-green-300 w-full sm:w-auto">
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                    </div>
                    <div className="text-xs text-gray-400">Due: Friday 11:59 PM</div>
                  </div>
                </CardContent>
              </Card>

              {/* Written Exams */}
              <Card className="mobile-exam-card bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/30">
                <CardHeader className="mobile-card-header">
                  <CardTitle className="mobile-adaptive-heading text-blue-300 flex items-center justify-between">
                    <span>Written Exams</span>
                    <Badge className="bg-blue-500/20 text-blue-300">1 Available</Badge>
                  </CardTitle>
                  <CardDescription className="mobile-adaptive-text text-blue-200">
                    Descriptive answers and detailed explanations
                  </CardDescription>
                </CardHeader>
                <CardContent className="mobile-card-content space-y-4">
                  <div className="p-4 bg-slate-900/50 rounded-lg border border-blue-400/20">
                    <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-start sm:space-y-0 mb-3">
                      <div>
                        <div className="mobile-adaptive-text font-medium text-white">Organic Chemistry Analysis</div>
                        <div className="text-sm text-blue-300">4 questions • 2 hours</div>
                      </div>
                      <Button className="mobile-button-large bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 w-full sm:w-auto">
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                    </div>
                    <div className="text-xs text-gray-400">Due: Sunday 11:59 PM</div>
                  </div>
                  
                  <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-600 opacity-60">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-gray-400">ICT Project Report</div>
                        <div className="text-sm text-gray-500">3 questions • 90 min</div>
                      </div>
                      <Badge className="bg-gray-500/20 text-gray-400">Completed</Badge>
                    </div>
                    <div className="text-xs text-gray-500">Score: 89%</div>
                  </div>
                </CardContent>
              </Card>

              {/* Timed Exams */}
              <Card className="mobile-exam-card bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-400/30">
                <CardHeader className="mobile-card-header">
                  <CardTitle className="mobile-adaptive-heading text-purple-300 flex items-center justify-between">
                    <span>Timed Exams</span>
                    <Badge className="bg-purple-500/20 text-purple-300">Scheduled</Badge>
                  </CardTitle>
                  <CardDescription className="mobile-adaptive-text text-purple-200">
                    Live exams with specific start times
                  </CardDescription>
                </CardHeader>
                <CardContent className="mobile-card-content space-y-4">
                  <div className="p-3 bg-slate-900/50 rounded-lg border border-purple-400/20">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium text-white">Mid-term Chemistry</div>
                        <div className="text-sm text-purple-300">Mixed • 2 hours</div>
                      </div>
                      <div className="text-right">
                        <Clock className="w-4 h-4 text-purple-400 mx-auto" />
                        <div className="text-xs text-purple-300">Tomorrow</div>
                      </div>
                    </div>
                    <div className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
                      Starts: 10:00 AM sharp
                    </div>
                  </div>
                  
                  <div className="p-3 bg-slate-900/50 rounded-lg border border-purple-400/20">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium text-white">ICT Final Assessment</div>
                        <div className="text-sm text-purple-300">Mixed • 3 hours</div>
                      </div>
                      <div className="text-right">
                        <Clock className="w-4 h-4 text-purple-400 mx-auto" />
                        <div className="text-xs text-purple-300">Friday</div>
                      </div>
                    </div>
                    <div className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
                      Starts: 2:00 PM sharp
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6 px-1">
            <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
              <h2 className="mobile-adaptive-heading text-white">Attendance Record</h2>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">95%</div>
                  <div className="text-sm text-green-300">Overall</div>
                </div>
              </div>
            </div>

            <div className="mobile-adaptive-grid gap-6">
              <Card className="mobile-full-card bg-slate-800/50 border border-cyan-400/30">
                <CardHeader className="mobile-card-header">
                  <CardTitle className="mobile-adaptive-heading text-cyan-300">Monthly Attendance</CardTitle>
                  <CardDescription className="mobile-adaptive-text text-blue-200">January 2024</CardDescription>
                </CardHeader>
                <CardContent className="mobile-card-content">
                  <div className="grid grid-cols-7 gap-2 text-center text-sm">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                      <div key={day} className="text-cyan-300 font-semibold p-2">{day}</div>
                    ))}
                    
                    {/* Calendar grid */}
                    {Array.from({length: 31}, (_, i) => i + 1).map(date => (
                      <div key={date} className={`p-2 rounded text-xs ${
                        date % 7 === 0 ? 'bg-red-500/20 text-red-300' : // Sunday
                        date % 3 === 0 ? 'bg-yellow-500/20 text-yellow-300' : // Partial attendance
                        'bg-green-500/20 text-green-300' // Full attendance
                      }`}>
                        {date}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex justify-center space-x-4 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500/20 rounded"></div>
                      <span className="text-green-300">Present</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500/20 rounded"></div>
                      <span className="text-yellow-300">Late</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500/20 rounded"></div>
                      <span className="text-red-300">Absent</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mobile-full-card bg-slate-800/50 border border-cyan-400/30">
                <CardHeader className="mobile-card-header">
                  <CardTitle className="mobile-adaptive-heading text-cyan-300">Subject-wise Attendance</CardTitle>
                </CardHeader>
                <CardContent className="mobile-card-content space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">Chemistry Classes</span>
                      <span className="text-green-400 font-bold">96%</span>
                    </div>
                    <Progress value={96} className="h-2" />
                    <p className="text-xs text-green-300 mt-1">24/25 classes attended</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">ICT Classes</span>
                      <span className="text-blue-400 font-bold">94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                    <p className="text-xs text-blue-300 mt-1">17/18 classes attended</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">Lab Sessions</span>
                      <span className="text-purple-400 font-bold">93%</span>
                    </div>
                    <Progress value={93} className="h-2" />
                    <p className="text-xs text-purple-300 mt-1">14/15 sessions attended</p>
                  </div>

                  <div className="bg-slate-900/50 p-3 rounded-lg mt-4">
                    <h4 className="text-yellow-300 font-semibold mb-2">Recent Attendance</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white">Today - Chemistry</span>
                        <span className="text-green-400">Present</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white">Yesterday - ICT</span>
                        <span className="text-green-400">Present</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white">Monday - Chemistry Lab</span>
                        <span className="text-yellow-400">Late (5 min)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6 px-1">
            <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
              <h2 className="mobile-adaptive-heading text-white">Messages from Sir</h2>
              <Button className="mobile-button-large bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 w-full sm:w-auto">
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>

            <div className="mobile-adaptive-grid gap-6">
              <div className="order-2 sm:order-1">
                <Card className="mobile-full-card bg-slate-800/50 border border-cyan-400/30">
                  <CardHeader className="mobile-card-header">
                    <CardTitle className="mobile-adaptive-heading text-cyan-300">Message Threads</CardTitle>
                  </CardHeader>
                  <CardContent className="mobile-card-content space-y-4">
                    <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-400/30 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-white">Belal Sir</div>
                        <Badge className="bg-red-500/20 text-red-300">5 new</Badge>
                      </div>
                      <div className="text-sm text-cyan-300 mt-1">About Chemistry Assignment</div>
                      <div className="text-xs text-gray-400">2 hours ago</div>
                    </div>
                    
                    <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-600 cursor-pointer">
                      <div className="font-medium text-white">Class Announcements</div>
                      <div className="text-sm text-blue-300 mt-1">Exam schedule update</div>
                      <div className="text-xs text-gray-400">1 day ago</div>
                    </div>
                    
                    <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-600 cursor-pointer">
                      <div className="font-medium text-white">ICT Project Help</div>
                      <div className="text-sm text-purple-300 mt-1">Database design guidance</div>
                      <div className="text-xs text-gray-400">3 days ago</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="order-1 sm:order-2">
                <Card className="mobile-full-card bg-slate-800/50 border border-cyan-400/30 min-h-[400px] sm:min-h-[500px]">
                  <CardHeader className="mobile-card-header">
                    <CardTitle className="mobile-adaptive-heading text-cyan-300 flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Chat with Belal Sir
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="mobile-card-content flex flex-col h-full">
                    <div className="flex-1 space-y-4 overflow-y-auto">
                      <div className="flex justify-start">
                        <div className="bg-blue-500/20 p-3 rounded-lg max-w-md">
                          <div className="text-blue-300 text-sm font-medium">Belal Sir</div>
                          <div className="text-white">Good work on the recent chemistry exam! Your understanding of organic compounds has improved significantly.</div>
                          <div className="text-xs text-gray-400 mt-1">2 hours ago</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <div className="bg-cyan-500/20 p-3 rounded-lg max-w-md">
                          <div className="text-white">Thank you sir! I've been practicing the reaction mechanisms daily.</div>
                          <div className="text-xs text-gray-400 mt-1">2 hours ago</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-start">
                        <div className="bg-blue-500/20 p-3 rounded-lg max-w-md">
                          <div className="text-blue-300 text-sm font-medium">Belal Sir</div>
                          <div className="text-white">For the upcoming assignment on polymer chemistry, make sure to focus on the polymerization mechanisms.</div>
                          <div className="text-xs text-gray-400 mt-1">1 hour ago</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-start">
                        <div className="bg-blue-500/20 p-3 rounded-lg max-w-md">
                          <div className="text-blue-300 text-sm font-medium">Belal Sir</div>
                          <div className="text-white">I've uploaded additional reference materials to the question bank. Check them out!</div>
                          <div className="text-xs text-gray-400 mt-1">30 min ago</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <input 
                        type="text" 
                        placeholder="Type your message..." 
                        className="flex-1 bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                      />
                      <Button className="mobile-button-large bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50">
                        Send
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Notices Tab */}
          <TabsContent value="notices" className="space-y-6 px-1">
            <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
              <h2 className="mobile-adaptive-heading text-white">Notices & Announcements</h2>
              <Badge className="bg-red-500/20 text-red-300 self-start sm:self-center">3 New</Badge>
            </div>

            <div className="space-y-6">
              <Card className="mobile-full-card bg-slate-800/50 border border-red-400/30">
                <CardHeader className="mobile-card-header">
                  <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <CardTitle className="mobile-adaptive-heading text-red-300 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      Important: Exam Schedule Change
                    </CardTitle>
                    <Badge className="bg-red-500/20 text-red-300 self-start">New</Badge>
                  </div>
                </CardHeader>
                <CardContent className="mobile-card-content">
                  <p className="text-white mb-2">
                    Due to the national holiday, tomorrow's Chemistry mid-term exam has been rescheduled to Friday, 10:00 AM.
                  </p>
                  <p className="text-blue-200 text-sm">
                    Please make sure to review the organic chemistry chapters and practice reaction mechanisms.
                  </p>
                  <div className="text-xs text-gray-400 mt-3">Posted 2 hours ago by Belal Sir</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border border-blue-400/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-blue-300 flex items-center">
                      <Bell className="w-5 h-5 mr-2" />
                      New Question Bank Upload
                    </CardTitle>
                    <Badge className="bg-blue-500/20 text-blue-300">New</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-white mb-2">
                    ICT Programming Practice Questions (Set 5) has been uploaded to the resources section.
                  </p>
                  <p className="text-blue-200 text-sm">
                    This set focuses on database design and SQL queries. Highly recommended for exam preparation.
                  </p>
                  <div className="text-xs text-gray-400 mt-3">Posted 5 hours ago by Belal Sir</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border border-green-400/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-green-300 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Class Performance Update
                    </CardTitle>
                    <Badge className="bg-green-500/20 text-green-300">New</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-white mb-2">
                    Congratulations! Our batch achieved 95% average in the recent Chemistry assessment.
                  </p>
                  <p className="text-green-200 text-sm">
                    Keep up the excellent work. Special recognition to top performers: Fatima Khan, Rahman Ahmed, and Ayesha Rahman.
                  </p>
                  <div className="text-xs text-gray-400 mt-3">Posted 1 day ago by Belal Sir</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border border-purple-400/30">
                <CardHeader>
                  <CardTitle className="text-purple-300 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Lab Session Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white mb-2">
                    Next week's chemistry lab sessions will focus on titration experiments and pH measurement.
                  </p>
                  <p className="text-purple-200 text-sm">
                    Please bring your lab notebooks and ensure you have reviewed the safety protocols.
                  </p>
                  <div className="text-xs text-gray-400 mt-3">Posted 2 days ago by Belal Sir</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6 px-1">
            <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
              <h2 className="mobile-adaptive-heading text-white">Question Banks & Resources</h2>
              <Button className="mobile-button-large bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Download All
              </Button>
            </div>

            <div className="mobile-adaptive-grid gap-6">
              <Card className="mobile-full-card bg-slate-800/50 border border-cyan-400/30">
                <CardHeader>
                  <CardTitle className="text-cyan-300">Chemistry Resources</CardTitle>
                  <CardDescription className="text-blue-200">
                    Question banks, reference materials and practice tests
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-600">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-green-400" />
                      <div>
                        <div className="font-medium text-white">Organic Chemistry MCQs</div>
                        <div className="text-sm text-green-300">250 questions • Updated today</div>
                      </div>
                    </div>
                    <Button size="sm" className="bg-green-500/20 hover:bg-green-500/30 text-green-300">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-600">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="font-medium text-white">Periodic Table Reference</div>
                        <div className="text-sm text-blue-300">Complete guide • PDF</div>
                      </div>
                    </div>
                    <Button size="sm" className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-600">
                    <div className="flex items-center space-x-3">
                      <Target className="w-5 h-5 text-purple-400" />
                      <div>
                        <div className="font-medium text-white">Chemical Reactions Practice</div>
                        <div className="text-sm text-purple-300">150 problems • With solutions</div>
                      </div>
                    </div>
                    <Button size="sm" className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-600">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-yellow-400" />
                      <div>
                        <div className="font-medium text-white">Previous Year Papers</div>
                        <div className="text-sm text-yellow-300">2020-2023 • All boards</div>
                      </div>
                    </div>
                    <Button size="sm" className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border border-cyan-400/30">
                <CardHeader>
                  <CardTitle className="text-cyan-300">ICT Resources</CardTitle>
                  <CardDescription className="text-blue-200">
                    Programming guides, database materials and project examples
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-600">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-green-400" />
                      <div>
                        <div className="font-medium text-white">Programming MCQs</div>
                        <div className="text-sm text-green-300">180 questions • C++ & Python</div>
                      </div>
                    </div>
                    <Button size="sm" className="bg-green-500/20 hover:bg-green-500/30 text-green-300">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-600">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="font-medium text-white">Database Design Guide</div>
                        <div className="text-sm text-blue-300">SQL & ER diagrams • Updated</div>
                      </div>
                    </div>
                    <Button size="sm" className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-600">
                    <div className="flex items-center space-x-3">
                      <Target className="w-5 h-5 text-purple-400" />
                      <div>
                        <div className="font-medium text-white">Web Development Projects</div>
                        <div className="text-sm text-purple-300">5 complete projects • HTML/CSS/JS</div>
                      </div>
                    </div>
                    <Button size="sm" className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-600">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-yellow-400" />
                      <div>
                        <div className="font-medium text-white">Board Exam Papers</div>
                        <div className="text-sm text-yellow-300">ICT 2020-2023 • All boards</div>
                      </div>
                    </div>
                    <Button size="sm" className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Quest Tab - Student Achievement System */}
          <TabsContent value="quest" className="space-y-6 px-1">
            <div className="grid gap-6">
              {/* Current Quest Status */}
              <Card className={`force-mobile-card ${isDarkMode 
                ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-400/30' 
                : 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 shadow-md'
              }`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                    <Target className="w-5 h-5" />
                    Current Quest: Chemistry Master
                  </CardTitle>
                  <CardDescription className={isDarkMode ? 'text-amber-200' : 'text-amber-700'}>
                    Complete all chemistry modules to unlock special rewards
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>Progress</span>
                    <span className={`font-bold ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>7/10 modules</span>
                  </div>
                  <Progress value={70} className="h-2" />
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'}`}>
                      <div className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>850</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>XP Earned</div>
                    </div>
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'}`}>
                      <div className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>15</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Streak Days</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card className={`force-mobile-card ${isDarkMode 
                ? 'bg-slate-800/50 border-purple-400/30' 
                : 'bg-white border-purple-200 shadow-md'
              }`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-purple-300' : 'text-purple-800'}`}>
                    <Award className="w-5 h-5" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-purple-50'}`}>
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Perfect Score Master</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Scored 100% in 5 consecutive exams</div>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-purple-50'}`}>
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Attendance Champion</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Perfect attendance for 30 days</div>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-purple-50'}`}>
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>AI Study Buddy</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Asked 50 questions to AI solver</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Progress/Reports Tab */}
          <TabsContent value="progress" className="space-y-6 px-1">
            <div className="grid gap-6">
              {/* Overall Performance */}
              <Card className={`force-mobile-card ${isDarkMode 
                ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/30' 
                : 'bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 shadow-md'
              }`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                    <BarChart3 className="w-5 h-5" />
                    Overall Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className={`text-3xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>87.5%</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Average Score</div>
                    </div>
                    <div>
                      <div className={`text-3xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>95%</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Attendance</div>
                    </div>
                    <div>
                      <div className={`text-3xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>12</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Rank</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subject Performance */}
              <Card className={`force-mobile-card ${isDarkMode 
                ? 'bg-slate-800/50 border-emerald-400/30' 
                : 'bg-white border-emerald-200 shadow-md'
              }`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>
                    <Activity className="w-5 h-5" />
                    Subject Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>Chemistry</span>
                        <span className={`font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>ICT</span>
                        <span className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>83%</span>
                      </div>
                      <Progress value={83} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>Combined Studies</span>
                        <span className={`font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>88%</span>
                      </div>
                      <Progress value={88} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Progress Chart */}
              <Card className={`force-mobile-card ${isDarkMode 
                ? 'bg-slate-800/50 border-cyan-400/30' 
                : 'bg-white border-cyan-200 shadow-md'
              }`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-cyan-300' : 'text-cyan-800'}`}>
                    <TrendingUp className="w-5 h-5" />
                    Monthly Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-center p-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <PieChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Detailed progress charts will be available here</p>
                    <p className="text-sm mt-2">Track your improvement over time</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}