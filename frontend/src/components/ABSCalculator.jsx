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

  const inputStyle = {
    background: '#faf9f6',
    border: '1px solid #e5e2dc',
    color: '#1a2744',
    caretColor: '#b87333'
  };

  const labelStyle = { color: '#6a6560' };

  return (
    <div className="max-w-3xl mx-auto w-full animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold" style={{ color: '#1a2744' }}>
          Statutory ABS Calculator
        </h2>
        <p className="mt-2 text-sm" style={{ color: '#9a9590' }}>
          Deterministic royalty computation (BDA 2002 & 2023 Amendments)
        </p>
      </div>

      <div className="rounded-2xl overflow-hidden mb-8"
        style={{
          background: '#ffffff',
          border: '1px solid #e5e2dc',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)'
        }}
      >
        <form onSubmit={handleCalculate} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold" style={labelStyle}>Applicant Classification</label>
              <select value={formData.applicant_type} onChange={(e) => setFormData({...formData, applicant_type: e.target.value})} 
                className="p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/30" style={inputStyle}>
                <option value="commercial_entity">Commercial / Corporate Entity</option>
                <option value="registered_ayush_practitioner">Registered Ayush Practitioner (Vaidya/Hakim)</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold" style={labelStyle}>Statutory Purpose</label>
              <select value={formData.purpose} onChange={(e) => setFormData({...formData, purpose: e.target.value})} 
                className="p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/30" style={inputStyle}>
                <option value="commercial_utilization">Commercial Manufacturing (Form 9)</option>
                <option value="ipr_licensing">IPR / Patent Licensing (Form 8)</option>
              </select>
            </div>
          </div>

          <div className="p-5 rounded-xl mb-6"
            style={{ background: '#faf9f6', border: '1px solid #e8e5df' }}
          >
            {formData.purpose === 'commercial_utilization' ? (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold" style={labelStyle}>Gross Ex-Factory Sales (INR)</label>
                <input type="number" value={formData.gross_annual_sales_inr} onChange={(e) => setFormData({...formData, gross_annual_sales_inr: e.target.value})} placeholder="e.g. 45000000" className="p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/30" style={{...inputStyle, background: '#ffffff'}} required />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2"><label className="text-sm font-semibold" style={labelStyle}>Upfront Fee (INR)</label><input type="number" value={formData.upfront_licensing_fee_inr} onChange={(e) => setFormData({...formData, upfront_licensing_fee_inr: e.target.value})} className="p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/30" style={{...inputStyle, background: '#ffffff'}} /></div>
                <div className="flex flex-col gap-2"><label className="text-sm font-semibold" style={labelStyle}>Annual Royalty (INR)</label><input type="number" value={formData.annual_royalty_inr} onChange={(e) => setFormData({...formData, annual_royalty_inr: e.target.value})} className="p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500/30" style={{...inputStyle, background: '#ffffff'}} /></div>
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} 
            className="w-full py-3 rounded-md font-semibold text-sm transition-all shadow-sm disabled:opacity-50"
            style={{ 
              background: 'var(--color-accent)',
              color: 'var(--color-accent-text-on-dark)'
            }}
          >
            {loading ? 'Computing Liability...' : 'Calculate Liability'}
          </button>
        </form>
      </div>

      {result && !error && (
        <div className="rounded-2xl p-6"
          style={result.is_exempt 
            ? { background: 'rgba(42, 107, 110, 0.08)', border: '1px solid rgba(42, 107, 110, 0.2)' }
            : { background: '#ffffff', border: '1px solid #e5e2dc', boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)' }
          }
        >
          <div className="flex flex-col items-center text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-wider mb-2" 
              style={{ color: result.is_exempt ? '#2a6b6e' : '#9a9590' }}>
              Mandatory Royalty Fee
            </span>
            <div className="text-4xl md:text-5xl font-black"
              style={{ color: result.is_exempt ? '#2a6b6e' : '#b87333' }}>
              {result.is_exempt 
                ? "₹ 0" 
                : result.calculated_abs_fee_inr === result.calculated_max_fee_inr
                  ? formatINR(result.calculated_abs_fee_inr)
                  : `${formatINR(result.calculated_abs_fee_inr)} - ${formatINR(result.calculated_max_fee_inr)}`
              }
            </div>
            <span className="text-sm font-medium mt-2" style={{ color: '#9a9590' }}>{result.applied_rate_description}</span>
          </div>
          <div className="space-y-3 pt-6" style={{ borderTop: '1px solid #e8e5df' }}>
            {result.statutory_reality_check.map((check, idx) => (
              <div key={idx} className="flex gap-3 text-sm" style={{ color: '#4a4540' }}>
                <span style={{ color: '#b87333' }}>✦</span>{check}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}