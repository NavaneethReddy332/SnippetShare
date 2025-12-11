import { Layout } from "@/components/layout";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Trash2, Eye, Lock, Globe, Calendar, FileCode } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import type { Snippet } from "@shared/schema";
import { useAuth } from "@/lib/auth-context";
import { PageTransition, StaggerContainer, StaggerItem, FadeIn } from "@/components/animations";

export default function Dashboard() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isLoading: authLoading } = useAuth();
  const [_, setLocation] = useLocation();

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setLocation("/");
      return;
    }

    api.snippets.getMy()
      .then(setSnippets)
      .catch(() => toast.error("Failed to load snippets"))
      .finally(() => setLoading(false));
  }, [user, authLoading, setLocation]);

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

  const totalViews = snippets.reduce((acc, s) => acc + parseInt(s.views || "0"), 0);

  return (
    <Layout>
      <PageTransition className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4">
          <FadeIn>
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div className="flex items-center gap-3">
                <FileCode className="w-4 h-4 text-muted-foreground" />
                <h1 className="text-sm font-semibold">Dashboard</h1>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Snippets:</span>
                  <span className="font-mono font-medium">{snippets.length}</span>
                </div>
                <div className="w-px h-3 bg-border"></div>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Views:</span>
                  <span className="font-mono font-medium">{totalViews}</span>
                </div>
              </div>
            </div>
          </FadeIn>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-xs text-muted-foreground">Loading...</p>
            </div>
          ) : snippets.length === 0 ? (
            <FadeIn delay={0.1}>
              <div className="text-center py-12 border border-dashed border-border rounded">
                <p className="text-xs text-muted-foreground mb-2">No snippets yet</p>
                <Link href="/" className="text-xs text-foreground hover:underline">Create one</Link>
              </div>
            </FadeIn>
          ) : (
            <StaggerContainer className="space-y-1">
              {snippets.map((snippet) => (
                <StaggerItem key={snippet.id}>
                  <Link href={`/snippet/${snippet.id}`} className="group flex items-center gap-3 px-3 py-2 rounded border border-transparent hover:border-border transition-all duration-200">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {snippet.isPrivate ? (
                        <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <Globe className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className="text-xs font-medium truncate group-hover:text-foreground transition-colors duration-200">
                        {snippet.title}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground flex-shrink-0">
                      <span className="font-mono uppercase">{snippet.language}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {formatDistanceToNow(new Date(snippet.createdAt), { addSuffix: false })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-2.5 h-2.5" />
                        {snippet.views}
                      </span>
                    </div>

                    <button 
                      onClick={(e) => handleDelete(e, snippet.id)}
                      className="p-1 text-muted-foreground hover:text-foreground rounded transition-all duration-200 opacity-0 group-hover:opacity-100"
                      data-testid={`button-delete-${snippet.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </PageTransition>
    </Layout>
  );
}
