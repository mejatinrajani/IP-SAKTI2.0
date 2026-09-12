import React, { useState } from 'react';
import { PanelLeft, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

// 22 Scheduled Indian Languages + English for MeitY Bhashini ULCA Pipeline
const BHASHINI_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi (हिंदी)' },
  { code: 'bn', label: 'Bengali (বাংলা)' },
  { code: 'mr', label: 'Marathi (मराठी)' },
  { code: 'te', label: 'Telugu (తెలుగు)' },
  { code: 'ta', label: 'Tamil (தமிழ்)' },
  { code: 'gu', label: 'Gujarati (ગુજરાતી)' },
  { code: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ml', label: 'Malayalam (മലയാളം)' },
  { code: 'pa', label: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'or', label: 'Odia (ଓଡ଼ିଆ)' },
  { code: 'as', label: 'Assamese (অসমীয়া)' },
  { code: 'ur', label: 'Urdu (اردو)' },
  { code: 'sa', label: 'Sanskrit (संस्कृतम्)' },
  { code: 'mai', label: 'Maithili (मैथिली)' },
  { code: 'brx', label: 'Bodo (बड़ो)' },
  { code: 'doi', label: 'Dogri (डोगरी)' },
  { code: 'ks', label: 'Kashmiri (कॉशुर)' },
  { code: 'gom', label: 'Konkani (कोंकणी)' },
  { code: 'mni', label: 'Manipuri (মৈতৈলোন্)' },
  { code: 'ne', label: 'Nepali (नेपाली)' },
  { code: 'sat', label: 'Santali (ᱥᱟᱱᱛᱟᱲᱤ)' },
  { code: 'sd', label: 'Sindhi (سنڌي)' }
];

export default function Navbar({ mainView, setMainView, language, setLanguage, isSidebarOpen, setIsSidebarOpen }) {
  const { user, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-neutral-200 px-4 md:px-6 py-3.5 flex justify-between items-center transition-all">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
            title="Toggle Sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs tracking-wider">
              IP
            </div>
            <h1 className="text-base md:text-lg font-bold tracking-tight text-neutral-900">IP-SAKTI 2.0</h1>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-neutral-100/80 p-1 rounded-xl border border-neutral-200/80">
          <button
            onClick={() => setMainView('evaluator')}
            className={`px-3.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              mainView === 'evaluator' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Evaluator
          </button>
          <button
            onClick={() => setMainView('calculator')}
            className={`px-3.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              mainView === 'calculator' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            ABS Calculator
          </button>
        </div>

        {/* Language & Profile actions */}
        <div className="flex items-center gap-3">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-neutral-50 border border-neutral-200 text-neutral-700 text-xs font-medium rounded-lg px-2.5 py-1.5 outline-none focus:border-neutral-900 cursor-pointer"
          >
            {BHASHINI_LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-600 font-medium hidden sm:inline truncate max-w-[120px]">
                {user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <User className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}
        </div>
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}