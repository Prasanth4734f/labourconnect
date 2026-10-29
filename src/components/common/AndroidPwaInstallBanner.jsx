import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Check, Sparkles, Share2 } from 'lucide-react';

/**
 * AndroidPwaInstallBanner
 * Provides a native Android & Web App install prompt banner and offline PWA capability.
 */
export default function AndroidPwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already running in standalone Android PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('📱 To install on Android:\n1. Tap the 3 dots (⋮) in Chrome browser.\n2. Tap "Add to Home screen" or "Install App".\n\nIt will install as a native Android full-screen app!');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || !showBanner) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        right: '20px',
        maxWidth: '520px',
        margin: '0 auto',
        zIndex: 9999,
        background: 'rgba(10, 15, 29, 0.95)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(56, 189, 248, 0.4)',
        borderRadius: '16px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.75)',
        animation: 'slideUp 0.3s ease-out',
        gap: '12px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            border: '1px solid #38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            flexShrink: 0
          }}
        >
          📱
        </div>

        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Install BuildMate App</span>
            <span style={{ background: '#38bdf8', color: '#080b11', fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
              Android & Web
            </span>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
            Fast full-screen 3D CAD & Walkthrough engine on your mobile
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={handleInstallClick}
          style={{
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            border: '1px solid #38bdf8',
            color: '#ffffff',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 4px 12px rgba(56, 189, 248, 0.35)'
          }}
        >
          <Download size={13} />
          <span>Install</span>
        </button>

        <button
          onClick={() => setShowBanner(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px'
          }}
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
