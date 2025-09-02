import React, { useState } from 'react';
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
  Download, 
  Edit, 
  Trash2, 
  ExternalLink,
  ArrowRight,
  ChevronLeft,
  GraduationCap,
  BookMarked
} from 'lucide-react';

// Chapter structure from NCTB curriculum
const CHAPTERS = {
  '9-10': {
    'chemistry': [
      'রসায়নের ধারণা',
      'পদার্থের অবস্থা',
      'পদার্থের গঠন',
      'রাসায়নিক বন্ধন',
      'এসিড ও ক্ষার',
      'ধাতু ও অধাতু',
      'কার্বন ও তার যৌগ',
      'খনিজ সম্পদ'
    ]
  },
  '11-12': {
    'chemistry': {
      'paper-1': [
        'ভৌত রসায়ন',
        'অজৈব রসায়ন',
        'জৈব রসায়ন',
        'প্রয়োগিক রসায়ন'
      ],
      'paper-2': [
        'বিশ্লেষণী রসায়ন',
        'পরিবেশ রসায়ন',
        'শিল্প রসায়ন',
        'জীব রসায়ন'
      ]
    },
    'ict': {
      'paper-1': [
        'তথ্য ও যোগাযোগ প্রযুক্তির উন্নয়ন',
        'কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং',
        'সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস'
      ],
      'paper-2': [
        'ওয়েব ডিজাইন ও প্রোগ্রামিং',
        'ডেটাবেস ম্যানেজমেন্ট সিস্টেম',
        'ডিজিটাল নিরাপত্তা'
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

export default function QuestionBank() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Navigation state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedPaper, setSelectedPaper] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  
  // Form state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    driveLink: '',
    questionType: 'pdf'
  });

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
    queryKey: ['question-bank-items', selectedClass, selectedSubject, selectedPaper, selectedCategory, selectedChapter],
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

  // Add new question mutation
  const addQuestionMutation = useMutation({
    mutationFn: async (questionData: any) => {
      const data = {
        ...questionData,
        classLevel: selectedClass,
        subject: selectedSubject,
        paper: selectedPaper,
        category: selectedCategory,
        chapter: selectedChapter
      };
      return await apiRequest('POST', '/api/question-bank/items', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-bank-items'] });
      setShowAddDialog(false);
      setNewItem({ title: '', description: '', driveLink: '', questionType: 'pdf' });
      toast({
        title: "সফল!",
        description: "প্রশ্নটি সফলভাবে যোগ করা হয়েছে"
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "প্রশ্ন যোগ করতে সমস্যা হয়েছে",
        variant: "destructive"
      });
    }
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return await apiRequest('DELETE', `/api/question-bank/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-bank-items'] });
      toast({
        title: "সফল!",
        description: "প্রশ্নটি মুছে ফেলা হয়েছে"
      });
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

  const handleSubmit = () => {
    if (!newItem.title || !newItem.driveLink) {
      toast({
        title: "ত্রুটি",
        description: "দয়া করে সকল ক্ষেত্র পূরণ করুন",
        variant: "destructive"
      });
      return;
    }
    addQuestionMutation.mutate(newItem);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">প্রশ্ন ব্যাংক ব্যবস্থাপনা</h1>
          <p className="text-gray-600 mt-2">NCTB কারিকুলাম অনুযায়ী প্রশ্ন সংগঠন</p>
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
                className="h-20 text-lg"
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
                className="h-20 text-lg"
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
                className="h-20 text-lg"
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
                  className="h-20 text-lg"
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
                className="h-20 text-lg"
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
                className="h-20 text-lg"
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
                  className="h-16 text-sm"
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
                  className="h-16 text-sm"
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

      {/* Step 6: Question Management */}
      {currentStep === 6 && selectedChapter && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedChapter} - প্রশ্ন ব্যবস্থাপনা</span>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleStepChange(5)}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  পূর্ববর্তী
                </Button>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      নতুন প্রশ্ন যোগ করুন
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>নতুন প্রশ্ন যোগ করুন</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">প্রশ্নের শিরোনাম</Label>
                        <Input
                          id="title"
                          value={newItem.title}
                          onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                          placeholder="যেমন: HSC 2023 Board Question"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">বিবরণ</Label>
                        <Textarea
                          id="description"
                          value={newItem.description}
                          onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                          placeholder="প্রশ্নের সংক্ষিপ্ত বিবরণ"
                        />
                      </div>
                      <div>
                        <Label htmlFor="driveLink">Google Drive লিংক</Label>
                        <Input
                          id="driveLink"
                          value={newItem.driveLink}
                          onChange={(e) => setNewItem({...newItem, driveLink: e.target.value})}
                          placeholder="https://drive.google.com/file/d/..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="questionType">প্রশ্নের ধরন</Label>
                        <Select value={newItem.questionType} onValueChange={(value) => setNewItem({...newItem, questionType: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF ফাইল</SelectItem>
                            <SelectItem value="document">ডকুমেন্ট</SelectItem>
                            <SelectItem value="link">লিংক</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                          বাতিল
                        </Button>
                        <Button onClick={handleSubmit} disabled={addQuestionMutation.isPending}>
                          {addQuestionMutation.isPending ? 'যোগ করা হচ্ছে...' : 'যোগ করুন'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">লোড হচ্ছে...</div>
            ) : (
              <div className="space-y-4">
                {questionItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    এই অধ্যায়ে এখনো কোনো প্রশ্ন যোগ করা হয়নি
                  </div>
                ) : (
                  questionItems.map((item: any) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                          {item.description && (
                            <p className="text-gray-600 mt-1">{item.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>ডাউনলোড: {item.downloadCount || 0}</span>
                            <span>যোগ করা হয়েছে: {new Date(item.createdAt).toLocaleDateString('bn-BD')}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.driveLink && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={item.driveLink} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => setEditingItem(item)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => deleteQuestionMutation.mutate(item.id)}
                            disabled={deleteQuestionMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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