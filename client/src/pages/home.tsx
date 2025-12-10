import { useState } from "react";
import { Layout } from "@/components/layout";
import { CodeEditor } from "@/components/code-editor";
import { FileTree } from "@/components/file-tree";
import { createSnippet, createProject, FileNode } from "@/lib/mock-data";
import { useLocation } from "wouter";
import { Lock, Unlock, Zap, ChevronDown, Plus, FileCode, FolderKanban, Menu, FolderUp, FilePlus } from "lucide-react";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import * as Dialog from "@radix-ui/react-dialog";

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
  const [showProjectModal, setShowProjectModal] = useState(false);

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

  const handleModeChange = (newMode: "snippet" | "project") => {
    if (newMode === "project") {
      setShowProjectModal(true);
    } else {
      setMode("snippet");
    }
  };

  const initProject = (type: "new" | "import") => {
    if (type === "new") {
      setFiles([{ id: "root-1", name: "index.js", type: "file", language: "javascript", content: "// Main entry point" }]);
      setTitle("");
      setActiveFileId("root-1");
    } else {
      // Mock Import
      setFiles([
        { 
          id: "imported-root", 
          name: "imported-project", 
          type: "folder", 
          isOpen: true, 
          children: [
            { id: "f1", name: "README.md", type: "file", language: "markdown", content: "# Imported Project" }
          ]
        }
      ]);
      setTitle("Imported Project");
      setActiveFileId("f1");
    }
    setMode("project");
    setShowProjectModal(false);
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-6rem)] relative flex flex-col gap-2 group/layout">
        
        {/* Compact Toolbar - Only Visible in Snippet Mode */}
        {mode === "snippet" && (
          <div className="flex items-center gap-2 p-1 border-b border-border/50 pb-2">
            
            {/* Mode Switcher */}
            <div className="flex bg-card border border-border rounded-sm p-0.5">
               <button 
                 onClick={() => handleModeChange("snippet")}
                 className={`px-2 py-0.5 text-xs font-medium rounded-sm flex items-center gap-1.5 transition-colors ${mode === "snippet" ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
               >
                 <FileCode className="w-3 h-3" /> Snippet
               </button>
               <button 
                 onClick={() => handleModeChange("project")}
                 className={`px-2 py-0.5 text-xs font-medium rounded-sm flex items-center gap-1.5 transition-colors ${mode === "project" ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
               >
                 <FolderKanban className="w-3 h-3" /> Project
               </button>
            </div>
  
            <div className="h-4 w-px bg-border/50 mx-1"></div>
  
            <div className="flex-1">
              <input 
                type="text" 
                placeholder="Snippet Title..." 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-b focus:border-primary/50 transition-colors font-medium h-7"
              />
            </div>
            
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
        )}

        {/* Editor Area */}
        <div className="flex-1 min-h-0 flex border border-border rounded-sm overflow-hidden bg-[#0d0d0d] relative">
          {mode === "project" && (
            <FileTree 
              files={files} 
              activeFileId={activeFileId} 
              onSelect={handleFileSelect}
              onToggleFolder={handleToggleFolder}
              onAddFile={handleAddFile}
              onAddFolder={handleAddFolder}
              onDelete={handleDelete}
              projectName={title || "Untitled Project"}
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

        {/* Hiding Right Sidebar (Project Mode Only) */}
        {mode === "project" && (
          <div className="absolute top-0 right-0 h-full w-64 translate-x-[calc(100%-10px)] hover:translate-x-0 transition-transform duration-300 z-50 flex">
             {/* Trigger Area */}
             <div className="w-[10px] h-full bg-transparent hover:bg-primary/20 transition-colors cursor-pointer group-hover:bg-primary/20"></div>
             
             {/* Sidebar Content */}
             <div className="flex-1 bg-[#1a1a1a] border-l border-border shadow-2xl p-4 flex flex-col gap-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-2">Project Controls</h3>
                
                {/* Project Name Input */}
                <div className="space-y-1">
                   <label className="text-xs text-muted-foreground">Project Name</label>
                   <input 
                     type="text" 
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                     className="w-full bg-black/20 border border-border rounded px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/50"
                     placeholder="Project Name"
                   />
                </div>

                {/* Mode Switcher */}
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Mode</label>
                  <div className="flex bg-black/20 border border-border rounded-sm p-0.5">
                     <button 
                       onClick={() => handleModeChange("snippet")}
                       className={`flex-1 px-2 py-1 text-xs font-medium rounded-sm flex items-center justify-center gap-1.5 transition-colors ${mode === "snippet" ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                     >
                       <FileCode className="w-3 h-3" /> Snippet
                     </button>
                     <button 
                       onClick={() => handleModeChange("project")}
                       className={`flex-1 px-2 py-1 text-xs font-medium rounded-sm flex items-center justify-center gap-1.5 transition-colors ${mode === "project" ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                     >
                       <FolderKanban className="w-3 h-3" /> Project
                     </button>
                  </div>
                </div>

                {/* Privacy Toggle */}
                <button 
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={`w-full py-1.5 border rounded-sm flex items-center justify-center gap-1.5 text-xs transition-all ${
                    isPrivate 
                      ? 'border-primary/30 bg-primary/10 text-primary' 
                      : 'border-border bg-black/20 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isPrivate ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  <span>{isPrivate ? "Private Project" : "Public Project"}</span>
                </button>

                <div className="flex-1"></div>

                {/* Save Button */}
                <button 
                  onClick={handleSave}
                  className="w-full py-2 bg-primary text-black text-xs font-bold rounded-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3 h-3" />
                  Save Project
                </button>
             </div>
          </div>
        )}

      </div>

      {/* Project Creation Modal */}
      <Dialog.Root open={showProjectModal} onOpenChange={setShowProjectModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1a1a1a] border border-border p-6 rounded-lg shadow-2xl z-50 w-[400px] animate-in zoom-in-95 duration-200">
             <Dialog.Title className="text-xl font-bold mb-2">Create Project</Dialog.Title>
             <Dialog.Description className="text-muted-foreground text-sm mb-6">
               Start a new project from scratch or import existing files.
             </Dialog.Description>
             
             <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => initProject("new")}
                  className="flex flex-col items-center justify-center gap-3 p-6 rounded border border-border bg-black/20 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                   <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FilePlus className="w-5 h-5 text-primary" />
                   </div>
                   <span className="font-medium text-sm">New Project</span>
                </button>

                <button 
                  onClick={() => initProject("import")}
                  className="flex flex-col items-center justify-center gap-3 p-6 rounded border border-border bg-black/20 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                   <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FolderUp className="w-5 h-5 text-blue-500" />
                   </div>
                   <span className="font-medium text-sm">Import ZIP</span>
                </button>
             </div>
             
             <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setShowProjectModal(false)}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                   Cancel
                </button>
             </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </Layout>
  );
}
