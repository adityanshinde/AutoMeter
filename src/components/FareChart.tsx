import { X, IndianRupee, Clock, Moon, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { FARE_RULES } from '../utils/fare';
import { City } from '../types';

interface FareChartProps {
  city: City;
  onClose: () => void;
}

export default function FareChart({ city, onClose }: FareChartProps) {
  const rules = FARE_RULES[city];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute inset-0 z-50 bg-white flex flex-col h-full"
    >
      <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-emerald-50">
        <button onClick={onClose} className="p-2 bg-white rounded-full text-emerald-600 shadow-sm hover:bg-emerald-100 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-emerald-900 flex items-center">
          <ShieldCheck className="w-5 h-5 mr-2" />
          Official {city} Auto Fare
        </h2>
      </div>

      <div className="p-6 flex-1 overflow-y-auto bg-gray-50">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <IndianRupee className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Base Fare</p>
              <p className="text-3xl font-black text-gray-900">₹{rules.baseFare}</p>
              <p className="text-sm text-gray-500 mt-1">For the first <span className="font-semibold text-gray-700">{rules.baseDistanceKm} km</span></p>
            </div>
          </div>

          <div className="h-px bg-gray-100 w-full"></div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <IndianRupee className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Per KM Rate</p>
              <p className="text-2xl font-bold text-gray-900">₹{rules.perKmRate}<span className="text-base font-medium text-gray-500">/km</span></p>
              <p className="text-sm text-gray-500 mt-1">After initial {rules.baseDistanceKm} km</p>
            </div>
          </div>

          <div className="h-px bg-gray-100 w-full"></div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Waiting Charge</p>
              <p className="text-2xl font-bold text-gray-900">₹{rules.waitingChargePerMin}<span className="text-base font-medium text-gray-500">/min</span></p>
              <p className="text-sm text-gray-500 mt-1">
                {rules.freeWaitingTimeMins ? `First ${rules.freeWaitingTimeMins} mins free` : 'Applies immediately'}
              </p>
            </div>
          </div>

          <div className="h-px bg-gray-100 w-full"></div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <Moon className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Night Charges</p>
              <p className="text-2xl font-bold text-gray-900">+{(rules.nightChargeMultiplier - 1) * 100}%</p>
              <p className="text-sm text-gray-500 mt-1">Between {rules.nightStartTime}:00 and {rules.nightEndTime}:00</p>
            </div>
          </div>

        </div>
        
        <p className="text-center text-xs text-gray-400 mt-6 font-medium">
          Rates are based on official RTO guidelines for {city}.
        </p>
      </div>
    </motion.div>
  );
}
