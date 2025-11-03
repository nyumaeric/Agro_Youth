import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import dotenv from "dotenv";


dotenv.config();

let dbInstance: ReturnType<typeof drizzle> | null = null;

const { DATABASE_URL} = process.env;


function initDb() {
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const sql = neon(DATABASE_URL);
  return drizzle(sql, { schema });
}

const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop, receiver) {
    if (!dbInstance) {
      dbInstance = initDb();
    }
    return Reflect.get(dbInstance as object, prop, receiver);
  }
});

export default db;
