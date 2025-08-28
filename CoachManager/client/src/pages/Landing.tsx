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
import { GraduationCap, BookOpen, Users, Award, FlaskConical, Atom, Zap, Cpu, User, UserPlus, Smartphone, MonitorSpeaker, Trophy, Target, Calendar, MessageSquare, CheckCircle, PlayCircle, Monitor } from 'lucide-react';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
import { useAuth } from '@/hooks/useAuth';

// Light chemical compounds for mobile performance
const chemicalCompounds = [
  { 
    formula: 'H₂O', 
    name: 'Water', 
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/20',
    borderColor: 'border-blue-400/50',
    reactsWith: ['HCl'],
    type: 'molecular',
    shape: 'bent'
  },
  { 
    formula: 'CO₂', 
    name: 'Carbon Dioxide', 
    color: 'text-gray-400',
    bgColor: 'bg-gray-400/20',
    borderColor: 'border-gray-400/50',
    reactsWith: ['NaOH'],
    type: 'molecular',
    shape: 'linear'
  },
  { 
    formula: 'NH₃', 
    name: 'Ammonia', 
    color: 'text-green-400',
    bgColor: 'bg-green-400/20',
    borderColor: 'border-green-400/50',
    reactsWith: ['HCl'],
    type: 'molecular',
    shape: 'simple'
  },
  { 
    formula: 'NaCl', 
    name: 'Salt', 
    color: 'text-white',
    bgColor: 'bg-white/20',
    borderColor: 'border-white/50',
    reactsWith: [],
    type: 'ionic',
    shape: 'simple'
  },
  { 
    formula: 'HCl', 
    name: 'Acid', 
    color: 'text-red-400',
    bgColor: 'bg-red-400/20',
    borderColor: 'border-red-400/50',
    reactsWith: ['NaOH'],
    type: 'molecular',
    shape: 'linear'
  },
  { 
    formula: 'NaOH', 
    name: 'Base', 
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/20',
    borderColor: 'border-purple-400/50',
    reactsWith: ['HCl'],
    type: 'ionic',
    shape: 'simple'
  }
];

// Chemical reactions database
const reactions = [
  {
    reactants: ['NaOH', 'HCl'],
    products: ['NaCl', 'H₂O'],
    equation: 'NaOH + HCl → NaCl + H₂O',
    type: 'neutralization'
  },
  {
    reactants: ['Mg(OH)₂', 'HCl'],
    products: ['MgCl₂', 'H₂O'],
    equation: 'Mg(OH)₂ + 2HCl → MgCl₂ + 2H₂O',
    type: 'neutralization'
  },
  {
    reactants: ['CaCO₃', 'HCl'],
    products: ['CaCl₂', 'H₂O', 'CO₂'],
    equation: 'CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂',
    type: 'acid-carbonate'
  },
  {
    reactants: ['NaOH', 'H₂SO₄'],
    products: ['Na₂SO₄', 'H₂O'],
    equation: '2NaOH + H₂SO₄ → Na₂SO₄ + 2H₂O',
    type: 'neutralization'
  }
];

const addStudentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().min(11, 'Phone number must be at least 11 digits'),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
});

type AddStudentData = z.infer<typeof addStudentSchema>;

// Realistic atomic/molecular shape rendering function with electron orbitals
function getMolecularShape(shape: string, compound: any) {
  // Simplified shapes for mobile performance - all compounds use simple circles
  return (
    <div className="relative w-8 h-8">
      <div className={`w-6 h-6 ${compound.bgColor} border ${compound.borderColor} rounded-full shadow-sm flex items-center justify-center`}>
        <span className="text-xs text-white font-bold">{compound.formula}</span>
      </div>
    </div>
  );
}

