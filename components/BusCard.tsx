'use client';

import React from 'react';
import { Bus } from '@/types/transit';
import { Gauge, Navigation, Zap, Clock, ShieldCheck, ChevronRight } from 'lucide-react';

interface BusCardProps {
  bus: Bus;
  isSelected: boolean;
  onSelect: (bus: Bus) => void;
}

export function BusCard({ bus, isSelected, onSelect }: BusCardProps) {
  const isElectric = bus.isElectric;
  const isDtc = bus.agency === 'DTC' && !isElectric;
  const isDimts = bus.agency === 'DIMTS';

  const badgeStyle = isElectric
    ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
    : isDimts
    ? 'bg-blue-50 text-blue-800 border-blue-200'
    : 'bg-emerald-50 text-emerald-800 border-emerald-200';

  return (
    <div
      onClick={() => onSelect(bus)}
      className={`group relative cursor-pointer rounded-xl border p-3.5 transition-all ${
        isSelected
          ? 'border-blue-600 bg-blue-50/40 shadow-sm ring-1 ring-blue-600/30'
          : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Route Badge & Line Title */}
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 font-mono text-sm font-bold tracking-tight shadow-2xs ${badgeStyle}`}
          >
            {bus.routeShortName}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-slate-900 tracking-tight">
                {bus.registration}
              </span>
              {bus.isAc && (
                <span className="rounded bg-slate-100 px-1 py-0.2 text-[9px] font-semibold text-slate-600 border border-slate-200">
                  AC
                </span>
              )}
              {isElectric && (
                <span className="flex items-center gap-0.5 rounded bg-cyan-100 px-1 py-0.2 text-[9px] font-semibold text-cyan-800 border border-cyan-200">
                  <Zap className="h-2.5 w-2.5 text-cyan-600" /> EV
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 line-clamp-1">
              {bus.destination}
            </span>
          </div>
        </div>

        {/* Speed / Telemetry Badge */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 text-xs">
            <Gauge className={`h-3.5 w-3.5 ${bus.speed > 25 ? 'text-emerald-600' : bus.speed > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
            <span className="font-mono font-bold text-slate-800 tabular-nums">
              {bus.speed}
            </span>
            <span className="text-[10px] text-slate-500 font-normal">km/h</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">{bus.lastUpdated}</span>
        </div>
      </div>

      {/* Next Stop & ETA Row */}
      {bus.nextStopName && (
        <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-600 truncate max-w-[70%]">
            <Navigation className="h-3 w-3 text-slate-400 shrink-0" />
            <span className="truncate">Next: <strong className="font-semibold text-slate-800">{bus.nextStopName}</strong></span>
          </div>

          {bus.nextStopEtaMinutes !== undefined && (
            <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700 border border-emerald-200 shrink-0">
              <Clock className="h-2.5 w-2.5" />
              <span>{bus.nextStopEtaMinutes} min</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
