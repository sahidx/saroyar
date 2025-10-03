import React, { useState, useEffect } from 'react';
import { Database, Server, Settings, Download, Upload } from 'lucide-react';

type DatabaseMode = 'backend' | 'frontend';

interface DatabaseModeSelectorProps {
  onModeChange: (mode: DatabaseMode) => void;
  currentMode: DatabaseMode;
}

export default function DatabaseModeSelector({ onModeChange, currentMode }: DatabaseModeSelectorProps) {
  const [showSettings, setShowSettings] = useState(false);

  const handleModeChange = (mode: DatabaseMode) => {
    localStorage.setItem('database_mode', mode);
    onModeChange(mode);
    setShowSettings(false);
  };

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 z-40"
        title="Database Settings"
      >
        <Settings className="h-5 w-5" />
      </button>

      {/* Mode Selector Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Database Mode</h2>
              <p className="text-sm text-gray-600">Choose how to store your data</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Backend Mode */}
              <div
                onClick={() => handleModeChange('backend')}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  currentMode === 'backend'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Server className={`h-6 w-6 mt-1 ${
                    currentMode === 'backend' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      currentMode === 'backend' ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      Backend Database
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Uses PostgreSQL server for data storage. Requires backend connection.
                    </p>
                    <div className="mt-2 space-y-1">
                      <div className="text-xs text-gray-500">✓ Shared across devices</div>
                      <div className="text-xs text-gray-500">✓ Backup & sync</div>
                      <div className="text-xs text-red-500">✗ Requires server connection</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Frontend Mode */}
              <div
                onClick={() => handleModeChange('frontend')}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  currentMode === 'frontend'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Database className={`h-6 w-6 mt-1 ${
                    currentMode === 'frontend' ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      currentMode === 'frontend' ? 'text-green-900' : 'text-gray-900'
                    }`}>
                      Frontend Database
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Uses browser storage (IndexedDB). Works offline without backend.
                    </p>
                    <div className="mt-2 space-y-1">
                      <div className="text-xs text-gray-500">✓ Works offline</div>
                      <div className="text-xs text-gray-500">✓ No server required</div>
                      <div className="text-xs text-gray-500">✓ Export/Import data</div>
                      <div className="text-xs text-red-500">✗ Local to this browser only</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <div className="text-xs text-gray-500">
                Current: <span className="font-medium capitalize">{currentMode}</span> Mode
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode Indicator */}
      <div className="fixed bottom-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 border z-40">
        <div className="flex items-center gap-2 text-sm">
          {currentMode === 'backend' ? (
            <>
              <Server className="h-4 w-4 text-blue-600" />
              <span className="text-blue-600 font-medium">Backend Mode</span>
            </>
          ) : (
            <>
              <Database className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-medium">Frontend Mode</span>
            </>
          )}
        </div>
      </div>
    </>
  );
}