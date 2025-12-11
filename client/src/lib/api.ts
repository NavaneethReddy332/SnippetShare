import type { Snippet, Project, FileNode, User } from "@shared/schema";

export interface SnippetCreate {
  title: string;
  code: string;
  language: string;
  isPrivate: boolean;
  password?: string;
}

export interface ProjectCreate {
  title: string;
  files: FileNode[];
  isPrivate: boolean;
}

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: { id: string; username: string };
}

export interface UserStats {
  totalSnippets: number;
  totalViews: number;
  thisMonth: number;
}

export const api = {
  auth: {
    login: async (credentials: AuthCredentials): Promise<AuthResponse> => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Login failed");
      }
      return res.json();
    },

    register: async (credentials: AuthCredentials): Promise<AuthResponse> => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Registration failed");
      }
      return res.json();
    },

    logout: async (): Promise<void> => {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("Logout failed");
    },

    me: async (): Promise<AuthResponse | null> => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return null;
      return res.json();
    },

    updateProfile: async (data: { username?: string }): Promise<AuthResponse> => {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update profile");
      }
      return res.json();
    },

    changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
      const res = await fetch("/api/auth/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to change password");
      }
    },

    deleteAccount: async (password: string): Promise<void> => {
      const res = await fetch("/api/auth/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete account");
      }
    },

    getStats: async (): Promise<UserStats> => {
      const res = await fetch("/api/auth/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  },

  snippets: {
    getPublic: async (): Promise<Snippet[]> => {
      const res = await fetch("/api/snippets/public");
      if (!res.ok) throw new Error("Failed to fetch snippets");
      return res.json();
    },

    getMy: async (): Promise<Snippet[]> => {
      const res = await fetch("/api/snippets/my");
      if (!res.ok) throw new Error("Failed to fetch snippets");
      return res.json();
    },
    
    getById: async (id: string): Promise<Snippet | { requiresPassword: true; snippetId: string }> => {
      const res = await fetch(`/api/snippets/${id}`);
      if (res.status === 403) {
        const data = await res.json();
        if (data.requiresPassword) {
          return { requiresPassword: true, snippetId: data.snippetId };
        }
        throw new Error(data.error || "Access denied");
      }
      if (!res.ok) throw new Error("Failed to fetch snippet");
      return res.json();
    },
    
    verifyPassword: async (id: string, password: string): Promise<Snippet> => {
      const res = await fetch(`/api/snippets/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Invalid password");
      }
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
    
    updateTitle: async (id: string, title: string): Promise<Snippet> => {
      const res = await fetch(`/api/snippets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to update snippet");
      return res.json();
    },
  },
  
  projects: {
    getPublic: async (): Promise<Project[]> => {
      const res = await fetch("/api/projects/public");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },

    getMy: async (): Promise<Project[]> => {
      const res = await fetch("/api/projects/my");
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
