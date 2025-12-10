import type { Snippet, Project, FileNode } from "@shared/schema";

export interface SnippetCreate {
  title: string;
  code: string;
  language: string;
  isPrivate: boolean;
  views: string;
}

export interface ProjectCreate {
  title: string;
  files: FileNode[];
  isPrivate: boolean;
  views: string;
}

export const api = {
  snippets: {
    getAll: async (): Promise<Snippet[]> => {
      const res = await fetch("/api/snippets");
      if (!res.ok) throw new Error("Failed to fetch snippets");
      return res.json();
    },
    
    getById: async (id: string): Promise<Snippet> => {
      const res = await fetch(`/api/snippets/${id}`);
      if (!res.ok) throw new Error("Failed to fetch snippet");
      return res.json();
    },
    
    create: async (data: SnippetCreate): Promise<Snippet> => {
      const res = await fetch("/api/snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create snippet");
      return res.json();
    },
    
    delete: async (id: string): Promise<void> => {
      const res = await fetch(`/api/snippets/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete snippet");
    },
  },
  
  projects: {
    getAll: async (): Promise<Project[]> => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
    
    getById: async (id: string): Promise<Project> => {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) throw new Error("Failed to fetch project");
      return res.json();
    },
    
    create: async (data: ProjectCreate): Promise<Project> => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create project");
      return res.json();
    },
    
    delete: async (id: string): Promise<void> => {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete project");
    },
  },
};
