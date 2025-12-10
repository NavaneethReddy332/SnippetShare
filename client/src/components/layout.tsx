import { Link, useLocation } from "wouter";
import { Terminal, User, Plus, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50 h-10 flex items-center">
      <div className="container mx-auto px-4 flex items-center justify-between h-full">
        <Link href="/">
          <a className="flex items-center gap-2 group cursor-pointer">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="font-sans font-bold text-sm tracking-tight">SnippetShare</span>
          </a>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/">
            <a className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${isActive('/') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              <Plus className="w-3 h-3" />
              <span>New</span>
            </a>
          </Link>
          
          <div className="h-3 w-px bg-border"></div>

          <Link href="/dashboard">
            <a className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              <LayoutDashboard className="w-3 h-3" />
              <span>Dash</span>
            </a>
          </Link>

          <Link href="/profile">
            <a className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              <User className="w-3 h-3" />
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
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary overflow-hidden">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-4 h-[calc(100vh-2.5rem)] overflow-hidden">
        {children}
      </main>
    </div>
  );
}
