export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  isOpen?: boolean;
  children?: FileNode[];
}

export interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  isPrivate: boolean;
  createdAt: string;
  views: number;
}

export interface Project {
  id: string;
  title: string;
  files: FileNode[];
  isPrivate: boolean;
  createdAt: string;
  views: number;
}

// Mock Data Stores
let snippetsStore: Snippet[] = [];
let projectsStore: Project[] = [
  {
    id: "demo-project",
    title: "React Todo App",
    createdAt: new Date().toISOString(),
    isPrivate: false,
    views: 10,
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
  }
];

export const getSnippets = () => snippetsStore;
export const getSnippet = (id: string) => snippetsStore.find(s => s.id === id);
export const createSnippet = (snippet: any) => {
  const newSnippet = { ...snippet, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString(), views: 0 };
  snippetsStore.push(newSnippet);
  return newSnippet;
};
export const deleteSnippet = (id: string) => {
  snippetsStore = snippetsStore.filter(s => s.id !== id);
};

export const getProjects = () => projectsStore;
export const getProject = (id: string) => projectsStore.find(p => p.id === id);
export const createProject = (project: Omit<Project, 'id' | 'createdAt' | 'views'>) => {
  const newProject = { 
    ...project, 
    id: Math.random().toString(36).substr(2, 9), 
    createdAt: new Date().toISOString(), 
    views: 0 
  };
  projectsStore.push(newProject);
  return newProject;
};
