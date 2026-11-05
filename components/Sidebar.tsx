'use client';

import React, { useState } from 'react';
import { Bus, Agency } from '@/types/transit';
import { BusCard } from '@/components/BusCard';
import { Filter, Zap, SlidersHorizontal, Bus as BusIcon } from 'lucide-react';

interface SidebarProps {
  buses: Bus[];
  selectedBus: Bus | null;
  onBusSelect: (bus: Bus) => void;
  selectedAgency: Agency | 'ALL';
  onAgencySelect: (agency: Agency | 'ALL') => void;
  electricOnly: boolean;
  onElectricToggle: (val: boolean) => void;
  isLoading: boolean;
}

export function Sidebar({
  buses,
  selectedBus,
  onBusSelect,
  selectedAgency,
  onAgencySelect,
  electricOnly,
  onElectricToggle,
  isLoading,
}: SidebarProps) {
  const dtcCount = buses.filter((b) => b.agency === 'DTC' && !b.isElectric).length;
  const dimtsCount = buses.filter((b) => b.agency === 'DIMTS').length;
  const evCount = buses.filter((b) => b.isElectric).length;

  return (
    <aside className="flex h-full w-full flex-col border-r border-slate-200 bg-white sm:w-96 md:w-[410px] shrink-0">
      {/* Header Filters & Agency Chips */}
      <div className="border-b border-slate-200 p-4 bg-slate-50/60">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
            <span>Active Fleets</span>
          </div>

          {/* Electric Only Quick Toggle */}
          <button
            onClick={() => onElectricToggle(!electricOnly)}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all border ${
              electricOnly
                ? 'bg-cyan-100 text-cyan-900 border-cyan-300 font-semibold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Zap className={`h-3 w-3 ${electricOnly ? 'text-cyan-600 fill-cyan-600' : 'text-slate-400'}`} />
            <span>EV Only</span>
          </button>
        </div>

        {/* Agency Selection Tabs */}
        <div className="grid grid-cols-4 gap-1.5">
          <button
            onClick={() => onAgencySelect('ALL')}
            className={`flex flex-col items-center justify-center rounded-lg p-2 text-center transition-all border ${
              selectedAgency === 'ALL'
                ? 'bg-white border-slate-900 text-slate-900 shadow-2xs font-semibold'
                : 'bg-white/80 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300'
            }`}
          >
            <span className="text-[11px]">All</span>
            <span className="font-mono text-xs font-bold tabular-nums text-slate-900">{buses.length}</span>
          </button>

          <button
            onClick={() => onAgencySelect('DTC')}
            className={`flex flex-col items-center justify-center rounded-lg p-2 text-center transition-all border ${
              selectedAgency === 'DTC'
                ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-2xs font-semibold'
                : 'bg-white/80 border-slate-200 text-slate-600 hover:bg-emerald-50/50 hover:border-emerald-200'
            }`}
          >
            <span className="text-[11px] text-emerald-700">DTC</span>
            <span className="font-mono text-xs font-bold tabular-nums text-emerald-800">{dtcCount}</span>
          </button>

          <button
            onClick={() => onAgencySelect('DIMTS')}
            className={`flex flex-col items-center justify-center rounded-lg p-2 text-center transition-all border ${
              selectedAgency === 'DIMTS'
                ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-2xs font-semibold'
                : 'bg-white/80 border-slate-200 text-slate-600 hover:bg-blue-50/50 hover:border-blue-200'
            }`}
          >
            <span className="text-[11px] text-blue-700">DIMTS</span>
            <span className="font-mono text-xs font-bold tabular-nums text-blue-800">{dimtsCount}</span>
          </button>

          <button
            onClick={() => onAgencySelect('EV')}
            className={`flex flex-col items-center justify-center rounded-lg p-2 text-center transition-all border ${
              selectedAgency === 'EV'
                ? 'bg-cyan-50 border-cyan-600 text-cyan-900 shadow-2xs font-semibold'
                : 'bg-white/80 border-slate-200 text-slate-600 hover:bg-cyan-50/50 hover:border-cyan-200'
            }`}
          >
            <span className="text-[11px] text-cyan-700">Electric</span>
            <span className="font-mono text-xs font-bold tabular-nums text-cyan-800">{evCount}</span>
          </button>
        </div>
      </div>

      {/* Bus Feed List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600 mb-3" />
            <span className="text-xs font-medium">Fetching real-time bus telemetry...</span>
          </div>
        ) : buses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <BusIcon className="h-10 w-10 text-slate-300 mb-2" />
            <span className="text-sm font-semibold text-slate-700">No buses active in view</span>
            <span className="text-xs text-slate-500 mt-1 max-w-xs">
              Try expanding the search query or adjusting the fleet filter.
            </span>
          </div>
        ) : (
          buses.map((bus) => (
            <BusCard
              key={bus.id}
              bus={bus}
              isSelected={selectedBus?.id === bus.id}
              onSelect={onBusSelect}
            />
          ))
        )}
      </div>
    </aside>
  );
}
