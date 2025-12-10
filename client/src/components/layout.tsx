import { Link, useLocation } from "wouter";
import { Terminal, User, Plus, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="h-10 border-b border-border bg-activity-bar-bg flex items-center justify-between px-4 z-50">
      <Link href="/" className="flex items-center gap-2 group cursor-pointer text-foreground hover:text-primary transition-colors">
        <div className="w-6 h-6 flex items-center justify-center rounded bg-primary/10 text-primary">
          <Terminal className="w-3.5 h-3.5" />
        </div>
        <span className="font-sans font-bold text-xs tracking-tight">SnippetShare</span>
      </Link>

      <div className="flex items-center gap-1">
        <Link href="/" className={`h-8 px-3 flex items-center gap-1.5 text-xs font-medium rounded transition-colors ${isActive('/') ? 'text-primary bg-white/5' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`} title="New Snippet">
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </Link>
        
        <div className="w-px h-3 bg-border mx-1"></div>

        <Link href="/dashboard" className={`h-8 px-3 flex items-center gap-1.5 text-xs font-medium rounded transition-colors ${isActive('/dashboard') ? 'text-primary bg-white/5' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`} title="Dashboard">
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dash</span>
        </Link>

        <Link href="/profile" className={`h-8 px-3 flex items-center gap-1.5 text-xs font-medium rounded transition-colors ${isActive('/profile') ? 'text-primary bg-white/5' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`} title="Profile">
          <User className="w-3.5 h-3.5" />
          <span>Profile</span>
        </Link>
      </div>
    </nav>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary overflow-hidden">
      <Navbar />
      <main className="flex-1 flex flex-col min-h-0 bg-workspace-bg">
        {children}
      </main>
    </div>
  );
}
