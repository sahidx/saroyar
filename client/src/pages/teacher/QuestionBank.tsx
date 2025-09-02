import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  ExternalLink,
  FileText,
  Users,
  BookMarked,
  GraduationCap
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

export default function QuestionBank() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedPaper, setSelectedPaper] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    driveLink: '',
    chapter: '',
    year: '',
    questionType: 'mcq',
    tags: ''
  });

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

  // Create new category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: any) => {
      const response = await fetch('/api/question-bank/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/question-bank/categories'] });
      toast({
        title: "সফল",
        description: "নতুন ক্যাটেগরি তৈরি হয়েছে"
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "ক্যাটেগরি তৈরি করতে সমস্যা হয়েছে",
        variant: "destructive"
      });
    }
  });

  // Create new item mutation
  const createItemMutation = useMutation({
    mutationFn: async (itemData: any) => {
      const response = await fetch('/api/question-bank/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/question-bank/categories', selectedCategory, 'items'] });
      setShowAddDialog(false);
      setNewItem({
        title: '',
        description: '',
        driveLink: '',
        chapter: '',
        year: '',
        questionType: 'mcq',
        tags: ''
      });
      toast({
        title: "সফল",
        description: "নতুন প্রশ্ন ব্যাংক আইটেম যোগ হয়েছে"
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি", 
        description: "আইটেম যোগ করতে সমস্যা হয়েছে",
        variant: "destructive"
      });
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
    }
  };

  const handleAddItem = () => {
    if (!selectedCategory) {
      toast({
        title: "ত্রুটি",
        description: "প্রথমে একটি ক্যাটেগরি নির্বাচন করুন",
        variant: "destructive"
      });
      return;
    }

    const itemData = {
      ...newItem,
      categoryId: selectedCategory,
      tags: newItem.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    createItemMutation.mutate(itemData);
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
                প্রশ্ন ব্যাংক ব্যবস্থাপনা
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                NCTB কারিকুলাম অনুযায়ী প্রশ্ন ব্যাংক সংগঠন
              </p>
            </div>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700" disabled={!selectedCategory}>
                  <Plus className="h-4 w-4 mr-2" />
                  নতুন প্রশ্ন যোগ করুন
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>নতুন প্রশ্ন ব্যাংক আইটেম যোগ করুন</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">শিরোনাম</Label>
                    <Input
                      id="title"
                      value={newItem.title}
                      onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                      placeholder="প্রশ্নের শিরোনাম লিখুন"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">বর্ণনা</Label>
                    <Textarea
                      id="description"
                      value={newItem.description}
                      onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                      placeholder="প্রশ্নের বর্ণনা লিখুন"
                    />
                  </div>

                  <div>
                    <Label htmlFor="driveLink">Google Drive লিংক</Label>
                    <Input
                      id="driveLink"
                      value={newItem.driveLink}
                      onChange={(e) => setNewItem({...newItem, driveLink: e.target.value})}
                      placeholder="https://drive.google.com/..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="chapter">অধ্যায়</Label>
                      <Select value={newItem.chapter} onValueChange={(value) => setNewItem({...newItem, chapter: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="অধ্যায় নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableChapters().map((chapter) => (
                            <SelectItem key={chapter} value={chapter}>
                              {chapter}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="year">বছর</Label>
                      <Input
                        id="year"
                        value={newItem.year}
                        onChange={(e) => setNewItem({...newItem, year: e.target.value})}
                        placeholder="২০২৪"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="questionType">প্রশ্নের ধরন</Label>
                    <Select value={newItem.questionType} onValueChange={(value) => setNewItem({...newItem, questionType: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mcq">বহুনির্বাচনী</SelectItem>
                        <SelectItem value="creative">সৃজনশীল</SelectItem>
                        <SelectItem value="short">সংক্ষিপ্ত</SelectItem>
                        <SelectItem value="broad">বিস্তৃত</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tags">ট্যাগ (কমা দিয়ে আলাদা করুন)</Label>
                    <Input
                      id="tags"
                      value={newItem.tags}
                      onChange={(e) => setNewItem({...newItem, tags: e.target.value})}
                      placeholder="গুরুত্বপূর্ণ, কঠিন, বোর্ড পরীক্ষা"
                    />
                  </div>

                  <Button 
                    onClick={handleAddItem} 
                    className="w-full"
                    disabled={createItemMutation.isPending}
                  >
                    যোগ করুন
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filter Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              ফিল্টার ও নির্বাচন
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

        {/* Question Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow duration-200">
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
                      <GraduationCap className="h-4 w-4" />
                      <span>{item.year}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Download className="h-4 w-4" />
                    <span>{item.downloadCount} ডাউনলোড</span>
                  </div>
                </div>

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDownload(item)}
                    disabled={!item.driveLink}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    ডাউনলোড
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

        {filteredItems.length === 0 && selectedCategory && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                কোনো প্রশ্ন পাওয়া যায়নি
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                এই ক্যাটেগরিতে এখনো কোনো প্রশ্ন যোগ করা হয়নি। নতুন প্রশ্ন যোগ করুন।
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}