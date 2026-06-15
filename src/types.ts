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
}

export interface Category {
  id: string; // Matches MenuItem.category
  label: string; // Friendly text displayed on the UI
  iconName: string; // Lucide icon name to dynamically load
  thumbnail: string; // Photographic thumbnail URL representing the category foods
}
