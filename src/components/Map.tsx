import { useEffect, memo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { LocationPoint } from '../types';

// Fix Leaflet's default icon path issues with Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface MapProps {
  currentLocation: [number, number] | null;
  path: LocationPoint[];
}

const Map = memo(function Map({ currentLocation, path }: MapProps) {
  const defaultCenter: [number, number] = [18.5204, 73.8567]; // Pune
  const center = currentLocation || defaultCenter;
  
  const positions: [number, number][] = path.map(p => [p.lat, p.lng]);

  return (
    <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {currentLocation && <MapUpdater center={currentLocation} />}
      {currentLocation && <Marker position={currentLocation} />}
      {positions.length > 1 && <Polyline positions={positions} color="#2563eb" weight={5} />}
    </MapContainer>
  );
});

export default Map;
