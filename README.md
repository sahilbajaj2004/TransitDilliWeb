<div align="center">

<img src="./public/logo.png" alt="TransitDilli Web Logo" width="120" height="120" style="border-radius: 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.3);" />

# 💻 TransitDilliWeb
### Real-Time Fleet Telemetry Dashboard & Web Portal for Delhi NCR

[![Next.js](https://img.shields.io/badge/Next.js-15.0_App_Router-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MapLibre GL](https://img.shields.io/badge/Map_Engine-MapLibre_GL_JS-10B981?style=for-the-badge&logo=maplibre&logoColor=white)](https://maplibre.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS_v4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/State-Zustand-443E38?style=for-the-badge&logo=react&logoColor=white)](https://github.com/pmndrs/zustand)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

<p align="center">
  <b>TransitDilliWeb</b> is a hardware-accelerated, high-performance web dashboard for Delhi transit.<br/>
  Powered by <b>MapLibre GL JS WebGL shaders</b>, it renders all 4,000+ active Delhi buses simultaneously at a fluid <b>60 FPS</b> without DOM lag.
</p>

---

[📖 Complete Architecture Blueprint (TransitDilliWeb.md)](./TransitDilliWeb.md) • [⚡ GPU Pipeline](#-hardware-accelerated-webgl-map) • [🖥️ Dashboard Layout](#-dual-pane-command-center) • [🚀 Quick Start](#-getting-started)

</div>

---

## ⚡ Hardware-Accelerated WebGL Map

Rendering thousands of buses using traditional HTML DOM markers causes severe browser freeze. TransitDilliWeb uses **MapLibre GL JS** with vector tile sources and GPU point shaders:

* **All-City Fleet Rendering:** Renders 4,000+ simultaneous DTC and DIMTS buses on a dark vector canvas in **< 4 milliseconds**.
* **Zero DOM Nodes for Vehicles:** Buses are loaded into a single GPU `GeoJSONSource` memory buffer and drawn directly by WebGL hardware shaders.
* **Dual-Agency Visual Differentiation:**
  - 🟢 **DTC State Fleet:** Emerald Green (`#10B981`)
  - 🔵 **DIMTS Cluster Fleet:** Royal Blue (`#2563EB`)
  - ⚡ **Electric Fleet (EV):** Cyan Outer Halo (`#06B6D4`)
  - ❄️ **Air-Conditioned Fleet (AC):** Ice Blue Tag (`#38BDF8`)

---

## 🖥️ Dual-Pane Command Center

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [Logo] TransitDilli   [ 🟢 DTC: 2,420 ]  [ 🔵 DIMTS: 1,840 ]  [ ⚡ EV: 1,120 ]   [Delhi Live Clock] [⚙️] │
├───────────────────────────────┬────────────────────────────────────────────────────────────────────────┤
│ SIDEBAR CONTROL PANEL         │ FULL-BLEED INTERACTIVE WEBGL MAP VIEWPORT                              │
│                               │                                                                        │
│ ┌───────────────────────────┐ │                                🟢 [740C]                               │
│ │ 🔍 Search Bus, Route, Stop│ │                                DL1PD8532 (28 km/h)                     │
│ └───────────────────────────┘ │                                                                        │
│                               │                      🔵 [502]                                          │
│ FLEET FILTERS                 │                      DL1PB4586                                         │
│ [x] 🟢 DTC Buses              │                                                                        │
│ [x] 🔵 DIMTS Clusters         │                                                🟢 [620] ⚡             │
│ [ ] ⚡ Electric Only           │                                                                        │
│                               │                                                                        │
│ ACTIVE ROUTE DETAIL           │                                                                        │
│ 🟢 Route 740CUP               │                                                                        │
│ Anand Vihar ⇄ Dichau Kalan    │                                                                        │
│ • 42 Buses En Route           │                                                                        │
│ • Avg Speed: 21.4 km/h        │                                                                        │
│                               │                                                                        │
│ NEARBY STOPS STREAM           │                                                                        │
│ 🚏 Mandi House                │                                                                        │
│   • 740C in 2 min (🟢 DTC)    │                                                                        │
│   • 502  in 5 min (🔵 DIMTS)  │                                                                        │
└───────────────────────────────┴────────────────────────────────────────────────────────────────────────┘
```

---

## 🌐 Features & Deep Linking

1. **Deep Links for Direct Vehicle Tracking:**
   - Every bus has a direct URL: `https://transitdilli.in/bus/DL1PD8532`
   - Opens the camera centered on the bus and starts live Server-Sent Events (SSE) telemetry streaming.
2. **Route Line Exploration:**
   - Explore any line: `https://transitdilli.in/route/740CUP`
   - Draws the complete colored route polyline with all scheduled stops and active buses en route.
3. **PWA Offline Shell:**
   - Fully installable on desktops, macOS, Chromebooks, and mobile browsers with an offline shell and homescreen icon via `./public/manifest.json`.

---

## 📂 Source Code Structure

```
TransitDilliWeb/
├── public/
│   ├── logo.png                       # Master high-resolution brand asset
│   ├── favicon.ico
│   └── manifest.json                  # Progressive Web App manifest
├── package.json                       # Next.js 15 dependencies & scripts
├── tailwind.config.ts                 # Design tokens & color system
├── TransitDilliWeb.md                 # 0-to-100 Architecture Blueprint
└── src/
    ├── app/                           # Next.js App Router
    │   ├── layout.tsx                 # Root layout with logo OpenGraph meta
    │   ├── page.tsx                   # Main Dashboard (Map + Sidebar)
    │   ├── bus/
    │   │   └── [id]/page.tsx          # Standalone Bus Journey View
    │   └── route/
    │       └── [routeId]/page.tsx     # Route Overview & Schedule View
    ├── components/
    │   ├── map/
    │   │   ├── TransitMap.tsx         # MapLibre GL WebGL canvas & shaders
    │   │   ├── BusPopup.tsx           # Floating vehicle inspection card
    │   │   └── RoutePolyline.tsx      # Vector route polyline overlay
    │   ├── sidebar/
    │   │   ├── Sidebar.tsx            # Left control panel container
    │   │   ├── RouteSearch.tsx        # Fast fuzzy search with autocomplete
    │   │   ├── AgencyFilterBar.tsx    # DTC vs DIMTS filter pills
    │   │   └── FleetStatsCard.tsx     # City-wide fleet telemetry chips
    │   └── ui/
    │       └── Navbar.tsx             # Brand header with logo.png & live counters
    ├── store/
    │   └── useTransitStore.ts         # Lightweight Zustand global state
    └── lib/
        └── api.ts                     # Axios client pointing to TransitDilliBack
```

---

## 🚀 Getting Started

### 1. Installation
```bash
# Enter directory
cd TransitDilliWeb

# Install dependencies
npm install
```

### 2. Configure Backend Endpoint
Create `.env.local`:
```ini
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** (or assigned port) in your browser.

---

## 🛠️ Production Build

```bash
# Compile and optimize for production
npm run build

# Start production server
npm start
```

---

<div align="center">
  <b>TransitDilli Web Portal</b> • Hardware-Accelerated Delhi Transit Telemetry
</div>
