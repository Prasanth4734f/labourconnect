import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Sun, Moon, Sunrise, Sunset } from 'lucide-react';

/**
 * TouchSensitiveLightingLine
 * Button-free, touch and drag-sensitive moving line for continuous architectural lighting mood.
 * Transitions smoothly from 06:00 AM Dawn to 12:00 PM Solar Noon to 17:45 PM Golden Hour to 22:00 PM Night.
 */
export default function TouchSensitiveLightingLine({
  solarTime = 17.75, // Decimal hours (6.0 to 22.0)
  onChange,
  accentColor = '#f59e0b'
}) {
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Compute time percentage (6.0 to 22.0 = 16 hours span)
  const minTime = 6.0;
  const maxTime = 22.0;
  const progressPercent = Math.max(0, Math.min(100, ((solarTime - minTime) / (maxTime - minTime)) * 100));

  // Determine current mood label & icon
  let moodLabel = 'Golden Hour Sunset';
  let moodIcon = <Sunset size={13} color="#f59e0b" />;
  let glowColor = 'rgba(245, 158, 11, 0.6)';

  if (solarTime <= 7.5) {
    moodLabel = 'Dawn / Sunrise';
    moodIcon = <Sunrise size={13} color="#fb923c" />;
    glowColor = 'rgba(251, 146, 60, 0.6)';
  } else if (solarTime > 7.5 && solarTime < 16.5) {
    moodLabel = 'Solar Midday Sun';
    moodIcon = <Sun size={13} color="#38bdf8" />;
    glowColor = 'rgba(56, 189, 248, 0.6)';
  } else if (solarTime >= 16.5 && solarTime <= 18.75) {
    moodLabel = 'Golden Hour Sunset';
    moodIcon = <Sunset size={13} color="#f59e0b" />;
    glowColor = 'rgba(245, 158, 11, 0.7)';
  } else {
    moodLabel = 'Architectural Night';
    moodIcon = <Moon size={13} color="#a855f7" />;
    glowColor = 'rgba(168, 85, 247, 0.6)';
  }

  // Format decimal time to 12-hour AM/PM string
  const hours = Math.floor(solarTime);
  const minutes = Math.round((solarTime - hours) * 60);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const formattedTime = `${displayHours}:${displayMinutes} ${period}`;

  // Update time based on clientX
  const updatePosition = useCallback((clientX) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newTime = minTime + ratio * (maxTime - minTime);
    if (onChange) {
      onChange(parseFloat(newTime.toFixed(2)));
    }
  }, [onChange]);

  // Pointer & Touch Handlers
  const handlePointerDown = (e) => {
    setIsDragging(true);
    updatePosition(e.clientX || (e.touches && e.touches[0].clientX));
  };

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      updatePosition(clientX);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging, updatePosition]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(10px)',
        padding: '8px 14px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        userSelect: 'none',
        width: '100%',
        maxWidth: '460px'
      }}
    >
      {/* Real-time Indicator Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '150px' }}>
        <div style={{ padding: '4px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)' }}>
          {moodIcon}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>
            {formattedTime}
          </span>
          <span style={{ fontSize: '0.62rem', fontWeight: 600, color: '#94a3b8' }}>
            {moodLabel}
          </span>
        </div>
      </div>

      {/* TOUCH-SENSITIVE CONTINUOUS MOVING LINE TRACK */}
      <div
        ref={trackRef}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        style={{
          position: 'relative',
          flex: 1,
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          cursor: isDragging ? 'grabbing' : 'pointer',
          touchAction: 'none'
        }}
        title="Touch or drag along this moving line to change solar daylight mood"
      >
        {/* Ambient Gradient Base Line */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '6px',
            borderRadius: '3px',
            background: 'linear-gradient(90deg, #f97316 0%, #38bdf8 30%, #facc15 65%, #ea580c 80%, #7c3aed 100%)',
            opacity: 0.85
          }}
        />

        {/* Dynamic Trail Glow Line */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: `${progressPercent}%`,
            height: '6px',
            borderRadius: '3px',
            boxShadow: `0 0 10px ${glowColor}`
          }}
        />

        {/* TOUCH-SENSITIVE MOVING VERTICAL LINE INDICATOR (TOUCH GLOW PUCK) */}
        <div
          style={{
            position: 'absolute',
            left: `${progressPercent}%`,
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'grab',
            transition: isDragging ? 'none' : 'left 0.1s ease'
          }}
        >
          {/* Vertical moving line pulse */}
          <div
            style={{
              width: '4px',
              height: '20px',
              background: '#FFFFFF',
              borderRadius: '2px',
              boxShadow: `0 0 12px ${glowColor}, 0 0 4px #FFFFFF`,
              border: '1px solid rgba(255, 255, 255, 0.9)'
            }}
          />
        </div>
      </div>
    </div>
  );
}
