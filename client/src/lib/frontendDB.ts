// ============================================================================
// Frontend Database System - LocalStorage + IndexedDB Hybrid
// ============================================================================
// This provides a complete database replacement for frontend-only operations
// Supports: CRUD operations, data export/import, offline functionality
// ============================================================================

export interface Student {
  id: string;
  phone: string;
  first_name: string;
  last_name: string;
  email?: string;
  batch_id: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Batch {
  id: string;
  batch_code: string;
  name: string;
  subject: string;
  class_time: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Exam {
  id: string;
  title: string;
  batch_id: string;
  subject: string;
  duration: number; // in minutes
  total_marks: number;
  exam_date: string;
  questions: ExamQuestion[];
  created_at: string;
  updated_at: string;
}

export interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number; // index of correct option
  explanation?: string;
  marks: number;
}

export interface ExamResult {
  id: string;
  exam_id: string;
  student_id: string;
  score: number;
  total_marks: number;
  percentage: number;
  answers: StudentAnswer[];
  completed_at: string;
}

export interface StudentAnswer {
  question_id: string;
  selected_option: number;
  is_correct: boolean;
  marks_obtained: number;
}

export interface Teacher {
  id: string;
  phone: string;
  first_name: string;
  last_name: string;
  email?: string;
  role: 'admin' | 'teacher';
  subjects: string[];
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Frontend Database Class
// ============================================================================

class FrontendDatabase {
  private dbName = 'coachmanager_frontend_db';
  private version = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  // Initialize IndexedDB
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('students')) {
          db.createObjectStore('students', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('batches')) {
          db.createObjectStore('batches', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('exams')) {
          db.createObjectStore('exams', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('results')) {
          db.createObjectStore('results', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('teachers')) {
          db.createObjectStore('teachers', { keyPath: 'id' });
        }
      };
    });
  }

