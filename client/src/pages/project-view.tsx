import { Layout } from "@/components/layout";
import { FileTree } from "@/components/file-tree";
import { CodeEditor } from "@/components/code-editor";
import { getProject, FileNode } from "@/lib/mock-data";
import { useRoute } from "wouter";
import { Calendar, Eye, Share2, Shield, FolderGit2, Check } from "lucide-react";
import { format } from "date-fns";
import NotFound from "./not-found";
import { toast } from "sonner";
import { useState } from "react";

export default function ProjectView() {
  const [match, params] = useRoute("/project/:id");
  const [copiedLink, setCopiedLink] = useState(false);
  
  if (!match) return <NotFound />;
  
  const project = getProject(params.id);

  if (!project) return <NotFound />;

  // Local state for view interaction (expanding folders, selecting files)
  const [files, setFiles] = useState<FileNode[]>(project.files);
  const [activeFileId, setActiveFileId] = useState<string | null>(
    // Default to first file found
    (() => {
        const findFirstFile = (nodes: FileNode[]): string | null => {
            for (const node of nodes) {
                if (node.type === "file") return node.id;
                if (node.children) {
                    const found = findFirstFile(node.children);
                    if (found) return found;
                }
            }
            return null;
        };
        return findFirstFile(project.files);
    })()
  );

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

  const handleToggleFolder = (id: string) => {
    setFiles(prev => updateFileTree(prev, id, node => ({ ...node, isOpen: !node.isOpen })));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success("Link copied");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-6rem)] flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold font-sans tracking-tight flex items-center gap-2">
               <FolderGit2 className="w-6 h-6 text-primary" />
               {project.title}
            </h1>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                {format(new Date(project.createdAt), "MMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-3 h-3" />
                {project.views} views
              </span>
              {project.isPrivate && (
                <span className="flex items-center gap-1 text-red-500">
                    <Shield className="w-3 h-3" /> Private
                </span>
              )}
            </div>
          </div>
          
          <button 
            onClick={handleShare}
            className="px-3 py-1.5 rounded border border-border bg-card hover:bg-white/5 hover:border-primary/30 flex items-center gap-2 text-xs font-medium transition-all group"
          >
            {copiedLink ? <Check className="w-3 h-3 text-primary" /> : <Share2 className="w-3 h-3 group-hover:text-primary transition-colors" />}
            {copiedLink ? "Copied" : "Share"}
          </button>
        </div>

        {/* Project Explorer & Viewer */}
        <div className="flex-1 min-h-0 flex border border-border rounded-sm overflow-hidden bg-[#0d0d0d]">
           <FileTree 
              files={files} 
              activeFileId={activeFileId} 
              onSelect={(node) => setActiveFileId(node.id)}
              onToggleFolder={handleToggleFolder}
              // Read-only view, no add/delete actions
           />
           
           <div className="flex-1 flex flex-col min-w-0">
             <CodeEditor 
               initialCode={activeFileId ? findFileContent(files, activeFileId) : "// Select a file to view"} 
               language="javascript" // Would detect from active file name
               readOnly={true}
               title={project.title}
               className="flex-1 h-full border-none rounded-none"
               compact={true}
             />
           </div>
        </div>
      </div>
    </Layout>
  );
}
