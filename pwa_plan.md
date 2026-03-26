# PWA Implementation Plan — GuitarCoach

## Context

GuitarCoach is a Vite + Vue 3 + TypeScript + Tailwind CSS v4 app.
All data is in localStorage, no backend, no API calls.
Desktop-first but should be installable on Android in landscape mode.

**Before starting:** ask the developer to run:
```
npm install -D vite-plugin-pwa
```
Wait for confirmation before proceeding.

---

## What to build

### 1. App icon

Create `public/icon.svg` — a simple guitar-themed SVG icon using the app's accent colour `#00d4aa`
on a near-black `#0d0d0d` background. Keep it simple: a stylised guitar body silhouette or
just the letter "G" in JetBrains Mono style. The SVG must look good at 32×32 and 512×512.

Also create `public/icon-192.png` and `public/icon-512.png` — PNG exports of the SVG at those
sizes. Since agents cannot run scripts, generate these as pure SVG first and note to the developer
that they can be generated with:
```
npx sharp-cli --input public/icon.svg --output public/icon-192.png --resize 192
npx sharp-cli --input public/icon.svg --output public/icon-512.png --resize 512
```
Or the developer can use any SVG-to-PNG converter. Alternatively, write the PNGs directly as
base64-encoded minimal PNGs if a simple solid-colour icon is acceptable.

### 2. `vite.config.ts` — add VitePWA plugin

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Service worker precaches all Vite build output automatically
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
      manifest: {
        name: 'GuitarCoach',
        short_name: 'GuitarCoach',
        description: 'Structured guitar strumming practice with real-time feedback',
        theme_color: '#0d0d0d',
        background_color: '#0d0d0d',
        display: 'standalone',
        orientation: 'landscape',          // Force landscape on mobile
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

Key points:
- `orientation: 'landscape'` in the manifest is the primary mechanism that tells Android to
  lock the app to landscape when installed as a PWA. Chrome on Android honours this.
- `registerType: 'autoUpdate'` means the service worker updates silently when a new build is
  deployed — appropriate for a personal tool.
- `workbox.globPatterns` precaches all static assets so the app works fully offline.

### 3. `index.html` — add meta tags

Update `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0d0d0d" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="GuitarCoach" />
    <link rel="icon" type="image/svg+xml" href="/icon.svg" />
    <link rel="apple-touch-icon" href="/icon-192.png" />
    <title>GuitarCoach</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

Notes:
- `apple-mobile-web-app-capable` enables standalone mode on iOS Safari (different mechanism
  from Android — iOS does not respect `orientation` in the manifest, but the app is not
  primarily targeting iOS).
- `theme-color` colours the Android status bar to match the app background.

### 4. CSS — enforce landscape orientation as a fallback

The manifest `orientation: 'landscape'` handles installed PWA. For the browser (non-installed),
add a portrait-mode warning overlay in `App.vue` or `src/assets/main.css`:

In `src/assets/main.css`, add at the end:

```css
/* Portrait-mode warning for mobile browsers */
@media (max-width: 600px) and (orientation: portrait) {
  body::before {
    content: 'Rotate your device to landscape for the best experience.';
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: #0d0d0d;
    color: #00d4aa;
    font-family: 'JetBrains Mono', monospace;
    font-size: 1rem;
    text-align: center;
  }
}
```

This does not block the app — it overlays a message. When the user rotates, the message
disappears. No JS needed.

### 5. `src/App.vue` — Screen Orientation API (optional enhancement)

If you want to programmatically lock orientation when running as an installed PWA:

```ts
// In App.vue onMounted():
if (
  window.matchMedia('(display-mode: standalone)').matches &&
  screen.orientation?.lock
) {
  screen.orientation.lock('landscape').catch(() => {
    // Not all Android versions support this — fail silently
  })
}
```

`screen.orientation.lock()` only works in standalone PWA mode and on Android (not iOS).
It will throw on desktop and non-PWA browser contexts — hence the `.catch(() => {})`.
This is an enhancement on top of the manifest `orientation` field, not a replacement.

---

## File checklist

| File | Action |
|------|--------|
| `package.json` | Developer runs `npm install -D vite-plugin-pwa` |
| `public/icon.svg` | Create — guitar icon in brand colours |
| `public/icon-192.png` | Create — 192×192 PNG export |
| `public/icon-512.png` | Create — 512×512 PNG export |
| `vite.config.ts` | Add VitePWA plugin with manifest + workbox config |
| `index.html` | Add theme-color, apple meta tags, icon links |
| `src/assets/main.css` | Add portrait-mode overlay CSS |
| `src/App.vue` | Add `screen.orientation.lock()` call on mount (optional) |

---

## Testing instructions to give the developer

After building (`npm run build && npm run preview`):

1. Open Chrome on Android, navigate to the preview URL (must be HTTPS or localhost via USB
   forwarding — see below).
2. Chrome should show "Add to Home Screen" banner, or use the three-dot menu → "Add to Home
   Screen".
3. Launch from home screen — app should open in landscape standalone mode.

**USB port forwarding (for testing without deployment):**
```
# On desktop, run:
npm run preview   # starts preview server on port 4173

# On Android with USB debugging enabled:
# In Chrome DevTools (chrome://inspect) → Port forwarding → 4173 → localhost:4173
# Then on Android Chrome: http://localhost:4173
```
This proxies the desktop preview server to the Android browser via USB — no deployment needed
for testing.

**Production deployment (for permanent install):**
The simplest option is GitHub Pages:
1. `npm run build` → produces `dist/`
2. Push `dist/` to a `gh-pages` branch (or configure GitHub Actions)
3. Enable GitHub Pages in repo settings → source: `gh-pages` branch
4. HTTPS is automatic. Install from `https://yourname.github.io/guitarcoach`.

---

## What the manifest `orientation: 'landscape'` does NOT do

- Does not affect the browser tab (only installed PWA)
- Does not work on iOS (iOS ignores manifest orientation — but the app is Android-targeted)
- Does not prevent the user from rotating back (they can still override in Android settings)

The CSS `@media portrait` overlay is the safety net for all other cases.

---

## No test files

Do not write any test files. Developer tests manually.
Do not run `npm install` yourself — instruct the developer to run it.
