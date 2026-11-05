# TransitDilliWeb: Production Web Portal & Desktop Dashboard Architecture (0 to 100)

Complete architectural specification, high-performance WebGL map design, component hierarchy, design tokens, responsive layouts, and deployment guide for the **TransitDilli Web Portal & Live Transit Dashboard**.

---

## 1. Executive Summary & Web Architecture

### 1.1 Technical Stack
* **Framework:** Next.js 15 (App Router) or Vite + React 19 / TypeScript
* **Styling & Design System:** Tailwind CSS v4 / PostCSS with CSS Variables
* **Map Engine:** **MapLibre GL JS** (Hardware-accelerated WebGL for 4,000+ simultaneous bus markers)
* **Icons & UI Primitives:** Lucide React & Radix UI (Dialog, Dropdown, Slider, Tabs)
* **State Management:** **Zustand** (Ultra-lightweight global store)
* **Data Fetching:** TanStack Query (`@tanstack/react-query` v5)
* **Real-Time Feed:** EventSource / Server-Sent Events (SSE) + HTTP/2 Polling

---

## 2. High-Performance WebGL Map Strategy (Rendering 4,000+ Buses)

### 2.1 The DOM Marker Problem
Rendering 4,000 HTML `<div>` markers on a standard Google Maps or Leaflet instance causes catastrophic browser lag (10–15 FPS) and memory bloat.

