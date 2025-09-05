import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload, Link, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const examSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subject: z.enum(['chemistry', 'ict']),
  examDate: z.string().min(1, 'Exam date is required'),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  examType: z.enum(['mcq', 'written', 'mixed']),
  examMode: z.enum(['online', 'offline']),
  batchId: z.string().min(1, 'Batch selection is required'),
  questionSource: z.enum(['drive_link', 'file_upload']),
  questionContent: z.string().min(1, 'Question content is required'),
  totalMarks: z.number().min(1, 'Total marks must be at least 1'),
  instructions: z.string().optional(),
});

type ExamFormData = z.infer<typeof examSchema>;

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingExam?: any;
}

export function ExamModal({ isOpen, onClose, editingExam }: ExamModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch batches and students
  const { data: batches = [] } = useQuery({
    queryKey: ['/api/batches'],
  });

  const { data: students = [] } = useQuery({
    queryKey: ['/api/students'],
  });

  const form = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: '',
      subject: 'chemistry',
      examDate: '',
      duration: 90,
      examType: 'mcq',
      examMode: 'online',
      batchId: undefined,
      questionSource: 'drive_link',
      questionContent: '',
      totalMarks: 100,
      instructions: '',
    },
  });

  // Effect to populate form when editing an exam
  useEffect(() => {
    if (editingExam && isOpen) {
      // Helper function to format date properly
      const formatDateForInput = (dateString: string) => {
        try {
          const date = new Date(dateString);
          return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM format for datetime-local
        } catch {
          return '';
        }
      };

      form.reset({
        title: editingExam.title || '',
        subject: editingExam.subject || 'chemistry',
        examDate: editingExam.examDate ? formatDateForInput(editingExam.examDate) : '',
        duration: editingExam.duration || 90,
        examType: editingExam.examType || 'mcq',
        examMode: editingExam.examMode || 'online',
        batchId: editingExam.batchId || '',
        questionSource: editingExam.questionSource === 'image_upload' ? 'file_upload' : (editingExam.questionSource || 'drive_link'),
        questionContent: editingExam.questionContent || '',
        totalMarks: editingExam.totalMarks || 100,
        instructions: editingExam.instructions || '',
      });
    } else if (!editingExam && isOpen) {
      // Reset to default values when creating new exam
      form.reset({
        title: '',
        subject: 'chemistry',
        examDate: '',
        duration: 90,
        examType: 'mcq',
        examMode: 'online',
        batchId: '',
        questionSource: 'drive_link',
        questionContent: '',
        totalMarks: 100,
        instructions: '',
      });
    }
  }, [editingExam, isOpen, form]);

  const createExamMutation = useMutation({
    mutationFn: async (data: ExamFormData) => {
      const payload = {
        title: data.title,
        subject: data.subject,
        examDate: new Date(data.examDate).toISOString(),
        duration: data.duration,
        examType: data.examType,
        examMode: data.examMode,
        batchId: data.batchId || null,
        questionSource: data.questionSource,
        questionContent: data.questionContent,
        totalMarks: data.totalMarks,
        instructions: data.instructions || '',
      };
      
      console.log('Sending exam data:', payload);
      
      // Use PUT for editing, POST for creating
      const method = editingExam ? 'PUT' : 'POST';
      const url = editingExam ? `/api/exams/${editingExam.id}` : '/api/exams';
      const response = await apiRequest(method, url, payload);
      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['/api/exams'] });
      queryClient.invalidateQueries({ queryKey: ['/api/student/exams'] });
      
      toast({
        title: "Success",
        description: editingExam ? "Exam updated successfully!" : "Exam created successfully!",
      });
      // Reset form and close modal
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: editingExam ? "Failed to update exam. Please try again." : "Failed to create exam. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating exam:', error);
    },
  });

  const onSubmit = (data: ExamFormData) => {
    setIsSubmitting(true);
    createExamMutation.mutate(data);
    setIsSubmitting(false);
  };

  const selectedBatch = form.watch('batchId');
  const batchStudents = selectedBatch 
    ? (students as any[]).filter((student: any) => student.batchId === selectedBatch)
    : students as any[];

  const questionSource = form.watch('questionSource');
  const examMode = form.watch('examMode');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="exam-modal-title">
            {editingExam ? 'Edit Exam - Chemistry & ICT' : 'Create New Exam - Chemistry & ICT Only'}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {editingExam 
              ? 'Update exam details, questions, and settings for Chemistry or ICT exam.'
              : 'Create a new exam for Chemistry or ICT with comprehensive question management and student targeting.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="exam-form">
            {/* Basic Exam Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exam Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter exam title" {...field} data-testid="input-exam-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject (Chemistry & ICT Only)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-subject">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="chemistry">🧪 Chemistry</SelectItem>
                        <SelectItem value="ict">💻 ICT</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="examDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exam Date & Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} data-testid="input-exam-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="90"
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-exam-duration"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalMarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Marks</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="100"
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-total-marks"
                      />
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
                    <FormLabel>Select Batch</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-batch">
                          <SelectValue placeholder="Choose batch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">All Batches</SelectItem>
                        {(batches as any[]).map((batch: any) => (
                          <SelectItem key={batch.id} value={batch.id}>
                            {batch.name} - {batch.subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Exam Mode */}
            <FormField
              control={form.control}
              name="examMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exam Mode</FormLabel>
                  <FormControl>
                    <RadioGroup 
                      onValueChange={field.onChange} 
                      defaultValue={field.value} 
                      className="flex space-x-6"
                      data-testid="radio-exam-mode"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="online" id="online" />
                        <Label htmlFor="online">📱 Online Exam</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="offline" id="offline" />
                        <Label htmlFor="offline">📝 Offline Exam (Manual marks entry)</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Exam Type */}
            <FormField
              control={form.control}
              name="examType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Type</FormLabel>
                  <FormControl>
                    <RadioGroup 
                      onValueChange={field.onChange} 
                      defaultValue={field.value} 
                      className="flex space-x-4"
                      data-testid="radio-exam-type"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mcq" id="mcq" />
                        <Label htmlFor="mcq">MCQ Only</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="written" id="written" />
                        <Label htmlFor="written">Written Only</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mixed" id="mixed" />
                        <Label htmlFor="mixed">Mixed</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Question Source */}
            <FormField
              control={form.control}
              name="questionSource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Upload Method</FormLabel>
                  <FormControl>
                    <RadioGroup 
                      onValueChange={field.onChange} 
                      defaultValue={field.value} 
                      className="flex space-x-6"
                      data-testid="radio-question-source"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="drive_link" id="drive_link" />
                        <Label htmlFor="drive_link" className="flex items-center gap-2">
                          <Link className="w-4 h-4" />
                          Google Drive Link
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="file_upload" id="file_upload" />
                        <Label htmlFor="file_upload" className="flex items-center gap-2">
                          <Image className="w-4 h-4" />
                          File Upload (PNG/JPG/PDF)
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Question Content */}
            <FormField
              control={form.control}
              name="questionContent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {questionSource === 'drive_link' 
                      ? 'Google Drive Shareable Link' 
                      : 'Upload File (PNG/JPG/PDF)'
                    }
                  </FormLabel>
                  <FormControl>
                    {questionSource === 'drive_link' ? (
                      <Input 
                        placeholder="https://drive.google.com/file/d/..." 
                        {...field}
                        data-testid="input-drive-link"
                      />
                    ) : (
                      <Input 
                        type="file" 
                        accept=".png,.jpg,.jpeg,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Check file size - increased limit for PDF support (10MB)
                            const maxSize = file.type === 'application/pdf' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
                            if (file.size > maxSize) {
                              const maxSizeMB = file.type === 'application/pdf' ? '10MB' : '5MB';
                              alert(`File too large! Please upload a ${file.type === 'application/pdf' ? 'PDF' : 'image'} smaller than ${maxSizeMB}`);
                              return;
                            }
                            
                            // Validate file type - now supports PDF
                            const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
                            if (!validTypes.includes(file.type)) {
                              alert('Invalid file type! Please upload PNG, JPG, or PDF files only');
                              return;
                            }
                            
                            // Convert to base64 for storage
                            const reader = new FileReader();
                            reader.onload = () => {
                              const result = reader.result as string;
                              // Different limits for different file types
                              const maxBase64Size = file.type === 'application/pdf' ? 8000000 : 1500000; // 8MB for PDF, 1.5MB for images
                              if (result.length > maxBase64Size) {
                                const fileTypeDesc = file.type === 'application/pdf' ? 'PDF (~8MB)' : 'image (~1.5MB)';
                                alert(`File too large after conversion! Please use a smaller ${fileTypeDesc}`);
                                return;
                              }
                              field.onChange(result);
                            };
                            reader.onerror = () => {
                              alert('Error reading file! Please try again or use a different file');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        data-testid="input-image-upload"
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exam Instructions</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter special instructions for students..." 
                      rows={3}
                      {...field}
                      data-testid="textarea-exam-instructions"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-600">
📱 SMS notifications will be sent to all students in batch
              </div>
              <div className="flex space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  data-testid="button-cancel-exam"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || createExamMutation.isPending}
                  data-testid="button-create-exam"
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  {isSubmitting || createExamMutation.isPending 
                    ? (editingExam ? 'Updating Exam...' : 'Creating Exam...') 
                    : (editingExam ? 'Update Exam' : 'Create Exam & Send SMS')}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
