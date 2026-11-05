'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Bus, TransitStop, FleetStats, Agency } from '@/types/transit';
import { fetchFleetStats, fetchNearbyBuses, fetchNearbyStops } from '@/lib/api';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { VehicleInspector } from '@/components/VehicleInspector';
import { StopArrivalBoard } from '@/components/StopArrivalBoard';
import { RouteExplorer } from '@/components/RouteExplorer';

// Dynamically import Leaflet Map component on client side (no SSR for Leaflet)
const TransitMap = dynamic(
  () => import('@/components/TransitMap').then((mod) => mod.TransitMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-slate-50 text-xs text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600" />
          <span>Loading Delhi OpenStreetMap Cartography...</span>
        </div>
      </div>
    ),
  }
);

export default function HomePage() {
  const [stats, setStats] = useState<FleetStats | null>(null);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [stops, setStops] = useState<TransitStop[]>([]);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [selectedStop, setSelectedStop] = useState<TransitStop | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'map' | 'stops' | 'routes'>('map');
  const [selectedAgency, setSelectedAgency] = useState<Agency | 'ALL'>('ALL');
  const [electricOnly, setElectricOnly] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSeconds, setRefreshSeconds] = useState(9);
  const [isLoading, setIsLoading] = useState(true);

  // Load Initial Data from Backend
  const loadData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [statsData, busesData, stopsData] = await Promise.all([
        fetchFleetStats().catch(() => null),
        fetchNearbyBuses(28.5694, 77.2085, 15, undefined, undefined, 100).catch(() => []),
        fetchNearbyStops(28.5694, 77.2085, 10).catch(() => []),
      ]);

      if (statsData) setStats(statsData);
      if (busesData.length > 0) setBuses(busesData);
      if (stopsData.length > 0) setStops(stopsData);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 9-Second OTD Refresh Countdown Loop
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshSeconds((prev) => {
        if (prev <= 1) {
          loadData();
          return 9;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loadData]);

  // Keyboard shortcut listener ('/' to search, 'Escape' to dismiss)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      }
      if (e.key === 'Escape') {
        setSelectedBus(null);
        setSelectedStop(null);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter Buses by Search, Agency, and Electric Only
  const filteredBuses = useMemo(() => {
    return buses.filter((bus) => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchRoute = bus.routeShortName.toLowerCase().includes(q);
        const matchPlate = bus.registration.toLowerCase().includes(q);
        const matchDest = bus.destination.toLowerCase().includes(q);
        const matchAgency = bus.agencyName.toLowerCase().includes(q);
        if (!matchRoute && !matchPlate && !matchDest && !matchAgency) return false;
      }

      // Agency filter
      if (selectedAgency !== 'ALL') {
        if (selectedAgency === 'EV') {
          if (!bus.isElectric) return false;
        } else if (bus.agency !== selectedAgency) {
          return false;
        }
      }

      // Electric toggle
      if (electricOnly && !bus.isElectric) return false;

      return true;
    });
  }, [buses, searchQuery, selectedAgency, electricOnly]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-white text-slate-900">
      {/* Top Navigation & Status Bar */}
      <Header
        stats={stats}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeView={activeView}
        onViewChange={setActiveView}
        onRefresh={() => {
          setRefreshSeconds(9);
          loadData();
        }}
        isRefreshing={isRefreshing}
        refreshSeconds={refreshSeconds}
      />

      {/* Main Dual-Pane Dashboard */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Left Sidebar (Only visible in Map Radar view) */}
        {activeView === 'map' && (
          <Sidebar
            buses={filteredBuses}
            selectedBus={selectedBus}
            onBusSelect={setSelectedBus}
            selectedAgency={selectedAgency}
            onAgencySelect={setSelectedAgency}
            electricOnly={electricOnly}
            onElectricToggle={setElectricOnly}
            isLoading={isLoading}
          />
        )}

        {/* View Canvas Area */}
        <main className="relative flex-1 h-full w-full overflow-hidden bg-slate-50">
          {activeView === 'map' && (
            <>
              <TransitMap
                buses={filteredBuses}
                stops={stops}
                selectedBus={selectedBus}
                onBusSelect={setSelectedBus}
                selectedStop={selectedStop}
                onStopSelect={setSelectedStop}
              />

              {/* Flyout Vehicle Telemetry Inspector */}
              <VehicleInspector
                bus={selectedBus}
                onClose={() => setSelectedBus(null)}
              />
            </>
          )}

          {activeView === 'stops' && (
            <StopArrivalBoard
              stops={stops}
              selectedStop={selectedStop}
              onStopSelect={setSelectedStop}
            />
          )}

          {activeView === 'routes' && <RouteExplorer />}
        </main>
      </div>
    </div>
  );
}
