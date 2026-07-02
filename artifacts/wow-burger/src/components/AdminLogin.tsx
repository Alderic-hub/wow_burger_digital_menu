import React, { useState, useEffect } from "react";
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

type SsprStep = 1 | 2 | 3;

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

async function apiPost(path: string, body: object): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  try {
    return await res.json();
  } catch {
    return { success: false, message: `Server error ${res.status}` };
  }
}

export default function AdminLogin({
  onLoginSuccess,
  onGoHome,
  adminPassword = "admin",
  adminEmail = "monstergame246@gmail.com",
}: AdminLoginProps) {

  // ── Login state ─────────────────────────────────────────────────────────
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // ── SSPR (forgot-password) state ────────────────────────────────────────
  const [isSsprMode, setIsSsprMode]   = useState(false);
  const [ssprStep, setSsprStep]       = useState<SsprStep>(1);
  const [ssprEmail, setSsprEmail]     = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ssprMsg, setSsprMsg]         = useState({ type: "", text: "" });
  const [ssprLoading, setSsprLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Start 60-second resend countdown whenever we enter step 2
  useEffect(() => {
    if (ssprStep !== 2) { setResendCountdown(0); return; }
    setResendCountdown(60);
    const id = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) { clearInterval(id); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [ssprStep]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  function resetSspr() {
    setSsprStep(1);
    setSsprEmail("");
    setEnteredCode("");
    setNewPassword("");
    setConfirmPassword("");
    setSsprMsg({ type: "", text: "" });
    setSsprLoading(false);
  }

  function enterSspr() {
    resetSspr();
    setSsprEmail(email); // pre-fill from login form if available
    setIsSsprMode(true);
  }

  function exitSspr() {
    resetSspr();
    setIsSsprMode(false);
  }

  // ── Login ────────────────────────────────────────────────────────────────

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    setTimeout(() => {
      const storedPw    = localStorage.getItem("wow_admin_password") || "admin";
      const storedEmail = localStorage.getItem("wow_admin_email") || "monstergame246@gmail.com";
      const targetPw    = adminPassword !== "admin" ? adminPassword : storedPw;
      const targetEmail = adminEmail || storedEmail;

      if (
        email.trim().toLowerCase() === targetEmail.toLowerCase() &&
        password === targetPw
      ) {
        localStorage.setItem("wow_admin_token", "secure_session_token_2026");
        localStorage.setItem("wow_admin_password", targetPw);
        localStorage.setItem("wow_admin_email", targetEmail);
        onLoginSuccess();
      } else {
        setLoginError("Invalid administrative credentials. Please verify your login details.");
      }
      setIsLoggingIn(false);
    }, 600);
  }

  // ── SSPR Step 1 — verify email, send OTP ────────────────────────────────

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setSsprMsg({ type: "", text: "" });
    setSsprLoading(true);

    try {
      // 1. Confirm email matches the registered admin email in Firestore
      const remoteInfo  = await getRemoteRestaurantInfo();
      const registered  = (remoteInfo.adminEmail || adminEmail).toLowerCase();
      const input       = ssprEmail.trim().toLowerCase();

      if (input !== registered) {
        setSsprMsg({ type: "error", text: "This email does not match our registered admin profile." });
        return;
      }

      // 2. Ask the server to generate the OTP and send it — code never leaves the server
      const data = await apiPost("/api/otp/send", { email: input });

      if (!data.success) throw new Error(data.message);

      setSsprStep(2);
      setSsprMsg({ type: "success", text: `Verification code sent to ${input}. It expires in 10 minutes.` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSsprMsg({ type: "error", text: `Failed to send code: ${msg}` });
    } finally {
      setSsprLoading(false);
    }
  }

  // ── SSPR Resend — re-issue OTP without re-validating email ───────────────
  async function handleResend() {
    setSsprMsg({ type: "", text: "" });
    setSsprLoading(true);
    try {
      const data = await apiPost("/api/otp/send", { email: ssprEmail.trim().toLowerCase() });
      if (!data.success) throw new Error(data.message);
      setEnteredCode("");
      setResendCountdown(60);
      setSsprMsg({ type: "success", text: "A new verification code has been sent to your inbox." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSsprMsg({ type: "error", text: `Resend failed: ${msg}` });
    } finally {
      setSsprLoading(false);
    }
  }

  // ── SSPR Step 2 — verify OTP ─────────────────────────────────────────────

  async function handleStep2() {
    if (enteredCode.length !== 6) return;
    setSsprMsg({ type: "", text: "" });
    setSsprLoading(true);

    try {
      const data = await apiPost("/api/otp/verify", {
        email: ssprEmail.trim().toLowerCase(),
        code:  enteredCode,
      });

      if (!data.success) throw new Error(data.message);

      setSsprStep(3);
      setSsprMsg({ type: "success", text: "Code verified! Choose a new password below." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSsprMsg({ type: "error", text: msg });
    } finally {
      setSsprLoading(false);
    }
  }

  // ── SSPR Step 3 — save new password ──────────────────────────────────────

  async function handleStep3(e: React.FormEvent) {
    e.preventDefault();
    setSsprMsg({ type: "", text: "" });

    if (newPassword.length < 4) {
      setSsprMsg({ type: "error", text: "Password must be at least 4 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setSsprMsg({ type: "error", text: "Passwords do not match." });
      return;
    }

    setSsprLoading(true);
    try {
      await updateRemoteAdminCredentials(ssprEmail.trim(), newPassword);

      setSsprMsg({ type: "success", text: "Password reset! Returning to login…" });
      setEmail(ssprEmail.trim());
      setPassword(newPassword);

      setTimeout(exitSspr, 2000);
    } catch {
      setSsprMsg({ type: "error", text: "Failed to save the new password. Please try again." });
    } finally {
      setSsprLoading(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-start sm:justify-center pt-24 pb-10 px-4 relative overflow-y-auto overflow-x-hidden no-scrollbar select-none font-sans text-white">

      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.15),transparent_60%)] pointer-events-none" />

      {/* Return home */}
      <button
        onClick={onGoHome}
        className="absolute top-6 left-4 sm:left-8 md:left-12 flex items-center gap-2 bg-neutral-900/80 hover:bg-neutral-800 border border-white/5 rounded-full pl-1.5 pr-4 py-1.5 text-xs font-bold transition-all cursor-pointer hover:border-brand-yellow/30 active:scale-95 z-20"
      >
        <div className="w-6 h-6 rounded-full bg-black/50 flex items-center justify-center border border-white/10 text-brand-yellow">
          <ArrowLeft className="w-3.5 h-3.5" />
        </div>
        <span>Return to Customer Menu</span>
      </button>

      {/* Card */}
      <div className="w-full max-w-md bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-white/[0.08] rounded-[24px] p-6 sm:p-8 shadow-2xl relative z-10">

        {/* Branding header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex w-14 h-14 rounded-full overflow-hidden border border-brand-red shadow-[0_0_15px_rgba(230,30,42,0.3)] bg-black mb-2">
            <img src={wowBurgerLogo} alt="WOW Burger" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-wider text-white">
            ADMIN <span className="text-brand-red">PORTAL</span>
          </h2>
          <p className="text-xs text-zinc-400 font-light leading-relaxed">
            {isSsprMode
              ? "Self-Service Password Reset (SSPR)"
              : "Please authenticate to access categories, menu items, and restaurant information management."}
          </p>
        </div>

        {/* ── SSPR FLOW ────────────────────────────────────────────────────── */}
        {isSsprMode ? (
          <div className="space-y-5">

            {/* Step header */}
            <div className="bg-zinc-950/80 border border-white/[0.03] rounded-xl p-3.5 text-center">
              <span className="text-[9px] text-brand-yellow font-black uppercase tracking-wider font-mono">
                {ssprStep === 1 && "Step 1 of 3 — Verify Your Admin Email"}
                {ssprStep === 2 && "Step 2 of 3 — Enter Verification Code"}
                {ssprStep === 3 && "Step 3 of 3 — Set New Password"}
              </span>
              <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">
                {ssprStep === 1 && "Enter your registered admin email. A one-time code will be sent to it."}
                {ssprStep === 2 && "Check your inbox and enter the 6-digit code we sent you."}
                {ssprStep === 3 && "Choose a new secure password for your admin account."}
              </p>
            </div>

            {/* Status alert */}
            {ssprMsg.text && (
              <div className={`p-3.5 rounded-xl border text-[10px] font-bold flex items-start gap-2 ${
                ssprMsg.type === "success"
                  ? "bg-green-500/10 border-green-500/25 text-green-400"
                  : "bg-brand-yellow/10 border-brand-yellow/25 text-brand-yellow"
              }`}>
                {ssprMsg.type === "success"
                  ? <CheckCircle className="w-4 h-4 shrink-0" />
                  : <X className="w-4 h-4 shrink-0" />}
                <span className="leading-normal">{ssprMsg.text}</span>
              </div>
            )}

            {/* ── Step 1 ── */}
            {ssprStep === 1 && (
              <form onSubmit={handleStep1} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                    Registered Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="email"
                      required
                      value={ssprEmail}
                      onChange={(e) => setSsprEmail(e.target.value)}
                      placeholder="your-admin@email.com"
                      className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl pl-10 pr-4 py-3.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30 transition-all"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={ssprLoading || !ssprEmail.trim()}
                  className="w-full bg-brand-yellow hover:bg-yellow-500 disabled:opacity-50 text-black font-black uppercase tracking-widest text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer mt-2 active:scale-98 shadow-lg shadow-brand-yellow/10"
                >
                  {ssprLoading
                    ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span>Sending Code…</span></>
                    : <><span>Send Verification Code</span><ArrowRight className="w-3.5 h-3.5" /></>}
                </button>
              </form>
            )}

            {/* ── Step 2 ── */}
            {ssprStep === 2 && (
              <div className="space-y-4">
                <div className="bg-zinc-950/80 border border-white/5 rounded-xl p-4 text-center space-y-2">
                  <Mail className="w-8 h-8 text-brand-yellow mx-auto animate-bounce mt-1" />
                  <p className="text-xs font-bold text-white">Check Your Inbox</p>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    A 6-digit code was sent to{" "}
                    <span className="text-brand-yellow font-bold font-mono">{ssprEmail}</span>.
                    {" "}It expires in 10 minutes.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-full bg-zinc-950 border border-brand-yellow/35 rounded-xl py-3.5 text-center text-brand-yellow font-mono text-sm tracking-[0.6em] font-black focus:outline-none focus:border-brand-yellow"
                  />
                </div>

                {/* Resend code row */}
                <div className="text-center">
                  {resendCountdown > 0 ? (
                    <p className="text-[10px] text-zinc-500 font-mono">
                      Resend available in{" "}
                      <span className="text-brand-yellow font-black tabular-nums">{resendCountdown}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      disabled={ssprLoading}
                      onClick={handleResend}
                      className="text-[10px] font-black uppercase tracking-wider text-zinc-400 hover:text-brand-yellow disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1 mx-auto"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Resend Code
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setSsprStep(1); setEnteredCode(""); setSsprMsg({ type: "", text: "" }); }}
                    className="bg-neutral-900 hover:bg-neutral-800 border border-white/5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-400 transition-all cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={enteredCode.length !== 6 || ssprLoading}
                    onClick={handleStep2}
                    className="bg-brand-yellow hover:bg-yellow-500 disabled:opacity-45 text-black py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1 shadow-lg shadow-brand-yellow/10"
                  >
                    {ssprLoading
                      ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      : <><CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" /><span>Verify Code</span></>}
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 3 ── */}
            {ssprStep === 3 && (
              <form onSubmit={handleStep3} className="space-y-4">
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
                        className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl pl-10 pr-4 py-3.5 text-xs text-white focus:outline-none focus:border-brand-yellow"
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
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type new password"
                        className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl pl-10 pr-4 py-3.5 text-xs text-white focus:outline-none focus:border-brand-yellow"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={ssprLoading}
                  className="w-full bg-brand-yellow hover:bg-yellow-500 disabled:opacity-50 text-black font-black uppercase tracking-widest text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 shadow-lg shadow-brand-yellow/10"
                >
                  {ssprLoading
                    ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span>Saving…</span></>
                    : <><Key className="w-3.5 h-3.5" /><span>Save & Return to Login</span></>}
                </button>
              </form>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={exitSspr}
                className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-brand-yellow transition-colors cursor-pointer"
              >
                Cancel & Return to Login
              </button>
            </div>
          </div>

        ) : (

          /* ── LOGIN FORM ───────────────────────────────────────────────── */
          <form onSubmit={handleLogin} className="space-y-5">
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

            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Administrative Password
                </label>
                <button
                  type="button"
                  onClick={enterSspr}
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

            {loginError && (
              <div className="bg-brand-red/10 border border-brand-red/25 rounded-xl px-4 py-3 text-xs text-brand-red font-medium text-center animate-pulse">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-brand-red hover:bg-red-600 disabled:opacity-50 text-white font-black uppercase tracking-widest text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 shadow-lg shadow-brand-red/20 mt-2"
            >
              {isLoggingIn
                ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span>Authenticating…</span></>
                : <><Sparkles className="w-3.5 h-3.5" /><span>Access Admin Portal</span><ArrowRight className="w-3.5 h-3.5" /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
