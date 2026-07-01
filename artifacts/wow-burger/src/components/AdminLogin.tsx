import React, { useState } from "react";
import { Lock, Mail, ArrowRight, Sparkles, ArrowLeft, RefreshCw, X, CheckCircle, Key } from "lucide-react";
import { getRemoteRestaurantInfo, updateRemoteAdminCredentials } from "../dbService";
// @ts-ignore
import wowBurgerLogo from "../assets/images/wow_burger_logo_1781154696795.png";

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onGoHome: () => void;
  adminPassword?: string;
  adminEmail?: string;
}

export default function AdminLogin({ onLoginSuccess, onGoHome, adminPassword = "admin", adminEmail = "monstergame246@gmail.com" }: AdminLoginProps) {
  // Login States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // SSPR States
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2 | 3>(1);
  const [resetEmail, setResetEmail] = useState("");
  const [enteredResetCode, setEnteredResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetStatusMsg, setResetStatusMsg] = useState({ type: "", text: "" });
  const [isResetLoading, setIsResetLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    setTimeout(() => {
      const localPassword = localStorage.getItem("wow_admin_password") || "admin";
      const targetPassword = adminPassword !== "admin" ? adminPassword : localPassword;

      const localEmail = localStorage.getItem("wow_admin_email") || "monstergame246@gmail.com";
      const targetEmail = adminEmail || localEmail;

      const inputEmail = email.trim().toLowerCase();
      const matchEmail = targetEmail.toLowerCase();

      const isEmailMatch = inputEmail && matchEmail && inputEmail === matchEmail;

      if (isEmailMatch && password === targetPassword) {
        localStorage.setItem("wow_admin_token", "secure_session_token_2026");
        localStorage.setItem("wow_admin_password", targetPassword);
        localStorage.setItem("wow_admin_email", targetEmail);
        onLoginSuccess();
      } else {
        setError("Invalid administrative credentials. Please verify your login details.");
      }
      setIsLoading(false);
    }, 600);
  };

  // SSPR Step 1: Verify email against Firestore, then ask backend to generate & send OTP
  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatusMsg({ type: "", text: "" });
    setIsResetLoading(true);

    try {
      // Verify email matches the registered admin email in Firestore
      const remoteInfo = await getRemoteRestaurantInfo();
      const targetEmail = remoteInfo.adminEmail || adminEmail || "monstergame246@gmail.com";

      const inputEmail = resetEmail.trim().toLowerCase();
      const matchEmail = targetEmail.toLowerCase();

      if (inputEmail !== matchEmail) {
        setResetStatusMsg({
          type: "error",
          text: `The entered email does not match our registered administrative profile.`
        });
        setIsResetLoading(false);
        return;
      }

      // Ask the backend to generate the OTP and send it — code never touches the browser
      const response = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inputEmail }),
      });

      let resData: { success: boolean; message: string } = { success: false, message: "Unknown error" };
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        resData = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || `Server error ${response.status}`);
      }

      if (!resData.success) {
        throw new Error(resData.message);
      }

      setResetStep(2);
      setResetStatusMsg({
        type: "success",
        text: `Verification code sent to ${targetEmail}. It expires in 10 minutes.`
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setResetStatusMsg({
        type: "error",
        text: `Failed to send verification code: ${msg}`
      });
    } finally {
      setIsResetLoading(false);
    }
  };

  // SSPR Step 2: Send code to backend for verification — OTP is never in frontend state
  const handleVerifyResetCode = async () => {
    setResetStatusMsg({ type: "", text: "" });

    if (enteredResetCode.length !== 6) return;

    setIsResetLoading(true);
    try {
      const response = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail.trim().toLowerCase(), code: enteredResetCode }),
      });

      let resData: { success: boolean; message: string } = { success: false, message: "Unknown error" };
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        resData = await response.json();
      } else {
        throw new Error(`Server error ${response.status}`);
      }

      if (!resData.success) {
        setResetStatusMsg({ type: "error", text: resData.message });
        return;
      }

      setResetStep(3);
      setResetStatusMsg({
        type: "success",
        text: "Code verified! Choose a new password below."
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setResetStatusMsg({ type: "error", text: `Verification failed: ${msg}` });
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleSaveResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatusMsg({ type: "", text: "" });

    if (newPassword.length < 4) {
      setResetStatusMsg({ type: "error", text: "New password must be at least 4 characters long." });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setResetStatusMsg({ type: "error", text: "Passwords do not match!" });
      return;
    }

    setIsResetLoading(true);
    try {
      await updateRemoteAdminCredentials(resetEmail.trim(), newPassword);
      
      setResetStatusMsg({
        type: "success",
        text: "Password reset successfully! Redirecting to login..."
      });

      setEmail(resetEmail.trim());
      setPassword(newPassword);
      setError("");

      setTimeout(() => {
        setIsResetMode(false);
        setResetStep(1);
        setResetEmail("");
        setEnteredResetCode("");
        setNewPassword("");
        setConfirmNewPassword("");
        setResetStatusMsg({ type: "", text: "" });
      }, 2000);

    } catch (err) {
      setResetStatusMsg({
        type: "error",
        text: "Failed to save new password to database. Please try again."
      });
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setIsResetMode(false);
    setResetStep(1);
    setResetEmail("");
    setEnteredResetCode("");
    setNewPassword("");
    setConfirmNewPassword("");
    setResetStatusMsg({ type: "", text: "" });
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-start sm:justify-center pt-24 pb-10 px-4 relative overflow-y-auto overflow-x-hidden no-scrollbar select-none font-sans text-white">
      {/* Background radial overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.15),transparent_60%)] pointer-events-none" />
      
      {/* Return Home Button */}
      <button 
         onClick={onGoHome}
         className="absolute top-6 left-4 sm:left-8 md:left-12 flex items-center gap-2 bg-neutral-900/80 hover:bg-neutral-800 border border-white/5 rounded-full pl-1.5 pr-4 py-1.5 text-xs font-bold transition-all cursor-pointer hover:border-brand-yellow/30 active:scale-95 z-20"
         id="btn_return_customer_menu"
      >
        <div className="w-6 h-6 rounded-full bg-black/50 flex items-center justify-center border border-white/10 text-brand-yellow">
          <ArrowLeft className="w-3.5 h-3.5" />
        </div>
        <span>Return to Customer Menu</span>
      </button>

      {/* Login / SSPR Card Wrapper */}
      <div className="w-full max-w-md bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-white/[0.08] rounded-[24px] p-6 sm:p-8 shadow-2xl relative z-10 transition-all duration-300">
        
        {/* Header Branding */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex w-14 h-14 rounded-full overflow-hidden border border-brand-red shadow-[0_0_15px_rgba(230,30,42,0.3)] bg-black mb-2">
            <img 
              src={wowBurgerLogo} 
              alt="WOW Burger Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-wider text-white">
            ADMIN <span className="text-brand-red">PORTAL</span>
          </h2>
          <p className="text-xs text-zinc-400 font-light leading-relaxed">
            {isResetMode 
              ? "Self-Service Password Reset (SSPR) Center" 
              : "Please authenticate to access categories, menu items, and restaurant information management."}
          </p>
        </div>

        {/* --- SELF-SERVICE PASSWORD RESET (SSPR) INTERFACE --- */}
        {isResetMode ? (
          <div className="space-y-5">
            {/* SSPR Step Header */}
            <div className="bg-zinc-950/80 border border-white/[0.03] rounded-xl p-3.5 text-center">
              <span className="text-[9px] text-brand-yellow font-black uppercase tracking-wider font-mono">
                {resetStep === 1 && "Step 1 of 3: Verify Your Admin Email"}
                {resetStep === 2 && "Step 2 of 3: Enter Verification Code"}
                {resetStep === 3 && "Step 3 of 3: Set New Password"}
              </span>
              <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">
                {resetStep === 1 && "Enter your registered admin email. A one-time code will be sent to it."}
                {resetStep === 2 && "Check your inbox and enter the 6-digit code we sent you."}
                {resetStep === 3 && "Choose a new secure password for your admin account."}
              </p>
            </div>

            {/* SSPR Status Alert */}
            {resetStatusMsg.text && (
              <div className={`p-3.5 rounded-xl border text-[10px] font-sans font-bold flex items-start gap-2 ${
                resetStatusMsg.type === "success" 
                  ? "bg-green-500/10 border-green-500/25 text-green-400" 
                  : "bg-brand-yellow/10 border-brand-yellow/25 text-brand-yellow"
              }`}>
                {resetStatusMsg.type === "success" 
                  ? <CheckCircle className="w-4 h-4 shrink-0 text-green-400" /> 
                  : <X className="w-4 h-4 shrink-0 text-brand-yellow" />}
                <span className="leading-normal">{resetStatusMsg.text}</span>
              </div>
            )}

            {/* SSPR STEP 1: INPUT RECOVERY EMAIL */}
            {resetStep === 1 && (
              <form onSubmit={handleSendResetCode} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                    Registered Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="your-admin@email.com"
                      className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl pl-10 pr-4 py-3.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30 font-sans transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isResetLoading || !resetEmail.trim()}
                  className="w-full bg-brand-yellow hover:bg-yellow-500 disabled:opacity-50 text-black font-black uppercase tracking-widest text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer mt-2 active:scale-98 shadow-lg shadow-brand-yellow/10"
                >
                  {isResetLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* SSPR STEP 2: ENTER OTP */}
            {resetStep === 2 && (
              <div className="space-y-4">
                <div className="bg-zinc-950/80 border border-white/5 rounded-xl p-4 text-center space-y-2">
                  <Mail className="w-8 h-8 text-brand-yellow mx-auto animate-bounce mt-1" />
                  <p className="text-xs font-bold text-white">Check Your Inbox</p>
                  <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
                    A 6-digit verification code was sent to{" "}
                    <span className="text-brand-yellow font-bold font-mono">{resetEmail}</span>.{" "}
                    It expires in 10 minutes.
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={enteredResetCode}
                    onChange={(e) => setEnteredResetCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-full bg-zinc-950 border border-brand-yellow/35 rounded-xl py-3.5 text-center text-brand-yellow font-mono text-sm tracking-[0.6em] font-black focus:outline-none focus:border-brand-yellow"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setResetStep(1);
                      setEnteredResetCode("");
                      setResetStatusMsg({ type: "", text: "" });
                    }}
                    className="bg-neutral-900 hover:bg-neutral-850 border border-white/5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-400 transition-all cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={enteredResetCode.length !== 6 || isResetLoading}
                    onClick={handleVerifyResetCode}
                    className="bg-brand-yellow hover:bg-yellow-500 disabled:opacity-45 text-black py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1 shadow-lg shadow-brand-yellow/10"
                  >
                    {isResetLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Verify Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* SSPR STEP 3: CREATE NEW PASSWORD */}
            {resetStep === 3 && (
              <form onSubmit={handleSaveResetPassword} className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                      New Administrative Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 4 characters"
                        className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl pl-10 pr-4 py-3.5 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-brand-yellow"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="password"
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Re-type new password"
                        className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl pl-10 pr-4 py-3.5 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-brand-yellow"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isResetLoading}
                  className="w-full bg-brand-yellow hover:bg-yellow-500 disabled:opacity-50 text-black font-black uppercase tracking-widest text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 shadow-lg shadow-brand-yellow/10"
                >
                  {isResetLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-3.5 h-3.5" />
                      <span>Save & Return to Login</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Back to Login Anchor link */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-brand-yellow transition-colors cursor-pointer"
              >
                Cancel & Return to Login
              </button>
            </div>
          </div>
        ) : (
          /* --- TRADITIONAL LOGIN INTERFACE --- */
          <form onSubmit={handleLoginSubmit} className="space-y-5">
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
                  placeholder="your-admin@email.com"
                  className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl pl-10 pr-4 py-3.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30 font-mono transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Administrative Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsResetMode(true);
                    setResetStep(1);
                    setResetEmail(email);
                  }}
                  className="text-[9px] font-extrabold uppercase tracking-wider text-brand-yellow hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="*****"
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
              className="w-full bg-brand-red hover:bg-red-600 disabled:opacity-50 text-white font-black uppercase tracking-widest text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 shadow-lg shadow-brand-red/20 mt-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Access Admin Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
