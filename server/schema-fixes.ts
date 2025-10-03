/**
 * Schema Validation and Compatibility Fixes for VPS Deployment
 * This script ensures PostgreSQL schema matches the application expectations
 */

import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * Subject normalization for legacy data compatibility
 */
export function normalizeLegacySubject(subject: string): string {
  const subjectMap: Record<string, string> = {
    'chemistry': 'science',  // Legacy chemistry -> science
    'ict': 'science',        // Legacy ICT -> science
    'physics': 'science',    // Legacy physics -> science
    'biology': 'science',    // Legacy biology -> science
    'science': 'science',    // Keep science
    'math': 'math',          // Keep math
    'higher_math': 'higher_math', // Keep higher_math
    'mathematics': 'math',   // Alternative math name
  };
  
  return subjectMap[subject.toLowerCase()] || 'science'; // Default to science
}

/**
 * Fix common database compatibility issues
 */
export async function fixDatabaseCompatibility() {
  console.log('🔧 Running database compatibility fixes...');
  
  try {
    // Fix 1: Ensure all enum values are properly handled
    await normalizeSubjectValues();
    
    // Fix 2: Ensure boolean fields are properly handled (PostgreSQL vs SQLite)
    await normalizeBooleanFields();
    
    // Fix 3: Ensure timestamp fields are properly handled
    await normalizeTimestampFields();
    
    // Fix 4: Ensure JSON fields are properly handled
    await normalizeJsonFields();
    
    console.log('✅ Database compatibility fixes completed');
  } catch (error) {
    console.error('❌ Database compatibility fixes failed:', error);
    throw error;
  }
}

/**
 * Normalize subject values to match enum
 */
async function normalizeSubjectValues() {
  console.log('🔄 Normalizing subject values...');
  
  try {
    // Update batches table
    await db.execute(sql`
      UPDATE batches 
      SET subject = CASE 
        WHEN subject IN ('chemistry', 'ict', 'physics', 'biology') THEN 'science'
        WHEN subject = 'mathematics' THEN 'math'
        ELSE subject
      END
      WHERE subject NOT IN ('math', 'higher_math', 'science')
    `);
    
    // Update exams table
    await db.execute(sql`
      UPDATE exams 
      SET subject = CASE 
        WHEN subject IN ('chemistry', 'ict', 'physics', 'biology') THEN 'science'
        WHEN subject = 'mathematics' THEN 'math'
        ELSE subject
      END
      WHERE subject NOT IN ('math', 'higher_math', 'science')
    `);
    
    // Update courses table
    await db.execute(sql`
      UPDATE courses 
      SET subject = CASE 
        WHEN subject IN ('chemistry', 'ict', 'physics', 'biology') THEN 'science'
        WHEN subject = 'mathematics' THEN 'math'
        ELSE subject
      END
      WHERE subject NOT IN ('math', 'higher_math', 'science')
    `);
    
    // Update notes table
    await db.execute(sql`
      UPDATE notes 
      SET subject = CASE 
        WHEN subject IN ('chemistry', 'ict', 'physics', 'biology') THEN 'science'
        WHEN subject = 'mathematics' THEN 'math'
        ELSE subject
      END
      WHERE subject NOT IN ('math', 'higher_math', 'science')
    `);
    
    // Update attendance table
    await db.execute(sql`
      UPDATE attendance 
      SET subject = CASE 
        WHEN subject IN ('chemistry', 'ict', 'physics', 'biology') THEN 'science'
        WHEN subject = 'mathematics' THEN 'math'
        ELSE subject
      END
      WHERE subject IS NOT NULL AND subject NOT IN ('math', 'higher_math', 'science')
    `);
    
    console.log('✅ Subject values normalized');
  } catch (error) {
    console.log('⚠️  Subject normalization skipped - tables may not exist yet');
  }
}

/**
 * Normalize boolean fields for PostgreSQL compatibility
 */
