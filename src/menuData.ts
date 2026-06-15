import { MenuItem, Category } from "./types";

/**
 * CATEGORIES LIST
 * These appear in the floating bottom navigation bar.
 * Designed with genuine Appetizing Food Thumbnails now for intuitive digital menu exploration!
 */
export const CATEGORIES: Category[] = [
  { 
    id: "Burgers", 
    label: "Burgers", 
    iconName: "Beef",
    thumbnail: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=120&h=120&q=80"
  },
  { 
    id: "Pizza", 
    label: "Pizza", 
    iconName: "Pizza",
    thumbnail: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=120&h=120&q=80"
  },
  { 
    id: "Wraps", 
    label: "Wraps", 
    iconName: "FlameKindling",
    thumbnail: "https://images.unsplash.com/photo-1626700051175-6518c4793f06?auto=format&fit=crop&w=120&h=120&q=80"
  },
  { 
    id: "Crispy Chicken", 
    label: "Chicken", 
    iconName: "UtensilsCrossed",
    thumbnail: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=120&h=120&q=80"
  },
  { 
    id: "Salads", 
    label: "Salads", 
    iconName: "Salad",
    thumbnail: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=120&h=120&q=80"
  },
  { 
    id: "Special Fries", 
    label: "Fries", 
    iconName: "Container",
    thumbnail: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=120&h=120&q=80"
  },
  { 
    id: "Drinks", 
    label: "Drinks", 
    iconName: "CupSoda",
    thumbnail: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=120&h=120&q=80"
  }
];

/**
 * MENU ITEMS DATA
 * This list represents the core WOW Restaurant menu.
 */
export const MENU_ITEMS: MenuItem[] = [
  // --- PIZZA CATEGORY ---
  {
    id: "pizza-wow-special",
    category: "Pizza",
    name: "Wow Special Pizza",
    price: 781.74,
    ingredients: "Beef, Pepperoni, Veggies, Mozzarella",
    image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=1200&q=80",
    description: "Our signature artisanal masterpiece! Generously loaded with seasoned minced beef, premium cured pepperoni slices, a vibrant mix of house-grilled bell peppers and sweet red onions, over slow-simmered marinara sauce and 100% gourmet stretchy mozzarella.",
    prepTime: "15-20 min",
    calories: "680 kcal",
    rating: 4.9,
    isPopular: true,
    isFeatured: true
  },
  {
    id: "pizza-chicken",
    category: "Pizza",
    name: "Chicken Pizza",
    price: 694.79,
    ingredients: "Grilled Chicken, Onions, Special Sauce",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80",
    description: "A sensational favorite! Tender strips of freshly flame-grilled chicken breast, caramelized sweet white onions, and dynamic white sauce drizzled premium mozzarella. Baked in our signature high-heat oven for perfect golden crust bubbled edges.",
    prepTime: "15-18 min",
    calories: "640 kcal",
    rating: 4.7,
    isChefPick: true
  },

  // --- BURGERS CATEGORY ---
  {
    id: "burger-wow-special",
    category: "Burgers",
    name: "Wow Special Burger",
    price: 738.27,
    ingredients: "Double Beef, Special Sauce, Cheese",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
    description: "Two thick, extremely juicy 100% prime beef patties smashed to order, loaded with double slices of melted mature cheddar, refreshing crunchy leaf lettuce, ripe tomatoes, and smothered in our top-secret WOW burger blend sauce on a pillowy toasted brioche bun.",
    prepTime: "10-12 min",
    calories: "820 kcal",
    rating: 4.9,
    isPopular: true,
    isFeatured: true
  },
  {
    id: "burger-chicken-special",
    category: "Burgers",
    name: "Chicken Special Burger",
    price: 738.27,
    ingredients: "Crispy Chicken, Spicy Mayo, Pickles",
    image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=1200&q=80",
    description: "An incredibly juicy whole breast fillet hand-battered in Southern spices and fried to crunchy perfection. Paired with house-pickled cucumbers and a signature spicy cayenne pepper mayo that provides just the right kick.",
    prepTime: "10-12 min",
    calories: "710 kcal",
    rating: 4.8,
    isChefPick: true
  },

  // --- WRAPS CATEGORY ---
  {
    id: "wrap-chicken-big",
    category: "Wraps",
    name: "Chicken Wrap (Big)",
    price: 868.70,
    ingredients: "Tortilla, Grilled Chicken, Fresh Greens",
    image: "https://images.unsplash.com/photo-1626700051175-6518c4793f06?auto=format&fit=crop&w=1200&q=80",
    description: "A generous jumbo-sized warm flour tortilla stuffed with smokey flame-grilled sliced chicken tenderloins, fresh hand-torn crisp romaine lettuce, crunchy baby cucumbers, vine-ripened tomatoes, and layered with double cream garlic aioli dressing.",
    prepTime: "8-10 min",
    calories: "540 kcal",
    rating: 4.6,
    isChefPick: true
  },

  // --- CRISPY CHICKEN CATEGORY ---
  {
    id: "crispy-chicken-tender",
    category: "Crispy Chicken",
    name: "Chicken Tender (6 pcs)",
    price: 694.79,
    ingredients: "6 pieces of hand-breaded crispy tenders",
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=1200&q=80",
    description: "Six thick, tender premium chicken inner-fillet strips marinated over 24 hours, double-coated by hand in signature seasoned batter, and fried to absolute crisp gold-standard crunch. Remains extraordinarily tender and juicy inside.",
    prepTime: "8-11 min",
    calories: "590 kcal",
    rating: 4.8,
    isPopular: true
  },

  // --- SALADS CATEGORY ---
  {
    id: "salad-tuna",
    category: "Salads",
    name: "Tuna Salad",
    price: 686.96,
    ingredients: "Fresh Tuna, Mixed Greens, Lemon Vinaigrette",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
    description: "A super refreshing health champion! Features premium chunky yellowfin wild-caught tuna tossed on a premium crisp bed of organic mixed baby greens, cucumbers, heirloom cherry tomatoes, pitted Kalamata olives, topped with a cold-pressed organic lemon juice and olive oil vinaigrette.",
    prepTime: "5-7 min",
    calories: "340 kcal",
    rating: 4.5,
    isFeatured: true
  },

  // --- SPECIAL FRIES CATEGORY ---
  {
    id: "fries-loaded-chicken",
    category: "Special Fries",
    name: "Chicken Loaded Fries (Big)",
    price: 433.92,
    ingredients: "Fries, Chicken bits, Cheese Sauce",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=80",
    description: "A mountain of rustic hand-cut russet fries fried to golden crispiness, layered with seasoned grilled chicken breast pieces, chopped jalapenos for subtle warmth, and absolutely drenched in our warm silky cheddar cheese fondue sauce.",
    prepTime: "8-10 min",
    calories: "610 kcal",
    rating: 4.7,
    isPopular: true
  },

  // --- DRINKS CATEGORY ---
  {
    id: "drink-special-smoothie",
    category: "Drinks",
    name: "Wow Special Smoothie",
    price: 260.00,
    ingredients: "Mixed Seasonal Fruits",
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=1200&q=80",
    description: "Indulge in our vitamin-packed premium smoothie blended freshly to order! Combines local mangoes, sun-ripened tree fruits, avocados, and natural sweetness without any artificial flavors or heavy syrups. Extremely thick, cool, and satisfying.",
    prepTime: "5 min",
    calories: "280 kcal",
    rating: 4.9,
    isPopular: true,
    isChefPick: true,
    isFeatured: true
  }
];
