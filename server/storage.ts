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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private snippets: Map<string, Snippet>;
  private projects: Map<string, Project>;

  constructor() {
    this.users = new Map();
    this.snippets = new Map();
    this.projects = new Map();
    
    const demoProject: Project = {
      id: "demo-project",
      title: "React Todo App",
      createdAt: new Date(),
      isPrivate: false,
      views: "10",
      files: [
        {
          id: "src",
          name: "src",
          type: "folder",
          isOpen: true,
          children: [
            {
              id: "components",
              name: "components",
              type: "folder",
              isOpen: true,
              children: [
                {
                  id: "Button.tsx",
                  name: "Button.tsx",
                  type: "file",
                  language: "typescript",
                  content: `export function Button({ children, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      {children}
    </button>
  );
}`
                }
              ]
            },
            {
              id: "App.tsx",
              name: "App.tsx",
              type: "file",
              language: "typescript",
              content: `import { Button } from './components/Button';

export default function App() {
  return (
    <div>
      <h1>Hello World</h1>
      <Button onClick={() => alert('Hi')}>Click me</Button>
    </div>
  );
}`
            },
            {
              id: "index.css",
              name: "index.css",
              type: "file",
              language: "css",
              content: `body {
  background: #000;
  color: #fff;
}`
            }
          ]
        },
        {
          id: "package.json",
          name: "package.json",
          type: "file",
          language: "json",
          content: `{
  "name": "demo-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0"
  }
}`
        }
      ]
    };
    this.projects.set(demoProject.id, demoProject);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = nanoid();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getSnippets(userId?: string): Promise<Snippet[]> {
    const all = Array.from(this.snippets.values());
    if (userId) {
      return all.filter(s => s.userId === userId);
    }
    return all;
  }

  async getPublicSnippets(): Promise<Snippet[]> {
    return Array.from(this.snippets.values()).filter(s => !s.isPrivate);
  }

  async getSnippet(id: string): Promise<Snippet | undefined> {
    return this.snippets.get(id);
  }

  async createSnippet(insertSnippet: InsertSnippet, userId?: string): Promise<Snippet> {
    const id = nanoid();
    const snippet: Snippet = {
      ...insertSnippet,
      id,
      userId: userId || null,
      createdAt: new Date(),
      views: "0",
      isPrivate: insertSnippet.isPrivate ?? false
    };
    this.snippets.set(id, snippet);
    return snippet;
  }

  async updateSnippetTitle(id: string, title: string): Promise<Snippet | undefined> {
    const snippet = this.snippets.get(id);
    if (snippet) {
      snippet.title = title;
      this.snippets.set(id, snippet);
      return snippet;
    }
    return undefined;
  }

  async deleteSnippet(id: string, userId?: string): Promise<void> {
    const snippet = this.snippets.get(id);
    if (snippet && (!userId || snippet.userId === userId)) {
      this.snippets.delete(id);
    }
  }

  async incrementSnippetViews(id: string): Promise<void> {
    const snippet = this.snippets.get(id);
    if (snippet) {
      snippet.views = String(parseInt(snippet.views) + 1);
      this.snippets.set(id, snippet);
    }
  }

  async getProjects(userId?: string): Promise<Project[]> {
    const all = Array.from(this.projects.values());
    if (userId) {
      return all.filter(p => p.userId === userId);
    }
    return all;
  }

  async getPublicProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(p => !p.isPrivate);
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject, userId?: string): Promise<Project> {
    const id = nanoid();
    const project: Project = {
      ...insertProject,
      id,
      userId: userId || null,
      createdAt: new Date(),
      views: "0",
      isPrivate: insertProject.isPrivate ?? false
    };
    this.projects.set(id, project);
    return project;
  }

  async deleteProject(id: string, userId?: string): Promise<void> {
    const project = this.projects.get(id);
    if (project && (!userId || project.userId === userId)) {
      this.projects.delete(id);
    }
  }

  async incrementProjectViews(id: string): Promise<void> {
    const project = this.projects.get(id);
    if (project) {
      project.views = String(parseInt(project.views) + 1);
      this.projects.set(id, project);
    }
  }
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

export const storage = (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) 
  ? new DbStorage() 
  : new MemStorage();
