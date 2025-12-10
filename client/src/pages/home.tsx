import { useState } from "react";
import { Layout } from "@/components/layout";
import { CodeEditor } from "@/components/code-editor";
import { FileTree } from "@/components/file-tree";
import { createSnippet, createProject, FileNode } from "@/lib/mock-data";
import { useLocation } from "wouter";
import { Lock, Unlock, Zap, ChevronDown, Plus, FileCode, FolderKanban } from "lucide-react";
import { toast } from "sonner";
import { nanoid } from "nanoid";

export default function Home() {
  const [_, setLocation] = useLocation();
  const [mode, setMode] = useState<"snippet" | "project">("snippet");
  
  // Snippet Mode State
  const [code, setCode] = useState(`// Start typing...`);
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("javascript");
  
  // Project Mode State
  const [files, setFiles] = useState<FileNode[]>([
    { id: "root-1", name: "index.js", type: "file", language: "javascript", content: "// Main entry point" }
  ]);
  const [activeFileId, setActiveFileId] = useState<string | null>("root-1");

  const [isPrivate, setIsPrivate] = useState(false);

  // Helper to update file tree immutably
  const updateFileTree = (nodes: FileNode[], nodeId: string, updater: (node: FileNode) => FileNode): FileNode[] => {
    return nodes.map(node => {
      if (node.id === nodeId) {
        return updater(node);
      }
      if (node.children) {
        return { ...node, children: updateFileTree(node.children, nodeId, updater) };
      }
      return node;
    });
  };

  const findFileContent = (nodes: FileNode[], id: string): string => {
    for (const node of nodes) {
      if (node.id === id) return node.content || "";
      if (node.children) {
        const found = findFileContent(node.children, id);
        if (found) return found;
      }
    }
    return "";
  };

  const handleFileSelect = (node: FileNode) => {
    if (node.type === "file") {
      setActiveFileId(node.id);
    }
  };

  const handleToggleFolder = (id: string) => {
    setFiles(prev => updateFileTree(prev, id, node => ({ ...node, isOpen: !node.isOpen })));
  };

  const handleAddFile = (parentId: string | null) => {
    const name = prompt("File name:", "untitled.js");
    if (!name) return;
    
    const newNode: FileNode = {
      id: nanoid(),
      name,
      type: "file",
      content: "// New file",
      language: "javascript" // simplified detection
    };

    if (parentId) {
      setFiles(prev => updateFileTree(prev, parentId, node => ({
        ...node,
        isOpen: true,
        children: [...(node.children || []), newNode]
      })));
    } else {
      setFiles(prev => [...prev, newNode]);
    }
    setActiveFileId(newNode.id);
  };

  const handleAddFolder = (parentId: string | null) => {
    const name = prompt("Folder name:", "New Folder");
    if (!name) return;

    const newNode: FileNode = {
      id: nanoid(),
      name,
      type: "folder",
      isOpen: true,
      children: []
    };

    if (parentId) {
      setFiles(prev => updateFileTree(prev, parentId, node => ({
        ...node,
        isOpen: true,
        children: [...(node.children || []), newNode]
      })));
    } else {
      setFiles(prev => [...prev, newNode]);
    }
  };

  const handleDelete = (id: string) => {
    const deleteFromNodes = (nodes: FileNode[]): FileNode[] => {
      return nodes.filter(node => node.id !== id).map(node => ({
        ...node,
        children: node.children ? deleteFromNodes(node.children) : undefined
      }));
    };
    setFiles(prev => deleteFromNodes(prev));
    if (activeFileId === id) setActiveFileId(null);
  };

  const handleCodeChange = (newCode: string) => {
    if (mode === "snippet") {
      setCode(newCode);
    } else if (activeFileId) {
      setFiles(prev => updateFileTree(prev, activeFileId, node => ({ ...node, content: newCode })));
    }
  };

  const handleSave = () => {
    if (mode === "snippet") {
      if (!code.trim() || code === "// Start typing...") {
        toast.error("Enter some code first");
        return;
      }
      const snippet = createSnippet({ title: title || "Untitled", code, language, isPrivate });
      toast.success("Snippet Saved");
      setLocation(`/snippet/${snippet.id}`);
    } else {
      // Save Project logic
      const project = createProject({ title: title || "Untitled Project", files, isPrivate });
      toast.success("Project Saved");
      setLocation(`/project/${project.id}`); // We'll need a project view page
    }
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-6rem)] flex flex-col gap-2">
        {/* Compact Toolbar */}
        <div className="flex items-center gap-2 p-1 border-b border-border/50 pb-2">
          
          {/* Mode Switcher */}
          <div className="flex bg-card border border-border rounded-sm p-0.5">
             <button 
               onClick={() => setMode("snippet")}
               className={`px-2 py-0.5 text-xs font-medium rounded-sm flex items-center gap-1.5 transition-colors ${mode === "snippet" ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
             >
               <FileCode className="w-3 h-3" /> Snippet
             </button>
             <button 
               onClick={() => setMode("project")}
               className={`px-2 py-0.5 text-xs font-medium rounded-sm flex items-center gap-1.5 transition-colors ${mode === "project" ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
             >
               <FolderKanban className="w-3 h-3" /> Project
             </button>
          </div>

          <div className="h-4 w-px bg-border/50 mx-1"></div>

          <div className="flex-1">
            <input 
              type="text" 
              placeholder={mode === "snippet" ? "Snippet Title..." : "Project Name..."}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-b focus:border-primary/50 transition-colors font-medium h-7"
            />
          </div>
          
          {mode === "snippet" && (
            <div className="w-32 relative group">
               <select 
                 value={language}
                 onChange={(e) => setLanguage(e.target.value)}
                 className="w-full appearance-none bg-card border border-border rounded-sm px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary/50 cursor-pointer transition-colors h-7 pl-2 pr-6"
               >
                 <option value="javascript">JavaScript</option>
                 <option value="typescript">TypeScript</option>
                 <option value="python">Python</option>
                 {/* ... other options ... */}
               </select>
               <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
            </div>
          )}

          <button 
            onClick={() => setIsPrivate(!isPrivate)}
            className={`h-7 px-3 border rounded-sm flex items-center gap-1.5 text-xs transition-all ${
              isPrivate 
                ? 'border-primary/30 bg-primary/10 text-primary' 
                : 'border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            {isPrivate ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            <span>{isPrivate ? "Private" : "Public"}</span>
          </button>

          <button 
            onClick={handleSave}
            className="h-7 px-4 bg-primary text-black text-xs font-bold rounded-sm hover:bg-primary/90 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3 h-3" />
            Save
          </button>
        </div>

        {/* Editor Area */}
        <div className="flex-1 min-h-0 flex border border-border rounded-sm overflow-hidden bg-[#0d0d0d]">
          {mode === "project" && (
            <FileTree 
              files={files} 
              activeFileId={activeFileId} 
              onSelect={handleFileSelect}
              onToggleFolder={handleToggleFolder}
              onAddFile={handleAddFile}
              onAddFolder={handleAddFolder}
              onDelete={handleDelete}
            />
          )}
          
          <div className="flex-1 flex flex-col min-w-0">
             {/* Tab Bar (only for project mode to show active file name) */}
             {mode === "project" && activeFileId && (
               <div className="flex-none h-8 bg-[#111] border-b border-border flex items-center px-4">
                 <span className="text-xs text-muted-foreground font-mono">
                    {findFileContent(files, activeFileId) ? "editing..." : "select a file"}
                 </span>
               </div>
             )}

             <CodeEditor 
               initialCode={mode === "snippet" ? code : (activeFileId ? findFileContent(files, activeFileId) : "")} 
               language={language} // In a real app, detect from file extension
               onChange={handleCodeChange}
               title={title || "untitled"}
               className="flex-1 h-full border-none rounded-none"
               compact={true}
               readOnly={mode === "project" && !activeFileId}
             />
          </div>
        </div>
      </div>
    </Layout>
  );
}
