export type City = 'Pune' | 'Mumbai' | 'Bangalore';

export interface FareRules {
  city: City;
  baseFare: number;
  baseDistanceKm: number;
  perKmRate: number;
  waitingChargePerMin: number;
  freeWaitingTimeMins?: number;
  nightChargeMultiplier: number;
  nightStartTime: number; // 0-23
  nightEndTime: number; // 0-23
}

export interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface Ride {
  id: string;
  city: City;
  startTime: number;
  endTime: number;
  startLocation: string;
  endLocation: string;
  distanceKm: number;
  durationSeconds: number;
  waitingTimeSeconds: number;
  baseFare: number;
  perKmRate: number;
  isNightChargeApplied: boolean;
  totalFare: number;
  path?: LocationPoint[]; // Make optional since we might only have encodedPath
  encodedPath?: string;
  optimalDistanceKm?: number;
}

export type RideState = 'idle' | 'riding' | 'summary';