  // Utility function to generate ID
  private generateId(): string {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Generic CRUD operations
  private async performTransaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);
      const request = operation(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // ============================================================================
  // BATCH OPERATIONS
  // ============================================================================

  async createBatch(batchData: Omit<Batch, 'id' | 'created_at' | 'updated_at'>): Promise<Batch> {
    const batch: Batch = {
      ...batchData,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await this.performTransaction('batches', 'readwrite', (store) => store.add(batch));
    this.syncToLocalStorage();
    return batch;
  }

  async getAllBatches(): Promise<Batch[]> {
    const batches = await this.performTransaction('batches', 'readonly', (store) => store.getAll());
    return batches || [];
  }

  async getBatchById(id: string): Promise<Batch | null> {
    const batch = await this.performTransaction('batches', 'readonly', (store) => store.get(id));
    return batch || null;
  }

  async updateBatch(id: string, updates: Partial<Batch>): Promise<Batch | null> {
    const existing = await this.getBatchById(id);
    if (!existing) return null;

    const updated: Batch = {
      ...existing,
      ...updates,
      id,
      updated_at: new Date().toISOString()
    };

    await this.performTransaction('batches', 'readwrite', (store) => store.put(updated));
    this.syncToLocalStorage();
    return updated;
  }

  async deleteBatch(id: string): Promise<boolean> {
    try {
      await this.performTransaction('batches', 'readwrite', (store) => store.delete(id));
      // Also delete related students and exams
      await this.deleteStudentsByBatch(id);
      await this.deleteExamsByBatch(id);
      this.syncToLocalStorage();
      return true;
    } catch {
      return false;
    }
  }

  // ============================================================================
  // STUDENT OPERATIONS
  // ============================================================================

  async createStudent(studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student> {
    const student: Student = {
      ...studentData,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await this.performTransaction('students', 'readwrite', (store) => store.add(student));
    this.syncToLocalStorage();
    return student;
  }

  async getAllStudents(): Promise<Student[]> {
    const students = await this.performTransaction('students', 'readonly', (store) => store.getAll());
    return students || [];
  }

  async getStudentById(id: string): Promise<Student | null> {
    const student = await this.performTransaction('students', 'readonly', (store) => store.get(id));
    return student || null;
  }

  async getStudentsByBatch(batchId: string): Promise<Student[]> {
    const allStudents = await this.getAllStudents();
    return allStudents.filter(student => student.batch_id === batchId);
  }

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student | null> {
    const existing = await this.getStudentById(id);
    if (!existing) return null;

    const updated: Student = {
      ...existing,
      ...updates,
      id,
      updated_at: new Date().toISOString()
    };

    await this.performTransaction('students', 'readwrite', (store) => store.put(updated));
    this.syncToLocalStorage();
    return updated;
  }

  async deleteStudent(id: string): Promise<boolean> {
    try {
      await this.performTransaction('students', 'readwrite', (store) => store.delete(id));
      // Also delete related results
      await this.deleteResultsByStudent(id);
      this.syncToLocalStorage();
      return true;
    } catch {
      return false;
    }
  }

  private async deleteStudentsByBatch(batchId: string): Promise<void> {
    const students = await this.getStudentsByBatch(batchId);
    for (const student of students) {
      await this.deleteStudent(student.id);
    }
  }

  // ============================================================================
  // EXAM OPERATIONS
  // ============================================================================

  async createExam(examData: Omit<Exam, 'id' | 'created_at' | 'updated_at'>): Promise<Exam> {
    const exam: Exam = {
      ...examData,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await this.performTransaction('exams', 'readwrite', (store) => store.add(exam));
    this.syncToLocalStorage();
    return exam;
  }

  async getAllExams(): Promise<Exam[]> {
    const exams = await this.performTransaction('exams', 'readonly', (store) => store.getAll());
    return exams || [];
  }

  async getExamById(id: string): Promise<Exam | null> {
    const exam = await this.performTransaction('exams', 'readonly', (store) => store.get(id));
    return exam || null;
  }

  async getExamsByBatch(batchId: string): Promise<Exam[]> {
    const allExams = await this.getAllExams();
    return allExams.filter(exam => exam.batch_id === batchId);
  }

  async updateExam(id: string, updates: Partial<Exam>): Promise<Exam | null> {
    const existing = await this.getExamById(id);
    if (!existing) return null;

    const updated: Exam = {
      ...existing,
      ...updates,
      id,
      updated_at: new Date().toISOString()
    };

    await this.performTransaction('exams', 'readwrite', (store) => store.put(updated));
    this.syncToLocalStorage();
    return updated;
  }

  async deleteExam(id: string): Promise<boolean> {
    try {
      await this.performTransaction('exams', 'readwrite', (store) => store.delete(id));
      // Also delete related results
      await this.deleteResultsByExam(id);
      this.syncToLocalStorage();
      return true;
    } catch {
      return false;
    }
  }

  private async deleteExamsByBatch(batchId: string): Promise<void> {
    const exams = await this.getExamsByBatch(batchId);
    for (const exam of exams) {
      await this.deleteExam(exam.id);
    }
  }

  // ============================================================================
  // RESULT OPERATIONS
  // ============================================================================

  async createResult(resultData: Omit<ExamResult, 'id'>): Promise<ExamResult> {
    const result: ExamResult = {
      ...resultData,
      id: this.generateId()
    };

    await this.performTransaction('results', 'readwrite', (store) => store.add(result));
    this.syncToLocalStorage();
    return result;
  }

  async getAllResults(): Promise<ExamResult[]> {
    const results = await this.performTransaction('results', 'readonly', (store) => store.getAll());
    return results || [];
  }

  async getResultsByExam(examId: string): Promise<ExamResult[]> {
    const allResults = await this.getAllResults();
    return allResults.filter(result => result.exam_id === examId);
  }

  async getResultsByStudent(studentId: string): Promise<ExamResult[]> {
    const allResults = await this.getAllResults();
    return allResults.filter(result => result.student_id === studentId);
  }

  private async deleteResultsByExam(examId: string): Promise<void> {
    const results = await this.getResultsByExam(examId);
    for (const result of results) {
      await this.performTransaction('results', 'readwrite', (store) => store.delete(result.id));
    }
  }

  private async deleteResultsByStudent(studentId: string): Promise<void> {
    const results = await this.getResultsByStudent(studentId);
    for (const result of results) {
      await this.performTransaction('results', 'readwrite', (store) => store.delete(result.id));
    }
  }

  // ============================================================================
  // TEACHER OPERATIONS
  // ============================================================================

  async createTeacher(teacherData: Omit<Teacher, 'id' | 'created_at' | 'updated_at'>): Promise<Teacher> {
    const teacher: Teacher = {
      ...teacherData,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await this.performTransaction('teachers', 'readwrite', (store) => store.add(teacher));
    this.syncToLocalStorage();
    return teacher;
  }

  async getAllTeachers(): Promise<Teacher[]> {
    const teachers = await this.performTransaction('teachers', 'readonly', (store) => store.getAll());
    return teachers || [];
  }

  async getTeacherById(id: string): Promise<Teacher | null> {
    const teacher = await this.performTransaction('teachers', 'readonly', (store) => store.get(id));
    return teacher || null;
  }

  async getTeacherByPhone(phone: string): Promise<Teacher | null> {
    const allTeachers = await this.getAllTeachers();
    return allTeachers.find(teacher => teacher.phone === phone) || null;
  }

  // ============================================================================
  // DATA EXPORT/IMPORT OPERATIONS
  // ============================================================================

  async exportAllData(): Promise<string> {
    const data = {
      batches: await this.getAllBatches(),
      students: await this.getAllStudents(),
      exams: await this.getAllExams(),
      results: await this.getAllResults(),
      teachers: await this.getAllTeachers(),
      exported_at: new Date().toISOString(),
      version: '1.0'
    };

    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData);
      
      // Clear existing data
      await this.clearAllData();

      // Import all data
      if (data.batches) {
        for (const batch of data.batches) {
          await this.performTransaction('batches', 'readwrite', (store) => store.add(batch));
        }
      }

      if (data.students) {
        for (const student of data.students) {
          await this.performTransaction('students', 'readwrite', (store) => store.add(student));
        }
      }

      if (data.exams) {
        for (const exam of data.exams) {
          await this.performTransaction('exams', 'readwrite', (store) => store.add(exam));
        }
      }

      if (data.results) {
        for (const result of data.results) {
          await this.performTransaction('results', 'readwrite', (store) => store.add(result));
        }
      }

      if (data.teachers) {
        for (const teacher of data.teachers) {
          await this.performTransaction('teachers', 'readwrite', (store) => store.add(teacher));
        }
      }

      this.syncToLocalStorage();
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }

  async clearAllData(): Promise<void> {
    const stores = ['batches', 'students', 'exams', 'results', 'teachers'];
    
    for (const storeName of stores) {
      await this.performTransaction(storeName, 'readwrite', (store) => store.clear());
    }
    
    localStorage.removeItem('coachmanager_backup');
  }

  // ============================================================================
  // BACKUP TO LOCALSTORAGE (Fallback)
  // ============================================================================

  private async syncToLocalStorage(): Promise<void> {
    try {
      const backup = await this.exportAllData();
      localStorage.setItem('coachmanager_backup', backup);
    } catch (error) {
      console.error('Backup to localStorage failed:', error);
    }
  }

  async restoreFromLocalStorage(): Promise<boolean> {
    try {
      const backup = localStorage.getItem('coachmanager_backup');
      if (backup) {
        return await this.importData(backup);
      }
      return false;
    } catch (error) {
      console.error('Restore from localStorage failed:', error);
      return false;
    }
  }

  // ============================================================================
  // SAMPLE DATA CREATION
  // ============================================================================

  async createSampleData(): Promise<void> {
    // Create sample teacher
    const teacher = await this.createTeacher({
      phone: '01762602056',
      first_name: 'System',
      last_name: 'Administrator',
      email: 'admin@coachmanager.com',
      role: 'admin',
      subjects: ['Physics', 'Mathematics', 'Chemistry']
    });

    // Create sample batches
    const batch1 = await this.createBatch({
      batch_code: 'PHY2025',
      name: 'Physics HSC 2025',
      subject: 'Physics',
      class_time: '10:00 AM - 12:00 PM',
      description: 'Higher Secondary Certificate Physics Preparation'
    });

    const batch2 = await this.createBatch({
      batch_code: 'MATH2025',
      name: 'Mathematics HSC 2025',
      subject: 'Mathematics',
      class_time: '2:00 PM - 4:00 PM',
      description: 'Higher Secondary Certificate Mathematics Preparation'
    });

    // Create sample students
    await this.createStudent({
      phone: '01700000001',
      first_name: 'Ahmed',
      last_name: 'Rahman',
      email: 'ahmed@example.com',
      batch_id: batch1.id,
      address: 'Dhaka, Bangladesh'
    });

    await this.createStudent({
      phone: '01700000002',
      first_name: 'Fatima',
      last_name: 'Khatun',
      email: 'fatima@example.com',
      batch_id: batch1.id,
      address: 'Chittagong, Bangladesh'
    });

    await this.createStudent({
      phone: '01700000003',
      first_name: 'Mohammad',
      last_name: 'Ali',
      email: 'mohammad@example.com',
      batch_id: batch2.id,
      address: 'Sylhet, Bangladesh'
    });

    // Create sample exam
    await this.createExam({
      title: 'Physics Chapter 1 Test',
      batch_id: batch1.id,
      subject: 'Physics',
      duration: 60,
      total_marks: 50,
      exam_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      questions: [
        {
          id: this.generateId(),
          question: 'What is the unit of force?',
          options: ['Newton', 'Joule', 'Watt', 'Pascal'],
          correct_answer: 0,
          explanation: 'Newton is the SI unit of force, named after Sir Isaac Newton.',
          marks: 10
        },
        {
          id: this.generateId(),
          question: 'Which law states that F = ma?',
          options: ['First Law', 'Second Law', 'Third Law', 'Zeroth Law'],
          correct_answer: 1,
          explanation: 'Newton\'s Second Law states that Force equals mass times acceleration.',
          marks: 10
        }
      ]
    });

    console.log('✅ Sample data created successfully!');
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const frontendDB = new FrontendDatabase();

// Initialize sample data if no data exists
frontendDB.getAllBatches().then(batches => {
  if (batches.length === 0) {
    frontendDB.createSampleData();
  }
});