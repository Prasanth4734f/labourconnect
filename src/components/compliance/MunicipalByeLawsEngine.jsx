import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  FileCheck2, 
  CheckCircle2, 
  XCircle, 
  Download, 
  Sliders, 
  Maximize2, 
  Droplets, 
  Sun, 
  Car 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const MUNICIPAL_CORPORATIONS = [
  {
    id: 'bbmp',
    name: 'BBMP / BDA (Bengaluru)',
    state: 'Karnataka',
    ruleBook: 'BDA Master Plan 2015 & Revised Zonal Regulations (RZR)',
    baseFar: 1.75,
    maxGroundCoverage: 70,
    authorityLogo: '🏛️ BBMP'
  },
  {
    id: 'ghmc',
    name: 'GHMC / HMDA (Hyderabad)',
    state: 'Telangana',
    ruleBook: 'Telangana Building Rules (GO Ms. No. 168 & TG-bPASS)',
    baseFar: 2.00,
    maxGroundCoverage: 66.6,
    authorityLogo: '🏢 GHMC'
  },
  {
    id: 'cmda',
    name: 'CMDA / DTCP (Chennai & TN)',
    state: 'Tamil Nadu',
    ruleBook: 'Tamil Nadu Combined Development & Building Rules (TNCDBR 2019)',
    baseFar: 1.75,
    maxGroundCoverage: 70,
    authorityLogo: '🏛️ CMDA'
  },
  {
    id: 'nbc_india',
    name: 'National Building Code (NBC 2016)',
    state: 'All India Baseline',
    ruleBook: 'Bureau of Indian Standards (SP 7: 2016 Group 1 to 5)',
    baseFar: 1.75,
    maxGroundCoverage: 65,
    authorityLogo: '🇮🇳 NBC'
  }
];

