import React, { useState } from 'react';
import { 
  Truck, 
  Calendar, 
  CheckCircle2, 
  MapPin, 
  ChevronRight, 
  X 
} from 'lucide-react';
import { EQUIPMENT_RENTALS } from '../../data/mockData';
import confetti from 'canvas-confetti';

export default function EquipmentMarketplace() {
  const [bookingItem, setBookingItem] = useState(null);
  const [bookingDays, setBookingDays] = useState('3');
  const [operatorOption, setOperatorOption] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleBook = (e) => {
    e.preventDefault();
    setBookingSuccess(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });

    setTimeout(() => {
      setBookingSuccess(false);
      setBookingItem(null);
    }, 2000);
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
            background: 'rgba(245, 158, 11, 0.2)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fbbf24'
          }}>
            <Truck style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
              Heavy Construction Machinery & Tools Rental
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Book JCB earthmovers, hydraulic concrete mixer towers, high-frequency needle vibrators, and heavy-duty steel scaffolding with site delivery.
            </p>
          </div>
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="lc-grid-2">
        {EQUIPMENT_RENTALS.map(item => (
          <div key={item.id} className="lc-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', height: '200px', marginBottom: '16px' }}>
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(7, 10, 18, 0.85)',
                  backdropFilter: 'blur(8px)',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#fbbf24',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  {item.type}
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  background: 'rgba(16, 185, 129, 0.9)',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: '#070a12'
                }}>
                  ✓ {item.status}
                </div>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>
                {item.name}
              </h3>

              <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                <MapPin style={{ width: '12px', height: '12px' }} /> {item.location}
              </div>

              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', background: '#0a0e1a', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '16px' }}>
                <strong style={{ color: '#ffffff' }}>Tech Specs: </strong> {item.specs}
              </p>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontFamily: 'monospace' }}>Daily Rental Rate</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', fontFamily: 'monospace' }}>
                  ₹{item.dailyRate.toLocaleString()} <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 'normal' }}>/ day</span>
                </div>
              </div>

              <button 
                onClick={() => setBookingItem(item)}
                className="lc-btn lc-btn-primary lc-btn-sm"
              >
                <span>Book Machinery</span>
                <ChevronRight style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {bookingItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="lc-card" style={{ maxWidth: '440px', width: '100%', position: 'relative' }}>
            <button 
              onClick={() => setBookingItem(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>
              Reserve Machinery
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600, marginBottom: '16px' }}>
              {bookingItem.name}
            </p>

            <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="lc-form-group" style={{ marginBottom: 0 }}>
                <label className="lc-label">Rental Duration (Days)</label>
                <input 
                  type="number"
                  min="1"
                  max="30"
                  value={bookingDays}
                  onChange={(e) => setBookingDays(e.target.value)}
                  className="lc-input text-mono"
                  required
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#0a0e1a', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', color: '#cbd5e1' }}>
                <span>Include Certified Machinery Operator</span>
                <input 
                  type="checkbox"
                  checked={operatorOption}
                  onChange={(e) => setOperatorOption(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#f59e0b' }}
                />
              </label>

              <div style={{ background: '#0a0e1a', padding: '14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Rental Estimate:</span>
                <strong className="text-mono" style={{ fontSize: '1.1rem', color: '#34d399' }}>
                  ₹{(bookingItem.dailyRate * Number(bookingDays)).toLocaleString()}
                </strong>
              </div>

              {bookingSuccess ? (
                <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', color: '#34d399', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 style={{ width: '16px', height: '16px' }} />
                  <span>Equipment booked! Dispatch team will coordinate delivery.</span>
                </div>
              ) : (
                <button type="submit" className="lc-btn lc-btn-primary" style={{ width: '100%', marginTop: '6px' }}>
                  <Calendar style={{ width: '16px', height: '16px' }} /> Confirm Machinery Rental
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
