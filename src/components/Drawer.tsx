import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Navigation, Clock, IndianRupee, FileText, Mail, Info, MapPin, User, Car } from 'lucide-react';
import { City } from '../types';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onNavigate: (tab: string) => void;
  city: City;
  onCityChange: (city: City) => void;
  userMode: 'passenger' | 'driver';
  onModeChange: (mode: 'passenger' | 'driver') => void;
}

export default function Drawer({ isOpen, onClose, activeTab, onNavigate, city, onCityChange, userMode, onModeChange }: DrawerProps) {
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  
  const menuItems = [
    { id: 'ride', label: 'Ride', icon: Navigation },
    { id: 'history', label: 'History', icon: Clock },
    { divider: true },
    { id: 'fare-rules', label: 'Fare Rules & RTO Info', icon: IndianRupee },
    { id: 'terms', label: 'Terms & Conditions', icon: FileText },
    { id: 'contact', label: 'Contact Us', icon: Mail },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 z-40 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 left-0 bottom-0 w-4/5 max-w-sm bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="bg-emerald-600 p-6 text-white safe-pt">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h2 className="text-2xl font-black tracking-tight mb-1">AutoMeter</h2>
              <p className="text-emerald-100 text-sm font-medium">Fair Auto Fare Calculator</p>
              
              <div className="mt-6 relative">
                <button 
                  onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                  className="w-full flex justify-between items-center bg-white/10 border border-white/20 text-white text-sm font-semibold rounded-xl pl-4 pr-4 py-3 focus:ring-2 focus:ring-white/50 outline-none transition-all"
                >
                  {city}
                  <svg className={`fill-current h-4 w-4 transition-transform duration-200 ${isCityDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
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
                        className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-40 overflow-hidden"
                      >
                        {['Pune', 'Mumbai', 'Bangalore'].map((c) => (
                          <button
                            key={c}
                            onClick={() => {
                              onCityChange(c as City);
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
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto py-4">
              {/* Mode Toggle */}
              <div className="px-6 mb-4">
                <div className="bg-gray-100 p-1 rounded-xl flex">
                  <button
                    onClick={() => onModeChange('passenger')}
                    className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      userMode === 'passenger' 
                        ? 'bg-white text-emerald-700 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Passenger
                  </button>
                  <button
                    onClick={() => onModeChange('driver')}
                    className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      userMode === 'driver' 
                        ? 'bg-white text-emerald-700 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Car className="w-4 h-4 mr-2" />
                    Driver
                  </button>
                </div>
              </div>

              {/* Menu Items */}
              {menuItems.map((item, index) => {
                if (item.divider) {
                  return <div key={`divider-${index}`} className="h-px bg-gray-100 my-4 mx-6" />;
                }

                const Icon = item.icon!;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id!);
                      onClose();
                    }}
                    className={`w-full flex items-center px-6 py-4 transition-colors ${
                      isActive 
                        ? 'bg-emerald-50 text-emerald-700 border-r-4 border-emerald-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-4 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                    <span className={`font-semibold ${isActive ? 'text-emerald-700' : 'text-gray-700'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
            
            <div className="p-6 text-center border-t border-gray-100">
              <p className="text-xs text-gray-400 font-medium">AutoMeter v1.0.0</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
