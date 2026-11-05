'use client';

import React from 'react';
import { Bus } from '@/types/transit';
import { X, Navigation, Gauge, Compass, Zap, ShieldCheck, MapPin, Radio, Activity } from 'lucide-react';

interface VehicleInspectorProps {
  bus: Bus | null;
  onClose: () => void;
}

export function VehicleInspector({ bus, onClose }: VehicleInspectorProps) {
  if (!bus) return null;

  const isElectric = bus.isElectric;
  const isDimts = bus.agency === 'DIMTS';

  const badgeColor = isElectric
    ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
    : isDimts
    ? 'bg-blue-50 text-blue-800 border-blue-200'
    : 'bg-emerald-50 text-emerald-800 border-emerald-200';

  return (
    <div className="absolute right-4 top-20 z-30 w-96 max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-2xl backdrop-blur-md transition-all">
      {/* Header Row */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl border font-mono text-base font-bold shadow-2xs ${badgeColor}`}>
            {bus.routeShortName}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold text-slate-900 tracking-tight">
                {bus.registration}
              </h3>
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">{bus.agencyName}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Real-time Telemetry Grid */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-center">
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
            <Gauge className="h-3.5 w-3.5 text-slate-400" />
            <span>Speed</span>
          </div>
          <span className="font-mono text-base font-bold text-slate-900 tabular-nums mt-0.5">
            {bus.speed} <span className="text-[10px] font-normal text-slate-500">km/h</span>
          </span>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-center">
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
            <Compass className="h-3.5 w-3.5 text-slate-400" />
            <span>Heading</span>
          </div>
          <span className="font-mono text-base font-bold text-slate-900 tabular-nums mt-0.5">
            {bus.bearing}°
          </span>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-center">
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
            <Activity className="h-3.5 w-3.5 text-slate-400" />
            <span>Comfort</span>
          </div>
          <span className="font-mono text-xs font-bold text-emerald-700 mt-1">
            {bus.isAc ? 'AC Low-Floor' : 'Standard'}
          </span>
        </div>
      </div>

      {/* GPS Telemetry */}
      <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
        <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
          <span className="flex items-center gap-1.5 font-medium">
            <MapPin className="h-3.5 w-3.5 text-slate-400" /> Location Coordinates
          </span>
          <span className="font-mono text-[11px] text-slate-500">{bus.lastUpdated}</span>
        </div>
        <div className="font-mono text-xs font-semibold text-slate-800 tabular-nums">
          {bus.lat.toFixed(5)}° N, {bus.lon.toFixed(5)}° E
        </div>
      </div>

      {/* Stop Progression */}
      <div className="mt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Route Progression
        </h4>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
              <span className="font-semibold text-slate-800">Next: {bus.nextStopName || 'AIIMS Ring Road'}</span>
            </div>
            {bus.nextStopEtaMinutes !== undefined && (
              <span className="font-mono text-xs font-bold text-emerald-700">
                {bus.nextStopEtaMinutes} min
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              <span>Destination: {bus.destination}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
