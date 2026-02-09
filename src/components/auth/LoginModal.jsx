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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-xl font-semibold">You need to authenticate</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          <input
            type="password"
            placeholder="Paste your Access Token"
            value={token}
            onChange={(e) => onTokenChange(e.target.value)}
            className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
          
          <div className="flex gap-2">
            <button
              onClick={onSignIn}
              className={BUTTON_STYLES.primary_lg}
            >
              Sign In
            </button>
            <button
              onClick={onClose}
              className={BUTTON_STYLES.secondary}
            >
              Cancel
            </button>
          </div>
        </div>
        
        <p className="text-slate-400 text-xs mt-4 text-center">
          Supabase → Settings → API → anon key
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
