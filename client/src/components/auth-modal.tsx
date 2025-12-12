import { useState, useEffect } from "react";
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

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activePanel, setActivePanel] = useState<AuthMode>("login");

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setActivePanel(mode), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => setActivePanel(mode), 50);
    return () => clearTimeout(timer);
  }, [mode]);

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

    if (mode === "signup" && password !== confirmPassword) {
      toast.error("Passwords do not match");
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

  const slide = (to: AuthMode) => {
    setMode(to);
    setUsername("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalBackdrop onClose={onClose}>
          <div 
            className="w-[340px] h-[480px] bg-black border border-[#333] relative overflow-hidden shadow-2xl"
            style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}
            data-testid="auth-modal"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-transparent border-none text-[#666] text-2xl cursor-pointer leading-none transition-colors hover:text-white"
              data-testid="button-close-auth"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div 
              className="flex w-[200%] h-full transition-transform duration-[800ms]"
              style={{ 
                transform: mode === "signup" ? "translateX(-50%)" : "translateX(0)",
                transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)"
              }}
            >
              <div className={`w-1/2 h-full p-10 flex flex-col justify-center ${activePanel === "login" ? "active-panel" : ""}`}>
                <h2 
                  className={`text-lg font-normal tracking-wider uppercase mb-6 text-center text-white transition-all duration-[600ms] ${
                    activePanel === "login" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                  }`}
                  style={{ transitionDelay: activePanel === "login" ? "100ms" : "0ms", transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)" }}
                >
                  Login
                </h2>
                
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  className={`w-full flex items-center justify-center gap-3 py-2.5 bg-white/5 border border-[#333] text-[#ccc] text-[11px] uppercase cursor-pointer transition-all duration-[600ms] mb-5 hover:bg-white/10 hover:border-[#666] ${
                    activePanel === "login" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                  }`}
                  style={{ transitionDelay: activePanel === "login" ? "200ms" : "0ms", transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)" }}
                  data-testid="button-google-auth-login"
                >
                  <GoogleIcon />
                  Google
                </button>

                <div 
                  className={`text-center text-[#444] text-[10px] uppercase mb-5 relative transition-all duration-[600ms] ${
                    activePanel === "login" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                  }`}
                  style={{ transitionDelay: activePanel === "login" ? "300ms" : "0ms", transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)" }}
                >
                  <span className="relative z-10 px-2 bg-black">or</span>
                  <div className="absolute top-1/2 left-0 w-[40%] h-px bg-[#222]" />
                  <div className="absolute top-1/2 right-0 w-[40%] h-px bg-[#222]" />
                </div>

                <form onSubmit={handleSubmit}>
                  <div 
                    className={`mb-5 transition-all duration-[600ms] ${
                      activePanel === "login" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                    }`}
                    style={{ transitionDelay: activePanel === "login" ? "400ms" : "0ms", transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)" }}
                  >
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-[#333] py-2.5 text-white text-sm outline-none rounded-none transition-colors focus:border-white placeholder:text-[#444] placeholder:text-xs"
                      data-testid="input-username-login"
                    />
                  </div>
                  <div 
                    className={`mb-5 transition-all duration-[600ms] ${
                      activePanel === "login" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                    }`}
                    style={{ transitionDelay: activePanel === "login" ? "500ms" : "0ms", transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)" }}
                  >
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-[#333] py-2.5 text-white text-sm outline-none rounded-none transition-colors focus:border-white placeholder:text-[#444] placeholder:text-xs"
                      data-testid="input-password-login"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3.5 bg-white text-black border-none uppercase font-bold text-[11px] tracking-wider cursor-pointer mt-2.5 transition-all duration-[600ms] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                      activePanel === "login" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                    }`}
                    style={{ transitionDelay: activePanel === "login" ? "600ms" : "0ms", transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)" }}
                    data-testid="button-submit-login"
                  >
                    {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                    Enter System
                  </button>
                </form>

                <p 
                  className={`text-center mt-5 text-[11px] text-[#666] transition-all duration-[600ms] ${
                    activePanel === "login" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                  }`}
                  style={{ transitionDelay: activePanel === "login" ? "700ms" : "0ms", transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)" }}
                >
                  New here?{" "}
                  <span 
                    className="text-white font-bold cursor-pointer ml-1 border-b border-transparent transition-colors hover:border-white"
                    onClick={() => slide("signup")}
                    data-testid="link-switch-to-signup"
                  >
                    Create Account
                  </span>
                </p>
              </div>

              <div className={`w-1/2 h-full p-10 flex flex-col justify-center ${activePanel === "signup" ? "active-panel" : ""}`}>
                <h2 
                  className={`text-lg font-normal tracking-wider uppercase mb-6 text-center text-white transition-all duration-[600ms] ${
                    activePanel === "signup" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                  }`}
                  style={{ transitionDelay: activePanel === "signup" ? "100ms" : "0ms", transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)" }}
                >
                  Join
                </h2>

                <button
                  type="button"
                  onClick={handleGoogleClick}
                  className={`w-full flex items-center justify-center gap-3 py-2.5 bg-white/5 border border-[#333] text-[#ccc] text-[11px] uppercase cursor-pointer transition-all duration-[600ms] mb-5 hover:bg-white/10 hover:border-[#666] ${
                    activePanel === "signup" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                  }`}
                  style={{ transitionDelay: activePanel === "signup" ? "200ms" : "0ms", transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)" }}
                  data-testid="button-google-auth-signup"
                >
                  <GoogleIcon />
                  Google
                </button>

                <div 
                  className={`text-center text-[#444] text-[10px] uppercase mb-5 relative transition-all duration-[600ms] ${
                    activePanel === "signup" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                  }`}
                  style={{ transitionDelay: activePanel === "signup" ? "300ms" : "0ms", transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)" }}
                >
                  <span className="relative z-10 px-2 bg-black">or</span>
                  <div className="absolute top-1/2 left-0 w-[40%] h-px bg-[#222]" />
                  <div className="absolute top-1/2 right-0 w-[40%] h-px bg-[#222]" />
                </div>

                <form onSubmit={handleSubmit}>
                  <div 
                    className={`mb-5 transition-all duration-[600ms] ${
                      activePanel === "signup" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                    }`}
                    style={{ transitionDelay: activePanel === "signup" ? "400ms" : "0ms", transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)" }}
                  >
                    <input
                      type="text"
                      placeholder="Pick Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-[#333] py-2.5 text-white text-sm outline-none rounded-none transition-colors focus:border-white placeholder:text-[#444] placeholder:text-xs"
                      data-testid="input-username-signup"
                    />
                  </div>
                  <div 
                    className={`mb-5 transition-all duration-[600ms] ${
                      activePanel === "signup" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                    }`}
                    style={{ transitionDelay: activePanel === "signup" ? "500ms" : "0ms", transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)" }}
                  >
                    <input
                      type="password"
                      placeholder="Create Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-[#333] py-2.5 text-white text-sm outline-none rounded-none transition-colors focus:border-white placeholder:text-[#444] placeholder:text-xs"
                      data-testid="input-password-signup"
                    />
                  </div>
                  <div 
                    className={`mb-5 transition-all duration-[600ms] ${
                      activePanel === "signup" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                    }`}
                    style={{ transitionDelay: activePanel === "signup" ? "600ms" : "0ms", transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)" }}
                  >
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-[#333] py-2.5 text-white text-sm outline-none rounded-none transition-colors focus:border-white placeholder:text-[#444] placeholder:text-xs"
                      data-testid="input-confirm-password-signup"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3.5 bg-white text-black border-none uppercase font-bold text-[11px] tracking-wider cursor-pointer mt-2.5 transition-all duration-[600ms] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                      activePanel === "signup" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                    }`}
                    style={{ transitionDelay: activePanel === "signup" ? "700ms" : "0ms", transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)" }}
                    data-testid="button-submit-signup"
                  >
                    {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                    Initialize
                  </button>
                </form>

                <p 
                  className={`text-center mt-5 text-[11px] text-[#666] transition-all duration-[600ms] ${
                    activePanel === "signup" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                  }`}
                  style={{ transitionDelay: activePanel === "signup" ? "800ms" : "0ms", transitionTimingFunction: "cubic-bezier(0.19, 1, 0.22, 1)" }}
                >
                  Existing user?{" "}
                  <span 
                    className="text-white font-bold cursor-pointer ml-1 border-b border-transparent transition-colors hover:border-white"
                    onClick={() => slide("login")}
                    data-testid="link-switch-to-login"
                  >
                    Log In
                  </span>
                </p>
              </div>
            </div>
          </div>
        </ModalBackdrop>
      )}
    </AnimatePresence>
  );
}
