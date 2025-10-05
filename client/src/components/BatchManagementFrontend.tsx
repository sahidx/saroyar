import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Users, Calendar, BookOpen } from 'lucide-react';
import { useBatches } from '../hooks/useFrontendDB';
import type { Batch } from '../lib/frontendDB';

interface BatchFormData {
  batch_code: string;
  name: string;
  subject: string;
  class_time: string;
  description?: string;
}

export default function BatchManagement() {
  const { batches, loading, error, createBatch, updateBatch, deleteBatch } = useBatches();
  const [showForm, setShowForm] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [formData, setFormData] = useState<BatchFormData>({
    batch_code: '',
    name: '',
    subject: '',
    class_time: '',
    description: ''
  });

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
    'Bangla', 'ICT', 'Economics', 'Accounting', 'Management'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBatch) {
        await updateBatch(editingBatch.id, formData);
      } else {
        await createBatch(formData);
      }
      resetForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch);
    setFormData({
      batch_code: batch.batch_code,
      name: batch.name,
      subject: batch.subject,
      class_time: batch.class_time,
      description: batch.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (batch: Batch) => {
    if (window.confirm(`Are you sure you want to delete batch "${batch.name}"? This will also delete all students and exams in this batch.`)) {
      try {
        await deleteBatch(batch.id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Delete failed');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      batch_code: '',
      name: '',
      subject: '',
      class_time: '',
      description: ''
    });
    setEditingBatch(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading batches...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Batch Management</h1>
          <p className="text-gray-600">Manage your course batches and class schedules</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Batch
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingBatch ? 'Edit Batch' : 'Add New Batch'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Code *
                </label>
                <input
                  type="text"
                  value={formData.batch_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, batch_code: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g., PHY2025"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g., Physics HSC 2025"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class Time *
                </label>
                <input
                  type="text"
                  value={formData.class_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, class_time: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g., 10:00 AM - 12:00 PM"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  placeholder="Optional description..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingBatch ? 'Update' : 'Create'} Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.map((batch) => (
          <div key={batch.id} className="bg-white rounded-lg shadow-md p-6 border">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{batch.name}</h3>
                <p className="text-sm text-gray-600">Code: {batch.batch_code}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(batch)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Edit batch"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(batch)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Delete batch"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BookOpen className="h-4 w-4" />
                <span>{batch.subject}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{batch.class_time}</span>
              </div>
              {batch.description && (
                <p className="text-sm text-gray-600 mt-2">{batch.description}</p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Created: {new Date(batch.created_at).toLocaleDateString()}</span>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>0 students</span> {/* TODO: Count from frontend DB */}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {batches.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No batches yet</h3>
          <p className="text-gray-600 mb-4">Create your first batch to get started</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add First Batch
          </button>
        </div>
      )}
    </div>
  );
}