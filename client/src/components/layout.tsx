import { Link, useLocation } from "wouter";
import { Terminal, User, Plus, LayoutDashboard, LogOut } from "lucide-react";

export function Navbar() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <a className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Terminal className="w-5 h-5 text-primary" />
            </div>
            <span className="font-sans font-bold text-lg tracking-tight">SnippetShare</span>
          </a>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/">
            <a className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              <Plus className="w-4 h-4" />
              <span>New Snippet</span>
            </a>
          </Link>
          
          <div className="h-4 w-px bg-border"></div>

          <Link href="/dashboard">
            <a className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </a>
          </Link>

          <Link href="/profile">
            <a className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              <User className="w-4 h-4" />
              <span>Profile</span>
            </a>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-border py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground font-mono">
          <p>PREMIUM CODE SNIPPET SHARING PLATFORM © 2025</p>
        </div>
      </footer>
    </div>
  );
}
