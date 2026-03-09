import { useState, useEffect } from 'react';
import { Navigation, Clock, MapPin, Menu, BarChart3, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLiveQuery } from 'dexie-react-hooks';
import CurrentRide from './components/CurrentRide';
import History from './components/History';
import Drawer from './components/Drawer';
import FareRules from './components/FareRules';
import Terms from './components/Terms';
import Contact from './components/Contact';
import About from './components/About';
import DriverDashboard from './components/DriverDashboard';
import QRSticker from './components/QRSticker';
import SharedRideView from './components/SharedRideView';
import { Ride, City } from './types';
import { db, cleanupOldData } from './db';

type Tab = 'ride' | 'history' | 'fare-rules' | 'terms' | 'contact' | 'about' | 'driver-dashboard' | 'qr-sticker';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('ride');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [city, setCity] = useState<City>('Pune');
  const [userMode, setUserMode] = useState<'passenger' | 'driver'>('passenger');
  const [sharedRideData, setSharedRideData] = useState<{ encodedPath: string, fare: string, distance: string, city: string } | null>(null);

  // Load rides from Dexie
  const rides = useLiveQuery(() => db.rides.orderBy('startTime').reverse().toArray(), []) || [];

  // Load settings and run cleanup on mount
  useEffect(() => {
    const init = async () => {
      try {
        // Check for shared ride params
        const urlParams = new URLSearchParams(window.location.search);
        const sharedRoute = urlParams.get('shared_route');
        if (sharedRoute) {
          setSharedRideData({
            encodedPath: sharedRoute,
            fare: urlParams.get('fare') || '0',
            distance: urlParams.get('dist') || '0',
            city: urlParams.get('city') || 'Pune',
          });
        }

        const settings = await db.settings.get('user_settings');
        if (settings && ['Pune', 'Mumbai', 'Bangalore'].includes(settings.selectedCity)) {
          setCity(settings.selectedCity);
        }
        const modeSetting = await db.settings.get('user_mode');
        if (modeSetting && (modeSetting.value === 'passenger' || modeSetting.value === 'driver')) {
          setUserMode(modeSetting.value);
        }
        await cleanupOldData();
      } catch (e) {
        console.error('Failed to initialize DB', e);
      }
    };
    init();
  }, []);

  const handleCloseSharedView = () => {
    setSharedRideData(null);
    // Remove query params from URL without reloading
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.pushState({path:newUrl},'',newUrl);
  };

  if (sharedRideData) {
    return (
      <SharedRideView 
        encodedPath={sharedRideData.encodedPath} 
        fare={sharedRideData.fare} 
        distance={sharedRideData.distance} 
        city={sharedRideData.city}
        onClose={handleCloseSharedView} 
      />
    );
  }

  const handleRideComplete = async (ride: Ride) => {
    try {
      await db.rides.put(ride);
    } catch (e) {
      console.error('Failed to save ride', e);
    }
  };

  const handleDeleteRides = async (ids: string[]) => {
    try {
      await db.rides.bulkDelete(ids);
      // Also delete associated route points
      await db.routePoints.where('rideId').anyOf(ids).delete();
    } catch (e) {
      console.error('Failed to delete rides', e);
    }
  };

  const handleCityChange = async (newCity: City) => {
    setCity(newCity);
    try {
      await db.settings.put({
        id: 'user_settings',
        selectedCity: newCity,
        gpsAccuracyPreference: 'high'
      });
    } catch (e) {
      console.error('Failed to save city', e);
    }
  };

  const handleModeChange = async (mode: 'passenger' | 'driver') => {
    setUserMode(mode);
    try {
      await db.settings.put({
        id: 'user_mode',
        value: mode
      });
      // Reset to default tab when switching modes
      setActiveTab('ride');
    } catch (e) {
      console.error('Failed to save user mode', e);
    }
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'ride':
        return <CurrentRide city={city} onRideComplete={handleRideComplete} onOpenFareRules={() => setActiveTab('fare-rules')} userMode={userMode} />;
      case 'history':
        return <History rides={rides} onDeleteRides={handleDeleteRides} />;
      case 'fare-rules':
        return <FareRules city={city} onCityChange={handleCityChange} />;
      case 'terms':
        return <Terms />;
      case 'contact':
        return <Contact />;
      case 'about':
        return <About />;
      case 'driver-dashboard':
        return <DriverDashboard rides={rides} />;
      case 'qr-sticker':
        return <QRSticker />;
      default:
        return <CurrentRide city={city} onRideComplete={handleRideComplete} onOpenFareRules={() => setActiveTab('fare-rules')} userMode={userMode} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 font-sans text-gray-900 overflow-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm z-20 px-4 py-3 flex items-center justify-between sticky top-0 pt-safe">
        <div className="flex items-center">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 -ml-2 mr-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center mr-3 shadow-sm">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">AutoMeter</h1>
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
            className="flex items-center bg-gray-100/80 border border-gray-200 text-sm font-semibold rounded-full pl-4 pr-3 py-1.5 focus:ring-2 focus:ring-emerald-500 outline-none transition-all active:scale-95"
          >
            {city}
            <svg className={`ml-2 fill-current h-4 w-4 transition-transform duration-200 ${isCityDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </button>
          
          <AnimatePresence>
            {isCityDropdownOpen && (
              <>
                <div 
                  className="absolute inset-0 z-30" 
                  onClick={() => setIsCityDropdownOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-lg border border-gray-100 z-40 overflow-hidden"
                >
                  {['Pune', 'Mumbai', 'Bangalore'].map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        handleCityChange(c as City);
                        setIsCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                        city === c ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation (Only show for core tabs) */}
      {(activeTab === 'ride' || activeTab === 'history' || activeTab === 'driver-dashboard' || activeTab === 'qr-sticker') && (
        <nav className="bg-white/90 backdrop-blur-lg border-t border-gray-200/50 flex justify-around items-center pb-safe pt-2 px-2 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <button
            onClick={() => setActiveTab('ride')}
            className={`flex flex-col items-center p-2 w-24 transition-all active:scale-90 ${
              activeTab === 'ride' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <motion.div whileTap={{ scale: 0.8 }}>
              <Navigation className={`w-6 h-6 mb-1 transition-all ${activeTab === 'ride' ? 'fill-current scale-110' : ''}`} />
            </motion.div>
            <span className="text-[10px] font-bold uppercase tracking-wider">{userMode === 'driver' ? 'Meter' : 'Ride'}</span>
          </button>
          
          {userMode === 'passenger' ? (
            <button
              onClick={() => setActiveTab('history')}
              className={`flex flex-col items-center p-2 w-24 transition-all active:scale-90 ${
                activeTab === 'history' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <motion.div whileTap={{ scale: 0.8 }}>
                <Clock className={`w-6 h-6 mb-1 transition-all ${activeTab === 'history' ? 'fill-current scale-110' : ''}`} />
              </motion.div>
              <span className="text-[10px] font-bold uppercase tracking-wider">History</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('driver-dashboard')}
                className={`flex flex-col items-center p-2 w-24 transition-all active:scale-90 ${
                  activeTab === 'driver-dashboard' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <motion.div whileTap={{ scale: 0.8 }}>
                  <BarChart3 className={`w-6 h-6 mb-1 transition-all ${activeTab === 'driver-dashboard' ? 'fill-current scale-110' : ''}`} />
                </motion.div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Earnings</span>
              </button>
              <button
                onClick={() => setActiveTab('qr-sticker')}
                className={`flex flex-col items-center p-2 w-24 transition-all active:scale-90 ${
                  activeTab === 'qr-sticker' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <motion.div whileTap={{ scale: 0.8 }}>
                  <QrCode className={`w-6 h-6 mb-1 transition-all ${activeTab === 'qr-sticker' ? 'fill-current scale-110' : ''}`} />
                </motion.div>
                <span className="text-[10px] font-bold uppercase tracking-wider">QR Code</span>
              </button>
            </>
          )}
        </nav>
      )}

      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        activeTab={activeTab} 
        onNavigate={(tab) => setActiveTab(tab as Tab)} 
        city={city}
        onCityChange={handleCityChange}
        userMode={userMode}
        onModeChange={handleModeChange}
      />
    </div>
  );
}
