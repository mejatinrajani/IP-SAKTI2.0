import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, Loader2, KeyRound } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AuthModal({ isOpen, onClose }) {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  // UI States
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isOtpMode) {
        // --- STEP 3: VERIFY OTP ---
        const { error } = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: 'signup'
        });
        if (error) throw error;
        onClose(); // Verification successful, close modal
        
      } else if (isSignUp) {
        // --- STEP 1: TRIGGER SIGN UP & SEND OTP ---
        const { error } = await signUp(email, password);
        if (error) throw error;
        setIsOtpMode(true); // Switch UI to ask for OTP
        
      } else {
        // --- NORMAL SIGN IN ---
        const { error } = await signIn(email, password);
        if (error) throw error;
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setIsOtpMode(false);
    setOtp('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-neutral-100">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-3">
            {isOtpMode ? <KeyRound className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            {isOtpMode ? 'Check your email' : (isSignUp ? 'Create an account' : 'Welcome back')}
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            {isOtpMode 
              ? `We sent a 8-digit code to ${email}` 
              : 'Access secure formulation evaluation and saved dossiers.'}
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* STANDARD LOGIN/SIGNUP FIELDS */}
          {!isOtpMode && (
            <>
              <div>
                <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.gov.in"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:bg-white focus:border-neutral-900 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:bg-white focus:border-neutral-900 transition-all"
                  />
                </div>
              </div>
            </>
          )}

          {/* OTP VERIFICATION FIELD */}
          {/* OTP VERIFICATION FIELD */}
          {isOtpMode && (
            <div>
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider block mb-1.5">8-Digit OTP</label>
              <input
                type="text"
                required
                maxLength={8}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="12345678"
                className="w-full px-4 py-3 text-center tracking-widest text-lg font-mono bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:bg-white focus:border-neutral-900 transition-all"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-neutral-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              isOtpMode ? 'Verify & Continue' : (isSignUp ? 'Send OTP' : 'Sign In')
            )}
          </button>
        </form>

        {!isOtpMode && (
          <div className="mt-6 text-center text-xs text-neutral-500">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={resetState}
              className="text-neutral-900 font-semibold hover:underline ml-1"
            >
              {isSignUp ? 'Sign In' : 'Create one'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}