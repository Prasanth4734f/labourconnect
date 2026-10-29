import React, { useState } from 'react';

export default function EngineersScreen({ engineers, onBookConsultation }) {
  const [selectedEngineer, setSelectedEngineer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [consultModal, setConsultModal] = useState(false);
  const [consultDate, setConsultDate] = useState('2026-10-10');
  const [consultNotes, setConsultNotes] = useState('Need structural stability certificate and column layout review for 30x40 duplex.');

  const filteredEngineers = engineers.filter((eng) =>
    eng.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eng.speciality.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eng.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="engineers-screen" style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 0 60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Verified Consulting Engineers & Architects
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
            Hire PWD Grade-1 licensed structural engineers, COA architects & foundation specialists
          </p>
        </div>

        {/* Search */}
        <div
          style={{
            background: '#101522',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '280px'
          }}
        >
          <span style={{ color: '#94a3b8' }}>🔍</span>
          <input
            type="text"
            placeholder="Search by name, city, speciality..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.85rem', width: '100%' }}
          />
        </div>
      </div>

      {/* Engineers Grid (Screen 18) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
        {filteredEngineers.map((eng) => (
          <div
            key={eng.id}
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
            {/* Engineer Image */}
            <div style={{ height: '180px', width: '100%', position: 'relative' }}>
              <img
                src={eng.avatar}
                alt={eng.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(0,0,0,0.8)',
                  backdropFilter: 'blur(6px)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#fbbf24'
                }}
              >
                ★ {eng.rating} ({eng.reviewsCount})
              </div>
            </div>

            {/* Engineer Details */}
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                {eng.role}
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                {eng.name}
              </h3>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '10px' }}>
                {eng.company} • {eng.city}
              </div>
              <p style={{ fontSize: '0.825rem', color: '#cbd5e1', marginBottom: '14px', flex: 1 }}>
                {eng.speciality}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', background: '#0b0f19', padding: '10px 14px', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>CONSULTATION FEE</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34d399' }}>₹{eng.feePerSqft} / sq.ft</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>EXPERIENCE</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>{eng.experienceYears}+ Years</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setSelectedEngineer(eng)}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
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
                    setSelectedEngineer(eng);
                    setConsultModal(true);
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
                  Request Visit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Engineer Profile Modal (Screen 19) */}
      {selectedEngineer && !consultModal && (
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
          <div style={{ background: '#101522', width: '560px', borderRadius: '18px', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={selectedEngineer.avatar} alt={selectedEngineer.name} style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{selectedEngineer.name}</h3>
                  <div style={{ fontSize: '0.8rem', color: '#34d399' }}>✓ {selectedEngineer.licenseNo}</div>
                </div>
              </div>
              <button onClick={() => setSelectedEngineer(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ background: '#0b0f19', padding: '14px', borderRadius: '10px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>SPECIALIZATION</div>
              <div style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 600 }}>{selectedEngineer.speciality}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
              <div style={{ background: '#0b0f19', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>RATING</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fbbf24' }}>★ {selectedEngineer.rating}</div>
              </div>
              <div style={{ background: '#0b0f19', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>PROJECTS</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{selectedEngineer.completedProjects} Done</div>
              </div>
              <div style={{ background: '#0b0f19', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>STATUS</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34d399' }}>Available</div>
              </div>
            </div>

            <button
              onClick={() => setConsultModal(true)}
              style={{ width: '100%', background: '#f59e0b', color: '#000', padding: '12px', borderRadius: '10px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              Request Site Consultation
            </button>
          </div>
        </div>
      )}

      {/* Consultation Request Modal */}
      {consultModal && selectedEngineer && (
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
              Request Engineer Consultation
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '16px' }}>
              Consulting: {selectedEngineer.name}
            </p>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Preferred Inspection Date</label>
              <input
                type="date"
                value={consultDate}
                onChange={(e) => setConsultDate(e.target.value)}
                style={{ width: '100%', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Project Requirement / Inspection Scope</label>
              <textarea
                rows={3}
                value={consultNotes}
                onChange={(e) => setConsultNotes(e.target.value)}
                style={{ width: '100%', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setConsultModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', padding: '8px 14px', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={() => {
                  onBookConsultation({
                    engineer: selectedEngineer.name,
                    date: consultDate,
                    notes: consultNotes
                  });
                  setConsultModal(false);
                  setSelectedEngineer(null);
                  alert(`Consultation request sent to ${selectedEngineer.name}! You will receive confirmation via SMS.`);
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
