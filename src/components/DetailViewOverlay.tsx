import { MouseEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Clock, Flame, Star, CheckCircle, Heart } from "lucide-react";
import { MenuItem } from "../types";

interface DetailViewOverlayProps {
  item: MenuItem | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export default function DetailViewOverlay({
  item,
  onClose,
  isFavorite,
  onToggleFavorite
}: DetailViewOverlayProps) {
  if (!item) return null;

  // Split comma-separated ingredients into standard list
  const ingredientList = item.ingredients
    ? item.ingredients.split(",").map((ing) => ing.trim())
    : [];

  // Handle keypress escape to close
  const handleOverlayClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4 bg-black/80 backdrop-blur-md">
        {/* Animated Background Backdrop click filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
          className="absolute inset-0 cursor-pointer"
        />

        {/* Sliding detail content panel */}
        <motion.div
          initial={{ y: "100%", opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0.5 }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className="relative w-full max-w-md glass-overlay rounded-3xl overflow-hidden shadow-[0_-20px_50px_rgba(255,193,7,0.15)] border border-white/10 max-h-[85vh] flex flex-col z-10"
          id="item_detail_modal"
        >
          {/* Header Food Image Cover */}
          <div className="relative h-48 w-full shrink-0">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Dark mask overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            {/* Popular Badge */}
            {item.isPopular && (
              <span className="absolute top-4 left-4 bg-brand-red text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-[0_4px_10px_rgba(230,30,42,0.5)]">
                ★ Best Seller
              </span>
            )}

            {/* Action Buttons: Favorite and Close */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {/* Favorite Toggle Button */}
              <button
                onClick={() => onToggleFavorite(item.id)}
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-300 shadow-md cursor-pointer ${
                  isFavorite
                    ? "bg-brand-red border-brand-red text-white scale-110 shadow-[0_4px_12px_rgba(230,30,42,0.4)]"
                    : "bg-black/70 border-white/20 text-white hover:text-brand-red"
                }`}
                title="Favorite"
              >
                <Heart className={`w-[18px] h-[18px] ${isFavorite ? "fill-current" : ""}`} />
              </button>

              {/* Close Floating Button */}
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white hover:text-brand-yellow hover:scale-105 active:scale-95 transition-all duration-300 shadow-md cursor-pointer"
                title="Close Details"
                id="btn_close_details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Premium Body Content Scrollable Area */}
          <div className="p-6 overflow-y-auto space-y-5 scrollbar-none flex-1">
            {/* Title and Pricing */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-brand-yellow uppercase tracking-wider bg-brand-yellow/10 px-2 py-0.5 rounded">
                  {item.category}
                </span>
                <h2 className="text-2xl font-bold text-white mt-1.5 leading-snug">
                  {item.name}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold text-brand-yellow tracking-tight">
                  {item.price.toFixed(2)}
                  <span className="text-xs text-white/75 font-semibold ml-1">Birr</span>
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">Price incl. VAT</p>
              </div>
            </div>

            {/* Preparation Details, Rating and Calories list */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-2.5 flex flex-col items-center justify-center text-center">
                <Clock className="w-4 h-4 text-brand-yellow mb-1" />
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Prep Time</span>
                <span className="text-xs font-bold text-white mt-0.5">{item.prepTime || "12-15 min"}</span>
              </div>
              
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-2.5 flex flex-col items-center justify-center text-center">
                <Flame className="w-4 h-4 text-brand-red mb-1" />
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Calories</span>
                <span className="text-xs font-bold text-white mt-0.5">{item.calories || "420 kcal"}</span>
              </div>

              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-2.5 flex flex-col items-center justify-center text-center">
                <div className="flex items-center text-brand-yellow mb-1 gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-xs font-bold text-white ml-0.5">{item.rating || "4.8"}</span>
                </div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Rating</span>
                <span className="text-xs font-bold text-white mt-0.5">WOW Approved</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">Chef's Description</h3>
              <p className="text-[13px] text-gray-300 leading-relaxed font-body font-light">
                {item.description}
              </p>
            </div>

            {/* Ingredients Section */}
            <div className="space-y-2 pb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">Ingredients List</h3>
              <div className="flex flex-wrap gap-2">
                {ingredientList.map((ingredient, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1.5 text-xs text-white/90 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full shadow-sm"
                  >
                    <CheckCircle className="w-3 h-3 text-brand-yellow" />
                    <span>{ingredient}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
