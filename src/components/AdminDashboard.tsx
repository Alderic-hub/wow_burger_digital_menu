import React, { useState, useEffect } from "react";
import { MenuItem, Category, RestaurantInfo, BankAccount } from "../types";
import { 
  loadMenuItems, saveMenuItems, 
  loadCategories, saveCategories, 
  loadRestaurantInfo, saveRestaurantInfo
} from "../dbService";
import { SUBCATEGORIES } from "../menuData";
import { 
  LayoutDashboard, FolderKanban, Utensils, Info, LogOut, 
  Plus, Trash2, Edit2, Check, QrCode, DollarSign, Image as ImageIcon, 
  Clock, Flame, Star, Save, Link as LinkIcon, RefreshCw, X, Eye, ThumbsUp,
  Sparkles, Users, Key, Sliders, Upload, ChevronLeft, ChevronRight, CheckCircle
} from "lucide-react";

interface AdminDashboardProps {
  onLogout: () => void;
  onRefreshPublicData: () => void;
}

type TabType = "overview" | "categories" | "items" | "restaurant" | "payments" | "settings";

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

  // Pagination & Filtering States for Menu Items Catalog
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilterCategory, setSelectedFilterCategory] = useState("all");
  const [selectedFilterTag, setSelectedFilterTag] = useState("all");
  const [sortBy, setSortBy] = useState("name_asc");
  const [adminCurrentPage, setAdminCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Password Management Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordStatusMsg, setPasswordStatusMsg] = useState({ type: "", text: "" });

  // Security Reset Email Simulation States
  const [activeGeneratedCode, setActiveGeneratedCode] = useState<string>("");
  const [enteredCode, setEnteredCode] = useState<string>("");
  const [simulatedEmailInbox, setSimulatedEmailInbox] = useState<{
    to: string;
    subject: string;
    body: string;
    code: string;
    receivedAt: string;
  } | null>(null);

  // Popular items curation search state & toggles
  const [popularSearch, setPopularSearch] = useState("");

  const handleTogglePopularSection = () => {
    const newVal = restaurantInfo.showPopularSection === false ? true : false;
    const updated = { ...restaurantInfo, showPopularSection: newVal };
    setRestaurantInfo(updated);
    setInfoForm(updated);
    saveRestaurantInfo(updated);
    triggerUpdate();
  };

  const handleToggleItemPopular = (itemId: string) => {
    const updated = menuItems.map(item => {
      if (item.id === itemId) {
        return { ...item, isPopular: !item.isPopular };
      }
      return item;
    });
    setMenuItems(updated);
    saveMenuItems(updated);
    triggerUpdate();
  };

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

  // Bank Account Managing states
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [bankForm, setBankForm] = useState<Partial<BankAccount>>({
    bankName: "",
    accountNumber: "",
    accountHolder: "WOW BURGER PLC",
    qrCodeUrl: "",
    logoUrl: "",
    isActive: true
  });

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankForm.bankName || !bankForm.accountNumber) {
      alert("Please provide bank name and account number.");
      return;
    }

    const currentBanks = infoForm.bankAccounts || [];
    let updatedBanks: BankAccount[];

    if (editingBankId && editingBankId !== "new") {
      updatedBanks = currentBanks.map(b => b.id === editingBankId ? {
        id: b.id,
        bankName: bankForm.bankName || "",
        accountNumber: bankForm.accountNumber || "",
        accountHolder: bankForm.accountHolder || "",
        qrCodeUrl: bankForm.qrCodeUrl || "",
        logoUrl: bankForm.logoUrl || "",
        isActive: bankForm.isActive !== false
      } : b);
    } else {
      const newBank: BankAccount = {
        id: "bank-" + Math.random().toString(36).substr(2, 9),
        bankName: bankForm.bankName || "",
        accountNumber: bankForm.accountNumber || "",
        accountHolder: bankForm.accountHolder || "",
        qrCodeUrl: bankForm.qrCodeUrl || "",
        logoUrl: bankForm.logoUrl || "",
        isActive: bankForm.isActive !== false
      };
      updatedBanks = [...currentBanks, newBank];
    }

    setInfoForm(prev => ({
      ...prev,
      bankAccounts: updatedBanks
    }));
    setEditingBankId(null);
    setBankForm({
      bankName: "",
      accountNumber: "",
      accountHolder: "WOW BURGER PLC",
      qrCodeUrl: "",
      logoUrl: "",
      isActive: true
    });
  };

  const handleEditBankClick = (bank: BankAccount) => {
    setEditingBankId(bank.id);
    setBankForm({ ...bank });
  };

  const handleDeleteBankClick = (bankId: string) => {
    if (confirm("Are you sure you want to delete this bank account?")) {
      const currentBanks = infoForm.bankAccounts || [];
      const updatedBanks = currentBanks.filter(b => b.id !== bankId);
      setInfoForm(prev => ({
        ...prev,
        bankAccounts: updatedBanks
      }));
    }
  };

  // --- PASSWORD UPDATE & IDENTITY LOGIC ---
  const handleSendVerificationCode = () => {
    const targetEmail = restaurantInfo.adminEmail || "admin@wowburger.et";
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    setActiveGeneratedCode(code);
    setSimulatedEmailInbox({
      to: targetEmail,
      subject: "🔑 WOW Burger - Admin Password Reset Code Request",
      body: `You are receiving this email because a request was initiated from the Administrative Panel to change the account password.

Your secure 6-digit administrative verification code is: ${code}

If you did not request this, please verify that system security parameters are healthy.`,
      code,
      receivedAt: new Date().toLocaleTimeString()
    });

    setPasswordStatusMsg({
      type: "success",
      text: `A safe 6-digit verification code has been dispatched to ${targetEmail}!`
    });
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatusMsg({ type: "", text: "" });

    if (!activeGeneratedCode) {
      setPasswordStatusMsg({ type: "error", text: "Please request a verification email code first!" });
      return;
    }

    if (enteredCode !== activeGeneratedCode) {
      setPasswordStatusMsg({ type: "error", text: "Invalid verification code! Please check your administration email inbox closely." });
      return;
    }

    if (passwordForm.newPassword.length < 4) {
      setPasswordStatusMsg({ type: "error", text: "New password must be at least 4 characters long." });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatusMsg({ type: "error", text: "New passwords do not match!" });
      return;
    }

    // Save updated credentials to LocalStorage
    localStorage.setItem("wow_admin_password", passwordForm.newPassword);
    
    // Save updated credentials permanently to Firestore
    const updatedInfo = { 
      ...restaurantInfo, 
      adminPassword: passwordForm.newPassword 
    };

    setRestaurantInfo(updatedInfo);
    setInfoForm(updatedInfo);

    saveRestaurantInfo(updatedInfo).then(() => {
      if (onRefreshPublicData) {
        onRefreshPublicData();
      }
    });

    setPasswordStatusMsg({ 
      type: "success", 
      text: "Administrative authorization successful! Password updated permanently." 
    });

    // Reset forms and codes
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setEnteredCode("");
    setActiveGeneratedCode("");
    setSimulatedEmailInbox(null);
  };

  // --- IMAGE UPLOAD & CANVAS RESIZING SYSTEM ---
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, isForCarouselIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgObj = new Image();
      imgObj.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 500; // Optimal performance scaling for Firestore & client frame rates
        let width = imgObj.width;
        let height = imgObj.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(imgObj, 0, 0, width, height);
          const base64 = canvas.toDataURL("image/jpeg", 0.75); // Compressed JPEG base64

          if (isForCarouselIndex !== undefined) {
            const currentImages = [...(itemForm.images || [])];
            if (isForCarouselIndex === -1) {
              setItemForm(prev => ({
                ...prev,
                images: [...(prev.images || []), base64]
              }));
            } else {
              currentImages[isForCarouselIndex] = base64;
              setItemForm(prev => ({
                ...prev,
                images: currentImages
              }));
            }
          } else {
            setItemForm(prev => ({ ...prev, image: base64 }));
          }
        }
      };
      imgObj.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCategoryThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgObj = new Image();
      imgObj.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 150;
        canvas.height = 150;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(imgObj, 0, 0, 150, 150);
          const base64 = canvas.toDataURL("image/jpeg", 0.7);
          setCategoryForm(prev => ({ ...prev, thumbnail: base64 }));
        }
      };
      imgObj.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleProfileLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgObj = new Image();
      imgObj.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 180;
        canvas.height = 180;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(imgObj, 0, 0, 180, 180);
          const base64 = canvas.toDataURL("image/jpeg", 0.85);
          setInfoForm(prev => ({ ...prev, logoUrl: base64 }));
        }
      };
      imgObj.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleProfileBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgObj = new Image();
      imgObj.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 1000;
        canvas.height = 400;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(imgObj, 0, 0, 1000, 400);
          const base64 = canvas.toDataURL("image/jpeg", 0.75);
          setInfoForm(prev => ({ ...prev, bannerUrl: base64 }));
        }
      };
      imgObj.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

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
    const randomId = "item_" + Math.random().toString(36).substr(2, 9);
    setSelectedItem(null);
    setItemForm({
      id: randomId,
      name: "",
      price: 500,
      ingredients: "",
      category: categories[0]?.id || "Burger",
      subcategory: (categories[0] ? SUBCATEGORIES[categories[0].id]?.[0] : "") || "Classic Burger",
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

    const catId = categoryForm.id || categoryForm.label.trim().replace(/\s+/g, '_');
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

  const handleSaveBanks = (e: React.FormEvent) => {
    e.preventDefault();
    setRestaurantInfo(infoForm);
    saveRestaurantInfo(infoForm);
    alert("Bank Transfer Accounts & Wallets successfully updated!");
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
            <button
              onClick={() => { setActiveTab("payments"); setSelectedItem(null); setSelectedCategory(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === "payments" ? "bg-brand-yellow text-black shadow-lg shadow-brand-yellow/10" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"}`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Banking & Wallets</span>
            </button>
            <button
              onClick={() => { setActiveTab("settings"); setSelectedItem(null); setSelectedCategory(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === "settings" ? "bg-brand-yellow text-black shadow-lg shadow-brand-yellow/10" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"}`}
            >
              <Key className="w-4 h-4" />
              <span>Credentials & Password</span>
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
              {activeTab === "payments" && "BANKING & MOBILE WALLETS"}
              {activeTab === "settings" && "SYSTEM ACCESS CREDENTIALS"}
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

              {/* Most Popular Feature Management Panel */}
              <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-white/[0.08] rounded-2xl p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.05] pb-4 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-yellow/10 flex items-center justify-center text-brand-yellow">
                      <Flame className="w-4.5 h-4.5 text-brand-yellow" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-white leading-none">
                        Most Popular Section Settings
                      </h3>
                      <p className="text-[10px] text-zinc-500 mt-1">Curation & Display Controls</p>
                    </div>
                  </div>

                  {/* Switch/Toggle to show/hide */}
                  <button
                    type="button"
                    onClick={handleTogglePopularSection}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all flex items-center gap-2 cursor-pointer ${
                      restaurantInfo.showPopularSection !== false
                        ? "bg-brand-yellow/10 border-brand-yellow/30 text-brand-yellow hover:bg-brand-yellow/15"
                        : "bg-zinc-900 border-white/5 text-zinc-500 hover:text-zinc-400"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${restaurantInfo.showPopularSection !== false ? "bg-brand-yellow animate-pulse" : "bg-zinc-600"}`} />
                    <span>{restaurantInfo.showPopularSection !== false ? "Visible to customers" : "Hidden on Menu"}</span>
                  </button>
                </div>

                {/* Search query inside popular curations */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wide">
                      Curated Popular Dishes ({menuItems.filter(i => i.isPopular).length})
                    </span>
                    <input
                      type="text"
                      value={popularSearch}
                      onChange={(e) => setPopularSearch(e.target.value)}
                      placeholder="Filter dishes..."
                      className="bg-zinc-950 border border-white/[0.08] rounded-lg px-3 py-1 text-[11px] text-white focus:outline-none focus:border-brand-yellow w-36 sm:w-44 font-sans"
                    />
                  </div>

                  {/* Scrollable list of items */}
                  <div className="max-h-[220px] overflow-y-auto divide-y divide-white/[0.03] pr-1.5 scrollbar-thin scrollbar-thumb-zinc-800">
                    {menuItems
                      .filter(item => {
                        if (!popularSearch.trim()) return true;
                        return item.name.toLowerCase().includes(popularSearch.toLowerCase());
                      })
                      .map((item) => {
                        const isPop = item.isPopular === true;
                        return (
                          <div
                            key={`popular-settings-${item.id}`}
                            className="flex items-center justify-between py-2 text-zinc-300 hover:bg-white/[0.01] transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-8 h-8 rounded object-cover border border-white/5 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div className="min-w-0">
                                <h4 className="text-[11px] font-black text-white uppercase truncate max-w-[120px] sm:max-w-[200px]">
                                  {item.name}
                                </h4>
                                <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-mono font-bold block">
                                  {item.category} • {item.price.toFixed(2)} Br
                                </span>
                              </div>
                            </div>

                            {/* Checkbox toggle popular status */}
                            <button
                              type="button"
                              onClick={() => handleToggleItemPopular(item.id)}
                              className={`px-3 py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-widest transition-all cursor-pointer border ${
                                isPop
                                  ? "bg-brand-red/10 border-brand-red/30 text-brand-red hover:bg-brand-red/15"
                                  : "bg-zinc-900 border-white/[0.04] text-zinc-500 hover:text-zinc-300 hover:border-white/10"
                              }`}
                            >
                              {isPop ? "🔥 Remove" : "+ Popular"}
                            </button>
                          </div>
                        );
                      })}
                  </div>
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
                    <div className="mt-2 text-left">
                      <label className="inline-flex items-center gap-2 cursor-pointer bg-zinc-900 border border-white/5 hover:border-brand-yellow/30 text-zinc-300 hover:text-white rounded-xl px-3.5 py-2 text-xs font-sans font-bold transition-style">
                        <Upload className="w-3.5 h-3.5 text-brand-yellow" />
                        <span>Upload Thumbnail</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCategoryThumbnailChange}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[8px] text-zinc-500 block mt-1">Saves as local compressed inline asset</span>
                    </div>
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
                      value={itemForm.category || "Burger"}
                      onChange={e => {
                        const newCat = e.target.value;
                        const subList = SUBCATEGORIES[newCat] || [];
                        setItemForm({
                          ...itemForm,
                          category: newCat,
                          subcategory: subList[0] || ""
                        });
                      }}
                      className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30 font-mono"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategory Assignment */}
                  <div className="space-y-1.5 font-sans">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">Assigned Subcategory *</label>
                    <select
                      value={itemForm.subcategory || (SUBCATEGORIES[itemForm.category || ""]?.[0] || "")}
                      onChange={e => setItemForm({...itemForm, subcategory: e.target.value})}
                      className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/30 font-mono"
                    >
                      {(SUBCATEGORIES[itemForm.category || ""] || []).map(s => (
                        <option key={s} value={s}>{s}</option>
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
                    {/* Image File Selector */}
                    <div className="mt-2 text-left">
                      <label className="inline-flex items-center gap-2 cursor-pointer bg-zinc-900 border border-white/5 hover:border-brand-yellow/30 text-zinc-300 hover:text-white rounded-xl px-3.5 py-2.5 text-xs transition-style font-sans font-bold">
                        <Upload className="w-3.5 h-3.5 text-brand-yellow" />
                        <span>Upload Image File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageFileChange(e)}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[8px] text-zinc-500 block mt-1">Compressed & cached locally</span>
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
                        <div className="w-full h-full flex items-center justify-center text-zinc-700 font-mono text-[9px]">NA</div>
                      )}
                    </div>
                    <div className="overflow-hidden text-left">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Real-time Image Preview</span>
                      <span className="text-[8px] text-brand-yellow font-mono truncate block max-w-[120px]">{itemForm.image ? "Address Configured" : "No Address Added"}</span>
                    </div>
                  </div>

                  {/* Additional Carousel Images */}
                  <div className="md:col-span-3 bg-zinc-950/20 p-4 border border-white/5 rounded-2xl space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                      Additional Carousel Images ({itemForm.images?.length || 0}) / Optional
                    </label>
                    <div className="flex flex-wrap gap-2.5 items-center">
                      {(itemForm.images || []).map((img, idx) => (
                        <div key={idx} className="relative w-14 h-14 bg-zinc-900 rounded-lg overflow-hidden border border-white/5 group shadow">
                          <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (itemForm.images || []).filter((_, i) => i !== idx);
                              setItemForm(prev => ({ ...prev, images: updated }));
                            }}
                            className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-brand-red font-bold"
                            title="Remove Image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <label className="w-14 h-14 bg-zinc-950 border border-dashed border-white/10 hover:border-brand-yellow/20 rounded-lg flex flex-col items-center justify-center text-zinc-500 hover:text-brand-yellow text-center p-1 cursor-pointer transition-all">
                        <Plus className="w-3.5 h-3.5" />
                        <span className="text-[8px] font-black uppercase mt-1">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageFileChange(e, -1)}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <span className="text-[9px] text-zinc-500 block">Upload multiple additional photos of this dish for the details carousel.</span>
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
              <div className="space-y-4 text-left">
                {/* Advanced Filtering & Sorting Section */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-white/[0.04] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Search input field */}
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Search dishes</label>
                    <input
                      type="text"
                      placeholder="Search items or ingredients..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setAdminCurrentPage(1); }}
                      className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-yellow font-sans leading-tight"
                    />
                  </div>

                  {/* Category dropdown selector */}
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Specific Category</label>
                    <select
                      value={selectedFilterCategory}
                      onChange={(e) => { setSelectedFilterCategory(e.target.value); setAdminCurrentPage(1); }}
                      className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-yellow font-sans cursor-pointer"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Feature Tag selector */}
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Highlight Tag</label>
                    <select
                      value={selectedFilterTag}
                      onChange={(e) => { setSelectedFilterTag(e.target.value); setAdminCurrentPage(1); }}
                      className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-yellow font-sans cursor-pointer"
                    >
                      <option value="all">All Specialties</option>
                      <option value="popular">Popular Dishes</option>
                      <option value="chef">Chef's Specialty</option>
                      <option value="featured">Featured Hero Section</option>
                    </select>
                  </div>

                  {/* Analytics Sorting selector */}
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider font-mono text-brand-yellow">Sort Order</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-brand-yellow focus:outline-none focus:border-brand-yellow font-sans font-bold cursor-pointer"
                    >
                      <option value="name_asc">Name (A to Z)</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="views_desc">⚡ View Analytics (Highest Views)</option>
                      <option value="rating_desc">★ Customer Rating (Highest First)</option>
                    </select>
                  </div>
                </div>

                {/* Sub-calculated fields */}
                {(() => {
                  const filteredItems = menuItems.filter(item => {
                    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                          (item.ingredients && item.ingredients.toLowerCase().includes(searchTerm.toLowerCase()));
                    const matchesCategory = selectedFilterCategory === "all" || item.category === selectedFilterCategory;
                    let matchesTag = true;
                    if (selectedFilterTag === "popular") matchesTag = !!item.isPopular;
                    else if (selectedFilterTag === "chef") matchesTag = !!item.isChefPick;
                    else if (selectedFilterTag === "featured") matchesTag = !!item.isFeatured;
                    return matchesSearch && matchesCategory && matchesTag;
                  });

                  const sortedItems = [...filteredItems].sort((a, b) => {
                    if (sortBy === "price_asc") return a.price - b.price;
                    if (sortBy === "price_desc") return b.price - a.price;
                    if (sortBy === "views_desc") return (b.viewCount || 0) - (a.viewCount || 0);
                    if (sortBy === "rating_desc") return (b.rating || 0) - (a.rating || 0);
                    return a.name.localeCompare(b.name);
                  });

                  const totalItems = sortedItems.length;
                  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
                  const activePage = Math.min(adminCurrentPage, totalPages);
                  const startIndex = (activePage - 1) * itemsPerPage;
                  const paginatedItems = sortedItems.slice(startIndex, startIndex + itemsPerPage);

                  return (
                    <>
                      <div className="overflow-x-auto border border-white/[0.06] rounded-2xl bg-zinc-950">
                        <table className="w-full text-left text-xs text-zinc-300 font-light select-none">
                          <thead className="bg-zinc-900 border-b border-white/[0.06] text-white">
                            <tr>
                              <th className="px-5 py-4 font-black uppercase tracking-wider text-[10px]">Dish Preview</th>
                              <th className="px-4 py-4 font-black uppercase tracking-wider text-[10px]">Assigned Category</th>
                              <th className="px-4 py-4 font-black uppercase tracking-wider text-[10px]">Price (ETB)</th>
                              <th className="px-4 py-4 font-black uppercase tracking-wider text-[10px]">View Analytics</th>
                              <th className="px-4 py-4 font-black uppercase tracking-wider text-[10px]">Features</th>
                              <th className="px-5 py-4 font-black uppercase tracking-wider text-[10px] text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.04]">
                            {paginatedItems.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="text-center py-10 text-zinc-500 text-xs font-sans font-bold">
                                  No dishes found matching the active configuration.
                                </td>
                              </tr>
                            ) : (
                              paginatedItems.map(item => (
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

                                  {/* Price */}
                                  <td className="px-4 py-4 font-black text-brand-yellow font-mono">
                                    {item.price.toFixed(2)} ETB
                                  </td>

                                  {/* View Counts and rating */}
                                  <td className="px-4 py-4 text-zinc-400 font-mono text-[10px] space-y-0.5">
                                    <div className="flex items-center gap-1 text-zinc-350 font-sans font-bold">
                                      ⏱️ {item.prepTime || "N/A"}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[9px] font-bold py-0.5 px-1.5 rounded bg-zinc-900 border border-white/5 w-fit text-brand-yellow font-mono">
                                      ⚡ {item.viewCount || 0} Views
                                    </div>
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
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Control Toolbar Block */}
                      {totalPages > 1 && (
                        <div className="bg-zinc-950 p-4 border border-white/[0.04] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-mono">
                            Page <span className="text-white">{activePage}</span> of <span className="text-white">{totalPages}</span> ({totalItems} Discovered Dishes)
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setAdminCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={activePage === 1}
                              className="w-8 h-8 rounded-lg border border-white/5 bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none transition-style cursor-pointer"
                              title="Previous Page"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>

                            {Array.from({ length: totalPages }).map((_, idx) => {
                              const pNum = idx + 1;
                              return (
                                <button
                                  key={pNum}
                                  onClick={() => setAdminCurrentPage(pNum)}
                                  className={`w-8 h-8 rounded-lg text-xs font-mono font-black ${
                                    activePage === pNum 
                                      ? "bg-brand-yellow text-black border-brand-yellow/35 shadow-lg shadow-brand-yellow/5"
                                      : "bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white"
                                  } transition-style cursor-pointer`}
                                >
                                  {pNum}
                                </button>
                              );
                            })}

                            <button
                              onClick={() => setAdminCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              disabled={activePage === totalPages}
                              className="w-8 h-8 rounded-lg border border-white/5 bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none transition-style cursor-pointer"
                              title="Next Page"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">Limit</span>
                            <select
                              value={itemsPerPage}
                              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setAdminCurrentPage(1); }}
                              className="bg-zinc-900 border border-white/5 rounded-lg px-2 py-1 text-xs text-white"
                            >
                              <option value="5">5</option>
                              <option value="10">10</option>
                              <option value="20">20</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
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
              
              {/* Brand Logo & Banner Customization */}
              <div className="space-y-1.5 md:col-span-2">
                <span className="text-[9.5px] font-black uppercase tracking-widest text-brand-yellow/80 font-mono">Brand Identity Visual Customization</span>
              </div>

              {/* brand logo Url / upload */}
              <div className="space-y-1.5 bg-zinc-950 p-4 border border-white/[0.04] rounded-xl flex flex-col md:flex-row gap-4 items-center">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-brand-yellow shrink-0 bg-neutral-900 flex items-center justify-center">
                  {infoForm.logoUrl ? (
                    <img src={infoForm.logoUrl} alt="Logo preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[9px] text-zinc-550 font-black uppercase font-mono">No Custom Logo</span>
                  )}
                </div>
                <div className="flex-1 w-full space-y-2 text-left">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">Custom Restaurant Brand Logo</label>
                    <label className="bg-brand-yellow/10 hover:bg-brand-yellow/20 text-brand-yellow px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer">
                      <span>Upload Logo File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileLogoChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={infoForm.logoUrl || ""}
                    onChange={e => setInfoForm({ ...infoForm, logoUrl: e.target.value })}
                    placeholder="Or enter brand logo image web URL..."
                    className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-yellow"
                  />
                </div>
              </div>

              {/* brand banner Url / upload */}
              <div className="space-y-1.5 bg-zinc-950 p-4 border border-white/[0.04] rounded-xl flex flex-col md:flex-row gap-4 items-center">
                <div className="w-24 h-16 rounded-lg overflow-hidden border border-white/[0.08] shrink-0 bg-neutral-900 flex items-center justify-center">
                  {infoForm.bannerUrl ? (
                    <img src={infoForm.bannerUrl} alt="Banner preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[9px] text-zinc-550 font-black uppercase font-mono">No Custom Banner</span>
                  )}
                </div>
                <div className="flex-1 w-full space-y-2 text-left">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">Restaurant Hero Banner Image</label>
                    <label className="bg-brand-yellow/10 hover:bg-brand-yellow/20 text-brand-yellow px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer">
                      <span>Upload Banner File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileBannerChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={infoForm.bannerUrl || ""}
                    onChange={e => setInfoForm({ ...infoForm, bannerUrl: e.target.value })}
                    placeholder="Or enter hero banner image web URL..."
                    className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-yellow"
                  />
                </div>
              </div>

              {/* Mission */}
              <div className="space-y-1.5 md:col-span-2 border-t border-white/[0.04] pt-4 text-left">
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

              <div className="space-y-1.5 font-mono">
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

        {/* Tab 5: BANKING & MOBILE MONEY SETUP */}
        {activeTab === "payments" && (
          <form onSubmit={handleSaveBanks} className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-white/[0.06] rounded-2xl p-6 space-y-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-brand-yellow border-b border-white/[0.06] pb-3">
              BANK TRANSFER ACCOUNTS & MOBILE MONEY
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] font-black uppercase tracking-widest text-brand-yellow font-mono flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Bank Transfer Accounts & Mobile Money</span>
                  </span>
                  <span className="text-[9px] text-zinc-500 mt-0.5">Configure bank accounts shown to customers on the digital menu.</span>
                </div>
                {editingBankId === null && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBankId("new");
                      setBankForm({ bankName: "", accountNumber: "", accountHolder: "WOW BURGER PLC", qrCodeUrl: "", logoUrl: "", isActive: true });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow text-[9px] font-black uppercase tracking-wider hover:bg-brand-yellow hover:text-black transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Bank/Wallet</span>
                  </button>
                )}
              </div>

              {/* Inline Bank Form if editing or adding */}
              {editingBankId !== null && (
                <div className="bg-zinc-950 border border-brand-yellow/30 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-white/[0.04] pb-2.5 mb-2">
                    <span className="text-[10px] font-black text-brand-yellow uppercase tracking-widest font-mono">
                      {editingBankId === "new" ? "➕ Add New Transfer Option" : "✏️ Edit Bank Option"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingBankId(null)}
                      className="text-zinc-500 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">Bank / Wallet Name</label>
                      <input
                        type="text"
                        required
                        value={bankForm.bankName}
                        onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })}
                        placeholder="e.g. Commercial Bank of Ethiopia (CBE) or Telebirr"
                        className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-yellow"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">Account / Phone Number</label>
                      <input
                        type="text"
                        required
                        value={bankForm.accountNumber}
                        onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                        placeholder="e.g. 1000123456789 or 0911000000"
                        className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-yellow font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">Account Holder Name</label>
                      <input
                        type="text"
                        value={bankForm.accountHolder}
                        onChange={e => setBankForm({ ...bankForm, accountHolder: e.target.value })}
                        placeholder="e.g. WOW BURGER PLC"
                        className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-yellow"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">QR Code Image URL (Optional)</label>
                      <input
                        type="text"
                        value={bankForm.qrCodeUrl || ""}
                        onChange={e => setBankForm({ ...bankForm, qrCodeUrl: e.target.value })}
                        placeholder="e.g. https://domain.com/cbe-qr.png"
                        className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-yellow font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">Bank logo Image URL (Optional)</label>
                      <input
                        type="text"
                        value={bankForm.logoUrl || ""}
                        onChange={e => setBankForm({ ...bankForm, logoUrl: e.target.value })}
                        placeholder="e.g. https://domain.com/cbe-logo.png"
                        className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-yellow font-mono"
                      />
                    </div>

                    <div className="flex items-center gap-2 sm:col-span-2 py-1">
                      <input
                        type="checkbox"
                        id="bank_is_active"
                        checked={bankForm.isActive !== false}
                        onChange={e => setBankForm({ ...bankForm, isActive: e.target.checked })}
                        className="rounded border-zinc-800 bg-zinc-900 text-brand-yellow focus:ring-brand-yellow/30"
                      />
                      <label htmlFor="bank_is_active" className="text-[10px] uppercase font-black text-zinc-300 select-none cursor-pointer">
                        Active & Visible on Customer Menu
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.04]">
                    <button
                      type="button"
                      onClick={() => setEditingBankId(null)}
                      className="px-4 py-2 rounded-xl bg-zinc-900 border border-white/5 hover:bg-zinc-850 text-zinc-400 text-[10px] font-black uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveBank}
                      className="px-5 py-2 rounded-xl bg-brand-yellow hover:bg-yellow-500 text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Apply Account Specs</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Bank list display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(infoForm.bankAccounts && infoForm.bankAccounts.length > 0) ? (
                  infoForm.bankAccounts.map((bank) => (
                    <div
                      key={bank.id}
                      className={`p-4 border rounded-2xl flex flex-col justify-between gap-4 transition-all ${
                        bank.isActive 
                          ? "border-white/[0.08] bg-zinc-950/80 shadow-md shadow-black/50" 
                          : "border-white/[0.02] opacity-50 bg-zinc-950/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 w-8 h-8 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 flex items-center justify-center shrink-0">
                          <DollarSign className="w-4 h-4 text-brand-yellow" />
                        </div>
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-black text-white uppercase tracking-wide truncate">{bank.bankName}</h4>
                            {bank.isActive ? (
                              <span className="text-[7.5px] bg-green-500/10 text-green-400 border border-green-500/20 px-1 rounded uppercase tracking-widest font-black">Active</span>
                            ) : (
                              <span className="text-[7.5px] bg-zinc-850 text-zinc-500 px-1 rounded uppercase tracking-widest font-black">Hold</span>
                            )}
                          </div>
                          <p className="text-[12px] font-mono font-black text-brand-yellow tracking-wider truncate">{bank.accountNumber}</p>
                          {bank.accountHolder && (
                            <p className="text-[8.5px] text-zinc-500 font-bold uppercase">Holder: {bank.accountHolder}</p>
                          )}
                          {bank.qrCodeUrl && (
                            <p className="text-[8px] text-zinc-400 font-mono mt-1 opacity-75 truncate" title={bank.qrCodeUrl}>QR: {bank.qrCodeUrl}</p>
                          )}
                          {bank.logoUrl && (
                            <p className="text-[8px] text-zinc-400 font-mono opacity-75 truncate" title={bank.logoUrl}>Logo: {bank.logoUrl}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 border-t border-white/[0.04] pt-2 justify-end">
                        <button
                          type="button"
                          onClick={() => handleEditBankClick(bank)}
                          className="p-1.5 bg-zinc-900 hover:bg-zinc-850 border border-white/5 hover:border-white/10 rounded-xl text-zinc-300 hover:text-white transition-all cursor-pointer"
                          title="Edit bank specifications"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBankClick(bank.id)}
                          className="p-1.5 bg-brand-red/10 border border-brand-red/15 hover:bg-brand-red/15 rounded-xl text-brand-red transition-all cursor-pointer"
                          title="Delete transfer system"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-24 flex flex-col items-center justify-center text-center rounded-2xl bg-zinc-950/40 border border-white/[0.04] sm:col-span-2">
                    <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">No Bank Transfer Options Configured</p>
                    <p className="text-[8px] text-zinc-600 mt-1">Click the button in the upper right to setup a CBE/Telebirr account.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-5 border-t border-white/[0.06]">
              <button
                type="submit"
                className="bg-brand-yellow hover:bg-yellow-500 text-black px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 shadow-lg shadow-brand-yellow/10 font-sans"
              >
                <Save className="w-4 h-4" />
                <span>Publish Bank Transfer Setup</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 7: CUSTOM PASSWORD CHANGE INTERFACE */}
        {activeTab === "settings" && (
          <div className="max-w-xl mx-auto space-y-6 text-left">
            {/* Live Profile Credentials Summary Block */}
            <div className="bg-zinc-950 p-6 border border-white/[0.05] rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-[10px] text-brand-yellow font-black uppercase tracking-wider font-mono">Current Administrative Account Profile</span>
                <h4 className="text-sm font-black text-white uppercase tracking-tight mt-1">
                  Active Admin Email: <span className="text-brand-yellow lowercase font-mono font-bold">{restaurantInfo.adminEmail || "admin@wowburger.et"}</span>
                </h4>
                <p className="text-[9px] text-zinc-550 mt-1 leading-relaxed">
                  To secure dashboard credentials, users can request a secure 6-digit numeric authentication pass-key sent directly to the email registered in the database file.
                </p>
              </div>
            </div>

            {/* Simulated Admin Mailbox Console Panel */}
            {simulatedEmailInbox && (
              <div className="bg-zinc-900 border border-brand-yellow/30 rounded-2xl p-4 space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-yellow opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-yellow"></span>
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-brand-yellow font-mono">Simulated administrator email terminal</span>
                  </div>
                  <span className="text-[8px] font-mono text-zinc-500">Received at {simulatedEmailInbox.receivedAt}</span>
                </div>
                
                <div className="bg-black/40 rounded-xl p-3.5 space-y-2 border border-white/[0.03] text-xs">
                  <div className="grid grid-cols-6 gap-1 text-[10px] border-b border-white/[0.04] pb-1.5 font-mono text-zinc-400">
                    <span className="font-extrabold uppercase col-span-1">To:</span>
                    <span className="col-span-5 text-white lowercase">{simulatedEmailInbox.to}</span>
                    <span className="font-extrabold uppercase col-span-1">From:</span>
                    <span className="col-span-5 text-zinc-300">security@wowburger-internal.net</span>
                    <span className="font-extrabold uppercase col-span-1">Subject:</span>
                    <span className="col-span-5 text-brand-yellow font-bold text-[9.5px]">{simulatedEmailInbox.subject}</span>
                  </div>
                  
                  <p className="text-[10px] text-zinc-300 leading-normal font-sans py-1 whitespace-pre-line">
                    {simulatedEmailInbox.body}
                  </p>

                  <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
                    <span className="text-[9px] text-zinc-500 font-mono">Use this 6-digit code to finalize credential update below.</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEnteredCode(simulatedEmailInbox.code);
                        alert(`Code '${simulatedEmailInbox.code}' has been auto-copied and entered!`);
                      }}
                      className="bg-brand-yellow/15 hover:bg-brand-yellow/25 text-brand-yellow px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Auto-Copy Code
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Reset dispatch buttons card */}
              <div className="md:col-span-5 bg-zinc-950 p-5 rounded-2xl border border-white/[0.05] space-y-4">
                <span className="text-[9px] uppercase font-bold text-zinc-500 block tracking-widest font-mono">System Reset Authorization</span>
                <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
                  The admin password update requires email validation. Click below to generate and dispatch the authentication pass-key code message.
                </p>
                <button
                  type="button"
                  onClick={handleSendVerificationCode}
                  className="w-full bg-zinc-900 hover:bg-brand-yellow hover:text-black border border-white/5 text-xs font-black uppercase tracking-wider py-3.5 rounded-xl transition-all cursor-pointer text-white shadow-md active:scale-98 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{activeGeneratedCode ? "Regenerate Code" : "Send Verification Email"}</span>
                </button>
              </div>

              {/* Main Submit update Credentials Card */}
              <form onSubmit={handleSavePassword} className="md:col-span-7 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-brand-yellow/20 rounded-2xl p-6 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-brand-yellow border-b border-white/[0.06] pb-3 mb-1">
                  Authorize & Update Password
                </h3>

                {passwordStatusMsg.text && (
                  <div className={`p-3 rounded-xl border text-[10px] font-sans font-bold flex items-center gap-2 ${
                    passwordStatusMsg.type === "success" 
                      ? "bg-green-500/10 border-green-500/25 text-green-400" 
                      : "bg-brand-red/10 border-brand-red/25 text-brand-red"
                  }`}>
                    {passwordStatusMsg.type === "success" ? <CheckCircle className="w-3.5 h-3.5 shrink-0" /> : <X className="w-3.5 h-3.5 shrink-0" />}
                    <span>{passwordStatusMsg.text}</span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Verification Code input field */}
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-zinc-400 tracking-wider flex items-center justify-between">
                      <span>6-Digit Verification Code *</span>
                      <span className="text-brand-yellow lowercase font-mono">Required</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter the 6-digit code received"
                      className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-yellow font-mono text-center tracking-widest text-[13px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-zinc-400 tracking-wider">New Administrative Password *</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Minimum 4 characters"
                      className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-yellow font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-zinc-400 tracking-wider">Confirm New Password *</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Re-type new password"
                      className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-yellow font-sans"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.04]">
                  <button
                    type="submit"
                    className="w-full bg-brand-yellow hover:bg-yellow-500 text-black px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-brand-yellow/5 active:scale-98"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Verify & Update Password</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
