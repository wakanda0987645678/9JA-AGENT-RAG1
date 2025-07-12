
-- Add new columns to users table
ALTER TABLE "users" ADD COLUMN "points" integer DEFAULT 0 NOT NULL;
ALTER TABLE "users" ADD COLUMN "referral_code" varchar(50) UNIQUE;
ALTER TABLE "users" ADD COLUMN "referred_by" varchar(191);
ALTER TABLE "users" ADD COLUMN "total_referrals" integer DEFAULT 0 NOT NULL;

-- Create referrals table
CREATE TABLE IF NOT EXISTS "referrals" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"referrer_id" varchar(191) NOT NULL,
	"referred_id" varchar(191) NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"points_awarded" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);

-- Create point_transactions table
CREATE TABLE IF NOT EXISTS "point_transactions" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"user_id" varchar(191) NOT NULL,
	"type" varchar(50) NOT NULL,
	"points" integer NOT NULL,
	"description" text NOT NULL,
	"reference_id" varchar(191),
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_users_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_id_users_id_fk" FOREIGN KEY ("referred_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "referrals_referrer_idx" ON "referrals" ("referrer_id");
CREATE INDEX IF NOT EXISTS "referrals_referred_idx" ON "referrals" ("referred_id");
CREATE INDEX IF NOT EXISTS "point_transactions_user_idx" ON "point_transactions" ("user_id");
CREATE INDEX IF NOT EXISTS "point_transactions_type_idx" ON "point_transactions" ("type");
