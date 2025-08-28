import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Megaphone } from 'lucide-react';

export default function NoticeBoard() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Notice Board"
          subtitle="View and manage notices and announcements"
        />
        
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-16">
                <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Notice Board</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Notice board functionality will be implemented here. You'll be able to view and manage announcements.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
