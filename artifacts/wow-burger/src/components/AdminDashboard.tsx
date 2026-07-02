import React, { useState, useEffect } from "react";
// @ts-ignore
import wowBurgerLogo from "../assets/images/wow_burger_logo_1781154696795.png";
import { MenuItem, Category, RestaurantInfo, BankAccount } from "../types";
import { 
  loadMenuItems, saveMenuItems, 
  loadCategories, saveCategories, 
  loadRestaurantInfo, saveRestaurantInfo,
  updateRemoteAdminCredentials, getRemoteRestaurantInfo
} from "../dbService";
import { SUBCATEGORIES } from "../menuData";
import { 
  LayoutDashboard, FolderKanban, Utensils, Info, LogOut, 
  Plus, Trash2, Edit2, Check, QrCode, DollarSign, Image as ImageIcon, 
  Clock, Flame, Star, Save, Link as LinkIcon, RefreshCw, X, Eye, ThumbsUp, HelpCircle,
  Sparkles, Users, Key, Sliders, Upload, ChevronLeft, ChevronRight, CheckCircle,
  Menu, ArrowLeft, Mail
} from "lucide-react";

interface AdminDashboardProps {
  onLogout: () => void;
  onRefreshPublicData: () => void;
  restaurantInfo?: RestaurantInfo;
}

type TabType = "overview" | "categories" | "items" | "restaurant" | "payments" | "settings";

