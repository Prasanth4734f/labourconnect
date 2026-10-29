import React, { useState } from 'react';

export default function LoanProvidersScreen({ loans }) {
  const [calcAmount, setCalcAmount] = useState(2500000);
  const [calcTenureYears, setCalcTenureYears] = useState(20);
  const [interestRate, setInterestRate] = useState(8.5);
  const [applyModal, setApplyModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  // EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const monthlyRate = interestRate / 12 / 100;
  const totalMonths = calcTenureYears * 12;
  const calculatedEmi = Math.round(
    (calcAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)
  );

  return (
    <div className="loans-screen" style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 0 60px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Construction Financing & Stage Escrow Loans
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
          Direct stage-wise bank disbursement tied directly to certified site milestone sign-offs
        </p>
      </div>

      {/* EMI Calculator Widget */}
      <div style={{ background: 'linear-gradient(135deg, #101522 0%, #171f33 100%)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: '18px', padding: '24px', marginBottom: '32px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '14px' }}>
          CONSTRUCTION LOAN ESTIMATOR
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr) 1.2fr', gap: '20px', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Loan Amount (₹)</label>
            <input
              type="number"
              step="100000"
              value={calcAmount}
              onChange={(e) => setCalcAmount(Number(e.target.value))}
              style={{ width: '100%', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px', color: '#fff', fontWeight: 700 }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Tenure (Years)</label>
            <input
              type="number"
              value={calcTenureYears}
              onChange={(e) => setCalcTenureYears(Number(e.target.value))}
              style={{ width: '100%', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px', color: '#fff', fontWeight: 700 }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Interest Rate (% p.a.)</label>
            <input
              type="number"
              step="0.05"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              style={{ width: '100%', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px', color: '#fff', fontWeight: 700 }}
            />
          </div>

          <div style={{ background: '#0b0f19', padding: '14px 20px', borderRadius: '12px', border: '1px solid rgba(52, 211, 153, 0.3)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.725rem', color: '#94a3b8', display: 'block' }}>ESTIMATED MONTHLY EMI</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399' }}>₹{calculatedEmi.toLocaleString('en-IN')}</span>
            <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>/ month</span>
          </div>
        </div>
      </div>

      {/* Loan Providers Grid (Screen 25) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
        {loans.map((ln) => (
          <div
            key={ln.id}
            style={{
              background: '#101522',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              transition: 'border-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>{ln.bankName}</h3>
              <span style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                {ln.tag}
              </span>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '16px' }}>{ln.loanType}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#0b0f19', padding: '12px', borderRadius: '10px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>INTEREST RATE</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fbbf24' }}>{ln.interestRate}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>MAX FUNDING</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34d399' }}>{ln.maxFunding}</div>
              </div>
            </div>

            <div style={{ marginBottom: '14px', flex: 1 }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>ELIGIBILITY</span>
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{ln.eligibility}</p>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>DISBURSEMENT MODE</span>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{ln.disbursementMode}</p>
            </div>

            <button
              onClick={() => {
                setSelectedLoan(ln);
                setApplyModal(true);
              }}
              style={{
                width: '100%',
                background: '#f59e0b',
                color: '#080b11',
                border: 'none',
                padding: '10px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Apply for Pre-Approved Sanction
            </button>
          </div>
        ))}
      </div>

      {/* Apply Modal */}
      {applyModal && selectedLoan && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div style={{ background: '#101522', width: '480px', borderRadius: '18px', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
              Construction Loan Application
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '16px' }}>
              Lender: <strong style={{ color: '#fff' }}>{selectedLoan.bankName}</strong>
            </p>

            <div style={{ background: '#0b0f19', padding: '14px', borderRadius: '10px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '6px' }}>REQUIRED DOCUMENTS FOR SANCTION</div>
              <ul style={{ paddingLeft: '18px', fontSize: '0.8rem', color: '#cbd5e1' }}>
                {selectedLoan.docsRequired.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setApplyModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', padding: '8px 14px', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={() => {
                  setApplyModal(false);
                  alert(`Pre-approved application submitted to ${selectedLoan.bankName}! Stage escrow integration initialized.`);
                }}
                style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
