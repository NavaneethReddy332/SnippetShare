import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  isOpen?: boolean;
  children?: FileNode[];
}

export const snippets = sqliteTable("snippets", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  code: text("code").notNull(),
  language: text("language").notNull(),
  isPrivate: integer("is_private", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  views: text("views").notNull().default("0"),
});

export const insertSnippetSchema = createInsertSchema(snippets).omit({
  id: true,
  createdAt: true,
  views: true,
});

export type InsertSnippet = z.infer<typeof insertSnippetSchema>;
export type Snippet = typeof snippets.$inferSelect;

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  files: text("files", { mode: "json" }).notNull().$type<FileNode[]>(),
  isPrivate: integer("is_private", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  views: text("views").notNull().default("0"),
});

const fileNodeSchema: z.ZodType<FileNode> = z.lazy(() => z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["file", "folder"]),
  language: z.string().optional(),
  content: z.string().optional(),
  isOpen: z.boolean().optional(),
  children: z.array(fileNodeSchema).optional(),
}));

export const insertProjectSchema = z.object({
  title: z.string(),
  files: z.array(fileNodeSchema),
  isPrivate: z.boolean().optional(),
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
