import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const DATABASE_URL = "postgresql://neondb_owner:npg_UyC8KHAvM1WP@ep-calm-recipe-a7e36puw-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(DATABASE_URL);
export const db = drizzle(sql);