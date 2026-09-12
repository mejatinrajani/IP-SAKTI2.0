import React, { useState } from 'react';
import { PanelLeft, User, LogOut, Globe, Plus, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

const SARVAM_LANGUAGES = [
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

export default function Navbar({ mainView, setMainView, language, setLanguage, isSidebarOpen, setIsSidebarOpen, onNewChat }) {
  const { user, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 border-b px-4 md:px-6 py-3 flex justify-between items-center transition-all"
        style={{
          background: 'var(--color-base-navy)',
          borderColor: 'var(--color-base-navy-panel)',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl transition-colors"
            style={{ color: 'var(--color-text-secondary-on-dark)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-base-navy-panel)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            title="Toggle Sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2.5 mr-4">
            {/* Redesigned IP Logo Mark */}
            <img 
              src="/logo.png" 
              alt="IP-SAKTI Logo" 
              className="w-8 h-8 rounded-md object-cover" 
            />
            <h1 className="text-base md:text-lg font-bold tracking-tight" style={{ color: 'var(--color-surface)' }}>
              IP-SAKTI <span style={{ color: 'var(--color-accent)' }}>2.0</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-5 overflow-x-auto whitespace-nowrap hide-scrollbar">
          {/* View Switcher */}
          <div className="flex items-center p-1 rounded-lg border shrink-0"
            style={{ background: 'var(--color-base-navy-panel)', borderColor: 'var(--color-base-navy-panel)' }}
          >
            <button
              onClick={() => setMainView('evaluator')}
              className="px-3 py-1 text-xs font-semibold rounded-md transition-all"
              style={mainView === 'evaluator' 
                ? { background: 'var(--color-accent)', color: 'var(--color-accent-text-on-dark)' }
                : { color: 'var(--color-text-secondary-on-dark)' }
              }
            >
              Evaluator
            </button>
            <button
              onClick={() => setMainView('calculator')}
              className="px-3 py-1 text-xs font-semibold rounded-md transition-all"
              style={mainView === 'calculator' 
                ? { background: 'var(--color-accent)', color: 'var(--color-accent-text-on-dark)' }
                : { color: 'var(--color-text-secondary-on-dark)' }
              }
            >
              ABS Calculator
            </button>
          </div>

          {/* Language & Profile actions */}
          <div className="flex items-center gap-3 border-l pl-3" style={{ borderColor: 'var(--color-base-navy-panel)' }}>
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" style={{ color: 'var(--color-text-secondary-on-dark)' }} />
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="text-xs font-medium rounded-md px-2 py-1 outline-none cursor-pointer border"
                style={{ 
                  background: 'var(--color-base-navy-panel)', 
                  borderColor: 'var(--color-base-navy-panel)', 
                  color: 'var(--color-surface)' 
                }}
              >
                {SARVAM_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code} style={{ background: 'var(--color-base-navy)', color: 'var(--color-surface)' }}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 hidden sm:flex"
                  style={{ background: '#0284C7', color: '#FFFFFF' }}
                >
                  VS
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-1.5 rounded-md transition-colors"
                  style={{ color: 'var(--color-text-secondary-on-dark)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-risk-high-bg)'; e.currentTarget.style.color = 'var(--color-risk-high-text)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary-on-dark)'; }}
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all shadow-sm"
                style={{ background: 'var(--color-accent)', color: 'var(--color-accent-text-on-dark)' }}
              >
                <User className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}