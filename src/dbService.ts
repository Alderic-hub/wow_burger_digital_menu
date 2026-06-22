import { MenuItem, Category, RestaurantInfo, Employee } from "./types";
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
  telegram: "https://t.me",
  showPopularSection: true,
  bankAccounts: [
    {
      id: "bank-cbe",
      bankName: "Commercial Bank of Ethiopia (CBE)",
      accountNumber: "1000123456789",
      accountHolder: "WOW BURGER PLC",
      qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=000000&bgcolor=FFFFFF&data=combanketh%3A%2F%2Fpay%3Fto%3D1000123456789%26name%3DWOW%20BURGER%20PLC",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Commercial_Bank_of_Ethiopia_logo.svg/512px-Commercial_Bank_of_Ethiopia_logo.svg.png",
      isActive: true
    },
    {
      id: "bank-telebirr",
      bankName: "Telebirr",
      accountNumber: "0911000000",
      accountHolder: "WOW BURGER PLC",
      qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=000000&bgcolor=FFFFFF&data=telebirr%3A%2F%2Fpay%3Fphone%3D0911000000%26holder%3DWOW%2520BURGER%2520PLC",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Telebirr_logo.png",
      isActive: true
    }
  ],
  adminPassword: "admin",
  adminEmail: "admin@wowburger.et"
};

export const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: "emp-1",
    name: "Michael Yohannes",
    username: "michael.y",
    role: "Admin",
    permissions: ["edit_menu", "edit_categories", "edit_settings", "view_analytics"],
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "emp-2",
    name: "Selam Teklay",
    username: "selam.t",
    role: "Manager",
    permissions: ["edit_menu", "edit_categories", "view_analytics"],
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "emp-3",
    name: "Abebe Kebede",
    username: "abebe.k",
    role: "Cashier",
    permissions: ["view_analytics"],
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

// Initialize localStorage with preset menu list if empty
export function initDB() {
  const needsMigration = !localStorage.getItem("wow_db_migrated_v3");
  if (needsMigration) {
    localStorage.setItem("wow_menu_items", JSON.stringify(MENU_ITEMS));
    localStorage.setItem("wow_categories", JSON.stringify(CATEGORIES));
    localStorage.setItem("wow_restaurant_info", JSON.stringify(DEFAULT_RESTAURANT_INFO));
    localStorage.setItem("wow_employees", JSON.stringify(DEFAULT_EMPLOYEES));
    localStorage.setItem("wow_db_migrated_v3", "true");
  } else {
    if (!localStorage.getItem("wow_menu_items")) {
      localStorage.setItem("wow_menu_items", JSON.stringify(MENU_ITEMS));
    }
    if (!localStorage.getItem("wow_categories")) {
      localStorage.setItem("wow_categories", JSON.stringify(CATEGORIES));
    }
    if (!localStorage.getItem("wow_restaurant_info")) {
      localStorage.setItem("wow_restaurant_info", JSON.stringify(DEFAULT_RESTAURANT_INFO));
    }
    if (!localStorage.getItem("wow_employees")) {
      localStorage.setItem("wow_employees", JSON.stringify(DEFAULT_EMPLOYEES));
    }
  }
  testConnection();
}

async function testConnection() {
  // Run after a short delay to allow the network layer to warm up
  setTimeout(async () => {
    try {
      await getDocFromServer(doc(db, "test", "connection"));
      console.log("Firebase Firestore connection established successfully.");
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      if (errMsg.includes("the client is offline") || errMsg.includes("Could not reach Cloud Firestore")) {
        console.warn("Firestore client is currently offline or warming up. Operating with local persistent cache.");
      } else {
        console.warn("Firestore connection check info:", errMsg);
      }
    }
  }, 1500);
}

