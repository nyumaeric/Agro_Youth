import { integer,jsonb,pgEnum, real, varchar } from "drizzle-orm/pg-core";
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
export const userTypes = pgEnum("user_types", ["farmer", "buyer","investor"]);
export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: text("fullName").notNull().unique(),
    role: uuid("role")
        .references(() => roles.id)
        .notNull(),
    phoneNumber: text("phone_number").notNull().unique(),
    profilePicUrl: text("profile_pic_url"),
    bio: text("bio"),
    anonymousName: varchar("anonymity_name", { length: 50 }),
    anonymousAvatar: varchar("anonymity_avatar", { length: 50 }),
    isAnonymous: boolean("isAnonymous").default(false),
    password: text("password").notNull(),
    userType: userTypes("user_type").notNull().default("buyer"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const donationApplications = pgTable('donation_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  reviewedBy: uuid('reviewed_by')
    .references(() => users.id, { onDelete: 'set null' }),
  projectTitle: varchar('project_title', { length: 255 }).notNull(),
  organization: varchar('organization', { length: 255 }),
  projectDescription: text('project_description').notNull(),
  projectGoals: text('project_goals').notNull(),
  budgetAmount: integer('budget_amount').notNull(),
  duration: varchar('duration', { length: 100 }).notNull(),
  expectedImpact: text('expected_impact').notNull(),
  certificates: jsonb('certificates').$type<string[]>().notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, approved, rejected
  reviewNotes: text('review_notes'),
  email: text('email').notNull(),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

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
    isCourseCompleted: boolean("is_completed").notNull().default(false),
    isDownloadable: boolean("isDownloadable").default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const ContentTypeEnum = pgEnum("content_type", [
  "text",
  "image",
  "video",
  "audio",
  "link",
]);
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


export const certificates = pgTable("certificates", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    courseId: uuid("course_id").references(() => course.id).notNull(),
    issuedAt: timestamp("issued_at").notNull().defaultNow(),
    completionMessage: text("completion_message").notNull(),
    completedAt: timestamp("completed_at").notNull(),
})

export const product = pgTable("products", {
    id: uuid("id").primaryKey().defaultRandom(),
    cropName: varchar("cropName").notNull(),
    quantity: integer("quantity").notNull(),
    unit: varchar("unit").notNull(),
    price: integer("price").notNull(),
    userId: uuid("userId").references(() => users.id).notNull(),
    description: text("description").notNull(),
    isAvailable: boolean("isAvailable").notNull().default(true),
});
export const postContentTypeEnum = pgEnum("post_content_type", [
    "text",
    "image",
    "video",
    "audio",
    "link",
]);

export const Post = pgTable("Post", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    title: varchar("title", { length: 255 }).notNull(),
    courseId: uuid("courseId").references(() => course.id),
    contentType: postContentTypeEnum("content_type").notNull(),
    textContent: text("text_content"),
    mediaUrl: varchar("media_url", { length: 1024 }),
    mediaAlt: varchar("media_alt", { length: 255 }),
    linkUrl: varchar("link_url", { length: 1024 }),
    linkDescription: text("link_description"),
    isAnonymous: boolean("isAnonymous").default(false),
    linkPreviewImage: varchar("link_preview_image", { length: 1024 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const PostLikes = pgTable("PostLikes", {
    id: uuid("id").primaryKey().defaultRandom(),
    post_id: uuid("post_id")
      .references(() => Post.id, { onDelete: "cascade" })
      .notNull(),
    user_id: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


export const Comment = pgTable("comments", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    postId: uuid("post_id").references(() => Post.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    isAnonymous: boolean("isAnonymous").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  });
 
export const courseProgress = pgTable("course_progress", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    courseId: uuid("course_id")
        .references(() => course.id, { onDelete: "cascade" })
        .notNull(),
    completedModules: integer("completed_modules").notNull().default(0),
    progressPercentage: integer("progress_percentage").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const CommentLikes = pgTable("CommentLikes", {
    id: uuid("id").primaryKey().defaultRandom(),
    comment_id: uuid("comment_id")
      .references(() => Comment.id, { onDelete: "cascade" })
      .notNull(),
    user_id: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  });
  
export const CommentReplies = pgTable("CommentReplies", {
    id: uuid("id").primaryKey().defaultRandom(),
    comment_id: uuid("comment_id")
      .references(() => Comment.id, { onDelete: "cascade" })
      .notNull(),
    user_id: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    commentReplies: text("commentReplies").notNull(),
    isAnonymous: boolean("isAnonymous").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  });


export const products = pgTable("products", {
    id: uuid("id").primaryKey().defaultRandom(),
    cropName: varchar("cropName").notNull(),
    quantity: integer("quantity").notNull(),
    unit: varchar("unit").notNull(),
    price: real("price").notNull(),    
    userId: uuid("userId").references(() => users.id).notNull(),
    description: text("description").notNull(),
    location: varchar("location").notNull(),
    isAvailable: boolean("isAvailable").notNull().default(true),
});


export const liveSessions = pgTable("liveSessions", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    hostId: uuid("hostId").references(() => users.id).notNull(),
    scheduledAt: timestamp("scheduledAt").notNull(),
    durationMinutes: integer("durationMinutes").notNull(),
    meetingLink: varchar("meetingLink").notNull(),
    isActive: boolean("isActive").notNull().default(false),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});
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


