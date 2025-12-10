import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { CodeEditor } from "@/components/code-editor";
import { createSnippet } from "@/lib/mock-data";
import { useLocation } from "wouter";
import { Lock, Unlock, Zap, ChevronDown, Clock } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const [_, setLocation] = useLocation();
  const [code, setCode] = useState(`// Welcome to SnippetShare
// Start typing your code here...

function helloWorld() {
  console.log("Hello, World!");
}`);
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
      setLanguage("javascript"); // or typescript
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
    if (!code.trim()) {
      toast.error("Please enter some code first");
      return;
    }
    
    const snippet = createSnippet({
      title: title || "Untitled Snippet",
      code,
      language,
      isPrivate,
      expiresAt: isGuest ? new Date(Date.now() + 86400000).toISOString() : undefined 
    });

    toast.success("Snippet created successfully!");
    setLocation(`/snippet/${snippet.id}`);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section - Minimalist */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              Share Code. <span className="text-primary">Instantly.</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg">
              A premium, secure platform for developers to share code snippets with expiration and privacy controls.
            </p>
          </div>
          
          <button 
            onClick={handleCreate}
            className="px-8 py-3 bg-primary text-black font-bold text-lg rounded hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2"
          >
            <Zap className="w-5 h-5" />
            Create Snippet
          </button>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8">
            <input 
              type="text" 
              placeholder="Snippet Title (optional)" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-card border border-border rounded px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          
          <div className="md:col-span-2">
             <div className="relative group">
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full appearance-none bg-card border border-border rounded px-4 py-3 text-foreground focus:outline-none focus:border-primary/50 cursor-pointer transition-colors"
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
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none group-hover:text-primary transition-colors" />
             </div>
          </div>

          <div className="md:col-span-2">
            <button 
              onClick={() => setIsPrivate(!isPrivate)}
              className={`w-full h-full border rounded flex items-center justify-center gap-2 transition-all duration-300 ${
                isPrivate 
                  ? 'border-primary/50 bg-primary/10 text-primary' 
                  : 'border-border bg-card text-muted-foreground hover:text-foreground hover:border-border/80'
              }`}
            >
              {isPrivate ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              <span>{isPrivate ? "Private" : "Public"}</span>
            </button>
          </div>
        </div>

        {/* Editor */}
        <CodeEditor 
          initialCode={code} 
          language={language} 
          onChange={setCode}
          title={title || "untitled"}
        />

        {/* Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground bg-card/50 p-4 rounded border border-white/5">
          <Clock className="w-4 h-4 text-primary" />
          <p>
            Guest snippets automatically expire in <span className="text-foreground font-medium">24 hours</span>. 
            <span className="text-primary cursor-pointer hover:underline ml-1">Log in</span> to save permanently.
          </p>
        </div>

      </div>
    </Layout>
  );
}
