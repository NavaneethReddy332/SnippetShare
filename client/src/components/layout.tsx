import { Link, useLocation } from "wouter";
import { Terminal, User, Plus, LayoutDashboard } from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <aside className="w-12 border-r border-border bg-[#111] flex flex-col items-center py-4 gap-4 z-50">
      <Link href="/">
        <a className="w-8 h-8 flex items-center justify-center rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors mb-4" title="Home">
          <Terminal className="w-5 h-5" />
        </a>
      </Link>

      <div className="flex flex-col gap-3 w-full px-2">
        <Link href="/">
          <a className={`w-8 h-8 mx-auto flex items-center justify-center rounded transition-colors ${isActive('/') ? 'text-primary bg-white/5' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`} title="New Snippet">
            <Plus className="w-5 h-5" />
          </a>
        </Link>
        
        <Link href="/dashboard">
          <a className={`w-8 h-8 mx-auto flex items-center justify-center rounded transition-colors ${isActive('/dashboard') ? 'text-primary bg-white/5' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`} title="Dashboard">
            <LayoutDashboard className="w-5 h-5" />
          </a>
        </Link>

        <Link href="/profile">
          <a className={`w-8 h-8 mx-auto flex items-center justify-center rounded transition-colors ${isActive('/profile') ? 'text-primary bg-white/5' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`} title="Profile">
            <User className="w-5 h-5" />
          </a>
        </Link>
      </div>
    </aside>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen bg-background text-foreground flex font-sans selection:bg-primary/20 selection:text-primary overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 bg-[#000]">
        {children}
      </main>
    </div>
  );
}
