import { useState, useEffect, useRef } from "react";
import { MenuItem, Category, RestaurantInfo } from "../types";
import { ChevronDown, Heart, Star, Compass, AlertCircle, Clock, MapPin, Phone, Mail, Menu as MenuIcon, X, Flame, ChefHat, Pizza, Cookie, CupSoda, GlassWater, Beef, UtensilsCrossed, Sandwich, Drumstick } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SUBCATEGORIES } from "../menuData";

interface MenuViewProps {
  menuItems: MenuItem[];
  categories: Category[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectItem: (item: MenuItem) => void;
  restaurantInfo?: RestaurantInfo | null;
  isCategorySelectorOpen?: boolean;
  onToggleCategorySelector?: (open: boolean) => void;
}

// Map of category descriptions/sub-headings for a premium aesthetic
const CATEGORY_SUBHEADINGS: Record<string, string> = {
  "Burger": "",
  "Chicken": "",
  "Wrap": "",
  "Sandwich": "",
  "Pizza": "",
  "Sides_Extras": "",
  "Drinks": "",
  "Sauces_Addons": ""
};

const getCategoryIcon = (id: string, className = "w-3.5 h-3.5") => {
  return null;
};

export default function MenuView({
  menuItems,
  categories,
  favorites,
  onToggleFavorite,
  onSelectItem,
  restaurantInfo,
  isCategorySelectorOpen,
  onToggleCategorySelector
}: MenuViewProps) {
  const [isSelectorOpenInternal, setIsSelectorOpenInternal] = useState(false);
  const isSelectorOpen = isCategorySelectorOpen !== undefined ? isCategorySelectorOpen : isSelectorOpenInternal;
  const setIsSelectorOpen = onToggleCategorySelector !== undefined ? onToggleCategorySelector : setIsSelectorOpenInternal;

  const [activeCategory, setActiveCategory] = useState<string>("Burger");
  
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
    categories.forEach((cat) => {
      const el = sectionRefs.current[cat.id];
      if (el) observer.observe(el);
    });
    const favEl = sectionRefs.current["Favorites"];
    if (favEl) observer.observe(favEl);
    const popEl = sectionRefs.current["Popular"];
    if (popEl) observer.observe(popEl);

    return () => {
      observer.disconnect();
    };
  }, [menuItems, categories]);

  const [isScrolledDown, setIsScrolledDown] = useState(false);

  // Monitor the scroll of the actual menu container in desktop mode
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let lastScrollTop = 0;
    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      
      const isProgrammatic = (window as any).__lastProgrammaticScrollTime && 
        (Date.now() - (window as any).__lastProgrammaticScrollTime < 1200);

      if (isProgrammatic) {
        lastScrollTop = scrollTop;
        return;
      }

      const isDesktopView = window.innerWidth >= 1024;
      if (isDesktopView) {
        if (scrollTop <= 10) {
          setIsScrolledDown(false);
        } else if (scrollTop > lastScrollTop && scrollTop > 60) {
          setIsScrolledDown(true);
        } else if (scrollTop < lastScrollTop) {
          setIsScrolledDown(false);
        }
      } else {
        setIsScrolledDown(false);
      }
      lastScrollTop = scrollTop;
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleCategorySelect = (categoryId: string) => {
    const element = sectionRefs.current[categoryId];
    // Mark programmatic scroll to prevent the header from hiding/showing on auto-scroll
    (window as any).__lastProgrammaticScrollTime = Date.now();
    if (element && containerRef.current) {
      const container = containerRef.current;
      const containerTop = container.getBoundingClientRect().top;
      const elementTop = element.getBoundingClientRect().top;
      const scrollOffset = elementTop - containerTop;
      
      container.scrollTo({
        top: container.scrollTop + scrollOffset - 62,
        behavior: "smooth"
      });
      setActiveCategory(categoryId);
    }
    setIsSelectorOpen(false);
  };

  // Group all items by their category
  const groupedItems = categories.reduce<Record<string, MenuItem[]>>((acc, cat) => {
    acc[cat.id] = menuItems.filter((item) => item.category === cat.id);
    return acc;
  }, {});

  // Add favorites if there are any
  const favoriteItems = menuItems.filter((i) => favorites.includes(i.id));
  const popularItemsCount = menuItems.filter((i) => i.isPopular).length;

  return (
    <div className="w-full h-full flex flex-col relative select-none bg-black">
      
      {/* 1. STICKY TOP CONTROLLER (Menu Title + Multi-size Category Triggers) */}
      <div className={`px-5 border-b border-white/[0.04] bg-neutral-950/90 backdrop-blur-md sticky top-0 z-30 flex flex-row lg:flex-col items-center lg:items-center justify-between lg:justify-center transition-all duration-300 shrink-0 ${
        isScrolledDown ? "py-2 lg:py-2.5 gap-1.5" : "py-4 lg:py-6 gap-3 lg:gap-5"
      }`}>
        <motion.div 
          animate={{
            height: isScrolledDown ? 0 : "auto",
            opacity: isScrolledDown ? 0 : 1,
            scale: isScrolledDown ? 0.95 : 1,
            marginBottom: isScrolledDown ? 0 : 4,
          }}
          transition={{
            type: "spring",
            damping: 24,
            stiffness: 220,
          }}
          className="flex flex-col lg:items-center lg:text-center text-left overflow-hidden origin-top"
        >
          <h2 className="text-xl lg:text-3.5xl font-black tracking-tight text-white uppercase font-sans">
            Menu
          </h2>
          <p className="text-[9px] lg:text-[10.5px] text-zinc-500 font-extrabold uppercase tracking-wide lg:tracking-[0.25em] mt-0.5 lg:mt-1.5">
            Select a flavor profile
          </p>
        </motion.div>

        {/* Dynamic Category Triggers based on viewports */}
        <div className="flex items-center justify-end lg:justify-center lg:w-full">
          {/* PHONE ONLY: dropdown-style selector button */}
          <div className="block md:hidden">
            <button
              onClick={() => setIsSelectorOpen(!isSelectorOpen)}
              className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-850 border border-white/[0.08] hover:border-brand-yellow/45 rounded-full px-4 py-2 text-xs font-bold text-white shadow-lg transition-all cursor-pointer active:scale-95 group"
              id="category_selector_button"
            >
              <span className="text-[11px] tracking-wider text-brand-yellow font-black uppercase">
                {activeCategory === "Favorites" 
                  ? "Saved Plates" 
                  : activeCategory === "Popular" 
                    ? "Most Popular" 
                    : (categories.find(c => c.id === activeCategory)?.label || activeCategory)}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-brand-yellow group-hover:translate-y-0.5 transition-transform stroke-[2.5]" />
            </button>
          </div>

          {/* TABLET ONLY: hamburger button */}
          <div className="hidden md:block lg:hidden">
            <button
              onClick={() => setIsSelectorOpen(!isSelectorOpen)}
              className="w-10 h-10 rounded-full bg-zinc-900 border border-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-brand-yellow hover:bg-zinc-850 transition-all cursor-pointer active:scale-90"
              title="Open Food Categories Sidebar"
              id="category_selector_hamburger"
            >
              <MenuIcon className="w-4.5 h-4.5 text-brand-yellow" />
            </button>
          </div>

          {/* DESKTOP ONLY: horizontal categories list below the titles */}
          <nav className="hidden lg:flex items-center justify-center gap-1.5 bg-zinc-900/45 p-1.5 rounded-2xl border border-white/[0.04] max-w-full overflow-x-auto scrollbar-none shadow-inner lg:mx-auto" id="desktop_categories_nav">
            {restaurantInfo?.showPopularSection !== false && popularItemsCount > 0 && (
              <button
                key="Popular"
                onClick={() => handleCategorySelect("Popular")}
                className={`relative px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap cursor-pointer z-10 flex items-center gap-2 group ${
                  activeCategory === "Popular"
                    ? "text-black"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  {getCategoryIcon("Popular", "w-3.5 h-3.5")}
                  <span>Most Popular</span>
                </span>
                {activeCategory === "Popular" && (
                  <motion.span
                    layoutId="activeCategoryPill"
                    className="absolute inset-0 bg-brand-yellow rounded-xl shadow-md shadow-brand-yellow/10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            )}

            {categories.map((cat) => {
              const isSel = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`relative px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap cursor-pointer z-10 flex items-center gap-2 group ${
                    isSel
                      ? "text-black"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    {getCategoryIcon(cat.id, "w-3.5 h-3.5")}
                    <span>{cat.label}</span>
                  </span>
                  {isSel && (
                    <motion.span
                      layoutId="activeCategoryPill"
                      className="absolute inset-0 bg-brand-yellow rounded-xl shadow-md shadow-brand-yellow/10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}

            {favoriteItems.length > 0 && (
              <button
                key="Favorites"
                onClick={() => handleCategorySelect("Favorites")}
                className={`relative px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer z-10 group ${
                  activeCategory === "Favorites"
                    ? "text-white"
                    : "text-brand-red hover:bg-brand-red/5"
                }`}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  {getCategoryIcon("Favorites", "w-3.5 h-3.5")}
                  <span>My Favorites</span>
                </span>
                {activeCategory === "Favorites" && (
                  <motion.span
                    layoutId="activeCategoryPill"
                    className="absolute inset-0 bg-brand-red rounded-xl shadow-md shadow-brand-red/20"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* 2. MAIN SCROLL CONTAINER */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto py-4 scrollbar-none space-y-6 pb-0 scroll-smooth"
        id="menu_scroll_container"
      >
        {/* Most Popular Curated Horizontal Slider */}
        {restaurantInfo?.showPopularSection !== false && menuItems.filter(i => i.isPopular).length > 0 && (
          <div
            data-category-id="Popular"
            ref={(el) => {
              sectionRefs.current["Popular"] = el;
            }}
            className="space-y-4 pt-1 pb-4 scroll-mt-4 px-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white tracking-tight leading-none uppercase">
                  Most Popular 🔥
                </h3>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Swipe left ➔</span>
            </div>
            <div className="flex overflow-x-auto gap-4 md:gap-6 py-2 px-1 scrollbar-none snap-x snap-mandatory">
              {menuItems.filter(i => i.isPopular).map((item) => (
                <div
                  key={`popular-${item.id}`}
                  onClick={() => onSelectItem(item)}
                  className="w-[280px] sm:w-[320px] md:w-[380px] lg:w-[440px] h-[185px] md:h-[224px] lg:h-[256px] shrink-0 bg-neutral-950/90 border border-white/[0.04] hover:border-brand-yellow/30 rounded-2xl p-2 md:p-3 flex flex-col justify-between transition-all duration-500 cursor-pointer snap-start relative group shadow-2xl backdrop-blur-md overflow-hidden"
                >
                  {/* Absolute Glow Background Accent */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand-yellow/5 rounded-full blur-2xl group-hover:bg-brand-yellow/10 transition-all duration-500 pointer-events-none" />

                  {/* Wide-oriented Immersive Image (dominates space) */}
                  <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      referrerPolicy="no-referrer"
                    />
                    {/* Deep gradient overlay to house the text details */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/40" />
                  </div>
                  
                  {/* Badge Overlay (Top Left, Black background, No Emoji) */}
                  <div className="z-10 flex items-start justify-start p-1">
                    <span className="text-[7.5px] md:text-[8.5px] bg-black border border-brand-yellow/30 text-brand-yellow font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-widest shadow-md flex items-center scale-95 group-hover:scale-100 transition-transform">
                      POPULAR
                    </span>
                  </div>

                  {/* Text Overlay inside image at the bottom */}
                  <div className="z-10 p-2 md:p-3.5 space-y-1 bg-gradient-to-t from-black/90 to-transparent pt-4 rounded-b-2xl">
                    <div className="flex items-center justify-between gap-2">
                       <h4 className="text-xs sm:text-sm md:text-base lg:text-lg font-black text-white tracking-tight line-clamp-1 group-hover:text-brand-yellow transition-colors uppercase">
                        {item.name}
                      </h4>
                      <span className="text-xs md:text-sm lg:text-base font-black text-brand-yellow shrink-0">{item.price.toFixed(2)} Br</span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[9.5px] sm:text-xs md:text-sm text-zinc-300 line-clamp-1 leading-none max-w-[70%]">
                        {item.description}
                      </p>
                      <span className="text-[7.5px] md:text-[8.5px] text-zinc-300 bg-white/[0.1] group-hover:bg-brand-yellow group-hover:text-black font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider transition-all duration-300">
                        Discover
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Render grouped sections */}
        {categories.map((cat) => {
          const items = groupedItems[cat.id] || [];
          if (items.length === 0) return null;

          return (
            <div
              key={cat.id}
              data-category-id={cat.id}
              ref={(el) => {
                sectionRefs.current[cat.id] = el;
              }}
              className="space-y-4 scroll-mt-2 px-4"
            >
              {/* Premium Handcrafted Restaurant Menu Header */}
              <div className="text-center py-5 select-none relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center opacity-5">
                  <span className="text-6xl font-black uppercase tracking-widest text-white select-none whitespace-nowrap">
                    {cat.label || cat.id}
                  </span>
                </div>
                
                {/* Decorative borders reminiscent of a premium wood-fired steakhouse */}
                <div className="flex items-center justify-center gap-3">
                  <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-brand-yellow/60" />
                  <span className="text-brand-yellow text-xs font-black tracking-[0.25em] uppercase font-mono">
                    ★ {cat.label || cat.id} ★
                  </span>
                  <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-brand-yellow/60" />
                </div>
                
                <h3 className="text-2xl font-black text-white tracking-tight leading-none mt-1.5 uppercase font-sans">
                  {cat.label || cat.id}
                </h3>
                
                {CATEGORY_SUBHEADINGS[cat.id] && (
                  <p className="text-[10px] text-zinc-400 font-medium tracking-wide mt-1 italic font-serif">
                    {CATEGORY_SUBHEADINGS[cat.id]}
                  </p>
                )}
                
                <div className="w-12 h-[2px] bg-brand-red mx-auto mt-3.5 rounded-full shadow-sm" />
              </div>

              {/* Grid of Image First beautifully scaled cards */}
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-x-[2px] lg:gap-y-6 xl:gap-x-[2px] xl:gap-y-8">
                {items.map((item) => {
                  const isFav = favorites.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectItem(item)}
                      className="bg-zinc-950/70 border border-white/[0.04] hover:border-brand-yellow/35 rounded-2xl p-2.5 md:p-4 lg:p-4.5 flex flex-col justify-between gap-3 md:gap-4 transition-all duration-300 cursor-pointer group hover:bg-zinc-900/60 shadow-lg relative"
                    >
                      {/* Image - Fully Dominant First Visual Asset */}
                      <div className="h-24 sm:h-28 md:h-44 lg:h-52 xl:h-56 w-full rounded-xl overflow-hidden relative shadow-inner">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-505"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                        {/* Top rating */}
                        <span className="absolute bottom-2 right-2 text-[8px] md:text-[9.5px] bg-black/70 text-brand-yellow font-extrabold px-2 py-0.5 md:px-2.5 md:py-1 rounded-full flex items-center gap-0.5 border border-white/5">
                          ★ {item.rating || "4.8"}
                        </span>
                      </div>

                      {/* Content Stack */}
                      <div className="space-y-1 md:space-y-1.5">
                        <h4 className="text-xs md:text-sm lg:text-base font-extrabold text-white tracking-tight line-clamp-1 group-hover:text-brand-yellow group-hover:underline transition-all uppercase">
                          {item.name}
                        </h4>
                        <p className="text-[9.5px] md:text-xs lg:text-[13px] text-zinc-400 line-clamp-2 leading-relaxed h-[28px] md:h-[36px] lg:h-[40px] overflow-hidden">
                          {item.description}
                        </p>
                      </div>

                      {/* Pricing and secondary CTA */}
                      <div className="pt-2.5 md:pt-3.5 border-t border-white/[0.04] flex items-center justify-between text-[11px] md:text-xs lg:text-sm font-extrabold text-brand-yellow mt-1">
                        <span>{item.price.toFixed(2)} Br</span>
                        <span className="text-[8px] md:text-[9.5px] text-white/50 bg-white/[0.06] group-hover:bg-brand-yellow group-hover:text-black px-2 py-0.5 md:px-3 md:py-1 rounded-full uppercase tracking-wider font-extrabold transition-colors">
                          Details ➔
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
            className="space-y-4 scroll-mt-2 pt-4 px-4"
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

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-x-[2px] lg:gap-y-[24px] xl:gap-x-[2px] xl:gap-y-8">
              {favoriteItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="bg-zinc-950/70 border border-white/[0.04] hover:border-brand-yellow/35 rounded-2xl p-2.5 md:p-4 lg:p-4.5 flex flex-col justify-between gap-3 md:gap-4 transition-all duration-300 cursor-pointer group hover:bg-zinc-900/60 shadow-lg relative"
                >
                  {/* Image - Fully Dominant First Visual Asset */}
                  <div className="h-24 sm:h-28 md:h-44 lg:h-52 xl:h-56 w-full rounded-xl overflow-hidden relative shadow-inner">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-505"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                    
                    {/* Top rating */}
                    <span className="absolute bottom-2 right-2 text-[8px] md:text-[9.5px] bg-black/70 text-brand-yellow font-extrabold px-2 py-0.5 md:px-2.5 md:py-1 rounded-full flex items-center gap-0.5 border border-white/5">
                      ★ {item.rating || "4.8"}
                    </span>
                  </div>

                  {/* Content Stack */}
                  <div className="space-y-1 md:space-y-1.5">
                    <h4 className="text-xs md:text-sm lg:text-base font-extrabold text-white tracking-tight line-clamp-1 group-hover:text-brand-yellow group-hover:underline transition-all uppercase">
                      {item.name}
                    </h4>
                    <p className="text-[9.5px] md:text-xs lg:text-[13px] text-zinc-400 line-clamp-2 leading-relaxed h-[28px] md:h-[36px] lg:h-[40px] overflow-hidden">
                      {item.description}
                    </p>
                  </div>

                  {/* Pricing and secondary CTA */}
                  <div className="pt-2.5 md:pt-3.5 border-t border-white/[0.04] flex items-center justify-between text-[11px] md:text-xs lg:text-sm font-extrabold text-brand-yellow mt-1">
                    <span>{item.price.toFixed(2)} Br</span>
                    <span className="text-[8px] md:text-[9.5px] text-white/50 bg-white/[0.06] group-hover:bg-brand-yellow group-hover:text-black px-2 py-0.5 md:px-3 md:py-1 rounded-full uppercase tracking-wider font-extrabold transition-colors">
                      Details ➔
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Brand Footer Section about the Company */}
        <div className="w-full bg-[#0d0d10] border-t border-white/[0.06] pb-16 pt-12 mt-16 select-none relative" id="menu_brand_footer">
          <div className="max-w-5xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 text-center lg:text-left">
            {/* Story */}
            <div className="space-y-3 lg:pr-4">
              <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] font-mono lg:border-b lg:border-white/[0.04] lg:pb-3 flex items-center justify-center lg:justify-start gap-1">
                <span className="lg:hidden">★</span>
                <span>The WOW Burger Story</span>
                <span className="lg:hidden">★</span>
              </h4>
              <p className="text-[11px] lg:text-xs text-zinc-400 font-light leading-relaxed">
                {restaurantInfo?.mission || "Handcrafted gourmet burgers made with fresh, locally sourced ingredients and pizzas cooked with a secret naturally leavened dough recipe. Our wood-fired oven ensures deep-charred crusts and unparalleled crispiness."}
              </p>
            </div>

            {/* Hours & Contact */}
            <div className="space-y-3 lg:border-l lg:border-r lg:border-white/[0.04] lg:px-8">
              <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] font-mono lg:border-b lg:border-white/[0.04] lg:pb-3 flex items-center justify-center lg:justify-start gap-1">
                <span className="lg:hidden">★</span>
                <span>Location & Hours</span>
                <span className="lg:hidden">★</span>
              </h4>
              <div className="flex flex-col items-center lg:items-start gap-2 text-[10px] lg:text-xs text-zinc-400 font-medium">
                <div className="flex items-center gap-2 font-mono text-[9px] lg:text-[10px] text-zinc-500 uppercase tracking-widest">
                  <Clock className="w-3.5 h-3.5 text-brand-yellow shrink-0" />
                  <span>Hours: {restaurantInfo?.openingHours || "11:00 AM - 10:00 PM"}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[9px] lg:text-[10px] text-zinc-500 uppercase tracking-widest text-center lg:text-left">
                  <MapPin className="w-3.5 h-3.5 text-brand-red shrink-0" />
                  <span>{restaurantInfo?.locationName || "Bole Atlas"}, {restaurantInfo?.locationAddress || "behind Sapphire Hotel"}</span>
                </div>
                
                {(restaurantInfo?.phone || restaurantInfo?.email) && (
                  <div className="flex items-center gap-2 mt-1 w-full justify-center lg:justify-start">
                    {restaurantInfo?.phone && (
                      <a href={`tel:${restaurantInfo.phone}`} className="text-zinc-400 hover:text-brand-yellow font-extrabold underline transition-colors">
                        {restaurantInfo.phone}
                      </a>
                    )}
                    {restaurantInfo?.phone && restaurantInfo?.email && <span className="text-white/10">•</span>}
                    {restaurantInfo?.email && (
                      <a href={`mailto:${restaurantInfo.email}`} className="text-zinc-400 hover:text-brand-red font-extrabold underline transition-colors">
                        Email
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Badge & Meta */}
            <div className="space-y-4 lg:pl-4">
              <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] font-mono lg:border-b lg:border-white/[0.04] lg:pb-3 flex items-center justify-center lg:justify-start gap-1">
                <span className="lg:hidden">★</span>
                <span>Experience</span>
                <span className="lg:hidden">★</span>
              </h4>
              <div className="space-y-3 flex flex-col items-center lg:items-start">
                <div className="inline-flex items-center gap-1.5 bg-neutral-900/60 px-3 py-1 rounded-full border border-white/[0.05]">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow" />
                  <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-widest font-mono">
                    Digital Menu Experience
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 font-medium text-center lg:text-left">
                  Designed & Developed by <span className="text-zinc-300 font-black hover:text-brand-yellow transition-colors">Aldric Labs</span>
                </p>
                <p className="text-[8px] text-zinc-600 font-mono">© 2026 WOW Burger. All Rights Reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ADAPTIVE CATEGORY DRAWER / SIDEBAR (Framer Motion Drawer) */}
      <AnimatePresence>
        {isSelectorOpen && (
          <>
            {/* Backdrop (visible for both phone and tablet drawers) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSelectorOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              id="category_drawer_backdrop"
            />

            {/* A. PHONE BOTTOM DRAWER (Screen size < 768px -> block md:hidden) */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="block md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-white/10 rounded-t-[28px] overflow-hidden z-50 flex flex-col shadow-2xl max-h-[80%]"
              id="category_bottom_drawer"
            >
              <div className="w-12 h-1 bg-white/15 mx-auto my-3 rounded-full shrink-0" />
              
              <div className="px-5 pb-2 text-center shrink-0">
                <span className="text-[9px] text-brand-yellow font-black uppercase tracking-[0.2em]">Select Category</span>
                <h4 className="text-sm font-black text-white mt-1 uppercase">Browse Chef Collections</h4>
              </div>

              {/* Scrollable list of categories */}
              <div className="overflow-y-auto px-4 py-2 space-y-1 pb-6 max-h-[300px]">
                {restaurantInfo?.showPopularSection !== false && popularItemsCount > 0 && (
                  <button
                    key="Popular"
                    onClick={() => handleCategorySelect("Popular")}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all text-xs font-bold mb-1.5 ${
                      activeCategory === "Popular"
                        ? "bg-brand-yellow text-black font-black shadow-lg shadow-brand-yellow/10" 
                        : "text-zinc-350 bg-brand-yellow/5 hover:bg-brand-yellow/10 border border-brand-yellow/10"
                    }`}
                  >
                    <span className="uppercase tracking-wider flex items-center gap-1.5 font-black font-sans">
                      {getCategoryIcon("Popular", "w-4 h-4 text-black")}
                      <span>Most Popular</span>
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${activeCategory === "Popular" ? "bg-black/15 text-black font-black" : "bg-brand-yellow/10 text-brand-yellow"}`}>
                      {popularItemsCount} plates
                    </span>
                  </button>
                )}

                {categories.map((cat) => {
                  const isSel = activeCategory === cat.id;
                  const count = groupedItems[cat.id]?.length || 0;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all text-xs font-bold ${
                        isSel 
                          ? "bg-brand-yellow text-black font-black shadow-lg shadow-brand-yellow/10" 
                          : "text-zinc-350 hover:bg-white/[0.03]"
                      }`}
                    >
                      <span className="uppercase tracking-wider font-sans flex items-center gap-1.5">
                        {getCategoryIcon(cat.id, `w-4 h-4 ${isSel ? 'text-black' : 'text-zinc-400'}`)}
                        <span>{cat.label}</span>
                      </span>
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
                    <span className="uppercase tracking-wider flex items-center gap-1.5 font-sans">
                      {getCategoryIcon("Favorites", "w-4 h-4 text-white")}
                      <span>My Favorites</span>
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${activeCategory === "Favorites" ? "bg-white/25 text-white" : "bg-brand-red/10 text-brand-red"}`}>
                      {favoriteItems.length} plates
                    </span>
                  </button>
                )}
              </div>
            </motion.div>

            {/* B. TABLET SIDE BAR (Screen size 768px to 1024px -> hidden md:flex lg:hidden) */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="hidden md:flex lg:hidden fixed inset-y-0 left-0 w-72 bg-zinc-950 border-r border-white/10 z-50 flex-col justify-between shadow-2xl p-6"
              id="category_tablet_sidebar"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                  <div>
                    <span className="text-[9px] text-brand-yellow font-black uppercase tracking-[0.2em] font-sans">Food Categories</span>
                    <h4 className="text-sm font-black text-white mt-0.5 uppercase font-sans">Browse Collections</h4>
                  </div>
                  <button 
                    onClick={() => setIsSelectorOpen(false)}
                    className="w-8 h-8 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer active:scale-90"
                    title="Close Sidebar"
                  >
                    <X className="w-4 h-4 text-brand-yellow" />
                  </button>
                </div>

                <div className="flex flex-col gap-2.5">
                  {restaurantInfo?.showPopularSection !== false && popularItemsCount > 0 && (
                    <button
                      onClick={() => handleCategorySelect("Popular")}
                      className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all text-xs font-black text-left cursor-pointer border ${
                        activeCategory === "Popular"
                          ? "bg-brand-yellow/10 text-brand-yellow border-brand-yellow/30 shadow-md"
                          : "text-zinc-400 border-transparent hover:text-white hover:bg-white/[0.02]"
                      }`}
                    >
                      <span className="uppercase tracking-wider font-sans flex items-center gap-1.5">
                        {getCategoryIcon("Popular", "w-4 h-4 text-brand-yellow")}
                        <span>Most Popular</span>
                      </span>
                      <span className={`text-[9.5px] px-2 py-0.5 rounded-full font-mono font-bold ${activeCategory === "Popular" ? "bg-brand-yellow/20 text-brand-yellow" : "bg-white/5 text-zinc-500"}`}>
                        {popularItemsCount}
                      </span>
                    </button>
                  )}

                  {categories.map((cat) => {
                    const isSel = activeCategory === cat.id;
                    const count = groupedItems[cat.id]?.length || 0;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategorySelect(cat.id)}
                        className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all text-xs font-black text-left cursor-pointer border ${
                          isSel
                            ? "bg-brand-yellow/10 text-brand-yellow border-brand-yellow/30 shadow-md"
                            : "text-zinc-400 border-transparent hover:text-white hover:bg-white/[0.02]"
                        }`}
                      >
                        <span className="uppercase tracking-wider font-sans flex items-center gap-1.5">
                          {getCategoryIcon(cat.id, `w-4 h-4 ${isSel ? 'text-brand-yellow' : 'text-zinc-500'}`)}
                          <span>{cat.label}</span>
                        </span>
                        <span className={`text-[9.5px] px-2 py-0.5 rounded-full font-mono font-bold ${isSel ? "bg-brand-yellow/20 text-brand-yellow" : "bg-white/5 text-zinc-500"}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}

                  {favoriteItems.length > 0 && (
                    <button
                      onClick={() => handleCategorySelect("Favorites")}
                      className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all text-xs font-black text-left cursor-pointer border ${
                        activeCategory === "Favorites"
                          ? "bg-brand-red/10 text-brand-red border-brand-red/35 shadow-md"
                          : "text-brand-red border-transparent hover:bg-brand-red/10"
                      }`}
                    >
                      <span className="uppercase tracking-wider flex items-center gap-1.5 font-sans">
                        {getCategoryIcon("Favorites", "w-4 h-4 text-brand-red")}
                        <span>My Favorites</span>
                      </span>
                      <span className={`text-[9.5px] px-2 py-0.5 rounded-full font-mono font-bold ${activeCategory === "Favorites" ? "bg-brand-red/20 text-brand-red" : "bg-brand-red/10 text-brand-red"}`}>
                        {favoriteItems.length}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.06] text-center">
                <p className="text-[9px] text-zinc-500 font-semibold tracking-wider uppercase font-sans">Culinary Flavor Profiles</p>
                <p className="text-[8px] text-zinc-650 mt-0.5 uppercase font-sans">Selected with passion</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
