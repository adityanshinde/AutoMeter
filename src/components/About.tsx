import { motion } from 'motion/react';
import { Info, ShieldAlert, MapPin, CheckCircle2 } from 'lucide-react';

export default function About() {
  return (
    <div className="h-full overflow-y-auto bg-gray-50 pb-24">
      <div className="bg-emerald-600 pt-safe pb-16 px-6 rounded-b-[40px] shadow-lg">
        <h1 className="text-3xl font-black text-white tracking-tight mb-2 mt-4">About AutoMeter</h1>
        <p className="text-emerald-100 font-medium">Fair Auto Fare Calculator</p>
      </div>

      <div className="px-6 -mt-8 space-y-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <MapPin className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">AutoMeter</h2>
          <p className="text-gray-500 font-medium mb-6">Version 1.0.0</p>
          
          <p className="text-gray-700 leading-relaxed mb-6">
            AutoMeter is a digital ride tracking tool designed to help passengers estimate auto-rickshaw fares using GPS distance and official city fare rules.
          </p>
          
          <div className="flex justify-center gap-4">
            <div className="bg-gray-50 px-4 py-2 rounded-xl flex items-center border border-gray-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" />
              <span className="text-sm font-semibold text-gray-700">GPS Tracking</span>
            </div>
            <div className="bg-gray-50 px-4 py-2 rounded-xl flex items-center border border-gray-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" />
              <span className="text-sm font-semibold text-gray-700">Official Fares</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-amber-50 rounded-3xl p-6 border border-amber-100"
        >
          <div className="flex items-start mb-4">
            <ShieldAlert className="w-6 h-6 text-amber-600 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-amber-900 mb-2">Important Disclaimer</h3>
              <p className="text-sm text-amber-800 leading-relaxed">
                This app is <strong>not affiliated with any government transport authority</strong> or RTO. 
                <br/><br/>
                The fare calculated is an estimate based on your device's GPS and publicly available fare charts. It should be used as a reference only.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <Info className="w-5 h-5 mr-2 text-blue-500" />
            How it works
          </h3>
          
          <div className="space-y-4">
            <div className="flex">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">1</div>
              <p className="text-sm text-gray-600 mt-1.5">Select your city to load the correct official fare rules.</p>
            </div>
            <div className="flex">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">2</div>
              <p className="text-sm text-gray-600 mt-1.5">Start the meter when your ride begins. The app tracks your GPS location.</p>
            </div>
            <div className="flex">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">3</div>
              <p className="text-sm text-gray-600 mt-1.5">Stop the meter when you arrive to see the estimated fare based on distance and time.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
