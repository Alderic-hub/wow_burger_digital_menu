# WOW Burger — Firestore Database Schema Specification

This document provides an exhaustive technical overview of the **WOW Burger** application's database schema. The backend operates on **Google Cloud Firestore** (Enterprise Edition) and is integrated into the React-Vite environment.

---

## 1. Architectural Overview

WOW Burger leverages a query-optimized, document-oriented database design utilizing flat collections and isolated single-document configuration nodes to achieve fast load times and reliable offline state caching.

```
📁 Cloud Firestore (Root)
├── 📂 categories                  (Public read, Admin-only write collection)
│   └── 📄 {categoryId}            (Category key representing groups like Burgers, Pizza)
│
├── 📂 menu                        (Public read, Admin-only write collection)
│   └── 📄 {menuItemId}            (Exhaustive dish description documents with curation flags)
│
└── 📂 restaurant                  (Isolated settings and profile namespace)
    └── 📄 info                    (Single document containing profiles, toggles, & payment accounts)
```

---

## 2. Core Collections & Schema Specifications

### 2.1. `categories` Collection
* **Path**: `/categories/{categoryId}`
* **Role**: Primary catalog categories linked with Lucide icon references and photographic banner thumbnails.
* **Access Rules**: Globally readable; writes restricted to authorized administrators.

| Field Name | Type | Key Status | Description | Required | Example |
| :--- | :--- | :---: | :--- | :---: | :--- |
| `id` | `string` | **Document ID** / PK | URL-safe name representing category key | Yes | `"burgers"` |
| `label` | `string` | — | Friendly display name rendered in navigation | Yes | `"Juicy Burgers"` |
| `iconName` | `string` | — | Name of a standard Lucide react icon to load dynamically | Yes | `"Flame"` |
| `thumbnail` | `string` | — | High-quality photo URL for the category banner | Yes | `"https://images.unsplash.com/...` |

---

### 2.2. `menu` Collection
* **Path**: `/menu/{menuItemId}`
* **Role**: The core product catalog storing detailed descriptions, ingredients, pricing, and curation tags.
* **Access Rules**: Globally readable; writes restricted to authorized administrators.

| Field Name | Type | Key Status | Description | Required | Example |
| :--- | :--- | :---: | :--- | :---: | :--- |
| `id` | `string` | **Document ID** / PK | Unique alphanumeric item tracker | Yes | `"double-cheese-wow"` |
| `name` | `string` | — | Display title of the dish | Yes | `"WOW Double Cheeseburger"` |
| `price` | `number` | — | Unit price for cart and receipt calculations | Yes | `450.00` |
| `ingredients` | `string` | — | Comma-separated list of ingredients | Yes | `"Beef Patty, Cheddar, House Sauce"` |
| `category` | `string` | FK (to `categories.id`) | Foreign key linking item to its parent category | Yes | `"burgers"` |
| `image` | `string` | — | Dynamic kitchen photography asset URL | Yes | `"https://images.unsplash.com/...` |
| `description` | `string` | — | Text description highlighting flavors and style | Yes | `"Two flame-grilled beef patties with..."` |
| `prepTime` | `string` | — | General estimation of food production time | Yes | `"12-15 min"` |
| `calories` | `string` | — | Optional nutritional value indicators | No | `"680 kcal"` |
| `rating` | `number` | — | Rating bound from `0.0` to `5.0` | No | `4.9` |
| `subcategory` | `string` | — | Additional filtering (e.g., "Classic", "Premium") | No | `"Classic Burger"` |
| `isPopular` | `boolean` | — | **Curation Flag**: Includes the dish in the Popular shelf | No | `true` |
| `isChefPick` | `boolean` | — | Recommended by the chef badge | No | `false` |
| `isFeatured` | `boolean` | — | Dynamic banner or carousel highlight tag | No | `true` |

---

### 2.3. `restaurant` Collection (Main Profile Settings Document)
* **Path**: `/restaurant/info`
* **Role**: Dictates brand story metadata, operation schedules, branch coordinates, and social media outreach handles.
* **Access Rules**: Globally readable; writes restricted to authorized administrators.

> 💡 **Admin Portal Separation**: In the admin section, customization of this record is cleanly separated into two distinct, focused panels: **Restaurant Info** (manages profile metadata, branch locations, and hours) and **Banking & Wallets** (manages transaction numbers, mobile wallet links, and QR codes).

