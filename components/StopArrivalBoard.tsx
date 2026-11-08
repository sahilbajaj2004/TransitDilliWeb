'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { TransitStop, ArrivalEstimate } from '@/types/transit';
import { fetchStopArrivals } from '@/lib/api';
import { MapPin, Clock, Zap, RefreshCw, Bus as BusIcon, Search, Radio, Compass } from 'lucide-react';

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
  const [stopSearch, setStopSearch] = useState('');
  const [refreshCountdown, setRefreshCountdown] = useState(15);

  const loadArrivals = React.useCallback(async (stopId: string) => {
    try {
      setIsLoading(true);
      const data = await fetchStopArrivals(stopId);
      setArrivals(data);
    } catch {
      setArrivals([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!currentStop) return;
    loadArrivals(currentStop.id);
    setRefreshCountdown(15);
  }, [currentStop, loadArrivals]);

  // 15-second adaptive countdown timer
  useEffect(() => {
    if (!currentStop) return;
    const interval = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          loadArrivals(currentStop.id);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentStop, loadArrivals]);

  // Filter stops for quick picker
  const filteredStops = useMemo(() => {
    if (!stopSearch.trim()) return stops.slice(0, 10);
    const q = stopSearch.toLowerCase().trim();
    return stops.filter((s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)).slice(0, 10);
  }, [stops, stopSearch]);

  if (!currentStop) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-slate-500">
        <RefreshCw className="h-6 w-6 animate-spin text-emerald-600 mb-2" />
        <span className="text-sm">Loading transit hubs...</span>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-slate-50 overflow-hidden">
      {/* Top Hub Bar */}
      <div className="border-b border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Stop Header info */}
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-2xs">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {currentStop.name}
                </h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600 border border-slate-200">
                  #{currentStop.code}
                </span>
                {currentStop.distanceMeters !== undefined && (
                  <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 border border-blue-200">
                    {currentStop.distanceMeters > 1000
                      ? `${(currentStop.distanceMeters / 1000).toFixed(1)} km away`
                      : `${currentStop.distanceMeters}m away`}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-1 font-medium text-emerald-600">
                  <Radio className="h-3 w-3 animate-pulse" /> Live Passenger Information System (PIS)
                </span>
                <span>•</span>
                <span>Refresh in {refreshCountdown}s</span>
              </div>
            </div>
          </div>

          {/* Quick Hub Filter & Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Find bus stop..."
                value={stopSearch}
                onChange={(e) => setStopSearch(e.target.value)}
                className="w-full sm:w-48 pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1 max-h-16 overflow-y-auto">
              {filteredStops.slice(0, 4).map((stop) => (
                <button
                  key={stop.id}
                  onClick={() => onStopSelect(stop)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all border ${
                    currentStop.id === stop.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {stop.name.split('/')[0].split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Arrival Countdown Cards Grid */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>Incoming Buses (Telemetry ETA)</span>
            <span className="flex items-center gap-1 font-mono text-[11px] normal-case text-slate-400">
              {arrivals.length} buses en route
            </span>
          </div>

          {isLoading && arrivals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <RefreshCw className="h-6 w-6 animate-spin text-emerald-600 mb-2" />
              <span className="text-xs font-medium">Querying live vehicle positions...</span>
            </div>
          ) : arrivals.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-2xs">
              <BusIcon className="h-10 w-10 text-slate-300 mb-3" />
              <h4 className="text-sm font-semibold text-slate-800">No approaching buses right now</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Next scheduled frequency for {currentStop.name} is running normally. Positions update every 9s.
              </p>
            </div>
          ) : (
            arrivals.map((arr) => {
              const isDue = arr.etaMinutes <= 2;
              return (
                <div
                  key={`${arr.vehicleId}-${arr.routeId}`}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-4 transition-all ${
                    isDue
                      ? 'border-emerald-300 bg-emerald-50/50 shadow-xs'
                      : 'border-slate-200 bg-white shadow-2xs hover:border-slate-300'
                  }`}
                >
                  {/* Left: Route and Destination */}
                  <div className="flex items-center gap-3.5">
                    <div
                      className="flex h-12 min-w-12 items-center justify-center rounded-xl border px-2.5 font-mono text-base font-bold text-white shadow-xs"
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
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-mono font-medium text-slate-700">{arr.registration}</span>
                        <span>•</span>
                        <span>{arr.agency}</span>
                        <span>•</span>
                        <span>{arr.speedKmH} km/h</span>
                        {arr.stopsRemaining !== undefined && (
                          <>
                            <span>•</span>
                            <span className="text-slate-600">{arr.stopsRemaining} {arr.stopsRemaining === 1 ? 'stop' : 'stops'} away</span>
                          </>
                        )}
                        {arr.freshness && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400 font-mono text-[10px]">{arr.freshness}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Countdown ETA */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    {/* Crowd Indicator */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${
                          arr.crowding === 'LOW'
                            ? 'bg-emerald-500'
                            : arr.crowding === 'HIGH'
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                        }`}
                      />
                      <span className="text-[11px] font-medium text-slate-600 capitalize">
                        {arr.crowding?.toLowerCase() || 'medium'} crowd
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Clock className={`h-4 w-4 ${isDue ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span className="font-mono text-xl font-extrabold text-slate-900 tabular-nums">
                          {arr.etaMinutes === 0 ? 'DUE' : `${arr.etaMinutes} min`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 justify-end text-[11px] text-slate-500 font-mono">
                        {arr.predictedArrivalTime && (
                          <span>ETA {arr.predictedArrivalTime} • </span>
                        )}
                        <span>{arr.distanceKm.toFixed(1)} km</span>
                      </div>
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
