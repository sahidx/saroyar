import { useState, useEffect, useCallback } from 'react';
import { frontendDB, type Batch, type Student, type Exam, type ExamResult, type Teacher } from '../lib/frontendDB';

// ============================================================================
// Frontend Database React Hooks
// ============================================================================

// Hook for batches
export function useBatches() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBatches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await frontendDB.getAllBatches();
      setBatches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load batches');
    } finally {
      setLoading(false);
    }
  }, []);

  const createBatch = useCallback(async (batchData: Omit<Batch, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newBatch = await frontendDB.createBatch(batchData);
      setBatches(prev => [...prev, newBatch]);
      return newBatch;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create batch');
    }
  }, []);

  const updateBatch = useCallback(async (id: string, updates: Partial<Batch>) => {
    try {
      const updated = await frontendDB.updateBatch(id, updates);
      if (updated) {
        setBatches(prev => prev.map(batch => batch.id === id ? updated : batch));
      }
      return updated;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update batch');
    }
  }, []);

  const deleteBatch = useCallback(async (id: string) => {
    try {
      const success = await frontendDB.deleteBatch(id);
      if (success) {
        setBatches(prev => prev.filter(batch => batch.id !== id));
      }
      return success;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete batch');
    }
  }, []);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  return {
    batches,
    loading,
    error,
    createBatch,
    updateBatch,
    deleteBatch,
    refresh: loadBatches
  };
}

// Hook for students
export function useStudents(batchId?: string) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = batchId 
        ? await frontendDB.getStudentsByBatch(batchId)
        : await frontendDB.getAllStudents();
      setStudents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  const createStudent = useCallback(async (studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newStudent = await frontendDB.createStudent(studentData);
      setStudents(prev => [...prev, newStudent]);
      return newStudent;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create student');
    }
  }, []);

  const updateStudent = useCallback(async (id: string, updates: Partial<Student>) => {
    try {
      const updated = await frontendDB.updateStudent(id, updates);
      if (updated) {
        setStudents(prev => prev.map(student => student.id === id ? updated : student));
      }
      return updated;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update student');
    }
  }, []);

  const deleteStudent = useCallback(async (id: string) => {
    try {
      const success = await frontendDB.deleteStudent(id);
      if (success) {
        setStudents(prev => prev.filter(student => student.id !== id));
      }
      return success;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete student');
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  return {
    students,
    loading,
    error,
    createStudent,
    updateStudent,
    deleteStudent,
    refresh: loadStudents
  };
}

// Hook for exams
export function useExams(batchId?: string) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = batchId 
        ? await frontendDB.getExamsByBatch(batchId)
        : await frontendDB.getAllExams();
      setExams(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  const createExam = useCallback(async (examData: Omit<Exam, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newExam = await frontendDB.createExam(examData);
      setExams(prev => [...prev, newExam]);
      return newExam;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create exam');
    }
  }, []);

  const updateExam = useCallback(async (id: string, updates: Partial<Exam>) => {
    try {
      const updated = await frontendDB.updateExam(id, updates);
      if (updated) {
        setExams(prev => prev.map(exam => exam.id === id ? updated : exam));
      }
      return updated;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update exam');
    }
  }, []);

  const deleteExam = useCallback(async (id: string) => {
    try {
      const success = await frontendDB.deleteExam(id);
      if (success) {
        setExams(prev => prev.filter(exam => exam.id !== id));
      }
      return success;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete exam');
    }
  }, []);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  return {
    exams,
    loading,
    error,
    createExam,
    updateExam,
    deleteExam,
    refresh: loadExams
  };
}

// Hook for results
export function useResults(examId?: string, studentId?: string) {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResults = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let data: ExamResult[];
      
      if (examId) {
        data = await frontendDB.getResultsByExam(examId);
      } else if (studentId) {
        data = await frontendDB.getResultsByStudent(studentId);
      } else {
        data = await frontendDB.getAllResults();
      }
      
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load results');
    } finally {
      setLoading(false);
    }
  }, [examId, studentId]);

  const createResult = useCallback(async (resultData: Omit<ExamResult, 'id'>) => {
    try {
      const newResult = await frontendDB.createResult(resultData);
      setResults(prev => [...prev, newResult]);
      return newResult;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create result');
    }
  }, []);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  return {
    results,
    loading,
    error,
    createResult,
    refresh: loadResults
  };
}

// Hook for teachers
export function useTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTeachers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await frontendDB.getAllTeachers();
      setTeachers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teachers');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTeacher = useCallback(async (teacherData: Omit<Teacher, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newTeacher = await frontendDB.createTeacher(teacherData);
      setTeachers(prev => [...prev, newTeacher]);
      return newTeacher;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create teacher');
    }
  }, []);

  const getTeacherByPhone = useCallback(async (phone: string) => {
    try {
      return await frontendDB.getTeacherByPhone(phone);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to get teacher');
    }
  }, []);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  return {
    teachers,
    loading,
    error,
    createTeacher,
    getTeacherByPhone,
    refresh: loadTeachers
  };
}

// Hook for authentication with frontend database
export function useFrontendAuth() {
  const [currentUser, setCurrentUser] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (phone: string, password: string) => {
    try {
      // Simple authentication - in a real app, you'd hash passwords
      const teacher = await frontendDB.getTeacherByPhone(phone);
      
      if (teacher && password === 'admin') { // Simplified for demo
        setCurrentUser(teacher);
        localStorage.setItem('frontend_auth_user', JSON.stringify(teacher));
        return { success: true, user: teacher };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (err) {
      return { success: false, error: 'Login failed' };
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('frontend_auth_user');
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const stored = localStorage.getItem('frontend_auth_user');
      if (stored) {
        const user = JSON.parse(stored);
        setCurrentUser(user);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    currentUser,
    loading,
    login,
    logout,
    isAuthenticated: !!currentUser
  };
}

// Hook for database statistics
export function useDBStats() {
  const [stats, setStats] = useState<{
    batches: number;
    students: number;
    exams: number;
    results: number;
    teachers: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
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
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    refresh: loadStats
  };
}