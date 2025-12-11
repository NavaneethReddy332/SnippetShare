import { 
  type User, 
  type InsertUser,
  type Snippet,
  type InsertSnippet,
  type Project,
  type InsertProject,
  type FileNode,
  users,
  snippets,
  projects
} from "@shared/schema";
import { nanoid } from "nanoid";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getSnippets(userId?: string): Promise<Snippet[]>;
  getPublicSnippets(): Promise<Snippet[]>;
  getSnippet(id: string): Promise<Snippet | undefined>;
  createSnippet(snippet: InsertSnippet, userId?: string): Promise<Snippet>;
  updateSnippetTitle(id: string, title: string): Promise<Snippet | undefined>;
  deleteSnippet(id: string, userId?: string): Promise<void>;
  incrementSnippetViews(id: string): Promise<void>;
  
  getProjects(userId?: string): Promise<Project[]>;
  getPublicProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject, userId?: string): Promise<Project>;
  deleteProject(id: string, userId?: string): Promise<void>;
  incrementProjectViews(id: string): Promise<void>;
}

export class DbStorage implements IStorage {
  private db;

  constructor() {
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set");
    }
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    this.db = drizzle(client);
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = nanoid();
    const result = await this.db.insert(users).values({ ...insertUser, id }).returning();
    return result[0];
  }

  async getSnippets(userId?: string): Promise<Snippet[]> {
    if (userId) {
      return await this.db.select().from(snippets).where(eq(snippets.userId, userId));
    }
    return await this.db.select().from(snippets);
  }

  async getPublicSnippets(): Promise<Snippet[]> {
    return await this.db.select().from(snippets).where(eq(snippets.isPrivate, false));
  }

  async getSnippet(id: string): Promise<Snippet | undefined> {
    const result = await this.db.select().from(snippets).where(eq(snippets.id, id));
    return result[0];
  }

  async createSnippet(insertSnippet: InsertSnippet, userId?: string): Promise<Snippet> {
    const id = nanoid();
    const result = await this.db.insert(snippets).values({ ...insertSnippet, id, userId: userId || null }).returning();
    return result[0];
  }

  async updateSnippetTitle(id: string, title: string): Promise<Snippet | undefined> {
    const result = await this.db.update(snippets).set({ title }).where(eq(snippets.id, id)).returning();
    return result[0];
  }

  async deleteSnippet(id: string, userId?: string): Promise<void> {
    if (userId) {
      const snippet = await this.getSnippet(id);
      if (snippet && snippet.userId === userId) {
        await this.db.delete(snippets).where(eq(snippets.id, id));
      }
    } else {
      await this.db.delete(snippets).where(eq(snippets.id, id));
    }
  }

  async incrementSnippetViews(id: string): Promise<void> {
    await this.db.update(snippets).set({ 
      views: sql`CAST((CAST(${snippets.views} AS INTEGER) + 1) AS TEXT)`
    }).where(eq(snippets.id, id));
  }

  async getProjects(userId?: string): Promise<Project[]> {
    if (userId) {
      return await this.db.select().from(projects).where(eq(projects.userId, userId));
    }
    return await this.db.select().from(projects);
  }

  async getPublicProjects(): Promise<Project[]> {
    return await this.db.select().from(projects).where(eq(projects.isPrivate, false));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const result = await this.db.select().from(projects).where(eq(projects.id, id));
    return result[0];
  }

  async createProject(insertProject: InsertProject, userId?: string): Promise<Project> {
    const id = nanoid();
    const result = await this.db.insert(projects).values({ ...insertProject, id, userId: userId || null }).returning();
    return result[0];
  }

  async deleteProject(id: string, userId?: string): Promise<void> {
    if (userId) {
      const project = await this.getProject(id);
      if (project && project.userId === userId) {
        await this.db.delete(projects).where(eq(projects.id, id));
      }
    } else {
      await this.db.delete(projects).where(eq(projects.id, id));
    }
  }

  async incrementProjectViews(id: string): Promise<void> {
    await this.db.update(projects).set({ 
      views: sql`CAST((CAST(${projects.views} AS INTEGER) + 1) AS TEXT)`
    }).where(eq(projects.id, id));
  }
}

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables are required. Please set them in your secrets.");
}

export const storage = new DbStorage();
