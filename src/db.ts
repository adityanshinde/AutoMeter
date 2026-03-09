import Dexie, { Table } from 'dexie';
import { City, Ride } from './types';

export interface RoutePointRecord {
  id?: number;
  rideId: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  speed?: number;
  accuracy?: number;
}

export interface SettingsRecord {
  id: string;
  selectedCity: City;
  gpsAccuracyPreference: string;
}

export class AutoMeterDB extends Dexie {
  rides!: Table<Ride>;
  routePoints!: Table<RoutePointRecord>;
  settings!: Table<SettingsRecord>;

  constructor() {
    super('AutoMeterDB');
    this.version(1).stores({
      rides: 'id, startTime, city',
      routePoints: '++id, rideId, timestamp',
      settings: 'id'
    });
  }
}

export const db = new AutoMeterDB();

// Cleanup utility
export async function cleanupOldData() {
  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  await db.routePoints.where('timestamp').below(ninetyDaysAgo).delete();
}
