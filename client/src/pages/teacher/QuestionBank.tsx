import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, BookOpen, ExternalLink, Plus, Save, Link as LinkIcon } from 'lucide-react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

interface ChapterResource {
  id: string;
  class_level: string;
  subject: string;
  chapter_name: string;
  google_drive_link: string;
  description: string;
  created_at: string;
}

// Chapter structure from previous constants - EXACT match with student version
const CHAPTER_STRUCTURE = {
  '9-10': {
    chemistry: [
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
    ],
    ict: [
      'তথ্য ও যোগাযোগ প্রযুক্তি পরিচিতি',
      'ICT-এর ভূমিকা ও প্রয়োজনীয়তা',
      'তথ্য ও সমাজ',
      'ICT-এ নৈতিকতা ও ডিজিটাল নাগরিকত্ব',
      'উদীয়মান প্রযুক্তি প্রবণতা'
    ]
  },
  '11-12': {
    chemistry: [
      'ল্যাবরেটোরির নিরাপদ ব্যবহার',
      'গুণগত রসায়ন',
      'মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন',
      'রাসায়নিক পরিবর্তন',
      'কর্মমুখী রসায়ন',
      'পরিমাণগত রসায়ন',
      'অর্থনৈতিক রসায়ন',
      'তড়িৎ রসায়ন',
      'জৈব রসায়ন'
    ],
    ict: [
      'তথ্য ও যোগাযোগ প্রযুক্তি পরিচিতি',
      'ICT-এর ভূমিকা ও প্রয়োজনীয়তা',
      'তথ্য ও সমাজ',
      'ICT-এ নৈতিকতা ও ডিজিটাল নাগরিকত্ব',
      'উদীয়মান প্রযুক্তি প্রবণতা'
    ]
  }
};

export default function TeacherQuestionBank() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [resources, setResources] = useState<ChapterResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>('9-10');
  const [selectedSubject, setSelectedSubject] = useState<string>('chemistry');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [googleDriveLink, setGoogleDriveLink] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchResources();
  }, [selectedClass, selectedSubject]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedClass) params.append('class_level', selectedClass);
      if (selectedSubject) params.append('subject', selectedSubject);
      
      const response = await fetch(`/api/chapter-resources?${params}`);
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      }
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResource = async () => {
    if (!selectedChapter || !googleDriveLink.trim()) {
      toast({
        title: "ত্রুটি",
        description: "অধ্যায় ও Google Drive লিংক পূরণ করুন",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/teacher/chapter-resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_level: selectedClass,
          subject: selectedSubject,
          chapter_name: selectedChapter,
          google_drive_link: googleDriveLink.trim(),
          description: description.trim()
        })
      });

      if (response.ok) {
        toast({
          title: "সফল",
          description: "Google Drive লিংক সংরক্ষণ হয়েছে"
        });
        
        // Clear form
        setSelectedChapter('');
        setGoogleDriveLink('');
        setDescription('');
        
        // Refresh resources
        fetchResources();
      }
    } catch (error) {
      toast({
        title: "ত্রুটি", 
        description: "লিংক সংরক্ষণে সমস্যা হয়েছে",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getSubjectName = (subject: string) => {
    return subject === 'chemistry' ? 'রসায়ন' : 'তথ্য ও যোগাযোগ প্রযুক্তি';
  };

  const getClassDisplayName = (classLevel: string) => {
    return classLevel === '9-10' ? 'নবম-দশম শ্রেণী' : 'একাদশ-দ্বাদশ শ্রেণী';
  };

  const getAvailableChapters = () => {
    return CHAPTER_STRUCTURE[selectedClass as keyof typeof CHAPTER_STRUCTURE]?.[selectedSubject as 'chemistry' | 'ict'] || [];
  };

  const getResourceForChapter = (chapterName: string) => {
    return resources.find(r => r.chapter_name === chapterName);
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
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/teacher')}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                ফিরে যান
              </Button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">প্রশ্ন ব্যাংক ব্যবস্থাপনা</h1>
                <p className="text-xs sm:text-sm text-gray-600">অধ্যায়ভিত্তিক Google Drive লিংক যোগ করুন</p>
              </div>
            </div>
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        
        {/* Class & Subject Selection */}
        <Card className="border-blue-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              শ্রেণী ও বিষয় নির্বাচন
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">শ্রেণী</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9-10">নবম-দশম শ্রেণী</SelectItem>
                    <SelectItem value="11-12">একাদশ-দ্বাদশ শ্রেণী</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">বিষয়</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chemistry">রসায়ন</SelectItem>
                    <SelectItem value="ict">তথ্য ও যোগাযোগ প্রযুক্তি</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add New Resource Form */}
        <Card className="border-green-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="w-4 h-4" />
              নতুন Google Drive লিংক যোগ করুন
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">অধ্যায় নির্বাচন করুন</label>
                <Select value={selectedChapter} onValueChange={setSelectedChapter}>
                  <SelectTrigger>
                    <SelectValue placeholder="অধ্যায় নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableChapters().map(chapter => (
                      <SelectItem key={chapter} value={chapter}>
                        {chapter}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Google Drive লিংক</label>
                <Input
                  value={googleDriveLink}
                  onChange={(e) => setGoogleDriveLink(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">বিবরণ (ঐচ্ছিক)</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="এই অধ্যায়ের রিসোর্স সম্পর্কে কিছু লিখুন..."
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleSaveResource}
                disabled={saving}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {saving ? (
                  <>
                    <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                    সংরক্ষণ করা হচ্ছে...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    লিংক সংরক্ষণ করুন
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Resources */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                বর্তমান রিসোর্স ({getClassDisplayName(selectedClass)} - {getSubjectName(selectedSubject)})
              </span>
              <Badge variant="outline">{getAvailableChapters().length}টি অধ্যায়</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {getAvailableChapters().map((chapter, index) => {
              const resource = getResourceForChapter(chapter);
              return (
                <div
                  key={chapter}
                  className={`p-3 rounded-lg border ${
                    resource?.google_drive_link 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {chapter}
                      </h4>
                      {resource?.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {resource.description}
                        </p>
                      )}
                      {resource?.google_drive_link ? (
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            Google Drive লিংক যোগ করা হয়েছে
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(resource.google_drive_link, '_blank')}
                            className="h-7 px-3 text-xs"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            দেখুন
                          </Button>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-xs text-gray-500">
                          এখনো যোগ করা হয়নি
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}