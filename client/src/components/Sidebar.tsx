import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  FileText, 
  HelpCircle, 
  CalendarCheck, 
  MessageSquare, 
  Bell, 
  Megaphone,
  LogOut,
  Menu,
  X,
  GraduationCap,
  BookOpen,
  User
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const teacherMenuItems = [
  { icon: BarChart3, label: 'Dashboard', href: '/' },
  { icon: FileText, label: 'Exam Management', href: '/teacher/exams' },
  { icon: HelpCircle, label: 'Question Bank', href: '/teacher/question-bank' },
  { icon: BookOpen, label: 'Course Management', href: '/courses' },
  { icon: User, label: 'Profile Management', href: '/profile' },
  { icon: CalendarCheck, label: 'Attendance', href: '/attendance' },
  { icon: BarChart3, label: 'Reports', href: '/teacher/reports' },
  { icon: MessageSquare, label: 'SMS Management', href: '/teacher/sms' },
  { icon: Bell, label: 'Students', href: '/teacher/students' },
  { icon: Megaphone, label: 'AI Questions', href: '/teacher/ai-questions' },
];

const studentMenuItems = [
  { icon: BarChart3, label: 'Dashboard', href: '/' },
  { icon: FileText, label: 'My Exams', href: '/student/exams' },
  { icon: HelpCircle, label: 'AI Help', href: '/student/ai-help' },
  { icon: MessageSquare, label: 'Messages', href: '/student/messages' },
  { icon: BookOpen, label: 'Study Materials', href: '/student/study' },
  { icon: CalendarCheck, label: 'Quest & Progress', href: '/student/quest' },
  { icon: BarChart3, label: 'Reports', href: '/student/reports' },
  { icon: Bell, label: 'Question Bank', href: '/student/question-bank' },
];

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = (user as any)?.role === 'teacher' ? teacherMenuItems : studentMenuItems;

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo and Brand */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <GraduationCap className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Belal Sir</h1>
            <p className="text-sm text-gray-500">Chemistry & ICT Care</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors",
                isActive 
                  ? "bg-primary text-white" 
                  : "text-gray-700 hover:bg-gray-100"
              )}
              data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
              onClick={() => setIsMobileOpen(false)}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.label === 'Messages' && (
                <span className="ml-auto bg-accent text-white text-xs px-2 py-1 rounded-full">
                  3
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <img
            src={(user as any)?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150'}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
            data-testid="user-profile-image"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900" data-testid="user-name">
              {(user as any)?.firstName} {(user as any)?.lastName}
            </p>
            <p className="text-xs text-gray-500 capitalize" data-testid="user-role">
              {(user as any)?.role}
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            data-testid="logout-button"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        data-testid="mobile-menu-toggle"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className={cn("w-64 bg-surface shadow-lg border-r border-gray-200 hidden lg:block", className)}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed left-0 top-0 w-64 h-full bg-surface shadow-lg border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
