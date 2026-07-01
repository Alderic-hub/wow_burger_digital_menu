import { MenuItem, Category } from "./types";

/**
 * MAPPING OF CATEGORIES TO SUBCATEGORIES
 */
export const SUBCATEGORIES: Record<string, string[]> = {
  "Burger": [
    "Classic Burger",
    "Cheeseburger",
    "Bacon Burger",
    "Special/Signature Burgers",
    "Double Burgers"
  ],
  "Chicken": [
    "Chicken Burgers",
    "Chicken Strips/Bites",
    "Chicken Items"
  ],
  "Wrap": [
    "Chicken Wraps",
    "Other Wrap Options"
  ],
  "Sandwich": [
    "Sandwich Items"
  ],
  "Pizza": [
    "Pizza only"
  ],
  "Sides_Extras": [
    "Fries",
    "Loaded Fries",
    "Onion Rings",
    "Extra servings",
    "Pizza takeaway box (placed here)"
  ],
  "Drinks": [
    "Soft Drinks",
    "Shakes",
    "Other Beverages"
  ],
  "Sauces_Addons": [
    "Extra sauces",
    "Toppings"
  ]
};

/**
 * CATEGORIES LIST
 * High-quality appetizing categories.
 */
export const CATEGORIES: Category[] = [
  { 
    id: "Burger", 
    label: "Burger", 
    iconName: "Beef",
    thumbnail: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=120&h=120&q=80"
  },
  { 
    id: "Chicken", 
    label: "Chicken", 
    iconName: "Flame",
    thumbnail: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=120&h=120&q=80"
  },
  { 
    id: "Wrap", 
    label: "Wrap", 
    iconName: "Activity",
    thumbnail: "https://images.unsplash.com/photo-1626700051175-6518c4793f06?auto=format&fit=crop&w=120&h=120&q=80"
  },
  { 
    id: "Sandwich", 
    label: "Sandwich", 
    iconName: "ChefHat",
    thumbnail: "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=120&h=120&q=80"
  },
  { 
    id: "Pizza", 
    label: "Pizza", 
    iconName: "Pizza",
    thumbnail: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=120&h=120&q=80"
  },
  { 
    id: "Sides_Extras", 
    label: "Sides / Extras", 
    iconName: "Cookie",
    thumbnail: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=120&h=120&q=80"
  },
  { 
    id: "Drinks", 
    label: "Drinks", 
    iconName: "CupSoda",
    thumbnail: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=120&h=120&q=80"
  },
  { 
    id: "Sauces_Addons", 
    label: "Sauces / Add-ons", 
    iconName: "GlassWater",
    thumbnail: "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=120&h=120&q=80"
  }
];

/**
 * DEFAULT MENU ITEMS BY CATEGORY & SUBCATEGORY
 */
