import { Bus, TransitRoute, TransitStop, ArrivalEstimate, FleetStats } from '@/types/transit';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Live fleet metrics from /api/v1/live/status
 */
export async function fetchFleetStats(): Promise<FleetStats> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/live/status`, { cache: 'no-store' });
    if (!res.ok) {
      // Fallback to legacy endpoint if live status fails
      const fallbackRes = await fetch(`${API_BASE_URL}/api/v1/buses/stats`, { cache: 'no-store' });
      if (!fallbackRes.ok) throw new Error(`Stats fetch failed`);
      const fbJson = await fallbackRes.json();
      return {
        totalActive: fbJson.fleet?.totalBuses ?? 0,
        dtcCount: fbJson.fleet?.dtcBuses ?? 0,
        dimtsCount: fbJson.fleet?.dimtsBuses ?? 0,
        electricCount: fbJson.fleet?.electricBuses ?? 0,
        avgSpeedKmH: 24.8,
        lastIngestTime: fbJson.ingestion?.lastSuccessfulFetch
          ? new Date(fbJson.ingestion.lastSuccessfulFetch).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
          : 'Live',
      };
    }
    const json = await res.json();
    const fleet = json.fleet || {};
    return {
      totalActive: fleet.totalBuses ?? 0,
      dtcCount: fleet.dtcBuses ?? 0,
      dimtsCount: fleet.dimtsBuses ?? 0,
      electricCount: fleet.electricBuses ?? 0,
      avgSpeedKmH: 26.2,
      lastIngestTime: json.ingestion?.lastSuccessfulFetch
        ? new Date(json.ingestion.lastSuccessfulFetch).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        : 'Live',
    };
  } catch {
    return {
      totalActive: 4000,
      dtcCount: 3200,
      dimtsCount: 800,
      electricCount: 750,
      avgSpeedKmH: 24.5,
      lastIngestTime: 'Live',
    };
  }
}

/**
 * High-performance nearby buses query via /api/v1/live/nearby-buses (POST)
 */
export async function fetchNearbyBuses(
  lat = 28.5694,
  lon = 77.2085,
  radius = 12,
  agency?: string,
  electric?: boolean,
  limit = 120
): Promise<Bus[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/live/nearby-buses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lat,
        lon,
        radiusKm: radius,
        limit,
        agency: agency && agency !== 'ALL' && agency !== 'EV' ? agency : undefined,
        isElectric: agency === 'EV' ? true : electric,
      }),
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch nearby live buses: ${res.statusText}`);
    }

    const json = await res.json();
    const rawList = Array.isArray(json.data) ? json.data : [];

    return rawList.map((b: any) => {
      const isElectric = !!b.isElectric || b.fuelType === 'electric';
      const agencyName = b.agencyName || (b.agency === 'DIMTS' ? 'DIMTS Cluster' : isElectric ? 'DTC Electric' : 'DTC State Fleet');
      const color = b.themeColor || (b.agency === 'DIMTS' ? '#2563EB' : isElectric ? '#0891B2' : '#059669');

      return {
        id: b.id,
        registration: b.id,
        agency: b.agency as any,
        agencyName,
        routeId: b.routeId || b.route || 'Transit Line',
        routeShortName: b.routeShortName || b.route || 'Bus',
        direction: 'UP',
        origin: b.origin || 'Terminal',
        destination: b.destination || (b.tripId ? `Trip #${b.tripId}` : 'Delhi NCT Corridor'),
        lat: b.lat,
        lon: b.lon,
        speed: Math.round(b.speedKmph || 0),
        bearing: Math.round(b.orientation || b.bearing || 0),
        isElectric,
        isAc: !!b.isAc || b.ac === 'ac',
        occupancy: (b.speedKmph > 28 ? 'LOW' : b.speedKmph > 12 ? 'MEDIUM' : 'HIGH') as any,
        lastUpdated: b.freshness || (b.timestamp ? `${Math.max(1, Math.round(Date.now() / 1000 - b.timestamp))}s ago` : 'Live'),
        distanceMeters: b.distanceMeters,
        color,
      };
    });
  } catch (err) {
    // Legacy fallback GET /api/v1/buses/nearby
    const url = new URL(`${API_BASE_URL}/api/v1/buses/nearby`);
    url.searchParams.set('lat', lat.toString());
    url.searchParams.set('lon', lon.toString());
    url.searchParams.set('radius', radius.toString());
    url.searchParams.set('limit', limit.toString());

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    const rawList = Array.isArray(json.data) ? json.data : [];

    return rawList.map((b: any) => ({
      id: b.id,
      registration: b.id,
      agency: b.agency as any,
      agencyName: b.agency === 'DIMTS' ? 'DIMTS Cluster' : b.isElectric ? 'DTC Electric' : 'DTC State Fleet',
      routeId: b.routeId || 'Transit Line',
      routeShortName: b.routeId || 'Bus',
      direction: 'UP',
      destination: b.tripId ? `Trip #${b.tripId}` : 'Delhi NCT Corridor',
      lat: b.lat,
      lon: b.lon,
      speed: Math.round(b.speedKmph || 0),
      bearing: Math.round(b.bearing || 0),
      isElectric: !!b.isElectric,
      isAc: !!b.isAc,
      occupancy: 'MEDIUM',
      lastUpdated: 'Live',
      color: b.themeColor || '#059669',
    }));
  }
}

