import { Layout } from "@/components/layout";
import { CodeEditor } from "@/components/code-editor";
import { api } from "@/lib/api";
import { languages, getExtension } from "@/lib/language-detect";
import { useRoute } from "wouter";
import { Calendar, Eye, Share2, Shield, Check, Pencil, X, Copy, Download, Code2 } from "lucide-react";
import { format } from "date-fns";
import NotFound from "./not-found";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import type { Snippet } from "@shared/schema";

export default function SnippetView() {
  const [match, params] = useRoute("/snippet/:id");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  
  useEffect(() => {
    if (match && params?.id) {
      api.snippets.getById(params.id)
        .then((s) => {
          setSnippet(s);
          setEditTitle(s.title);
        })
        .catch(() => setSnippet(null))
        .finally(() => setLoading(false));
    }
  }, [match, params?.id]);
  
  if (!match) return <NotFound />;
  if (loading) return <Layout><div className="text-center py-20">Loading...</div></Layout>;
  if (!snippet) return <NotFound />;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(snippet.code);
    setCopiedCode(true);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([snippet.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = snippet.title;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("File downloaded");
  };

  const handleSaveTitle = async () => {
    if (!editTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }
    
    const ext = getExtension(snippet.language);
    const finalTitle = editTitle.trim().endsWith(ext) ? editTitle.trim() : `${editTitle.trim()}${ext}`;
    
    try {
      const updated = await api.snippets.updateTitle(snippet.id, finalTitle);
      setSnippet(updated);
      setEditTitle(updated.title);
      setIsEditingTitle(false);
      toast.success("Title updated");
    } catch (error) {
      toast.error("Failed to update title");
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(snippet.title);
    setIsEditingTitle(false);
  };

  const languageInfo = languages.find(l => l.id === snippet.language);
  const languageName = languageInfo?.name || snippet.language;
  const languageColor = getLanguageColor(snippet.language);

  return (
    <Layout>
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-6 border-b border-border">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-3">
                  {isEditingTitle ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="text-xl font-bold font-mono bg-background border border-border rounded px-3 py-1.5 focus:outline-none focus:border-primary/50"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveTitle();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        data-testid="input-edit-title"
                      />
                      <button
                        onClick={handleSaveTitle}
                        className="p-2 rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                        data-testid="button-save-title"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-2 rounded bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                        data-testid="button-cancel-title"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 group">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-muted-foreground" />
                        <h1 
                          className="text-xl font-bold font-mono" 
                          style={{ color: languageColor }}
                          data-testid="text-title"
                        >
                          {snippet.title}
                        </h1>
                      </div>
                      <button
                        onClick={() => setIsEditingTitle(true)}
                        className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-white/5 transition-all"
                        title="Edit title"
                        data-testid="button-edit-title"
                      >
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span 
                      className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: `${languageColor}15`, 
                        color: languageColor,
                        border: `1px solid ${languageColor}30`
                      }}
                    >
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: languageColor }}
                      />
                      {languageName}
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(snippet.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Eye className="w-3.5 h-3.5" />
                      {snippet.views} views
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleCopyCode}
                    className="h-9 px-3 rounded border border-border bg-background hover:bg-white/5 hover:border-primary/30 flex items-center gap-2 text-sm font-medium transition-all"
                    title="Copy code"
                    data-testid="button-copy-code"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                    <span className="hidden sm:inline">{copiedCode ? "Copied" : "Copy"}</span>
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="h-9 px-3 rounded border border-border bg-background hover:bg-white/5 hover:border-primary/30 flex items-center gap-2 text-sm font-medium transition-all"
                    title="Download file"
                    data-testid="button-download"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download</span>
                  </button>
                  <button 
                    onClick={handleShare}
                    className="h-9 px-4 rounded bg-primary text-black font-medium flex items-center gap-2 text-sm hover:bg-primary/90 transition-all"
                    data-testid="button-share"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                    {copiedLink ? "Copied!" : "Share"}
                  </button>
                </div>
              </div>
            </div>

            {snippet.isPrivate && (
              <div className="bg-red-500/5 border-b border-red-500/20 text-red-500/90 px-6 py-3 flex items-center gap-3">
                <Shield className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm">Private snippet - only visible to you and those with the link.</p>
              </div>
            )}

            <div className="p-0">
              <CodeEditor 
                initialCode={snippet.code} 
                language={snippet.language} 
                readOnly={true} 
                title={snippet.title}
                className="border-none rounded-none"
              />
            </div>
          </div>
          
        </div>
      </div>
    </Layout>
  );
}

function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    javascript: '#f7df1e',
    typescript: '#3178c6',
    python: '#3572A5',
    java: '#b07219',
    csharp: '#178600',
    cpp: '#f34b7d',
    c: '#555555',
    go: '#00ADD8',
    rust: '#dea584',
    ruby: '#701516',
    php: '#4F5D95',
    swift: '#F05138',
    kotlin: '#A97BFF',
    html: '#e34c26',
    css: '#563d7c',
    scss: '#c6538c',
    json: '#292929',
    yaml: '#cb171e',
    markdown: '#083fa1',
    sql: '#e38c00',
    shell: '#89e051',
    dockerfile: '#384d54',
  };
  return colors[language] || '#22c55e';
}
