# TransitDilli Web — Product Specification

## Mission
Provide Delhi NCR citizens with a blazing fast, trustworthy, and visually exquisite real-time transit telemetry radar for DTC, DIMTS, and Electric bus fleets.

## Core Personas
1. **Daily Commuter**: Needs to know when the next bus (e.g., 534, TMS+, 729) is arriving at their stop (e.g., AIIMS, Kashmere Gate, South Ext) down to the minute.
2. **Transit Tracker / Power User**: Wants to track specific bus vehicles across Delhi on a live street map, check vehicle speeds, AC/Non-AC status, and fleet density.
3. **Route Explorer**: Looks up bus lines, full stop sequences from origin to destination, and headway frequencies.

## Key Screens & Features
1. **Live Street Map & Radar**:
   - OpenStreetMap + CartoDB Positron high-resolution light basemap showing all Delhi streets, colonies, and expressways.
   - Live moving bus pins with agency colors (DTC Emerald, DIMTS Cobalt, EV Cyan) oriented by real-time heading.
   - Clickable stops with arrival countdown boards.
2. **Fleet Sidebar**:
   - Agency filter tabs: All Fleet, DTC State Fleet, DIMTS Cluster, Electric Zero-Emission.
   - Search bar filtering bus routes, stop names, and vehicle registration numbers.
   - Live cards showing real-time speed, direction, and ETA to next stop.
3. **Vehicle Inspector Drawer**:
   - Flyout side panel with telemetry metrics (speed, heading, vehicle ID, agency).
   - Live stop progression line with passed and upcoming stops.
4. **PIS Stop Board**:
   - Hub view for major stations (AIIMS Ring Road, Kashmere Gate ISBT, Rajiv Chowk, Anand Vihar ISBT, Sarai Kale Khan).
   - Multi-route arrival countdowns with crowding and live status.
5. **Route Explorer**:
   - Full corridor browser showing terminal-to-terminal stops and current buses running on the corridor.