### 2.2 The MapLibre GL JS Solution
TransitDilliWeb uses **MapLibre GL JS** with vector tile sources and GPU-accelerated symbol/circle layers:
- All active Delhi buses are represented as a single **GeoJSON FeatureCollection**.
- Coordinates update via `map.getSource('buses').setData(geojsonData)` in **< 4 ms**.
- The GPU handles rendering, clustering, and bearing orientation at a continuous **60 FPS**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MAPLIBRE GL GPU PIPELINE                        │
├────────────────────────────────────────────────────────────────────────┤
│ Backend REST/SSE Engine                                                │
│   │                                                                    │
│   ▼ Normalized Bus Array                                               │
│ GeoJSON FeatureCollection (Points + Bearing + Agency Tag)              │
│   │                                                                    │
│   ▼ map.getSource('buses').setData(...)                                │
│ GPU Hardware Shader Layer                                              │
│   • DTC Buses: Rendered as Emerald Green Circles (#10B981) + Heading   │
│   • DIMTS Buses: Rendered as Royal Blue Circles (#2563EB) + Heading    │
│   • EV Buses: Cyan Outer Pulse Glow (#06B6D4)                          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. UI/UX Layout Blueprint & Screen Design

### 3.1 Desktop Layout (Dual-Pane Command Center)
The desktop web experience is designed as an interactive command center with an expandable sidebar and full-bleed map:

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

### 3.2 Responsive Mobile Web Drawer
On mobile browsers (Chrome Android / Safari iOS), the sidebar automatically transforms into a swipeable bottom sheet drawer (`vaul` / Radix drawer), maintaining one-thumb map navigation.

---

## 4. Directory Structure & File Hierarchy

```
TransitDilliWeb/
├── public/
│   ├── logo.png                       # High-res branding asset
│   ├── favicon.ico
│   └── manifest.json                  # Progressive Web App (PWA) config
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── src/
│   ├── app/                           # Next.js App Router (or pages in Vite)
│   │   ├── layout.tsx                 # Root HTML shell with logo metadata
│   │   ├── page.tsx                   # Main Dashboard (Map + Sidebar)
│   │   ├── bus/
│   │   │   └── [id]/page.tsx          # Standalone Bus Journey View (Sharable)
│   │   └── route/
│   │       └── [routeId]/page.tsx     # Route Overview & Schedule View
│   ├── components/
│   │   ├── map/
│   │   │   ├── TransitMap.tsx         # MapLibre GL Canvas & WebGL layers
│   │   │   ├── BusPopup.tsx           # Floating inspection card on click
│   │   │   └── RoutePolyline.tsx      # Vector route path overlay
│   │   ├── sidebar/
│   │   │   ├── Sidebar.tsx            # Left command pane container
│   │   │   ├── RouteSearch.tsx        # Search input with autocomplete
│   │   │   ├── AgencyFilterBar.tsx    # DTC vs DIMTS filter pills
│   │   │   └── FleetStatsCard.tsx     # Active fleet telemetry summary
│   │   ├── ui/
│   │   │   ├── Badge.tsx              # Green/Blue agency badges
│   │   │   ├── Button.tsx
│   │   │   └── Navbar.tsx             # Brand header with logo.png
│   │   └── tracker/
│   │       └── StopTimeline.tsx       # Vertical upcoming stop list
│   ├── hooks/
│   │   ├── useFleetTelemetry.ts       # Polling/SSE hook for all city buses
│   │   └── useRouteDetails.ts         # Route geometry and stop queries
│   ├── store/
│   │   └── useTransitStore.ts         # Zustand state for selected vehicle/route
│   ├── types/
│   │   └── transit.ts                 # Shared TypeScript interfaces
│   └── lib/
│       ├── api.ts                     # Axios client pointing to TransitDilliBack
│       └── geojson.ts                 # Fast Bus-to-GeoJSON transformer
```

---

## 5. Core Web Component Implementations

### 5.1 Hardware-Accelerated Map Component (`src/components/map/TransitMap.tsx`)
```tsx
'use client';

import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTransitStore } from '@/store/useTransitStore';

interface TransitMapProps {
  onBusSelect: (busId: string) => void;
}

export const TransitMap = ({ onBusSelect }: TransitMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const { buses, selectedAgency } = useTransitStore();

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Initialize MapLibre Canvas centered on Connaught Place, New Delhi
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [77.2090, 28.6139],
      zoom: 13,
      pitch: 35,
    });

    map.on('load', () => {
      // 1. Add GeoJSON source for buses
      map.addSource('buses', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // 2. Layer for Agency Pins (DTC Green: #10B981, DIMTS Blue: #2563EB)
      map.addLayer({
        id: 'bus-circles',
        type: 'circle',
        source: 'buses',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 4, 15, 9],
          'circle-color': [
            'match',
            ['get', 'agency'],
            'DTC', '#10B981',       // Emerald Green
            'DIMTS', '#2563EB',     // Royal Blue
            '#64748B'               // Fallback Slate
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF',
        },
      });

      // 3. Layer for Bus Route Numbers
      map.addLayer({
        id: 'bus-labels',
        type: 'symbol',
        source: 'buses',
        minzoom: 12.5,
        layout: {
          'text-field': ['get', 'routeId'],
          'text-size': 11,
          'text-offset': [0, 1.3],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#F8FAFC',
          'text-halo-color': '#0F172A',
          'text-halo-width': 1.5,
        },
      });

      // Click listener for vehicle inspection
      map.on('click', 'bus-circles', (e) => {
        if (!e.features || !e.features[0]) return;
        const busId = e.features[0].properties?.id;
        if (busId) onBusSelect(busId);
      });

      map.on('mouseenter', 'bus-circles', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'bus-circles', () => { map.getCanvas().style.cursor = ''; });

      mapRef.current = map;
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update GeoJSON source smoothly whenever buses state updates
  useEffect(() => {
    if (!mapRef.current || !mapRef.current.getSource('buses')) return;

    const filtered = selectedAgency === 'ALL'
      ? buses
      : buses.filter(b => b.agency === selectedAgency);

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: filtered.map(b => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [b.lon, b.lat] },
        properties: {
          id: b.id,
          routeId: b.routeId,
          agency: b.agency,
          bearing: b.bearing,
          isElectric: b.isElectric,
          isAc: b.isAc,
        },
      })),
    };

    (mapRef.current.getSource('buses') as maplibregl.GeoJSONSource).setData(geojson);
  }, [buses, selectedAgency]);

  return <div ref={mapContainer} className="w-full h-full relative" />;
};
```

---

### 5.2 Navigation Header with `logo.png` (`src/components/ui/Navbar.tsx`)
```tsx
import React from 'react';
import Image from 'next/image';

interface NavbarProps {
  dtcCount: number;
  dimtsCount: number;
  evCount: number;
}

export const Navbar = ({ dtcCount, dimtsCount, evCount }: NavbarProps) => {
  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between z-20">
      {/* Brand Identity */}
      <div className="flex items-center space-x-3">
        <Image
          src="/logo.png"
          alt="TransitDilli Logo"
          width={32}
          height={32}
          className="rounded-lg shadow"
        />
        <div>
          <h1 className="text-base font-black tracking-wide text-white leading-none">
            TransitDilli
          </h1>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Delhi Real-Time Dashboard
          </span>
        </div>
      </div>

      {/* Real-time Fleet Counter Chips */}
      <div className="hidden md:flex items-center space-x-2">
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-emerald-400">DTC: {dtcCount}</span>
        </div>

        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-bold text-blue-400">DIMTS: {dimtsCount}</span>
        </div>

        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
          <span className="text-xs font-bold text-cyan-400">⚡ EV: {evCount}</span>
        </div>
      </div>

      {/* Live OTD Status Badge */}
      <div className="flex items-center space-x-2 bg-slate-800 px-2.5 py-1 rounded-md text-xs font-medium text-slate-300">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span>OTD Connected</span>
      </div>
    </header>
  );
};
```

---

### 5.3 Agency Filter Bar (`src/components/sidebar/AgencyFilterBar.tsx`)
```tsx
import React from 'react';
import { useTransitStore } from '@/store/useTransitStore';

export const AgencyFilterBar = () => {
  const { selectedAgency, setSelectedAgency } = useTransitStore();

  const filters = [
    { id: 'ALL', label: 'All Fleets' },
    { id: 'DTC', label: '🟢 DTC Green', activeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500' },
    { id: 'DIMTS', label: '🔵 DIMTS Blue', activeColor: 'bg-blue-500/20 text-blue-400 border-blue-500' },
  ];

  return (
    <div className="flex items-center space-x-1.5 p-1 bg-slate-800 rounded-lg border border-slate-700">
      {filters.map((f) => {
        const isActive = selectedAgency === f.id;
        return (
          <button
            key={f.id}
            onClick={() => setSelectedAgency(f.id as any)}
            className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-md transition border ${
              isActive
                ? (f.activeColor || 'bg-slate-700 text-white border-slate-600')
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
};
```

---

## 6. Progressive Web App (PWA) & Offline Shell

### 6.1 Web App Manifest (`public/manifest.json`)
```json
{
  "name": "TransitDilli - Delhi Live Bus Tracker",
  "short_name": "TransitDilli",
  "description": "Real-time DTC & DIMTS bus tracking dashboard for Delhi NCR",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0F172A",
  "theme_color": "#0F172A",
  "icons": [
    {
      "src": "/logo.png",
      "sizes": "192x192 512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

---

## 7. Production Deployment & Verification

### 7.1 Dockerfile for Web Dashboard
```dockerfile
# Multi-stage production build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . ./
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

### 7.2 Verification Steps
```bash
# 1. Install frontend packages
npm install maplibre-gl @tanstack/react-query zustand lucide-react clsx tailwind-merge

# 2. Run local web server
npm run dev

# 3. Open browser
# Navigate to http://localhost:3000 to interact with the full-screen map
```
