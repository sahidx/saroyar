import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ExamModal } from '@/components/ExamModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, Clock, Users, Edit, Trash } from 'lucide-react';
import { format } from 'date-fns';

interface Exam {
  id: string;
  title: string;
  subject: string;
  examDate: string;
  duration: number;
  examType: string;
  isActive: boolean;
  createdAt: string;
}

export default function ExamManagement() {
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);

  // Fetch exams
  const { data: exams = [], isLoading } = useQuery<Exam[]>({
    queryKey: ['/api/exams'],
  });

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Exam Management"
          subtitle="Create and manage your exams"
          onCreateExam={() => setIsExamModalOpen(true)}
          showCreateButton={true}
        />
        
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">No Exams Yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Get started by creating your first exam. You can add questions, set timers, and manage student submissions.
              </p>
              <Button 
                onClick={() => setIsExamModalOpen(true)}
                size="lg"
                data-testid="create-first-exam-button"
              >
                <FileText className="w-5 h-5 mr-2" />
                Create Your First Exam
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <Card key={exam.id} className="hover:shadow-lg transition-shadow" data-testid={`exam-card-${exam.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2" data-testid={`exam-title-${exam.id}`}>
                          {exam.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge 
                            variant={exam.subject === 'Chemistry' ? 'default' : 'secondary'}
                            data-testid={`exam-subject-${exam.id}`}
                          >
                            {exam.subject}
                          </Badge>
                          <Badge 
                            variant={exam.isActive ? 'default' : 'outline'}
                            className={exam.isActive ? 'bg-secondary' : ''}
                            data-testid={`exam-status-${exam.id}`}
                          >
                            {exam.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" data-testid={`edit-exam-${exam.id}`}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" data-testid={`delete-exam-${exam.id}`}>
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span data-testid={`exam-date-${exam.id}`}>
                          {format(new Date(exam.examDate), 'MMM dd, yyyy at h:mm a')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span data-testid={`exam-duration-${exam.id}`}>
                          {exam.duration} minutes
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4" />
                        <span className="capitalize" data-testid={`exam-type-${exam.id}`}>
                          {exam.examType === 'mcq' ? 'MCQ' : exam.examType === 'written' ? 'Written' : 'Mixed'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>0 submissions</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        data-testid={`view-exam-${exam.id}`}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <ExamModal 
        isOpen={isExamModalOpen} 
        onClose={() => setIsExamModalOpen(false)} 
      />
    </div>
  );
}
