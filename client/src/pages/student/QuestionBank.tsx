import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Search, 
  Download, 
  ExternalLink,
  ArrowRight,
  ChevronLeft,
  GraduationCap,
  BookMarked,
  FileText,
  Clock,
  Users
} from 'lucide-react';

// Chapter structure from NCTB curriculum
const CHAPTERS = {
  '9-10': {
    'chemistry': [
      '১. রসায়নের ধারণা',
      '২. পদার্থের অবস্থা',
      '৩. পদার্থের গঠন',
      '৪. পর্যায় সারণী',
      '৫. রাসায়নিক বন্ধন',
      '৬. মৌলের ধারণা ও রাসায়নিক গণনা',
      '৭. রাসায়নিক বিক্রিয়া',
      '৮. রসায়ন ও শক্তি',
      '৯. এসিড‑ক্ষার সমতা',
      '১০. খনিজ সম্পদ: ধাতু ও অধাতু',
      '১১. খনিজ সম্পদ: জীবাশ্ম',
      '১২. আমাদের জীবনে রসায়ন'
    ]
  },
  '11-12': {
    'chemistry': {
      'paper-1': [
        'ল্যাবরেটোরির নিরাপদ ব্যবহার',
        'গুণগত রসায়ন',
        'মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন',
        'রাসায়নিক পরিবর্তন',
        'কর্মমুখী রসায়ন'
      ],
      'paper-2': [
        'পরিমাণগত রসায়ন',
        'অর্থনৈতিক রসায়ন',
        'তড়িৎ রসায়ন',
        'জৈব রসায়ন'
      ]
    },
    'ict': {
      'paper-1': [
        'তথ্য ও যোগাযোগ প্রযুক্তি পরিচিতি',
        'ICT-এর ভূমিকা ও প্রয়োজনীয়তা',
        'তথ্য ও সমাজ'
      ],
      'paper-2': [
        'ICT-এ নৈতিকতা ও ডিজিটাল নাগরিকত্ব',
        'উদীয়মান প্রযুক্তি প্রবণতা'
      ]
    }
  }
};

// Question categories
const CATEGORIES = {
  '9-10': [
    'বোর্ড প্রশ্ন',
    'টেস্ট পেপার',
    'নটরডেম কলেজ',
    'হলি ক্রস কলেজ'
  ],
  '11-12': [
    'বোর্ড প্রশ্ন',
    'সাধারণ বিশ্ববিদ্যালয়',
    'ইঞ্জিনিয়ারিং বিশ্ববিদ্যালয়',
    'মেডিকেল বিশ্ববিদ্যালয়'
  ]
};

