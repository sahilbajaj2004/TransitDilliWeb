import { Bus, TransitRoute, TransitStop, ArrivalEstimate, FleetStats } from '@/types/transit';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function fetchFleetStats(): Promise<FleetStats> {
  const res = await fetch(`${API_BASE_URL}/api/v1/buses/stats`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch fleet stats: ${res.statusText}`);
  }
  const json = await res.json();
  const fleet = json.fleet || {};
  return {
    totalActive: fleet.totalBuses ?? 0,
    dtcCount: fleet.dtcBuses ?? 0,
    dimtsCount: fleet.dimtsBuses ?? 0,
    electricCount: fleet.electricBuses ?? 0,
    avgSpeedKmH: 26.5,
    lastIngestTime: json.ingestion?.lastSuccessfulFetch
      ? new Date(json.ingestion.lastSuccessfulFetch).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : 'Live',
  };
}

export async function fetchNearbyBuses(
  lat = 28.5694,
  lon = 77.2085,
  radius = 15,
  agency?: string,
  electric?: boolean,
  limit = 100
): Promise<Bus[]> {
  const url = new URL(`${API_BASE_URL}/api/v1/buses/nearby`);
  url.searchParams.set('lat', lat.toString());
  url.searchParams.set('lon', lon.toString());
  url.searchParams.set('radius', radius.toString());
  url.searchParams.set('limit', limit.toString());
  if (agency) url.searchParams.set('agency', agency);
  if (electric !== undefined) url.searchParams.set('electric', electric.toString());

  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch nearby buses: ${res.statusText}`);
  }
  const json = await res.json();
  const rawList = Array.isArray(json.data) ? json.data : [];

  return rawList.map((b: any) => {
    const isElectric = !!b.isElectric || b.fuelType === 'electric';
    const agencyName = b.agency === 'DIMTS' ? 'DIMTS Cluster' : isElectric ? 'DTC Electric' : 'DTC State Fleet';
    const color = b.themeColor || (b.agency === 'DIMTS' ? '#2563EB' : isElectric ? '#0891B2' : '#059669');

    return {
      id: b.id,
      registration: b.id,
      agency: b.agency as any,
      agencyName,
      routeId: b.routeId || 'Transit Line',
      routeShortName: b.routeId || 'Bus',
      direction: 'UP',
      destination: b.tripId ? `Trip #${b.tripId}` : 'Delhi NCT Corridor',
      lat: b.lat,
      lon: b.lon,
      speed: Math.round(b.speedKmph || 0),
      bearing: Math.round(b.bearing || 0),
      isElectric,
      isAc: !!b.isAc,
      occupancy: (b.speedKmph > 30 ? 'LOW' : b.speedKmph > 10 ? 'MEDIUM' : 'HIGH') as any,
      lastUpdated: b.timestamp ? `${Math.max(1, Math.round(Date.now() / 1000 - b.timestamp))}s ago` : 'Live',
      color,
    };
  });
}

export async function fetchNearbyStops(
  lat = 28.5694,
  lon = 77.2085,
  radius = 10
): Promise<TransitStop[]> {
  const url = new URL(`${API_BASE_URL}/api/v1/transit/stops/nearby`);
  url.searchParams.set('lat', lat.toString());
  url.searchParams.set('lon', lon.toString());
  url.searchParams.set('radius', radius.toString());

  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch nearby stops: ${res.statusText}`);
  }
  const json = await res.json();
  const rawStops = Array.isArray(json.data) ? json.data : [];

  return rawStops.map((s: any) => ({
    id: s.id,
    name: s.name,
    code: s.code || s.id,
    lat: s.lat,
    lon: s.lon,
    routes: ['534', 'TMS+', '729'],
  }));
}

export async function fetchTransitRoutes(search?: string): Promise<TransitRoute[]> {
  const url = new URL(`${API_BASE_URL}/api/v1/transit/routes`);
  if (search) url.searchParams.set('search', search);

  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch transit routes: ${res.statusText}`);
  }
  const json = await res.json();
  const rawRoutes = Array.isArray(json.data) ? json.data : [];

  return rawRoutes.map((r: any) => ({
    id: r.id,
    shortName: r.shortName,
    longName: r.longName,
    origin: r.longName?.split(' to ')[0] || 'Origin',
    destination: r.longName?.split(' to ')[1] || 'Destination',
    agency: r.agency,
    isElectricOnly: !!r.isElectric,
    activeBusCount: r.activeBusesCount ?? 0,
    frequencyMinutes: r.shortName === 'TMS+' ? 4 : 8,
    stops: [],
  }));
}

export async function fetchTransitRouteById(routeId: string): Promise<TransitRoute | null> {
  const res = await fetch(`${API_BASE_URL}/api/v1/transit/${routeId}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const json = await res.json();
  const d = json.data;
  if (!d) return null;

  return {
    id: d.id,
    shortName: d.shortName,
    longName: d.longName,
    origin: d.longName?.split(' to ')[0] || 'Origin',
    destination: d.longName?.split(' to ')[1] || 'Destination',
    agency: d.agency,
    isElectricOnly: !!d.isElectric,
    activeBusCount: d.activeBusesCount ?? 0,
    frequencyMinutes: 6,
    stops: (d.stops || []).map((s: any) => ({
      stopId: s.stopId,
      name: s.stopName,
      sequence: s.sequence,
      lat: s.lat,
      lon: s.lon,
    })),
  };
}

export async function fetchStopArrivals(stopId: string): Promise<ArrivalEstimate[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/transit/stops/${stopId}/arrivals`, { cache: 'no-store' });
  if (!res.ok) {
    return [];
  }
  const json = await res.json();
  const rawArrivals = Array.isArray(json.arrivals) ? json.arrivals : [];

  return rawArrivals.map((a: any) => ({
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
