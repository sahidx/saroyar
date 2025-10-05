import React, { useState } from 'react';
import { Switch, Route, useLocation } from 'wouter';
import FrontendNavigation from './FrontendNavigation';
import BatchManagementFrontend from './BatchManagementFrontend';
import StudentManagementFrontend from './StudentManagementFrontend';
import DataManager from './DataManager';
import { useDBStats } from '../hooks/useFrontendDB';
import { 
  Users, 
  GraduationCap, 
  FileText, 
  BarChart3, 
  Database,
  BookOpen,
  UserCheck,
  Calendar,
  TrendingUp
} from 'lucide-react';

function FrontendDashboard() {
  const { stats, loading } = useDBStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to CoachManager Frontend Mode</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Teachers</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : stats?.teachers || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <GraduationCap className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Batches</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : stats?.batches || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <UserCheck className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Students</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : stats?.students || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Exams</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : stats?.exams || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/frontend/batches"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">Manage Batches</div>
              <div className="text-sm text-gray-600">Create and organize course batches</div>
            </div>
          </a>

          <a
            href="/frontend/students"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="h-6 w-6 text-green-600" />
            <div>
              <div className="font-medium text-gray-900">Manage Students</div>
              <div className="text-sm text-gray-600">Add and track student information</div>
            </div>
          </a>

          <a
            href="/frontend/data"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Database className="h-6 w-6 text-purple-600" />
            <div>
              <div className="font-medium text-gray-900">Data Manager</div>
              <div className="text-sm text-gray-600">Export, import, and backup data</div>
            </div>
          </a>
        </div>
      </div>

      {/* Features Info */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Frontend Mode Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Works completely offline</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>No server connection required</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Fast local storage (IndexedDB)</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Export/Import data as JSON</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Automatic backup to localStorage</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Sample data for testing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Placeholder components for future implementation
function FrontendExamManagement() {
  return (
    <div className="text-center py-12">
      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Exam Management</h3>
      <p className="text-gray-600">Coming soon in frontend mode</p>
    </div>
  );
}

function FrontendResults() {
  return (
    <div className="text-center py-12">
      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Results & Reports</h3>
      <p className="text-gray-600">Coming soon in frontend mode</p>
    </div>
  );
}

export default function FrontendApp() {
  const [location, setLocation] = useLocation();
  const [showDataManager, setShowDataManager] = useState(false);

  const handleDataManager = () => {
    setShowDataManager(true);
    setLocation('/frontend/data');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <FrontendNavigation onDataManager={handleDataManager} />
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <main className="p-4 lg:p-8">
          <Switch>
            <Route path="/frontend" component={FrontendDashboard} />
            <Route path="/frontend/batches" component={BatchManagementFrontend} />
            <Route path="/frontend/students" component={StudentManagementFrontend} />
            <Route path="/frontend/exams" component={FrontendExamManagement} />
            <Route path="/frontend/results" component={FrontendResults} />
            <Route path="/frontend/data" component={DataManager} />
          </Switch>
        </main>
      </div>
    </div>
  );
}