// Advanced chemical compound component with realistic molecular shapes
function FloatingCompound({ 
  compound, 
  style, 
  isReacting, 
  reactionProducts 
}: { 
  compound: typeof chemicalCompounds[0], 
  style: React.CSSProperties,
  isReacting: boolean,
  reactionProducts?: string[]
}) {
  return (
    <div 
      className={`absolute pointer-events-none transition-all duration-500 opacity-15 ${
        isReacting ? 'animate-bounce scale-125 opacity-35' : 'hover:scale-110'
      }`}
      style={style}
    >
      <div className={`${isReacting ? 'ring-2 ring-white animate-pulse' : ''}`}>
        {getMolecularShape(compound.shape || 'default', compound)}
      </div>
      {isReacting && reactionProducts && (
        <div className="absolute -top-8 left-0 w-full text-center">
          <div className="text-xs text-white bg-black/50 px-2 py-1 rounded animate-pulse">
            →{reactionProducts.join('+')}
          </div>
        </div>
      )}
    </div>
  );
}

// Reaction explosion effect component
function ReactionEffect({ x, y, equation }: { x: number, y: number, equation: string }) {
  return (
    <div 
      className="absolute pointer-events-none z-20"
      style={{ left: x - 50, top: y - 25 }}
    >
      <div className="relative">
        {/* Explosion effect */}
        <div className="absolute inset-0 w-24 h-12 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full animate-ping opacity-75"></div>
        <div className="absolute inset-0 w-20 h-10 bg-gradient-to-r from-white via-yellow-300 to-orange-400 rounded-full animate-pulse"></div>
        
        {/* Chemical equation */}
        <div className="absolute -top-12 left-0 w-32 text-center">
          <div className="text-xs text-white bg-black/75 px-2 py-1 rounded-lg font-mono backdrop-blur-sm">
            {equation}
          </div>
        </div>
        
        {/* Sparks effect */}
        <div className="absolute top-2 left-2 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
        <div className="absolute top-6 left-16 w-1 h-1 bg-orange-400 rounded-full animate-ping delay-100"></div>
        <div className="absolute top-1 left-12 w-1 h-1 bg-red-400 rounded-full animate-ping delay-200"></div>
      </div>
    </div>
  );
}

