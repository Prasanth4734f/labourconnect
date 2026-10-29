import React, { useState } from 'react';

export default function AdminDashboardScreen() {
  const [activeTab, setActiveTab] = useState('verification');

  const pendingVerifications = [
    { id: 'v-1', name: 'Er. Sandeep Reddy', role: 'Civil Engineer', doc: 'PWD License & COA Cert', date: 'Today', status: 'Pending Review' },
    { id: 'v-2', name: 'Balaji Machine Tools', role: 'Equipment Provider', doc: 'GSTIN & Fleet Insurance', date: 'Yesterday', status: 'Pending Review' },
    { id: 'v-3', name: 'Praveen Master Mason', role: 'Mason Gang (12)', doc: 'Aadhaar & Past 5 Projects', date: '02 Oct 2026', status: 'Pending Review' }
  ];

  return (
    <div className="admin-dashboard-screen" style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 0 60px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
          PLATFORM GOVERNANCE
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '4px' }}>
          LabourConnect Admin Command Center
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
          Manage platform verification, contractor licenses, complaints moderation & platform metrics
        </p>
      </div>

      {/* Screen 37 Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#101522', padding: '20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>TOTAL REGISTERED USERS</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>12,840</div>
          <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '4px' }}>↑ +142 this week</div>
        </div>
        <div style={{ background: '#101522', padding: '20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>VERIFIED WORKERS & GANGS</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>3,420</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Across 8 trades</div>
        </div>
        <div style={{ background: '#101522', padding: '20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>CONSULTING ENGINEERS</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>824</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>PWD / COA Verified</div>
        </div>
        <div style={{ background: '#101522', padding: '20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>ACTIVE PROJECTS ON SITE</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>1,284</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>₹148 Cr escrow value</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { id: 'verification', label: 'License Verification Queue (3)' },
          { id: 'complaints', label: 'Disputes & Escrow Holds' },
          { id: 'analytics', label: 'Platform Analytics' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? '#f59e0b' : 'rgba(255, 255, 255, 0.04)',
              color: activeTab === tab.id ? '#080b11' : '#94a3b8',
              border: activeTab === tab.id ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.08)',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Verification Queue */}
      {activeTab === 'verification' && (
        <div style={{ background: '#101522', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingVerifications.map((v) => (
              <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#0b0f19', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>{v.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#f59e0b' }}>{v.role} • Documents: {v.doc}</div>
                  <div style={{ fontSize: '0.725rem', color: '#64748b' }}>Submitted: {v.date}</div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => alert(`Verified ${v.name} successfully!`)}
                    style={{ background: '#34d399', color: '#000', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    ✓ Approve & Verify
                  </button>
                  <button
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Inspect Docs
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div style={{ background: '#101522', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', color: '#94a3b8' }}>
          <h3 style={{ color: '#fff', marginBottom: '10px' }}>Real-time Construction Activity Index</h3>
          <p>Total Material Volume Dispatched Today: 4,200 Bags Cement, 48 Tonnes TMT Steel across Tamil Nadu & Karnataka.</p>
        </div>
      )}
    </div>
  );
}
