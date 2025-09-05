import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import MobileWrapper from '@/components/MobileWrapper';
import { 
  ArrowLeft, 
  Github, 
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
  Heart
} from 'lucide-react';
import { useLocation } from 'wouter';

export default function StudentDeveloper() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  const skills = [
    { name: 'Chemistry', icon: FlaskConical, color: 'bg-green-500' },
    { name: 'ICT', icon: Monitor, color: 'bg-blue-500' },
    { name: 'Web Development', icon: Code, color: 'bg-purple-500' },
    { name: 'React', icon: Code, color: 'bg-cyan-500' },
    { name: 'TypeScript', icon: Code, color: 'bg-blue-600' },
    { name: 'Educational Technology', icon: BookOpen, color: 'bg-orange-500' }
  ];

  const achievements = [
    { title: 'Chemistry & ICT Educator', year: '2020-Present', icon: GraduationCap },
    { title: 'Coaching Center Founder', year: '2022', icon: Award },
    { title: 'Full Stack Developer', year: '2019-Present', icon: Code },
    { title: 'Educational App Creator', year: '2023', icon: Monitor }
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
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <span className="text-2xl font-bold text-white">BS</span>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">Belal Sir</CardTitle>
              <CardDescription className="text-lg text-blue-600 font-medium">
                Chemistry & ICT Teacher • Full Stack Developer
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Education</p>
                    <p className="text-sm text-gray-600">Chemistry & Computer Science</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Location</p>
                    <p className="text-sm text-gray-600">Bangladesh</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Teaching Experience</p>
                    <p className="text-sm text-gray-600">5+ Years</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About Section */}
          <Card className="border-2 border-green-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Heart className="w-5 h-5" />
                About Me
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  আমি বেলাল স্যার, একজন অভিজ্ঞ রসায়ন ও আইসিটি শিক্ষক। আমার লক্ষ্য হলো প্রতিটি ছাত্র-ছাত্রীকে বিজ্ঞানের সৌন্দর্য উপলব্ধি করাতে সাহায্য করা এবং তাদের শিক্ষাগত লক্ষ্য অর্জনে সহায়তা করা।
                </p>
                
                <p className="text-gray-700 leading-relaxed">
                  আমি শুধু একজন শিক্ষক নই, একজন টেকনোলজি প্রেমীও। এই অ্যাপটি আমি নিজেই তৈরি করেছি যাতে আমার ছাত্র-ছাত্রীদের শিক্ষা গ্রহণ আরও সহজ ও আনন্দদায়ক হয়।
                </p>

                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-blue-800 font-medium italic">
                    "শিক্ষা হলো জ্ঞানের আলো যা অন্ধকার দূর করে। আমার স্বপ্ন প্রতিটি ছাত্রের মধ্যে সেই আলো জ্বালানো।"
                  </p>
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

          {/* Contact & Message */}
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
                    প্রিয় ছাত্র-ছাত্রীরা, মনে রাখবেন - কঠিন পরিশ্রম ও ধৈর্যের মাধ্যমেই সাফল্য অর্জন সম্ভব। 
                    রসায়ন ও আইসিটি শেখার পথে যেকোনো সমস্যায় আমি সর্বদা তোমাদের পাশে আছি।
                  </p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 font-medium text-center">
                    📚 সুখী হও, শিখতে থাকো, স্বপ্ন দেখতে থাকো! 🌟
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Footer */}
          <div className="text-center py-6 text-gray-500 text-sm">
            <p>Made with ❤️ by Belal Sir for his beloved students</p>
            <p className="mt-1">Chemistry & ICT Care • 2025</p>
          </div>
        </div>
      </div>
    </MobileWrapper>
  );
}