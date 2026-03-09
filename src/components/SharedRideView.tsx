import { useState, useEffect } from 'react';
import { MapPin, Navigation, IndianRupee, ArrowLeft } from 'lucide-react';
import polyline from '@mapbox/polyline';
import Map from './Map';
import { LocationPoint } from '../types';

interface SharedRideViewProps {
  encodedPath: string;
  fare: string;
  distance: string;
  city: string;
  onClose: () => void;
}

export default function SharedRideView({ encodedPath, fare, distance, city, onClose }: SharedRideViewProps) {
  const [path, setPath] = useState<LocationPoint[]>([]);

  useEffect(() => {
    try {
      if (encodedPath) {
        const decoded = polyline.decode(encodedPath);
        const locationPoints: LocationPoint[] = decoded.map((coord, index) => ({
          lat: coord[0],
          lng: coord[1],
          timestamp: Date.now() + index, // Dummy timestamp
        }));
        setPath(locationPoints);
      }
    } catch (e) {
      console.error('Failed to decode shared route', e);
    }
  }, [encodedPath]);

  return (
    <div className="flex flex-col h-full bg-gray-50 font-sans text-gray-900 overflow-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm z-20 px-4 py-3 flex items-center sticky top-0 pt-safe">
        <button 
          onClick={onClose}
          className="p-2 -ml-2 mr-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center mr-3 shadow-sm">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">Shared Auto Ride</h1>
      </header>

      {/* Map Area */}
      <div className="flex-1 relative z-0">
        <Map currentLocation={path.length > 0 ? [path[path.length - 1].lat, path[path.length - 1].lng] : null} path={path} />
      </div>

      {/* Bottom Panel */}
      <div className="bg-white rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] z-10 p-6 relative">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full absolute top-3 left-1/2 -translate-x-1/2"></div>
        
        <div className="pt-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Live Ride Status</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 border-dashed pb-3">
              <div className="flex items-center text-gray-500">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="text-sm">City</span>
              </div>
              <span className="font-medium">{city || 'Unknown'}</span>
            </div>

            <div className="flex justify-between items-center border-b border-gray-100 border-dashed pb-3">
              <div className="flex items-center text-gray-500">
                <Navigation className="w-4 h-4 mr-2" />
                <span className="text-sm">Distance</span>
              </div>
              <span className="font-medium">{distance || '0.00'} km</span>
            </div>

            <div className="flex justify-between items-center pt-2 pb-2">
              <span className="text-lg font-bold text-gray-900">Current Fare</span>
              <span className="text-4xl font-black text-emerald-600 tracking-tight">₹{fare || '0'}</span>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-full mt-6 bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-black transition-all active:scale-95"
          >
            Open AutoMeter App
          </button>
        </div>
      </div>
    </div>
  );
}
