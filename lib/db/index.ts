import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { env } from "@/lib/env.mjs";

if (!env.DATABASE_URL) {
  console.warn("DATABASE_URL not found. Database operations will fail.");
}

const sql = env.DATABASE_URL ? neon(env.DATABASE_URL) : null;
export const db = sql ? drizzle(sql) : null;