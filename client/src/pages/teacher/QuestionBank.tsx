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
import { Sidebar } from '@/components/Sidebar';
import { useLocation } from 'wouter';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Download, 
  Edit, 
  Trash2, 
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  GraduationCap,
  BookMarked
} from 'lucide-react';
import { CHAPTERS, CATEGORIES } from '@shared/questionBankConstants';

export default function QuestionBank() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
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
      return (CHAPTERS['9-10'] as any)[selectedSubject] || [];
    } else {
      const subject = (CHAPTERS['11-12'] as any)[selectedSubject];
      if (selectedSubject === 'ict') {
        // ICT doesn't have papers, return chapters directly
        return subject || [];
      } else if (subject && selectedPaper) {
        return (subject as any)[selectedPaper] || [];
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
    
    // Validate Google Drive link format
    if (!newItem.driveLink.includes('drive.google.com')) {
      toast({
        title: "ত্রুটি",
        description: "অনুগ্রহ করে একটি সঠিক Google Drive লিংক প্রদান করুন",
        variant: "destructive"
      });
      return;
    }

    const questionData = {
      ...newItem,
      classLevel: selectedClass,
      subject: selectedSubject,
      paper: selectedPaper,
      category: selectedCategory,
      chapter: selectedChapter
    };
    
    addQuestionMutation.mutate(questionData);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Back button */}
          <div className="flex items-center space-x-4 mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation('/teacher')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              data-testid="button-back-to-dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          </div>
          
          {/* Mobile-optimized header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">প্রশ্ন ব্যাংক ব্যবস্থাপনা</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">NCTB কারিকুলাম অনুযায়ী প্রশ্ন সংগঠন</p>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              <Badge variant="outline" className="text-sm sm:text-lg px-2 sm:px-4 py-1 sm:py-2">
                পদক্ষেপ {currentStep}/6
              </Badge>
            </div>
          </div>

      {/* Mobile-responsive breadcrumb with navigation controls */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 breadcrumb-mobile">
          <span className={currentStep >= 1 ? 'font-semibold text-blue-600' : ''}>শ্রেণী</span>
          {selectedClass && (
            <>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className={currentStep >= 2 ? 'font-semibold text-blue-600' : ''}>{selectedClass}</span>
            </>
          )}
          {selectedSubject && (
            <>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className={currentStep >= 3 ? 'font-semibold text-blue-600' : ''}>{selectedSubject}</span>
            </>
          )}
          {selectedPaper && (
            <>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className={currentStep >= 4 ? 'font-semibold text-blue-600' : ''}>{selectedPaper}</span>
            </>
          )}
          {selectedCategory && (
            <>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className={currentStep >= 5 ? 'font-semibold text-blue-600' : ''}>{selectedCategory}</span>
            </>
          )}
          {selectedChapter && (
            <>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="font-semibold text-blue-600">{selectedChapter}</span>
            </>
          )}
        </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 text-base sm:text-lg touch-target hover:bg-blue-50"
                onClick={() => {
                  setSelectedClass('9-10');
                  setCurrentStep(2);
                }}
                data-testid="button-select-class-9-10"
              >
                <div className="text-center">
                  <div className="font-bold">নবম-দশম শ্রেণী</div>
                  <div className="text-sm text-gray-600">SSC</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 text-base sm:text-lg touch-target hover:bg-blue-50"
                onClick={() => {
                  setSelectedClass('11-12');
                  setCurrentStep(2);
                }}
                data-testid="button-select-class-11-12"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 text-base sm:text-lg touch-target hover:bg-green-50"
                onClick={() => {
                  setSelectedSubject('chemistry');
                  setCurrentStep(selectedClass === '11-12' ? 3 : 4);
                }}
                data-testid="button-select-subject-chemistry"
              >
                <div className="text-center">
                  <div className="font-bold">রসায়ন</div>
                  <div className="text-sm text-gray-600">Chemistry</div>
                </div>
              </Button>
              {selectedClass === '11-12' && (
                <Button 
                  variant="outline" 
                  className="h-16 sm:h-20 text-base sm:text-lg touch-target hover:bg-purple-50"
                  onClick={() => {
                    setSelectedSubject('ict');
                    setCurrentStep(4); // Skip paper selection for ICT
                  }}
                  data-testid="button-select-subject-ict"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 text-base sm:text-lg touch-target hover:bg-orange-50"
                onClick={() => {
                  setSelectedPaper('paper-1');
                  setCurrentStep(4);
                }}
                data-testid="button-select-paper-1"
              >
                <div className="text-center">
                  <div className="font-bold">প্রথম পত্র</div>
                  <div className="text-sm text-gray-600">Paper 1</div>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 text-base sm:text-lg touch-target hover:bg-orange-50"
                onClick={() => {
                  setSelectedPaper('paper-2');
                  setCurrentStep(4);
                }}
                data-testid="button-select-paper-2"
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
      </div>
    </div>
  );
}