export default function AdminDashboard({ onLogout, onRefreshPublicData, restaurantInfo: propRestaurantInfo }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  // Data States
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => loadMenuItems());
  const [categories, setCategories] = useState<Category[]>(() => loadCategories());
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo>(() => propRestaurantInfo || loadRestaurantInfo());
  
  // Selection / Editing States
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [inspectingItem, setInspectingItem] = useState<MenuItem | null>(null);

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
    confirmPassword: "",
    newAdminEmail: ""
  });
  const [passwordStatusMsg, setPasswordStatusMsg] = useState({ type: "", text: "" });

  // ── Settings / credential-change OTP state ──────────────────────────────
  // Step 1: enter current-admin email  → POST /api/otp/send
  // Step 2: enter 6-digit OTP          → POST /api/otp/verify
  // Step 3: set new password (+ optional new-email OTP if email is changing)
  const [settingsStep, setSettingsStep] = useState<1 | 2 | 3>(1);
  const [resetEmailInput, setResetEmailInput] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [enteredNewEmailOtp, setEnteredNewEmailOtp] = useState("");
  const [isNewEmailOtpSent, setIsNewEmailOtpSent] = useState(false);
  const [isSettingsLoading, setIsSettingsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

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

  useEffect(() => {
    if (propRestaurantInfo) {
      setRestaurantInfo(propRestaurantInfo);
      setInfoForm(propRestaurantInfo);
    }
  }, [propRestaurantInfo]);

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

  // Start 60-second resend countdown whenever settings step 2 is entered
  useEffect(() => {
    if (settingsStep !== 2) { setResendCountdown(0); return; }
    setResendCountdown(60);
    const id = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) { clearInterval(id); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [settingsStep]);

  // ── Helper: POST to an OTP endpoint, returns parsed JSON ────────────────
  async function otpPost(path: string, body: object): Promise<{ success: boolean; message: string }> {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    try { return await res.json(); }
    catch { return { success: false, message: `Server error ${res.status}` }; }
  }

  // ── Resend OTP without re-validating email ───────────────────────────────
  async function handleResendCode() {
    setPasswordStatusMsg({ type: "", text: "" });
    setIsSettingsLoading(true);
    try {
      const data = await otpPost("/api/otp/send", { email: resetEmailInput.trim().toLowerCase() });
      if (!data.success) throw new Error(data.message);
      setEnteredCode("");
      setResendCountdown(60);
      setPasswordStatusMsg({ type: "success", text: "A new verification code has been sent to your inbox." });
    } catch (err: any) {
      setPasswordStatusMsg({ type: "error", text: err.message || "Failed to resend code." });
    } finally {
      setIsSettingsLoading(false);
    }
  }

  // ── Step 1: Verify the admin email then send OTP ─────────────────────────
  async function handleSendVerificationCode() {
    setPasswordStatusMsg({ type: "", text: "" });
    setIsSettingsLoading(true);
    try {
      const remoteInfo  = await getRemoteRestaurantInfo();
      const registered  = (remoteInfo.adminEmail || "monstergame246@gmail.com").toLowerCase();
      const input       = resetEmailInput.trim().toLowerCase();

      if (input !== registered) {
        setPasswordStatusMsg({ type: "error", text: `The email you entered does not match our registered admin profile.` });
        return;
      }

      const data = await otpPost("/api/otp/send", { email: input });
      if (!data.success) throw new Error(data.message);

      setSettingsStep(2);
      setPasswordStatusMsg({ type: "success", text: `Verification code sent to ${input}. It expires in 10 minutes.` });
    } catch (err: any) {
      setPasswordStatusMsg({ type: "error", text: err.message || "Could not send code. Check your connection." });
    } finally {
      setIsSettingsLoading(false);
    }
  }

  // ── Step 2: Verify OTP ───────────────────────────────────────────────────
  async function handleVerifyCode() {
    setPasswordStatusMsg({ type: "", text: "" });
    setIsSettingsLoading(true);
    try {
      const data = await otpPost("/api/otp/verify", {
        email: resetEmailInput.trim().toLowerCase(),
        code:  enteredCode,
      });

      if (!data.success) throw new Error(data.message);

      setSettingsStep(3);
      setPasswordForm({
        currentPassword: "",
        newPassword:     "",
        confirmPassword: "",
        newAdminEmail:   restaurantInfo.adminEmail || "monstergame246@gmail.com",
      });
      setPasswordStatusMsg({ type: "success", text: "Identity verified! Update your credentials below." });
    } catch (err: any) {
      setPasswordStatusMsg({ type: "error", text: err.message || "Incorrect code. Please try again." });
    } finally {
      setIsSettingsLoading(false);
    }
  }

  // ── Step 3: Save new credentials (with optional new-email OTP) ───────────
  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordStatusMsg({ type: "", text: "" });

    const updatedEmail = passwordForm.newAdminEmail.trim();
    if (!updatedEmail) {
      setPasswordStatusMsg({ type: "error", text: "Admin email cannot be blank." });
      return;
    }
    if (passwordForm.newPassword.length < 4) {
      setPasswordStatusMsg({ type: "error", text: "New password must be at least 4 characters." });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatusMsg({ type: "error", text: "Passwords do not match." });
      return;
    }

    const emailChanged = updatedEmail.toLowerCase() !== (restaurantInfo.adminEmail || "").toLowerCase();

    // If email changed → send OTP to the new address first
    if (emailChanged && !isNewEmailOtpSent) {
      setIsSettingsLoading(true);
      try {
        const data = await otpPost("/api/otp/send", { email: updatedEmail });
        if (!data.success) throw new Error(data.message);
        setIsNewEmailOtpSent(true);
        setPasswordStatusMsg({ type: "success", text: `Verification code sent to ${updatedEmail}. Enter it below to confirm ownership.` });
      } catch (err: any) {
        setPasswordStatusMsg({ type: "error", text: err.message || "Failed to send code to the new email." });
      } finally {
        setIsSettingsLoading(false);
      }
      return;
    }

    // If email changed and OTP was sent → verify it
    if (emailChanged && isNewEmailOtpSent) {
      setIsSettingsLoading(true);
      try {
        const data = await otpPost("/api/otp/verify", { email: updatedEmail, code: enteredNewEmailOtp });
        if (!data.success) throw new Error(data.message);
      } catch (err: any) {
        setPasswordStatusMsg({ type: "error", text: err.message || "Invalid code for the new email address." });
        setIsSettingsLoading(false);
        return;
      } finally {
        setIsSettingsLoading(false);
      }
    }

    // All checks passed → persist credentials
    setIsSettingsLoading(true);
    try {
      await updateRemoteAdminCredentials(updatedEmail, passwordForm.newPassword);

      const updated = { ...restaurantInfo, adminPassword: passwordForm.newPassword, adminEmail: updatedEmail };
      setRestaurantInfo(updated);
      setInfoForm(updated);
      if (onRefreshPublicData) onRefreshPublicData();

      setPasswordStatusMsg({ type: "success", text: "Credentials updated and saved to the database." });

      // Reset the whole settings flow
      setSettingsStep(1);
      setResetEmailInput("");
      setEnteredCode("");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "", newAdminEmail: "" });
      setIsNewEmailOtpSent(false);
      setEnteredNewEmailOtp("");
    } catch {
      setPasswordStatusMsg({ type: "error", text: "Failed to save credentials. Please try again." });
    } finally {
      setIsSettingsLoading(false);
    }
  }

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
    <div className="h-screen w-full max-w-full bg-black text-white font-sans flex flex-col xl:flex-row relative overflow-hidden xl:h-auto xl:min-h-screen xl:overflow-y-auto xl:overflow-x-hidden">
      
      {/* MOBILE TOP NAVBAR */}
      <div className="xl:hidden w-full bg-zinc-950 border-b border-white/[0.08] px-4 py-3 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer active:scale-95"
            aria-label="Toggle Menu"
            id="mobile_menu_trigger"
          >
            <Menu className="w-5 h-5 text-brand-yellow" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden border border-brand-yellow shadow-[0_0_8px_rgba(255,193,7,0.3)] bg-black select-none">
              <img 
                src={wowBurgerLogo} 
                alt="WOW Logo" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-[10px] font-black tracking-wider text-white">WOW ADMIN</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsHelpOpen(true)}
            className="flex items-center gap-1.5 bg-brand-yellow/10 hover:bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/35 px-2.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95"
            id="btn_mobile_quickstart_help"
          >
            <HelpCircle className="w-3.5 h-3.5 text-brand-yellow animate-pulse" />
            <span>Help</span>
          </button>
        </div>
      </div>

      {/* Backdrop for mobile overlays */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 xl:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDE NAVIGATION PANEL */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 h-full xl:h-auto xl:min-h-screen bg-zinc-950 border-r border-white/[0.08] flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out xl:static xl:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div>
          {/* Logo Brand Header */}
          <div className="px-6 py-5 border-b border-white/[0.06] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-brand-yellow shadow-[0_0_12px_rgba(255,193,7,0.3)] bg-black select-none">
              <img 
                src={wowBurgerLogo} 
                alt="WOW Logo" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-widest text-white leading-tight">WOW ADMIN</span>
              <span className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider">Management Suite</span>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="p-4 space-y-1.5 font-sans">
            <button
              onClick={() => { setActiveTab("overview"); setSelectedItem(null); setSelectedCategory(null); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === "overview" ? "bg-brand-yellow text-black shadow-lg shadow-brand-yellow/10" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview & QR</span>
            </button>
            <button
              onClick={() => { setActiveTab("categories"); setSelectedItem(null); setSelectedCategory(null); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === "categories" ? "bg-brand-yellow text-black shadow-lg shadow-brand-yellow/10" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"}`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>Categories</span>
            </button>
            <button
              onClick={() => { setActiveTab("items"); setSelectedItem(null); setSelectedCategory(null); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === "items" ? "bg-brand-yellow text-black shadow-lg shadow-brand-yellow/10" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"}`}
            >
              <Utensils className="w-4 h-4" />
              <span>Menu Items</span>
            </button>
            <button
              onClick={() => { setActiveTab("restaurant"); setSelectedItem(null); setSelectedCategory(null); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === "restaurant" ? "bg-brand-yellow text-black shadow-lg shadow-brand-yellow/10" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"}`}
            >
              <Info className="w-4 h-4" />
              <span>Restaurant Info</span>
            </button>
            <button
              onClick={() => { setActiveTab("payments"); setSelectedItem(null); setSelectedCategory(null); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === "payments" ? "bg-brand-yellow text-black shadow-lg shadow-brand-yellow/10" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"}`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Banking & Wallets</span>
            </button>
            <button
              onClick={() => { setActiveTab("settings"); setSelectedItem(null); setSelectedCategory(null); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === "settings" ? "bg-brand-yellow text-black shadow-lg shadow-brand-yellow/10" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"}`}
            >
              <Key className="w-4 h-4" />
              <span>Reset Password</span>
            </button>
          </nav>
        </div>

        {/* Logout Trigger Button footer */}
        <div className="p-4 border-t border-white/[0.06] bg-zinc-950/40 mt-auto">
          <button
            onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900 border border-white/5 hover:border-brand-yellow/30 hover:bg-brand-yellow/10 text-zinc-400 hover:text-brand-yellow text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-zinc-400 group-hover:text-brand-yellow" />
            <span>Exit Dashboard</span>
          </button>
        </div>
      </aside>

      {/* PRIMARY WORKSPACE */}
      <main className="flex-1 overflow-y-auto xl:overflow-visible xl:h-auto p-6 md:p-8 space-y-6 pb-24">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-4 pt-4 border-b border-white/[0.06]">
          <div className="space-y-1">
            <span className="text-[10px] text-brand-yellow font-black uppercase tracking-widest font-mono block">Administrative View</span>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white leading-none">
              {activeTab === "overview" && "DASHBOARD OVERVIEW"}
              {activeTab === "categories" && "CATEGORY ARCHITECTURE"}
              {activeTab === "items" && "MENU ITEM CATALOG"}
              {activeTab === "restaurant" && "RESTAURANT PROFILE MANAGEMENT"}
              {activeTab === "payments" && "BANKING & MOBILE WALLETS"}
              {activeTab === "settings" && "RESET PASSWORD"}
            </h1>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <a
              href={publicMenuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-350 hover:text-brand-yellow border border-white/10 hover:border-brand-yellow/30 px-3.5 py-1.5 rounded-full text-[10px] uppercase font-black transition-all cursor-pointer active:scale-95"
              id="btn_header_preview_menu"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Menu</span>
            </a>
            <button
              onClick={() => setIsHelpOpen(true)}
              className="flex items-center gap-1.5 bg-brand-yellow/10 hover:bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30 hover:border-brand-yellow/45 px-3.5 py-1.5 rounded-full text-[10px] uppercase font-black transition-all cursor-pointer active:scale-95"
              id="btn_header_quickstart_help"
            >
              <HelpCircle className="w-3.5 h-3.5 text-brand-yellow animate-pulse" />
              <span>Help</span>
            </button>
          </div>
        </div>

        {/* Tab 1: OVERVIEW & QR ENTRY POINT */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            
            {/* Core Stats Cards - 3 Columns Equal Width */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 border border-white/5 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                <div>
                  <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block">Menu Items Listed</span>
                  <span className="text-3xl font-black text-white mt-1 block">{menuItems.length}</span>
                </div>
                <div className="absolute bottom-5 right-5 w-10 h-10 rounded-xl bg-brand-yellow/10 border border-brand-yellow/15 flex items-center justify-center text-brand-yellow">
                  <Utensils className="w-5 h-5" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 border border-white/5 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                <div>
                  <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block">Active Categories</span>
                  <span className="text-3xl font-black text-white mt-1 block">{categories.length}</span>
                </div>
                <div className="absolute bottom-5 right-5 w-10 h-10 rounded-xl bg-brand-yellow/10 border border-brand-yellow/15 flex items-center justify-center text-brand-yellow">
                  <FolderKanban className="w-5 h-5" />
                </div>
              </div>

              {/* QR Code Entry Card (Miniaturized as uniform 3rd card) */}
              <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 border border-brand-yellow/20 rounded-2xl p-6 shadow-sm flex items-center justify-between h-32 relative overflow-hidden group">
                <div className="flex-1 pr-4 min-w-0">
                  <span className="text-[10px] text-brand-yellow font-extrabold uppercase tracking-wider block">QR Code Menu Entry</span>
                  <span className="text-xs font-black text-white mt-1 block uppercase truncate" title={publicMenuUrl}>Scan to View</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(publicMenuUrl);
                      alert("Official Menu URL copied to clipboard!");
                    }}
                    className="mt-2 flex items-center gap-1.5 bg-zinc-900 border border-white/10 hover:border-brand-yellow/40 hover:bg-zinc-850 px-2.5 py-1 rounded-lg text-[9px] font-bold tracking-wider uppercase transition-all cursor-pointer text-zinc-300"
                  >
                    <LinkIcon className="w-2.5 h-2.5 text-brand-yellow" />
                    <span>Copy URL</span>
                  </button>
                </div>
                <div className="w-20 h-20 bg-black border border-brand-yellow/25 rounded-xl p-1.5 flex items-center justify-center shrink-0 relative shadow-lg">
                  <img 
                    src={qrCodeImageUrl} 
                    alt="Dynamic scan to menu"
                    className="w-full h-full object-contain rounded select-none"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>

            {/* Most Popular Feature Management Panel (Full Width) */}
            <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-white/[0.08] rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between border-b border-white/[0.05] pb-4 gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red shrink-0">
                    <Flame className="w-5 h-5 text-brand-red animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white leading-none">
                      Most Popular Section Settings
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-medium">Curation & Display Controls</p>
                  </div>
                </div>

                {/* Switch/Toggle to show/hide */}
                <button
                  type="button"
                  onClick={handleTogglePopularSection}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all flex items-center gap-2 cursor-pointer h-10 ${
                    restaurantInfo.showPopularSection !== false
                      ? "bg-brand-yellow/10 border-brand-yellow/30 text-brand-yellow hover:bg-brand-yellow/15"
                      : "bg-zinc-900 border-white/5 text-zinc-400 hover:text-zinc-300"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${restaurantInfo.showPopularSection !== false ? "bg-brand-yellow animate-pulse" : "bg-zinc-600"}`} />
                  <span>{restaurantInfo.showPopularSection !== false ? "Visible to customers" : "Hidden on Menu"}</span>
                </button>
              </div>

              {/* Search query inside popular curations */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-zinc-950/50 p-3 rounded-xl border border-white/[0.03]">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wide">
                      Curated Popular Dishes
                    </span>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                      Total Curated: {menuItems.filter(i => i.isPopular).length}
                    </span>
                  </div>
                  <div className="sm:ml-auto w-full sm:w-auto">
                    <input
                      type="text"
                      value={popularSearch}
                      onChange={(e) => setPopularSearch(e.target.value)}
                      placeholder="Filter dishes..."
                      className="bg-zinc-950 border border-white/[0.08] rounded-lg px-3 py-1.5 text-[11px] text-white focus:outline-none focus:border-brand-yellow w-full sm:w-56 font-sans placeholder-zinc-600"
                    />
                  </div>
                </div>

                {/* Scrollable list of items */}
                <div className="max-h-[250px] overflow-y-auto divide-y divide-white/[0.03] pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-zinc-950 [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700">
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
                          className="flex items-center justify-between py-2.5 text-zinc-300 hover:bg-white/[0.01] transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-9 h-9 rounded-lg object-cover border border-white/5 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <h4 className="text-[11.5px] font-black text-white uppercase truncate max-w-[150px] sm:max-w-[300px]">
                                {item.name}
                              </h4>
                              <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-mono font-bold block mt-0.5">
                                {item.category} • {item.price.toFixed(2)} Br
                              </span>
                            </div>
                          </div>

                          {/* Checkbox toggle popular status - High contrast color applied */}
                          <button
                            type="button"
                            onClick={() => handleToggleItemPopular(item.id)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-widest transition-all cursor-pointer border ${
                              isPop
                                ? "bg-brand-yellow/10 border-brand-yellow/30 text-brand-yellow hover:bg-brand-yellow/15"
                                : "bg-zinc-900 border-white/[0.04] text-zinc-100 hover:text-white hover:bg-zinc-850 hover:border-white/10"
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
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block ml-0.5">Category Label <span className="text-brand-yellow">*</span></label>
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
                        className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 hover:border-brand-yellow/30 hover:bg-brand-yellow/10 text-zinc-400 hover:text-brand-yellow flex items-center justify-center transition-all cursor-pointer"
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
                            className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-brand-yellow font-bold"
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
                  <div className="md:col-span-3 border-t border-white/[0.04] pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                      {/* RESPONSIVE MOBILE & TABLET CARD CONTAINER */}
                      <div className="xl:hidden space-y-4">
                        {paginatedItems.length === 0 ? (
                          <div className="text-center py-10 bg-zinc-950 border border-white/[0.06] rounded-2xl text-zinc-500 text-xs font-sans font-bold">
                            No dishes found matching the active configuration.
                          </div>
                        ) : (
                          paginatedItems.map(item => (
                            <div key={`mobile-item-${item.id}`} className="bg-zinc-950 border border-white/[0.06] rounded-2xl p-4 space-y-4 shadow-md text-left">
                              <div className="flex items-center gap-3.5">
                                <div className="w-14 h-14 rounded-xl bg-zinc-900 overflow-hidden border border-white/5 shrink-0 shadow-inner">
                                  <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <h4 className="font-extrabold text-white uppercase text-[12px] leading-tight truncate">{item.name}</h4>
                                    <span className="text-xs font-black text-brand-yellow font-mono shrink-0">{item.price.toFixed(2)} ETB</span>
                                  </div>
                                  <p className="text-[9.5px] text-zinc-400 uppercase font-mono font-black mt-1 bg-zinc-900 px-2 py-0.5 rounded w-fit">{item.category}</p>
                                  <p className="text-[9.5px] text-zinc-500 font-medium truncate mt-1">{item.ingredients || "No custom ingredients defined"}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-b border-white/[0.04] py-2.5">
                                <div className="text-zinc-400">⚡ Views: <span className="text-brand-yellow font-extrabold">{item.viewCount || 0}</span></div>
                                <div className="text-zinc-400">⏱️ Prep: <span className="text-white font-extrabold">{item.prepTime || "N/A"}</span></div>
                                <div className="text-zinc-400 col-span-2 flex flex-wrap gap-1 mt-1">
                                  {item.isPopular && <span className="bg-brand-yellow/[0.08] text-brand-yellow border border-brand-yellow/15 text-[8px] font-black uppercase px-2 py-0.5 rounded-sm">Popular</span>}
                                  {item.isChefPick && <span className="bg-brand-red/[0.08] text-brand-red border border-brand-red/15 text-[8px] font-black uppercase px-2 py-0.5 rounded-sm">Chef's Pick</span>}
                                  {item.isFeatured && <span className="bg-cyan-400/[0.08] text-cyan-400 border border-cyan-400/15 text-[8px] font-black uppercase px-2 py-0.5 rounded-sm">Featured</span>}
                                  {!item.isPopular && !item.isChefPick && !item.isFeatured && <span className="text-zinc-650 text-[8px] uppercase font-black">Standard</span>}
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/[0.02]">
                                <button
                                  type="button"
                                  onClick={() => setInspectingItem(item)}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-zinc-900 border border-white/5 text-[10px] text-zinc-350 hover:text-white font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer font-sans"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Inspect</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditItem(item)}
                                  className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/5 hover:border-brand-yellow/30 text-zinc-400 hover:text-brand-yellow flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0"
                                  title="Edit Item"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/5 hover:border-brand-yellow/30 text-zinc-400 hover:text-brand-yellow flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0"
                                  title="Delete Item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* DESKTOP TABLE CONTAINER */}
                      <div className="hidden xl:block overflow-x-auto border border-white/[0.06] rounded-2xl bg-zinc-950">
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
                                        className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 hover:border-brand-yellow/30 hover:bg-brand-yellow/10 text-zinc-400 hover:text-brand-yellow flex items-center justify-center transition-all cursor-pointer"
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
                          className="p-1.5 bg-brand-yellow/10 border border-brand-yellow/15 hover:bg-brand-yellow/15 rounded-xl text-brand-yellow transition-all cursor-pointer"
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

        {/* Tab 7: CREDENTIAL CHANGE — 3-step OTP flow */}
        {activeTab === "settings" && (
          <div className="max-w-xl mx-auto space-y-6 text-left">

            {/* Step header */}
            <div className="bg-zinc-950 p-6 border border-white/[0.05] rounded-2xl">
              <span className="text-[10px] text-brand-yellow font-black uppercase tracking-wider font-mono">
                {settingsStep === 1 && "Step 1 of 3 — Request Security Code"}
                {settingsStep === 2 && "Step 2 of 3 — Authorize Identity"}
                {settingsStep === 3 && "Step 3 of 3 — Update Credentials"}
              </span>
              <h4 className="text-sm font-black text-white uppercase tracking-tight mt-1">
                {settingsStep === 1 && "Verify Registered Admin Email"}
                {settingsStep === 2 && "Enter Verification Code"}
                {settingsStep === 3 && "Set New Password"}
              </h4>
              <p className="text-[9.5px] text-zinc-500 mt-1 leading-relaxed font-sans">
                {settingsStep === 1 && `Enter your registered admin email (${restaurantInfo.adminEmail || "monstergame246@gmail.com"}) to receive a one-time verification code.`}
                {settingsStep === 2 && "A 6-digit code was sent to your admin inbox. Enter it below to unlock credential editing."}
                {settingsStep === 3 && "Identity confirmed. Update your admin email and/or password below."}
              </p>
            </div>

            {/* Status alert */}
            {passwordStatusMsg.text && (
              <div className={`p-3.5 rounded-xl border text-[10.5px] font-sans font-bold flex items-center gap-2 ${
                passwordStatusMsg.type === "success"
                  ? "bg-green-500/10 border-green-500/25 text-green-400"
                  : "bg-brand-yellow/10 border-brand-yellow/25 text-brand-yellow"
              }`}>
                {passwordStatusMsg.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <X className="w-4 h-4 shrink-0" />}
                <span>{passwordStatusMsg.text}</span>
              </div>
            )}

            {/* ── STEP 1: email input + send OTP ── */}
            {settingsStep === 1 && (
              <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-white/[0.08] rounded-2xl p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9.5px] uppercase font-black text-zinc-400 tracking-wider flex items-center justify-between">
                    <span>Registered Admin Email *</span>
                    <span className="text-brand-yellow text-[8.5px] lowercase font-mono">must match registration record</span>
                  </label>
                  <input
                    type="email"
                    value={resetEmailInput}
                    onChange={(e) => setResetEmailInput(e.target.value)}
                    placeholder="your-admin@email.com"
                    className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-yellow font-sans placeholder-zinc-600"
                  />
                </div>
                {resetEmailInput.trim().length > 0 && (
                  <button
                    type="button"
                    disabled={isSettingsLoading}
                    onClick={handleSendVerificationCode}
                    className="w-full bg-brand-yellow hover:bg-yellow-500 disabled:opacity-50 text-black px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-brand-yellow/5 active:scale-98"
                  >
                    {isSettingsLoading
                      ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span>Sending…</span></>
                      : <><RefreshCw className="w-3.5 h-3.5" /><span>Send Verification Code</span></>}
                  </button>
                )}
              </div>
            )}

            {/* ── STEP 2: OTP entry + verify ── */}
            {settingsStep === 2 && (
              <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-white/[0.08] rounded-2xl p-6 space-y-4 text-center">
                <div className="flex flex-col items-center gap-1 pb-1">
                  <Mail className="w-7 h-7 text-brand-yellow animate-bounce" />
                  <p className="text-xs font-bold text-white">Check Your Inbox</p>
                  <p className="text-[10px] text-zinc-400 leading-relaxed max-w-xs mx-auto">
                    A 6-digit code was sent to{" "}
                    <span className="text-brand-yellow font-mono font-bold">{resetEmailInput}</span>.
                    {" "}It expires in 10 minutes.
                  </p>
                </div>

                <div className="max-w-xs mx-auto space-y-3">
                  <input
                    type="text"
                    maxLength={6}
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-full bg-zinc-950 border border-brand-yellow/30 rounded-xl px-4 py-3 text-base text-brand-yellow focus:outline-none focus:border-brand-yellow font-mono text-center tracking-[0.5em] font-black"
                  />

                  {/* Resend code row */}
                  <div className="text-center pt-1">
                    {resendCountdown > 0 ? (
                      <p className="text-[10px] text-zinc-500 font-mono">
                        Resend available in{" "}
                        <span className="text-brand-yellow font-black tabular-nums">{resendCountdown}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        disabled={isSettingsLoading}
                        onClick={handleResendCode}
                        className="text-[10px] font-black uppercase tracking-wider text-zinc-400 hover:text-brand-yellow disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1 mx-auto"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Resend Code
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => { setSettingsStep(1); setEnteredCode(""); setPasswordStatusMsg({ type: "", text: "" }); }}
                      className="w-1/2 bg-zinc-900 hover:bg-zinc-800 border border-white/5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider text-zinc-400 hover:text-white transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={enteredCode.length !== 6 || isSettingsLoading}
                      onClick={handleVerifyCode}
                      className="w-1/2 bg-brand-yellow hover:bg-yellow-500 disabled:opacity-40 text-black py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      {isSettingsLoading
                        ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        : <><CheckCircle className="w-3 h-3" /><span>Verify Code</span></>}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: Update email + password ── */}
            {settingsStep === 3 && (
              <form onSubmit={handleSavePassword} className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-brand-yellow/20 rounded-2xl p-6 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-brand-yellow border-b border-white/[0.06] pb-3 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  Identity Verified — Settings Unlocked
                </h3>

                <div className="space-y-4">

                  {/* Admin email */}
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-zinc-400 tracking-wider">Admin Email *</label>
                    <input
                      type="email"
                      required
                      disabled={isNewEmailOtpSent}
                      value={passwordForm.newAdminEmail}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newAdminEmail: e.target.value })}
                      placeholder="your-admin@email.com"
                      className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-yellow font-sans disabled:opacity-50"
                    />
                  </div>

                  {/* New-email OTP box (shown after requesting code for new address) */}
                  {isNewEmailOtpSent && (
                    <div className="bg-brand-yellow/5 border border-brand-yellow/15 p-4 rounded-xl space-y-2 text-left">
                      <label className="text-[9px] uppercase font-black text-brand-yellow tracking-wider block">
                        Confirm New Email — Enter Code *
                      </label>
                      <p className="text-[9px] text-zinc-500 leading-normal">
                        Enter the 6-digit code sent to{" "}
                        <strong className="text-white">{passwordForm.newAdminEmail}</strong>{" "}
                        to verify ownership of this address.
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={enteredNewEmailOtp}
                          onChange={(e) => setEnteredNewEmailOtp(e.target.value.replace(/\D/g, ""))}
                          placeholder="000000"
                          className="flex-1 bg-zinc-950 border border-brand-yellow/30 rounded-xl px-4 py-2.5 text-xs text-brand-yellow font-mono tracking-[0.2em] text-center focus:outline-none focus:border-brand-yellow font-black"
                        />
                        <button
                          type="button"
                          onClick={() => { setIsNewEmailOtpSent(false); setEnteredNewEmailOtp(""); setPasswordStatusMsg({ type: "", text: "" }); }}
                          className="px-3 py-2 bg-zinc-900 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-wider text-zinc-400 hover:text-white transition-all cursor-pointer whitespace-nowrap"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  )}

                  {/* New password */}
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-zinc-400 tracking-wider">New Password *</label>
                    <input
                      type="password"
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Minimum 4 characters"
                      className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-yellow font-sans"
                    />
                  </div>

                  {/* Confirm password */}
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
                    disabled={isSettingsLoading}
                    className="w-full bg-brand-yellow hover:bg-yellow-500 disabled:opacity-50 text-black px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-brand-yellow/5 active:scale-98"
                  >
                    {isSettingsLoading
                      ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span>Saving…</span></>
                      : <><Save className="w-3.5 h-3.5" /><span>Save Credentials</span></>}
                  </button>
                </div>
              </form>
            )}

          </div>
        )}
      </main>

      {/* GORGEOUS IMMERSIVE INSPECTION MODAL */}
      {inspectingItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-black w-full max-w-lg rounded-3xl border border-white/[0.08] overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setInspectingItem(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all hover:scale-110 cursor-pointer active:scale-95 z-10"
              aria-label="Close Inspector"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Image Cover banner */}
            <div className="h-56 relative w-full overflow-hidden bg-neutral-900 border-b border-white/[0.04]">
              <img 
                src={inspectingItem.image} 
                alt={inspectingItem.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 text-left">
                <span className="text-[9px] bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono font-black">
                  {inspectingItem.category}
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mt-1 px-0.5">{inspectingItem.name}</h3>
              </div>
            </div>

            {/* Inner Specifications content */}
            <div className="p-6 space-y-4 font-sans text-left">
              <div className="space-y-1">
                <span className="text-[9.5px] font-black uppercase tracking-widest text-brand-yellow/80 font-mono block">Signature Description / Ingredients</span>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">{inspectingItem.ingredients || "No custom formulation/ingredients text specified."}</p>
              </div>

              {/* Specs Bento Grid layout */}
              <div className="grid grid-cols-2 gap-3.5 pt-2 text-left animate-fade-in">
                <div className="bg-zinc-900/50 border border-white/[0.03] rounded-2xl p-3.5 space-y-1">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Dish Unit Price</span>
                  <div className="text-sm font-black text-brand-yellow font-mono">{inspectingItem.price.toFixed(2)} ETB</div>
                </div>

                <div className="bg-zinc-900/50 border border-white/[0.03] rounded-2xl p-3.5 space-y-1 text-left">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Estimated Prep Duration</span>
                  <div className="text-sm font-black text-white font-mono">⏱️ {inspectingItem.prepTime || "N/A"}</div>
                </div>

                <div className="bg-zinc-900/50 border border-white/[0.03] rounded-2xl p-3.5 space-y-1 text-left">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Real-time Views Count</span>
                  <div className="text-sm font-black text-cyan-400 font-mono">⚡ {inspectingItem.viewCount || 0} hits</div>
                </div>

                <div className="bg-zinc-900/50 border border-white/[0.03] rounded-2xl p-3.5 space-y-1 text-left">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Satisfaction Rating</span>
                  <div className="text-sm font-black text-yellow-400 font-mono">★ {inspectingItem.rating || "5.0"} (Excellent)</div>
                </div>
              </div>

              {/* Tags Status row */}
              <div className="border-t border-white/[0.04] pt-4 text-left">
                <span className="text-[9.5px] font-black uppercase tracking-widest text-brand-yellow/80 font-mono block mb-2">Active Promotional Badges</span>
                <div className="flex flex-wrap gap-1.5">
                  {inspectingItem.isPopular && (
                    <span className="bg-brand-yellow/[0.08] text-brand-yellow border border-brand-yellow/15 text-[8.5px] font-black uppercase px-2.5 py-1 rounded-md">Popular tag enabled</span>
                  )}
                  {inspectingItem.isChefPick && (
                    <span className="bg-brand-red/[0.08] text-brand-red border border-brand-red/15 text-[8.5px] font-black uppercase px-2.5 py-1 rounded-md">Chef's Pick enabled</span>
                  )}
                  {inspectingItem.isFeatured && (
                    <span className="bg-cyan-400/[0.08] text-cyan-400 border border-cyan-400/15 text-[8.5px] font-black uppercase px-2.5 py-1 rounded-md">Featured item enabled</span>
                  )}
                  {!inspectingItem.isPopular && !inspectingItem.isChefPick && !inspectingItem.isFeatured && (
                    <span className="text-zinc-550 text-[10px] font-medium italic">This item does not use custom diagnostic badges. It appears standard on the digital menus.</span>
                  )}
                </div>
              </div>

              {/* Bottom Quick Actions Row */}
              <div className="flex gap-2.5 pt-4 border-t border-white/[0.04] mt-1.5 text-left">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenEditItem(inspectingItem);
                    setInspectingItem(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-yellow hover:bg-yellow-500 text-black text-xs font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all font-sans"
                >
                  <Edit2 className="w-4 h-4 stroke-[2.5]" />
                  <span>Edit Item Specs</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInspectingItem(null);
                  }}
                  className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-white/5 text-zinc-400 hover:text-white text-xs font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all font-sans"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MANAGEMENT QUICKSTART MODAL */}
      {isHelpOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto" id="modal_management_quickstart_backdrop">
          <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-black w-full max-w-2xl rounded-3xl border border-brand-yellow/20 overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]" id="modal_management_quickstart_container">
            <button
              onClick={() => setIsHelpOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all hover:scale-110 cursor-pointer active:scale-95 z-10"
              aria-label="Close Quickstart"
              id="btn_close_quickstart_top"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header banner */}
            <div className="p-6 border-b border-white/[0.06] bg-zinc-950/80 flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-2xl bg-brand-yellow/10 border border-brand-yellow/25 flex items-center justify-center shrink-0">
                <HelpCircle className="w-6 h-6 text-brand-yellow animate-bounce" />
              </div>
              <div>
                <span className="text-[9px] bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/20 px-2 py-0.5 rounded uppercase font-black tracking-widest font-mono">
                  Administrative Suite
                </span>
                <h3 className="text-lg font-black text-white uppercase tracking-wider mt-1">Management Quickstart</h3>
                <p className="text-[10.5px] text-zinc-400 font-light leading-relaxed mt-0.5">Learn how to curate your digital menu storefront, configure wallets, and synchronize database records.</p>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-left custom-scrollbar" id="quickstart_scroll_content">
              
              {/* Grid 1: Catalog & Promos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-900/40 border border-white/[0.04] rounded-2xl p-4.5 space-y-2">
                  <span className="text-[10px] font-black uppercase text-brand-yellow tracking-wider flex items-center gap-1.5 font-mono">
                    <Utensils className="w-3.5 h-3.5" /> Catalog Curation
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed font-light">
                    Manage categories and dishes under the <strong className="text-white">Menu Items</strong> and <strong className="text-white">Categories</strong> tabs. Create root architectures first, then bind delicious items complete with pricing, ingredient tags, and preparation durations.
                  </p>
                </div>

                <div className="bg-zinc-900/40 border border-white/[0.04] rounded-2xl p-4.5 space-y-2">
                  <span className="text-[10px] font-black uppercase text-brand-yellow tracking-wider flex items-center gap-1.5 font-mono">
                    <Sparkles className="w-3.5 h-3.5" /> Promotional Badges
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-350">
                      <span className="bg-brand-yellow/10 text-brand-yellow text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-brand-yellow/15">Popular</span>
                      <span className="text-[11px]">Highlights trending dishes</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-350">
                      <span className="bg-brand-red/10 text-brand-red text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-brand-red/15">Chef's Pick</span>
                      <span className="text-[11px]">Operator recommendations</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-350">
                      <span className="bg-cyan-400/10 text-cyan-400 text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-cyan-400/15">Featured</span>
                      <span className="text-[11px]">Pins item to top carousel</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 2: Payments & Settlement */}
              <div className="bg-zinc-900/40 border border-white/[0.04] rounded-2xl p-4.5 space-y-2">
                <span className="text-[10px] font-black uppercase text-brand-yellow tracking-wider flex items-center gap-1.5 font-mono">
                  <DollarSign className="w-3.5 h-3.5" /> Direct Mobile Payments
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed font-light">
                  Direct client tips and food payments to your specific bank accounts or mobile wallets. Under the <strong className="text-white">Banking & Wallets</strong> tab, add direct settlement lines (e.g. CBE, Telebirr) with account numbers and direct payment QR image URLs. Users see these details instantly during checkout!
                </p>
              </div>

              {/* Box 3: Live Sync & Durable Backups */}
              <div className="bg-zinc-900/40 border border-white/[0.04] rounded-2xl p-4.5 space-y-2">
                <span className="text-[10px] font-black uppercase text-brand-yellow tracking-wider flex items-center gap-1.5 font-mono">
                  <Save className="w-3.5 h-3.5" /> Durable Database Sync
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed font-light">
                  Your adjustments are saved locally immediately. To publish them globally to all customer devices, navigate to the <strong className="text-white">Reset Password</strong> security tab and execute <strong className="text-brand-yellow">Save Credentials in Firestore Database</strong>. This will instantly update the cloud database.
                </p>
              </div>

            </div>

            {/* Footer action */}
            <div className="p-5 border-t border-white/[0.06] bg-zinc-950/80 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsHelpOpen(false)}
                className="bg-brand-yellow hover:bg-yellow-500 text-black px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer active:scale-95 shadow-lg shadow-brand-yellow/10"
                id="btn_management_quickstart_acknowledge"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
