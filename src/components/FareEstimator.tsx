import { useState } from 'react';
import { Search, MapPin, IndianRupee, Clock, Navigation, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { searchPlaces, getOptimalRoute } from '../utils/api';
import { calculateFare, FARE_RULES } from '../utils/fare';
import { City } from '../types';

interface FareEstimatorProps {
  city: City;
  currentLat: number | null;
  currentLng: number | null;
  onClose: () => void;
}

export default function FareEstimator({ city, currentLat, currentLng, onClose }: FareEstimatorProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [estimate, setEstimate] = useState<{ distance: number, duration: number, minFare: number, maxFare: number } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !currentLat || !currentLng) return;
    
    setIsSearching(true);
    const places = await searchPlaces(query, currentLat, currentLng);
    setResults(places);
    setIsSearching(false);
  };

  const handleSelectPlace = async (place: any) => {
    if (!currentLat || !currentLng) return;
    
    setIsSearching(true);
    setResults([]);
    
    const destLat = parseFloat(place.lat);
    const destLng = parseFloat(place.lon);
    
    const route = await getOptimalRoute(currentLat, currentLng, destLat, destLng);
    
    if (route) {
      // Calculate estimated fare
      // We assume no waiting time for estimate, but add a 10% buffer for traffic
      const baseEstimate = calculateFare(route.distanceKm, 0, Date.now(), FARE_RULES[city]);
      const trafficEstimate = calculateFare(route.distanceKm, route.durationSeconds * 0.2, Date.now(), FARE_RULES[city]); // Assume 20% of time is waiting in traffic
      
      setEstimate({
        distance: route.distanceKm,
        duration: route.durationSeconds,
        minFare: baseEstimate.total,
        maxFare: trafficEstimate.total
      });
    }
    
    setIsSearching(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute inset-0 z-50 bg-white flex flex-col h-full"
    >
      <div className="p-4 border-b border-gray-100 flex items-center gap-3">
        <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-gray-900">Fare Estimator</h2>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {!estimate ? (
          <>
            <form onSubmit={handleSearch} className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Where to?"
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                autoFocus
              />
              <button 
                type="submit" 
                disabled={isSearching || !query.trim()}
                className="absolute inset-y-1 right-1 px-3 bg-emerald-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
              </button>
            </form>

            <div className="space-y-2">
              {results.map((place, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPlace(place)}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-xl transition-colors flex items-start gap-3 border border-transparent hover:border-gray-100"
                >
                  <div className="mt-0.5 bg-gray-100 p-2 rounded-full text-gray-500">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{place.display_name.split(',')[0]}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{place.display_name}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            
            <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-xs mb-6">Estimated Meter Fare</h3>
            
            <div className="flex items-baseline mb-6">
              <span className="text-3xl text-emerald-500 font-mono mr-2">₹</span>
              <span className="text-6xl font-black tracking-tighter">{estimate.minFare}</span>
              <span className="text-2xl text-gray-400 mx-2">-</span>
              <span className="text-4xl font-bold text-gray-300">{estimate.maxFare}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-4">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1 flex items-center">
                  <Navigation className="w-3 h-3 mr-1" /> Distance
                </p>
                <p className="font-mono text-lg">{estimate.distance.toFixed(1)} km</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1 flex items-center">
                  <Clock className="w-3 h-3 mr-1" /> Time
                </p>
                <p className="font-mono text-lg">{Math.round(estimate.duration / 60)} min</p>
              </div>
            </div>
            
            <button 
              onClick={() => { setEstimate(null); setQuery(''); }}
              className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              Calculate Another
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
