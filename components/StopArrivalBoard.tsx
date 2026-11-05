'use client';

import React, { useState, useEffect } from 'react';
import { TransitStop, ArrivalEstimate } from '@/types/transit';
import { fetchStopArrivals } from '@/lib/api';
import { MapPin, Clock, Users, Zap, RefreshCw, Bus as BusIcon, AlertCircle } from 'lucide-react';

interface StopArrivalBoardProps {
  stops: TransitStop[];
  selectedStop: TransitStop | null;
  onStopSelect: (stop: TransitStop) => void;
}

export function StopArrivalBoard({
  stops,
  selectedStop,
  onStopSelect,
}: StopArrivalBoardProps) {
  const currentStop = selectedStop || stops[0];
  const [arrivals, setArrivals] = useState<ArrivalEstimate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!currentStop) return;

    let isMounted = true;
    setIsLoading(true);

    fetchStopArrivals(currentStop.id)
      .then((data) => {
        if (isMounted) setArrivals(data);
      })
      .catch(() => {
        if (isMounted) setArrivals([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentStop]);

  if (!currentStop) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-slate-500">
        Loading transit stops...
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-slate-50 overflow-hidden">
      {/* Top Hub Bar */}
      <div className="border-b border-slate-200 bg-white p-4 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 shadow-2xs">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {currentStop.name}
                </h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600 border border-slate-200">
                  {currentStop.code}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Delhi NCT Arterial PIS Board • Live Countdown
              </p>
            </div>
          </div>

          {/* Quick Hub Switcher */}
          <div className="flex flex-wrap items-center gap-1.5">
            {stops.slice(0, 5).map((stop) => (
              <button
                key={stop.id}
                onClick={() => onStopSelect(stop)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all border ${
                  currentStop.id === stop.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {stop.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Arrival Countdown Cards Grid */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>Incoming Buses (Real-time OTD ETA)</span>
            <span>Platform Status</span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <RefreshCw className="h-6 w-6 animate-spin text-emerald-600 mb-2" />
              <span className="text-xs font-medium">Calculating stop arrival countdowns...</span>
            </div>
          ) : arrivals.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-2xs">
              <BusIcon className="h-10 w-10 text-slate-300 mb-3" />
              <h4 className="text-sm font-semibold text-slate-800">No buses arriving within 15 minutes</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Next scheduled frequency for this hub is operating normally. Telemetry updates every 9s.
              </p>
            </div>
          ) : (
            arrivals.map((arr) => {
              const isDue = arr.etaMinutes <= 2;
              return (
                <div
                  key={arr.vehicleId}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-4 transition-all ${
                    isDue
                      ? 'border-emerald-300 bg-emerald-50/40 shadow-xs'
                      : 'border-slate-200 bg-white shadow-2xs'
                  }`}
                >
                  {/* Left: Route and Destination */}
                  <div className="flex items-center gap-3.5">
                    <div
                      className="flex h-11 min-w-11 items-center justify-center rounded-xl border px-2.5 font-mono text-base font-bold text-white shadow-xs"
                      style={{ backgroundColor: arr.agencyColor, borderColor: arr.agencyColor }}
                    >
                      {arr.routeShortName}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 tracking-tight">
                          Towards {arr.destination}
                        </span>
                        {arr.isAc && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-semibold text-slate-700 border border-slate-200">
                            AC
                          </span>
                        )}
                        {arr.isElectric && (
                          <span className="flex items-center gap-0.5 rounded bg-cyan-100 px-1.5 py-0.2 text-[9px] font-semibold text-cyan-800 border border-cyan-200">
                            <Zap className="h-2.5 w-2.5 text-cyan-600" /> EV
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-mono">{arr.registration}</span>
                        <span>•</span>
                        <span>{arr.agency}</span>
                        <span>•</span>
                        <span>{arr.speedKmH} km/h</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Countdown ETA */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Clock className={`h-4 w-4 ${isDue ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span className="font-mono text-xl font-extrabold text-slate-900 tabular-nums">
                          {arr.etaMinutes === 0 ? 'DUE' : `${arr.etaMinutes} min`}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {arr.distanceKm.toFixed(1)} km away
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
