import { City, FareRules } from '../types';

export const FARE_RULES: Record<City, FareRules> = {
  Pune: {
    city: 'Pune',
    baseFare: 23,
    baseDistanceKm: 1.5,
    perKmRate: 15,
    waitingChargePerMin: 1,
    nightChargeMultiplier: 1.25,
    nightStartTime: 0,
    nightEndTime: 5,
  },
  Mumbai: {
    city: 'Mumbai',
    baseFare: 23,
    baseDistanceKm: 1.5,
    perKmRate: 15.33,
    waitingChargePerMin: 1.5,
    nightChargeMultiplier: 1.25,
    nightStartTime: 0,
    nightEndTime: 5,
  },
  Bangalore: {
    city: 'Bangalore',
    baseFare: 30,
    baseDistanceKm: 2.0,
    perKmRate: 15,
    waitingChargePerMin: 1,
    freeWaitingTimeMins: 5,
    nightChargeMultiplier: 1.5,
    nightStartTime: 22,
    nightEndTime: 5,
  }
};

export function isNightTime(timestamp: number, rules: FareRules): boolean {
  const date = new Date(timestamp);
  const hour = date.getHours();
  if (rules.nightStartTime > rules.nightEndTime) {
    return hour >= rules.nightStartTime || hour < rules.nightEndTime;
  }
  return hour >= rules.nightStartTime && hour < rules.nightEndTime;
}

export function calculateFare(
  distanceKm: number,
  waitingTimeSeconds: number,
  startTime: number,
  rules: FareRules
): { total: number, isNight: boolean, waitingCharge: number } {
  let fare = rules.baseFare;
  
  if (distanceKm > rules.baseDistanceKm) {
    const extraDistance = distanceKm - rules.baseDistanceKm;
    fare += extraDistance * rules.perKmRate;
  }

  let billableWaitingMins = Math.floor(waitingTimeSeconds / 60);
  if (rules.freeWaitingTimeMins) {
    billableWaitingMins = Math.max(0, billableWaitingMins - rules.freeWaitingTimeMins);
  }
  const waitingCharge = billableWaitingMins * rules.waitingChargePerMin;
  fare += waitingCharge;

  const isNight = isNightTime(startTime, rules);
  if (isNight) {
    fare *= rules.nightChargeMultiplier;
  }

  return {
    total: Math.round(fare),
    isNight,
    waitingCharge
  };
}

