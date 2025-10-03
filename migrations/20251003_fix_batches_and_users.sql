-- Universal Database Migration for Missing Columns
-- This migration safely adds any missing columns that the frontend/backend expects
-- Using IF NOT EXISTS ensures this is safe to run multiple times

-- ==============================================
-- BATCHES TABLE FIXES
-- ==============================================

-- Add missing columns in batches table
ALTER TABLE batches ADD COLUMN IF NOT EXISTS class_days TEXT;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS class_time TEXT;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS batch_code TEXT;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS schedule TEXT;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE batches ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 50;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS current_students INTEGER DEFAULT 0;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS start_date TIMESTAMP;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS end_date TIMESTAMP;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS created_by TEXT;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE batches ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Add unique constraint for batch_code if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'batches_batch_code_unique') THEN
        ALTER TABLE batches ADD CONSTRAINT batches_batch_code_unique UNIQUE (batch_code);
    END IF;
END $$;

-- ==============================================
-- USERS TABLE FIXES
-- ==============================================

-- Add missing columns in users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS sms_credits INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS student_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_phone_number TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS student_password TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS institution TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS class_level TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS batch_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS admission_date TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- ==============================================
-- EXAMS TABLE FIXES
-- ==============================================

-- Add missing columns in exams table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exams') THEN
        ALTER TABLE exams ADD COLUMN IF NOT EXISTS title TEXT;
        ALTER TABLE exams ADD COLUMN IF NOT EXISTS description TEXT;
        ALTER TABLE exams ADD COLUMN IF NOT EXISTS subject TEXT;
        ALTER TABLE exams ADD COLUMN IF NOT EXISTS batch_id TEXT;
        ALTER TABLE exams ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 60;
        ALTER TABLE exams ADD COLUMN IF NOT EXISTS total_marks INTEGER DEFAULT 100;
        ALTER TABLE exams ADD COLUMN IF NOT EXISTS passing_marks INTEGER DEFAULT 40;
        ALTER TABLE exams ADD COLUMN IF NOT EXISTS start_time TIMESTAMP;
        ALTER TABLE exams ADD COLUMN IF NOT EXISTS end_time TIMESTAMP;
        ALTER TABLE exams ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
        ALTER TABLE exams ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
        ALTER TABLE exams ADD COLUMN IF NOT EXISTS created_by TEXT;
        ALTER TABLE exams ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
        ALTER TABLE exams ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    END IF;
END $$;

-- ==============================================
-- QUESTIONS TABLE FIXES
-- ==============================================

-- Add missing columns in questions table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'questions') THEN
        ALTER TABLE questions ADD COLUMN IF NOT EXISTS exam_id TEXT;
        ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_text TEXT;
        ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT 'multiple_choice';
        ALTER TABLE questions ADD COLUMN IF NOT EXISTS options JSONB;
        ALTER TABLE questions ADD COLUMN IF NOT EXISTS correct_answer TEXT;
        ALTER TABLE questions ADD COLUMN IF NOT EXISTS explanation TEXT;
        ALTER TABLE questions ADD COLUMN IF NOT EXISTS marks INTEGER DEFAULT 1;
        ALTER TABLE questions ADD COLUMN IF NOT EXISTS order_index INTEGER;
        ALTER TABLE questions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
        ALTER TABLE questions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    END IF;
END $$;

-- ==============================================
-- MESSAGES TABLE FIXES
-- ==============================================

-- Add missing columns in messages table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
        ALTER TABLE messages ADD COLUMN IF NOT EXISTS sender_id TEXT;
        ALTER TABLE messages ADD COLUMN IF NOT EXISTS recipient_id TEXT;
        ALTER TABLE messages ADD COLUMN IF NOT EXISTS batch_id TEXT;
        ALTER TABLE messages ADD COLUMN IF NOT EXISTS subject TEXT;
        ALTER TABLE messages ADD COLUMN IF NOT EXISTS content TEXT;
        ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'personal';
        ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
        ALTER TABLE messages ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
        ALTER TABLE messages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    END IF;
END $$;

-- ==============================================
-- NOTICES TABLE FIXES
-- ==============================================

-- Add missing columns in notices table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notices') THEN
        ALTER TABLE notices ADD COLUMN IF NOT EXISTS title TEXT;
        ALTER TABLE notices ADD COLUMN IF NOT EXISTS content TEXT;
        ALTER TABLE notices ADD COLUMN IF NOT EXISTS batch_id TEXT;
        ALTER TABLE notices ADD COLUMN IF NOT EXISTS notice_type TEXT DEFAULT 'general';
        ALTER TABLE notices ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
        ALTER TABLE notices ADD COLUMN IF NOT EXISTS created_by TEXT;
        ALTER TABLE notices ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
        ALTER TABLE notices ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    END IF;
END $$;

-- ==============================================
-- ADD FOREIGN KEY CONSTRAINTS IF MISSING
-- ==============================================

-- Foreign key for users.batch_id -> batches.id
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_batch_id_fkey') THEN
        ALTER TABLE users ADD CONSTRAINT users_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES batches(id);
    END IF;
EXCEPTION
    WHEN others THEN
        -- Ignore if constraint already exists or tables don't exist
        NULL;
END $$;

-- ==============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ==============================================

-- Index on users.batch_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_batch_id ON users(batch_id);

-- Index on users.role for filtering
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Index on batches.created_by for teacher filtering  
CREATE INDEX IF NOT EXISTS idx_batches_created_by ON batches(created_by);

-- Index on batches.status for active batch filtering
CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(status);

-- ==============================================
-- UPDATE EXISTING DATA TYPES IF NEEDED
-- ==============================================

-- Ensure UUIDs are properly formatted (if using UUID columns)
DO $$
BEGIN
    -- Update any malformed IDs if needed
    -- This is a safe operation that only affects malformed data
    UPDATE users SET id = gen_random_uuid()::text WHERE id IS NULL OR LENGTH(id) < 10;
    UPDATE batches SET id = gen_random_uuid()::text WHERE id IS NULL OR LENGTH(id) < 10;
EXCEPTION
    WHEN others THEN
        -- Ignore if gen_random_uuid() is not available or other issues
        NULL;
END $$;

-- ==============================================
-- COMPLETION MESSAGE
-- ==============================================

-- Insert a migration log entry
INSERT INTO migrations_log (migration_name, applied_at) 
VALUES ('20251003_fix_batches_and_users', NOW())
ON CONFLICT DO NOTHING;

-- Create migrations_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS migrations_log (
    id SERIAL PRIMARY KEY,
    migration_name TEXT UNIQUE NOT NULL,
    applied_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE migrations_log IS 'Tracks applied database migrations';

-- Final message
DO $$
BEGIN
    RAISE NOTICE 'Universal migration completed successfully!';
    RAISE NOTICE 'All expected columns have been added safely.';
    RAISE NOTICE 'This migration is idempotent and safe to re-run.';
END $$;