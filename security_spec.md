# Security Specification: WOW Burger Zero-Trust ABAC

This document outlines the security architecture, invariants, and threat analysis for the WOW Burger public digital menu catalog, with validation mechanisms mapping directly to Firestore security rules.

## 1. Core Data Invariants

1. **Write Exclusivity**: No client-side users — except authorized administrators registered in the system-controlled `/admins/{uid}` collection — may create, update, or delete records in `/menu`, `/categories`, or `/restaurant`.
2. **Read Public Accessibility**: All custom public menus, categories list, and restaurant info remain readable globally to handle high-frequency QR-code scans without requiring individual user authentication.
3. **Admin Exclusivity**: Admin accounts are bootstrapped. No client can write to the `/admins` collection; it remains locked (`allow write: if false;`) except for system configuration.
4. **Data Shape Integrity**: All fields created or updated by admins must be validated matches for keys, sizes, types, and constraints to prevent malicious or malformed injections (e.g., negative prices, empty titles, massive payload exhaustion).

---

## 2. The "Dirty Dozen" Threat Payloads

The following malicious payloads must be rejected with `PERMISSION_DENIED` by our security rules:

### T1: Client Attempting to Inject Menu Item
An unauthenticated user attempts to create a menu item.
```json
{
  "id": "hacker_burger",
  "name": "Free Burger",
  "price": 0.0,
  "category": "burgers"
}
```

### T2: Client Attempting to Delete Menu Item
A signed-in customer (non-admin) tries to delete a high-value steak item.
*Target path `/menu/double_patty` with `DELETE`*

### T3: Self-Contrived Admin Registration
A standard user attempts to register their own UID in the system admin list to bypass write locks.
```json
// Path: /admins/hacker_uid
{
  "role": "admin",
  "email": "hacker@domain.com"
}
```

### T4: Negative Pricing Field Exploitation
An administrator (or compromised credentials) attempts to write negative pricing.
```json
{
  "id": "ruined_item",
  "name": "Corrupted Shake",
  "price": -10.50,
  "category": "drinks"
}
```

### T5: Ghost Field / Shadow Update Attack
An update payload includes a ghost boolean `isVerified` or `isAdmin` inside the profile.
```json
{
  "name": "Admin Cheat",
  "price": 10.99,
  "isVerifiedAdmin": true
}
```

### T6: Missing Required Relational Fields
Creating an item with no category association, leading to orphan records.
```json
{
  "id": "lost_burger",
  "name": "Ghost Steak",
  "price": 19.99
}
```

### T7: Massive Payload / Value Poisoning
Attempting to upload a 500KB string into the `name` field of a categories record to exhaust resources / "Denial of Wallet".
```json
{
  "id": "bloat",
  "label": "[500KB of repetitive garbage characters...]"
}
```

### T8: Malformed Path Identifier Injection
Injecting custom path characters (e.g. `/`, `?`, `../`) to trigger index traversal.
`ID: "burger/../../admin_keys"`

### T9: Modifying Immutable Server Fields
Attempting to overwrite a system-protected, immortal timestamp field.
`update: { "createdAt": "2020-01-01" }` when it must be standard server timestamp.

### T10: Corrupt rating input bounds
An update payload attempting to post a rating higher than 5.0 or lower than 0.0.
`rating: 6.5`

### T11: Modifying other keys under action update
Updating the complete category list without satisfying key size checks.
`update with incomplete schema parameters`

### T12: General Cross-Site Scripting Injection
Uploading a Javascript payload inside the ingredients parameter to trigger clientside execution.
`ingredients: "<script>alert('compromised')</script>"`

---

## 3. Test Assertion Plan

We write automated and manual security assertions to ensure:
- Unauthenticated requests are denied writes to all paths.
- Authenticated non-admin requests are denied writes to all paths.
- Admin requests are fully permitted to read and write complying with type-safe checks.
- Admin writes with invalid parameters (e.g. missing required fields, out of range values) are strictly blocked on schema parameters.
