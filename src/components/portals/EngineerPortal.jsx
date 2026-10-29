import React, { useState } from 'react';
import { 
  Award, 
  Search, 
  Send, 
  Camera, 
  FileCheck, 
  Clock, 
  CheckCircle2, 
  Sliders, 
  Download, 
  ChevronRight, 
  ShieldCheck, 
  AlertTriangle,
  Building,
  UserCheck,
  FileText,
  Compass,
  Layers,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VERIFIED_ENGINEERS } from '../../data/mockData';

export default function EngineerPortal({ projects = [], onAddBid, onLogSiteProgress }) {
  const [activeTab, setActiveTab] = useState('site_log'); // 'site_log', 'structural_compliance', 'cube_tests', 'rfps'
  const [selectedProjectForBid, setSelectedProjectForBid] = useState(null);
  const [bidAmount, setBidAmount] = useState('145000');
  const [bidDays, setBidDays] = useState('120');
  const [bidNotes, setBidNotes] = useState('Includes 10-year structural stability certificate, IS 456 reinforcement rebar inspection, and municipal sanction drawings.');
  const [bidSubmittedSuccess, setBidSubmittedSuccess] = useState(false);

  // Daily Site Log State
  const [logProject, setLogProject] = useState(projects[0]?.title || 'Modern 3BHK Villa (Velachery)');
  const [logStage, setLogStage] = useState('Stage 3: Ground Floor Columns & RCC Slab Pour');
  const [logNotes, setLogNotes] = useState('Rebar spacing C1-C8 verified at 150mm c/c. Concrete cover blocks (25mm) placed accurately. M25 mix design approved.');
  const [workerCount, setWorkerCount] = useState('14');
  const [passedInspection, setPassedInspection] = useState(true);
  const [siteLogSuccess, setSiteLogSuccess] = useState(false);

  // Cube Test State
  const [cubeTests, setCubeTests] = useState([
    {
      id: 'ct-101',
      dateCast: '25 Sep 2026',
      dateTested: '02 Oct 2026',
      age: '7 Days',
      grade: 'M25 Mix',
      targetStrength: '16.5 N/mm²',
      achievedStrength: '18.4 N/mm²',
      location: 'Ground Floor Column C1-C4',
      status: 'PASSED (111% of 7-Day Target)'
    },
    {
      id: 'ct-102',
      dateCast: '10 Sep 2026',
      dateTested: '08 Oct 2026',
      age: '28 Days',
      grade: 'M25 Mix',
      targetStrength: '25.0 N/mm²',
      achievedStrength: '27.2 N/mm²',
      location: 'Basement Plinth Beam & Footing',
      status: 'PASSED (108% of 28-Day Target)'
    }
  ]);

  const [newCubeGrade, setNewCubeGrade] = useState('M25');
  const [newCubeAge, setNewCubeAge] = useState('7 Days');
  const [newCubeStrength, setNewCubeStrength] = useState('18.8');
  const [newCubeLoc, setNewCubeLoc] = useState('First Floor Slab RCC');

  const currentEngineer = VERIFIED_ENGINEERS[0] || {
    name: 'Er. Rajesh Varma, M.E. (Struct)',
    company: 'Varma Structural & Architectural Consultants',
    licenseNo: 'SE/GR-I/CMDA/2021/0491',
    rating: 4.95,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
  };

  const handleLogSubmit = (e) => {
    e.preventDefault();
    setSiteLogSuccess(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => {
      setSiteLogSuccess(false);
    }, 2800);
  };

  const handleAddCubeTest = (e) => {
    e.preventDefault();
    const newTest = {
      id: `ct-${Date.now()}`,
      dateCast: 'Today',
      dateTested: 'Today (Field Compression Machine)',
      age: newCubeAge,
      grade: `${newCubeGrade} Mix`,
      targetStrength: newCubeAge === '7 Days' ? '16.5 N/mm²' : '25.0 N/mm²',
      achievedStrength: `${newCubeStrength} N/mm²`,
      location: newCubeLoc,
      status: parseFloat(newCubeStrength) >= (newCubeAge === '7 Days' ? 16.5 : 25.0) ? 'PASSED (IS 456 Verified)' : 'FAILED / RE-TEST'
    };
    setCubeTests([newTest, ...cubeTests]);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1320px', margin: '0 auto' }}>
      {/* Engineer Workspace Header Banner */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #0c1424 0%, #101c36 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          padding: '28px 32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(56, 189, 248, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img 
            src={currentEngineer.avatar} 
            alt={currentEngineer.name}
            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #38bdf8', boxShadow: '0 0 16px rgba(56, 189, 248, 0.3)' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Chartered Structural Consultant Workspace
              </span>
              <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', fontFamily: 'monospace' }}>
                {currentEngineer.licenseNo}
              </span>
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
              {currentEngineer.name}
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '4px 0 0' }}>
              IS 456 Structural Compliance, Digital Geo-Tagged Site Inspections, Concrete Compressive Strength Logs & Stamped Sanctions.
            </p>
          </div>
        </div>

        {/* Quick Engineer Stats */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '14px', padding: '12px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 700 }}>Active Sites</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', fontFamily: 'monospace' }}>4 Supervised</div>
          </div>
          <div style={{ background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '14px', padding: '12px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 700 }}>Code Compliance</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#34d399', fontFamily: 'monospace' }}>100% IS 456</div>
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
          { id: 'site_log', label: 'Digital Site Inspection Log', icon: '📋', count: 'Live Sign-off' },
          { id: 'structural_compliance', label: 'IS 456 & NBC Code Checker', icon: '📐', count: 'Compliant' },
          { id: 'cube_tests', label: 'Concrete Cube Compressive Strength', icon: '🧪', count: `${cubeTests.length} Tests` },
          { id: 'rfps', label: 'Engineering Consultation RFPs', icon: '💼', count: '3 Open Bids' }
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
                background: isActive ? '#38bdf8' : 'transparent',
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

      {/* TAB 1: DIGITAL SITE INSPECTION LOG */}
      {activeTab === 'site_log' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 480px) 1fr', gap: '28px' }}>
          {/* Sign-off Form */}
          <div style={{ background: '#101522', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCheck style={{ color: '#38bdf8' }} /> Issue Certified Digital Site Inspection Log
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '20px' }}>
              Digital signature triggers automatic milestone approval and notifies property owner and lender.
            </p>

            <form onSubmit={handleLogSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                  Project Under Supervision
                </label>
                <input
                  type="text"
                  value={logProject}
                  onChange={(e) => setLogProject(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0b0f19',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                  Inspection Stage & Structural Element
                </label>
                <select
                  value={logStage}
                  onChange={(e) => setLogStage(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0b0f19',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                >
                  <option value="Stage 1: Foundation & Excavation Pit Base">Stage 1: Foundation & Excavation Pit Base</option>
                  <option value="Stage 2: Plinth Beam & DPC Level">Stage 2: Plinth Beam & DPC Level</option>
                  <option value="Stage 3: Ground Floor Columns & RCC Slab Pour">Stage 3: Ground Floor Columns & RCC Slab Pour</option>
                  <option value="Stage 4: First Floor Slab & Shuttering Rebar">Stage 4: First Floor Slab & Shuttering Rebar</option>
                  <option value="Stage 5: Roof Slab & Parapet Wall Casting">Stage 5: Roof Slab & Parapet Wall Casting</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                  Structural Verification Remarks & Cover Block Notes
                </label>
                <textarea
                  rows={3}
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#0b0f19', padding: '12px', borderRadius: '10px' }}>
                <input
                  type="checkbox"
                  id="inspectCheck"
                  checked={passedInspection}
                  onChange={(e) => setPassedInspection(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#38bdf8' }}
                />
                <label htmlFor="inspectCheck" style={{ fontSize: '0.82rem', color: '#ffffff', cursor: 'pointer' }}>
                  <strong>I certify structural compliance with IS 456:2000.</strong> Concrete mix and rebar spacing verified on site.
                </label>
              </div>

              {siteLogSuccess && (
                <div style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', borderRadius: '10px', padding: '12px', color: '#34d399', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 style={{ width: '18px', height: '18px' }} />
                  <span>Site log stamped with digital cryptographic signature! Client escrow release enabled.</span>
                </div>
              )}

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
                  color: '#080b11',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Sign & Transmit Digital Site Log ✍️
              </button>
            </form>
          </div>

          {/* Past Site Inspection Logs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#101522', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck style={{ color: '#34d399' }} /> Live Stamped Inspection History
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  {
                    id: 'log-1',
                    stage: 'Stage 3: First Floor RCC Slab Shuttering & Rebar',
                    date: 'Today, 10:15 AM',
                    site: 'Velachery Villa Site',
                    status: 'Stamped & Verified (IS 456)',
                    notes: 'Main rebar 12mm Fe550D spaced at 150mm c/c with 20mm cover blocks. Chair bars placed at 1m interval. Approved for concrete pouring.'
                  },
                  {
                    id: 'log-2',
                    stage: 'Stage 2: Ground Floor Columns C1-C8 Casting',
                    date: '28 Sep 2026',
                    site: 'Velachery Villa Site',
                    status: 'Passed Quality Standard',
                    notes: 'M25 concrete cube samples taken. Slump test measured 110mm. Verticality checked with plumb bob.'
                  }
                ].map((item) => (
                  <div 
                    key={item.id}
                    style={{
                      background: '#0b0f19',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '14px',
                      padding: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>{item.stage}</h5>
                      <span style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34d399', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                        {item.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#38bdf8', marginBottom: '8px' }}>
                      {item.date} • {item.site}
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                      {item.notes}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: IS 456 STRUCTURAL COMPLIANCE CHECKER */}
      {activeTab === 'structural_compliance' && (
        <div style={{ background: '#101522', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
            IS 456:2000 & National Building Code (NBC) Structural Parameters
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '24px' }}>
            Automated dimensional analysis against Indian Standard building codes for residential G+1 RCC framed structures.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {[
              {
                title: 'Minimum Column Dimension',
                codeValue: 'IS 456 Cl. 26.5.3.1: Min 200mm (or 230 × 300mm for G+1)',
                actualValue: '230 × 380mm (9" × 15")',
                status: 'Compliant (Exceeds by 26%)',
                color: '#34d399'
              },
              {
                title: 'Clear Concrete Cover for Columns',
                codeValue: 'IS 456 Cl. 26.4.2: Min 40mm for severe exposure (or 25mm min)',
                actualValue: '40mm with polymer cover blocks',
                status: 'Compliant',
                color: '#34d399'
              },
              {
                title: 'RCC Slab Thickness (L/d Span to Depth Ratio)',
                codeValue: 'IS 456 Cl. 23.2: Max L/d = 26 for continuous slabs',
                actualValue: '125mm (5") for 3.6m span (L/d = 28.8 with Fe550D rebar)',
                status: 'Compliant (Safe in Deflection)',
                color: '#34d399'
              },
              {
                title: 'Seismic Ductile Detailing (IS 13920)',
                codeValue: 'Zone III Chennai: 135° hook ties with 10d extension',
                actualValue: '135° stirrups with 75mm spacing in plastic hinge zone',
                status: 'Earthquake Resilient',
                color: '#38bdf8'
              }
            ].map((item, idx) => (
              <div 
                key={idx}
                style={{
                  background: '#0b0f19',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>{item.title}</h4>
                    <span style={{ color: item.color, fontSize: '0.75rem', fontWeight: 800, background: 'rgba(56, 189, 248, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                      ✓ {item.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '8px' }}>{item.codeValue}</div>
                  <div style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 700 }}>Actual on Site: {item.actualValue}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CONCRETE CUBE COMPRESSIVE STRENGTH */}
      {activeTab === 'cube_tests' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '28px' }}>
          {/* Add Cube Form */}
          <div style={{ background: '#101522', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px' }}>
              Record Field Compressive Test
            </h3>
            <form onSubmit={handleAddCubeTest} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Concrete Mix Grade</label>
                <select value={newCubeGrade} onChange={(e) => setNewCubeGrade(e.target.value)} style={{ width: '100%', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.12)', padding: '8px 12px', color: '#ffffff', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <option value="M20">M20 (1:1.5:3)</option>
                  <option value="M25">M25 (1:1:2 Design Mix)</option>
                  <option value="M30">M30 (High Strength)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Curing Age</label>
                <select value={newCubeAge} onChange={(e) => setNewCubeAge(e.target.value)} style={{ width: '100%', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.12)', padding: '8px 12px', color: '#ffffff', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <option value="7 Days">7 Days (Target: 65-70% of Characteristic Strength)</option>
                  <option value="28 Days">28 Days (Target: 100% of Characteristic Strength)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Compressive Strength Achieved (N/mm²)</label>
                <input type="text" value={newCubeStrength} onChange={(e) => setNewCubeStrength(e.target.value)} placeholder="e.g. 18.5" style={{ width: '100%', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.12)', padding: '8px 12px', color: '#38bdf8', fontWeight: 800, borderRadius: '8px', fontSize: '0.85rem' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Structural Member Location</label>
                <input type="text" value={newCubeLoc} onChange={(e) => setNewCubeLoc(e.target.value)} placeholder="e.g. First Floor Slab RCC" style={{ width: '100%', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.12)', padding: '8px 12px', color: '#ffffff', borderRadius: '8px', fontSize: '0.85rem' }} />
              </div>

              <button type="submit" style={{ background: 'linear-gradient(135deg, #38bdf8, #0284c7)', color: '#080b11', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', marginTop: '6px' }}>
                + Add Cube Strength Record
              </button>
            </form>
          </div>

          {/* Test Table */}
          <div style={{ background: '#101522', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px' }}>
              IS 516 Concrete Cube Test Log
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cubeTests.map((t) => (
                <div key={t.id} style={{ background: '#0b0f19', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>{t.location} ({t.grade})</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Tested: {t.dateTested} • Curing Age: {t.age}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>{t.achievedStrength}</div>
                    <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>{t.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RFPS */}
      {activeTab === 'rfps' && (
        <div style={{ background: '#101522', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
            Open Architectural & Structural Consultation RFPs
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '24px' }}>
            Direct homeowner consultation inquiries ready for structural feasibility bids.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#0b0f19', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.8rem' }}>RFP #ARCH-9021</span>
                <span style={{ background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>Budget: ₹1.80L</span>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>3BHK Contemporary Villa (OMR, Chennai)</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '14px' }}>Client: Anand S. • Plot: 30 × 50 ft • G+2 Floor Plan</p>
              <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '16px' }}>
                • Scope: Structural stability certificate, soil SBC check, CMDA municipal drawing set.
              </div>
              <button
                onClick={() => {
                  alert('Bid submitted directly to client repository!');
                  confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
                }}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
                  color: '#080b11',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Submit Direct Feasibility Bid →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
