import React, { useState } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000';

export default function ABSCalculator() {
  const [formData, setFormData] = useState({
    applicant_type: 'commercial_entity', purpose: 'commercial_utilization',
    gross_annual_sales_inr: '', upfront_licensing_fee_inr: '', annual_royalty_inr: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR', 
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    // Strictly cast to floats to satisfy Pydantic
    const payload = {
      applicant_type: formData.applicant_type,
      purpose: formData.purpose,
      gross_annual_sales_inr: parseFloat(formData.gross_annual_sales_inr) || 0.0,
      upfront_licensing_fee_inr: parseFloat(formData.upfront_licensing_fee_inr) || 0.0,
      annual_royalty_inr: parseFloat(formData.annual_royalty_inr) || 0.0,
    };
    console.log("SENDING PAYLOAD TO FASTAPI:", payload); 

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/compliance/calculate-abs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        // This will now catch and print the exact FastAPI validation error if it fails again
        const errData = await res.json();
        throw new Error(JSON.stringify(errData.detail) || 'Failed to calculate ABS fee');
      }
      
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full animate-fade-in font-sans py-8 px-4 md:px-8">
      <div className="mb-12">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight">Statutory ABS Calculator</h2>
        <p className="text-stone-500 mt-2 text-base">Deterministic royalty computation (BDA 2002 & 2023 Amendments)</p>
      </div>

      <form onSubmit={handleCalculate} className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">Applicant Classification</label>
            <select 
              value={formData.applicant_type} 
              onChange={(e) => setFormData({...formData, applicant_type: e.target.value})} 
              className="bg-transparent border-b-2 border-stone-300 py-2.5 text-lg font-medium text-stone-800 outline-none focus:border-teal-700 transition-colors cursor-pointer appearance-none"
            >
              <option value="commercial_entity">Commercial / Corporate Entity</option>
              <option value="registered_ayush_practitioner">Registered Ayush Practitioner (Vaidya/Hakim)</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">Statutory Purpose</label>
            <select 
              value={formData.purpose} 
              onChange={(e) => setFormData({...formData, purpose: e.target.value})} 
              className="bg-transparent border-b-2 border-stone-300 py-2.5 text-lg font-medium text-stone-800 outline-none focus:border-teal-700 transition-colors cursor-pointer appearance-none"
            >
              <option value="commercial_utilization">Commercial Manufacturing (Form 9)</option>
              <option value="ipr_licensing">IPR / Patent Licensing (Form 8)</option>
            </select>
          </div>
        </div>

        <div className="mb-12">
          {formData.purpose === 'commercial_utilization' ? (
            <div className="flex flex-col gap-2 max-w-xl">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">Gross Ex-Factory Sales (INR)</label>
              <input 
                type="number" 
                value={formData.gross_annual_sales_inr} 
                onChange={(e) => setFormData({...formData, gross_annual_sales_inr: e.target.value})} 
                placeholder="e.g. 45000000" 
                className="bg-transparent border-b-2 border-stone-300 py-2.5 text-xl font-medium text-stone-800 outline-none focus:border-teal-700 transition-colors placeholder:text-stone-300" 
                required 
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">Upfront Fee (INR)</label>
                <input 
                  type="number" 
                  value={formData.upfront_licensing_fee_inr} 
                  onChange={(e) => setFormData({...formData, upfront_licensing_fee_inr: e.target.value})} 
                  placeholder="e.g. 500000"
                  className="bg-transparent border-b-2 border-stone-300 py-2.5 text-xl font-medium text-stone-800 outline-none focus:border-teal-700 transition-colors placeholder:text-stone-300" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-stone-400">Annual Royalty (INR)</label>
                <input 
                  type="number" 
                  value={formData.annual_royalty_inr} 
                  onChange={(e) => setFormData({...formData, annual_royalty_inr: e.target.value})} 
                  placeholder="e.g. 150000"
                  className="bg-transparent border-b-2 border-stone-300 py-2.5 text-xl font-medium text-stone-800 outline-none focus:border-teal-700 transition-colors placeholder:text-stone-300" 
                />
              </div>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="group inline-flex items-center gap-3 px-8 py-4 bg-teal-800 text-white rounded-full font-medium text-base hover:bg-teal-700 transition-all shadow-sm disabled:opacity-40 disabled:hover:bg-teal-800"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Computing Liability...
            </>
          ) : (
            <>
              Calculate Liability
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </>
          )}
        </button>
      </form>

      {result && !error && (
        <div className="animate-slide-in-up pt-12 border-t border-stone-200/60">
          <div className="flex flex-col mb-12">
            <span className={`text-xs font-bold uppercase tracking-widest mb-4 ${result.is_exempt ? 'text-teal-700' : 'text-stone-400'}`}>
              Mandatory Royalty Fee
            </span>
            <div className={`text-5xl md:text-7xl font-serif font-bold tracking-tight ${result.is_exempt ? 'text-teal-800' : 'text-stone-900'}`}>
              {result.is_exempt 
                ? "₹ 0" 
                : result.calculated_abs_fee_inr === result.calculated_max_fee_inr
                  ? formatINR(result.calculated_abs_fee_inr)
                  : `${formatINR(result.calculated_abs_fee_inr)} - ${formatINR(result.calculated_max_fee_inr)}`
              }
            </div>
            <div className="mt-6">
              <span className="text-sm font-medium text-stone-600 bg-stone-100 px-4 py-1.5 rounded-full border border-stone-200/60">
                {result.applied_rate_description}
              </span>
            </div>
          </div>
          
          <div className="space-y-4 max-w-2xl">
            {result.statutory_reality_check.map((check, idx) => (
              <div key={idx} className="flex gap-4 text-base text-stone-600 leading-relaxed items-start">
                <span className="text-teal-700 mt-0.5">✧</span>
                <p>{check}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}