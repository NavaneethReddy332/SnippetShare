import { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/layout";
import { CodeEditor } from "@/components/code-editor";
import { api } from "@/lib/api";
import { detectLanguage, languages, getExtension } from "@/lib/language-detect";
import { useLocation } from "wouter";
import { Lock, Unlock, ChevronDown, Plus, FileCode, FolderKanban } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const [_, setLocation] = useLocation();
  
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    
    if (!language || autoDetected) {
      const detected = detectLanguage(newCode);
      if (detected) {
        setLanguage(detected);
        setAutoDetected(true);
      }
    }
  }, [language, autoDetected]);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setAutoDetected(false);
  };

  const handleProjectClick = () => {
    toast.info("Projects coming soon!");
  };

  const handleSave = async () => {
    if (!code.trim()) {
      toast.error("Enter some code first");
      return;
    }
    
    if (!language) {
      toast.error("Please select a language");
      return;
    }
    
    const ext = getExtension(language);
    const finalTitle = title.trim() || "untitled";
    const titleWithExt = finalTitle.endsWith(ext) ? finalTitle : `${finalTitle}${ext}`;
    
    try {
      const snippet = await api.snippets.create({ 
        title: titleWithExt, 
        code, 
        language, 
        isPrivate,
        views: "0"
      });
      toast.success("Snippet Saved");
      setLocation(`/snippet/${snippet.id}`);
    } catch (error) {
      toast.error("Failed to save snippet");
    }
  };

  const displayLanguage = language 
    ? languages.find(l => l.id === language)?.name || language 
    : "Select Language";

  return (
    <Layout>
      <div className="h-full relative flex flex-col">
        
        <div className="flex items-center gap-2 p-2 border-b border-border/50 bg-editor-bg z-10">
          
          <div className="flex bg-card border border-border rounded-sm p-0.5">
             <button 
               className="px-2 py-0.5 text-xs font-medium rounded-sm flex items-center gap-1.5 transition-colors bg-primary/20 text-primary"
               data-testid="button-snippet-mode"
             >
               <FileCode className="w-3 h-3" /> Snippet
             </button>
             <button 
               onClick={handleProjectClick}
               className="px-2 py-0.5 text-xs font-medium rounded-sm flex items-center gap-1.5 transition-colors text-muted-foreground hover:text-foreground"
               data-testid="button-project-mode"
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
              data-testid="input-title"
            />
          </div>
          
          <div className="w-36 relative">
             <select 
               value={language}
               onChange={(e) => handleLanguageChange(e.target.value)}
               className={`w-full appearance-none bg-card border border-border rounded-sm px-2 py-1 text-xs focus:outline-none focus:border-primary/50 cursor-pointer transition-colors h-7 pl-2 pr-6 ${language ? 'text-foreground' : 'text-muted-foreground'}`}
               data-testid="select-language"
             >
               <option value="">Select Language</option>
               {languages.map(lang => (
                 <option key={lang.id} value={lang.id}>{lang.name}</option>
               ))}
             </select>
             <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
             {autoDetected && language && (
               <span className="absolute -bottom-4 left-0 text-[10px] text-primary/70">auto-detected</span>
             )}
          </div>

          <button 
            onClick={() => setIsPrivate(!isPrivate)}
            className={`h-7 px-3 border rounded-sm flex items-center gap-1.5 text-xs transition-all ${
              isPrivate 
                ? 'border-primary/30 bg-primary/10 text-primary' 
                : 'border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
            data-testid="button-privacy"
          >
            {isPrivate ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            <span>{isPrivate ? "Private" : "Public"}</span>
          </button>

          <button 
            onClick={handleSave}
            className="h-7 px-4 bg-primary text-black text-xs font-bold rounded-sm hover:bg-primary/90 transition-all flex items-center gap-1.5"
            data-testid="button-save"
          >
            <Plus className="w-3 h-3" />
            Save
          </button>
        </div>

        <div className="flex-1 min-h-0 flex bg-editor-bg">
          <CodeEditor 
            initialCode={code} 
            language={language || "javascript"}
            onChange={handleCodeChange}
            title={title || "untitled"}
            className="flex-1 h-full border-none rounded-none"
            compact={true}
          />
        </div>

      </div>
    </Layout>
  );
}
