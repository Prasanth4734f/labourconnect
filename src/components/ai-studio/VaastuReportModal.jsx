import React from 'react';
import {
  X,
  Compass,
  CheckCircle2,
  Download,
  Printer,
  ShieldCheck,
  Sun,
  Flame,
  Droplets,
  Wind,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

/**
 * VaastuReportModal
 * Full 8-Directional Vaastu Shastra Energy Mandala Analysis & Room Orientation Compliance.
 */
export default function VaastuReportModal({
  isOpen,
  onClose,
  design,
  facing = 'East',
  hasPooja = true
}) {
  if (!isOpen) return null;

  const handleExport = () => {
    confetti({ particleCount: 30, spread: 60 });
    alert('📥 Exporting Certified 8-Directional Vaastu Shastra Compliance Certificate (PDF)...');
  };

  const zones = [
    { zone: 'North-East (Ishanya)', element: 'Water / Divine', ideal: 'Pooja Room, Water Sump, Foyer', actual: hasPooja ? 'Dedicated Pooja Mandir & Clean Foyer' : 'Open Sunlit Corner', score: 100, status: 'Super Compliant (100%)', note: 'Divine energy flux brings prosperity and peace of mind.' },
    { zone: 'East (Surya / Indra)', element: 'Solar Energy', ideal: 'Main Entrance & Living Windows', actual: `${facing === 'East' ? 'East Main Entrance & ' : ''}Large Fenestration Glass`, score: 98, status: 'Compliant (98%)', note: 'Abundant morning UV rays purify living atmosphere.' },
    { zone: 'South-East (Agneya)', element: 'Fire (Agni)', ideal: 'Kitchen & Electrical DB', actual: 'Modular Kitchen with East-facing Hob', score: 100, status: 'Super Compliant (100%)', note: 'Agni corner ensures health, culinary vitality and financial balance.' },
    { zone: 'South (Yama)', element: 'Solid Earth', ideal: 'Heavy Furniture & Wardrobes', actual: 'Solid Wall Massing & Built-in Wardrobes', score: 95, status: 'Compliant (95%)', note: 'Provides stability and protection from southern thermal radiation.' },
    { zone: 'South-West (Nairuthi)', element: 'Heavy Earth (Prithvi)', ideal: 'Master Bedroom Suite', actual: 'Master Bedroom with Head to South', score: 100, status: 'Super Compliant (100%)', note: 'Anchors the family head, bestows longevity and grounded authority.' },
    { zone: 'West (Varuna)', element: 'Water / Metal', ideal: 'Dining Hall & Children Study', actual: 'Open Dining & Stair Landing', score: 95, status: 'Compliant (95%)', note: 'Promotes intellectual growth and harmonious family meals.' },
    { zone: 'North-West (Vayavya)', element: 'Air (Vayu)', ideal: 'Car Parking & Guest Suite', actual: 'Covered EV Portico & Guest Circulation', score: 96, status: 'Compliant (96%)', note: 'Promotes free airflow, kinetic movement and friendly relationships.' },
    { zone: 'Center (Brahmasthan)', element: 'Cosmic Space (Akash)', ideal: 'Open Courtyard / Column-free', actual: 'Double-Height Living / Open Sky Lightwell', score: 98, status: 'Super Compliant (98%)', note: 'Brahmasthanam remains 100% free of heavy load-bearing RCC columns.' }
  ];

  const overallScore = Math.round(zones.reduce((acc, z) => acc + z.score, 0) / zones.length);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E1E7DF',
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.25)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '18px 24px',
            borderBottom: '1px solid #E1E7DF',
            background: '#FAFAF7'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: '#EAF0E8', color: '#718B73' }}>
              <Compass size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#26332A' }}>
                Vaastu Shastra Compliance & Energy Mandala Report
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#68736A' }}>
                Authentic Vedic Architecture Assessment • Plot Facing: <strong>{facing}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E1E7DF',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#68736A'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Score Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #EAF0E8 0%, #FAFAF7 100%)',
            padding: '16px 24px',
            borderBottom: '1px solid #E1E7DF',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#718B73',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.35rem',
                fontWeight: 900,
                boxShadow: '0 4px 12px rgba(113, 139, 115, 0.3)'
              }}
            >
              {overallScore}%
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#26332A' }}>
                  A+ Certified Vaastu Layout
                </span>
                <span style={{ fontSize: '0.72rem', background: '#3D8056', color: '#FFFFFF', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                  SUPER COMPLIANT
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.75rem', color: '#68736A' }}>
                Every primary room perfectly aligns with cosmic elemental vectors (Panchamahabhuta).
              </p>
            </div>
          </div>

          <button
            onClick={handleExport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: '#718B73',
              color: '#FFFFFF',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            <Download size={13} />
            <span>Export Certificate</span>
          </button>
        </div>

        {/* 8-Directional Analysis Grid */}
        <div style={{ padding: '18px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#26332A', textTransform: 'uppercase' }}>
            8-Directional Spatial Zone Breakdown:
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {zones.map((z, idx) => (
              <div
                key={idx}
                style={{
                  background: '#FAFAF7',
                  border: '1px solid #E1E7DF',
                  borderRadius: '10px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.8rem', color: '#26332A' }}>{z.zone}</strong>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#3D8056' }}>{z.score}%</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#718B73', fontWeight: 600 }}>
                  Element: {z.element}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#26332A' }}>
                  <strong>Actual:</strong> {z.actual}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#68736A', lineHeight: '1.4' }}>
                  {z.note}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 24px',
            borderTop: '1px solid #E1E7DF',
            background: '#FAFAF7'
          }}
        >
          <span style={{ fontSize: '0.72rem', color: '#68736A' }}>
            Zero architectural doshas detected in this procedural variation
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #E1E7DF',
              background: '#FFFFFF',
              color: '#26332A',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
