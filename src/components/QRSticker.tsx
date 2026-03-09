import QRCode from 'react-qr-code';
import { motion } from 'motion/react';
import { MapPin, Download, Share2 } from 'lucide-react';

export default function QRSticker() {
  const appUrl = window.location.origin;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AutoMeter App',
          text: 'Scan to verify auto meter fare and track your ride!',
          url: appUrl,
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(appUrl);
      alert('App link copied to clipboard!');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto p-4 pb-24">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">QR Sticker</h2>
        <p className="text-gray-500 text-sm">Let passengers scan to verify fare</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col items-center text-center relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-32 bg-emerald-600 rounded-t-3xl z-0"></div>
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500 rounded-full blur-3xl opacity-50 z-0"></div>

        <div className="relative z-10 w-full flex flex-col items-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6 border border-gray-100">
            <MapPin className="w-8 h-8 text-emerald-600" />
          </div>
          
          <h3 className="text-3xl font-black text-white mb-2 tracking-tight drop-shadow-md">AutoMeter</h3>
          <p className="text-emerald-50 font-medium mb-8 drop-shadow-sm">Verified Fare Calculator</p>

          <div className="bg-white p-4 rounded-2xl shadow-inner border-4 border-gray-100 mb-6">
            <QRCode 
              value={appUrl} 
              size={200}
              level="H"
              fgColor="#047857" // emerald-700
            />
          </div>

          <p className="text-gray-900 font-bold text-xl mb-2">Scan to Verify Fare</p>
          <p className="text-gray-500 text-sm max-w-[200px] mx-auto">Passengers can scan this code to track the ride on their phone.</p>
        </div>
      </motion.div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={handleShare}
          className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Share Link
        </button>
      </div>
      
      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start">
        <div className="bg-blue-100 p-2 rounded-full mr-3 mt-0.5">
          <Info className="w-4 h-4 text-blue-700" />
        </div>
        <div>
          <h4 className="font-semibold text-blue-900 text-sm mb-1">Growth Tip</h4>
          <p className="text-blue-800 text-xs leading-relaxed">Print this screen or take a screenshot and stick it behind your seat. Passengers trust drivers who offer transparent fare tracking.</p>
        </div>
      </div>
    </div>
  );
}

// Simple Info icon component since we didn't import it at the top
function Info(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
