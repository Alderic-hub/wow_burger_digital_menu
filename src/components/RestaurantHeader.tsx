import { Info, ArrowLeft } from "lucide-react";
// @ts-ignore
import wowBurgerLogo from "../assets/images/wow_burger_logo_1781154696795.png";

interface RestaurantHeaderProps {
  currentPage: "menu" | "info";
  onInfoClick: () => void;
  onBackClick: () => void;
}

export default function RestaurantHeader({ currentPage, onInfoClick, onBackClick }: RestaurantHeaderProps) {
  return (
    <header className="w-full z-30 px-4 py-3 bg-zinc-950 border-b border-white/[0.08] flex items-center justify-between shrink-0 select-none">
      {/* WOW Burger Branding Left side */}
      <div className="flex items-center gap-2.5">
        <div className="w-8.5 h-8.5 rounded-full overflow-hidden border border-brand-yellow shadow-[0_0_12px_rgba(255,193,7,0.25)]">
          <img 
            src={wowBurgerLogo} 
            alt="WOW Burger Logo" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xs font-black tracking-widest text-white leading-tight uppercase">
            WOW <span className="text-brand-yellow">BURGER</span>
          </h1>
          <span className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider">Bole Branch</span>
        </div>
      </div>

      {/* Right Side Navigation Action Button */}
      {currentPage === "menu" ? (
        <button
          onClick={onInfoClick}
          className="w-9 h-9 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-brand-yellow hover:bg-zinc-800 transition-all cursor-pointer active:scale-90"
          title="Restaurant Info"
          id="info_trigger_btn"
        >
          <Info className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={onBackClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/5 hover:bg-zinc-850 hover:text-brand-yellow text-zinc-350 transition-all cursor-pointer active:scale-90 text-[11px] font-bold tracking-wider uppercase font-mono"
          title="Return to Menu"
          id="info_back_btn"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-brand-yellow" />
          <span>Back</span>
        </button>
      )}
    </header>
  );
}

