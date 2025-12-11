import { Layout } from "@/components/layout";
import { CodeEditor } from "@/components/code-editor";
import { api } from "@/lib/api";
import { languages, getExtension } from "@/lib/language-detect";
import { useRoute, useLocation } from "wouter";
import { Calendar, Eye, Share2, Shield, Check, Pencil, X, Copy, Download, Code2, ExternalLink, Lock } from "lucide-react";
import { format } from "date-fns";
import NotFound from "./not-found";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import type { Snippet } from "@shared/schema";
import { PageTransition, FadeIn, SlideIn } from "@/components/animations";

export default function SnippetView() {
  const [match, params] = useRoute("/snippet/:id");
  const [_, setLocation] = useLocation();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [verifying, setVerifying] = useState(false);
  
  useEffect(() => {
    if (match && params?.id) {
      api.snippets.getById(params.id)
        .then((result) => {
          if ('requiresPassword' in result && result.requiresPassword) {
            setRequiresPassword(true);
            setSnippet(null);
          } else {
            setSnippet(result as Snippet);
            setEditTitle((result as Snippet).title);
          }
        })
        .catch(() => setSnippet(null))
        .finally(() => setLoading(false));
    }
  }, [match, params?.id]);

  const handlePasswordSubmit = async () => {
    if (!params?.id || !passwordInput.trim()) return;
    
    setVerifying(true);
    setPasswordError("");
    
    try {
      const result = await api.snippets.verifyPassword(params.id, passwordInput);
      setSnippet(result);
      setEditTitle(result.title);
      setRequiresPassword(false);
    } catch (error: any) {
      setPasswordError(error.message || "Invalid password");
    } finally {
      setVerifying(false);
    }
  };
  
  if (!match) return <NotFound />;
  if (loading) return <Layout><div className="text-center py-20">Loading...</div></Layout>;
  
  if (requiresPassword) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <div className="bg-card border border-border rounded-lg p-8 text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-xl font-semibold text-foreground">
                  Password Protected
                </h1>
                <p className="text-sm text-muted-foreground">
                  This snippet requires a password to view
                </p>
              </div>
              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="Enter password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError("");
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  className="w-full bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  data-testid="input-snippet-password"
                  autoFocus
                />
                {passwordError && (
                  <p className="text-sm text-destructive">{passwordError}</p>
                )}
                <button
                  onClick={handlePasswordSubmit}
                  disabled={verifying || !passwordInput.trim()}
                  className="w-full bg-primary text-primary-foreground font-medium py-3 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  data-testid="button-unlock"
                >
                  {verifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Unlock Snippet
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
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
      <PageTransition className="flex-1 overflow-auto p-6 flex items-center justify-center">
        <div className="w-full max-w-3xl mx-auto space-y-6">
          
          <SlideIn direction="up">
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-lg">
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
                    onClick={() => setLocation(`/?code=${encodeURIComponent(snippet.code)}&lang=${snippet.language}&title=${encodeURIComponent(snippet.title)}`)}
                    className="h-9 px-3 rounded border border-border bg-background hover:bg-white/5 hover:border-primary/30 flex items-center gap-2 text-sm font-medium transition-all"
                    title="Edit"
                    data-testid="button-open-in-editor"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
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
              <div className="bg-muted border-b border-border text-muted-foreground px-6 py-3 flex items-center gap-3">
                <Shield className="w-4 h-4 flex-shrink-0" />
                <p className="text-sm">Private snippet - only visible to you and those with the link.</p>
              </div>
            )}

            <FadeIn delay={0.1}>
              <div className="p-0 max-h-96 overflow-auto">
                <CodeEditor 
                  initialCode={snippet.code} 
                  language={snippet.language} 
                  readOnly={true} 
                  title={snippet.title}
                  className="border-none rounded-none"
                  compact={true}
                />
              </div>
            </FadeIn>
          </div>
          </SlideIn>
          
        </div>
      </PageTransition>
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
