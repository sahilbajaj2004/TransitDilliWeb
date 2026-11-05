export type Agency = 'DTC' | 'DIMTS' | 'EV';

export interface Bus {
  id: string;
  registration: string;
  agency: Agency;
  agencyName: string;
  routeId: string;
  routeShortName: string;
  direction: 'UP' | 'DOWN';
  destination: string;
  lat: number;
  lon: number;
  speed: number;
  bearing: number;
  isElectric: boolean;
  isAc: boolean;
  occupancy: 'LOW' | 'MEDIUM' | 'HIGH';
  lastUpdated: string;
  nextStopName?: string;
  nextStopEtaMinutes?: number;
  color: string;
}

export interface TransitStop {
  id: string;
  name: string;
  code: string;
  lat: number;
  lon: number;
  routes: string[];
}

export interface ArrivalEstimate {
  vehicleId: string;
  registration: string;
  routeId: string;
  routeShortName: string;
  destination: string;
  agency: Agency;
  agencyColor: string;
  isElectric: boolean;
  isAc: boolean;
  etaMinutes: number;
  etaSeconds: number;
  distanceKm: number;
  speedKmH: number;
  crowding: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface RouteStop {
  stopId: string;
  name: string;
  sequence: number;
  lat: number;
  lon: number;
}

export interface TransitRoute {
  id: string;
  shortName: string;
  longName: string;
  origin: string;
  destination: string;
  agency: Agency;
  isElectricOnly: boolean;
  activeBusCount: number;
  frequencyMinutes: number;
  stops: RouteStop[];
}

export interface FleetStats {
  totalActive: number;
  dtcCount: number;
  dimtsCount: number;
  electricCount: number;
  avgSpeedKmH: number;
  lastIngestTime: string;
}
