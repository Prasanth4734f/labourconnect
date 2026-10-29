import React, { useState } from 'react';

export default function EquipmentScreen({ equipment, onBookEquipment }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [bookModal, setBookModal] = useState(false);
  const [rentalDays, setRentalDays] = useState(3);
  const [selectedDate, setSelectedDate] = useState('2026-10-14');

  return (
    <div className="equipment-screen" style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 0 60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Heavy Equipment & Machinery Rentals
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
            Rent JCB backhoes, mobile cranes, concrete mixers & scaffolding with verified operators
          </p>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {equipment.map((eq) => (
          <div
            key={eq.id}
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
            {/* Image */}
            <div style={{ height: '180px', width: '100%', position: 'relative' }}>
              <img src={eq.image} alt={eq.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(8, 11, 17, 0.85)',
                  backdropFilter: 'blur(6px)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#34d399',
                  border: '1px solid rgba(52, 211, 153, 0.3)'
                }}
              >
                ● {eq.status}
              </div>
            </div>

            {/* Details */}
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                {eq.type}
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
                {eq.name}
              </h3>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '10px' }}>
                Provider: <strong style={{ color: '#fff' }}>{eq.supplierName}</strong> • {eq.location}
              </div>
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '16px', flex: 1 }}>
                {eq.specs}
              </p>

              {/* Pricing Box */}
              <div style={{ background: '#0b0f19', padding: '12px 14px', borderRadius: '10px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>DAILY RENTAL RATE</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399' }}>₹{eq.dailyRate.toLocaleString('en-IN')}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}> / day</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>OPERATOR</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: eq.operatorIncluded ? '#fbbf24' : '#94a3b8' }}>
                    {eq.operatorIncluded ? '✓ Operator Included' : 'Self Operated'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedItem(eq);
                  setBookModal(true);
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
                Book Machinery & Site Delivery
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {bookModal && selectedItem && (
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
              Confirm Machinery Dispatch
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '16px' }}>
              Equipment: <strong style={{ color: '#fff' }}>{selectedItem.name}</strong>
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Start Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ width: '100%', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Days Needed</label>
                <input
                  type="number"
                  min="1"
                  value={rentalDays}
                  onChange={(e) => setRentalDays(Number(e.target.value))}
                  style={{ width: '100%', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff' }}
                />
              </div>
            </div>

            <div style={{ background: '#0b0f19', padding: '14px', borderRadius: '10px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Daily Rate:</span>
                <span style={{ fontSize: '0.85rem', color: '#fff' }}>₹{selectedItem.dailyRate} × {rentalDays} days</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '8px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>Total Estimated Rental:</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399' }}>₹{(selectedItem.dailyRate * rentalDays).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setBookModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', padding: '8px 14px', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={() => {
                  onBookEquipment({
                    equipmentName: selectedItem.name,
                    days: rentalDays,
                    date: selectedDate,
                    total: selectedItem.dailyRate * rentalDays
                  });
                  setBookModal(false);
                  alert(`Equipment ${selectedItem.name} scheduled for site delivery on ${selectedDate}!`);
                }}
                style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
