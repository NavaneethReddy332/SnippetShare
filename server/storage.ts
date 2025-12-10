import { 
  type User, 
  type InsertUser,
  type Snippet,
  type InsertSnippet,
  type Project,
  type InsertProject,
  type FileNode
} from "@shared/schema";
import { nanoid } from "nanoid";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Snippet operations
  getSnippets(): Promise<Snippet[]>;
  getSnippet(id: string): Promise<Snippet | undefined>;
  createSnippet(snippet: InsertSnippet): Promise<Snippet>;
  updateSnippetTitle(id: string, title: string): Promise<Snippet | undefined>;
  deleteSnippet(id: string): Promise<void>;
  incrementSnippetViews(id: string): Promise<void>;
  
  // Project operations
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  deleteProject(id: string): Promise<void>;
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
    
    // Add demo project
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

  async getSnippets(): Promise<Snippet[]> {
    return Array.from(this.snippets.values());
  }

  async getSnippet(id: string): Promise<Snippet | undefined> {
    return this.snippets.get(id);
  }

  async createSnippet(insertSnippet: InsertSnippet): Promise<Snippet> {
    const id = nanoid();
    const snippet: Snippet = {
      ...insertSnippet,
      id,
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

  async deleteSnippet(id: string): Promise<void> {
    this.snippets.delete(id);
  }

  async incrementSnippetViews(id: string): Promise<void> {
    const snippet = this.snippets.get(id);
    if (snippet) {
      snippet.views = String(parseInt(snippet.views) + 1);
      this.snippets.set(id, snippet);
    }
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = nanoid();
    const project: Project = {
      ...insertProject,
      id,
      createdAt: new Date(),
      views: "0",
      isPrivate: insertProject.isPrivate ?? false
    };
    this.projects.set(id, project);
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    this.projects.delete(id);
  }

  async incrementProjectViews(id: string): Promise<void> {
    const project = this.projects.get(id);
    if (project) {
      project.views = String(parseInt(project.views) + 1);
      this.projects.set(id, project);
    }
  }
}

export const storage = new MemStorage();
