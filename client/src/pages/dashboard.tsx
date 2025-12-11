import { Layout } from "@/components/layout";
import { api } from "@/lib/api";
import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { Trash2, Eye, Lock, Globe, Calendar, FileCode, Search, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import type { Snippet } from "@shared/schema";
import { useAuth } from "@/lib/auth-context";
import { PageTransition, StaggerContainer, StaggerItem, FadeIn } from "@/components/animations";

export default function Dashboard() {
  const [mySnippets, setMySnippets] = useState<Snippet[]>([]);
  const [publicSnippets, setPublicSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"public" | "my">("public");
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    
    const fetchData = async () => {
      try {
        const publicData = await api.snippets.getPublic();
        setPublicSnippets(publicData);
        
        if (user) {
          const myData = await api.snippets.getMy();
          setMySnippets(myData);
        }
      } catch (error) {
        toast.error("Failed to load snippets");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, authLoading]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this snippet?")) {
      try {
        await api.snippets.delete(id);
        setMySnippets(prev => prev.filter(s => s.id !== id));
        toast.success("Snippet deleted");
      } catch (error) {
        toast.error("Failed to delete snippet");
      }
    }
  };

  const filteredSnippets = useMemo(() => {
    const sourceSnippets = activeTab === "public" ? publicSnippets : mySnippets;
    if (!searchQuery.trim()) return sourceSnippets;
    const query = searchQuery.toLowerCase();
    return sourceSnippets.filter(s => 
      s.title.toLowerCase().includes(query) ||
      s.language.toLowerCase().includes(query)
    );
  }, [activeTab, publicSnippets, mySnippets, searchQuery]);

  const totalViews = mySnippets.reduce((acc, s) => acc + parseInt(s.views || "0"), 0);

  return (
    <Layout>
      <PageTransition className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4">
          <FadeIn>
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div className="flex items-center gap-3">
                <FileCode className="w-4 h-4 text-muted-foreground" />
                <h1 className="text-sm font-semibold">Browse Snippets</h1>
              </div>
              {user && (
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">My Snippets:</span>
                    <span className="font-mono font-medium">{mySnippets.length}</span>
                  </div>
                  <div className="w-px h-3 bg-border"></div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Views:</span>
                    <span className="font-mono font-medium">{totalViews}</span>
                  </div>
                </div>
              )}
            </div>
          </FadeIn>

          <FadeIn delay={0.05}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by title or language..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-card border border-border rounded px-2 py-1.5 pl-8 text-xs focus:outline-none focus:border-primary/50 placeholder:text-foreground/40"
                  data-testid="input-search"
                />
              </div>
              
              <div className="flex bg-card border border-border rounded p-0.5">
                <button 
                  onClick={() => setActiveTab("public")}
                  className={`px-3 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-colors ${
                    activeTab === "public" 
                      ? 'bg-primary/20 text-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  data-testid="button-tab-public"
                >
                  <Globe className="w-3 h-3" /> Public
                </button>
                {user && (
                  <button 
                    onClick={() => setActiveTab("my")}
                    className={`px-3 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-colors ${
                      activeTab === "my" 
                        ? 'bg-primary/20 text-primary' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    data-testid="button-tab-my"
                  >
                    <User className="w-3 h-3" /> My Snippets
                  </button>
                )}
              </div>
            </div>
          </FadeIn>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-xs text-muted-foreground">Loading...</p>
            </div>
          ) : filteredSnippets.length === 0 ? (
            <FadeIn delay={0.1}>
              <div className="text-center py-12 border border-dashed border-border rounded">
                <p className="text-xs text-muted-foreground mb-2">
                  {searchQuery ? "No snippets match your search" : activeTab === "my" ? "No snippets yet" : "No public snippets available"}
                </p>
                {activeTab === "my" && (
                  <Link href="/" className="text-xs text-foreground hover:underline">Create one</Link>
                )}
              </div>
            </FadeIn>
          ) : (
            <StaggerContainer className="space-y-1">
              {filteredSnippets.map((snippet) => (
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

                    {activeTab === "my" && user && snippet.userId === user.id && (
                      <button 
                        onClick={(e) => handleDelete(e, snippet.id)}
                        className="p-1 text-muted-foreground hover:text-foreground rounded transition-all duration-200 opacity-0 group-hover:opacity-100"
                        data-testid={`button-delete-${snippet.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
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
