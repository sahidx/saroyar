import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import MobileWrapper from '@/components/MobileWrapper';
import { 
  ArrowLeft, 
  Facebook,
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Award,
  Code,
  GraduationCap,
  BookOpen,
  FlaskConical,
  Monitor,
  Heart,
  Building2,
  Target,
  Eye
} from 'lucide-react';
import { useLocation } from 'wouter';

export default function StudentDeveloper() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  const skills = [
    { name: 'Cyber Security Expert', icon: Building2, color: 'bg-red-500' },
    { name: 'Bug Bounty Hunter', icon: Target, color: 'bg-orange-500' },
    { name: 'Web Development', icon: Code, color: 'bg-purple-500' },
    { name: 'React', icon: Code, color: 'bg-cyan-500' },
    { name: 'TypeScript', icon: Code, color: 'bg-blue-600' },
    { name: 'Educational Technology', icon: BookOpen, color: 'bg-green-500' }
  ];

  const achievements = [
    { title: 'Founder & CEO of Praggo', year: '2020-Present', icon: Award },
    { title: 'Civil Engineering Student', year: '2021-Present', icon: GraduationCap },
    { title: 'Cyber Security Expert', year: '2019-Present', icon: Target },
    { title: 'Bug Bounty Hunter', year: '2020-Present', icon: Award },
    { title: 'Doubt Solver at ACS', year: '2022-Present', icon: BookOpen }
  ];

  const praggoServices = [
    { name: 'Praggo Civil Engineering Firm & Interior', icon: Building2 },
    { name: 'Praggo IT', icon: Monitor },
    { name: 'Praggo Academy', icon: GraduationCap },
    { name: 'Praggo Study Abroad', icon: BookOpen },
    { name: 'Praggo Ad Agency', icon: Target },
    { name: 'Praggo Agro & Properties', icon: Heart }
  ];

  return (
    <MobileWrapper>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation('/student')}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  data-testid="back-button"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Code className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-lg font-bold text-gray-800">About Developer</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 py-6 space-y-6">
          
          {/* Profile Card */}
          <Card className="border-2 border-blue-200 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-24 h-24 rounded-full mb-4 shadow-lg overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">SR</span>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">Md Sahid Rahman</CardTitle>
              <CardDescription className="text-lg text-purple-600 font-medium">
                Founder & CEO of Praggo • Civil Engineering Student
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Education</p>
                    <p className="text-sm text-gray-600">B.Sc in Civil Engineering (Ongoing)</p>
                    <p className="text-xs text-gray-500">Gopalganj Science and Technology University</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Location</p>
                    <p className="text-sm text-gray-600">Gopalganj, Bangladesh</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Position</p>
                    <p className="text-sm text-gray-600">Founder & CEO of Praggo</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About Section */}
          <Card className="border-2 border-purple-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Heart className="w-5 h-5" />
                About Me
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  আমি মোঃ সাহিদ রহমান, প্রাগো গ্রুপের প্রতিষ্ঠাতা ও প্রধান নির্বাহী কর্মকর্তা। আমি একজন সাইবার সিকিউরিটি এক্সপার্ট এবং বাগ বাউন্টি হান্টার। আমি গোপালগঞ্জ বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয় থেকে সিভিল ইঞ্জিনিয়ারিং অধ্যয়নরত আছি।
                </p>
                
                <p className="text-gray-700 leading-relaxed">
                  আমি ACS-এ একজন সন্দেহ নিরসনকারী হিসেবে কাজ করি এবং ছাত্র-ছাত্রীদের শিক্ষায় সহায়তা করি। প্রযুক্তি ও সাইবার নিরাপত্তার মাধ্যমে আমি শিক্ষা ক্ষেত্রে অবদান রাখতে চাই।
                </p>

                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                  <p className="text-purple-800 font-medium italic">
                    "উদ্ভাবন ও প্রযুক্তির মাধ্যমে আমরা একটি উন্নত ভবিষ্যৎ গড়তে পারি।"
                  </p>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 gap-3 mt-4">
                  <a 
                    href="https://www.facebook.com/share/16qPLuCvu8/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Facebook className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-700 font-medium">Facebook Profile</span>
                  </a>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Mail className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">sahidrahmanx@gmail.com</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills Section */}
          <Card className="border-2 border-purple-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Code className="w-5 h-5" />
                Skills & Expertise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {skills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 ${skill.color} rounded-lg flex items-center justify-center`}>
                      <skill.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Praggo Group Services */}
          <Card className="border-2 border-indigo-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700">
                <Building2 className="w-5 h-5" />
                Our Concern - Praggo Group
              </CardTitle>
              <CardDescription>
                Multiple business divisions under Praggo umbrella
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {praggoServices.map((service, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                      <service.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{service.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements Section */}
          <Card className="border-2 border-orange-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Award className="w-5 h-5" />
                Achievements & Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-orange-50 rounded-lg">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                      <achievement.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{achievement.title}</h3>
                      <p className="text-sm text-orange-600 font-medium">{achievement.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tech Stack Used */}
          <Card className="border-2 border-cyan-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-700">
                <Monitor className="w-5 h-5" />
                This App Was Built With
              </CardTitle>
              <CardDescription>
                Technologies used to create this learning platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'TailwindCSS', 'Express.js'].map((tech) => (
                  <Badge key={tech} variant="outline" className="justify-center p-2 border-cyan-300 text-cyan-700">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mission & Vision */}
          <Card className="border-2 border-purple-200 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Target className="w-5 h-5" />
                Our Mission & Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Mission */}
                <div className="bg-gradient-to-r from-purple-100 to-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    <h3 className="font-bold text-purple-800">Mission</h3>
                  </div>
                  <p className="text-purple-700 leading-relaxed">
                    প্রযুক্তি ও উদ্ভাবনের মাধ্যমে শিক্ষা, নির্মাণ, কৃষি এবং ব্যবসায়িক ক্ষেত্রে গুণগত সেবা প্রদান করে সমাজের উন্নয়নে অবদান রাখা এবং দেশের অর্থনৈতিক প্রগতিতে ভূমিকা পালন করা।
                  </p>
                </div>

                {/* Vision */}
                <div className="bg-gradient-to-r from-indigo-100 to-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-indigo-800">Vision</h3>
                  </div>
                  <p className="text-indigo-700 leading-relaxed">
                    ২০৩০ সালের মধ্যে বাংলাদেশের একটি নেতৃস্থানীয় বহুমুখী প্রতিষ্ঠান হিসেবে প্রাগো গ্রুপকে প্রতিষ্ঠিত করা, যা শিক্ষা, প্রযুক্তি, নির্মাণ এবং কৃষিতে আন্তর্জাতিক মানের সেবা প্রদান করবে।
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message for Students */}
          <Card className="border-2 border-rose-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-rose-700">
                <Heart className="w-5 h-5" />
                Message for Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-lg">
                  <p className="text-gray-800 leading-relaxed">
                    প্রিয় ছাত্র-ছাত্রীরা, শিক্ষাই জাতির মেরুদণ্ড। আমাদের এই ডিজিটাল প্ল্যাটফর্মের মাধ্যমে তোমরা আধুনিক শিক্ষা পদ্ধতিতে রসায়ন ও আইসিটি বিষয়ে জ্ঞান অর্জন করতে পারবে।
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-purple-800 font-medium text-center">
                    🚀 স্বপ্ন দেখো, কাজ করো, সফল হও! 💫
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Footer */}
          <div className="text-center py-6 text-gray-500 text-sm">
            <p>Made with ❤️ by Md Sahid Rahman - Founder & CEO, Praggo Group</p>
            <p className="mt-1">Chemistry & ICT Care • 2025</p>
          </div>
        </div>
      </div>
    </MobileWrapper>
  );
}