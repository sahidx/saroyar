import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, BookOpen, ExternalLink, FolderOpen, ChevronRight } from 'lucide-react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
// Updated NCTB Chapter structure from official curriculum
const CHAPTER_STRUCTURE = {
  '9-10': {
    chemistry: [
      'রসায়নের ধারণা',
      'পদার্থের গঠন',
      'পরমাণুর গঠন',
      'পর্যায় সারণী ও মৌলের পর্যায়বৃত্ত ধর্ম',
      'রাসায়নিক বন্ধন',
      'রাসায়নিক বিক্রিয়া',
      'মোলের ধারণা ও রাসায়নিক গণনা',
      'অম্ল, ক্ষার ও লবণ',
      'খনিজ সম্পদ: ধাতু ও অধাতু',
      'বিদ্যুৎ ও রসায়ন (তড়িৎ রসায়ন)',
      'আমাদের জীবনে রসায়ন'
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
      // 1st Paper
      'ল্যাবরেটরির নিরাপদ ব্যবহার',
      'গুণগত রসায়ন',
      'মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন',
      'রাসায়নিক পরিবর্তন',
      'কর্মমুখী রসায়ন',
      // 2nd Paper
      'পরিবেশ রসায়ন',
      'জৈব রসায়ন',
      'পরিমাণগত রসায়ন',
      'তড়িৎ রসায়ন',
      'অর্থনৈতিক রসায়ন'
    ],
    ict: [
      'তথ্য ও যোগাযোগ প্রযুক্তি — বিশ্ব ও বাংলাদেশের প্রেক্ষাপটে',
      'কমিউনিকেশন সিস্টেম ও কম্পিউটার নেটওয়ার্কিং',
      'সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস',
      'ওয়েব ডিজাইন পরিচিতি ও HTML',
      'প্রোগ্রামিং ভাষার ভিত্তি',
      'ডেটাবেজ ম্যানেজমেন্ট সিস্টেম'
    ]
  }
};

interface ChapterResource {
  id: string;
  class_level: string;
  subject: string;
  chapter_name: string;
  google_drive_link: string;
  description: string;
  created_at: string;
}

export default function StudentQuestionBank() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [resources, setResources] = useState<ChapterResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  useEffect(() => {
    fetchResources();
  }, [selectedClass, selectedSubject]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedClass) params.append('class_level', selectedClass);
      if (selectedSubject) params.append('subject', selectedSubject);
      
      const response = await fetch(`/api/chapter-resources?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
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

  const handleOpenDriveLink = (resource: ChapterResource) => {
    window.open(resource.google_drive_link, '_blank');
    toast({
      title: "Google Drive লিংক",
      description: `${resource.chapter_name} এর রিসোর্স খোলা হচ্ছে...`,
    });
  };

  const getSubjectName = (subject: string) => {
    return subject === 'chemistry' ? 'রসায়ন' : 'তথ্য ও যোগাযোগ প্রযুক্তি';
  };

  const getClassDisplayName = (classLevel: string) => {
    return classLevel === '9-10' ? 'নবম-দশম শ্রেণী' : 'একাদশ-দ্বাদশ শ্রেণী';
  };

  // Get available chapters for current selection
  const getAvailableChapters = () => {
    if (!selectedClass || !selectedSubject) return [];
    
    return CHAPTER_STRUCTURE[selectedClass as keyof typeof CHAPTER_STRUCTURE]?.[selectedSubject as 'chemistry' | 'ict'] || [];
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
                মোট {resources.length}টি
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        
        {/* Filters */}
        <Card className="border-blue-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              শ্রেণী ও বিষয় নির্বাচন করুন
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Class Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">শ্রেণী</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="শ্রেণী নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9-10">নবম-দশম শ্রেণী</SelectItem>
                    <SelectItem value="11-12">একাদশ-দ্বাদশ শ্রেণী</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subject Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">বিষয়</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="বিষয় নির্বাচন করুন" />
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

        {/* Show selection status */}
        {selectedClass && selectedSubject && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-white">
                    {getClassDisplayName(selectedClass)}
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <Badge variant="outline" className="bg-white">
                    {getSubjectName(selectedSubject)}
                  </Badge>
                </div>
                <div className="text-sm text-green-600 font-medium">
                  {resources.length}টি অধ্যায় পাওয়া গেছে
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resources List */}
        <div className="space-y-4">
          {!selectedClass || !selectedSubject ? (
            <Card className="border-gray-200">
              <CardContent className="py-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">প্রথমে শ্রেণী ও বিষয় নির্বাচন করুন</p>
                <p className="text-sm text-gray-500 mt-2">তারপর আপনার প্রয়োজনীয় অধ্যায়ের রিসোর্স দেখুন</p>
              </CardContent>
            </Card>
          ) : resources.length === 0 ? (
            <Card className="border-gray-200">
              <CardContent className="py-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">এই শ্রেণী ও বিষয়ের জন্য কোনো রিসোর্স পাওয়া যায়নি</p>
                <p className="text-sm text-gray-500 mt-2">শীঘ্রই আরো রিসোর্স যোগ করা হবে</p>
              </CardContent>
            </Card>
          ) : (
            resources.map((resource) => (
              <Card key={resource.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base font-semibold text-gray-900 mb-2">
                        {resource.chapter_name}
                      </CardTitle>
                      {resource.description && (
                        <p className="text-sm text-gray-600 mb-3">
                          {resource.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {getClassDisplayName(resource.class_level)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getSubjectName(resource.subject)}
                        </Badge>
                        <Badge className="text-xs bg-green-100 text-green-800">
                          Google Drive
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={() => handleOpenDriveLink(resource)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Google Drive এ দেখুন
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Stats */}
        {resources.length > 0 && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="py-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">{resources.length}</div>
                <div className="text-sm text-green-600">অধ্যায়ের রিসোর্স উপলব্ধ</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}