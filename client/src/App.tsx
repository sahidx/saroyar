import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import StaticLanding from "@/pages/StaticLanding";
import LoginPage from "@/pages/LoginPage";
import TeacherDashboard from "@/pages/TeacherDashboard";

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
          <Route path="/" component={StaticLanding} />
        </>
      )}
      
      {/* Protected routes - only show when authenticated */}
      {isAuthenticated && (
        <>
          {/* Teacher routes */}
          {(user as any)?.role === 'teacher' && (
            <>
              <Route path="/" component={TeacherDashboard} />
              <Route path="/teacher" component={TeacherDashboard} />
              <Route path="/teacher-dashboard" component={TeacherDashboard} />
            </>
          )}
          
          {/* Student routes - simple placeholder */}
          {(user as any)?.role === 'student' && (
            <>
              <Route path="/">
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>
                    <p className="text-gray-600">Coming soon...</p>
                  </div>
                </div>
              </Route>
            </>
          )}
        </>
      )}
      
      {/* Fallback for any unmatched routes - redirect to home */}
      <Route>
        {isAuthenticated ? (
          (user as any)?.role === 'teacher' ? <TeacherDashboard /> : 
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
              <p className="text-gray-600">Welcome back!</p>
            </div>
          </div>
        ) : (
          <StaticLanding />
        )}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
