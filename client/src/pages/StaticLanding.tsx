import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap,
  BookOpen,
  Users,
  Award,
  Smartphone,
  FlaskConical,
  MessageSquare,
  BarChart3
} from 'lucide-react';

export default function StaticLanding() {
  const [, setLocation] = useLocation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400/15 rounded-full blur-xl"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-yellow-500/12 rounded-full blur-xl"></div>
        <div className="absolute bottom-40 right-8 w-12 h-12 bg-blue-400/15 rounded-full blur-lg"></div>
      </div>

      {/* Header */}
      <nav className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-yellow-500 to-amber-500 p-3 rounded-2xl shadow-xl">
            <FlaskConical className="w-8 h-8 text-blue-900" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Student Nursing Center</h1>
            <p className="text-yellow-300 font-semibold">by Golam Sarowar Sir</p>
          </div>
        </div>
        
        <Button 
          onClick={() => setLocation('/login')}
          className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold px-8 py-3 rounded-xl shadow-lg"
        >
          Login
        </Button>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6">
            Excellence in <span className="text-yellow-400">Mathematics & Science</span> Education
          </h2>
          <p className="text-xl text-blue-200 mb-8 max-w-3xl mx-auto">
            Professional coaching center providing comprehensive education in Mathematics and Science 
            with modern teaching methods and personalized attention.
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              onClick={() => setLocation('/login')}
              size="lg" 
              className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-blue-900 font-bold px-8 py-4 rounded-xl shadow-xl text-lg"
            >
              Get Started
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Expert Teaching</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-200 text-center">
                Experienced mathematics and science teachers with proven track records.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Small Batches</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-200 text-center">
                Limited students per batch ensuring personalized attention for everyone.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Performance Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-200 text-center">
                Regular assessments and progress monitoring for optimal results.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Proven Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-200 text-center">
                Consistent success in board exams and competitive tests.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* About Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
            <CardHeader>
              <CardTitle className="text-3xl text-yellow-400 mb-4">About Golam Sarowar Sir</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-blue-200 mb-6">
                An experienced and dedicated mathematics teacher with years of expertise in helping students 
                excel in their academic journey. Known for innovative teaching methods and personalized 
                approach to student success.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">10+</div>
                  <div className="text-blue-200">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">500+</div>
                  <div className="text-blue-200">Students Taught</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">95%</div>
                  <div className="text-blue-200">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subjects Offered */}
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-white mb-8">Subjects We Teach</h3>
          <div className="flex justify-center flex-wrap gap-4">
            <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg py-2 px-6">
              Mathematics
            </Badge>
            <Badge variant="secondary" className="bg-gradient-to-r from-green-500 to-blue-600 text-white text-lg py-2 px-6">
              Physics
            </Badge>
            <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-600 text-white text-lg py-2 px-6">
              Chemistry
            </Badge>
            <Badge variant="secondary" className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-lg py-2 px-6">
              General Science
            </Badge>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 backdrop-blur-lg border-yellow-400/30 text-white max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl text-yellow-400">Ready to Excel?</CardTitle>
              <CardDescription className="text-blue-200 text-lg">
                Join our coaching center and unlock your potential in Mathematics and Science
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setLocation('/login')}
                size="lg"
                className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-blue-900 font-bold px-12 py-4 rounded-xl shadow-xl text-lg"
              >
                <GraduationCap className="w-6 h-6 mr-2" />
                Join Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}