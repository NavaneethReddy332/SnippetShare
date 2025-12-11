import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

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

  const handleScroll = useCallback(() => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

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
                <div key={num} style={{ height: '20px', lineHeight: '20px' }}>{num}</div>
              ))}
            </div>
            
            {/* Editor container with syntax highlighting overlay */}
            <div className="flex-1 relative">
              {/* Syntax highlighted layer (behind) */}
              <Highlight
                theme={themes.vsDark}
                code={code || " "}
                language={language}
              >
                {({ className: highlightClass, style, tokens, getLineProps, getTokenProps }) => (
                  <pre
                    ref={preRef}
                    className={`${highlightClass} absolute inset-0 p-2 font-mono text-xs overflow-auto pointer-events-none`}
                    style={{
                      ...style,
                      backgroundColor: 'transparent',
                      margin: 0,
                      lineHeight: '20px',
                      tabSize: 2,
                      whiteSpace: 'pre',
                    }}
                    aria-hidden="true"
                  >
                    {tokens.map((line, i) => (
                      <div key={i} {...getLineProps({ line })} style={{ minHeight: '20px' }}>
                        {line.map((token, key) => (
                          <span key={key} {...getTokenProps({ token })} />
                        ))}
                        {line.length === 1 && line[0].empty && '\n'}
                      </div>
                    ))}
                  </pre>
                )}
              </Highlight>
              
              {/* Textarea for editing (on top, transparent text) */}
              <textarea
                ref={textareaRef}
                value={code}
                onChange={handleChange}
                onPaste={handlePaste}
                onScroll={handleScroll}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                className="absolute inset-0 p-2 bg-transparent text-transparent outline-none resize-none font-mono text-xs caret-primary selection:bg-primary/20 whitespace-pre overflow-auto placeholder:text-green-500/60"
                style={{ tabSize: 2, lineHeight: '20px', caretColor: 'hsl(var(--primary))' }}
                placeholder="// Start typing your code here...
// Tip: Language will be auto-detected as you type"
                data-testid="textarea-code"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Status Bar */}
      <div className="flex-none bg-panel-header-bg border-t border-white/5 px-2 py-1 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider">
        <div className="flex gap-3">
          <span className="text-primary font-medium">{language}</span>
          <span className="text-foreground/60">{code.length} chars</span>
          <span className="text-foreground/60">{lineNumbers.length} lines</span>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={handleCopy} className="text-foreground/60 hover:text-primary transition-colors font-medium">
             {copied ? "COPIED" : "COPY"}
           </button>
           <div className="w-px h-3 bg-white/10"></div>
           <span className="text-foreground/60">{readOnly ? 'READ' : 'EDIT'}</span>
        </div>
      </div>
    </div>
  );
}
