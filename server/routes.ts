import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSnippetSchema, insertProjectSchema, insertUserSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";
import session from "express-session";
import MemoryStore from "memorystore";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

const MemoryStoreSession = MemoryStore(session);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.use(session({
    secret: process.env.SESSION_SECRET || 'snippetshare-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreSession({
      checkPeriod: 86400000
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000
    }
  }));

  // Auth Routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      
      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      const user = await storage.createUser({ username, password });
      req.session.userId = user.id;
      
      res.status(201).json({ user: { id: user.id, username: user.username } });
    } catch (error) {
      res.status(500).json({ error: "Failed to register" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      req.session.userId = user.id;
      res.json({ user: { id: user.id, username: user.username } });
    } catch (error) {
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      res.json({ user: { id: user.id, username: user.username } });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  app.get("/api/auth/stats", async (req: Request, res: Response) => {
    try {
      const snippets = await storage.getSnippets();
      const totalSnippets = snippets.length;
      const totalViews = snippets.reduce((sum, s) => sum + parseInt(s.views || "0"), 0);
      
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonth = snippets.filter(s => new Date(s.createdAt) >= monthStart).length;
      
      res.json({ totalSnippets, totalViews, thisMonth });
    } catch (error) {
      res.status(500).json({ error: "Failed to get stats" });
    }
  });

  // Snippet Routes - Public snippets (for non-authenticated users)
  app.get("/api/snippets/public", async (req, res) => {
    try {
      const snippets = await storage.getPublicSnippets();
      res.json(snippets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch snippets" });
    }
  });

  // User's own snippets (requires auth)
  app.get("/api/snippets/my", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const snippets = await storage.getSnippets(req.session.userId);
      res.json(snippets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch snippets" });
    }
  });

  app.get("/api/snippets/:id", async (req, res) => {
    try {
      const snippet = await storage.getSnippet(req.params.id);
      if (!snippet) {
        return res.status(404).json({ error: "Snippet not found" });
      }
      // Check if private and user is not the owner
      if (snippet.isPrivate && snippet.userId !== req.session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      await storage.incrementSnippetViews(req.params.id);
      res.json(snippet);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch snippet" });
    }
  });

  app.post("/api/snippets", async (req, res) => {
    try {
      const validatedData = insertSnippetSchema.parse(req.body);
      const userId = req.session.userId || undefined;
      const snippet = await storage.createSnippet(validatedData, userId);
      res.status(201).json(snippet);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromError(error).toString() });
      }
      res.status(500).json({ error: "Failed to create snippet" });
    }
  });

  app.patch("/api/snippets/:id", async (req, res) => {
    try {
      const { title } = req.body;
      if (!title || typeof title !== 'string') {
        return res.status(400).json({ error: "Title is required" });
      }
      // Check ownership
      const snippet = await storage.getSnippet(req.params.id);
      if (!snippet) {
        return res.status(404).json({ error: "Snippet not found" });
      }
      if (snippet.userId && snippet.userId !== req.session.userId) {
        return res.status(403).json({ error: "Not authorized" });
      }
      const updated = await storage.updateSnippetTitle(req.params.id, title);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update snippet" });
    }
  });

  app.delete("/api/snippets/:id", async (req, res) => {
    try {
      const snippet = await storage.getSnippet(req.params.id);
      if (!snippet) {
        return res.status(404).json({ error: "Snippet not found" });
      }
      if (snippet.userId && snippet.userId !== req.session.userId) {
        return res.status(403).json({ error: "Not authorized" });
      }
      await storage.deleteSnippet(req.params.id, req.session.userId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete snippet" });
    }
  });

  // Project Routes - Public projects
  app.get("/api/projects/public", async (req, res) => {
    try {
      const projects = await storage.getPublicProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  // User's own projects (requires auth)
  app.get("/api/projects/my", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const projects = await storage.getProjects(req.session.userId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      // Check if private and user is not the owner
      if (project.isPrivate && project.userId !== req.session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      await storage.incrementProjectViews(req.params.id);
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const userId = req.session.userId || undefined;
      const project = await storage.createProject(validatedData, userId);
      res.status(201).json(project);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromError(error).toString() });
      }
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      if (project.userId && project.userId !== req.session.userId) {
        return res.status(403).json({ error: "Not authorized" });
      }
      await storage.deleteProject(req.params.id, req.session.userId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  return httpServer;
}
