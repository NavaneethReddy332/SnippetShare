import { Layout } from "@/components/layout";
import { CodeEditor } from "@/components/code-editor";
import { api } from "@/lib/api";
import { languages, getExtension } from "@/lib/language-detect";
import { useRoute } from "wouter";
import { Calendar, Eye, Share2, Shield, AlertTriangle, Check, Pencil, X } from "lucide-react";
import { format } from "date-fns";
import NotFound from "./not-found";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import type { Snippet } from "@shared/schema";

export default function SnippetView() {
  const [match, params] = useRoute("/snippet/:id");
  const [copiedLink, setCopiedLink] = useState(false);
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

  const languageName = languages.find(l => l.id === snippet.language)?.name || snippet.language;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-2xl font-bold font-sans tracking-tight bg-card border border-border rounded px-2 py-1 focus:outline-none focus:border-primary/50"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  data-testid="input-edit-title"
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-1.5 rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                  data-testid="button-save-title"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1.5 rounded bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                  data-testid="button-cancel-title"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h1 className="text-3xl font-bold font-sans tracking-tight" data-testid="text-title">{snippet.title}</h1>
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
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/5 text-foreground/80">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                {languageName}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {format(new Date(snippet.createdAt), "MMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                {snippet.views} views
              </span>
            </div>
          </div>
          
          <button 
            onClick={handleShare}
            className="px-4 py-2 rounded border border-border bg-card hover:bg-white/5 hover:border-primary/30 flex items-center gap-2 text-sm font-medium transition-all group"
            data-testid="button-share"
          >
            {copiedLink ? <Check className="w-4 h-4 text-primary" /> : <Share2 className="w-4 h-4 group-hover:text-primary transition-colors" />}
            {copiedLink ? "Copied!" : "Share Link"}
          </button>
        </div>

        {snippet.expiresAt && (
           <div className="bg-yellow-500/5 border border-yellow-500/20 text-yellow-500/90 px-4 py-3 rounded flex items-center gap-3 shadow-[0_0_15px_-5px_rgba(234,179,8,0.1)]">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">This is a guest snippet. It will automatically expire and be deleted in 24 hours.</p>
           </div>
        )}

        {snippet.isPrivate && (
           <div className="bg-red-500/5 border border-red-500/20 text-red-500/90 px-4 py-3 rounded flex items-center gap-3 shadow-[0_0_15px_-5px_rgba(239,68,68,0.1)]">
              <Shield className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">Private Snippet. Only visible to you and those with the link.</p>
           </div>
        )}

        <CodeEditor 
          initialCode={snippet.code} 
          language={snippet.language} 
          readOnly={true} 
          title={snippet.title}
        />
      </div>
    </Layout>
  );
}
