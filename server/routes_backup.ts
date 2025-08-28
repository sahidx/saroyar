import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertExamSchema, insertQuestionSchema, insertMessageSchema, insertNoticeSchema, insertSmsTransactionSchema } from "@shared/schema";
import { z } from "zod";
import { generateQuestions, solveDoubt } from "./anthropic";
import { generateQuestionsWithGemini, solveDoubtWithGemini } from "./gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database with real data
  const { seedDatabase } = await import('./seedData');
  await seedDatabase();

  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard stats routes
  app.get("/api/teacher/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'teacher') {
        return res.status(403).json({ message: "Access denied" });
      }

      const stats = await storage.getTeacherStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching teacher stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/student/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'student') {
        return res.status(403).json({ message: "Access denied" });
      }

      const stats = await storage.getStudentStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching student stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Exam routes
  app.get("/api/exams", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role === 'teacher') {
        const exams = await storage.getExamsByTeacher(userId);
        res.json(exams);
      } else {
        // For students, return all active exams from all teachers
        const allExams = await storage.getExamsByTeacher('');
        res.json(allExams.filter(exam => exam.isActive));
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
      res.status(500).json({ message: "Failed to fetch exams" });
    }
  });

  app.post("/api/exams", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'teacher') {
        return res.status(403).json({ message: "Only teachers can create exams" });
      }

      const examData = insertExamSchema.parse({
        ...req.body,
        createdBy: userId,
      });

      const exam = await storage.createExam(examData);
      res.json(exam);
    } catch (error) {
      console.error("Error creating exam:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid exam data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create exam" });
    }
  });

  app.get("/api/exams/:id", isAuthenticated, async (req, res) => {
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

  // Question routes
  app.get("/api/exams/:examId/questions", isAuthenticated, async (req, res) => {
    try {
      const questions = await storage.getQuestionsByExam(req.params.examId);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.post("/api/exams/:examId/questions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  // Message routes
  app.get("/api/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messages = await storage.getRecentMessagesForUser(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: userId,
      });

      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Notice routes
  app.get("/api/notices", isAuthenticated, async (req, res) => {
    try {
      const notices = await storage.getActiveNotices();
      res.json(notices);
    } catch (error) {
      console.error("Error fetching notices:", error);
      res.status(500).json({ message: "Failed to fetch notices" });
    }
  });

  app.post("/api/notices", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
  });

  // Exam submission routes
  app.post("/api/exams/:examId/submit", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
  app.get("/api/exams/:examId/submission", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const submission = await storage.getSubmissionByUserAndExam(userId, req.params.examId);
      res.json(submission);
    } catch (error) {
      console.error("Error fetching submission:", error);
      res.status(500).json({ message: "Failed to fetch submission" });
    }
  });

  // AI Question Generation
  app.post("/api/ai/generate-questions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'teacher') {
        return res.status(403).json({ message: "Only teachers can generate questions" });
      }

      const { topic, subject, questionCount = 5, difficulty = 'medium', provider = 'claude' } = req.body;

      let questions;
      if (provider === 'gemini') {
        questions = await generateQuestionsWithGemini(topic, subject, questionCount, difficulty);
      } else {
        questions = await generateQuestions(topic, subject, questionCount, difficulty);
      }

      res.json({ questions });
    } catch (error) {
      console.error("Error generating questions:", error);
      res.status(500).json({ message: "Failed to generate questions" });
    }
  });

  // AI Doubt Solving
  app.post("/api/ai/solve-doubt", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'student') {
        return res.status(403).json({ message: "Only students can ask doubts" });
      }

      const { question, subject, provider = 'claude' } = req.body;

      let solution;
      if (provider === 'gemini') {
        solution = await solveDoubtWithGemini(question, subject);
      } else {
        solution = await solveDoubt(question, subject);
      }

      res.json({ solution });
    } catch (error) {
      console.error("Error solving doubt:", error);
      res.status(500).json({ message: "Failed to solve doubt" });
    }
  });

  // SMS Transaction routes
  app.post("/api/sms/purchase", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'teacher') {
        return res.status(403).json({ message: "Only teachers can purchase SMS credits" });
      }

      const transactionData = insertSmsTransactionSchema.parse({
        ...req.body,
        userId: userId,
        paymentStatus: 'completed', // Simplified for demo
      });

      const transaction = await storage.createSmsTransaction(transactionData);
      
      // Update user's SMS credits
      const newCredits = (user.smsCredits || 0) + transaction.smsCount;
      await storage.updateUserSmsCredits(userId, newCredits);

      res.json(transaction);
    } catch (error) {
      console.error("Error purchasing SMS credits:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to purchase SMS credits" });
    }
  });

  app.get("/api/sms/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getSmsTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching SMS transactions:", error);
      res.status(500).json({ message: "Failed to fetch SMS transactions" });
    }
  });

  // Attendance routes
  app.get("/api/attendance/:studentId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  // Get all users (for teacher to see students)
  app.get("/api/users", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'teacher') {
        return res.status(403).json({ message: "Only teachers can view all users" });
      }

      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
  });
        senderId: userId,
      });

      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Notice routes
  app.get("/api/notices", isAuthenticated, async (req, res) => {
    try {
      const notices = await storage.getActiveNotices();
      res.json(notices);
    } catch (error) {
      console.error("Error fetching notices:", error);
      res.status(500).json({ message: "Failed to fetch notices" });
    }
  });

  app.post("/api/notices", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
  });

  // AI Question Generation for Teachers
  app.post("/api/ai/generate-questions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'teacher') {
        return res.status(403).json({ message: "Only teachers can generate questions" });
      }

      const requestSchema = z.object({
        subject: z.enum(['chemistry', 'ict']),
        topic: z.string().min(1),
        difficulty: z.enum(['easy', 'medium', 'hard']),
        questionType: z.enum(['mcq', 'written', 'both']),
        count: z.number().min(1).max(10),
        aiProvider: z.enum(['claude', 'gemini']).optional().default('claude')
      });

      const requestData = requestSchema.parse(req.body);
      const questions = requestData.aiProvider === 'gemini' 
        ? await generateQuestionsWithGemini(requestData)
        : await generateQuestions(requestData);
      
      res.json(questions);
    } catch (error) {
      console.error("Error generating questions:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to generate questions" });
    }
  });

  // AI Doubt Solver for Students
  app.post("/api/ai/solve-doubt", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'student') {
        return res.status(403).json({ message: "Only students can solve doubts" });
      }

      const requestSchema = z.object({
        doubt: z.string().min(1),
        subject: z.enum(['chemistry', 'ict']),
        difficulty: z.enum(['easy', 'medium', 'hard']),
        aiProvider: z.enum(['claude', 'gemini']).optional().default('claude')
      });

      const requestData = requestSchema.parse(req.body);
      const solution = requestData.aiProvider === 'gemini' 
        ? await solveDoubtWithGemini(requestData)
        : await solveDoubt(requestData);
      
      res.json({ solution });
    } catch (error) {
      console.error("Error solving doubt:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to solve doubt" });
    }
  });

  // SMS Purchase Routes
  app.post("/api/sms/purchase", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'teacher') {
        return res.status(403).json({ message: "Only teachers can purchase SMS credits" });
      }

      const requestSchema = z.object({
        packageName: z.string().min(1),
        smsCount: z.number().min(1),
        price: z.number().min(1),
        paymentMethod: z.enum(['bkash', 'nagad', 'rocket', 'bank']),
        phoneNumber: z.string().min(11).max(15)
      });

      const requestData = requestSchema.parse(req.body);
      
      const transactionData = insertSmsTransactionSchema.parse({
        userId,
        packageName: requestData.packageName,
        smsCount: requestData.smsCount,
        price: requestData.price,
        paymentMethod: requestData.paymentMethod,
        phoneNumber: requestData.phoneNumber,
        paymentStatus: 'pending'
      });

      const transaction = await storage.createSmsTransaction(transactionData);
      
      // In a real app, this would integrate with actual payment gateways
      // For now, we'll simulate the payment process
      const paymentInstructions = {
        transactionId: transaction.id,
        instructions: `Please send ৳${requestData.price} to our ${requestData.paymentMethod} number: 01XXXXXXXXX. Use transaction ID: ${transaction.id} as reference. SMS credits will be added after payment verification.`,
        paymentMethod: requestData.paymentMethod,
        amount: requestData.price,
        package: requestData.packageName
      };
      
      res.json(paymentInstructions);
    } catch (error) {
      console.error("Error processing SMS purchase:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid purchase data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to process SMS purchase" });
    }
  });

  app.get("/api/sms/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'teacher') {
        return res.status(403).json({ message: "Access denied" });
      }

      const transactions = await storage.getSmsTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching SMS transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
