import { Bell, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  title: string;
  subtitle: string;
  onCreateExam?: () => void;
  showCreateButton?: boolean;
}

export function Header({ title, subtitle, onCreateExam, showCreateButton = false }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-surface shadow-sm border-b border-gray-200 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900" data-testid="page-title">
              {title}
            </h2>
            <p className="text-gray-600" data-testid="page-subtitle">
              {subtitle}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Quick Actions */}
          {showCreateButton && (user as any)?.role === 'teacher' && (
            <Button
              onClick={onCreateExam}
              className="bg-primary text-white hover:bg-blue-700"
              data-testid="create-exam-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Exam
            </Button>
          )}
          
          {/* Notifications */}
          <button 
            className="relative text-gray-600 hover:text-gray-900 transition-colors"
            data-testid="notifications-button"
          >
            <Bell className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              5
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
