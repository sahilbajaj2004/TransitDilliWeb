# TransitDilli Web — Design System (Crisp White / Light Mobility)

## Aesthetic Identity
- **Design Mode**: Crisp Civic Light / Urban Mobility Glass.
- **Atmosphere**: Clean, trustworthy, bright, hyper-legible, modern municipal dashboard. High-contrast white surfaces, crisp borders, and refined typography.
- **Basemap Engine**: OpenStreetMap with CartoDB Positron light street tiles (`https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`).

## Color Tokens

### Surfaces
- `surface-canvas`: `#F8FAFC` (Slate-50, clean modern backdrop)
- `surface-card`: `#FFFFFF` (Pure white card surfaces)
- `surface-header`: `#FFFFFF` / `rgba(255, 255, 255, 0.92)` with backdrop-blur
- `surface-muted`: `#F1F5F9` (Slate-100 for subtle badge backgrounds)
- `surface-hover`: `#F8FAFC` (Hover states)

### Borders
- `border-subtle`: `#E2E8F0` (Slate-200, crisp divider lines)
- `border-strong`: `#CBD5E1` (Slate-300, focus / active states)

### Typography
- `text-primary`: `#0F172A` (Slate-900, razor-sharp primary copy)
- `text-secondary`: `#475569` (Slate-600, secondary labels and descriptions)
- `text-muted`: `#94A3B8` (Slate-400, timestamps, shortcuts, hints)
- `font-mono tabular-nums`: Mandatory for all route numbers, ETAs, vehicle speeds, and timestamps.

### Fleet & Agency Visual Identity
- **DTC State Fleet**:
  - Primary: `#059669` (Emerald 600)
  - Badge: `bg-emerald-50 text-emerald-700 border-emerald-200`
  - Marker: Emerald circular beacon with white bus icon
- **DIMTS Cluster Fleet**:
  - Primary: `#2563EB` (Blue 600)
  - Badge: `bg-blue-50 text-blue-700 border-blue-200`
  - Marker: Royal blue circular beacon with white bus icon
- **Electric Zero-Emission Fleet (EV)**:
  - Primary: `#0891B2` (Cyan 600)
  - Badge: `bg-cyan-50 text-cyan-800 border-cyan-200`
  - Marker: High-voltage cyan beacon with white bolt icon

### Elevation & Shadows
- Cards: `shadow-sm` (`0 1px 2px 0 rgb(0 0 0 / 0.05)`)
- Flyouts / Drawers: `shadow-xl shadow-slate-900/10`
- Markers: `shadow-md shadow-slate-900/20`
