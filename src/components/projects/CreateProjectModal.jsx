import React, { useState, useEffect } from 'react';

export default function CreateProjectModal({
  isOpen,
  onClose,
  onCreateSuccess,
  initialPrompt = ''
}) {
  const [step, setStep] = useState('questions'); // 'questions', 'summary', 'pipeline', 'showcase'
  const [promptInput, setPromptInput] = useState(initialPrompt || 'I have a 40 × 60 feet plot. I want a 3BHK house with parking, a pooja room, balcony and a modern exterior. My budget is around ₹45 lakh.');

  // Form State (Section 4)
  const [plotDimensions, setPlotDimensions] = useState('40 × 60 ft');
  const [floors, setFloors] = useState(2);
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(3);
  const [parking, setParking] = useState('1 car');
  const [exteriorStyle, setExteriorStyle] = useState('Modern');
  const [budget, setBudget] = useState('₹45,00,000');
  
  // Checklist Options (Section 4)
  const [features, setFeatures] = useState({
    balcony: true,
    poojaRoom: true,
    homeOffice: false,
    utilityRoom: true,
    garden: true,
    terrace: true
  });

  // Showcase Active Tab (Section 2 & 25)
  const [showcaseTab, setShowcaseTab] = useState('3d'); // '2d', '3d', 'interior', 'exterior', 'cost', 'materials', 'workers', 'schedule'
  
  // Design Modification State (Section 10)
  const [masterBedDim, setMasterBedDim] = useState('13 × 15 ft');
  const [modificationText, setModificationText] = useState('');
  const [modDelta, setModDelta] = useState(null);

  // Pipeline Step Counter (Section 6)
  const [pipelineProgress, setPipelineProgress] = useState(0);

  // Sync prompt changes
  useEffect(() => {
    if (initialPrompt) {
      setPromptInput(initialPrompt);
      parsePromptText(initialPrompt);
    }
  }, [initialPrompt]);

  const parsePromptText = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('40x60') || lower.includes('40 × 60')) setPlotDimensions('40 × 60 ft');
    else if (lower.includes('30x40') || lower.includes('30 × 40')) setPlotDimensions('30 × 40 ft');
    else if (lower.includes('0.5') || lower.includes('acre')) setPlotDimensions('0.5 Acre (120 × 180 ft)');

    if (lower.includes('2 floor') || lower.includes('two floor') || lower.includes('duplex')) setFloors(2);
    else if (lower.includes('3 floor') || lower.includes('g+2')) setFloors(3);
    else if (lower.includes('1 floor') || lower.includes('single')) setFloors(1);

    if (lower.includes('4bhk') || lower.includes('4 bed')) setBedrooms(4);
    else if (lower.includes('2bhk') || lower.includes('2 bed')) setBedrooms(2);
    else if (lower.includes('3bhk') || lower.includes('3 bed')) setBedrooms(3);

    if (lower.includes('50 lakh') || lower.includes('50l')) setBudget('₹50,00,000');
    else if (lower.includes('45 lakh') || lower.includes('45l')) setBudget('₹45,00,000');
    else if (lower.includes('35 lakh') || lower.includes('35l')) setBudget('₹35,00,000');

    if (lower.includes('pooja')) setFeatures((prev) => ({ ...prev, poojaRoom: true }));
    if (lower.includes('balcony')) setFeatures((prev) => ({ ...prev, balcony: true }));
    if (lower.includes('garden')) setFeatures((prev) => ({ ...prev, garden: true }));
  };

  const toggleFeature = (key) => {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Run Generation Pipeline (Section 6)
  const handleStartGeneration = () => {
    setStep('pipeline');
    setPipelineProgress(15);

    setTimeout(() => setPipelineProgress(35), 500);
    setTimeout(() => setPipelineProgress(60), 1000);
    setTimeout(() => setPipelineProgress(82), 1500);
    setTimeout(() => setPipelineProgress(95), 2000);
    setTimeout(() => {
      setPipelineProgress(100);
      setTimeout(() => {
        setStep('showcase');
      }, 500);
    }, 2500);
  };

  // Design Modification Calculation (Section 10)
  const handleCalculateModification = (text) => {
    setModificationText(text);
    if (text.includes('12') && text.includes('14')) {
      setModDelta({
        current: '13 × 15 ft (195 sq.ft)',
        requested: '12 × 14 ft (168 sq.ft)',
        affected: ['Master Bedroom (-27 sq.ft)', 'Attached Bathroom (+15 sq.ft added)', 'Corridor & Circulation (+12 sq.ft widened)'],
        possible: true
      });
    } else {
      setModDelta({
        current: 'Standard Layout',
        requested: text,
        affected: ['Zoning dimensions updated', 'Structural column grid verified'],
        possible: true
      });
    }
  };

  const handleApplyModification = () => {
    if (modDelta && modDelta.requested.includes('12 × 14')) {
      setMasterBedDim('12 × 14 ft');
    }
    setModDelta(null);
    alert('✓ Geometry modification applied successfully! 2D Floor Plan & 3D Model updated.');
  };

  // Final Action: Post Project & Connect Marketplace (Section 27)
  const handlePostProject = () => {
    const newProj = {
      id: `proj-${Date.now()}`,
      title: `${bedrooms}BHK ${exteriorStyle} House (${plotDimensions})`,
      subtitle: `Residential • ${floors} Floors • ${bedrooms}BHK • ${budget}`,
      location: 'Chennai / Coimbatore',
      plotDimensions,
      plotAreaSqft: plotDimensions.includes('40 × 60') ? 2400 : plotDimensions.includes('Acre') ? 21780 : 1200,
      builtUpAreaSqft: plotDimensions.includes('40 × 60') ? 2850 : 2150,
      floors,
      bedrooms,
      bathrooms,
      parking: `${parking} Covered Porch`,
      balcony: features.balcony ? 'East Balcony' : 'None',
      estimatedCost: budget,
      spentCost: '₹0',
      progressPercent: 5,
      currentPhase: 'Soil Testing & Site Preparation',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
      designVersion: 'V1 (AI Designed)',
      costBreakdown: {
        total: 4025000,
        structure: 1840000,
        materials: 1010000,
        labour: 580000,
        electrical: 240000,
        plumbing: 175000,
        finishing: 180000
      },
      materialsRequired: [
        { item: 'UltraTech 53 Grade Cement', quantity: '1,240 bags', cost: '₹4,77,400', status: 'Quote Requested from Mandi' },
        { item: 'Tata Tiscon Fe550D Steel Rebar', quantity: '8.4 tonnes', cost: '₹5,75,400', status: 'Quote Requested' },
        { item: 'Class-1 Wire-Cut Red Bricks', quantity: '42,000 pcs', cost: '₹4,83,000', status: 'Quote Requested' },
        { item: 'Double Washed M-Sand', quantity: '185 m³', cost: '₹3,40,400', status: 'Awaiting Order' },
        { item: 'Kajaria 4x2 Vitrified GVT Tiles', quantity: '2,850 sq.ft', cost: '₹1,93,800', status: 'Awaiting Flooring Phase' }
      ],
      phases: [
        { name: 'Site Preparation & Excavation', status: 'in_progress', progress: 20, date: 'Starting Now', inspector: 'Consulting Engineer' },
        { name: 'Foundation Footings & Plinth Beam', status: 'pending', progress: 0, date: 'Est. Oct 2026', inspector: 'Er. Rajesh Varma' },
        { name: 'Ground & First Floor RCC Frame', status: 'pending', progress: 0, date: 'Est. Nov 2026', inspector: 'Pending' },
        { name: 'Brick Masonry & Plastering', status: 'pending', progress: 0, date: 'Est. Dec 2026', inspector: 'Pending' },
        { name: 'MEP, Flooring & Handover', status: 'pending', progress: 0, date: 'Est. Feb 2027', inspector: 'Pending' }
      ],
      team: [
        { role: 'Owner', name: 'Prasanth Kumar', phone: '+91 98400 11223', status: 'Active' },
        { role: 'Consulting Structural Engineer', name: 'Er. Rajesh Varma', company: 'Varma Structurals', status: 'Inspecting Site' }
      ],
      siteUpdates: []
    };

    onCreateSuccess(newProj);
    onClose();
    alert(`🎉 Construction Project Published!\n\nRequirement broadcast sent to 824 verified Engineers, 3,420 Masons, Equipment holders and Material Mandi suppliers.`);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(38, 51, 42, 0.4)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E1E7DF',
          borderRadius: '22px',
          width: step === 'showcase' ? '960px' : '720px',
          maxWidth: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 20px 40px rgba(38, 51, 42, 0.12)',
          padding: '28px',
          transition: 'width 0.3s ease'
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#718B73', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              ✦ LabourConnect Construction Intelligence
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#26332A', letterSpacing: '-0.02em', marginTop: '2px' }}>
              {step === 'showcase' ? 'AI House Design & Construction Blueprint' : 'AI House Designer — Requirements'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#F1F4EF',
              border: 'none',
              color: '#68736A',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem'
            }}
          >
            ✕
          </button>
        </div>

        {/* =========================================================
            STAGE 1: INTELLIGENT QUESTIONS (Section 4)
        ========================================================= */}
        {step === 'questions' && (
          <div>
            {/* Natural Prompt Input */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#26332A', display: 'block', marginBottom: '6px' }}>
                Describe your house in your own words:
              </label>
              <textarea
                rows={3}
                value={promptInput}
                onChange={(e) => {
                  setPromptInput(e.target.value);
                  parsePromptText(e.target.value);
                }}
                style={{
                  width: '100%',
                  background: '#FAFAF7',
                  border: '1px solid #E1E7DF',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  color: '#26332A',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  lineHeight: 1.45
                }}
              />
            </div>

            {/* Smart Parameter Grids (Section 4) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '18px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#68736A', display: 'block', marginBottom: '4px' }}>Plot Size</label>
                <input
                  type="text"
                  value={plotDimensions}
                  onChange={(e) => setPlotDimensions(e.target.value)}
                  style={{ width: '100%', background: '#FAFAF7', border: '1px solid #E1E7DF', padding: '10px 12px', borderRadius: '8px', color: '#26332A', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#68736A', display: 'block', marginBottom: '4px' }}>Floors</label>
                <select
                  value={floors}
                  onChange={(e) => setFloors(Number(e.target.value))}
                  style={{ width: '100%', background: '#FAFAF7', border: '1px solid #E1E7DF', padding: '10px 12px', borderRadius: '8px', color: '#26332A', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value={1}>1 Floor (Single Story)</option>
                  <option value={2}>2 Floors (G+1 Duplex)</option>
                  <option value={3}>3 Floors (G+2)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#68736A', display: 'block', marginBottom: '4px' }}>Bedrooms</label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(Number(e.target.value))}
                  style={{ width: '100%', background: '#FAFAF7', border: '1px solid #E1E7DF', padding: '10px 12px', borderRadius: '8px', color: '#26332A', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value={2}>2 BHK</option>
                  <option value={3}>3 BHK</option>
                  <option value={4}>4 BHK</option>
                  <option value={5}>5 BHK</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#68736A', display: 'block', marginBottom: '4px' }}>Parking</label>
                <input
                  type="text"
                  value={parking}
                  onChange={(e) => setParking(e.target.value)}
                  style={{ width: '100%', background: '#FAFAF7', border: '1px solid #E1E7DF', padding: '10px 12px', borderRadius: '8px', color: '#26332A', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#68736A', display: 'block', marginBottom: '4px' }}>Exterior Style</label>
                <select
                  value={exteriorStyle}
                  onChange={(e) => setExteriorStyle(e.target.value)}
                  style={{ width: '100%', background: '#FAFAF7', border: '1px solid #E1E7DF', padding: '10px 12px', borderRadius: '8px', color: '#26332A', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="Modern">Modern</option>
                  <option value="Contemporary">Contemporary</option>
                  <option value="Traditional">Traditional Heritage</option>
                  <option value="Minimal">Minimalist</option>
                  <option value="Luxury">Luxury Indian Villa</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#68736A', display: 'block', marginBottom: '4px' }}>Target Budget</label>
                <input
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  style={{ width: '100%', background: '#FAFAF7', border: '1px solid #E1E7DF', padding: '10px 12px', borderRadius: '8px', color: '#26332A', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Checkbox Features (Section 4) */}
            <div style={{ background: '#FAFAF7', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #E1E7DF' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#718B73', marginBottom: '10px' }}>
                Do you want any of these included?
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[
                  { key: 'balcony', label: 'Balcony' },
                  { key: 'poojaRoom', label: 'Pooja room' },
                  { key: 'homeOffice', label: 'Home office' },
                  { key: 'utilityRoom', label: 'Utility room' },
                  { key: 'garden', label: 'Garden / Lawn' },
                  { key: 'terrace', label: 'Terrace Pergola' }
                ].map((item) => (
                  <label
                    key={item.key}
                    onClick={() => toggleFeature(item.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      color: features[item.key] ? '#26332A' : '#68736A',
                      fontWeight: features[item.key] ? 600 : 400
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={features[item.key]}
                      onChange={() => {}}
                      style={{ accentColor: '#718B73', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Bottom Continue to Summary */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={onClose}
                style={{ background: 'transparent', border: 'none', color: '#68736A', padding: '10px 18px', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={() => setStep('summary')}
                style={{
                  background: '#718B73',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(113, 139, 115, 0.25)'
                }}
              >
                Validate Requirements →
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            STAGE 2: DESIGN REQUIREMENT SUMMARY (Section 5)
        ========================================================= */}
        {step === 'summary' && (
          <div>
            <div style={{ background: '#FAFAF7', border: '1px solid #E1E7DF', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#718B73', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
                YOUR HOUSE REQUIREMENTS
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #E1E7DF' }}>
                  <span style={{ color: '#68736A' }}>Plot</span>
                  <strong style={{ color: '#26332A' }}>{plotDimensions}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #E1E7DF' }}>
                  <span style={{ color: '#68736A' }}>Floors</span>
                  <strong style={{ color: '#26332A' }}>{floors} Floors (G+1)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #E1E7DF' }}>
                  <span style={{ color: '#68736A' }}>Bedrooms</span>
                  <strong style={{ color: '#26332A' }}>{bedrooms} Bedrooms</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #E1E7DF' }}>
                  <span style={{ color: '#68736A' }}>Bathrooms</span>
                  <strong style={{ color: '#26332A' }}>{bathrooms} Bathrooms</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #E1E7DF' }}>
                  <span style={{ color: '#68736A' }}>Parking</span>
                  <strong style={{ color: '#26332A' }}>{parking}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #E1E7DF' }}>
                  <span style={{ color: '#68736A' }}>Pooja Room</span>
                  <strong style={{ color: features.poojaRoom ? '#3D8056' : '#68736A' }}>{features.poojaRoom ? 'Yes (North-East Ishanya)' : 'No'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #E1E7DF' }}>
                  <span style={{ color: '#68736A' }}>Balcony</span>
                  <strong style={{ color: features.balcony ? '#3D8056' : '#68736A' }}>{features.balcony ? 'Yes (East Facing)' : 'No'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #E1E7DF' }}>
                  <span style={{ color: '#68736A' }}>Style</span>
                  <strong style={{ color: '#718B73' }}>{exteriorStyle}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
                  <span style={{ color: '#68736A' }}>Budget Target</span>
                  <strong style={{ color: '#3D8056', fontSize: '1.05rem' }}>{budget}</strong>
                </div>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #E1E7DF', display: 'flex', alignItems: 'center', gap: '8px', color: '#3D8056', fontSize: '0.85rem', fontWeight: 700 }}>
                <span>✓</span>
                <span>Requirements validated against building byelaws & structural norms</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => setStep('questions')}
                style={{ background: 'transparent', border: 'none', color: '#68736A', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
              >
                ← Edit Requirements
              </button>
              <button
                onClick={handleStartGeneration}
                style={{
                  background: '#718B73',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '12px 28px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.925rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(113, 139, 115, 0.25)'
                }}
              >
                [ Generate Design ] →
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            STAGE 3: GENERATION PIPELINE (Section 6)
        ========================================================= */}
        {step === 'pipeline' && (
          <div style={{ padding: '30px 10px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#26332A', marginBottom: '8px' }}>
              Generating your design...
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#68736A', marginBottom: '24px' }}>
              Executing architectural calculation engine & structural geometry solver
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '440px', margin: '0 auto 24px', textAlign: 'left' }}>
              {[
                { label: 'Requirements processed', threshold: 15 },
                { label: 'Plot constraints checked', threshold: 35 },
                { label: 'Room arrangement generated', threshold: 60 },
                { label: 'Dimensions calculated', threshold: 82 },
                { label: 'Circulation checked', threshold: 95 },
                { label: 'Floor plan & 3D geometry generated', threshold: 100 }
              ].map((item, idx) => {
                const isPassed = pipelineProgress >= item.threshold;
                return (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: isPassed ? '#EAF0E8' : '#FAFAF7', borderRadius: '8px', border: isPassed ? '1px solid #718B73' : '1px solid #E1E7DF' }}>
                    <span style={{ fontSize: '0.85rem', color: isPassed ? '#3D8056' : '#68736A', fontWeight: isPassed ? 700 : 400 }}>
                      {isPassed ? `✓ ${item.label}` : `○ ${item.label}`}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#718B73' }}>
              {pipelineProgress}%
            </div>
          </div>
        )}

        {/* =========================================================
            STAGE 4: DEDICATED SHOWCASE WORKSPACE (Sections 6-16)
        ========================================================= */}
        {step === 'showcase' && (
          <div>
            {/* Capability Sub-Navigation Tabs */}
            <div style={{ display: 'flex', gap: '6px', background: '#EAF0E8', padding: '6px', borderRadius: '12px', border: '1px solid #E1E7DF', marginBottom: '18px', overflowX: 'auto' }}>
              {[
                { id: '2d', label: '📐 2D Floor Plan' },
                { id: '3d', label: '🏡 3D House' },
                { id: 'interior', label: '🛋️ Interior' },
                { id: 'exterior', label: '🏠 Exterior' },
                { id: 'cost', label: '💰 Cost & BOQ' },
                { id: 'materials', label: '🧱 Materials' },
                { id: 'workers', label: '👷 Labour & Equipment' },
                { id: 'schedule', label: '📅 Construction Schedule' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setShowcaseTab(tab.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: showcaseTab === tab.id ? '#718B73' : 'transparent',
                    color: showcaseTab === tab.id ? '#FFFFFF' : '#68736A',
                    fontSize: '0.78rem',
                    fontWeight: showcaseTab === tab.id ? 800 : 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB: 2D FLOOR PLAN (Section 6) */}
            {showcaseTab === '2d' && (
              <div style={{ background: '#FAFAF7', borderRadius: '16px', padding: '24px', border: '1px solid #E1E7DF', marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#718B73' }}>FLOOR PLAN (Real Computed Dimensions)</span>
                  <span style={{ fontSize: '0.75rem', color: '#3D8056' }}>Carpet Area: 1,840 sq.ft • Built-Up: 2,450 sq.ft</span>
                </div>

                {/* 2D Plan Grid Representation (Section 6) */}
                <div style={{ border: '2px solid #718B73', borderRadius: '10px', padding: '16px', background: '#FFFFFF', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ border: '2px solid #718B73', padding: '12px', borderRadius: '6px', background: '#EAF0E8' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#26332A' }}>Bedroom 1</div>
                      <div style={{ fontSize: '0.75rem', color: '#68736A' }}>11 × 12 ft</div>
                    </div>
                    <div style={{ border: '2px solid #718B73', padding: '12px', borderRadius: '6px', background: '#EAF0E8' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#26332A' }}>Bedroom 2</div>
                      <div style={{ fontSize: '0.75rem', color: '#68736A' }}>11 × 12 ft</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ border: '2px solid #3D8056', padding: '12px', borderRadius: '6px', background: '#EAF0E8' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#26332A' }}>Living Room & Foyer</div>
                      <div style={{ fontSize: '0.75rem', color: '#68736A' }}>15 × 18 ft (East Road Entry)</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div style={{ border: '2px solid #E1E7DF', padding: '12px', borderRadius: '6px', background: '#FAFAF7' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#26332A' }}>Kitchen</div>
                        <div style={{ fontSize: '0.75rem', color: '#68736A' }}>10 × 12 ft (SE Agni)</div>
                      </div>
                      <div style={{ border: '2px solid #E1E7DF', padding: '12px', borderRadius: '6px', background: '#FAFAF7' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#26332A' }}>Pooja</div>
                        <div style={{ fontSize: '0.75rem', color: '#68736A' }}>6 × 6 ft (NE)</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Master Bedroom Box */}
                <div style={{ border: '2px solid #E1E7DF', padding: '14px', borderRadius: '6px', background: '#FFFFFF', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#26332A' }}>Master Bedroom (South-West Corner)</div>
                    <div style={{ fontSize: '0.75rem', color: '#68736A' }}>Configured Dimension: <strong style={{ color: '#26332A' }}>{masterBedDim}</strong></div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#3D8056', fontWeight: 700 }}>✓ Attached Bath & Walk-in Closet</span>
                </div>

                {/* Design Modification Bar (Section 10) */}
                <div style={{ marginTop: '16px', background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #E1E7DF' }}>
                  <div style={{ fontSize: '0.75rem', color: '#718B73', fontWeight: 700, marginBottom: '6px' }}>
                    ✦ LIVE DESIGN MODIFICATION ENGINE
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder='e.g. "Make the master bedroom 12 × 14 feet"'
                      value={modificationText}
                      onChange={(e) => setModificationText(e.target.value)}
                      style={{ flex: 1, background: '#FAFAF7', border: '1px solid #E1E7DF', padding: '8px 12px', borderRadius: '6px', color: '#26332A', fontSize: '0.8rem' }}
                    />
                    <button
                      onClick={() => handleCalculateModification(modificationText || 'Make the master bedroom 12 × 14 feet')}
                      style={{ background: '#718B73', color: '#FFFFFF', fontWeight: 700, padding: '8px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      Calculate Delta
                    </button>
                  </div>

                  {modDelta && (
                    <div style={{ marginTop: '10px', background: '#EAF0E8', padding: '10px', borderRadius: '6px', border: '1px solid #718B73' }}>
                      <div style={{ fontSize: '0.75rem', color: '#3D8056', fontWeight: 700, marginBottom: '4px' }}>✓ Modification Possible (Structural check passed):</div>
                      <div style={{ fontSize: '0.75rem', color: '#26332A' }}>Current: {modDelta.current} → Requested: {modDelta.requested}</div>
                      <div style={{ fontSize: '0.7rem', color: '#68736A', margin: '4px 0' }}>Affected: {modDelta.affected.join(' • ')}</div>
                      <button
                        onClick={handleApplyModification}
                        style={{ background: '#3D8056', color: '#FFFFFF', fontWeight: 700, padding: '4px 10px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.75rem', marginTop: '4px' }}
                      >
                        Apply Modification to Geometry
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: 3D HOUSE (Section 7) */}
            {showcaseTab === '3d' && (
              <div style={{ height: '360px', background: '#FAFAF7', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '1px solid #E1E7DF', marginBottom: '18px' }}>
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"
                  alt="3D House Model"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '14px',
                    left: '14px',
                    right: '14px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1px solid #E1E7DF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: '#26332A', fontWeight: 700 }}>3D House Model • Floor 1 & Floor 2</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#718B73', fontWeight: 600 }}>🔄 360° Rotate</span>
                    <span style={{ fontSize: '0.75rem', color: '#718B73', fontWeight: 600 }}>🚶 Walkthrough</span>
                    <span style={{ fontSize: '0.75rem', color: '#3D8056', fontWeight: 600 }}>📏 Measurable</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: INTERIOR DESIGNER (Section 8) */}
            {showcaseTab === 'interior' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginBottom: '18px' }}>
                <div style={{ height: '280px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E1E7DF' }}>
                  <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80" alt="Interior" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ background: '#FAFAF7', padding: '18px', borderRadius: '12px', border: '1px solid #E1E7DF' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#26332A', marginBottom: '10px' }}>Structured Interior Proposal</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: '#68736A' }}>
                    <div>• <strong>Style:</strong> Modern Minimalist</div>
                    <div>• <strong>Floor:</strong> Italian Marble Mirror Polish</div>
                    <div>• <strong>Walls:</strong> Light neutral Asian Paints Royale</div>
                    <div>• <strong>Ceiling:</strong> Warm LED False ceiling cove</div>
                    <div>• <strong>Sofa:</strong> L-shaped luxury fabric</div>
                    <div>• <strong>TV Wall:</strong> Fluted panel wooden feature wall</div>
                    <div>• <strong>Kitchen:</strong> Acrylic soft-close modular cabinets</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: EXTERIOR DESIGNER (Section 9) */}
            {showcaseTab === 'exterior' && (
              <div style={{ background: '#FAFAF7', padding: '20px', borderRadius: '16px', marginBottom: '18px', border: '1px solid #E1E7DF' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#26332A', marginBottom: '12px' }}>Select Facade Aesthetic</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {['Modern Indian', 'Minimal Contemporary', 'Traditional Heritage', 'Luxury Glass Facade', 'Industrial Brick Veneer'].map((st, i) => (
                    <button
                      key={i}
                      onClick={() => setExteriorStyle(st)}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: exteriorStyle === st ? '1px solid #718B73' : '1px solid #E1E7DF',
                        background: exteriorStyle === st ? '#EAF0E8' : '#FFFFFF',
                        color: exteriorStyle === st ? '#718B73' : '#26332A',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: COST ESTIMATOR (Section 11) */}
            {showcaseTab === 'cost' && (
              <div style={{ background: '#FAFAF7', padding: '20px', borderRadius: '16px', marginBottom: '18px', border: '1px solid #E1E7DF' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#68736A' }}>ENGINEERING ESTIMATE</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#718B73' }}>₹40,25,000</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '0.8rem' }}>
                  <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '8px', border: '1px solid #E1E7DF' }}>Civil Work: <strong style={{ color: '#26332A' }}>₹18,40,000</strong></div>
                  <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '8px', border: '1px solid #E1E7DF' }}>Tata Steel: <strong style={{ color: '#26332A' }}>₹5,20,000</strong></div>
                  <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '8px', border: '1px solid #E1E7DF' }}>Cement (1,240 bags): <strong style={{ color: '#26332A' }}>₹3,10,000</strong></div>
                  <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '8px', border: '1px solid #E1E7DF' }}>Bricks (42k pcs): <strong style={{ color: '#26332A' }}>₹1,80,000</strong></div>
                  <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '8px', border: '1px solid #E1E7DF' }}>MEP Electrical: <strong style={{ color: '#26332A' }}>₹2,40,000</strong></div>
                  <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '8px', border: '1px solid #E1E7DF' }}>Flooring & Finishing: <strong style={{ color: '#26332A' }}>₹4,40,000</strong></div>
                </div>
              </div>
            )}

            {/* TAB: MATERIAL CALCULATOR & MARKETPLACE (Section 12 & 13) */}
            {showcaseTab === 'materials' && (
              <div style={{ background: '#FAFAF7', padding: '20px', borderRadius: '16px', marginBottom: '18px', border: '1px solid #E1E7DF' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#26332A', marginBottom: '12px' }}>Material Quantities & Wholesale Mandi Match</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #E1E7DF' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#26332A' }}>Supplier A (Sri Balaji Materials)</div>
                    <div style={{ fontSize: '0.75rem', color: '#68736A' }}>Available: 1,500 bags UltraTech 53G • Delivery: 2 days</div>
                    <button style={{ background: '#718B73', color: '#FFFFFF', fontWeight: 700, padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.75rem', marginTop: '8px' }}>Request Quote</button>
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #E1E7DF' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#26332A' }}>Supplier B (Venkateshwara Steels)</div>
                    <div style={{ fontSize: '0.75rem', color: '#68736A' }}>Available: 10 tonnes Tata Tiscon Fe550D • Delivery: 3 days</div>
                    <button style={{ background: '#718B73', color: '#FFFFFF', fontWeight: 700, padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.75rem', marginTop: '8px' }}>Request Quote</button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: WORKERS & EQUIPMENT (Section 14 & 15) */}
            {showcaseTab === 'workers' && (
              <div style={{ background: '#FAFAF7', padding: '20px', borderRadius: '16px', marginBottom: '18px', border: '1px solid #E1E7DF' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#26332A', marginBottom: '8px' }}>Workforce & Equipment Planning</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', fontSize: '0.8rem', color: '#68736A' }}>
                  <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '8px', border: '1px solid #E1E7DF' }}>🔨 Masons: <strong style={{ color: '#26332A' }}>4</strong></div>
                  <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '8px', border: '1px solid #E1E7DF' }}>🤝 Helpers: <strong style={{ color: '#26332A' }}>6</strong></div>
                  <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '8px', border: '1px solid #E1E7DF' }}>⚡ Electricians: <strong style={{ color: '#26332A' }}>2</strong></div>
                  <div style={{ background: '#FFFFFF', padding: '10px', borderRadius: '8px', border: '1px solid #E1E7DF' }}>🚰 Plumbers: <strong style={{ color: '#26332A' }}>2</strong></div>
                </div>
                <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#68736A' }}>
                  🚜 Equipment required: JCB 3DX Backhoe, 10/7 Concrete Mixer, Cuplock Scaffolding, High-frequency Vibrator.
                </div>
              </div>
            )}

            {/* TAB: CONSTRUCTION SCHEDULE (Section 16) */}
            {showcaseTab === 'schedule' && (
              <div style={{ background: '#FAFAF7', padding: '20px', borderRadius: '16px', marginBottom: '18px', border: '1px solid #E1E7DF' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#26332A', marginBottom: '4px' }}>Stage-wise Timeline (Estimated duration: 8–10 months)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', marginTop: '12px' }}>
                  {[
                    { phase: 'Site preparation & soil test', dur: '1 week' },
                    { phase: 'Foundation & plinth beam', dur: '4 weeks' },
                    { phase: 'Columns, beams & RCC slabs', dur: '10 weeks' },
                    { phase: 'Brick masonry walls', dur: '5 weeks' },
                    { phase: 'MEP (Electrical & Plumbing)', dur: '5 weeks' },
                    { phase: 'Flooring, painting & finishing', dur: '8 weeks' }
                  ].map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E1E7DF' }}>
                      <span style={{ color: '#26332A' }}>{i + 1}. {p.phase}</span>
                      <span style={{ color: '#3D8056', fontWeight: 700 }}>{p.dur}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Final Action Bar (Section 27) */}
            <div style={{ background: '#EAF0E8', border: '1px solid #E1E7DF', borderRadius: '14px', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#26332A' }}>
                  Ready to start building this project?
                </div>
                <div style={{ fontSize: '0.8rem', color: '#68736A' }}>
                  Post this project to connect Consulting Engineers, Mason Gangs, Equipment and Material Providers.
                </div>
              </div>

              <button
                onClick={handlePostProject}
                style={{
                  background: '#718B73',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(113, 139, 115, 0.25)',
                  whiteSpace: 'nowrap'
                }}
              >
                🚀 Post as Live Construction Project →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
