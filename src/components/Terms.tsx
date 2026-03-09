import { motion } from 'motion/react';
import { FileText, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Terms() {
  return (
    <div className="h-full overflow-y-auto bg-gray-50 pb-24">
      <div className="bg-emerald-600 pt-safe pb-16 px-6 rounded-b-[40px] shadow-lg">
        <h1 className="text-3xl font-black text-white tracking-tight mb-2 mt-4">Terms & Conditions</h1>
        <p className="text-emerald-100 font-medium">Please read carefully</p>
      </div>

      <div className="px-6 -mt-8 space-y-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">User Agreement</h2>
              <p className="text-gray-500 font-medium text-sm">Last updated: Oct 2023</p>
            </div>
          </div>

          <div className="space-y-6 text-gray-700 leading-relaxed text-sm">
            <p>
              By using the AutoMeter app, you agree to the following terms and conditions. If you do not agree, please do not use the app.
            </p>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
                1. Fare Estimates
              </h3>
              <p className="text-gray-600">
                The fare calculations provided by this app are <strong>estimates only</strong>. They are based on your device's GPS data and publicly available fare rules. The actual official meter in the vehicle is the only legally binding fare.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
                2. GPS Accuracy
              </h3>
              <p className="text-gray-600">
                GPS accuracy varies depending on your device, location, weather, and physical obstructions (like tall buildings or tunnels). The app cannot guarantee 100% accuracy of distance traveled.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2 text-emerald-500" />
                3. Not a Certified Meter
              </h3>
              <p className="text-gray-600">
                This app is <strong>not a certified or calibrated electronic meter</strong>. It is not approved by any Regional Transport Office (RTO) or government body. It is a personal utility tool for reference.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2 text-emerald-500" />
                4. Liability
              </h3>
              <p className="text-gray-600">
                The developers of AutoMeter are not liable for any disputes, financial losses, or altercations that may arise between passengers and drivers regarding fare discrepancies. Users should always verify fares with the driver and the official vehicle meter.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
