import { nanoid } from 'nanoid';

export interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  createdAt: string;
  expiresAt?: string; // For guest snippets
  isPrivate: boolean;
  views: number;
}

// Initial mock data
const initialSnippets: Snippet[] = [
  {
    id: "1",
    title: "Binary Search Implementation",
    language: "typescript",
    code: `function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }

  return -1;
}`,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    isPrivate: false,
    views: 124
  },
  {
    id: "2",
    title: "React Custom Hook: useDebounce",
    language: "javascript",
    code: `import { useState, useEffect } from 'react';

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}`,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    isPrivate: false,
    views: 45
  },
  {
    id: "3",
    title: "Secret API Keys (Private)",
    language: "json",
    code: `{
  "key": "sk_test_51Mz...",
  "secret": "whsec_..."
}`,
    createdAt: new Date().toISOString(),
    isPrivate: true,
    views: 0
  }
];

// Simple in-memory store helper (simulating DB)
let snippetsStore = [...initialSnippets];

export const getSnippets = () => snippetsStore;
export const getSnippet = (id: string) => snippetsStore.find(s => s.id === id);
export const createSnippet = (snippet: Omit<Snippet, 'id' | 'createdAt' | 'views'>) => {
  const newSnippet: Snippet = {
    ...snippet,
    id: nanoid(6), // Short ID for sharing
    createdAt: new Date().toISOString(),
    views: 0
  };
  snippetsStore = [newSnippet, ...snippetsStore];
  return newSnippet;
};
export const deleteSnippet = (id: string) => {
  snippetsStore = snippetsStore.filter(s => s.id !== id);
};
