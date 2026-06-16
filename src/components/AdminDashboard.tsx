import React, { useState } from "react";
import { MenuItem, Category, RestaurantInfo } from "../types";
import { 
  loadMenuItems, saveMenuItems, 
  loadCategories, saveCategories, 
  loadRestaurantInfo, saveRestaurantInfo 
} from "../dbService";
import { 
  LayoutDashboard, FolderKanban, Utensils, Info, LogOut, 
  Plus, Trash2, Edit2, Check, QrCode, DollarSign, Image as ImageIcon, 
  Clock, Flame, Star, Save, Link as LinkIcon, RefreshCw, X, Eye, ThumbsUp,
  Sparkles
} from "lucide-react";

interface AdminDashboardProps {
  onLogout: () => void;
  onRefreshPublicData: () => void;
}

type TabType = "overview" | "categories" | "items" | "restaurant";

export default function AdminDashboard({ onLogout, onRefreshPublicData }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  
  // Data States
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => loadMenuItems());
  const [categories, setCategories] = useState<Category[]>(() => loadCategories());
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo>(() => loadRestaurantInfo());
  
  // Selection / Editing States
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Form States for Menu Items
  const [itemForm, setItemForm] = useState<Partial<MenuItem>>({
    id: "", name: "", price: 0, ingredients: "", category: "",
    image: "", description: "", prepTime: "", calories: "",
    rating: 5, isPopular: false, isChefPick: false, isFeatured: false
  });

  // Form States for Categories
  const [categoryForm, setCategoryForm] = useState<Partial<Category>>({
    id: "", label: "", iconName: "Utensils", thumbnail: ""
  });

  // Form State for Restaurant Info
  const [infoForm, setInfoForm] = useState<RestaurantInfo>({ ...restaurantInfo });

  const triggerUpdate = () => {
    onRefreshPublicData();
  };

  // --- MENU ITEM LOGIC ---
  const handleOpenEditItem = (item: MenuItem) => {
    setSelectedItem(item);
    setItemForm({ ...item });
    setIsAddingItem(false);
  };

  const handleOpenAddItem = () => {
    const randomId = "item-" + Math.random().toString(36).substr(2, 9);
    setSelectedItem(null);
    setItemForm({
      id: randomId,
      name: "",
      price: 500,
      ingredients: "",
      category: categories[0]?.id || "Burgers",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
      description: "",
      prepTime: "10-15 min",
      calories: "450 kcal",
      rating: 4.8,
      isPopular: false,
      isChefPick: false,
      isFeatured: false
    });
    setIsAddingItem(true);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      const updated = menuItems.filter(item => item.id !== id);
      setMenuItems(updated);
      saveMenuItems(updated);
      triggerUpdate();
    }
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name || !itemForm.category || !itemForm.image) {
      alert("Please fill in the required fields (Name, Category, Image URL).");
      return;
    }

    let updatedList: MenuItem[];
    if (isAddingItem) {
      const newItem = itemForm as MenuItem;
      updatedList = [newItem, ...menuItems];
    } else {
      updatedList = menuItems.map(item => item.id === selectedItem?.id ? (itemForm as MenuItem) : item);
    }

    setMenuItems(updatedList);
    saveMenuItems(updatedList);
    setSelectedItem(null);
    setIsAddingItem(false);
    triggerUpdate();
  };

  // --- CATEGORY LOGIC ---
  const handleOpenEditCategory = (cat: Category) => {
    setSelectedCategory(cat);
    setCategoryForm({ ...cat });
    setIsAddingCategory(false);
  };

  const handleOpenAddCategory = () => {
    setCategoryForm({
      id: "", label: "", iconName: "Utensils", thumbnail: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=120&h=120&q=80"
    });
    setSelectedCategory(null);
    setIsAddingCategory(true);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm("Are you sure you want to delete this category? It may leave items under this category uncategorized.")) {
      const updated = categories.filter(cat => cat.id !== id);
      setCategories(updated);
      saveCategories(updated);
      triggerUpdate();
    }
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.label) {
      alert("Please fill in Category Label.");
      return;
    }

    const catId = categoryForm.id || categoryForm.label.trim().replace(/\s+/g, '-');
    const finalCategory: Category = {
      id: catId,
      label: categoryForm.label,
      iconName: categoryForm.iconName || "Utensils",
      thumbnail: categoryForm.thumbnail || "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=120&h=120&q=80"
    };

    let updatedList: Category[];
    if (isAddingCategory) {
      updatedList = [...categories, finalCategory];
    } else {
      updatedList = categories.map(cat => cat.id === selectedCategory?.id ? finalCategory : cat);
    }

    setCategories(updatedList);
    saveCategories(updatedList);
    setSelectedCategory(null);
    setIsAddingCategory(false);
    triggerUpdate();
  };

  // --- RESTAURANT INFO LOGIC ---
  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setRestaurantInfo(infoForm);
    saveRestaurantInfo(infoForm);
    alert("Restaurant Profile settings successfully updated!");
    triggerUpdate();
  };

  // Construct QR code address
  const publicMenuUrl = window.location.origin;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicMenuUrl)}&color=ffc107&bgcolor=000000`;

  return (
    <div className="h-screen w-screen bg-black text-white font-sans flex flex-col md:flex-row relative overflow-hidden">
      
      {/* SIDE NAVIGATION PANEL */}
      <aside className="w-full md:w-64 h-auto md:h-full bg-zinc-950 border-b md:border-b-0 md:border-r border-white/[0.08] flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Brand Header */}
          <div className="px-6 py-5 border-b border-white/[0.06] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center text-black font-black text-sm select-none shadow-[0_0_12px_rgba(255,193,7,0.3)]">
              W
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-widest text-white leading-tight">WOW ADMIN</span>
              <span className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider">Management Suite</span>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => { setActiveTab("overview"); setSelectedItem(null); setSelectedCategory(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === "overview" ? "bg-brand-yellow text-black shadow-lg shadow-brand-yellow/10" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview & QR</span>
            </button>
            <button
              onClick={() => { setActiveTab("categories"); setSelectedItem(null); setSelectedCategory(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === "categories" ? "bg-brand-yellow text-black shadow-lg shadow-brand-yellow/10" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"}`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>Categories</span>
            </button>
            <button
              onClick={() => { setActiveTab("items"); setSelectedItem(null); setSelectedCategory(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === "items" ? "bg-brand-yellow text-black shadow-lg shadow-brand-yellow/10" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"}`}
            >
              <Utensils className="w-4 h-4" />
              <span>Menu Items</span>
            </button>
            <button
              onClick={() => { setActiveTab("restaurant"); setSelectedItem(null); setSelectedCategory(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === "restaurant" ? "bg-brand-yellow text-black shadow-lg shadow-brand-yellow/10" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"}`}
            >
              <Info className="w-4 h-4" />
              <span>Restaurant Info</span>
            </button>
          </nav>
        </div>

        {/* Lougout Trigger Button footer */}
        <div className="p-4 border-t border-white/[0.06] bg-zinc-950/40">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-900 border border-white/5 hover:border-brand-red/30 hover:bg-brand-red/10 text-zinc-400 hover:text-brand-red text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            <span>Exit Dashboard</span>
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* PRIMARY WORKSPACE */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 pb-24">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div>
            <span className="text-[10px] text-brand-yellow font-black uppercase tracking-widest font-mono">Administrative View</span>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white mt-1">
              {activeTab === "overview" && "DASHBOARD OVERVIEW"}
              {activeTab === "categories" && "CATEGORY ARCHITECTURE"}
              {activeTab === "items" && "MENU ITEM CATALOG"}
              {activeTab === "restaurant" && "RESTAURANT PROFILE MANAGEMENT"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 bg-zinc-900 text-green-400 border border-white/5 text-[10px] uppercase font-black px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Live Sync Active
            </span>
          </div>
        </div>

        {/* Tab 1: OVERVIEW & QR ENTRY POINT */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Core Stats Cards */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 border border-white/5 rounded-2xl p-5 shadow-sm">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Menu Items Listed</span>
                  <div className="flex items-end justify-between mt-2">
                    <span className="text-3xl font-black text-white">{menuItems.length}</span>
                    <Utensils className="w-5 h-5 text-brand-yellow" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 border border-white/5 rounded-2xl p-5 shadow-sm">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Active Categories</span>
                  <div className="flex items-end justify-between mt-2">
                    <span className="text-3xl font-black text-white">{categories.length}</span>
                    <FolderKanban className="w-5 h-5 text-brand-yellow" />
                  </div>
                </div>
              </div>

              {/* Instructions Guide */}
              <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-white/[0.08] rounded-2xl p-6 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-yellow" />
                  MANAGEMENT QUICKSTART GUIDE
                </h3>
                <div className="space-y-3.5 text-xs text-zinc-300 font-light leading-relaxed">
                  <p>
                    All changes made in this administrative suite are <strong>real-time and reactive</strong>. Since customer views directly track this datastore, updates to pricing, images, categories, or descriptions propagate immediately upon clicking save!
                  </p>
                  <p>
                    Ensure your dishes represent high-quality image choices and complete, accurate ingredient definitions. Correctly set Chef's Pick and Popular items to showcase high-conversion elements in the main carousel.
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code Entry Card */}
            <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 border border-brand-yellow/20 rounded-2xl p-6 flex flex-col items-center justify-between text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-yellow/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-yellow/10 border border-brand-yellow/25 text-brand-yellow mx-auto">
                  <QrCode className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white mt-2">OFFICIAL QR ENTRY POINT</h4>
                <p className="text-[10px] text-zinc-400 font-light max-w-xs mx-auto">
                  Provide this QR Code for your customers. When scanned, it points their browsers directly to the dynamic public digital menu.
                </p>
              </div>

              {/* Real SVG QR Code Image from public QR API */}
              <div className="w-48 h-48 bg-black border border-brand-yellow/25 rounded-xl p-3 flex items-center justify-center my-4 relative shadow-2xl">
                <img 
                  src={qrCodeImageUrl} 
                  alt="Dynamic scan to menu"
                  className="w-full h-full object-contain rounded-md select-none"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="w-full space-y-2">
                <div className="text-[10px] text-brand-yellow font-mono break-all font-semibold select-all bg-zinc-950 py-2 px-3 border border-white/5 rounded-lg">
                  {publicMenuUrl}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(publicMenuUrl);
                    alert("Official Menu URL copied to clipboard!");
                  }}
                  className="w-full bg-zinc-900 border border-white/10 hover:border-brand-yellow/40 hover:bg-zinc-850 px-4 py-2.5 rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <LinkIcon className="w-3 h-3 text-brand-yellow" />
                  <span>Copy Public URL</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: CATEGORY ARCHITECTURE */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-zinc-950 p-4 border border-white/[0.05] rounded-xl">
              <span className="text-xs font-medium text-zinc-400">Total Available Categories ({categories.length})</span>
              <button
                onClick={handleOpenAddCategory}
                className="bg-brand-yellow hover:bg-yellow-500 text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-brand-yellow/5"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Create Category</span>
              </button>
            </div>

            {/* Category Listing Layout or Editor form */}
            {(selectedCategory || isAddingCategory) ? (
              <form onSubmit={handleSaveCategory} className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-brand-yellow/20 rounded-2xl p-6 space-y-5">
                <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-brand-yellow">
                    {isAddingCategory ? "CREATE NEW MENU CATEGORY" : `EDIT CATEGORY: ${selectedCategory?.label}`}
                  </h3>
                  <button 
                    type="button" 
                    onClick={() => { setSelectedCategory(null); setIsAddingCategory(false); }}
                    className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">Category Label <span className="text-brand-red">*</span></label>
                    <input
                      type="text"
                      required
                      value={categoryForm.label || ""}
                      onChange={e => setCategoryForm({...categoryForm, label: e.target.value})}
                      placeholder="e.g., Wood Fired Pizzas"
                      className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">Icon Name (Lucide string)</label>
                    <input
                      type="text"
                      value={categoryForm.iconName || ""}
                      onChange={e => setCategoryForm({...categoryForm, iconName: e.target.value})}
                      placeholder="e.g., Pizza, Beef, Flame, Salad, CupSoda"
                      className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">Thumbnail URL (Square, high quality ratio)</label>
                    <input
                      type="text"
                      value={categoryForm.thumbnail || ""}
                      onChange={e => setCategoryForm({...categoryForm, thumbnail: e.target.value})}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30 font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => { setSelectedCategory(null); setIsAddingCategory(false); }}
                    className="bg-zinc-900 hover:bg-zinc-850 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-400 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-brand-yellow hover:bg-yellow-500 text-black px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Category</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(cat => (
                  <div key={cat.id} className="bg-gradient-to-br from-zinc-950 to-zinc-900 border border-white/[0.06] rounded-2xl p-4 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 overflow-hidden">
                        <img 
                          src={cat.thumbnail} 
                          alt={cat.label}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white uppercase">{cat.label}</h4>
                        <span className="text-[9px] text-zinc-500 font-mono">ID: {cat.id} (Icon: {cat.iconName})</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditCategory(cat)}
                        className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 hover:border-brand-yellow/30 hover:bg-brand-yellow/10 text-zinc-400 hover:text-brand-yellow flex items-center justify-center transition-all cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 hover:border-brand-red/30 hover:bg-brand-red/10 text-zinc-400 hover:text-brand-red flex items-center justify-center transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: MENU ITEM CATALOG & PRICES & IMAGES */}
        {activeTab === "items" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-zinc-950 p-4 border border-white/[0.05] rounded-xl">
              <span className="text-xs font-medium text-zinc-400">Manage Food items listed ({menuItems.length})</span>
              <button
                onClick={handleOpenAddItem}
                className="bg-brand-yellow hover:bg-yellow-500 text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-brand-yellow/5"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Food Item</span>
              </button>
            </div>

            {/* Menu Edit Form or Table Grid */}
            {(selectedItem || isAddingItem) ? (
              <form onSubmit={handleSaveItem} className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-brand-yellow/20 rounded-2xl p-6 space-y-5">
                <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-brand-yellow">
                    {isAddingItem ? "ADD NEW WOW DISH FORM" : `EDIT DISH: ${selectedItem?.name}`}
                  </h3>
                  <button 
                    type="button" 
                    onClick={() => { setSelectedItem(null); setIsAddingItem(false); }}
                    className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">Dish Name *</label>
                    <input
                      type="text"
                      required
                      value={itemForm.name || ""}
                      onChange={e => setItemForm({...itemForm, name: e.target.value})}
                      placeholder="e.g., Wow Double Cheddar Patty"
                      className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30"
                    />
                  </div>

                  {/* Price (Price Management integrated!) */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">Price (ETB) *</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-yellow" />
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={itemForm.price || 0}
                        onChange={e => setItemForm({...itemForm, price: parseFloat(e.target.value) || 0})}
                        placeholder="781.74"
                        className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30 font-mono"
                      />
                    </div>
                  </div>

                  {/* Category Assignment */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">Assigned Category *</label>
                    <select
                      value={itemForm.category || "Burgers"}
                      onChange={e => setItemForm({...itemForm, category: e.target.value})}
                      className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30 font-mono"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Ingredients String */}
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">Ingredients (Comma separated)</label>
                    <input
                      type="text"
                      value={itemForm.ingredients || ""}
                      onChange={e => setItemForm({...itemForm, ingredients: e.target.value})}
                      placeholder="Beef, Cheddar, Special WOW Sauce"
                      className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30"
                    />
                  </div>

                  {/* Prep Time */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">Preparation Time</label>
                    <input
                      type="text"
                      value={itemForm.prepTime || ""}
                      onChange={e => setItemForm({...itemForm, prepTime: e.target.value})}
                      placeholder="e.g., 10-12 min"
                      className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30"
                    />
                  </div>

                  {/* Calories */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">Calories Estimate</label>
                    <input
                      type="text"
                      value={itemForm.calories || ""}
                      onChange={e => setItemForm({...itemForm, calories: e.target.value})}
                      placeholder="e.g. 680 kcal"
                      className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30"
                    />
                  </div>

                  {/* Image Field (Image Management integrated!) */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">Image URL *</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        required
                        value={itemForm.image || ""}
                        onChange={e => setItemForm({...itemForm, image: e.target.value})}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30 font-mono"
                      />
                    </div>
                  </div>

                  {/* Image Preview Window */}
                  <div className="bg-zinc-950 border border-white/[0.06] rounded-xl p-2.5 flex items-center gap-3.5">
                    <div className="w-12 h-12 bg-zinc-900 rounded-lg overflow-hidden border border-white/5 shrink-0">
                      {itemForm.image ? (
                        <img 
                          src={itemForm.image} 
                          alt="Dish Preview" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=120&h=120&q=80" }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700">NA</div>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Real-time Image Preview</span>
                      <span className="text-[9px] text-brand-yellow font-mono truncate block max-w-[180px]">{itemForm.image || "No Address Added"}</span>
                    </div>
                  </div>

                  {/* Description Box */}
                  <div className="space-y-1.5 md:col-span-3">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">Description Text</label>
                    <textarea
                      rows={3}
                      value={itemForm.description || ""}
                      onChange={e => setItemForm({...itemForm, description: e.target.value})}
                      placeholder="An extraordinarily juicy certified meat standard double stack patty smothered in chef dynamic toppings..."
                      className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30 resize-none font-sans"
                    />
                  </div>

                  {/* Promotion Badges toggle checkboxes */}
                  <div className="md:col-span-3 border-t border-white/[0.04] pt-4 grid grid-cols-3 gap-4">
                    <label className="flex items-center gap-2.5 bg-zinc-950 p-3 rounded-xl border border-white/5 cursor-pointer hover:border-brand-yellow/30 select-none">
                      <input
                        type="checkbox"
                        checked={itemForm.isPopular || false}
                        onChange={e => setItemForm({...itemForm, isPopular: e.target.checked})}
                        className="accent-brand-yellow w-4 h-4 cursor-pointer"
                      />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-wider text-white">Popular Item</span>
                        <span className="text-[8px] text-zinc-500 font-medium">Flag as high selling</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 bg-zinc-950 p-3 rounded-xl border border-white/5 cursor-pointer hover:border-brand-yellow/30 select-none">
                      <input
                        type="checkbox"
                        checked={itemForm.isChefPick || false}
                        onChange={e => setItemForm({...itemForm, isChefPick: e.target.checked})}
                        className="accent-brand-yellow w-4 h-4 cursor-pointer"
                      />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-wider text-white">Chef's Pick</span>
                        <span className="text-[8px] text-zinc-500 font-medium">Show custom specialty badge</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 bg-zinc-950 p-3 rounded-xl border border-white/5 cursor-pointer hover:border-brand-yellow/30 select-none">
                      <input
                        type="checkbox"
                        checked={itemForm.isFeatured || false}
                        onChange={e => setItemForm({...itemForm, isFeatured: e.target.checked})}
                        className="accent-brand-yellow w-4 h-4 cursor-pointer"
                      />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-wider text-white">Featured Hero</span>
                        <span className="text-[8px] text-zinc-500 font-medium">Prioritize in search displays</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => { setSelectedItem(null); setIsAddingItem(false); }}
                    className="bg-zinc-900 hover:bg-zinc-850 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-400 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-brand-yellow hover:bg-yellow-500 text-black px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 font-sans"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Dish Specification</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="overflow-x-auto border border-white/[0.06] rounded-2xl bg-zinc-950">
                <table className="w-full text-left text-xs text-zinc-300 font-light select-none">
                  <thead className="bg-zinc-900 text-white border-b border-white/[0.06]">
                    <tr>
                      <th className="px-5 py-4 font-black uppercase tracking-wider text-[10px]">Dish Preview</th>
                      <th className="px-4 py-4 font-black uppercase tracking-wider text-[10px]">Assigned Category</th>
                      <th className="px-4 py-4 font-black uppercase tracking-wider text-[10px]">Price (ETB)</th>
                      <th className="px-4 py-4 font-black uppercase tracking-wider text-[10px]">Cooking Spec</th>
                      <th className="px-4 py-4 font-black uppercase tracking-wider text-[10px]">Features</th>
                      <th className="px-5 py-4 font-black uppercase tracking-wider text-[10px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {menuItems.map(item => (
                      <tr key={item.id} className="hover:bg-white/[0.01] transition-all">
                        {/* Preview and details */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-lg bg-zinc-900 overflow-hidden border border-white/5 shrink-0 shadow-inner">
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-white uppercase text-[11px] leading-tight">{item.name}</h4>
                              <p className="text-[9px] text-zinc-500 font-medium truncate max-w-xs mt-0.5">{item.ingredients || "No custom ingredients defined"}</p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-4 text-zinc-400 uppercase font-mono text-[10px] font-black">
                          {item.category}
                        </td>

                        {/* Price (integrated price management) */}
                        <td className="px-4 py-4 font-black text-brand-yellow font-mono">
                          {item.price.toFixed(2)} ETB
                        </td>

                        {/* Prep time/calories */}
                        <td className="px-4 py-4 text-zinc-400 font-mono text-[10px] space-y-0.5">
                          <div className="flex items-center gap-1 text-zinc-350 font-sans font-bold">⏱️ {item.prepTime || "N/A"}</div>
                          <div className="text-[9px] text-zinc-500 font-mono">🔥 {item.calories || "N/A"}</div>
                        </td>

                        {/* Badges/Features status */}
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1">
                            {item.isPopular && <span className="bg-brand-yellow/[0.08] text-brand-yellow border border-brand-yellow/15 text-[8px] font-black uppercase px-2 py-0.5 rounded-sm shadow-sm">Popular</span>}
                            {item.isChefPick && <span className="bg-brand-red/[0.08] text-brand-red border border-brand-red/15 text-[8px] font-black uppercase px-2 py-0.5 rounded-sm shadow-sm">Chef's Pick</span>}
                            {item.isFeatured && <span className="bg-cyan-400/[0.08] text-cyan-400 border border-cyan-400/15 text-[8px] font-black uppercase px-2 py-0.5 rounded-sm shadow-sm">Featured</span>}
                            {!item.isPopular && !item.isChefPick && !item.isFeatured && <span className="text-zinc-650 text-[9px]">Standard</span>}
                          </div>
                        </td>

                        {/* Action Operations */}
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <button
                              onClick={() => handleOpenEditItem(item)}
                              className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 hover:border-brand-yellow/30 hover:bg-brand-yellow/10 text-zinc-400 hover:text-brand-yellow flex items-center justify-center transition-all cursor-pointer"
                              title="Edit item specifications"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 hover:border-brand-red/30 hover:bg-brand-red/10 text-zinc-400 hover:text-brand-red flex items-center justify-center transition-all cursor-pointer"
                              title="Exterminate Dish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: RESTAURANT PROFILE INFO */}
        {activeTab === "restaurant" && (
          <form onSubmit={handleSaveInfo} className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-white/[0.06] rounded-2xl p-6 space-y-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-brand-yellow border-b border-white/[0.06] pb-3">
              RESTAURANT COPY & SENSORY STORYTELLING
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Mission */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">The Core Mission (Hero About text)</label>
                <textarea
                  rows={3}
                  value={infoForm.mission}
                  onChange={e => setInfoForm({ ...infoForm, mission: e.target.value })}
                  placeholder="Introduce your signature dining mission..."
                  className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30 resize-none leading-relaxed"
                />
              </div>

              {/* Journey details */}
              <div className="space-y-1.5 md:col-span-2 border-t border-white/[0.04] pt-4">
                <span className="text-[9.5px] font-black uppercase tracking-widest text-brand-yellow/80 font-mono">Our Journey Storyboard Steps</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">Step 1: The Foundation / Founder</label>
                <textarea
                  rows={3}
                  value={infoForm.journeyFounder}
                  onChange={e => setInfoForm({ ...infoForm, journeyFounder: e.target.value })}
                  className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30 resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">Step 2: Quality Assurance Standard</label>
                <textarea
                  rows={3}
                  value={infoForm.journeyQuality}
                  onChange={e => setInfoForm({ ...infoForm, journeyQuality: e.target.value })}
                  className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30 resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">Step 3: Signature Crafts (Bun/Dough/Patties)</label>
                <textarea
                  rows={3}
                  value={infoForm.journeyDough}
                  onChange={e => setInfoForm({ ...infoForm, journeyDough: e.target.value })}
                  className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30 resize-none leading-relaxed"
                />
              </div>

              {/* Operations and locations */}
              <div className="space-y-1.5 md:col-span-2 border-t border-white/[0.04] pt-4">
                <span className="text-[9.5px] font-black uppercase tracking-widest text-brand-yellow/80 font-mono">Operating Hours & Branch Location</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">Opening (Regular Working Hours)</label>
                <input
                  type="text"
                  value={infoForm.openingHours}
                  onChange={e => setInfoForm({ ...infoForm, openingHours: e.target.value })}
                  className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">Last Call (Kitchen Last Order)</label>
                <input
                  type="text"
                  value={infoForm.kitchenLastOrder}
                  onChange={e => setInfoForm({ ...infoForm, kitchenLastOrder: e.target.value })}
                  className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">Restaurant Branch Name</label>
                <input
                  type="text"
                  value={infoForm.locationName}
                  onChange={e => setInfoForm({ ...infoForm, locationName: e.target.value })}
                  className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">Complete Branch Address</label>
                <input
                  type="text"
                  value={infoForm.locationAddress}
                  onChange={e => setInfoForm({ ...infoForm, locationAddress: e.target.value })}
                  className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30"
                />
              </div>

              {/* Telephone & Email Coordinates */}
              <div className="space-y-1.5 md:col-span-2 border-t border-white/[0.04] pt-4">
                <span className="text-[9.5px] font-black uppercase tracking-widest text-brand-yellow/80 font-mono">Contact Coordinates</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">Phone Reservaton Line</label>
                <input
                  type="text"
                  value={infoForm.phone}
                  onChange={e => setInfoForm({ ...infoForm, phone: e.target.value })}
                  className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">Primary Support/Corporate Email</label>
                <input
                  type="email"
                  value={infoForm.email}
                  onChange={e => setInfoForm({ ...infoForm, email: e.target.value })}
                  className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30 font-mono"
                />
              </div>

              {/* Social links */}
              <div className="space-y-1.5 md:col-span-2 border-t border-white/[0.04] pt-4">
                <span className="text-[9.5px] font-black uppercase tracking-widest text-brand-yellow/80 font-mono">Social Outreach Channels (URLs)</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">Instagram Handle</label>
                <input
                  type="text"
                  value={infoForm.instagram}
                  onChange={e => setInfoForm({ ...infoForm, instagram: e.target.value })}
                  className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">Facebook Profile</label>
                <input
                  type="text"
                  value={infoForm.facebook}
                  onChange={e => setInfoForm({ ...infoForm, facebook: e.target.value })}
                  className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">TikTok Account</label>
                <input
                  type="text"
                  value={infoForm.tiktok}
                  onChange={e => setInfoForm({ ...infoForm, tiktok: e.target.value })}
                  className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">Telegram Outreach</label>
                <input
                  type="text"
                  value={infoForm.telegram}
                  onChange={e => setInfoForm({ ...infoForm, telegram: e.target.value })}
                  className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-5 border-t border-white/[0.06]">
              <button
                type="submit"
                className="bg-brand-yellow hover:bg-yellow-500 text-black px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 shadow-lg shadow-brand-yellow/10 font-sans"
              >
                <Save className="w-4 h-4" />
                <span>Publish Profile Specs</span>
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
