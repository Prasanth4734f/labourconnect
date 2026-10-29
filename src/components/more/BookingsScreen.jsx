import React, { useState } from 'react';

export default function BookingsScreen({ bookings = [] }) {
  const [activeTab, setActiveTab] = useState('confirmed');

  const defaultBookings = [
    {
      id: 'bk-1',
      professional: 'Ravi Kumar & Gang (10 Masons)',
      service: 'First Floor Column Casting & Slab Shuttering',
      project: 'Chennai Residence',
      date: '12 Oct 2026',
      duration: '5 Days',
      status: 'confirmed',
      amount: '₹55,000',
      escrowStatus: 'Locked in Escrow'
    },
    {
      id: 'bk-2',
      professional: 'Prabhu Heavy Earthmovers (JCB 3DX)',
      service: 'Basement Backfilling & Site Leveling',
      project: 'Chennai Residence',
      date: '14 Oct 2026',
      duration: '2 Days',
      status: 'confirmed',
      amount: '₹21,000',
      escrowStatus: 'Locked in Escrow'
    },
    {
      id: 'bk-3',
      professional: 'Er. Rajesh Varma, M.Tech',
      service: 'Pre-Pour Slab Rebar Inspection & Cube Test',
      project: 'Chennai Residence',
      date: '08 Oct 2026',
      duration: '1 Site Visit',
      status: 'pending',
      amount: '₹5,000',
      escrowStatus: 'Awaiting Acceptance'
    },
    {
      id: 'bk-4',
      professional: 'Nagaraju Master Mason Gang',
      service: 'Plinth Beam & Footing Casting',
      project: 'Chennai Residence',
      date: '24 Sep 2026',
      duration: '12 Days',
      status: 'completed',
      amount: '₹1,32,000',
      escrowStatus: 'Released to Worker'
    }
  ];

  const allBookings = [...bookings, ...defaultBookings];
  const filtered = allBookings.filter((b) => b.status === activeTab);

  return (
    <div className="bookings-screen" style={{ maxWidth: '1100px', margin: '0 auto', padding: '10px 0 60px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Bookings & Work Contracts
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
          Track hired contractors, specialized gangs, machinery bookings and stage escrow milestones
        </p>
      </div>

      {/* Tabs (Screen 27) */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
          { id: 'pending', label: 'Pending Requests' },
          { id: 'confirmed', label: 'Active & Confirmed' },
          { id: 'completed', label: 'Completed Jobs' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? '#f59e0b' : 'rgba(255, 255, 255, 0.04)',
              color: activeTab === tab.id ? '#080b11' : '#94a3b8',
              border: activeTab === tab.id ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.08)',
              padding: '8px 18px',
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

      {/* Bookings List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filtered.length === 0 ? (
          <div style={{ background: '#101522', padding: '40px', borderRadius: '16px', textAlign: 'center', color: '#94a3b8' }}>
            No {activeTab} bookings found.
          </div>
        ) : (
          filtered.map((b, idx) => (
            <div
              key={b.id || idx}
              style={{
                background: '#101522',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>{b.professional || b.workerName || b.equipmentName}</h3>
                  <span
                    style={{
                      background: b.status === 'confirmed' ? 'rgba(52, 211, 153, 0.15)' : b.status === 'pending' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                      color: b.status === 'confirmed' ? '#34d399' : b.status === 'pending' ? '#fbbf24' : '#94a3b8',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase'
                    }}
                  >
                    {b.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 600, marginBottom: '4px' }}>
                  {b.service || b.trade || 'Equipment Rental'} • {b.project}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  📅 Scheduled: {b.date} • Duration: {b.duration || `${b.days} days`}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>{b.amount || `₹${b.total?.toLocaleString('en-IN')}`}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '8px' }}>{b.escrowStatus || 'Stage Escrow Protected'}</div>
                <button
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  View Contract & Receipt
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