// Bootstrap Firestore collections if they are currently unpopulated or need migration
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
    } else {
      // Ensure adminPassword and adminEmail exist in Remote document
      const currentRemoteInfo = infoSnapshot.data() as RestaurantInfo;
      let needsUpdate = false;
      const updatedData: Partial<RestaurantInfo> = {};
      if (!currentRemoteInfo.adminPassword) {
        updatedData.adminPassword = "admin";
        needsUpdate = true;
      }
      if (!currentRemoteInfo.adminEmail) {
        updatedData.adminEmail = "admin@wowburger.et";
        needsUpdate = true;
      }
      if (needsUpdate) {
        await setDoc(infoDocRef, updatedData, { merge: true });
      }
    }

    // Check & bootstrap employees
    const empCollRef = collection(db, "employees");
    const empSnapshot = await getDocs(empCollRef);
    if (empSnapshot.empty) {
      console.log("Firestore employees is empty, bootstrapping default staff...");
      for (const emp of DEFAULT_EMPLOYEES) {
        await setDoc(doc(db, "employees", emp.id), emp);
      }
      localStorage.setItem("wow_employees_last_sync", JSON.stringify(DEFAULT_EMPLOYEES));
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
        if (!info.bankAccounts) {
          info.bankAccounts = DEFAULT_RESTAURANT_INFO.bankAccounts;
        } else {
          info.bankAccounts = info.bankAccounts.map(b => {
            if (b.id === "bank-cbe" && !b.logoUrl) {
              return { ...b, logoUrl: DEFAULT_RESTAURANT_INFO.bankAccounts?.[0].logoUrl };
            }
            if (b.id === "bank-telebirr" && !b.logoUrl) {
              return { ...b, logoUrl: DEFAULT_RESTAURANT_INFO.bankAccounts?.[1].logoUrl };
            }
            return b;
          });
        }
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
    const info = JSON.parse(localStorage.getItem("wow_restaurant_info") || "{}") as RestaurantInfo;
    if (!info.bankAccounts) {
      info.bankAccounts = DEFAULT_RESTAURANT_INFO.bankAccounts;
    } else {
      info.bankAccounts = info.bankAccounts.map(b => {
        if (b.id === "bank-cbe" && !b.logoUrl) {
          return { ...b, logoUrl: DEFAULT_RESTAURANT_INFO.bankAccounts?.[0].logoUrl };
        }
        if (b.id === "bank-telebirr" && !b.logoUrl) {
          return { ...b, logoUrl: DEFAULT_RESTAURANT_INFO.bankAccounts?.[1].logoUrl };
        }
        return b;
      });
    }
    return info;
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

export function loadEmployees(): Employee[] {
  initDB();
  try {
    return JSON.parse(localStorage.getItem("wow_employees") || "[]");
  } catch {
    return DEFAULT_EMPLOYEES;
  }
}

export async function saveEmployees(employees: Employee[]) {
  // Sync locally first
  localStorage.setItem("wow_employees", JSON.stringify(employees));

  // Sync to remote Firestore
  const path = "employees";
  try {
    for (const emp of employees) {
      await setDoc(doc(db, path, emp.id), emp);
    }
    // Delete shadow employees that were removed
    const lastSyncStr = localStorage.getItem("wow_employees_last_sync") || "[]";
    try {
      const lastSync = JSON.parse(lastSyncStr) as Employee[];
      const activeIds = new Set(employees.map((e) => e.id));
      for (const oldEmp of lastSync) {
        if (!activeIds.has(oldEmp.id)) {
          await deleteDoc(doc(db, path, oldEmp.id));
        }
      }
    } catch (e) {
      console.warn("Diff sync error:", e);
    }
    localStorage.setItem("wow_employees_last_sync", JSON.stringify(employees));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeEmployees(onUpdate: (employees: Employee[]) => void): () => void {
  const path = "employees";
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const employees: Employee[] = [];
      snapshot.forEach((doc) => {
        employees.push(doc.data() as Employee);
      });
      if (employees.length > 0) {
        localStorage.setItem("wow_employees", JSON.stringify(employees));
        onUpdate(employees);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function incrementItemViewCount(itemId: string) {
  // Update local storage first
  try {
    const items = loadMenuItems();
    const updated = items.map(item => {
      if (item.id === itemId) {
        return { ...item, viewCount: (item.viewCount || 0) + 1 };
      }
      return item;
    });
    localStorage.setItem("wow_menu_items", JSON.stringify(updated));

    // Non-blocking update to firestore
    const targetItem = updated.find(i => i.id === itemId);
    if (targetItem) {
      const docRef = doc(db, "menu", itemId);
      setDoc(docRef, targetItem, { merge: true }).catch(err => {
        console.warn("Could not increment remote view count asynchronously:", err);
      });
    }
  } catch (err) {
    console.warn("Error incrementing view count:", err);
  }
}


