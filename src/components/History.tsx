import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Navigation, IndianRupee, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Ride } from '../types';

interface HistoryProps {
  rides: Ride[];
  onDeleteRides: (ids: string[]) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function History({ rides, onDeleteRides }: HistoryProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedRideIds, setSelectedRideIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [ridesToDelete, setRidesToDelete] = useState<string[]>([]);

  const months = useMemo(() => {
    const uniqueMonths = new Set(rides.map(r => format(r.startTime, 'MMM yyyy')));
    return ['All', ...Array.from(uniqueMonths)];
  }, [rides]);

  const filteredRides = useMemo(() => {
    if (selectedMonth === 'All') return rides;
    return rides.filter(r => format(r.startTime, 'MMM yyyy') === selectedMonth);
  }, [rides, selectedMonth]);

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedRideIds(new Set());
  };

  const toggleRideSelection = (id: string) => {
    const newSelection = new Set(selectedRideIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedRideIds(newSelection);
  };

  const confirmDelete = (ids: string[]) => {
    setRidesToDelete(ids);
    setShowDeleteConfirm(true);
  };

  const handleDelete = () => {
    onDeleteRides(ridesToDelete);
    setShowDeleteConfirm(false);
    setRidesToDelete([]);
    setSelectedRideIds(new Set());
    if (isSelectionMode) setIsSelectionMode(false);
  };

  if (rides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6"
        >
          <Navigation className="w-10 h-10 text-emerald-400" />
        </motion.div>
        <motion.h2 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-gray-900 mb-2"
        >
          No rides yet
        </motion.h2>
        <motion.p 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-500"
        >
          Your past rides will appear here.
        </motion.p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 p-4 overflow-hidden pt-6 relative">
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-2xl font-bold text-gray-900">Ride History</h2>
        {rides.length > 0 && (
          <button 
            onClick={toggleSelectionMode}
            className={`text-sm font-semibold px-4 py-1.5 rounded-full transition-colors ${isSelectionMode ? 'bg-gray-200 text-gray-800' : 'bg-emerald-50 text-emerald-600'}`}
          >
            {isSelectionMode ? 'Cancel' : 'Select'}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 px-2 mb-4 pb-2">
        {months.map(month => (
          <button
            key={month}
            onClick={() => setSelectedMonth(month)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedMonth === month 
                ? 'bg-gray-900 text-white' 
                : 'bg-white text-gray-600 border border-gray-200 shadow-sm'
            }`}
          >
            {month}
          </button>
        ))}
      </div>

      {/* Actions (Selection Mode) */}
      <AnimatePresence>
        {isSelectionMode && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex justify-between items-center px-2 mb-4 overflow-hidden"
          >
            <span className="text-sm font-medium text-gray-600">
              {selectedRideIds.size} selected
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  if (selectedRideIds.size === filteredRides.length) {
                    setSelectedRideIds(new Set());
                  } else {
                    setSelectedRideIds(new Set(filteredRides.map(r => r.id)));
                  }
                }}
                className="text-sm font-semibold text-gray-600 px-3 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm"
              >
                {selectedRideIds.size === filteredRides.length ? 'Deselect All' : 'Select All'}
              </button>
              <button 
                onClick={() => confirmDelete(Array.from(selectedRideIds))}
                disabled={selectedRideIds.size === 0}
                className="text-sm font-semibold text-white px-3 py-1.5 bg-red-500 rounded-full disabled:opacity-50 disabled:bg-red-400 flex items-center shadow-sm"
              >
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex-1 overflow-y-auto pb-20 px-2 hide-scrollbar">
        {filteredRides.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No rides found for {selectedMonth}.
          </div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {filteredRides.map((ride) => (
              <motion.div 
                key={ride.id} 
                variants={item}
                onClick={() => isSelectionMode && toggleRideSelection(ride.id)}
                className={`bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-4 border transition-all ${
                  isSelectionMode ? 'cursor-pointer' : ''
                } ${
                  selectedRideIds.has(ride.id) ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/30' : 'border-gray-100'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3 w-full">
                    {/* Selection Indicator */}
                    {isSelectionMode && (
                      <div className="flex-shrink-0">
                        {selectedRideIds.has(ride.id) ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                    )}
                    
                    {/* Compact Ride Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center text-gray-900 font-black text-xl">
                          <IndianRupee className="w-4 h-4 mr-0.5" />
                          {ride.totalFare}
                        </div>
                        <div className="flex items-center text-gray-500 text-[11px] font-semibold">
                          {format(ride.startTime, 'MMM d • h:mm a')}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-800 truncate mb-2">
                        <span className="truncate max-w-[42%]">{ride.startLocation.split(',')[0]}</span>
                        <span className="text-gray-400 text-xs">→</span>
                        <span className="truncate max-w-[42%]">{ride.endLocation.split(',')[0]}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-500 text-xs font-medium gap-2">
                          <span>{ride.distanceKm.toFixed(2)} km</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span>{Math.floor(ride.durationSeconds / 60)}m {ride.durationSeconds % 60}s</span>
                          {ride.optimalDistanceKm && (
                            <>
                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              <span className={(ride.optimalDistanceKm / ride.distanceKm) > 0.85 ? 'text-emerald-500' : 'text-amber-500'}>
                                {Math.round((ride.optimalDistanceKm / ride.distanceKm) * 100)}% eff.
                              </span>
                            </>
                          )}
                        </div>
                        
                        {!isSelectionMode && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete([ride.id]);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors active:scale-90"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm relative z-10 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Ride{ridesToDelete.length > 1 ? 's' : ''}?</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete {ridesToDelete.length > 1 ? `these ${ridesToDelete.length} rides` : 'this ride'}? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl active:scale-95 transition-transform"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded-xl active:scale-95 transition-transform shadow-[0_4px_14px_rgba(220,38,38,0.3)]"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
