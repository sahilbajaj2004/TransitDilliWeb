'use client';

import React from 'react';
import Image from 'next/image';
import { FleetStats } from '@/types/transit';
import { Search, Bus as BusIcon, Zap, Radio, RefreshCw, Layers } from 'lucide-react';

interface HeaderProps {
  stats: FleetStats | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeView: 'map' | 'stops' | 'routes';
  onViewChange: (view: 'map' | 'stops' | 'routes') => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  refreshSeconds: number;
}

export function Header({
  stats,
  searchQuery,
  onSearchChange,
  activeView,
  onViewChange,
  onRefresh,
  isRefreshing,
  refreshSeconds,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-md shadow-xs">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50 shadow-xs">
          <Image
            src="/logo.png"
            alt="TransitDilli Brandmark"
            width={34}
            height={34}
            className="object-contain"
            priority
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Transit<span className="text-emerald-600">Dilli</span>
            </span>
            <span className="hidden rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 border border-emerald-200 sm:inline-block">
              OTD Live
            </span>
          </div>
          <span className="hidden text-xs text-slate-500 lg:inline-block">
            Delhi NCT Real-Time Transit Telemetry
          </span>
        </div>
      </div>

      {/* Global Search */}
      <div className="relative mx-4 flex max-w-md flex-1 items-center">
        <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search bus line (e.g. 534), stop, or vehicle ID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-12 text-xs text-slate-900 placeholder-slate-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
        />
        <kbd className="pointer-events-none absolute right-3.5 hidden rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-400 sm:inline-block shadow-2xs">
          /
        </kbd>
      </div>

      {/* Stats & Navigation Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Real-time Fleet Counter Chips */}
        {stats && (
          <div className="hidden items-center gap-1.5 xl:flex">
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs">
              <BusIcon className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-slate-500">Fleet:</span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {stats.totalActive.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-700 font-medium">DTC:</span>
              <span className="font-mono font-semibold text-emerald-900 tabular-nums">
                {stats.dtcCount.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-1.5 rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs">
              <Zap className="h-3 w-3 text-cyan-600" />
              <span className="text-cyan-700 font-medium">EV:</span>
              <span className="font-mono font-semibold text-cyan-900 tabular-nums">
                {stats.electricCount.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* View Switcher Segmented Control */}
        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-1">
          <button
            onClick={() => onViewChange('map')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              activeView === 'map'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Radar Map</span>
          </button>

          <button
            onClick={() => onViewChange('stops')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              activeView === 'stops'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-blue-600" />
            <span className="hidden sm:inline">Stop Boards</span>
          </button>

          <button
            onClick={() => onViewChange('routes')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              activeView === 'routes'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BusIcon className="h-3.5 w-3.5 text-slate-600" />
            <span className="hidden sm:inline">Corridors</span>
          </button>
        </div>

        {/* Live Ingestion Refresh Counter */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Force telemetry refresh"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="font-mono text-[11px] font-semibold text-slate-600 tabular-nums">
            {refreshSeconds}s
          </span>
        </button>
      </div>
    </header>
  );
}
