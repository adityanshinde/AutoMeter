import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { Play, Square, MapPin, Clock, Navigation, IndianRupee, WifiOff, Moon, Crosshair, CheckCircle2, Loader2, Share2, Calculator, ShieldCheck, AlertTriangle, Signal, SignalHigh, SignalMedium, SignalLow, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import polyline from '@mapbox/polyline';
import Map from './Map';
import FareEstimator from './FareEstimator';
import FareChart from './FareChart';
import { useGeolocation } from '../hooks/useGeolocation';
import { LocationPoint, Ride, RideState, City } from '../types';
import { calculateTotalDistance, calculateWaitingTime, getAddressFromCoordinates } from '../utils/location';
import { calculateFare, FARE_RULES } from '../utils/fare';
import { getOptimalRoute } from '../utils/api';
import { db } from '../db';

interface CurrentRideProps {
  city: City;
  onRideComplete: (ride: Ride) => void;
  onOpenFareRules?: () => void;
  userMode: 'passenger' | 'driver';
}

export default function CurrentRide({ city, onRideComplete, onOpenFareRules, userMode }: CurrentRideProps) {
  const { position, error, isTracking, startTracking, stopTracking, getCurrentLocation } = useGeolocation();
  const [rideState, setRideState] = useState<RideState>('idle');
  const [isEndingRide, setIsEndingRide] = useState(false);
  
  const [path, setPath] = useState<LocationPoint[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [distanceKm, setDistanceKm] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [waitingTimeSeconds, setWaitingTimeSeconds] = useState(0);
  const [currentFare, setCurrentFare] = useState(FARE_RULES[city].baseFare);
  const [isNight, setIsNight] = useState(false);
  const [waitingCharge, setWaitingCharge] = useState(0);
  
  const [completedRide, setCompletedRide] = useState<Ride | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  const [showEstimator, setShowEstimator] = useState(false);
  const [showFareChart, setShowFareChart] = useState(false);

  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const lastAnnouncedFare = useRef(FARE_RULES[city].baseFare);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Restore active ride from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('autometer_active_ride');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.state === 'riding') {
          setRideState('riding');
          setStartTime(parsed.startTime);
          setPath(parsed.path);
          startTracking();
        }
      } catch (e) {
        console.error('Failed to parse active ride', e);
      }
    }
  }, [startTracking]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (rideState === 'riding' && startTime) {
      interval = setInterval(() => {
        setDurationSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [rideState, startTime]);

  // Update path from geolocation
  useEffect(() => {
    if (rideState === 'riding' && position) {
      const newPoint: LocationPoint = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        timestamp: position.timestamp,
      };
      
      setPath(prev => {
        // Prevent duplicate points if location hasn't changed much
        if (prev.length > 0) {
          const last = prev[prev.length - 1];
          // Distance filtering: only record if movement is significant (> ~10 meters)
          // Rough approximation: 0.0001 deg is ~11m
          const latDiff = Math.abs(last.lat - newPoint.lat);
          const lngDiff = Math.abs(last.lng - newPoint.lng);
          if (latDiff < 0.0001 && lngDiff < 0.0001) {
            return prev;
          }
        }
        return [...prev, newPoint];
      });
    }
  }, [position, rideState]);

  // Calculate stats whenever path, city, or startTime changes
  useEffect(() => {
    if (rideState === 'riding' && startTime) {
      const newDist = calculateTotalDistance(path);
      const newWait = calculateWaitingTime(path);
      setDistanceKm(newDist);
      setWaitingTimeSeconds(newWait);
      
      const fareInfo = calculateFare(newDist, newWait, startTime, FARE_RULES[city]);
      
      setCurrentFare(prevFare => {
        if (fareInfo.total > prevFare) {
          // Vibrate when fare increases (mechanical meter click feel)
          if (navigator.vibrate) navigator.vibrate(20);

          // Voice announcement
          if (voiceEnabled && fareInfo.total > lastAnnouncedFare.current) {
            announceFare(fareInfo.total);
            lastAnnouncedFare.current = fareInfo.total;
          }
        }
        return fareInfo.total;
      });
      
      setIsNight(fareInfo.isNight);
      setWaitingCharge(fareInfo.waitingCharge);

      // Persist active ride to localStorage
      localStorage.setItem('autometer_active_ride', JSON.stringify({
        state: 'riding',
        startTime,
        path
      }));
    } else if (rideState === 'idle') {
      localStorage.removeItem('autometer_active_ride');
    }
  }, [path, city, startTime, rideState, voiceEnabled]);

  const announceFare = (fare: number) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`Fare updated to ${fare} rupees`);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleShareLiveRide = async () => {
    if (path.length === 0) {
      alert("Waiting for GPS location to start sharing.");
      return;
    }
    
    const coords = path.map(p => [p.lat, p.lng] as [number, number]);
    const encodedPath = polyline.encode(coords);
    
    const url = new URL(window.location.protocol + "//" + window.location.host + window.location.pathname);
    url.searchParams.set('shared_route', encodedPath);
    url.searchParams.set('fare', currentFare.toString());
    url.searchParams.set('dist', distanceKm.toFixed(2));
    url.searchParams.set('city', city);
    
    const text = `🚕 Track my auto ride!\n\n📍 Distance: ${distanceKm.toFixed(2)} km\n💰 Current Fare: ₹${currentFare}\n\nTrack my route here: ${url.toString()}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Track my Auto Ride',
          text: text,
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Live tracking link copied to clipboard!');
    }
  };

  const handleStartRide = () => {
    // Vibrate if supported
    if (navigator.vibrate) navigator.vibrate(50);
    
    setPath([]);
    setDistanceKm(0);
    setDurationSeconds(0);
    setWaitingTimeSeconds(0);
    setCurrentFare(FARE_RULES[city].baseFare);
    lastAnnouncedFare.current = FARE_RULES[city].baseFare;
    setStartTime(Date.now());
    setRideState('riding');
    startTracking();

    if (voiceEnabled) {
      announceFare(FARE_RULES[city].baseFare);
    }
  };

  const handleEndRide = async () => {
    // Vibrate if supported
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);

    setIsEndingRide(true);
    stopTracking();
    localStorage.removeItem('autometer_active_ride');
    
    const endTime = Date.now();
    const rideId = uuidv4();
    
    let encodedPath = '';
    if (path.length > 0) {
      // Encode path to save storage
      const coords = path.map(p => [p.lat, p.lng] as [number, number]);
      encodedPath = polyline.encode(coords);
    }

    const initialRide: Ride = {
      id: rideId,
      city,
      startTime: startTime || Date.now(),
      endTime,
      startLocation: path.length > 0 ? 'Fetching location...' : 'Unknown Start',
      endLocation: path.length > 0 ? 'Fetching location...' : 'Unknown End',
      distanceKm,
      optimalDistanceKm: undefined,
      durationSeconds,
      waitingTimeSeconds,
      baseFare: FARE_RULES[city].baseFare,
      perKmRate: FARE_RULES[city].perKmRate,
      isNightChargeApplied: isNight,
      totalFare: currentFare,
      encodedPath,
    };
    
    // Save route points to Dexie
    if (path.length > 0) {
      const routePoints = path.map(p => ({
        rideId,
        latitude: p.lat,
        longitude: p.lng,
        timestamp: p.timestamp
      }));
      db.routePoints.bulkAdd(routePoints).catch(e => console.error('Failed to save route points', e));
    }

    setCompletedRide(initialRide);
    setRideState('summary');
    setIsEndingRide(false);
    onRideComplete(initialRide);

    if (voiceEnabled) {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(`Ride complete. Total fare is ${currentFare} rupees`);
        window.speechSynthesis.speak(utterance);
      }
    }

    // Fetch locations and optimal route in the background
    if (path.length > 0) {
      const first = path[0];
      const last = path[path.length - 1];
      
      try {
        const [startLoc, endLoc, optimal] = await Promise.all([
          getAddressFromCoordinates(first.lat, first.lng).catch(() => 'Unknown Start'),
          getAddressFromCoordinates(last.lat, last.lng).catch(() => 'Unknown End'),
          getOptimalRoute(first.lat, first.lng, last.lat, last.lng).catch(() => null)
        ]);

        const updatedRide: Ride = {
          ...initialRide,
          startLocation: startLoc,
          endLocation: endLoc,
          optimalDistanceKm: optimal ? optimal.distanceKm : undefined,
        };

        // Update local state if still mounted (React 18 handles unmounted state updates gracefully, but we check id just in case)
        setCompletedRide(prev => prev?.id === rideId ? updatedRide : prev);
        
        // Update in database
        await db.rides.put(updatedRide);
      } catch (error) {
        console.error('Failed to fetch ride details in background', error);
      }
    }
  };

  const handleNewRide = () => {
    setRideState('idle');
    setCompletedRide(null);
    setPath([]);
    setDistanceKm(0);
    setDurationSeconds(0);
    setWaitingTimeSeconds(0);
    setCurrentFare(FARE_RULES[city].baseFare);
  };

  const handleShare = async () => {
    if (!completedRide) return;
    
    const text = `🚕 Auto Ride Summary\n\n📍 Start: ${completedRide.startLocation}\n🏁 Dest: ${completedRide.endLocation}\n📏 Distance: ${completedRide.distanceKm.toFixed(2)} km\n⏱️ Time: ${formatDuration(completedRide.durationSeconds)}\n💰 Fare: ₹${completedRide.totalFare}\n\nVerified by AutoMeter App`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Auto Ride Fare',
          text: text,
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Ride summary copied to clipboard!');
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const currentLocation: [number, number] | null = position 
    ? [position.coords.latitude, position.coords.longitude] 
    : null;

  const getGpsAccuracyIndicator = () => {
    if (!position) return null;
    const accuracy = position.coords.accuracy;
    
    if (accuracy <= 15) {
      return (
        <div className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-[10px] font-bold border border-emerald-100 shadow-sm">
          <SignalHigh className="w-3 h-3 mr-1" /> GPS: Good
        </div>
      );
    } else if (accuracy <= 50) {
      return (
        <div className="flex items-center text-amber-600 bg-amber-50 px-2 py-1 rounded-full text-[10px] font-bold border border-amber-100 shadow-sm">
          <SignalMedium className="w-3 h-3 mr-1" /> GPS: Fair
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded-full text-[10px] font-bold border border-red-100 shadow-sm">
          <SignalLow className="w-3 h-3 mr-1" /> GPS: Weak
        </div>
      );
    }
  };

  if (rideState === 'summary' && completedRide) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col h-full bg-gray-50 p-4 overflow-y-auto"
      >
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-6 border border-gray-100 relative overflow-hidden">
          {/* Receipt jagged edge effect at top */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIxMCI+PHBvbHlnb24gcG9pbnRzPSIwLDEwIDEwLDAgMjAsMTAiIGZpbGw9IiNmOWZhZmIiLz48L3N2Zz4=')] rotate-180"></div>
          
          <div className="flex flex-col items-center justify-center mb-8 mt-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Ride Complete</h2>
            <p className="text-gray-500 text-sm mt-1">{format(completedRide.endTime, 'MMM d, yyyy • h:mm a')}</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 border-dashed pb-3">
              <div className="flex items-center text-gray-500 min-w-24">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="text-sm">Start</span>
              </div>
              <div className="flex flex-col items-end max-w-[65%]">
                <span className="font-medium text-sm text-right truncate w-full">{completedRide.startLocation}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center border-b border-gray-100 border-dashed pb-3">
              <div className="flex items-center text-gray-500 min-w-24">
                <MapPin className="w-4 h-4 mr-2 text-red-500" />
                <span className="text-sm">Destination</span>
              </div>
              <div className="flex flex-col items-end max-w-[65%]">
                <span className="font-medium text-sm text-right truncate w-full">{completedRide.endLocation}</span>
              </div>
            </div>

            <div className="flex justify-between items-center border-b border-gray-100 border-dashed pb-3">
              <div className="flex items-center text-gray-500">
                <Navigation className="w-4 h-4 mr-2" />
                <span className="text-sm">Distance</span>
              </div>
              <span className="font-medium">{completedRide.distanceKm.toFixed(2)} km</span>
            </div>

            <div className="flex justify-between items-center border-b border-gray-100 border-dashed pb-3">
              <div className="flex items-center text-gray-500">
                <Clock className="w-4 h-4 mr-2" />
                <span className="text-sm">Ride Time</span>
              </div>
              <span className="font-medium">{formatDuration(completedRide.durationSeconds)}</span>
            </div>

            <div className="flex justify-between items-center border-b border-gray-100 border-dashed pb-3">
              <div className="flex items-center text-gray-500">
                <IndianRupee className="w-4 h-4 mr-2" />
                <span className="text-sm">Base Fare ({FARE_RULES[completedRide.city].baseDistanceKm}km)</span>
              </div>
              <span className="font-medium">₹{completedRide.baseFare}</span>
            </div>

            <div className="flex justify-between items-center border-b border-gray-100 border-dashed pb-3">
              <div className="flex items-center text-gray-500">
                <IndianRupee className="w-4 h-4 mr-2 opacity-0" />
                <span className="text-sm">Per KM Rate</span>
              </div>
              <span className="font-medium">₹{completedRide.perKmRate}/km</span>
            </div>

            {completedRide.waitingTimeSeconds > 0 && (
              <div className="flex justify-between items-center border-b border-gray-100 border-dashed pb-3">
                <div className="flex items-center text-gray-500">
                  <Clock className="w-4 h-4 mr-2 opacity-0" />
                  <span className="text-sm">Waiting Charge</span>
                </div>
                <span className="font-medium">
                  {Math.floor(completedRide.waitingTimeSeconds / 60)} min
                </span>
              </div>
            )}

            {completedRide.isNightChargeApplied && (
              <div className="flex justify-between items-center border-b border-gray-100 border-dashed pb-3">
                <div className="flex items-center text-indigo-500">
                  <Moon className="w-4 h-4 mr-2" />
                  <span className="text-sm">Night Charge</span>
                </div>
                <span className="font-medium text-indigo-600">
                  +{(FARE_RULES[completedRide.city].nightChargeMultiplier - 1) * 100}%
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 pb-2">
              <span className="text-lg font-bold text-gray-900">Your Fare</span>
              <span className="text-4xl font-black text-emerald-600 tracking-tight">₹{completedRide.totalFare}</span>
            </div>

            <div className="bg-emerald-50 rounded-xl p-3 flex items-center justify-between border border-emerald-100 mt-2">
              <div className="flex items-center text-emerald-800">
                <ShieldCheck className="w-5 h-5 mr-2 text-emerald-600" />
                <span className="font-semibold text-sm">Official {city} Fare</span>
              </div>
              <span className="font-bold text-emerald-700">₹{completedRide.totalFare}</span>
            </div>
            <p className="text-center text-xs text-emerald-600 font-medium mt-1 mb-4">Status: Correct Fare ✓</p>

            {completedRide.optimalDistanceKm && (
              <div className="mt-4 pt-4 border-t border-gray-100 border-dashed">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">Route Efficiency</span>
                  <span className={`text-sm font-bold ${
                    (completedRide.optimalDistanceKm / completedRide.distanceKm) > 0.85 ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {Math.round((completedRide.optimalDistanceKm / completedRide.distanceKm) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Actual: {completedRide.distanceKm.toFixed(2)} km</span>
                  <span>Optimal: {completedRide.optimalDistanceKm.toFixed(2)} km</span>
                </div>
                {(completedRide.optimalDistanceKm / completedRide.distanceKm) <= 0.85 && (
                  <div className="mt-2 bg-amber-50 text-amber-800 text-xs p-2 rounded-lg flex items-start border border-amber-200">
                    <AlertTriangle className="w-4 h-4 mr-1.5 flex-shrink-0 mt-0.5" />
                    <span>Possible detour detected. The route taken was significantly longer than the optimal path.</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Receipt jagged edge effect at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIxMCI+PHBvbHlnb24gcG9pbnRzPSIwLDEwIDEwLDAgMjAsMTAiIGZpbGw9IiNmOWZhZmIiLz48L3N2Zz4=')]"></div>
        </div>

        <div className="flex gap-3 mb-4">
          <button
            onClick={handleShare}
            className="flex-1 bg-emerald-50 text-emerald-700 py-4 rounded-2xl font-bold text-lg shadow-sm hover:bg-emerald-100 transition-all active:scale-95 flex items-center justify-center border border-emerald-200"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share Proof
          </button>
          <button
            onClick={handleNewRide}
            className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-black transition-all active:scale-95"
          >
            New Ride
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-full relative bg-gray-100">
      {/* Map Area */}
      <div className="flex-1 relative z-0">
        <Map currentLocation={currentLocation} path={path} />
        
        {/* Sync Location Button */}
        {rideState === 'idle' && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={getCurrentLocation}
            className="absolute bottom-6 right-4 bg-white p-3.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] z-[1000] hover:bg-gray-50 transition-colors border border-gray-100"
            title="Sync Current Location"
          >
            <Crosshair className="w-6 h-6 text-gray-800" />
          </motion.button>
        )}

        {/* GPS Accuracy Indicator */}
        <div className="absolute top-4 right-4 z-[1000]">
          {getGpsAccuracyIndicator()}
        </div>

        {/* Offline overlay */}
        <AnimatePresence>
          {isOffline && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-full z-[1000] flex items-center shadow-md text-sm font-semibold backdrop-blur-md bg-yellow-100/90"
            >
              <WifiOff className="w-4 h-4 mr-2" />
              Offline Mode
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error overlay */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-16 left-4 right-4 bg-red-100/90 backdrop-blur-md border border-red-300 text-red-800 px-4 py-3 rounded-2xl z-[1000] shadow-lg"
            >
              <span className="block sm:inline text-sm font-medium">{error.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Panel */}
      <motion.div 
        layout
        className="bg-white rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] z-10 p-6 relative"
      >
        {/* Drag handle indicator */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full absolute top-3 left-1/2 -translate-x-1/2"></div>
        
        <AnimatePresence mode="wait">
          {rideState === 'idle' ? (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center pt-4"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {userMode === 'driver' ? 'Ready for trip?' : 'Ready to go?'}
              </h2>
              <p className="text-gray-500 mb-6 text-sm">
                {userMode === 'driver' 
                  ? `Start digital meter for transparent fare in ${city}.`
                  : `Start tracking to calculate exact fare in ${city}.`
                }
              </p>
              
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setShowEstimator(true)}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold text-sm transition-colors flex flex-col items-center justify-center border border-gray-200"
                >
                  <Calculator className="w-5 h-5 mb-1 text-emerald-600" />
                  Fare Estimate
                </button>
                <button
                  onClick={() => setShowFareChart(true)}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold text-sm transition-colors flex flex-col items-center justify-center border border-gray-200"
                >
                  <ShieldCheck className="w-5 h-5 mb-1 text-blue-600" />
                  Official Fare
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartRide}
                className="w-full relative overflow-hidden group bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg shadow-[0_8px_20px_rgba(16,185,129,0.3)] transition-all"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                <div className="flex items-center justify-center relative z-10">
                  <Play className="w-6 h-6 mr-2 fill-current" />
                  {userMode === 'driver' ? 'Start Digital Meter' : 'Start Ride'}
                </div>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              key="riding"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="pt-4"
            >
              {/* Digital Meter UI */}
              <div className="bg-gray-900 rounded-3xl p-6 mb-6 shadow-inner border-4 border-gray-800 relative overflow-hidden">
                {/* Glare effect */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/5 rounded-t-3xl pointer-events-none"></div>
                
                {/* Voice Toggle (Driver Mode) */}
                {userMode === 'driver' && (
                  <button 
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className="absolute top-4 right-4 z-10 p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
                  >
                    {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                )}

                {/* Share Live Ride Button */}
                <button 
                  onClick={handleShareLiveRide}
                  className={`absolute top-4 ${userMode === 'driver' ? 'right-14' : 'right-4'} z-10 p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors`}
                  title="Share Live Route"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Distance</p>
                    <p className="text-3xl font-mono font-bold text-emerald-400 tracking-tight">{distanceKm.toFixed(2)}<span className="text-sm text-emerald-600 ml-1">km</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Time</p>
                    <p className="text-3xl font-mono font-bold text-emerald-400 tracking-tight">{formatDuration(durationSeconds)}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-800 pt-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Total Fare</p>
                  <div className="flex items-baseline">
                    <span className="text-2xl text-emerald-500 font-mono mr-2">₹</span>
                    <p className="text-6xl font-mono font-black text-emerald-400 tracking-tighter">{currentFare}</p>
                  </div>
                </div>
              </div>
              
              <AnimatePresence>
                {(isNight || waitingCharge > 0) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex justify-center space-x-3 mb-6 text-xs font-semibold"
                  >
                    {isNight && (
                      <span className="flex items-center text-indigo-700 bg-indigo-100 px-3 py-1.5 rounded-full">
                        <Moon className="w-3.5 h-3.5 mr-1.5" /> Night Fare
                      </span>
                    )}
                    {waitingCharge > 0 && (
                      <span className="flex items-center text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full">
                        <Clock className="w-3.5 h-3.5 mr-1.5" /> Wait: ₹{waitingCharge}
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {onOpenFareRules && (
                <div className="text-center mb-4">
                  <button 
                    onClick={onOpenFareRules}
                    className="text-emerald-600 text-sm font-semibold hover:text-emerald-700 transition-colors underline decoration-emerald-600/30 underline-offset-4"
                  >
                    View Official Fare Rules
                  </button>
                </div>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEndRide}
                disabled={isEndingRide}
                className="w-full flex items-center justify-center bg-red-600 text-white py-4 rounded-2xl font-bold text-lg shadow-[0_8px_20px_rgba(220,38,38,0.3)] transition-all disabled:opacity-70 disabled:scale-100"
              >
                {isEndingRide ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    Calculating Fare...
                  </>
                ) : (
                  <>
                    <Square className="w-6 h-6 mr-2 fill-current" />
                    End Ride
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showEstimator && (
          <FareEstimator 
            city={city} 
            currentLat={currentLocation?.[0] || null} 
            currentLng={currentLocation?.[1] || null} 
            onClose={() => setShowEstimator(false)} 
          />
        )}
        {showFareChart && (
          <FareChart 
            city={city} 
            onClose={() => setShowFareChart(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
