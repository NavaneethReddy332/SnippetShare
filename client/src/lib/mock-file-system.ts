import { nanoid } from 'nanoid';

export type FileType = 'file' | 'folder' | 'snippet' | 'project';

export interface FileSystemItem {
  id: string;
  name: string;
  type: FileType;
  language?: string;
  content?: string;
  isOpen?: boolean; // For folders
  children?: FileSystemItem[];
  parentId?: string;
}

const initialFileSystem: FileSystemItem[] = [
  {
    id: 'root',
    name: 'Workspace',
    type: 'folder',
    isOpen: true,
    children: [
      {
        id: 'proj-1',
        name: 'ecommerce-backend',
        type: 'project',
        isOpen: true,
        children: [
          { id: 'f-1', name: 'server.ts', type: 'file', language: 'typescript', content: 'import express from "express";\nconst app = express();\n\napp.listen(3000);', parentId: 'proj-1' },
          { id: 'f-2', name: 'routes.ts', type: 'file', language: 'typescript', content: 'export const router = express.Router();', parentId: 'proj-1' },
          { 
            id: 'fold-1', 
            name: 'utils', 
            type: 'folder', 
            isOpen: false,
            children: [
              { id: 'f-3', name: 'helpers.ts', type: 'file', language: 'typescript', content: '// Helpers', parentId: 'fold-1' }
            ],
            parentId: 'proj-1'
          }
        ],
        parentId: 'root'
      },
      {
        id: 'snip-group',
        name: 'My Snippets',
        type: 'folder',
        isOpen: true,
        children: [
          { id: 's-1', name: 'binary-search.js', type: 'snippet', language: 'javascript', content: '// Binary Search', parentId: 'snip-group' },
          { id: 's-2', name: 'use-auth.ts', type: 'snippet', language: 'typescript', content: '// Auth Hook', parentId: 'snip-group' }
        ],
        parentId: 'root'
      }
    ]
  }
];

// Simple state container for the mockup
let fileSystem = [...initialFileSystem];

export const getFileSystem = () => fileSystem;
export const findItem = (id: string, items: FileSystemItem[] = fileSystem): FileSystemItem | undefined => {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findItem(id, item.children);
      if (found) return found;
    }
  }
  return undefined;
};
