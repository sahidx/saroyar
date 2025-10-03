// Schema adapter for PostgreSQL production database
const schemaModule = await import('@shared/schema');

export const {
  users,
  batches,
  exams,
  questions,
  examSubmissions,
  messages,
  notices,
  attendance,
  smsTransactions,
  smsLogs,
  activityLogs,
  notes,
  courses,
  teacherProfiles,
  praggoAIKeys,
  questionBankCategories,
  questionBankItems,
  monthlyResults,
  sessions,
  insertUserSchema,
  insertBatchSchema,
  insertExamSchema,
  insertQuestionSchema,
  insertMessageSchema,
  insertNoticeSchema
} = schemaModule;

export type {
  User,
  NewUser,
  Batch,
  NewBatch,
  Exam,
  NewExam,
  Question,
  NewQuestion,
  Message,
  NewMessage,
  Notice,
  NewNotice
} = schemaModule;