export const MENU_ITEMS: MenuItem[] = [
  // --- BURGER ---
  {
    id: "burger_classic",
    category: "Burger",
    subcategory: "Classic Burger",
    name: "Classic Beef Burger",
    price: 450,
    ingredients: "Beef Patty, Lettuce, Tomato, Secret Sauce",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
    description: "A perfectly basted single premium beef patty topped with fresh lettuce, ripe heirloom tomatoes, sliced red onions, pickles, and our signature burger cream spread on a warm toasted brioche bun.",
    prepTime: "10-12 min",
    calories: "520 kcal",
    rating: 4.8,
    isPopular: true,
    isChefPick: false,
    isFeatured: true
  },
  {
    id: "burger_cheeseburger",
    category: "Burger",
    subcategory: "Cheeseburger",
    name: "Wow Double Cheeseburger",
    price: 550,
    ingredients: "Two Beef Patties, Melted Cheddar, Mustard-Mayo",
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=1200&q=80",
    description: "Double the pleasure with two freshly pressed and seared prime beef patties layered with two melted slices of mature cheddar cheese, sweet pickles, and dynamic mustard-mayo sauce.",
    prepTime: "11-14 min",
    calories: "710 kcal",
    rating: 4.9,
    isPopular: true,
    isChefPick: true,
    isFeatured: false
  },
  {
    id: "burger_bacon",
    category: "Burger",
    subcategory: "Bacon Burger",
    name: "Smoky Bacon & BBQ Burger",
    price: 680,
    ingredients: "Beef Patty, Turkey Bacon, Crispy Onion Rings, BBQ Sauce",
    image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=1200&q=80",
    description: "Satisfy your cravings with turkey bacon, a juicy beef patty, smoky barbecue glaze, crispy onion rings, and creamy ranch on a grilled sesame bun.",
    prepTime: "12-15 min",
    calories: "780 kcal",
    rating: 4.7,
    isPopular: false,
    isChefPick: false,
    isFeatured: false
  },
  {
    id: "burger_signature",
    category: "Burger",
    subcategory: "Special/Signature Burgers",
    name: "Truffle Mushroom Signature Burger",
    price: 750,
    ingredients: "Prime Beef, Black Truffle Butter, Sautéed Mushrooms",
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=1200&q=80",
    description: "Our exquisite house selection: hand-formed beef patty infused with black truffle butter, caramelized mushrooms, premium swiss cheese, and garlic herb aioli.",
    prepTime: "12-15 min",
    calories: "810 kcal",
    rating: 4.9,
    isPopular: true,
    isChefPick: true,
    isFeatured: true
  },
  {
    id: "burger_double",
    category: "Burger",
    subcategory: "Double Burgers",
    name: "Wow Giant Double Stack",
    price: 850,
    ingredients: "Double Beef Patties, Swiss and Cheddar, Giant Buns",
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=1200&q=80",
    description: "The ultimate towering giant: double beef patties, melted swiss and cheddar slices, crisp iceberg lettuce, and double portion of savory garlic mayo.",
    prepTime: "15 min",
    calories: "960 kcal",
    rating: 4.6,
    isPopular: false,
    isChefPick: false,
    isFeatured: false
  },

  // --- CHICKEN ---
  {
    id: "chicken_burger",
    category: "Chicken",
    subcategory: "Chicken Burgers",
    name: "Fiery Crispy Chicken Burger",
    price: 520,
    ingredients: "Golden Fried Chicken, Fiery Slaw, Sriracha Mayo",
    image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=1200&q=80",
    description: "Southern-style deep fried juicy chicken breast fillet tossed in cayenne pepper glaze, topped with refreshing fiery cabbage slaw and sriracha mayo.",
    prepTime: "10-12 min",
    calories: "630 kcal",
    rating: 4.8,
    isPopular: true,
    isChefPick: false,
    isFeatured: true
  },
  {
    id: "chicken_strips",
    category: "Chicken",
    subcategory: "Chicken Strips/Bites",
    name: "Signature Golden Strips (6 pcs)",
    price: 480,
    ingredients: "6 pieces chicken tenders, House Honey-Mustard",
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=1200&q=80",
    description: "Tender buttermilk marinated breast inner-fillets hand-breaded in dynamic seasoned flour, fried to standard crispiness, served with classic honey mustard.",
    prepTime: "8-10 min",
    calories: "450 kcal",
    rating: 4.7,
    isPopular: false,
    isChefPick: true,
    isFeatured: false
  },
  {
    id: "chicken_items",
    category: "Chicken",
    subcategory: "Chicken Items",
    name: "Addis Buffalo Hot Wings (8 pcs)",
    price: 590,
    ingredients: "8 Wings, Buffalo Glaze, Garlic Dip",
    image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=1200&q=80",
    description: "Crispy fried juicy chicken wings tossed in tangy cayenne pepper buffalo glaze, served with fresh garlic whipped cream paste.",
    prepTime: "11-13 min",
    calories: "590 kcal",
    rating: 4.8,
    isPopular: true,
    isChefPick: false,
    isFeatured: false
  },

  // --- WRAP ---
  {
    id: "wrap_caesar",
    category: "Wrap",
    subcategory: "Chicken Wraps",
    name: "Crispy Chicken Caesar Wrap",
    price: 490,
    ingredients: "Warm Flour Tortilla, Crispy Chicken, Caesar Greens",
    image: "https://images.unsplash.com/photo-1626700051175-6518c4793f06?auto=format&fit=crop&w=1200&q=80",
    description: "Warm roasted tortilla wrapped with signature crispy chicken bits, romaine lettuce, shaved parmesan, and creamy caesar dressing.",
    prepTime: "8 min",
    calories: "480 kcal",
    rating: 4.7,
    isPopular: true,
    isChefPick: false,
    isFeatured: true
  },
  {
    id: "wrap_falafel",
    category: "Wrap",
    subcategory: "Other Wrap Options",
    name: "Mediterranean Falafel-Hummus Wrap",
    price: 420,
    ingredients: "Tortilla, Baked Chickpea Falafel, House Hummus",
    image: "https://images.unsplash.com/photo-1547058886-af77813becc5?auto=format&fit=crop&w=1200&q=80",
    description: "Authentic fluffy herb chickpea falafels with fresh tomato dices, shredded red onion, rich creamy hummus, and garlic herb spread.",
    prepTime: "8-10 min",
    calories: "380 kcal",
    rating: 4.5,
    isPopular: false,
    isChefPick: true,
    isFeatured: false
  },

  // --- SANDWICH ---
  {
    id: "sandwich_club",
    category: "Sandwich",
    subcategory: "Sandwich Items",
    name: "The Ultimate Triple-Decker Club",
    price: 540,
    ingredients: "Three Slices Sourdough, Smoked Turkey, Fried Egg, Mayo",
    image: "https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?auto=format&fit=crop&w=1200&q=80",
    description: "Toasted country sourdough bread loaded with layers of premium smoked turkey breast, crispy bacon, freshly griddled egg, tomatoes, lettuce, and mayo.",
    prepTime: "10-12 min",
    calories: "590 kcal",
    rating: 4.8,
    isPopular: true,
    isChefPick: true,
    isFeatured: true
  },

  // --- PIZZA ---
  {
    id: "pizza_special",
    category: "Pizza",
    subcategory: "Pizza only",
    name: "Classic Wow Margherita Extra",
    price: 650,
    ingredients: " Artisanal Sourdough crust, San Marzano Tomato, Fresh Mozzarella",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
    description: "Wood-fired artisanal thin crust base covered with slow-cooked San Marzano tomato marinara, fresh mozzarella balls, fresh basil leaves, and cold-pressed extra virgin olive oil.",
    prepTime: "15 min",
    calories: "640 kcal",
    rating: 4.9,
    isPopular: true,
    isChefPick: true,
    isFeatured: true
  },
  {
    id: "pizza_pepperoni",
    category: "Pizza",
    subcategory: "Pizza only",
    name: "Pepperoni & Hot Honey Pizza",
    price: 760,
    ingredients: "Spicy Halal Pepperoni, Jalapeno strings, Chilli Hot Honey",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=1200&q=80",
    description: "Artisanal dough topped with heaps of sizzling pepperoni disks, mozzarella, hand-minced pickling jalapeños, and finished with house sweet hot chili honey drizzle.",
    prepTime: "15-18 min",
    calories: "730 kcal",
    rating: 4.8,
    isPopular: true,
    isChefPick: false,
    isFeatured: false
  },

  // --- SIDES_EXTRAS ---
  {
    id: "sides_rustic_fries",
    category: "Sides_Extras",
    subcategory: "Fries",
    name: "Thick Hand-Cut Rustic Fries",
    price: 250,
    ingredients: "Idaho Potatoes, Truffle Parsley Salt",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=80",
    description: "Generous hand-sliced skin-on golden fried potatoes lightly seasoned with aromatic custom truffle-herb sea salt.",
    prepTime: "5-7 min",
    calories: "290 kcal",
    rating: 4.6,
    isPopular: false,
    isChefPick: false,
    isFeatured: false
  },
  {
    id: "sides_loaded_fries",
    category: "Sides_Extras",
    subcategory: "Loaded Fries",
    name: "Supreme Cheddar Cheese Loaded Fries",
    price: 430,
    ingredients: "Crispy Fries, Hot Liquid Cheese, Chopped Bacon Bits",
    image: "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=1200&q=80",
    description: "Hot crispy fries loaded with rich, warm, melting cheddar cheese fondue, and topped with crispy bacon sprinkles and grilled jalapeño rings.",
    prepTime: "7-10 min",
    calories: "510 kcal",
    rating: 4.8,
    isPopular: true,
    isChefPick: true,
    isFeatured: true
  },
  {
    id: "sides_onion_rings",
    category: "Sides_Extras",
    subcategory: "Onion Rings",
    name: "Double Beer-Batters Onion Rings",
    price: 280,
    ingredients: "Fresh Onions, Crispy Malt Batter, BBQ Dip",
    image: "https://images.unsplash.com/photo-1639024471283-2bc7b3c6a267?auto=format&fit=crop&w=1200&q=80",
    description: "Golden malt-batter coated jumbo sweet onion rings, fried to ultimate light crispiness, served with house-blend smoky BBQ dip.",
    prepTime: "6-8 min",
    calories: "250 kcal",
    rating: 4.5,
    isPopular: false,
    isChefPick: false,
    isFeatured: false
  },
  {
    id: "sides_servings",
    category: "Sides_Extras",
    subcategory: "Extra servings",
    name: "Creamy Coleslaw Cup",
    price: 150,
    ingredients: "Shredded Cabbage, Fresh Carrots, Rich Mayo Cream",
    image: "https://images.unsplash.com/photo-1625938146369-adc83368bda7?auto=format&fit=crop&w=1200&q=80",
    description: "Freshly shredded premium white and purple cabbage with carrots, tossed in sweet tangy mustard-mayonnaise cream.",
    prepTime: "5 min",
    calories: "140 kcal",
    rating: 4.3,
    isPopular: false,
    isChefPick: false,
    isFeatured: false
  },
  {
    id: "sides_takeaway_box",
    category: "Sides_Extras",
    subcategory: "Pizza takeaway box (placed here)",
    name: "Cardboard Pizza Takeaway Box",
    price: 15,
    ingredients: "Eco-friendly insulated cardboard pack",
    image: "https://images.unsplash.com/photo-1595147389795-37094173bfd8?auto=format&fit=crop&w=1200&q=80",
    description: "Warm-keeping insulated high-strength cardboard box, specially designed to preserve your delicious pizza hot and crispy all the way home.",
    prepTime: "1 min",
    calories: "0 kcal",
    rating: 4.9,
    isPopular: false,
    isChefPick: false,
    isFeatured: false
  },

  // --- DRINKS ---
  {
    id: "drinks_coca_cola",
    category: "Drinks",
    subcategory: "Soft Drinks",
    name: "Ice-Cold Coca-Cola Zero",
    price: 120,
    ingredients: "Perfectly Chilled Carbonated Liquid, Lemon Slice",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=1200&q=80",
    description: "The classic sugar-free thirst-quencher carbonated beverage, served ice-cold in standard glass with fresh lemon wedges.",
    prepTime: "2 min",
    calories: "0 kcal",
    rating: 4.9,
    isPopular: true,
    isChefPick: false,
    isFeatured: false
  },
  {
    id: "drinks_shakes",
    category: "Drinks",
    subcategory: "Shakes",
    name: "Velvet Strawberry-Vanilla Shake",
    price: 290,
    ingredients: "Artisanal Strawberry Gelato, Local milk, Whipped Cream",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=1200&q=80",
    description: "Rich, velvety premium milkshake blended with fresh local organic strawberries, gourmet whole milk, topped with a mountain of vanilla chantilly cream.",
    prepTime: "5 min",
    calories: "340 kcal",
    rating: 4.8,
    isPopular: true,
    isChefPick: true,
    isFeatured: true
  },
  {
    id: "drinks_other",
    category: "Drinks",
    subcategory: "Other Beverages",
    name: "Addis Fresh Mango-Papaya Juice",
    price: 240,
    ingredients: "Fresh Mango, Papaya purée, Wild Honey",
    image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=1200&q=80",
    description: "Delicious and nutrient-packed fresh fruit juice crushed thick from local ripe mangoes and papayas, sweetened with a squeeze of wild honey.",
    prepTime: "4 min",
    calories: "190 kcal",
    rating: 4.8,
    isPopular: false,
    isChefPick: false,
    isFeatured: false
  },

  // --- SAUCES_ADDONS ---
  {
    id: "sauces_bbq",
    category: "Sauces_Addons",
    subcategory: "Extra sauces",
    name: "Smoky Honey Chipotle BBQ Sauce Cup",
    price: 80,
    ingredients: "Liquid Chipotle Pepper, Honey, Smoky seasoning",
    image: "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=1200&q=80",
    description: "Our legendary spicy sauce: rich molasses barbecue sauce hand-mixed with real smoky chipotle peppers and sweet field honey.",
    prepTime: "2 min",
    calories: "50 kcal",
    rating: 4.6,
    isPopular: false,
    isChefPick: false,
    isFeatured: false
  },
  {
    id: "sauces_garlic_mayo",
    category: "Sauces_Addons",
    subcategory: "Extra sauces",
    name: "Silky Lemon Garlic Aioli Dip",
    price: 80,
    ingredients: "Roasted Garlic cloves, Olive Oil mayo, Lemon squeeze",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80",
    description: "Thick whipped real house-roasted garlic and cold-pressed extra virgin olive oil emulsion, finished with a fresh lemon juice squeeze.",
    prepTime: "2 min",
    calories: "70 kcal",
    rating: 4.7,
    isPopular: false,
    isChefPick: false,
    isFeatured: false
  },
  {
    id: "sauces_sweet_onion",
    category: "Sauces_Addons",
    subcategory: "Toppings",
    name: "Caramelized Balsamic Red Onions",
    price: 110,
    ingredients: "Sweet Onions, Aged Modena Balsamic vinegar, Thyme sprig",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=1200&q=80",
    description: "Warm-glazed, sweet hand-chopped red onion rings slow-braised in brown sugar and aged balsamic vinegar.",
    prepTime: "3 min",
    calories: "45 kcal",
    rating: 4.4,
    isPopular: false,
    isChefPick: false,
    isFeatured: false
  }
];
