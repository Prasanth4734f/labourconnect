import React, { useState, useRef, useEffect } from 'react';
import { getRoleProfile } from '../../utils/rbac';

export default function Header({
  activeNav,
  setActiveNav,
  unreadNotifications = 3,
  onOpenNotifications,
  onOpenProfile,
  currentUserRole = 'Customer',
  onOpenAuthModal
}) {
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const profile = getRoleProfile(currentUserRole);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowMoreDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = profile.navItems || [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'projects', label: 'Projects', icon: '🏗️' },
    { id: 'marketplace', label: 'Marketplace', icon: '🔎' },
    { id: 'messages', label: 'Messages', icon: '💬' },
    { id: 'more', label: 'More', icon: '☰' }
  ];

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Brand Logo */}
        <div 
          className="brand-logo" 
          onClick={() => setActiveNav('home')}
          style={{ cursor: 'pointer' }}
        >
          <div className="brand-icon">
            <span style={{ fontSize: '1.25rem' }}>🏗️</span>
          </div>
          <div className="brand-text">
            <span className="brand-title">LabourConnect</span>
            <span className="brand-badge">2.0</span>
          </div>
        </div>

        {/* Desktop-First Horizontal Navigation: 5 Clean Core Tabs */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`nav-tab ${isActive ? 'active' : ''}`}
              >
                <span className="nav-tab-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Notifications, Role Badge & Profile Avatar */}
        <div className="header-actions">
          {/* Notifications Button */}
          <button 
            className="action-icon-btn" 
            title="Notifications"
            onClick={onOpenNotifications}
            style={{ position: 'relative' }}
          >
            <span style={{ fontSize: '1.1rem' }}>🔔</span>
            {unreadNotifications > 0 && (
              <span 
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '8px',
                  height: '8px',
                  background: '#f59e0b',
                  borderRadius: '50%',
                  boxShadow: '0 0 8px #f59e0b'
                }}
              />
            )}
          </button>

          {/* Fast Switch Role / Auth Badge */}
          <button
            onClick={onOpenAuthModal}
            title={`Authorized as ${profile.name} (${profile.badge}) - Click to switch role`}
            style={{
              background: '#fef3c7',
              border: '1px solid #fde68a',
              color: '#b45309',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.2s'
            }}
          >
            <span>{profile.icon}</span>
            <span>{profile.badge}</span>
            <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>⇄</span>
          </button>

          {/* User Profile Avatar */}
          <button 
            className="action-icon-btn" 
            title={`User Profile (${profile.name})`}
            onClick={onOpenProfile}
            style={{
              background: `linear-gradient(135deg, ${profile.color || '#f59e0b'}, #d97706)`,
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.9rem',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '2px solid #ffffff',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          >
            {profile.initial || 'P'}
          </button>
        </div>
      </div>
    </header>
  );
}

