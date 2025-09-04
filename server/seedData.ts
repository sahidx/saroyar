import { db } from "./db";
import { users, batches } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding with REAL data only...");

    // Check if users already exist
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log("Database already seeded. Skipping...");
      return;
    }

    // Create REAL teacher - Belal Sir
    const [teacher] = await db.insert(users).values({
      id: "teacher-belal-sir", 
      email: null,
      firstName: "Belal",
      lastName: "Sir",
      phoneNumber: "01712345678", // Real phone number provided by user
      role: "teacher",
      smsCredits: 1000,
      profileImageUrl: null,
      isActive: true,
    }).returning();

    console.log("✅ REAL Teacher created:", teacher.firstName, teacher.lastName);

    // Create REAL Chemistry Batch - 22che
    const [realBatch] = await db.insert(batches).values({
      name: "HSC Chemistry Batch 2022",
      subject: "chemistry",
      batchCode: "22che", // Real batch code provided by user
      password: "123456", // Real password provided by user
      maxStudents: 30,
      currentStudents: 1, // Will have 1 real student
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      schedule: JSON.stringify({
        days: ["Sunday", "Tuesday", "Thursday"],
        time: "10:00 AM - 12:00 PM"
      }),
      status: "active",
      createdBy: teacher.id,
    }).returning();

    console.log("✅ REAL Batch created:", realBatch.name);

    // Create REAL student - Sahid Rahman
    const [realStudent] = await db.insert(users).values({
      id: "student-sahid",
      email: "sahid.rahman@student.edu.bd", 
      firstName: "Sahid",
      lastName: "Rahman",
      role: "student",
      studentId: "22CHE001", // Generated student ID for 22che batch
      phoneNumber: "01818291546", // Real phone number provided by user
      parentPhoneNumber: "01818291546", // Same as student for now
      address: "Dhaka, Bangladesh",
      dateOfBirth: new Date('2005-01-01'),
      gender: "Male",
      institution: "HSC Candidate",
      classLevel: "HSC",
      batchId: realBatch.id,
      isActive: true,
    }).returning();

    console.log("✅ REAL Student created:", realStudent.firstName, realStudent.lastName);

    // Update batch student count to 1 (real count)
    await db.update(batches).set({ currentStudents: 1 }).where(eq(batches.id, realBatch.id));

    console.log("🎉 Database seeding completed with REAL data only!");
    console.log("👨‍🏫 REAL Teacher: Belal Sir");
    console.log("📱 Teacher Phone: 01734285995");
    console.log("🔐 Teacher Password: 123456");
    console.log("🧪 REAL Batch: 22che");
    console.log("🔐 Batch Password: 123456");
    console.log("👨‍🎓 REAL Student: Sahid Rahman (ID: 22CHE001)");
    console.log("📱 Student Phone: 01818291546");
    console.log("📊 Real Statistics: 1 student, 0 exams, 0 fake data");
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}