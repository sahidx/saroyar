import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  FileText,
  Clock,
  Trophy,
  Play,
  LogOut,
  Moon,
  Sun,
  Calendar,
  User
} from 'lucide-react';
import { MobileWrapper } from '@/components/MobileWrapper';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { QuestionViewer } from '@/components/QuestionViewer';

export default function StudentExams() {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [, setLocation] = useLocation();
  const [selectedExamForViewing, setSelectedExamForViewing] = useState<any>(null);

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  // Fetch student exams and batch info
  const { data: examData, isLoading, error } = useQuery({
    queryKey: [`/api/student/exams?userId=${user?.id}`],
    enabled: !!user?.id,
  });

  const exams = examData?.exams || [];
  const batchInfo = examData?.batch;

  const { data: stats } = useQuery({
    queryKey: [`/api/student/stats?userId=${user?.id}`],
    enabled: !!user?.id,
  });

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
                    পরীক্ষা
                  </h1>
                  <p className={`text-sm ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    আপনার পরীক্ষা সমূহ
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
            
            {/* Student & Batch Info */}
            <Card className={`force-mobile-card ${isDarkMode 
              ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30' 
              : 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 shadow-md'
            }`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                  <User className="w-5 h-5" />
                  ছাত্র তথ্য
                </CardTitle>
              </CardHeader>
              <CardContent>
                {examData?.student && examData?.batch ? (
                  <div className="space-y-3">
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/80'}`}>
                      <div className={`font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                        {examData.student.firstName} {examData.student.lastName}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        ছাত্র আইডি: {examData.student.studentId}
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/80'}`}>
                      <div className={`font-semibold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                        {examData.batch.name}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        ব্যাচ কোড: {examData.batch.batchCode} | বিষয়: {examData.batch.subject === 'chemistry' ? 'রসায়ন' : 'ICT'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <User className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">তথ্য লোড হচ্ছে...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Available Exams */}
            <Card className={`force-mobile-card ${isDarkMode 
              ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/30' 
              : 'bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 shadow-md'
            }`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                  <FileText className="w-5 h-5" />
                  উপলব্ধ পরীক্ষা সমূহ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <div className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <p className="text-sm">পরীক্ষার তথ্য লোড হচ্ছে...</p>
                  </div>
                ) : exams && exams.length > 0 ? (
                  exams.map((exam: any) => (
                    <div key={exam.id} className={`p-4 rounded-lg border ${isDarkMode 
                      ? 'bg-slate-800/50 border-blue-400/30' 
                      : 'bg-white border-blue-200'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className={`font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                          {exam.title}
                        </h3>
                        <Badge variant={exam.hasSubmission ? "default" : "secondary"}>
                          {exam.hasSubmission ? 'সম্পন্ন' : 'নতুন'}
                        </Badge>
                      </div>
                      <div className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(exam.examDate).toLocaleDateString('bn-BD')}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          সময়: {exam.duration} মিনিট | নম্বর: {exam.totalMarks}
                        </div>
                        <div>
                          বিষয়: {exam.subject === 'Chemistry' ? 'রসায়ন' : 'ICT'} | ধরন: {exam.examType === 'mcq' ? 'বহুনির্বাচনী' : 'লিখিত'}
                        </div>
                      </div>
                      {exam.hasSubmission && exam.submission && (
                        <div className={`mt-3 p-2 rounded ${isDarkMode ? 'bg-green-500/10' : 'bg-green-50'}`}>
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                            স্কোর: {exam.submission.score || exam.submission.manualMarks}/{exam.submission.totalMarks}
                          </div>
                        </div>
                      )}
                      <div className="mt-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedExamForViewing(exam)}
                            className={isDarkMode ? 'border-orange-400 text-orange-300' : 'border-orange-500 text-orange-700'}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            প্রশ্নপত্র দেখুন
                          </Button>
                          {exam.hasSubmission ? (
                            <Button 
                              size="sm"
                              variant="outline"
                              className="bg-green-50 border-green-500 text-green-700 hover:bg-green-100"
                            >
                              <Trophy className="w-4 h-4 mr-2" />
                              ফলাফল দেখুন
                            </Button>
                          ) : (
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => setLocation(`/student/exam/${exam.id}/view`)}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              উত্তর দিন
                            </Button>
                          )}
                        </div>
                        {!exam.hasSubmission && (
                          <Button className="w-full" size="sm">
                            <Play className="w-4 h-4 mr-2" />
                            পরীক্ষা শুরু করুন
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">কোনো পরীক্ষা নেই</p>
                    <p className="text-xs mt-1">শিক্ষক পরীক্ষা তৈরি করলে এখানে দেখানো হবে</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Exam Results */}
            <Card className={`force-mobile-card ${isDarkMode ? 'bg-slate-800/80 border-slate-600' : 'bg-white border-gray-200 shadow-md'}`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-700'}`}>
                  <Trophy className="w-5 h-5" />
                  পরীক্ষার ফলাফল
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">পরীক্ষার ফলাফল এখানে দেখানো হবে</p>
                  <p className="text-xs mt-1">পরীক্ষা দিলে এখানে স্কোর ও গ্রেড দেখতে পাবেন</p>
                </div>
              </CardContent>
            </Card>

            {/* Exam Progress */}
            <Card className={`force-mobile-card ${isDarkMode 
              ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30' 
              : 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 shadow-md'
            }`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-purple-300' : 'text-purple-800'}`}>
                  <Clock className="w-5 h-5" />
                  আমার অগ্রগতি
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>অগ্রগতি</span>
                  <span className={`font-bold ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>
                    {stats?.completedExams || 0}/{stats?.totalExams || 0} পরীক্ষা
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" 
                    style={{ 
                      width: `${stats?.totalExams ? (stats.completedExams / stats.totalExams) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'}`}>
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {stats?.completedExams || 0}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'} font-medium`}>সম্পন্ন পরীক্ষা</div>
                  </div>
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'}`}>
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {stats?.averageScore ? Math.round(stats.averageScore) : 0}%
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'} font-medium`}>গড় স্কোর</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Question Viewer Modal */}
        {selectedExamForViewing && (
          <QuestionViewer
            exam={selectedExamForViewing}
            isOpen={!!selectedExamForViewing}
            onClose={() => setSelectedExamForViewing(null)}
          />
        )}
      </div>
    </MobileWrapper>
  );
}