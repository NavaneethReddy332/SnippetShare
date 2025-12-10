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
  className?: string;
  compact?: boolean;
}

export function CodeEditor({ 
  initialCode = "", 
  language = "javascript", 
  readOnly = false,
  onChange,
  title = "untitled",
  className = "",
  compact = false
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
    toast.success("Copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    if (onChange) onChange(newCode);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newCode = code.substring(0, start) + pastedText + code.substring(end);
    setCode(newCode);
    if (onChange) onChange(newCode);
    
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + pastedText.length;
    }, 0);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Simple line number generation
  const lineNumbers = code.split('\n').map((_, i) => i + 1);

  return (
    <div className={`flex flex-col bg-editor-bg ${isFullscreen ? 'fixed inset-0 z-50' : 'relative'} ${className}`}>
      
      {/* Editor/Viewer Area */}
      <div className="flex-1 relative overflow-auto custom-scrollbar">
        {readOnly ? (
           <Highlight
           theme={themes.vsDark}
           code={code}
           language={language}
         >
           {({ className, style, tokens, getLineProps, getTokenProps }) => (
             <pre className={`${className} p-2 float-left min-w-full text-xs font-mono`} style={{...style, backgroundColor: 'transparent', margin: 0}}>
               {tokens.map((line, i) => (
                 <div key={i} {...getLineProps({ line })} className="table-row">
                   <span className="table-cell text-right pr-3 select-none text-muted-foreground/30 w-10 border-r border-white/5 mr-3 bg-editor-gutter-bg">
                     {i + 1}
                   </span>
                   <span className="table-cell pl-3">
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
            <div className="flex-none w-10 py-2 text-right pr-2 text-xs text-muted-foreground/30 select-none border-r border-white/5 bg-editor-gutter-bg font-mono">
              {lineNumbers.map((num) => (
                <div key={num} className="h-5 leading-5">{num}</div>
              ))}
            </div>
            
            {/* Textarea for editing */}
            <textarea
              value={code}
              onChange={handleChange}
              onPaste={handlePaste}
              spellCheck={false}
              className="flex-1 p-2 bg-transparent text-[#e0e0e0] outline-none resize-none h-full font-mono text-xs leading-5 tab-4 caret-primary selection:bg-primary/20"
              style={{ tabSize: 2 }}
              placeholder="// Code here..."
            />
          </div>
        )}
      </div>
      
      {/* Status Bar */}
      <div className="flex-none bg-panel-header-bg border-t border-white/5 px-2 py-1 flex items-center justify-between text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
        <div className="flex gap-3">
          <span className="text-primary">{language}</span>
          <span>{code.length} chars</span>
          <span>{lineNumbers.length} lines</span>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={handleCopy} className="hover:text-primary transition-colors">
             {copied ? "COPIED" : "COPY"}
           </button>
           <div className="w-px h-3 bg-white/10"></div>
           <span>{readOnly ? 'READ' : 'EDIT'}</span>
        </div>
      </div>
    </div>
  );
}
