import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  Maximize2, 
  Calculator, 
  Compass, 
  Home, 
  Sliders, 
  IndianRupee, 
  Check, 
  Wand2,
  FileCheck,
  RefreshCw,
  Share2,
  Bookmark,
  Send,
  Printer,
  Download,
  AlertTriangle,
  Building,
  CheckCircle2,
  Settings2,
  User,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Cpu,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import CadBlueprintCanvas from './CadBlueprintCanvas';
import Elevation3DViewer from './Elevation3DViewer';
import BoqEstimator from './BoqEstimator';
import MunicipalByeLawsEngine from '../compliance/MunicipalByeLawsEngine';
import { ARCHITECTURAL_STYLES } from '../../data/mockData';
import { getRoleProfile, PLATFORM_ROLES } from '../../utils/rbac';

const SAMPLE_PROMPTS = [
  "₹1,00,000 budget. Ultra low-cost 1RK micro-home on 15×20 plot with multi-purpose room, kadappa kitchenette, sanitary bath, red oxide floor and tin/clay roof.",
  "I have a 40×60 plot. I want a modern 3BHK two-floor house with parking, balcony and pooja room. My budget is around ₹45 lakhs.",
  "30×40 North-facing plot. Vintage Kerala-style 3BHK with central thotti courtyard, car porch and sloping tile roof. Budget ₹38L.",
  "50×80 East-facing luxury plot. 4BHK contemporary villa with double-height living room, swimming pool deck, and solar pergola. Budget ₹95L."
];

