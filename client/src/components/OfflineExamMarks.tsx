import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare, Smartphone, Send, Settings, Phone, UserCheck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface OfflineExamMarksProps {
  exam: any;
  isOpen: boolean;
  onClose: () => void;
}

interface StudentMark {
  studentId: string;
  marks: number;
  feedback: string;
}

interface SMSOptions {
  sendSMS: boolean;
  targetRecipients: 'student' | 'parent' | 'both';
  customTemplate: string;
}

export function OfflineExamMarks({ exam, isOpen, onClose }: OfflineExamMarksProps) {
  const [studentMarks, setStudentMarks] = useState<StudentMark[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [smsOptions, setSmsOptions] = useState<SMSOptions>({
    sendSMS: true,
    targetRecipients: 'student',
    customTemplate: `🎯 Exam Result Alert!\n\nDear {student_name},\n\nYour result for "{exam_title}" exam:\n📊 Marks: {marks}/{total_marks}\n📅 Exam Date: {exam_date}\n\n{feedback}\n\nBest of luck for future exams!\n\nChemistry & ICT Care by Belal Sir\n📞 Contact: 01712345678`
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get students for this exam (either by batch or all students)
  const { data: students = [] } = useQuery({
    queryKey: ['/api/students'],
    enabled: isOpen,
  });

  // Filter students based on exam's target
  const examStudents = exam?.batchId 
    ? (students as any[]).filter((student: any) => student.batchId === exam.batchId)
    : (students as any[]);

  // Initialize student marks when students data is available
  useState(() => {
    if (examStudents.length > 0 && studentMarks.length === 0) {
      setStudentMarks(
        examStudents.map((student: any) => ({
          studentId: student.id,
          marks: 0,
          feedback: 'Good effort! Keep practicing for better results.'
        }))
      );
    }
  });

  const updateMarksMutation = useMutation({
    mutationFn: async (data: { studentMarks: StudentMark[]; smsOptions: SMSOptions }) => {
      return await apiRequest('POST', `/api/exams/${exam.id}/marks`, data);
    },
    onSuccess: (result: any) => {
      toast({
        title: "✅ Marks Updated Successfully!",
        description: result.message || `Results saved for ${studentMarks.length} students.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/exams'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "❌ Failed to Update Marks",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleMarkChange = (studentId: string, field: 'marks' | 'feedback', value: string | number) => {
    setStudentMarks(prev => 
      prev.map(mark => 
        mark.studentId === studentId 
          ? { ...mark, [field]: field === 'marks' ? Number(value) : value }
          : mark
      )
    );
  };

  const handleSubmit = () => {
    const validMarks = studentMarks.filter(mark => mark.marks >= 0 && mark.marks <= (exam.totalMarks || 100));
    
    if (validMarks.length === 0) {
      toast({
        title: "No Valid Marks",
        description: "Please enter valid marks for at least one student.",
        variant: "destructive",
      });
      return;
    }

    updateMarksMutation.mutate({ 
      studentMarks: validMarks, 
      smsOptions 
    });
  };

  const getStudentInfo = (studentId: string) => {
    return examStudents.find((student: any) => student.id === studentId);
  };

  const previewSMS = (studentMark: StudentMark) => {
    const student = getStudentInfo(studentMark.studentId);
    if (!student) return '';

    return smsOptions.customTemplate
      .replace('{student_name}', `${student.firstName} ${student.lastName}`)
      .replace('{exam_title}', exam.title)
      .replace('{marks}', studentMark.marks.toString())
      .replace('{total_marks}', exam.totalMarks.toString())
      .replace('{exam_date}', new Date(exam.examDate).toLocaleDateString())
      .replace('{feedback}', studentMark.feedback)
      .replace('{teacher_phone}', '01712345678');
  };

  // Filter students based on search
  const filteredStudents = examStudents.filter((student: any) => {
    if (!searchFilter) return true;
    return (
      student.studentId?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      student.firstName?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      student.phoneNumber?.includes(searchFilter)
    );
  });

  // Calculate SMS cost based on options
  const getActiveSMSCount = () => {
    const studentsWithMarks = studentMarks.filter(mark => mark.marks > 0);
    if (!smsOptions.sendSMS) return 0;
    
    let multiplier = 1;
    if (smsOptions.targetRecipients === 'both') multiplier = 2;
    
    return studentsWithMarks.length * multiplier;
  };
  
  const totalSMSCost = getActiveSMSCount();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            📝 Offline Exam Marks Entry - {exam?.title}
          </DialogTitle>
          <DialogDescription>
            Enter marks for offline exam and send individual SMS results to students
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Exam Info */}
          <Card className="bg-orange-50 border-orange-200">
            <CardHeader>
              <CardTitle className="text-lg text-orange-700">📊 Exam Details</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-4 gap-4 text-sm">
              <div>
                <Label className="font-semibold">Subject</Label>
                <p>{exam?.subject}</p>
              </div>
              <div>
                <Label className="font-semibold">Total Marks</Label>
                <p>{exam?.totalMarks}</p>
              </div>
              <div>
                <Label className="font-semibold">Exam Date</Label>
                <p>{exam ? new Date(exam.examDate).toLocaleDateString() : ''}</p>
              </div>
              <div>
                <Label className="font-semibold">Students</Label>
                <p>{examStudents.length} students</p>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced SMS Options */}
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg text-purple-700 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                SMS Options & Targeting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Send SMS Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-purple-600" />
                  <Label className="font-semibold">Send SMS Notifications</Label>
                </div>
                <Switch
                  checked={smsOptions.sendSMS}
                  onCheckedChange={(checked) => setSmsOptions({...smsOptions, sendSMS: checked})}
                />
              </div>
              
              {/* Target Recipients */}
              {smsOptions.sendSMS && (
                <div className="space-y-2">
                  <Label className="font-semibold flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    Send SMS To:
                  </Label>
                  <Select 
                    value={smsOptions.targetRecipients} 
                    onValueChange={(value: 'student' | 'parent' | 'both') => setSmsOptions({...smsOptions, targetRecipients: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">📱 Students Only</SelectItem>
                      <SelectItem value="parent">👨‍👩‍👧‍👦 Parents Only</SelectItem>
                      <SelectItem value="both">📱👨‍👩‍👧‍👦 Both Students & Parents</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="text-xs text-purple-600">
                    {smsOptions.targetRecipients === 'student' && '📱 SMS will be sent to student phone numbers'}
                    {smsOptions.targetRecipients === 'parent' && '👨‍👩‍👧‍👦 SMS will be sent to parent phone numbers'}
                    {smsOptions.targetRecipients === 'both' && '📱👨‍👩‍👧‍👦 SMS will be sent to both student and parent phone numbers (2× cost)'}
                  </div>
                </div>
              )}
              
              {!smsOptions.sendSMS && (
                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
                  💾 Marks will be saved without sending SMS notifications. You can manually send SMS later.
                </div>
              )}
            </CardContent>
          </Card>

          {/* SMS Template */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-blue-700 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                SMS Result Template
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={smsOptions.customTemplate}
                onChange={(e) => setSmsOptions({...smsOptions, customTemplate: e.target.value})}
                rows={8}
                className="font-mono text-sm"
                placeholder="Customize your SMS template using variables: student_name, exam_title, marks, total_marks, exam_date, feedback, teacher_phone"
              />
              <div className="mt-2 text-xs text-blue-600">
                Available variables: student_name, exam_title, marks, total_marks, exam_date, feedback, teacher_phone
              </div>
            </CardContent>
          </Card>

          {/* SMS Cost Info */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-700">SMS Cost Estimation</span>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-600 text-white">
                    {totalSMSCost} SMS × 1 Credit = {totalSMSCost} Credits
                  </Badge>
                  <p className="text-xs text-green-600 mt-1">From main SMS balance</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Marks Entry */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5" />
                Enter Student Marks ({filteredStudents.length} students)
              </h3>
              <div className="flex items-center gap-2 max-w-xs">
                <Label className="text-sm">🔍 Search:</Label>
                <Input
                  placeholder="Student ID, Name, or Phone"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
            
            <div className="grid gap-4">
              {filteredStudents.map((student: any, index: number) => {
                const studentMark = studentMarks.find(mark => mark.studentId === student.id);
                return (
                  <Card key={student.id} className="border-gray-200">
                    <CardContent className="pt-4">
                      <div className="grid md:grid-cols-5 gap-4 items-start">
                        <div className="md:col-span-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-blue-600 text-white text-xs font-mono">
                              {student.studentId}
                            </Badge>
                          </div>
                          <Label className="font-semibold text-gray-700 text-sm">
                            {student.firstName} {student.lastName}
                          </Label>
                          <p className="text-xs text-gray-500">
                            📱 {student.phoneNumber || 'No phone'}
                          </p>
                          <p className="text-xs text-green-600">
                            🏫 Batch: {exam?.subject?.toUpperCase() || 'N/A'}
                          </p>
                        </div>
                        
                        <div className="md:col-span-1">
                          <Label htmlFor={`marks-${student.id}`}>Marks (out of {exam?.totalMarks})</Label>
                          <Input
                            id={`marks-${student.id}`}
                            type="number"
                            min="0"
                            max={exam?.totalMarks}
                            value={studentMark?.marks || 0}
                            onChange={(e) => handleMarkChange(student.id, 'marks', e.target.value)}
                            className="w-full"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <Label htmlFor={`feedback-${student.id}`}>Individual Feedback</Label>
                          <Textarea
                            id={`feedback-${student.id}`}
                            value={studentMark?.feedback || ''}
                            onChange={(e) => handleMarkChange(student.id, 'feedback', e.target.value)}
                            rows={2}
                            placeholder="Personal feedback for this student..."
                            className="w-full"
                          />
                        </div>
                        
                        <div className="md:col-span-1">
                          <Label>SMS Preview</Label>
                          <div className="p-2 bg-gray-50 border rounded text-xs max-h-20 overflow-y-auto">
                            {studentMark ? previewSMS(studentMark).substring(0, 100) + '...' : 'Enter marks to preview'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              📊 Total students: {examStudents.length} | 
              ✅ Marks entered: {studentMarks.filter(mark => mark.marks > 0).length} |
              💸 SMS cost: {totalSMSCost} credits
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={updateMarksMutation.isPending || studentMarks.filter(mark => mark.marks > 0).length === 0}
                className={smsOptions.sendSMS ? "bg-green-600 hover:bg-green-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}
              >
                <Send className="w-4 h-4 mr-2" />
                {updateMarksMutation.isPending ? 'Updating...' : (smsOptions.sendSMS ? `Save Marks & Send ${totalSMSCost} SMS` : 'Save Marks Only')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}