export default function Landing() {
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [floatingCompounds, setFloatingCompounds] = useState<Array<{ 
    compound: typeof chemicalCompounds[0], 
    x: number, 
    y: number, 
    vx: number, 
    vy: number, 
    id: number,
    isReacting: boolean,
    reactionProducts?: string[]
  }>>([]);
  const [reactionEffects, setReactionEffects] = useState<Array<{
    id: number,
    x: number,
    y: number,
    equation: string,
    timestamp: number
  }>>([]);

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

  // Initialize floating chemical compounds
  useEffect(() => {
    const compounds = Array.from({ length: 8 }, (_, i) => {
      // Select compounds for light animation
      const availableCompounds = chemicalCompounds;
      return {
        compound: availableCompounds[Math.floor(Math.random() * availableCompounds.length)],
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        id: i,
        isReacting: false
      };
    });
    setFloatingCompounds(compounds);
  }, []);

  // Burst system - add new elements every 5 seconds
  useEffect(() => {
    
    const burstInterval = setInterval(() => {
      setFloatingCompounds(prev => {
        // Add 1-2 new elements per burst for mobile performance
        const burstCount = Math.floor(Math.random() * 2) + 1;
        const newCompounds = Array.from({ length: burstCount }, (_, i) => ({
          compound: chemicalCompounds[Math.floor(Math.random() * chemicalCompounds.length)],
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          id: Date.now() + i,
          isReacting: false
        }));
        
        // Limit total elements for mobile performance (max 12)
        const allCompounds = [...prev, ...newCompounds];
        return allCompounds.length > 12 ? allCompounds.slice(-12) : allCompounds;
      });
    }, 8000); // Every 8 seconds

    return () => clearInterval(burstInterval);
  }, []);

  // Advanced animation with collision detection and chemical reactions
  useEffect(() => {
    
    const animate = () => {
      setFloatingCompounds(prev => {
        const updatedCompounds = prev.map(compound => {
          let newX = compound.x + compound.vx;
          let newY = compound.y + compound.vy;
          let newVx = compound.vx;
          let newVy = compound.vy;

          // Bounce off edges
          if (newX <= 0 || newX >= window.innerWidth - 80) {
            newVx = -newVx;
            newX = Math.max(0, Math.min(window.innerWidth - 80, newX));
          }
          if (newY <= 0 || newY >= window.innerHeight - 48) {
            newVy = -newVy;
            newY = Math.max(0, Math.min(window.innerHeight - 48, newY));
          }

          return { ...compound, x: newX, y: newY, vx: newVx, vy: newVy, isReacting: false };
        });

        // Check for collisions and reactions
        for (let i = 0; i < updatedCompounds.length; i++) {
          for (let j = i + 1; j < updatedCompounds.length; j++) {
            const comp1 = updatedCompounds[i];
            const comp2 = updatedCompounds[j];
            
            const dx = comp1.x - comp2.x;
            const dy = comp1.y - comp2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Check if compounds are close enough to react (collision distance)
            if (distance < 60) {
              // Check if these compounds can react with each other
              const reaction = reactions.find(r => 
                (r.reactants.includes(comp1.compound.formula) && r.reactants.includes(comp2.compound.formula))
              );
              
              if (reaction) {
                // Mark compounds as reacting
                updatedCompounds[i] = { 
                  ...comp1, 
                  isReacting: true, 
                  reactionProducts: reaction.products 
                };
                updatedCompounds[j] = { 
                  ...comp2, 
                  isReacting: true, 
                  reactionProducts: reaction.products 
                };
                
                // Create reaction effect
                const effectX = (comp1.x + comp2.x) / 2;
                const effectY = (comp1.y + comp2.y) / 2;
                
                setReactionEffects(prevEffects => [
                  ...prevEffects,
                  {
                    id: Date.now() + Math.random(),
                    x: effectX,
                    y: effectY,
                    equation: reaction.equation,
                    timestamp: Date.now()
                  }
                ]);

                // Apply collision physics (compounds bounce off each other)
                const angle = Math.atan2(dy, dx);
                const force = 0.5;
                updatedCompounds[i].vx += Math.cos(angle) * force;
                updatedCompounds[i].vy += Math.sin(angle) * force;
                updatedCompounds[j].vx -= Math.cos(angle) * force;
                updatedCompounds[j].vy -= Math.sin(angle) * force;
              }
            }
          }
        }

        return updatedCompounds;
      });

      // Clean up old reaction effects
      setReactionEffects(prev => prev.filter(effect => 
        Date.now() - effect.timestamp < 3000 // Remove effects after 3 seconds
      ));
    };

    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, []);


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
      {/* Animated floating chemical compounds */}
      {floatingCompounds.map(({ compound, x, y, id, isReacting, reactionProducts }, index) => (
        <FloatingCompound
          key={`compound-${compound.formula}-${id}-${index}-${Date.now()}`}
          compound={compound}
          isReacting={isReacting}
          reactionProducts={reactionProducts}
          style={{
            left: `${x}px`,
            top: `${y}px`,
            transition: 'all 0.05s linear',
          }}
        />
      ))}

      {/* Chemical reaction effects */}
      {reactionEffects.map(({ id, x, y, equation }) => (
        <ReactionEffect
          key={`reaction-${id}`}
          x={x}
          y={y}
          equation={equation}
        />
      ))}

      {/* Light geometric shapes for mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-16 h-16 border border-cyan-400/20 rounded-full opacity-30"></div>
        <div className="absolute bottom-32 right-1/4 w-12 h-12 border border-purple-400/20 rounded-lg opacity-30"></div>
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
            <div className="w-32 h-32 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
              <div className="flex space-x-2">
                <Atom className="text-white text-3xl animate-spin" />
                <Cpu className="text-white text-3xl" />
              </div>
            </div>
            <h1 className="text-7xl font-bold text-white mb-6 tracking-tight" data-testid="hero-title">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Chemistry & ICT Care
              </span>
            </h1>
            <h2 className="text-3xl font-semibold text-cyan-300 mb-4">by Belal Sir</h2>
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
                    <Atom className="w-6 h-6 text-purple-400" />
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
