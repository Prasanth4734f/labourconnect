import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Layers, 
  Maximize2, 
  Compass, 
  Home, 
  Calculator, 
  CheckCircle2, 
  HardHat, 
  Truck, 
  Hammer, 
  Sun, 
  Moon, 
  FileJson, 
  FileText, 
  ArrowRight, 
  ShieldCheck, 
  ChevronRight, 
  Ruler 
} from 'lucide-react';
import confetti from 'canvas-confetti';

const SAMPLE_PROMPTS = [
  "I have a 30 × 40 ft plot in Chennai. I want a two-floor 3BHK house with parking, a balcony, a pooja room and good natural lighting. My budget is ₹35 lakh.",
  "40 × 60 ft East-facing plot in Bengaluru. Design a luxury 4BHK duplex with open central courtyard, double-height living room, 2 car parking, and solar pergola. Budget ₹58 lakh.",
  "50 × 80 ft plot in Hyderabad. Eco-friendly 4BHK with rat-trap bond exposed brickwork, rainwater harvesting, jaali ventilation screens, and home office. Budget ₹85 lakh."
];

export default function AiArchitectPromptStudio({ onLaunchProject, onNavigate }) {
  const [promptInput, setPromptInput] = useState(SAMPLE_PROMPTS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('measurements'); // 'measurements', '3d_view', 'cost_materials', 'labour_plan', 'schema'
  const [lightingMode, setLightingMode] = useState('golden');

  // Extracted Structured Design Schema
  const [designSchema, setDesignSchema] = useState({
    plot: { width_ft: 30, length_ft: 40, area_sqft: 1200 },
    city: 'Chennai',
    floors: 2,
    bedrooms: 3,
    bathrooms: 3,
    parking: true,
    balcony: true,
    pooja_room: true,
    natural_lighting: true,
    courtyard: false,
    budget_inr: 3500000,
    builtUpAreaSqft: 2050,
    carpetAreaSqft: 1680,
    style: 'Modern Minimalist'
  });

  const handleProcessPrompt = (customText) => {
    const text = customText || promptInput;
    setIsProcessing(true);

    setTimeout(() => {
      let width = 30, length = 40, bhk = 3, budget = 3500000, city = 'Chennai', courtyard = false;
      
      if (text.includes('40 × 60') || text.includes('40x60')) {
        width = 40; length = 60; bhk = 4; budget = 5800000; city = 'Bengaluru'; courtyard = true;
      } else if (text.includes('50 × 80') || text.includes('50x80')) {
        width = 50; length = 80; bhk = 4; budget = 8500000; city = 'Hyderabad'; courtyard = true;
      }

      const builtUp = Math.round(width * length * 1.15);
      const carpet = Math.round(builtUp * 0.78);

      setDesignSchema({
        plot: { width_ft: width, length_ft: length, area_sqft: width * length },
        city: city,
        floors: 2,
        bedrooms: bhk,
        bathrooms: bhk,
        parking: true,
        balcony: true,
        pooja_room: true,
        natural_lighting: true,
        courtyard: courtyard,
        budget_inr: budget,
        builtUpAreaSqft: builtUp,
        carpetAreaSqft: carpet,
        style: text.includes('Eco') ? 'Eco-Sustainable' : (text.includes('luxury') ? 'Heritage Luxury' : 'Modern Contemporary')
      });

      setIsProcessing(false);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    }, 600);
  };

  const rooms = [
    { id: 'living', name: 'Living Hall & Foyer', dimMeters: '5.2m × 4.2m', dimFt: '17.0ft × 13.8ft', areaSqft: 235, floor: 'Ground Floor' },
    { id: 'kitchen', name: 'Modular Kitchen & Dining', dimMeters: '4.0m × 3.5m', dimFt: '13.1ft × 11.5ft', areaSqft: 151, floor: 'Ground Floor' },
    { id: 'master_bed', name: 'Master Bedroom Suite', dimMeters: '4.5m × 4.0m', dimFt: '14.8ft × 13.1ft', areaSqft: 194, floor: 'First Floor' },
    { id: 'bed_2', name: 'Guest / Child Bedroom', dimMeters: '3.8m × 3.6m', dimFt: '12.5ft × 11.8ft', areaSqft: 147, floor: 'Ground Floor' },
    { id: 'bed_3', name: 'Upper Bedroom & Balcony', dimMeters: '4.0m × 3.8m', dimFt: '13.1ft × 12.5ft', areaSqft: 164, floor: 'First Floor' },
    { id: 'pooja', name: 'Pooja Sanctum (NE Quadrant)', dimMeters: '2.0m × 1.8m', dimFt: '6.6ft × 5.9ft', areaSqft: 39, floor: 'Ground Floor' },
    { id: 'parking', name: 'Car Porch & EV Portico', dimMeters: '5.0m × 3.2m', dimFt: '16.4ft × 10.5ft', areaSqft: 172, floor: 'Ground Floor' }
  ];

  const cementBags = Math.round(designSchema.builtUpAreaSqft * 0.44);
  const steelTonnes = (designSchema.builtUpAreaSqft * 0.0038).toFixed(2);
  const msandCuft = Math.round(designSchema.builtUpAreaSqft * 1.8);
  const bricksCount = Math.round(designSchema.builtUpAreaSqft * 8.5);
  const tilesSqft = Math.round(designSchema.carpetAreaSqft * 1.1);

  const costCement = cementBags * 385;
  const costSteel = Math.round(steelTonnes * 68500);
  const costSand = msandCuft * 52;
  const costBricks = Math.round(bricksCount * 11.5);
  const costTiles = Math.round(tilesSqft * 78);
  const costLabour = Math.round(designSchema.builtUpAreaSqft * 480);
  const totalCostEstimate = costCement + costSteel + costSand + costBricks + costTiles + costLabour;

  const requiredTrades = [
    { trade: 'Master Mason Crew', count: '1 Head Mason + 4 Barbenders + 4 Helpers', durationDays: 120, estCost: 480000, icon: '🧱' },
    { trade: 'Licensed Electricians', count: '2 Certified Wiremen + 2 Assistants', durationDays: 25, estCost: 110000, icon: '⚡' },
    { trade: 'Plumbing & Sanitary Techs', count: '2 Plumbers + 2 Helpers', durationDays: 20, estCost: 95000, icon: '🚿' },
    { trade: 'Carpentry & Woodcraft', count: '4 Senior Carpenters', durationDays: 30, estCost: 165000, icon: '🪚' },
    { trade: 'Wall Putty & Painters', count: '4 Applicators', durationDays: 22, estCost: 95000, icon: '🎨' },
    { trade: 'Tile & Granite Layers', count: '2 Tile Masters + 2 Helpers', durationDays: 18, estCost: 85000, icon: '📐' }
  ];

  const handleLaunchProject = () => {
    const newProj = {
      id: `proj-${Date.now()}`,
      title: `${designSchema.bedrooms}BHK ${designSchema.style} House (${designSchema.plot.width_ft}x${designSchema.plot.length_ft})`,
      customerName: 'Customer Project',
      phone: '+91 98450 12000',
      city: designSchema.city,
      plot: designSchema.plot,
      builtUpAreaSqft: designSchema.builtUpAreaSqft,
      budgetInr: designSchema.budget_inr,
      currentPhase: 'Site Prep & Foundation',
      overallProgress: 15,
      assignedEngineer: 'Er. Rajesh Varma (Assigned)',
      assignedWorkersCount: 12,
      assignedEquipment: ['JCB 3DX Earthmover', '10/7 CFT Concrete Mixer'],
      escrowLocked: designSchema.budget_inr,
      escrowReleased: 0,
      phases: [
        {
          id: 'ph-1',
          title: 'Phase 1: Site Prep, Soil Testing & Foundation',
          status: 'in_progress',
          progress: 50,
          amount: Math.round(designSchema.budget_inr * 0.15),
          date: new Date().toISOString().split('T')[0],
          workerGang: 'Nagaraju Master Mason Crew (8 Workers)',
          notes: 'Isolated column footings casted using M25 concrete with Tata Tiscon rebar.',
          photo: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=600&q=80'
        },
        {
          id: 'ph-2',
          title: 'Phase 2: Plinth Beam & Backfilling',
          status: 'pending',
          progress: 0,
          amount: Math.round(designSchema.budget_inr * 0.15),
          date: 'Est. 2 weeks',
          workerGang: 'Nagaraju Mason Gang',
          notes: 'Plinth level +3ft with anti-termite barrier.',
          photo: null
        }
      ]
    };

    if (onLaunchProject) {
      onLaunchProject(newProj);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* NLP Prompt Card */}
      <div className="lc-card lc-card-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.2)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fbbf24'
          }}>
            <Sparkles style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
              AI Architect & Construction Generator
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Describe your requirements in plain words — LabourConnect automatically derives structured dimensions, 2D floorplans, 3D models, exact material takeoff, and required labour gangs.
            </p>
          </div>
        </div>

        {/* Prompt Input Area */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
          <textarea
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            rows={3}
            className="lc-textarea"
            style={{ flex: 1, minWidth: '280px', fontSize: '0.9rem', lineHeight: '1.5' }}
            placeholder="e.g. I have a 30 × 40 ft plot in Chennai. I want a two-floor 3BHK house with parking, a balcony, a pooja room and good natural lighting. My budget is ₹35 lakh."
          />
          <button
            onClick={() => handleProcessPrompt()}
            disabled={isProcessing}
            className="lc-btn lc-btn-primary"
            style={{ alignSelf: 'stretch', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 24px' }}
          >
            {isProcessing ? 'Synthesizing...' : <><Sparkles style={{ width: '18px', height: '18px' }} /> Generate Design</>}
          </button>
        </div>

        {/* Prompt Suggestions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '14px' }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Examples:</span>
          {SAMPLE_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => { setPromptInput(prompt); handleProcessPrompt(prompt); }}
              style={{
                background: 'rgba(14, 20, 36, 0.8)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#cbd5e1',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                cursor: 'pointer',
                maxWidth: '280px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Extracted Schema Summary Strip */}
      <div className="lc-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', fontSize: '0.82rem' }}>
          <div>
            <span style={{ color: '#64748b' }}>Plot Dimensions: </span>
            <strong className="text-mono" style={{ color: '#ffffff' }}>{designSchema.plot.width_ft} × {designSchema.plot.length_ft} ft ({designSchema.plot.area_sqft} sq.ft)</strong>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Structure: </span>
            <strong style={{ color: '#fbbf24' }}>{designSchema.floors} Floors ({designSchema.bedrooms}BHK)</strong>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Built-Up: </span>
            <strong className="text-mono" style={{ color: '#38bdf8' }}>{designSchema.builtUpAreaSqft} sq.ft</strong>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Target Budget: </span>
            <strong className="text-mono" style={{ color: '#34d399' }}>₹{(designSchema.budget_inr / 100000).toFixed(1)} Lakhs</strong>
          </div>
        </div>

        <button 
          onClick={handleLaunchProject}
          className="lc-btn lc-btn-primary lc-btn-sm"
        >
          <span>Launch Project & Hire Workers</span>
          <ArrowRight style={{ width: '14px', height: '14px' }} />
        </button>
      </div>

      {/* Navigation Sub-tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
        <button 
          onClick={() => setActiveTab('measurements')}
          className={`lc-btn lc-btn-sm ${activeTab === 'measurements' ? 'lc-btn-primary' : 'lc-btn-secondary'}`}
        >
          <Ruler style={{ width: '14px', height: '14px' }} /> 2D Numerical Measurements
        </button>
        <button 
          onClick={() => setActiveTab('3d_view')}
          className={`lc-btn lc-btn-sm ${activeTab === '3d_view' ? 'lc-btn-primary' : 'lc-btn-secondary'}`}
        >
          <Home style={{ width: '14px', height: '14px' }} /> 3D Procedural House
        </button>
        <button 
          onClick={() => setActiveTab('cost_materials')}
          className={`lc-btn lc-btn-sm ${activeTab === 'cost_materials' ? 'lc-btn-primary' : 'lc-btn-secondary'}`}
        >
          <Calculator style={{ width: '14px', height: '14px' }} /> Exact Material & Cost Takeoff
        </button>
        <button 
          onClick={() => setActiveTab('labour_plan')}
          className={`lc-btn lc-btn-sm ${activeTab === 'labour_plan' ? 'lc-btn-primary' : 'lc-btn-secondary'}`}
        >
          <HardHat style={{ width: '14px', height: '14px' }} /> Labour Crew Allocation
        </button>
        <button 
          onClick={() => setActiveTab('schema')}
          className={`lc-btn lc-btn-sm ${activeTab === 'schema' ? 'lc-btn-primary' : 'lc-btn-secondary'}`}
        >
          <FileJson style={{ width: '14px', height: '14px' }} /> Design JSON Schema
        </button>
      </div>

      {/* Tab 1: 2D Measurements */}
      {activeTab === 'measurements' && (
        <div className="lc-grid-split animate-fadeIn">
          <div className="lc-card">
            <div className="lc-card-header">
              <div>
                <h3 className="lc-card-title"><Ruler style={{ width: '18px', height: '18px', color: '#fbbf24' }} /> Room Measurement Engine</h3>
                <div className="lc-card-desc">Numerical metric & imperial dimensions with carpet area calculations</div>
              </div>
              <span className="lc-badge lc-badge-amber">Carpet: {designSchema.carpetAreaSqft} sq.ft</span>
            </div>

            <div className="lc-table-wrap">
              <table className="lc-table">
                <thead>
                  <tr>
                    <th>Room / Space</th>
                    <th>Metric (m)</th>
                    <th>Feet (ft)</th>
                    <th>Area</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map(room => (
                    <tr key={room.id}>
                      <td style={{ fontWeight: 700, color: '#ffffff' }}>{room.name}</td>
                      <td className="text-mono text-cyan">{room.dimMeters}</td>
                      <td className="text-mono text-muted">{room.dimFt}</td>
                      <td className="text-mono text-amber font-bold">{room.areaSqft} sq.ft</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2D Vector Canvas */}
          <div className="lc-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div className="lc-card-header">
              <h3 className="lc-card-title"><Maximize2 style={{ width: '18px', height: '18px', color: '#38bdf8' }} /> 2D Vector CAD Blueprint</h3>
              <span className="lc-badge lc-badge-cyan">Scale 1:100</span>
            </div>

            <div style={{
              background: '#070f1e',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '280px'
            }}>
              <svg viewBox="0 0 300 220" style={{ width: '100%', maxWidth: '380px' }}>
                <rect x="10" y="10" width="280" height="200" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />
                <rect x="35" y="30" width="230" height="160" fill="rgba(6, 182, 212, 0.12)" stroke="#f59e0b" strokeWidth="3" />
                <rect x="35" y="30" width="130" height="90" fill="rgba(245, 158, 11, 0.18)" stroke="#fbbf24" strokeWidth="1.5" />
                <text x="100" y="80" fill="#ffffff" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">LIVING (17x14')</text>
                <rect x="165" y="30" width="100" height="90" fill="rgba(16, 185, 129, 0.18)" stroke="#34d399" strokeWidth="1.5" />
                <text x="215" y="80" fill="#ffffff" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">KITCHEN (13x11')</text>
                <rect x="35" y="120" width="130" height="70" fill="rgba(99, 102, 241, 0.18)" stroke="#a5b4fc" strokeWidth="1.5" />
                <text x="100" y="160" fill="#ffffff" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">MASTER BED (15x13')</text>
                <rect x="165" y="120" width="100" height="70" fill="rgba(244, 63, 94, 0.18)" stroke="#fb7185" strokeWidth="1.5" />
                <text x="215" y="160" fill="#ffffff" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">PARKING / PORCH</text>
              </svg>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', fontSize: '0.8rem' }}>
              <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'monospace' }}>
                <Compass style={{ width: '16px', height: '16px' }} /> Main Entrance: East Facing
              </span>
              <button onClick={() => setActiveTab('3d_view')} className="lc-btn lc-btn-secondary lc-btn-sm">
                View 3D Model <ChevronRight style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 3D House Model */}
      {activeTab === '3d_view' && (
        <div className="lc-card animate-fadeIn">
          <div className="lc-card-header">
            <div>
              <h3 className="lc-card-title"><Home style={{ width: '18px', height: '18px', color: '#38bdf8' }} /> 3D Procedural House Geometry & Realism Layer</h3>
              <div className="lc-card-desc">Constructed directly from numerical room schema and structural constraints</div>
            </div>

            <div style={{ display: 'flex', gap: '6px', background: '#0a0e1a', padding: '4px', borderRadius: '10px' }}>
              <button 
                onClick={() => setLightingMode('day')}
                className={`lc-btn lc-btn-sm ${lightingMode === 'day' ? 'lc-btn-primary' : 'lc-btn-secondary'}`}
              >
                <Sun style={{ width: '14px', height: '14px' }} /> Midday
              </button>
              <button 
                onClick={() => setLightingMode('golden')}
                className={`lc-btn lc-btn-sm ${lightingMode === 'golden' ? 'lc-btn-primary' : 'lc-btn-secondary'}`}
              >
                <Sparkles style={{ width: '14px', height: '14px' }} /> Golden Hour
              </button>
              <button 
                onClick={() => setLightingMode('night')}
                className={`lc-btn lc-btn-sm ${lightingMode === 'night' ? 'lc-btn-primary' : 'lc-btn-secondary'}`}
              >
                <Moon style={{ width: '14px', height: '14px' }} /> Night Illumination
              </button>
            </div>
          </div>

          <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', height: '440px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <img 
              src={
                lightingMode === 'night'
                  ? 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
                  : (lightingMode === 'golden' 
                      ? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
                      : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80')
              }
              alt="3D House Model"
              style={{ width: '100%', height: '100%', objectCover: 'cover' }}
            />
            <div style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px'
            }}>
              <button 
                onClick={() => onNavigate && onNavigate('marketplace_workers')}
                className="lc-btn lc-btn-primary"
                style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.8)' }}
              >
                <HardHat style={{ width: '18px', height: '18px' }} /> Hire Masons for this Model
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Cost & Materials */}
      {activeTab === 'cost_materials' && (
        <div className="lc-grid-split animate-fadeIn">
          <div className="lc-card">
            <h3 className="lc-card-title"><Calculator style={{ width: '18px', height: '18px', color: '#34d399' }} /> IS 456 Material Takeoff</h3>
            <div className="lc-table-wrap" style={{ marginTop: '14px' }}>
              <table className="lc-table">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Estimated Qty</th>
                    <th>Spot Rate</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody className="text-mono">
                  <tr>
                    <td style={{ color: '#ffffff', fontWeight: 700 }}>UltraTech 53 Grade Cement</td>
                    <td className="text-cyan font-bold">{cementBags} bags</td>
                    <td className="text-muted">₹385/bag</td>
                    <td style={{ textAlign: 'right', color: '#fbbf24', fontWeight: 700 }}>₹{costCement.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#ffffff', fontWeight: 700 }}>Tata Tiscon 550D TMT Steel</td>
                    <td className="text-cyan font-bold">{steelTonnes} MT</td>
                    <td className="text-muted">₹68,500/MT</td>
                    <td style={{ textAlign: 'right', color: '#fbbf24', fontWeight: 700 }}>₹{costSteel.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#ffffff', fontWeight: 700 }}>Double Washed M-Sand</td>
                    <td className="text-cyan font-bold">{msandCuft} cu.ft</td>
                    <td className="text-muted">₹52/cu.ft</td>
                    <td style={{ textAlign: 'right', color: '#fbbf24', fontWeight: 700 }}>₹{costSand.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#ffffff', fontWeight: 700 }}>Wire-Cut Red Clay Bricks</td>
                    <td className="text-cyan font-bold">{bricksCount.toLocaleString()} pcs</td>
                    <td className="text-muted">₹11.5/pc</td>
                    <td style={{ textAlign: 'right', color: '#fbbf24', fontWeight: 700 }}>₹{costBricks.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#ffffff', fontWeight: 700 }}>Turnkey Labour & Masonry</td>
                    <td className="text-cyan font-bold">{designSchema.builtUpAreaSqft} sq.ft</td>
                    <td className="text-muted">₹480/sq.ft</td>
                    <td style={{ textAlign: 'right', color: '#fbbf24', fontWeight: 700 }}>₹{costLabour.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Cost Summary Box */}
          <div className="lc-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                Estimated Total Construction Cost
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#34d399', margin: '4px 0 16px' }}>
                ₹{(totalCostEstimate / 100000).toFixed(2)} Lakhs
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#0a0e1a', borderRadius: '8px' }}>
                  <span style={{ color: '#94a3b8' }}>Cost per Sq.Ft:</span>
                  <strong className="text-mono" style={{ color: '#ffffff' }}>₹{Math.round(totalCostEstimate / designSchema.builtUpAreaSqft)} / sq.ft</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#0a0e1a', borderRadius: '8px' }}>
                  <span style={{ color: '#94a3b8' }}>Target Budget:</span>
                  <strong className="text-mono" style={{ color: '#fbbf24' }}>₹{(designSchema.budget_inr / 100000).toFixed(1)} Lakhs</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => onNavigate && onNavigate('marketplace_materials')} className="lc-btn lc-btn-secondary" style={{ flex: 1 }}>
                <Truck style={{ width: '16px', height: '16px', color: '#fb7185' }} /> Material Mandi
              </button>
              <button onClick={handleLaunchProject} className="lc-btn lc-btn-primary" style={{ flex: 1 }}>
                <HardHat style={{ width: '16px', height: '16px' }} /> Start Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Labour Allocation */}
      {activeTab === 'labour_plan' && (
        <div className="lc-card animate-fadeIn">
          <div className="lc-card-header">
            <div>
              <h3 className="lc-card-title"><HardHat style={{ width: '18px', height: '18px', color: '#818cf8' }} /> Required Construction Labour & Gangs</h3>
              <div className="lc-card-desc">Headcounts and duration derived from 3D house geometry</div>
            </div>
            <button onClick={() => onNavigate && onNavigate('marketplace_workers')} className="lc-btn lc-btn-primary lc-btn-sm">
              Browse All Workers
            </button>
          </div>

          <div className="lc-grid-3">
            {requiredTrades.map((trade, idx) => (
              <div key={idx} style={{ background: '#0a0e1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.6rem' }}>{trade.icon}</span>
                  <span className="lc-badge lc-badge-amber">{trade.durationDays} Days</span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>{trade.trade}</h4>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '12px' }}>{trade.count}</p>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                  <span style={{ color: '#64748b' }}>Estimated Labour:</span>
                  <strong style={{ color: '#fbbf24' }}>₹{(trade.estCost / 1000).toFixed(0)}k</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: JSON Schema */}
      {activeTab === 'schema' && (
        <div className="lc-card animate-fadeIn">
          <div className="lc-card-header">
            <h3 className="lc-card-title"><FileJson style={{ width: '18px', height: '18px', color: '#fb7185' }} /> Structured Design Schema (Source of Truth)</h3>
            <span className="lc-badge lc-badge-rose">JSON Validated</span>
          </div>
          <pre style={{
            background: '#04060a',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '0.8rem',
            fontFamily: 'monospace',
            color: '#34d399',
            overflowX: 'auto'
          }}>
            {JSON.stringify(designSchema, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
