CREATE TABLE "batch_fee_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"batch_id" varchar NOT NULL,
	"monthly_fee" integer NOT NULL,
	"admission_fee" integer DEFAULT 0,
	"exam_fee" integer DEFAULT 0,
	"effective_from" timestamp DEFAULT now(),
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fee_payments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fee_id" varchar NOT NULL,
	"amount" integer NOT NULL,
	"payment_method" varchar DEFAULT 'cash' NOT NULL,
	"transaction_id" varchar,
	"collected_by" varchar NOT NULL,
	"remarks" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "student_fees" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" varchar NOT NULL,
	"batch_id" varchar NOT NULL,
	"month" varchar NOT NULL,
	"amount" integer NOT NULL,
	"amount_paid" integer DEFAULT 0 NOT NULL,
	"status" varchar DEFAULT 'unpaid' NOT NULL,
	"due_date" timestamp NOT NULL,
	"remarks" text,
	"collected_by" varchar,
	"collected_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "attendance" ALTER COLUMN "subject" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "batches" ALTER COLUMN "subject" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "subject" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "exams" ALTER COLUMN "subject" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "notes" ALTER COLUMN "subject" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "praggo_ai_usage" ALTER COLUMN "subject" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "question_bank_categories" ALTER COLUMN "subject" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."subject";--> statement-breakpoint
CREATE TYPE "public"."subject" AS ENUM('math', 'higher_math', 'science');--> statement-breakpoint
ALTER TABLE "attendance" ALTER COLUMN "subject" SET DATA TYPE "public"."subject" USING "subject"::"public"."subject";--> statement-breakpoint
ALTER TABLE "batches" ALTER COLUMN "subject" SET DATA TYPE "public"."subject" USING "subject"::"public"."subject";--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "subject" SET DATA TYPE "public"."subject" USING "subject"::"public"."subject";--> statement-breakpoint
ALTER TABLE "exams" ALTER COLUMN "subject" SET DATA TYPE "public"."subject" USING "subject"::"public"."subject";--> statement-breakpoint
ALTER TABLE "notes" ALTER COLUMN "subject" SET DATA TYPE "public"."subject" USING "subject"::"public"."subject";--> statement-breakpoint
ALTER TABLE "praggo_ai_usage" ALTER COLUMN "subject" SET DATA TYPE "public"."subject" USING "subject"::"public"."subject";--> statement-breakpoint
ALTER TABLE "question_bank_categories" ALTER COLUMN "subject" SET DATA TYPE "public"."subject" USING "subject"::"public"."subject";--> statement-breakpoint
ALTER TABLE "batch_fee_settings" ADD CONSTRAINT "batch_fee_settings_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batch_fee_settings" ADD CONSTRAINT "batch_fee_settings_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_payments" ADD CONSTRAINT "fee_payments_fee_id_student_fees_id_fk" FOREIGN KEY ("fee_id") REFERENCES "public"."student_fees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_payments" ADD CONSTRAINT "fee_payments_collected_by_users_id_fk" FOREIGN KEY ("collected_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_fees" ADD CONSTRAINT "student_fees_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_fees" ADD CONSTRAINT "student_fees_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_fees" ADD CONSTRAINT "student_fees_collected_by_users_id_fk" FOREIGN KEY ("collected_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;