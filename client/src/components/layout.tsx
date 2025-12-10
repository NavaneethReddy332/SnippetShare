import { Link, useLocation } from "wouter";
import { Terminal, User, Plus, LayoutDashboard, AlertTriangle, X, LogIn, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { AuthModal } from "./auth-modal";

export function GuestWarningBanner({ onLoginClick }: { onLoginClick: () => void }) {
  const [dismissed, setDismissed] = useState(false);
  const { user } = useAuth();
  
  if (dismissed || user) return null;
  
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-center gap-3" data-testid="guest-warning-banner">
      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
      <p className="text-sm text-amber-500/90 font-medium">
        Your snippets may be lost without an account. <button onClick={onLoginClick} className="underline hover:text-amber-400" data-testid="link-sign-in">Sign in</button> to save your work permanently.
      </p>
      <button 
        onClick={() => setDismissed(true)}
        className="p-1 rounded hover:bg-amber-500/20 transition-colors ml-2"
        data-testid="button-dismiss-warning"
      >
        <X className="w-3 h-3 text-amber-500/70" />
      </button>
    </div>
  );
}

export function Navbar({ onLoginClick }: { onLoginClick: () => void }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

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

        {user ? (
          <>
            <Link href="/profile" className={`h-8 px-3 flex items-center gap-1.5 text-xs font-medium rounded transition-colors ${isActive('/profile') ? 'text-primary bg-white/5' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`} title="Profile">
              <User className="w-3.5 h-3.5" />
              <span>{user.username}</span>
            </Link>
            <button 
              onClick={logout}
              className="h-8 px-3 flex items-center gap-1.5 text-xs font-medium rounded transition-colors text-muted-foreground hover:text-foreground hover:bg-white/5"
              title="Logout"
              data-testid="button-logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <button 
            onClick={onLoginClick}
            className="h-8 px-4 flex items-center gap-1.5 text-xs font-semibold rounded bg-primary text-black hover:bg-primary/90 transition-colors"
            data-testid="button-login"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Login</span>
          </button>
        )}
      </div>
    </nav>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { login } = useAuth();

  const handleLoginClick = () => setShowAuthModal(true);
  const handleAuthClose = () => setShowAuthModal(false);
  const handleAuthSuccess = (user: { id: string; username: string }) => {
    login(user);
    setShowAuthModal(false);
  };

  return (
    <div className="h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary overflow-hidden">
      <GuestWarningBanner onLoginClick={handleLoginClick} />
      <Navbar onLoginClick={handleLoginClick} />
      <main className="flex-1 flex flex-col min-h-0 bg-workspace-bg">
        {children}
      </main>
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={handleAuthClose} 
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
