import React, { useState } from 'react';
import { ArrowLeft, Bot, Sparkles, FileText, Settings } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Bangladesh NCTB Curriculum Structure
const curriculumData = {
  chemistry: {
    "9-10": {
      papers: [], // No paper division for Class 9-10
      chapters: [
        "পদার্থের গুণাবলি ও গাঠনিক বৈশিষ্ট্য",
        "গাঠনিক রসায়ন", 
        "পর্যায় সারণি ও মৌলগুলির ধর্মের পর্যায়বৃত্ততা",
        "রাসায়নিক পরিবর্তন",
        "গ্যাস",
        "পানির রসায়ন",
        "অম্ল, ক্ষারক ও লবণ",
        "তড়িৎ রসায়ন",
        "জৈব রসায়ন",
        "পরিবেশ রসায়ন"
      ]
    },
    "11-12": {
      papers: ["১ম পত্র", "২য় পত্র"],
      chapters: {
        "১ম পত্র": [
          "ল্যাবরেটরির নিরাপত্তা ও গাণিতিক সমস্যা",
          "গাঠনিক রসায়ন",
          "পর্যায় সারণি ও মৌলগুলির ধর্মের পর্যায়বৃত্ততা", 
          "রাসায়নিক বন্ধন",
          "গ্যাস",
          "তরল",
          "কঠিন",
          "রাসায়নিক পরিবর্তন",
          "রাসায়নিক গতিবিদ্যা",
          "রাসায়নিক ভারসাম্য"
        ],
        "২য় পত্র": [
          "তাপ রসায়ন",
          "তড়িৎ রসায়ন",
          "জৈব রসায়ন (হাইড্রোকার্বন)",
          "জৈব রসায়ন (অ্যালকোহল, ফিনল, ইথার)",
          "জৈব রসায়ন (অ্যালডিহাইড, কিটোন, কার্বক্সিলিক অ্যাসিড)",
          "জৈব রসায়ন (অ্যামিন, নাইট্রো যৌগ)",
          "জৈব যৌগের গঠন ও প্রক্রিয়া", 
          "পরিবেশ রসায়ন"
        ]
      }
    }
  },
  ict: {
    "9-10": {
      papers: [], // No paper division for Class 9-10
      chapters: [
        "তথ্য ও যোগাযোগ প্রযুক্তি: বিশ্ব ও বাংলাদেশ প্রেক্ষিত",
        "কম্পিউটার সিস্টেম",
        "কম্পিউটার সফটওয়্যার",
        "ডিজিটাল ডিভাইস ও প্রোগ্রামিং",
        "ডাটাবেজ ম্যানেজমেন্ট সিস্টেম",
        "নেটওয়ার্ক ও ইন্টারনেট",
        "ওয়েব ডিজাইন",
        "তথ্য ও যোগাযোগ প্রযুক্তির সামাজিক, অর্থনৈতিক ও নৈতিক ব্যবহার"
      ]
    },
    "11-12": {
      papers: [], // No paper division for HSC ICT
      chapters: [
        "তথ্য ও যোগাযোগ প্রযুক্তি: বিশ্ব ও বাংলাদেশ প্রেক্ষিত",
        "সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস",
        "কম্পিউটার সিস্টেম", 
        "প্রোগ্রামিং ভাষা",
        "ডাটাবেজ ম্যানেজমেন্ট সিস্টেম",
        "ডাটা কমিউনিকেশন ও নেটওয়ার্ক",
        "ইন্টারনেট ও ওয়েব ডিজাইন",
        "মাল্টিমিডিয়া ও গ্রাফিক্স",
        "তথ্য ও যোগাযোগ প্রযুক্তির সামাজিক, অর্থনৈতিক ও নৈতিক ব্যবহার"
      ]
    }
  }
};

