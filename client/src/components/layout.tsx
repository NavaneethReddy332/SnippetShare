import { Link, useLocation } from "wouter";
import { Terminal, User, Plus, LayoutDashboard, AlertTriangle, X, LogIn, LogOut, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { AuthModal } from "./auth-modal";

export function GuestWarningBanner({ onLoginClick }: { onLoginClick: () => void }) {
  const [dismissed, setDismissed] = useState(false);
  const { user, isLoading } = useAuth();
  
  // Don't show while loading or if user is logged in
  if (isLoading || user || dismissed) return null;
  
  return (
    <div 
      className="bg-card/50 border-b border-border/50 px-4 py-1.5 flex items-center justify-center gap-2" 
      data-testid="guest-warning-banner"
    >
      <AlertTriangle className="w-3 h-3 text-muted-foreground/70 flex-shrink-0" />
      <p className="text-xs text-muted-foreground">
        Guest mode - <button onClick={onLoginClick} className="text-primary hover:underline transition-colors font-medium" data-testid="link-sign-in">Sign in</button> to save permanently
      </p>
      <button 
        onClick={() => setDismissed(true)}
        className="p-0.5 rounded hover:bg-accent/50 transition-colors ml-1"
        data-testid="button-dismiss-warning"
      >
        <X className="w-2.5 h-2.5 text-muted-foreground/70" />
      </button>
    </div>
  );
}

export function Navbar({ onLoginClick }: { onLoginClick: () => void }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

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

        <Link href="/dashboard" className={`h-8 px-3 flex items-center gap-1.5 text-xs font-medium rounded transition-colors ${isActive('/dashboard') ? 'text-primary bg-white/5' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`} title="Browse Public Snippets">
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Browse</span>
        </Link>

        <button 
          onClick={toggleTheme}
          className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 rounded transition-colors"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          data-testid="button-theme-toggle"
        >
          {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

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
            className="h-8 px-4 flex items-center gap-1.5 text-xs font-semibold rounded border border-border text-foreground hover:bg-accent transition-colors"
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
