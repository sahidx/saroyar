import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Download, 
  ExternalLink,
  FileText,
  BookMarked,
  GraduationCap,
  Users,
  Clock
} from 'lucide-react';

// NCTB Curriculum Structure
const EDUCATION_STRUCTURE = {
  'নবম-দশম শ্রেণী': {
    'রসায়ন': {
      'পত্র-১': ['রসায়নের ধারণা', 'পদার্থের অবস্থা', 'পদার্থের গঠন', 'রাসায়নিক বন্ধন'],
      'পত্র-২': ['এসিড ও ক্ষার', 'ধাতু ও অধাতু', 'কার্বন ও তার যৌগ', 'খনিজ সম্পদ']
    },
    'তথ্য ও যোগাযোগ প্রযুক্তি': {
      'তথ্য ও যোগাযোগ প্রযুক্তি': [
        'তথ্য ও যোগাযোগ প্রযুক্তি: বিশ্ব ও বাংলাদেশ প্রেক্ষিত',
        'কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং',
        'সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস',
        'ডেটাবেস',
        'প্রোগ্রামিং ভাষা',
        'ওয়েব ডিজাইন পরিচিতি ও এইচটিএমএল'
      ]
    }
  },
  'একাদশ-দ্বাদশ শ্রেণী': {
    'রসায়ন': {
      'পত্র-১': ['ভৌত রসায়ন', 'অজৈব রসায়ন', 'জৈব রসায়ন', 'প্রয়োগিক রসায়ন'],
      'পত্র-২': ['বিশ্লেষণী রসায়ন', 'পরিবেশ রসায়ন', 'শিল্প রসায়ন', 'জীব রসায়ন']
    },
    'তথ্য ও যোগাযোগ প্রযুক্তি': {
      'তথ্য ও যোগাযোগ প্রযুক্তি': [
        'তথ্য ও যোগাযোগ প্রযুক্তির উন্নয়ন',
        'কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং',
        'সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস',
        'ওয়েব ডিজাইন ও প্রোগ্রামিং',
        'ডেটাবেস ম্যানেজমেন্ট সিস্টেম',
        'ডিজিটাল নিরাপত্তা'
      ]
    }
  }
};

const QUESTION_CATEGORIES = [
  'বোর্ড প্রশ্ন',
  'টেস্ট পেপার', 
  'নটরডেম কলেজ',
  'হলি ক্রস কলেজ',
  'সাধারণ বিশ্ববিদ্যালয়',
  'ইঞ্জিনিয়ারিং বিশ্ববিদ্যালয়',
  'মেডিকেল বিশ্ববিদ্যালয়'
];

