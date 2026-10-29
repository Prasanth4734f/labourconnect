import React, { useState } from 'react';
import { 
  HardHat, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Camera, 
  Package, 
  DollarSign, 
  ShieldCheck, 
  Plus, 
  FileText,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ContractorPortal({ projects = [], onAssignWorkers, onLogShift }) {
  const [activeTab, setActiveTab] = useState('muster'); // 'muster', 'site_task', 'material_indent', 'payouts'
  
  // 10-Man Gang Muster Roll Attendance State
  const [workersList, setWorkersList] = useState([
    { id: 'w-1', name: 'Ravi Kumar', trade: 'Master Mason / Gang Leader', rate: 1400, status: 'Present', checkIn: '08:30 AM' },
    { id: 'w-2', name: 'Murugan S.', trade: 'Senior Mason (Brickwork)', rate: 1200, status: 'Present', checkIn: '08:30 AM' },
    { id: 'w-3', name: 'Karthik V.', trade: 'Senior Mason (Plastering)', rate: 1200, status: 'Present', checkIn: '08:35 AM' },
    { id: 'w-4', name: 'Selvam P.', trade: 'Bar Bender (RCC Rebar)', rate: 1100, status: 'Present', checkIn: '08:30 AM' },
    { id: 'w-5', name: 'Prakash M.', trade: 'Bar Bender (Stirrups)', rate: 1100, status: 'Present', checkIn: '08:40 AM' },
    { id: 'w-6', name: 'Dinesh K.', trade: 'Carpenter (Shuttering Formwork)', rate: 1150, status: 'Present', checkIn: '08:30 AM' },
    { id: 'w-7', name: 'Mani R.', trade: 'Carpenter (Centering Props)', rate: 1150, status: 'Present', checkIn: '08:30 AM' },
    { id: 'w-8', name: 'Arun T.', trade: 'Helper / Concrete Mixer Hand', rate: 750, status: 'Present', checkIn: '08:30 AM' },
    { id: 'w-9', name: 'Suresh B.', trade: 'Helper / Rebar Carrier', rate: 750, status: 'Present', checkIn: '08:30 AM' },
    { id: 'w-10', name: 'Ganesh L.', trade: 'Helper / Mortar Transporter', rate: 750, status: 'Half-Day', checkIn: '08:30 AM' }
  ]);

  // Daily Site Task State
  const [taskDescription, setTaskDescription] = useState('First floor RCC slab shuttering alignment, steel bar binding with 12mm rebar, and cover block placement.');
  const [taskProgress, setTaskProgress] = useState(85);
  const [taskSuccess, setTaskSuccess] = useState(false);

  // Material Indent State
  const [indentCementBags, setIndentCementBags] = useState('80');
  const [indentSteelTons, setIndentSteelTons] = useState('1.5');
  const [indentSandUnits, setIndentSandUnits] = useState('200');
  const [indentSuccess, setIndentSuccess] = useState(false);

  // Calculate Daily Wage Total
  const totalPresent = workersList.filter(w => w.status === 'Present').length;
  const totalHalfDay = workersList.filter(w => w.status === 'Half-Day').length;
  const dailyWagePool = workersList.reduce((acc, w) => {
    if (w.status === 'Present') return acc + w.rate;
    if (w.status === 'Half-Day') return acc + (w.rate / 2);
    return acc;
  }, 0);

  const toggleWorkerStatus = (id, newStatus) => {
    setWorkersList(workersList.map(w => w.id === id ? { ...w, status: newStatus } : w));
  };

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    setTaskSuccess(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => setTaskSuccess(false), 3000);
  };

  const handleIndentSubmit = (e) => {
    e.preventDefault();
    setIndentSuccess(true);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    setTimeout(() => setIndentSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1320px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #0a1f18 0%, #102d23 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          padding: '28px 32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(16, 185, 129, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.4rem' }}>🔨</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Authorized Contractor & Gang Site Execution Workspace
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
            Ravi Kumar & Master Mason Gang (10-Man Crew)
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: '6px 0 0' }}>
            Daily gang muster roll attendance, photo-verified site task logs, daily material indents & weekly wage escrow releases.
          </p>
        </div>

        {/* Quick KPI stats */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '14px', padding: '12px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#10b981', textTransform: 'uppercase', fontWeight: 700 }}>Today's On-Site Gang</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', fontFamily: 'monospace' }}>
              {totalPresent + totalHalfDay} / 10 Active
            </div>
          </div>
          <div style={{ background: 'rgba(251, 191, 36, 0.12)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '14px', padding: '12px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 700 }}>Daily Wage Pool</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fbbf24', fontFamily: 'monospace' }}>
              ₹{dailyWagePool.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div 
        style={{
          display: 'flex',
          gap: '8px',
          background: '#0c101b',
          padding: '6px',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          overflowX: 'auto'
        }}
      >
        {[
          { id: 'muster', label: 'Daily Gang Muster Roll', icon: '👷', count: `${totalPresent} Present` },
          { id: 'site_task', label: 'Submit Daily Site Task Log', icon: '📸', count: 'Live Shift' },
          { id: 'material_indent', label: 'Daily Material Indent to Yard', icon: '🧱', count: 'Reorder' },
          { id: 'payouts', label: 'Wage Escrow Credits', icon: '💰', count: 'Verified' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                minWidth: '220px',
                padding: '12px 18px',
                borderRadius: '10px',
                border: 'none',
                background: isActive ? '#10b981' : 'transparent',
                color: isActive ? '#080b11' : '#94a3b8',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span 
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: isActive ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.06)',
                  color: isActive ? '#000000' : '#64748b'
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DAILY GANG MUSTER ROLL */}
      {activeTab === 'muster' && (
        <div style={{ background: '#101522', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Morning Shift Muster Roll Attendance (Site: Modern 3BHK Villa)
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0' }}>
                Toggle daily attendance for all 10 crew members. Automatically computes daily wage release to contractor bank escrow.
              </p>
            </div>
            <button
              onClick={() => {
                alert('Muster roll submitted for engineer & owner review!');
                confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
              }}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#080b11',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Lock & Submit Muster Roll 🔒
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            {workersList.map((worker) => (
              <div 
                key={worker.id}
                style={{
                  background: '#0b0f19',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '14px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>{worker.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>{worker.trade}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                    Wage: ₹{worker.rate}/day • In: {worker.checkIn}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  {['Present', 'Half-Day', 'Absent'].map((st) => (
                    <button
                      key={st}
                      onClick={() => toggleWorkerStatus(worker.id, st)}
                      style={{
                        background: worker.status === st 
                          ? (st === 'Present' ? '#10b981' : st === 'Half-Day' ? '#fbbf24' : '#ef4444')
                          : 'rgba(255,255,255,0.06)',
                        color: worker.status === st ? '#080b11' : '#94a3b8',
                        border: 'none',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SUBMIT DAILY SITE TASK LOG */}
      {activeTab === 'site_task' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 460px) 1fr', gap: '28px' }}>
          <div style={{ background: '#101522', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Camera style={{ color: '#10b981' }} /> Upload Daily Execution Photos & Progress
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '20px' }}>
              Upload geo-tagged shuttering & brickwork photos for structural engineer approval.
            </p>

            <form onSubmit={handleTaskSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                  Work Description & Member Details
                </label>
                <textarea
                  rows={3}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0b0f19',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                  Stage Completion: {taskProgress}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={taskProgress}
                  onChange={(e) => setTaskProgress(e.target.value)}
                  style={{ width: '100%', accentColor: '#10b981' }}
                />
              </div>

              {taskSuccess && (
                <div style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', borderRadius: '10px', padding: '12px', color: '#34d399', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 style={{ width: '18px', height: '18px' }} />
                  <span>Site task log submitted! Sent to Er. Rajesh Varma for inspection approval.</span>
                </div>
              )}

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#080b11',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Submit Daily Work Proof 📸
              </button>
            </form>
          </div>

          {/* Previous Task Proofs */}
          <div style={{ background: '#101522', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px' }}>
              Recently Verified Work Logs
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#0b0f19', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.9rem' }}>First Floor RCC Shuttering & Props</span>
                  <span style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 700 }}>✓ Verified by Engineer</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                  Acro props staging erected at 1m interval with plywood formwork oiling. Level checking completed with water tube.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MATERIAL INDENT */}
      {activeTab === 'material_indent' && (
        <div style={{ background: '#101522', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
            Daily Material Indent to Wholesale Supplier (Sri Balaji Materials)
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '24px' }}>
            Request bulk raw materials for tomorrow's shift directly from the authorized project storekeeper.
          </p>

          <form onSubmit={handleIndentSubmit} style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                  UltraTech 53G Cement Bags
                </label>
                <input
                  type="text"
                  value={indentCementBags}
                  onChange={(e) => setIndentCementBags(e.target.value)}
                  style={{ width: '100%', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.12)', padding: '10px 14px', color: '#ffffff', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                  Tata Tiscon Rebar (Tonnes)
                </label>
                <input
                  type="text"
                  value={indentSteelTons}
                  onChange={(e) => setIndentSteelTons(e.target.value)}
                  style={{ width: '100%', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.12)', padding: '10px 14px', color: '#ffffff', borderRadius: '8px' }}
                />
              </div>
            </div>

            {indentSuccess && (
              <div style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', borderRadius: '10px', padding: '12px', color: '#34d399', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 style={{ width: '18px', height: '18px' }} />
                <span>Indent dispatched to Sri Balaji Materials yard for morning 07:00 AM delivery!</span>
              </div>
            )}

            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#080b11',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Send Material Indent to Supplier 🚚
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: PAYOUTS */}
      {activeTab === 'payouts' && (
        <div style={{ background: '#101522', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', padding: '28px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
            Weekly Gang Wage Escrow Releases
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '24px' }}>
            Direct contractor wage tranches credited upon structural engineer milestone verification.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { id: 'pay-1', date: 'Yesterday', amount: '₹58,000', for: 'Week 4 Gang Muster & Column Casting Milestone', status: 'Credited to Bank Account' },
              { id: 'pay-2', date: '25 Sep 2026', amount: '₹62,500', for: 'Week 3 Plinth Beam & Foundation Shuttering', status: 'Credited to Bank Account' }
            ].map((p) => (
              <div key={p.id} style={{ background: '#0b0f19', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>{p.for}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.date} • {p.status}</div>
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#34d399', fontFamily: 'monospace' }}>
                  {p.amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
