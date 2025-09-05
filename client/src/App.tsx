import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import LoginPage from "@/pages/LoginPage";
import TeacherDashboard from "@/pages/TeacherDashboard";
import SuperUserDashboard from "@/pages/SuperUserDashboard";
import StudentDashboard from "@/pages/StudentDashboard";
import ExamManagement from "@/pages/ExamManagement";
import Messages from "@/pages/Messages";
import NoticeBoard from "@/pages/NoticeBoard";
import NotFound from "@/pages/not-found";

// Teacher feature pages
import AIQuestions from "@/pages/teacher/AIQuestions";
import Students from "@/pages/teacher/Students";
import SMS from "@/pages/teacher/SMS";
import TeacherMessaging from "@/pages/teacher/Messaging";
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
import StudentResults from "@/pages/student/StudentResults";
import StudentQuestionBank from "@/pages/student/QuestionBank";
import StudentAttendance from "@/pages/student/StudentAttendance";
import TeacherQuestionBank from "@/pages/teacher/QuestionBank";
import TeacherCourseManagement from "@/pages/teacher/TeacherCourseManagement";
import TeacherProfileManagement from "@/pages/teacher/TeacherProfileManagement";
import SMSBilling from "@/pages/teacher/SMSBilling";
import SMSBalance from "@/pages/teacher/SMSBalance";

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
      {/* Always available login route */}
      <Route path="/login" component={LoginPage} />
      
      {/* Public routes - only show when not authenticated */}
      {!isAuthenticated && (
        <>
          <Route path="/" component={Landing} />
        </>
      )}
      
      {/* Protected routes - only show when authenticated */}
      {isAuthenticated && (
        <>
          {/* Role-based home route */}
          <Route path="/">
            {(user as any)?.role === 'super_user' ? <SuperUserDashboard /> : 
             (user as any)?.role === 'teacher' ? <TeacherDashboard /> : <StudentHome />}
          </Route>
          
          {/* Teacher routes - only accessible by teachers */}
          {(user as any)?.role === 'teacher' && (
            <>
              <Route path="/teacher" component={TeacherDashboard} />
              <Route path="/teacher-dashboard" component={TeacherDashboard} />
              <Route path="/teacher/ai-questions" component={AIQuestions} />
              <Route path="/teacher/students" component={Students} />
              <Route path="/teacher/sms" component={SMS} />
              <Route path="/teacher/sms-billing" component={SMSBilling} />
              <Route path="/teacher/sms-balance" component={SMSBalance} />
              <Route path="/teacher/messaging" component={TeacherMessaging} />
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
          
          {/* Super User routes - only accessible by super users */}
          {(user as any)?.role === 'super_user' && (
            <>
              <Route path="/super" component={SuperUserDashboard} />
              <Route path="/super-admin" component={SuperUserDashboard} />
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
              <Route path="/student/results/:examId" component={StudentResults} />
              <Route path="/student/question-bank" component={StudentQuestionBank} />
              <Route path="/student/attendance" component={StudentAttendance} />
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
