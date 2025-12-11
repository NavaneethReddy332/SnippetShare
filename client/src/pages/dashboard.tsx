import { Layout } from "@/components/layout";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Trash2, Eye, Lock, Globe, Clock, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import type { Snippet } from "@shared/schema";

export default function Dashboard() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.snippets.getAll()
      .then(setSnippets)
      .catch(() => toast.error("Failed to load snippets"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this snippet?")) {
      try {
        await api.snippets.delete(id);
        setSnippets(prev => prev.filter(s => s.id !== id));
        toast.success("Snippet deleted");
      } catch (error) {
        toast.error("Failed to delete snippet");
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your saved snippets and account settings.</p>
          </div>
          <div className="flex gap-4">
             <div className="text-right">
                <div className="text-2xl font-mono font-bold text-primary">{snippets.length}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Snippets</div>
             </div>
             <div className="w-px bg-border h-12"></div>
             <div className="text-right">
                <div className="text-2xl font-mono font-bold text-foreground">{snippets.reduce((acc, s) => acc + parseInt(s.views || "0"), 0)}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Views</div>
             </div>
          </div>
        </div>

        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Loading snippets...</p>
            </div>
          ) : snippets.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-lg bg-card/30">
              <p className="text-muted-foreground mb-4">You haven't created any snippets yet.</p>
              <Link href="/">
                <a className="text-primary hover:underline">Create your first snippet</a>
              </Link>
            </div>
          ) : (
            snippets.map((snippet) => (
              <Link key={snippet.id} href={`/snippet/${snippet.id}`}>
                <a className="group block p-5 rounded-lg border border-border bg-card hover:border-primary/30 hover:bg-card/80 hover:shadow-[0_0_15px_-5px_hsl(var(--primary)/0.1)] transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-muted text-muted-foreground">
                        <Globe className="w-4 h-4" />
                      </div>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {snippet.title}
                      </h3>
                      {snippet.isPrivate && (
                        <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs border border-border flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Private
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={(e) => handleDelete(e, snippet.id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-muted-foreground font-mono">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary/50"></div>
                      {snippet.language}
                    </div>
                    <div className="flex items-center gap-2">
                       <Calendar className="w-3 h-3" />
                       {formatDistanceToNow(new Date(snippet.createdAt))} ago
                    </div>
                    <div className="flex items-center gap-2">
                       <Eye className="w-3 h-3" />
                       {snippet.views} views
                    </div>
                  </div>
                </a>
              </Link>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
