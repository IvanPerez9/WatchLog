import React from 'react';
import { X } from 'lucide-react';
import { BUTTON_STYLES } from '../../styles/buttonStyles.js';

/**
 * LoginModal Component
 * Modal para autenticación con Access Token
 */
const LoginModal = ({ 
  show, 
  token, 
  onTokenChange, 
  onSignIn, 
  onClose 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-slate-800 rounded-lg p-4 sm:p-6 md:p-8 w-full max-w-md">
        <div className="flex justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
          <h2 className="text-lg sm:text-xl font-semibold text-white">You need to authenticate</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition flex-shrink-0"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          <input
            type="password"
            placeholder="Paste your Access Token"
            value={token}
            onChange={(e) => onTokenChange(e.target.value)}
            className="w-full bg-slate-700 text-white p-2 sm:p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs sm:text-sm"
          />
          
          <div className="flex gap-2 flex-col sm:flex-row">
            <button
              onClick={onSignIn}
              className={`${BUTTON_STYLES.primary_lg} text-center`}
            >
              Sign In
            </button>
            <button
              onClick={onClose}
              className="px-3 sm:px-4 py-2 sm:py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition text-sm flex-1 sm:flex-none text-center"
            >
              Cancel
            </button>
          </div>
        </div>
        
        <p className="text-slate-400 text-xs mt-3 sm:mt-4 text-center">
          Supabase → Settings → API → anon key
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
