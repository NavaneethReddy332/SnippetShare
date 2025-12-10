import { useState } from "react";
import { FileNode } from "@/lib/mock-data";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, Trash2, FilePlus, FolderPlus } from "lucide-react";
import * as ContextMenu from "@radix-ui/react-context-menu";

interface FileTreeProps {
  files: FileNode[];
  activeFileId: string | null;
  onSelect: (file: FileNode) => void;
  onToggleFolder: (folderId: string) => void;
  onAddFile?: (parentId: string | null) => void;
  onAddFolder?: (parentId: string | null) => void;
  onDelete?: (id: string) => void;
}

export function FileTree({ 
  files, 
  activeFileId, 
  onSelect, 
  onToggleFolder,
  onAddFile,
  onAddFolder,
  onDelete
}: FileTreeProps) {
  
  const renderNode = (node: FileNode, depth: number = 0) => {
    const isFolder = node.type === "folder";
    const isActive = node.id === activeFileId;
    
    return (
      <div key={node.id}>
        <ContextMenu.Root>
          <ContextMenu.Trigger>
            <div 
              className={`flex items-center gap-1.5 py-1 px-2 cursor-pointer text-xs select-none hover:bg-white/5 transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
              onClick={() => isFolder ? onToggleFolder(node.id) : onSelect(node)}
            >
              {isFolder && (
                <div className="text-muted-foreground/50">
                  {node.isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </div>
              )}
              
              {!isFolder && <div className="w-3" />} {/* Spacer for alignment */}

              {isFolder ? (
                node.isOpen ? <FolderOpen className="w-3 h-3 text-primary/80" /> : <Folder className="w-3 h-3 text-primary/80" />
              ) : (
                <File className="w-3 h-3" />
              )}
              
              <span className="truncate">{node.name}</span>
            </div>
          </ContextMenu.Trigger>
          
          <ContextMenu.Content className="min-w-[160px] bg-[#1a1a1a] border border-border rounded shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
            {isFolder && (
              <>
                <ContextMenu.Item 
                  className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-white/10 rounded cursor-pointer outline-none"
                  onSelect={() => onAddFile?.(node.id)}
                >
                  <FilePlus className="w-3 h-3" /> New File
                </ContextMenu.Item>
                <ContextMenu.Item 
                  className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-white/10 rounded cursor-pointer outline-none"
                  onSelect={() => onAddFolder?.(node.id)}
                >
                  <FolderPlus className="w-3 h-3" /> New Folder
                </ContextMenu.Item>
                <ContextMenu.Separator className="h-px bg-white/5 my-1" />
              </>
            )}
            <ContextMenu.Item 
              className="flex items-center gap-2 px-2 py-1.5 text-xs text-red-500 hover:bg-red-500/10 rounded cursor-pointer outline-none"
              onSelect={() => onDelete?.(node.id)}
            >
              <Trash2 className="w-3 h-3" /> Delete
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Root>

        {isFolder && node.isOpen && node.children && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-60 bg-[#111] border-r border-border flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-[#1a1a1a]">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Explorer</span>
        <div className="flex items-center gap-1">
          <button 
            className="p-1 hover:bg-white/10 rounded text-muted-foreground hover:text-foreground" 
            title="New File"
            onClick={() => onAddFile?.(null)}
          >
            <FilePlus className="w-3 h-3" />
          </button>
          <button 
            className="p-1 hover:bg-white/10 rounded text-muted-foreground hover:text-foreground" 
            title="New Folder"
            onClick={() => onAddFolder?.(null)}
          >
            <FolderPlus className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-2 custom-scrollbar">
        {files.map(node => renderNode(node))}
      </div>
    </div>
  );
}
