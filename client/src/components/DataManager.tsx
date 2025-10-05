import React, { useState } from 'react';
import { Download, Upload, Database, RefreshCw, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { frontendDB } from '../lib/frontendDB';

export default function DataManager() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [stats, setStats] = useState<{
    batches: number;
    students: number;
    exams: number;
    results: number;
    teachers: number;
  } | null>(null);

  // Load database statistics
  const loadStats = async () => {
    try {
      const [batches, students, exams, results, teachers] = await Promise.all([
        frontendDB.getAllBatches(),
        frontendDB.getAllStudents(),
        frontendDB.getAllExams(),
        frontendDB.getAllResults(),
        frontendDB.getAllTeachers()
      ]);

      setStats({
        batches: batches.length,
        students: students.length,
        exams: exams.length,
        results: results.length,
        teachers: teachers.length
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  // Export data to JSON file
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const jsonData = await frontendDB.exportAllData();
      
      // Create and download file
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `coachmanager_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: 'Data exported successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export data.' });
    } finally {
      setIsExporting(false);
    }
  };

  // Import data from JSON file
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const success = await frontendDB.importData(text);
      
      if (success) {
        setMessage({ type: 'success', text: 'Data imported successfully!' });
        await loadStats();
      } else {
        setMessage({ type: 'error', text: 'Failed to import data. Please check the file format.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to read file.' });
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  // Create sample data
  const handleCreateSampleData = async () => {
    try {
      await frontendDB.createSampleData();
      setMessage({ type: 'success', text: 'Sample data created successfully!' });
      await loadStats();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create sample data.' });
    }
  };

  // Clear all data
  const handleClearData = async () => {
    if (!window.confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
      return;
    }

    setIsClearing(true);
    try {
      await frontendDB.clearAllData();
      setMessage({ type: 'success', text: 'All data cleared successfully!' });
      await loadStats();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to clear data.' });
    } finally {
      setIsClearing(false);
    }
  };

  // Close message
  const closeMessage = () => setMessage(null);

  // Load stats on component mount
  React.useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Database className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Frontend Database Manager</h1>
        </div>
        <p className="text-gray-600">
          Manage your local data with import/export functionality. All data is stored locally in your browser.
        </p>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`rounded-lg p-4 flex items-center justify-between ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> :
             message.type === 'error' ? <AlertCircle className="h-5 w-5" /> :
             <AlertCircle className="h-5 w-5" />}
            <span>{message.text}</span>
          </div>
          <button onClick={closeMessage} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>
      )}

      {/* Database Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Database Statistics</h2>
          <button
            onClick={loadStats}
            className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
        
        {stats ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.teachers}</div>
              <div className="text-sm text-blue-800">Teachers</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.batches}</div>
              <div className="text-sm text-green-800">Batches</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.students}</div>
              <div className="text-sm text-purple-800">Students</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.exams}</div>
              <div className="text-sm text-orange-800">Exams</div>
            </div>
            <div className="bg-pink-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-pink-600">{stats.results}</div>
              <div className="text-sm text-pink-800">Results</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">Loading statistics...</div>
        )}
      </div>

      {/* Data Management Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Management</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export Data */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Download className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Export Data</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Download all your data as a JSON file for backup or transfer.
            </p>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export Data
                </>
              )}
            </button>
          </div>

          {/* Import Data */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Upload className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Import Data</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Upload a JSON backup file to restore your data.
            </p>
            <label className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer">
              {isImporting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Import Data
                </>
              )}
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={isImporting}
                className="hidden"
              />
            </label>
          </div>

          {/* Create Sample Data */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Database className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Sample Data</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Create sample batches, students, and exams for testing.
            </p>
            <button
              onClick={handleCreateSampleData}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 flex items-center justify-center gap-2"
            >
              <Database className="h-4 w-4" />
              Create Sample Data
            </button>
          </div>

          {/* Clear All Data */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-gray-900">Clear Data</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Delete all data from the local database. This cannot be undone.
            </p>
            <button
              onClick={handleClearData}
              disabled={isClearing}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isClearing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Clear All Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Usage Instructions</h2>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong>Frontend Database:</strong> All data is stored locally in your browser using IndexedDB and localStorage as backup.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong>Export:</strong> Download your data as JSON file for backup or sharing with other devices.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong>Import:</strong> Upload a JSON backup file to restore data. This will replace all existing data.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong>Sample Data:</strong> Creates example batches, students, and exams for testing the system.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong>Clear Data:</strong> Permanently deletes all local data. Make sure to export first!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
