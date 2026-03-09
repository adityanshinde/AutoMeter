export async function searchPlaces(query: string, lat: number, lng: number) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&lat=${lat}&lon=${lng}`);
    return await res.json();
  } catch (e) {
    console.error("Nominatim search error", e);
    return [];
  }
}

export async function getOptimalRoute(startLat: number, startLng: number, endLat: number, endLng: number) {
  try {
    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=false`);
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      return {
        distanceKm: data.routes[0].distance / 1000,
        durationSeconds: data.routes[0].duration
      };
    }
  } catch (e) {
    console.error("OSRM error", e);
  }
  return null;
}
