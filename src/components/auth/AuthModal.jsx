import React, { useState } from 'react';

export default function AuthModal({ isOpen, onClose, onRoleSelect, currentRole = 'Customer' }) {
  const [view, setView] = useState('role_selector'); // 'splash', 'login', 'signup', 'role_selector'
  const [selectedRole, setSelectedRole] = useState(currentRole);

  if (!isOpen) return null;

  const roles = [
    { id: 'Customer', label: 'Customer / Owner', desc: 'Planning to build an independent villa, duplex or commercial property', icon: '🏡' },
    { id: 'Engineer / Architect', label: 'Engineer / Architect', desc: 'Civil engineers, structural consultants & licensed architects', icon: '👷' },
    { id: 'Labour / Worker', label: 'Labour / Worker', desc: 'Master masons, electricians, plumbers, painters, carpenters & shuttering gangs', icon: '🔨' },
    { id: 'Equipment Provider', label: 'Equipment Provider', desc: 'JCBs, cranes, concrete mixers, scaffolding & heavy machinery owners', icon: '🚜' },
    { id: 'Material Provider', label: 'Material Provider', desc: 'Cement, steel rebar, red bricks, sand & tile wholesale distributors', icon: '🧱' },
    { id: 'Loan Provider', label: 'Loan Provider', desc: 'Banks, NBFCs & construction finance institutions', icon: '🏦' },
    { id: 'Admin', label: 'Platform Admin', desc: 'Ecosystem governance, provider verification approvals & system audit', icon: '🛡️' }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
    >
      <div
        style={{
          background: '#101522',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '20px',
          width: '560px',
          maxWidth: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(245, 158, 11, 0.1)',
          padding: '28px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
              {view === 'role_selector' ? 'Choose Your Platform Role' : view === 'login' ? 'Sign in to LabourConnect' : 'Create Account'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              {view === 'role_selector' ? 'Determines the personalized dashboards and tools available' : 'Build smarter. Build together.'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              color: '#94a3b8',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Role Selector (Screen 3) */}
        {view === 'role_selector' && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {roles.map((r) => {
                const isSelected = selectedRole === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    style={{
                      background: isSelected ? 'rgba(245, 158, 11, 0.12)' : '#0b0f19',
                      border: isSelected ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      transition: 'all 0.15s'
                    }}
                  >
                    <span style={{ fontSize: '1.6rem' }}>{r.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: isSelected ? '#fbbf24' : '#ffffff' }}>
                        {r.label}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                        {r.desc}
                      </div>
                    </div>
                    {isSelected && <span style={{ color: '#f59e0b', fontWeight: 800 }}>✓</span>}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                onRoleSelect(selectedRole);
                onClose();
              }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#080b11',
                border: 'none',
                padding: '12px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Continue as {selectedRole} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
