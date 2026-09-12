import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Globe, Cpu, Scale } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 font-sans selection:bg-teal-800 selection:text-white flex flex-col justify-between">
      
      {/* Minimal Top Navigation */}
      <header className="w-full max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-xs tracking-wider">
            IP
          </div>
          <span className="font-serif font-bold text-lg tracking-tight">IP-SAKTI 2.0</span>
        </div>
        <button
          onClick={() => navigate('/workspace')}
          className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1.5"
        >
          Workspace →
        </button>
      </header>

      {/* Hero Section - Stark & Editorial */}
      <main className="w-full max-w-5xl mx-auto px-6 py-16 md:py-24 space-y-16">
        <div className="space-y-8 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-teal-800 bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-100">
            Ministry of Ayush & AIIA Compliance Suite
          </div>

          <h1 className="text-5xl sm:text-7xl font-serif font-normal tracking-tight text-stone-900 leading-[1.08]">
            Intellectual property intelligence for <span className="italic font-serif text-teal-800">Ayurveda</span>.
          </h1>

          <p className="text-lg sm:text-xl text-stone-600 font-light leading-relaxed max-w-2xl">
            A precise statutory assistant for formulation evaluation, Traditional Knowledge digital library cross-referencing, and BDA benefit-sharing compliance.
          </p>

          <div className="pt-4 flex items-center gap-6">
            <button
              onClick={() => navigate('/workspace')}
              className="bg-teal-800 hover:bg-teal-700 text-white text-sm font-medium px-8 py-4 rounded-full transition-all shadow-sm flex items-center gap-3 group"
            >
              <span>Enter Workspace</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <span className="text-xs text-stone-400 font-mono">SIH26045 • BDA 2002 Aligned</span>
          </div>
        </div>

        {/* Minimal 3-Column Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-stone-200/80">
          <div className="space-y-3">
            <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-lg text-stone-900">Section 3(p) Defense</h3>
            <p className="text-sm text-stone-600 leading-relaxed font-light">
              Automated prior art scanning against classical Samhitas and patent registries to prevent traditional knowledge misappropriation.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-lg text-stone-900">22 Scheduled Languages</h3>
            <p className="text-sm text-stone-600 leading-relaxed font-light">
              Multilingual NLP pipeline supporting regional Indic scripts and voice transcription for effortless traditional formulation entry.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-lg text-stone-900">Deterministic ABS Calculator</h3>
            <p className="text-sm text-stone-600 leading-relaxed font-light">
              Instant royalty computation and statutory compliance auditing under the Biological Diversity Act 2002 & 2023 Amendments.
            </p>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-8 border-t border-stone-200/60 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
        <span>IP-SAKTI 2.0 • Government of India Collaboration</span>
        <span>Secure Regulatory Audit Mode</span>
      </footer>

    </div>
  );
}