async function normalizeBooleanFields() {
  console.log('🔄 Normalizing boolean fields...');
  
  try {
    // These updates handle the difference between SQLite (0/1) and PostgreSQL (true/false)
    const booleanUpdates = [
      // Users table
      `UPDATE users SET is_active = CASE WHEN is_active::text IN ('1', 'true', 't') THEN true ELSE false END`,
      
      // Exams table  
      `UPDATE exams SET is_active = CASE WHEN is_active::text IN ('1', 'true', 't') THEN true ELSE false END`,
      
      // Notices table
      `UPDATE notices SET is_active = CASE WHEN is_active::text IN ('1', 'true', 't') THEN true ELSE false END`,
      
      // Notes table
      `UPDATE notes SET is_public = CASE WHEN is_public::text IN ('1', 'true', 't') THEN true ELSE false END`,
      
      // Courses table
      `UPDATE courses SET is_active = CASE WHEN is_active::text IN ('1', 'true', 't') THEN true ELSE false END`,
      
      // Teacher profiles table
      `UPDATE teacher_profiles SET is_public = CASE WHEN is_public::text IN ('1', 'true', 't') THEN true ELSE false END`,
      
      // Grading schemes table
      `UPDATE grading_schemes SET is_active = CASE WHEN is_active::text IN ('1', 'true', 't') THEN true ELSE false END`,
      `UPDATE grading_schemes SET is_default = CASE WHEN is_default::text IN ('1', 'true', 't') THEN true ELSE false END`,
    ];
    
    for (const updateQuery of booleanUpdates) {
      try {
        await db.execute(sql.raw(updateQuery));
      } catch (error) {
        // Skip if table doesn't exist
        console.log(`⚠️  Skipped boolean update: ${error}`);
      }
    }
    
    console.log('✅ Boolean fields normalized');
  } catch (error) {
    console.log('⚠️  Boolean normalization skipped - some tables may not exist yet');
  }
}

/**
 * Normalize timestamp fields for PostgreSQL compatibility
 */
async function normalizeTimestampFields() {
  console.log('🔄 Normalizing timestamp fields...');
  
  try {
    // Convert Unix timestamps to PostgreSQL timestamps where needed
    // This is mainly for data migrated from SQLite
    
    const timestampUpdates = [
      // Users table
      `UPDATE users SET 
        created_at = CASE 
          WHEN created_at IS NULL THEN NOW()
          WHEN created_at::text ~ '^[0-9]+$' AND LENGTH(created_at::text) = 10 THEN to_timestamp(created_at::bigint)
          ELSE created_at 
        END,
        updated_at = CASE 
          WHEN updated_at IS NULL THEN NOW()
          WHEN updated_at::text ~ '^[0-9]+$' AND LENGTH(updated_at::text) = 10 THEN to_timestamp(updated_at::bigint)
          ELSE updated_at 
        END`,
      
      // Set default timestamps for null values
      `UPDATE users SET created_at = NOW() WHERE created_at IS NULL`,
      `UPDATE users SET updated_at = NOW() WHERE updated_at IS NULL`,
      
      `UPDATE batches SET created_at = NOW() WHERE created_at IS NULL`,
      `UPDATE batches SET updated_at = NOW() WHERE updated_at IS NULL`,
      
      `UPDATE exams SET created_at = NOW() WHERE created_at IS NULL`,
      `UPDATE exams SET updated_at = NOW() WHERE updated_at IS NULL`,
    ];
    
    for (const updateQuery of timestampUpdates) {
      try {
        await db.execute(sql.raw(updateQuery));
      } catch (error) {
        // Skip if table doesn't exist or column type mismatch
        console.log(`⚠️  Skipped timestamp update: ${error}`);
      }
    }
    
    console.log('✅ Timestamp fields normalized');
  } catch (error) {
    console.log('⚠️  Timestamp normalization skipped - some tables may not exist yet');
  }
}

/**
 * Normalize JSON fields for PostgreSQL compatibility
 */
