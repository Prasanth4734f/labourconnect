import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Maximize2,
  Download,
  Printer,
  Layers,
  Palette,
  Compass,
  SlidersHorizontal,
  RefreshCw,
  Sun,
  Moon,
  Eye,
  CheckCircle2,
  Trees,
  Grid,
  Ruler,
  Share2,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';

/**
 * RealisticFloorPlanRenderer
 * High-fidelity, photorealistic 2D/top-down architectural floor plan rendering engine
 * inspired by architectural 3D cutaway visualizations.
 */
export default function RealisticFloorPlanRenderer({
  prompt = '',
  plotWidth = 40,
  plotLength = 60,
  bhk = 3,
  floors = 1,
  budgetInr = 4500000,
  style = 'modern_luxury',
  facing = 'East',
  hasPatio = true,
  hasGarden = true,
  flooringType = 'oak_wood', // 'oak_wood' | 'walnut' | 'marble' | 'scandinavian' | 'terracotta' | 'red_oxide'
  lightingAngle = 'top_left', // 'top_left' | 'top_right' | 'golden_hour' | 'overcast'
  onRoomSelect
}) {
  const isUltraLowCost = Number(budgetInr) <= 300000 || prompt?.toLowerCase()?.includes('100000') || prompt?.toLowerCase()?.includes('1 lakh') || prompt?.toLowerCase()?.includes('tiny') || prompt?.toLowerCase()?.includes('micro');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeLighting, setActiveLighting] = useState(lightingAngle);
  const [activeFlooring, setActiveFlooring] = useState(isUltraLowCost ? 'red_oxide' : flooringType);
  const [showGarden, setShowGarden] = useState(hasGarden);
  const [showRoomLabels, setShowRoomLabels] = useState(true);
  const [showFurniture, setShowFurniture] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewAngle, setViewAngle] = useState('ortho'); // 'ortho' | 'soft_3d'

  // Canvas coordinate systems
  const scale = 14; // 1 ft = 14 SVG units for maximum clarity
  const W = Number(plotWidth) || (isUltraLowCost ? 20 : 40);
  const L = Number(plotLength) || (isUltraLowCost ? 25 : 50);

  // Margin for surrounding garden & outdoor foliage (like reference image 1)
  const gardenPadding = showGarden ? 80 : 40;
  const houseW = W * scale;
  const houseH = L * scale;

  const svgWidth = houseW + gardenPadding * 2;
  const svgHeight = houseH + gardenPadding * 2;

  const originX = gardenPadding;
  const originY = gardenPadding;

  // Synthesize realistic room layout based on BHK, plot aspect ratio, budget, and prompt
  const floorPlanData = useMemo(() => {
    // 1. ULTRA LOW-COST MICRO-HOME / 1RK (₹1,00,000 - ₹3,00,000 / PMAY Gramin & Tiny House)
    if (isUltraLowCost || bhk === 1 && Number(budgetInr) <= 300000) {
      const livingW = Math.floor(houseW * 0.62);
      const livingH = Math.floor(houseH * 0.68);
      const kitchenW = houseW - livingW - 12;
      const kitchenH = Math.floor(houseH * 0.40);
      const bathW = kitchenW;
      const bathH = livingH - kitchenH - 12;
      const verandahW = houseW;
      const verandahH = houseH - livingH - 12;

      return {
        rooms: [
          // 1. Multi-Purpose Living & Sleeping Hall
          {
            id: 'micro_living_hall',
            name: 'Multi-Purpose Living & Sleeping Hall',
            type: 'master_bedroom',
            x: originX,
            y: originY,
            w: livingW,
            h: livingH,
            dim: '13\'0" × 15\'0"',
            sqft: 195,
            furniture: 'micro_platform_bed',
            floor: 'red_oxide',
            budgetSpec: 'CSEB Interlocking Blocks (₹38,000) + Red Oxide Floor (₹8,500)'
          },
          // 2. Kadappa Stone Kitchenette & Pantry
          {
            id: 'micro_kitchen',
            name: 'Compact Kitchenette & Utility',
            type: 'kitchen',
            x: originX + livingW + 12,
            y: originY,
            w: kitchenW,
            h: kitchenH,
            dim: '7\'0" × 8\'0"',
            sqft: 56,
            furniture: 'kadappa_kitchenette',
            floor: 'red_oxide',
            budgetSpec: 'Kadappa Stone Counter + Steel Sink + Chimney Vent (₹6,500)'
          },
          // 3. Compact Sanitary Toilet & Bath Unit
          {
            id: 'micro_bath',
            name: 'Sanitary Bath & Toilet Unit',
            type: 'bathroom',
            x: originX + livingW + 12,
            y: originY + kitchenH + 12,
            w: bathW,
            h: bathH,
            dim: '7\'0" × 6\'0"',
            sqft: 42,
            furniture: 'compact_toilet_unit',
            floor: 'cement_ips',
            budgetSpec: 'PVC Door + Indian/EWC Commode + Soak Pit Stack (₹12,000)'
          },
          // 4. Front Shaded Verandah / Thinnai Sit-out
          {
            id: 'micro_verandah',
            name: 'Front Shaded Verandah / Sit-out',
            type: 'outdoor_patio',
            x: originX,
            y: originY + livingH + 12,
            w: verandahW,
            h: verandahH,
            dim: '20\'0" × 6\'0"',
            sqft: 120,
            furniture: 'verandah_sitout',
            floor: 'terrace_stone',
            budgetSpec: 'GI Truss Canopy / Mangalore Tiles (₹22,000)'
          }
        ],
        budgetBreakdown: [
          { item: 'Civil Foundation & CSEB Earth Block Masonry', cost: 42000, pct: '42%' },
          { item: 'Pre-Painted GI Sheet / Tile Roof with Steel Truss', cost: 28000, pct: '28%' },
          { item: 'Polished Mirror Red Oxide Flooring & Solid Flush Doors', cost: 16000, pct: '16%' },
          { item: 'Plumbing, Septic Soak Pit & Sanitary Fixtures', cost: 14000, pct: '14%' }
        ]
      };
    }

    // 2. 3BHK Luxury Layout (Matching Reference Image 1 & 3)
    if (bhk >= 3) {
      const bed1W = Math.floor(houseW * 0.32);
      const bed1H = Math.floor(houseH * 0.44);

      const bed2W = Math.floor(houseW * 0.22);
      const bed2H = Math.floor(houseH * 0.36);

      const bed3W = Math.floor(houseW * 0.22);
      const bed3H = Math.floor(houseH * 0.36);

      const masterBathW = Math.floor(houseW * 0.22);
      const masterBathH = Math.floor(houseH * 0.28);

      const livingW = Math.floor(houseW * 0.44);
      const livingH = Math.floor(houseH * 0.38);

      const diningW = Math.floor(houseW * 0.26);
      const diningH = Math.floor(houseH * 0.34);

      const kitchenW = Math.floor(houseW * 0.28);
      const kitchenH = Math.floor(houseH * 0.36);

      const patioW = Math.floor(houseW * 0.32);
      const patioH = Math.floor(houseH * 0.26);

      const outdoorDiningW = Math.floor(houseW * 0.34);
      const outdoorDiningH = Math.floor(houseH * 0.26);

      return {
        rooms: [
          // 1. Master Suite (Left center)
          {
            id: 'master_suite',
            name: 'Master Bedroom Suite',
            type: 'master_bedroom',
            x: originX,
            y: originY + bed2H + 16,
            w: bed1W,
            h: bed1H,
            dim: '16\'0" × 18\'0"',
            sqft: 288,
            furniture: 'king_bed_deluxe',
            floor: activeFlooring
          },
          // 2. Master Walk-in Bath (En-suite)
          {
            id: 'master_bath',
            name: 'Master En-Suite Spa Bath',
            type: 'bathroom',
            x: originX + bed1W + 12,
            y: originY + bed2H + 16,
            w: masterBathW,
            h: masterBathH,
            dim: '11\'0" × 12\'0"',
            sqft: 132,
            furniture: 'spa_bath_calacatta',
            floor: 'calacatta_marble'
          },
          // 3. Bedroom 2 (Top Left with study)
          {
            id: 'bedroom_2',
            name: 'Guest / Study Bedroom 2',
            type: 'bedroom',
            x: originX,
            y: originY,
            w: bed2W,
            h: bed2H,
            dim: '12\'0" × 14\'0"',
            sqft: 168,
            furniture: 'single_bed_study',
            floor: activeFlooring
          },
          // 4. Bedroom 3 (Top Middle with study)
          {
            id: 'bedroom_3',
            name: 'Kids Bedroom 3',
            type: 'bedroom',
            x: originX + bed2W + 12,
            y: originY,
            w: bed3W,
            h: bed3H,
            dim: '12\'0" × 14\'0"',
            sqft: 168,
            furniture: 'single_bed_study_2',
            floor: activeFlooring
          },
          // 5. Grand Living Lounge (Center & Bottom Center)
          {
            id: 'living_lounge',
            name: 'Grand Living & Conversation Lounge',
            type: 'living',
            x: originX + bed1W + 12,
            y: originY + bed2H + masterBathH + 28,
            w: livingW,
            h: livingH,
            dim: '22\'0" × 16\'0"',
            sqft: 352,
            furniture: 'sectional_luxury_couch',
            floor: activeFlooring
          },
          // 6. Central Hallway & Foyer
          {
            id: 'central_hallway',
            name: 'Central Gallery & Circulation',
            type: 'hallway',
            x: originX + bed2W + bed3W + 24,
            y: originY,
            w: Math.floor(houseW * 0.16),
            h: bed2H,
            dim: '8\'0" × 14\'0"',
            sqft: 112,
            furniture: 'hallway_planters',
            floor: activeFlooring
          },
          // 7. Kitchen & Pantry (Top Right)
          {
            id: 'kitchen_hub',
            name: 'Chef Kitchen & Breakfast Bar',
            type: 'kitchen',
            x: originX + houseW - kitchenW,
            y: originY,
            w: kitchenW,
            h: kitchenH,
            dim: '14\'0" × 16\'0"',
            sqft: 224,
            furniture: 'island_kitchen_deluxe',
            floor: activeFlooring
          },
          // 8. Family Dining Room (Right Center)
          {
            id: 'dining_room',
            name: 'Formal 8-Seater Dining',
            type: 'dining',
            x: originX + houseW - diningW,
            y: originY + kitchenH + 16,
            w: diningW,
            h: diningH,
            dim: '13\'0" × 15\'0"',
            sqft: 195,
            furniture: 'dining_table_8',
            floor: activeFlooring
          },
          // 9. Common Bathroom (Upper Right)
          {
            id: 'common_bath',
            name: 'Guest Bathroom & Vanity',
            type: 'bathroom',
            x: originX + houseW - kitchenW - masterBathW + 20,
            y: originY + bed2H - 20,
            w: masterBathW - 10,
            h: masterBathH - 10,
            dim: '10\'0" × 10\'0"',
            sqft: 100,
            furniture: 'guest_bath_shower',
            floor: 'calacatta_marble'
          },
          // 10. Outdoor Covered Patio & Lounge (Bottom Left)
          {
            id: 'outdoor_patio',
            name: 'Covered Garden Patio Lounge',
            type: 'outdoor_patio',
            x: originX,
            y: originY + houseH - patioH,
            w: patioW,
            h: patioH,
            dim: '16\'0" × 12\'0"',
            sqft: 192,
            furniture: 'patio_sofa_set',
            floor: 'terrace_stone'
          },
          // 11. Outdoor Alfresco Dining Deck (Bottom Right)
          {
            id: 'outdoor_dining',
            name: 'Alfresco Garden Dining Deck',
            type: 'outdoor_patio',
            x: originX + houseW - outdoorDiningW,
            y: originY + houseH - outdoorDiningH,
            w: outdoorDiningW,
            h: outdoorDiningH,
            dim: '17\'0" × 12\'0"',
            sqft: 204,
            furniture: 'alfresco_dining_table',
            floor: 'terrace_stone'
          }
        ]
      };
    }

    // 2BHK Layout
    const wHalf = Math.floor(houseW * 0.48);
    const hHalf = Math.floor(houseH * 0.46);
    return {
      rooms: [
        {
          id: 'master_bed_2bhk',
          name: 'Master Bedroom',
          type: 'master_bedroom',
          x: originX,
          y: originY,
          w: wHalf,
          h: hHalf,
          dim: '15\'0" × 16\'0"',
          sqft: 240,
          furniture: 'king_bed_deluxe',
          floor: activeFlooring
        },
        {
          id: 'bedroom_2_2bhk',
          name: 'Second Bedroom',
          type: 'bedroom',
          x: originX + wHalf + 16,
          y: originY,
          w: wHalf,
          h: hHalf,
          dim: '15\'0" × 16\'0"',
          sqft: 240,
          furniture: 'queen_bed_deluxe',
          floor: activeFlooring
        },
        {
          id: 'living_2bhk',
          name: 'Open Living & Dining Lounge',
          type: 'living',
          x: originX,
          y: originY + hHalf + 16,
          w: Math.floor(houseW * 0.62),
          h: houseH - hHalf - 16,
          dim: '20\'0" × 16\'0"',
          sqft: 320,
          furniture: 'sectional_luxury_couch',
          floor: activeFlooring
        },
        {
          id: 'kitchen_2bhk',
          name: 'Open Modular Kitchen',
          type: 'kitchen',
          x: originX + Math.floor(houseW * 0.62) + 16,
          y: originY + hHalf + 16,
          w: houseW - Math.floor(houseW * 0.62) - 16,
          h: houseH - hHalf - 16,
          dim: '12\'0" × 16\'0"',
          sqft: 192,
          furniture: 'island_kitchen_deluxe',
          floor: activeFlooring
        }
      ]
    };
  }, [bhk, houseW, houseH, originX, originY, activeFlooring]);

  // Export High-Res Vector SVG
  const handleExport = () => {
    confetti({ particleCount: 40, spread: 70 });
    const svgEl = document.getElementById('realistic-floorplan-svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const link = document.createElement('a');
    link.href = svgUrl;
    link.download = `BuildMate_Realistic_FloorPlan_${plotWidth}x${plotLength}ft_${bhk}BHK.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render Realistic 3D-styled Furniture Component
  const renderFurnitureItem = (room) => {
    if (!showFurniture) return null;
    const cx = room.x + room.w / 2;
    const cy = room.y + room.h / 2;

    switch (room.furniture) {
      case 'micro_platform_bed':
        return (
          <g>
            {/* Built-in Raised Platform Bed / Wooden Charpai */}
            <rect
              x={room.x + 18}
              y={room.y + 18}
              width={75}
              height={98}
              fill="#5c4033"
              stroke="#3e2723"
              strokeWidth="2"
              rx="3"
              filter="url(#furnitureShadow)"
            />
            {/* Cotton Handloom Quilt & Bolster */}
            <rect
              x={room.x + 22}
              y={room.y + 36}
              width={67}
              height={76}
              fill="#d97706"
              opacity="0.85"
              rx="2"
            />
            <rect
              x={room.x + 24}
              y={room.y + 22}
              width={63}
              height={14}
              fill="#fef3c7"
              stroke="#d97706"
              strokeWidth="1"
              rx="4"
            />
            {/* Built-in Brick Alcove Wall Shelves */}
            <rect
              x={room.x + room.w - 30}
              y={room.y + 18}
              width={16}
              height={60}
              fill="#78350f"
              stroke="#451a03"
              strokeWidth="1.5"
              rx="2"
            />
            {/* Space-saving Foldable Low Dining Table & Mats */}
            <rect
              x={room.x + 22}
              y={room.y + room.h - 48}
              width={52}
              height={26}
              fill="#78350f"
              stroke="#451a03"
              strokeWidth="1.5"
              rx="3"
            />
            <circle cx={room.x + 48} cy={room.y + room.h - 35} r="4" fill="#facc15" />
          </g>
        );

      case 'kadappa_kitchenette':
        return (
          <g>
            {/* Kadappa Black Stone Platform */}
            <rect
              x={room.x + 10}
              y={room.y + 10}
              width={room.w - 20}
              height={26}
              fill="#1e293b"
              stroke="#0f172a"
              strokeWidth="2"
              filter="url(#furnitureShadow)"
            />
            {/* 2-Burner Compact Gas Stove */}
            <rect
              x={room.x + 18}
              y={room.y + 14}
              width={26}
              height={16}
              fill="#09090b"
              stroke="#71717a"
              strokeWidth="1"
              rx="2"
            />
            <circle cx={room.x + 24} cy={room.y + 22} r="3" fill="#ef4444" />
            <circle cx={room.x + 38} cy={room.y + 22} r="3" fill="#ef4444" />
            {/* Stainless Steel / Clay Sink */}
            <rect
              x={room.x + room.w - 32}
              y={room.y + 13}
              width={16}
              height={18}
              fill="#cbd5e1"
              stroke="#64748b"
              strokeWidth="1"
              rx="2"
            />
            {/* Traditional Clay Water Matka on stand */}
            <circle
              cx={room.x + 24}
              cy={room.y + room.h - 22}
              r="8"
              fill="#b45309"
              stroke="#78350f"
              strokeWidth="1.5"
              filter="url(#furnitureShadow)"
            />
            <circle cx={room.x + 24} cy={room.y + room.h - 22} r="3" fill="#fef3c7" opacity="0.6" />
          </g>
        );

      case 'compact_toilet_unit':
        return (
          <g>
            {/* Water-sealed Indian/European Commode */}
            <rect
              x={cx - 10}
              y={cy - 14}
              width={20}
              height={28}
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth="1.5"
              rx="8"
              filter="url(#furnitureShadow)"
            />
            <circle cx={cx} cy={cy + 4} r="3.5" fill="#38bdf8" />
            {/* Water Tap & Bucket */}
            <circle cx={room.x + 16} cy={room.y + 16} r="5" fill="#0284c7" />
          </g>
        );

      case 'verandah_sitout':
        return (
          <g>
            {/* Traditional Red Oxide Raised Ledge */}
            <rect
              x={room.x + 12}
              y={cy - 12}
              width={room.w - 24}
              height={24}
              fill="#991b1b"
              stroke="#7f1d1d"
              strokeWidth="1.5"
              rx="3"
            />
            {/* Wooden Rafter Posts */}
            <rect x={room.x + 18} y={cy - 10} width={8} height={8} fill="#78350f" rx="1" />
            <rect x={room.x + room.w - 26} y={cy - 10} width={8} height={8} fill="#78350f" rx="1" />
          </g>
        );

      case 'king_bed_deluxe':
        return (
          <g>
            {/* Soft Carpet Rug beneath Bed */}
            <rect
              x={room.x + 20}
              y={cy - 55}
              width={room.w - 40}
              height={110}
              fill="#e7e5e4"
              stroke="#d6d3d1"
              strokeWidth="1"
              rx="6"
              filter="url(#subtleShadow)"
            />

            {/* Solid Wood Headboard with Shadow */}
            <rect
              x={room.x + 28}
              y={cy - 48}
              width={20}
              height={96}
              fill="#451a03"
              stroke="#290d02"
              strokeWidth="1.5"
              rx="3"
            />

            {/* King Mattress with White Sheet */}
            <rect
              x={room.x + 48}
              y={cy - 44}
              width={90}
              height={88}
              fill="#fafaf9"
              stroke="#e7e5e4"
              strokeWidth="2"
              rx="4"
              filter="url(#furnitureShadow)"
            />

            {/* Folded Grey / Earth Duvet Cover with Realistic Shadow */}
            <rect
              x={room.x + 75}
              y={cy - 42}
              width={60}
              height={84}
              fill="#78716c"
              stroke="#57534e"
              strokeWidth="1.5"
              rx="3"
            />
            <rect
              x={room.x + 105}
              y={cy - 40}
              width={28}
              height={80}
              fill="#44403c"
              opacity="0.4"
              rx="2"
            />

            {/* Fluffy Pillows with Headboard Shadow */}
            <rect
              x={room.x + 52}
              y={cy - 38}
              width={18}
              height={32}
              fill="#ffffff"
              stroke="#d6d3d1"
              strokeWidth="1.2"
              rx="4"
            />
            <rect
              x={room.x + 52}
              y={cy + 6}
              width={18}
              height={32}
              fill="#ffffff"
              stroke="#d6d3d1"
              strokeWidth="1.2"
              rx="4"
            />

            {/* Twin Bedside Nightstands & Lamps */}
            <rect
              x={room.x + 28}
              y={cy - 74}
              width={18}
              height={20}
              fill="#78350f"
              stroke="#451a03"
              strokeWidth="1"
              rx="3"
            />
            <circle cx={room.x + 37} cy={cy - 64} r="5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
            <circle cx={room.x + 37} cy={cy - 64} r="12" fill="url(#warmLampGlow)" opacity="0.75" />

            <rect
              x={room.x + 28}
              y={cy + 54}
              width={18}
              height={20}
              fill="#78350f"
              stroke="#451a03"
              strokeWidth="1"
              rx="3"
            />
            <circle cx={room.x + 37} cy={cy + 64} r="5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
            <circle cx={room.x + 37} cy={cy + 64} r="12" fill="url(#warmLampGlow)" opacity="0.75" />
          </g>
        );

      case 'single_bed_study':
      case 'single_bed_study_2':
        return (
          <g>
            {/* Single Bed against Wall */}
            <rect
              x={room.x + 16}
              y={room.y + 16}
              width={70}
              height={95}
              fill="#fafaf9"
              stroke="#d6d3d1"
              strokeWidth="1.5"
              rx="4"
              filter="url(#furnitureShadow)"
            />
            {/* Duvet & Pillows */}
            <rect
              x={room.x + 18}
              y={room.y + 45}
              width={66}
              height={64}
              fill="#a8a29e"
              stroke="#78716c"
              strokeWidth="1"
              rx="2"
            />
            <rect
              x={room.x + 22}
              y={room.y + 20}
              width={34}
              height={20}
              fill="#ffffff"
              stroke="#d6d3d1"
              strokeWidth="1"
              rx="3"
            />

            {/* Study Desk & Laptop */}
            <rect
              x={room.x + room.w - 38}
              y={room.y + 16}
              width={26}
              height={50}
              fill="#57534e"
              stroke="#292524"
              strokeWidth="1.5"
              rx="2"
            />
            {/* Laptop screen & keyboard */}
            <rect
              x={room.x + room.w - 32}
              y={room.y + 28}
              width={14}
              height={10}
              fill="#38bdf8"
              opacity="0.9"
              rx="1"
            />
            {/* Ergonomic Office Chair */}
            <circle
              cx={room.x + room.w - 48}
              cy={room.y + 36}
              r="10"
              fill="#1e293b"
              stroke="#0f172a"
              strokeWidth="1.5"
              filter="url(#furnitureShadow)"
            />
            {/* Built-in Clothes Wardrobe */}
            <rect
              x={room.x + 16}
              y={room.y + room.h - 32}
              width={room.w - 32}
              height={20}
              fill="#44403c"
              stroke="#1c1917"
              strokeWidth="1.5"
              rx="2"
            />
            <line
              x1={room.x + room.w / 2}
              y1={room.y + room.h - 32}
              x2={room.x + room.w / 2}
              y2={room.y + room.h - 12}
              stroke="#78716c"
              strokeWidth="1"
            />
          </g>
        );

      case 'sectional_luxury_couch':
        return (
          <g>
            {/* Plush Area Rug */}
            <rect
              x={cx - 70}
              y={cy - 48}
              width={140}
              height={96}
              fill="#f5f5f4"
              stroke="#e7e5e4"
              strokeWidth="1"
              rx="8"
              filter="url(#subtleShadow)"
            />

            {/* L-Shaped Sectional Sofa with Cushions */}
            <path
              d={`M ${cx - 58} ${cy - 38} L ${cx + 58} ${cy - 38} L ${cx + 58} ${cy - 8} L ${cx - 20} ${cy - 8} L ${cx - 20} ${cy + 38} L ${cx - 58} ${cy + 38} Z`}
              fill="#78716c"
              stroke="#44403c"
              strokeWidth="2.5"
              filter="url(#furnitureShadow)"
            />

            {/* Sectional Cushions Details */}
            {[-44, -14, 16, 44].map((offset, i) => (
              <rect
                key={i}
                x={cx + offset - 12}
                y={cy - 34}
                width={24}
                height={22}
                fill="#a8a29e"
                stroke="#57534e"
                strokeWidth="1"
                rx="3"
              />
            ))}

            {/* Armchairs */}
            <rect
              x={cx + 34}
              y={cy + 8}
              width={26}
              height={26}
              fill="#d6d3d1"
              stroke="#a8a29e"
              strokeWidth="1.5"
              rx="5"
              filter="url(#furnitureShadow)"
            />

            {/* Modern Walnut Coffee Table */}
            <rect
              x={cx - 10}
              y={cy - 2}
              width={34}
              height={22}
              fill="#451a03"
              stroke="#290d02"
              strokeWidth="1.5"
              rx="3"
              filter="url(#furnitureShadow)"
            />
            {/* Decorative book/plant on coffee table */}
            <circle cx={cx + 7} cy={cy + 9} r="3" fill="#16a34a" />
          </g>
        );

      case 'dining_table_8':
        return (
          <g>
            {/* Dining Table Floor Mat */}
            <rect
              x={cx - 45}
              y={cy - 32}
              width={90}
              height={64}
              fill="#f5f5f4"
              stroke="#e7e5e4"
              strokeWidth="1"
              rx="6"
              filter="url(#subtleShadow)"
            />

            {/* Solid Walnut 8-Seater Dining Table */}
            <rect
              x={cx - 36}
              y={cy - 22}
              width={72}
              height={44}
              fill="#451a03"
              stroke="#290d02"
              strokeWidth="2"
              rx="4"
              filter="url(#furnitureShadow)"
            />

            {/* Table Floral Centerpiece */}
            <circle cx={cx} cy={cy} r="6" fill="#16a34a" stroke="#ffffff" strokeWidth="1" />
            <circle cx={cx} cy={cy} r="2.5" fill="#f43f5e" />

            {/* 8 Upholstered Dining Chairs */}
            {[-24, 0, 24].map((offset, i) => (
              <React.Fragment key={i}>
                {/* Top Chairs */}
                <rect
                  x={cx + offset - 8}
                  y={cy - 32}
                  width={16}
                  height={10}
                  fill="#d6d3d1"
                  stroke="#78716c"
                  strokeWidth="1.2"
                  rx="3"
                  filter="url(#furnitureShadow)"
                />
                {/* Bottom Chairs */}
                <rect
                  x={cx + offset - 8}
                  y={cy + 22}
                  width={16}
                  height={10}
                  fill="#d6d3d1"
                  stroke="#78716c"
                  strokeWidth="1.2"
                  rx="3"
                  filter="url(#furnitureShadow)"
                />
              </React.Fragment>
            ))}
            {/* Side Head Chairs */}
            <rect
              x={cx - 44}
              y={cy - 8}
              width={10}
              height={16}
              fill="#d6d3d1"
              stroke="#78716c"
              strokeWidth="1.2"
              rx="3"
              filter="url(#furnitureShadow)"
            />
            <rect
              x={cx + 34}
              y={cy - 8}
              width={10}
              height={16}
              fill="#d6d3d1"
              stroke="#78716c"
              strokeWidth="1.2"
              rx="3"
              filter="url(#furnitureShadow)"
            />
          </g>
        );

      case 'island_kitchen_deluxe':
        return (
          <g>
            {/* L-Shaped Kitchen Quartz Countertop */}
            <path
              d={`M ${room.x + 14} ${room.y + 14} L ${room.x + room.w - 14} ${room.y + 14} L ${room.x + room.w - 14} ${room.y + room.h - 14} L ${room.x + room.w - 44} ${room.y + room.h - 14} L ${room.x + room.w - 44} ${room.y + 44} L ${room.x + 14} ${room.y + 44} Z`}
              fill="#292524"
              stroke="#1c1917"
              strokeWidth="2"
              filter="url(#furnitureShadow)"
            />

            {/* Kitchen Cooktop with 4 Burners */}
            <rect
              x={room.x + 40}
              y={room.y + 18}
              width={34}
              height={22}
              fill="#09090b"
              stroke="#71717a"
              strokeWidth="1.5"
              rx="2"
            />
            <circle cx={room.x + 48} cy={room.y + 24} r="3.5" fill="#ef4444" />
            <circle cx={room.x + 66} cy={room.y + 24} r="3.5" fill="#ef4444" />
            <circle cx={room.x + 48} cy={room.y + 34} r="3.5" fill="#ef4444" />
            <circle cx={room.x + 66} cy={room.y + 34} r="3.5" fill="#ef4444" />

            {/* Stainless Steel Undermount Double Sink */}
            <rect
              x={room.x + room.w - 38}
              y={room.y + 60}
              width={20}
              height={32}
              fill="#e2e8f0"
              stroke="#64748b"
              strokeWidth="1.5"
              rx="2"
            />
            <circle cx={room.x + room.w - 28} cy={room.y + 76} r="3.5" fill="#38bdf8" />

            {/* Stainless French Door Refrigerator */}
            <rect
              x={room.x + room.w - 42}
              y={room.y + room.h - 40}
              width={28}
              height={26}
              fill="#cbd5e1"
              stroke="#475569"
              strokeWidth="2"
              rx="3"
            />
            <line
              x1={room.x + room.w - 28}
              y1={room.y + room.h - 40}
              x2={room.x + room.w - 28}
              y2={room.y + room.h - 14}
              stroke="#94a3b8"
              strokeWidth="1.5"
            />
          </g>
        );

      case 'spa_bath_calacatta':
      case 'guest_bath_shower':
        return (
          <g>
            {/* Corner Glass Shower Enclosure with Aquamarine Tint (like Reference Image 1) */}
            <path
              d={`M ${room.x + room.w - 14} ${room.y + room.h - 60} L ${room.x + room.w - 14} ${room.y + room.h - 14} L ${room.x + room.w - 60} ${room.y + room.h - 14} L ${room.x + room.w - 60} ${room.y + room.h - 38} L ${room.x + room.w - 38} ${room.y + room.h - 60} Z`}
              fill="rgba(45, 212, 191, 0.35)"
              stroke="#0d9488"
              strokeWidth="2"
              filter="url(#subtleShadow)"
            />
            <circle cx={room.x + room.w - 36} cy={room.y + room.h - 36} r="4" fill="#0d9488" />

            {/* Modern Wall-hung Ceramic Commode */}
            <rect
              x={room.x + 18}
              y={room.y + room.h - 38}
              width={16}
              height={22}
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth="1.5"
              rx="8"
              filter="url(#furnitureShadow)"
            />

            {/* Calacatta Vanity with LED Backlit Mirror */}
            <rect
              x={room.x + 14}
              y={room.y + 14}
              width={38}
              height={22}
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth="1.5"
              rx="2"
              filter="url(#furnitureShadow)"
            />
            <ellipse cx={room.x + 33} cy={room.y + 25} rx="8" ry="6" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
            <circle cx={room.x + 33} cy={room.y + 25} r="2.5" fill="#38bdf8" />
          </g>
        );

      case 'patio_sofa_set':
        return (
          <g>
            {/* L-Shaped Wicker Patio Sofa with Cream Cushions */}
            <path
              d={`M ${room.x + 18} ${room.y + 18} L ${room.x + room.w - 24} ${room.y + 18} L ${room.x + room.w - 24} ${room.y + 44} L ${room.x + 44} ${room.y + 44} L ${room.x + 44} ${room.y + room.h - 24} L ${room.x + 18} ${room.y + room.h - 24} Z`}
              fill="#e7e5e4"
              stroke="#a8a29e"
              strokeWidth="2"
              filter="url(#furnitureShadow)"
            />
            {/* Patio Teak Coffee Table */}
            <rect
              x={room.x + 48}
              y={room.y + 48}
              width={34}
              height={22}
              fill="#78350f"
              stroke="#451a03"
              strokeWidth="1.5"
              rx="3"
            />
            {/* Potted Patio Palms */}
            <circle cx={room.x + room.w - 18} cy={room.y + room.h - 18} r="8" fill="#15803d" />
            <circle cx={room.x + room.w - 18} cy={room.y + room.h - 18} r="3" fill="#86efac" />
          </g>
        );

      case 'alfresco_dining_table':
        return (
          <g>
            {/* Alfresco Dining Solid Wood Table */}
            <rect
              x={cx - 38}
              y={cy - 20}
              width={76}
              height={40}
              fill="#5c4033"
              stroke="#3e2723"
              strokeWidth="2"
              rx="4"
              filter="url(#furnitureShadow)"
            />
            {/* Surrounding Patio Chairs */}
            {[-24, 0, 24].map((offset, i) => (
              <React.Fragment key={i}>
                <rect
                  x={cx + offset - 8}
                  y={cy - 30}
                  width={16}
                  height={8}
                  fill="#d7ccc8"
                  stroke="#8d6e63"
                  strokeWidth="1"
                  rx="2"
                />
                <rect
                  x={cx + offset - 8}
                  y={cy + 22}
                  width={16}
                  height={8}
                  fill="#d7ccc8"
                  stroke="#8d6e63"
                  strokeWidth="1"
                  rx="2"
                />
              </React.Fragment>
            ))}
          </g>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', fontFamily: 'Outfit, Inter, sans-serif' }}>
      {/* TOOLBAR CONTROLS */}
      <div
        style={{
          background: '#0a0f1d',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '16px',
          padding: '12px 18px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}
      >
        {/* Left: Materials & Lighting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
              Flooring Finish:
            </span>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', padding: '2px', borderRadius: '8px', gap: '3px' }}>
              {[
                { id: 'oak_wood', label: 'Warm Oak' },
                { id: 'walnut', label: 'Dark Walnut' },
                { id: 'marble', label: 'Calacatta Marble' },
                { id: 'scandinavian', label: 'Birch Light' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveFlooring(f.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: activeFlooring === f.id ? '#38bdf8' : 'transparent',
                    color: activeFlooring === f.id ? '#080b11' : '#94a3b8',
                    border: 'none',
                    fontSize: '0.72rem',
                    fontWeight: activeFlooring === f.id ? 800 : 600,
                    cursor: 'pointer'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sunlight Angle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase' }}>
              Sunlight:
            </span>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', padding: '2px', borderRadius: '8px', gap: '3px' }}>
              {[
                { id: 'top_left', label: '10 AM Morning' },
                { id: 'top_right', label: '2 PM Afternoon' },
                { id: 'golden_hour', label: '5 PM Golden' }
              ].map(l => (
                <button
                  key={l.id}
                  onClick={() => setActiveLighting(l.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: activeLighting === l.id ? '#f59e0b' : 'transparent',
                    color: activeLighting === l.id ? '#080b11' : '#94a3b8',
                    border: 'none',
                    fontSize: '0.72rem',
                    fontWeight: activeLighting === l.id ? 800 : 600,
                    cursor: 'pointer'
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Garden Toggle & Vector Export */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', color: '#f8fafc', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showGarden}
              onChange={e => setShowGarden(e.target.checked)}
              style={{ accentColor: '#22c55e', cursor: 'pointer' }}
            />
            <span>Perimeter Garden & Trees</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', color: '#f8fafc', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showFurniture}
              onChange={e => setShowFurniture(e.target.checked)}
              style={{ accentColor: '#38bdf8', cursor: 'pointer' }}
            />
            <span>3D Furniture</span>
          </label>

          <button
            onClick={handleExport}
            style={{
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              border: '1px solid #38bdf8',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(56, 189, 248, 0.35)'
            }}
          >
            <Download size={13} />
            <span>Export SVG Plan</span>
          </button>
        </div>
      </div>

      {/* SVG CANVAS CONTAINER (Ultra-Realistic 3D Top-Down Cutaway) */}
      <div
        style={{
          background: '#070a14',
          borderRadius: '16px',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          overflow: 'auto',
          position: 'relative',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
          minHeight: '620px',
          maxHeight: '780px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '24px'
        }}
      >
        <div style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease-out' }}>
          <svg
            id="realistic-floorplan-svg"
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{ select: 'none', filter: 'drop-shadow(0 15px 35px rgba(0,0,0,0.6))' }}
          >
            <defs>
              {/* REALISTIC SVG TEXTURE PATTERNS */}

              {/* 1. Oak Hardwood Planks with Wood Grain */}
              <pattern id="realisticOakFloor" width="100" height="28" patternUnits="userSpaceOnUse">
                <rect width="100" height="28" fill="#d7ba9d" />
                {/* Horizontal Wood Planks */}
                <rect x="0" y="0" width="50" height="14" fill="#cfae8e" stroke="#b08b68" strokeWidth="0.8" />
                <rect x="50" y="0" width="50" height="14" fill="#dfc4a9" stroke="#b08b68" strokeWidth="0.8" />
                <rect x="0" y="14" width="65" height="14" fill="#dfc4a9" stroke="#b08b68" strokeWidth="0.8" />
                <rect x="65" y="14" width="35" height="14" fill="#cfae8e" stroke="#b08b68" strokeWidth="0.8" />
                {/* Subtle Grain lines */}
                <line x1="5" y1="7" x2="45" y2="7" stroke="#9c7553" strokeWidth="0.5" opacity="0.3" />
                <line x1="70" y1="21" x2="95" y2="21" stroke="#9c7553" strokeWidth="0.5" opacity="0.3" />
              </pattern>

              {/* 2. Dark Walnut Luxury Parquet */}
              <pattern id="realisticWalnutFloor" width="80" height="24" patternUnits="userSpaceOnUse">
                <rect width="80" height="24" fill="#543d2b" />
                <rect x="0" y="0" width="40" height="12" fill="#4a3525" stroke="#2e1f14" strokeWidth="0.8" />
                <rect x="40" y="0" width="40" height="12" fill="#5c4330" stroke="#2e1f14" strokeWidth="0.8" />
                <rect x="0" y="12" width="50" height="12" fill="#5c4330" stroke="#2e1f14" strokeWidth="0.8" />
                <rect x="50" y="12" width="30" height="12" fill="#4a3525" stroke="#2e1f14" strokeWidth="0.8" />
              </pattern>

              {/* 3. Light Birch Scandinavian */}
              <pattern id="realisticBirchFloor" width="80" height="24" patternUnits="userSpaceOnUse">
                <rect width="80" height="24" fill="#f0ebe1" />
                <rect x="0" y="0" width="40" height="12" fill="#e8e1d5" stroke="#d4cbbe" strokeWidth="0.8" />
                <rect x="40" y="0" width="40" height="12" fill="#f5f0e6" stroke="#d4cbbe" strokeWidth="0.8" />
                <rect x="0" y="12" width="55" height="12" fill="#f5f0e6" stroke="#d4cbbe" strokeWidth="0.8" />
                <rect x="55" y="12" width="25" height="12" fill="#e8e1d5" stroke="#d4cbbe" strokeWidth="0.8" />
              </pattern>

              {/* 4. Calacatta Gold Marble Tiles */}
              <pattern id="calacattaMarbleFloor" width="44" height="44" patternUnits="userSpaceOnUse">
                <rect width="44" height="44" fill="#fafaf9" />
                <path d="M 0 12 Q 18 22, 44 14 M 12 0 Q 24 30, 32 44" fill="none" stroke="#d6d3d1" strokeWidth="1.2" opacity="0.7" />
                <path d="M 8 0 Q 18 18, 44 26" fill="none" stroke="#ca8a04" strokeWidth="0.8" opacity="0.35" />
                <rect width="44" height="44" fill="none" stroke="#e7e5e4" strokeWidth="0.8" />
              </pattern>

              {/* 5. Terrace Stone Pavers */}
              <pattern id="terraceStoneFloor" width="32" height="32" patternUnits="userSpaceOnUse">
                <rect width="32" height="32" fill="#e7e5e4" />
                <rect x="2" y="2" width="28" height="28" fill="#f5f5f4" stroke="#d6d3d1" strokeWidth="1" />
                <line x1="6" y1="6" x2="26" y2="26" stroke="#e7e5e4" strokeWidth="0.5" />
              </pattern>

              {/* 6. Garden Grass & Lawn Pattern */}
              <pattern id="gardenLawn" width="24" height="24" patternUnits="userSpaceOnUse">
                <rect width="24" height="24" fill="#3f6212" />
                <circle cx="6" cy="6" r="2.5" fill="#4d7c0f" />
                <circle cx="18" cy="14" r="3" fill="#65a30d" />
                <circle cx="10" cy="18" r="2" fill="#365314" />
              </pattern>

              {/* LIGHTING & SHADOW FILTERS */}
              <filter id="wallShadow3D" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx={activeLighting === 'top_left' ? 6 : activeLighting === 'top_right' ? -6 : 8}
                  dy={activeLighting === 'golden_hour' ? 10 : 7}
                  stdDeviation="6"
                  floodColor="#000000"
                  floodOpacity="0.5"
                />
              </filter>

              <filter id="furnitureShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow
                  dx={activeLighting === 'top_left' ? 3 : -3}
                  dy="4"
                  stdDeviation="3"
                  floodColor="#000000"
                  floodOpacity="0.38"
                />
              </filter>

              <filter id="subtleShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.25" />
              </filter>

              {/* Radial Lamp Glow */}
              <radialGradient id="warmLampGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* SURROUNDING LUSH GARDEN & FLOWERING FOLIAGE (Like Reference Image 1) */}
            {showGarden && (
              <g>
                {/* Outer Garden Grass Base */}
                <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="url(#gardenLawn)" rx="16" />

                {/* Stepping Stones on Top/Bottom Walkways */}
                {[0, 1, 2, 3, 4, 5, 6].map(i => (
                  <rect
                    key={`step-${i}`}
                    x={originX + houseW / 2 - 60 + i * 20}
                    y={originY - 26}
                    width="14"
                    height="10"
                    fill="#a8a29e"
                    stroke="#78716c"
                    strokeWidth="1"
                    rx="3"
                    filter="url(#subtleShadow)"
                  />
                ))}

                {/* Perimeter Tree Crowns & Flowering Bushes */}
                {[
                  // Top Row Trees
                  { x: originX + 20, y: originY - 24, r: 24, col: '#15803d' },
                  { x: originX + houseW - 30, y: originY - 24, r: 28, col: '#166534' },
                  // Left Trees
                  { x: originX - 30, y: originY + 60, r: 26, col: '#15803d' },
                  { x: originX - 28, y: originY + houseH / 2, r: 30, col: '#166534' },
                  { x: originX - 30, y: originY + houseH - 60, r: 26, col: '#15803d' },
                  // Right Trees & Flowering Shrubs
                  { x: originX + houseW + 32, y: originY + 80, r: 28, col: '#166534' },
                  { x: originX + houseW + 30, y: originY + houseH / 2, r: 32, col: '#15803d' },
                  { x: originX + houseW + 32, y: originY + houseH - 70, r: 28, col: '#166534' },
                  // Bottom Flowering Bushes
                  { x: originX + 40, y: originY + houseH + 28, r: 22, col: '#15803d' },
                  { x: originX + houseW / 2, y: originY + houseH + 30, r: 26, col: '#166534' },
                  { x: originX + houseW - 40, y: originY + houseH + 28, r: 22, col: '#15803d' }
                ].map((tree, i) => (
                  <g key={`tree-${i}`}>
                    {/* Shadow */}
                    <circle cx={tree.x + 4} cy={tree.y + 6} r={tree.r} fill="#000000" opacity="0.3" filter="url(#subtleShadow)" />
                    {/* Outer Foliage */}
                    <circle cx={tree.x} cy={tree.y} r={tree.r} fill={tree.col} stroke="#22c55e" strokeWidth="1" />
                    <circle cx={tree.x - 4} cy={tree.y - 4} r={tree.r * 0.65} fill="#22c55e" opacity="0.6" />
                    {/* Flowering blossoms */}
                    <circle cx={tree.x + tree.r * 0.4} cy={tree.y - tree.r * 0.3} r="3.5" fill="#f43f5e" />
                    <circle cx={tree.x - tree.r * 0.3} cy={tree.y + tree.r * 0.4} r="3" fill="#facc15" />
                  </g>
                ))}
              </g>
            )}

            {/* BUILDING FOUNDATION SLAB & INNER FLOORS */}
            <g>
              {/* Overall Foundation Shadow */}
              <rect
                x={originX - 4}
                y={originY - 4}
                width={houseW + 8}
                height={houseH + 8}
                fill="#000000"
                opacity="0.45"
                rx="6"
                filter="url(#wallShadow3D)"
              />

              {/* Concrete Perimeter Foundation Slab */}
              <rect
                x={originX}
                y={originY}
                width={houseW}
                height={houseH}
                fill="#d6d3d1"
                stroke="#a8a29e"
                strokeWidth="2"
                rx="4"
              />

              {/* INDIVIDUAL ROOM FLOORS WITH REALISTIC MATERIAL FILLS */}
              {floorPlanData.rooms.map(room => {
                const isSelected = selectedRoom?.id === room.id;
                let floorPattern = 'url(#realisticOakFloor)';
                if (room.floor === 'walnut') floorPattern = 'url(#realisticWalnutFloor)';
                if (room.floor === 'scandinavian') floorPattern = 'url(#realisticBirchFloor)';
                if (room.floor === 'calacatta_marble') floorPattern = 'url(#calacattaMarbleFloor)';
                if (room.floor === 'terrace_stone') floorPattern = 'url(#terraceStoneFloor)';

                return (
                  <g
                    key={room.id}
                    onClick={() => {
                      setSelectedRoom(room);
                      if (onRoomSelect) onRoomSelect(room);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Room Floor Fill */}
                    <rect
                      x={room.x}
                      y={room.y}
                      width={room.w}
                      height={room.h}
                      fill={floorPattern}
                      stroke={isSelected ? '#f59e0b' : '#78716c'}
                      strokeWidth={isSelected ? '3' : '1.5'}
                      rx="2"
                    />

                    {/* Room 3D Furniture Items */}
                    {renderFurnitureItem(room)}

                    {/* Room Label Badge */}
                    {showRoomLabels && (
                      <g pointerEvents="none">
                        <rect
                          x={room.x + room.w / 2 - 55}
                          y={room.y + room.h - 28}
                          width="110"
                          height="22"
                          fill="rgba(15, 23, 42, 0.85)"
                          stroke={isSelected ? '#f59e0b' : 'rgba(255,255,255,0.2)'}
                          strokeWidth="1"
                          rx="4"
                        />
                        <text
                          x={room.x + room.w / 2}
                          y={room.y + room.h - 13}
                          fill="#f8fafc"
                          fontSize="9"
                          fontFamily="Outfit, sans-serif"
                          fontWeight="700"
                          textAnchor="middle"
                        >
                          {room.name.length > 18 ? room.name.substring(0, 16) + '..' : room.name}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* 3D EXTRUDED MASONRY WALLS & TOP COPING (Taupe / Warm Grey Cap like Image 1 & 4) */}
              {floorPlanData.rooms.map(room => (
                <g key={`walls-${room.id}`} pointerEvents="none">
                  {/* Thick 3D Bevelled Wall Borders */}
                  <rect
                    x={room.x - 3}
                    y={room.y - 3}
                    width={room.w + 6}
                    height={room.h + 6}
                    fill="none"
                    stroke="#a8a29e"
                    strokeWidth="6"
                    rx="2"
                    filter="url(#wallShadow3D)"
                  />
                  {/* Top Masonry Cap Line */}
                  <rect
                    x={room.x - 3}
                    y={room.y - 3}
                    width={room.w + 6}
                    height={room.h + 6}
                    fill="none"
                    stroke="#e7e5e4"
                    strokeWidth="2"
                    rx="2"
                  />
                  {/* Internal Plaster Line */}
                  <rect
                    x={room.x}
                    y={room.y}
                    width={room.w}
                    height={room.h}
                    fill="none"
                    stroke="#57534e"
                    strokeWidth="1"
                  />
                </g>
              ))}
            </g>
          </svg>
        </div>
      </div>

      {/* SELECTED ROOM DETAILS DRAWER */}
      {selectedRoom && (
        <div
          style={{
            background: '#0d1424',
            border: '1px solid #38bdf8',
            borderLeft: '5px solid #38bdf8',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', margin: 0 }}>
                {selectedRoom.name}
              </h4>
              <span style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24', fontSize: '0.74rem', padding: '2px 8px', borderRadius: '5px', fontWeight: 700 }}>
                {selectedRoom.dim}
              </span>
              <span style={{ background: 'rgba(56,189,248,0.2)', color: '#38bdf8', fontSize: '0.74rem', padding: '2px 8px', borderRadius: '5px', fontWeight: 700 }}>
                {selectedRoom.sqft} Sq.Ft
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '3px' }}>
              Photorealistic 3D Cutaway Architectural Model • Calibrated for Real-time Execution
            </div>
          </div>

          <button
            onClick={() => setSelectedRoom(null)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.74rem',
              cursor: 'pointer'
            }}
          >
            Close Details
          </button>
        </div>
      )}
    </div>
  );
}
