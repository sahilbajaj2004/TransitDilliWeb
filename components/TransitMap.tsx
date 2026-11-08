'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Bus, TransitStop } from '@/types/transit';
import { Navigation, Plus, Minus, Crosshair, Layers, Compass, Zap, Bus as BusIcon } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface TransitMapProps {
  buses: Bus[];
  stops: TransitStop[];
  selectedBus: Bus | null;
  onBusSelect: (bus: Bus) => void;
  selectedStop: TransitStop | null;
  onStopSelect: (stop: TransitStop) => void;
}

type TileTheme = 'osm' | 'light_gray';

export function TransitMap({
  buses,
  stops,
  selectedBus,
  onBusSelect,
  selectedStop,
  onStopSelect,
}: TransitMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const busLayerRef = useRef<any>(null);
  const stopLayerRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);

  const [tileTheme, setTileTheme] = useState<TileTheme>('osm');
  const [showMetroRing, setShowMetroRing] = useState(true);

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    async function initMap() {
      const L = (await import('leaflet')).default;

      if (!mapContainerRef.current || mapInstanceRef.current) return;

      // Delhi AIIMS Ring Road center
      const map = L.map(mapContainerRef.current, {
        center: [28.5694, 77.2085],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      // OpenStreetMap Official Tiles - 100% Free, Zero Watermarks
      const osmTiles = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; OpenStreetMap contributors',
          subdomains: 'abc',
          maxZoom: 19,
        }
      );

      osmTiles.addTo(map);
      tileLayerRef.current = osmTiles;

      // Create feature layers
      const routeGroup = L.layerGroup().addTo(map);
      const stopGroup = L.layerGroup().addTo(map);
      const busGroup = L.layerGroup().addTo(map);

      routeLayerRef.current = routeGroup;
      stopLayerRef.current = stopGroup;
      busLayerRef.current = busGroup;

      mapInstanceRef.current = map;
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when user toggles theme
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    async function updateTiles() {
      const L = (await import('leaflet')).default;
      const map = mapInstanceRef.current;

      map.removeLayer(tileLayerRef.current);

      let url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      let subdomains = 'abc';

      if (tileTheme === 'light_gray') {
        url = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';
        subdomains = '';
      }

      const newTileLayer = L.tileLayer(url, {
        attribution: '&copy; OpenStreetMap contributors',
        subdomains: subdomains ? 'abc' : undefined,
        maxZoom: 19,
      });

      newTileLayer.addTo(map);
      tileLayerRef.current = newTileLayer;
    }

    updateTiles();
  }, [tileTheme]);

  // Center on Selected Bus
  useEffect(() => {
    if (mapInstanceRef.current && selectedBus) {
      mapInstanceRef.current.setView([selectedBus.lat, selectedBus.lon], 15, {
        animate: true,
      });
    }
  }, [selectedBus]);

  // Center on Selected Stop
  useEffect(() => {
    if (mapInstanceRef.current && selectedStop) {
      mapInstanceRef.current.setView([selectedStop.lat, selectedStop.lon], 15, {
        animate: true,
      });
    }
  }, [selectedStop]);

  // Render Delhi Ring Road & Arterial Polyline
  useEffect(() => {
    if (!mapInstanceRef.current || !routeLayerRef.current) return;

    async function renderRoutes() {
      const L = (await import('leaflet')).default;
      const group = routeLayerRef.current;
      group.clearLayers();

      if (!showMetroRing) return;

      // Delhi Ring Road Core Highway
      const ringRoadCoords: [number, number][] = [
        [28.5681, 77.2024], // Safdarjung
        [28.5694, 77.2085], // AIIMS
        [28.5724, 77.2185], // South Ext
        [28.5701, 77.2410], // Lajpat Nagar
        [28.5742, 77.2612], // Ashram
        [28.5910, 77.2650], // Sarai Kale Khan
        [28.6294, 77.2435], // ITO
        [28.6675, 77.2285], // Kashmere Gate
      ];

      L.polyline(ringRoadCoords, {
        color: '#3B82F6',
        weight: 4,
        opacity: 0.7,
        dashArray: '6, 6',
      }).addTo(group);
    }

    renderRoutes();
  }, [showMetroRing]);

  // Render Bus Stops
  useEffect(() => {
    if (!mapInstanceRef.current || !stopLayerRef.current) return;

    async function renderStops() {
      const L = (await import('leaflet')).default;
      const group = stopLayerRef.current;
      group.clearLayers();

      stops.forEach((stop) => {
        const isSelected = selectedStop?.id === stop.id;

        const stopIcon = L.divIcon({
          className: 'custom-stop-icon',
          html: `
            <div style="
              width: ${isSelected ? '22px' : '16px'};
              height: ${isSelected ? '22px' : '16px'};
              background: ${isSelected ? '#2563EB' : '#FFFFFF'};
              border: 3px solid #1E293B;
              border-radius: 50%;
              box-shadow: 0 2px 6px rgba(0,0,0,0.2);
              cursor: pointer;
              transition: transform 0.15s ease;
            "></div>
          `,
          iconSize: [isSelected ? 22 : 16, isSelected ? 22 : 16],
          iconAnchor: [isSelected ? 11 : 8, isSelected ? 11 : 8],
        });

        const marker = L.marker([stop.lat, stop.lon], { icon: stopIcon });
        marker.on('click', () => onStopSelect(stop));
        marker.bindTooltip(
          `
          <div style="font-family: sans-serif; font-size: 11px; padding: 2px;">
            <div style="font-weight: 700; color: #0F172A;">${stop.name}</div>
            <div style="color: #64748B; font-size: 10px;">Stop #${stop.code}</div>
            ${stop.distanceMeters ? `<div style="color: #2563EB; font-weight: 600; font-size: 10px; margin-top: 1px;">${stop.distanceMeters > 1000 ? `${(stop.distanceMeters/1000).toFixed(1)} km` : `${stop.distanceMeters} m`} away</div>` : ''}
          </div>
          `,
          { direction: 'top', offset: [0, -10] }
        );
        marker.addTo(group);
      });
    }

    renderStops();
  }, [stops, selectedStop, onStopSelect]);

  // Render Moving Bus Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !busLayerRef.current) return;

    async function renderBuses() {
      const L = (await import('leaflet')).default;
      const group = busLayerRef.current;
      group.clearLayers();

      buses.forEach((bus) => {
        const isSelected = selectedBus?.id === bus.id;
        const color = bus.color || (bus.agency === 'DIMTS' ? '#2563EB' : bus.isElectric ? '#0891B2' : '#059669');

        const busIcon = L.divIcon({
          className: 'custom-bus-marker',
          html: `
            <div style="
              position: relative;
              width: ${isSelected ? '36px' : '28px'};
              height: ${isSelected ? '36px' : '28px'};
              border-radius: 50%;
              background: ${color};
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: ${isSelected ? `0 0 0 4px rgba(37,99,235,0.35), 0 4px 12px rgba(0,0,0,0.25)` : '0 2px 8px rgba(0,0,0,0.18)'};
              border: 2px solid #FFFFFF;
              cursor: pointer;
              transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            ">
              <svg width="${isSelected ? '18' : '14'}" height="${isSelected ? '18' : '14'}" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(${bus.bearing || 0}deg);">
                <path d="m12 2 4 10-4-2-4 2z"/>
              </svg>
              ${
                bus.speed > 0
                  ? `<span style="
                      position: absolute;
                      bottom: -16px;
                      background: #FFFFFF;
                      color: #0F172A;
                      border: 1px solid #E2E8F0;
                      border-radius: 4px;
                      padding: 1px 4px;
                      font-family: monospace;
                      font-size: 9px;
                      font-weight: 700;
                      white-space: nowrap;
                      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    ">${bus.speed} km/h</span>`
                  : ''
              }
            </div>
          `,
          iconSize: [isSelected ? 36 : 28, isSelected ? 36 : 28],
          iconAnchor: [isSelected ? 18 : 14, isSelected ? 18 : 14],
        });

        const marker = L.marker([bus.lat, bus.lon], { icon: busIcon });
        marker.on('click', () => onBusSelect(bus));
        marker.bindTooltip(
          `
          <div style="font-family: sans-serif; font-size: 11px; padding: 2px; max-width: 220px;">
            <div style="font-weight: 700; color: #0F172A; font-size: 12px;">Route ${bus.routeShortName} • ${bus.registration}</div>
            <div style="color: #475569; font-size: 10px; margin-top: 1px;">To: ${bus.destination}</div>
            <div style="color: #64748B; font-size: 9px;">${bus.agencyName}</div>
            <div style="color: #059669; font-weight: 600; font-size: 10px; margin-top: 2px;">
              ${bus.speed > 0 ? `${bus.speed} km/h` : 'At stop / Standstill'} • ${bus.lastUpdated}
            </div>
          </div>
        `,
          { direction: 'top', offset: [0, -14] }
        );
        marker.addTo(group);
      });
    }

    renderBuses();
  }, [buses, selectedBus, onBusSelect]);

  // Controls Handlers
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetCenter = () => mapInstanceRef.current?.setView([28.5694, 77.2085], 13);

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-slate-50">
      {/* Real OpenStreetMap + CartoDB Leaflet Canvas */}
      <div ref={mapContainerRef} className="h-full w-full z-0" />

      {/* Map Control Buttons (Floating White Cards) */}
      <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
        {/* Zoom Controls */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-md backdrop-blur-md">
          <button
            onClick={handleZoomIn}
            className="flex h-9 w-9 items-center justify-center text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors border-b border-slate-200"
            title="Zoom In"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="flex h-9 w-9 items-center justify-center text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors"
            title="Zoom Out"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>

        {/* Center on Delhi AIIMS Hub */}
        <button
          onClick={handleResetCenter}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/95 text-slate-700 shadow-md backdrop-blur-md hover:bg-slate-50 active:bg-slate-100 transition-colors"
          title="Recenter on South Delhi Hub"
        >
          <Crosshair className="h-4 w-4" />
        </button>

        {/* Tile Theme Selector */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-md backdrop-blur-md p-1 flex flex-col gap-1">
          <button
            onClick={() => setTileTheme('osm')}
            className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-all ${
              tileTheme === 'osm'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            OSM Streets
          </button>
          <button
            onClick={() => setTileTheme('light_gray')}
            className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-all ${
              tileTheme === 'light_gray'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Clean Light
          </button>
        </div>
      </div>

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-3 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-md backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#059669]" />
          <span className="text-slate-700 font-medium">DTC State</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" />
          <span className="text-slate-700 font-medium">DIMTS Cluster</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#0891B2]" />
          <span className="text-slate-700 font-medium">Electric EV</span>
        </div>
        <div className="h-3 w-px bg-slate-200" />
        <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
          <span>{buses.length} buses live</span>
        </div>
      </div>
    </div>
  );
}
