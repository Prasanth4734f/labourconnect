import React, { useState } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  Download, 
  Calculator, 
  ShieldCheck, 
  Sparkles, 
  FileSpreadsheet,
  ArrowRight,
  Clock,
  Landmark,
  FileText,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { BANK_LOANS } from '../../data/mockData';
import confetti from 'canvas-confetti';

export default function BankLoanPortal({ initialBoq = 4020000, onApproveTranche, onRejectTranche }) {
  const [activeTab, setActiveTab] = useState('tranches'); // 'tranches', 'calculator', 'schemes', 'valuation'
  const [projectCost, setProjectCost] = useState(initialBoq);
  const [landValue, setLandValue] = useState(3000000);
  const [loanTenureYears, setLoanTenureYears] = useState(20);
  const [selectedBank, setSelectedBank] = useState(BANK_LOANS[0]);
  const [sanctionGenerated, setSanctionGenerated] = useState(false);

  // Active Tranche Requests from Sites
  const [trancheRequests, setTrancheRequests] = useState([
    {
      id: 'TR-103',
      borrower: 'Prasanth Kumar',
      project: 'Modern 3BHK Residence (Velachery)',
      sanctionTotal: '₹35,00,000',
      disbursedSoFar: '₹14,00,000 (40%)',
      requestedStage: 'Tranche 3: First Floor RCC Slab Completion',
      requestAmount: 700000,
      engineerLogStatus: 'Certified by Er. Rajesh Varma (SE/GR-I/CMDA)',
      inspectionDate: 'Today, 10:15 AM',
      ltv: '68% Loan to Value (Safe Margin)',
      status: 'Pending Valuation Sign-off'
    },
    {
      id: 'TR-102',
      borrower: 'Dr. Vivek Menon',
      project: 'Glass Minimalist Duplex (Sholinganallur)',
      sanctionTotal: '₹55,00,000',
      disbursedSoFar: '₹22,00,000 (40%)',
      requestedStage: 'Tranche 2: Plinth Beam & DPC Level',
      requestAmount: 1100000,
      engineerLogStatus: 'Certified by Er. Sandeep Joshi',
      inspectionDate: 'Yesterday',
      ltv: '65% Loan to Value',
      status: 'Ready for Escrow Credit'
    }
  ]);

  // Financial Calculations
  const maxLoanEligible = Math.round(projectCost * 0.85);
  const annualInterestRate = parseFloat(selectedBank.interestRate || '8.5') / 100;
  const monthlyRate = annualInterestRate / 12;
  const totalMonths = loanTenureYears * 12;
  const emi = Math.round(
    (maxLoanEligible * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)
  );

  const handleApproveTranche = (trancheId) => {
    setTrancheRequests(trancheRequests.map(t => t.id === trancheId ? { ...t, status: 'Disbursed into Project Escrow' } : t));
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    if (onApproveTranche) {
      const tranche = trancheRequests.find(t => t.id === trancheId);
      onApproveTranche({ amount: tranche?.requestAmount || 700000 });
    }
  };

  const handleGenerateSanction = () => {
    setSanctionGenerated(true);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1320px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #091c24 0%, #0e2b38 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(6, 182, 212, 0.35)',
          padding: '28px 32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(6, 182, 212, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.4rem' }}>🏦</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Authorized Bank Construction Finance & Escrow Desk
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
            Stage-Wise Construction Tranche & Underwriting Desk
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: '6px 0 0' }}>
            Automated milestone verification against licensed structural engineer site logs for risk-free escrow loan disbursements.
          </p>
        </div>

        {/* Quick KPI stats */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '14px', padding: '12px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#22d3ee', textTransform: 'uppercase', fontWeight: 700 }}>Pending Tranches</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', fontFamily: 'monospace' }}>2 Approvals</div>
          </div>
          <div style={{ background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '14px', padding: '12px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 700 }}>Sanction Portfolio</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#34d399', fontFamily: 'monospace' }}>₹90.0 Lakhs</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div 
        style={{
          display: 'flex',
          gap: '8px',
          background: '#0c101b',
          padding: '6px',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflowX: 'auto'
        }}
      >
        {[
          { id: 'tranches', label: 'Stage Tranche Disbursals', icon: '💳', count: `${trancheRequests.length} Pending` },
          { id: 'calculator', label: 'AI BOQ-Linked Loan Engine', icon: '🧮', count: '85% BOQ' },
          { id: 'schemes', label: 'Bank Construction Loan Schemes', icon: '🏛️', count: `${BANK_LOANS.length} Schemes` },
          { id: 'valuation', label: 'Valuation & Legal Reports', icon: '📑', count: '100% Clear' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                minWidth: '220px',
                padding: '12px 18px',
                borderRadius: '10px',
                border: 'none',
                background: isActive ? '#06b6d4' : 'transparent',
                color: isActive ? '#080b11' : '#94a3b8',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span 
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: isActive ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.06)',
                  color: isActive ? '#000000' : '#64748b'
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: STAGE TRANCHE DISBURSALS */}
      {activeTab === 'tranches' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
          {trancheRequests.map((tranche) => (
            <div
              key={tranche.id}
              style={{
                background: '#101522',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 12px 30px rgba(0,0,0,0.3)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span style={{ color: '#22d3ee', fontSize: '0.78rem', fontWeight: 800, fontFamily: 'monospace' }}>REQUEST #{tranche.id}</span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: '2px 0 0' }}>{tranche.borrower}</h3>
                  </div>
                  <span style={{ background: tranche.status.includes('Disbursed') ? 'rgba(52, 211, 153, 0.2)' : 'rgba(251, 191, 36, 0.15)', color: tranche.status.includes('Disbursed') ? '#34d399' : '#fbbf24', fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                    ● {tranche.status}
                  </span>
                </div>

                <div style={{ background: '#0b0f19', borderRadius: '12px', padding: '14px', marginBottom: '14px', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                  <div><strong>Site:</strong> {tranche.project}</div>
                  <div><strong>Milestone:</strong> {tranche.requestedStage}</div>
                  <div><strong>Engineer Certificate:</strong> <span style={{ color: '#34d399' }}>✓ {tranche.engineerLogStatus}</span></div>
                  <div><strong>Risk Matrix:</strong> {tranche.ltv}</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>REQUESTED TRANCHE</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#22d3ee', fontFamily: 'monospace' }}>
                      ₹{tranche.requestAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>TOTAL SANCTION</span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>{tranche.sanctionTotal}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  disabled={tranche.status.includes('Disbursed')}
                  onClick={() => handleApproveTranche(tranche.id)}
                  style={{
                    flex: 1,
                    background: tranche.status.includes('Disbursed') ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #06b6d4, #0891b2)',
                    color: tranche.status.includes('Disbursed') ? '#94a3b8' : '#080b11',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: tranche.status.includes('Disbursed') ? 'default' : 'pointer'
                  }}
                >
                  {tranche.status.includes('Disbursed') ? '✓ Disbursed into Escrow' : 'Approve & Release Tranche to Escrow 💳'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: AI BOQ-LINKED LOAN ENGINE */}
      {activeTab === 'calculator' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 460px) 1fr', gap: '28px' }}>
          <div style={{ background: '#101522', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calculator style={{ color: '#06b6d4' }} /> Construction Loan Underwriting Engine
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '20px' }}>
              Values linked directly from AI architectural BOQ estimates.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                  Architectural BOQ Construction Cost (₹)
                </label>
                <input
                  type="number"
                  value={projectCost}
                  onChange={(e) => setProjectCost(Number(e.target.value))}
                  style={{ width: '100%', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.12)', padding: '10px 14px', color: '#ffffff', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                  Land Valuation (₹)
                </label>
                <input
                  type="number"
                  value={landValue}
                  onChange={(e) => setLandValue(Number(e.target.value))}
                  style={{ width: '100%', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.12)', padding: '10px 14px', color: '#ffffff', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                  Tenure: {loanTenureYears} Years
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={loanTenureYears}
                  onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#06b6d4' }}
                />
              </div>

              {sanctionGenerated && (
                <div style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', borderRadius: '10px', padding: '12px', color: '#34d399', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 style={{ width: '18px', height: '18px' }} />
                  <span>AI Pre-Approved Sanction Letter generated for ₹{(maxLoanEligible / 100000).toFixed(2)} Lakhs!</span>
                </div>
              )}

              <button
                onClick={handleGenerateSanction}
                style={{
                  background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                  color: '#080b11',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Generate Official In-Principle Sanction 📜
              </button>
            </div>
          </div>

          {/* Right Summary */}
          <div style={{ background: '#101522', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px' }}>
                Pre-Approved Construction Loan Terms
              </h4>

              <div style={{ background: '#0b0f19', borderRadius: '14px', padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>MAX SANCTION (85% BOQ)</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#22d3ee', fontFamily: 'monospace' }}>
                    ₹{(maxLoanEligible / 100000).toFixed(2)} Lakhs
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>ESTIMATED MONTHLY EMI</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#34d399', fontFamily: 'monospace' }}>
                    ₹{emi.toLocaleString('en-IN')}/mo
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>INTEREST RATE</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>8.50% p.a. (Floating)</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>DISBURSEMENT MODE</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fbbf24' }}>Stage-wise Escrow</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
              💡 Construction loans disburse directly into the project escrow wallet stage-by-stage as certified by the licensed structural engineer.
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SCHEMES */}
      {activeTab === 'schemes' && (
        <div style={{ background: '#101522', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', padding: '28px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
            National Bank Construction Loan Schemes
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '24px' }}>
            Direct API integrated home construction finance schemes.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {BANK_LOANS.map((bank) => (
              <div 
                key={bank.id}
                style={{
                  background: '#0b0f19',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>{bank.bankName}</h4>
                  <div style={{ fontSize: '0.8rem', color: '#22d3ee', fontWeight: 600, marginBottom: '14px' }}>{bank.schemeName}</div>
                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '14px' }}>
                    <div>• Interest Rate: <strong>{bank.interestRate}</strong></div>
                    <div>• Max Funding: <strong>{bank.maxFunding}</strong></div>
                    <div>• Processing Fee: <strong>{bank.processingFee}</strong></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: VALUATION */}
      {activeTab === 'valuation' && (
        <div style={{ background: '#101522', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', padding: '28px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
            Chartered Engineer Valuation & Legal Title Files
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '24px' }}>
            Verified legal scrutiny documents and stage stability certificates.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { title: '30-Year Encumbrance Certificate (EC) - Clear Marketable Title', type: 'PDF • 4.2 MB', date: '05 Sep 2026', status: 'Title Clean' },
              { title: 'Bank Approved Valuer Stage 3 Site Assessment Certificate', type: 'PDF • 2.1 MB', date: 'Today', status: 'Approved for Disbursal' }
            ].map((v, i) => (
              <div key={i} style={{ background: '#0b0f19', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>{v.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{v.date} • {v.type}</div>
                </div>
                <span style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(52, 211, 153, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>
                  ✓ {v.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
