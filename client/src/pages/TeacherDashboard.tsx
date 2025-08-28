import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Bell, 
  FileText, 
  Users, 
  BookOpen, 
  BarChart3, 
  Calendar, 
  Upload,
  Settings,
  LogOut,
  GraduationCap,
  FlaskConical,
  Send,
  Plus,
  Eye,
  Download,
  Moon,
  Sun,
  Sparkles,
  Brain,
  Smartphone,
  CreditCard,
  Phone,
  TrendingUp,
  Award,
  Clock,
  Target,
  CheckCircle,
  PlayCircle,
  PieChart,
  Activity,
  Zap,
  Shield,
  Star,
  Link,
  Trash2,
  Bot,
  Trophy
} from 'lucide-react';
import { BulkSMSComponent } from '@/components/BulkSMSComponent';
import { getTeacherIcons } from '@/components/ResponsiveIconGrid';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

// AI Question Maker Component
interface AIQuestionMakerProps {
  isDarkMode: boolean;
}

function AIQuestionMaker({ isDarkMode }: AIQuestionMakerProps) {
  const [generatedQuestions, setGeneratedQuestions] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const form = useForm({
    defaultValues: {
      subject: '',
      topic: '',
      difficulty: '',
      questionType: '',
      count: 5,
      aiProvider: 'claude'
    }
  });

  const generateQuestionsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/ai/generate-questions', data);
      return await response.json();
    },
    onSuccess: (data) => {
      setGeneratedQuestions(data);
      setIsGenerating(false);
    },
    onError: (error) => {
      console.error('Error generating questions:', error);
      setIsGenerating(false);
    }
  });

  const onSubmit = (data: any) => {
    setIsGenerating(true);
    generateQuestionsMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <Card className={`border ${isDarkMode 
        ? 'bg-slate-800/50 border-cyan-400/30' 
        : 'bg-white border-orange-200'
      }`}>
        <CardHeader>
          <CardTitle className={`flex items-center ${isDarkMode ? 'text-cyan-300' : 'text-orange-800'}`}>
            <Sparkles className="w-5 h-5 mr-2" />
            AI Question Generator
          </CardTitle>
          <CardDescription className={isDarkMode ? 'text-blue-200' : 'text-orange-600'}>
            Generate Chemistry and ICT questions using AI for your exams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={isDarkMode ? 'text-cyan-300' : 'text-gray-700'}>Subject</Label>
                <Select onValueChange={(value) => form.setValue('subject', value)}>
                  <SelectTrigger className={`${isDarkMode 
                    ? 'bg-slate-700 border-cyan-400/30 text-white' 
                    : 'bg-white border-orange-200 text-gray-800'
                  }`}>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="ict">ICT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className={isDarkMode ? 'text-cyan-300' : 'text-gray-700'}>Difficulty</Label>
                <Select onValueChange={(value) => form.setValue('difficulty', value)}>
                  <SelectTrigger className={`${isDarkMode 
                    ? 'bg-slate-700 border-cyan-400/30 text-white' 
                    : 'bg-white border-orange-200 text-gray-800'
                  }`}>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className={isDarkMode ? 'text-cyan-300' : 'text-gray-700'}>Question Type</Label>
                <Select onValueChange={(value) => form.setValue('questionType', value)}>
                  <SelectTrigger className={`${isDarkMode 
                    ? 'bg-slate-700 border-cyan-400/30 text-white' 
                    : 'bg-white border-orange-200 text-gray-800'
                  }`}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">Multiple Choice</SelectItem>
                    <SelectItem value="written">Written</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className={isDarkMode ? 'text-cyan-300' : 'text-gray-700'}>AI Provider</Label>
                <Select onValueChange={(value) => form.setValue('aiProvider', value)} defaultValue="claude">
                  <SelectTrigger className={`${isDarkMode 
                    ? 'bg-slate-700 border-cyan-400/30 text-white' 
                    : 'bg-white border-orange-200 text-gray-800'
                  }`}>
                    <SelectValue placeholder="Select AI" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="claude">Claude (Anthropic)</SelectItem>
                    <SelectItem value="gemini">Gemini (Google)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className={isDarkMode ? 'text-cyan-300' : 'text-gray-700'}>Number of Questions</Label>
                <Input 
                  type="number" 
                  min="1" 
                  max="10" 
                  {...form.register('count', { valueAsNumber: true })}
                  className={`${isDarkMode 
                    ? 'bg-slate-700 border-cyan-400/30 text-white' 
                    : 'bg-white border-orange-200 text-gray-800'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className={isDarkMode ? 'text-cyan-300' : 'text-gray-700'}>Topic</Label>
              <Input 
                placeholder="Enter specific topic (e.g., Organic Chemistry, Database Design)"
                {...form.register('topic')}
                className={`${isDarkMode 
                  ? 'bg-slate-700 border-cyan-400/30 text-white' 
                  : 'bg-white border-orange-200 text-gray-800'
                }`}
              />
            </div>

            <Button 
              type="submit" 
              disabled={isGenerating}
              className={`w-full ${isDarkMode 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600' 
                : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
              } text-white`}
              data-testid="generate-questions-button"
            >
              {isGenerating ? (
                <>
                  <Brain className="w-4 h-4 mr-2 animate-pulse" />
                  {form.watch('aiProvider') === 'gemini' ? 'Gemini' : 'Claude'} is generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate with {form.watch('aiProvider') === 'gemini' ? 'Gemini' : 'Claude'}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Generated Questions Display */}
      {generatedQuestions && (
        <Card className={`border ${isDarkMode 
          ? 'bg-slate-800/50 border-emerald-400/30' 
          : 'bg-white border-green-200'
        }`}>
          <CardHeader>
            <CardTitle className={`flex items-center ${isDarkMode ? 'text-emerald-300' : 'text-green-800'}`}>
              <BookOpen className="w-5 h-5 mr-2" />
              Generated Questions ({generatedQuestions.questions?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedQuestions.questions?.map((question: any, index: number) => (
              <div key={index} className={`p-4 rounded-lg border ${isDarkMode 
                ? 'bg-slate-900/50 border-slate-600' 
                : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={question.type === 'mcq' ? 'default' : 'secondary'}>
                    {question.type === 'mcq' ? 'Multiple Choice' : 'Written'}
                  </Badge>
                  <Badge variant="outline">{question.difficulty}</Badge>
                </div>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Q{index + 1}: {question.question}
                </h4>
                
                {question.options && (
                  <div className="space-y-1 mb-2">
                    {question.options.map((option: string, optIndex: number) => (
                      <div key={optIndex} className={`text-sm ${
                        String.fromCharCode(65 + optIndex) === question.correctAnswer 
                          ? (isDarkMode ? 'text-green-400 font-semibold' : 'text-green-600 font-semibold')
                          : (isDarkMode ? 'text-gray-300' : 'text-gray-600')
                      }`}>
                        {String.fromCharCode(65 + optIndex)}. {option}
                      </div>
                    ))}
                  </div>
                )}
                
                <details className="mt-2">
                  <summary className={`cursor-pointer text-sm ${isDarkMode ? 'text-cyan-300' : 'text-orange-600'}`}>
                    Show Explanation
                  </summary>
                  <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {question.explanation}
                  </p>
                </details>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Bulk SMS Purchase Component
interface BulkSMSPurchaseProps {
  isDarkMode: boolean;
  currentCredits: number;
  onPurchaseSuccess: () => void;
}

function BulkSMSPurchase({ isDarkMode, currentCredits, onPurchaseSuccess }: BulkSMSPurchaseProps) {
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const smsPackages = [
    { name: 'Starter Pack', count: 100, price: 500, description: 'Perfect for small announcements' },
    { name: 'Standard Pack', count: 500, price: 2000, description: 'Good for regular updates' },
    { name: 'Professional Pack', count: 1000, price: 3500, description: 'Best value for frequent communication' },
    { name: 'Premium Pack', count: 2500, price: 8000, description: 'For extensive SMS campaigns' },
  ];

  const purchaseMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/sms/purchase', data);
      return await response.json();
    },
    onSuccess: (data) => {
      setIsProcessing(false);
      onPurchaseSuccess();
      setSelectedPackage(null);
      setPaymentMethod('');
      setPhoneNumber('');
    },
    onError: (error) => {
      console.error('Error purchasing SMS package:', error);
      setIsProcessing(false);
    }
  });

  const handlePurchase = () => {
    if (!selectedPackage || !paymentMethod || !phoneNumber) return;
    
    setIsProcessing(true);
    purchaseMutation.mutate({
      packageName: selectedPackage.name,
      smsCount: selectedPackage.count,
      price: selectedPackage.price,
      paymentMethod,
      phoneNumber
    });
  };

  return (
    <Card className={`${isDarkMode 
      ? 'bg-slate-800/50 border-green-400/30' 
      : 'bg-white border-green-200 shadow-sm'
    }`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
          <Smartphone className="w-5 h-5" />
          Bulk SMS Purchase
        </CardTitle>
        <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          Buy SMS credits to send notifications to students. Current Credits: {currentCredits}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* SMS Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {smsPackages.map((pkg, index) => (
            <div
              key={index}
              onClick={() => setSelectedPackage(pkg)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedPackage?.name === pkg.name
                  ? isDarkMode 
                    ? 'border-green-400 bg-green-900/30' 
                    : 'border-green-500 bg-green-50'
                  : isDarkMode 
                    ? 'border-slate-600 hover:border-green-400/50' 
                    : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {pkg.name}
                </h3>
                <Badge variant="secondary">{pkg.count} SMS</Badge>
              </div>
              <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {pkg.description}
              </p>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>
                ৳{pkg.price}
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                ৳{(pkg.price / pkg.count).toFixed(2)} per SMS
              </div>
            </div>
          ))}
        </div>

        {/* Payment Form */}
        {selectedPackage && (
          <div className="space-y-4 pt-4 border-t border-gray-600">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className={isDarkMode 
                    ? 'bg-slate-900/50 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                  }>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bkash">bKash</SelectItem>
                    <SelectItem value="nagad">Nagad</SelectItem>
                    <SelectItem value="rocket">Rocket</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Your Phone Number</Label>
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className={isDarkMode 
                    ? 'bg-slate-900/50 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300'
                  }
                />
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Purchase Summary
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Package:</span>
                  <span className={isDarkMode ? 'text-white' : 'text-gray-800'}>{selectedPackage.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>SMS Credits:</span>
                  <span className={isDarkMode ? 'text-white' : 'text-gray-800'}>{selectedPackage.count}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Total:</span>
                  <span className={isDarkMode ? 'text-green-300' : 'text-green-600'}>৳{selectedPackage.price}</span>
                </div>
              </div>
            </div>

            <Button 
              onClick={handlePurchase}
              disabled={isProcessing || !paymentMethod || !phoneNumber}
              className={`w-full ${isDarkMode 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isProcessing ? (
                <>
                  <CreditCard className="w-4 h-4 mr-2 animate-pulse" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Purchase {selectedPackage.name}
                </>
              )}
            </Button>

            <p className={`text-xs text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              After clicking purchase, you'll receive payment instructions. Credits will be added after payment confirmation.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Add Student Form Component  
interface AddStudentFormProps {
  isDarkMode: boolean;
  onSubmit: (data: any) => void;
  batches: any[];
  isLoading: boolean;
}

function AddStudentForm({ isDarkMode, onSubmit, batches, isLoading }: AddStudentFormProps) {
  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      parentPhoneNumber: '',
      batchId: '',
      email: '',
      address: '',
      institution: '',
      classLevel: ''
    }
  });

  const handleSubmit = (data: any) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={isDarkMode ? 'text-cyan-300' : 'text-gray-700'}>First Name</FormLabel>
                <FormControl>
                  <Input {...field} className={isDarkMode ? 'bg-slate-700 border-cyan-400/30 text-white' : 'bg-white'} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={isDarkMode ? 'text-cyan-300' : 'text-gray-700'}>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} className={isDarkMode ? 'bg-slate-700 border-cyan-400/30 text-white' : 'bg-white'} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={isDarkMode ? 'text-cyan-300' : 'text-gray-700'}>Phone Number</FormLabel>
              <FormControl>
                <Input {...field} className={isDarkMode ? 'bg-slate-700 border-cyan-400/30 text-white' : 'bg-white'} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parentPhoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={isDarkMode ? 'text-cyan-300' : 'text-gray-700'}>Parent Phone Number</FormLabel>
              <FormControl>
                <Input {...field} className={isDarkMode ? 'bg-slate-700 border-cyan-400/30 text-white' : 'bg-white'} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="batchId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={isDarkMode ? 'text-cyan-300' : 'text-gray-700'}>Batch</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className={isDarkMode ? 'bg-slate-700 border-cyan-400/30 text-white' : 'bg-white'}>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.name} ({batch.batchCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={isDarkMode ? 'text-cyan-300' : 'text-gray-700'}>Email (Optional)</FormLabel>
              <FormControl>
                <Input {...field} type="email" className={isDarkMode ? 'bg-slate-700 border-cyan-400/30 text-white' : 'bg-white'} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="institution"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={isDarkMode ? 'text-cyan-300' : 'text-gray-700'}>Institution</FormLabel>
              <FormControl>
                <Input {...field} placeholder="School/College name" className={isDarkMode ? 'bg-slate-700 border-cyan-400/30 text-white' : 'bg-white'} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="classLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={isDarkMode ? 'text-cyan-300' : 'text-gray-700'}>Class Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className={isDarkMode ? 'bg-slate-700 border-cyan-400/30 text-white' : 'bg-white'}>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="9">Class 9</SelectItem>
                  <SelectItem value="10">Class 10</SelectItem>
                  <SelectItem value="11">Class 11</SelectItem>
                  <SelectItem value="12">Class 12</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={isLoading}
          className={`w-full ${isDarkMode ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-cyan-600 hover:bg-cyan-700'} text-white`}
        >
          {isLoading ? 'Adding Student...' : 'Add Student'}
        </Button>
      </form>
    </Form>
  );
}

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [smsCredits, setSmsCredits] = useState(0);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [studentPassword, setStudentPassword] = useState('');
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  // Fetch real teacher stats instead of hardcoded values
  const { data: teacherStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/teacher/stats'],
    retry: false,
  });

  // Fetch real students data
  const studentsQuery = useQuery({
    queryKey: ['/api/students'],
    retry: false,
  });

  const { data: studentsData, isLoading: studentsLoading } = studentsQuery;

  const batchesQuery = useQuery({
    queryKey: ['/api/batches'],
    retry: false,
  });
  
  const { data: batchesData } = batchesQuery;

  const addStudentMutation = useMutation({
    mutationFn: async (studentData: any) => {
      const response = await apiRequest('POST', '/api/students', studentData);
      return await response.json();
    },
    onSuccess: (data) => {
      setStudentPassword(data.password);
      studentsQuery.refetch();
      toast({
        title: 'Student Added Successfully',
        description: `Student password: ${data.password}`,
        variant: 'default',
      });
      setIsAddStudentModalOpen(false);
    },
    onError: (error) => {
      console.error('Error adding student:', error);
      toast({
        title: 'Error',
        description: 'Failed to add student',
        variant: 'destructive',
      });
    }
  });

  const { logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSMSPurchaseSuccess = () => {
    // Refresh SMS credits - in a real app you'd fetch from API
    setSmsCredits(prev => prev + 100); // Placeholder increment
  };

  return (
    <div className={`min-h-screen ${isDarkMode 
      ? 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900' 
      : 'bg-gradient-to-br from-orange-50 via-white to-red-50'
    }`}>
      {/* Header */}
      <header className={`backdrop-blur-sm border-b dashboard-header ${isDarkMode 
        ? 'bg-gray-800/95 border-orange-400/30' 
        : 'bg-white/95 border-orange-300/50 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <FlaskConical className="text-white w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h1 className={`text-sm sm:text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Sir Dashboard</h1>
              <p className={`text-xs ${isDarkMode ? 'text-orange-300' : 'text-orange-600'}`}>Chemistry & ICT Care</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-3">
            <Button 
              onClick={toggleTheme}
              variant="outline" 
              size="sm" 
              className={`px-2 sm:px-3 ${isDarkMode 
                ? 'text-yellow-300 border-yellow-400/50 hover:bg-yellow-500/20' 
                : 'text-blue-600 border-blue-300 hover:bg-blue-50'
              }`}
              data-testid="teacher-theme-toggle"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="hidden sm:inline ml-2">{isDarkMode ? 'Light Mode' : 'Scientific Theme'}</span>
            </Button>
            <Button variant="outline" size="sm" className={`px-2 sm:px-3 ${isDarkMode 
              ? 'text-orange-300 border-orange-400/50 hover:bg-orange-500/20' 
              : 'text-orange-600 border-orange-300 hover:bg-orange-50'
            }`}>
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Notifications</span>
            </Button>
            <Button 
              onClick={handleLogout}
              variant="outline" 
              size="sm" 
              className="px-2 sm:px-3 text-red-300 border-red-400/50 hover:bg-red-500/20"
              data-testid="logout-button"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Professional Main Content */}
      <main className="px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          {/* Professional Teacher Features Grid - 2x4 Layout */}
          <div className="mb-8">
            <div className="max-w-6xl mx-auto px-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {getTeacherIcons(setLocation).map((item) => (
                  <div
                    key={item.id}
                    onClick={item.onClick}
                    className="cursor-pointer group"
                    data-testid={`feature-${item.id}`}
                  >
                    <div
                      className={`w-16 h-16 sm:w-18 sm:h-18 rounded-lg flex flex-col items-center justify-center p-2 sm:p-3 transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-lg ${
                        activeTab === item.id
                          ? isDarkMode
                            ? 'bg-slate-800 border-2 border-cyan-400 shadow-lg shadow-cyan-400/20'
                            : 'bg-white border-2 border-orange-400 shadow-lg shadow-orange-400/20'
                          : isDarkMode
                          ? 'bg-slate-900/50 border border-slate-600 hover:border-cyan-400 hover:bg-slate-800/80'
                          : 'bg-gray-50/80 border border-gray-200 hover:border-orange-400 hover:bg-white/90'
                      }`}
                    >
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 mb-1 flex items-center justify-center transition-colors duration-200 ${
                        activeTab === item.id
                          ? isDarkMode
                            ? 'text-cyan-400'
                            : 'text-orange-500'
                          : isDarkMode
                          ? 'text-slate-400 group-hover:text-cyan-400'
                          : 'text-gray-500 group-hover:text-orange-500'
                      }`}>
                        {item.icon}
                      </div>
                      <span className={`text-xs font-medium text-center leading-tight transition-colors duration-200 ${
                        activeTab === item.id
                          ? isDarkMode
                            ? 'text-cyan-400'
                            : 'text-orange-500'
                          : isDarkMode
                          ? 'text-slate-400 group-hover:text-cyan-400'
                          : 'text-gray-500 group-hover:text-orange-500'
                      }`}>
                        {item.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 px-1">
            <div className="grid grid-cols-2 gap-4">
              <Card className={`mobile-dashboard-card ${isDarkMode 
                ? 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/30' 
                : 'bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 shadow-md'
              } hover:scale-105 transition-transform duration-200`}>
                <CardContent className="mobile-card-content">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-cyan-800'}`}>
                        {statsLoading ? '...' : teacherStats?.totalStudents || 0}
                      </div>
                      <p className={`text-xs font-medium ${isDarkMode ? 'text-cyan-200' : 'text-cyan-600'}`}>Total Students</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`mobile-dashboard-card ${isDarkMode 
                ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30' 
                : 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 shadow-md'
              } hover:scale-105 transition-transform duration-200`}>
                <CardContent className="mobile-card-content">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                      <PlayCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-green-800'}`}>
                        {statsLoading ? '...' : teacherStats?.totalExams || 0}
                      </div>
                      <p className={`text-xs font-medium ${isDarkMode ? 'text-green-200' : 'text-green-600'}`}>Active Exams</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`mobile-dashboard-card ${isDarkMode 
                ? 'bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-400/30' 
                : 'bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 shadow-md'
              } hover:scale-105 transition-transform duration-200`}>
                <CardContent className="mobile-card-content">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-purple-800'}`}>
                        {statsLoading ? '...' : teacherStats?.totalQuestions || 0}
                      </div>
                      <p className={`text-xs font-medium ${isDarkMode ? 'text-purple-200' : 'text-purple-600'}`}>Question Bank</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`mobile-dashboard-card ${isDarkMode 
                ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-400/30' 
                : 'bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 shadow-md'
              } hover:scale-105 transition-transform duration-200`}>
                <CardContent className="mobile-card-content">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-yellow-800'}`}>
                        {statsLoading ? '...' : 0}
                      </div>
                      <p className={`text-xs font-medium ${isDarkMode ? 'text-yellow-200' : 'text-yellow-600'}`}>Messages</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mobile-adaptive-grid gap-6">
              <Card className={`mobile-full-card ${isDarkMode 
                ? 'bg-card border-2 border-primary/30' 
                : 'bg-card border-2 border-primary/20 shadow-lg'
              }`}>
                <CardHeader className="mobile-card-header">
                  <CardTitle className={`mobile-adaptive-heading ${isDarkMode ? 'text-primary' : 'text-primary'}`}>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="mobile-card-content space-y-4">
                  <Button 
                    onClick={() => setActiveTab('exams')}
                    className={`mobile-button-large w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground font-semibold border-2 border-primary/50`}
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                    Create New Exam
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('sms')}
                    className={`w-full justify-start min-h-[48px] bg-green-600 hover:bg-green-700 text-white font-semibold border-2 border-green-500/50`}
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                      <Send className="w-4 h-4 text-white" />
                    </div>
                    Send SMS to All Students
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('questions')}
                    className={`w-full justify-start min-h-[48px] bg-purple-600 hover:bg-purple-700 text-white font-semibold border-2 border-purple-500/50`}
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                      <Upload className="w-4 h-4 text-white" />
                    </div>
                    Upload Question Bank
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Question Maker Tab */}
          <TabsContent value="ai-questions" className="space-y-6">
            <AIQuestionMaker isDarkMode={isDarkMode} />
          </TabsContent>

          {/* SMS Purchase Tab */}
          <TabsContent value="sms-purchase" className="space-y-6">
            <BulkSMSPurchase 
              isDarkMode={isDarkMode} 
              currentCredits={smsCredits}
              onPurchaseSuccess={handleSMSPurchaseSuccess}
            />
          </TabsContent>

          {/* SMS/Notifications Tab */}
          <TabsContent value="sms" className="space-y-6">
            <BulkSMSComponent isDarkMode={isDarkMode} />
          </TabsContent>

          {/* Exam Management Tab */}
          <TabsContent value="exams" className="space-y-6 px-1">
            <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
              <h2 className={`mobile-adaptive-heading ${isDarkMode ? 'text-primary' : 'text-primary'} font-bold`}>Exam Management</h2>
              <Button className="mobile-button-large bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/50 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create New Exam
              </Button>
            </div>

            <div className="mobile-adaptive-grid gap-6">
              <Card className={`mobile-exam-card ${isDarkMode ? 'bg-card border-2 border-green-500/30' : 'bg-card border-2 border-green-500/20 shadow-lg'}`}>
                <CardHeader className="mobile-card-header">
                  <CardTitle className={`mobile-adaptive-heading ${isDarkMode ? 'text-green-400' : 'text-green-700'} flex items-center justify-between font-bold`}>
                    <span>MCQ Exams</span>
                    <Badge className={`${isDarkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-800'}`}>8 Active</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="mobile-card-content space-y-4">
                  <Button className={`w-full justify-start text-left ${isDarkMode ? 'bg-secondary hover:bg-secondary/80' : 'bg-secondary hover:bg-secondary/80'}`}>
                    <div>
                      <div className={`font-medium ${isDarkMode ? 'text-foreground' : 'text-foreground'}`}>Chemistry Periodic Table</div>
                      <div className={`text-xs ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>25 questions • 30 min</div>
                    </div>
                  </Button>
                  <Button className={`w-full justify-start text-left ${isDarkMode ? 'bg-secondary hover:bg-secondary/80' : 'bg-secondary hover:bg-secondary/80'}`}>
                    <div>
                      <div className={`font-medium ${isDarkMode ? 'text-foreground' : 'text-foreground'}`}>ICT Programming Basics</div>
                      <div className={`text-xs ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>30 questions • 45 min</div>
                    </div>
                  </Button>
                </CardContent>
              </Card>

              <Card className={`${isDarkMode ? 'bg-card border-2 border-blue-500/30' : 'bg-card border-2 border-blue-500/20 shadow-lg'}`}>
                <CardHeader>
                  <CardTitle className={`${isDarkMode ? 'text-blue-400' : 'text-blue-700'} flex items-center justify-between font-bold`}>
                    <span>Written Exams</span>
                    <Badge className={`${isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>5 Active</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className={`w-full justify-start text-left ${isDarkMode ? 'bg-secondary hover:bg-secondary/80' : 'bg-secondary hover:bg-secondary/80'}`}>
                    <div>
                      <div className={`font-medium ${isDarkMode ? 'text-foreground' : 'text-foreground'}`}>Organic Chemistry Essay</div>
                      <div className={`text-xs ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>5 questions • 2 hours</div>
                    </div>
                  </Button>
                  <Button className={`w-full justify-start text-left ${isDarkMode ? 'bg-secondary hover:bg-secondary/80' : 'bg-secondary hover:bg-secondary/80'}`}>
                    <div>
                      <div className={`font-medium ${isDarkMode ? 'text-foreground' : 'text-foreground'}`}>ICT Project Analysis</div>
                      <div className={`text-xs ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>3 questions • 90 min</div>
                    </div>
                  </Button>
                </CardContent>
              </Card>

              <Card className={`${isDarkMode ? 'bg-card border-2 border-purple-500/30' : 'bg-card border-2 border-purple-500/20 shadow-lg'}`}>
                <CardHeader>
                  <CardTitle className={`${isDarkMode ? 'text-purple-400' : 'text-purple-700'} flex items-center justify-between font-bold`}>
                    <span>Timed Exams</span>
                    <Badge className={`${isDarkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-800'}`}>3 Scheduled</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className={`w-full justify-start text-left ${isDarkMode ? 'bg-secondary hover:bg-secondary/80' : 'bg-secondary hover:bg-secondary/80'}`}>
                    <div>
                      <div className={`font-medium ${isDarkMode ? 'text-foreground' : 'text-foreground'}`}>Mid-term Chemistry</div>
                      <div className={`text-xs ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>Tomorrow 10:00 AM</div>
                    </div>
                  </Button>
                  <Button className={`w-full justify-start text-left ${isDarkMode ? 'bg-secondary hover:bg-secondary/80' : 'bg-secondary hover:bg-secondary/80'}`}>
                    <div>
                      <div className={`font-medium ${isDarkMode ? 'text-foreground' : 'text-foreground'}`}>ICT Final Assessment</div>
                      <div className={`text-xs ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>Friday 2:00 PM</div>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Question Bank Tab */}
          <TabsContent value="questions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-primary' : 'text-primary'}`}>Question Bank Management</h2>
              <div className="flex gap-3">
                <Button className={`${isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'} border border-green-500/50`}>
                  <Link className="w-4 h-4 mr-2" />
                  Add Google Drive Link
                </Button>
                <Button className={`${isDarkMode ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : 'bg-cyan-600 hover:bg-cyan-700 text-white'} border border-cyan-500/50`}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload PDF
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Chemistry Question Bank */}
              <Card className={`${isDarkMode ? 'bg-card border-2 border-primary/30' : 'bg-card border-2 border-primary/20 shadow-lg'}`}>
                <CardHeader>
                  <CardTitle className={`${isDarkMode ? 'text-primary' : 'text-primary'} font-bold`}>Chemistry Question Bank</CardTitle>
                  <CardDescription className={`${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'} font-medium`}>Manage chemistry questions and resources</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className={`flex items-center justify-between p-3 rounded-lg border ${isDarkMode ? 'bg-secondary border-green-400/30' : 'bg-secondary border-green-400/30'}`}>
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-green-600" />
                        <div>
                          <div className={`${isDarkMode ? 'text-foreground' : 'text-foreground'} font-medium`}>Chemistry MCQ Set 1</div>
                          <div className="text-green-600 text-sm font-semibold">Google Drive</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" className="text-green-600 border-green-600/50 hover:bg-green-50">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-600/50 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className={`flex items-center justify-between p-3 rounded-lg border ${isDarkMode ? 'bg-secondary border-blue-400/30' : 'bg-secondary border-blue-400/30'}`}>
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className={`${isDarkMode ? 'text-foreground' : 'text-foreground'} font-medium`}>Organic Chemistry PDF</div>
                          <div className="text-blue-600 text-sm font-semibold">Uploaded PDF</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" className="text-blue-600 border-blue-600/50 hover:bg-blue-50">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-600/50 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white border border-cyan-500/50">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Chemistry Resource
                  </Button>
                </CardContent>
              </Card>

              {/* ICT Question Bank */}
              <Card className={`${isDarkMode ? 'bg-card border-2 border-primary/30' : 'bg-card border-2 border-primary/20 shadow-lg'}`}>
                <CardHeader>
                  <CardTitle className={`${isDarkMode ? 'text-primary' : 'text-primary'} font-bold`}>ICT Question Bank</CardTitle>
                  <CardDescription className={`${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'} font-medium`}>Manage ICT questions and resources</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className={`flex items-center justify-between p-3 rounded-lg border ${isDarkMode ? 'bg-secondary border-purple-400/30' : 'bg-secondary border-purple-400/30'}`}>
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-purple-600" />
                        <div>
                          <div className={`${isDarkMode ? 'text-foreground' : 'text-foreground'} font-medium`}>ICT Chapter 1-5 Questions</div>
                          <div className="text-purple-600 text-sm font-semibold">Google Drive</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" className="text-purple-600 border-purple-600/50 hover:bg-purple-50">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-600/50 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white border border-purple-500/50">
                    <Plus className="w-4 h-4 mr-2" />
                    Add ICT Resource
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Question Bank Statistics */}
            <Card className={`${isDarkMode ? 'bg-card border-2 border-cyan-500/30' : 'bg-card border-2 border-cyan-500/20 shadow-lg'}`}>
              <CardHeader>
                <CardTitle className={`${isDarkMode ? 'text-cyan-400' : 'text-cyan-700'} font-bold`}>Question Bank Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-secondary' : 'bg-secondary'}`}>
                    <div className="text-2xl font-bold text-green-600">2</div>
                    <div className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'} font-medium`}>Chemistry Resources</div>
                  </div>
                  <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-secondary' : 'bg-secondary'}`}>
                    <div className="text-2xl font-bold text-purple-600">1</div>
                    <div className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'} font-medium`}>ICT Resources</div>
                  </div>
                  <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-secondary' : 'bg-secondary'}`}>
                    <div className="text-2xl font-bold text-blue-600">2</div>
                    <div className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'} font-medium`}>Google Drive Links</div>
                  </div>
                  <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-secondary' : 'bg-secondary'}`}>
                    <div className="text-2xl font-bold text-cyan-600">1</div>
                    <div className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'} font-medium`}>PDF Files</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-primary' : 'text-primary'}`}>Student Management</h2>
              <Button 
                onClick={() => setIsAddStudentModalOpen(true)}
                className={`${isDarkMode ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : 'bg-cyan-600 hover:bg-cyan-700 text-white'} border border-cyan-500/50`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Student
              </Button>
            </div>

            <Card className={`${isDarkMode ? 'bg-card border-2 border-cyan-500/30' : 'bg-card border-2 border-cyan-500/20 shadow-lg'}`}>
              <CardHeader>
                <CardTitle className={`${isDarkMode ? 'text-cyan-400' : 'text-cyan-700'} font-bold`}>Student List</CardTitle>
                <CardDescription className={`${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'} font-medium`}>Monitor student progress and attendance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentsLoading ? (
                    <div className="text-center py-8">
                      <span className="text-gray-400">Loading students...</span>
                    </div>
                  ) : studentsData && studentsData.length > 0 ? (
                    studentsData.map((student: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-600">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                          <GraduationCap className="text-white text-sm" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{student.firstName} {student.lastName}</div>
                          <div className="text-sm text-cyan-300">ID: {student.studentId}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-sm text-green-400">100%</div>
                          <div className="text-xs text-gray-400">Attendance</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-blue-400">-</div>
                          <div className="text-xs text-gray-400">No Exams Yet</div>
                        </div>
                        <Button size="sm" variant="outline" className="text-cyan-300 border-cyan-400/50">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <span className="text-gray-400">No students enrolled yet</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Student Reports & Progress</h2>
              <Button className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50">
                <Download className="w-4 h-4 mr-2" />
                Export Reports
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className={`${isDarkMode ? 'bg-card border-2 border-primary/30' : 'bg-card border-2 border-primary/20 shadow-lg'}`}>
                <CardHeader>
                  <CardTitle className={`${isDarkMode ? 'text-primary' : 'text-primary'} font-bold`}>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white">Average Score (Chemistry)</span>
                      <span className="text-green-400 font-bold">No Exams Yet</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white">Average Score (ICT)</span>
                      <span className="text-blue-400 font-bold">No Exams Yet</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white">Overall Attendance</span>
                      <span className="text-purple-400 font-bold">100%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white">Active Students</span>
                      <span className="text-cyan-400 font-bold">
                        {statsLoading ? '...' : `${teacherStats?.totalStudents || 0}/${teacherStats?.totalBatches * 30 || 30}`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${isDarkMode ? 'bg-card border-2 border-primary/30' : 'bg-card border-2 border-primary/20 shadow-lg'}`}>
                <CardHeader>
                  <CardTitle className={`${isDarkMode ? 'text-primary' : 'text-primary'} font-bold`}>Top Performers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {studentsLoading ? (
                      <div className="text-center py-4">
                        <span className="text-gray-400">Loading...</span>
                      </div>
                    ) : studentsData && studentsData.length > 0 ? (
                      studentsData.map((student: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="text-white font-medium">{student.firstName} {student.lastName}</div>
                            <div className="text-cyan-300 text-sm">ID: {student.studentId}</div>
                          </div>
                        </div>
                        <div className="text-green-400 font-bold">No Scores Yet</div>
                      </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <span className="text-gray-400">No students to rank yet</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Student Modal */}
      <Dialog open={isAddStudentModalOpen} onOpenChange={setIsAddStudentModalOpen}>
        <DialogContent className={`max-w-md ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className={isDarkMode ? 'text-cyan-300' : 'text-gray-800'}>Add New Student</DialogTitle>
          </DialogHeader>
          <AddStudentForm 
            isDarkMode={isDarkMode} 
            onSubmit={(data) => addStudentMutation.mutate(data)}
            batches={batchesData || []}
            isLoading={addStudentMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}