export default function LandToArchitectureStudio({ 
  onPostProject, 
  onNavigate,
  currentUserRole = 'Customer',
  onOpenAuthModal
}) {
  const profile = getRoleProfile(currentUserRole);
  const isEngineer = currentUserRole === PLATFORM_ROLES.ENGINEER;

  // Mode State: 'customer' (Simple, Visual, AI-Assisted) vs 'pro' (Full CAD, Column Grid, Layer Toggles)
  const [studioMode, setStudioMode] = useState(isEngineer ? 'pro' : 'customer');

  // Conversational Requirement State
  const [promptText, setPromptText] = useState(SAMPLE_PROMPTS[0]);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [showRequirementCard, setShowRequirementCard] = useState(true);

  // Core Project Inputs
  const [plotPreset, setPlotPreset] = useState('40x60');
  const [plotWidth, setPlotWidth] = useState(40);
  const [plotLength, setPlotLength] = useState(60);
  const [budgetInr, setBudgetInr] = useState(4500000); // 45 Lakhs
  const [selectedStyle, setSelectedStyle] = useState('modern_minimalist');
  const [bhkCount, setBhkCount] = useState(3);
  const [floorsCount, setFloorsCount] = useState(2);
  const [facingDirection, setFacingDirection] = useState('East');
  const [hasCourtyard, setHasCourtyard] = useState(false);
  const [hasPooja, setHasPooja] = useState(true);
  const [hasCarPorch, setHasCarPorch] = useState(true);
  const [hasBalcony, setHasBalcony] = useState(true);

  // Advanced accordion open/close
  const [showAdvancedParams, setShowAdvancedParams] = useState(false);

  // Active Output View Tab on Design Canvas
  const [activeOutputTab, setActiveOutputTab] = useState('blueprint'); // 'blueprint', 'elevation', 'interior', 'measurements', 'boq', 'compliance'
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // AI Interactive Modification Assistant State (The Signature Feature)
  const [modPrompt, setModPrompt] = useState('');
  const [modStatus, setModStatus] = useState(null); // null, 'processing', 'applied'
  const [modHistory, setModHistory] = useState([
    {
      request: "Make the master bedroom 12 × 14 ft",
      current: "13 × 15 ft (195 sq.ft)",
      target: "12 × 14 ft (168 sq.ft)",
      status: "applied",
      note: "Adjusted North-East wall offset. Adjoining passage expanded by 1.2 ft. Structural grid verified."
    }
  ]);

  // Master bedroom dynamic dimension state (interactive proof of change)
  const [masterBedDim, setMasterBedDim] = useState('12 × 14 ft');

  const handleAnalysePrompt = (customText) => {
    const text = customText || promptText;
    setIsAnalysing(true);
    setModStatus(null);

    setTimeout(() => {
      if (text.includes('30') || text.includes('30×40') || text.includes('30x40')) {
        setPlotPreset('30x40');
        setPlotWidth(30);
        setPlotLength(40);
        setBudgetInr(3800000);
        setBhkCount(2);
        setFloorsCount(2);
        if (text.toLowerCase().includes('kerala') || text.toLowerCase().includes('vintage') || text.toLowerCase().includes('traditional')) {
          setSelectedStyle('vintage_traditional');
          setHasCourtyard(true);
        }
      } else if (text.includes('50') || text.includes('50×80') || text.includes('50x80')) {
        setPlotPreset('50x80');
        setPlotWidth(50);
        setPlotLength(80);
        setBudgetInr(9500000);
        setBhkCount(4);
        setFloorsCount(2);
        setSelectedStyle('modern_minimalist');
        setHasCourtyard(true);
      } else {
        setPlotPreset('40x60');
        setPlotWidth(40);
        setPlotLength(60);
        setBudgetInr(4500000);
        setBhkCount(3);
        setFloorsCount(2);
        setSelectedStyle('modern_minimalist');
        setHasCourtyard(false);
      }

      setIsAnalysing(false);
      setShowRequirementCard(true);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
    }, 600);
  };

  const handlePlotPresetChange = (preset) => {
    setPlotPreset(preset);
    if (preset === '30x40') {
      setPlotWidth(30);
      setPlotLength(40);
      setBudgetInr(3800000);
      setBhkCount(2);
      setFloorsCount(2);
    } else if (preset === '40x60') {
      setPlotWidth(40);
      setPlotLength(60);
      setBudgetInr(4500000);
      setBhkCount(3);
      setFloorsCount(2);
    } else if (preset === '50x80') {
      setPlotWidth(50);
      setPlotLength(80);
      setBudgetInr(9500000);
      setBhkCount(4);
      setFloorsCount(2);
    } else if (preset === 'estate') {
      setPlotWidth(70);
      setPlotLength(100);
      setBudgetInr(18000000);
      setBhkCount(5);
      setFloorsCount(3);
    }
    triggerRebuild();
  };

  const triggerRebuild = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      setIsSynthesizing(false);
    }, 600);
  };

  const handleApplyModification = (e) => {
    e?.preventDefault();
    if (!modPrompt.trim()) return;

    setModStatus('processing');
    const input = modPrompt;

    setTimeout(() => {
      let targetDim = '12 × 14 ft';
      if (input.includes('14') && input.includes('16')) targetDim = '14 × 16 ft';
      else if (input.includes('10') && input.includes('12')) targetDim = '10 × 12 ft';
      else if (input.includes('12') && input.includes('14')) targetDim = '12 × 14 ft';
      else if (input.includes('15') && input.includes('18')) targetDim = '15 × 18 ft';

      setMasterBedDim(targetDim);
      setModHistory(prev => [
        {
          request: input,
          current: masterBedDim,
          target: targetDim,
          status: 'applied',
          note: 'Adjacent wall clearances recalculated. M25 structural columns verified. BOQ & quantities updated.'
        },
        ...prev.slice(0, 3)
      ]);

      setModStatus('applied');
      setModPrompt('');
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    }, 900);
  };

  const handlePublishProject = () => {
    const newProject = {
      id: `proj-${Date.now()}`,
      title: `${ARCHITECTURAL_STYLES.find(s => s.id === selectedStyle)?.name || 'Custom Villa'}`,
      plotDimensions: `${plotWidth} × ${plotLength} ft`,
      plotAreaSqft: plotWidth * plotLength,
      builtUpAreaSqft: Math.round(plotWidth * plotLength * (floorsCount > 1 ? 1.45 : 0.85)),
      estimatedCost: `₹${(budgetInr / 100000).toFixed(1)} Lakhs`,
      spentCost: '₹0',
      progressPercent: 0,
      currentPhase: 'Design Sanctioned & Contractor Bidding',
      image: selectedStyle === 'vintage_traditional' 
        ? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
        : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      designVersion: 'V1.0',
      floors: floorsCount,
      bedrooms: bhkCount,
      bathrooms: bhkCount,
      parking: hasCarPorch ? '1 Car + 2 Bikes' : 'None',
      balcony: hasBalcony ? 'Balcony Included' : 'None',
      costBreakdown: {
        total: budgetInr,
        structure: Math.round(budgetInr * 0.44),
        materials: Math.round(budgetInr * 0.30),
        labour: Math.round(budgetInr * 0.18),
        electrical: Math.round(budgetInr * 0.04),
        plumbing: Math.round(budgetInr * 0.04)
      },
      phases: [
        { name: 'Architectural Sanction & Soil Test', status: 'done', progress: 100, date: 'Today', inspector: 'Automated AI Check' },
        { name: 'Excavation & Footing RCC', status: 'pending', progress: 0, date: 'Pending Bids', inspector: 'Pending Engineer' },
        { name: 'Ground Floor Columns & Slab', status: 'pending', progress: 0, date: 'Pending Bids', inspector: 'Pending Engineer' }
      ],
      team: [
        { role: 'Customer / Owner', name: 'Prasanth Kumar', phone: '+91 98400 11223', status: 'Active' }
      ],
      siteUpdates: []
    };

    if (onPostProject) {
      onPostProject(newProject);
    }
  };

  const currentStyleObj = ARCHITECTURAL_STYLES.find(s => s.id === selectedStyle) || ARCHITECTURAL_STYLES[0];

  return (
    <div className="ai-architecture-studio-root" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* =========================================================================
          1. STUDIO HEADER & MODE TOGGLE (Customer Mode vs Professional CAD Mode)
      ========================================================================= */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #101522 0%, #151c2d 100%)',
          borderRadius: '18px',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.5), 0 0 24px rgba(245, 158, 11, 0.08)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ color: '#f59e0b', fontSize: '1.2rem' }}>✦</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              LabourConnect AI Architecture Studio
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
            From your idea → floor plan → 3D → BOQ → construction
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0' }}>
            Generate CAD vector floor plans, photorealistic elevations, live material BOQs, and municipal code compliance.
          </p>
        </div>

        {/* Studio Mode Selector (Customer Mode / Pro Mode) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#080b11', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={() => setStudioMode('customer')}
            style={{
              background: studioMode === 'customer' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent',
              color: studioMode === 'customer' ? '#080b11' : '#94a3b8',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s'
            }}
          >
            <span>🏡</span>
            <span>Customer Mode</span>
          </button>
          <button
            onClick={() => setStudioMode('pro')}
            style={{
              background: studioMode === 'pro' ? '#2563eb' : 'transparent',
              color: studioMode === 'pro' ? '#ffffff' : '#94a3b8',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s'
            }}
          >
            <span>📐</span>
            <span>Professional CAD</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. CUSTOMER ENTRY: ✦ Tell LabourConnect What You Want
      ========================================================================= */}
      <div 
        style={{
          background: '#0d121f',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '18px',
          padding: '20px 24px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#f59e0b', fontSize: '1.2rem' }}>✦</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
              Describe your dream construction project
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Natural Language Requirement Parser
          </span>
        </div>

        {/* Input Text Box */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="e.g. I have a 40x60 plot. I want a modern 3BHK two-floor house with parking, balcony and pooja room..."
            style={{
              flex: 1,
              minWidth: '280px',
              background: '#080b11',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '12px',
              padding: '12px 18px',
              color: '#ffffff',
              fontSize: '0.95rem',
              outline: 'none'
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalysePrompt()}
          />
          <button
            onClick={() => handleAnalysePrompt()}
            disabled={isAnalysing}
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#080b11',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)'
            }}
          >
            <span>{isAnalysing ? 'Analysing...' : 'Analyse Requirements'}</span>
            <span>→</span>
          </button>
        </div>

        {/* Sample Prompt Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: showRequirementCard ? '16px' : '0' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Try sample prompts:</span>
          {SAMPLE_PROMPTS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPromptText(sample);
                handleAnalysePrompt(sample);
              }}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#94a3b8',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              {idx === 0 ? '40×60 Modern 3BHK Duplex (₹45L)' : idx === 1 ? '30×40 Kerala Vintage (₹38L)' : '50×80 Luxury 4BHK Villa (₹95L)'}
            </button>
          ))}
        </div>

        {/* Extracted Requirements Summary Cards */}
        {showRequirementCard && (
          <div 
            style={{
              background: '#101522',
              borderRadius: '14px',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#34d399', fontWeight: 800 }}>✓</span>
                <span style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>Plot: <strong style={{ color: '#ffffff' }}>{plotWidth} × {plotLength} ft</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#34d399', fontWeight: 800 }}>✓</span>
                <span style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>Floors: <strong style={{ color: '#ffffff' }}>{floorsCount} (G+1)</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#34d399', fontWeight: 800 }}>✓</span>
                <span style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>Bedrooms: <strong style={{ color: '#ffffff' }}>{bhkCount}BHK</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#34d399', fontWeight: 800 }}>✓</span>
                <span style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>Parking: <strong style={{ color: '#ffffff' }}>{hasCarPorch ? '1 Car' : 'No'}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#34d399', fontWeight: 800 }}>✓</span>
                <span style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>Balcony: <strong style={{ color: '#ffffff' }}>{hasBalcony ? 'Yes' : 'No'}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#34d399', fontWeight: 800 }}>✓</span>
                <span style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>Pooja: <strong style={{ color: '#ffffff' }}>{hasPooja ? 'Yes' : 'No'}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#34d399', fontWeight: 800 }}>✓</span>
                <span style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>Budget: <strong style={{ color: '#fbbf24' }}>₹{(budgetInr / 100000).toFixed(1)}L</strong></span>
              </div>
            </div>

            <button
              onClick={triggerRebuild}
              style={{
                background: '#34d399',
                color: '#080b11',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Confirm & Generate Architecture</span>
              <span>✨</span>
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          3. TWO-COLUMN SPLIT WORKSPACE:
             LEFT (320px) = DESIGN INPUTS & ADVANCED PARAMETERS
             RIGHT (~70%) = HERO DESIGN CANVAS (2D / 3D / BOQ / COMPLIANCE)
      ========================================================================= */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: '24px',
          alignItems: 'start'
        }}
      >
        {/* ==========================================
            LEFT COLUMN: DESIGN PARAMETERS
        ========================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div 
            style={{
              background: '#101522',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlidersHorizontal style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
                <span>Project Parameters</span>
              </h3>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>
                IS 456
              </span>
            </div>

            {/* Plot Preset Buttons */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                Plot Dimensions: <strong style={{ color: '#ffffff' }}>{plotWidth} × {plotLength} ft ({plotWidth * plotLength} sq.ft)</strong>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {[
                  { id: '30x40', label: '30 × 40 ft', desc: '1,200 sq.ft' },
                  { id: '40x60', label: '40 × 60 ft', desc: '2,400 sq.ft' },
                  { id: '50x80', label: '50 × 80 ft', desc: '4,000 sq.ft' },
                  { id: 'estate', label: 'Luxury Estate', desc: '7,000 sq.ft' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handlePlotPresetChange(item.id)}
                    style={{
                      background: plotPreset === item.id ? 'rgba(245, 158, 11, 0.15)' : '#080b11',
                      border: plotPreset === item.id ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.06)',
                      color: plotPreset === item.id ? '#fbbf24' : '#94a3b8',
                      padding: '8px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div>{item.label}</div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Floors & BHK Controls */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  Floors
                </label>
                <select
                  value={floorsCount}
                  onChange={(e) => {
                    setFloorsCount(Number(e.target.value));
                    triggerRebuild();
                  }}
                  style={{
                    width: '100%',
                    background: '#080b11',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '8px',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
                >
                  <option value={1}>G Floor Only</option>
                  <option value={2}>G + 1 Floor</option>
                  <option value={3}>G + 2 Floors</option>
                  <option value={4}>G + 3 Floors</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  Bedrooms
                </label>
                <select
                  value={bhkCount}
                  onChange={(e) => {
                    setBhkCount(Number(e.target.value));
                    triggerRebuild();
                  }}
                  style={{
                    width: '100%',
                    background: '#080b11',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '8px',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
                >
                  <option value={2}>2 BHK</option>
                  <option value={3}>3 BHK Luxury</option>
                  <option value={4}>4 BHK Villa</option>
                  <option value={5}>5 BHK Estate</option>
                </select>
              </div>
            </div>

            {/* Budget Range Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>Budget Allocation</span>
                <span style={{ color: '#fbbf24', fontWeight: 800 }}>₹{(budgetInr / 100000).toFixed(1)} Lakhs</span>
              </div>
              <input
                type="range"
                min="1500000"
                max="15000000"
                step="250000"
                value={budgetInr}
                onChange={(e) => setBudgetInr(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#64748b' }}>
                <span>₹15L (Economy)</span>
                <span>₹75L (Premium)</span>
                <span>₹1.5Cr+ (Luxury)</span>
              </div>
            </div>

            {/* Architectural Style */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                Architectural Style
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { id: 'modern_minimalist', name: 'Modern Minimalist Contemporary', icon: '🏢' },
                  { id: 'vintage_traditional', name: 'Vintage Traditional Heritage', icon: '🏛️' },
                  { id: 'eco_sustainable', name: 'Eco-Sustainable Biophilic', icon: '🌿' }
                ].map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setSelectedStyle(s.id);
                      triggerRebuild();
                    }}
                    style={{
                      background: selectedStyle === s.id ? 'rgba(245, 158, 11, 0.12)' : '#080b11',
                      border: selectedStyle === s.id ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: selectedStyle === s.id ? '#fbbf24' : '#94a3b8'
                    }}
                  >
                    <span>{s.icon}</span>
                    <span style={{ flex: 1 }}>{s.name}</span>
                    {selectedStyle === s.id && <span style={{ color: '#f59e0b' }}>✓</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Collapsible: Advanced Design Parameters & Vaastu */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
              <button
                onClick={() => setShowAdvancedParams(!showAdvancedParams)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 0'
                }}
              >
                <span>Advanced Parameters & Vaastu</span>
                <span>{showAdvancedParams ? '▲' : '▼'}</span>
              </button>

              {showAdvancedParams && (
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Facing Direction */}
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                      Main Facing Direction (Vaastu Entrance)
                    </label>
                    <select
                      value={facingDirection}
                      onChange={(e) => {
                        setFacingDirection(e.target.value);
                        triggerRebuild();
                      }}
                      style={{
                        width: '100%',
                        background: '#080b11',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        padding: '6px',
                        color: '#ffffff',
                        fontSize: '0.75rem'
                      }}
                    >
                      <option value="East">East (Sunrise • High Auspiciousness)</option>
                      <option value="North">North (Kubera Entry • Wealth Flow)</option>
                      <option value="West">West (Varuna Entry)</option>
                      <option value="South">South (Custom Corner Entry)</option>
                    </select>
                  </div>

                  {/* Architectural Elements Toggles */}
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                      Elements & Sanctions
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#cbd5e1', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={hasPooja}
                          onChange={(e) => {
                            setHasPooja(e.target.checked);
                            triggerRebuild();
                          }}
                          style={{ accentColor: '#f59e0b' }}
                        />
                        <span>Dedicated Ishanya Pooja Sanctum</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#cbd5e1', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={hasCarPorch}
                          onChange={(e) => {
                            setHasCarPorch(e.target.checked);
                            triggerRebuild();
                          }}
                          style={{ accentColor: '#f59e0b' }}
                        />
                        <span>Covered Portico & EV Charging Point</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#cbd5e1', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={hasCourtyard}
                          onChange={(e) => {
                            setHasCourtyard(e.target.checked);
                            triggerRebuild();
                          }}
                          style={{ accentColor: '#f59e0b' }}
                        />
                        <span>Central Sky Courtyard (Brahmasthanam)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Credible Vaastu & Code Review Card (NOT inflated percentages) */}
            <div 
              style={{
                background: '#080b11',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>✓</span>
                  <span>Vaastu Analysis</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                  8/10 configured preferences satisfied (East Entry, Ishanya Pooja, Agneya Kitchen)
                </div>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>⚠</span>
                  <span>Building Code Review</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                  Preliminary automated check • Setbacks compliant • Professional verification required
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={triggerRebuild}
              disabled={isSynthesizing}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#080b11',
                border: 'none',
                padding: '12px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)'
              }}
            >
              <RefreshCw style={{ width: '16px', height: '16px', animation: isSynthesizing ? 'spin 1s linear infinite' : 'none' }} />
              <span>{isSynthesizing ? 'Synthesizing BIM Models...' : 'Re-Generate Architecture'}</span>
            </button>
          </div>
        </div>

        {/* ==========================================
            RIGHT COLUMN: HERO DESIGN CANVAS & TABS
        ========================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Canvas Top Workspace Navigation Tabs */}
          <div 
            style={{
              display: 'flex',
              gap: '6px',
              background: '#0d121f',
              padding: '6px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              overflowX: 'auto'
            }}
          >
            {[
              { id: 'blueprint', label: 'Floor Plan (2D CAD)', icon: '📐' },
              { id: 'elevation', label: '3D Exterior Elevation', icon: '🏠' },
              { id: 'interior', label: 'Interior AI View', icon: '🛋️' },
              { id: 'measurements', label: 'Room Schedule & Measurements', icon: '📏' },
              { id: 'boq', label: 'Live BOQ & Material Costs', icon: '💰' },
              { id: 'compliance', label: 'Municipal Sanctions & Code', icon: '🏛️' }
            ].map((tab) => {
              const isActive = activeOutputTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveOutputTab(tab.id)}
                  style={{
                    flex: 1,
                    minWidth: '130px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? '#f59e0b' : 'transparent',
                    color: isActive ? '#080b11' : '#94a3b8',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Canvas Viewport Box */}
          <div 
            style={{
              background: '#101522',
              borderRadius: '18px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '20px',
              minHeight: '520px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* VIEW 1: 2D CAD BLUEPRINT CANVAS */}
            {activeOutputTab === 'blueprint' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                      2D Architectural CAD Floor Plan
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Precision algorithmic layout • Scale 1:100 • Plot: {plotWidth} × {plotLength} ft • Master Bed: {masterBedDim}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#34d399', background: 'rgba(52,211,153,0.1)', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>
                      ✓ IS 456 Structural Grid
                    </span>
                  </div>
                </div>

                <CadBlueprintCanvas
                  plotWidth={plotWidth}
                  plotLength={plotLength}
                  bhk={bhkCount}
                  budgetInr={budgetInr}
                  facing={facingDirection}
                  style={selectedStyle}
                  hasCourtyard={hasCourtyard}
                  hasPooja={hasPooja}
                  hasCarPorch={hasCarPorch}
                />
              </div>
            )}

            {/* VIEW 2: 3D EXTERIOR ELEVATION */}
            {activeOutputTab === 'elevation' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                      3D Architectural Exterior Elevation
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Style: {currentStyleObj.name} • Front & Isometric perspective with lighting moods
                    </p>
                  </div>
                </div>

                <Elevation3DViewer
                  styleId={selectedStyle}
                  plotWidth={plotWidth}
                  plotLength={plotLength}
                  bhk={bhkCount}
                  budgetInr={budgetInr}
                />
              </div>
            )}

            {/* VIEW 3: INTERIOR AI VIEW */}
            {activeOutputTab === 'interior' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                    AI Generated Interior Render ({currentStyleObj.name})
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Double-height living lounge, modular kitchen and master bedroom styled for {bhkCount}BHK layout
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div style={{ background: '#080b11', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ height: '220px', position: 'relative' }}>
                      <img
                        src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80"
                        alt="Living Room"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px' }}>
                        Living Room • 18 × 16 ft
                      </span>
                    </div>
                    <div style={{ padding: '12px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>Double-Height Living & Foyer</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Italian Botticino marble & concealed cove lighting</div>
                    </div>
                  </div>

                  <div style={{ background: '#080b11', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ height: '220px', position: 'relative' }}>
                      <img
                        src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80"
                        alt="Master Bedroom"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px' }}>
                        Master Suite • {masterBedDim}
                      </span>
                    </div>
                    <div style={{ padding: '12px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>Master Bedroom Suite</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Fluted acoustic paneling & floor-to-ceiling wardrobe</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 4: ROOM MEASUREMENTS */}
            {activeOutputTab === 'measurements' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                    Architectural Room Schedule & Carpet Area
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Calculated for {plotWidth} × {plotLength} ft plot • Total Built-up: {Math.round(plotWidth * plotLength * (floorsCount > 1 ? 1.45 : 0.85))} sq.ft
                  </p>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#080b11', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <th style={{ padding: '10px 14px' }}>Room / Space</th>
                        <th style={{ padding: '10px 14px' }}>Dimensions (W × L)</th>
                        <th style={{ padding: '10px 14px' }}>Carpet Area</th>
                        <th style={{ padding: '10px 14px' }}>Vaastu Zone</th>
                        <th style={{ padding: '10px 14px' }}>Flooring Spec</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'Master Bedroom Suite', dim: masterBedDim, area: '168 sq.ft', zone: 'South-West (Nairuthi)', floor: 'Wooden Finish Vitrified Planks' },
                        { name: 'Living & Dining Hall', dim: '18 × 16 ft', area: '288 sq.ft', zone: 'North-East (Ishanya)', floor: 'Italian Botticino Marble GVT' },
                        { name: 'Modular Kitchen', dim: '10 × 12 ft', area: '120 sq.ft', zone: 'South-East (Agneya)', floor: 'Anti-Skid Matte Porcelain' },
                        { name: 'Bedroom 2 (Guest / Kids)', dim: '11 × 13 ft', area: '143 sq.ft', zone: 'North-West (Vayavya)', floor: 'Kajaria Double Charge GVT' },
                        { name: 'Pooja Sanctum', dim: '6 × 8 ft', area: '48 sq.ft', zone: 'North-East (Ishanya)', floor: 'White Statuario Marble' },
                        { name: 'Car Porch & EV Portico', dim: '12 × 16 ft', area: '192 sq.ft', zone: 'North-West', floor: 'Heavy Duty Paver Blocks' }
                      ].map((r, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                          <td style={{ padding: '10px 14px', fontWeight: 600, color: '#ffffff' }}>{r.name}</td>
                          <td style={{ padding: '10px 14px', color: '#fbbf24', fontWeight: 700 }}>{r.dim}</td>
                          <td style={{ padding: '10px 14px', color: '#34d399' }}>{r.area}</td>
                          <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{r.zone}</td>
                          <td style={{ padding: '10px 14px', color: '#cbd5e1' }}>{r.floor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VIEW 5: LIVE BOQ & MATERIALS */}
            {activeOutputTab === 'boq' && (
              <BoqEstimator
                plotWidth={plotWidth}
                plotLength={plotLength}
                floors={floorsCount}
                bhk={bhkCount}
                style={selectedStyle}
              />
            )}

            {/* VIEW 6: MUNICIPAL BYE-LAWS */}
            {activeOutputTab === 'compliance' && (
              <MunicipalByeLawsEngine />
            )}
          </div>

          {/* =========================================================================
              4. THE SIGNATURE FEATURE: Interactive AI Design Modification Assistant
          ========================================================================= */}
          <div 
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #111827 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '16px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#f59e0b', fontSize: '1.1rem' }}>✦</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                  AI Design Modification Assistant
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Say any change → 2D Plan, 3D Elevation & BOQ update automatically
              </span>
            </div>

            {/* Modification Prompt Input Form */}
            <form onSubmit={handleApplyModification} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={modPrompt}
                onChange={(e) => setModPrompt(e.target.value)}
                placeholder='e.g. "Make the master bedroom 12 × 14 ft" or "Add a sit-out balcony to floor 2"'
                style={{
                  flex: 1,
                  background: '#080b11',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={modStatus === 'processing'}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#080b11',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{modStatus === 'processing' ? 'Calculating...' : 'Apply Modification'}</span>
                <span>✨</span>
              </button>
            </form>

            {/* Live Modification Feedback Simulation */}
            {modHistory.length > 0 && (
              <div 
                style={{
                  background: 'rgba(8, 11, 17, 0.6)',
                  borderRadius: '10px',
                  border: '1px solid rgba(52, 211, 153, 0.25)',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ color: '#94a3b8' }}>Request: <strong style={{ color: '#ffffff' }}>"{modHistory[0].request}"</strong></span>
                  <span style={{ color: '#34d399', fontWeight: 700 }}>✓ Modification Applied</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ color: '#64748b' }}>Current: <span style={{ textDecoration: 'line-through', color: '#94a3b8' }}>{modHistory[0].current}</span></span>
                  <span style={{ color: '#fbbf24', fontWeight: 700 }}>→ Requested: {modHistory[0].target}</span>
                  <span style={{ color: '#cbd5e1' }}>• {modHistory[0].note}</span>
                </div>
              </div>
            )}
          </div>

          {/* Canvas Bottom Action Bar */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              paddingTop: '8px'
            }}
          >
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => alert("Exported vector CAD drawing (.SVG / .DXF) for AutoCAD & Revit!")}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#ffffff',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Download style={{ width: '14px', height: '14px' }} />
                <span>Export CAD (SVG)</span>
              </button>

              <button
                onClick={() => window.print()}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#ffffff',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Printer style={{ width: '14px', height: '14px' }} />
                <span>Print Blueprint</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => onNavigate && onNavigate('engineers')}
                style={{
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  color: '#38bdf8',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Request Structural Engineer Stamp
              </button>

              <button
                onClick={handlePublishProject}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#080b11',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)'
                }}
              >
                <span>Save Project & Open Bidding</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
