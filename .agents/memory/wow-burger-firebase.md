---
name: WOW Burger Firebase config placement
description: firebase-applet-config.json must be at the artifact root (not inside src/) because firebase.ts imports it via relative path ../firebase-applet-config.json
---

# WOW Burger — Firebase config placement

The app's Firebase config lives at `artifacts/wow-burger/firebase-applet-config.json`.

`artifacts/wow-burger/src/firebase.ts` imports it as:
```ts
import firebaseConfig from "../firebase-applet-config.json";
```

**Why:** The original AI Studio project placed the config at the project root alongside `server.ts`. The import path uses `../` (one level up from `src/`), so the file must stay at the artifact root — moving it into `src/` or renaming it breaks the import.

**How to apply:** When copying/migrating this app, always copy `firebase-applet-config.json` to `artifacts/wow-burger/` (not `artifacts/wow-burger/src/`). Also ensure `tsconfig.json` includes `"*.json"` so TypeScript resolves the JSON import.