export default function StudentQuestionBank() {
  const { toast } = useToast();
  
  // Navigation state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedPaper, setSelectedPaper] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Get available chapters for current selection
  const getAvailableChapters = () => {
    if (!selectedClass || !selectedSubject) return [];
    
    if (selectedClass === '9-10') {
      return CHAPTERS['9-10'][selectedSubject] || [];
    } else {
      const subject = CHAPTERS['11-12'][selectedSubject];
      if (subject && selectedPaper) {
        return subject[selectedPaper] || [];
      }
    }
    return [];
  };

  // Fetch question items for current selection
  const { data: questionItems = [], isLoading } = useQuery({
    queryKey: ['student-question-bank-items', selectedClass, selectedSubject, selectedPaper, selectedCategory, selectedChapter],
    enabled: !!(selectedClass && selectedSubject && selectedCategory && selectedChapter),
    queryFn: async () => {
      const params = new URLSearchParams({
        classLevel: selectedClass,
        subject: selectedSubject,
        category: selectedCategory,
        chapter: selectedChapter
      });
      if (selectedPaper) params.append('paper', selectedPaper);
      
      return await apiRequest(`/api/question-bank/items?${params}`);
    }
  });

  // Track download mutation
  const trackDownloadMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return await apiRequest('POST', `/api/question-bank/items/${itemId}/download`);
    }
  });

  // Reset navigation when going back
  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    if (step <= 1) {
      setSelectedClass('');
      setSelectedSubject('');
      setSelectedPaper('');
      setSelectedCategory('');
      setSelectedChapter('');
    } else if (step <= 2) {
      setSelectedSubject('');
      setSelectedPaper('');
      setSelectedCategory('');
      setSelectedChapter('');
    } else if (step <= 3) {
      setSelectedPaper('');
      setSelectedCategory('');
      setSelectedChapter('');
    } else if (step <= 4) {
      setSelectedCategory('');
      setSelectedChapter('');
    } else if (step <= 5) {
      setSelectedChapter('');
    }
  };

  const handleDownload = (item: any) => {
    if (item.resourceUrl) {
      trackDownloadMutation.mutate(item.id);
      window.open(item.resourceUrl, '_blank');
      toast({
        title: "ডাউনলোড শুরু",
        description: "প্রশ্নটি নতুন ট্যাবে খোলা হচ্ছে"
      });
    } else {
      toast({
        title: "ত্রুটি",
        description: "ডাউনলোড লিংক পাওয়া যায়নি",
        variant: "destructive"
      });
    }
  };

  // Filter items based on search term
  const filteredItems = questionItems.filter((item: any) =>
    !searchTerm || 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">প্রশ্ন ব্যাংক</h1>
          <p className="text-gray-600 mt-2">NCTB কারিকুলাম অনুযায়ী প্রশ্ন ডাউনলোড করুন</p>
        </div>
        <div className="flex items-center space-x-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <Badge variant="outline" className="text-lg px-4 py-2">
            পদক্ষেপ {currentStep}/6
          </Badge>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <span className={currentStep >= 1 ? 'font-semibold text-blue-600' : ''}>শ্রেণী</span>
        {selectedClass && (
          <>
            <ArrowRight className="w-4 h-4" />
            <span className={currentStep >= 2 ? 'font-semibold text-blue-600' : ''}>{selectedClass}</span>
          </>
        )}
        {selectedSubject && (
          <>
            <ArrowRight className="w-4 h-4" />
            <span className={currentStep >= 3 ? 'font-semibold text-blue-600' : ''}>{selectedSubject}</span>
          </>
        )}
        {selectedPaper && (
          <>
            <ArrowRight className="w-4 h-4" />
            <span className={currentStep >= 4 ? 'font-semibold text-blue-600' : ''}>{selectedPaper}</span>
          </>
        )}
        {selectedCategory && (
          <>
            <ArrowRight className="w-4 h-4" />
            <span className={currentStep >= 5 ? 'font-semibold text-blue-600' : ''}>{selectedCategory}</span>
          </>
        )}
        {selectedChapter && (
          <>
            <ArrowRight className="w-4 h-4" />
            <span className="font-semibold text-blue-600">{selectedChapter}</span>
          </>
        )}
      </div>

      {/* Step 1: Class Selection */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GraduationCap className="w-5 h-5" />
              <span>শ্রেণী নির্বাচন করুন</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-20 text-lg hover:bg-blue-50"
                onClick={() => {
                  setSelectedClass('9-10');
                  setCurrentStep(2);
                }}
              >
                <div className="text-center">
                  <div className="font-bold">নবম-দশম শ্রেণী</div>
                  <div className="text-sm text-gray-600">SSC</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 text-lg hover:bg-blue-50"
                onClick={() => {
                  setSelectedClass('11-12');
                  setCurrentStep(2);
                }}
              >
                <div className="text-center">
                  <div className="font-bold">একাদশ-দ্বাদশ শ্রেণী</div>
                  <div className="text-sm text-gray-600">HSC</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Subject Selection */}
      {currentStep === 2 && selectedClass && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookMarked className="w-5 h-5" />
                <span>বিষয় নির্বাচন করুন</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleStepChange(1)}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                পূর্ববর্তী
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-20 text-lg hover:bg-green-50"
                onClick={() => {
                  setSelectedSubject('chemistry');
                  setCurrentStep(selectedClass === '11-12' ? 3 : 4);
                }}
              >
                <div className="text-center">
                  <div className="font-bold">রসায়ন</div>
                  <div className="text-sm text-gray-600">Chemistry</div>
                </div>
              </Button>
              {selectedClass === '11-12' && (
                <Button 
                  variant="outline" 
                  className="h-20 text-lg hover:bg-purple-50"
                  onClick={() => {
                    setSelectedSubject('ict');
                    setCurrentStep(3);
                  }}
                >
                  <div className="text-center">
                    <div className="font-bold">তথ্য ও যোগাযোগ প্রযুক্তি</div>
                    <div className="text-sm text-gray-600">ICT</div>
                  </div>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Paper Selection (only for 11-12) */}
      {currentStep === 3 && selectedClass === '11-12' && selectedSubject && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>পত্র নির্বাচন করুন</span>
              <Button variant="ghost" size="sm" onClick={() => handleStepChange(2)}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                পূর্ববর্তী
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-20 text-lg hover:bg-orange-50"
                onClick={() => {
                  setSelectedPaper('paper-1');
                  setCurrentStep(4);
                }}
              >
                <div className="text-center">
                  <div className="font-bold">প্রথম পত্র</div>
                  <div className="text-sm text-gray-600">Paper 1</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 text-lg hover:bg-pink-50"
                onClick={() => {
                  setSelectedPaper('paper-2');
                  setCurrentStep(4);
                }}
              >
                <div className="text-center">
                  <div className="font-bold">দ্বিতীয় পত্র</div>
                  <div className="text-sm text-gray-600">Paper 2</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Category Selection */}
      {currentStep === 4 && selectedClass && selectedSubject && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>প্রশ্নের ধরন নির্বাচন করুন</span>
              <Button variant="ghost" size="sm" onClick={() => handleStepChange(selectedClass === '11-12' ? 3 : 2)}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                পূর্ববর্তী
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CATEGORIES[selectedClass].map((category) => (
                <Button 
                  key={category}
                  variant="outline" 
                  className="h-16 text-sm hover:bg-indigo-50"
                  onClick={() => {
                    setSelectedCategory(category);
                    setCurrentStep(5);
                  }}
                >
                  {category}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Chapter Selection */}
      {currentStep === 5 && selectedCategory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>অধ্যায় নির্বাচন করুন</span>
              <Button variant="ghost" size="sm" onClick={() => handleStepChange(4)}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                পূর্ববর্তী
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getAvailableChapters().map((chapter) => (
                <Button 
                  key={chapter}
                  variant="outline" 
                  className="h-16 text-sm hover:bg-teal-50"
                  onClick={() => {
                    setSelectedChapter(chapter);
                    setCurrentStep(6);
                  }}
                >
                  {chapter}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 6: Question List and Download */}
      {currentStep === 6 && selectedChapter && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedChapter} - প্রশ্ন সমূহ</span>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleStepChange(5)}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  পূর্ববর্তী
                </Button>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="প্রশ্ন খুঁজুন..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">লোড হচ্ছে...</div>
            ) : (
              <div className="space-y-4">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {questionItems.length === 0 
                      ? 'এই অধ্যায়ে এখনো কোনো প্রশ্ন যোগ করা হয়নি' 
                      : 'কোনো প্রশ্ন খুঁজে পাওয়া যায়নি'
                    }
                  </div>
                ) : (
                  filteredItems.map((item: any) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-all hover:border-blue-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold text-lg">{item.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {item.resourceType || 'PDF'}
                            </Badge>
                          </div>
                          {item.description && (
                            <p className="text-gray-600 mb-3">{item.description}</p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Download className="w-4 h-4" />
                              <span>{item.downloadCount || 0} ডাউনলোড</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(item.createdAt).toLocaleDateString('bn-BD')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.resourceUrl && (
                            <Button 
                              onClick={() => handleDownload(item)}
                              className="bg-blue-600 hover:bg-blue-700"
                              disabled={trackDownloadMutation.isPending}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              ডাউনলোড
                            </Button>
                          )}
                          {item.resourceUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={item.resourceUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}