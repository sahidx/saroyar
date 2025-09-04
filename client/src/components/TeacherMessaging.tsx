import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Send, 
  User, 
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface TeacherMessagingProps {
  isDarkMode: boolean;
}

export function TeacherMessaging({ isDarkMode }: TeacherMessagingProps) {
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all students for messaging
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/messages/students"],
  });

  // Fetch conversation with selected student
  const { data: conversation = [], isLoading: conversationLoading } = useQuery({
    queryKey: ["/api/messages/conversation", selectedStudent?.id],
    enabled: !!selectedStudent?.id,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { receiverId: string; content: string }) => {
      return await apiRequest("POST", "/api/messages/send", data);
    },
    onSuccess: () => {
      toast({
        title: "✅ Message Sent",
        description: `Message sent to ${selectedStudent?.firstName} ${selectedStudent?.lastName}`,
      });
      setNewMessage('');
      // Refresh conversation and student list
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversation", selectedStudent?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/students"] });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Failed to Send Message",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedStudent) return;

    sendMessageMutation.mutate({
      receiverId: selectedStudent.id,
      content: newMessage.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Student List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Students
          </CardTitle>
          <CardDescription>
            Select a student to send messages
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[480px]">
            {studentsLoading ? (
              <div className="p-4 text-center text-gray-500">Loading students...</div>
            ) : (students as any[]).length === 0 ? (
              <div className="p-4 text-center text-gray-500">No students found</div>
            ) : (
              <div className="space-y-2 p-4">
                {(students as any[]).map((student: any) => (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 border ${
                      selectedStudent?.id === student.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent'
                    }`}
                    data-testid={`student-${student.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                          {student.firstName?.[0]}{student.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {student.phoneNumber}
                        </p>
                        {student.lastMessage && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1">
                            {student.lastMessage.isFromMe ? 'You: ' : ''}
                            {student.lastMessage.content}
                          </p>
                        )}
                      </div>
                      {student.lastMessage && !student.lastMessage.isRead && !student.lastMessage.isFromMe && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            {selectedStudent ? (
              <>
                <User className="h-5 w-5 text-green-600" />
                Chat with {selectedStudent.firstName} {selectedStudent.lastName}
              </>
            ) : (
              <>
                <MessageSquare className="h-5 w-5 text-gray-400" />
                Select a student to start messaging
              </>
            )}
          </CardTitle>
          {selectedStudent && (
            <CardDescription>
              Phone: {selectedStudent.phoneNumber} • Student ID: {selectedStudent.studentId}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex flex-col h-[480px]">
          {!selectedStudent ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>Select a student from the list to start messaging</p>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1 mb-4 pr-4">
                {conversationLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading conversation...</div>
                ) : (conversation as any[]).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(conversation as any[]).map((message: any) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderRole === 'teacher' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.senderRole === 'teacher'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 opacity-60" />
                            <span className="text-xs opacity-60">
                              {format(new Date(message.createdAt), 'MMM dd, HH:mm')}
                            </span>
                            {message.senderRole === 'teacher' && (
                              <CheckCircle2 className="h-3 w-3 opacity-60 ml-1" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                  data-testid="message-input"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="px-4 py-2 h-[60px]"
                  data-testid="send-message-button"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}