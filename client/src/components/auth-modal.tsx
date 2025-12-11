import { useState } from "react";
import { X, Lock, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { ModalBackdrop, AnimatePresence } from "@/components/animations";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { id: string; username: string }) => void;
}

type AuthMode = "login" | "signup";

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }
    
    if (!password.trim()) {
      toast.error("Password is required");
      return;
    }

    if (password.length < 4) {
      toast.error("Password must be at least 4 characters");
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
      if (mode === "login" && error.message?.includes("Invalid")) {
        toast.error("Wrong username or password. Try signing up if you don't have an account.");
      } else if (error.message?.includes("already exists")) {
        toast.error("Username already taken. Try logging in instead.");
      } else {
        toast.error(error.message || "Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalBackdrop onClose={onClose}>
          <div 
            className="bg-card border border-border rounded-md shadow-2xl w-full max-w-xs overflow-hidden"
            data-testid="auth-modal"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold">Welcome</h2>
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-accent transition-colors"
                data-testid="button-close-auth"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex border-b border-border">
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 py-2 text-xs font-medium transition-colors ${
                  mode === "signup" 
                    ? "text-foreground border-b-2 border-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="tab-signup"
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 py-2 text-xs font-medium transition-colors ${
                  mode === "login" 
                    ? "text-foreground border-b-2 border-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="tab-login"
              >
                Sign In
              </button>
            </div>

            <div className="transition-all duration-300 ease-out">
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

          </div>
        </ModalBackdrop>
      )}
    </AnimatePresence>
  );
}
