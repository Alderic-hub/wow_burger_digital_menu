import { useState, useEffect, useRef } from "react";
import { MenuItem, Category, RestaurantInfo } from "../types";
import { ChevronDown, Heart, Star, Compass, AlertCircle, Clock, MapPin, Phone, Mail } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SUBCATEGORIES } from "../menuData";

interface MenuViewProps {
  menuItems: MenuItem[];
  categories: Category[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSelectItem: (item: MenuItem) => void;
  restaurantInfo?: RestaurantInfo | null;
}

// Map of category descriptions/sub-headings for a premium aesthetic
const CATEGORY_SUBHEADINGS: Record<string, string> = {
  "Burger": "Handcrafted Favorites & Double Patties",
  "Chicken": "Southern Style Golden Crunch & Bites",
  "Wrap": "Fresh Rolled Tortillas",
  "Sandwich": "Toasted Triple-Decker Club Choices",
  "Pizza": "Wood-Fired thin-crust Pizzas",
  "Sides_Extras": "Crispy Loaded Fries & Bites",
  "Drinks": "Premium Refreshing Softs & Shakes",
  "Sauces_Addons": "Extra Infused Dipping Liquids & Toppings"
};

export default function MenuView({
  menuItems,
  categories,
  favorites,
  onToggleFavorite,
  onSelectItem,
  restaurantInfo
}: MenuViewProps) {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
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

    return () => {
      observer.disconnect();
    };
  }, [menuItems, categories]);

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
  const groupedItems = categories.reduce<Record<string, MenuItem[]>>((acc, cat) => {
    acc[cat.id] = menuItems.filter((item) => item.category === cat.id);
    return acc;
  }, {});

  // Add favorites if there are any
  const favoriteItems = menuItems.filter((i) => favorites.includes(i.id));

  return (
    <div className="w-full h-full flex flex-col relative select-none bg-black">
      
      {/* 1. STICKY TOP CONTROLLER (Menu Title + Single Category Button) */}
      <div className="px-5 pt-5 pb-3 border-b border-white/[0.04] bg-neutral-950/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-black tracking-tight text-white uppercase font-sans">
            Menu
          </h2>
          <p className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-wide">
            Select a flavor profile
          </p>
        </div>

        {/* Unified sleek navigation button (opens bottom sheet category chooser on click) */}
        <div>
          <button
            onClick={() => setIsSelectorOpen(!isSelectorOpen)}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-805 border border-white/[0.08] hover:border-brand-yellow/45 rounded-full px-4 py-2 text-xs font-bold text-white shadow-lg transition-all cursor-pointer active:scale-95 group"
            id="category_selector_button"
          >
            <span className="text-[11px] tracking-wider text-brand-yellow font-black uppercase">
              {activeCategory === "Favorites" ? "Saved Plates" : (categories.find(c => c.id === activeCategory)?.label || activeCategory)}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-brand-yellow group-hover:translate-y-0.5 transition-transform stroke-[2.5]" />
          </button>
        </div>
      </div>



      {/* 2. MAIN SCROLL CONTAINER */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-4 scrollbar-none space-y-10 pb-28 scroll-smooth"
        id="menu_scroll_container"
      >
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
              className="space-y-4 scroll-mt-2"
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
                
                <p className="text-[10px] text-zinc-400 font-medium tracking-wide mt-1 italic font-serif">
                  {CATEGORY_SUBHEADINGS[cat.id] || "Fresh Culinary Creation"}
                </p>
                
                <div className="w-12 h-[2px] bg-brand-red mx-auto mt-3.5 rounded-full shadow-sm" />
              </div>

              {/* Grid of Image-First Cards - Flat list of all items */}
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

        {/* Brand Footer Section about the Company */}
        <div className="pt-16 pb-12 mt-12 border-t border-white/[0.04] text-center space-y-6 max-w-sm mx-auto select-none">
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] font-mono">
              ★ The WOW Burger Story ★
            </h4>
            <p className="text-[11px] text-zinc-400 font-light leading-relaxed px-4">
              {restaurantInfo?.mission || "Handcrafted gourmet burgers made with fresh, locally sourced ingredients and pizzas cooked with a secret naturally leavened dough recipe. Our wood-fired oven ensures deep-charred crusts and unparalleled crispiness."}
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 text-[10px] text-zinc-400 font-medium px-4">
            <div className="flex items-center gap-1.5 font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
              <Clock className="w-3.5 h-3.5 text-brand-yellow shrink-0" />
              <span>Hours: {restaurantInfo?.openingHours || "11:00 AM - 10:00 PM"}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
              <MapPin className="w-3.5 h-3.5 text-brand-red shrink-0" />
              <span>{restaurantInfo?.locationName || "Bole Atlas"}, {restaurantInfo?.locationAddress || "behind Sapphire Hotel"}</span>
            </div>
            
            {(restaurantInfo?.phone || restaurantInfo?.email) && (
              <div className="flex items-center gap-2 mt-2">
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

          <div className="pt-6 border-t border-white/[0.04] space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-neutral-900/60 px-3 py-1 rounded-full border border-white/[0.05]">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow" />
              <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-widest font-mono">
                Digital Menu Experience
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 font-medium">
              Designed & Developed by <span className="text-zinc-300 font-black hover:text-brand-yellow transition-colors">Aldric Labs</span>
            </p>
            <div className="pt-1.5 pb-1">
              <button 
                onClick={() => {
                  window.location.hash = "#/wow-burger-admin";
                }}
                className="text-[9px] text-zinc-600 hover:text-brand-yellow uppercase tracking-widest font-mono font-bold transition-all border border-transparent hover:border-white/[0.05] hover:bg-neutral-900/40 px-2.5 py-1 rounded-md cursor-pointer"
              >
                [ Admin Portal ]
              </button>
            </div>
            <p className="text-[8px] text-zinc-600 font-mono">© 2026 WOW Burger. All Rights Reserved.</p>
          </div>
        </div>
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Bottom Drawer Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:max-w-xl max-h-[80%] bg-zinc-950 border-t border-white/10 rounded-t-[28px] overflow-hidden z-50 flex flex-col shadow-2xl"
              id="category_bottom_drawer"
            >
              <div className="w-12 h-1 bg-white/15 mx-auto my-3 rounded-full shrink-0" />
              
              <div className="px-5 pb-2 text-center shrink-0">
                <span className="text-[9px] text-brand-yellow font-black uppercase tracking-[0.2em]">Select Category</span>
                <h4 className="text-sm font-black text-white mt-1 uppercase">Browse Chef Collections</h4>
              </div>

              {/* Scrollable list of categories */}
              <div className="overflow-y-auto px-4 py-2 space-y-1 pb-6 max-h-[300px]">
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
