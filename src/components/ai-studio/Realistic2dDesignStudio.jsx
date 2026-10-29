import React, { useState, useRef } from 'react';
import {
  Layers,
  Maximize2,
  Download,
  Printer,
  Eye,
  CheckCircle2,
  Sparkles,
  Info,
  Square,
  Zap,
  Grid,
  Compass,
  Ruler,
  Sliders,
  Palette,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  FileText,
  Share2,
  SlidersHorizontal,
  Home,
  Check,
  Flame,
  Droplets,
  Wind,
  Sun,
  ShieldCheck,
  Building2,
  Move
} from 'lucide-react';
import confetti from 'canvas-confetti';
import RealisticFloorPlanRenderer from './RealisticFloorPlanRenderer';

/**
 * Realistic2dDesignStudio
 * Ultra-realistic, interactive 2D Architectural CAD and Photorealistic Floor Plan Studio.
 */
export default function Realistic2dDesignStudio({
  plotWidth = 40,
  plotLength = 60,
  bhk = 3,
  floors = 2,
  budgetInr = 4500000,
  facing = 'East',
  style = 'modern_minimalist', // 'modern_minimalist', 'vintage_traditional', 'neoclassical_luxury', 'eco_sustainable'
  hasCourtyard = true,
  hasPooja = true,
  hasCarPorch = true,
  hasBalcony = true,
  onRoomSelect
}) {
  // Visual Mode: 'realistic' (Full color, textures, shadows, furniture) | 'cad' (AutoCAD technical blueprint) | 'mep' (Electrical & Plumbing) | 'vastu' (Energy Mandala Heatmap)
  const [renderMode, setRenderMode] = useState('realistic');
  
  // Floor level
  const [activeFloor, setActiveFloor] = useState('ground'); // 'ground', 'first', 'terrace'
  
  // Active Layer Toggles
  const [layers, setLayers] = useState({
    furniture: true,
    dimensions: true,
    columns: true,
    doorsWindows: true,
    roomLabels: true,
    shadows: true,
    mepConduits: false,
    vastuGrid: false,
    gridGuides: true
  });

  // Interactive Selection & Zoom
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });

  // Tape Measure Tool
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState([]);
  const [measuredDistance, setMeasuredDistance] = useState(null);

  // Custom Floor Finish Overrides (Room ID -> Material Finish)
  const [roomFinishes, setRoomFinishes] = useState({});

  // Canvas scaling parameters (1 ft = 12 SVG units for crisp vector fidelity)
  const scale = 12;
  const W = Number(plotWidth) || 40;
  const L = Number(plotLength) || 60;
  
  // Setbacks: Front 5ft, Rear 3ft, Sides 3ft
  const setbackFront = 4;
  const setbackRear = 3;
  const setbackLeft = 3;
  const setbackRight = 3;

  const buildW = W - (setbackLeft + setbackRight);
  const buildL = L - (setbackFront + setbackRear);

  const paddingX = 70;
  const paddingY = 70;
  const svgWidth = Math.max(W * scale + paddingX * 2, 720);
  const svgHeight = Math.max(L * scale + paddingY * 2, 840);

  const originX = paddingX + setbackLeft * scale;
  const originY = paddingY + setbackRear * scale;

  // Generate Multi-Floor Room Layouts dynamically based on parameters
  const getFloorRooms = (floor) => {
    if (floor === 'terrace') {
      return [
        {
          id: 'terrace_open',
          name: 'Open Sky Terrace & Lounge Deck',
          type: 'terrace',
          x: originX,
          y: originY,
          w: buildW * scale,
          h: (buildL - 14) * scale,
          dim: `${buildW}'0" × ${buildL - 14}'0"`,
          sqft: buildW * (buildL - 14),
          vaastu: 'Open Sky Vayu & Solar Prana Zone',
          vaastuScore: 98,
          defaultFinish: 'terracotta_deck',
          furnitureType: 'terrace_seating',
          electrical: 'Waterproof Bollard Uplights, Outdoor Audio Hub'
        },
        {
          id: 'solar_pergola',
          name: '5kW Bifacial Solar Canopy & Pergola',
          type: 'pergola',
          x: originX + 4 * scale,
          y: originY + (buildL - 13) * scale,
          w: (buildW - 8) * scale,
          h: 12 * scale,
          dim: `${buildW - 8}'0" × 12'0"`,
          sqft: (buildW - 8) * 12,
          vaastu: 'Agni / Solar Generation Hub',
          vaastuScore: 95,
          defaultFinish: 'solar_glass',
          furnitureType: 'solar_pergola',
          electrical: 'Grid-tied Inverter Conduit, Solar Meter DB'
        }
      ];
    }

    if (floor === 'first') {
      const suiteW = Math.floor(buildW * 0.55);
      const suiteH = 16;
      const bed2W = buildW - suiteW;
      const bed2H = 15;
      const loungeH = buildL - suiteH - 8;

      return [
        {
          id: 'upper_master',
          name: 'Upper Master Suite & Walk-in Wardrobe',
          type: 'master_bedroom',
          x: originX,
          y: originY,
          w: suiteW * scale,
          h: suiteH * scale,
          dim: `${suiteW}'0" × ${suiteH}'0"`,
          sqft: suiteW * suiteH,
          vaastu: 'Nairuthi (South-West) - Peak Stability & Serenity',
          vaastuScore: 98,
          defaultFinish: 'teak_hardwood',
          furnitureType: 'king_bed_suite',
          electrical: 'Bedside USB 3.0, 2-Way Dimmer Sconces, 2.0 Ton Inverter AC Point'
        },
        {
          id: 'upper_bath',
          name: 'En-Suite Spa Bathroom',
          type: 'bathroom',
          x: originX + suiteW * scale,
          y: originY,
          w: bed2W * scale,
          h: 8 * scale,
          dim: `${bed2W}'0" × 8'0"`,
          sqft: bed2W * 8,
          vaastu: 'West Drainage Zone (Vayu Alignment)',
          vaastuScore: 92,
          defaultFinish: 'italian_marble',
          furnitureType: 'spa_bath',
          electrical: 'Geyser 25L Point, Anti-fog Mirror Backlight, IP65 Exhaust'
        },
        {
          id: 'bedroom_3',
          name: bhk >= 3 ? 'Children / Guest Bedroom 3' : 'Creative Studio & Library',
          type: 'bedroom',
          x: originX + suiteW * scale,
          y: originY + 8 * scale,
          w: bed2W * scale,
          h: (suiteH - 8) * scale,
          dim: `${bed2W}'0" × ${suiteH - 8}'0"`,
          sqft: bed2W * (suiteH - 8),
          vaastu: 'North-West (Vayu Zone) - Active Flow & Intellect',
          vaastuScore: 95,
          defaultFinish: 'oak_wood',
          furnitureType: 'queen_bed',
          electrical: 'Study Desk 16A Hub, LAN RJ45 Point, Ambient Pendant Light'
        },
        {
          id: 'family_lounge',
          name: 'Upper Family Lounge & Home Theatre',
          type: 'living',
          x: originX,
          y: originY + suiteH * scale,
          w: buildW * scale,
          h: Math.max(loungeH * scale, 12 * scale),
          dim: `${buildW}'0" × ${loungeH}'0"`,
          sqft: buildW * loungeH,
          vaastu: 'Central Brahmasthan Connection',
          vaastuScore: 96,
          defaultFinish: 'italian_marble',
          furnitureType: 'sectional_theatre',
          electrical: '7.1 Surround Sound Conduits, 85" OLED TV Box, Cove Lights'
        },
        {
          id: 'front_balcony',
          name: 'Cantilevered Glass Balcony Deck',
          type: 'balcony',
          x: originX,
          y: originY + (suiteH + loungeH) * scale,
          w: buildW * scale,
          h: 6 * scale,
          dim: `${buildW}'0" × 6'0"`,
          sqft: buildW * 6,
          vaastu: `${facing} Facing Morning Breeze Deck`,
          vaastuScore: 99,
          defaultFinish: 'terracotta_deck',
          furnitureType: 'outdoor_coffee',
          electrical: 'Waterproof Ceiling Downlights'
        }
      ];
    }

    // GROUND FLOOR
    const rooms = [];
    const carPorchW = 15;
    const carPorchH = 15;

    // 1. Car Porch & Portico
    if (hasCarPorch) {
      rooms.push({
        id: 'car_porch',
        name: 'EV Car Portico & Grand Entry',
        type: 'porch',
        x: originX,
        y: originY + (buildL - carPorchH) * scale,
        w: carPorchW * scale,
        h: carPorchH * scale,
        dim: `${carPorchW}'0" × ${carPorchH}'0"`,
        sqft: carPorchW * carPorchH,
        vaastu: facing === 'East' ? 'North-East / Auspicious Front Entrance' : 'North-West (Vayu Zone)',
        vaastuScore: 96,
        defaultFinish: 'cobblestone',
        furnitureType: 'car_parking',
        electrical: '2x 16A Type-2 EV Fast Charger, Sensor Floodlights'
      });
    }

    // 2. Entrance Foyer / Heritage Verandah (Thinnai)
    const foyerX = hasCarPorch ? originX + carPorchW * scale : originX;
    const foyerW = hasCarPorch ? (buildW - carPorchW) : buildW;
    const foyerH = 14;

    rooms.push({
      id: 'entrance_foyer',
      name: style === 'vintage_traditional' ? 'Heritage Thinnai & Verandah' : 'Grand Entrance Foyer',
      type: 'entrance',
      x: foyerX,
      y: originY + (buildL - foyerH) * scale,
      w: foyerW * scale,
      h: foyerH * scale,
      dim: `${foyerW}'0" × ${foyerH}'0"`,
      sqft: foyerW * foyerH,
      vaastu: 'Ishanya (North-East) Gateway - Maximum Solar Prana',
      vaastuScore: 99,
      defaultFinish: style === 'vintage_traditional' ? 'red_oxide' : 'italian_marble',
      furnitureType: 'foyer_pillars',
      electrical: 'Smart Touch Keypad, Video Doorbell, Brass Chandelier'
    });

    // 3. Living Room
    const livingW = Math.floor(buildW * 0.58);
    const livingH = 17;
    rooms.push({
      id: 'living_room',
      name: 'Formal Living & Double-Height Lounge',
      type: 'living',
      x: originX,
      y: originY + (buildL - carPorchH - livingH) * scale,
      w: livingW * scale,
      h: livingH * scale,
      dim: `${livingW}'0" × ${livingH}'0"`,
      sqft: livingW * livingH,
      vaastu: 'North-East / Central Zone (Active Pranic Energy)',
      vaastuScore: 97,
      defaultFinish: 'italian_marble',
      furnitureType: 'luxury_sofa',
      electrical: '4-Circuit Chandelier, 6x 3000K Spotlights, AC Concealed Box'
    });

    // 4. Central Open Courtyard (Thotti) or Dining Hall
    const courtW = buildW - livingW;
    const courtH = 14;
    if (hasCourtyard) {
      rooms.push({
        id: 'courtyard',
        name: style === 'vintage_traditional' ? 'Open Thotti Courtyard (Brahmasthan)' : 'Sky-lit Green Courtyard',
        type: 'courtyard',
        x: originX + livingW * scale,
        y: originY + (buildL - foyerH - courtH) * scale,
        w: courtW * scale,
        h: courtH * scale,
        dim: `${courtW}'0" × ${courtH}'0"`,
        sqft: courtW * courtH,
        vaastu: 'Brahmasthan (Cosmic Centre - Zero Load Bearing Zone)',
        vaastuScore: 100,
        defaultFinish: 'courtyard_granite',
        furnitureType: 'courtyard_urli',
        electrical: 'Submersible Fountain Point, Waterproof Uplights'
      });
    }

    // 5. Pooja Room Sanctum
    if (hasPooja) {
      rooms.push({
        id: 'pooja_room',
        name: 'Pooja Mandir Sanctum',
        type: 'pooja',
        x: originX + (buildW - 8) * scale,
        y: originY + (buildL - foyerH - courtH - 7) * scale,
        w: 8 * scale,
        h: 7 * scale,
        dim: '8\'0" × 7\'0"',
        sqft: 56,
        vaastu: 'Ishanya (North-East Corner) - Divine Spiritual Grid',
        vaastuScore: 100,
        defaultFinish: 'makrana_marble',
        furnitureType: 'pooja_mandir',
        electrical: '2x Warm 2700K Focus Spots, Continuous Exhaust Point'
      });
    }

    // 6. Modular Kitchen & Dining (Agneya Zone / South-East)
    const kitchenW = 15;
    const kitchenH = 14;
    rooms.push({
      id: 'modular_kitchen',
      name: 'Modular Island Kitchen & Pantry',
      type: 'kitchen',
      x: originX + (buildW - kitchenW) * scale,
      y: originY + 12 * scale,
      w: kitchenW * scale,
      h: kitchenH * scale,
      dim: `${kitchenW}'0" × ${kitchenH}'0"`,
      sqft: kitchenW * kitchenH,
      vaastu: 'Agni (South-East Corner) - Optimal Thermal Flow',
      vaastuScore: 98,
      defaultFinish: 'granite_kitchen',
      furnitureType: 'modular_island',
      electrical: '3x 16A Power Sockets (Hob/Oven/Fridge), High-CFM Chimney Conduit'
    });

    // 7. Ground Master Bedroom Suite (Nairuthi / South-West for head of house)
    const gMasterW = Math.floor(buildW * 0.54);
    const gMasterH = 16;
    rooms.push({
      id: 'ground_master',
      name: 'Ground Master Suite (Parents/Master)',
      type: 'master_bedroom',
      x: originX,
      y: originY,
      w: gMasterW * scale,
      h: gMasterH * scale,
      dim: `${gMasterW}'0" × ${gMasterH}'0"`,
      sqft: gMasterW * gMasterH,
      vaastu: 'Nairuthi (South-West Corner) - Maximum Heavy Structural Mass',
      vaastuScore: 100,
      defaultFinish: 'teak_hardwood',
      furnitureType: 'king_bed_suite',
      electrical: 'Bedside Master Switch, 16A AC, Dresser Mirror Lights'
    });

    // 8. Attached En-Suite Bath
    const bathW = 9;
    const bathH = 8;
    rooms.push({
      id: 'ground_bath',
      name: 'En-Suite Bathroom & Dresser',
      type: 'bathroom',
      x: originX + gMasterW * scale,
      y: originY,
      w: bathW * scale,
      h: bathH * scale,
      dim: `${bathW}'0" × ${bathH}'0"`,
      sqft: bathW * 8,
      vaastu: 'West Drainage Alignment (Vayu Zone)',
      vaastuScore: 94,
      defaultFinish: 'porcelain_tile',
      furnitureType: 'bathroom_sanitary',
      electrical: 'Geyser 16A, LED Demister Mirror, High-speed Exhaust'
    });

    // 9. Dining Hall
    const diningW = buildW - gMasterW;
    const diningH = 12;
    rooms.push({
      id: 'family_dining',
      name: 'Family Dining & Cantilever Stairwell',
      type: 'dining',
      x: originX + gMasterW * scale,
      y: originY + bathH * scale,
      w: diningW * scale,
      h: diningH * scale,
      dim: `${diningW}'0" × ${diningH}'0"`,
      sqft: diningW * diningH,
      vaastu: 'West / Central Connection',
      vaastuScore: 96,
      defaultFinish: 'italian_marble',
      furnitureType: 'dining_table',
      electrical: 'Low-hang Chandelier, Handwash Counter 6A Point'
    });

    return rooms;
  };

  const rooms = getFloorRooms(activeFloor);
  const selectedRoom = rooms.find(r => r.id === selectedRoomId) || rooms[0] || null;

  // Generate RCC Columns on a standard structural grid (9" x 12" / 230mm x 300mm)
  const generateStructuralColumns = () => {
    const cols = [];
    const gridCols = 4;
    const gridRows = 5;
    const stepX = (buildW * scale) / (gridCols - 1);
    const stepY = (buildL * scale) / (gridRows - 1);

    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        cols.push({
          id: `C-${r + 1}-${c + 1}`,
          name: `C${r * gridCols + c + 1}`,
          x: originX + c * stepX - 6,
          y: originY + r * stepY - 6,
          w: 12,
          h: 12,
          spec: '9" × 12" M25 Grade RCC Column (4x 16mm Fe500D Bars)'
        });
      }
    }
    return cols;
  };

  const columns = generateStructuralColumns();

  // Canvas interaction for distance measuring
  const handleSvgClick = (e) => {
    if (!isMeasuring) return;
    const svgRect = e.currentTarget.getBoundingClientRect();
    const clickX = (e.clientX - svgRect.left) / zoomLevel;
    const clickY = (e.clientY - svgRect.top) / zoomLevel;

    if (measurePoints.length === 0) {
      setMeasurePoints([{ x: clickX, y: clickY }]);
      setMeasuredDistance(null);
    } else if (measurePoints.length === 1) {
      const p1 = measurePoints[0];
      const p2 = { x: clickX, y: clickY };
      setMeasurePoints([p1, p2]);
      
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const pixelDist = Math.sqrt(dx * dx + dy * dy);
      const feetDist = (pixelDist / scale).toFixed(1);
      const meterDist = (feetDist * 0.3048).toFixed(2);
      setMeasuredDistance({ feet: feetDist, meters: meterDist });
    } else {
      setMeasurePoints([{ x: clickX, y: clickY }]);
      setMeasuredDistance(null);
    }
  };

  // Export CAD SVG vector file
  const handleExportSvg = () => {
    confetti({ particleCount: 35, spread: 60 });
    const svgEl = document.getElementById('realistic-2d-canvas-svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const link = document.createElement('a');
    link.href = svgUrl;
    link.download = `BuildMate_${activeFloor.toUpperCase()}_FloorPlan_${plotWidth}x${plotLength}ft_${bhk}BHK.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Floor Finish Pattern Helpers
  const getFloorPattern = (room) => {
    const finish = roomFinishes[room.id] || room.defaultFinish;
    switch (finish) {
      case 'italian_marble':
        return 'url(#marblePattern)';
      case 'teak_hardwood':
        return 'url(#woodPlankPattern)';
      case 'oak_wood':
        return 'url(#oakWoodPattern)';
      case 'red_oxide':
        return 'url(#redOxidePattern)';
      case 'terracotta_deck':
        return 'url(#terracottaPattern)';
      case 'granite_kitchen':
        return 'url(#granitePattern)';
      case 'makrana_marble':
        return 'url(#makranaPattern)';
      case 'cobblestone':
        return 'url(#cobblePattern)';
      case 'courtyard_granite':
        return 'url(#courtyardPattern)';
      case 'porcelain_tile':
        return 'url(#tilePattern)';
      case 'solar_glass':
        return 'url(#solarPattern)';
      default:
        return 'url(#marblePattern)';
    }
  };

  // Render Photorealistic Furniture Top-Down Icons
  const renderFurnitureIllustration = (room) => {
    const cx = room.x + room.w / 2;
    const cy = room.y + room.h / 2;

    switch (room.furnitureType) {
      case 'king_bed_suite':
        return (
          <g opacity={layers.furniture ? 0.95 : 0}>
            {/* King Bed Headboard */}
            <rect x={room.x + 16} y={room.y + 12} width={70} height={12} fill="#3e2723" rx="2" />
            {/* Bed Mattress */}
            <rect x={room.x + 18} y={room.y + 24} width={66} height={82} fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" rx="4" />
            {/* Pillows */}
            <rect x={room.x + 22} y={room.y + 28} width={26} height={18} fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" rx="3" />
            <rect x={room.x + 54} y={room.y + 28} width={26} height={18} fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" rx="3" />
            {/* Bed Duvet / Runner */}
            <rect x={room.x + 18} y={room.y + 60} width={66} height={46} fill="#475569" opacity="0.35" rx="2" />
            {/* Bedside Nightstands */}
            <rect x={room.x + 4} y={room.y + 18} width={12} height={16} fill="#5c4033" stroke="#2c1d11" strokeWidth="1" rx="2" />
            <circle cx={room.x + 10} cy={room.y + 26} r="3" fill="#fbbf24" opacity="0.8" />
            <rect x={room.x + 86} y={room.y + 18} width={12} height={16} fill="#5c4033" stroke="#2c1d11" strokeWidth="1" rx="2" />
            <circle cx={room.x + 92} cy={room.y + 26} r="3" fill="#fbbf24" opacity="0.8" />
            {/* Wardrobe Line */}
            <rect x={room.x + room.w - 20} y={room.y + 10} width={16} height={room.h - 20} fill="#271b12" stroke="#4a3728" strokeWidth="1" rx="2" />
            <line x1={room.x + room.w - 12} y1={room.y + 10} x2={room.x + room.w - 12} y2={room.y + room.h - 10} stroke="#8d6e63" strokeWidth="1" strokeDasharray="3 3" />
          </g>
        );

      case 'queen_bed':
        return (
          <g opacity={layers.furniture ? 0.95 : 0}>
            <rect x={room.x + 14} y={room.y + 10} width={56} height={10} fill="#3e2723" rx="2" />
            <rect x={room.x + 16} y={room.y + 20} width={52} height={68} fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" rx="3" />
            <rect x={room.x + 20} y={room.y + 24} width={20} height={14} fill="#e2e8f0" stroke="#94a3b8" rx="2" />
            <rect x={room.x + 44} y={room.y + 24} width={20} height={14} fill="#e2e8f0" stroke="#94a3b8" rx="2" />
            <rect x={room.x + 16} y={room.y + 52} width={52} height={36} fill="#3b82f6" opacity="0.25" rx="2" />
          </g>
        );

      case 'luxury_sofa':
        return (
          <g opacity={layers.furniture ? 0.95 : 0}>
            {/* L-Shape Sectional Sofa */}
            <path
              d={`M ${room.x + 20} ${room.y + 20} L ${room.x + room.w - 30} ${room.y + 20} L ${room.x + room.w - 30} ${room.y + 50} L ${room.x + 50} ${room.y + 50} L ${room.x + 50} ${room.y + room.h - 30} L ${room.x + 20} ${room.y + room.h - 30} Z`}
              fill="#334155"
              stroke="#1e293b"
              strokeWidth="2"
            />
            {/* Sofa Cushions & Pillows */}
            <rect x={room.x + 24} y={room.y + 24} width={26} height={22} fill="#475569" rx="2" />
            <rect x={room.x + 54} y={room.y + 24} width={26} height={22} fill="#475569" rx="2" />
            <rect x={room.x + 84} y={room.y + 24} width={26} height={22} fill="#475569" rx="2" />
            {/* Glass Coffee Table */}
            <rect x={room.x + 65} y={room.y + 60} width={45} height={28} fill="rgba(56, 189, 248, 0.25)" stroke="#38bdf8" strokeWidth="1.5" rx="4" />
            <circle cx={room.x + 87} cy={room.y + 74} r="5" fill="#f59e0b" opacity="0.6" />
            {/* 85" Wall TV Unit */}
            <rect x={room.x + room.w - 12} y={room.y + 40} width={6} height={70} fill="#0f172a" stroke="#38bdf8" strokeWidth="1" rx="1" />
          </g>
        );

      case 'dining_table':
        return (
          <g opacity={layers.furniture ? 0.95 : 0}>
            {/* Dining Table */}
            <rect x={cx - 36} y={cy - 20} width={72} height={40} fill="#4a3525" stroke="#271b12" strokeWidth="2" rx="4" />
            <rect x={cx - 32} y={cy - 16} width={64} height={32} fill="#5c4033" rx="2" />
            {/* 6 Chairs */}
            {[-24, 0, 24].map((offset, i) => (
              <React.Fragment key={i}>
                <rect x={cx + offset - 7} y={cy - 30} width={14} height={8} fill="#8d6e63" stroke="#3e2723" strokeWidth="1" rx="2" />
                <rect x={cx + offset - 7} y={cy + 22} width={14} height={8} fill="#8d6e63" stroke="#3e2723" strokeWidth="1" rx="2" />
              </React.Fragment>
            ))}
            {/* Chandelier Glow circle */}
            <circle cx={cx} cy={cy} r="14" fill="none" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />
          </g>
        );

      case 'modular_island':
        return (
          <g opacity={layers.furniture ? 0.95 : 0}>
            {/* L-Counter Granite Platform */}
            <path
              d={`M ${room.x + 10} ${room.y + 10} L ${room.x + room.w - 10} ${room.y + 10} L ${room.x + room.w - 10} ${room.y + 36} L ${room.x + 36} ${room.y + 36} L ${room.x + 36} ${room.y + room.h - 10} L ${room.x + 10} ${room.y + room.h - 10} Z`}
              fill="#1e293b"
              stroke="#0f172a"
              strokeWidth="2"
            />
            {/* Kitchen 4-Burner Hob */}
            <rect x={room.x + 50} y={room.y + 14} width={28} height={18} fill="#020617" stroke="#94a3b8" strokeWidth="1" rx="2" />
            <circle cx={room.x + 57} cy={room.y + 19} r="3" fill="#ef4444" opacity="0.8" />
            <circle cx={room.x + 71} cy={room.y + 19} r="3" fill="#ef4444" opacity="0.8" />
            <circle cx={room.x + 57} cy={room.y + 27} r="3" fill="#ef4444" opacity="0.8" />
            <circle cx={room.x + 71} cy={room.y + 27} r="3" fill="#ef4444" opacity="0.8" />
            {/* Stainless Double Sink */}
            <rect x={room.x + 14} y={room.y + 50} width={18} height={26} fill="#94a3b8" stroke="#475569" strokeWidth="1" rx="2" />
            <circle cx={room.x + 23} cy={room.y + 63} r="3" fill="#38bdf8" />
            {/* Double Door Fridge */}
            <rect x={room.x + room.w - 32} y={room.y + room.h - 32} width={24} height={24} fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" rx="3" />
            <text x={room.x + room.w - 20} y={room.y + room.h - 17} fill="#1e293b" fontSize="7" fontWeight="bold" textAnchor="middle">FRIDGE</text>
          </g>
        );

      case 'courtyard_urli':
        return (
          <g opacity={layers.furniture ? 0.95 : 0}>
            {/* Brass Water Urli in Courtyard Center */}
            <circle cx={cx} cy={cy} r="26" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" strokeWidth="2.5" />
            <circle cx={cx} cy={cy} r="20" fill="rgba(56, 189, 248, 0.4)" stroke="#38bdf8" strokeWidth="1" />
            {/* Floating flower petals */}
            <circle cx={cx - 6} cy={cy - 4} r="3" fill="#f43f5e" />
            <circle cx={cx + 7} cy={cy - 2} r="3.5" fill="#facc15" />
            <circle cx={cx} cy={cy + 6} r="3" fill="#f43f5e" />
            {/* 4 Corner Stone Planters with Palms */}
            {[-room.w / 2 + 16, room.w / 2 - 16].map((dx, ix) =>
              [-room.h / 2 + 16, room.h / 2 - 16].map((dy, iy) => (
                <g key={`${ix}-${iy}`}>
                  <rect x={cx + dx - 8} y={cy + dy - 8} width={16} height={16} fill="#14532d" stroke="#16a34a" strokeWidth="1" rx="4" />
                  <circle cx={cx + dx} cy={cy + dy} r="6" fill="#22c55e" opacity="0.8" />
                </g>
              ))
            )}
          </g>
        );

      case 'pooja_mandir':
        return (
          <g opacity={layers.furniture ? 0.95 : 0}>
            {/* Teak Carved Mandir Gopuram Base */}
            <rect x={cx - 24} y={cy - 16} width={48} height={32} fill="#78350f" stroke="#f59e0b" strokeWidth="2" rx="3" />
            <circle cx={cx} cy={cy} r="8" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
            <text x={cx} y={cy + 3.5} fill="#78350f" fontSize="8" fontWeight="bold" textAnchor="middle">🪔</text>
            <circle cx={cx - 16} cy={cy} r="3" fill="#f59e0b" />
            <circle cx={cx + 16} cy={cy} r="3" fill="#f59e0b" />
          </g>
        );

      case 'bathroom_sanitary':
      case 'spa_bath':
        return (
          <g opacity={layers.furniture ? 0.95 : 0}>
            {/* Glass Shower Cubicle */}
            <rect x={room.x + 8} y={room.y + 8} width={34} height={34} fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 1" />
            <circle cx={room.x + 25} cy={room.y + 25} r="5" fill="#38bdf8" opacity="0.5" />
            {/* Wall Hung Commode */}
            <rect x={room.x + room.w - 22} y={room.y + 12} width={14} height={18} fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" rx="6" />
            {/* Vanity Basin */}
            <rect x={room.x + room.w - 26} y={room.y + room.h - 26} width={20} height={18} fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" rx="2" />
            <circle cx={room.x + room.w - 16} cy={room.y + room.h - 17} r="4" fill="#38bdf8" opacity="0.6" />
          </g>
        );

      case 'car_parking':
        return (
          <g opacity={layers.furniture ? 0.95 : 0}>
            {/* Top-Down Luxury SUV Silhouette */}
            <rect x={cx - 28} y={cy - 48} width={56} height={96} fill="#0f172a" stroke="#38bdf8" strokeWidth="2" rx="14" />
            {/* Windshield */}
            <rect x={cx - 22} y={cy - 24} width={44} height={18} fill="#38bdf8" opacity="0.4" rx="3" />
            {/* Panoramic Glass Roof */}
            <rect x={cx - 20} y={cy} width={40} height={26} fill="#1e293b" stroke="#38bdf8" strokeWidth="1" rx="2" />
            {/* Headlights */}
            <circle cx={cx - 18} cy={cy - 44} r="4" fill="#facc15" />
            <circle cx={cx + 18} cy={cy - 44} r="4" fill="#facc15" />
            {/* EV Charger Box on Wall */}
            <rect x={room.x + 4} y={cy - 12} width={8} height={24} fill="#10b981" stroke="#059669" strokeWidth="1" rx="2" />
            <text x={room.x + 8} y={cy + 4} fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle">⚡</text>
          </g>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', fontFamily: 'Outfit, Inter, sans-serif' }}>
      {/* TOP STUDIO CONTROL DECK */}
      <div
        style={{
          background: '#0a0f1d',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: '16px',
          padding: '12px 18px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.45)'
        }}
      >
        {/* Left: View Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '6px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              2D Engine:
            </span>
          </div>

          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '3px', borderRadius: '10px', gap: '4px' }}>
            {[
              { id: 'realistic', label: 'Photorealistic Floor Plan', icon: <Palette size={13} /> },
              { id: 'cad', label: 'Technical AutoCAD Blueprint', icon: <Square size={13} /> },
              { id: 'mep', label: 'MEP (Electrical & Plumbing)', icon: <Zap size={13} /> },
              { id: 'vastu', label: 'Vaastu Energy Mandala', icon: <Compass size={13} /> }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setRenderMode(m.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: renderMode === m.id ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'transparent',
                  color: renderMode === m.id ? '#ffffff' : '#94a3b8',
                  border: renderMode === m.id ? '1px solid #38bdf8' : 'none',
                  padding: '6px 12px',
                  borderRadius: '7px',
                  fontSize: '0.74rem',
                  fontWeight: renderMode === m.id ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: renderMode === m.id ? '0 2px 10px rgba(56, 189, 248, 0.35)' : 'none'
                }}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Floor Selector & Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Floor selector */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '3px', borderRadius: '8px', gap: '4px' }}>
            {[
              { id: 'ground', label: 'Ground Floor' },
              { id: 'first', label: 'First Floor' },
              { id: 'terrace', label: 'Terrace & Solar' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => {
                  setActiveFloor(f.id);
                  setSelectedRoomId(null);
                }}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  background: activeFloor === f.id ? '#f59e0b' : 'transparent',
                  color: activeFloor === f.id ? '#0f172a' : '#94a3b8',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: activeFloor === f.id ? 800 : 600,
                  cursor: 'pointer'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Export & Print */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={handleExportSvg}
              style={{
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                color: '#38bdf8',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Export Scalable Vector Graphic (AutoCAD / Illustrator Compatible)"
            >
              <Download size={13} />
              <span>Export CAD SVG</span>
            </button>

            <button
              onClick={() => window.print()}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#f8fafc',
                padding: '6px 10px',
                borderRadius: '8px',
                fontSize: '0.74rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Print Blueprint Sheet"
            >
              <Printer size={13} />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUB-TOOLBAR: LAYER CONTROLS & TAPE MEASURE */}
      <div
        style={{
          background: '#0e1424',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '8px 16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}
      >
        {/* Layer checkboxes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
            Layers:
          </span>
          {[
            { key: 'furniture', label: '2D Furniture' },
            { key: 'dimensions', label: 'Dimensions' },
            { key: 'columns', label: 'RCC Columns (C1..C20)' },
            { key: 'doorsWindows', label: 'Doors & Windows' },
            { key: 'shadows', label: 'Ambient Shadows' },
            { key: 'gridGuides', label: 'Grid Lines' }
          ].map(l => (
            <label
              key={l.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.72rem',
                color: layers[l.key] ? '#f8fafc' : '#64748b',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <input
                type="checkbox"
                checked={layers[l.key]}
                onChange={e => setLayers({ ...layers, [l.key]: e.target.checked })}
                style={{ accentColor: '#38bdf8', cursor: 'pointer' }}
              />
              <span>{l.label}</span>
            </label>
          ))}
        </div>

        {/* Zoom & Ruler controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Tape Measure Toggle */}
          <button
            onClick={() => {
              setIsMeasuring(!isMeasuring);
              setMeasurePoints([]);
              setMeasuredDistance(null);
            }}
            style={{
              background: isMeasuring ? '#f59e0b' : 'rgba(255,255,255,0.06)',
              color: isMeasuring ? '#0f172a' : '#f8fafc',
              border: isMeasuring ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Ruler size={13} />
            <span>{isMeasuring ? 'Measuring On' : 'Tape Measure'}</span>
          </button>

          {/* Zoom In / Out */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', padding: '2px 6px', gap: '4px' }}>
            <button
              onClick={() => setZoomLevel(z => Math.max(0.7, z - 0.1))}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
              title="Zoom Out"
            >
              <ZoomOut size={13} />
            </button>
            <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#38bdf8', minWidth: '36px', textAlign: 'center' }}>
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(z => Math.min(1.6, z + 0.1))}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
              title="Zoom In"
            >
              <ZoomIn size={13} />
            </button>
            <button
              onClick={() => { setZoomLevel(1); setCanvasOffset({ x: 0, y: 0 }); }}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px', marginLeft: '4px' }}
              title="Reset Zoom"
            >
              <RotateCcw size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* MEASURE TAPE BANNER */}
      {isMeasuring && (
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.15), rgba(56, 189, 248, 0.15))',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.76rem',
            color: '#fbbf24',
            fontWeight: 600
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Ruler size={14} />
            <span>
              {measuredDistance
                ? `Measured Span: ${measuredDistance.feet} Feet (${measuredDistance.meters} Metres)`
                : measurePoints.length === 1
                ? 'Point 1 selected. Click second point to measure distance span.'
                : 'Click any two points on the floor plan to measure clear distance.'}
            </span>
          </div>
          {measurePoints.length > 0 && (
            <button
              onClick={() => { setMeasurePoints([]); setMeasuredDistance(null); }}
              style={{
                background: '#f59e0b',
                color: '#080b11',
                border: 'none',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* RENDER VIEW ROUTING: Realistic 3D Cutaway vs Technical CAD/MEP/Vastu */}
      {renderMode === 'realistic' ? (
        <RealisticFloorPlanRenderer
          plotWidth={W}
          plotLength={L}
          bhk={bhk}
          floors={floors}
          budgetInr={budgetInr}
          style={style}
          facing={facing}
          hasPatio={hasBalcony || hasCourtyard}
          hasGarden={true}
          flooringType="oak_wood"
          lightingAngle="top_left"
          onRoomSelect={onRoomSelect}
        />
      ) : (
        /* MAIN INTERACTIVE 2D TECHNICAL CAD / MEP / VASTU CANVAS CONTAINER */
        <div
          style={{
            background: renderMode === 'cad' ? '#040711' : renderMode === 'vastu' ? '#0d1117' : '#070a14',
            borderRadius: '16px',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            overflow: 'auto',
            position: 'relative',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
            minHeight: '620px',
            maxHeight: '760px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '24px',
            cursor: isMeasuring ? 'crosshair' : 'default'
          }}
        >
        {/* Plot Info Tag Badge */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            zIndex: 10,
            background: 'rgba(10, 15, 29, 0.88)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '10px',
            padding: '10px 14px',
            fontSize: '0.74rem',
            fontFamily: 'monospace',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: 800 }}>
            <Sparkles size={13} />
            <span>REALISTIC 2D ARCHITECTURAL ENGINE</span>
          </div>
          <div style={{ color: '#cbd5e1' }}>Plot Size: {W}'0" × {L}'0" ({W * L} Sq.Ft)</div>
          <div style={{ color: '#fbbf24' }}>Floor: {activeFloor.toUpperCase()} ({rooms.reduce((acc, r) => acc + r.sqft, 0)} Sq.Ft Built-Up)</div>
          <div style={{ color: '#34d399' }}>Facing: {facing.toUpperCase()} • Vaastu Score: 98/100</div>
        </div>

        {/* SVG Architectural Vector Document */}
        <div
          style={{
            transform: `scale(${zoomLevel}) translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out'
          }}
        >
          <svg
            id="realistic-2d-canvas-svg"
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            onClick={handleSvgClick}
            style={{ select: 'none' }}
          >
            <defs>
              {/* PHOTOREALISTIC TEXTURE PATTERNS */}

              {/* 1. Italian Statuario White Marble */}
              <pattern id="marblePattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <rect width="40" height="40" fill="#f8fafc" />
                <path d="M 0 10 Q 15 25, 40 15 M 10 0 Q 25 35, 30 40 M 0 35 Q 20 20, 40 38" fill="none" stroke="#e2e8f0" strokeWidth="1.2" opacity="0.85" />
                <rect width="40" height="40" fill="none" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.6" />
              </pattern>

              {/* 2. Teak Hardwood Parquet */}
              <pattern id="woodPlankPattern" width="60" height="20" patternUnits="userSpaceOnUse">
                <rect width="60" height="20" fill="#5c4033" />
                <rect x="0" y="0" width="30" height="10" fill="#6d4c41" stroke="#3e2723" strokeWidth="0.8" />
                <rect x="30" y="0" width="30" height="10" fill="#54382c" stroke="#3e2723" strokeWidth="0.8" />
                <rect x="0" y="10" width="30" height="10" fill="#54382c" stroke="#3e2723" strokeWidth="0.8" />
                <rect x="30" y="10" width="30" height="10" fill="#6d4c41" stroke="#3e2723" strokeWidth="0.8" />
                <line x1="5" y1="5" x2="25" y2="5" stroke="#795548" strokeWidth="0.5" opacity="0.4" />
                <line x1="35" y1="15" x2="55" y2="15" stroke="#795548" strokeWidth="0.5" opacity="0.4" />
              </pattern>

              {/* 3. Oak Wood Natural */}
              <pattern id="oakWoodPattern" width="40" height="16" patternUnits="userSpaceOnUse">
                <rect width="40" height="16" fill="#b08968" />
                <line x1="0" y1="8" x2="40" y2="8" stroke="#7f5539" strokeWidth="0.8" />
                <line x1="20" y1="0" x2="20" y2="8" stroke="#7f5539" strokeWidth="0.8" />
                <line x1="0" y1="8" x2="40" y2="8" stroke="#ddb892" strokeWidth="0.4" opacity="0.5" />
              </pattern>

              {/* 4. Traditional Red Oxide Mirror Polish */}
              <pattern id="redOxidePattern" width="50" height="50" patternUnits="userSpaceOnUse">
                <rect width="50" height="50" fill="#7f1d1d" />
                <circle cx="25" cy="25" r="20" fill="none" stroke="#991b1b" strokeWidth="1" opacity="0.4" />
                <rect width="50" height="50" fill="none" stroke="#450a0a" strokeWidth="1" />
              </pattern>

              {/* 5. Terracotta Deck Tiles */}
              <pattern id="terracottaPattern" width="24" height="24" patternUnits="userSpaceOnUse">
                <rect width="24" height="24" fill="#c2410c" />
                <rect x="1" y="1" width="22" height="22" fill="#ea580c" stroke="#9a3412" strokeWidth="1" />
                <line x1="4" y1="4" x2="20" y2="20" stroke="#fb923c" strokeWidth="0.5" opacity="0.4" />
              </pattern>

              {/* 6. Black Galaxy Granite Kitchen */}
              <pattern id="granitePattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect width="20" height="20" fill="#0f172a" />
                <circle cx="5" cy="5" r="1" fill="#f8fafc" opacity="0.8" />
                <circle cx="15" cy="8" r="1.2" fill="#fbbf24" opacity="0.9" />
                <circle cx="8" cy="16" r="0.8" fill="#e2e8f0" opacity="0.6" />
                <circle cx="17" cy="15" r="1" fill="#f8fafc" opacity="0.7" />
              </pattern>

              {/* 7. Cobblestone Pavers */}
              <pattern id="cobblePattern" width="28" height="20" patternUnits="userSpaceOnUse">
                <rect width="28" height="20" fill="#334155" />
                <rect x="2" y="2" width="11" height="7" fill="#475569" stroke="#1e293b" strokeWidth="1" rx="2" />
                <rect x="15" y="2" width="11" height="7" fill="#64748b" stroke="#1e293b" strokeWidth="1" rx="2" />
                <rect x="8" y="11" width="12" height="7" fill="#475569" stroke="#1e293b" strokeWidth="1" rx="2" />
              </pattern>

              {/* 8. Courtyard Flamed Granite & Pebbles */}
              <pattern id="courtyardPattern" width="30" height="30" patternUnits="userSpaceOnUse">
                <rect width="30" height="30" fill="#1e293b" />
                <rect x="3" y="3" width="24" height="24" fill="#334155" stroke="#0f172a" strokeWidth="1.5" />
                <circle cx="15" cy="15" r="4" fill="#64748b" />
              </pattern>

              {/* 9. Ceramic Tiles */}
              <pattern id="tilePattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect width="20" height="20" fill="#f1f5f9" />
                <rect width="20" height="20" fill="none" stroke="#cbd5e1" strokeWidth="1" />
              </pattern>

              {/* 10. Solar Glass Grid */}
              <pattern id="solarPattern" width="30" height="20" patternUnits="userSpaceOnUse">
                <rect width="30" height="20" fill="#0369a1" />
                <rect width="30" height="20" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                <line x1="15" y1="0" x2="15" y2="20" stroke="#7dd3fc" strokeWidth="0.8" />
              </pattern>

              {/* CAD Vector Hatches */}
              <pattern id="cadWallHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="8" stroke="#38bdf8" strokeWidth="1.2" opacity="0.6" />
              </pattern>
              <pattern id="cadColumnHatch" width="4" height="4" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="4" stroke="#f59e0b" strokeWidth="1.5" />
              </pattern>

              {/* Shadow Filter */}
              <filter id="roomShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="3" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.55" />
              </filter>
            </defs>

            {/* PLOT BOUNDARY & ROAD FRONTAGE */}
            {/* Plot Land / Lawn Background */}
            <rect
              x={paddingX - 10}
              y={paddingY - 10}
              width={W * scale + 20}
              height={L * scale + 20}
              fill={renderMode === 'cad' ? '#040711' : '#0f172a'}
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="6 4"
              rx="6"
            />

            {/* Road Direction Header */}
            <text
              x={paddingX + (W * scale) / 2}
              y={paddingY - 24}
              fill="#38bdf8"
              fontSize="12"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              ▲ ROAD FRONTAGE • 40 FT MAIN ROAD ({facing.toUpperCase()} FACING) ▲
            </text>

            {/* Dimension Line: Plot Width */}
            <g opacity={layers.dimensions ? 1 : 0}>
              <line x1={originX} y1={paddingY - 8} x2={originX + buildW * scale} y2={paddingY - 8} stroke="#38bdf8" strokeWidth="1.5" />
              <line x1={originX} y1={paddingY - 14} x2={originX} y2={paddingY - 2} stroke="#38bdf8" strokeWidth="1.5" />
              <line x1={originX + buildW * scale} y1={paddingY - 14} x2={originX + buildW * scale} y2={paddingY - 2} stroke="#38bdf8" strokeWidth="1.5" />
              <text x={originX + (buildW * scale) / 2} y={paddingY - 12} fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                BUILDING WIDTH: {buildW}'0"
              </text>
            </g>

            {/* Dimension Line: Plot Length (Right side) */}
            <g opacity={layers.dimensions ? 1 : 0}>
              <line x1={originX + buildW * scale + 20} y1={originY} x2={originX + buildW * scale + 20} y2={originY + buildL * scale} stroke="#38bdf8" strokeWidth="1.5" />
              <text
                x={originX + buildW * scale + 34}
                y={originY + (buildL * scale) / 2}
                fill="#38bdf8"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
                transform={`rotate(90, ${originX + buildW * scale + 34}, ${originY + (buildL * scale) / 2})`}
              >
                LENGTH: {buildL}'0"
              </text>
            </g>

            {/* VASTU PURUSHA MANDALA 9-ZONE HEATMAP LAYER */}
            {renderMode === 'vastu' && (
              <g opacity="0.35">
                {[
                  { label: 'NW (Vayu)', elem: 'Air', col: '#38bdf8', x: 0, y: 0 },
                  { label: 'North (Kuber)', elem: 'Water', col: '#0284c7', x: 1, y: 0 },
                  { label: 'NE (Ishanya)', elem: 'Water/Spirit', col: '#10b981', x: 2, y: 0 },
                  { label: 'West (Varuna)', elem: 'Space', col: '#6366f1', x: 0, y: 1 },
                  { label: 'Brahmasthan', elem: 'Cosmic Core', col: '#f59e0b', x: 1, y: 1 },
                  { label: 'East (Indra)', elem: 'Sun/Fire', col: '#eab308', x: 2, y: 1 },
                  { label: 'SW (Nairuthi)', elem: 'Earth', col: '#ef4444', x: 0, y: 2 },
                  { label: 'South (Yama)', elem: 'Fire', col: '#f97316', x: 1, y: 2 },
                  { label: 'SE (Agni)', elem: 'Fire', col: '#dc2626', x: 2, y: 2 }
                ].map((z, idx) => {
                  const zw = (buildW * scale) / 3;
                  const zh = (buildL * scale) / 3;
                  const zx = originX + z.x * zw;
                  const zy = originY + z.y * zh;
                  return (
                    <g key={idx}>
                      <rect x={zx} y={zy} width={zw} height={zh} fill={z.col} stroke="#ffffff" strokeWidth="1" strokeDasharray="3 3" />
                      <text x={zx + zw / 2} y={zy + zh / 2 - 6} fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                        {z.label}
                      </text>
                      <text x={zx + zw / 2} y={zy + zh / 2 + 10} fill="#ffffff" fontSize="9" fontFamily="monospace" textAnchor="middle">
                        Element: {z.elem}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}

            {/* ROOMS VECTOR LAYER */}
            {rooms.map(room => {
              const isSelected = selectedRoomId === room.id;
              const fillPattern = renderMode === 'cad' ? (isSelected ? 'rgba(56,189,248,0.2)' : 'none') : getFloorPattern(room);

              return (
                <g
                  key={room.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isMeasuring) {
                      setSelectedRoomId(room.id);
                      if (onRoomSelect) onRoomSelect(room);
                    }
                  }}
                  className="cursor-pointer group"
                >
                  {/* Room Base Floor Fill */}
                  <rect
                    x={room.x}
                    y={room.y}
                    width={room.w}
                    height={room.h}
                    fill={fillPattern}
                    stroke={isSelected ? '#f59e0b' : renderMode === 'cad' ? '#38bdf8' : '#1e293b'}
                    strokeWidth={isSelected ? '3.5' : renderMode === 'cad' ? '1.5' : '1'}
                    filter={layers.shadows && renderMode === 'realistic' ? 'url(#roomShadow)' : undefined}
                    rx="3"
                  />

                  {/* 9" External & 4.5" Internal Wall CAD Double-lines */}
                  {renderMode === 'cad' && (
                    <rect
                      x={room.x + 4}
                      y={room.y + 4}
                      width={room.w - 8}
                      height={room.h - 8}
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="1"
                      strokeDasharray="2 1"
                    />
                  )}

                  {/* Photorealistic Top-Down Furniture Illustrations */}
                  {renderMode === 'realistic' && renderFurnitureIllustration(room)}

                  {/* MEP (Electrical & Plumbing) Overlay */}
                  {renderMode === 'mep' && (
                    <g>
                      {/* Ceiling Fan & Lighting Conduits */}
                      <circle cx={room.x + room.w / 2} cy={room.y + room.h / 2} r="8" fill="none" stroke="#f59e0b" strokeWidth="2" />
                      <text x={room.x + room.w / 2} y={room.y + room.h / 2 + 3} fill="#f59e0b" fontSize="9" fontWeight="bold" textAnchor="middle">🌀</text>
                      
                      {/* Downlights at 4 quarters */}
                      <circle cx={room.x + 18} cy={room.y + 18} r="3" fill="#fbbf24" />
                      <circle cx={room.x + room.w - 18} cy={room.y + 18} r="3" fill="#fbbf24" />
                      <circle cx={room.x + 18} cy={room.y + room.h - 18} r="3" fill="#fbbf24" />
                      <circle cx={room.x + room.w - 18} cy={room.y + room.h - 18} r="3" fill="#fbbf24" />

                      {/* AC Outdoor piping line (Blue dashed) */}
                      <line x1={room.x + 4} y1={room.y + 12} x2={room.x + 28} y2={room.y + 12} stroke="#38bdf8" strokeWidth="3" />
                      <text x={room.x + 16} y={room.y + 9} fill="#38bdf8" fontSize="6.5" fontWeight="bold">AC</text>

                      {/* Plumbing Trap if wet area */}
                      {(room.type === 'bathroom' || room.type === 'kitchen') && (
                        <g>
                          <circle cx={room.x + room.w - 12} cy={room.y + 12} r="5" fill="#3b82f6" />
                          <text x={room.x + room.w - 12} y={room.y + 15} fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle">🚰</text>
                        </g>
                      )}
                    </g>
                  )}

                  {/* Room Name Badge & Clear Dimensions */}
                  {layers.roomLabels && (
                    <g pointerEvents="none">
                      <rect
                        x={room.x + room.w / 2 - 58}
                        y={room.y + (room.h > 120 ? room.h / 2 - 18 : room.h / 2 - 12)}
                        width="116"
                        height="26"
                        fill="rgba(15, 23, 42, 0.85)"
                        stroke={isSelected ? '#f59e0b' : 'rgba(56, 189, 248, 0.4)'}
                        strokeWidth="1"
                        rx="5"
                      />
                      <text
                        x={room.x + room.w / 2}
                        y={room.y + (room.h > 120 ? room.h / 2 - 4 : room.h / 2 + 2)}
                        fill="#f8fafc"
                        fontSize="10"
                        fontFamily="Outfit, sans-serif"
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        {room.name.length > 20 ? room.name.substring(0, 18) + '...' : room.name}
                      </text>
                      {layers.dimensions && (
                        <text
                          x={room.x + room.w / 2}
                          y={room.y + (room.h > 120 ? room.h / 2 + 6 : room.h / 2 + 10)}
                          fill="#fbbf24"
                          fontSize="8.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {room.dim} ({room.sqft} sq.ft)
                        </text>
                      )}
                    </g>
                  )}

                  {/* Doors Vector Arc Swings & Windows */}
                  {layers.doorsWindows && (
                    <g pointerEvents="none">
                      {/* Door Swing */}
                      <path
                        d={`M ${room.x + 10} ${room.y + room.h} A 22 22 0 0 1 ${room.x + 32} ${room.y + room.h - 22}`}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                      <line x1={room.x + 10} y1={room.y + room.h} x2={room.x + 32} y2={room.y + room.h} stroke="#ffffff" strokeWidth="2.5" />
                      <text x={room.x + 20} y={room.y + room.h + 8} fill="#38bdf8" fontSize="7" fontWeight="bold">D1</text>

                      {/* Window Glazing Symbol */}
                      <rect x={room.x + room.w / 2 - 16} y={room.y - 2} width="32" height="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" rx="1" />
                      <text x={room.x + room.w / 2} y={room.y - 4} fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle">W1</text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* RCC STRUCTURAL COLUMNS (C1-C20) */}
            {layers.columns && columns.map(c => (
              <g key={c.id} pointerEvents="none">
                <rect
                  x={c.x}
                  y={c.y}
                  width={c.w}
                  height={c.h}
                  fill={renderMode === 'cad' ? 'url(#cadColumnHatch)' : '#dc2626'}
                  stroke="#ffffff"
                  strokeWidth="1"
                />
                <text x={c.x + 14} y={c.y + 9} fill="#ef4444" fontSize="7" fontWeight="bold" fontFamily="monospace">
                  {c.name}
                </text>
              </g>
            ))}

            {/* MEASURED DISTANCE LINE */}
            {measurePoints.length === 2 && (
              <g pointerEvents="none">
                <line
                  x1={measurePoints[0].x}
                  y1={measurePoints[0].y}
                  x2={measurePoints[1].x}
                  y2={measurePoints[1].y}
                  stroke="#f59e0b"
                  strokeWidth="3"
                  strokeDasharray="4 2"
                />
                <circle cx={measurePoints[0].x} cy={measurePoints[0].y} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx={measurePoints[1].x} cy={measurePoints[1].y} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                {measuredDistance && (
                  <g>
                    <rect
                      x={(measurePoints[0].x + measurePoints[1].x) / 2 - 40}
                      y={(measurePoints[0].y + measurePoints[1].y) / 2 - 16}
                      width="80"
                      height="20"
                      fill="#0f172a"
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                      rx="4"
                    />
                    <text
                      x={(measurePoints[0].x + measurePoints[1].x) / 2}
                      y={(measurePoints[0].y + measurePoints[1].y) / 2 - 3}
                      fill="#fbbf24"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {measuredDistance.feet} FT
                    </text>
                  </g>
                )}
              </g>
            )}

            {/* NORTH COMPASS ARROW */}
            <g transform={`translate(${originX + buildW * scale - 40}, ${originY + 45})`} pointerEvents="none">
              <circle cx="0" cy="0" r="26" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" opacity="0.9" />
              <polygon points="0,-22 -5,-8 5,-8" fill="#ef4444" />
              <polygon points="0,22 -5,8 5,8" fill="#94a3b8" />
              <text x="0" y="-8" fill="#f8fafc" fontSize="8" fontWeight="bold" textAnchor="middle">N</text>
              <text x="0" y="16" fill="#94a3b8" fontSize="7" textAnchor="middle">S</text>
              <text x="14" y="3" fill="#94a3b8" fontSize="7" textAnchor="middle">E</text>
              <text x="-14" y="3" fill="#94a3b8" fontSize="7" textAnchor="middle">W</text>
            </g>
          </svg>
        </div>
      </div>
      )}

      {/* INTERACTIVE ROOM INSPECTOR & CUSTOMIZER */}
      {selectedRoom && (
        <div
          style={{
            background: '#0d1424',
            border: '1px solid #38bdf8',
            borderLeft: '5px solid #38bdf8',
            borderRadius: '14px',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem'
                }}
              >
                📐
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                  {selectedRoom.name}
                </h4>
                <div style={{ display: 'flex', gap: '8px', marginTop: '3px' }}>
                  <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontSize: '0.74rem', padding: '2px 8px', borderRadius: '5px', fontWeight: 700 }}>
                    Dimension: {selectedRoom.dim}
                  </span>
                  <span style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontSize: '0.74rem', padding: '2px 8px', borderRadius: '5px', fontWeight: 700 }}>
                    Area: {selectedRoom.sqft} Sq.Ft ({Math.round(selectedRoom.sqft * 0.0929)} m²)
                  </span>
                  <span style={{ background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', fontSize: '0.74rem', padding: '2px 8px', borderRadius: '5px', fontWeight: 700 }}>
                    Vaastu Score: {selectedRoom.vaastuScore || 98}%
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedRoomId(null)}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#94a3b8',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                cursor: 'pointer'
              }}
            >
              Deselect Room
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Vaastu Energy Alignment</div>
              <div style={{ fontSize: '0.8rem', color: '#e2e8f0', marginTop: '2px' }}>{selectedRoom.vaastu}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Concealed MEP Conduit Spec</div>
              <div style={{ fontSize: '0.8rem', color: '#fbbf24', marginTop: '2px' }}>{selectedRoom.electrical}</div>
            </div>

            {/* Change Flooring Texture Finish Live */}
            <div>
              <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>Custom Flooring Texture</div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                {[
                  { id: 'italian_marble', label: 'Marble' },
                  { id: 'teak_hardwood', label: 'Teak Wood' },
                  { id: 'oak_wood', label: 'Oak' },
                  { id: 'red_oxide', label: 'Red Oxide' },
                  { id: 'granite_kitchen', label: 'Granite' },
                  { id: 'terracotta_deck', label: 'Terracotta' }
                ].map(fin => (
                  <button
                    key={fin.id}
                    onClick={() => setRoomFinishes({ ...roomFinishes, [selectedRoom.id]: fin.id })}
                    style={{
                      background: (roomFinishes[selectedRoom.id] || selectedRoom.defaultFinish) === fin.id ? '#38bdf8' : 'rgba(255,255,255,0.06)',
                      color: (roomFinishes[selectedRoom.id] || selectedRoom.defaultFinish) === fin.id ? '#080b11' : '#cbd5e1',
                      border: 'none',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {fin.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
