#!/usr/bin/env node

/**
 * Fix Seed Data Script
 * This script fixes invalid UUID strings in the database
 * and replaces them with proper UUIDs.
 */

const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");
const { users, batches } = require("./shared/schema");
const { eq } = require("drizzle-orm");

async function fixSeedData() {
  console.log('🔧 Starting seed data fix...');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client, { schema: { users, batches } });

  try {
    console.log('🔍 Checking for invalid UUID formats...');

    // Find users with invalid UUID formats
    const invalidUsers = await db.execute(`
      SELECT id, first_name, last_name, role 
      FROM users 
      WHERE id NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
    `);

    console.log(`Found ${invalidUsers.length} users with invalid UUIDs`);

    for (const user of invalidUsers) {
      const oldId = user.id;
      const newId = crypto.randomUUID();
      
      console.log(`Fixing user: ${user.first_name} ${user.last_name} (${user.role})`);
      console.log(`  Old ID: ${oldId}`);
      console.log(`  New ID: ${newId}`);

      // Update user ID
      await db.execute(`UPDATE users SET id = $1 WHERE id = $2`, [newId, oldId]);

      // Update references in other tables
      await db.execute(`UPDATE batches SET created_by = $1 WHERE created_by = $2`, [newId, oldId]);
      await db.execute(`UPDATE exams SET created_by = $1 WHERE created_by = $2`, [newId, oldId]);
      await db.execute(`UPDATE attendance SET student_id = $1 WHERE student_id = $2`, [newId, oldId]);
      await db.execute(`UPDATE attendance SET marked_by = $1 WHERE marked_by = $2`, [newId, oldId]);
      await db.execute(`UPDATE activity_logs SET user_id = $1 WHERE user_id = $2`, [newId, oldId]);
      await db.execute(`UPDATE activity_logs SET related_user_id = $1 WHERE related_user_id = $2`, [newId, oldId]);

      console.log(`  ✅ Updated user and all references`);
    }

    // Find batches with invalid UUID formats
    const invalidBatches = await db.execute(`
      SELECT id, name, batch_code 
      FROM batches 
      WHERE id NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
    `);

    console.log(`Found ${invalidBatches.length} batches with invalid UUIDs`);

    for (const batch of invalidBatches) {
      const oldId = batch.id;
      const newId = crypto.randomUUID();
      
      console.log(`Fixing batch: ${batch.name} (${batch.batch_code})`);
      console.log(`  Old ID: ${oldId}`);
      console.log(`  New ID: ${newId}`);

      // Update batch ID
      await db.execute(`UPDATE batches SET id = $1 WHERE id = $2`, [newId, oldId]);

      // Update references in other tables
      await db.execute(`UPDATE users SET batch_id = $1 WHERE batch_id = $2`, [newId, oldId]);
      await db.execute(`UPDATE exams SET batch_id = $1 WHERE batch_id = $2`, [newId, oldId]);
      await db.execute(`UPDATE attendance SET batch_id = $1 WHERE batch_id = $2`, [newId, oldId]);

      console.log(`  ✅ Updated batch and all references`);
    }

    console.log('✅ Seed data fix completed successfully!');

  } catch (error) {
    console.error('❌ Seed data fix failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the fix
if (require.main === module) {
  fixSeedData().catch(console.error);
}

module.exports = { fixSeedData };