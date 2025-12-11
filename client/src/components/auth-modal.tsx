import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { ModalBackdrop, AnimatePresence } from "@/components/animations";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { id: string; username: string }) => void;
}

type AuthMode = "login" | "signup";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("login");
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

  const handleGoogleClick = () => {
    toast.info("Google authentication coming soon");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalBackdrop onClose={onClose}>
          <div 
            className="bg-[#0a0a0a] border border-[#222] rounded-lg shadow-2xl w-full max-w-xs overflow-hidden"
            data-testid="auth-modal"
          >
            <div className="flex items-center justify-end p-2">
              <button
                onClick={onClose}
                className="p-1 rounded-md hover:bg-[#222] transition-colors text-[#666] hover:text-white"
                data-testid="button-close-auth"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 pb-5">
              <div className="flex gap-6 mb-5">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`text-xs font-semibold uppercase tracking-wider pb-1.5 transition-all ${
                    mode === "login" 
                      ? "text-white border-b-2 border-white" 
                      : "text-[#555] hover:text-[#888]"
                  }`}
                  data-testid="tab-login"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`text-xs font-semibold uppercase tracking-wider pb-1.5 transition-all ${
                    mode === "signup" 
                      ? "text-white border-b-2 border-white" 
                      : "text-[#555] hover:text-[#888]"
                  }`}
                  data-testid="tab-signup"
                >
                  Sign Up
                </button>
              </div>

              <button
                type="button"
                onClick={handleGoogleClick}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-transparent border border-[#333] rounded-md text-xs font-medium text-[#555] cursor-not-allowed transition-colors mb-4"
                disabled
                data-testid="button-google-auth"
              >
                <GoogleIcon className="w-4 h-4" />
                <span>CONTINUE WITH GOOGLE</span>
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-[#222]" />
                <span className="text-[10px] text-[#444] uppercase">Or</span>
                <div className="flex-1 h-px bg-[#222]" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs text-[#666] mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-0 py-1.5 bg-transparent border-0 border-b border-[#333] text-white text-sm focus:outline-none focus:border-[#666] transition-colors placeholder:text-[#444]"
                    data-testid="input-username"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#666] mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-0 py-1.5 bg-transparent border-0 border-b border-[#333] text-white text-sm focus:outline-none focus:border-[#666] transition-colors placeholder:text-[#444]"
                    data-testid="input-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-white text-black text-xs font-semibold uppercase tracking-wider rounded-md hover:bg-[#e5e5e5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                  data-testid="button-submit-auth"
                >
                  {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                  {mode === "login" ? "Login" : "Sign Up"}
                </button>

                {mode === "login" && (
                  <button
                    type="button"
                    className="w-full text-center text-[10px] text-[#555] hover:text-[#888] transition-colors mt-2"
                    onClick={() => toast.info("Password reset coming soon")}
                    data-testid="button-forgot-password"
                  >
                    Forgot password?
                  </button>
                )}
              </form>
            </div>
          </div>
        </ModalBackdrop>
      )}
    </AnimatePresence>
  );
}
