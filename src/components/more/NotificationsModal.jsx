import React from 'react';

export default function NotificationsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const notifications = [
    { id: 1, title: 'Engineer Inspection Passed', desc: 'Er. Rajesh Varma certified Ground Floor column alignment and cover blocks.', time: '15m ago', icon: '👷' },
    { id: 2, title: 'Material Dispatch Confirmed', desc: 'Sri Balaji Materials delivered 150 bags UltraTech 53 Grade Cement.', time: '1h ago', icon: '🚚' },
    { id: 3, title: 'Labour Booking Accepted', desc: 'Ravi Kumar confirmed booking for 12 Oct 2026.', time: '3h ago', icon: '🔨' },
    { id: 4, title: 'Stage 2 Escrow Released', desc: '₹6,75,000 released for plinth beam milestone completion.', time: '1d ago', icon: '💰' }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
    >
      <div style={{ background: '#101522', width: '480px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.12)', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>Notifications</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.1rem', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications.map((n) => (
            <div key={n.id} style={{ display: 'flex', gap: '12px', padding: '12px 14px', background: '#0b0f19', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: '1.4rem' }}>{n.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{n.title}</span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{n.time}</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{n.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
