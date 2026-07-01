import { useState } from "react";
import { BankAccount } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Landmark, Copy, Check, QrCode, AlertCircle, Sparkles, ShieldCheck, HelpCircle } from "lucide-react";

interface BankLogoProps {
  logoUrl?: string;
  bankName: string;
}

function BankLogo({ logoUrl, bankName }: BankLogoProps) {
  const [imageError, setImageError] = useState(false);

  // Derive initials
  const initials = bankName
    .replace(/\(.*?\)/g, "") // Remove parenthesis details like (CBE)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0])
    .join("")
    .toUpperCase();

  // Determine colors based on bank name if no image loaded
  let avatarBg = "bg-zinc-900 border-zinc-800 text-zinc-400";
  const nameLower = bankName.toLowerCase();
  
  if (nameLower.includes("commercial bank of ethiopia") || nameLower.includes("cbe")) {
    avatarBg = "bg-[#41207d] border-[#552e9a] text-yellow-400";
  } else if (nameLower.includes("telebirr")) {
    avatarBg = "bg-[#115e59] border-[#0d9488] text-white"; // teal shades
  } else if (nameLower.includes("awash")) {
    avatarBg = "bg-blue-900 border-blue-800 text-white";
  } else if (nameLower.includes("dashen")) {
    avatarBg = "bg-red-950 border-red-800 text-yellow-500";
  }

  if (logoUrl && !imageError) {
    return (
      <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center p-1 relative overflow-hidden shrink-0 shadow-lg group-hover:border-brand-yellow/30 transition-all">
        <img
          src={logoUrl}
          alt={`${bankName} Logo`}
          className="w-full h-full object-contain rounded-lg"
          onError={() => setImageError(true)}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-xs font-black tracking-widest shrink-0 shadow-md ${avatarBg}`}>
      {initials || "BK"}
    </div>
  );
}

interface PaymentViewProps {
  isVisible: boolean;
  bankAccounts?: BankAccount[];
}

export default function PaymentView({ isVisible, bankAccounts = [] }: PaymentViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedQrId, setExpandedQrId] = useState<string | null>(null);

  if (!isVisible) return null;

  const activeAccounts = bankAccounts.filter(b => b.isActive);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const toggleQr = (id: string) => {
    setExpandedQrId(expandedQrId === id ? null : id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="absolute inset-0 bg-neutral-950 flex flex-col overflow-y-auto scrollbar-none z-20 pb-20 select-none"
      id="restaurant_payment_page"
    >
      {/* 1. HERO BANNER WITH EMBEDDED PATTERNS */}
      <div className="relative h-44 sm:h-48 w-full shrink-0 bg-gradient-to-br from-zinc-900 to-black border-b border-white/[0.06] flex items-center p-6 sm:p-8 overflow-hidden">
        {/* Abstract design elements */}
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-brand-yellow/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-10 w-32 h-32 bg-brand-red/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-yellow/10 border border-brand-yellow/20 flex items-center justify-center text-brand-yellow shadow-lg shadow-brand-yellow/5">
            <Landmark className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-brand-yellow animate-pulse" />
              <span className="text-[10px] text-zinc-400 font-extrabold tracking-widest uppercase">Verified Payment Options</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase mt-0.5">
              Bank Transfers
            </h2>
          </div>
        </div>
      </div>

      {/* 2. CORE PAYMENT ACCOUNTS CONTAINER */}
      <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:space-y-0">
        
        {/* Left Side: Account instructions and info cards */}
        <div className="space-y-6">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 pl-1">
              <ShieldCheck className="w-4 h-4 text-brand-yellow" />
              <h3 className="text-xs font-black tracking-widest text-white uppercase font-mono">
                Payment Guidelines
              </h3>
            </div>
            <div className="bg-gradient-to-br from-zinc-950 to-neutral-900 border border-white/[0.04] rounded-2xl p-5 space-y-4 shadow-xl">
              <p className="text-xs text-zinc-350 leading-relaxed font-light">
                Follow these quick steps to make a transfer:
              </p>
              
              <ul className="space-y-3.5 text-xs text-zinc-300 font-light">
                <li className="flex gap-2.5">
                  <span className="font-mono text-brand-yellow font-black">01.</span>
                  <span>Tap an account number to copy it.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="font-mono text-brand-yellow font-black">02.</span>
                  <span>Transfer via your banking app or USSD menu.</span>
                </li>
                <li className="flex gap-2.5">
                  <span className="font-mono text-brand-yellow font-black">03.</span>
                  <span>Keep a screenshot of the receipt for cashier verification.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Side: Active Bank/Wallet Cards list and Support Card */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pl-1">
              <Landmark className="w-4 h-4 text-brand-yellow" />
              <h3 className="text-xs font-black tracking-widest text-white uppercase font-mono">
                Available Accounts
              </h3>
            </div>

            {activeAccounts.length === 0 ? (
              <div className="bg-zinc-950 border border-white/[0.04] rounded-2xl p-8 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-zinc-600 mx-auto" strokeWidth={1.5} />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">No Transfer Accounts Listed</h4>
                <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                  Payment options are currently offline for maintenance. Please settle your bill with cash or physical POS terminal.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {activeAccounts.map((bank) => {
                  const isCopied = copiedId === bank.id;
                  const isQrExpanded = expandedQrId === bank.id;

                  return (
                    <div
                      key={bank.id}
                      className="bg-zinc-950/90 border border-white/[0.05] rounded-2xl p-4.5 space-y-4.5 hover:border-brand-yellow/20 transition-all shadow-md relative overflow-hidden group"
                    >
                      {/* Corner decorative light effect */}
                      <div className="absolute top-0 right-0 w-16 h-16 bg-brand-yellow/[0.02] rounded-full blur-xl pointer-events-none" />

                      <div className="flex gap-4 items-center">
                        <BankLogo logoUrl={bank.logoUrl} bankName={bank.bankName} />
                        <div className="space-y-1 flex-1 min-w-0">
                          <span className="text-[9.5px] font-black uppercase tracking-widest text-brand-yellow block truncate">
                            {bank.bankName}
                          </span>

                          <div className="flex items-center gap-2 mt-0.5">
                            <button
                              onClick={() => handleCopy(bank.id, bank.accountNumber)}
                              className="group/btn flex items-center gap-2 focus:outline-none text-left cursor-pointer transition-all max-w-full"
                              title="Click to copy account number"
                            >
                              <span className="text-lg font-mono font-black text-white group-hover/btn:text-brand-yellow tracking-widest break-all">
                                {bank.accountNumber}
                              </span>
                              <div className="p-1 rounded bg-zinc-900 border border-white/5 text-zinc-500 group-hover/btn:text-white group-hover/btn:bg-zinc-800 transition-all inline-flex shrink-0">
                                {isCopied ? (
                                  <Check className="w-3.5 h-3.5 text-green-400 stroke-[3]" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </div>
                            </button>
                          </div>

                          {bank.accountHolder && (
                            <p className="text-[9.5px] text-zinc-500 font-bold uppercase tracking-wider mt-1">
                              Holder: <span className="text-zinc-300 font-extrabold">{bank.accountHolder}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* QR Code trigger rendering if URL has value */}
                      {bank.qrCodeUrl && (
                        <div className="border-t border-white/[0.04] pt-3.5 mt-2">
                          <button
                            onClick={() => toggleQr(bank.id)}
                            className={`w-full flex items-center justify-between text-[10px] font-black uppercase tracking-wider py-2.5 px-3 rounded-xl border transition-all cursor-pointer ${
                              isQrExpanded 
                                ? "bg-brand-yellow text-black border-brand-yellow" 
                                : "bg-black/40 text-zinc-400 border-white/5 hover:border-brand-yellow/20 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <QrCode className="w-4 h-4" />
                              <span>Scan Payment QR Code</span>
                            </div>
                            <span className="text-[9px] font-mono leading-none">{isQrExpanded ? "▲ CLOSE" : "▼ OPEN"}</span>
                          </button>

                          <AnimatePresence>
                            {isQrExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="pt-3.5 p-4 bg-black/60 rounded-xl border border-white/[0.04] flex flex-col items-center justify-center space-y-2 mt-2">
                                  <div className="p-2.5 bg-white rounded-xl max-w-[160px] aspect-square overflow-hidden shadow-2xl">
                                    <img
                                      src={bank.qrCodeUrl}
                                      alt={`${bank.bankName} QR scan info`}
                                      className="w-full h-full object-contain"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  <span className="text-[8.5px] text-zinc-500 font-black uppercase tracking-wider text-center mt-1">
                                    Scan using your mobile banking application scanner
                                  </span>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Need Support section placed directly under accounts */}
          <div className="space-y-2.5 pt-4 border-t border-white/[0.03]">
            <div className="flex items-center gap-2 pl-1">
              <HelpCircle className="w-4 h-4 text-zinc-400" />
              <h3 className="text-xs font-black tracking-widest text-zinc-400 uppercase font-mono">
                Need Support?
              </h3>
            </div>
            <div className="bg-zinc-950 border border-white/[0.02] rounded-2xl p-4.5 text-[11px] text-zinc-500 leading-relaxed font-light">
              Our payments synchronization operates directly with central banking registers. If you encounter any problems confirming your receipt or if you need an official printed VAT invoice, please speak to your delivery rider or a service cashier at our counter.
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
