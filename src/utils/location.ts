import { LocationPoint } from '../types';

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export async function getAddressFromCoordinates(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
      headers: {
        'Accept-Language': 'en'
      }
    });
    const data = await response.json();
    if (data && data.address) {
      const address = data.address;
      const parts = [];
      
      // Try to get a meaningful short address
      if (address.road) parts.push(address.road);
      if (address.neighbourhood || address.suburb) parts.push(address.neighbourhood || address.suburb);
      if (address.city || address.town || address.village) parts.push(address.city || address.town || address.village);
      
      if (parts.length > 0) return parts.join(', ');
      
      // Fallback to display_name if specific parts are missing
      if (data.display_name) {
         return data.display_name.split(',').slice(0, 3).join(',').trim();
      }
    }
  } catch (error) {
    console.error("Geocoding error:", error);
  }
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

export function calculateTotalDistance(path: {lat: number, lng: number}[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    total += calculateDistance(path[i - 1].lat, path[i - 1].lng, path[i].lat, path[i].lng);
  }
  return total;
}

export function calculateWaitingTime(path: LocationPoint[]): number {
  let waitingSeconds = 0;
  for (let i = 1; i < path.length; i++) {
    const p1 = path[i - 1];
    const p2 = path[i];
    const distKm = calculateDistance(p1.lat, p1.lng, p2.lat, p2.lng);
    const timeDiffHours = (p2.timestamp - p1.timestamp) / 1000 / 3600;
    
    if (timeDiffHours > 0) {
      const speedKmH = distKm / timeDiffHours;
      // If speed is less than 10 km/h, consider it waiting/traffic time
      if (speedKmH < 10) {
        waitingSeconds += (p2.timestamp - p1.timestamp) / 1000;
      }
    }
  }
  return waitingSeconds;
}

