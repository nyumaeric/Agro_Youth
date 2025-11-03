import { defineConfig }  from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();
const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

export default defineConfig({
    schema: "./src/server/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
      url: DATABASE_URL,
    },
  });
  