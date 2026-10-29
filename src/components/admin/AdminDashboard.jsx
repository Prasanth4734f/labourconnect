import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  HardHat, 
  Truck, 
  TrendingUp, 
  CheckCircle2, 
  FileCheck2 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AdminDashboard() {
  const [pendingVerifications, setPendingVerifications] = useState([
    {
      id: 'v-1',
      name: 'Ramu Bar Bender Gang (8 Workers)',
      role: 'Bar Bending & RCC Shuttering',
      city: 'Bengaluru Zone',
      docType: 'Aadhaar Card + PWD Subcontract Experience Certificate (7 yrs)'
    },
    {
      id: 'v-2',
      name: 'Er. Sandeep Joshi, B.E Civil',
      role: 'Structural Consultant',
      city: 'Hyderabad',
      docType: 'COA/2019/91420 + GHMC Licensed Surveyor'
    }
  ]);

  const handleApprove = (id) => {
    setPendingVerifications(pendingVerifications.filter(p => p.id !== id));
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="lc-card lc-card-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(168, 85, 247, 0.2)',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#c084fc'
          }}>
            <ShieldCheck style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
              LabourConnect 2.0 • Master Admin & Operations
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Ecosystem metrics, worker background verification queues, and escrow safety governance.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="lc-grid-4">
        <div className="lc-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontFamily: 'monospace' }}>Total Workers</div>
          <div className="text-mono" style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fbbf24', margin: '4px 0' }}>1,480+</div>
          <div style={{ fontSize: '0.75rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp style={{ width: '13px', height: '13px' }} /> +64 this week
          </div>
        </div>

        <div className="lc-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontFamily: 'monospace' }}>Active Duplex Sites</div>
          <div className="text-mono" style={{ fontSize: '1.8rem', fontWeight: 900, color: '#38bdf8', margin: '4px 0' }}>86 Sites</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>100% Escrow Protected</div>
        </div>

        <div className="lc-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontFamily: 'monospace' }}>Total Escrow Volume</div>
          <div className="text-mono" style={{ fontSize: '1.8rem', fontWeight: 900, color: '#34d399', margin: '4px 0' }}>₹4.82 Cr</div>
          <div style={{ fontSize: '0.75rem', color: '#34d399' }}>Zero Disputes</div>
        </div>

        <div className="lc-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontFamily: 'monospace' }}>Heavy Machinery Fleet</div>
          <div className="text-mono" style={{ fontSize: '1.8rem', fontWeight: 900, color: '#c084fc', margin: '4px 0' }}>42 Units</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>JCBs, Mixers & Towers</div>
        </div>
      </div>

      {/* Verification Queue */}
      <div className="lc-card">
        <h3 className="lc-card-title" style={{ marginBottom: '18px' }}>
          <FileCheck2 style={{ width: '18px', height: '18px', color: '#fbbf24' }} /> Pending Worker & Engineer Verification Queue
        </h3>

        {pendingVerifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '0.85rem' }}>
            <CheckCircle2 style={{ width: '32px', height: '32px', color: '#34d399', margin: '0 auto 8px' }} />
            All verification queues are completely clear!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingVerifications.map(item => (
              <div 
                key={item.id}
                style={{
                  background: '#0a0e1a',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>{item.name}</h4>
                    <span className="lc-badge lc-badge-amber">{item.role}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Location: {item.city}</div>
                  <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'monospace', marginTop: '2px' }}>Document: {item.docType}</div>
                </div>

                <button 
                  onClick={() => handleApprove(item.id)}
                  className="lc-btn lc-btn-primary lc-btn-sm"
                >
                  <CheckCircle2 style={{ width: '14px', height: '14px' }} /> Approve & Verify
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