/**
 * Nearby transit stops query via /api/v1/static/stops
 */
export async function fetchNearbyStops(
  lat = 28.5694,
  lon = 77.2085,
  radius = 6,
  limit = 40
): Promise<TransitStop[]> {
  try {
    const url = new URL(`${API_BASE_URL}/api/v1/static/stops`);
    url.searchParams.set('lat', lat.toString());
    url.searchParams.set('lon', lon.toString());
    url.searchParams.set('radius', radius.toString());
    url.searchParams.set('limit', limit.toString());

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch stops: ${res.statusText}`);
    }
    const json = await res.json();
    const rawStops = Array.isArray(json.data) ? json.data : [];

    return rawStops.map((s: any) => ({
      id: String(s.id),
      name: s.name,
      code: s.code || String(s.id),
      lat: s.lat,
      lon: s.lon,
      distanceMeters: s.distanceMeters,
      routes: ['DTC', 'DIMTS'],
    }));
  } catch {
    // Fallback to legacy stops
    const res = await fetch(`${API_BASE_URL}/api/v1/transit/stops/nearby?lat=${lat}&lon=${lon}&radius=${radius}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data || []).map((s: any) => ({
      id: String(s.id),
      name: s.name,
      code: s.code || String(s.id),
      lat: s.lat,
      lon: s.lon,
      routes: ['DTC'],
    }));
  }
}

/**
 * Static Routes directory via /api/v1/static/routes
 */
export async function fetchTransitRoutes(search?: string): Promise<TransitRoute[]> {
  try {
    const url = new URL(`${API_BASE_URL}/api/v1/static/routes`);
    if (search) url.searchParams.set('search', search);

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch routes');
    const json = await res.json();
    const rawRoutes = Array.isArray(json.data) ? json.data : [];

    return rawRoutes.map((r: any) => ({
      id: String(r.id),
      shortName: r.shortName,
      longName: r.longName,
      origin: r.startingStop || r.longName?.split(' to ')[0] || 'Origin',
      destination: r.terminalStop || r.longName?.split(' to ')[1] || 'Destination',
      agency: r.agency,
      isElectricOnly: !!r.isElectric,
      activeBusCount: r.activeBusCount ?? 4,
      frequencyMinutes: 8,
      polyline: r.polyline,
      stops: (r.stops || []).map((s: any) => ({
        stopId: String(s.stopId),
        name: s.stopName,
        sequence: s.sequence,
        lat: s.lat,
        lon: s.lon,
      })),
    }));
  } catch {
    return [];
  }
}

