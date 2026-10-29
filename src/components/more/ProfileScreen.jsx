import React from 'react';

export default function ProfileScreen({ onRoleChange }) {
  return (
    <div className="profile-screen" style={{ maxWidth: '900px', margin: '0 auto', padding: '10px 0 60px' }}>
      <div style={{ background: '#101522', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 800,
              color: '#000'
            }}
          >
            P
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>
              Prasanth Kumar
            </h1>
            <div style={{ fontSize: '0.9rem', color: '#34d399', fontWeight: 600 }}>
              Verified Property Owner / Customer
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Member since Sept 2026 • Chennai, Tamil Nadu
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#0b0f19', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>ACTIVE PROJECTS</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24' }}>2 Active</div>
          </div>
          <div style={{ background: '#0b0f19', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>TOTAL BUDGET MANAGED</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>₹1.27 Cr</div>
          </div>
          <div style={{ background: '#0b0f19', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>HIRED CONTRACTORS</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#818cf8' }}>14 Hired</div>
          </div>
        </div>

        {/* Switch Role */}
        <div style={{ background: '#0b0f19', padding: '20px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
            Platform Role Switcher
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '14px' }}>
            Change your account role to experience different platform portals:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['Customer', 'Engineer / Architect', 'Labour / Mason', 'Equipment Provider', 'Material Provider', 'Loan Provider'].map((r, i) => (
              <button
                key={i}
                onClick={() => onRoleChange && onRoleChange(r)}
                style={{
                  background: i === 0 ? '#f59e0b' : 'rgba(255,255,255,0.06)',
                  color: i === 0 ? '#000' : '#e2e8f0',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