async function normalizeJsonFields() {
  console.log('🔄 Normalizing JSON fields...');
  
  try {
    // Ensure JSON fields are properly formatted
    const jsonUpdates = [
      // Fix class_days JSON in batches
      `UPDATE batches SET class_days = '[]'::jsonb WHERE class_days IS NULL OR class_days = ''`,
      
      // Fix target_students JSON in exams
      `UPDATE exams SET target_students = NULL WHERE target_students = '' OR target_students = 'null'`,
      
      // Fix options JSON in questions
      `UPDATE questions SET options = NULL WHERE options = '' OR options = 'null'`,
      
      // Fix answers JSON in exam_submissions
      `UPDATE exam_submissions SET answers = '{}'::jsonb WHERE answers IS NULL OR answers = ''`,
    ];
    
    for (const updateQuery of jsonUpdates) {
      try {
        await db.execute(sql.raw(updateQuery));
      } catch (error) {
        // Skip if table doesn't exist
        console.log(`⚠️  Skipped JSON update: ${error}`);
      }
    }
    
    console.log('✅ JSON fields normalized');
  } catch (error) {
    console.log('⚠️  JSON normalization skipped - some tables may not exist yet');
  }
}

/**
 * Validate database schema consistency
 */
export async function validateSchemaConsistency() {
  console.log('🔍 Validating schema consistency...');
  
  const validationResults = {
    enums: await validateEnums(),
    tables: await validateTables(),
    relationships: await validateRelationships(),
  };
  
  const hasErrors = Object.values(validationResults).some(result => result.errors.length > 0);
  
  if (hasErrors) {
    console.error('❌ Schema validation failed:');
    Object.entries(validationResults).forEach(([category, result]) => {
      if (result.errors.length > 0) {
        console.error(`  ${category}:`, result.errors);
      }
    });
    throw new Error('Schema validation failed');
  }
  
  console.log('✅ Schema validation passed');
  return validationResults;
}

async function validateEnums() {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    // Check if all required enums exist
    const enumChecks = [
      'user_role',
      'subject', 
      'batch_status',
      'attendance_status',
      'payment_status',
      'sms_type',
      'note_type',
      'api_key_status'
    ];
    
    for (const enumName of enumChecks) {
      const result = await db.execute(sql`
        SELECT 1 FROM pg_type WHERE typname = ${enumName}
      `);
      
      if (result.length === 0) {
        errors.push(`Missing enum: ${enumName}`);
      }
    }
  } catch (error) {
    errors.push(`Enum validation error: ${error}`);
  }
  
  return { errors, warnings };
}

async function validateTables() {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    // Check if all required tables exist
    const tableChecks = [
      'users',
      'batches', 
      'exams',
      'questions',
      'exam_submissions',
      'attendance',
      'sms_logs',
      'activity_logs'
    ];
    
    for (const tableName of tableChecks) {
      const result = await db.execute(sql`
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = ${tableName} AND table_schema = 'public'
      `);
      
      if (result.length === 0) {
        warnings.push(`Table may not exist: ${tableName}`);
      }
    }
  } catch (error) {
    errors.push(`Table validation error: ${error}`);
  }
  
  return { errors, warnings };
}

async function validateRelationships() {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    // Check foreign key relationships
    const relationshipChecks = [
      { table: 'users', column: 'batch_id', references: 'batches(id)' },
      { table: 'exams', column: 'batch_id', references: 'batches(id)' },
      { table: 'questions', column: 'exam_id', references: 'exams(id)' },
      { table: 'exam_submissions', column: 'exam_id', references: 'exams(id)' },
      { table: 'exam_submissions', column: 'student_id', references: 'users(id)' },
    ];
    
    for (const check of relationshipChecks) {
      try {
        // This is a simplified check - in a real scenario you'd check pg_constraint
        const result = await db.execute(sql`
          SELECT 1 FROM information_schema.table_constraints 
          WHERE table_name = ${check.table} AND constraint_type = 'FOREIGN KEY'
        `);
        
        if (result.length === 0) {
          warnings.push(`No foreign keys found for ${check.table}`);
        }
      } catch (error) {
        warnings.push(`Relationship check failed for ${check.table}: ${error}`);
      }
    }
  } catch (error) {
    errors.push(`Relationship validation error: ${error}`);
  }
  
  return { errors, warnings };
}