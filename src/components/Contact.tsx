import { motion } from 'motion/react';
import { Mail, MessageSquare, Clock, AlertCircle } from 'lucide-react';

export default function Contact() {
  return (
    <div className="h-full overflow-y-auto bg-gray-50 pb-24">
      <div className="bg-emerald-600 pt-safe pb-16 px-6 rounded-b-[40px] shadow-lg">
        <h1 className="text-3xl font-black text-white tracking-tight mb-2 mt-4">Contact Us</h1>
        <p className="text-emerald-100 font-medium">We're here to help</p>
      </div>

      <div className="px-6 -mt-8 space-y-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
              <Mail className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Email Support</h2>
              <p className="text-emerald-600 font-semibold">support@autometer.app</p>
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-500 bg-gray-50 p-4 rounded-xl">
            <Clock className="w-5 h-5 mr-3 text-gray-400" />
            <span>Expected response time: 24-48 hours</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
            Common Issues
          </h3>
          
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-3 mt-2"></span>
              <span>Fare calculation discrepancies</span>
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-3 mt-2"></span>
              <span>GPS accuracy or tracking errors</span>
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-3 mt-2"></span>
              <span>App bugs or feature requests</span>
            </li>
            <li className="flex items-start">
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-3 mt-2"></span>
              <span>Adding new cities to the app</span>
            </li>
          </ul>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 rounded-3xl p-6 border border-blue-100"
        >
          <div className="flex items-start mb-4">
            <AlertCircle className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-blue-900 mb-1">Report an Issue</h3>
              <p className="text-sm text-blue-800 mb-4">
                Found a bug or have a suggestion? Let us know so we can improve the app.
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors shadow-sm">
                Open Support Ticket
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
