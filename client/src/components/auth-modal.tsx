import { useState } from "react";
import { X, Mail, Lock, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { id: string; username: string }) => void;
}

type AuthMode = "login" | "signup";

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }
    
    if (mode === "signup" && !email.trim()) {
      toast.error("Email is required");
      return;
    }
    
    if (!password.trim()) {
      toast.error("Password is required");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const result = await api.auth.login({ username, password });
        toast.success("Logged in successfully");
        onSuccess(result.user);
      } else {
        const result = await api.auth.register({ username, password });
        toast.success("Account created successfully");
        onSuccess(result.user);
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      data-testid="auth-modal-backdrop"
    >
      <div 
        className="bg-card border border-border rounded-md shadow-2xl w-full max-w-xs animate-in zoom-in-95 slide-in-from-bottom-2 duration-200 overflow-hidden"
        data-testid="auth-modal"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold">
            {mode === "login" ? "Sign In" : "Sign Up"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-accent transition-colors"
            data-testid="button-close-auth"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="transition-all duration-300 ease-out" style={{ height: mode === "signup" ? "auto" : "auto" }}>
          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-muted-foreground">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded text-xs focus:outline-none focus:border-primary/50 transition-colors"
                  data-testid="input-username"
                />
              </div>
            </div>

            <div 
              className={`space-y-1 transition-all duration-300 ease-out overflow-hidden ${
                mode === "signup" ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <label className="block text-xs font-medium text-muted-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded text-xs focus:outline-none focus:border-primary/50 transition-colors"
                  data-testid="input-email"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded text-xs focus:outline-none focus:border-primary/50 transition-colors"
                  data-testid="input-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              data-testid="button-submit-auth"
            >
              {loading && <Loader2 className="w-3 h-3 animate-spin" />}
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>

        <div className="px-4 pb-3">
          <div className="text-center text-xs text-muted-foreground">
            {mode === "login" ? (
              <>
                No account?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-foreground hover:underline font-medium"
                  data-testid="button-switch-signup"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Have an account?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-foreground hover:underline font-medium"
                  data-testid="button-switch-login"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
