import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  Compass, 
  Building, 
  CheckCircle2, 
  Download, 
  Maximize2, 
  Sun, 
  Eye, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Sliders,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Elevation3DViewer from './Elevation3DViewer';

export default function AiDesignScreen({ onPostProject, onNavigate }) {
  // 1. Prompt State
  const [prompt, setPrompt] = useState('Design a modern luxury 3BHK East-facing duplex villa with open-concept living, Italian marble foyer, terrace garden, and double-height ceiling.');
  
  // 2. Dropdown Extracted Details
  const [plotDimensions, setPlotDimensions] = useState('40x60'); // 30x40, 40x60, 50x80, 30x50
  const [floors, setFloors] = useState('G+1'); // Ground, G+1, G+2, G+3
  const [bhkConfig, setBhkConfig] = useState('3BHK'); // 2BHK, 3BHK, 4BHK, 5BHK
  const [archStyle, setArchStyle] = useState('Modern Minimalist'); // Modern Minimalist, Contemporary Luxury, Kerala Vernacular, Scandinavian Glass
  const [vaastuDirection, setVaastuDirection] = useState('East Facing (100% Vaastu Compliant)');
  const [budgetTier, setBudgetTier] = useState('Premium Luxury (₹2,400 / sq.ft)');
  const [soilType, setSoilType] = useState('Hard Rock / Compact Gravel');
  const [parkingType, setParkingType] = useState('Covered 2-Car Porch + EV Station');

  // 3. Generation & View Mode: '2d', '3d', 'dimensions', 'boq'
  const [activeOutputTab, setActiveOutputTab] = useState('3d');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSuccess, setGeneratedSuccess] = useState(true);
  const [generationType, setGenerationType] = useState('3D Model & Elevation'); // '2D Floor Plan' or '3D Model & Elevation'

  // Presets
  const promptPresets = [
    'Modern 3BHK East-Facing Duplex with internal courtyard and terrace garden',
    'Contemporary 4BHK Villa with double-height ceiling and glass cantilever balcony',
    'Eco-friendly Kerala Vernacular 3BHK with clay roof tiles and open veranda',
    'Sleek Minimalist 2BHK with compact efficient layout and rooftop solar pergola'
  ];

  // Calculated estimates
  const plotArea = plotDimensions === '30x40' ? 1200 : plotDimensions === '40x60' ? 2400 : plotDimensions === '50x80' ? 4000 : 1500;
  const builtupArea = Math.round(plotArea * (floors === 'Ground' ? 0.75 : floors === 'G+1' ? 1.5 : floors === 'G+2' ? 2.1 : 2.7));
  const ratePerSqft = budgetTier.includes('1,800') ? 1800 : budgetTier.includes('2,400') ? 2400 : 3200;
  const estimatedTotalCost = (builtupArea * ratePerSqft) / 100000; // In Lakhs

  // Handle 2D Generation
  const handleGenerate2D = () => {
    setIsGenerating(true);
    setGenerationType('2D Architectural Blueprint');
    setTimeout(() => {
      setIsGenerating(false);
      setActiveOutputTab('2d');
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }, 900);
  };

  // Handle 3D Generation
  const handleGenerate3D = () => {
    setIsGenerating(true);
    setGenerationType('3D Photorealistic Elevation');
    setTimeout(() => {
      setIsGenerating(false);
      setActiveOutputTab('3d');
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
    }, 1100);
  };

  // Save to My Projects
  const handleSaveToProject = () => {
    const newProject = {
      id: `proj-${Date.now()}`,
      title: `${archStyle} ${bhkConfig} Villa`,
      subtitle: `${floors} • ${vaastuDirection} • ${builtupArea} sq.ft Built-up`,
      location: 'Chennai Zone',
      plotDimensions: `${plotDimensions.replace('x', ' × ')} ft`,
      plotAreaSqft: plotArea,
      floors: floors === 'Ground' ? 1 : floors === 'G+1' ? 2 : 3,
      bedrooms: parseInt(bhkConfig.charAt(0)) || 3,
      progressPercent: 0,
      currentPhase: 'Design Finalized & Municipal Permit Ready',
      estimatedCost: `₹${estimatedTotalCost.toFixed(1)} Lakhs`,
      designVersion: 'AI 2.0 Pro',
      image: activeOutputTab === '3d' 
        ? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
        : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
    };

    if (onPostProject) {
      onPostProject(newProject);
    }
    alert(`🎉 "${newProject.title}" saved successfully to your Projects Workspace!`);
    if (onNavigate) {
      onNavigate('projects');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1360px', margin: '0 auto', padding: '10px 0 60px' }}>
      
      {/* Studio Header */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #101522 0%, #181d2f 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          padding: '28px 32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(245, 158, 11, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.4rem' }}>✨</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Generative AI Architectural Studio
            </span>
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
            AI 2D Floor Plan & 3D Elevation Generator
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#94a3b8', margin: '6px 0 0' }}>
            Enter your house design prompt, configure plot parameters, and generate instant CAD blueprints & photorealistic 3D elevations.
          </p>
        </div>

        {/* Live Estimation Badge */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '14px', padding: '12px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 700 }}>Built-up Area</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', fontFamily: 'monospace' }}>{builtupArea} sq.ft</div>
          </div>
          <div style={{ background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: '14px', padding: '12px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 700 }}>Estimated Cost</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#34d399', fontFamily: 'monospace' }}>₹{estimatedTotalCost.toFixed(1)}L</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Inputs & Details Extractor | Right Visualizer Canvas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 480px) 1fr', gap: '28px', alignItems: 'start' }}>
        
        {/* ========================================================
            LEFT COLUMN: PROMPT & PARAMETERS EXTRACTION
        ======================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Prompt Box */}
          <div style={{ background: '#101522', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '24px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Sparkles style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
              <span>Describe Your Dream House (Prompt)</span>
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Modern 3BHK duplex with swimming pool, large glass windows, and open kitchen..."
              style={{
                width: '100%',
                background: '#0b0f19',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: '12px',
                padding: '14px',
                color: '#ffffff',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                outline: 'none',
                resize: 'none',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
              }}
            />


          </div>

          {/* Details Extraction Dropdowns */}
          <div style={{ background: '#101522', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders style={{ width: '16px', height: '16px', color: '#38bdf8' }} />
              <span>Architectural Specifications & Parameters</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Row 1: Plot Size & Floors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                    Plot Dimensions
                  </label>
                  <select
                    value={plotDimensions}
                    onChange={(e) => setPlotDimensions(e.target.value)}
                    style={{ width: '100%', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px 10px', color: '#ffffff', fontSize: '0.82rem', outline: 'none' }}
                  >
                    <option value="30x40">30 × 40 ft (1,200 sq.ft)</option>
                    <option value="40x60">40 × 60 ft (2,400 sq.ft)</option>
                    <option value="50x80">50 × 80 ft (4,000 sq.ft)</option>
                    <option value="30x50">30 × 50 ft (1,500 sq.ft)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                    Number of Floors
                  </label>
                  <select
                    value={floors}
                    onChange={(e) => setFloors(e.target.value)}
                    style={{ width: '100%', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px 10px', color: '#ffffff', fontSize: '0.82rem', outline: 'none' }}
                  >
                    <option value="Ground">Ground Floor Only (G)</option>
                    <option value="G+1">Ground + 1 Floor Duplex (G+1)</option>
                    <option value="G+2">Ground + 2 Floors Triplex (G+2)</option>
                    <option value="G+3">Multi-Storey Villa (G+3)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: BHK & Architectural Style */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                    Configuration (BHK)
                  </label>
                  <select
                    value={bhkConfig}
                    onChange={(e) => setBhkConfig(e.target.value)}
                    style={{ width: '100%', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px 10px', color: '#ffffff', fontSize: '0.82rem', outline: 'none' }}
                  >
                    <option value="2BHK">2 BHK Independent</option>
                    <option value="3BHK">3 BHK Luxury Villa</option>
                    <option value="4BHK">4 BHK Signature Duplex</option>
                    <option value="5BHK">5 BHK Ultra Mansion</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                    Architectural Style
                  </label>
                  <select
                    value={archStyle}
                    onChange={(e) => setArchStyle(e.target.value)}
                    style={{ width: '100%', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px 10px', color: '#ffffff', fontSize: '0.82rem', outline: 'none' }}
                  >
                    <option value="Modern Minimalist">Modern Minimalist</option>
                    <option value="Contemporary Luxury">Contemporary Luxury</option>
                    <option value="Kerala Vernacular">Kerala Vernacular</option>
                    <option value="Traditional Chettinad">Traditional Chettinad</option>
                    <option value="Scandinavian Glass">Scandinavian Glass</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Vaastu & Facing Direction */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                  Vaastu Orientation & Entry
                </label>
                <select
                  value={vaastuDirection}
                  onChange={(e) => setVaastuDirection(e.target.value)}
                  style={{ width: '100%', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px 10px', color: '#ffffff', fontSize: '0.82rem', outline: 'none' }}
                >
                  <option value="East Facing (100% Vaastu Compliant)">East Facing (100% Vedic Vaastu Compliant)</option>
                  <option value="North Facing (Kuber Wealth Zone)">North Facing (Kuber Wealth Zone)</option>
                  <option value="North-East Facing (Ishanya Entry)">North-East Facing (Ishanya Entry)</option>
                  <option value="West Facing (Modern Aesthetic)">West Facing (Modern Aesthetic)</option>
                </select>
              </div>

              {/* Row 4: Budget Tier & Soil Foundation */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                    Construction Budget Tier
                  </label>
                  <select
                    value={budgetTier}
                    onChange={(e) => setBudgetTier(e.target.value)}
                    style={{ width: '100%', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px 10px', color: '#ffffff', fontSize: '0.82rem', outline: 'none' }}
                  >
                    <option value="Standard Economy (₹1,800 / sq.ft)">Standard (₹1,800/sq.ft)</option>
                    <option value="Premium Luxury (₹2,400 / sq.ft)">Premium (₹2,400/sq.ft)</option>
                    <option value="Ultra Elite (₹3,200 / sq.ft)">Ultra Elite (₹3,200/sq.ft)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                    Soil & Strata Type
                  </label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    style={{ width: '100%', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px 10px', color: '#ffffff', fontSize: '0.82rem', outline: 'none' }}
                  >
                    <option value="Hard Rock / Compact Gravel">Hard Rock / Gravel (SBC &gt; 250 kN/m²)</option>
                    <option value="Red Clay Strata">Red Clay (SBC 180 kN/m²)</option>
                    <option value="Black Cotton Soil">Black Cotton Soil (Under-reamed piles)</option>
                    <option value="Sandy Coastal Soil">Sandy Soil (Raft Foundation)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              TWO PROMINENT GENERATE BUTTONS (2D & 3D)
          ======================================================== */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Button 1: 2D Floor Plan */}
            <button
              onClick={handleGenerate2D}
              disabled={isGenerating}
              style={{
                background: activeOutputTab === '2d' 
                  ? 'linear-gradient(135deg, #38bdf8, #0284c7)' 
                  : '#101522',
                border: '1px solid #38bdf8',
                color: activeOutputTab === '2d' ? '#080b11' : '#38bdf8',
                padding: '16px',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 8px 24px rgba(56, 189, 248, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.2rem' }}>📐</span>
                <span>Generate 2D Floor Plan</span>
              </div>
              <span style={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: 600 }}>
                CAD Blueprint & Vaastu Measurements
              </span>
            </button>

            {/* Button 2: 3D Elevation */}
            <button
              onClick={handleGenerate3D}
              disabled={isGenerating}
              style={{
                background: activeOutputTab === '3d' 
                  ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
                  : '#101522',
                border: '1px solid #f59e0b',
                color: activeOutputTab === '3d' ? '#080b11' : '#f59e0b',
                padding: '16px',
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.2rem' }}>🏢</span>
                <span>Generate 3D Elevation</span>
              </div>
              <span style={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: 600 }}>
                Photorealistic Exterior & Walkthrough
              </span>
            </button>
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN: INTERACTIVE VISUALIZER & OUTPUT CANVAS
        ======================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: '#101522', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            
            {/* Canvas Header & Tabs */}
            <div style={{ padding: '16px 24px', background: '#0b0f19', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { id: '3d', label: '3D Elevation View', icon: '🏢' },
                  { id: '2d', label: '2D CAD Floor Plan', icon: '📐' },
                  { id: 'dimensions', label: 'Room Dimensions', icon: '📏' },
                  { id: 'boq', label: 'BOQ Cost Breakdown', icon: '💰' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveOutputTab(tab.id)}
                    style={{
                      background: activeOutputTab === tab.id ? '#f59e0b' : 'rgba(255, 255, 255, 0.04)',
                      color: activeOutputTab === tab.id ? '#080b11' : '#94a3b8',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Status Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#34d399', fontWeight: 700 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
                <span>AI Rendering Engine v2.0 Ready</span>
              </div>
            </div>

            {/* Canvas Main Render Body */}
            <div style={{ minHeight: '440px', position: 'relative', background: '#060910', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              
              {isGenerating ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '4px solid rgba(245, 158, 11, 0.2)', borderTopColor: '#f59e0b', animation: 'spin 1s linear infinite', margin: '0 auto 18px' }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
                    Synthesizing {generationType}...
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    Applying {vaastuDirection} orientation, {archStyle} textures, and IS 456 dimensional clearance.
                  </p>
                </div>
              ) : (
                <>
                  {/* 1. 3D ELEVATION VIEW */}
                  {activeOutputTab === '3d' && (
                    <div style={{ width: '100%', minHeight: '480px', position: 'relative' }}>
                      <Elevation3DViewer
                        budgetInr={estimatedTotalCost * 100000}
                        bhk={parseInt(bhkConfig.charAt(0)) || 3}
                        floors={floors === 'Ground' ? 1 : floors === 'G+1' ? 2 : floors === 'G+2' ? 3 : 4}
                        plotWidth={plotDimensions === '30x40' ? 30 : plotDimensions === '40x60' ? 40 : plotDimensions === '50x80' ? 50 : 30}
                        plotLength={plotDimensions === '30x40' ? 40 : plotDimensions === '40x60' ? 60 : plotDimensions === '50x80' ? 80 : 50}
                        style={archStyle.toLowerCase().includes('minimalist') ? 'minimalist' : archStyle.toLowerCase().includes('kerala') ? 'kerala_vernacular' : 'modern_luxury'}
                        facing={vaastuDirection.includes('East') ? 'East' : vaastuDirection.includes('North') ? 'North' : 'West'}
                        prompt={prompt}
                      />
                    </div>
                  )}

                  {/* 2. 2D CAD BLUEPRINT VIEW */}
                  {activeOutputTab === '2d' && (
                    <div style={{ width: '100%', padding: '24px', background: '#070b14', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ border: '2px dashed rgba(56, 189, 248, 0.4)', borderRadius: '14px', padding: '20px', background: 'rgba(56, 189, 248, 0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                          <span style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.85rem', fontFamily: 'monospace' }}>2D ARCHITECTURAL FLOOR PLAN (SCALE 1:100)</span>
                          <span style={{ color: '#fbbf24', fontSize: '0.78rem', fontWeight: 700 }}>Plot: {plotDimensions} ft ({plotArea} sq.ft)</span>
                        </div>

                        {/* Interactive Blueprint Schematic Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', minHeight: '260px' }}>
                          <div style={{ border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', padding: '12px', background: 'rgba(56, 189, 248, 0.06)' }}>
                            <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, display: 'block' }}>FOYER & PORTICO</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>12 × 10 ft</span>
                            <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>East Main Entry (Vaastu)</span>
                          </div>

                          <div style={{ border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', padding: '12px', background: 'rgba(56, 189, 248, 0.06)', gridColumn: 'span 2' }}>
                            <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, display: 'block' }}>LIVING & DOUBLE HEIGHT HALL</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>22 × 16 ft (352 sq.ft)</span>
                            <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>North-East Well-Lit Zone</span>
                          </div>

                          <div style={{ border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', padding: '12px', background: 'rgba(56, 189, 248, 0.06)' }}>
                            <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, display: 'block' }}>MODULAR KITCHEN</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>12 × 14 ft</span>
                            <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>South-East Agni Zone</span>
                          </div>

                          <div style={{ border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', padding: '12px', background: 'rgba(56, 189, 248, 0.06)' }}>
                            <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, display: 'block' }}>DINING ROOM</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>14 × 12 ft</span>
                            <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>Courtyard Connected</span>
                          </div>

                          <div style={{ border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', padding: '12px', background: 'rgba(56, 189, 248, 0.06)' }}>
                            <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, display: 'block' }}>MASTER BEDROOM</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>16 × 14 ft + En-suite</span>
                            <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>South-West Nairuthi Zone</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. ROOM DIMENSIONS SPEC */}
                  {activeOutputTab === 'dimensions' && (
                    <div style={{ width: '100%', padding: '24px' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px' }}>
                        Architectural Space Allocation & Schedule
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        {[
                          { name: 'Master Bedroom', dim: '16 × 14 ft', area: '224 sq.ft', zone: 'South-West', finish: 'Italian Vitrified Tile' },
                          { name: 'Bedroom 2 (Guest)', dim: '14 × 12 ft', area: '168 sq.ft', zone: 'North-West', finish: 'Wooden Texture GVT' },
                          { name: 'Bedroom 3 (Kids)', dim: '13 × 12 ft', area: '156 sq.ft', zone: 'West', finish: 'Matte Ceramic' },
                          { name: 'Living & Dining', dim: '24 × 18 ft', area: '432 sq.ft', zone: 'North-East', finish: 'Imported Marble' },
                          { name: 'Modular Kitchen', dim: '14 × 12 ft', area: '168 sq.ft', zone: 'South-East', finish: 'Quartz Countertop' },
                          { name: 'Covered Portico', dim: '18 × 12 ft', area: '216 sq.ft', zone: 'East', finish: 'Heavy Duty Pavers' }
                        ].map((room, idx) => (
                          <div key={idx} style={{ background: '#0b0f19', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>{room.name}</div>
                            <div style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 700 }}>{room.dim} ({room.area})</div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>Vaastu: {room.zone} • {room.finish}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. BOQ COST BREAKDOWN */}
                  {activeOutputTab === 'boq' && (
                    <div style={{ width: '100%', padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                          Bill of Quantities (BOQ) Cost Estimate
                        </h4>
                        <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#34d399', fontFamily: 'monospace' }}>
                          ₹{estimatedTotalCost.toFixed(1)} Lakhs
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                          { item: 'Civil RCC Structure & Foundation', pct: '38%', cost: `₹${(estimatedTotalCost * 0.38).toFixed(1)}L`, desc: 'Cement, Tata Tiscon Rebar, RMC concrete & mason wages' },
                          { item: 'Brickwork, Plastering & AAC Blocks', pct: '16%', cost: `₹${(estimatedTotalCost * 0.16).toFixed(1)}L`, desc: 'Red wire-cut bricks, M-Sand & internal plaster' },
                          { item: 'Flooring, Tiles & Granite Slabs', pct: '14%', cost: `₹${(estimatedTotalCost * 0.14).toFixed(1)}L`, desc: 'GVT vitrified tiles & kitchen quartz counter' },
                          { item: 'Electrical Wiring & Plumbing', pct: '12%', cost: `₹${(estimatedTotalCost * 0.12).toFixed(1)}L`, desc: 'Finolex FR wires, CPVC pipes & sanitaryware' },
                          { item: 'Doors, UPVC Windows & Painting', pct: '12%', cost: `₹${(estimatedTotalCost * 0.12).toFixed(1)}L`, desc: 'Teak main door, 3-track UPVC & Asian Paints Royale' },
                          { item: 'Architectural & Engineering Fees', pct: '8%', cost: `₹${(estimatedTotalCost * 0.08).toFixed(1)}L`, desc: 'Structural stability certificate & municipal drawings' }
                        ].map((b, i) => (
                          <div key={i} style={{ background: '#0b0f19', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>{b.item}</div>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{b.desc}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'monospace' }}>{b.cost}</div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{b.pct} of Total</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div style={{ padding: '20px 24px', background: '#0c101b', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                Design Version: <strong style={{ color: '#f59e0b' }}>AI Architectural Blueprint v2.0</strong>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    alert('Sanction drawing package downloaded as high-resolution CAD DWG & PDF!');
                    confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Download style={{ width: '16px', height: '16px' }} />
                  <span>Download Blueprint PDF</span>
                </button>

                <button
                  onClick={handleSaveToProject}
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: '#080b11',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)'
                  }}
                >
                  <span>Save to My Projects</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
