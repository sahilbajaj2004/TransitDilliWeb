'use client';

import React, { useState, useEffect } from 'react';
import { TransitRoute } from '@/types/transit';
import { fetchTransitRoutes, fetchTransitRouteById } from '@/lib/api';
import { Bus as BusIcon, ArrowRight, Zap, Clock, ShieldCheck, MapPin } from 'lucide-react';

export function RouteExplorer() {
  const [routes, setRoutes] = useState<TransitRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<TransitRoute | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchTransitRoutes()
      .then((data) => {
        if (!isMounted) return;
        setRoutes(data);
        if (data.length > 0) {
          fetchTransitRouteById(data[0].id).then((full) => {
            if (isMounted && full) setSelectedRoute(full);
          });
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectRoute = (route: TransitRoute) => {
    fetchTransitRouteById(route.id).then((full) => {
      if (full) setSelectedRoute(full);
      else setSelectedRoute(route);
    });
  };

  return (
    <div className="flex h-full w-full flex-col lg:flex-row bg-slate-50 overflow-hidden">
      {/* Route List Pane */}
      <div className="w-full lg:w-96 border-r border-slate-200 bg-white p-4 overflow-y-auto shrink-0 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Delhi NCT Trunk Lines
        </h3>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading transit corridors...</div>
        ) : (
          <div className="space-y-2.5">
            {routes.map((route) => {
              const isSelected = selectedRoute?.id === route.id;
              return (
                <div
                  key={route.id}
                  onClick={() => handleSelectRoute(route)}
                  className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 shadow-xs ring-1 ring-blue-600/30'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-slate-900 font-mono text-xs font-bold text-white">
                        {route.shortName}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 line-clamp-1">
                          {route.longName}
                        </div>
                        <span className="text-[11px] text-slate-500">
                          Every {route.frequencyMinutes} min • {route.agency}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Route Corridor Details */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {selectedRoute ? (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 font-mono text-lg font-bold text-white shadow-xs">
                    {selectedRoute.shortName}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      {selectedRoute.longName}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Operated by {selectedRoute.agency} • Frequency: {selectedRoute.frequencyMinutes} mins
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 font-mono text-xs font-bold text-emerald-700 border border-emerald-200">
                    {selectedRoute.activeBusCount} buses active
                  </span>
                </div>
              </div>

              {/* Terminal to Terminal banner */}
              <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-3.5 text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <span className="font-semibold text-slate-900">{selectedRoute.origin}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-slate-900">{selectedRoute.destination}</span>
                </div>
              </div>
            </div>

            {/* Stop Sequence Line */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                Corridor Stop Sequence
              </h4>

              {selectedRoute.stops.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  Full stop sequence loading from GTFS database...
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {selectedRoute.stops.map((stop, idx) => (
                    <div key={stop.stopId} className="relative flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="absolute -left-6 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-[10px] font-bold text-white shadow-2xs">
                          {stop.sequence}
                        </span>
                        <span className="font-semibold text-slate-800">{stop.name}</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400">
                        {stop.lat.toFixed(4)}, {stop.lon.toFixed(4)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            Select a corridor to inspect its stop sequence
          </div>
        )}
      </div>
    </div>
  );
}
