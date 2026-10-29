import React, { useState } from 'react';

export default function LaboursScreen({ workers, projects, onBookWorker }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [bookingModal, setBookingModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    project: 'Chennai Residence',
    service: 'Brickwork & Concrete Pour',
    date: '2026-10-12',
    duration: '5 days',
    gangSize: 'Gang of 8 Masons',
    notes: 'Require immediate foundation backfilling and ground floor column casting.'
  });

  const categories = [
    { id: 'all', label: 'All Trades' },
    { id: 'mason', label: 'Mason' },
    { id: 'carpenter', label: 'Carpenter' },
    { id: 'electrician', label: 'Electrician' },
    { id: 'plumber', label: 'Plumber' },
    { id: 'painter', label: 'Painter' },
    { id: 'welder', label: 'Welder' },
    { id: 'tile_worker', label: 'Tile Worker' },
    { id: 'general_labour', label: 'General Labour' }
  ];

  const filteredWorkers = workers.filter((w) => {
    if (selectedCategory === 'all') return true;
    return w.category === selectedCategory;
  });

  return (
    <div className="labours-screen" style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 0 60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Skilled Labour & Specialized Gangs
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
            Directly book verified masons, electricians, plumbers, shuttering crews & painters
          </p>
        </div>
      </div>

      {/* Categories Bar (Screen 20) */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '24px' }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              background: selectedCategory === cat.id ? '#f59e0b' : 'rgba(255, 255, 255, 0.04)',
              color: selectedCategory === cat.id ? '#080b11' : '#94a3b8',
              border: selectedCategory === cat.id ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.08)',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Workers Grid (Screen 20) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredWorkers.map((w) => (
          <div
            key={w.id}
            style={{
              background: '#101522',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, border-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            }}
          >
            {/* Top Info */}
            <div style={{ padding: '20px', display: 'flex', gap: '14px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <img
                src={w.avatar}
                alt={w.name}
                style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(245,158,11,0.3)' }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>{w.name}</h3>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>{w.trade}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{w.city} • ★ {w.rating} ({w.reviewsCount} reviews)</div>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                {w.skills.slice(0, 3).map((sk, i) => (
                  <span
                    key={i}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#cbd5e1',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.725rem'
                    }}
                  >
                    {sk}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0b0f19', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>DAILY RATE</span>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399' }}>₹{w.dailyRate}</span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}> / day</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>EXPERIENCE</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>{w.experienceYears} Years</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button
                  onClick={() => setSelectedWorker(w)}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    padding: '8px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  View Profile
                </button>
                <button
                  onClick={() => {
                    setSelectedWorker(w);
                    setBookingModal(true);
                  }}
                  style={{
                    flex: 1,
                    background: '#f59e0b',
                    border: 'none',
                    color: '#080b11',
                    padding: '8px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Request Worker
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Labour Profile Modal (Screen 21) */}
      {selectedWorker && !bookingModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div style={{ background: '#101522', width: '520px', borderRadius: '18px', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img src={selectedWorker.avatar} alt={selectedWorker.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{selectedWorker.name}</h3>
                  <div style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 600 }}>{selectedWorker.trade} • ★ {selectedWorker.rating}</div>
                </div>
              </div>
              <button onClick={() => setSelectedWorker(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '16px' }}>{selectedWorker.bio}</p>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '6px' }}>SKILLS & SPECIALIZATIONS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedWorker.skills.map((s, i) => (
                  <span key={i} style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
              <div style={{ background: '#0b0f19', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>COMPLETED</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{selectedWorker.completedJobs} Projects</div>
              </div>
              <div style={{ background: '#0b0f19', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>GANG CAPACITY</span>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fbbf24' }}>{selectedWorker.gangSize}</div>
              </div>
              <div style={{ background: '#0b0f19', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>STATUS</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399' }}>● Available</div>
              </div>
            </div>

            <button
              onClick={() => setBookingModal(true)}
              style={{ width: '100%', background: '#f59e0b', color: '#000', padding: '12px', borderRadius: '10px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              Request Worker / Gang
            </button>
          </div>
        </div>
      )}

      {/* Booking Request Modal (Screen 26) */}
      {bookingModal && selectedWorker && (
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
          <div style={{ background: '#101522', width: '500px', borderRadius: '18px', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
              Booking Request
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '16px' }}>
              Professional: <strong style={{ color: '#fff' }}>{selectedWorker.name}</strong> ({selectedWorker.trade})
            </p>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Project</label>
              <input
                type="text"
                value={bookingDetails.project}
                onChange={(e) => setBookingDetails({ ...bookingDetails, project: e.target.value })}
                style={{ width: '100%', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Start Date</label>
                <input
                  type="date"
                  value={bookingDetails.date}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, date: e.target.value })}
                  style={{ width: '100%', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Estimated Duration</label>
                <input
                  type="text"
                  value={bookingDetails.duration}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, duration: e.target.value })}
                  style={{ width: '100%', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Message / Site Scope</label>
              <textarea
                rows={3}
                value={bookingDetails.notes}
                onChange={(e) => setBookingDetails({ ...bookingDetails, notes: e.target.value })}
                style={{ width: '100%', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setBookingModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', padding: '8px 14px', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={() => {
                  onBookWorker({
                    workerName: selectedWorker.name,
                    trade: selectedWorker.trade,
                    ...bookingDetails
                  });
                  setBookingModal(false);
                  setSelectedWorker(null);
                  alert(`Booking request sent to ${selectedWorker.name}! Verified contractor contract generated in Bookings.`);
                }}
                style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