export default function StudentQuestionBank() {
  const { toast } = useToast();
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedPaper, setSelectedPaper] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch question bank categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/question-bank/categories']
  });

  // Fetch filtered categories based on selection
  const { data: filteredCategories = [] } = useQuery({
    queryKey: ['/api/question-bank/categories/filter', selectedClass, selectedSubject, selectedPaper],
    enabled: !!(selectedClass && selectedSubject),
    queryFn: async () => {
      const response = await apiRequest(`/api/question-bank/categories/filter?classLevel=${selectedClass}&subject=${selectedSubject}${selectedPaper ? `&paper=${selectedPaper}` : ''}`);
      return response;
    }
  });

  // Fetch items for selected category
  const { data: questionItems = [] } = useQuery({
    queryKey: ['/api/question-bank/categories', selectedCategory, 'items'],
    enabled: !!selectedCategory,
    queryFn: async () => {
      const response = await apiRequest(`/api/question-bank/categories/${selectedCategory}/items`);
      return response;
    }
  });

  // Track download mutation
  const trackDownloadMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/question-bank/items/${itemId}/download`, {
        method: 'POST'
      });
      return response.json();
    }
  });

  const handleDownload = (item: any) => {
    if (item.driveLink) {
      trackDownloadMutation.mutate(item.id);
      window.open(item.driveLink, '_blank');
      toast({
        title: "ডাউনলোড শুরু",
        description: "প্রশ্নটি নতুন ট্যাবে খোলা হচ্ছে"
      });
    } else {
      toast({
        title: "ত্রুটি",
        description: "এই প্রশ্নের জন্য কোনো লিংক পাওয়া যায়নি",
        variant: "destructive"
      });
    }
  };

  const getAvailableChapters = () => {
    if (!selectedClass || !selectedSubject || !selectedPaper) return [];
    const classData = EDUCATION_STRUCTURE[selectedClass as keyof typeof EDUCATION_STRUCTURE];
    if (!classData) return [];
    const subjectData = classData[selectedSubject as keyof typeof classData];
    if (!subjectData) return [];
    return subjectData[selectedPaper as keyof typeof subjectData] || [];
  };

  const filteredItems = Array.isArray(questionItems) ? questionItems.filter((item: any) => {
    const matchesSearch = !searchTerm || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesChapter = !selectedChapter || item.chapter === selectedChapter;
    
    return matchesSearch && matchesChapter;
  }) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      {/* Floating Chemical Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-8 h-8 bg-blue-400 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-purple-400 rounded-full opacity-20 animate-ping"></div>
        <div className="absolute bottom-32 left-1/4 w-10 h-10 bg-green-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-1/3 w-7 h-7 bg-yellow-400 rounded-full opacity-20 animate-bounce"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <BookOpen className="h-10 w-10 text-blue-600" />
                প্রশ্ন ব্যাংক
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                NCTB কারিকুলাম অনুযায়ী বিগত বছরের প্রশ্ন ও সমাধান
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">মোট প্রশ্ন</div>
              <div className="text-2xl font-bold text-blue-600">{questionItems.length}</div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              প্রশ্ন খুঁজুন
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <Label>শ্রেণী</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="শ্রেণী নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(EDUCATION_STRUCTURE).map((classLevel) => (
                      <SelectItem key={classLevel} value={classLevel}>
                        {classLevel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>বিষয়</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="বিষয় নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedClass && Object.keys(EDUCATION_STRUCTURE[selectedClass] || {}).map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>পত্র</Label>
                <Select value={selectedPaper} onValueChange={setSelectedPaper} disabled={!selectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="পত্র নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedClass && selectedSubject && Object.keys(EDUCATION_STRUCTURE[selectedClass]?.[selectedSubject] || {}).map((paper) => (
                      <SelectItem key={paper} value={paper}>
                        {paper}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>ক্যাটেগরি</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={!selectedPaper}>
                  <SelectTrigger>
                    <SelectValue placeholder="ক্যাটেগরি নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {QUESTION_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Chapter and Search Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>অধ্যায়</Label>
                <Select value={selectedChapter} onValueChange={setSelectedChapter}>
                  <SelectTrigger>
                    <SelectValue placeholder="সব অধ্যায়" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">সব অধ্যায়</SelectItem>
                    {getAvailableChapters().map((chapter) => (
                      <SelectItem key={chapter} value={chapter}>
                        {chapter}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>খুঁজুন</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="প্রশ্ন খুঁজুন..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        {selectedCategory && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">{filteredItems.length}</div>
                    <div className="text-sm text-gray-500">মোট প্রশ্ন</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BookMarked className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold">{[...new Set(filteredItems.map(item => item.chapter))].length}</div>
                    <div className="text-sm text-gray-500">অধ্যায়</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-8 w-8 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold">{[...new Set(filteredItems.map(item => item.year).filter(Boolean))].length}</div>
                    <div className="text-sm text-gray-500">বছর</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Download className="h-8 w-8 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold">{filteredItems.reduce((sum, item) => sum + (item.downloadCount || 0), 0)}</div>
                    <div className="text-sm text-gray-500">ডাউনলোড</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Question Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-lg flex items-start justify-between">
                  <span className="line-clamp-2">{item.title}</span>
                  <Badge variant={item.questionType === 'mcq' ? 'default' : 'secondary'}>
                    {item.questionType === 'mcq' ? 'MCQ' : 
                     item.questionType === 'creative' ? 'সৃজনশীল' :
                     item.questionType === 'short' ? 'সংক্ষিপ্ত' : 'বিস্তৃত'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {item.description && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <BookMarked className="h-4 w-4" />
                    <span>{item.chapter}</span>
                  </div>
                  
                  {item.year && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{item.year} সাল</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users className="h-4 w-4" />
                    <span>{item.downloadCount || 0} জন ডাউনলোড করেছে</span>
                  </div>
                </div>

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleDownload(item)}
                    disabled={!item.driveLink || trackDownloadMutation.isPending}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    {trackDownloadMutation.isPending ? 'ডাউনলোড হচ্ছে...' : 'ডাউনলোড করুন'}
                  </Button>
                  
                  {item.driveLink && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(item.driveLink, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && selectedCategory && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                কোনো প্রশ্ন পাওয়া যায়নি
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                আপনার নির্বাচিত ফিল্টার অনুযায়ী কোনো প্রশ্ন খুঁজে পাওয়া যায়নি। অন্য ক্যাটেগরি বা অধ্যায় চেষ্টা করুন।
              </p>
            </CardContent>
          </Card>
        )}

        {/* Getting Started */}
        {!selectedCategory && (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                প্রশ্ন ব্যাংক এ স্বাগতম
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                শুরু করতে উপরে থেকে শ্রেণী, বিষয়, পত্র এবং ক্যাটেগরি নির্বাচন করুন।
              </p>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>• বোর্ড পরীক্ষার প্রশ্ন</p>
                <p>• বিভিন্ন কলেজের টেস্ট পেপার</p>
                <p>• বিশ্ববিদ্যালয় ভর্তি প্রশ্ন</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}