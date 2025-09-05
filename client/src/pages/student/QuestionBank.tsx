import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Download, ExternalLink } from 'lucide-react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  subject: string;
  chapter: string;
  question_text: string;
  difficulty: string;
  marks: number;
  drive_link: string;
}

export default function StudentQuestionBank() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/simple-question-bank', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (question: Question) => {
    if (question.drive_link) {
      window.open(question.drive_link, '_blank');
      toast({
        title: "প্রশ্ন ডাউনলোড",
        description: "প্রশ্নের লিংক খোলা হচ্ছে...",
      });
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
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
      <Badge className={`${colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800'} text-xs`}>
        {labels[difficulty as keyof typeof labels] || difficulty}
      </Badge>
    );
  };

  const getSubjectName = (subject: string) => {
    return subject === 'chemistry' ? 'রসায়ন' : 'তথ্য ও যোগাযোগ প্রযুক্তি';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">প্রশ্নব্যাংক লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-cyan-50">
      {/* Header with back button */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/student')}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                ফিরে যান
              </Button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">প্রশ্ন ব্যাংক</h1>
                <p className="text-xs sm:text-sm text-gray-600">NCTB কারিকুলাম অনুযায়ী প্রশ্ন ডাউনলোড করুন</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <Badge variant="outline" className="text-xs">
                মোট {questions.length}টি
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {questions.length === 0 ? (
            <Card className="border-gray-200">
              <CardContent className="py-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">কোনো প্রশ্ন পাওয়া যায়নি।</p>
              </CardContent>
            </Card>
          ) : (
            questions.map((question) => (
              <Card key={question.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-sm sm:text-base font-semibold text-gray-900 mb-2">
                        {question.question_text}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {getSubjectName(question.subject)}
                        </Badge>
                        {getDifficultyBadge(question.difficulty)}
                        <Badge variant="outline" className="text-xs">
                          {question.marks} নম্বর
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">অধ্যায়:</span> {question.chapter}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <Button
                        onClick={() => handleDownload(question)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        ডাউনলোড করুন
                      </Button>
                      {question.drive_link && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(question.drive_link, '_blank')}
                          className="flex-1 sm:flex-none"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          লিংক দেখুন
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Stats */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">{questions.length}</div>
              <div className="text-sm text-green-600">মোট প্রশ্ন উপলব্ধ</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}