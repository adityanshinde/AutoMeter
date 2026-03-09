import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Info, AlertTriangle, MapPin, ExternalLink } from 'lucide-react';
import { FARE_RULES } from '../utils/fare';
import { City } from '../types';

interface FareRulesProps {
  city: City;
  onCityChange: (city: City) => void;
}

export default function FareRules({ city, onCityChange }: FareRulesProps) {
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const rules = FARE_RULES[city];

  return (
    <div className="h-full overflow-y-auto bg-gray-50 pb-24">
      <div className="bg-emerald-600 pt-safe pb-16 px-6 rounded-b-[40px] shadow-lg relative">
        <h1 className="text-3xl font-black text-white tracking-tight mb-2 mt-4">Fare Rules</h1>
        <p className="text-emerald-100 font-medium">Official RTO Guidelines</p>
        
        <div className="absolute -bottom-6 left-6 right-6">
          <div className="bg-white rounded-2xl shadow-xl p-4 flex items-center justify-between border border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                <MapPin className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="relative">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Select City</p>
                <button 
                  onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                  className="flex items-center text-lg font-bold text-gray-900 focus:outline-none pr-2 cursor-pointer"
                >
                  {city}
                  <svg className={`ml-2 fill-current h-5 w-5 text-gray-400 transition-transform duration-200 ${isCityDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
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
                        className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-40 overflow-hidden"
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
          </div>
        </div>
      </div>

      <div className="mt-12 px-6 space-y-6">
        {/* Fare Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Official Fare Chart</h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div>
                <p className="font-semibold text-gray-900">Base Fare</p>
                <p className="text-sm text-gray-500">First {rules.baseDistance} km</p>
              </div>
              <span className="text-xl font-black text-gray-900">₹{rules.baseFare}</span>
            </div>
            
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div>
                <p className="font-semibold text-gray-900">Per Kilometer</p>
                <p className="text-sm text-gray-500">After {rules.baseDistance} km</p>
              </div>
              <span className="text-xl font-black text-gray-900">₹{rules.perKmFare}</span>
            </div>
            
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div>
                <p className="font-semibold text-gray-900">Night Charges</p>
                <p className="text-sm text-gray-500">12:00 AM - 5:00 AM</p>
              </div>
              <span className="text-xl font-black text-gray-900">+{rules.nightChargeMultiplier * 100 - 100}%</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-900">Waiting Charges</p>
                <p className="text-sm text-gray-500">Per minute</p>
              </div>
              <span className="text-xl font-black text-gray-900">₹{rules.waitingFarePerMin}</span>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Official Authority: RTO {city}</span>
            <span>Last updated: Oct 2023</span>
          </div>
        </motion.div>

        {/* Passenger Rights */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100"
        >
          <div className="flex items-center mb-4">
            <ShieldCheck className="w-6 h-6 text-emerald-600 mr-2" />
            <h2 className="text-lg font-bold text-emerald-900">Passenger Rights</h2>
          </div>
          
          <ul className="space-y-3 text-emerald-800 text-sm font-medium">
            <li className="flex items-start">
              <span className="mr-2 mt-0.5">•</span>
              <span>Driver must go by the electronic meter.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 mt-0.5">•</span>
              <span>No refusal to ply within city limits.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 mt-0.5">•</span>
              <span>Night charges are strictly applicable only between 12:00 AM and 5:00 AM.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 mt-0.5">•</span>
              <span>Official fare chart must be displayed in the vehicle.</span>
            </li>
          </ul>
        </motion.div>

        {/* Dispute Resolution */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-amber-50 rounded-3xl p-6 border border-amber-100"
        >
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-600 mr-2" />
            <h2 className="text-lg font-bold text-amber-900">In Case of Dispute</h2>
          </div>
          
          <p className="text-sm text-amber-800 mb-4">
            If the driver refuses to use the meter or demands excess fare, you can file a complaint with the RTO.
          </p>
          
          <button className="w-full bg-amber-100 hover:bg-amber-200 text-amber-900 py-3 rounded-xl font-bold transition-colors flex items-center justify-center">
            <span>Report to RTO {city}</span>
            <ExternalLink className="w-4 h-4 ml-2" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
