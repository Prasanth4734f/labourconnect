import React, { useState } from 'react';
import {
  Compass,
  Layers,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Camera,
  Download,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Sliders,
  Eye,
  Box,
  Square,
  Zap,
  Droplets,
  Building2,
  Ruler,
  FileSpreadsheet,
  Grid,
  FileCheck,
  Flame,
  Wind,
  ShieldCheck,
  Printer,
  ChevronRight,
  Palette,
  Info,
  Check,
  RefreshCw,
  Cpu,
  Edit3,
  X,
  SlidersHorizontal,
  ArrowUpRight,
  Copy,
  CheckCheck,
  Lightbulb,
  Home,
  MapPin,
  Gauge
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ProjectDesignTab({ project, currentUserRole = 'Customer' }) {
  // Main Design Sub-Tab Navigation
  // '2d_cad' | '3d_elevation' | 'interior_walkthrough' | 'mep_structural' | 'vaastu_byelaws' | 'ai_copilot'
  const [activeSubTab, setActiveSubTab] = useState('2d_cad');

  // 2D CAD State
  const [activeFloor, setActiveFloor] = useState('ground'); // 'ground', 'first', 'terrace'
  const [cadZoom, setCadZoom] = useState(1);
  const [cadLayers, setCadLayers] = useState({
    dimensions: true,
    columns: true,
    doorsWindows: true,
    furniture: true,
    electrical: false,
    plumbing: false,
    vaastu: true,
    grid: true
  });
  const [selectedRoomId, setSelectedRoomId] = useState('master_bed');
  const [isMeasureMode, setIsMeasureMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState([]);
  const [measurementResult, setMeasurementResult] = useState(null);
  const [isEditRoomModalOpen, setIsEditRoomModalOpen] = useState(false);

  // 3D Elevation State
  const [lightingMood, setLightingMood] = useState('golden'); // 'sunrise', 'day', 'golden', 'night'
  const [cameraAngle, setCameraAngle] = useState('front'); // 'front', 'isometric', 'side', 'drone'
  const [wallFinish, setWallFinish] = useState('travertine'); // 'travertine', 'brick', 'concrete', 'wood', 'slate'
  const [windowFrameColor, setWindowFrameColor] = useState('matte_black'); // 'matte_black', 'teak_wood', 'charcoal_upvc'
  const [roofStyle, setRoofStyle] = useState('cantilever'); // 'cantilever', 'clay_tiles', 'glass_pergola'
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Interior Walkthrough State
  const [interiorRoom, setInteriorRoom] = useState('living'); // 'living', 'master_bed', 'kitchen', 'balcony', 'pooja', 'theater'
  const [interiorStyle, setInteriorStyle] = useState('luxury_contemporary'); // 'modern_minimalist', 'luxury_contemporary', 'japandi', 'chettinad', 'industrial'
  const [lightingScene, setLightingScene] = useState('warm_cove'); // 'daylight', 'warm_cove', 'evening_glow', 'night_cinema'

  // MEP / Structural State
  const [mepCategory, setMepCategory] = useState('structural'); // 'structural', 'electrical', 'plumbing'

  // Vaastu State
  const [selectedVaastuZone, setSelectedVaastuZone] = useState('NE');

  // AI Copilot State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [designVersion, setDesignVersion] = useState('v2.4_final');
  const [copilotHistory, setCopilotHistory] = useState([
    { id: 1, text: 'Expanded master bedroom balcony by 3 ft with toughened glass balustrade & drip groove', time: 'Yesterday, 4:20 PM', author: 'AI Architect' },
    { id: 2, text: 'Optimized South-East Agni corner for modular kitchen chimney ducting & cross-ventilation', time: '2 days ago', author: 'Vaastu Engine' },
    { id: 3, text: 'Added 5.2 kW solar rooftop pergola canopy with net-metering junction & battery bank', time: '3 days ago', author: 'Sustainability AI' }
  ]);

  // CAD Layer Toggler
  const toggleCadLayer = (key) => {
    setCadLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Rooms Data for Ground & First Floor (Stateful to allow live user editing)
  const [groundRooms, setGroundRooms] = useState([
    {
      id: 'living_room',
      name: 'Grand Living & Foyer',
      zone: 'North-East (Ishanya)',
      dim: '18\'0" × 16\'0"',
      widthFt: 18,
      lengthFt: 16,
      areaSqft: 288,
      areaSqm: 26.75,
      ceilingHeight: '11\'6" (Double Height Section)',
      flooring: 'Italian Botticino Marble (800×1600mm Slab)',
      paint: 'Asian Paints Royale Luxury Velvet Touch (Off-White)',
      ceilingType: 'Minimalist Gypsum False Ceiling with 3000K Cove LED',
      electrical: '6× 12W COB Downlights, 2× Fan Points, 1× Chandelier Hook, 6× 6A Sockets, 1× 16A AC Point',
      vaastuStatus: 'Auspicious (100%)',
      vaastuNote: 'Welcoming pranic energy from East sunrise; open foyer layout.',
      rect: { x: 30, y: 160, w: 200, h: 180 },
      color: 'rgba(56, 189, 248, 0.12)',
      borderColor: '#38bdf8'
    },
    {
      id: 'modular_kitchen',
      name: 'Modular Kitchen & Dining',
      zone: 'South-East (Agni Corner)',
      dim: '14\'0" × 12\'0"',
      widthFt: 14,
      lengthFt: 12,
      areaSqft: 168,
      areaSqm: 15.6,
      ceilingHeight: '10\'0"',
      flooring: 'Kajaria Vitrified Anti-Skid GVT (600×1200mm)',
      paint: 'Anti-Bacterial Moisture Resistant Satin Enamel',
      ceilingType: 'Flush Moisture-Proof Gypsum with Task Spots',
      electrical: '4× 16A Appliance Points (Hob, Oven, Chimney, RO), 3× 6A, Under-cabinet LED Strips',
      vaastuStatus: 'Auspicious (100%)',
      vaastuNote: 'Lord Agni quadrant for cooking platform facing East for positive solar energy.',
      rect: { x: 235, y: 160, w: 165, h: 180 },
      color: 'rgba(52, 211, 153, 0.12)',
      borderColor: '#34d399'
    },
    {
      id: 'master_bed',
      name: 'Master Suite & Walk-in',
      zone: 'South-West (Nairuthi)',
      dim: '16\'0" × 14\'0"',
      widthFt: 16,
      lengthFt: 14,
      areaSqft: 224,
      areaSqm: 20.8,
      ceilingHeight: '10\'6"',
      flooring: 'Pergo Engineered Hardwood Oak Planks',
      paint: 'Dulux Velvet Matt Sage & Warm Greige Accent',
      ceilingType: 'Warm Perimeter Wooden Rafters with Indirect Cove',
      electrical: '4× Dimmable Downlights, 2× Bedside Reading Spots, 1× 2-Ton 5-Star Inverter AC Point',
      vaastuStatus: 'Auspicious (100%)',
      vaastuNote: 'Master of house stability zone; heavy wardrobes positioned along South and West walls.',
      rect: { x: 30, y: 345, w: 220, h: 165 },
      color: 'rgba(245, 158, 11, 0.15)',
      borderColor: '#f59e0b'
    },
    {
      id: 'pooja_sanctum',
      name: 'Pooja Sanctum',
      zone: 'North-East Corner (Ishanya)',
      dim: '6\'0" × 6\'0"',
      widthFt: 6,
      lengthFt: 6,
      areaSqft: 36,
      areaSqm: 3.34,
      ceilingHeight: '9\'6"',
      flooring: 'Makrana Pure White Marble Inlay',
      paint: 'Gold Foil Stucco Finish with Teakwood Jaali Door',
      ceilingType: 'Dome Shaped Backlit Onyx Marble Ceiling',
      electrical: 'Concealed LED Mandir Spot, Brass Bell Hook, Exhaust Fan Point',
      vaastuStatus: 'Auspicious (100%)',
      vaastuNote: 'Ishanya Konam supreme spiritual alignment; idol facing East.',
      rect: { x: 30, y: 40, w: 90, h: 115 },
      color: 'rgba(251, 191, 36, 0.2)',
      borderColor: '#fbbf24'
    },
    {
      id: 'car_porch',
      name: 'Covered Portico & EV Bay',
      zone: 'North-West (Vayu)',
      dim: '16\'0" × 14\'0"',
      widthFt: 16,
      lengthFt: 14,
      areaSqft: 224,
      areaSqm: 20.8,
      ceilingHeight: '11\'0"',
      flooring: 'Heavy-Duty Cobblestone Pavers & Granite Borders',
      paint: 'Weather-Proof Exterior Textured Paint',
      ceilingType: 'Weather-Resistant Teak Aluminium Louvers',
      electrical: '7.4 kW Type-2 EV Wallbox Charger, Motion Sensor Floodlight',
      vaastuStatus: 'Auspicious (100%)',
      vaastuNote: 'Vehicle movement zone aligned with Vayu airflow principles.',
      rect: { x: 125, y: 40, w: 140, h: 115 },
      color: 'rgba(148, 163, 184, 0.12)',
      borderColor: '#94a3b8'
    },
    {
      id: 'attached_bath',
      name: 'Attached Bath & Dressing',
      zone: 'West Wall Zone (Varuna)',
      dim: '8\'0" × 7\'0"',
      widthFt: 8,
      lengthFt: 7,
      areaSqft: 56,
      areaSqm: 5.2,
      ceilingHeight: '9\'6"',
      flooring: 'Fluted Ceramic Anti-Skid & Grohe Concealed Diverter',
      paint: 'Full-Height Italian Porcelain Tile Cladding',
      ceilingType: 'Waterproof Gyproc with Recessed Spotlights',
      electrical: '1× 25L Geyser Point, Illuminated Vanity Mirror, Exhaust Louver',
      vaastuStatus: 'Compliant (95%)',
      vaastuNote: 'Drainage slope aligned towards North-East direction.',
      rect: { x: 255, y: 345, w: 145, h: 165 },
      color: 'rgba(251, 113, 133, 0.12)',
      borderColor: '#fb7185'
    }
  ]);

  const [firstRooms, setFirstRooms] = useState([
    {
      id: 'bed_2',
      name: 'Children / Guest Bedroom',
      zone: 'North-West (Vayu)',
      dim: '14\'0" × 13\'0"',
      widthFt: 14,
      lengthFt: 13,
      areaSqft: 182,
      areaSqm: 16.9,
      ceilingHeight: '10\'0"',
      flooring: 'Kajaria Glazed Vitrified Tiles (800×800mm)',
      paint: 'Asian Paints Pastel Sky Blue',
      ceilingType: 'Minimalist False Ceiling with Magnetic Track Light',
      electrical: '4× Downlights, Study Table Lamp Point, 1.5-Ton AC Point',
      vaastuStatus: 'Auspicious (100%)',
      vaastuNote: 'Vayu corner supports child growth and intellectual vitality.',
      rect: { x: 30, y: 40, w: 180, h: 160 },
      color: 'rgba(129, 140, 248, 0.15)',
      borderColor: '#818cf8'
    },
    {
      id: 'bed_3',
      name: 'Second Master Bedroom',
      zone: 'South-West (Nairuthi)',
      dim: '15\'0" × 14\'0"',
      widthFt: 15,
      lengthFt: 14,
      areaSqft: 210,
      areaSqm: 19.5,
      ceilingHeight: '10\'0"',
      flooring: 'Vitrified Wooden Plank Finish',
      paint: 'Royal Luxury Warm Beige',
      ceilingType: 'Drop Edge False Ceiling with Warm Ambient Strip',
      electrical: '4× Downlights, Wardrobe Sensor Strip, 1.5-Ton AC Point',
      vaastuStatus: 'Auspicious (100%)',
      vaastuNote: 'Heavy RCC overhead structure provides family grounding.',
      rect: { x: 30, y: 210, w: 200, h: 160 },
      color: 'rgba(245, 158, 11, 0.15)',
      borderColor: '#f59e0b'
    },
    {
      id: 'family_lounge',
      name: 'Family Media Lounge',
      zone: 'Central Brahmasthana',
      dim: '14\'0" × 12\'0"',
      widthFt: 14,
      lengthFt: 12,
      areaSqft: 168,
      areaSqm: 15.6,
      ceilingHeight: '10\'0"',
      flooring: 'Imported Marble Polished',
      paint: 'Acoustic Wall Paneling + Textured Paint',
      ceilingType: 'Acoustic Sound Baffle False Ceiling with Star Light Stars',
      electrical: '7.1 Home Theater Concealed Conduits, Projector Hook',
      vaastuStatus: 'Auspicious (100%)',
      vaastuNote: 'Upper central courtyard allows skylight diffusion into lower hall.',
      rect: { x: 215, y: 40, w: 185, h: 160 },
      color: 'rgba(56, 189, 248, 0.15)',
      borderColor: '#38bdf8'
    },
    {
      id: 'terrace_balcony',
      name: 'Cantilever Glass Balcony',
      zone: 'East Facing',
      dim: '16\'0" × 8\'0"',
      widthFt: 16,
      lengthFt: 8,
      areaSqft: 128,
      areaSqm: 11.9,
      ceilingHeight: 'Open to Sky with Pergola',
      flooring: 'Weatherproof Outdoor WPC Decking',
      paint: 'Exposed Concrete Plinth & 12mm Toughened Glass Railing',
      ceilingType: 'Treated Teak & Aluminium Pergola Rafters',
      electrical: 'IP67 Waterproof Strip Lighting, Planter Drip System',
      vaastuStatus: 'Auspicious (100%)',
      vaastuNote: 'Open to East for uninterrupted morning sun absorption.',
      rect: { x: 235, y: 210, w: 165, h: 160 },
      color: 'rgba(52, 211, 153, 0.15)',
      borderColor: '#34d399'
    }
  ]);

  const [terraceRooms] = useState([
    {
      id: 'solar_deck',
      name: '5.2 kW Solar Rooftop Pergola',
      zone: 'South & South-West',
      dim: '24\'0" × 18\'0"',
      widthFt: 24,
      lengthFt: 18,
      areaSqft: 432,
      areaSqm: 40.1,
      ceilingHeight: '8\'6" Elevated Solar Canopy',
      flooring: 'Reflective White Cool-Roof Waterproof Tiles (SRI > 82)',
      paint: 'Elastomeric Heat-Reflective Thermal Barrier Coating',
      ceilingType: 'Bifacial Solar Glass Pergola Structural Truss',
      electrical: 'Hybrid Solar Inverter Box, Net-Metering DC Isolator, Lighting Arrestor',
      vaastuStatus: 'Auspicious (100%)',
      vaastuNote: 'Heavy solar mounting structure anchored on South-West roof corner.',
      rect: { x: 30, y: 40, w: 370, h: 220 },
      color: 'rgba(245, 158, 11, 0.15)',
      borderColor: '#f59e0b'
    },
    {
      id: 'zen_garden',
      name: 'Zen Terrace Garden & Deck',
      zone: 'North & East',
      dim: '20\'0" × 14\'0"',
      widthFt: 20,
      lengthFt: 14,
      areaSqft: 280,
      areaSqm: 26.0,
      ceilingHeight: 'Open to Sky',
      flooring: 'WPC Composite Wood & Artificial Turf Lawn',
      paint: 'Vertical Garden Planter Wall with Micro-Irrigation',
      ceilingType: 'Open Sky Terrace with Mood Warm Bollards',
      electrical: 'Automated Drip Timer, 12V Waterproof Step Lights',
      vaastuStatus: 'Auspicious (100%)',
      vaastuNote: 'Open landscape in North-East encourages positive cosmic flow.',
      rect: { x: 30, y: 270, w: 370, h: 220 },
      color: 'rgba(52, 211, 153, 0.15)',
      borderColor: '#34d399'
    }
  ]);

  const currentRooms = activeFloor === 'ground' ? groundRooms : activeFloor === 'first' ? firstRooms : terraceRooms;
  const activeSelectedRoom = currentRooms.find(r => r.id === selectedRoomId) || currentRooms[0];

  // Structural Columns coordinates on the plan (C1 to C12)
  const columnsList = [
    { id: 'C1', x: 28, y: 38, size: '9"×15"', rebar: '6-16mm Fe550D' },
    { id: 'C2', x: 218, y: 38, size: '9"×15"', rebar: '6-16mm Fe550D' },
    { id: 'C3', x: 398, y: 38, size: '9"×18"', rebar: '8-16mm Fe550D' },
    { id: 'C4', x: 28, y: 158, size: '9"×15"', rebar: '6-16mm Fe550D' },
    { id: 'C5', x: 233, y: 158, size: '9"×18"', rebar: '8-20mm Fe550D' },
    { id: 'C6', x: 398, y: 158, size: '9"×15"', rebar: '6-16mm Fe550D' },
    { id: 'C7', x: 28, y: 343, size: '9"×15"', rebar: '6-16mm Fe550D' },
    { id: 'C8', x: 248, y: 343, size: '9"×18"', rebar: '8-20mm Fe550D' },
    { id: 'C9', x: 398, y: 343, size: '9"×15"', rebar: '6-16mm Fe550D' },
    { id: 'C10', x: 28, y: 508, size: '9"×15"', rebar: '6-16mm Fe550D' },
    { id: 'C11', x: 248, y: 508, size: '9"×15"', rebar: '6-16mm Fe550D' },
    { id: 'C12', x: 398, y: 508, size: '9"×15"', rebar: '6-16mm Fe550D' }
  ];

  // 3D Elevation Hotspots
  const elevationHotspots = [
    {
      id: 'hs-1',
      x: '34%',
      y: '42%',
      title: 'Cantilever Master Balcony',
      desc: 'M30 Grade reinforced box slab projecting 4.5 ft with concealed drip groove and 12mm laminated toughened glass balustrade.'
    },
    {
      id: 'hs-2',
      x: '62%',
      y: '32%',
      title: 'Double-Height Low-E Glazing',
      desc: 'Saint-Gobain acoustic double-glazed curtain wall with thermal break slim black aluminum sub-frames.'
    },
    {
      id: 'hs-3',
      x: '48%',
      y: '68%',
      title: 'Travertine Stone Cladding',
      desc: 'Natural Italian Silver-Vein Travertine dry-clad with stainless steel 316 anchors and weather sealant.'
    },
    {
      id: 'hs-4',
      x: '75%',
      y: '22%',
      title: 'Rooftop Solar Pergola',
      desc: '5.2 kWp Monocrystalline Bifacial Solar Canopy providing 680 kWh/month green energy with inverter net-metering.'
    }
  ];

  // 9-Zone Vaastu Mandala Details
  const vaastuZones = [
    { id: 'NE', zone: 'North-East (Ishanya)', element: 'Water / Pure Mind', room: 'Pooja Sanctum & Foyer Entry', status: '100% Auspicious', score: 100, tip: 'Ideal for spiritual prayers, meditation & water fountain.' },
    { id: 'E', zone: 'East (Indra / Surya)', element: 'Sun / Health', room: 'Grand Living & Glass Balcony', status: '100% Auspicious', score: 100, tip: 'Unobstructed morning daylight enhances vitality & prana.' },
    { id: 'SE', zone: 'South-East (Agni)', element: 'Fire / Energy', room: 'Modular Kitchen (Hob facing East)', status: '100% Auspicious', score: 100, tip: 'Cook facing East for auspicious Agni cosmic alignment.' },
    { id: 'S', zone: 'South (Yama / Dharma)', element: 'Earth / Strength', room: 'RCC Staircase Core & Store', status: 'Compliant (95%)', score: 95, tip: 'Heavy vertical loads along South provide physical structural stability.' },
    { id: 'SW', zone: 'South-West (Nairuthi)', element: 'Earth / Stability', room: 'Master Suite & Heavy Wardrobes', status: '100% Auspicious', score: 100, tip: 'Master bedroom in SW anchors family peace and financial stability.' },
    { id: 'W', zone: 'West (Varuna)', element: 'Water / Prosperity', room: 'Attached Bath & Overhead Tank', status: 'Compliant (95%)', score: 95, tip: 'Dressing and secondary baths positioned along West wall.' },
    { id: 'NW', zone: 'North-West (Vayu)', element: 'Air / Motion', room: 'Guest Bed / EV Car Porch', status: '100% Auspicious', score: 100, tip: 'Supports guests, movement of vehicles and healthy air circulation.' },
    { id: 'N', zone: 'North (Kubera)', element: 'Wealth / Career', room: 'Open Living & Balcony Lounge', status: '100% Auspicious', score: 100, tip: 'Magnetic North attraction draws wealth, liquidity and career growth.' },
    { id: 'C', zone: 'Center (Brahmasthana)', element: 'Space / Ether', room: 'Double-Height Central Skylight', status: '100% Auspicious', score: 100, tip: 'Kept unencumbered for natural ventilation and daylight diffusion.' }
  ];

  // Handle AI Prompt Submission
  const handleAiPromptApply = () => {
    if (!aiPrompt.trim()) return;
    setIsAiProcessing(true);
    setTimeout(() => {
      setIsAiProcessing(false);
      const newEntry = {
        id: Date.now(),
        text: aiPrompt,
        time: 'Just now',
        author: 'BuildMate AI 2.0 Architect'
      };
      setCopilotHistory([newEntry, ...copilotHistory]);
      setAiPrompt('');
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }, 1100);
  };

  // Image source depending on lighting and wall finish
  const get3dElevationImage = () => {
    if (lightingMood === 'night') {
      return 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80';
    }
    if (lightingMood === 'sunrise') {
      return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
    }
    if (wallFinish === 'brick') {
      return 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80';
    }
    if (wallFinish === 'wood') {
      return 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80';
    }
    if (wallFinish === 'concrete') {
      return 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80';
    }
    return project?.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
  };

  // Interior Walkthrough Image
  const getInteriorImage = () => {
    switch (interiorRoom) {
      case 'master_bed':
        return 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80';
      case 'kitchen':
        return 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80';
      case 'balcony':
        return 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80';
      case 'pooja':
        return 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80';
      case 'theater':
        return 'https://images.unsplash.com/photo-1595928642581-f50f4f3453a5?auto=format&fit=crop&w=1200&q=80';
      case 'living':
      default:
        return 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80';
    }
  };

  // SVG Canvas Click for Ruler / Measurement Mode
  const handleSvgCanvasClick = (e) => {
    if (!isMeasureMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 440);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 550);

    if (measurePoints.length === 0) {
      setMeasurePoints([{ x, y }]);
      setMeasurementResult(null);
    } else if (measurePoints.length === 1) {
      const p1 = measurePoints[0];
      const p2 = { x, y };
      setMeasurePoints([p1, p2]);
      // Calculate distance in feet based on scale (440 SVG units = 44 ft, so 10 units = 1 ft)
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const distUnits = Math.sqrt(dx * dx + dy * dy);
      const distFt = (distUnits / 10).toFixed(1);
      const distM = (distFt * 0.3048).toFixed(2);
      setMeasurementResult({ distFt, distM, p1, p2 });
    } else {
      setMeasurePoints([{ x, y }]);
      setMeasurementResult(null);
    }
  };

  // Update room specifications handler
  const handleSaveRoomEdits = (updatedRoom) => {
    const updateFn = (rooms) => rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r);
    if (activeFloor === 'ground') setGroundRooms(updateFn);
    else if (activeFloor === 'first') setFirstRooms(updateFn);
    setIsEditRoomModalOpen(false);
    confetti({ particleCount: 40, spread: 50 });
  };

  // Copy share link
  const handleCopyShareLink = () => {
    setCopiedLink(true);
    navigator.clipboard?.writeText(window.location.href);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. TOP SUB-TOOLBAR: Navigation for Design Sub-Modes */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: '#0d121f',
          padding: '8px 12px',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: '2d_cad', label: '2D Architectural CAD', icon: <Square size={16} /> },
            { id: '3d_elevation', label: '3D Elevation & Solar', icon: <Box size={16} /> },
            { id: 'interior_walkthrough', label: 'Interior Walkthrough', icon: <Eye size={16} /> },
            { id: 'mep_structural', label: 'Structural & MEP', icon: <Zap size={16} /> },
            { id: 'vaastu_byelaws', label: 'Vaastu & Byelaws', icon: <Compass size={16} /> },
            { id: 'ai_copilot', label: 'AI Design Copilot', icon: <Sparkles size={16} /> }
          ].map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: isActive ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(255, 255, 255, 0.04)',
                  color: isActive ? '#080b11' : '#cbd5e1',
                  border: isActive ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '0.825rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Action Badges & Exporter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              background: 'rgba(52, 211, 153, 0.15)',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              color: '#34d399',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <ShieldCheck size={13} />
            CMDA Sanction Passed
          </span>
          <button
            onClick={handleCopyShareLink}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#94a3b8',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {copiedLink ? <CheckCheck size={14} color="#34d399" /> : <Share2 size={14} />}
            {copiedLink ? 'Link Copied!' : 'Share Design'}
          </button>
          <button
            onClick={() => {
              confetti({ particleCount: 75, spread: 60 });
              alert('📥 Exporting Complete Architectural CAD Blueprint & Sanction Dossier (PDF/DWG)...');
            }}
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              color: '#fbbf24',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Download size={14} />
            Export Dossier
          </button>
        </div>
      </div>

      {/* =========================================================
          SUB-TAB 1: 2D ARCHITECTURAL CAD BLUEPRINT
      ========================================================= */}
      {activeSubTab === '2d_cad' && (
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 310px', gap: '16px' }}>
          {/* Left: Floor Selector & Layer Control Panel */}
          <div
            style={{
              background: '#101522',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                Floor Level
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { id: 'ground', label: 'Ground Floor (G)', desc: '1,150 sq.ft • Living, Kitchen, Master Bed' },
                  { id: 'first', label: 'First Floor (G+1)', desc: '1,000 sq.ft • 2 Bed, Family Lounge, Balcony' },
                  { id: 'terrace', label: 'Terrace & Solar Roof', desc: 'Open Deck • 5.2 kW Solar Pergola' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFloor(f.id)}
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      background: activeFloor === f.id ? 'rgba(245, 158, 11, 0.18)' : '#0b0f19',
                      border: activeFloor === f.id ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      color: activeFloor === f.id ? '#fbbf24' : '#cbd5e1',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '0.825rem', fontWeight: 700 }}>{f.label}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                CAD Layers & Overlays
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { key: 'dimensions', label: 'Clear Dimensions & Grid', icon: <Ruler size={13} /> },
                  { key: 'columns', label: 'RCC Columns (C1-C12)', icon: <Building2 size={13} /> },
                  { key: 'doorsWindows', label: 'Door & Window Openings', icon: <Square size={13} /> },
                  { key: 'furniture', label: 'Furniture Layout', icon: <Box size={13} /> },
                  { key: 'electrical', label: 'Electrical Conduits', icon: <Zap size={13} /> },
                  { key: 'plumbing', label: 'Plumbing & Drainage', icon: <Droplets size={13} /> },
                  { key: 'vaastu', label: 'Vaastu 9-Zone Overlay', icon: <Compass size={13} /> }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => toggleCadLayer(item.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: cadLayers[item.key] ? 'rgba(56, 189, 248, 0.1)' : '#0b0f19',
                      border: cadLayers[item.key] ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid rgba(255, 255, 255, 0.04)',
                      borderRadius: '6px',
                      color: cadLayers[item.key] ? '#38bdf8' : '#64748b',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {item.icon}
                      {item.label}
                    </span>
                    <span style={{ fontSize: '0.75rem' }}>{cadLayers[item.key] ? 'ON' : 'OFF'}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 'auto', background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>PLOT DIMENSIONS</span>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>40'0" × 60'0" (2,400 sq.ft)</div>
              <div style={{ fontSize: '0.7rem', color: '#34d399', marginTop: '2px' }}>Carpet Area: 1,840 sq.ft (76.6%)</div>
            </div>
          </div>

          {/* Center: Interactive Architectural SVG CAD Canvas */}
          <div
            style={{
              background: '#070a10',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Top Canvas HUD Controls */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                right: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10,
                pointerEvents: 'none'
              }}
            >
              <div
                style={{
                  pointerEvents: 'auto',
                  background: 'rgba(10, 14, 24, 0.85)',
                  backdropFilter: 'blur(8px)',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.75rem',
                  color: '#fbbf24',
                  fontWeight: 600
                }}
              >
                <Compass size={14} />
                <span>East-Facing Main Entrance (Ishanya Entry)</span>
              </div>

              <div
                style={{
                  pointerEvents: 'auto',
                  background: 'rgba(10, 14, 24, 0.85)',
                  backdropFilter: 'blur(8px)',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <button
                  onClick={() => setIsMeasureMode(!isMeasureMode)}
                  style={{
                    background: isMeasureMode ? '#f59e0b' : 'transparent',
                    color: isMeasureMode ? '#000' : '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}
                  title="Click two points to measure distance"
                >
                  <Ruler size={13} />
                  <span>{isMeasureMode ? 'Measuring...' : 'Measure'}</span>
                </button>

                <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.2)' }} />

                <button
                  onClick={() => setCadZoom(prev => Math.min(prev + 0.15, 1.8))}
                  style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px' }}
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', minWidth: '35px', textAlign: 'center' }}>
                  {Math.round(cadZoom * 100)}%
                </span>
                <button
                  onClick={() => setCadZoom(prev => Math.max(prev - 0.15, 0.7))}
                  style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px' }}
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <button
                  onClick={() => setCadZoom(1)}
                  style={{ background: 'transparent', border: 'none', color: '#f59e0b', cursor: 'pointer', padding: '4px' }}
                  title="Reset Scale"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Measurement Banner when Ruler is Active */}
            {isMeasureMode && (
              <div
                style={{
                  position: 'absolute',
                  top: '52px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(245, 158, 11, 0.95)',
                  color: '#080b11',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  zIndex: 15,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                }}
              >
                <Ruler size={14} />
                {measurementResult ? (
                  <span>Distance: <strong>{measurementResult.distFt} ft ({measurementResult.distM} m)</strong></span>
                ) : measurePoints.length === 1 ? (
                  <span>Click end point to measure...</span>
                ) : (
                  <span>Click start point on blueprint</span>
                )}
                {measurePoints.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMeasurePoints([]);
                      setMeasurementResult(null);
                    }}
                    style={{ background: '#000', color: '#fff', border: 'none', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    ×
                  </button>
                )}
              </div>
            )}

            {/* SVG Canvas Area */}
            <div
              style={{
                flex: 1,
                minHeight: '520px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                padding: '40px 20px',
                overflow: 'auto',
                cursor: isMeasureMode ? 'crosshair' : 'default'
              }}
              onClick={handleSvgCanvasClick}
            >
              <div
                style={{
                  transform: `scale(${cadZoom})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease',
                  position: 'relative'
                }}
              >
                <svg
                  width="440"
                  height="550"
                  viewBox="0 0 440 550"
                  style={{
                    background: '#04070d',
                    borderRadius: '8px',
                    border: '2px solid rgba(245, 158, 11, 0.4)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
                  }}
                >
                  {/* Grid Lines */}
                  {cadLayers.grid && (
                    <g opacity="0.15">
                      {Array.from({ length: 22 }).map((_, i) => (
                        <line key={`v-${i}`} x1={i * 20} y1="0" x2={i * 20} y2="550" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="2,2" />
                      ))}
                      {Array.from({ length: 28 }).map((_, i) => (
                        <line key={`h-${i}`} x1="0" y1={i * 20} x2="440" y2={i * 20} stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="2,2" />
                      ))}
                    </g>
                  )}

                  {/* Exterior Compound & Setback Boundary */}
                  <rect x="10" y="10" width="420" height="530" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="4,4" />
                  <text x="20" y="24" fill="#64748b" fontSize="8" fontWeight="600">ROAD BOUNDARY (EAST) • 30 FT WIDE ROAD</text>

                  {/* Outer 9" Structural Walls */}
                  <rect x="25" y="35" width="380" height="480" fill="none" stroke="#f59e0b" strokeWidth="6" strokeLinejoin="round" />

                  {/* Rooms on current floor */}
                  {currentRooms.map((room) => {
                    const isSelected = selectedRoomId === room.id;
                    return (
                      <g
                        key={room.id}
                        onClick={(e) => {
                          if (!isMeasureMode) {
                            e.stopPropagation();
                            setSelectedRoomId(room.id);
                          }
                        }}
                        style={{ cursor: isMeasureMode ? 'crosshair' : 'pointer' }}
                      >
                        {/* Room Area Rectangle */}
                        <rect
                          x={room.rect.x}
                          y={room.rect.y}
                          width={room.rect.w}
                          height={room.rect.h}
                          fill={isSelected ? 'rgba(245, 158, 11, 0.25)' : room.color}
                          stroke={isSelected ? '#f59e0b' : room.borderColor}
                          strokeWidth={isSelected ? '2.5' : '1.5'}
                          rx="4"
                        />

                        {/* Room Labels */}
                        <text
                          x={room.rect.x + room.rect.w / 2}
                          y={room.rect.y + room.rect.h / 2 - 10}
                          textAnchor="middle"
                          fill={isSelected ? '#fbbf24' : '#ffffff'}
                          fontSize="11"
                          fontWeight="700"
                        >
                          {room.name}
                        </text>
                        <text
                          x={room.rect.x + room.rect.w / 2}
                          y={room.rect.y + room.rect.h / 2 + 6}
                          textAnchor="middle"
                          fill="#cbd5e1"
                          fontSize="9"
                          fontWeight="600"
                        >
                          {room.dim}
                        </text>
                        <text
                          x={room.rect.x + room.rect.w / 2}
                          y={room.rect.y + room.rect.h / 2 + 18}
                          textAnchor="middle"
                          fill="#94a3b8"
                          fontSize="8"
                        >
                          ({room.areaSqft} sq.ft)
                        </text>

                        {/* Furniture Layer Mock */}
                        {cadLayers.furniture && (
                          <g stroke="rgba(255, 255, 255, 0.25)" fill="rgba(255, 255, 255, 0.05)" strokeWidth="1">
                            {room.id === 'living_room' && (
                              <>
                                <rect x={room.rect.x + 30} y={room.rect.y + 30} width="80" height="35" rx="3" />
                                <rect x={room.rect.x + 50} y={room.rect.y + 75} width="40" height="25" rx="2" />
                              </>
                            )}
                            {room.id === 'master_bed' && (
                              <rect x={room.rect.x + 40} y={room.rect.y + 40} width="70" height="80" rx="3" />
                            )}
                            {room.id === 'modular_kitchen' && (
                              <rect x={room.rect.x + 10} y={room.rect.y + 10} width="145" height="25" rx="2" />
                            )}
                          </g>
                        )}

                        {/* Door swing arc preview */}
                        {cadLayers.doorsWindows && (
                          <g stroke="#38bdf8" strokeWidth="1" fill="none">
                            <path d={`M ${room.rect.x + 10} ${room.rect.y} A 20 20 0 0 1 ${room.rect.x + 30} ${room.rect.y + 20}`} />
                            <line x1={room.rect.x + 10} y1={room.rect.y} x2={room.rect.x + 10} y2={room.rect.y + 20} stroke="#38bdf8" strokeWidth="2" />
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* Structural Columns (C1 to C12) */}
                  {cadLayers.columns && columnsList.map((col) => (
                    <g key={col.id}>
                      <rect
                        x={col.x - 4}
                        y={col.y - 4}
                        width="10"
                        height="10"
                        fill="#ef4444"
                        stroke="#ffffff"
                        strokeWidth="1"
                      />
                      <text x={col.x + 8} y={col.y + 4} fill="#ef4444" fontSize="7" fontWeight="bold">
                        {col.id}
                      </text>
                    </g>
                  ))}

                  {/* Dimension Annotations */}
                  {cadLayers.dimensions && (
                    <g stroke="#fbbf24" strokeWidth="1" fill="#fbbf24" fontSize="8" fontWeight="600">
                      <line x1="25" y1="28" x2="405" y2="28" />
                      <text x="215" y="24" textAnchor="middle">PLOT WIDTH: 40'0"</text>
                      <line x1="16" y1="35" x2="16" y2="515" />
                      <text x="12" y="275" textAnchor="middle" transform="rotate(-90 12 275)">PLOT LENGTH: 60'0"</text>
                    </g>
                  )}

                  {/* Live Measurement Laser Line */}
                  {measurePoints.length > 0 && (
                    <g>
                      {measurePoints.map((p, idx) => (
                        <circle key={idx} cx={p.x} cy={p.y} r="5" fill="#f59e0b" stroke="#000" strokeWidth="2" />
                      ))}
                      {measurePoints.length === 2 && (
                        <>
                          <line
                            x1={measurePoints[0].x}
                            y1={measurePoints[0].y}
                            x2={measurePoints[1].x}
                            y2={measurePoints[1].y}
                            stroke="#f59e0b"
                            strokeWidth="2"
                            strokeDasharray="4,3"
                          />
                          {measurementResult && (
                            <g>
                              <rect
                                x={(measurePoints[0].x + measurePoints[1].x) / 2 - 35}
                                y={(measurePoints[0].y + measurePoints[1].y) / 2 - 12}
                                width="70"
                                height="22"
                                fill="#080b11"
                                stroke="#f59e0b"
                                strokeWidth="1"
                                rx="4"
                              />
                              <text
                                x={(measurePoints[0].x + measurePoints[1].x) / 2}
                                y={(measurePoints[0].y + measurePoints[1].y) / 2 + 3}
                                fill="#fbbf24"
                                fontSize="9"
                                fontWeight="bold"
                                textAnchor="middle"
                              >
                                {measurementResult.distFt} ft
                              </text>
                            </g>
                          )}
                        </>
                      )}
                    </g>
                  )}
                </svg>
              </div>
            </div>

            {/* Bottom Canvas Status Bar */}
            <div
              style={{
                background: '#0b0f19',
                padding: '8px 16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.75rem',
                color: '#94a3b8'
              }}
            >
              <div>
                <span>Selected: </span>
                <strong style={{ color: '#fbbf24' }}>{activeSelectedRoom?.name}</strong>
                <span> • Click any room or use ruler to inspect</span>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span>Scale 1:50</span>
                <span>•</span>
                <span>Building Byelaw Sanction: Compliant ✓</span>
              </div>
            </div>
          </div>

          {/* Right: Selected Room Live Property Inspector */}
          <div
            style={{
              background: '#101522',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              overflowY: 'auto'
            }}
          >
            <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
                  Room Specification
                </span>
                <span
                  style={{
                    background: 'rgba(52, 211, 153, 0.15)',
                    color: '#34d399',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}
                >
                  {activeSelectedRoom?.vaastuStatus}
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                {activeSelectedRoom?.name}
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Zone: <strong style={{ color: '#38bdf8' }}>{activeSelectedRoom?.zone}</strong>
              </p>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ background: '#0b0f19', padding: '10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>DIMENSIONS</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fbbf24' }}>{activeSelectedRoom?.dim}</span>
              </div>
              <div style={{ background: '#0b0f19', padding: '10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block' }}>CARPET AREA</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399' }}>{activeSelectedRoom?.areaSqft} sq.ft</span>
              </div>
            </div>

            {/* Specs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: '#0b0f19', padding: '10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>
                  CEILING CLEAR HEIGHT
                </span>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>
                  {activeSelectedRoom?.ceilingHeight}
                </div>
              </div>

              <div style={{ background: '#0b0f19', padding: '10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>
                  FLOORING MATERIAL
                </span>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>
                  {activeSelectedRoom?.flooring}
                </div>
              </div>

              <div style={{ background: '#0b0f19', padding: '10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>
                  FALSE CEILING SPEC
                </span>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  {activeSelectedRoom?.ceilingType}
                </div>
              </div>

              <div style={{ background: '#0b0f19', padding: '10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>
                  ELECTRICAL CONDUIT LOAD
                </span>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                  {activeSelectedRoom?.electrical}
                </div>
              </div>

              <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '10px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Compass size={13} color="#f59e0b" />
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fbbf24' }}>Vaastu Alignment</span>
                </div>
                <p style={{ fontSize: '0.72rem', color: '#e2e8f0', lineHeight: '1.35', margin: 0 }}>
                  {activeSelectedRoom?.vaastuNote}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditRoomModalOpen(true)}
              style={{
                marginTop: 'auto',
                width: '100%',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#080b11',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.825rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Edit3 size={14} />
              Modify Dimensions & Specs
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          SUB-TAB 2: 3D PHOTOREALISTIC ELEVATION & SOLAR SIMULATOR
      ========================================================= */}
      {activeSubTab === '3d_elevation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Controls HUD for Lighting & Angles */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              background: '#101522',
              padding: '12px 18px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            {/* Time of Day Sun / Lighting Simulation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Solar Lighting:
              </span>
              {[
                { id: 'sunrise', label: 'Sunrise (7:30 AM)', icon: <Sunrise size={14} /> },
                { id: 'day', label: 'Midday Sun (12:30 PM)', icon: <Sun size={14} /> },
                { id: 'golden', label: 'Golden Hour (5:45 PM)', icon: <Sunset size={14} /> },
                { id: 'night', label: 'Night Architectural Glow', icon: <Moon size={14} /> }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setLightingMood(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: lightingMood === item.id ? '#f59e0b' : 'rgba(255, 255, 255, 0.04)',
                    color: lightingMood === item.id ? '#080b11' : '#cbd5e1',
                    border: lightingMood === item.id ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.06)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>

            {/* Camera Perspective Angles */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Angle:
              </span>
              {[
                { id: 'front', label: 'Front Facade' },
                { id: 'isometric', label: '45° Corner' },
                { id: 'drone', label: 'Drone Bird-Eye' }
              ].map((ang) => (
                <button
                  key={ang.id}
                  onClick={() => setCameraAngle(ang.id)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: cameraAngle === ang.id ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                    color: cameraAngle === ang.id ? '#38bdf8' : '#94a3b8',
                    border: cameraAngle === ang.id ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {ang.label}
                </button>
              ))}
              <button
                onClick={() => {
                  confetti({ particleCount: 50, spread: 60 });
                  alert('📸 High-Resolution 4K Elevation Rendering captured and saved to project assets!');
                }}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Camera size={13} />
                Snapshot
              </button>
            </div>
          </div>

          {/* 3D Photorealistic Viewport with Interactive Hotspots */}
          <div
            style={{
              position: 'relative',
              height: '560px',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: '#070a10',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            }}
          >
            <img
              src={get3dElevationImage()}
              alt="3D Architectural Elevation"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: lightingMood === 'night' ? 'brightness(0.9) contrast(1.1)' : 'brightness(1.02)'
              }}
            />

            {/* Gradient Overlays */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: lightingMood === 'night'
                  ? 'radial-gradient(circle at 50% 30%, rgba(30, 58, 138, 0.2), rgba(3, 7, 18, 0.7) 80%)'
                  : lightingMood === 'sunrise'
                  ? 'radial-gradient(circle at 20% 20%, rgba(251, 146, 60, 0.15), transparent 70%)'
                  : 'none',
                pointerEvents: 'none'
              }}
            />

            {/* Hotspot Markers */}
            {elevationHotspots.map((hs) => {
              const isActive = activeHotspot?.id === hs.id;
              return (
                <div
                  key={hs.id}
                  style={{
                    position: 'absolute',
                    top: hs.y,
                    left: hs.x,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 20
                  }}
                >
                  <button
                    onClick={() => setActiveHotspot(isActive ? null : hs)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: isActive ? '#f59e0b' : 'rgba(15, 23, 42, 0.85)',
                      color: isActive ? '#000' : '#fbbf24',
                      border: '2px solid #f59e0b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 0 15px rgba(245, 158, 11, 0.6)'
                    }}
                  >
                    <Info size={14} />
                  </button>

                  {/* Hotspot Popup Tooltip */}
                  {isActive && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '36px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '260px',
                        background: 'rgba(10, 14, 24, 0.95)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(245, 158, 11, 0.4)',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.8)',
                        zIndex: 30
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fbbf24', marginBottom: '4px' }}>
                        {hs.title}
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.4', margin: 0 }}>
                        {hs.desc}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Floating Material Swatches Dock at Bottom */}
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(10, 14, 24, 0.88)',
                backdropFilter: 'blur(14px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                padding: '10px 18px',
                borderRadius: '30px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                zIndex: 20
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Wall Cladding:
                </span>
                {[
                  { id: 'travertine', label: 'Travertine Stone' },
                  { id: 'brick', label: 'Wirecut Brick' },
                  { id: 'wood', label: 'Teak Slats' },
                  { id: 'concrete', label: 'Raw Concrete' }
                ].map((mat) => (
                  <button
                    key={mat.id}
                    onClick={() => setWallFinish(mat.id)}
                    style={{
                      background: wallFinish === mat.id ? '#f59e0b' : 'rgba(255, 255, 255, 0.08)',
                      color: wallFinish === mat.id ? '#080b11' : '#cbd5e1',
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {mat.label}
                  </button>
                ))}
              </div>

              <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.15)' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>
                  ⚡ Solar Potential: 5.2 kWp
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          SUB-TAB 3: 3D INTERIOR ROOM WALKTHROUGH
      ========================================================= */}
      {activeSubTab === 'interior_walkthrough' && (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '18px' }}>
          {/* Left: Room & Style Palette */}
          <div
            style={{
              background: '#101522',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '8px' }}>
                Select Room Walkthrough
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { id: 'living', label: '🛋️ Grand Living Room', sub: 'Double-height ceiling with foyer' },
                  { id: 'master_bed', label: '🛏️ Master Suite', sub: 'Hardwood floor & walk-in wardrobe' },
                  { id: 'kitchen', label: '🍳 Modular Kitchen', sub: 'Italian island & quartz countertops' },
                  { id: 'balcony', label: '🌿 Zen Terrace Balcony', sub: 'WPC decking & vertical garden' },
                  { id: 'pooja', label: '🪔 Pooja Sanctum', sub: 'Makrana marble & teak jaali' },
                  { id: 'theater', label: '🎬 Home Cinema Lounge', sub: 'Acoustic panelling & 4K laser' }
                ].map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setInteriorRoom(room.id)}
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      background: interiorRoom === room.id ? 'rgba(245, 158, 11, 0.18)' : '#0b0f19',
                      border: interiorRoom === room.id ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      color: interiorRoom === room.id ? '#fbbf24' : '#cbd5e1',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '0.825rem', fontWeight: 700 }}>{room.label}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>{room.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '8px' }}>
                AI Interior Mood Style
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { id: 'luxury_contemporary', label: 'Contemporary Italian Luxury' },
                  { id: 'modern_minimalist', label: 'Sleek Modern Minimalist' },
                  { id: 'japandi', label: 'Japandi Organic Teak' },
                  { id: 'chettinad', label: 'Heritage Chettinad Vernacular' },
                  { id: 'industrial', label: 'Industrial Modern Loft' }
                ].map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setInteriorStyle(style.id)}
                    style={{
                      padding: '8px 10px',
                      textAlign: 'left',
                      background: interiorStyle === style.id ? 'rgba(56, 189, 248, 0.15)' : '#0b0f19',
                      border: interiorStyle === style.id ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.04)',
                      borderRadius: '6px',
                      color: interiorStyle === style.id ? '#38bdf8' : '#94a3b8',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: '#0b0f19', padding: '12px', borderRadius: '10px', marginTop: 'auto' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                Lighting Scene
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { id: 'daylight', label: 'Daylight' },
                  { id: 'warm_cove', label: 'Warm 3000K' },
                  { id: 'evening_glow', label: 'Evening' }
                ].map((ls) => (
                  <button
                    key={ls.id}
                    onClick={() => setLightingScene(ls.id)}
                    style={{
                      flex: 1,
                      padding: '6px 4px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      background: lightingScene === ls.id ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                      color: lightingScene === ls.id ? '#000' : '#94a3b8',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {ls.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Immersive Interior Render View */}
          <div
            style={{
              position: 'relative',
              height: '540px',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: '#070a10'
            }}
          >
            <img
              src={getInteriorImage()}
              alt="Interior Walkthrough"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            <div
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                background: 'rgba(8, 11, 17, 0.85)',
                backdropFilter: 'blur(10px)',
                padding: '10px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>
                ACTIVE INTERIOR SPACE
              </span>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fbbf24' }}>
                {interiorRoom.toUpperCase().replace('_', ' ')} • {interiorStyle.replace('_', ' ').toUpperCase()}
              </div>
            </div>

            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                display: 'flex',
                gap: '8px'
              }}
            >
              <button
                onClick={() => {
                  confetti({ particleCount: 60, spread: 70 });
                  alert('🎨 Regenerated high-resolution photorealistic interior mood render!');
                }}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#080b11',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Sparkles size={14} />
                Generate AI Variation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          SUB-TAB 4: STRUCTURAL & MEP ENGINEERING DRAWINGS
      ========================================================= */}
      {activeSubTab === 'mep_structural' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
          {/* Left: Engineering Schematics Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { id: 'structural', label: 'RCC Structural Schedule', icon: <Building2 size={14} /> },
                { id: 'electrical', label: 'Single Line Diagram (SLD)', icon: <Zap size={14} /> },
                { id: 'plumbing', label: 'Plumbing & PHE Stacks', icon: <Droplets size={14} /> }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setMepCategory(cat.id)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px',
                    borderRadius: '8px',
                    background: mepCategory === cat.id ? '#f59e0b' : '#101522',
                    color: mepCategory === cat.id ? '#080b11' : '#cbd5e1',
                    border: mepCategory === cat.id ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              ))}
            </div>

            {mepCategory === 'structural' && (
              <div style={{ background: '#101522', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginBottom: '14px' }}>
                  RCC Column & Footing Schedule (M25 Grade Concrete)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { mark: 'C1 - C6 (Perimeter)', size: '9" × 15"', rebar: '6 nos 16mm Fe550D TMT', ties: '8mm @ 6" c/c', footing: 'F1: 5\'0" × 5\'0" × 18" depth' },
                    { mark: 'C7 - C9 (Central Core)', size: '9" × 18"', rebar: '8 nos 20mm Fe550D TMT', ties: '8mm @ 4" c/c at junctions', footing: 'F2: 6\'0" × 6\'0" × 20" depth' },
                    { mark: 'Plinth Beam (PB1)', size: '9" × 12"', rebar: '2-16mm top + 3-16mm bottom', ties: '8mm @ 6" c/c', footing: 'M25 with integral waterproofing' },
                    { mark: 'Roof Slab (S1)', size: '5" Thick (125mm)', rebar: '8mm @ 6" c/c main + 8mm @ 7" distribution', ties: 'Two-way RCC slab with cranked bars', footing: 'Cured for 21 days with ponding' }
                  ].map((item, idx) => (
                    <div key={idx} style={{ background: '#0b0f19', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24' }}>{item.mark}</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#38bdf8' }}>{item.size}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Main Reinforcement: <strong>{item.rebar}</strong></div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>Detail: {item.ties} • {item.footing}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mepCategory === 'electrical' && (
              <div style={{ background: '#101522', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginBottom: '14px' }}>
                  Electrical Distribution & Conduit Schematics
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { title: 'Main 3-Phase 63A DB', detail: 'Schneider / Havells 12-Way TPN DB with 100mA ELCB + 16/32A Type-C MCBs' },
                    { title: 'Dedicated Inverter Backup', detail: '3.5 kVA Solar Hybrid Inverter with 48V LiFePO4 battery cabinet' },
                    { title: 'Concealed Slab Conduits', detail: '25mm Heavy-Gauge Virgin PVC Conduits embedded in RCC slab casting' },
                    { title: 'EV Fast Charger Sub-Panel', detail: '7.4 kW 32A Single-Phase Type-2 with dedicated 40A RCBO & earth spike' }
                  ].map((item, idx) => (
                    <div key={idx} style={{ background: '#0b0f19', padding: '12px 14px', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', marginBottom: '4px' }}>{item.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mepCategory === 'plumbing' && (
              <div style={{ background: '#101522', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginBottom: '14px' }}>
                  Plumbing, Sump & Drainage Schematics
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { title: 'Dual Supply Piping', detail: 'Astral SDR-11 CPVC for Hot/Cold Potable + Astral UPVC for Flushing' },
                    { title: 'Underground Sump & OHT', detail: '10,000L Reinforced RCC Sump with Anti-Fungal Epoxy + 2,000L 4-Layer OHT' },
                    { title: 'Rainwater Harvesting (RWH)', detail: '3-stage silt chamber with 150mm PVC recharge shaft to deep borewell' }
                  ].map((item, idx) => (
                    <div key={idx} style={{ background: '#0b0f19', padding: '12px 14px', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', marginBottom: '4px' }}>{item.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Structural Sanction Sign-off */}
          <div style={{ background: '#101522', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
              Structural Engineer Sign-off & Stamping
            </h3>
            <div style={{ background: '#0b0f19', padding: '14px', borderRadius: '10px', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <CheckCircle2 size={16} color="#34d399" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>Certified for Seismic Zone III</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.4', margin: 0 }}>
                Structural design conforms to IS 456:2000 (Plain and Reinforced Concrete) and IS 1893:2016 (Earthquake Resistant Design).
              </p>
            </div>

            <div style={{ background: '#0b0f19', padding: '14px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>LEAD STRUCTURAL CONSULTANT</span>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>Er. S. Annamalai, M.E. (Struct), MIE</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>License No: CMDA/RE/GR-I/2024/0421</div>
            </div>

            <button
              onClick={() => {
                alert('📄 Generating Official Structural Drawing Set for Site Mason Execution...');
              }}
              style={{
                marginTop: 'auto',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Printer size={15} />
              Print 1:100 Scale Construction Set
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          SUB-TAB 5: VAASTU COMPLIANCE & MUNICIPAL BYELAWS AUDITOR
      ========================================================= */}
      {activeSubTab === 'vaastu_byelaws' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.2fr', gap: '20px' }}>
          {/* Left: 9-Zone Vaastu Mandala Matrix */}
          <div style={{ background: '#101522', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                  Vaastu Purusha Mandala Matrix
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Traditional Vedic Architectural Alignment</span>
              </div>
              <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 800, padding: '4px 10px', borderRadius: '8px' }}>
                98% Auspicious
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
              {vaastuZones.map((m) => {
                const isSelected = selectedVaastuZone === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedVaastuZone(m.id)}
                    style={{
                      background: isSelected ? 'rgba(245, 158, 11, 0.2)' : '#0b0f19',
                      border: isSelected ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.04)',
                      padding: '10px',
                      borderRadius: '8px',
                      textAlign: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isSelected ? '#fbbf24' : '#ffffff' }}>{m.zone.split(' ')[0]}</div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', margin: '2px 0' }}>{m.room.split('&')[0]}</div>
                    <span style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: 700 }}>✓ {m.score}%</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Zone Deep-Dive Card */}
            {(() => {
              const activeZ = vaastuZones.find(z => z.id === selectedVaastuZone) || vaastuZones[0];
              return (
                <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24' }}>{activeZ.zone}</span>
                    <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700 }}>{activeZ.status}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '4px' }}>
                    Element: <strong>{activeZ.element}</strong> • Placement: <strong>{activeZ.room}</strong>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: '1.35', margin: 0 }}>
                    💡 {activeZ.tip}
                  </p>
                </div>
              );
            })()}
          </div>

          {/* Right: Municipal Byelaws & Setback Clearance */}
          <div style={{ background: '#101522', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
              Municipal Setback & FSI Verification
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: '#0b0f19', padding: '12px', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>FRONT SETBACK (ROAD)</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34d399' }}>5.0 ft (Req: 4.5 ft ✓)</div>
              </div>
              <div style={{ background: '#0b0f19', padding: '12px', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>REAR SETBACK</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34d399' }}>3.0 ft (Req: 3.0 ft ✓)</div>
              </div>
              <div style={{ background: '#0b0f19', padding: '12px', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>SIDE SETBACKS (L/R)</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34d399' }}>3.0 ft & 3.5 ft (✓)</div>
              </div>
              <div style={{ background: '#0b0f19', padding: '12px', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>FSI / FAR UTILIZATION</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fbbf24' }}>1.74 (Max: 2.00 ✓)</div>
              </div>
            </div>

            <div style={{ background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.25)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', marginBottom: '2px' }}>
                ✓ 100% Pre-Sanction Compliant
              </div>
              <p style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: '1.35', margin: 0 }}>
                Eligible for Single-Window Fast-Track Online Building Permit approval across CMDA (Chennai), GHMC (Hyderabad), and BBMP (Bengaluru).
              </p>
            </div>

            <button
              onClick={() => {
                confetti({ particleCount: 75, spread: 70 });
                alert('📜 Municipal Sanction Application Packet generated with geo-tagged setbacks and AutoDCR layers!');
              }}
              style={{
                marginTop: 'auto',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#080b11',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.825rem',
                cursor: 'pointer'
              }}
            >
              Generate AutoDCR Municipal Sanction Dossier
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          SUB-TAB 6: AI DESIGN COPILOT & VERSION HISTORY
      ========================================================= */}
      {activeSubTab === 'ai_copilot' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
          {/* Left: AI Prompt Engine */}
          <div style={{ background: '#101522', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#f59e0b" />
                AI Architectural Copilot
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                Instruct AI to modify floorplans, add skylights, alter elevations, or adjust Vaastu configurations.
              </p>
            </div>

            <div style={{ position: 'relative' }}>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., Add a double-height central skylight above the living room and extend the master bedroom balcony by 4 feet with teakwood louvers..."
                rows={4}
                style={{
                  width: '100%',
                  background: '#070a10',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  padding: '12px',
                  color: '#ffffff',
                  fontSize: '0.825rem',
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Quick Prompt Suggestions */}
            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                QUICK DESIGN PROMPTS:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  'Convert terrace into a landscaped Japanese Zen garden with timber pergola',
                  'Increase kitchen window fenestration by 30% for improved morning daylighting',
                  'Add acoustic double-glazed sliding glass partition between living & dining',
                  'Simulate evening sunset lighting with warm architectural linear LED profiles'
                ].map((txt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setAiPrompt(txt)}
                    style={{
                      textAlign: 'left',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      color: '#cbd5e1',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    + {txt}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAiPromptApply}
              disabled={isAiProcessing || !aiPrompt.trim()}
              style={{
                background: isAiProcessing ? 'rgba(245, 158, 11, 0.5)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#080b11',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: isAiProcessing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isAiProcessing ? (
                <>
                  <RefreshCw size={16} className="spin-animation" />
                  Generating Architectural Revision...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Apply AI Architectural Modification
                </>
              )}
            </button>
          </div>

          {/* Right: Modification Log & Version Branching */}
          <div style={{ background: '#101522', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                Design Version History
              </h3>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b' }}>
                Active: v2.4 Pro
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
              {copilotHistory.map((item) => (
                <div key={item.id} style={{ background: '#0b0f19', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#38bdf8' }}>{item.author}</span>
                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{item.time}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#e2e8f0', margin: 0 }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          INTERACTIVE MODAL: MODIFY ROOM DIMENSIONS & SPECIFICATIONS
      ========================================================= */}
      {isEditRoomModalOpen && activeSelectedRoom && (
        <EditRoomModal
          room={activeSelectedRoom}
          onClose={() => setIsEditRoomModalOpen(false)}
          onSave={handleSaveRoomEdits}
        />
      )}
    </div>
  );
}

// Subcomponent: Edit Room Dimensions & Specs Modal
function EditRoomModal({ room, onClose, onSave }) {
  const [name, setName] = useState(room.name);
  const [widthFt, setWidthFt] = useState(room.widthFt || 14);
  const [lengthFt, setLengthFt] = useState(room.lengthFt || 12);
  const [flooring, setFlooring] = useState(room.flooring);
  const [ceilingType, setCeilingType] = useState(room.ceilingType || 'Minimalist Gypsum False Ceiling with 3000K Cove LED');
  const [paint, setPaint] = useState(room.paint);

  const calculatedArea = widthFt * lengthFt;
  const calculatedSqm = (calculatedArea * 0.092903).toFixed(2);

  const handleSave = () => {
    const updated = {
      ...room,
      name,
      widthFt,
      lengthFt,
      dim: `${widthFt}'0" × ${lengthFt}'0"`,
      areaSqft: calculatedArea,
      areaSqm: calculatedSqm,
      flooring,
      ceilingType,
      paint
    };
    onSave(updated);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#0d121f',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '520px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.9)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
              Room Customizer
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '2px 0 0' }}>
              Edit {room.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Room Name Input */}
        <div>
          <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
            Room Title
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              background: '#070a10',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#ffffff',
              fontSize: '0.85rem'
            }}
          />
        </div>

        {/* Width & Length Sliders */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Width (ft)</span>
              <strong style={{ fontSize: '0.8rem', color: '#fbbf24' }}>{widthFt} ft</strong>
            </div>
            <input
              type="range"
              min={6}
              max={30}
              value={widthFt}
              onChange={(e) => setWidthFt(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#f59e0b' }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Length (ft)</span>
              <strong style={{ fontSize: '0.8rem', color: '#fbbf24' }}>{lengthFt} ft</strong>
            </div>
            <input
              type="range"
              min={6}
              max={30}
              value={lengthFt}
              onChange={(e) => setLengthFt(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#f59e0b' }}
            />
          </div>
        </div>

        {/* Calculated Area Metric */}
        <div style={{ background: '#070a10', padding: '10px 14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>TOTAL CARPET AREA</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399' }}>{calculatedArea} sq.ft ({calculatedSqm} m²)</div>
          </div>
          <span style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', fontSize: '0.75rem', fontWeight: 700, padding: '4px 8px', borderRadius: '6px' }}>
            Optimal Proportions ✓
          </span>
        </div>

        {/* Flooring Select */}
        <div>
          <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
            Flooring Finish
          </label>
          <select
            value={flooring}
            onChange={(e) => setFlooring(e.target.value)}
            style={{
              width: '100%',
              background: '#070a10',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#ffffff',
              fontSize: '0.825rem'
            }}
          >
            <option value="Italian Botticino Marble (800×1600mm Slab)">Italian Botticino Marble (800×1600mm Slab)</option>
            <option value="Pergo Engineered Hardwood Oak Planks">Pergo Engineered Hardwood Oak Planks</option>
            <option value="Kajaria Vitrified Anti-Skid GVT (600×1200mm)">Kajaria Vitrified Anti-Skid GVT (600×1200mm)</option>
            <option value="Makrana Pure White Marble Inlay">Makrana Pure White Marble Inlay</option>
            <option value="Heavy-Duty Cobblestone Pavers & Granite">Heavy-Duty Cobblestone Pavers & Granite</option>
          </select>
        </div>

        {/* False Ceiling Select */}
        <div>
          <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
            False Ceiling & Lighting Profile
          </label>
          <select
            value={ceilingType}
            onChange={(e) => setCeilingType(e.target.value)}
            style={{
              width: '100%',
              background: '#070a10',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#ffffff',
              fontSize: '0.825rem'
            }}
          >
            <option value="Minimalist Gypsum False Ceiling with 3000K Cove LED">Minimalist Gypsum False Ceiling with 3000K Cove LED</option>
            <option value="Warm Perimeter Wooden Rafters with Indirect Cove">Warm Perimeter Wooden Rafters with Indirect Cove</option>
            <option value="Magnetic Track Light System with Spotlight Modules">Magnetic Track Light System with Spotlight Modules</option>
            <option value="Flush Moisture-Proof Gypsum with Task Spots">Flush Moisture-Proof Gypsum with Task Spots</option>
            <option value="Dome Shaped Backlit Onyx Marble Ceiling">Dome Shaped Backlit Onyx Marble Ceiling</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              padding: '10px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              flex: 1.5,
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              border: 'none',
              color: '#080b11',
              padding: '10px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Save & Recalculate BOQ
          </button>
        </div>
      </div>
    </div>
  );
}
