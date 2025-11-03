import { pgEnum, varchar } from "drizzle-orm/pg-core";
import { primaryKey } from "drizzle-orm/pg-core";
import { boolean} from "drizzle-orm/pg-core";
import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";


export const roles = pgTable("roles", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
export const userTypes = pgEnum("user_types", ["farmer", "buyer"]);
export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: text("fullName").notNull().unique(),
    role: uuid("role")
        .references(() => roles.id)
        .notNull(),
    phoneNumber: text("phone_number").notNull().unique(),
    password: text("password").notNull(),
    userType: userTypes("user_type").notNull().default("buyer"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
export const courseCategory = pgEnum("course_categories", ["Cropping", "Livestock", "Agroforestry", "Irrigation", "Soil Health", "Pest Management"]);
export const level = pgEnum("course_levels", ["Beginner", "Intermediate", "Advanced"]);
export const language = pgEnum("course_languages", ["English", "French", "Kinyarwanda"]);
export const course = pgTable("courses", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdId: uuid("created_id").references(() => users.id).notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    timeToComplete: text("time_to_complete").notNull(),
    level: level("level").notNull(),
    category: courseCategory("category").notNull(),
    language: language("language").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const courseModules = pgTable("course_modules", {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id").references(() => course.id).notNull(),
    title: text("title").notNull(),
    content: text("description").notNull(),
    isCompleted: boolean("is_completed").notNull().default(false),
    durationTime: text("duration_time").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
})


export const enrollments = pgTable("enrollments", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    courseId: uuid("course_id").references(() => course.id).notNull(),
    enrolledAt: timestamp("enrolled_at").notNull().defaultNow(),
})

export const verificationTokens = pgTable(
    "verification_tokens",
    {
      identifier: varchar("identifier").notNull(),
      token: varchar("token").notNull(),
      expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (verificationToken) => ({
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    })
  );


