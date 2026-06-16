import { useState, useEffect, useRef } from "react";
import { MenuItem, Category } from "../types";
import { CATEGORIES } from "../menuData";
import { ChevronDown, Heart, Star, Compass, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MenuViewProps {
  menuItems: MenuItem[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectItem: (item: MenuItem) => void;
}

// Map of category descriptions/sub-headings for a premium aesthetic
const CATEGORY_SUBHEADINGS: Record<string, string> = {
  "Pizza": "Wood-Fired Classics",
  "Burgers": "Handcrafted Favorites",
  "Wraps": "Fresh & Rolled Wraps",
  "Crispy Chicken": "Southern Style Golden Crunch",
  "Salads": "Refreshing Garden Plates",
  "Special Fries": "Crispy Loaded Hot Sides",
  "Drinks": "Premium Refreshing Elixirs"
};

export default function MenuView({
  menuItems,
  favorites,
  onToggleFavorite,
  onSelectItem
}: MenuViewProps) {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("Burgers");
  
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Use Intersection Observer to detect which category header/section is currently in view
  useEffect(() => {
    const observerOptions = {
      root: containerRef.current,
      rootMargin: "-20% 0px -60% 0px", // Trigger when the section is near the upper third of the viewport
      threshold: 0
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const categoryId = entry.target.getAttribute("data-category-id");
          if (categoryId) {
            setActiveCategory(categoryId);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    // Observe each category block
    CATEGORIES.forEach((cat) => {
      const el = sectionRefs.current[cat.id];
      if (el) observer.observe(el);
    });
    const favEl = sectionRefs.current["Favorites"];
    if (favEl) observer.observe(favEl);

    return () => {
      observer.disconnect();
    };
  }, [menuItems]);

  const handleCategorySelect = (categoryId: string) => {
    const element = sectionRefs.current[categoryId];
    if (element && containerRef.current) {
      const container = containerRef.current;
      const containerTop = container.getBoundingClientRect().top;
      const elementTop = element.getBoundingClientRect().top;
      const scrollOffset = elementTop - containerTop;
      
      container.scrollTo({
        top: container.scrollTop + scrollOffset - 6,
        behavior: "smooth"
      });
      setActiveCategory(categoryId);
    }
    setIsSelectorOpen(false);
  };

  // Group all items by their category
  const groupedItems = CATEGORIES.reduce<Record<string, MenuItem[]>>((acc, cat) => {
    acc[cat.id] = menuItems.filter((item) => item.category === cat.id);
    return acc;
  }, {});

  // Add favorites if there are any
  const favoriteItems = menuItems.filter((i) => favorites.includes(i.id));

  return (
    <div className="w-full h-full flex flex-col relative select-none bg-black">
      
      {/* 1. STICKY TOP CONTROLLER (Menu Title + Compact Category Selector) */}
      <div className="px-5 pt-5 pb-3 border-b border-white/[0.04] bg-neutral-950/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-black tracking-tight text-white uppercase font-sans">
            Menu
          </h2>
          <p className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-wide">
            Select a flavor profile
          </p>
        </div>

        {/* Widescreen Horizontal Pill List - Visible on md and up */}
        <div className="hidden md:flex flex-wrap items-center gap-1.5 max-w-full px-1 justify-end">
          {CATEGORIES.map((cat) => {
            const isSel = activeCategory === cat.id;
            const count = groupedItems[cat.id]?.length || 0;
            if (count === 0) return null;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  isSel 
                    ? "bg-brand-yellow text-black shadow-md shadow-brand-yellow/15 scale-105" 
                    : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
          {favoriteItems.length > 0 && (
            <button
              onClick={() => handleCategorySelect("Favorites")}
              className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                activeCategory === "Favorites"
                  ? "bg-brand-red text-white shadow-md shadow-brand-red/15 scale-105"
                  : "bg-brand-red/10 border border-brand-red/20 text-brand-red hover:bg-brand-red/20"
              }`}
            >
              <Heart className="w-3 h-3 fill-current" />
              <span>Saved</span>
            </button>
          )}
        </div>

        {/* Compact dropdown trigger selector - Visible only on mobile < md */}
        <div className="md:hidden">
          <button
            onClick={() => setIsSelectorOpen(!isSelectorOpen)}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] rounded-full px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all cursor-pointer active:scale-95"
            id="category_selector_button"
          >
            <span className="text-[10px] tracking-wider text-brand-yellow font-black uppercase">
              {activeCategory}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Floating Subtle Category Indicator at top-right of scrollable area */}
      <div className="absolute top-18 right-5 z-20 pointer-events-none transition-all duration-300">
        <div className="border border-white/10 bg-black/85 text-brand-yellow font-mono px-3 py-1 text-[9px] tracking-[0.2em] uppercase rounded-md shadow-lg backdrop-blur-md flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-ping" />
          <span>{activeCategory}</span>
        </div>
      </div>

      {/* 2. MAIN SCROLL CONTAINER */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-4 scrollbar-none space-y-10 pb-28 scroll-smooth"
        id="menu_scroll_container"
      >
        {/* Render grouped sections */}
        {CATEGORIES.map((cat) => {
          const items = groupedItems[cat.id] || [];
          if (items.length === 0) return null;

          return (
            <div
              key={cat.id}
              data-category-id={cat.id}
              ref={(el) => {
                sectionRefs.current[cat.id] = el;
              }}
              className="space-y-4 scroll-mt-2"
            >
              {/* Premium Handcrafted Restaurant Menu Header */}
              <div className="text-center py-5 select-none relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center opacity-5">
                  <span className="text-6xl font-black uppercase tracking-widest text-white select-none whitespace-nowrap">
                    {cat.id}
                  </span>
                </div>
                
                {/* Decorative borders reminiscent of a premium wood-fired steakhouse */}
                <div className="flex items-center justify-center gap-3">
                  <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-brand-yellow/60" />
                  <span className="text-brand-yellow text-xs font-black tracking-[0.25em] uppercase font-mono">
                    ★ {cat.id} ★
                  </span>
                  <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-brand-yellow/60" />
                </div>
                
                <h3 className="text-2xl font-black text-white tracking-tight leading-none mt-1.5 uppercase font-sans">
                  {cat.id}
                </h3>
                
                <p className="text-[10px] text-zinc-400 font-medium tracking-wide mt-1 italic font-serif">
                  {CATEGORY_SUBHEADINGS[cat.id] || "Fresh Culinary Creation"}
                </p>
                
                <div className="w-12 h-[2px] bg-brand-red mx-auto mt-3.5 rounded-full shadow-sm" />
              </div>

              {/* Grid of Image-First Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {items.map((item) => {
                  const isFav = favorites.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectItem(item)}
                      className="bg-zinc-950/70 border border-white/[0.04] hover:border-brand-yellow/35 rounded-2xl p-2.5 flex flex-col justify-between gap-3 transition-all duration-300 cursor-pointer group hover:bg-zinc-900/60 shadow-lg relative"
                    >
                      {/* Image - Fully Dominant First Visual Asset */}
                      <div className="h-24 sm:h-28 w-full rounded-xl overflow-hidden relative shadow-inner">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-505"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                        {/* Top rating */}
                        <span className="absolute bottom-2 right-2 text-[8px] bg-black/70 text-brand-yellow font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-white/5">
                          ★ {item.rating || "4.8"}
                        </span>
                      </div>

                      {/* Content Stack */}
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white tracking-tight line-clamp-1 group-hover:text-brand-yellow group-hover:underline transition-all">
                          {item.name}
                        </h4>
                        <p className="text-[9.5px] text-zinc-400 line-clamp-2 leading-relaxed h-[28px] overflow-hidden">
                          {item.description}
                        </p>
                      </div>

                      {/* Pricing and secondary CTA */}
                      <div className="pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-extrabold text-brand-yellow mt-1">
                        <span>{item.price.toFixed(2)} Br</span>
                        <span className="text-[8px] text-white/50 bg-white/[0.06] hover:bg-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold transition-colors">
                          Secrets ➔
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Optional Section: Favorites if any item exists designated by the user */}
        {favoriteItems.length > 0 && (
          <div
            data-category-id="Favorites"
            ref={(el) => {
              sectionRefs.current["Favorites"] = el;
            }}
            className="space-y-4 scroll-mt-2 pt-4"
          >
            <div className="text-center py-5 select-none relative overflow-hidden">
              <div className="flex items-center justify-center gap-3">
                <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-brand-red/60" />
                <span className="text-brand-red text-xs font-black tracking-[0.25em] uppercase font-mono">
                  ★ SAVED COUTURE ★
                </span>
                <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-brand-red/60" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight leading-none mt-1.5 uppercase">
                My Favorites
              </h3>
              <p className="text-[10px] text-zinc-400 font-medium tracking-wide mt-1 italic font-serif">
                Your custom selection of exquisite plates
              </p>
              <div className="w-12 h-[2px] bg-brand-yellow mx-auto mt-3.5 rounded-full" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {favoriteItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="bg-zinc-950/70 border border-white/[0.04] hover:border-brand-yellow/35 rounded-2xl p-2.5 flex flex-col justify-between gap-3 transition-all duration-300 cursor-pointer group hover:bg-zinc-900/60 shadow-lg relative"
                >
                  <div className="h-24 sm:h-28 w-full rounded-xl overflow-hidden relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-505"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                    
                    <span className="absolute bottom-2 right-2 text-[8px] bg-black/70 text-brand-yellow font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-white/5">
                      ★ {item.rating || "4.8"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white tracking-tight line-clamp-1 group-hover:text-brand-yellow group-hover:underline transition-all">
                      {item.name}
                    </h4>
                    <p className="text-[9.5px] text-zinc-400 line-clamp-2 leading-relaxed h-[28px] overflow-hidden">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-extrabold text-brand-yellow mt-1">
                    <span>{item.price.toFixed(2)} Br</span>
                    <span className="text-[8px] text-white/50 bg-white/[0.06] hover:bg-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold transition-colors">
                      Secrets ➔
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. BOTTOM SHEET MODAL (Framer Motion Drawer) */}
      <AnimatePresence>
        {isSelectorOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSelectorOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Bottom Drawer Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute bottom-0 left-0 right-0 max-h-[80%] bg-zinc-950 border-t border-white/10 rounded-t-[28px] overflow-hidden z-50 flex flex-col shadow-2xl"
              id="category_bottom_drawer"
            >
              <div className="w-12 h-1 bg-white/15 mx-auto my-3 rounded-full shrink-0" />
              
              <div className="px-5 pb-2 text-center shrink-0">
                <span className="text-[9px] text-brand-yellow font-black uppercase tracking-[0.2em]">Select Category</span>
                <h4 className="text-sm font-black text-white mt-1 uppercase">Browse Chef Collections</h4>
              </div>

              {/* Scrollable list of categories */}
              <div className="overflow-y-auto px-4 py-2 space-y-1 pb-6 max-h-[300px]">
                {CATEGORIES.map((cat) => {
                  const isSel = activeCategory === cat.id;
                  const count = groupedItems[cat.id]?.length || 0;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all text-xs font-bold ${
                        isSel 
                          ? "bg-brand-yellow text-black font-black shadow-lg shadow-brand-yellow/10" 
                          : "text-zinc-300 hover:bg-white/[0.03]"
                      }`}
                    >
                      <span className="uppercase tracking-wider">{cat.label}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${isSel ? "bg-black/10 text-black" : "bg-white/5 text-zinc-500"}`}>
                        {count} plates
                      </span>
                    </button>
                  );
                })}

                {favoriteItems.length > 0 && (
                  <button
                    onClick={() => handleCategorySelect("Favorites")}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all text-xs font-bold mt-1 ${
                      activeCategory === "Favorites"
                        ? "bg-brand-red text-white font-black shadow-lg shadow-brand-red/15"
                        : "text-brand-red border border-brand-red/20 bg-brand-red/5 hover:bg-brand-red/10"
                    }`}
                  >
                    <span className="uppercase tracking-wider flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>My Favorites</span>
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${activeCategory === "Favorites" ? "bg-white/25 text-white" : "bg-brand-red/10 text-brand-red"}`}>
                      {favoriteItems.length} plates
                    </span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
