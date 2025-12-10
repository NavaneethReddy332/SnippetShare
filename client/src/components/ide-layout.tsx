import { useState } from "react";
import { 
  Files, 
  Search, 
  GitGraph, 
  Settings, 
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  FileCode,
  Folder,
  Box,
  File
} from "lucide-react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { FileSystemItem, getFileSystem } from "@/lib/mock-file-system";
import { CodeEditor } from "@/components/code-editor";

interface IdeLayoutProps {
  children?: React.ReactNode;
}

export function IdeLayout() {
  const [activeActivity, setActiveActivity] = useState<'files' | 'search' | 'git'>('files');
  const [fileSystem, setFileSystem] = useState(getFileSystem());
  const [activeFile, setActiveFile] = useState<FileSystemItem | null>(null);

  const toggleFolder = (itemId: string) => {
    // Deep clone to update state (simplified for mock)
    const newFs = JSON.parse(JSON.stringify(fileSystem));
    
    const toggleNode = (items: FileSystemItem[]) => {
      for (const item of items) {
        if (item.id === itemId) {
          item.isOpen = !item.isOpen;
          return true;
        }
        if (item.children) {
          if (toggleNode(item.children)) return true;
        }
      }
      return false;
    };
    
    toggleNode(newFs);
    setFileSystem(newFs);
  };

  const handleFileClick = (item: FileSystemItem) => {
    if (item.type === 'folder' || item.type === 'project') {
      toggleFolder(item.id);
    } else {
      setActiveFile(item);
    }
  };

  const ActivityIcon = ({ icon: Icon, id }: { icon: any, id: 'files' | 'search' | 'git' }) => (
    <button 
      onClick={() => setActiveActivity(id)}
      className={`p-3 flex justify-center transition-colors ${activeActivity === id ? 'text-foreground border-l-2 border-primary bg-white/5' : 'text-muted-foreground hover:text-foreground'}`}
    >
      <Icon className="w-6 h-6 stroke-[1.5]" />
    </button>
  );

  const FileTreeItem = ({ item, depth = 0 }: { item: FileSystemItem, depth?: number }) => {
    const Icon = item.type === 'folder' ? Folder : item.type === 'project' ? Box : item.type === 'snippet' ? FileCode : File;
    const isFolder = item.type === 'folder' || item.type === 'project';
    
    return (
      <div>
        <div 
          onClick={() => handleFileClick(item)}
          className={`flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-white/5 text-sm select-none ${activeFile?.id === item.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <span className="opacity-50 w-4 flex justify-center">
             {isFolder && (
               item.isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
             )}
          </span>
          <Icon className={`w-4 h-4 ${item.type === 'project' ? 'text-blue-400' : item.type === 'snippet' ? 'text-yellow-400' : ''}`} />
          <span className="truncate">{item.name}</span>
        </div>
        {isFolder && item.isOpen && item.children && (
          <div>
            {item.children.map(child => (
              <FileTreeItem key={child.id} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden text-foreground">
      {/* Activity Bar */}
      <div className="w-12 border-r border-border bg-[#050505] flex flex-col justify-between z-20">
        <div className="flex flex-col">
          <ActivityIcon icon={Files} id="files" />
          <ActivityIcon icon={Search} id="search" />
          <ActivityIcon icon={GitGraph} id="git" />
        </div>
        <div className="flex flex-col pb-2">
           <button className="p-3 text-muted-foreground hover:text-foreground flex justify-center">
             <Settings className="w-6 h-6 stroke-[1.5]" />
           </button>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal">
        {/* Sidebar Panel */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={40} className="bg-[#0a0a0a] border-r border-border min-w-[200px]">
          <div className="h-full flex flex-col">
            <div className="h-9 px-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground/70 bg-[#0a0a0a]">
              <span>Explorer</span>
              <MoreHorizontal className="w-4 h-4 cursor-pointer hover:text-foreground" />
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar py-2">
              {fileSystem.map(item => (
                <FileTreeItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        </ResizablePanel>
        
        <ResizableHandle className="bg-border w-[1px]" />

        {/* Editor Area */}
        <ResizablePanel defaultSize={80}>
          {activeFile ? (
            <div className="h-full flex flex-col bg-[#0d0d0d]">
              {/* Tab Bar */}
              <div className="h-9 flex bg-[#0a0a0a] border-b border-border overflow-x-auto custom-scrollbar">
                <div className="px-3 py-2 bg-[#0d0d0d] border-t-2 border-primary text-xs text-foreground flex items-center gap-2 min-w-fit border-r border-border">
                  <span className="text-yellow-400"><FileCode className="w-3 h-3" /></span>
                  {activeFile.name}
                  <button className="hover:bg-white/10 rounded p-0.5 ml-2">×</button>
                </div>
              </div>
              
              {/* Editor */}
              <CodeEditor 
                initialCode={activeFile.content || ""} 
                language={activeFile.language} 
                className="flex-1"
                title={activeFile.name}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground bg-[#0d0d0d]">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 opacity-20 bg-primary/20 rounded-xl flex items-center justify-center">
                   <Box className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm">Select a file to edit</p>
                <div className="mt-4 flex gap-4 text-xs justify-center opacity-50">
                  <span>Ctrl+P to search</span>
                  <span>Ctrl+Shift+F to find</span>
                </div>
              </div>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
      
      {/* Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-6 bg-[#007acc] text-white text-[10px] flex items-center px-2 justify-between z-50 select-none">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1 hover:bg-white/10 px-1 rounded cursor-pointer">
             <GitGraph className="w-3 h-3" />
             <span>main*</span>
           </div>
           <div className="flex items-center gap-1">
             <span className="hover:bg-white/10 px-1 rounded cursor-pointer">0 errors</span>
             <span className="hover:bg-white/10 px-1 rounded cursor-pointer">0 warnings</span>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <span className="hover:bg-white/10 px-1 rounded cursor-pointer">{activeFile ? `Ln 1, Col 1` : ''}</span>
           <span className="hover:bg-white/10 px-1 rounded cursor-pointer">UTF-8</span>
           <span className="hover:bg-white/10 px-1 rounded cursor-pointer">{activeFile?.language?.toUpperCase() || 'PLAINTEXT'}</span>
        </div>
      </div>
    </div>
  );
}
