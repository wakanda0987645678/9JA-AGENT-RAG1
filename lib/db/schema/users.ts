
import { sql } from "drizzle-orm";
import { text, varchar, timestamp, pgTable, integer, boolean } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { nanoid } from "@/lib/utils";

export const users = pgTable("users", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  avatar: varchar("avatar", { length: 500 }),
  bio: text("bio"),
  preferences: text("preferences"), // JSON string for user preferences
  isAdmin: boolean("is_admin").default(false).notNull(),
  totalTokensUsed: integer("total_tokens_used").default(0).notNull(),
  points: integer("points").default(0).notNull(),
  referralCode: varchar("referral_code", { length: 50 }).unique(),
  referredBy: varchar("referred_by", { length: 191 }),
  totalReferrals: integer("total_referrals").default(0).notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

export const conversations = pgTable("conversations", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: varchar("user_id", { length: 191 }).notNull(),
  prompt: text("prompt").notNull(),
  response: text("response").notNull(),
  tokensUsed: integer("tokens_used").default(0).notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
});

export const referrals = pgTable("referrals", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  referrerId: varchar("referrer_id", { length: 191 }).notNull(),
  referredId: varchar("referred_id", { length: 191 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, completed, cancelled
  pointsAwarded: integer("points_awarded").default(0).notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  completedAt: timestamp("completed_at"),
});

export const pointTransactions = pgTable("point_transactions", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: varchar("user_id", { length: 191 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // earned, spent, bonus, referral
  points: integer("points").notNull(),
  description: text("description").notNull(),
  referenceId: varchar("reference_id", { length: 191 }), // reference to conversation, referral, etc.
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
});

export const insertUserSchema = createSelectSchema(users)
  .extend({})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

export const insertConversationSchema = createSelectSchema(conversations)
  .extend({})
  .omit({
    id: true,
    createdAt: true,
  });

export type NewUserParams = z.infer<typeof insertUserSchema>;
export type NewConversationParams = z.infer<typeof insertConversationSchema>;
