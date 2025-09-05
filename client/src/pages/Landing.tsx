import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { GraduationCap, BookOpen, Users, Award, FlaskConical, Zap, Cpu, User, UserPlus, Smartphone, MonitorSpeaker, Trophy, Target, Calendar, MessageSquare, CheckCircle, PlayCircle, Monitor } from 'lucide-react';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
import { useAuth } from '@/hooks/useAuth';


const addStudentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().min(11, 'Phone number must be at least 11 digits'),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
});

type AddStudentData = z.infer<typeof addStudentSchema>;


export default function Landing() {
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);

  // Fetch courses from API
  const { data: courses = [], isLoading: coursesLoading } = useQuery<any[]>({
    queryKey: ["/api/courses"],
  });

  // Fetch teacher profiles for displaying on landing page  
  const { data: teacherProfiles } = useQuery<any[]>({
    queryKey: ["/api/teacher-profiles"],
  });

  // Get Belal Sir's profile for display
  const belalSirProfile = teacherProfiles?.[0];

  // Profile Picture Component for Landing Page
  const ProfilePicture = () => {
    if (belalSirProfile?.avatarUrl) {
      return (
        <img 
          src={belalSirProfile.avatarUrl} 
          alt="Belal Sir Profile" 
          className="w-48 h-48 object-cover rounded-full"
          onError={(e) => {
            // Fallback to initials if image fails to load
            const target = e.currentTarget;
            const parent = target.parentElement;
            if (parent) {
              target.style.display = 'none';
              const initialsDiv = parent.querySelector('.initials-fallback') as HTMLElement;
              if (initialsDiv) {
                initialsDiv.style.display = 'flex';
              }
            }
          }}
        />
      );
    }
    
    // Fallback to User icon and initials
    return (
      <>
        <User className="w-24 h-24 text-white initials-fallback" />
        <div className="initials-fallback absolute inset-0 flex items-center justify-center text-6xl font-bold text-white hidden">
          B
        </div>
      </>
    );
  };

  // Helper function to get icon based on iconName
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "FlaskConical": return FlaskConical;
      case "Monitor": return Monitor;
      case "BookOpen": return BookOpen;
      case "GraduationCap": return GraduationCap;
      default: return FlaskConical;
    }
  };

  // Helper function to get color classes based on colorScheme
  const getColorClasses = (colorScheme: string) => {
    switch (colorScheme) {
      case "cyan": return {
        cardBg: "from-cyan-500/10 to-blue-500/10",
        cardBorder: "border-cyan-400/30 hover:border-cyan-400/60",
        iconBg: "from-cyan-400 to-blue-500",
        titleColor: "text-cyan-300"
      };
      case "purple": return {
        cardBg: "from-purple-500/10 to-indigo-500/10",
        cardBorder: "border-purple-400/30 hover:border-purple-400/60",
        iconBg: "from-purple-400 to-indigo-500",
        titleColor: "text-purple-300"
      };
      case "green": return {
        cardBg: "from-green-500/10 to-emerald-500/10",
        cardBorder: "border-green-400/30 hover:border-green-400/60",
        iconBg: "from-green-400 to-emerald-500",
        titleColor: "text-green-300"
      };
      case "yellow": return {
        cardBg: "from-yellow-500/10 to-orange-500/10",
        cardBorder: "border-yellow-400/30 hover:border-yellow-400/60",
        iconBg: "from-yellow-400 to-orange-500",
        titleColor: "text-yellow-300"
      };
      case "red": return {
        cardBg: "from-red-500/10 to-rose-500/10",
        cardBorder: "border-red-400/30 hover:border-red-400/60",
        iconBg: "from-red-400 to-rose-500",
        titleColor: "text-red-300"
      };
      case "blue": return {
        cardBg: "from-blue-500/10 to-indigo-500/10",
        cardBorder: "border-blue-400/30 hover:border-blue-400/60",
        iconBg: "from-blue-400 to-indigo-500",
        titleColor: "text-blue-300"
      };
      default: return {
        cardBg: "from-cyan-500/10 to-blue-500/10",
        cardBorder: "border-cyan-400/30 hover:border-cyan-400/60",
        iconBg: "from-cyan-400 to-blue-500",
        titleColor: "text-cyan-300"
      };
    }
  };



  const addStudentForm = useForm<AddStudentData>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: { firstName: '', lastName: '', phoneNumber: '', email: '' },
  });






  const handleAddStudent = (data: AddStudentData) => {
    // TODO: Implement add student functionality
    const generatedPassword = Math.random().toString(36).slice(-8);
    console.log('Add student:', { ...data, generatedPassword });
    alert(`Student added! Generated password: ${generatedPassword}`);
    addStudentForm.reset();
    setIsAddStudentModalOpen(false);
  };

  // This component will only render when user is NOT authenticated
  // Authentication redirection is handled by App.tsx

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Simple static background elements - no animation for fast loading */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-1/4 left-1/4 w-8 h-8 border border-cyan-400/40 rounded-full"></div>
        <div className="absolute bottom-1/3 right-1/3 w-6 h-6 border border-purple-400/40 rounded-lg"></div>
        <div className="absolute top-1/2 right-1/4 w-4 h-4 border border-blue-400/40 rounded-full"></div>
      </div>

      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                <FlaskConical className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Chemistry & ICT Care</h1>
                <p className="text-sm text-cyan-300">by Belal Sir</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={() => window.location.href = '/login'}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
                data-testid="login-button"
              >
                <User className="responsive-icon mr-2" />
                Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <div className="flex space-x-1">
                <FlaskConical className="text-white w-8 h-8" />
                <Cpu className="text-white w-8 h-8" />
              </div>
            </div>
            <h1 className="text-7xl font-bold text-white mb-6 tracking-tight" data-testid="hero-title">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Chemistry & ICT Care
              </span>
            </h1>
            <h2 className="text-3xl font-semibold text-cyan-300 mb-4">by Belal Sir</h2>
            <div className="text-2xl font-bold text-white mb-6 opacity-90">
              কেমিস্ট্রি অ্যান্ড আইসিটি কেয়ার বেলাল স্যার
            </div>
            <p className="text-xl text-blue-200 mb-8 max-w-4xl mx-auto" data-testid="hero-subtitle">
              Unlock the mysteries of Chemistry and master Information & Communication Technology 
              with cutting-edge scientific education and personalized guidance
            </p>
          </div>

          <div className="flex justify-center space-x-6 mb-12">
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-6">
              <FlaskConical className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <p className="text-cyan-300 font-semibold">Advanced Chemistry</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 backdrop-blur-sm border border-purple-400/30 rounded-lg p-6">
              <Cpu className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-purple-300 font-semibold">Modern ICT</p>
            </div>
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg p-6">
              <Zap className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-green-300 font-semibold">Interactive Learning</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-blue-200 text-lg mb-4">Ready to start your scientific journey?</p>
            <p className="text-cyan-300">Please login using the buttons below</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4" data-testid="features-title">
              আমাদের কোর্স সমূহ
            </h2>
            <p className="text-xl text-blue-200">
              রসায়ন ও তথ্য প্রযুক্তিতে বিশেষজ্ঞ শিক্ষা
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coursesLoading ? (
              // Loading skeleton for courses
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="bg-gradient-to-br from-gray-500/10 to-gray-600/10 backdrop-blur-sm border border-gray-400/30 animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="w-14 h-14 bg-gray-400/50 rounded-xl mx-auto mb-3"></div>
                    <div className="h-6 bg-gray-400/50 rounded mx-auto w-3/4"></div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-20 bg-gray-400/50 rounded-lg"></div>
                  </CardContent>
                </Card>
              ))
            ) : courses.length > 0 ? (
              // Dynamic course cards from database
              courses
                .filter(course => course.isActive)
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((course) => {
                  const IconComponent = getIcon(course.iconName);
                  const colorClasses = getColorClasses(course.colorScheme);
                  
                  return (
                    <Card 
                      key={course.id} 
                      className={`bg-gradient-to-br ${colorClasses.cardBg} backdrop-blur-sm border ${colorClasses.cardBorder} transition-all duration-300 hover:scale-105`}
                      data-testid={`course-card-${course.id}`}
                    >
                      <CardHeader className="pb-3">
                        <div className={`w-14 h-14 bg-gradient-to-r ${colorClasses.iconBg} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                          <IconComponent className="text-white w-7 h-7" />
                        </div>
                        <CardTitle className={`${colorClasses.titleColor} text-center text-lg`}>
                          {course.titleBangla}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <CardDescription className="text-gray-900 text-center text-sm font-bold bg-white/90 p-3 rounded-lg">
                          {course.description}
                        </CardDescription>
                        {course.targetClass && (
                          <div className="mt-2 text-center">
                            <span className={`inline-block px-2 py-1 text-xs rounded-full bg-white/20 ${colorClasses.titleColor}`}>
                              শ্রেণী: {course.targetClass}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
            ) : (
              // No courses available
              <div className="col-span-full text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">কোন কোর্স পাওয়া যায়নি</h3>
                <p className="text-gray-300">শীঘ্রই নতুন কোর্স যোগ করা হবে।</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-sm border border-cyan-400/30 rounded-2xl p-12">
            <h2 className="text-4xl font-bold text-white mb-4" data-testid="cta-title">
              Ready to Master Science & Technology?
            </h2>
            <p className="text-xl text-gray-100 mb-8 font-medium">
              Join Belal Sir's advanced coaching program and excel in Chemistry & ICT
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => window.location.href = '/login'}
                size="lg" 
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 px-8 py-4 text-lg"
                data-testid="cta-student-login-button"
              >
                Student Login
              </Button>
              <Button 
                onClick={() => window.location.href = '/login'}
                size="lg" 
                variant="outline" 
                className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black px-8 py-4 text-lg"
                data-testid="cta-teacher-login-button"
              >
                Teacher Login
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* Public Profile Section */}
      <section className="bg-gradient-to-r from-slate-800/80 via-blue-900/80 to-indigo-900/80 backdrop-blur-sm border-t border-white/10 py-16 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Meet Our Founder</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="w-48 h-48 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center border-4 border-white/20 shadow-xl overflow-hidden">
                  <ProfilePicture />
                </div>
              </div>
              
              {/* Profile Information */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-4xl font-bold text-white mb-4">Belal Sir</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <GraduationCap className="w-6 h-6 text-cyan-400" />
                    <span className="text-lg text-gray-200">Graduate from <span className="font-semibold text-cyan-300">Rajshahi University</span></span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <BookOpen className="w-6 h-6 text-green-400" />
                    <span className="text-lg text-gray-200">Teacher at <span className="font-semibold text-green-300">Jahangirpur Girls School and College</span></span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <FlaskConical className="w-6 h-6 text-purple-400" />
                    <span className="text-lg text-gray-200">Specialist in <span className="font-semibold text-purple-300">Chemistry & ICT</span></span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <Award className="w-6 h-6 text-yellow-400" />
                    <span className="text-lg text-gray-200">Dedicated to <span className="font-semibold text-yellow-300">Excellence in Education</span></span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-black/20 rounded-lg border border-white/10">
                  <p className="text-gray-300 italic text-lg leading-relaxed">
                    "With years of experience in Chemistry and ICT education, I am committed to providing students with the knowledge and skills they need to excel in their academic journey. My goal is to make complex scientific concepts accessible and engaging for every student."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-black/50 backdrop-blur-sm border-t border-white/10 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                <FlaskConical className="text-white" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-white">Chemistry & ICT Care by Belal Sir</p>
                <p className="text-sm text-cyan-300">Excellence in Scientific Education</p>
              </div>
            </div>
            
            {/* Copyright Information */}
            <div className="text-center border-t border-white/10 pt-4 mt-4 w-full">
              <p className="text-sm text-gray-300">
                © 2025 All Rights Reserved | Created by{' '}
                <a 
                  href="https://www.facebook.com/share/17MW5DRtR7/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 font-medium underline transition-colors duration-200"
                  data-testid="developer-link"
                >
                  Sahid Rahman
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>


      {/* Add Student Modal */}
      <Dialog open={isAddStudentModalOpen} onOpenChange={setIsAddStudentModalOpen}>
        <DialogContent className="max-w-md bg-gray-800 border border-emerald-400/50 text-white shadow-2xl" aria-describedby="add-student-description">
          <DialogHeader>
            <DialogTitle className="text-emerald-300 text-xl font-bold">Add New Student</DialogTitle>
            <p id="add-student-description" className="text-gray-200 text-sm">
              Add a new student to the system. A password will be automatically generated.
            </p>
          </DialogHeader>
          
          <Form {...addStudentForm}>
            <form onSubmit={addStudentForm.handleSubmit(handleAddStudent)} className="space-y-4">
              <FormField
                control={addStudentForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-emerald-300">First Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter first name" 
                        {...field} 
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-emerald-400"
                        data-testid="input-first-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addStudentForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-emerald-300">Last Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter last name" 
                        {...field} 
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-emerald-400"
                        data-testid="input-last-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addStudentForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-emerald-300">Phone Number (will be used as ID)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter phone number" 
                        {...field} 
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-emerald-400"
                        data-testid="input-student-phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addStudentForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cyan-300">Email (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="Enter email address" 
                        {...field} 
                        className="bg-slate-800 border-slate-600 text-white"
                        data-testid="input-student-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                data-testid="add-student-submit"
              >
                Add Student & Generate Password
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
