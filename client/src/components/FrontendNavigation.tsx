import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Users, 
  GraduationCap, 
  FileText, 
  BarChart3, 
  Database, 
  Menu, 
  X,
  Home,
  Settings
} from 'lucide-react';

interface FrontendNavProps {
  onDataManager: () => void;
}

export default function FrontendNavigation({ onDataManager }: FrontendNavProps) {
  const [location, setLocation] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/frontend', icon: Home },
    { name: 'Batch Management', href: '/frontend/batches', icon: GraduationCap },
    { name: 'Student Management', href: '/frontend/students', icon: Users },
    { name: 'Exam Management', href: '/frontend/exams', icon: FileText },
    { name: 'Results & Reports', href: '/frontend/results', icon: BarChart3 },
    { name: 'Data Manager', href: '/frontend/data', icon: Database },
  ];

  const handleNavigation = (href: string, name: string) => {
    if (name === 'Data Manager') {
      onDataManager();
    } else {
      setLocation(href);
    }
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="bg-white p-2 rounded-md shadow-lg"
        >
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Database className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="font-bold text-gray-900">CoachManager</h1>
                <p className="text-xs text-green-600">Frontend Mode</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = location === item.href || 
                  (item.name === 'Data Manager' && location === '/frontend/data');
                
                return (
                  <li key={item.name}>
                    <button
                      onClick={() => handleNavigation(item.href, item.name)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${
                        isActive ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                      <span className="font-medium">{item.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <div className="text-xs text-gray-500">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-green-500" />
                <span>Offline Storage Active</span>
              </div>
              <div>All data stored locally in browser</div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
}