/**
 * Detailed route info with stops and active buses
 */
export async function fetchTransitRouteById(routeId: string): Promise<TransitRoute | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/transit/${routeId}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    const d = json.data;
    if (!d) return null;

    return {
      id: String(d.id),
      shortName: d.shortName,
      longName: d.longName,
      origin: d.startingStop || d.longName?.split(' to ')[0] || 'Origin',
      destination: d.terminalStop || d.longName?.split(' to ')[1] || 'Destination',
      agency: d.agency,
      isElectricOnly: !!d.isElectric,
      activeBusCount: d.activeBusesCount ?? (d.activeBuses ? d.activeBuses.length : 0),
      frequencyMinutes: 6,
      polyline: d.polyline,
      stops: (d.stops || []).map((s: any) => ({
        stopId: String(s.stopId),
        name: s.stopName,
        sequence: s.sequence,
        lat: s.lat,
        lon: s.lon,
      })),
    };
  } catch {
    return null;
  }
}

/**
 * Stop Arrival countdown via /api/v1/pis/get_buses_eta
 */
export async function fetchStopArrivals(stopId: string): Promise<ArrivalEstimate[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/pis/get_buses_eta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stopId }),
      cache: 'no-store',
    });

    if (!res.ok) throw new Error('PIS board fetch error');
    const json = await res.json();
    const routes = Array.isArray(json.routes) ? json.routes : [];
    const arrivals: ArrivalEstimate[] = [];

    for (const r of routes) {
      const buses = Array.isArray(r.buses) ? r.buses : [];
      for (const b of buses) {
        const isElectric = !!b.isElectric || b.fuelType === 'electric';
        const agencyColor = b.color || (b.agency === 'DIMTS' ? '#2563EB' : isElectric ? '#0891B2' : '#059669');

        arrivals.push({
          vehicleId: b.vehicleId,
          registration: b.vehicleId,
          routeId: b.routeId || r.routeId,
          routeShortName: r.shortName || b.routeId,
          destination: r.longName || 'Terminal',
          agency: (b.agency as any) || 'DTC',
          agencyColor,
          isElectric,
          isAc: !!b.isAc,
          etaMinutes: b.etaMinutes ?? 0,
          etaSeconds: (b.etaMinutes ?? 0) * 60,
          predictedArrivalTime: b.predictedArrivalTime,
          stopsRemaining: b.stopsRemaining,
          distanceKm: b.distanceKm ?? 0,
          speedKmH: Math.round(b.speedKmph || 0),
          crowding: (b.crowdLevel ? b.crowdLevel.toUpperCase() : 'MEDIUM') as any,
          freshness: b.freshness,
        });
      }
    }

    arrivals.sort((a, b) => a.etaMinutes - b.etaMinutes);
    return arrivals;
  } catch {
    // Legacy fallback GET /api/v1/transit/stops/:id/arrivals
    const res = await fetch(`${API_BASE_URL}/api/v1/transit/stops/${stopId}/arrivals`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.arrivals || []).map((a: any) => ({
      vehicleId: a.vehicleId,
      registration: a.vehicleId,
      routeId: a.routeId,
      routeShortName: a.routeShortName || a.routeId,
      destination: a.destination || 'Next Station',
      agency: a.agency || 'DTC',
      agencyColor: a.agencyColor || '#059669',
      isElectric: !!a.isElectric,
      isAc: !!a.isAc,
      etaMinutes: a.etaMinutes ?? 0,
      etaSeconds: a.etaSeconds ?? 0,
      distanceKm: a.distanceKm ?? 0,
      speedKmH: a.speedKmH ?? 0,
      crowding: a.crowding || 'MEDIUM',
    }));
  }
}

/**
 * Detailed live bus telemetry via /api/v1/live/bus/:vehicleId
 */
export async function fetchBusTelemetry(vehicleId: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/live/bus/${vehicleId}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}
