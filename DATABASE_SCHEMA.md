# WOW Burger — Firestore Database Schema Specification

This document provides a comprehensive technical overview of the **WOW Burger** application's database schema. The backend operates on **Google Cloud Firestore** (Enterprise Edition) and is integrated serverless-ly into the React-Vite client-side environment.

---

## 1. Architectural Overview

WOW Burger leverages a document-oriented database design utilizing flat collections and isolated single-document configuration nodes to achieve low-latency query resolution and reliable offline state caching.

```
📁 Cloud Firestore (Root)
├── 📂 categories                  (Public read, Admin-only write collections)
│   └── 📄 {categoryId}            (Matches menuItem.category ID reference)
│
├── 📂 menu                        (Public read, Admin-only write collections)
│   └── 📄 {menuItemId}            (Exhaustive dish description documents)
│
└── 📂 restaurant                  (Isolated settings and profile namespace)
    └── 📄 info                    (Single document containing profiles & bank accounts)
```

---

## 2. Collection & Document Specifications

### 2.1. `categories` Collection
* **Path**: `/categories/{categoryId}`
* **Role**: Primary catalog category keys paired with Lucide icon references and photographic banner thumbnails.
* **Access Rules**: Globally readable; writes locked to authorized administrators.

| Field Name | Type | Key Status | Description | Required | Example |
| :--- | :--- | :---: | :--- | :---: | :--- |
| `id` | `string` | **Document ID** / PK | URL-safe name representing category key | Yes | `"burgers"` |
| `label` | `string` | — | Friendly display name rendered in navigation | Yes | `"Juicy Burgers"` |
| `iconName` | `string` | — | Corresponds to a standard Lucide react icon name | Yes | `"Flame"` |
| `thumbnail` | `string` | — | High-quality photo URL for the category banner | Yes | `"https://images.unsplash.com/...` |

---

### 2.2. `menu` Collection
* **Path**: `/menu/{menuItemId}`
* **Role**: The core product catalog storing detailed descriptions, sizes, pricing, and sensory descriptors.
* **Access Rules**: Globally readable; writes locked to authorized administrators.

| Field Name | Type | Key Status | Description | Required | Example |
| :--- | :--- | :---: | :--- | :---: | :--- |
| `id` | `string` | **Document ID** / PK | Unique alphanumeric item tracker | Yes | `"double-cheese-wow"` |
| `name` | `string` | — | Display title of the dish | Yes | `"WOW Double Cheeseburger"` |
| `price` | `number` | — | Unit price for checkout math | Yes | `450.00` |
| `ingredients` | `string` | — | Comma-separated list of ingredients | Yes | `"Beef Patty, Cheddar, House Sauce"` |
| `category` | `string` | FK (to `categories.id`) | Foreign key linking item to its parent category | Yes | `"burgers"` |
| `image` | `string` | — | Rich visual food presentation asset URL | Yes | `"https://images.unsplash.com/...` |
| `description` | `string` | — | Mouth-watering sensory product description | Yes | `"Two flame-grilled beef patties with..."` |
| `prepTime` | `string` | — | General estimation of production time | Yes | `"12-15 min"` |
| `calories` | `string` | — | Nutritional context details | No | `"680 kcal"` |
| `rating` | `number` | — | Numeric rating bounded from `0.0` to `5.0` | No | `4.9` |
| `isPopular` | `boolean` | — | Adds visual popular badges & highlights | No | `true` |
| `isChefPick` | `boolean` | — | Flags item as chef recommendation priority | No | `false` |
| `isFeatured` | `boolean` | — | Pinpoints item in hero reels or banners | No | `true` |
| `subcategory` | `string` | — | Internal grouping (e.g., "Classic", "Premium") | No | `"Classic Burger"` |

---

### 2.3. `restaurant` Collection (Single-Document Root Node)
* **Path**: `/restaurant/info`
* **Role**: Configures brand vision statements, open hours, and system-wide checkout/payment methods dynamically.
* **Access Rules**: Globally readable; writes locked to authorized administrators.

| Field Name | Type | Description | Required | Example |
| :--- | :--- | :--- | :---: | :--- |
| `mission` | `string` | Elegant statement detailing brand promise | Yes | `"Serving happiness one burger at a time."` |
| `journeyFounder` | `string` | Founders storytelling text panel details | Yes | `"Founded in 2024 with a passion for grill..."` |
| `journeyQuality` | `string` | Standard quality assurance description narrative | Yes | `"Sourcing premium ingredients daily..."` |
| `journeyDough` | `string` | Specialized narrative highlighting custom buns/dough | Yes | `"Our signature buns are freshly baked..."` |
| `openingHours` | `string` | Working hours schedule displayed in footer | Yes | `"08:00 AM - 10:00 PM"` |
| `kitchenLastOrder` | `string` | Operational threshold for last order confirmations | Yes | `"09:30 PM"` |
| `locationName` | `string` | Store branch location descriptor | Yes | `"Bole Medhanialem Branch"` |
| `locationAddress` | `string` | Physical mailing & GPS coordinates address string | Yes | `"Bole Road, Behind Edna Mall, Addis Ababa"` |
| `phone` | `string` | Primary service hotline number | Yes | `"+251911000000"` |
| `email` | `string` | Customer support mailing hub | Yes | `"support@wowburger.com"` |
| `instagram` | `string` | Link to the brand Instagram profile | Yes | `"@wowburger_et"` |
| `facebook` | `string` | Link to the brand Facebook fan page | Yes | `"wowburger.et"` |
| `tiktok` | `string` | Link to the content hub Tiktok profile | Yes | `"@wowburger.et"` |
| `telegram` | `string` | Official brand update Telegram channel name | Yes | `"wowburger_et"` |
| `showPopularSection` | `boolean` | Global UI toggle flag to render popular highlights panel | No | `true` |
| `bankAccounts` | `array` | Embedded array of structured `BankAccount` objects | No | *See nested table below* |

#### 2.3.1. Nested Entity: `BankAccount`
Dynamic bank accounts schema embedded inside `restaurant/info`.

| Attribute Name | Type | Description | Required | Example |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `string` | Immutable internal ID representing the bank/wallet | Yes | `"bank-telebirr"` |
| `bankName` | `string` | Bank or mobile money provider name | Yes | `"Telebirr"` |
| `accountNumber` | `string` | Numeric or mobile-associated billing target account number | Yes | `"0911000000"` |
| `accountHolder` | `string` | The verified corporate trade holder name | No | `"WOW BURGER PLC"` |
| `qrCodeUrl` | `string` | Auto-generated standard SVG/PNG gateway payment checkout QR | No | `"https://api.qrserver.com/v1/..."` |
| `logoUrl` | `string` | Verified high-contrast brand digital logo | No | `"https://upload.wikimedia.org/..."` |
| `isActive` | `boolean` | Operational flag to temporarily toggle payment gateway visibility | Yes | `true` |

---

## 3. Core Database Invariants & Relations

1. **Category Cascading**: Standard menu items are coupled directly using `category` foreign keys matching `/categories/{id}`. This ensures UI dynamic layouts can query `.where("category", "==", activeCategory)` deterministically.
2. **Zero-Trust Administrative Pathing**: Regular users have read permission on all menu elements, while write access is verified dynamically against `/admins/{uid}` security records which cannot be created client-side.
3. **No Unbounded Data Growth**: Items like reviews, order cart details, or session histories are managed through local device mechanisms and secure transactional state layers to completely eliminate "Denial of Wallet" structural exploits in Firestore.
