import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  BookOpen,
  FileText,
  Search,
  Filter,
  ExternalLink,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  Trophy,
  User,
  Atom,
  Cpu
} from 'lucide-react';
import { MobileWrapper } from '@/components/MobileWrapper';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';

export default function StudentQuestionBank() {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [, setLocation] = useLocation();
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedChapter, setSelectedChapter] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnswers, setShowAnswers] = useState<{ [key: string]: boolean }>({});

  // Fetch subjects and chapters for filtering
  const { data: subjectsData } = useQuery({
    queryKey: ['/api/student/question-bank/subjects'],
  });

  // Fetch question bank with filters
  const { data: questionBankData, isLoading, refetch } = useQuery({
    queryKey: [`/api/student/question-bank?subject=${selectedSubject}&chapter=${selectedChapter}&difficulty=${selectedDifficulty}&page=${currentPage}&limit=8`],
  });

  const questions = questionBankData?.questions || [];
  const totalPages = questionBankData?.totalPages || 1;
  const totalCount = questionBankData?.totalCount || 0;

  // Get available chapters for selected subject
  const availableChapters = (subjectsData as any)?.find((s: any) => s.subject === selectedSubject)?.chapters || [];

  // Filter questions based on search query
  const filteredQuestions = questions.filter((q: any) => 
    searchQuery === '' || 
    q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.chapter.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleAnswer = (questionId: string) => {
    setShowAnswers(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    refetch();
  };

  const getDifficultyBadge = (difficulty: string) => {
    const variants = {
      'easy': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800', 
      'hard': 'bg-red-100 text-red-800'
    };
    const labels = {
      'easy': 'সহজ',
      'medium': 'মাঝারি',
      'hard': 'কঠিন'
    };
    
    return (
      <Badge className={`${variants[difficulty as keyof typeof variants]} text-xs`}>
        {labels[difficulty as keyof typeof labels]}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <MobileWrapper>
        <div className={`min-h-screen flex items-center justify-center ${isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' 
          : 'bg-gradient-to-br from-white via-gray-50 to-cyan-50'
        }`}>
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>প্রশ্নব্যাংক লোড হচ্ছে...</p>
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
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    প্রশ্নব্যাংক
                  </h1>
                  <p className={`text-sm ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {totalCount}টি প্রশ্ন আছে
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className={`w-5 h-5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
              </div>
            </div>
          </div>
        </header>

        <main className="mobile-main-content force-mobile-padding p-4 space-y-4">
          
          {/* Search and Filters */}
          <Card className={`force-mobile-card ${isDarkMode 
            ? 'bg-slate-800/80 border-slate-600' 
            : 'bg-white border-gray-200 shadow-md'
          }`}>
            <CardContent className="p-4 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="প্রশ্ন খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className={`text-sm font-medium mb-2 block ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    বিষয়
                  </label>
                  <Select value={selectedSubject} onValueChange={(value) => {
                    setSelectedSubject(value);
                    setSelectedChapter('all');
                    handleFilterChange();
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="বিষয় নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">সব বিষয়</SelectItem>
                      {(subjectsData as any)?.map((subject: any) => (
                        <SelectItem key={subject.subject} value={subject.subject}>
                          <div className="flex items-center gap-2">
                            {subject.subject === 'Chemistry' ? 
                              <Atom className="w-4 h-4" /> : 
                              <Cpu className="w-4 h-4" />
                            }
                            {subject.subject === 'Chemistry' ? 'রসায়ন' : 'ICT'}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className={`text-sm font-medium mb-2 block ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    অধ্যায়
                  </label>
                  <Select 
                    value={selectedChapter} 
                    onValueChange={(value) => {
                      setSelectedChapter(value);
                      handleFilterChange();
                    }}
                    disabled={!selectedSubject}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="অধ্যায় নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">সব অধ্যায়</SelectItem>
                      {availableChapters.map((chapter: any) => (
                        <SelectItem key={chapter} value={chapter}>
                          {chapter}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className={`text-sm font-medium mb-2 block ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    কঠিনতা
                  </label>
                  <Select value={selectedDifficulty} onValueChange={(value) => {
                    setSelectedDifficulty(value);
                    handleFilterChange();
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="কঠিনতা নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">সব লেভেল</SelectItem>
                      <SelectItem value="easy">সহজ</SelectItem>
                      <SelectItem value="medium">মাঝারি</SelectItem>
                      <SelectItem value="hard">কঠিন</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions List */}
          <div className="space-y-4">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((question: any, index: number) => (
                <Card key={question.id} className={`force-mobile-card ${isDarkMode 
                  ? 'bg-slate-800/80 border-slate-600' 
                  : 'bg-white border-gray-200 shadow-md'
                }`}>
                  <CardContent className="p-4">
                    
                    {/* Question Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {((currentPage - 1) * 8) + index + 1}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            {question.subject === 'Chemistry' ? 'রসায়ন' : 'ICT'} • {question.chapter}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getDifficultyBadge(question.difficulty)}
                        <Badge variant="outline" className="text-xs">
                          {question.marks} নম্বর
                        </Badge>
                      </div>
                    </div>

                    {/* Question Text */}
                    <div className={`mb-4 text-sm leading-relaxed ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {question.questionText}
                    </div>

                    {/* Question Image */}
                    {question.questionImage && (
                      <div className="mb-4">
                        <img 
                          src={question.questionImage} 
                          alt="প্রশ্নের ছবি"
                          className="w-full rounded-lg border shadow-sm"
                          style={{ maxHeight: '250px', objectFit: 'contain' }}
                        />
                      </div>
                    )}

                    {/* Drive Link */}
                    {question.driveLink && (
                      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4 text-blue-600" />
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                              অতিরিক্ত রিসোর্স
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(question.driveLink, '_blank')}
                          >
                            দেখুন
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* MCQ Options */}
                    {question.questionType === 'mcq' && question.options && (
                      <div className="mb-4 space-y-2">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          বিকল্পসমূহ:
                        </p>
                        {Object.entries(question.options).map(([key, value]: [string, any]) => (
                          <div 
                            key={key} 
                            className={`p-2 rounded border text-sm ${
                              showAnswers[question.id] && key === question.correctAnswer 
                                ? isDarkMode 
                                  ? 'bg-green-900/30 border-green-400 text-green-300' 
                                  : 'bg-green-50 border-green-300 text-green-700'
                                : isDarkMode 
                                  ? 'bg-slate-800 border-slate-600 text-gray-300' 
                                  : 'bg-gray-50 border-gray-300 text-gray-700'
                            }`}
                          >
                            <span className="font-medium">{key.toUpperCase()})</span> {value}
                            {showAnswers[question.id] && key === question.correctAnswer && (
                              <span className="ml-2 text-xs font-medium">✓ সঠিক উত্তর</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Written Question Indicator */}
                    {question.questionType === 'written' && (
                      <div className={`mb-4 p-3 rounded border text-sm ${
                        isDarkMode 
                          ? 'bg-slate-800 border-slate-600 text-yellow-300' 
                          : 'bg-yellow-50 border-yellow-300 text-yellow-700'
                      }`}>
                        📝 লিখিত প্রশ্ন - নিজে উত্তর দেওয়ার চেষ্টা করুন
                      </div>
                    )}

                    {/* Show/Hide Answer Button */}
                    {question.questionType === 'mcq' && (
                      <div className="flex justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAnswer(question.id)}
                          className="text-xs"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {showAnswers[question.id] ? 'উত্তর লুকান' : 'উত্তর দেখান'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className={`force-mobile-card ${isDarkMode 
                ? 'bg-slate-800/80 border-slate-600' 
                : 'bg-white border-gray-200 shadow-md'
              }`}>
                <CardContent className="p-8 text-center">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    কোনো প্রশ্ন পাওয়া যায়নি
                  </p>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    অন্য ফিল্টার ব্যবহার করে দেখুন
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card className={`force-mobile-card ${isDarkMode 
              ? 'bg-slate-800/80 border-slate-600' 
              : 'bg-white border-gray-200 shadow-md'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentPage(currentPage - 1);
                      refetch();
                    }}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    আগের পেইজ
                  </Button>
                  
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    পেইজ {currentPage} / {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentPage(currentPage + 1);
                      refetch();
                    }}
                    disabled={currentPage === totalPages}
                  >
                    পরের পেইজ
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </MobileWrapper>
  );
}