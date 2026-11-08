'use client';

import React, { useEffect, useState } from 'react';
import { Bus } from '@/types/transit';
import { fetchBusTelemetry } from '@/lib/api';
import { X, Navigation, Gauge, Compass, Zap, MapPin, Radio, Activity, Clock } from 'lucide-react';

interface VehicleInspectorProps {
  bus: Bus | null;
  onClose: () => void;
}

export function VehicleInspector({ bus, onClose }: VehicleInspectorProps) {
  const [telemetry, setTelemetry] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bus) {
      setTelemetry(null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetchBusTelemetry(bus.id)
      .then((data) => {
        if (isMounted && data) {
          setTelemetry(data);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [bus]);

  if (!bus) return null;

  const isElectric = bus.isElectric;
  const isDimts = bus.agency === 'DIMTS';

  const badgeColor = isElectric
    ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
    : isDimts
    ? 'bg-blue-50 text-blue-800 border-blue-200'
    : 'bg-emerald-50 text-emerald-800 border-emerald-200';

  const upcomingStops = telemetry?.upcomingStops || [];

  return (
    <div className="absolute right-4 top-20 z-30 w-96 max-w-[calc(100vw-32px)] max-h-[calc(100vh-100px)] flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur-md transition-all">
      {/* Header Row */}
      <div className="flex items-start justify-between border-b border-slate-100 p-4 pb-3">
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

      <div className="flex-1 overflow-y-auto p-4 pt-3 space-y-3">
        {/* Destination banner */}
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Heading Towards</div>
          <div className="text-xs font-bold text-slate-900 mt-0.5">{bus.destination}</div>
          {bus.origin && bus.origin !== 'Origin' && (
            <div className="text-[11px] text-slate-500 mt-0.5">From {bus.origin}</div>
          )}
        </div>

        {/* Real-time Telemetry Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50 p-2 text-center">
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <Gauge className="h-3.5 w-3.5 text-slate-400" />
              <span>Speed</span>
            </div>
            <span className="font-mono text-base font-bold text-slate-900 tabular-nums mt-0.5">
              {bus.speed} <span className="text-[10px] font-normal text-slate-500">km/h</span>
            </span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50 p-2 text-center">
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <Compass className="h-3.5 w-3.5 text-slate-400" />
              <span>Heading</span>
            </div>
            <span className="font-mono text-base font-bold text-slate-900 tabular-nums mt-0.5">
              {bus.bearing}°
            </span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50 p-2 text-center">
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
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin className="h-3.5 w-3.5 text-slate-400" /> GPS Coordinates
            </span>
            <span className="font-mono text-[11px] text-slate-500">{bus.lastUpdated}</span>
          </div>
          <div className="font-mono text-xs font-semibold text-slate-800 tabular-nums">
            {bus.lat.toFixed(5)}° N, {bus.lon.toFixed(5)}° E
          </div>
        </div>

        {/* Upcoming Stops Along Route */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
            <span>Upcoming Route Stops</span>
            {upcomingStops.length > 0 && (
              <span className="font-mono text-[10px] text-slate-400 font-normal">{upcomingStops.length} stops downstream</span>
            )}
          </h4>

          {loading ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center text-xs text-slate-400">
              Calculating stop sequence...
            </div>
          ) : upcomingStops.length === 0 ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500">
              Operating regular corridor route.
            </div>
          ) : (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-2 space-y-1.5 max-h-48 overflow-y-auto">
              {upcomingStops.slice(0, 8).map((st: any, idx: number) => (
                <div key={st.stopId} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-b-0">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${idx === 0 ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-slate-300'}`} />
                    <span className={`truncate max-w-[170px] ${idx === 0 ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                      {st.stopName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-emerald-700 tabular-nums">
                      {st.etaMinutes === 0 ? 'DUE' : `${st.etaMinutes} min`}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {st.distanceKm}km
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
