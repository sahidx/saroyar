import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  ArrowLeft, 
  CalendarCheck, 
  Users, 
  MessageSquare, 
  CheckCircle, 
  XCircle,
  Save,
  Calendar,
  Clock,
  User
} from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  phoneNumber?: string;
  parentPhoneNumber?: string;
  batchId: string;
}

interface Batch {
  id: string;
  name: string;
  subject: 'chemistry' | 'ict';
  batchCode: string;
  currentStudents: number;
}

interface AttendanceRecord {
  studentId: string;
  isPresent: boolean;
  notes: string;
}

export default function Attendance() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<{ [key: string]: AttendanceRecord }>({});
  const [sendSMS, setSendSMS] = useState<boolean>(true);
  
  // Fetch batches
  const { data: batches = [] } = useQuery<Batch[]>({
    queryKey: ['/api/batches'],
  });

  // Fetch students for selected batch
  const { data: students = [], refetch: refetchStudents } = useQuery<Student[]>({
    queryKey: [`/api/batches/${selectedBatch}/students`],
    enabled: !!selectedBatch,
  });

  // Fetch existing attendance for selected date and batch
  const { data: existingAttendance = [] } = useQuery({
    queryKey: ['/api/attendance/batch', selectedBatch, selectedDate],
    enabled: !!selectedBatch && !!selectedDate,
  });

  // Initialize attendance records when students or existing attendance changes
  useEffect(() => {
    if (students.length > 0) {
      const records: { [key: string]: AttendanceRecord } = {};
      
      students.forEach(student => {
        const existing = existingAttendance.find((att: any) => att.studentId === student.id);
        records[student.id] = {
          studentId: student.id,
          isPresent: existing ? existing.isPresent : true, // Default to present
          notes: existing ? existing.notes || '' : ''
        };
      });
      
      setAttendanceRecords(records);
    }
  }, [students, existingAttendance]);

  // Filter batches by selected subject
  const filteredBatches = selectedSubject 
    ? batches.filter(batch => batch.subject === selectedSubject)
    : batches;

  // Take attendance mutation
  const takeAttendanceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/attendance/take', data);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success! ✅",
        description: data.message || "Attendance recorded successfully",
      });
      
      // Show summary
      if (data.summary) {
        toast({
          title: "Attendance Summary",
          description: `Total: ${data.summary.total} | Present: ${data.summary.present} | Absent: ${data.summary.absent}`,
        });
      }
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/attendance'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to record attendance. Please try again.",
        variant: "destructive",
      });
      console.error('Error recording attendance:', error);
    },
  });

  const handleAttendanceChange = (studentId: string, field: 'isPresent' | 'notes', value: boolean | string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSubmit = () => {
    if (!selectedBatch || !selectedSubject) {
      toast({
        title: "Missing Information",
        description: "Please select both batch and subject",
        variant: "destructive",
      });
      return;
    }

    const attendanceData = Object.values(attendanceRecords);
    
    takeAttendanceMutation.mutate({
      batchId: selectedBatch,
      subject: selectedSubject,
      date: selectedDate,
      attendanceData,
      sendSMS
    });
  };

  const markAllPresent = () => {
    const updatedRecords = { ...attendanceRecords };
    Object.keys(updatedRecords).forEach(studentId => {
      updatedRecords[studentId].isPresent = true;
    });
    setAttendanceRecords(updatedRecords);
  };

  const markAllAbsent = () => {
    const updatedRecords = { ...attendanceRecords };
    Object.keys(updatedRecords).forEach(studentId => {
      updatedRecords[studentId].isPresent = false;
    });
    setAttendanceRecords(updatedRecords);
  };

  // Calculate statistics
  const totalStudents = students.length;
  const presentCount = Object.values(attendanceRecords).filter(record => record.isPresent).length;
  const absentCount = totalStudents - presentCount;

  const isDarkMode = false; // Get from theme context

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 hover:bg-orange-50 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <CalendarCheck className={`w-6 h-6 ${isDarkMode ? 'text-cyan-400' : 'text-orange-600'}`} />
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Take Attendance - Chemistry & ICT
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Selection Cards - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {/* Subject Selection */}
          <Card className="border border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-orange-800">Select Subject</CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chemistry">🧪 Chemistry</SelectItem>
                  <SelectItem value="ict">💻 ICT</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Batch Selection */}
          <Card className="border border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-blue-800">Select Batch</CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={setSelectedBatch} disabled={!selectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose batch" />
                </SelectTrigger>
                <SelectContent>
                  {filteredBatches.map(batch => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.name} ({batch.currentStudents} students)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Date Selection */}
          <Card className="border border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-green-800">Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border-green-200"
              />
            </CardContent>
          </Card>

          {/* SMS Toggle */}
          <Card className="border border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-purple-800">SMS Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sms"
                  checked={sendSMS}
                  onCheckedChange={setSendSMS}
                />
                <Label htmlFor="sms" className="text-sm">
                  Send to parents
                </Label>
                <MessageSquare className="w-4 h-4 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Cards - Mobile Optimized */}
        {selectedBatch && students.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
            <Card className="border border-blue-200 bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-blue-800 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Total Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{totalStudents}</div>
              </CardContent>
            </Card>

            <Card className="border border-green-200 bg-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-green-800 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Present
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{presentCount}</div>
              </CardContent>
            </Card>

            <Card className="border border-red-200 bg-red-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-red-800 flex items-center">
                  <XCircle className="w-4 h-4 mr-2" />
                  Absent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-900">{absentCount}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions - Mobile Optimized */}
        {selectedBatch && students.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button
              onClick={markAllPresent}
              className="bg-green-600 hover:bg-green-700 text-white py-3"
              size="lg"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              All Present
            </Button>
            <Button
              onClick={markAllAbsent}
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50 py-3"
              size="lg"
            >
              <XCircle className="w-4 h-4 mr-2" />
              All Absent
            </Button>
          </div>
        )}

        {/* Student Attendance List - Mobile Optimized */}
        {selectedBatch && students.length > 0 && (
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <User className="w-5 h-5 mr-2" />
                Student Attendance ({students.length} students)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {students.map(student => (
                  <div key={student.id} className="p-3 border rounded-lg bg-gray-50">
                    {/* Student Info - Mobile Friendly */}
                    <div className="flex flex-col space-y-3">
                      {/* Top Row: Student Details */}
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-lg">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            <div className="flex flex-col sm:flex-row sm:space-x-4">
                              <span>ID: {student.studentId}</span>
                              {student.phoneNumber && (
                                <span className="flex items-center mt-1 sm:mt-0">
                                  📱 <span className="ml-1 font-mono">{student.phoneNumber}</span>
                                </span>
                              )}
                            </div>
                            {student.parentPhoneNumber && (
                              <div className="flex items-center mt-1 text-blue-600">
                                👨‍👩‍👧‍👦 <span className="ml-1 font-mono">{student.parentPhoneNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Status Badge - Always Visible */}
                        <Badge 
                          className={`text-sm px-3 py-1 ${
                            attendanceRecords[student.id]?.isPresent
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                          }`}
                        >
                          {attendanceRecords[student.id]?.isPresent ? '✅ Present' : '❌ Absent'}
                        </Badge>
                      </div>
                      
                      {/* Mobile Optimized Present/Absent Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="lg"
                          onClick={() => handleAttendanceChange(student.id, 'isPresent', true)}
                          className={`w-full text-base py-3 ${
                            attendanceRecords[student.id]?.isPresent
                              ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                              : 'bg-gray-200 text-gray-600 hover:bg-green-100'
                          }`}
                        >
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Present
                        </Button>
                        <Button
                          size="lg"
                          onClick={() => handleAttendanceChange(student.id, 'isPresent', false)}
                          className={`w-full text-base py-3 ${
                            !attendanceRecords[student.id]?.isPresent
                              ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg'
                              : 'bg-gray-200 text-gray-600 hover:bg-red-100'
                          }`}
                        >
                          <XCircle className="w-5 h-5 mr-2" />
                          Absent
                        </Button>
                      </div>

                      {/* Notes - Collapsible on Mobile */}
                      <div className="mt-2">
                        <Textarea
                          placeholder="📝 Add notes (optional)..."
                          value={attendanceRecords[student.id]?.notes || ''}
                          onChange={(e) => handleAttendanceChange(student.id, 'notes', e.target.value)}
                          className="h-16 text-sm resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="mt-6 pt-4 border-t">
                <Button
                  onClick={handleSubmit}
                  disabled={takeAttendanceMutation.isPending || !selectedBatch || !selectedSubject}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {takeAttendanceMutation.isPending 
                    ? 'Saving Attendance...' 
                    : `Save Attendance & ${sendSMS ? 'Send SMS' : 'Skip SMS'}`
                  }
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {selectedBatch && students.length === 0 && (
          <Card className="border border-gray-200 text-center py-12">
            <CardContent>
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
              <p className="text-gray-600">
                No students are enrolled in this batch yet.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {!selectedBatch && (
          <Card className="border border-blue-200 bg-blue-50">
            <CardContent className="py-6">
              <div className="text-center">
                <CalendarCheck className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                <h3 className="text-lg font-medium text-blue-900 mb-2">Take Attendance</h3>
                <p className="text-blue-700 mb-4">
                  Select subject and batch to start taking attendance for your Chemistry & ICT classes.
                </p>
                <div className="text-sm text-blue-600">
                  <p>✅ Mark students as Present or Absent</p>
                  <p>📱 Send SMS notifications to parents automatically</p>
                  <p>📝 Add optional notes for each student</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}