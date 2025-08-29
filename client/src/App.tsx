import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import LoginPage from "@/pages/LoginPage";
import TeacherDashboard from "@/pages/TeacherDashboard";
import StudentDashboard from "@/pages/StudentDashboard";
import ExamManagement from "@/pages/ExamManagement";
import Messages from "@/pages/Messages";
import NoticeBoard from "@/pages/NoticeBoard";
import NotFound from "@/pages/not-found";

// Teacher feature pages
import AIQuestions from "@/pages/teacher/AIQuestions";
import Students from "@/pages/teacher/Students";
import SMSPurchase from "@/pages/teacher/SMSPurchase";
import SMS from "@/pages/teacher/SMS";
import Exams from "@/pages/teacher/Exams";
import Quest from "@/pages/teacher/Quest";
import Reports from "@/pages/teacher/Reports";
import Attendance from "@/pages/teacher/Attendance";
import APISettings from "@/pages/teacher/APISettings";

// Student feature pages
import StudentHome from "@/pages/student/StudentHome";
import StudentAIHelp from "@/pages/student/StudentAIHelp";
import StudentExams from "@/pages/student/StudentExams";
import StudentQuest from "@/pages/student/StudentQuest";
import StudentReports from "@/pages/student/StudentReports";
import StudentMessages from "@/pages/student/StudentMessages";
import StudentStudy from "@/pages/student/StudentStudy";
import StudentExamView from "@/pages/student/StudentExamView";
import StudentQuestionBank from "@/pages/student/StudentQuestionBank";
import TeacherQuestionBank from "@/pages/teacher/TeacherQuestionBank";
import TeacherCourseManagement from "@/pages/teacher/TeacherCourseManagement";
import TeacherProfileManagement from "@/pages/teacher/TeacherProfileManagement";

function Router() {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes - only show when not authenticated */}
      {!isAuthenticated && (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={LoginPage} />
        </>
      )}
      
      {/* Protected routes - only show when authenticated */}
      {isAuthenticated && (
        <>
          {/* Role-based home route */}
          <Route path="/">
            {(user as any)?.role === 'teacher' ? <TeacherDashboard /> : <StudentHome />}
          </Route>
          
          {/* Teacher routes - only accessible by teachers */}
          {(user as any)?.role === 'teacher' && (
            <>
              <Route path="/teacher" component={TeacherDashboard} />
              <Route path="/teacher/ai-questions" component={AIQuestions} />
              <Route path="/teacher/students" component={Students} />
              <Route path="/teacher/sms-purchase" component={SMSPurchase} />
              <Route path="/teacher/sms" component={SMS} />
              <Route path="/teacher/exams" component={Exams} />
              <Route path="/teacher/quest" component={Quest} />
              <Route path="/teacher/reports" component={Reports} />
              <Route path="/teacher/api-settings" component={APISettings} />
              <Route path="/teacher/question-bank" component={TeacherQuestionBank} />
              <Route path="/courses" component={TeacherCourseManagement} />
              <Route path="/profile" component={TeacherProfileManagement} />
              <Route path="/attendance" component={Attendance} />
              <Route path="/messages" component={Messages} />
              <Route path="/notices" component={NoticeBoard} />
            </>
          )}
          
          {/* Student routes - only accessible by students */}
          {(user as any)?.role === 'student' && (
            <>
              <Route path="/student" component={StudentHome} />
              <Route path="/student/ai-help" component={StudentAIHelp} />
              <Route path="/student/exams" component={StudentExams} />
              <Route path="/student/quest" component={StudentQuest} />
              <Route path="/student/reports" component={StudentReports} />
              <Route path="/student/messages" component={StudentMessages} />
              <Route path="/student/study" component={StudentStudy} />
              <Route path="/student/exam/:examId/view" component={StudentExamView} />
              <Route path="/student/question-bank" component={StudentQuestionBank} />
              <Route path="/attendance" component={Attendance} />
              <Route path="/messages" component={Messages} />
              <Route path="/notices" component={NoticeBoard} />
            </>
          )}
        </>
      )}
      
      {/* Fallback for any unmatched routes */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
