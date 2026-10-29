import React, { useState } from 'react';
import { 
  Search, 
  ShieldCheck, 
  Star, 
  MapPin, 
  HardHat, 
  Users, 
  Calendar, 
  CheckCircle2, 
  ChevronRight, 
  X 
} from 'lucide-react';
import { SKILLED_WORKERS } from '../../data/mockData';
import confetti from 'canvas-confetti';

const CATEGORIES = [
  { id: 'all', label: 'All Trades' },
  { id: 'mason', label: '🧱 Masons' },
  { id: 'electrician', label: '⚡ Electricians' },
  { id: 'plumber', label: '🚿 Plumbers' },
  { id: 'carpenter', label: '🪚 Carpenters' },
  { id: 'painter', label: '🎨 Painters' },
  { id: 'tile_worker', label: '📐 Tile Workers' },
  { id: 'bar_bender', label: '⛓️ Bar Benders' }
];

export default function LabourMarketplace({ onHireWorker }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [bookingWorker, setBookingWorker] = useState(null);
  const [bookingDays, setBookingDays] = useState('5');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const filteredWorkers = SKILLED_WORKERS.filter(worker => {
    const matchesCat = selectedCategory === 'all' || worker.category === selectedCategory;
    const matchesSearch = worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          worker.trade.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === 'all' || worker.city.toLowerCase().includes(selectedCity.toLowerCase());
    return matchesCat && matchesSearch && matchesCity;
  });

  const handleConfirmHire = (e) => {
    e.preventDefault();
    setBookingSuccess(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });

    if (onHireWorker && bookingWorker) {
      onHireWorker({
        worker: bookingWorker,
        startDate: bookingDate,
        days: bookingDays,
        totalAmount: bookingWorker.dailyRate * Number(bookingDays)
      });
    }

    setTimeout(() => {
      setBookingSuccess(false);
      setBookingWorker(null);
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
            background: 'rgba(99, 102, 241, 0.2)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#818cf8'
          }}>
            <HardHat style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
              Verified Construction Workers & Skilled Gangs
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Directly hire individual certified craftsmen or full 12-man masonry, plumbing, electrical & carpentry crews with transparent standard daily rates.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="lc-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', maxWidth: '100%' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`lc-btn lc-btn-sm ${selectedCategory === cat.id ? 'lc-btn-primary' : 'lc-btn-secondary'}`}
              style={{ fontSize: '0.78rem' }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ width: '15px', height: '15px', color: '#64748b', position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder="Search skill or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="lc-input"
              style={{ paddingLeft: '36px', paddingRight: '12px', fontSize: '0.82rem' }}
            />
          </div>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="lc-select"
            style={{ width: '130px', fontSize: '0.82rem', fontFamily: 'monospace' }}
          >
            <option value="all">All Cities</option>
            <option value="bengaluru">Bengaluru</option>
            <option value="chennai">Chennai</option>
            <option value="hyderabad">Hyderabad</option>
          </select>
        </div>
      </div>

      {/* Workers Grid */}
      <div className="lc-grid-3">
        {filteredWorkers.map(worker => (
          <div key={worker.id} className="lc-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {/* Profile Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={worker.avatar}
                    alt={worker.name}
                    style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.15)' }}
                  />
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>{worker.name}</h3>
                    <div style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 600 }}>{worker.trade}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <MapPin style={{ width: '12px', height: '12px' }} /> {worker.city}
                    </div>
                  </div>
                </div>

                <span className="lc-badge lc-badge-amber">
                  <Star style={{ width: '12px', height: '12px', fill: '#fbbf24' }} /> {worker.rating}
                </span>
              </div>

              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '14px' }}>
                {worker.bio}
              </p>

              {/* Skills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                {worker.skills.map((skill, idx) => (
                  <span key={idx} style={{ background: '#0a0e1a', color: '#94a3b8', fontSize: '0.7rem', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {skill}
                  </span>
                ))}
              </div>

              {/* Gang tag */}
              <div style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#38bdf8', padding: '8px 12px', borderRadius: '8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                <Users style={{ width: '14px', height: '14px' }} /> {worker.gangSize}
              </div>
            </div>

            {/* Bottom Row */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontFamily: 'monospace' }}>Daily Rate</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', fontFamily: 'monospace' }}>
                  ₹{worker.dailyRate.toLocaleString()} <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 'normal' }}>/ day</span>
                </div>
              </div>

              <button 
                onClick={() => setBookingWorker(worker)}
                className="lc-btn lc-btn-primary lc-btn-sm"
              >
                <span>Hire Now</span>
                <ChevronRight style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {bookingWorker && (
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
              onClick={() => setBookingWorker(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>
              Confirm Worker Booking
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600, marginBottom: '16px' }}>
              {bookingWorker.name} ({bookingWorker.trade} • ₹{bookingWorker.dailyRate}/day)
            </p>

            <form onSubmit={handleConfirmHire} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="lc-form-group" style={{ marginBottom: 0 }}>
                <label className="lc-label">Start Date</label>
                <input 
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="lc-input text-mono"
                  required
                />
              </div>

              <div className="lc-form-group" style={{ marginBottom: 0 }}>
                <label className="lc-label">Number of Days</label>
                <input 
                  type="number"
                  min="1"
                  max="60"
                  value={bookingDays}
                  onChange={(e) => setBookingDays(e.target.value)}
                  className="lc-input text-mono"
                  required
                />
              </div>

              <div style={{ background: '#0a0e1a', padding: '14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Booking Estimate:</span>
                <strong className="text-mono" style={{ fontSize: '1.1rem', color: '#34d399' }}>
                  ₹{(bookingWorker.dailyRate * Number(bookingDays)).toLocaleString()}
                </strong>
              </div>

              {bookingSuccess ? (
                <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', color: '#34d399', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 style={{ width: '16px', height: '16px' }} />
                  <span>Worker booked successfully! Added to your schedule.</span>
                </div>
              ) : (
                <button type="submit" className="lc-btn lc-btn-primary" style={{ width: '100%', marginTop: '6px' }}>
                  <Calendar style={{ width: '16px', height: '16px' }} /> Confirm & Hire Worker
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
