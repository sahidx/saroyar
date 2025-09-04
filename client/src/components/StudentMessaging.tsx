import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
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
  BookOpen,
  Smile
} from 'lucide-react';
import { format } from 'date-fns';

interface StudentMessagingProps {
  isDarkMode: boolean;
}

export function StudentMessaging({ isDarkMode }: StudentMessagingProps) {
  const [newMessage, setNewMessage] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch teacher info
  const { data: teacher, isLoading: teacherLoading } = useQuery({
    queryKey: ["/api/messages/teacher"],
  });

  // Fetch conversation with teacher
  const { data: conversation = [], isLoading: conversationLoading } = useQuery({
    queryKey: ["/api/messages/conversation", teacher?.id],
    enabled: !!teacher?.id,
    refetchInterval: 3000, // Refresh every 3 seconds for real-time feel
  });

  // Auto-scroll when conversation updates
  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

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
      // Refresh conversation immediately
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
    <div className="max-w-md mx-auto h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header - WhatsApp style */}
      <div className="bg-green-600 dark:bg-green-700 text-white p-4 flex items-center gap-3 shadow-lg">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-green-500 text-white text-sm font-bold">
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{teacher.name}</h3>
          <p className="text-green-100 text-sm">Chemistry & ICT Teacher</p>
        </div>
        <div className="text-green-100">
          <MessageSquare className="h-5 w-5" />
        </div>
      </div>

      {/* Messages Area - WhatsApp style */}
      <div 
        className="flex-1 bg-gray-50 dark:bg-gray-800 bg-opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        <ScrollArea className="h-full p-4">
          {conversationLoading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-pulse flex justify-center mb-4">
                <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
              </div>
              Loading conversation...
            </div>
          ) : (conversation as any[]).length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-lg font-semibold mb-2">শিক্ষকের সাথে কথা বলুন</p>
              <p className="text-sm">Start a conversation with your teacher!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(conversation as any[]).map((message: any) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderRole === 'student' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 shadow-sm ${
                      message.senderRole === 'student'
                        ? 'bg-green-500 text-white rounded-br-sm'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <div className={`flex items-center gap-1 mt-1 ${
                      message.senderRole === 'student' ? 'justify-end' : 'justify-start'
                    }`}>
                      <span className={`text-xs ${
                        message.senderRole === 'student' 
                          ? 'text-green-100' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {format(new Date(message.createdAt), 'HH:mm')}
                      </span>
                      {message.senderRole === 'student' && (
                        <CheckCircle2 className="h-3 w-3 text-green-100" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Input Area - WhatsApp style */}
      <div className="bg-white dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message... (বার্তা লিখুন...)"
              className="min-h-[50px] max-h-[120px] resize-none rounded-full border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500"
              data-testid="student-message-input"
            />
            <div className="flex justify-between items-center mt-1 px-3">
              <div className="flex items-center gap-2 text-gray-400">
                <Smile className="h-4 w-4" />
                <span className="text-xs">{newMessage.length}/500</span>
              </div>
              {newMessage.trim() && (
                <span className="text-xs text-green-600 font-medium">Press Enter to send</span>
              )}
            </div>
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendMessageMutation.isPending || newMessage.length > 500}
            className="h-12 w-12 rounded-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
            data-testid="student-send-button"
          >
            {sendMessageMutation.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Instructions footer */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 text-center">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          💡 Be respectful • Ask study questions • Messages refresh automatically
        </p>
      </div>
    </div>
  );
}