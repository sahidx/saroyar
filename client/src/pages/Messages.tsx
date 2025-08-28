import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export default function Messages() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Messages"
          subtitle="Communicate with students and teachers"
        />
        
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-16">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Messages</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Messaging functionality will be implemented here. You'll be able to communicate with students and teachers.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
