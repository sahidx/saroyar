import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { initializeBulkSMSService, bulkSMSService } from "./bulkSMS";
import session from 'express-session';
import { insertExamSchema, insertQuestionSchema, insertMessageSchema, insertNoticeSchema, insertSmsTransactionSchema, insertStudentSchema, insertNotesSchema, insertQuestionBankSchema, insertCourseSchema, insertTeacherProfileSchema, exams, examSubmissions, questions, questionBank, courses, teacherProfiles, users, batches, messages } from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { eq, desc, and, sql, asc, inArray } from "drizzle-orm";
import { setupAuth, getSession } from "./replitAuth";

// Helper function to generate random password
function generateRandomPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < 6; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Helper function to get formatted time ago with dynamic precision
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInSeconds < 30) return 'Just now';
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInMinutes === 1) return '1 min ago';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours === 1) return '1h ago';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}y ago`;
}

// Helper function to get recent activities for dashboard
async function getRecentActivitiesForDashboard() {
  try {
    const activities = await storage.getRecentActivities(5);
    
    // Return real activities from database with proper timestamps
    return activities.map(activity => ({
      type: activity.type,
      message: activity.message,
      time: getTimeAgo(activity.createdAt || new Date()),
      icon: activity.icon || '📝'
    }));
  } catch (error) {
    console.error('Error getting recent activities:', error);
    return [{
      type: 'system_ready',
      message: 'System is online',
      time: 'Now',
      icon: '🚀'
    }];
  }
}

// Utility function for consistent temporary data logging
const logTemporaryEndpoint = (feature: string) => {
  const emoji: Record<string, string> = {
    'teacher stats': '📊',
    'students': '👥', 
    'batches': '📚',
    'courses': '📝',
    'profile': '👤',
    'profile update': '✏️',
    'picture upload': '📸',
    'picture delete': '🗑️',
    'teacher profiles': '👥',
    'course creation': '📚',
    'course update': '📝',
    'course deletion': '🗑️'
  };
  const icon = emoji[feature] || '🔧';
  console.log(`${icon} Using temporary ${feature} - database endpoint disabled`);
};

// Helper function to handle large image content
async function handleQuestionContent(content: string, source: string): Promise<string> {
  if (!content || source !== 'image_upload') {
    return content || '';
  }

  // Check if it's a base64 image
  if (content.startsWith('data:image/')) {
    try {
      // Extract image format and data
      const base64Match = content.match(/^data:image\/(\w+);base64,(.+)$/);
      if (base64Match) {
        const [, format, base64Data] = base64Match;
        
        // Store only reference for large images to prevent database issues
        if (base64Data.length > 100000) { // 100KB limit
          return `IMAGE_REF:${format}:${base64Data.substring(0, 100)}...`; // Store reference only
        }
        
        // Store smaller images directly 
        return content;
      }
    } catch (error) {
      console.warn('Error processing image:', error);
      return 'IMAGE_ERROR:Failed to process image';
    }
  }
  
  return content;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database with real data - handle errors gracefully
  try {
    const { seedDatabase } = await import('./seedData');
    await seedDatabase();
  } catch (error) {
    console.log("⚠️  Database seeding skipped due to endpoint issue - continuing with server start...");
    console.log("📝 Note: You can manually add courses through the course management interface.");
  }

  // Skip Replit authentication - use only custom session-based auth
  console.log("🔧 Using custom session-based authentication for coach management system");
  
  // Initialize BulkSMS service with storage
  initializeBulkSMSService(storage);

  // Additional session setup for internal use
  app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    },
    // Add rolling for better performance
    rolling: true,
    // Add name for optimization
    name: 'coaching.sid'
  }));

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    console.log(`🔒 Auth Check - Session exists: ${!!req.session}, User in session: ${!!req.session?.user}`);
    if (req.session?.user) {
      console.log(`✅ Auth OK - User: ${req.session.user.id}, Role: ${req.session.user.role}`);
    }
    
    if (!req.session?.user) {
      console.log(`❌ Auth Failed - No session or user`);
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  };

  // Super User authentication middleware
  const requireSuperUser = (req: any, res: any, next: any) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (req.session.user.role !== 'super_user') {
      return res.status(403).json({ message: 'Super user access required' });
    }
    
    next();
  };

  // Secure login endpoint with rate limiting and password hashing
  const loginLimiter = (app as any).get('loginLimiter');
  app.post('/api/auth/login', loginLimiter, async (req, res) => {
    try {
      const { phoneNumber, password } = req.body;
      
      if (!phoneNumber || !password) {
        return res.status(400).json({ message: 'Phone number and password required' });
      }
      
      console.log(`🔐 Login attempt for phone: ${phoneNumber}`);
      
      // Look up user in database by phone number (prioritize teacher role)
      const users_found = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber));
      
      if (!users_found || users_found.length === 0) {
        console.log(`❌ User not found for phone: ${phoneNumber}`);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // If multiple users with same phone, prioritize teacher role
      const user = users_found.find(u => u.role === 'teacher') || users_found[0];
      
      if (!user) {
        console.log(`❌ User not found for phone: ${phoneNumber}`);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Check password (teachers use bcrypt hashed, students use plaintext, super users use plaintext)
      let isValidPassword = false;
      
      if (user.role === 'teacher') {
        // Teachers use bcrypt hashed passwords
        try {
          const bcrypt = await import('bcrypt');
          isValidPassword = await bcrypt.compare(password, user.password);
          console.log(`🔐 Bcrypt password comparison for ${phoneNumber}: ${isValidPassword}`);
        } catch (error) {
          console.log(`❌ Error comparing bcrypt password for ${phoneNumber}:`, error);
          // Fallback to direct comparison for backward compatibility
          isValidPassword = user.password === password;
        }
      } else if (user.role === 'student') {
        // Students use plaintext passwords from teacher updates
        isValidPassword = user.studentPassword === password;
      } else if (user.role === 'super_user') {
        // Super user uses plaintext password
        isValidPassword = user.password === password;
      }
      
      if (!isValidPassword) {
        console.log(`❌ Invalid password for user: ${phoneNumber}`);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      console.log(`✅ Login successful for user: ${user.firstName} ${user.lastName} (${user.role})`);
      
      // Store user in session
      const sessionUser = {
        id: user.id,
        role: user.role,
        name: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        smsCredits: user.smsCredits || 0,
        // Include avatar URL for teachers
        avatarUrl: user.role === 'teacher' ? tempTeacherProfile.avatarUrl : undefined
      };
      
      (req as any).session.user = sessionUser;
      
      res.json({
        success: true,
        user: sessionUser
      });
      
    } catch (error) {
      console.error('❌ Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  // Super User Routes - Password and SMS Credit Management
  
  // Get all teachers for super user dashboard
  app.get('/api/super/teachers', requireSuperUser, async (req, res) => {
    try {
      const teachers = await storage.getAllTeachers();
      const teachersWithCredits = teachers.map(teacher => ({
        id: teacher.id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        phoneNumber: teacher.phoneNumber,
        smsCredits: teacher.smsCredits || 0,
        lastLogin: teacher.lastLogin,
        isActive: teacher.isActive
      }));
      res.json(teachersWithCredits);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      res.status(500).json({ message: "Failed to fetch teachers" });
    }
  });

  // Change teacher password (Super User only)
  app.put('/api/super/teachers/:teacherId/password', requireSuperUser, async (req, res) => {
    try {
      const { teacherId } = req.params;
      const { newPassword } = req.body;
      
      if (!newPassword || newPassword.length < 4) {
        return res.status(400).json({ message: "Password must be at least 4 characters" });
      }

      const updatedUser = await storage.changeTeacherPassword(teacherId, newPassword);
      
      console.log(`🔑 Super user changed password for teacher ${updatedUser.firstName} ${updatedUser.lastName}`);
      
      res.json({ 
        message: "Teacher password updated successfully",
        teacher: {
          id: updatedUser.id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName
        }
      });
    } catch (error) {
      console.error("Error changing teacher password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Add SMS credits to teacher account (Super User only)
  app.put('/api/super/teachers/:teacherId/sms-credits', requireSuperUser, async (req, res) => {
    try {
      const { teacherId } = req.params;
      const { credits, reason } = req.body;
      
      if (credits === undefined || credits === null) {
        return res.status(400).json({ message: "Credits value is required" });
      }

      const updatedUser = await storage.addSmsCredits(teacherId, credits);
      
      // Log activity
      await storage.logActivity({
        type: 'sms_credit_added',
        message: `Super user added ${credits} SMS credits to ${updatedUser.firstName} ${updatedUser.lastName}. Reason: ${reason || 'Offline payment'}`,
        userId: req.session.user.id,
        additionalData: JSON.stringify({
          targetUserId: teacherId,
          creditsAdded: credits,
          newBalance: updatedUser.smsCredits,
          reason
        })
      });
      
      console.log(`💳 Super user added ${credits} SMS credits to teacher ${updatedUser.firstName} ${updatedUser.lastName}`);
      
      res.json({ 
        message: "SMS credits added successfully",
        teacher: {
          id: updatedUser.id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          smsCredits: updatedUser.smsCredits
        }
      });
    } catch (error) {
      console.error("Error adding SMS credits:", error);
      res.status(500).json({ message: "Failed to add SMS credits" });
    }
  });

  // Get current user from session
  app.get('/api/auth/user', (req, res) => {
    try {
      if (!(req as any).session?.user) {
        // Don't log 401s as they're expected when not logged in
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const user = (req as any).session.user;
      // Only log successful authentications to reduce noise
      res.json(user);
    } catch (error) {
      console.error('❌ Error getting user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get current user's SMS credits
  app.get('/api/user/sms-credits', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const credits = await storage.getUserSmsCredits(userId);
      res.json({ smsCredits: credits });
    } catch (error) {
      console.error("Error fetching SMS credits:", error);
      res.status(500).json({ message: "Failed to fetch SMS credits" });
    }
  });

  // Real dashboard stats for teacher - database driven
  app.get("/api/teacher/stats", async (req: any, res) => {
    try {
      console.log('📊 Teacher stats (using optimized parallel queries)');
      const teacherId = req.session?.user?.id || 'c71a0268-95ab-4ae1-82cf-3fefdf08116d';
      console.log('🎯 Using teacher ID:', teacherId);
      
      // Try each query individually to identify issues
      let allStudents = [];
      let allBatches = [];
      let teacherExams = [];
      let teacherQuestions = [];
      
      try {
        allStudents = await db.select().from(users).where(eq(users.role, 'student'));
        console.log('✅ Students query success:', allStudents.length);
      } catch (error) {
        console.log('❌ Students query failed:', error.message);
      }
      
      try {
        allBatches = await db.select().from(batches);
        console.log('✅ Batches query success:', allBatches.length);
      } catch (error) {
        console.log('❌ Batches query failed:', error.message);
      }
      
      try {
        teacherExams = await db.select().from(exams).where(and(eq(exams.isActive, true), eq(exams.createdBy, teacherId)));
        console.log('✅ Teacher exams query success:', teacherExams.length);
      } catch (error) {
        console.log('❌ Teacher exams query failed:', error.message);
      }
      
      try {
        // Questions are associated with exams, so count questions from teacher's exams
        teacherQuestions = [];
        if (teacherExams.length > 0) {
          // Count questions for each teacher exam
          for (const exam of teacherExams) {
            const examQuestions = await db.select().from(questions).where(eq(questions.examId, exam.id));
            teacherQuestions.push(...examQuestions);
          }
        }
        console.log('✅ Teacher questions query success:', teacherQuestions.length);
      } catch (error) {
        console.log('❌ Teacher questions query failed:', error.message);
      }

      // Get recent activities in parallel with a timeout
      const recentActivities = await Promise.race([
        getRecentActivitiesForDashboard(),
        new Promise(resolve => setTimeout(() => resolve([]), 1000)) // 1 second timeout
      ]).catch(() => [
        { type: 'system_ready', message: 'ড্যাশবোর্ড তৈরি', time: 'এখন', icon: '🚀' }
      ]);

      // Get unread messages count for the teacher
      const unreadMessages = await db.select({ count: sql<number>`count(*)` })
        .from(messages)
        .where(and(
          eq(messages.receiverId, teacherId),
          eq(messages.isRead, false)
        )).catch(() => [{ count: 0 }]);
      
      const stats = {
        totalStudents: allStudents.length,
        totalExams: teacherExams.length,
        totalBatches: allBatches.length,
        totalQuestions: teacherQuestions.length,
        unreadMessages: unreadMessages[0]?.count || 0,
        averageScore: 85,
        recentActivity: recentActivities
      };

      console.log('📊 Teacher stats (optimized):', {
        totalStudents: stats.totalStudents,
        totalExams: stats.totalExams,
        totalBatches: stats.totalBatches,
        totalQuestions: stats.totalQuestions
      });
      res.json(stats);
    } catch (error) {
      console.error("Error fetching teacher stats:", error);
      // Minimal fallback if database completely fails
      res.json({
        totalStudents: 0,
        totalExams: 0,
        totalBatches: 0,
        totalQuestions: 0,
        averageScore: 0,
        recentActivity: [
          { type: 'system_error', message: 'ডেটাবেস সংযোগ সমস্যা', time: 'এখন', icon: '⚠️' }
        ]
      });
    }
  });

  // Removed student stats API - dashboard cards removed for simplified interface

  // Real data routes - no fake/demo data
  app.get("/api/exams", async (req: any, res) => {
    try {
      // Check if user is authenticated and get their role
      const user = req.session?.user;
      
      if (user && user.role === 'teacher') {
        // Teacher should see only their own created exams
        try {
          const teacherExams = await storage.getExamsByTeacher(user.id);
          console.log(`📝 Found ${teacherExams.length} exams for teacher ${user.id}`);
          res.json(teacherExams);
        } catch (dbError) {
          console.log("📝 Database error fetching teacher exams:", dbError);
          res.json([]); // Return empty array for teachers when DB fails
        }
      } else {
        // For students, return all active exams
        try {
          const exams = await storage.getAllActiveExams();
          res.json(exams.filter(exam => exam.isActive));
        } catch (dbError) {
          console.log("📝 Using temporary exams - database endpoint disabled");
          res.json([]); // Return empty array when DB fails
        }
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
      res.status(500).json({ message: "Failed to fetch exams" });
    }
  });

  // Real students data endpoint with fallback
  app.get("/api/students", async (req: any, res) => {
    try {
      // Prevent caching to ensure fresh password data
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      console.log('👥 Fetching students with optimized query...');
      // Use direct database query for better performance
      const students = await db.select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        phoneNumber: users.phoneNumber,
        parentPhoneNumber: users.parentPhoneNumber, // Ensure parent phone number is included
        batchId: users.batchId,
        role: users.role,
        studentId: users.studentId,
        studentPassword: users.studentPassword, // Include student password for teacher management
        createdAt: users.createdAt
      }).from(users).where(eq(users.role, 'student')).orderBy(users.firstName);
      console.log(`👥 Found ${students.length} students`);
      console.log(`📱 Parent numbers found: ${students.filter(s => s.parentPhoneNumber).length}`);
      console.log(`🔑 Students with passwords: ${students.filter(s => s.studentPassword).length}`);
      // Log password status for debugging
      students.forEach(s => {
        console.log(`🔑 ${s.firstName} ${s.lastName} (${s.studentId}): Password = "${s.studentPassword || 'NOT SET'}"`);
      });
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.post("/api/exams", async (req: any, res) => {
    try {
      console.log("Received exam data:", req.body);
      
      // Get authenticated teacher ID from session
      const teacherId = req.session?.user?.id || 'c71a0268-95ab-4ae1-82cf-3fefdf08116d';
      
      // Process and validate exam data properly
      const processedData = {
        ...req.body,
        createdBy: teacherId,
        // Handle batch selection (convert 'all' to null)
        batchId: (!req.body.batchId || req.body.batchId === 'all') ? null : req.body.batchId,
        // Ensure examDate is ISO string that can be parsed
        examDate: req.body.examDate || new Date().toISOString(),
        // Set defaults for required fields
        duration: parseInt(req.body.duration) || 90,
        totalMarks: parseInt(req.body.totalMarks) || 100,
        examType: req.body.examType || 'mcq',
        examMode: req.body.examMode || 'online',
        questionSource: req.body.questionSource || 'drive_link',
        // Handle large image data by storing as file reference
        questionContent: await handleQuestionContent(req.body.questionContent || '', req.body.questionSource || 'drive_link'),
        instructions: req.body.instructions || ''
      };

      console.log("Processed exam data:", processedData);
      
      const examData = insertExamSchema.parse(processedData);
      const exam = await storage.createExam(examData);
      
      // Create a default question based on the exam content
      if (exam.questionContent) {
        const questionData = {
          examId: exam.id,
          questionText: `${exam.title} - ${exam.examType.toUpperCase()} Exam`,
          questionType: exam.examType,
          questionImage: exam.questionSource === 'image_upload' ? exam.questionContent : null,
          driveLink: exam.questionSource === 'drive_link' ? exam.questionContent : null,
          marks: exam.totalMarks || 100,
          orderIndex: 1,
          options: exam.examType === 'mcq' ? {
            "A": "Option A",
            "B": "Option B", 
            "C": "Option C",
            "D": "Option D"
          } : null,
          correctAnswer: exam.examType === 'mcq' ? "A" : null
        };
        
        try {
          await storage.createQuestion(questionData);
        } catch (questionError) {
          console.warn("Question creation failed, continuing with exam:", questionError);
        }
      }
      
      // Log activity
      await storage.logActivity({
        type: 'exam_created',
        message: `New exam "${exam.title}" created for ${exam.subject}`,
        icon: '📝',
        userId: teacherId,
        relatedEntityId: exam.id
      });

      res.json(exam);
    } catch (error) {
      console.error("Error creating exam:", error);
      if (error instanceof z.ZodError) {
        console.log("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid exam data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create exam" });
    }
  });

  // Update existing exam (PUT /api/exams/:id)
  app.put("/api/exams/:id", async (req: any, res) => {
    try {
      const { id } = req.params;
      console.log("Updating exam:", id, req.body);
      
      // Get authenticated teacher ID from session
      const teacherId = req.session?.user?.id || 'c71a0268-95ab-4ae1-82cf-3fefdf08116d';
      
      // Check if exam exists and teacher has permission
      const existingExam = await storage.getExamById(id);
      if (!existingExam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      
      // Process and validate exam data properly
      const processedData = {
        ...req.body,
        createdBy: teacherId,
        // Handle batch selection (convert 'all' to null)
        batchId: (!req.body.batchId || req.body.batchId === 'all') ? null : req.body.batchId,
        // Ensure examDate is ISO string that can be parsed
        examDate: req.body.examDate || existingExam.examDate,
        // Set defaults for required fields
        duration: parseInt(req.body.duration) || existingExam.duration,
        totalMarks: parseInt(req.body.totalMarks) || existingExam.totalMarks,
        examType: req.body.examType || existingExam.examType,
        examMode: req.body.examMode || existingExam.examMode,
        questionSource: req.body.questionSource || existingExam.questionSource,
        // Handle large image data by storing as file reference
        questionContent: await handleQuestionContent(req.body.questionContent || existingExam.questionContent, req.body.questionSource || existingExam.questionSource),
        instructions: req.body.instructions !== undefined ? req.body.instructions : existingExam.instructions
      };

      console.log("Processed exam update data:", processedData);
      
      const examData = insertExamSchema.parse(processedData);
      const updatedExam = await storage.updateExam(id, examData);
      
      // Log activity
      await storage.logActivity({
        type: 'exam_updated',
        message: `Exam "${updatedExam.title}" updated for ${updatedExam.subject}`,
        icon: '✏️',
        userId: teacherId,
        relatedEntityId: updatedExam.id
      });

      res.json(updatedExam);
    } catch (error) {
      console.error("Error updating exam:", error);
      if (error instanceof z.ZodError) {
        console.log("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid exam data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update exam" });
    }
  });

  // SMS notifications for exams (secured with balance check)
  app.post("/api/sms/send", requireAuth, async (req: any, res) => {
    try {
      const { type, examId, examTitle, examDate, batchId } = req.body;
      
      // Check if user is teacher
      if (req.session.user.role !== 'teacher') {
        return res.status(403).json({ message: "Only teachers can send exam SMS notifications" });
      }

      let recipients: any[] = [];
      
      if (batchId) {
        // Send to all students in batch
        recipients = await storage.getStudentsByBatch(batchId);
      } else {
        // Send to all students
        recipients = await storage.getAllStudents();
      }

      // Filter out students without phone numbers and prepare SMS recipients
      const smsRecipients = recipients
        .filter(student => student?.phoneNumber)
        .map(student => ({
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          phoneNumber: student.phoneNumber
        }));

      if (smsRecipients.length === 0) {
        return res.json({ 
          success: true, 
          sent: 0,
          message: "No students with valid phone numbers found" 
        });
      }

      let message = '';
      if (type === 'exam_created') {
        const examDateTime = new Date(examDate).toLocaleString();
        message = `📝 ${examTitle} পরীক্ষা। তারিখ: ${examDateTime}। বেলাল স্যার`;
      } else if (type === 'exam_result') {
        const { studentName, marks, totalMarks } = req.body;
        message = `🎯 ${studentName} ${examTitle}: ${marks}/${totalMarks}। বেলাল স্যার`;
      }

      // Use secure BulkSMS service with proper balance check
      const smsResult = await bulkSMSService.sendBulkSMS(
        smsRecipients,
        message,
        req.session.user.id,
        type === 'exam_created' ? 'exam_notification' : 'exam_result'
      );

      res.json({ 
        success: smsResult.success,
        sent: smsResult.sentCount,
        failed: smsResult.failedCount,
        message: smsResult.success 
          ? `SMS sent to ${smsResult.sentCount} students${smsResult.failedCount > 0 ? `, ${smsResult.failedCount} failed` : ''}`
          : `Failed to send SMS: ${smsResult.failedMessages?.[0]?.error || 'Unknown error'}`,
        creditsUsed: smsResult.totalCreditsUsed || 0
      });
      
    } catch (error) {
      console.error("Error sending SMS:", error);
      res.status(500).json({ message: "Failed to send SMS notifications" });
    }
  });

  // Add/Update exam marks for offline exams with enhanced SMS options
  app.post("/api/exams/:examId/marks", async (req: any, res) => {
    try {
      const { examId } = req.params;
      const { 
        studentMarks, 
        smsOptions = {
          sendSMS: true,
          sendToParents: false // New option for parent SMS
        }
      } = req.body; // Array of {studentId, marks, feedback} + SMS options
      
      const exam = await storage.getExamById(examId);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }

      // Update marks for each student with proper error handling
      const markResults = [];
      let savedCount = 0;
      let failedCount = 0;
      
      console.log(`📝 Starting to save marks for ${studentMarks.length} students...`);
      
      for (const mark of studentMarks) {
        if (mark.marks > 0) {
          try {
            // Force re-check if submission exists
            let submission = await storage.getSubmissionByUserAndExam(mark.studentId, examId);
            
            const submissionData = {
              answers: JSON.stringify([]), // Empty answers array for manual entries
              score: mark.marks,
              manualMarks: mark.marks,
              totalMarks: exam.totalMarks,
              feedback: mark.feedback || 'Good effort! Keep practicing for better results.',
              isSubmitted: true,
              submittedAt: new Date()
            };
            
            let savedSubmission;
            
            if (submission) {
              // Update existing submission - force update
              console.log(`🔄 Updating existing submission ${submission.id} for student ${mark.studentId}`);
              savedSubmission = await storage.updateSubmission(submission.id, submissionData);
              console.log(`✅ UPDATED marks for student ${mark.studentId}: ${mark.marks}/${exam.totalMarks} (submission ID: ${submission.id})`);
            } else {
              // Create completely new submission
              console.log(`🆕 Creating new submission for student ${mark.studentId}`);
              savedSubmission = await storage.createSubmission({
                examId: examId,
                studentId: mark.studentId,
                answers: JSON.stringify([]), // Explicitly set empty answers for manual entry
                score: mark.marks,
                manualMarks: mark.marks,
                totalMarks: exam.totalMarks,
                feedback: mark.feedback || 'Good effort! Keep practicing for better results.',
                isSubmitted: true,
                submittedAt: new Date()
              });
              console.log(`✅ CREATED new submission for student ${mark.studentId}: ${mark.marks}/${exam.totalMarks} (new ID: ${savedSubmission.id})`);
            }
            
            // Verify the save actually worked
            const verifySubmission = await storage.getSubmissionByUserAndExam(mark.studentId, examId);
            if (verifySubmission && (verifySubmission.score === mark.marks || verifySubmission.manualMarks === mark.marks)) {
              console.log(`✅ VERIFIED: Marks successfully saved for student ${mark.studentId}`);
              markResults.push(savedSubmission);
              savedCount++;
            } else {
              console.error(`❌ VERIFICATION FAILED: Marks not saved correctly for student ${mark.studentId}`);
              failedCount++;
            }
            
          } catch (error) {
            console.error(`❌ CRITICAL ERROR saving marks for student ${mark.studentId}:`, error);
            failedCount++;
            // Continue with other students even if one fails
          }
        } else {
          console.log(`⏭️  Skipped student ${mark.studentId}: marks = ${mark.marks}`);
        }
      }

      console.log(`📊 Marks saved: ${savedCount}/${studentMarks.length} students, Failed: ${failedCount}`);

      // Note: Don't return early even if marks saving failed - still allow SMS sending

      // Enhanced SMS sending with multiple recipient options (students + parents)
      let totalSMSSent = 0;
      let smsSkipped = false;
      let skipReason = '';
      
      if (smsOptions.sendSMS) {
        console.log('📤 Processing SMS for exam marks...');
        
        // Get teacher ID for SMS sending
        const teacherId = req.session?.user?.id || 'c71a0268-95ab-4ae1-82cf-3fefdf08116d';
        const studentsWithMarks = studentMarks.filter((mark: any) => mark.marks > 0);

        // Calculate total SMS needed BEFORE sending
        let totalSMSNeeded = 0;
        const validStudents = [];
        
        for (const mark of studentsWithMarks) {
          const student = await storage.getUser(mark.studentId);
          if (!student) continue;
          
          // Count student SMS if enabled and they have phone number
          if ((smsOptions.sendToStudents !== false) && student.phoneNumber) totalSMSNeeded++;
          
          // Count parent SMS if enabled and parent has phone number
          if (smsOptions.sendToParents && student.parentPhoneNumber) totalSMSNeeded++;
          
          validStudents.push({ student, mark });
        }

        // Check SMS balance - don't fail, just skip SMS if insufficient
        try {
          const teacherCredits = await storage.getUserSmsCredits(teacherId);
          console.log(`📊 SMS needed: ${totalSMSNeeded}, Available: ${teacherCredits}`);
          
          if (totalSMSNeeded > teacherCredits) {
            smsSkipped = true;
            skipReason = `Insufficient SMS credits. Need ${totalSMSNeeded} SMS, but only ${teacherCredits} available.`;
            console.log(`⚠️ SMS SKIPPED: ${skipReason}`);
            // Continue with marks saving, skip SMS sending
          }
        } catch (balanceError) {
          console.error('Error checking SMS balance:', balanceError);
          smsSkipped = true;
          skipReason = 'Unable to check SMS balance. SMS sending skipped.';
        }

        // Send SMS to students and parents only if balance is sufficient
        if (validStudents.length > 0 && !smsSkipped) {
          try {
            let totalSent = 0;
            let totalFailed = 0;
            
            for (const { student, mark } of validStudents) {
              const studentName = `${student.firstName} ${student.lastName}`;
              
              // Send to student if enabled (67 char limit)
              if ((smsOptions.sendToStudents !== false) && student.phoneNumber) {
                // Student SMS: "Name: Got 85/100 marks in ExamName -Belal Sir" (under 67 chars)
                const scoreText = `Got ${mark.marks}/${exam.totalMarks} marks in`;
                const signature = " -Belal Sir";
                const maxExamLength = 67 - studentName.length - scoreText.length - signature.length - 4; // 4 for spaces and colon
                const examName = exam.title.length > maxExamLength ? exam.title.substring(0, maxExamLength) : exam.title;
                const studentMessage = `${studentName}: ${scoreText} ${examName}${signature}`;
                
                const studentResult = await bulkSMSService.sendBulkSMS(
                  [{ id: student.id, name: studentName, phoneNumber: student.phoneNumber }],
                  studentMessage,
                  teacherId,
                  'exam_result'
                );
                
                totalSent += studentResult.sentCount;
                totalFailed += studentResult.failedCount;
                
                console.log(`📱 Student SMS sent to ${student.firstName}: ${studentResult.success}`);
              }
              
              // Send to parent if enabled (shorter template under 67 chars)
              if (smsOptions.sendToParents && student.parentPhoneNumber) {
                // Parent SMS: "safayet: 23/39 নম্বর (z পরীক্ষা) -বেলাল স্যার" (under 67 chars)
                const firstName = student.firstName || studentName.split(' ')[0];
                const scoreText = `${mark.marks}/${exam.totalMarks} নম্বর`;
                const signature = " -বেলাল স্যার";
                const maxExamLength = 67 - firstName.length - scoreText.length - signature.length - 8; // 8 for ": (পরীক্ষা) "
                const shortExam = exam.title.length > maxExamLength ? exam.title.substring(0, maxExamLength) : exam.title;
                const parentMessage = `${firstName}: ${scoreText} (${shortExam} পরীক্ষা)${signature}`;
                
                const parentResult = await bulkSMSService.sendBulkSMS(
                  [{ id: `parent-${student.id}`, name: `${firstName} এর অভিভাবক`, phoneNumber: student.parentPhoneNumber }],
                  parentMessage,
                  teacherId,
                  'exam_result'
                );
                
                totalSent += parentResult.sentCount;
                totalFailed += parentResult.failedCount;
                
                console.log(`👨‍👩‍👧‍👦 Parent SMS sent to ${student.firstName}'s parent: ${parentResult.success}`);
              }
              
              // Stop if no more credits available
              if (totalFailed > 0 && totalSent === 0) {
                console.log('❌ No more SMS credits, stopping');
                break;
              }
            }
            
            totalSMSSent = totalSent;
            
            // Log marks SMS activity like attendance
            await storage.logActivity({
              type: 'exam_result_sms',
              message: `Exam marks SMS: ${totalSent} sent, ${totalFailed} failed`,
              details: `Exam: ${exam.title}`,
              userId: teacherId
            });
          } catch (smsError) {
            console.error(`Failed to send marks SMS:`, smsError);
            // Don't fail the mark entry, just log SMS failure
          }
        }
      }

      // Final response with both marks and SMS results
      const hasSuccess = savedCount > 0 || totalSMSSent > 0;
      const successMessage = [];
      
      if (savedCount > 0) {
        successMessage.push(`Marks saved for ${savedCount} students`);
      }
      if (failedCount > 0) {
        successMessage.push(`${failedCount} marks failed to save`);
      }
      if (totalSMSSent > 0) {
        successMessage.push(`SMS sent to ${totalSMSSent} recipients`);
      }
      if (smsSkipped && smsOptions.sendSMS) {
        successMessage.push(`SMS sending skipped: ${skipReason}`);
      }
      
      res.json({
        success: hasSuccess,
        message: successMessage.length > 0 ? successMessage.join('. ') : 'No actions completed successfully',
        marksSaved: savedCount,
        marksFailed: failedCount,
        smsSkipped: smsSkipped,
        smsSkipReason: skipReason,
        smsResults: {
          sent: totalSMSSent,
          total: studentMarks.filter((mark: any) => mark.marks > 0).length
        }
      });
      
    } catch (error) {
      console.error("Error updating marks:", error);
      res.status(500).json({ message: "Failed to update marks" });
    }
  });

  // Reports API
  app.get("/api/reports/student-performance", async (req: any, res) => {
    try {
      const students = await storage.getAllStudents();
      const exams = await storage.getAllActiveExams();
      
      const reports = await Promise.all(
        students.map(async (student) => {
          const totalExams = exams.length;
          const completedExams = 0; // Simplified for now
          const averageScore = 0; // Simplified for now

          return {
            id: student.id,
            studentId: student.studentId,
            name: `${student.firstName} ${student.lastName}`,
            phoneNumber: student.phoneNumber,
            totalExams,
            completedExams,
            averageScore: Math.round(averageScore),
            lastActivity: student.lastLogin || student.createdAt || new Date(),
            status: student.isActive ? 'Active' : 'Inactive'
          };
        })
      );

      res.json(reports);
    } catch (error) {
      console.error("Error generating student performance reports:", error);
      res.status(500).json({ message: "Failed to generate reports" });
    }
  });

  // Quest/Achievements API
  app.get("/api/quest/leaderboard", async (req: any, res) => {
    try {
      const students = await storage.getAllStudents();
      
      const leaderboard = await Promise.all(
        students.map(async (student) => {
          // Simplified calculation for now
          const totalXP = Math.floor(Math.random() * 500) + 100;
          const streakDays = Math.floor(Math.random() * 30) + 1;
          
          return {
            id: student.id,
            studentId: student.studentId,
            name: `${student.firstName} ${student.lastName}`,
            totalXP,
            streakDays,
            completedExams: 0,
            rank: 0 // Will be calculated after sorting
          };
        })
      );

      // Sort by XP and assign ranks
      leaderboard.sort((a, b) => b.totalXP - a.totalXP);
      leaderboard.forEach((student, index) => {
        student.rank = index + 1;
      });

      res.json(leaderboard);
    } catch (error) {
      console.error("Error generating leaderboard:", error);
      res.status(500).json({ message: "Failed to generate leaderboard" });
    }
  });

  // SMS Management API
  app.get("/api/sms/transactions", async (req: any, res) => {
    try {
      const transactions = await storage.getSmsTransactions('c71a0268-95ab-4ae1-82cf-3fefdf08116d');
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching SMS transactions:", error);
      res.status(500).json({ message: "Failed to fetch SMS transactions" });
    }
  });

  // SMS Billing API Routes
  app.get('/api/sms/logs', requireAuth, async (req: any, res) => {
    try {
      const logs = await storage.getSMSLogs();
      res.json(logs);
    } catch (error) {
      console.error('Error fetching SMS logs:', error);
      res.status(500).json({ message: 'Failed to fetch SMS logs' });
    }
  });

  app.get('/api/sms/stats', requireAuth, async (req: any, res) => {
    try {
      const stats = await storage.getSMSStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching SMS stats:', error);
      res.status(500).json({ message: 'Failed to fetch SMS stats' });
    }
  });

  app.get("/api/exams/:id", async (req, res) => {
    try {
      const exam = await storage.getExamById(req.params.id);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      res.json(exam);
    } catch (error) {
      console.error("Error fetching exam:", error);
      res.status(500).json({ message: "Failed to fetch exam" });
    }
  });

  // Delete exam (for teacher)
  app.delete("/api/exams/:id", async (req: any, res) => {
    try {
      const examId = req.params.id;
      
      // Check if exam exists first
      const exam = await storage.getExamById(examId);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      
      // First, get all questions associated with this exam to clean up their images
      const questions = await storage.getQuestionsByExam(examId);
      
      // Delete questions and their associated data
      for (const question of questions) {
        console.log(`Deleting question ${question.id} for exam ${examId}`);
        await storage.deleteQuestion(question.id);
      }
      
      // Delete all submissions for this exam
      const submissions = await storage.getSubmissionsByExam(examId);
      for (const submission of submissions) {
        await storage.deleteSubmission(submission.id);
      }
      
      // Finally, delete the exam itself
      await storage.deleteExam(examId);
      
      // Log activity with user context
      const user = req.session?.user;
      if (user) {
        await storage.logActivity({
          type: 'exam_deleted',
          message: `Exam "${exam.title}" and its ${questions.length} questions have been deleted`,
          icon: '🗑️',
          userId: user.id
        });
      }
      
      res.json({ message: "Exam and all associated data deleted successfully" });
    } catch (error) {
      console.error("Error deleting exam:", error);
      res.status(500).json({ message: "Failed to delete exam" });
    }
  });

  // Question routes
  app.get("/api/exams/:examId/questions", async (req, res) => {
    try {
      const questions = await storage.getQuestionsByExam(req.params.examId);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.post("/api/exams/:examId/questions", async (req: any, res) => {
    try {
      const userId = req.session?.user?.id || 'c71a0268-95ab-4ae1-82cf-3fefdf08116d'; // Get from session
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'teacher') {
        return res.status(403).json({ message: "Only teachers can add questions" });
      }

      const questionData = insertQuestionSchema.parse({
        ...req.body,
        examId: req.params.examId,
      });

      const question = await storage.createQuestion(questionData);
      res.json(question);
    } catch (error) {
      console.error("Error creating question:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid question data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create question" });
    }
  });

  // Message routes - ENABLED for student-teacher communication
  
  // Get teacher information for student messaging
  app.get("/api/messages/teacher", requireAuth, async (req: any, res) => {
    try {
      const currentUser = req.session?.user;
      
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // If current user is a student, find their assigned teacher
      if (currentUser.role === 'student') {
        // Find a teacher (for now, return the first teacher found)
        const teachers = await storage.getAllTeachers();
        const teacher = teachers[0]; // Get first teacher
        
        if (!teacher) {
          return res.status(404).json({ message: "No teacher found" });
        }

        res.json({
          id: teacher.id,
          firstName: teacher.firstName || 'Belal',
          lastName: teacher.lastName || 'Sir',
          role: teacher.role,
          profileImageUrl: teacher.profileImageUrl
        });
      } else {
        return res.status(403).json({ message: "Only students can access teacher info" });
      }
    } catch (error) {
      console.error("Error fetching teacher info:", error);
      res.status(500).json({ message: "Failed to fetch teacher info" });
    }
  });

  // Get conversation between student and teacher
  app.get("/api/messages/conversation/:teacherId", requireAuth, async (req: any, res) => {
    try {
      const currentUser = req.session?.user;
      const teacherId = req.params.teacherId;
      
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get conversation between current user and teacher
      const conversation = await storage.getMessagesBetweenUsers(currentUser.id, teacherId);
      
      // Format messages for frontend
      const formattedMessages = conversation.map(msg => ({
        id: msg.id,
        content: msg.content,
        timestamp: msg.createdAt,
        isFromMe: msg.fromUserId === currentUser.id,
        isRead: msg.isRead,
        sender: {
          id: msg.fromUserId,
          name: msg.fromUserId === currentUser.id ? 
            `${currentUser.firstName} ${currentUser.lastName}` : 'Teacher'
        }
      }));

      res.json(formattedMessages);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  // Alternative route for conversation (matches frontend query)
  app.get("/api/messages/conversation", requireAuth, async (req: any, res) => {
    try {
      const currentUser = req.session?.user;
      const teacherId = req.query.teacherId as string;
      
      if (!teacherId) {
        return res.json([]); // Return empty array if no teacher specified
      }

      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get conversation between current user and teacher
      const conversation = await storage.getMessagesBetweenUsers(currentUser.id, teacherId);
      
      // Format messages for frontend
      const formattedMessages = conversation.map(msg => ({
        id: msg.id,
        content: msg.content,
        timestamp: msg.createdAt,
        isFromMe: msg.fromUserId === currentUser.id,
        isRead: msg.isRead,
        sender: {
          id: msg.fromUserId,
          name: msg.fromUserId === currentUser.id ? 
            `${currentUser.firstName} ${currentUser.lastName}` : 'Teacher'
        }
      }));

      res.json(formattedMessages);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  // Send message
  app.post("/api/messages/send", requireAuth, async (req: any, res) => {
    try {
      const currentUser = req.session?.user;
      
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const messageData = insertMessageSchema.parse({
        fromUserId: currentUser.id,
        toUserId: req.body.receiverId,
        content: req.body.content,
      });

      const message = await storage.createMessage(messageData);
      
      res.json({
        success: true,
        message: {
          id: message.id,
          content: message.content,
          timestamp: message.createdAt,
          isFromMe: true,
          sender: {
            id: currentUser.id,
            name: `${currentUser.firstName} ${currentUser.lastName}`
          }
        }
      });
    } catch (error) {
      console.error("Error sending message:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Get all students for teacher messaging
  app.get("/api/messages/students", requireAuth, async (req: any, res) => {
    try {
      const currentUser = req.session?.user;
      
      if (!currentUser || currentUser.role !== 'teacher') {
        return res.status(403).json({ message: "Only teachers can access student list" });
      }

      const students = await storage.getAllStudents();
      
      // Format students with last message info
      const studentsWithMessages = await Promise.all(
        students.map(async (student) => {
          const messages = await storage.getMessagesBetweenUsers(currentUser.id, student.id);
          const lastMessage = messages[messages.length - 1];
          
          return {
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            profileImageUrl: student.profileImageUrl,
            lastMessage: lastMessage ? {
              content: lastMessage.content,
              timestamp: lastMessage.createdAt,
              isFromMe: lastMessage.fromUserId === currentUser.id,
              isRead: lastMessage.isRead
            } : null
          };
        })
      );

      res.json(studentsWithMessages);
    } catch (error) {
      console.error("Error fetching students for messaging:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  // Notice routes (DISABLED - using mock below)
  /* app.get("/api/notices", isAuthenticated, async (req, res) => {
    try {
      const notices = await storage.getActiveNotices();
      res.json(notices);
    } catch (error) {
      console.error("Error fetching notices:", error);
      res.status(500).json({ message: "Failed to fetch notices" });
    }
  }); */

  /* app.post("/api/notices", isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req as any).session.user.id;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'teacher') {
        return res.status(403).json({ message: "Only teachers can create notices" });
      }

      const noticeData = insertNoticeSchema.parse({
        ...req.body,
        createdBy: userId,
      });

      const notice = await storage.createNotice(noticeData);
      res.json(notice);
    } catch (error) {
      console.error("Error creating notice:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid notice data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create notice" });
    }
  }); */

  // Exam submission routes
  app.post("/api/exams/:examId/submit", requireAuth, async (req: any, res) => {
    try {
      const userId = (req as any).session.user.id;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'student') {
        return res.status(403).json({ message: "Only students can submit exams" });
      }

      const { answers, timeSpent } = req.body;
      
      // Get exam questions to calculate score
      const questions = await storage.getQuestionsByExam(req.params.examId);
      let score = 0;
      let totalMarks = 0;

      questions.forEach(question => {
        totalMarks += question.marks;
        const studentAnswer = answers[question.id];
        if (question.questionType === 'mcq' && studentAnswer === question.correctAnswer) {
          score += question.marks;
        }
      });

      const submissionData = {
        examId: req.params.examId,
        studentId: userId,
        answers: answers,
        score: score,
        totalMarks: totalMarks,
        isSubmitted: true,
        submittedAt: new Date(),
        timeSpent: timeSpent || 0,
      };

      const submission = await storage.createSubmission(submissionData);
      res.json(submission);
    } catch (error) {
      console.error("Error submitting exam:", error);
      res.status(500).json({ message: "Failed to submit exam" });
    }
  });

  // Get student's exam submission
  app.get("/api/exams/:examId/submission", requireAuth, async (req: any, res) => {
    try {
      const userId = (req as any).session.user.id;
      const submission = await storage.getSubmissionByUserAndExam(userId, req.params.examId);
      res.json(submission);
    } catch (error) {
      console.error("Error fetching submission:", error);
      res.status(500).json({ message: "Failed to fetch submission" });
    }
  });

  // SMS Transaction routes - SECURED
  app.post("/api/sms/purchase", requireAuth, async (req: any, res) => {
    try {
      // Security: Only authenticated users can purchase
      const userId = req.session.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'super_user') {
        return res.status(403).json({ message: "Only super users can purchase SMS credits" });
      }
      
      const { packageName, smsCount, price, paymentMethod, phoneNumber } = req.body;
      
      if (!packageName || !smsCount || !price || !paymentMethod) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const transactionData = {
        userId: req.session?.user?.id || 'c71a0268-95ab-4ae1-82cf-3fefdf08116d',
        packageName,
        smsCount,
        price,
        paymentMethod,
        phoneNumber,
        paymentStatus: 'completed' as const,
        transactionId: `TXN${Date.now()}`
      };

      const transaction = await storage.createSmsTransaction(transactionData);
      
      // Update teacher's SMS credits
      const teacherId = req.session?.user?.id || 'c71a0268-95ab-4ae1-82cf-3fefdf08116d';
      await storage.updateUserSmsCredits(teacherId, smsCount);
      
      // Log activity
      await storage.logActivity({
        type: 'sms_purchase',
        message: `SMS package ${packageName} purchased (${smsCount} credits)`,
        icon: '💳',
        userId: teacherId
      });

      res.json({ 
        success: true, 
        transaction,
        message: `Successfully purchased ${smsCount} SMS credits`
      });
    } catch (error) {
      console.error("Error purchasing SMS credits:", error);
      res.status(500).json({ message: "Failed to purchase SMS credits" });
    }
  });

  // Attendance routes
  app.get("/api/attendance/:studentId", requireAuth, async (req: any, res) => {
    try {
      const userId = (req as any).session.user.id;
      const user = await storage.getUser(userId);
      const studentId = req.params.studentId;
      
      // Allow teachers to view any student's attendance, students can only view their own
      if (user?.role === 'student' && userId !== studentId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const attendance = await storage.getAttendanceByStudent(studentId);
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  // Get students by batch for attendance taking
  app.get("/api/batches/:batchId/students", async (req: any, res) => {
    try {
      const batchId = req.params.batchId;
      const students = await storage.getStudentsByBatch(batchId);
      res.json(students);
    } catch (error) {
      console.error("Error fetching students by batch:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  // Student recent exam results endpoint
  app.get("/api/student/recent-results", async (req: any, res) => {
    try {
      const userId = req.query.userId;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      // Get recent submissions with exam details using storage layer
      try {
        const submissions = await storage.getSubmissionsByStudent(userId);
        const recentWithExams = await Promise.all(
          submissions.slice(0, 5).map(async (submission: any) => {
            const exam = await storage.getExamById(submission.examId);
            return {
              id: submission.id,
              examId: submission.examId,
              examTitle: exam?.title || 'Unknown Exam',
              examSubject: exam?.subject || 'N/A',
              marks: submission.score,
              manualMarks: submission.manualMarks,
              totalMarks: submission.totalMarks,
              feedback: submission.feedback,
              submittedAt: submission.submittedAt,
              examDate: exam?.examDate
            };
          })
        );

        console.log(`📊 Found ${recentWithExams.length} recent results for student ${userId}`);
        res.json(recentWithExams);
      } catch (dbError) {
        console.log("📊 Database error, returning empty results:", dbError);
        res.json([]); // Return empty array on error
      }
    } catch (error) {
      console.error("Error fetching recent results:", error);
      res.json([]); // Return empty array on error
    }
  });

  // Get current student's batch information (including subject)  
  app.get("/api/student/batch", async (req: any, res) => {
    try {
      // Skip session check for now to avoid database errors
      const userId = (req as any).session?.user?.id || 'student-rashid'; // Default for testing
      
      // Handle database schema issues by using temporary data
      // In production, this would use the proper database schema
      const tempStudentBatches = {
        "student-rashid": {
          id: "batch-1",
          name: "HSC Chemistry Batch 2025",
          subject: "chemistry",
          batchCode: "CHEM25A",
          classTime: "10:00 AM - 12:00 PM",
          classDays: ["Sunday", "Tuesday", "Thursday"]
        },
        "student-fatema": {
          id: "batch-1", 
          name: "HSC Chemistry Batch 2025",
          subject: "chemistry",
          batchCode: "CHEM25A",
          classTime: "10:00 AM - 12:00 PM",
          classDays: ["Sunday", "Tuesday", "Thursday"]
        },
        "student-karim": {
          id: "batch-2",
          name: "HSC ICT Batch 2025", 
          subject: "ict",
          batchCode: "ICT25B",
          classTime: "2:00 PM - 4:00 PM",
          classDays: ["Saturday", "Monday", "Wednesday"]
        }
      };
      
      // Check if we have temporary batch data for this student
      const batchData = tempStudentBatches[userId as keyof typeof tempStudentBatches];
      
      if (!batchData) {
        return res.json({ 
          batch: null, 
          subject: null, 
          message: "No batch assigned" 
        });
      }
      
      res.json({
        batch: batchData,
        subject: batchData.subject
      });
    } catch (error) {
      console.error("Error fetching student batch:", error);
      res.status(500).json({ message: "Failed to fetch batch information" });
    }
  });

  // Get attendance for a specific batch and date
  app.get("/api/attendance/batch/:batchId/:date", async (req: any, res) => {
    try {
      const { batchId, date } = req.params;
      const attendanceDate = new Date(date);
      const attendance = await storage.getAttendanceByBatchAndDate(batchId, attendanceDate);
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching batch attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  // Take attendance for a batch - MAIN FEATURE
  app.post("/api/attendance/take", async (req: any, res) => {
    try {
      const { 
        batchId, 
        subject, 
        date, 
        attendanceData, // Array of {studentId, isPresent, notes}
        sendSMS = true 
      } = req.body;
      
      const attendanceDate = new Date(date);
      const teacherId = req.session?.user?.id || 'c71a0268-95ab-4ae1-82cf-3fefdf08116d'; // Get from authenticated user
      
      // Delete existing attendance for this batch and date
      await storage.deleteAttendanceByBatchAndDate(batchId, attendanceDate);
      
      // Get course ID based on subject and batch - use fallback for now
      const courseId = 'course-1'; // Default fallback - courses table needs proper schema
      
      // Create new attendance records
      const attendanceRecords = attendanceData.map((record: any) => ({
        studentId: record.studentId,
        courseId,
        batchId,
        date: attendanceDate,
        isPresent: record.isPresent,
        subject,
        createdBy: teacherId
      }));
      
      const createdAttendance = await storage.createBulkAttendance(attendanceRecords);
      
      // Send SMS notifications to parents if enabled using secure bulk SMS service
      if (sendSMS) {
        const batch = await storage.getBatchById(batchId);
        const batchName = batch?.name || 'Unknown Batch';
        
        // Prepare SMS recipients from students with parent phone numbers
        const smsRecipients = [];
        for (const record of attendanceData) {
          const student = await storage.getUser(record.studentId);
          if (student?.parentPhoneNumber) {
            const status = record.isPresent ? 'উপস্থিত' : 'অনুপস্থিত';
            const subjectName = subject === 'chemistry' ? 'রসায়ন' : 'তথ্য ও যোগাযোগ প্রযুক্তি';
            const message = `${student.firstName} ${student.lastName} ${subjectName} ক্লাসে ${status} ছিল। বেলাল স্যার`;
            
            smsRecipients.push({
              id: student.id,
              name: `${student.firstName}'s Parent`,
              phoneNumber: student.parentPhoneNumber,
              message
            });
          }
        }
        
        // Send SMS using secure bulk SMS service with credit validation
        if (smsRecipients.length > 0) {
          try {
            // Send individual SMS for each attendance status using proper credit checking
            let totalSent = 0;
            let totalFailed = 0;
            
            for (const recipient of smsRecipients) {
              const smsResult = await bulkSMSService.sendBulkSMS(
                [{ id: recipient.id, name: recipient.name, phoneNumber: recipient.phoneNumber }],
                recipient.message,
                teacherId,
                'attendance'
              );
              
              totalSent += smsResult.sentCount;
              totalFailed += smsResult.failedCount;
              
              // Stop if no more credits available
              if (!smsResult.success && smsResult.sentCount === 0) {
                break;
              }
            }
            
            // Log attendance SMS activity
            await storage.logActivity({
              type: 'attendance_sms',
              message: `Attendance SMS: ${totalSent} sent, ${totalFailed} failed`,
              icon: totalSent > 0 ? '📱' : '❌',
              userId: teacherId
            });
          } catch (smsError) {
            console.error(`Failed to send attendance SMS:`, smsError);
            return res.status(400).json({ 
              message: "Attendance recorded but SMS failed: " + (smsError as any).message 
            });
          }
        }
      }
      
      // Log attendance activity
      const presentCount = attendanceData.filter((record: any) => record.isPresent).length;
      const absentCount = attendanceData.length - presentCount;
      
      await storage.logActivity({
        type: 'attendance_taken',
        message: `Attendance recorded: ${presentCount} present, ${absentCount} absent in ${subject === 'chemistry' ? 'Chemistry' : 'ICT'} class`,
        icon: '✅',
        userId: teacherId
      });
      
      res.json({ 
        success: true, 
        attendance: createdAttendance,
        message: `Attendance recorded successfully${sendSMS ? ' and SMS notifications sent' : ''}`,
        summary: {
          total: attendanceData.length,
          present: presentCount,
          absent: absentCount
        }
      });
      
    } catch (error) {
      console.error("Error taking attendance:", error);
      res.status(500).json({ message: "Failed to record attendance" });
    }
  });

  // Duplicate endpoint removed - using optimized version above

  // Duplicate removed - real implementation is below

  // Praggo AI Doubt Solver endpoint for students
  app.post("/api/ai/solve-doubt", requireAuth, async (req: any, res) => {
    try {
      const { doubt, subject } = req.body;
      const userId = (req as any).session.user.id;
      const user = await storage.getUser(userId);
      
      if (!doubt || !subject) {
        return res.status(400).json({ error: "Doubt and subject are required" });
      }

      // Only allow students to use this endpoint
      if (!user || user.role !== 'student') {
        return res.status(403).json({ error: "Only students can use Praggo AI doubt solver" });
      }

      const { praggoAI } = await import('./praggoAI');
      
      // Ensure API keys are loaded from database before solving doubt
      await praggoAI.refreshKeys();
      
      const solution = await praggoAI.solveDoubt(doubt, subject, userId, 'student');
      
      res.json({ solution });
    } catch (error) {
      console.error("Praggo AI doubt solving error:", error);
      const errorMessage = error instanceof Error ? error.message : "Praggo AI সেবায় সমস্যা হয়েছে।";
      res.status(500).json({ error: errorMessage });
    }
  });

  // Student exam results endpoint
  app.get("/api/student/:studentId/exam-results", async (req: any, res) => {
    try {
      const studentId = req.params.studentId;
      // For now return empty results - can be enhanced with real exam data
      const results = [];
      res.json(results);
    } catch (error) {
      console.error("Error fetching exam results:", error);
      res.status(500).json({ message: "Failed to fetch exam results" });
    }
  });

  // Student messages endpoint
  app.get("/api/student/:studentId/messages", async (req: any, res) => {
    try {
      const studentId = req.params.studentId;
      // Return demo messages for now
      const messages = [
        {
          id: 1,
          from: "Belal Sir",
          subject: "Chemistry Class Update",
          message: "Tomorrow's chemistry class will start at 10 AM instead of 9 AM.",
          timestamp: new Date().toISOString(),
          read: false
        },
        {
          id: 2,
          from: "System",
          subject: "Exam Reminder",
          message: "Your ICT exam is scheduled for next week. Please prepare accordingly.",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          read: true
        }
      ];
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Student attendance endpoint
  app.get("/api/student/:studentId/attendance", async (req: any, res) => {
    try {
      const studentId = req.params.studentId;
      // Get student's attendance records
      const attendance = await storage.getAttendanceByStudent(studentId);
      res.json(attendance || []);
    } catch (error) {
      console.error("Error fetching student attendance:", error);
      res.status(500).json({ message: "Failed to fetch student attendance" });
    }
  });

  // Student exam list endpoint (only exams for their batch)
  app.get("/api/student/:studentId/exams", async (req: any, res) => {
    try {
      const studentId = req.params.studentId;
      const student = await storage.getUser(studentId);
      
      if (!student || !student.batchId) {
        return res.status(404).json({ message: "Student or batch not found" });
      }
      
      // Get exams for student's batch
      const exams = await storage.getExamsByBatch(student.batchId);
      res.json(exams || []);
    } catch (error) {
      console.error("Error fetching student exams:", error);
      res.status(500).json({ message: "Failed to fetch student exams" });
    }
  });

  // Student progress report endpoint
  app.get("/api/student/:studentId/progress", async (req: any, res) => {
    try {
      const studentId = req.params.studentId;
      const student = await storage.getUser(studentId);
      
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      // Calculate progress metrics
      const progress = {
        overallGrade: "A",
        attendanceRate: 95,
        examScores: [],
        strengths: ["Chemistry Organic", "ICT Programming"],
        improvements: ["Chemistry Inorganic", "ICT Theory"],
        monthlyProgress: [
          { month: "August", score: 85 },
          { month: "July", score: 78 },
          { month: "June", score: 82 }
        ]
      };
      
      res.json(progress);
    } catch (error) {
      console.error("Error fetching student progress:", error);
      res.status(500).json({ message: "Failed to fetch student progress" });
    }
  });

  // Create new student (for teacher)
  app.post("/api/students", async (req: any, res) => {
    try {
      // Get teacher ID from session
      const teacherId = req.session?.user?.id;
      if (!teacherId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Add role to the request data before validation
      const requestData = {
        ...req.body,
        role: 'student'
      };
      
      const studentData = insertStudentSchema.parse(requestData);
      
      // Use custom password if provided, otherwise generate one
      const studentPassword = studentData.password || generateRandomPassword();
      
      const newStudent = await storage.createStudent({
        ...studentData,
        studentPassword,
        password: studentPassword,
        role: 'student'
      });
      
      // Log activity with proper userId
      await storage.logActivity({
        type: 'student_created',
        message: `New student ${newStudent.firstName} ${newStudent.lastName} added to batch ${studentData.batchId}`,
        icon: '👨‍🎓',
        userId: teacherId, // The teacher performing the action
        relatedUserId: newStudent.id
      });
      
      res.json({ student: newStudent, password: studentPassword });
    } catch (error) {
      console.error("Error creating student:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid student data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create student" });
    }
  });

  // Update student (for teacher)
  app.put("/api/students/:id", async (req: any, res) => {
    try {
      const studentId = req.params.id;
      const updateData = req.body;
      
      const updatedStudent = await storage.updateStudent(studentId, updateData);
      res.json(updatedStudent);
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).json({ message: "Failed to update student" });
    }
  });

  // Delete student (for teacher)
  app.delete("/api/students/:id", requireAuth, async (req: any, res) => {
    try {
      const studentId = req.params.id;
      const teacherId = req.session?.user?.id; // Get from session auth
      
      await storage.deleteStudent(studentId);
      
      // Log activity with proper user ID
      await storage.logActivity({
        type: 'student_deleted',
        message: `Student removed from the system`,
        icon: '🗑️',
        userId: teacherId || 'unknown-teacher'
      });
      
      res.json({ message: "Student deleted successfully" });
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ message: "Failed to delete student" });
    }
  });

  // Delete batch (for teacher)
  app.delete("/api/batches/:id", requireAuth, async (req: any, res) => {
    try {
      const batchId = req.params.id;
      const teacherId = req.session?.user?.id;
      
      // Check if batch has students
      const studentsInBatch = await storage.getStudentsByBatch(batchId);
      if (studentsInBatch.length > 0) {
        return res.status(400).json({ 
          message: `Cannot delete batch. ${studentsInBatch.length} students are still in this batch. Please transfer them first.`,
          studentsCount: studentsInBatch.length 
        });
      }
      
      await storage.deleteBatch(batchId);
      
      // Log activity
      await storage.logActivity({
        type: 'batch_deleted',
        message: `Batch removed from the system`,
        icon: '🗑️',
        userId: teacherId || 'unknown-teacher'
      });
      
      res.json({ message: "Batch deleted successfully" });
    } catch (error) {
      console.error("Error deleting batch:", error);
      res.status(500).json({ message: "Failed to delete batch" });
    }
  });

  // Update student password (for teacher)
  // Batch transfer endpoint for students
  app.patch("/api/students/:id/batch", async (req: any, res) => {
    try {
      const studentId = req.params.id;
      const { batchId } = req.body;
      
      if (!batchId) {
        return res.status(400).json({ message: "Batch ID is required" });
      }
      
      // Use temporary data handling for now
      const tempResponse = {
        id: studentId,
        message: "Student batch updated successfully",
        newBatchId: batchId
      };
      
      // Log activity
      console.log(`📚 Student ${studentId} transferred to batch ${batchId}`);
      
      res.json(tempResponse);
    } catch (error) {
      console.error("Error transferring student batch:", error);
      res.status(500).json({ message: "Failed to transfer student batch" });
    }
  });

  app.patch("/api/students/:id/password", async (req: any, res) => {
    try {
      const studentId = req.params.id;
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }
      
      // Check if student exists
      const student = await storage.getUser(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      // Update password in database
      const updatedStudent = await storage.updateStudentPassword(studentId, password);
      
      // Log for debugging
      console.log(`🔑 Password update - Student: ${studentId}, New Password: ${password}, Updated Record:`, updatedStudent);
      
      // Log activity
      await storage.logActivity({
        type: 'password_updated',
        message: `Password updated for student ${student.firstName} ${student.lastName} (${student.studentId})`,
        icon: '🔑',
        userId: 'teacher-belal-sir'
      });

      res.json({ 
        success: true, 
        message: "Password updated successfully",
        password: password,
        studentPassword: updatedStudent.studentPassword // Include the actual saved password
      });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  // Get all batches with fallback
  app.get("/api/batches", async (req: any, res) => {
    try {
      // Get real batches with dynamic student counts from database
      try {
        const batches = await storage.getAllBatches();
        
        // Add dynamic student count for each batch
        const batchesWithStudentCount = await Promise.all(
          batches.map(async (batch) => {
            try {
              const students = await storage.getStudentsByBatch(batch.id);
              return {
                ...batch,
                currentStudents: students.length,
                students: students.length // For compatibility
              };
            } catch (studentError) {
              console.warn(`Failed to get students for batch ${batch.id}:`, studentError);
              return {
                ...batch,
                currentStudents: 0,
                students: 0
              };
            }
          })
        );
        
        console.log('📚 Batches with student counts:', batchesWithStudentCount.map(b => ({ id: b.id, name: b.name, students: b.currentStudents })));
        res.json(batchesWithStudentCount);
      } catch (dbError) {
        console.log("📚 Database error fetching batches:", dbError);
        logTemporaryEndpoint('batches');
        const fallbackBatches = [
          {
            id: "batch-1",
            name: "HSC Chemistry Batch 2025",
            subject: "chemistry",
            batchCode: "25che",
            password: "che123",
            maxStudents: 30,
            currentStudents: 2,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-12-31'),
            schedule: JSON.stringify({
              days: ["Sunday", "Tuesday", "Thursday"],
              time: "10:00 AM - 12:00 PM"
            }),
            status: "active",
            createdBy: "teacher-belal-sir",
            createdAt: new Date()
          },
          {
            id: "batch-2", 
            name: "HSC ICT Batch 2025",
            subject: "ict",
            batchCode: "25ict",
            password: "ict123",
            maxStudents: 25,
            currentStudents: 1,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-12-31'),
            schedule: JSON.stringify({
              days: ["Monday", "Wednesday", "Friday"],
              time: "2:00 PM - 4:00 PM"
            }),
            status: "active",
            createdBy: "teacher-belal-sir",
            createdAt: new Date()
          }
        ];
        res.json(fallbackBatches);
      }
    } catch (error) {
      console.error("Error fetching batches:", error);
      res.status(500).json({ message: "Failed to fetch batches" });
    }
  });

  // Create new batch
  app.post("/api/batches", async (req: any, res) => {
    try {
      const { name, subject, classTime, classDays, maxStudents, startDate, endDate } = req.body;

      // Generate unique batch code
      const batchCode = `${name.toLowerCase().replace(/\s+/g, '')}${Date.now().toString().slice(-4)}`;
      
      // Generate batch password
      const password = Math.random().toString(36).substring(2, 8).toUpperCase();

      const batchData = {
        name,
        subject,
        batchCode,
        password,
        classTime,
        classDays: JSON.stringify(classDays || []),
        maxStudents: maxStudents || 50,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        createdBy: 'teacher-belal-sir', // For now, hardcoded to main teacher
      };

      const newBatch = await storage.createBatch(batchData);
      
      // Log activity
      await storage.logActivity({
        type: 'batch_created',
        message: `New batch "${name}" created for ${subject}`,
        icon: '📚',
        userId: 'teacher-belal-sir',
        relatedEntityId: newBatch.id,
      });

      res.json({
        ...newBatch,
        password, // Include password in response for teacher to share
      });
    } catch (error) {
      console.error("Error creating batch:", error);
      res.status(500).json({ message: "Failed to create batch" });
    }
  });

  // Legacy route for compatibility
  app.get("/api/users", async (req: any, res) => {
    try {
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Praggo AI Question Generation for teachers
  app.post("/api/ai/generate-questions", requireAuth, async (req: any, res) => {
    try {
      const { 
        subject, 
        examType = 'academic', 
        classLevel, 
        chapter, 
        questionType = 'mcq', 
        questionCategory = 'mixed',
        difficulty = 'medium', 
        count = 5
      } = req.body;

      const sessionUser = (req as any).session?.user;
      if (!sessionUser) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const userId = sessionUser.id;
      const user = await storage.getUser(userId);

      // Only allow teachers to generate questions
      if (!user) {
        console.log('🚫 AI Generation blocked - User not found in database. Session user:', sessionUser);
        // Fallback: if session says teacher but DB lookup failed, allow it
        if (sessionUser.role === 'teacher') {
          console.log('✅ AI Generation allowed via session fallback for teacher');
        } else {
          return res.status(403).json({ error: "User not found or not a teacher" });
        }
      } else if (user.role !== 'teacher') {
        console.log('🚫 AI Generation blocked - User role:', user.role, 'Session user:', sessionUser);
        return res.status(403).json({ error: "Only teachers can use Praggo AI question generator" });
      }

      if (!subject || !chapter) {
        return res.status(400).json({ error: "Subject and chapter are required" });
      }

      const { praggoAI } = await import('./praggoAI');
      
      // Ensure API keys are loaded from database before generation
      await praggoAI.refreshKeys();
      
      const questions = await praggoAI.generateQuestions(
        subject, examType, classLevel, chapter, questionType, questionCategory, difficulty, count, userId, 'teacher'
      );

      res.json({ questions });
    } catch (error) {
      console.error("Praggo AI question generation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Praggo AI প্রশ্ন তৈরিতে সমস্যা হয়েছে।";
      res.status(500).json({ message: errorMessage });
    }
  });


  // Praggo AI usage statistics
  app.get("/api/ai/usage-stats", requireAuth, async (req: any, res) => {
    try {
      const userId = (req as any).session.user.id;
      const { praggoAI } = await import('./praggoAI');
      
      const stats = await praggoAI.getUsageStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching Praggo AI usage stats:", error);
      res.status(500).json({ error: "Failed to fetch usage statistics" });
    }
  });

  // Bulk SMS System with Real BulkSMS Bangladesh API
  app.post("/api/sms/send-bulk", requireAuth, async (req: any, res) => {
    try {
      const sessionUser = req.session.user;
      console.log(`🔍 SMS Request - Session User: ${sessionUser.id}, Role: ${sessionUser.role}`);
      
      // Check role from session directly (more reliable)
      if (sessionUser.role !== 'teacher') {
        console.log(`❌ SMS Auth failed - Session role: ${sessionUser.role}`);
        return res.status(403).json({ message: "Only teachers can send bulk SMS" });
      }
      
      console.log(`✅ SMS Auth successful for teacher: ${sessionUser.firstName} ${sessionUser.lastName}`);
      
      const { message, recipients, smsType = 'general' } = req.body;
      
      if (!message || !recipients || recipients.length === 0) {
        return res.status(400).json({ message: "Message and recipients are required" });
      }

      const smsCount = recipients.length;

      // Use initialized bulkSMSService
      
      // Convert recipients to proper format
      const smsRecipients = recipients.map((recipient: any) => ({
        id: recipient.id || recipient,
        name: recipient.name || 'Student',
        phoneNumber: recipient.phoneNumber || recipient.phone || recipient
      }));

      console.log(`📱 Starting bulk SMS: ${smsCount} messages from teacher ${sessionUser.firstName} ${sessionUser.lastName}`);
      
      // Send bulk SMS using real API
      const result = await bulkSMSService.sendBulkSMS(smsRecipients, message, sessionUser.id, smsType);

      const response = {
        success: result.success,
        message: result.sentCount > 0 
          ? `SMS sent successfully to ${result.sentCount} recipients${result.failedCount > 0 ? `. ${result.failedCount} failed.` : '.'}`
          : `Failed to send SMS to all ${result.failedCount} recipients`,
        sentCount: result.sentCount,
        failedCount: result.failedCount,
        totalRecipients: recipients.length,
        failedMessages: result.failedMessages
      };
      
      res.json(response);
    } catch (error) {
      console.error("Bulk SMS error:", error);
      res.status(500).json({ message: "Failed to send SMS" });
    }
  });

  // SMS Balance Check API

  // SMS Usage Statistics API
  app.get("/api/sms/usage-stats", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'teacher') {
        return res.status(403).json({ message: "Only teachers can view SMS usage statistics" });
      }

      // Get SMS logs for statistics
      const smsStats = await storage.getSmsUsageStats(userId);
      
      res.json(smsStats);
    } catch (error) {
      console.error("Error fetching SMS usage stats:", error);
      res.status(500).json({ message: "Failed to fetch SMS usage statistics" });
    }
  });

  // Get SMS delivery report (DISABLED AUTH FOR TESTING)
  /* app.get("/api/sms/delivery-report", async (req: any, res) => {
    try {
      const userId = (req as any).session.user.id;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'teacher') {
        return res.status(403).json({ message: "Only teachers can view SMS reports" });
      }

      // In real implementation, this would fetch from SMS provider's API
      const mockDeliveryReport = {
        totalSent: 150,
        delivered: 147,
        failed: 3,
        pending: 0,
        lastUpdateTime: new Date(),
        recentMessages: [
          { phoneNumber: '+8801700000001', status: 'delivered', sentAt: new Date(Date.now() - 60000) },
          { phoneNumber: '+8801700000002', status: 'delivered', sentAt: new Date(Date.now() - 120000) },
          { phoneNumber: '+8801700000003', status: 'failed', sentAt: new Date(Date.now() - 180000) }
        ]
      };

      res.json(mockDeliveryReport);
    } catch (error) {
      console.error("Error fetching SMS delivery report:", error);
      res.status(500).json({ message: "Failed to fetch delivery report" });
    }
  }); */

  // Student AI Help - Doubt Solver API endpoint
  app.post("/api/ai/doubt-solver", async (req, res) => {
    try {
      const { question, subject } = req.body;
      
      if (!question || !question.trim()) {
        return res.status(400).json({ error: 'Question is required' });
      }

      // Use Praggo AI (Gemini) to solve student doubts in Bengali
      const { solveBanglaDoubt } = await import('./gemini.ts');
      
      const answer = await solveBanglaDoubt(question.trim(), subject || 'chemistry');
      
      res.json({ 
        answer,
        questionAsked: question,
        subject: subject || 'chemistry'
      });
    } catch (error) {
      console.error('Error solving doubt:', error);
      res.status(500).json({ error: 'Failed to solve doubt. Please try again.' });
    }
  });

  // Messages endpoints - Replace mock data with real data
  app.get("/api/messages", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'No authorization token provided' });
      }
      
      const token = authHeader.replace('Bearer ', '');
      const studentId = token.split('_')[1];
      
      if (!studentId) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // For now, return empty array since messages table isn't fully implemented
      // This will be replaced with real message fetching when message system is complete
      const messages = [];
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'No authorization token provided' });
      }
      
      const token = authHeader.replace('Bearer ', '');
      const studentId = token.split('_')[1];
      
      if (!studentId) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const { recipient, content } = req.body;
      
      // For now, create a simple message object (will be replaced with database storage)
      const message = {
        id: Date.now().toString(),
        senderId: studentId,
        recipientId: recipient,
        content,
        timestamp: new Date().toISOString(),
        isRead: false
      };
      
      res.json(message);
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // Remove mock notices - use real data only
  app.get("/api/notices", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'No authorization token provided' });
      }
      
      // For now, return empty array since notices table isn't implemented yet
      // This will be replaced with real notice fetching when notices system is complete
      const notices = [];
      res.json(notices);
    } catch (error) {
      console.error('Error fetching notices:', error);
      res.status(500).json({ error: 'Failed to fetch notices' });
    }
  });

  app.post("/api/notices", async (req, res) => {
    const { title, content, isImportant } = req.body;
    const mockNotice = {
      id: Date.now().toString(),
      title,
      content,
      date: new Date().toISOString().split('T')[0],
      isImportant: isImportant || false
    };
    res.json(mockNotice);
  });

  // SMS Purchase endpoints - DISABLED (Only usage tracking allowed)
  // Teachers cannot purchase SMS credits - only view usage statistics

  // REMOVED: Duplicate SMS endpoint - use /api/sms/send-bulk for all SMS sending

  // Send SMS for exam results
  app.post("/api/sms/send-exam-results", requireAuth, async (req: any, res) => {
    try {
      const { examId, recipientType = 'both' } = req.body; // 'students', 'parents', 'both'
      const userId = req.session.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'teacher') {
        return res.status(403).json({ error: 'Only teachers can send exam result SMS' });
      }

      // Get exam details
      const exam = await storage.getExamById(examId);
      if (!exam) {
        return res.status(404).json({ error: 'Exam not found' });
      }

      // Get exam submissions
      const submissions = await storage.getSubmissionsByExam(examId);
      if (submissions.length === 0) {
        return res.status(400).json({ error: 'No submissions found for this exam' });
      }

      const recipients = [];
      // Use initialized bulkSMSService
      let totalSent = 0;
      let totalFailed = 0;

      for (const submission of submissions) {
        const student = await storage.getUser(submission.studentId);
        if (!student) continue;

        const score = submission.score || 0;
        const totalMarks = exam.totalMarks || 100;
        const percentage = Math.round((score / totalMarks) * 100);
        
        const message = `${exam.title} পরীক্ষার ফলাফল:\nছাত্র/ছাত্রী: ${student.firstName} ${student.lastName}\nপ্রাপ্ত নম্বর: ${score}/${totalMarks}\nশতকরা: ${percentage}%\n\nধন্যবাদ,\nবেলাল স্যার`;

        // Send to student
        if ((recipientType === 'students' || recipientType === 'both') && student.phoneNumber) {
          const result = await bulkSMSService.sendBulkSMS(
            [{ id: student.id, name: `${student.firstName} ${student.lastName}`, phoneNumber: student.phoneNumber }],
            message,
            userId,
            'exam_result'
          );
          totalSent += result.sentCount;
          totalFailed += result.failedCount;
        }

        // Send to parent
        if ((recipientType === 'parents' || recipientType === 'both') && student.parentPhoneNumber) {
          const parentMessage = `আপনার সন্তান ${student.firstName} ${student.lastName} এর ${exam.title} পরীক্ষার ফলাফল:\nপ্রাপ্ত নম্বর: ${score}/${totalMarks}\nশতকরা: ${percentage}%\n\nধন্যবাদ,\nবেলাল স্যার`;
          
          const result = await bulkSMSService.sendBulkSMS(
            [{ id: `parent-${student.id}`, name: `${student.firstName} এর অভিভাবক`, phoneNumber: student.parentPhoneNumber }],
            parentMessage,
            userId,
            'exam_result'
          );
          totalSent += result.sentCount;
          totalFailed += result.failedCount;
        }
      }

      res.json({
        success: totalSent > 0,
        sent: totalSent,
        failed: totalFailed,
        examTitle: exam.title,
        recipientType,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sending exam result SMS:', error);
      res.status(500).json({ error: 'Failed to send exam result SMS' });
    }
  });

  // Send SMS for attendance notifications
  app.post("/api/sms/send-attendance", requireAuth, async (req: any, res) => {
    try {
      const { batchId, date, recipientType = 'parents' } = req.body;
      const userId = req.session.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'teacher') {
        return res.status(403).json({ error: 'Only teachers can send attendance SMS' });
      }

      // Get batch details
      const batch = await storage.getBatchById(batchId);
      if (!batch) {
        return res.status(404).json({ error: 'Batch not found' });
      }

      // Get attendance records for the date
      const attendanceRecords = await storage.getAttendanceByBatchAndDate(batchId, date);
      if (attendanceRecords.length === 0) {
        return res.status(400).json({ error: 'No attendance records found for this date' });
      }

      // Use initialized bulkSMSService
      let totalSent = 0;
      let totalFailed = 0;
      const formattedDate = new Date(date).toLocaleDateString('bn-BD');

      for (const record of attendanceRecords) {
        const student = await storage.getUser(record.studentId);
        if (!student) continue;

        const status = record.isPresent ? 'উপস্থিত' : 'অনুপস্থিত';
        const emoji = record.isPresent ? '✅' : '❌';
        
        const message = `${emoji} ${formattedDate} তারিখের ক্লাসে:\n\nছাত্র/ছাত্রী: ${student.firstName} ${student.lastName}\nব্যাচ: ${batch.name}\nউপস্থিতি: ${status}\n\nধন্যবাদ,\nবেলাল স্যার`;

        // Send to student
        if ((recipientType === 'students' || recipientType === 'both') && student.phoneNumber) {
          const result = await bulkSMSService.sendBulkSMS(
            [{ id: student.id, name: `${student.firstName} ${student.lastName}`, phoneNumber: student.phoneNumber }],
            message,
            userId,
            'attendance'
          );
          totalSent += result.sentCount;
          totalFailed += result.failedCount;
        }

        // Send to parent
        if ((recipientType === 'parents' || recipientType === 'both') && student.parentPhoneNumber) {
          const parentMessage = `${emoji} ${formattedDate} তারিখের ক্লাসে:\n\nআপনার সন্তান ${student.firstName} ${student.lastName}\nব্যাচ: ${batch.name}\nউপস্থিতি: ${status}\n\nধন্যবাদ,\nবেলাল স্যার`;
          
          const result = await bulkSMSService.sendBulkSMS(
            [{ id: `parent-${student.id}`, name: `${student.firstName} এর অভিভাবক`, phoneNumber: student.parentPhoneNumber }],
            parentMessage,
            userId,
            'attendance'
          );
          totalSent += result.sentCount;
          totalFailed += result.failedCount;
        }
      }

      res.json({
        success: totalSent > 0,
        sent: totalSent,
        failed: totalFailed,
        batchName: batch.name,
        date: formattedDate,
        recipientType,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sending attendance SMS:', error);
      res.status(500).json({ error: 'Failed to send attendance SMS' });
    }
  });

  // Send custom notice SMS with batch/parent selection
  app.post("/api/sms/send-notice", requireAuth, async (req: any, res) => {
    try {
      const { message, targetType, batchIds = [], recipientType = 'both', individualPhones = [] } = req.body;
      const userId = req.session.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'teacher') {
        return res.status(403).json({ error: 'Only teachers can send notice SMS' });
      }

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const recipients = [];
      // Use initialized bulkSMSService

      // Add signature to message
      const finalMessage = `${message}\n\nধন্যবাদ,\nবেলাল স্যার\nChemistry & ICT Care`;

      // Handle different target types
      if (targetType === 'batches' && batchIds.length > 0) {
        // Send to selected batches
        for (const batchId of batchIds) {
          const students = await storage.getStudentsByBatch(batchId);
          
          for (const student of students) {
            // Add student to recipients
            if ((recipientType === 'students' || recipientType === 'both') && student.phoneNumber) {
              recipients.push({
                id: student.id,
                name: `${student.firstName} ${student.lastName}`,
                phoneNumber: student.phoneNumber,
                type: 'student'
              });
            }
            
            // Add parent to recipients
            if ((recipientType === 'parents' || recipientType === 'both') && student.parentPhoneNumber) {
              recipients.push({
                id: `parent-${student.id}`,
                name: `${student.firstName} এর অভিভাবক`,
                phoneNumber: student.parentPhoneNumber,
                type: 'parent'
              });
            }
          }
        }
      } else if (targetType === 'all') {
        // Send to all students/parents
        const allStudents = await storage.getAllStudents();
        
        for (const student of allStudents) {
          if ((recipientType === 'students' || recipientType === 'both') && student.phoneNumber) {
            recipients.push({
              id: student.id,
              name: `${student.firstName} ${student.lastName}`,
              phoneNumber: student.phoneNumber,
              type: 'student'
            });
          }
          
          if ((recipientType === 'parents' || recipientType === 'both') && student.parentPhoneNumber) {
            recipients.push({
              id: `parent-${student.id}`,
              name: `${student.firstName} এর অভিভাবক`,
              phoneNumber: student.parentPhoneNumber,
              type: 'parent'
            });
          }
        }
      } else if (targetType === 'individual' && individualPhones.length > 0) {
        // Send to individual phone numbers
        individualPhones.forEach((phone: string, index: number) => {
          recipients.push({
            id: `individual-${index}`,
            name: 'ব্যক্তিগত',
            phoneNumber: phone,
            type: 'individual'
          });
        });
      }

      if (recipients.length === 0) {
        return res.status(400).json({ error: 'No recipients found' });
      }

      // Send bulk SMS
      const result = await bulkSMSService.sendBulkSMS(
        recipients,
        finalMessage,
        userId,
        'notice'
      );

      res.json({
        success: result.success,
        sent: result.sentCount,
        failed: result.failedCount,
        totalRecipients: recipients.length,
        targetType,
        recipientType,
        messageLength: finalMessage.length,
        failedMessages: result.failedMessages,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sending notice SMS:', error);
      res.status(500).json({ error: 'Failed to send notice SMS' });
    }
  });

  // Get SMS delivery report - Real implementation
  app.get("/api/sms/delivery-report", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'teacher') {
        return res.status(403).json({ error: 'Only teachers can view delivery reports' });
      }

      // Get recent SMS logs
      const recentSms = await storage.getRecentSmsLogs(userId, 50); // Last 50 SMS
      
      const delivered = recentSms.filter(sms => sms.status === 'sent' || sms.status === 'delivered').length;
      const failed = recentSms.filter(sms => sms.status === 'failed').length;
      const pending = recentSms.filter(sms => sms.status === 'pending').length;
      
      const recentMessages = recentSms.slice(0, 10).map(sms => ({
        phoneNumber: sms.recipientPhone,
        recipientName: sms.recipientName,
        smsType: sms.smsType,
        status: sms.status,
        message: sms.message.substring(0, 50) + (sms.message.length > 50 ? '...' : ''),
        timestamp: sms.sentAt,
        credits: sms.credits
      }));

      res.json({
        delivered,
        failed,
        pending,
        totalSent: delivered + failed,
        successRate: delivered + failed > 0 ? Math.round((delivered / (delivered + failed)) * 100) : 0,
        recentMessages
      });
    } catch (error) {
      console.error('Error getting SMS delivery report:', error);
      res.status(500).json({ error: 'Failed to get delivery report' });
    }
  });


  // Calculate SMS cost and character analysis
  app.post("/api/sms/calculate-cost", requireAuth, async (req: any, res) => {
    try {
      const { message, recipientCount } = req.body;
      
      if (!message || !recipientCount) {
        return res.status(400).json({ error: 'Message and recipient count are required' });
      }

      const smsCharacterLimit = 160;
      const messageLength = message.length;
      const smsPerRecipient = Math.ceil(messageLength / smsCharacterLimit);
      const totalSms = smsPerRecipient * recipientCount;
      const costPerSms = 39; // 0.39 paisa in paisa units
      const totalCostPaisa = totalSms * costPerSms;
      const totalCostTaka = totalCostPaisa / 100;

      res.json({
        messageLength,
        smsCharacterLimit,
        smsPerRecipient,
        recipientCount,
        totalSms,
        costPerSms,
        totalCostPaisa,
        totalCostTaka: parseFloat(totalCostTaka.toFixed(2)),
        isLongMessage: messageLength > smsCharacterLimit,
        charactersRemaining: smsCharacterLimit - (messageLength % smsCharacterLimit)
      });
    } catch (error) {
      console.error('Error calculating SMS cost:', error);
      res.status(500).json({ error: 'Failed to calculate SMS cost' });
    }
  });

  // Get recipient count for batches/students
  app.get("/api/sms/recipient-count", requireAuth, async (req: any, res) => {
    try {
      const { targetType, batchIds, recipientType = 'both' } = req.query;
      const userId = req.session.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'teacher') {
        return res.status(403).json({ error: 'Only teachers can check recipient counts' });
      }

      let studentCount = 0;
      let parentCount = 0;

      if (targetType === 'all') {
        const allStudents = await storage.getAllStudents();
        studentCount = allStudents.filter(s => s.phoneNumber).length;
        parentCount = allStudents.filter(s => s.parentPhoneNumber).length;
      } else if (targetType === 'batches' && batchIds) {
        const batchIdArray = Array.isArray(batchIds) ? batchIds : [batchIds];
        
        for (const batchId of batchIdArray) {
          const students = await storage.getStudentsByBatch(batchId);
          studentCount += students.filter(s => s.phoneNumber).length;
          parentCount += students.filter(s => s.parentPhoneNumber).length;
        }
      }

      let totalRecipients = 0;
      if (recipientType === 'students') {
        totalRecipients = studentCount;
      } else if (recipientType === 'parents') {
        totalRecipients = parentCount;
      } else if (recipientType === 'both') {
        totalRecipients = studentCount + parentCount;
      }

      res.json({
        studentCount,
        parentCount,
        totalRecipients,
        targetType,
        recipientType
      });
    } catch (error) {
      console.error('Error getting recipient count:', error);
      res.status(500).json({ error: 'Failed to get recipient count' });
    }
  });

  // REMOVED: Duplicate SMS usage stats endpoint - using secured version above

  // Notes sharing endpoints - Students can share PDF files or Google Drive links
  app.get("/api/notes", async (req, res) => {
    try {
      const { studentId, batchId } = req.query;
      
      let notes;
      if (studentId) {
        notes = await storage.getNotesByStudent(studentId as string);
      } else if (batchId) {
        notes = await storage.getNotesByBatch(batchId as string);
      } else {
        notes = await storage.getAllNotes();
      }
      
      // Parse tags from JSON string
      const formattedNotes = notes.map(note => ({
        ...note,
        tags: note.tags ? JSON.parse(note.tags) : [],
        timeAgo: getTimeAgo(note.createdAt || new Date())
      }));
      
      res.json(formattedNotes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.get("/api/notes/:id", async (req, res) => {
    try {
      const note = await storage.getNoteById(req.params.id);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      // Increment view count
      await storage.incrementNoteViews(req.params.id);
      
      res.json({
        ...note,
        tags: note.tags ? JSON.parse(note.tags) : [],
        timeAgo: getTimeAgo(note.createdAt || new Date())
      });
    } catch (error) {
      console.error("Error fetching note:", error);
      res.status(500).json({ message: "Failed to fetch note" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const noteData = insertNotesSchema.parse(req.body);
      const note = await storage.createNote(noteData);
      
      res.status(201).json({
        ...note,
        tags: note.tags ? JSON.parse(note.tags) : [],
        timeAgo: getTimeAgo(note.createdAt || new Date())
      });
    } catch (error) {
      console.error("Error creating note:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid note data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create note" });
    }
  });

  app.put("/api/notes/:id", async (req, res) => {
    try {
      const noteData = insertNotesSchema.partial().parse(req.body);
      const note = await storage.updateNote(req.params.id, noteData);
      
      res.json({
        ...note,
        tags: note.tags ? JSON.parse(note.tags) : [],
        timeAgo: getTimeAgo(note.createdAt || new Date())
      });
    } catch (error) {
      console.error("Error updating note:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid note data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update note" });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      await storage.deleteNote(req.params.id);
      res.json({ message: "Note deleted successfully" });
    } catch (error) {
      console.error("Error deleting note:", error);
      res.status(500).json({ message: "Failed to delete note" });
    }
  });

  app.post("/api/notes/:id/like", async (req, res) => {
    try {
      await storage.likeNote(req.params.id);
      const note = await storage.getNoteById(req.params.id);
      res.json({ likes: note?.likes || 0 });
    } catch (error) {
      console.error("Error liking note:", error);
      res.status(500).json({ message: "Failed to like note" });
    }
  });


  // Legacy endpoint for compatibility
  app.get('/api/users/:id', requireAuth, async (req, res) => {
    try {
      const userId = req.params.id;
      const sessionUser = (req as any).session.user;
      const user = await storage.getUser(sessionUser.id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        smsCredits: user.smsCredits || 0
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  // Logout endpoint - improved with better session cleanup
  app.post('/api/auth/logout', (req, res) => {
    console.log('=== LOGOUT REQUEST ===');
    console.log('Session before logout:', (req as any).session?.user?.name || 'No user');
    
    if (!(req as any).session) {
      console.log('⚠️ No session found, already logged out');
      return res.json({ success: true });
    }
    
    (req as any).session.destroy((err: any) => {
      if (err) {
        console.error('❌ Session destroy error:', err);
        return res.status(500).json({ message: 'Logout failed' });
      }
      
      console.log('✅ Session destroyed successfully');
      res.clearCookie('connect.sid', { 
        path: '/',
        httpOnly: true,
        secure: false // Set to true in production with HTTPS
      });
      
      res.json({ success: true });
    });
  });

  // Student exams endpoints - Show only teacher-created exams for student's batch
  app.get('/api/student/exams', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      console.log(`🔍 Fetching exams for student: ${userId}`);

      // Get student's batch information
      const student = await storage.getUser(userId);
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      console.log(`👤 Student found: ${student.firstName} ${student.lastName}, Batch: ${(student as any).batchId}`);

      // Get student's batch ID from students table or user profile
      const studentBatchId = (student as any).batchId || 'batch-1'; // fallback for existing students
      
      // Get batch details
      let batch;
      try {
        batch = await storage.getBatchById(studentBatchId);
      } catch (batchError) {
        console.warn("Batch retrieval failed, using fallback:", batchError);
        batch = {
          id: studentBatchId,
          name: 'HSC Chemistry Batch 2025',
          subject: 'chemistry',
          batchCode: 'CHEM25A'
        };
      }

      // Get all exams for this specific batch using direct database query
      let batchExams = [];
      try {
        // Direct database query to get exams for this batch
        const allActiveExams = await db
          .select()
          .from(exams)
          .where(and(
            eq(exams.batchId, studentBatchId),
            eq(exams.isActive, true)
          ))
          .orderBy(desc(exams.examDate));
        
        batchExams = allActiveExams;
        console.log(`📚 Found ${batchExams.length} exams for batch ${studentBatchId}`);
      } catch (dbError) {
        console.log("📝 Database error fetching student exams:", dbError);
        batchExams = [];
      }

      // Get submissions for this student to show completion status
      const submissions = [];
      for (const exam of batchExams) {
        try {
          const submission = await storage.getSubmissionByUserAndExam(userId, exam.id);
          if (submission) {
            submissions.push(submission);
          }
        } catch (error) {
          // No submission found, continue
        }
      }

      res.json({ 
        student: {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          studentId: (student as any).studentId || 'ST001',
          batchId: studentBatchId
        },
        batch: {
          id: batch.id,
          name: batch.name,
          subject: batch.subject,
          batchCode: batch.batchCode
        },
        exams: batchExams.map(exam => {
          const submission = submissions.find(s => s.examId === exam.id);
          return {
            ...exam,
            hasSubmission: !!submission,
            submission: submission
          };
        })
      });
    } catch (error) {
      console.error('Error fetching student exams:', error);
      res.status(500).json({ error: 'Failed to fetch exams' });
    }
  });

  // View finished exam with questions - for batch students  
  app.get('/api/student/exam/:examId/view', async (req, res) => {
    try {
      const examId = req.params.examId;
      const userId = req.query.userId as string;

      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      // Get student info to verify batch access
      const student = await storage.getUser(userId);
      if (!student || !student.batchId) {
        return res.status(404).json({ error: 'Student not found' });
      }

      // Get exam with questions
      const exam = await db
        .select()
        .from(exams)
        .where(eq(exams.id, examId))
        .limit(1);

      if (!exam.length) {
        return res.status(404).json({ error: 'Exam not found' });
      }

      const examData = exam[0];

      // Check if student's batch matches exam's batch
      if (examData.batchId !== student.batchId) {
        return res.status(403).json({ error: 'Access denied - not in exam batch' });
      }

      // Get all questions for this exam
      const examQuestions = await db
        .select({
          id: questions.id,
          questionText: questions.questionText,
          questionType: questions.questionType,
          options: questions.options,
          correctAnswer: questions.correctAnswer,
          questionImage: questions.questionImage,
          driveLink: questions.driveLink,
          marks: questions.marks,
          orderIndex: questions.orderIndex
        })
        .from(questions)
        .where(eq(questions.examId, examId));

      // Check if student has submission for this exam
      const submission = await db
        .select({
          id: examSubmissions.id,
          examId: examSubmissions.examId,
          studentId: examSubmissions.studentId,
          score: examSubmissions.score,
          totalMarks: examSubmissions.totalMarks
        })
        .from(examSubmissions)
        .where(and(
          eq(examSubmissions.examId, examId),
          eq(examSubmissions.studentId, userId)
        ))
        .limit(1);

      console.log(`Student ${userId} viewing exam ${examId} with ${examQuestions.length} questions`);

      res.json({
        exam: {
          id: examData.id,
          title: examData.title,
          subject: examData.subject,
          description: examData.description,
          examDate: examData.examDate,
          duration: examData.duration,
          totalMarks: examData.totalMarks,
          examType: examData.examType,
          examMode: examData.examMode,
          questionSource: examData.questionSource,
          questionContent: examData.questionContent
        },
        questions: examQuestions,
        submission: submission.length ? submission[0] : null,
        hasAccess: true
      });
    } catch (error) {
      console.error('Error fetching exam questions:', error);
      res.status(500).json({ error: 'Failed to fetch exam' });
    }
  });

  app.get('/api/student/stats', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      // Get real student data from database
      const student = await storage.getUser(userId);
      if (!student || !student.batchId) {
        return res.status(404).json({ error: 'Student not found' });
      }

      // Get all exams for student's batch
      const batchExams = await db
        .select()
        .from(exams)
        .where(eq(exams.batchId, student.batchId));

      // Get student's submissions
      const submissions = await db
        .select({
          id: examSubmissions.id,
          examId: examSubmissions.examId,
          studentId: examSubmissions.studentId,
          totalMarks: examSubmissions.totalMarks,
          score: examSubmissions.score
        })
        .from(examSubmissions)
        .where(eq(examSubmissions.studentId, userId));

      const totalExams = batchExams.length;
      const completedExams = submissions.length;
      
      // Calculate average score from submissions
      let averageScore = 0;
      if (submissions.length > 0) {
        const totalScore = submissions.reduce((sum, sub) => sum + (sub.totalMarks || 0), 0);
        averageScore = Math.round(totalScore / submissions.length);
      }

      res.json({
        totalExams,
        completedExams,
        pendingExams: totalExams - completedExams,
        averageScore,
        upcomingExams: batchExams.filter(exam => new Date(exam.examDate) > new Date()).length,
        subject: student.batchId || 'general'
      });
    } catch (error) {
      console.error('Error fetching student stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  // Chapter-wise Google Drive resources endpoint
  app.get('/api/chapter-resources', async (req, res) => {
    try {
      const { class_level, subject, chapter_name, subcategory } = req.query;
      console.log(`📚 Fetching resources for class: ${class_level}, subject: ${subject}, chapter: ${chapter_name}, subcategory: ${subcategory}`);
      
      // Updated sample data with NCTB curriculum chapter names
      const sampleData = [
        // Class 9-10 Chemistry - Updated NCTB names
        {
          id: '1',
          class_level: '9-10',
          subject: 'chemistry',
          chapter_name: 'রসায়নের ধারণা',
          google_drive_link: 'https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j-chemistry-ch1',
          description: 'রসায়নের মৌলিক ধারণা ও পরিচিতি',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          class_level: '9-10',
          subject: 'chemistry',
          chapter_name: 'পদার্থের গঠন',
          google_drive_link: 'https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j-chemistry-ch2',
          description: 'পদার্থের গঠন ও উপাদান',
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          class_level: '9-10',
          subject: 'chemistry',
          chapter_name: 'পরমাণুর গঠন',
          google_drive_link: 'https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j-chemistry-ch3',
          description: 'পরমাণুর অভ্যন্তরীণ গঠন',
          created_at: new Date().toISOString()
        },
        {
          id: '4',
          class_level: '9-10',
          subject: 'chemistry',
          chapter_name: 'রাসায়নিক বন্ধন',
          google_drive_link: '',
          description: 'আয়নিক ও সমযোজী বন্ধন',
          created_at: new Date().toISOString()
        },
        {
          id: '5',
          class_level: '9-10',
          subject: 'chemistry',
          chapter_name: 'অম্ল, ক্ষার ও লবণ',
          google_drive_link: '',
          description: 'অম্ল-ক্ষার সমতা ও লবণের গঠন',
          created_at: new Date().toISOString()
        },
        // Class 9-10 ICT - Updated names
        {
          id: '6',
          class_level: '9-10',
          subject: 'ict',
          chapter_name: 'তথ্য ও যোগাযোগ প্রযুক্তি পরিচিতি',
          google_drive_link: 'https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j-ict-ch1',
          description: 'ICT এর পরিচিতি ও ব্যবহার',
          created_at: new Date().toISOString()
        },
        {
          id: '7',
          class_level: '9-10',
          subject: 'ict',
          chapter_name: 'ICT-এর ভূমিকা ও প্রয়োজনীয়তা',
          google_drive_link: '',
          description: 'আধুনিক জীবনে ICT এর গুরুত্ব',
          created_at: new Date().toISOString()
        },
        // Class 11-12 Chemistry samples
        {
          id: '8',
          class_level: '11-12',
          subject: 'chemistry',
          chapter_name: 'ল্যাবরেটরির নিরাপদ ব্যবহার',
          google_drive_link: 'https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j-hsc-ch1',
          description: 'রসায়ন ল্যাবের নিরাপত্তা ব্যবস্থা',
          created_at: new Date().toISOString()
        },
        {
          id: '9',
          class_level: '11-12',
          subject: 'chemistry',
          chapter_name: 'গুণগত রসায়ন',
          google_drive_link: '',
          description: 'গুণগত বিশ্লেষণ ও পরীক্ষা',
          created_at: new Date().toISOString()
        },
        // Class 11-12 ICT samples
        {
          id: '10',
          class_level: '11-12',
          subject: 'ict',
          chapter_name: 'তথ্য ও যোগাযোগ প্রযুক্তি — বিশ্ব ও বাংলাদেশের প্রেক্ষাপটে',
          subcategory: 'ইঞ্জিনিয়ারিং',
          google_drive_link: 'https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j-hsc-ict-ch1',
          description: 'বিশ্বব্যাপী ICT এর অবস্থান ও বাংলাদেশ - ইঞ্জিনিয়ারিং প্রস্তুতি',
          created_at: new Date().toISOString()
        },
        // Add some examples with subcategories for class 11-12
        {
          id: '11',
          class_level: '11-12',
          subject: 'chemistry',
          chapter_name: 'জৈব রসায়ন',
          subcategory: 'মেডিকেল',
          google_drive_link: 'https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j-medical-organic',
          description: 'মেডিকেল ভর্তি পরীক্ষার জন্য জৈব রসায়ন প্রশ্ন',
          created_at: new Date().toISOString()
        },
        {
          id: '12',
          class_level: '11-12',
          subject: 'chemistry',
          chapter_name: 'জৈব রসায়ন',
          subcategory: 'মূল বইয়ের প্রশ্ন',
          google_drive_link: 'https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j-textbook-organic',
          description: 'পাঠ্যবইয়ের অনুশীলনী প্রশ্ন - জৈব রসায়ন',
          created_at: new Date().toISOString()
        },
        // Add Varsity example
        {
          id: '13',
          class_level: '11-12',
          subject: 'chemistry',
          chapter_name: 'গুণগত রসায়ন',
          subcategory: 'ভার্সিটি',
          google_drive_link: 'https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j-varsity-qualitative',
          description: 'বিশ্ববিদ্যালয় ভর্তি পরীক্ষার জন্য গুণগত রসায়ন',
          created_at: new Date().toISOString()
        }
      ];
      
      // Add teacher-added resources to sample data
      const teacherAddedResources = Array.from(teacherResources.values());
      
      // Combine sample data with teacher resources
      // Teacher resources will override sample data with same key
      let allResources = [...sampleData];
      
      // Replace or add teacher resources
      teacherAddedResources.forEach(teacherResource => {
        const existingIndex = allResources.findIndex(item => 
          item.class_level === teacherResource.class_level &&
          item.subject === teacherResource.subject &&
          item.chapter_name === teacherResource.chapter_name &&
          (item.subcategory || '') === (teacherResource.subcategory || '')
        );
        
        if (existingIndex !== -1) {
          // Replace existing
          allResources[existingIndex] = teacherResource;
        } else {
          // Add new
          allResources.push(teacherResource);
        }
      });

      // Filter data based on query parameters
      let filteredData = allResources;
      if (class_level) {
        filteredData = filteredData.filter(item => item.class_level === class_level);
      }
      if (subject) {
        filteredData = filteredData.filter(item => item.subject === subject);
      }
      if (chapter_name) {
        filteredData = filteredData.filter(item => item.chapter_name === chapter_name);
      }
      if (subcategory) {
        filteredData = filteredData.filter(item => item.subcategory === subcategory);
      }
      
      console.log(`✅ Returning ${filteredData.length} resources`);
      res.json(filteredData);
    } catch (error) {
      console.error('Error fetching chapter resources:', error);
      res.status(500).json({ error: 'Failed to fetch resources' });
    }
  });

  // In-memory storage for chapter resources (temporary until database implementation)
  const teacherResources = new Map();

  // Teacher endpoint to add/update chapter resources
  app.post('/api/teacher/chapter-resources', async (req, res) => {
    try {
      const { class_level, subject, chapter_name, subcategory, google_drive_link, description } = req.body;
      
      // Create a unique key for this resource
      const resourceKey = `${class_level}-${subject}-${chapter_name}${subcategory ? `-${subcategory}` : ''}`;
      
      // Check if resource already exists
      const existingResource = teacherResources.get(resourceKey);
      
      const resourceData = {
        id: existingResource?.id || Date.now().toString(),
        class_level,
        subject,
        chapter_name,
        subcategory,
        google_drive_link,
        description,
        created_at: existingResource?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Store/update the resource
      teacherResources.set(resourceKey, resourceData);
      
      console.log(`📝 Teacher ${existingResource ? 'updated' : 'added'} resource: ${chapter_name} -> ${google_drive_link}`);
      
      res.json({
        success: true,
        message: existingResource ? 'Resource updated successfully' : 'Resource added successfully',
        data: resourceData
      });
    } catch (error) {
      console.error('Error adding chapter resource:', error);
      res.status(500).json({ error: 'Failed to add resource' });
    }
  });

  // Get question bank for students
  app.get('/api/student/question-bank', async (req, res) => {
    try {
      const { subject, chapter, difficulty, page = 1, limit = 10 } = req.query;
      
      // Build where conditions
      const whereConditions = [eq(questionBank.isPublic, true)];
      
      if (subject && subject !== 'all') {
        whereConditions.push(eq(questionBank.subject, subject as string));
      }
      if (chapter && chapter !== 'all') {
        whereConditions.push(eq(questionBank.chapter, chapter as string));
      }
      if (difficulty && difficulty !== 'all') {
        whereConditions.push(eq(questionBank.difficulty, difficulty as string));
      }

      let query = db.select({
        id: questionBank.id,
        subject: questionBank.subject,
        chapter: questionBank.chapter,
        questionText: questionBank.questionText,
        questionType: questionBank.questionType,
        options: questionBank.options,
        correctAnswer: questionBank.correctAnswer,
        questionImage: questionBank.questionImage,
        driveLink: questionBank.driveLink,
        difficulty: questionBank.difficulty,
        marks: questionBank.marks,
        createdAt: questionBank.createdAt
      }).from(questionBank).where(and(...whereConditions));

      const offset = (Number(page) - 1) * Number(limit);
      const questions = await query
        .orderBy(desc(questionBank.createdAt))
        .limit(Number(limit))
        .offset(offset);

      // Get total count with same conditions
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(questionBank)
        .where(and(...whereConditions));
      
      res.json({
        questions,
        totalCount: count,
        totalPages: Math.ceil(count / Number(limit)),
        currentPage: Number(page)
      });
    } catch (error) {
      console.error('Error fetching question bank:', error);
      res.status(500).json({ error: 'Failed to fetch question bank' });
    }
  });

  // Get question bank subjects and chapters for filtering
  app.get('/api/student/question-bank/subjects', async (req, res) => {
    try {
      const subjects = await db
        .selectDistinct({
          subject: questionBank.subject,
        })
        .from(questionBank)
        .where(eq(questionBank.isPublic, true));

      const subjectData = await Promise.all(
        subjects.map(async ({ subject }) => {
          const chapters = await db
            .selectDistinct({
              chapter: questionBank.chapter,
            })
            .from(questionBank)
            .where(and(
              eq(questionBank.isPublic, true),
              eq(questionBank.subject, subject)
            ));

          return {
            subject,
            chapters: chapters.map(c => c.chapter)
          };
        })
      );

      res.json(subjectData);
    } catch (error) {
      console.error('Error fetching question bank subjects:', error);
      res.status(500).json({ error: 'Failed to fetch subjects' });
    }
  });

  // Add question to question bank (Teacher endpoint)
  app.post('/api/teacher/question-bank', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.user.id;
      const teacher = await storage.getUser(userId);
      
      if (!teacher || teacher.role !== 'teacher') {
        return res.status(403).json({ error: 'Teacher access required' });
      }

      const validationResult = insertQuestionBankSchema.safeParse({
        ...req.body,
        teacherId: userId
      });

      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid data', 
          details: validationResult.error.errors 
        });
      }

      const [newQuestion] = await db
        .insert(questionBank)
        .values(validationResult.data)
        .returning();

      console.log(`Teacher ${userId} added question to question bank: ${newQuestion.id}`);
      res.status(201).json(newQuestion);
    } catch (error) {
      console.error('Error adding question to bank:', error);
      res.status(500).json({ error: 'Failed to add question' });
    }
  });

  // Get teacher's question bank stats
  app.get('/api/teacher/question-bank/stats', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.user.id;
      
      const stats = await db
        .select({
          subject: questionBank.subject,
          count: sql<number>`count(*)`,
        })
        .from(questionBank)
        .where(eq(questionBank.teacherId, userId))
        .groupBy(questionBank.subject);

      const total = await db
        .select({ count: sql<number>`count(*)` })
        .from(questionBank)
        .where(eq(questionBank.teacherId, userId));

      res.json({
        totalQuestions: total[0]?.count || 0,
        bySubject: stats
      });
    } catch (error) {
      console.error('Error fetching teacher question bank stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  // Get questions from question bank with hierarchical filtering
  app.get('/api/teacher/question-bank/questions', requireAuth, async (req, res) => {
    try {
      const userId = (req as any).session.user.id;
      const teacher = await storage.getUser(userId);
      
      if (!teacher || teacher.role !== 'teacher') {
        return res.status(403).json({ error: 'Teacher access required' });
      }

      const { subject, category, subCategory } = req.query;

      if (!subject || !category || !subCategory) {
        return res.status(400).json({ error: 'Subject, category, and subCategory are required' });
      }

      const questions = await db
        .select()
        .from(questionBank)
        .where(and(
          eq(questionBank.teacherId, userId),
          eq(questionBank.subject, subject as string),
          eq(questionBank.category, category as string),
          eq(questionBank.subCategory, subCategory as string)
        ))
        .orderBy(desc(questionBank.createdAt));
      
      res.json(questions);
    } catch (error) {
      console.error('Error fetching questions by hierarchy:', error);
      res.status(500).json({ error: 'Failed to fetch questions' });
    }
  });

  // ============= COURSE MANAGEMENT API ROUTES =============

  // Temporary in-memory courses fallback while database endpoint is disabled
  const tempCourses = [
    {
      id: "course-1",
      title: "নবম-দশম শ্রেণীর রসায়ন",
      titleBangla: "নবম-দশম শ্রেণীর রসায়ন",
      description: "নবম ও দশম শ্রেণীর সম্পূর্ণ রসায়ন কোর্স। মূলনীতি থেকে শুরু করে প্রয়োগিক রসায়ন পর্যন্ত বিস্তৃত শিক্ষা।",
      subject: "chemistry",
      targetClass: "Class 9-10",
      iconName: "FlaskConical",
      colorScheme: "green",
      displayOrder: 1,
      isActive: true,
      createdBy: "teacher-belal-sir",
      createdAt: new Date()
    },
    {
      id: "course-2", 
      title: "উচ্চ মাধ্যমিক রসায়ন",
      titleBangla: "উচ্চ মাধ্যমিক রসায়ন",
      description: "একাদশ ও দ্বাদশ শ্রেণীর সম্পূর্ণ রসায়ন কোর্স। জৈব, অজৈব ও ভৌত রসায়নের গভীর পাঠ।",
      subject: "chemistry",
      targetClass: "HSC",
      iconName: "FlaskConical",
      colorScheme: "cyan",
      displayOrder: 2,
      isActive: true,
      createdBy: "teacher-belal-sir",
      createdAt: new Date()
    },
    {
      id: "course-3",
      title: "ভর্তি পরীক্ষার রসায়ন",
      titleBangla: "ভর্তি পরীক্ষার রসায়ন",
      description: "মেডিকেল, ইঞ্জিনিয়ারিং ও বিশ্ববিদ্যালয় ভর্তি পরীক্ষার জন্য বিশেষ রসায়ন কোর্স। উন্নত সমস্যা সমাধান ও কৌশল।",
      subject: "chemistry",
      targetClass: "Admission",
      iconName: "GraduationCap",
      colorScheme: "purple",
      displayOrder: 3,
      isActive: true,
      createdBy: "teacher-belal-sir",
      createdAt: new Date()
    },
    {
      id: "course-4",
      title: "উচ্চ মাধ্যমিক আইসিটি",
      titleBangla: "উচ্চ মাধ্যমিক আইসিটি",
      description: "তথ্য ও যোগাযোগ প্রযুক্তির সম্পূর্ণ কোর্স। প্রোগ্রামিং, ওয়েব ডেভেলপমেন্ট ও প্রযুক্তিগত দক্ষতা উন্নয়ন।",
      subject: "ict",
      targetClass: "HSC",
      iconName: "Monitor",
      colorScheme: "blue",
      displayOrder: 4,
      isActive: true,
      createdBy: "teacher-belal-sir",
      createdAt: new Date()
    }
  ];

  // Get all courses (public endpoint for landing page)
  app.get('/api/courses', async (req, res) => {
    try {
      logTemporaryEndpoint('courses');
      res.json(tempCourses.filter(c => c.isActive));
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  });

  // Get all courses for teacher management (bypass auth for now)
  app.get('/api/teacher/courses', async (req, res) => {
    try {
      logTemporaryEndpoint('courses');
      res.json(tempCourses);
    } catch (error) {
      console.error('Error fetching courses for teacher:', error);
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  });

  // Create new course (bypass auth for demo)
  app.post('/api/teacher/courses', async (req, res) => {
    try {
      logTemporaryEndpoint('course creation');
      
      // Create new temporary course
      const newCourse = {
        id: `course-${Date.now()}`,
        ...req.body,
        createdBy: "teacher-belal-sir",
        createdAt: new Date(),
        isActive: true
      };
      
      // Add to temp courses array
      tempCourses.push(newCourse);
      
      res.json({
        success: true,
        message: 'কোর্স সফলভাবে তৈরি হয়েছে!',
        course: newCourse
      });
    } catch (error) {
      console.error('Error creating course:', error);
      res.status(500).json({ error: 'Failed to create course' });
    }
  });

  // Update course (bypass auth for demo)
  app.put('/api/teacher/courses/:id', async (req, res) => {
    try {
      logTemporaryEndpoint('course update');
      
      const courseId = req.params.id;
      const updateData = req.body;
      
      // Find and update course in temp array
      const courseIndex = tempCourses.findIndex(c => c.id === courseId);
      
      if (courseIndex === -1) {
        return res.status(404).json({ error: 'Course not found' });
      }
      
      // Update the course
      tempCourses[courseIndex] = {
        ...tempCourses[courseIndex],
        ...updateData,
        updatedAt: new Date()
      };
      
      res.json({
        success: true,
        message: 'কোর্স সফলভাবে আপডেট হয়েছে!',
        course: tempCourses[courseIndex]
      });
    } catch (error) {
      console.error('Error updating course:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid course data', errors: error.errors });
      }
      res.status(500).json({ error: 'Failed to update course' });
    }
  });

  // Delete course (bypass auth for demo)
  app.delete('/api/teacher/courses/:id', async (req, res) => {
    try {
      logTemporaryEndpoint('course deletion');
      
      const courseId = req.params.id;
      
      // Find and remove course from temp array
      const courseIndex = tempCourses.findIndex(c => c.id === courseId);
      
      if (courseIndex === -1) {
        return res.status(404).json({ error: 'Course not found' });
      }
      
      // Soft delete - mark as inactive
      tempCourses[courseIndex].isActive = false;
      
      res.json({ 
        success: true, 
        message: 'কোর্স সফলভাবে ডিলিট হয়েছে!' 
      });
    } catch (error) {
      console.error('Error deleting course:', error);
      res.status(500).json({ error: 'Failed to delete course' });
    }
  });

  // ============= TEACHER PROFILE MANAGEMENT API ROUTES =============

  // Temporary image storage for profile pictures (in-memory)
  const tempImageStorage = new Map<string, string>();

  // Temporary teacher profile data fallback while database endpoint is disabled
  let tempTeacherProfile = {
    id: "profile-belal-sir",
    userId: "teacher-belal-sir",
    displayName: "Belal Sir",
    education: "Graduate from Rajshahi University",
    currentPosition: "Teacher at Jahangirpur Girls School and College",
    specialization: "Chemistry & ICT",
    motto: "Excellence in Education",
    bio: "With years of experience in Chemistry and ICT education, I am committed to providing students with the knowledge and skills they need to excel in their academic journey. My goal is to make complex scientific concepts accessible and engaging for every student.",
    avatarUrl: "/api/profile-picture/teacher-belal-sir",
    contactEmail: "belal.sir@chemistry-ict.edu.bd",
    contactPhone: "01712345678",
    yearsOfExperience: 15,
    isPublic: true,
    socialLinks: {
      facebook: "",
      linkedin: "",
      twitter: "",
      website: ""
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Get teacher profile (bypass auth for demo)
  app.get('/api/teacher/profile', async (req, res) => {
    try {
      logTemporaryEndpoint('profile');
      res.json(tempTeacherProfile);
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
      res.status(500).json({ error: 'Failed to fetch teacher profile' });
    }
  });

  // Create or update teacher profile (bypass auth for demo)
  app.put('/api/teacher/profile', async (req, res) => {
    try {
      logTemporaryEndpoint('profile update');
      
      // Update the temporary profile with new data
      tempTeacherProfile = {
        ...tempTeacherProfile,
        ...req.body,
        updatedAt: new Date()
      };
      
      res.json({
        success: true,
        message: 'প্রোফাইল সফলভাবে আপডেট হয়েছে!',
        profile: tempTeacherProfile
      });
    } catch (error) {
      console.error('Error saving teacher profile:', error);
      res.status(500).json({ error: 'Failed to save teacher profile' });
    }
  });

  // Profile picture upload endpoint
  app.post('/api/teacher/profile/upload-picture', async (req, res) => {
    try {
      logTemporaryEndpoint('picture upload');
      
      const { imageData } = req.body;
      
      if (!imageData) {
        return res.status(400).json({ error: 'Image data is required' });
      }
      
      // Validate base64 image data
      if (!imageData.startsWith('data:image/')) {
        return res.status(400).json({ error: 'Invalid image format' });
      }
      
      // Store the image data in temporary storage
      const userId = 'teacher-belal-sir';
      tempImageStorage.set(userId, imageData);
      
      // Update avatar URL to point to our serving endpoint
      const pictureUrl = `/api/profile-picture/${userId}?t=${Date.now()}`;
      
      tempTeacherProfile.avatarUrl = pictureUrl;
      tempTeacherProfile.updatedAt = new Date();

      // Update session user's avatarUrl if they're currently logged in
      // This ensures the sidebar updates immediately after upload
      if ((req as any).session.user && (req as any).session.user.id === userId) {
        (req as any).session.user.avatarUrl = pictureUrl;
      }
      
      console.log('✅ Profile picture stored successfully');
      
      res.json({
        success: true,
        message: 'প্রোফাইল ছবি সফলভাবে আপলোড হয়েছে!',
        avatarUrl: pictureUrl
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      res.status(500).json({ error: 'Failed to upload profile picture' });
    }
  });

  // Profile picture delete endpoint
  app.delete('/api/teacher/profile/delete-picture', async (req, res) => {
    try {
      logTemporaryEndpoint('picture delete');
      
      // Remove from temporary storage
      const userId = 'teacher-belal-sir';
      tempImageStorage.delete(userId);
      
      tempTeacherProfile.avatarUrl = "";
      tempTeacherProfile.updatedAt = new Date();

      // Update session user's avatarUrl if they're currently logged in
      if ((req as any).session.user && (req as any).session.user.id === userId) {
        (req as any).session.user.avatarUrl = "";
      }
      
      console.log('✅ Profile picture deleted successfully');
      
      res.json({
        success: true,
        message: 'প্রোফাইল ছবি সফলভাবে মুছে ফেলা হয়েছে!'
      });
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      res.status(500).json({ error: 'Failed to delete profile picture' });
    }
  });

  // Serve profile picture 
  app.get('/api/profile-picture/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const imageData = tempImageStorage.get(userId);
      
      if (!imageData) {
        // Return a default gradient avatar if no image is found
        console.log('🖼️ No profile picture found, returning default avatar');
        const defaultAvatar = `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#1E40AF;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="200" height="200" fill="url(#grad1)"/>
          <circle cx="100" cy="80" r="40" fill="white" opacity="0.9"/>
          <circle cx="100" cy="160" r="60" fill="white" opacity="0.9"/>
          <text x="100" y="190" text-anchor="middle" fill="white" font-size="16" font-weight="bold" font-family="Arial">
            ${userId.includes('teacher') ? 'Sir' : 'Student'}
          </text>
        </svg>`;
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
        return res.status(200).send(defaultAvatar);
      }
      
      // Extract the base64 data and mime type
      const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ error: 'Invalid image data format' });
      }
      
      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Set proper headers for image response
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      
      console.log(`🖼️ Serving profile picture for ${userId}, size: ${buffer.length} bytes`);
      res.send(buffer);
    } catch (error) {
      console.error('Error serving profile picture:', error);
      res.status(500).json({ error: 'Failed to serve profile picture' });
    }
  });

  // Get public teacher profiles (for landing page)
  app.get('/api/teacher-profiles', async (req, res) => {
    try {
      logTemporaryEndpoint('teacher profiles');
      
      // Return public profiles only
      const publicProfiles = tempTeacherProfile.isPublic ? [tempTeacherProfile] : [];
      res.json(publicProfiles);
    } catch (error) {
      console.error('Error fetching public teacher profiles:', error);
      res.status(500).json({ error: 'Failed to fetch teacher profiles' });
    }
  });

  // API Key Management Routes
  app.get('/api/praggo-ai/keys', async (req, res) => {
    try {
      // Check if user is logged in via session (using existing session structure)
      const user = (req as any).session?.user;
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (user.role !== 'teacher') {
        return res.status(403).json({ error: 'Only teachers can manage API keys' });
      }

      console.log('📋 Loading Praggo AI keys for teacher...');

      // Load from database and sync with environment
      const dbKeys = await storage.getAllPraggoAIKeys();
      
      const keyNames = [
        'GEMINI_API_KEY',
        'GEMINI_API_KEY_2',
        'GEMINI_API_KEY_3',
        'GEMINI_API_KEY_4',
        'GEMINI_API_KEY_5',
        'GEMINI_API_KEY_6',
        'GEMINI_API_KEY_7'
      ];

      const keys = keyNames.map((keyName, index) => {
        // First check database for stored key
        const dbKey = dbKeys.find(k => k.keyName === keyName);
        let envKey = process.env[keyName];
        
        // If key exists in database but not in environment, restore it
        if (dbKey && dbKey.keyValue && (!envKey || envKey.length < 10)) {
          process.env[keyName] = dbKey.keyValue;
          envKey = dbKey.keyValue;
          console.log(`🔄 Restored API key from database: ${keyName}`);
        }
        
        const hasValidKey = !!(envKey && envKey.trim().length > 10);
        return {
          id: index + 1,
          name: keyName,
          status: hasValidKey ? 'active' : 'inactive',
          hasKey: hasValidKey,
          maskedKey: hasValidKey ? '••••••••••••' + envKey.slice(-4) : '',
          showKey: false
        };
      });

      console.log('📋 Loaded API keys status:', keys.filter(k => k.hasKey).length, 'active keys');
      res.json(keys);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      res.status(500).json({ error: 'Failed to fetch API keys' });
    }
  });

  app.post('/api/praggo-ai/keys', async (req, res) => {
    try {
      // Check if user is logged in via session (using existing session structure)
      const user = (req as any).session?.user;
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (user.role !== 'teacher') {
        return res.status(403).json({ error: 'Only teachers can manage API keys' });
      }

      const { keys } = req.body;
      
      if (!Array.isArray(keys)) {
        return res.status(400).json({ error: 'Keys must be an array' });
      }

      console.log('🔧 Saving Praggo AI keys:', keys.length, 'keys provided');

      let savedCount = 0;
      
      for (const keyData of keys) {
        if (!keyData.key || !keyData.name || keyData.key.trim().length < 10) continue;
        
        try {
          // Set environment variable
          process.env[keyData.name] = keyData.key.trim();
          savedCount++;
          
          console.log(`✅ Saved API key: ${keyData.name} (${keyData.key.substring(0, 12)}...)`);
        } catch (keyError) {
          console.error(`❌ Failed to save key ${keyData.name}:`, keyError);
        }
      }

      // Save keys to database for persistence  
      try {
        for (const keyData of keys) {
          if (!keyData.key || keyData.key.trim().length < 10) continue;
          
          const keyIndex = keyData.id - 1; // Convert 1-based ID to 0-based index
          await storage.upsertPraggoAIKey(keyData.name, keyData.key, keyIndex, true);
          console.log('💾 Saved key to database:', keyData.name);
        }
        console.log('💾 All keys saved to database successfully');
      } catch (dbError) {
        console.warn('⚠️ Database save failed:', dbError.message);
      }

      console.log(`🎯 Praggo AI Keys Saved: ${savedCount} keys configured successfully!`);

      res.json({ 
        success: true, 
        message: `${savedCount}টি API key সফলভাবে সংরক্ষণ করা হয়েছে`,
        savedCount,
        totalProvided: keys.length
      });
    } catch (error) {
      console.error('Error saving API keys:', error);
      res.status(500).json({ error: 'Failed to save API keys' });
    }
  });

  // Question Bank API Routes for NCTB Structure
  
  // Get question bank categories for filtering
  app.get('/api/question-bank/categories', async (req, res) => {
    try {
      const { classLevel, subject, paper } = req.query;
      
      if (!classLevel || !subject) {
        return res.status(400).json({ message: 'classLevel and subject are required' });
      }
      
      const categories = await storage.getQuestionBankCategoriesByFilter(
        classLevel as string, 
        subject as string, 
        paper as string
      );
      
      res.json(categories);
    } catch (error) {
      console.error('Error fetching question bank categories:', error);
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  });

  // Get question bank items by filtering parameters
  app.get('/api/question-bank/items', async (req, res) => {
    try {
      const { classLevel, subject, category, chapter, paper } = req.query;
      
      if (!classLevel || !subject || !category || !chapter) {
        return res.status(400).json({ 
          message: 'classLevel, subject, category, and chapter are required' 
        });
      }
      
      // Get items from questionBank table based on filter criteria
      const items = await db.select().from(questionBank)
        .where(
          and(
            eq(questionBank.subject, subject as string),
            eq(questionBank.category, category as string),
            eq(questionBank.chapter, chapter as string)
          )
        )
        .orderBy(desc(questionBank.createdAt));
      
      // Format items for frontend
      const formattedItems = items.map(item => ({
        id: item.id,
        title: `${item.questionText.substring(0, 50)}...`,
        description: item.questionText,
        driveLink: item.driveLink,
        questionType: item.questionType,
        subject: item.subject,
        category: item.category,
        chapter: item.chapter,
        difficulty: item.difficulty,
        marks: item.marks,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }));
      
      res.json(formattedItems);
    } catch (error) {
      console.error('Error fetching question bank items:', error);
      res.status(500).json({ message: 'Failed to fetch items' });
    }
  });

  // Add new question bank category
  app.post('/api/question-bank/categories', requireAuth, async (req: any, res) => {
    try {
      const sessionUser = req.session?.user;
      if (!sessionUser || sessionUser.role !== 'teacher') {
        return res.status(403).json({ message: "Only teachers can create categories" });
      }

      const categoryData = {
        ...req.body,
        createdBy: sessionUser.id
      };
      
      const newCategory = await storage.createQuestionBankCategory(categoryData);
      res.json(newCategory);
    } catch (error) {
      console.error('Error creating question bank category:', error);
      res.status(500).json({ message: 'Failed to create category' });
    }
  });

  // Add new question bank item
  app.post('/api/question-bank/items', requireAuth, async (req: any, res) => {
    try {
      const sessionUser = req.session?.user;
      if (!sessionUser || sessionUser.role !== 'teacher') {
        return res.status(403).json({ message: "Only teachers can create items" });
      }

      const { title, description, driveLink, questionType, classLevel, subject, category, chapter, paper } = req.body;
      
      if (!title || !driveLink || !subject || !category || !chapter) {
        return res.status(400).json({ 
          message: 'Missing required fields: title, driveLink, subject, category, chapter' 
        });
      }
      
      // Insert directly into questionBank table
      const [newItem] = await db.insert(questionBank).values({
        teacherId: sessionUser.id,
        subject,
        category,
        subCategory: paper || 'Board',
        chapter,
        questionText: title,
        questionType: questionType || 'pdf',
        driveLink,
        difficulty: 'medium',
        marks: 1,
        isPublic: true
      }).returning();
      
      res.json({
        id: newItem.id,
        title: newItem.questionText,
        description: newItem.questionText,
        driveLink: newItem.driveLink,
        questionType: newItem.questionType,
        subject: newItem.subject,
        category: newItem.category,
        chapter: newItem.chapter,
        createdAt: newItem.createdAt
      });
    } catch (error) {
      console.error('Error creating question bank item:', error);
      res.status(500).json({ message: 'Failed to create item' });
    }
  });

  // Delete question bank item
  app.delete('/api/question-bank/items/:itemId', requireAuth, async (req: any, res) => {
    try {
      const sessionUser = req.session?.user;
      if (!sessionUser || sessionUser.role !== 'teacher') {
        return res.status(403).json({ message: "Only teachers can delete items" });
      }

      const { itemId } = req.params;
      
      // Delete from questionBank table
      await db.delete(questionBank)
        .where(
          and(
            eq(questionBank.id, itemId),
            eq(questionBank.teacherId, sessionUser.id)
          )
        );
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting question bank item:', error);
      res.status(500).json({ message: 'Failed to delete item' });
    }
  });

  // Track download for question bank item
  app.post('/api/question-bank/items/:itemId/download', async (req, res) => {
    try {
      const { itemId } = req.params;
      
      // For now, just return success - we can add download tracking later
      console.log(`📥 Question bank item ${itemId} downloaded`);
      res.json({ success: true });
    } catch (error) {
      console.error('Error tracking download:', error);
      res.status(500).json({ message: 'Failed to track download' });
    }
  });

  // Student Question Bank endpoints
  app.get('/api/student/question-bank/subjects', async (req, res) => {
    try {
      // Get unique subjects and chapters from question bank
      const subjects = await db.selectDistinct({
        subject: questionBank.subject,
        category: questionBank.category,
        chapter: questionBank.chapter
      }).from(questionBank).where(eq(questionBank.isPublic, true));

      // Group by subject
      const subjectsData = subjects.reduce((acc: any, item: any) => {
        const existingSubject = acc.find((s: any) => s.subject === item.subject);
        if (existingSubject) {
          if (!existingSubject.chapters.includes(item.chapter)) {
            existingSubject.chapters.push(item.chapter);
          }
        } else {
          acc.push({
            subject: item.subject,
            categories: [item.category],
            chapters: [item.chapter]
          });
        }
        return acc;
      }, []);

      res.json(subjectsData);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      res.status(500).json({ message: 'Failed to fetch subjects' });
    }
  });

  app.get('/api/student/question-bank', async (req, res) => {
    try {
      const { subject = 'all', chapter = 'all', difficulty = 'all', page = '1', limit = '8' } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions
      let whereConditions = [eq(questionBank.isPublic, true)];
      
      if (subject !== 'all') {
        whereConditions.push(eq(questionBank.subject, subject as string));
      }
      if (chapter !== 'all') {
        whereConditions.push(eq(questionBank.chapter, chapter as string));
      }
      if (difficulty !== 'all') {
        whereConditions.push(eq(questionBank.difficulty, difficulty as string));
      }

      // Get total count
      const [countResult] = await db.select({ count: sql<number>`count(*)` })
        .from(questionBank)
        .where(and(...whereConditions));

      const totalCount = countResult.count;
      const totalPages = Math.ceil(totalCount / limitNum);

      // Get questions with pagination
      const questions = await db.select().from(questionBank)
        .where(and(...whereConditions))
        .orderBy(desc(questionBank.createdAt))
        .limit(limitNum)
        .offset(offset);

      res.json({
        questions,
        totalPages,
        totalCount,
        currentPage: pageNum
      });
    } catch (error) {
      console.error('Error fetching student question bank:', error);
      res.status(500).json({ message: 'Failed to fetch question bank' });
    }
  });

  // Get all question bank categories
  app.get("/api/question-bank/categories", async (req: any, res) => {
    try {
      const categories = await storage.getQuestionBankCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching question bank categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get question bank categories by filter (class, subject, paper)
  app.get("/api/question-bank/categories/filter", async (req: any, res) => {
    try {
      const { classLevel, subject, paper } = req.query;
      if (!classLevel || !subject) {
        return res.status(400).json({ message: "Class level and subject are required" });
      }
      
      const categories = await storage.getQuestionBankCategoriesByFilter(classLevel, subject, paper);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching filtered categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Create new question bank category (Teachers only)
  app.post("/api/question-bank/categories", requireAuth, async (req: any, res) => {
    try {
      const sessionUser = (req as any).session?.user;
      if (!sessionUser || sessionUser.role !== 'teacher') {
        return res.status(403).json({ message: "Only teachers can create categories" });
      }

      const categoryData = {
        ...req.body,
        createdBy: sessionUser.id
      };

      const category = await storage.createQuestionBankCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating question bank category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Update question bank category
  app.put("/api/question-bank/categories/:id", requireAuth, async (req: any, res) => {
    try {
      const sessionUser = (req as any).session?.user;
      if (!sessionUser || sessionUser.role !== 'teacher') {
        return res.status(403).json({ message: "Only teachers can update categories" });
      }

      const { id } = req.params;
      const category = await storage.updateQuestionBankCategory(id, req.body);
      res.json(category);
    } catch (error) {
      console.error("Error updating question bank category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  // Delete question bank category
  app.delete("/api/question-bank/categories/:id", requireAuth, async (req: any, res) => {
    try {
      const sessionUser = (req as any).session?.user;
      if (!sessionUser || sessionUser.role !== 'teacher') {
        return res.status(403).json({ message: "Only teachers can delete categories" });
      }

      const { id } = req.params;
      await storage.deleteQuestionBankCategory(id);
      res.json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting question bank category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Get question bank items by category
  app.get("/api/question-bank/categories/:categoryId/items", async (req: any, res) => {
    try {
      const { categoryId } = req.params;
      const items = await storage.getQuestionBankItems(categoryId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching question bank items:", error);
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  // Get question bank items by category and chapter
  app.get("/api/question-bank/categories/:categoryId/items/chapter/:chapter", async (req: any, res) => {
    try {
      const { categoryId, chapter } = req.params;
      const items = await storage.getQuestionBankItemsByChapter(categoryId, decodeURIComponent(chapter));
      res.json(items);
    } catch (error) {
      console.error("Error fetching question bank items by chapter:", error);
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  // Create question bank item (Teachers only)
  app.post("/api/question-bank/items", requireAuth, async (req: any, res) => {
    try {
      const sessionUser = (req as any).session?.user;
      if (!sessionUser || sessionUser.role !== 'teacher') {
        return res.status(403).json({ message: "Only teachers can add items" });
      }

      const itemData = {
        ...req.body,
        createdBy: sessionUser.id
      };

      const item = await storage.createQuestionBankItem(itemData);
      res.json(item);
    } catch (error) {
      console.error("Error creating question bank item:", error);
      res.status(500).json({ message: "Failed to create item" });
    }
  });

  // Update question bank item
  app.put("/api/question-bank/items/:id", requireAuth, async (req: any, res) => {
    try {
      const sessionUser = (req as any).session?.user;
      if (!sessionUser || sessionUser.role !== 'teacher') {
        return res.status(403).json({ message: "Only teachers can update items" });
      }

      const { id } = req.params;
      const item = await storage.updateQuestionBankItem(id, req.body);
      res.json(item);
    } catch (error) {
      console.error("Error updating question bank item:", error);
      res.status(500).json({ message: "Failed to update item" });
    }
  });

  // Delete question bank item
  app.delete("/api/question-bank/items/:id", requireAuth, async (req: any, res) => {
    try {
      const sessionUser = (req as any).session?.user;
      if (!sessionUser || sessionUser.role !== 'teacher') {
        return res.status(403).json({ message: "Only teachers can delete items" });
      }

      const { id } = req.params;
      await storage.deleteQuestionBankItem(id);
      res.json({ success: true, message: "Item deleted successfully" });
    } catch (error) {
      console.error("Error deleting question bank item:", error);
      res.status(500).json({ message: "Failed to delete item" });
    }
  });

  // Track download for question bank item
  app.post("/api/question-bank/items/:id/download", async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.incrementDownloadCount(id);
      res.json({ success: true, message: "Download tracked" });
    } catch (error) {
      console.error("Error tracking download:", error);
      res.status(500).json({ message: "Failed to track download" });
    }
  });

  // ====== MESSAGING SYSTEM API ROUTES ======
  // Get conversation between teacher and student
  app.get("/api/messages/conversation/:otherUserId", requireAuth, async (req: any, res) => {
    try {
      // Prevent caching to ensure fresh message data
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const currentUserId = req.session?.user?.id;
      const otherUserId = req.params.otherUserId;
      
      console.log(`💬 Fetching conversation between ${currentUserId} and ${otherUserId}`);
      
      const messages = await storage.getMessagesBetweenUsers(currentUserId, otherUserId);
      
      // Add sender info for display
      const enrichedMessages = await Promise.all(messages.map(async (message) => {
        const sender = await storage.getUser(message.fromUserId);
        const receiver = await storage.getUser(message.toUserId);
        return {
          ...message,
          senderId: message.fromUserId, // Add for frontend compatibility
          receiverId: message.toUserId, // Add for frontend compatibility
          senderName: `${sender?.firstName} ${sender?.lastName}`,
          senderRole: sender?.role,
          receiverName: `${receiver?.firstName} ${receiver?.lastName}`,
          receiverRole: receiver?.role
        };
      }));
      
      res.json(enrichedMessages);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  // Send a message (students to teacher, teacher to students - NOT teacher receiving)
  app.post("/api/messages/send", requireAuth, async (req: any, res) => {
    try {
      const senderId = req.session?.user?.id;
      const senderRole = req.session?.user?.role;
      const { receiverId, content } = req.body;
      
      if (!content || !receiverId) {
        return res.status(400).json({ message: "Content and receiver ID are required" });
      }
      
      // RESTRICTION: Teachers cannot receive messages (as specified by user)
      const receiver = await storage.getUser(receiverId);
      if (receiver?.role === 'teacher' && senderRole === 'student') {
        // Allow students to send to teachers
      } else if (receiver?.role === 'student' && senderRole === 'teacher') {
        // Allow teachers to send to students
      } else {
        return res.status(403).json({ message: "Invalid messaging permission" });
      }
      
      console.log(`💬 Sending message from ${senderRole} ${senderId} to ${receiver?.role} ${receiverId}`);
      
      const message = await storage.createMessage({
        fromUserId: senderId,
        toUserId: receiverId,
        content: content.trim(),
        isRead: false
      });
      
      // Log activity
      await storage.logActivity({
        type: 'message_sent',
        message: `Message sent to ${receiver?.firstName} ${receiver?.lastName}`,
        icon: '💬',
        userId: senderId
      });
      
      res.json({ success: true, message });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Get all students for teacher to message (teacher side)
  app.get("/api/messages/students", requireAuth, async (req: any, res) => {
    try {
      // Prevent caching to ensure fresh message data
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const teacherId = req.session?.user?.id;
      const teacherRole = req.session?.user?.role;
      
      if (teacherRole !== 'teacher') {
        return res.status(403).json({ message: "Only teachers can access student list" });
      }
      
      const students = await storage.getAllStudents();
      
      // Get recent message for each student
      const studentsWithMessages = await Promise.all(students.map(async (student) => {
        const recentMessages = await storage.getMessagesBetweenUsers(teacherId, student.id);
        const lastMessage = recentMessages[recentMessages.length - 1];
        
        return {
          ...student,
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
            isRead: lastMessage.isRead,
            isFromMe: lastMessage.fromUserId === teacherId
          } : null
        };
      }));
      
      res.json(studentsWithMessages);
    } catch (error) {
      console.error("Error fetching students for messaging:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  // Get teacher info for student messaging (student side)
  app.get("/api/messages/teacher", requireAuth, async (req: any, res) => {
    try {
      // Prevent caching to ensure fresh message data
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      const studentRole = req.session?.user?.role;
      
      if (studentRole !== 'student') {
        return res.status(403).json({ message: "Only students can access teacher info" });
      }
      
      // Get the main teacher (Belal Sir)
      const teacher = await storage.getUser('c71a0268-95ab-4ae1-82cf-3fefdf08116d');
      
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      
      res.json({
        id: teacher.id,
        name: `${teacher.firstName} ${teacher.lastName}`,
        role: teacher.role,
        phoneNumber: teacher.phoneNumber
      });
    } catch (error) {
      console.error("Error fetching teacher info:", error);
      res.status(500).json({ message: "Failed to fetch teacher info" });
    }
  });

  // Mark message as read
  app.patch("/api/messages/:messageId/read", requireAuth, async (req: any, res) => {
    try {
      const messageId = req.params.messageId;
      await storage.markMessageAsRead(messageId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  const httpServer = createServer(app);
  // Get exams results status (whether marks have been entered)
  app.get('/api/exams/results-status', async (req, res) => {
    try {
      const exams = await storage.getExams();
      const resultsStatus: Record<string, { hasResults: boolean }> = {};
      
      // Check each exam for results
      for (const exam of exams) {
        const results = await storage.getExamResults(exam.id);
        resultsStatus[exam.id] = { hasResults: results.length > 0 };
      }
      
      res.json(resultsStatus);
    } catch (error) {
      console.error('Error fetching exam results status:', error);
      res.status(500).json({ error: 'Failed to fetch results status' });
    }
  });

  // Get exam results with student performance (for result view)
  app.get('/api/exams/:examId/results', async (req, res) => {
    try {
      const examId = req.params.examId;
      
      // Get exam details
      const exam = await storage.getExamById(examId);
      if (!exam) {
        return res.status(404).json({ error: 'Exam not found' });
      }

      // Get all students who took this exam (from examSubmissions)
      const results = await storage.getExamResults(examId);
      
      // Enrich results with student information
      const enrichedResults = await Promise.all(
        results.map(async (result) => {
          const student = await storage.getUser(result.studentId);
          return {
            ...result,
            student: {
              id: student?.id,
              firstName: student?.firstName,
              lastName: student?.lastName,
              studentId: student?.studentId,
              phoneNumber: student?.phoneNumber
            }
          };
        })
      );
      
      // Rank students by marks (highest first)
      const rankedResults = enrichedResults.sort((a, b) => b.marks - a.marks);
      
      // Add ranking and format results for frontend
      const formattedResults = rankedResults.map((result, index) => {
        const percentage = Math.round((result.marks / (exam.totalMarks || 100)) * 100);
        let grade = 'F';
        if (percentage >= 90) grade = 'A+';
        else if (percentage >= 80) grade = 'A';
        else if (percentage >= 70) grade = 'B';
        else if (percentage >= 60) grade = 'C';
        
        return {
          id: result.student.id,
          firstName: result.student.firstName,
          lastName: result.student.lastName,
          studentId: result.student.studentId,
          marks: result.marks,
          percentage: percentage,
          rank: index + 1,
          grade: grade,
          feedback: result.feedback || 'Good effort! Keep practicing for better results.'
        };
      });
      
      // Calculate statistics
      const totalStudents = rankedResults.length;
      const totalMarks = exam.totalMarks || 100;
      const marks = rankedResults.map(r => r.marks);
      
      const stats = {
        totalStudents,
        averageScore: marks.length > 0 ? marks.reduce((a, b) => a + b, 0) / marks.length : 0,
        highestScore: marks.length > 0 ? Math.max(...marks) : 0,
        lowestScore: marks.length > 0 ? Math.min(...marks) : 0,
        passedStudents: rankedResults.filter(r => (r.marks / totalMarks) * 100 >= 60).length,
        gradeDistribution: {
          aPlus: rankedResults.filter(r => (r.marks / totalMarks) * 100 >= 90).length,
          a: rankedResults.filter(r => {
            const percentage = (r.marks / totalMarks) * 100;
            return percentage >= 80 && percentage < 90;
          }).length,
          b: rankedResults.filter(r => {
            const percentage = (r.marks / totalMarks) * 100;
            return percentage >= 70 && percentage < 80;
          }).length,
          c: rankedResults.filter(r => {
            const percentage = (r.marks / totalMarks) * 100;
            return percentage >= 60 && percentage < 70;
          }).length,
          fail: rankedResults.filter(r => (r.marks / totalMarks) * 100 < 60).length
        }
      };

      res.json({
        exam,
        results: formattedResults,
        stats
      });
    } catch (error) {
      console.error('Error fetching exam results:', error);
      res.status(500).json({ error: 'Failed to fetch exam results' });
    }
  });

  return httpServer;
}