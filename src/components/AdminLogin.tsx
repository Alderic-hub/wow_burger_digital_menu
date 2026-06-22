import React, { useState, FormEvent } from "react";
import { Lock, Mail, ArrowRight, Sparkles, Home } from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onGoHome: () => void;
  adminPassword?: string;
  adminEmail?: string;
}

export default function AdminLogin({ onLoginSuccess, onGoHome, adminPassword = "admin", adminEmail = "admin@wowburger.et" }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate authenticating session
    setTimeout(() => {
      // Prioritize live adminEmail and adminPassword, fallback to localStorage option, finally defaulting
      const localPassword = localStorage.getItem("wow_admin_password") || "admin";
      const targetPassword = adminPassword !== "admin" ? adminPassword : localPassword;

      const localEmail = localStorage.getItem("wow_admin_email") || "admin@wowburger.et";
      const targetEmail = adminEmail !== "admin@wowburger.et" ? adminEmail : localEmail;

      if (email.trim().toLowerCase() === targetEmail.trim().toLowerCase() && password === targetPassword) {
        localStorage.setItem("wow_admin_token", "secure_session_token_2026");
        // Maintain local storage sync
        localStorage.setItem("wow_admin_password", targetPassword);
        localStorage.setItem("wow_admin_email", targetEmail);
        onLoginSuccess();
      } else {
        setError("Invalid administrative credentials. Please verify your login details.");
      }
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden select-none font-sans text-white">
      {/* Background radial overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.15),transparent_60%)] pointer-events-none" />
      
      {/* Return Home Button */}
      <button 
        onClick={onGoHome}
        className="absolute top-6 left-6 flex items-center gap-2 bg-neutral-900/80 hover:bg-neutral-800 border border-white/5 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer hover:border-brand-yellow/30"
      >
        <Home className="w-3.5 h-3.5 text-brand-yellow" />
        <span>Return to Customer Menu</span>
      </button>

      {/* Login Box */}
      <div className="w-full max-w-md bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-white/[0.08] rounded-[24px] p-8 shadow-2xl relative z-10">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex w-12 h-12 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 items-center justify-center text-brand-yellow mb-2 shadow-[0_0_15px_rgba(255,193,7,0.1)]">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-wider text-white">
            ADMIN <span className="text-brand-yellow">PORTAL</span>
          </h2>
          <p className="text-xs text-zinc-400 font-light leading-relaxed">
            Please authenticate to access categories, menu items, and restaurant information management.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@wowburger.et"
                className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl pl-10 pr-4 py-3.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30 font-mono transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
              Administrative Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl pl-10 pr-4 py-3.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30 font-mono transition-all"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-brand-red/10 border border-brand-red/25 rounded-xl px-4 py-3 text-xs text-brand-red font-medium text-center animate-pulse">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-yellow hover:bg-yellow-500 disabled:opacity-50 text-black font-black uppercase tracking-widest text-xs py-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer mt-4 active:scale-98 shadow-lg shadow-brand-yellow/10"
          >
            <span>{isLoading ? "Authenticating..." : "Access Dashboard"}</span>
            {!isLoading && <ArrowRight className="w-4 h-4 stroke-[2.5]" />}
          </button>
        </form>

        {/* Informative credentials note */}
        <div className="mt-8 pt-6 border-t border-white/[0.04] text-center space-y-1">
          <p className="text-[10px] text-zinc-500">
            For demonstration/first-time access, use:
          </p>
          <div className="bg-zinc-900 border border-white/5 rounded-lg px-3 py-1.5 inline-block text-[10px] text-brand-yellow font-mono space-y-0.5 text-left">
            <div>Email: <span className="text-white font-bold">admin@wowburger.et</span></div>
            <div>Pass: <span className="text-white font-bold">admin</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
