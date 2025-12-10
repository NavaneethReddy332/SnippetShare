import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { CodeEditor } from "@/components/code-editor";
import { createSnippet } from "@/lib/mock-data";
import { useLocation } from "wouter";
import { Lock, Unlock, Zap, ChevronDown, Plus } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const [_, setLocation] = useLocation();
  const [code, setCode] = useState(`// Start typing...`);
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isGuest, setIsGuest] = useState(true);

  // Auto-detect language heuristic
  useEffect(() => {
    const trimmed = code.trim();
    if (trimmed.startsWith("<html") || trimmed.includes("<!DOCTYPE html")) {
      setLanguage("html");
    } else if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      setLanguage("json");
    } else if (code.includes("import React") || code.includes("export default")) {
      setLanguage("javascript");
    } else if (code.includes("def ") && code.includes(":")) {
      setLanguage("python");
    } else if (code.includes("fn ") && code.includes("{")) {
      setLanguage("rust");
    } else if (code.includes("#include")) {
      setLanguage("cpp");
    } else if (code.includes("package main")) {
      setLanguage("go");
    }
  }, [code]);

  const handleCreate = () => {
    if (!code.trim() || code === "// Start typing...") {
      toast.error("Enter some code first");
      return;
    }
    
    const snippet = createSnippet({
      title: title || "Untitled",
      code,
      language,
      isPrivate,
      expiresAt: isGuest ? new Date(Date.now() + 86400000).toISOString() : undefined 
    });

    toast.success("Saved");
    setLocation(`/snippet/${snippet.id}`);
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-6rem)] flex flex-col gap-2">
        {/* Compact Toolbar */}
        <div className="flex items-center gap-2 p-1">
          <div className="flex-1">
            <input 
              type="text" 
              placeholder="Snippet Title..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent border-b border-border/50 px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors font-medium h-8"
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
               <option value="html">HTML</option>
               <option value="css">CSS</option>
               <option value="json">JSON</option>
               <option value="rust">Rust</option>
               <option value="go">Go</option>
               <option value="cpp">C++</option>
               <option value="java">Java</option>
               <option value="sql">SQL</option>
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
            onClick={handleCreate}
            className="h-7 px-4 bg-primary text-black text-xs font-bold rounded-sm hover:bg-primary/90 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3 h-3" />
            Save
          </button>
        </div>

        {/* Full Height Editor */}
        <div className="flex-1 min-h-0 border border-border rounded-sm overflow-hidden bg-[#0d0d0d]">
          <CodeEditor 
            initialCode={code} 
            language={language} 
            onChange={setCode}
            title={title || "untitled"}
            className="h-full border-none rounded-none"
            compact={true}
          />
        </div>
      </div>
    </Layout>
  );
}
