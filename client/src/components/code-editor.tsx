import React, { useState, useEffect } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { Copy, Check, FileCode, Maximize2, Minimize2 } from "lucide-react";
import { toast } from "sonner";

interface CodeEditorProps {
  initialCode?: string;
  language?: string;
  readOnly?: boolean;
  onChange?: (code: string) => void;
  title?: string;
}

export function CodeEditor({ 
  initialCode = "", 
  language = "javascript", 
  readOnly = false,
  onChange,
  title = "untitled"
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    if (onChange) onChange(newCode);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Simple line number generation
  const lineNumbers = code.split('\n').map((_, i) => i + 1);

  return (
    <div className={`rounded-lg overflow-hidden border border-border bg-card shadow-2xl ring-1 ring-white/5 group transition-all duration-300 hover:ring-primary/20 hover:border-primary/20 ${isFullscreen ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)]' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1a] border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
          </div>
          <div className="flex items-center gap-2 ml-2 px-3 py-1 rounded bg-black/40 border border-white/5 transition-colors group-hover:border-primary/20">
            <FileCode className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors">{title}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleFullscreen}
            className="p-1.5 rounded hover:bg-white/10 text-muted-foreground hover:text-primary transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-white/10 text-muted-foreground hover:text-primary transition-colors"
            title="Copy Code"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Editor/Viewer Area */}
      <div className={`relative bg-[#0d0d0d] font-mono text-sm leading-6 custom-scrollbar ${isFullscreen ? 'h-[calc(100%-3rem)]' : 'min-h-[400px] max-h-[70vh]'} overflow-auto`}>
        {readOnly ? (
           <Highlight
           theme={themes.vsDark}
           code={code}
           language={language}
         >
           {({ className, style, tokens, getLineProps, getTokenProps }) => (
             <pre className={`${className} p-4 float-left min-w-full`} style={{...style, backgroundColor: 'transparent', margin: 0}}>
               {tokens.map((line, i) => (
                 <div key={i} {...getLineProps({ line })} className="table-row">
                   <span className="table-cell text-right pr-4 select-none text-muted-foreground/30 w-12 border-r border-white/5 mr-4 bg-[#111]">
                     {i + 1}
                   </span>
                   <span className="table-cell pl-4">
                     {line.map((token, key) => (
                       <span key={key} {...getTokenProps({ token })} />
                     ))}
                   </span>
                 </div>
               ))}
             </pre>
           )}
         </Highlight>
        ) : (
          <div className="relative flex min-h-full">
            {/* Line Numbers */}
            <div className="flex-none w-12 py-4 text-right pr-3 text-muted-foreground/30 select-none border-r border-white/5 bg-[#111]">
              {lineNumbers.map((num) => (
                <div key={num} className="h-6 leading-6">{num}</div>
              ))}
            </div>
            
            {/* Textarea for editing */}
            <textarea
              value={code}
              onChange={handleChange}
              spellCheck={false}
              className="flex-1 p-4 bg-transparent text-[#e0e0e0] outline-none resize-none min-h-[400px] font-mono leading-6 tab-4 caret-primary selection:bg-primary/20"
              style={{ tabSize: 2 }}
              placeholder="// Start typing or paste your code here..."
            />
          </div>
        )}
      </div>
      
      {/* Footer info */}
      <div className="bg-[#1a1a1a] border-t border-border px-4 py-2 flex items-center justify-between text-xs text-muted-foreground font-mono">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
            {language}
          </span>
          <span>{code.length} chars</span>
          <span>{lineNumbers.length} lines</span>
        </div>
        <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${readOnly ? 'bg-blue-500' : 'bg-primary'} animate-pulse`} />
           <span>{readOnly ? 'Read Only' : 'Editing'}</span>
        </div>
      </div>
    </div>
  );
}
