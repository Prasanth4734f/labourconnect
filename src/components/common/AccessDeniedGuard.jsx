import React from 'react';
import { ShieldAlert, ArrowRight, Lock } from 'lucide-react';
import { getRoleProfile } from '../../utils/rbac';

export default function AccessDeniedGuard({
  requiredRole = 'Property Owner or Consulting Engineer',
  currentRole = 'Labour',
  actionName = 'create new architectural projects',
  onSwitchRole,
  onBack
}) {
  const profile = getRoleProfile(currentRole);

  return (
    <div
      style={{
        background: '#101522',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '16px',
        padding: '36px 24px',
        textAlign: 'center',
        maxWidth: '560px',
        margin: '40px auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(239, 68, 68, 0.08)'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          color: '#ef4444'
        }}
      >
        <Lock style={{ width: '26px', height: '26px' }} />
      </div>

      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
        Authorization Scope Restricted
      </div>

      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
        Area Restricted for {profile.badge}
      </h2>

      <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '24px' }}>
        Your current session as <strong>{profile.name} ({currentRole})</strong> is not authorized to {actionName}. This area is restricted to <strong>{requiredRole}</strong>.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              padding: '10px 18px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ← Return to Allowed Workspace
          </button>
        )}

        {onSwitchRole && (
          <button
            onClick={onSwitchRole}
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              border: 'none',
              color: '#080b11',
              padding: '10px 18px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Switch Role Perspective</span>
            <span>⇄</span>
          </button>
        )}
      </div>
    </div>
  );
}
