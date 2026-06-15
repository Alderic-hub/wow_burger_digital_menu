/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { MENU_ITEMS } from "./menuData";
import { MenuItem } from "./types";
import RestaurantHeader from "./components/RestaurantHeader";
import DetailViewOverlay from "./components/DetailViewOverlay";
import MenuView from "./components/MenuView";
import InfoView from "./components/InfoView";

export default function App() {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [currentPage, setCurrentPage] = useState<"menu" | "info">("menu");

  // State to track favorited item IDs
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("wow_menu_favorites") || "[]");
    } catch {
      return [];
    }
  });

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((fId) => fId !== id)
        : [...prev, id];
      localStorage.setItem("wow_menu_favorites", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden text-white font-sans p-0 lg:p-4">
      {/* Background Ambience Light Effect: Glowing red & yellow outer gradients */}
      <div className="absolute inset-0 opacity-25 pointer-events-none z-0">
        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-brand-red rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-brand-yellow rounded-full blur-[150px]"></div>
      </div>

      {/* Main Layout containing both simulated browser preview frames & side decoration details */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-center z-10 gap-10 xl:gap-14 h-screen lg:h-auto">
        
        {/* Left Side Info Panel (Only visible on XL and greater screens like Swiss modern brochures) */}
        <div className="hidden xl:flex flex-col gap-6 w-64 text-left opacity-90">
          <div className="border-l-4 border-brand-red pl-5">
            <h3 className="text-brand-red font-black uppercase text-[11px] tracking-[0.3em] mb-1">WOW BURGER</h3>
            <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-1">DIGITAL<br />MENU</h2>
            <p className="text-gray-400 text-xs mt-3 leading-relaxed">
              Experience our premium digital menu. Crafted specifically for physically present guests. Browse high-definition plates, check ratings, and inspect ingredients directly.
            </p>
          </div>
          
          <div className="glass p-5 rounded-2xl relative overflow-hidden">
            <h4 className="text-brand-yellow font-bold text-xs tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
              <span>💡 Digital Menu Mode</span>
            </h4>
            <p className="text-[11px] text-gray-300 leading-normal">
              Tap categories at the top to browse our delicious menus in a sleek bento grid. Click <span className="text-brand-yellow font-semibold">"Secrets ➔"</span> to view recipes/ingredients.
            </p>
          </div>

          <div className="text-[10px] text-gray-500 font-medium pl-5">
            Addis Ababa, Bole Branch • 2026
          </div>
        </div>

        {/* Center Simulated Mobile Screen View Frame */}
        <div className="w-full max-w-md h-screen lg:h-[768px] bg-neutral-950 relative flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden lg:border lg:border-white/10 lg:rounded-[32px]">
          
          {/* Top Sticky Header with Information access point */}
          <RestaurantHeader
            currentPage={currentPage}
            onInfoClick={() => setCurrentPage("info")}
            onBackClick={() => setCurrentPage("menu")}
          />

          {/* Center Main Dynamic Panel - Direct Menu Experience */}
          <div className="flex-1 w-full overflow-hidden relative bg-black">
            {/* MENU CONTAINER: Kept in DOM with hidden layout to fully retain scroll state */}
            <div className={`w-full h-full ${currentPage === "menu" ? "block" : "hidden"}`}>
              <MenuView
                menuItems={MENU_ITEMS}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onSelectItem={setSelectedItem}
              />
            </div>

            {/* DEDICATED FULL SCREEN INFORMATION PAGE */}
            <InfoView isVisible={currentPage === "info"} />
          </div>

          {/* Full Food Item Ingredients Detail Overlay */}
          <DetailViewOverlay
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            isFavorite={selectedItem ? favorites.includes(selectedItem.id) : false}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>

        {/* Right Side Navigation (Inspired by Swiss modern layout) */}
        <div className="hidden lg:flex flex-col gap-8 w-64 text-left">
          <div className="space-y-6">
            <div className="border-l-4 border-brand-red pl-4">
              <h4 className="text-brand-red font-bold uppercase text-[10px] tracking-widest mb-1 font-mono">TODAY'S PAIRING</h4>
              <p className="font-extrabold text-[#fff] text-lg leading-tight">
                Wow Special Pizza
              </p>
              <p className="text-xs text-gray-300 mt-1">
                Drafted by Chef Michael
              </p>
            </div>

            <div className="glass p-5 rounded-2xl border border-white/5 space-y-3.5">
              <span className="text-[10px] text-brand-yellow font-bold uppercase tracking-wider bg-brand-yellow/10 px-2 py-0.5 rounded font-mono">
                Table Order Mode
              </span>
              <p className="text-xs text-gray-300 leading-relaxed font-body font-light">
                No billing checkout needed. This digital interactive screen belongs to your table. Feel free to request staff assistance at any point.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-brand-yellow font-bold">
                <span>✨ 100% Prepared Fresh</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
