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
    <div className="max-w-3xl mx-auto w-full animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-neutral-900">Statutory ABS Calculator</h2>
        <p className="text-neutral-500 mt-2 text-sm">Deterministic royalty computation (BDA 2002 & 2023 Amendments)</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden mb-8">
        <form onSubmit={handleCalculate} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-neutral-700">Applicant Classification</label>
              <select value={formData.applicant_type} onChange={(e) => setFormData({...formData, applicant_type: e.target.value})} className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="commercial_entity">Commercial / Corporate Entity</option>
                <option value="registered_ayush_practitioner">Registered Ayush Practitioner (Vaidya/Hakim)</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-neutral-700">Statutory Purpose</label>
              <select value={formData.purpose} onChange={(e) => setFormData({...formData, purpose: e.target.value})} className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="commercial_utilization">Commercial Manufacturing (Form 9)</option>
                <option value="ipr_licensing">IPR / Patent Licensing (Form 8)</option>
              </select>
            </div>
          </div>

          <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 mb-6">
            {formData.purpose === 'commercial_utilization' ? (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-neutral-700">Gross Ex-Factory Sales (INR)</label>
                <input type="number" value={formData.gross_annual_sales_inr} onChange={(e) => setFormData({...formData, gross_annual_sales_inr: e.target.value})} placeholder="e.g. 45000000" className="p-3 bg-white border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" required />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2"><label className="text-sm font-semibold text-neutral-700">Upfront Fee (INR)</label><input type="number" value={formData.upfront_licensing_fee_inr} onChange={(e) => setFormData({...formData, upfront_licensing_fee_inr: e.target.value})} className="p-3 bg-white border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
                <div className="flex flex-col gap-2"><label className="text-sm font-semibold text-neutral-700">Annual Royalty (INR)</label><input type="number" value={formData.annual_royalty_inr} onChange={(e) => setFormData({...formData, annual_royalty_inr: e.target.value})} className="p-3 bg-white border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="w-full bg-neutral-900 text-white py-3.5 rounded-xl font-medium hover:bg-indigo-600 transition-colors shadow-sm disabled:opacity-50">
            {loading ? 'Computing Liability...' : 'Calculate Liability'}
          </button>
        </form>
      </div>

      {result && !error && (
        <div className={`rounded-2xl p-6 border ${result.is_exempt ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className="flex flex-col items-center text-center mb-6">
            <span className={`text-xs font-bold uppercase tracking-wider mb-2 ${result.is_exempt ? 'text-emerald-600' : 'text-neutral-400'}`}>Mandatory Royalty Fee</span>
            <div className={`text-4xl md:text-5xl font-black ${result.is_exempt ? 'text-emerald-700' : 'text-neutral-900'}`}>
  {result.is_exempt 
    ? "₹ 0" 
    : result.calculated_abs_fee_inr === result.calculated_max_fee_inr
      ? formatINR(result.calculated_abs_fee_inr)
      : `${formatINR(result.calculated_abs_fee_inr)} - ${formatINR(result.calculated_max_fee_inr)}`
  }
</div>
            <span className="text-sm font-medium mt-2 text-neutral-500">{result.applied_rate_description}</span>
          </div>
          <div className="space-y-3 pt-6 border-t border-neutral-200/50">
            {result.statutory_reality_check.map((check, idx) => (
              <div key={idx} className="flex gap-3 text-sm text-neutral-700"><span className="text-indigo-500">✦</span>{check}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}