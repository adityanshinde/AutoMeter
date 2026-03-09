import { Ride } from '../types';
import { format, isToday } from 'date-fns';
import { IndianRupee, Navigation, CheckCircle2, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface DriverDashboardProps {
  rides: Ride[];
}

export default function DriverDashboard({ rides }: DriverDashboardProps) {
  // Calculate today's stats
  const todayRides = rides.filter(ride => isToday(ride.startTime));
  
  const totalTrips = todayRides.length;
  const totalDistance = todayRides.reduce((acc, ride) => acc + ride.distanceKm, 0);
  const totalEarnings = todayRides.reduce((acc, ride) => acc + ride.totalFare, 0);

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto p-4 pb-24">
      <div className="mb-6 shrink-0">
        <h2 className="text-2xl font-bold text-gray-900">Driver Dashboard</h2>
        <p className="text-gray-500 text-sm">Track your daily earnings and trips</p>
      </div>

      {/* Today's Summary Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-6 text-white shadow-lg mb-6 relative overflow-hidden shrink-0"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <TrendingUp className="w-24 h-24" />
        </div>
        
        <h3 className="text-emerald-100 font-medium mb-1">Today's Earnings</h3>
        <div className="flex items-baseline mb-6">
          <span className="text-2xl font-medium mr-1">₹</span>
          <span className="text-5xl font-black tracking-tight">{totalEarnings}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-emerald-500/30 pt-4">
          <div>
            <p className="text-emerald-100 text-xs font-medium uppercase tracking-wider mb-1">Total Trips</p>
            <p className="text-2xl font-bold">{totalTrips}</p>
          </div>
          <div>
            <p className="text-emerald-100 text-xs font-medium uppercase tracking-wider mb-1">Distance</p>
            <p className="text-2xl font-bold">{totalDistance.toFixed(1)} <span className="text-sm font-medium">km</span></p>
          </div>
        </div>
      </motion.div>

      {/* Recent Trips List */}
      <div className="mb-4 flex justify-between items-center shrink-0">
        <h3 className="text-lg font-bold text-gray-900">Today's Trips</h3>
        <span className="text-sm text-gray-500">{format(new Date(), 'MMM d, yyyy')}</span>
      </div>

      {todayRides.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Navigation className="w-8 h-8 text-gray-300" />
          </div>
          <h4 className="text-gray-900 font-semibold mb-1">No trips yet today</h4>
          <p className="text-gray-500 text-sm">Start the digital meter to track your rides and earnings.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {todayRides.map((ride, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={ride.id} 
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-gray-900 truncate">{ride.endLocation.split(',')[0]}</p>
                  <div className="flex items-center text-xs text-gray-500 mt-0.5">
                    <span>{format(ride.startTime, 'h:mm a')}</span>
                    <span className="mx-1.5">•</span>
                    <span>{ride.distanceKm.toFixed(1)} km</span>
                  </div>
                </div>
              </div>
              <div className="text-right pl-3">
                <p className="text-lg font-bold text-emerald-600">₹{ride.totalFare}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
