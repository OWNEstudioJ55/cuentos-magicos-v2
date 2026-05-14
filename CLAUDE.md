# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the app

No build step — this is a plain static site. Open `index.html` directly in a browser or serve it with any static file server:

```
npx serve .
# or
python -m http.server 8080
```

Deploy by pushing to the `main` branch; Vercel auto-deploys via the config in `vercel.json`. The Netlify config (`netlify.toml`) is also present but Vercel is the primary host.

## Architecture overview

Single-page application with no framework, split across three files:

- **`index.html`** — contains *all* screens as `<div class="screen" id="…">` elements. Only one screen is visible at a time (`classList.toggle('active')`). All JS CDN deps (Supabase SDK) are loaded here.
- **`style.css`** — complete design system. CSS custom properties are defined in two `:root` blocks: the main dark theme (`--bg`, `--coral`, `--mint`, etc.) and the OWN brand palette (`--own-bear`, `--own-gold`, `--own-navy`, etc.).
- **`app.js`** — all client-side logic (~2000+ lines). No modules; everything is global.

### Navigation model

`showScreen(id)` removes `.active` from all `.screen` divs and adds it to the target. Screen flow: `welcomeScreen` → `loginScreen` / `setupScreen` → `parentApp` or `kidApp`.

The app contains **two distinct sub-apps** in the same HTML:
- **Parent app** (`#parentApp`): story creation, recording audio narration, library, premium upsell, notifications.
- **Kid app** (`#kidApp`): listening to stories, classic fairy tales with quizzes, writing area, games/achievements.

### Data persistence — dual-layer

1. **IndexedDB** (`OWNCuentosV2`, version 2) — local cache for offline/fast access. Four object stores: `stories`, `images`, `audio`, `writings`. Accessed via thin wrappers `dbPut`, `dbGet`, `dbGetAll`, `dbDelete`.
2. **Supabase** — cloud sync. Tables: `familias` (auth + family profile), `cuentos` (story records), `mensajes_nino` (child voice messages). Storage bucket: `own-audios`. All Supabase calls are in the top section of `app.js` (`supaGet*`, `supaCreate*`, `supaUpdate*`, `supaUpload*`).

### Auth

Two flows:
- **Family code** (e.g. `OWN-1001`) + parent password + child password — stored as rows in the `familias` table.
- **Google OAuth** via Supabase (`supa.auth.signInWithOAuth`). On redirect back, `checkGoogleSession()` looks up `familias` by `email_google`.

Session is persisted in `localStorage` (`ownSession = 'parent' | 'kid'`). `init()` reads this on load.

Beta access expiry is stored in `localStorage.ownVenceEn` (ISO date string). `isPremium()` always returns `true` during beta.

### AI services

- **Story text**: `api/generar-cuento.js` is a Vercel Edge Function that calls `text.pollinations.ai` (free, no key needed).
- **Story images**: `generateImageWithFallback(prompt)` tries Pollinations image API first (`image.pollinations.ai`), then falls back to a keyed pool of `picsum.photos` placeholder images (`ARCHIVE_IMAGES`).
- **HuggingFace** (`HF_MODEL` = FLUX.1-schnell): referenced in `app.js` config but image generation routes through Pollinations in practice.

### Sprite system

Character and icon artwork lives in `sprites.png` (a single sprite sheet, 1800×800px). `CHAR_SPRITES` and `ICON_SPRITES` define pixel coordinates. `spriteDiv(sprite, sizePx)` and `spriteBg(sprite, sizePx)` render them via CSS `background-position`.

### Plan system

`PLANS` object defines `free` and `premium` tiers, but `getUserPlan()` defaults to `'premium'` and `isPremium()` is hardcoded to `true` for the beta period.
