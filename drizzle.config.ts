import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/db/schema",
  dialect: "postgresql",
  out: "./lib/db/migrations",
  dbCredentials: {
    url: "postgresql://neondb_owner:npg_UyC8KHAvM1WP@ep-calm-recipe-a7e36puw-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  }
} satisfies Config;