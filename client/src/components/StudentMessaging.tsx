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
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { format } from 'date-fns';

interface StudentMessagingProps {
  isDarkMode: boolean;
}

export function StudentMessaging({ isDarkMode }: StudentMessagingProps) {
  const [newMessage, setNewMessage] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch teacher info
  const { data: teacher, isLoading: teacherLoading } = useQuery({
    queryKey: ["/api/messages/teacher"],
  });

  // Fetch conversation with teacher
  const { data: conversation = [], isLoading: conversationLoading } = useQuery({
    queryKey: ["/api/messages/conversation", teacher?.id],
    enabled: !!teacher?.id,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { receiverId: string; content: string }) => {
      return await apiRequest("POST", "/api/messages/send", data);
    },
    onSuccess: () => {
      toast({
        title: "✅ Message Sent",
        description: "Your message has been sent to the teacher",
      });
      setNewMessage('');
      // Refresh conversation
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversation", teacher?.id] });
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
    if (!newMessage.trim() || !teacher) return;

    sendMessageMutation.mutate({
      receiverId: teacher.id,
      content: newMessage.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (teacherLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading teacher information...</p>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500">Teacher information not available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            শিক্ষকের বার্তা সমূহ
          </CardTitle>
          <CardDescription className="text-center">
            Teacher Messages - Communicate with your teacher
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Teacher Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 text-xl">
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{teacher.name}</h3>
              <p className="text-gray-600 dark:text-gray-400">Chemistry & ICT Teacher</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">Phone: {teacher.phoneNumber}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Chat Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Conversation with Teacher
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages */}
          <ScrollArea className="h-96 border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
            {conversationLoading ? (
              <div className="text-center py-8 text-gray-500">Loading conversation...</div>
            ) : (conversation as any[]).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>No messages yet. Start the conversation with your teacher!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(conversation as any[]).map((message: any) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderRole === 'student' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        message.senderRole === 'student'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium opacity-75">
                          {message.senderRole === 'student' ? 'You' : 'Teacher'}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Clock className="h-3 w-3 opacity-60" />
                        <span className="text-xs opacity-60">
                          {format(new Date(message.createdAt), 'MMM dd, HH:mm')}
                        </span>
                        {message.senderRole === 'student' && (
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Send Message to Teacher
              </label>
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here... (আপনার বার্তা এখানে লিখুন...)"
                className="min-h-[100px] resize-none"
                data-testid="student-message-input"
              />
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {newMessage.length}/500 characters
              </p>
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sendMessageMutation.isPending || newMessage.length > 500}
                className="px-6 py-2"
                data-testid="student-send-button"
              >
                {sendMessageMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Send Message
                  </div>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                Messaging Guidelines:
              </p>
              <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Be respectful and use appropriate language</li>
                <li>• Ask questions about chemistry, ICT, or your studies</li>
                <li>• Messages are limited to 500 characters</li>
                <li>• Your teacher will respond during class hours</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}