export default function AIQuestions() {
  const [, setLocation] = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [subject, setSubject] = useState('');
  const [examType, setExamType] = useState('academic');
  const [classLevel, setClassLevel] = useState('');
  const [paper, setPaper] = useState('');
  const [chapter, setChapter] = useState('');
  const [questionType, setQuestionType] = useState('mcq');
  const [questionLanguage] = useState('bengali'); // Fixed to Bengali only
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(5);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Get available papers based on subject and class
  const getAvailablePapers = () => {
    if (!subject || !classLevel) return [];
    return curriculumData[subject as keyof typeof curriculumData]?.[classLevel as keyof typeof curriculumData['chemistry']]?.papers || [];
  };

  // Get available chapters based on subject, class, and paper
  const getAvailableChapters = () => {
    if (!subject || !classLevel) return [];
    const subjectData = curriculumData[subject as keyof typeof curriculumData]?.[classLevel as keyof typeof curriculumData['chemistry']];
    if (!subjectData) return [];
    
    if (Array.isArray(subjectData.chapters)) {
      return subjectData.chapters;
    } else if (paper && subjectData.chapters && typeof subjectData.chapters === 'object') {
      return (subjectData.chapters as Record<string, string[]>)[paper] || [];
    }
    return [];
  };

  const handleGenerateQuestions = async () => {
    if (!subject || !classLevel || !chapter) {
      toast({
        title: "তথ্য অনুপস্থিত",
        description: "অনুগ্রহ করে সব তথ্য পূরণ করুন।",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    try {
      const response = await apiRequest('POST', '/api/ai/generate-questions', {
        subject,
        examType,
        classLevel,
        paper,
        chapter,
        questionType,
        difficulty,
        count
      });

      const data = await response.json();
      setGeneratedQuestions(data.questions || []);
      
      toast({
        title: "✨ প্রশ্ন তৈরি সম্পন্ন!",
        description: `Praggo AI দিয়ে ${data.questions?.length || 0}টি প্রশ্ন তৈরি হয়েছে।`,
      });
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: "প্রশ্ন তৈরিতে ত্রুটি",
        description: "প্রশ্ন তৈরি করতে পারিনি। আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyQuestions = () => {
    const questionsText = generatedQuestions.map((q, index) => 
      `${index + 1}. ${q.questionText}\n   ক) ${q.options?.[0] || ''}\n   খ) ${q.options?.[1] || ''}\n   গ) ${q.options?.[2] || ''}\n   ঘ) ${q.options?.[3] || ''}\n   সঠিক উত্তর: ${q.correctAnswer || ''}\n`
    ).join('\n');
    
    navigator.clipboard.writeText(questionsText);
    toast({
      title: "✅ কপি সম্পন্ন!",
      description: "প্রশ্নগুলো ক্লিপবোর্ডে কপি হয়েছে।",
    });
  };

  return (
    <div className={`min-h-screen ${isDarkMode 
      ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900' 
      : 'bg-gradient-to-br from-green-50 via-white to-blue-50'
    }`}>
      {/* Header with Back Navigation */}
      <header className={`backdrop-blur-sm border-b ${isDarkMode 
        ? 'bg-gray-800/95 border-green-400/30' 
        : 'bg-white/95 border-green-300/50 shadow-sm'
      }`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/teacher')}
              className={`${isDarkMode ? 'text-cyan-400 hover:bg-slate-700' : 'text-green-600 hover:bg-green-50'}`}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              ফিরে যান
            </Button>
            <div className="flex items-center space-x-2">
              <Bot className={`w-6 h-6 ${isDarkMode ? 'text-cyan-400' : 'text-green-600'}`} />
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Praggo AI প্রশ্ন জেনারেটর
              </h1>
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                🤖 Praggo AI
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6">
        <Card className={`${isDarkMode ? 'bg-slate-800/50 border-cyan-400/30' : 'bg-white border-green-300/50'}`}>
          <CardHeader>
            <CardTitle className={`flex items-center space-x-2 ${isDarkMode ? 'text-cyan-300' : 'text-green-600'}`}>
              <Sparkles className="w-5 h-5" />
              <span>বাংলাদেশি প্রেক্ষাপটে AI প্রশ্ন তৈরি</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Settings */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  বিষয় *
                </Label>
                <Select value={subject} onValueChange={(value) => {
                  setSubject(value);
                  setClassLevel('');
                  setPaper('');
                  setChapter('');
                }}>
                  <SelectTrigger className={isDarkMode ? 'bg-slate-700 border-cyan-400/30' : 'bg-white'}>
                    <SelectValue placeholder="বিষয় নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chemistry">🧪 রসায়ন (Chemistry)</SelectItem>
                    <SelectItem value="ict">💻 তথ্য ও যোগাযোগ প্রযুক্তি (ICT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  পরীক্ষার ধরন
                </Label>
                <Select value={examType} onValueChange={setExamType}>
                  <SelectTrigger className={isDarkMode ? 'bg-slate-700 border-cyan-400/30' : 'bg-white'}>
                    <SelectValue placeholder="পরীক্ষার ধরন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">📚 একাডেমিক</SelectItem>
                    <SelectItem value="admission">🎓 ভর্তি পরীক্ষা</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  শ্রেণি *
                </Label>
                <Select value={classLevel} onValueChange={(value) => {
                  setClassLevel(value);
                  setPaper('');
                  setChapter('');
                }}>
                  <SelectTrigger className={isDarkMode ? 'bg-slate-700 border-cyan-400/30' : 'bg-white'}>
                    <SelectValue placeholder="শ্রেণি নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9-10">📖 নবম-দশম শ্রেণি</SelectItem>
                    <SelectItem value="11-12">📚 একাদশ-দ্বাদশ শ্রেণি (HSC)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Paper Selection (for HSC Chemistry) */}
            {subject && classLevel && getAvailablePapers().length > 1 && (
              <div>
                <Label className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  পত্র *
                </Label>
                <Select value={paper} onValueChange={(value) => {
                  setPaper(value);
                  setChapter('');
                }}>
                  <SelectTrigger className={isDarkMode ? 'bg-slate-700 border-cyan-400/30' : 'bg-white'}>
                    <SelectValue placeholder="পত্র নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailablePapers().map((paperName: string) => (
                      <SelectItem key={paperName} value={paperName}>
                        📄 {paperName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Chapter Selection */}
            {subject && classLevel && (
              <div>
                <Label className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  অধ্যায় *
                </Label>
                <Select value={chapter} onValueChange={setChapter}>
                  <SelectTrigger className={isDarkMode ? 'bg-slate-700 border-cyan-400/30' : 'bg-white'}>
                    <SelectValue placeholder="অধ্যায় নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {getAvailableChapters().map((chapterName: string) => (
                      <SelectItem key={chapterName} value={chapterName}>
                        📚 {chapterName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  প্রশ্নের ধরন
                </Label>
                <Select value={questionType} onValueChange={setQuestionType}>
                  <SelectTrigger className={isDarkMode ? 'bg-slate-700 border-cyan-400/30' : 'bg-white'}>
                    <SelectValue placeholder="প্রশ্নের ধরন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">📝 MCQ (বহুনির্বাচনী)</SelectItem>
                    <SelectItem value="cq">✍️ CQ (সংক্ষিপ্ত প্রশ্ন)</SelectItem>
                    <SelectItem value="creative">🎨 সৃজনশীল প্রশ্ন</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  কঠিনতার স্তর
                </Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className={isDarkMode ? 'bg-slate-700 border-cyan-400/30' : 'bg-white'}>
                    <SelectValue placeholder="কঠিনতা" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">😊 সহজ</SelectItem>
                    <SelectItem value="medium">📚 মধ্যম</SelectItem>
                    <SelectItem value="hard">🎯 জটিল</SelectItem>
                    <SelectItem value="mixed">🔄 মিশ্র (সব স্তর)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  প্রশ্ন সংখ্যা
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className={isDarkMode ? 'bg-slate-700 border-cyan-400/30 text-white' : 'bg-white'}
                />
              </div>
            </div>

            <Button
              onClick={handleGenerateQuestions}
              disabled={!subject || !classLevel || !chapter || isGenerating}
              className={`w-full ${isDarkMode ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Praggo AI দিয়ে {count}টি প্রশ্ন তৈরি হচ্ছে...
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4 mr-2" />
                  Praggo AI দিয়ে {count}টি প্রশ্ন তৈরি করুন
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {generatedQuestions.length > 0 && (
          <Card className={`${isDarkMode ? 'bg-slate-800/50 border-cyan-400/30' : 'bg-white border-green-300/50'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center space-x-2 ${isDarkMode ? 'text-cyan-300' : 'text-green-600'}`}>
                <FileText className="w-5 h-5" />
                <span>তৈরিকৃত প্রশ্ন ({generatedQuestions.length}টি)</span>
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                  Praggo AI
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generatedQuestions.map((question, index) => (
                  <div key={index} className={`p-4 border rounded-lg ${isDarkMode ? 'bg-slate-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <div className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {index + 1}. {question.questionText}
                    </div>
                    {question.options && (
                      <div className="grid grid-cols-1 gap-2 text-sm mb-2">
                        {question.options.map((option: string, optIndex: number) => (
                          <div key={optIndex} className={`p-2 rounded ${
                            option === question.correctAnswer 
                              ? (isDarkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800')
                              : (isDarkMode ? 'bg-slate-600/50 text-gray-300' : 'bg-white text-gray-700')
                          }`}>
                            {['ক', 'খ', 'গ', 'ঘ'][optIndex]}) {option}
                            {option === question.correctAnswer && ' ✅'}
                          </div>
                        ))}
                      </div>
                    )}
                    {question.answer && (
                      <div className={`text-sm mt-3 p-3 rounded ${isDarkMode ? 'bg-blue-900/30 text-blue-200' : 'bg-blue-50 text-blue-800'}`}>
                        <strong>বিস্তারিত উত্তর:</strong> {question.answer}
                      </div>
                    )}
                    <div className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      নম্বর: {question.marks} | সঠিক উত্তর: {question.correctAnswer}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex flex-wrap gap-3">
                <Button 
                  onClick={copyQuestions}
                  variant="outline" 
                  className={isDarkMode ? 'border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10' : 'border-green-300 text-green-600 hover:bg-green-50'}
                >
                  📋 প্রশ্ন কপি করুন
                </Button>
                <Button 
                  variant="outline" 
                  className={isDarkMode ? 'border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10' : 'border-green-300 text-green-600 hover:bg-green-50'}
                  onClick={() => setGeneratedQuestions([])}
                >
                  🗑️ সাফ করুন
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}