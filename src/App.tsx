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
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden text-white font-sans p-0 md:p-4 lg:p-6">
      {/* Background Ambience Light Effect: Glowing red & yellow outer gradients */}
      <div className="absolute inset-0 opacity-25 pointer-events-none z-0">
        <div className="absolute top-[-100px] left-[-100px] w-[600px] h-[600px] bg-brand-red rounded-full blur-[180px]"></div>
        <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-brand-yellow rounded-full blur-[180px]"></div>
      </div>

      {/* Dynamic Responsive Container - Stretches fluidly on desktop but maintains clean layout */}
      <div className="w-full max-w-6xl h-screen md:h-[845px] bg-neutral-950 relative flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden md:border md:border-white/10 md:rounded-[32px] z-10">
        
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
    </div>
  );
}
