import { MenuItem, Category, RestaurantInfo } from "./types";
import { CATEGORIES, MENU_ITEMS } from "./menuData";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  getDocFromServer
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./firebase";

export const DEFAULT_RESTAURANT_INFO: RestaurantInfo = {
  mission: "WOW Burger represents Addis Ababa's premier culinary destination, serving up freshly handcrafted certified black angus beef burgers, high-heat wood-fired artisanal pizzas, and refreshing natural botanical juices crafted entirely in-house.",
  journeyFounder: "Founded with a singular mission to revolutionize Addis Ababa's fast-casual sector, Chef Michael set out to combine traditional European wood-firing methods with vibrant, premium farm-to-table local ingredients.",
  journeyQuality: "We don't use shortcut freezers or pre-assembled elements. Every sauce is whisked fresh daily, every ingredient is selected by hand, and every slice tells a story of dedicated kitchen discipline.",
  journeyDough: "Every soft brioche bun is baked fresh at sunrise, every single patty is hand-ground, and our signature slow-fermented pizza dough cold-cures for 48 hours to create the light, airy wood-char crust we are loved for.",
  openingHours: "11:00 AM - 11:30 PM",
  kitchenLastOrder: "11:00 PM",
  locationName: "Bole Road Branch",
  locationAddress: "Bole Main Boulevard, Behind Edna Mall Complex, Addis Ababa, Ethiopia",
  phone: "+251 911 000 000",
  email: "contact@wowburger.et",
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
  tiktok: "https://tiktok.com",
  telegram: "https://t.me"
};

// Initialize localStorage with preset menu list if empty
export function initDB() {
  if (!localStorage.getItem("wow_menu_items")) {
    localStorage.setItem("wow_menu_items", JSON.stringify(MENU_ITEMS));
  }
  if (!localStorage.getItem("wow_categories")) {
    localStorage.setItem("wow_categories", JSON.stringify(CATEGORIES));
  }
  if (!localStorage.getItem("wow_restaurant_info")) {
    localStorage.setItem("wow_restaurant_info", JSON.stringify(DEFAULT_RESTAURANT_INFO));
  }
  testConnection();
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

// Bootstrap Firestore collections if they are currently unpopulated
export async function bootstrapFirestoreIfEmpty() {
  try {
    // Check & bootstrap menu
    const menuCollRef = collection(db, "menu");
    const menuSnapshot = await getDocs(menuCollRef);
    if (menuSnapshot.empty) {
      console.log("Firestore menu is empty, bootstrapping default items...");
      for (const item of MENU_ITEMS) {
        await setDoc(doc(db, "menu", item.id), item);
      }
      localStorage.setItem("wow_menu_items_last_sync", JSON.stringify(MENU_ITEMS));
    }

    // Check & bootstrap categories
    const catCollRef = collection(db, "categories");
    const catSnapshot = await getDocs(catCollRef);
    if (catSnapshot.empty) {
      console.log("Firestore categories is empty, bootstrapping default categories...");
      for (const cat of CATEGORIES) {
        await setDoc(doc(db, "categories", cat.id), cat);
      }
      localStorage.setItem("wow_categories_last_sync", JSON.stringify(CATEGORIES));
    }

    // Check & bootstrap restaurant info
    const infoDocRef = doc(db, "restaurant", "info");
    const infoSnapshot = await getDoc(infoDocRef);
    if (!infoSnapshot.exists()) {
      console.log("Firestore restaurant info is empty, bootstrapping default profile...");
      await setDoc(infoDocRef, DEFAULT_RESTAURANT_INFO);
    }
  } catch (error) {
    console.warn("Could not bootstrap Firestore (probably rules restriction on public or connection state):", error);
  }
}

export function subscribeMenuItems(onUpdate: (items: MenuItem[]) => void): () => void {
  const path = "menu";
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: MenuItem[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as MenuItem);
      });
      // Keep cache fresh
      localStorage.setItem("wow_menu_items", JSON.stringify(items));
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeCategories(onUpdate: (categories: Category[]) => void): () => void {
  const path = "categories";
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const categories: Category[] = [];
      snapshot.forEach((doc) => {
        categories.push(doc.data() as Category);
      });
      localStorage.setItem("wow_categories", JSON.stringify(categories));
      onUpdate(categories);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeRestaurantInfo(onUpdate: (info: RestaurantInfo) => void): () => void {
  const path = "restaurant";
  return onSnapshot(
    doc(db, path, "info"),
    (snapshot) => {
      if (snapshot.exists()) {
        const info = snapshot.data() as RestaurantInfo;
        localStorage.setItem("wow_restaurant_info", JSON.stringify(info));
        onUpdate(info);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${path}/info`);
    }
  );
}

export function loadMenuItems(): MenuItem[] {
  initDB();
  try {
    return JSON.parse(localStorage.getItem("wow_menu_items") || "[]");
  } catch {
    return MENU_ITEMS;
  }
}

export function loadCategories(): Category[] {
  initDB();
  try {
    return JSON.parse(localStorage.getItem("wow_categories") || "[]");
  } catch {
    return CATEGORIES;
  }
}

export function loadRestaurantInfo(): RestaurantInfo {
  initDB();
  try {
    return JSON.parse(localStorage.getItem("wow_restaurant_info") || "{}") as RestaurantInfo;
  } catch {
    return DEFAULT_RESTAURANT_INFO;
  }
}

export async function saveMenuItems(items: MenuItem[]) {
  // Sync locally first
  localStorage.setItem("wow_menu_items", JSON.stringify(items));

  // Sync to remote Firestore
  const path = "menu";
  try {
    for (const item of items) {
      await setDoc(doc(db, path, item.id), item);
    }
    // Delete shadow items that were removed
    const lastSyncStr = localStorage.getItem("wow_menu_items_last_sync") || "[]";
    try {
      const lastSync = JSON.parse(lastSyncStr) as MenuItem[];
      const activeIds = new Set(items.map((i) => i.id));
      for (const oldItem of lastSync) {
        if (!activeIds.has(oldItem.id)) {
          await deleteDoc(doc(db, path, oldItem.id));
        }
      }
    } catch (e) {
      console.warn("Diff sync error:", e);
    }
    localStorage.setItem("wow_menu_items_last_sync", JSON.stringify(items));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveCategories(categories: Category[]) {
  // Sync locally first
  localStorage.setItem("wow_categories", JSON.stringify(categories));

  // Sync to remote Firestore
  const path = "categories";
  try {
    for (const cat of categories) {
      await setDoc(doc(db, path, cat.id), cat);
    }
    // Delete shadow items that were removed
    const lastSyncStr = localStorage.getItem("wow_categories_last_sync") || "[]";
    try {
      const lastSync = JSON.parse(lastSyncStr) as Category[];
      const activeIds = new Set(categories.map((c) => c.id));
      for (const oldCat of lastSync) {
        if (!activeIds.has(oldCat.id)) {
          await deleteDoc(doc(db, path, oldCat.id));
        }
      }
    } catch (e) {
      console.warn("Diff sync error:", e);
    }
    localStorage.setItem("wow_categories_last_sync", JSON.stringify(categories));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveRestaurantInfo(info: RestaurantInfo) {
  // Sync locally first
  localStorage.setItem("wow_restaurant_info", JSON.stringify(info));

  // Sync to remote Firestore
  const path = "restaurant";
  try {
    await setDoc(doc(db, path, "info"), info);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/info`);
  }
}
