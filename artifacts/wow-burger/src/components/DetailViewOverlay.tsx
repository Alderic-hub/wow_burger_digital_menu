import { MouseEvent, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Clock, Flame, Star, CheckCircle, Heart, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [activeImgIndex, setActiveImgIndex] = useState(0);

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

  const carouselImages = [item.image, ...(item.images || [])].filter(Boolean);

  const handlePrevImage = (e: MouseEvent) => {
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e: MouseEvent) => {
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 md:p-6 lg:p-8 bg-black/85 backdrop-blur-md">
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
          className="relative w-full max-w-md md:max-w-2xl lg:max-w-4xl glass-overlay rounded-3xl overflow-y-auto shadow-[0_20px_60px_rgba(255,193,7,0.18)] border border-white/10 max-h-[90vh] md:max-h-[85vh] block z-10 transition-all duration-300 scrollbar-none"
          id="item_detail_modal"
        >
          {/* Header Food Image Cover / Carousel */}
          <div className="relative h-48 md:h-64 lg:h-80 w-full shrink-0 overflow-hidden rounded-t-[22px] bg-zinc-900 transition-all duration-300">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImgIndex}
                src={carouselImages[activeImgIndex]}
                alt={`${item.name} image index ${activeImgIndex}`}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>
            
            {/* Dark mask overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />

            {/* Carousel Navigation Buttons */}
            {carouselImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white hover:bg-black/95 hover:scale-105 active:scale-95 transition-all z-20 cursor-pointer"
                  title="Previous Image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white hover:bg-black/95 hover:scale-105 active:scale-95 transition-all z-20 cursor-pointer"
                  title="Next Image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Dot Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 pointer-events-none bg-black/40 px-2.5 py-1 rounded-full border border-white/5">
                  {carouselImages.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === activeImgIndex ? "w-4 bg-brand-yellow" : "w-1.5 bg-white/45"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Popular Badge */}
            {item.isPopular && (
              <span className="absolute top-4 left-4 bg-brand-red text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-[0_4px_12px_rgba(230,30,42,0.6)]">
                ★ Best Seller
              </span>
            )}

            {/* Action Buttons: Close */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
              {/* Close Floating Button */}
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-black/75 border border-white/20 flex items-center justify-center text-white hover:text-brand-yellow hover:scale-105 active:scale-95 transition-all duration-300 shadow-md cursor-pointer"
                title="Close Details"
                id="btn_close_details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Premium Body Content Scrollable Area */}
          <div className="p-6 md:p-8 lg:p-10 space-y-6 md:space-y-8 transition-all duration-300">
            {/* Title and Pricing */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-white/[0.04]">
              <div className="space-y-2">
                <span className="text-xs md:text-sm font-semibold text-brand-yellow uppercase tracking-wider bg-brand-yellow/10 px-2.5 py-1 rounded">
                  {item.category}
                </span>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight uppercase tracking-tight">
                  {item.name}
                </h2>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <p className="text-2xl md:text-3.5xl lg:text-4xl font-extrabold text-brand-yellow tracking-tight">
                  {item.price.toFixed(2)}
                  <span className="text-xs md:text-sm text-white/75 font-semibold ml-1">Birr</span>
                </p>
                <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">Price incl. VAT</p>
              </div>
            </div>

            {/* Preparation Details, Rating and Calories list */}
            <div className="grid grid-cols-3 gap-3 md:gap-5">
              <div className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl p-2.5 md:p-4 flex flex-col items-center justify-center text-center transition-colors">
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-brand-yellow mb-1" />
                <span className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider">Prep Time</span>
                <span className="text-xs md:text-sm font-bold text-white mt-0.5">{item.prepTime || "12-15 min"}</span>
              </div>
              
              <div className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl p-2.5 md:p-4 flex flex-col items-center justify-center text-center transition-colors">
                <Flame className="w-4 h-4 md:w-5 md:h-5 text-brand-red mb-1" />
                <span className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider">Calories</span>
                <span className="text-xs md:text-sm font-bold text-white mt-0.5">{item.calories || "420 kcal"}</span>
              </div>

              <div className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl p-2.5 md:p-4 flex flex-col items-center justify-center text-center transition-colors">
                <Star className="w-4 h-4 md:w-5 md:h-5 text-brand-yellow mb-1 fill-current" />
                <span className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider">Rating</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs md:text-sm font-bold text-white">{item.rating || "4.8"}</span>
                  <span className="text-xs text-white font-bold lowercase">stars</span>
                </div>
              </div>
            </div>

            {/* Description & Ingredients Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pt-2">
              {/* Description */}
              <div className="lg:col-span-7 space-y-2.5">
                <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-white/50">Chef's Culinary Story</h3>
                <p className="text-[13px] md:text-sm lg:text-base text-gray-300 leading-relaxed font-body font-light">
                  {item.description}
                </p>
              </div>

              {/* Ingredients Section */}
              <div className="lg:col-span-5 space-y-2.5">
                <h3 className="text-xs md:text-sm font-bold uppercase tracking-wider text-white/50">Ingredients List</h3>
                <div className="flex flex-wrap gap-2">
                  {ingredientList.map((ingredient, idx) => (
                    <span
                      key={idx}
                      className="flex items-center gap-1.5 text-xs md:text-sm text-white/90 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl shadow-sm hover:border-brand-yellow/30 transition-all duration-300"
                    >
                      <CheckCircle className="w-3 h-3 text-brand-yellow shrink-0" />
                      <span>{ingredient}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