export default function MunicipalByeLawsEngine({ 
  plotWidth = 30, 
  plotLength = 40, 
  builtUpArea: initialBuiltUpArea = 2050,
  floors = 2
}) {
  const [selectedCorpId, setSelectedCorpId] = useState('bbmp');
  const [currentPlotWidth, setCurrentPlotWidth] = useState(plotWidth);
  const [currentPlotLength, setCurrentPlotLength] = useState(plotLength);
  const [roadWidthFt, setRoadWidthFt] = useState(30);
  const [proposedFloors, setProposedFloors] = useState(floors || 2);
  const [proposedBuiltUpArea, setProposedBuiltUpArea] = useState(initialBuiltUpArea);
  const [hasRwhTank, setHasRwhTank] = useState(true);
  const [hasSolarHeater, setHasSolarHeater] = useState(true);
  const [parkingSpaces, setParkingSpaces] = useState(2);
  const [exportSuccess, setExportSuccess] = useState(false);

  const selectedCorp = useMemo(() => {
    return MUNICIPAL_CORPORATIONS.find(c => c.id === selectedCorpId) || MUNICIPAL_CORPORATIONS[0];
  }, [selectedCorpId]);

  const plotAreaSqft = currentPlotWidth * currentPlotLength;

  const setbacks = useMemo(() => {
    if (plotAreaSqft <= 1500) {
      return { front: 3.5, rear: 3.5, left: 3.0, right: 3.0 };
    } else if (plotAreaSqft <= 2400) {
      return { front: 5.0, rear: 4.0, left: 3.5, right: 3.5 };
    } else if (plotAreaSqft <= 4000) {
      return { front: 6.5, rear: 5.0, left: 4.5, right: 4.5 };
    } else {
      return { front: 10.0, rear: 6.5, left: 6.0, right: 6.0 };
    }
  }, [plotAreaSqft]);

  const buildableWidth = Math.max(0, currentPlotWidth - (setbacks.left + setbacks.right));
  const buildableLength = Math.max(0, currentPlotLength - (setbacks.front + setbacks.rear));
  const buildableGroundFootprint = Math.round(buildableWidth * buildableLength);
  const actualGroundCoveragePct = parseFloat(((buildableGroundFootprint / plotAreaSqft) * 100).toFixed(1));

  const maxPermissibleFar = useMemo(() => {
    let far = selectedCorp.baseFar;
    if (roadWidthFt >= 40 && roadWidthFt < 60) far += 0.25;
    if (roadWidthFt >= 60) far += 0.50;
    return far;
  }, [selectedCorp, roadWidthFt]);

  const maxPermissibleBuiltUp = Math.round(plotAreaSqft * maxPermissibleFar);
  const calculatedFar = parseFloat((proposedBuiltUpArea / plotAreaSqft).toFixed(2));
  const isFarCompliant = calculatedFar <= maxPermissibleFar;
  const isCoverageCompliant = actualGroundCoveragePct <= selectedCorp.maxGroundCoverage;

  const maxFloorsAllowed = roadWidthFt < 40 ? 3 : 4;
  const isHeightCompliant = proposedFloors <= maxFloorsAllowed;

  const complianceChecks = [
    { name: 'Floor Area Ratio (FAR / FSI)', status: isFarCompliant, detail: `Proposed ${calculatedFar} vs Permissible ${maxPermissibleFar}` },
    { name: 'Ground Coverage Ratio', status: isCoverageCompliant, detail: `Proposed ${actualGroundCoveragePct}% vs Max ${selectedCorp.maxGroundCoverage}%` },
    { name: 'Road Width & Floor Height Limit', status: isHeightCompliant, detail: `Proposed G+${proposedFloors-1} vs Allowed G+${maxFloorsAllowed-1} on ${roadWidthFt}ft Road` },
    { name: 'Mandatory Setback Clearance', status: buildableWidth > 0 && buildableLength > 0, detail: `Front ${setbacks.front}ft, Rear ${setbacks.rear}ft, Sides ${setbacks.left}ft` },
    { name: 'Rainwater Harvesting (RWH)', status: hasRwhTank, detail: `Percolation pit included` },
    { name: 'Solar Water Heating Provision', status: hasSolarHeater, detail: `100 LPD solar provision mandatory for duplex` },
    { name: 'Covered Vehicle Parking', status: parkingSpaces >= 1, detail: `${parkingSpaces} Car parking slot provided` }
  ];

  const passedCount = complianceChecks.filter(c => c.status).length;
  const complianceScore = Math.round((passedCount / complianceChecks.length) * 100);

  const handleExportPermitPacket = () => {
    setExportSuccess(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    setTimeout(() => setExportSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="lc-card lc-card-banner">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
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
              <ShieldCheck style={{ width: '24px', height: '24px' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                Municipal Bye-Laws & Sanction Engine
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Zoning setbacks, FAR limits, and NBC 2016 verification for BBMP, GHMC, CMDA, and DTCP.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontFamily: 'monospace' }}>Sanction Probability</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#34d399' }}>{complianceScore}% PASS</div>
            </div>
            <button onClick={handleExportPermitPacket} className="lc-btn lc-btn-primary lc-btn-sm">
              <Download style={{ width: '14px', height: '14px' }} /> Export Sanction Packet
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Controls vs Schematic */}
      <div className="lc-grid-split">
        {/* Left Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Authority Selection */}
          <div className="lc-card">
            <h3 className="lc-card-title" style={{ fontSize: '0.95rem', marginBottom: '12px' }}>
              <Building2 style={{ width: '16px', height: '16px', color: '#818cf8' }} /> Select Municipal Authority
            </h3>

            <div className="lc-grid-2" style={{ gap: '10px', marginBottom: '12px' }}>
              {MUNICIPAL_CORPORATIONS.map(corp => (
                <button
                  key={corp.id}
                  onClick={() => setSelectedCorpId(corp.id)}
                  style={{
                    background: selectedCorpId === corp.id ? 'rgba(99, 102, 241, 0.25)' : '#0a0e1a',
                    border: selectedCorpId === corp.id ? '1px solid #818cf8' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    padding: '12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: '#ffffff'
                  }}
                >
                  <div style={{ fontSize: '1.1rem', marginBottom: '2px' }}>{corp.authorityLogo}</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800 }}>{corp.name.split(' ')[0]}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{corp.state}</div>
                </button>
              ))}
            </div>

            <div style={{ background: '#0a0e1a', padding: '10px', borderRadius: '8px', fontSize: '0.75rem', color: '#94a3b8' }}>
              <strong style={{ color: '#818cf8' }}>Rulebook: </strong> {selectedCorp.ruleBook}
            </div>
          </div>

          {/* Site Parameters */}
          <div className="lc-card">
            <h3 className="lc-card-title" style={{ fontSize: '0.95rem', marginBottom: '14px' }}>
              <Sliders style={{ width: '16px', height: '16px', color: '#fbbf24' }} /> Site Parameters
            </h3>

            <div className="lc-form-group">
              <label className="lc-label">
                <span>Approaching Road Width</span>
                <span className="text-amber text-mono font-bold">{roadWidthFt} ft</span>
              </label>
              <input 
                type="range"
                min="20"
                max="80"
                step="5"
                value={roadWidthFt}
                onChange={(e) => setRoadWidthFt(Number(e.target.value))}
                style={{ accentColor: '#f59e0b', width: '100%' }}
              />
            </div>

            <div className="lc-grid-2" style={{ gap: '10px' }}>
              <div className="lc-form-group">
                <label className="lc-label">Plot Width (ft)</label>
                <input 
                  type="number"
                  value={currentPlotWidth}
                  onChange={(e) => setCurrentPlotWidth(Number(e.target.value))}
                  className="lc-input text-mono"
                />
              </div>
              <div className="lc-form-group">
                <label className="lc-label">Plot Length (ft)</label>
                <input 
                  type="number"
                  value={currentPlotLength}
                  onChange={(e) => setCurrentPlotLength(Number(e.target.value))}
                  className="lc-input text-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Schematic & Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Schematic */}
          <div className="lc-card">
            <div className="lc-card-header">
              <h3 className="lc-card-title"><Maximize2 style={{ width: '18px', height: '18px', color: '#38bdf8' }} /> Buildable Envelope Schematic</h3>
              <span className="lc-badge lc-badge-cyan">Setback Buffer View</span>
            </div>

            <div style={{
              background: '#070f1e',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '260px'
            }}>
              <svg viewBox="0 0 400 240" style={{ width: '100%', maxWidth: '360px' }}>
                <rect x="20" y="20" width="360" height="200" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" rx="6" />
                <rect x="65" y="55" width="270" height="130" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
                <text x="200" y="42" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Front Setback: {setbacks.front} ft</text>
                <text x="200" y="210" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">Rear Setback: {setbacks.rear} ft</text>
                <text x="200" y="115" fill="#ffffff" fontSize="12" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">BUILDABLE CORE</text>
                <text x="200" y="135" fill="#fbbf24" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">{buildableWidth}ft × {buildableLength}ft ({buildableGroundFootprint} sq.ft)</text>
              </svg>
            </div>
          </div>

          {/* Checklist */}
          <div className="lc-card">
            <h3 className="lc-card-title" style={{ fontSize: '0.95rem', marginBottom: '14px' }}>
              <FileCheck2 style={{ width: '16px', height: '16px', color: '#34d399' }} /> Rule Verification Checklist
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {complianceChecks.map((check, idx) => (
                <div 
                  key={idx}
                  style={{
                    background: check.status ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
                    border: check.status ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(244, 63, 94, 0.25)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {check.status ? <CheckCircle2 style={{ width: '16px', height: '16px', color: '#34d399' }} /> : <XCircle style={{ width: '16px', height: '16px', color: '#fb7185' }} />}
                    <div>
                      <strong style={{ color: '#ffffff' }}>{check.name}</strong>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>{check.detail}</div>
                    </div>
                  </div>

                  <span className={check.status ? 'lc-badge lc-badge-emerald' : 'lc-badge lc-badge-rose'}>
                    {check.status ? 'PASS' : 'DEVIATION'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
