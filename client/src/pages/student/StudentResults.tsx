import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  Clock,
  User,
  Star,
  Award,
  CheckCircle2,
  Moon,
  Sun,
  Home
} from 'lucide-react';
import { MobileWrapper } from '@/components/MobileWrapper';
import { useLocation, useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';

interface StudentResultProps {
  id: string;
  studentName: string;
  marks: number;
  percentage: number;
  grade: string;
  rank: number;
  feedback?: string;
}

export default function StudentResults() {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [, setLocation] = useLocation();
  const { examId } = useParams<{ examId: string }>();

  // Fetch exam details and results
  const { data: examData, isLoading: examLoading } = useQuery({
    queryKey: [`/api/exams/${examId}`],
    enabled: !!examId,
  });

  const { data: resultsData, isLoading: resultsLoading } = useQuery({
    queryKey: [`/api/exams/${examId}/results`],
    enabled: !!examId,
  });

  const exam = examData;
  const results = resultsData || [];
  const currentUserResult = results.find ? results.find((r: any) => r.studentId === user?.id) : null;

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-green-500 text-white';
      case 'A': return 'bg-blue-500 text-white';
      case 'A-': return 'bg-cyan-500 text-white';
      case 'B': return 'bg-yellow-500 text-white';
      case 'C': return 'bg-orange-500 text-white';
      case 'D': return 'bg-red-400 text-white';
      default: return 'bg-red-500 text-white';
    }
  };

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90) return '🎉 অসাধারণ! চমৎকার ফলাফল!';
    if (percentage >= 80) return '👏 খুবই ভালো! অভিনন্দন!';
    if (percentage >= 70) return '👍 ভালো ফলাফল! আরো চেষ্টা করুন।';
    if (percentage >= 60) return '📚 পাস! আরো অধ্যয়ন প্রয়োজন।';
    return '💪 আরো চেষ্টা করুন। পরবর্তীতে ভালো করবেন।';
  };

  if (examLoading || resultsLoading) {
    return (
      <MobileWrapper>
        <div className={`min-h-screen flex items-center justify-center ${isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' 
          : 'bg-gradient-to-br from-white via-gray-50 to-cyan-50'
        }`}>
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              ফলাফল লোড হচ্ছে...
            </p>
          </div>
        </div>
      </MobileWrapper>
    );
  }

  if (!exam || !currentUserResult) {
    return (
      <MobileWrapper>
        <div className={`min-h-screen flex items-center justify-center ${isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' 
          : 'bg-gradient-to-br from-white via-gray-50 to-cyan-50'
        }`}>
          <div className="text-center space-y-4">
            <Trophy className="w-16 h-16 mx-auto text-red-500" />
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              ফলাফল পাওয়া যায়নি
            </h2>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              এই পরীক্ষার ফলাফল এখনো প্রকাশিত হয়নি বা খুঁজে পাওয়া যায়নি।
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => setLocation('/student/exams')}
                className={`w-full max-w-xs ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                পরীক্ষায় ফিরে যান
              </Button>
              <Button 
                variant="outline"
                onClick={() => setLocation('/student')}
                className="w-full max-w-xs"
              >
                <Home className="w-4 h-4 mr-2" />
                হোম পেজে যান
              </Button>
            </div>
          </div>
        </div>
      </MobileWrapper>
    );
  }

  return (
    <MobileWrapper>
      <div className={`min-h-screen ${isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' 
        : 'bg-gradient-to-br from-white via-gray-50 to-cyan-50'
      } transition-colors duration-300`}>
        
        {/* Mobile Header */}
        <header className={`sticky top-0 z-50 ${isDarkMode 
          ? 'bg-slate-800/95 backdrop-blur-sm border-b border-green-400/30' 
          : 'bg-white/95 backdrop-blur-sm border-b border-green-200 shadow-sm'
        }`}>
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation('/student/exams')}
                  className={`w-9 h-9 ${isDarkMode 
                    ? 'hover:bg-slate-700 text-green-400' 
                    : 'hover:bg-gray-100 text-green-600'
                  }`}
                  data-testid="button-back-exams"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h1 className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                    পরীক্ষার ফলাফল
                  </h1>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {exam?.title || 'পরীক্ষা'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`w-9 h-9 ${isDarkMode ? 'text-yellow-400 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  data-testid="button-theme-toggle"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation('/student')}
                  className={`w-9 h-9 ${isDarkMode 
                    ? 'hover:bg-slate-700 text-green-400' 
                    : 'hover:bg-gray-100 text-green-600'
                  }`}
                  data-testid="button-home"
                >
                  <Home className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 py-6 space-y-6">
          
          {/* Exam Info Card */}
          <Card className={`${isDarkMode 
            ? 'bg-slate-800/50 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-center ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                <Trophy className="w-6 h-6 mx-auto mb-2" />
                পরীক্ষার তথ্য
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className={`grid grid-cols-2 gap-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>{exam?.examDate ? new Date(exam.examDate).toLocaleDateString('bn-BD') : 'তারিখ নেই'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>{exam?.duration || 0} মিনিট</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-500" />
                  <span>{exam?.subject === 'chemistry' ? 'রসায়ন' : 'ICT'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>পূর্ণমান: {exam?.totalMarks || 100}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Result Card - Main Focus */}
          <Card className={`${isDarkMode 
            ? 'bg-gradient-to-r from-blue-500/10 to-green-500/10 border-blue-400/30' 
            : 'bg-gradient-to-r from-blue-50 to-green-50 border-blue-200'
          } shadow-lg`}>
            <CardHeader className="text-center pb-4">
              <CardTitle className={`flex items-center justify-center gap-2 text-xl ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                <Target className="w-6 h-6" />
                আপনার ফলাফল
              </CardTitle>
              <p className={`text-lg font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                {currentUserResult ? getPerformanceMessage(currentUserResult.percentage) : 'ফলাফল প্রস্তুত করা হচ্ছে...'}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Stats Grid */}
              {currentUserResult && (
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg text-center ${isDarkMode ? 'bg-slate-700' : 'bg-white'} border`}>
                    <div className={`text-3xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {currentUserResult.marks}
                    </div>
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      আপনার নম্বর
                    </div>
                    <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {exam?.totalMarks || 100} এর মধ্যে
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg text-center ${isDarkMode ? 'bg-slate-700' : 'bg-white'} border`}>
                    <div className={`text-3xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      #{currentUserResult.rank}
                    </div>
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      র‍্যাঙ্ক
                    </div>
                    <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      ক্লাসে অবস্থান
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg text-center ${isDarkMode ? 'bg-slate-700' : 'bg-white'} border`}>
                    <div className={`text-3xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      {currentUserResult.percentage}%
                    </div>
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      শতকরা নম্বর
                    </div>
                    <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      পারফরমেন্স
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg text-center ${isDarkMode ? 'bg-slate-700' : 'bg-white'} border`}>
                    <Badge 
                      className={`${getGradeColor(currentUserResult.grade)} text-2xl px-4 py-2 font-bold`}
                    >
                      {currentUserResult.grade}
                    </Badge>
                    <div className={`text-sm font-medium mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      গ্রেড
                    </div>
                    <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      মূল্যায়ন
                    </div>
                  </div>
                </div>
              )}

              {/* Teacher Feedback */}
              {currentUserResult?.feedback && (
                <div className={`p-4 rounded-lg ${isDarkMode 
                  ? 'bg-blue-500/10 border border-blue-400/30' 
                  : 'bg-blue-50 border border-blue-200'
                }`}>
                  <h4 className={`font-semibold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    <Star className="w-4 h-4" />
                    শিক্ষকের মন্তব্য
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                    {currentUserResult?.feedback}
                  </p>
                </div>
              )}

              {/* Performance Encouragement */}
              <div className={`p-4 rounded-lg text-center ${isDarkMode 
                ? 'bg-green-500/10 border border-green-400/30' 
                : 'bg-green-50 border border-green-200'
              }`}>
                <Award className={`w-8 h-8 mx-auto mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                <p className={`text-sm font-medium ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                  {currentUserResult?.percentage && currentUserResult.percentage >= 80 
                    ? 'চমৎকার পারফরমেন্স! এভাবেই চালিয়ে যান!' 
                    : 'পরবর্তী পরীক্ষায় আরো ভালো করার চেষ্টা করুন!'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="space-y-3 pb-6">
            <Button 
              onClick={() => setLocation('/student/exams')}
              className={`w-full py-3 ${isDarkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
              } shadow-lg`}
              data-testid="button-back-to-exams"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              অন্যান্য পরীক্ষা দেখুন
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setLocation('/student')}
              className={`w-full py-3 ${isDarkMode 
                ? 'border-gray-600 hover:bg-slate-800' 
                : 'border-gray-300 hover:bg-gray-50'
              }`}
              data-testid="button-student-home"
            >
              <Home className="w-4 h-4 mr-2" />
              স্টুডেন্ট ড্যাশবোর্ডে যান
            </Button>
          </div>
        </main>
      </div>
    </MobileWrapper>
  );
}