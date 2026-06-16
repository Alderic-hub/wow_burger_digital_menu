/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { MenuItem, Category, RestaurantInfo } from "./types";
import { 
  initDB, 
  loadMenuItems, 
  loadCategories, 
  loadRestaurantInfo,
  bootstrapFirestoreIfEmpty,
  subscribeMenuItems,
  subscribeCategories,
  subscribeRestaurantInfo
} from "./dbService";
import RestaurantHeader from "./components/RestaurantHeader";
import DetailViewOverlay from "./components/DetailViewOverlay";
import MenuView from "./components/MenuView";
import InfoView from "./components/InfoView";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";

export default function App() {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [currentPage, setCurrentPage] = useState<"menu" | "info">("menu");

  // Routing State
  const [currentRoute, setCurrentRoute] = useState<"customer" | "admin-login" | "admin-dashboard">(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    const hasToken = !!localStorage.getItem("wow_admin_token");

    if (path.startsWith("/admin/login") || hash.startsWith("#/admin/login")) {
      return "admin-login";
    }
    if (path.startsWith("/admin") || hash.startsWith("#/admin")) {
      return hasToken ? "admin-dashboard" : "admin-login";
    }
    return "customer";
  });

  // Reactive Data States
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo | null>(null);

  // Load from local storage sync engine on mount and bind Firestore subscribers
  useEffect(() => {
    initDB();
    
    // Load local-first values for zero-latency initial paint
    setMenuItems(loadMenuItems());
    setCategories(loadCategories());
    setRestaurantInfo(loadRestaurantInfo());

    // Trigger background self-healing population if Remote Firestore is empty
    bootstrapFirestoreIfEmpty();

    // Subscribe to live multi-device database updates
    const unsubMenu = subscribeMenuItems((items) => {
      if (items.length > 0) {
        setMenuItems(items);
      }
    });

    const unsubCategories = subscribeCategories((cats) => {
      if (cats.length > 0) {
        setCategories(cats);
      }
    });

    const unsubInfo = subscribeRestaurantInfo((info) => {
      if (info) {
        setRestaurantInfo(info);
      }
    });

    // Listen to direct URL navigation / hash events
    const handleUrlChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const hasToken = !!localStorage.getItem("wow_admin_token");

      if (path.startsWith("/admin/login") || hash.startsWith("#/admin/login")) {
        setCurrentRoute("admin-login");
      } else if (path.startsWith("/admin") || hash.startsWith("#/admin")) {
        setCurrentRoute(hasToken ? "admin-dashboard" : "admin-login");
      } else {
        setCurrentRoute("customer");
      }
    };

    window.addEventListener("popstate", handleUrlChange);
    window.addEventListener("hashchange", handleUrlChange);

    return () => {
      unsubMenu();
      unsubCategories();
      unsubInfo();
      window.removeEventListener("popstate", handleUrlChange);
      window.removeEventListener("hashchange", handleUrlChange);
    };
  }, []);

  // Sync state after administrative updates
  const handleRefreshPublicData = () => {
    setMenuItems(loadMenuItems());
    setCategories(loadCategories());
    setRestaurantInfo(loadRestaurantInfo());
  };

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

  // Switch workspace display based on route
  if (currentRoute === "admin-login") {
    return (
      <AdminLogin 
        onLoginSuccess={() => setCurrentRoute("admin-dashboard")} 
        onGoHome={() => setCurrentRoute("customer")}
      />
    );
  }

  if (currentRoute === "admin-dashboard") {
    return (
      <AdminDashboard 
        onLogout={() => {
          localStorage.removeItem("wow_admin_token");
          setCurrentRoute("customer");
        }}
        onRefreshPublicData={handleRefreshPublicData}
      />
    );
  }

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center relative overflow-hidden text-white font-sans p-0 m-0">
      {/* Background Ambience Light Effect: Glowing red & yellow outer gradients */}
      <div className="absolute inset-0 opacity-25 pointer-events-none z-0">
        <div className="absolute top-[-100px] left-[-100px] w-[600px] h-[600px] bg-brand-red rounded-full blur-[180px]"></div>
        <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-brand-yellow rounded-full blur-[180px]"></div>
      </div>

      {/* Dynamic Responsive Container - Stretches fluidly on desktop but maintains clean layout */}
      <div className="w-full h-full bg-neutral-950 relative flex flex-col shadow-2xl overflow-hidden z-10">
        
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
              menuItems={menuItems}
              categories={categories}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onSelectItem={setSelectedItem}
            />
          </div>

          {/* DEDICATED FULL SCREEN INFORMATION PAGE */}
          {restaurantInfo && (
            <InfoView isVisible={currentPage === "info"} info={restaurantInfo} />
          )}
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