| Field Name | Type | Description | Required | Example |
| :--- | :--- | :--- | :---: | :--- |
| `mission` | `string` | Statement detailing brand vision and commitment | Yes | `"Serving happiness one burger at a time."` |
| `journeyFounder` | `string` | Brief storytelling text focused on the founders | Yes | `"Founded in 2024 with a passion for grill..."` |
| `journeyQuality` | `string` | Profile detail focusing on fresh ingredients | Yes | `"Sourcing premium ingredients daily..."` |
| `journeyDough` | `string` | Profile detail highlighting signature baked goods | Yes | `"Our signature buns are freshly baked..."` |
| `openingHours` | `string` | General branch operational working hour schedule | Yes | `"08:00 AM - 10:00 PM"` |
| `kitchenLastOrder` | `string` | Time point marking nightly kitchen curfew | Yes | `"09:30 PM"` |
| `locationName` | `string` | Name representing physical store branch | Yes | `"Bole Medhanialem Branch"` |
| `locationAddress` | `string` | Descriptive map & mailing address text | Yes | `"Bole Road, Behind Edna Mall, Addis Ababa"` |
| `phone` | `string` | Front counter callback telephone number | Yes | `"+251911000000"` |
| `email` | `string` | Support mailing address inbox | Yes | `"support@wowburger.com"` |
| `instagram` | `string` | Direct link to the brand's Instagram handle | Yes | `"@wowburger_et"` |
| `facebook` | `string` | Direct link to the brand's Facebook landing page | Yes | `"wowburger.et"` |
| `tiktok` | `string` | Direct link to the brand's TikTok content wall | Yes | `"@wowburger.et"` |
| `telegram` | `string` | Public telegram channel name for specials | Yes | `"wowburger_et"` |
| `showPopularSection` | `boolean` | **Global Control**: Activates or hides the popular banner | No | `true` |

---

## 3. Banking & Escrow Payment Systems

Because the administration panel treats payment accounts as a distinct workflow completely separate from restaurant story logs, the banking configuration operates as its own dedicated payload schemas within the Firestore data-layer.

### 3.1. `BankAccount` Object structure
Every interactive transfer option (CBE bank, Telebirr account, mobile wallet) utilizes this precise system schema:

| Attribute Name | Type | Description | Required | Example |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `string` | Immutable ID designating provider type | Yes | `"bank-telebirr"` |
| `bankName` | `string` | Name of the bank or mobile money wallet | Yes | `"Telebirr"` |
| `accountNumber` | `string` | Numeric target account used for copy-transfer | Yes | `"0911000000"` |
| `accountHolder` | `string` | Official corporate registration holder name | No | `"WOW BURGER PLC"` |
| `logoUrl` | `string` | Dynamic badge logo to speed visual identification | No | `"https://upload.wikimedia.org/...` |
| `qrCodeUrl` | `string` | Scan-to-pay QR code graphic endpoint URL | No | `"https://api.qrserver.com/...` |
| `isActive` | `boolean` | **Toggle Switch**: Makes the account/wallet visible to clients | Yes | `true` |

---

## 4. Popular Section Settings & Curation Engine

The **Most Popular** showcase on the user-facing digital menu utilizes a highly intuitive **dual-factor control architecture**:

```
[ Global Toggle (showPopularSection) ]  ── Must be TRUE ──┐
                                                           ├───► Render Popular Shelf
[ Curation Flag (isPopular in /menu) ]  ── Must be TRUE ──┘
```

1. **Global Toggle (`showPopularSection`)**: Stored on the `/restaurant/info` document, this flag allows the administrator to hide or show the entire popular shelf layout instantaneously across all device viewports.
2. **Item-Level Curation (`isPopular`)**: Configured inside each `/menu/{menuItemId}` record. The admin dashboard provides a fast, dedicated search and filter panel allowing instant toggling of this property for any catalog item.

---

## 5. Security & Isolation Guidelines

* **Decoupled Operation Channels**: While the fields live inside structured Firestore targets, administrative UI saves are targeted separately. Changing branch hours on the profile page has zero risk of modifying bank accounts, and publishing wallet updates only overwrites payment arrays safely.
* **Public Read, Private Write Access**: In accordance with the security specs, unauthenticated web clients can retrieve the `/categories`, `/menu`, and `/restaurant/info` endpoints, but are blocked from creating, editing, or deleting entries. State edits are fully gated on Firebase Auth using database secure rules.
