export interface MenuItem {
  id: string;
  name: string;
  price: number; // Stored as a number for potential calculations (e.g., cart, total) or formatted dynamically.
  ingredients: string; // The literal comma-separated ingredients requested by the user.
  category: string; // e.g., "Pizza", "Burgers", "Wraps", "Crispy Chicken", "Salads", "Special Fries", "Drinks"
  image: string; // High-quality image URL
  description: string; // Custom description of the dish
  prepTime: string; // e.g. "15-20 min"
  calories?: string; // e.g. "450 kcal"
  rating?: number; // e.g. 4.8
  isPopular?: boolean;
  isChefPick?: boolean;
  isFeatured?: boolean;
  subcategory?: string; // e.g. "Classic Burger", "Cheeseburger", "Fries"
  images?: string[]; // Array of additional image URLs for the details carousel
  viewCount?: number; // Analytical counter tracking item click-throughs
}

export interface Employee {
  id: string;
  name: string;
  username: string;
  role: "Admin" | "Manager" | "Staff" | "Cashier";
  permissions: string[]; // e.g. ["edit_menu", "edit_categories", "edit_settings", "view_analytics"]
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string; // Matches MenuItem.category
  label: string; // Friendly text displayed on the UI
  iconName: string; // Lucide icon name to dynamically load
  thumbnail: string; // Photographic thumbnail URL representing the category foods
}

export interface RestaurantInfo {
  mission: string;
  journeyFounder: string;
  journeyQuality: string;
  journeyDough: string;
  openingHours: string;
  kitchenLastOrder: string;
  locationName: string;
  locationAddress: string;
  phone: string;
  email: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  telegram: string;
  showPopularSection?: boolean;
  bankAccounts?: BankAccount[];
  adminPassword?: string;
  adminEmail?: string;
  logoUrl?: string;
  bannerUrl?: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder?: string;
  qrCodeUrl?: string; // Optional QR code image
  logoUrl?: string; // Optional logo image URL
  isActive: boolean;
}



