import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  MessageSquare, 
  Send, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  CreditCard,
  TrendingUp,
  History,
  Filter,
  FlaskConical,
  Monitor,
  GraduationCap,
  Phone
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";

export default function SMS() {
  const [message, setMessage] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [batchFilter, setBatchFilter] = useState<string>("all");
  const [recipientType, setRecipientType] = useState<string>("students");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch students
  const { data: students = [] } = useQuery({
    queryKey: ["/api/students"],
  });

  // Fetch batches for filtering
  const { data: batches = [] } = useQuery({
    queryKey: ["/api/batches"],
  });

  // Fetch SMS transactions
  const { data: transactions = [] } = useQuery({
    queryKey: ["/api/sms/transactions"],
  });

  // Fetch teacher stats for SMS credits
  const { data: stats } = useQuery({
    queryKey: ["/api/teacher/stats"],
  });

  const sendSMSMutation = useMutation({
    mutationFn: async (data: {
      message: string;
      recipients: any[];
      smsType: string;
    }) => {
      return await apiRequest("POST", "/api/sms/send-bulk", data);
    },
    onSuccess: (data: any) => {
      toast({
        title: "✅ SMS Sent Successfully!",
        description: `Sent to ${data.sentCount} students. ${data.remainingCredits} credits remaining.`,
      });
      setMessage("");
      setSelectedStudents([]);
      setSelectAll(false);
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Failed to Send SMS",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter students based on selected criteria
  const filteredStudents = (students as any[]).filter((student: any) => {
    // Subject filter
    if (subjectFilter !== "all") {
      const batch = (batches as any[]).find((b: any) => b.id === student.batchId);
      if (!batch || batch.subject !== subjectFilter) {
        return false;
      }
    }

    // Batch filter
    if (batchFilter !== "all" && student.batchId !== batchFilter) {
      return false;
    }

    return true;
  });

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map((student: any) => student.id));
    }
    setSelectAll(!selectAll);
  };

  const handleStudentSelect = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleSendSMS = () => {
    if (!message.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message to send.",
        variant: "destructive",
      });
      return;
    }

    if (selectedStudents.length === 0) {
      toast({
        title: "Select Recipients",
        description: "Please select at least one student to send SMS.",
        variant: "destructive",
      });
      return;
    }

    const recipients = filteredStudents
      .filter((student: any) => selectedStudents.includes(student.id))
      .map((student: any) => ({
        phoneNumber: recipientType === "parents" ? student.parentPhoneNumber : student.phoneNumber,
        name: `${student.firstName} ${student.lastName}`,
      }));

    sendSMSMutation.mutate({
      message,
      recipients,
      smsType: "general",
    });
  };

  const smsCredits = (stats as any)?.smsCredits || 0;
  const messageLength = message.length;
  const estimatedCost = selectedStudents.length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <MessageSquare className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          SMS Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Send bulk SMS messages to your students and manage communication
        </p>
      </div>

      <Tabs defaultValue="send" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="send">Send SMS</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Send SMS Tab */}
        <TabsContent value="send" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* SMS Composer */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Compose Message
                  </CardTitle>
                  <CardDescription>
                    Write your message and select recipients
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Message Input */}
                  <div>
                    <Label htmlFor="message" className="text-base font-medium">
                      Message Content
                    </Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message here..."
                      className="mt-2 min-h-[120px]"
                      maxLength={500}
                      data-testid="textarea-sms-message"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>{messageLength}/500 characters</span>
                      <span>{Math.ceil(messageLength / 160)} SMS units</span>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Filter className="h-4 w-4" />
                      <span className="font-medium">Filter Recipients</span>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="subject-filter" className="text-sm font-medium">Subject</Label>
                        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                          <SelectTrigger id="subject-filter">
                            <SelectValue placeholder="All Subjects" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Subjects</SelectItem>
                            <SelectItem value="chemistry">
                              <div className="flex items-center gap-2">
                                <FlaskConical className="h-4 w-4" />
                                Chemistry
                              </div>
                            </SelectItem>
                            <SelectItem value="ict">
                              <div className="flex items-center gap-2">
                                <Monitor className="h-4 w-4" />
                                ICT
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="batch-filter" className="text-sm font-medium">Batch</Label>
                        <Select value={batchFilter} onValueChange={setBatchFilter}>
                          <SelectTrigger id="batch-filter">
                            <SelectValue placeholder="All Batches" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Batches</SelectItem>
                            {(batches as any[]).map((batch: any) => (
                              <SelectItem key={batch.id} value={batch.id}>
                                <div className="flex items-center gap-2">
                                  <GraduationCap className="h-4 w-4" />
                                  {batch.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="recipient-type" className="text-sm font-medium">Send To</Label>
                        <Select value={recipientType} onValueChange={setRecipientType}>
                          <SelectTrigger id="recipient-type">
                            <SelectValue placeholder="Recipients" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="students">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Students
                              </div>
                            </SelectItem>
                            <SelectItem value="parents">
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Parents
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {filteredStudents.length} of {(students as any[]).length} students
                    </div>
                  </div>

                  {/* Student Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Label className="text-base font-medium">
                        Select Recipients ({selectedStudents.length} selected)
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="select-all"
                          checked={selectAll}
                          onCheckedChange={handleSelectAll}
                        />
                        <Label htmlFor="select-all" className="text-sm">
                          Select All
                        </Label>
                      </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto border rounded-lg p-4">
                      <div className="grid md:grid-cols-2 gap-3">
                        {filteredStudents.map((student: any) => {
                          const batch = (batches as any[]).find((b: any) => b.id === student.batchId);
                          const phoneToDisplay = recipientType === "parents" ? student.parentPhoneNumber : student.phoneNumber;
                          
                          return (
                          <div
                            key={student.id}
                            className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                          >
                            <Checkbox
                              id={`student-${student.id}`}
                              checked={selectedStudents.includes(student.id)}
                              onCheckedChange={() => handleStudentSelect(student.id)}
                              data-testid={`checkbox-student-${student.studentId}`}
                            />
                            <Label
                              htmlFor={`student-${student.id}`}
                              className="flex-1 cursor-pointer"
                            >
                              <div className="font-medium">
                                {student.firstName} {student.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {student.studentId} • {phoneToDisplay} • {batch?.name || 'No Batch'}
                              </div>
                            </Label>
                          </div>
                        );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Send Button */}
                  <Button
                    onClick={handleSendSMS}
                    disabled={sendSMSMutation.isPending || !message.trim() || selectedStudents.length === 0}
                    className="w-full h-12 text-base"
                    data-testid="button-send-sms"
                  >
                    {sendSMSMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        Sending...
                      </div>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send to {selectedStudents.length} Students
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* SMS Info Panel */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Credits Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      SMS Credits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {smsCredits.toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Available Credits
                      </p>
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span>Selected Recipients:</span>
                        <span className="font-medium">{selectedStudents.length}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span>Estimated Cost:</span>
                        <span className="font-medium">{estimatedCost} credits</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span>Remaining After:</span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {smsCredits - estimatedCost}
                        </span>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full mt-4" asChild>
                      <a href="/teacher/sms-purchase">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Buy More Credits
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Students:</span>
                        <span className="font-medium">{students.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">SMS Sent Today:</span>
                        <span className="font-medium">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate:</span>
                        <span className="font-medium text-green-600">100%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                SMS Transaction History
              </CardTitle>
              <CardDescription>
                View all your SMS purchases and usage history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction: any) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                          <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-medium">{transaction.packageName}</h3>
                          <p className="text-sm text-gray-500">
                            {transaction.smsCount} SMS Credits • {transaction.paymentMethod}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">৳{transaction.price}</div>
                        <Badge variant="secondary" className="mt-1">
                          {transaction.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No SMS transactions found. Purchase your first SMS package to get started.
                  </p>
                  <Button className="mt-4" asChild>
                    <a href="/teacher/sms-purchase">
                      Purchase SMS Credits
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                SMS Analytics
              </CardTitle>
              <CardDescription>
                Monitor your SMS usage and engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 border rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    0
                  </div>
                  <p className="text-sm text-gray-500 mt-1">SMS Sent This Month</p>
                </div>
                <div className="text-center p-6 border rounded-lg">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    100%
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Delivery Rate</p>
                </div>
                <div className="text-center p-6 border rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {smsCredits}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Credits Remaining</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}