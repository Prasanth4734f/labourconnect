import React from 'react';

export default function PaymentsScreen() {
  return (
    <div className="payments-screen" style={{ maxWidth: '1100px', margin: '0 auto', padding: '10px 0 60px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Project Spending & Stage Escrow Ledger
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
          Full financial transparency with milestone-locked escrow payouts
        </p>
      </div>

      {/* Screen 35 Spending Summary */}
      <div style={{ background: 'linear-gradient(135deg, #101522 0%, #171f33 100%)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: '20px', padding: '28px', marginBottom: '32px' }}>
        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
          TOTAL CONSTRUCTION SPENT TO DATE
        </div>
        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#34d399', marginBottom: '24px' }}>
          ₹20,40,000
          <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 500, marginLeft: '12px' }}>of ₹32,40,000 total budget</span>
        </div>

        {/* 4 Spending Pillar Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div style={{ background: '#0b0f19', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>RAW MATERIALS</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>₹9.6 Lakh</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>47% of total spend</div>
          </div>
          <div style={{ background: '#0b0f19', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>LABOUR & MASONS</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fbbf24' }}>₹5.8 Lakh</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>28% of total spend</div>
          </div>
          <div style={{ background: '#0b0f19', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>EQUIPMENT RENTALS</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>₹2.4 Lakh</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>12% of total spend</div>
          </div>
          <div style={{ background: '#0b0f19', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>PERMITS & ENGINEER</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#818cf8' }}>₹2.6 Lakh</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>13% of total spend</div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div style={{ background: '#101522', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>
          Recent Escrow Tranches & Supplier Payments
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { title: 'UltraTech Cement 150 Bags Dispatch (Sri Balaji Materials)', date: 'Today, 10:30 AM', category: 'Materials', amount: '₹57,750', status: 'Paid via Escrow' },
            { title: 'Plinth Beam Completion Payout (Nagaraju Mason Gang)', date: '24 Sep 2026', category: 'Labour', amount: '₹6,75,000', status: 'Released on Milestone' },
            { title: 'Tata Tiscon 550D Rebar 4.2 Tonnes (Venkateshwara Steels)', date: '18 Sep 2026', category: 'Steel', amount: '₹2,87,700', status: 'Direct Bank NEFT' },
            { title: 'Foundation Soil Testing & Architect Fee (Er. Rajesh Varma)', date: '12 Sep 2026', category: 'Engineering', amount: '₹60,200', status: 'Certified Payout' }
          ].map((tx, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: '#0b0f19', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff' }}>{tx.title}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{tx.category} • {tx.date}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>{tx.amount}</div>
                <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600 }}>✓ {tx.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
