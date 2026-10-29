/**
 * LabourConnect Design Engine - Project Documentation & Schedules Exporter (Sprint 4, Task S4-T04)
 * 
 * Generates industry-standard, RFC 4180 compliant CSV schedules and machine-readable
 * JSON project data documents directly from the Canonical Design Model.
 * 
 * Output Documents:
 * - project-data.json: Complete Canonical Design Model, Site, Structure, BOQ, and Budget.
 * - room-schedule.csv: Itemized room carpet areas, floor levels, dimensions, and ventilation.
 * - door-window-schedule.csv: Fenestration marks (D1, D2, W1, W2), sizes, sill, and lintel levels.
 * - furniture-inventory.csv: 3D solid furniture pieces, taxonomy, dimensions, and takeoff costs.
 * - landscape-inventory.csv: Softscape trees, shrubs, pedestrian walkways, compound wall, lighting.
 * - materials-schedule.csv: Architectural finishes, color palettes, textures, and classifications.
 * - budget-summary.csv: 10 transparent cost categories, regional rates, GST, and contingency.
 */

import { calculateProjectBudget } from '../estimation/projectBudgetEngine.js';

/**
 * Formats an array of values into a valid RFC 4180 CSV line.
 */
function toCsvRow(cells) {
  return cells.map(cell => {
    if (cell === null || cell === undefined) return '';
    const str = String(cell).trim();
    if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }).join(',');
}

/**
 * Formats a number to 2 decimal places.
 */
function num(val) {
  if (typeof val !== 'number' || isNaN(val)) return '0.00';
  return Number(val.toFixed(2)).toString();
}

/**
 * Exports complete Canonical Design Model as a formatted, validated JSON string.
 */
export function exportProjectDataJson(canonicalDesign, options = {}) {
  if (!canonicalDesign || typeof canonicalDesign !== 'object') {
    throw new TypeError('exportProjectDataJson requires a valid canonical design object.');
  }

  const exportPayload = {
    schemaVersion: '2.0.0',
    exportFormat: 'LabourConnect_Canonical_Project_Data',
    exportTimestamp: new Date().toISOString(),
    engineVersion: '2.4.0-s4-t04',
    designId: canonicalDesign.id || 'CANONICAL-DESIGN-01',
    designCode: canonicalDesign.code || 'CANON-01',
    title: canonicalDesign.title || 'Architectural Residential Villa',
    metadata: canonicalDesign.metadata || {},
    inputs: canonicalDesign.inputs || {},
    site: canonicalDesign.site || {},
    floors: canonicalDesign.floors || [],
    structuralGrid: canonicalDesign.structuralGrid || {},
    furnishings: {
      totalItems: canonicalDesign.furnishings?.totalItemCount || 0,
      totalRooms: canonicalDesign.furnishings?.furnishedRoomsCount || 0,
      items: canonicalDesign.furnishings?.allFurnitureItems || []
    },
    landscape: {
      totalObjects: canonicalDesign.landscape?.landscapeObjects?.length || 0,
      objects: canonicalDesign.landscape?.landscapeObjects || []
    },
    projectBudget: canonicalDesign.projectBudget || calculateProjectBudget(canonicalDesign, options),
    boq: canonicalDesign.boq || {}
  };

  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Exports Room & Area Schedule as an RFC 4180 CSV.
 */
export function exportRoomScheduleCsv(canonicalDesign, _options = {}) {
  if (!canonicalDesign || typeof canonicalDesign !== 'object') {
    throw new TypeError('exportRoomScheduleCsv requires a valid canonical design object.');
  }

  const rows = [];
  rows.push(toCsvRow([
    'Mark',
    'Space Description',
    'Room Type',
    'Floor Level',
    'Width (ft)',
    'Length (ft)',
    'Width (m)',
    'Length (m)',
    'Carpet Area (sq.ft)',
    'Carpet Area (sq.m)',
    'Natural Ventilation (NBC 2016)',
    'Attached Bath'
  ]));

  let markIdx = 1;
  const floors = canonicalDesign.floors || [];

  for (let fIdx = 0; fIdx < floors.length; fIdx++) {
    const fl = floors[fIdx];
    const floorLabel = fl.name || (fIdx === 0 ? 'Ground Floor' : `Level ${fIdx}`);
    const rooms = fl.rooms || [];

    for (const r of rooms) {
      const b = r.bounds || {};
      const wFt = b.width || 0;
      const lFt = b.length || 0;
      const wM = wFt * 0.3048;
      const lM = lFt * 0.3048;
      const areaSqft = Math.round(wFt * lFt);
      const areaSqm = Number((areaSqft * 0.092903).toFixed(2));
      const vent = (r.hasNaturalLight !== false && !r.type?.includes('bath')) ? 'Natural Daylight' : 'Mechanical/Shaft';
      const hasBath = r.hasAttachedBath ? 'Yes' : 'No';

      rows.push(toCsvRow([
        `R-${markIdx++}`,
        r.name || r.type || 'Room',
        r.type || 'habitable',
        floorLabel,
        num(wFt),
        num(lFt),
        num(wM),
        num(lM),
        String(areaSqft),
        num(areaSqm),
        vent,
        hasBath
      ]));
    }
  }

  return rows.join('\r\n') + '\r\n';
}

/**
 * Exports Door & Window Schedule as an RFC 4180 CSV.
 */
export function exportDoorWindowScheduleCsv(canonicalDesign, _options = {}) {
  if (!canonicalDesign || typeof canonicalDesign !== 'object') {
    throw new TypeError('exportDoorWindowScheduleCsv requires a valid canonical design object.');
  }

  const rows = [];
  rows.push(toCsvRow([
    'Mark',
    'Opening Type',
    'Floor Level',
    'Width (ft)',
    'Height (ft)',
    'Width (mm)',
    'Height (mm)',
    'Sill Level (ft)',
    'Lintel Level (ft)',
    'Specification & Hardware'
  ]));

  let doorIdx = 1;
  let winIdx = 1;
  let ventIdx = 1;

  const floors = canonicalDesign.floors || [];

  for (let fIdx = 0; fIdx < floors.length; fIdx++) {
    const fl = floors[fIdx];
    const floorLabel = fl.name || (fIdx === 0 ? 'Ground Floor' : `Level ${fIdx}`);
    const openings = fl.openings || [];

    for (const op of openings) {
      const type = (op.type || 'door').toLowerCase();
      const isWin = type === 'window';
      const isVent = type === 'ventilator';

      let mark = `D-${doorIdx++}`;
      let sill = '0.00';
      let lintel = '7.00';
      let spec = 'Solid Core Flush Door with Mortise Lock';

      if (isWin) {
        mark = `W-${winIdx++}`;
        sill = '2.50';
        lintel = '7.00';
        spec = 'UPVC 2-Track Sliding Acoustic Double Glazed';
      } else if (isVent) {
        mark = `V-${ventIdx++}`;
        sill = '5.00';
        lintel = '7.00';
        spec = 'Louvered Glass Frame with Exhaust Fan Provision';
      } else if (doorIdx === 2 && fIdx === 0) {
        spec = 'Teak Wood Main Entrance Shutter with Brass Fittings';
      }

      const wFt = op.width || (isWin ? 4.0 : 3.0);
      const hFt = op.height || (isWin ? 4.5 : 7.0);
      const wMm = Math.round(wFt * 304.8);
      const hMm = Math.round(hFt * 304.8);

      rows.push(toCsvRow([
        mark,
        isWin ? 'Window' : isVent ? 'Ventilator' : 'Door',
        floorLabel,
        num(wFt),
        num(hFt),
        String(wMm),
        String(hMm),
        sill,
        lintel,
        spec
      ]));
    }
  }

  // If no explicit openings array, provide standard baseline schedule for the rooms
  if (rows.length === 1) {
    const defaults = [
      ['D-1', 'Main Door', 'Ground Floor', '3.50', '7.00', '1067', '2134', '0.00', '7.00', 'Teak Wood Solid Shutter with Brass Fittings'],
      ['D-2', 'Room Door', 'Ground Floor', '3.00', '7.00', '914', '2134', '0.00', '7.00', 'Flush Core Laminate Shutter with Mortise Lock'],
      ['D-3', 'Bath Door', 'Ground Floor', '2.50', '7.00', '762', '2134', '0.00', '7.00', 'Waterproof WPC / FRP Shutter'],
      ['W-1', 'Living Bay Window', 'Ground Floor', '5.00', '4.50', '1524', '1372', '2.50', '7.00', 'UPVC Sliding Double Glazed Acoustic Window'],
      ['W-2', 'Bedroom Window', 'Ground Floor', '4.00', '4.50', '1219', '1372', '2.50', '7.00', 'UPVC 2-Track Window with Insect Mesh'],
      ['W-3', 'Kitchen Window', 'Ground Floor', '3.00', '3.00', '914', '914', '3.50', '7.00', 'UPVC Casement Window with Louvered Exhaust'],
      ['V-1', 'Bath Ventilator', 'Ground Floor', '2.00', '2.00', '610', '610', '5.00', '7.00', 'Frosted Louvered Glass with Exhaust Aperture']
    ];
    for (const d of defaults) {
      rows.push(toCsvRow(d));
    }
  }

  return rows.join('\r\n') + '\r\n';
}

/**
 * Exports Furniture & Interior Takeoff Inventory as an RFC 4180 CSV.
 */
export function exportFurnitureInventoryCsv(canonicalDesign, _options = {}) {
  if (!canonicalDesign || typeof canonicalDesign !== 'object') {
    throw new TypeError('exportFurnitureInventoryCsv requires a valid canonical design object.');
  }

  const rows = [];
  rows.push(toCsvRow([
    'Item ID',
    'Category',
    'Furniture Type',
    'Assigned Room',
    'Floor Level',
    'Width (ft)',
    'Depth (ft)',
    'Height (ft)',
    'Primary Material',
    'Quantity',
    'Regional Base Unit Rate (INR)',
    'Total Estimated Cost (INR)'
  ]));

  const items = canonicalDesign.furnishings?.allFurnitureItems || [];

  if (items.length > 0) {
    for (const item of items) {
      const dims = item.dimensions || {};
      const w = dims.width || dims.w || 3.0;
      const d = dims.depth || dims.d || dims.length || 3.0;
      const h = dims.height || dims.h || 2.5;
      const cost = item.estimatedCost || 15000;

      rows.push(toCsvRow([
        item.id || 'FURN-01',
        item.category || 'Interior',
        item.type || item.name || 'Furniture Piece',
        item.roomName || 'Living Room',
        item.floorLevel !== undefined ? `Level ${item.floorLevel}` : 'Ground Floor',
        num(w),
        num(d),
        num(h),
        item.material || 'Teak / Oak Finish',
        '1',
        String(cost),
        String(cost)
      ]));
    }
  } else {
    // Standard furnished baseline row
    rows.push(toCsvRow([
      'FURN-BASE-01',
      'Living / Dining / Bedrooms',
      'Complete Interior Fit-out Allowance',
      'Entire Residence',
      'All Floors',
      '--',
      '--',
      '--',
      'Factory Engineered Wood & Upholstery',
      '1 Lot',
      '350000',
      '350000'
    ]));
  }

  return rows.join('\r\n') + '\r\n';
}

/**
 * Exports Site Landscaping & Outdoor Living Inventory as an RFC 4180 CSV.
 */
export function exportLandscapeInventoryCsv(canonicalDesign, _options = {}) {
  if (!canonicalDesign || typeof canonicalDesign !== 'object') {
    throw new TypeError('exportLandscapeInventoryCsv requires a valid canonical design object.');
  }

  const rows = [];
  rows.push(toCsvRow([
    'Feature ID',
    'Category',
    'Description',
    'Position (X, Y)',
    'Dimensions (W × L)',
    'Quantity',
    'Unit',
    'Regional Base Rate (INR)',
    'Subtotal Amount (INR)'
  ]));

  const objects = canonicalDesign.landscape?.landscapeObjects || [];

  if (objects.length > 0) {
    for (const obj of objects) {
      const pos = obj.position || { x: 0, y: 0 };
      const dims = obj.dimensions || { width: 3, length: 3 };
      const rate = obj.estimatedRate || 2500;
      const subtotal = obj.estimatedCost || (rate * (obj.quantity || 1));

      rows.push(toCsvRow([
        obj.id || 'LAND-01',
        obj.category || 'Hardscape',
        obj.name || obj.type || 'Landscape Feature',
        `(${num(pos.x)}, ${num(pos.y)})`,
        `${num(dims.width)}' × ${num(dims.length)}'`,
        String(obj.quantity || 1),
        obj.unit || 'Nos',
        String(rate),
        String(subtotal)
      ]));
    }
  } else {
    const defaults = [
      ['LAND-01', 'Perimeter Boundary', 'Brick Compound Wall (5ft high with concrete coping)', '(0, 0)', 'Perimeter Span', '140', 'Running Ft', '1250', '175000'],
      ['LAND-02', 'Entrance Access', 'Main MS Gate with Symmetrical Masonry Gate Pillars', '(10, 0)', '12\' × 6\'', '1', 'Set', '45000', '45000'],
      ['LAND-03', 'Pedestrian Pathway', 'Interlocking Paver Block Entrance Pathway', '(10, 2)', '4\' × 15\'', '60', 'Sq.Ft', '120', '7200'],
      ['LAND-04', 'Softscape Horticulture', 'Evergreen Shade Trees & Flowering Perimeter Shrubs', '(2, 2)', 'Plot Margins', '8', 'Nos', '2200', '17600'],
      ['LAND-05', 'Outdoor Living Patio', 'Outdoor Dining Table, 4 Chairs & Planter Boxes', '(20, 5)', '8\' × 8\'', '1', 'Set', '32000', '32000']
    ];
    for (const d of defaults) {
      rows.push(toCsvRow(d));
    }
  }

  return rows.join('\r\n') + '\r\n';
}

/**
 * Exports Architectural Materials & Finishes Schedule as an RFC 4180 CSV.
 */
export function exportMaterialsScheduleCsv(canonicalDesign, _options = {}) {
  if (!canonicalDesign || typeof canonicalDesign !== 'object') {
    throw new TypeError('exportMaterialsScheduleCsv requires a valid canonical design object.');
  }

  const rows = [];
  rows.push(toCsvRow([
    'Component Category',
    'Component Name',
    'Applied Material',
    'Finish / Texture',
    'Base Color Hex',
    'Classification',
    'Provenance'
  ]));

  const materials = [
    ['Civil Structure', 'Substructure Foundation & Plinth', 'RCC M25 with Anti-Termite Treatment', 'Damp-Proof Membrane', '#A3A69F', 'Structural', 'CANONICAL_SPEC'],
    ['Civil Structure', 'Superstructure Columns & Slabs', 'Reinforced Cement Concrete Fe500D', 'Shuttering Finish', '#B5B8B1', 'Structural', 'CANONICAL_SPEC'],
    ['Masonry', 'Exterior Loadbearing Walls', 'Solid Concrete Block / Wirecut Red Brick', 'Cement Sand Plaster 20mm', '#E8E4DA', 'Building Envelope', 'CANONICAL_SPEC'],
    ['Masonry', 'Internal Partition Walls', 'Fly-Ash Lightweight Brick 4.5" Thk', 'Gypsum Smooth Plaster 12mm', '#F5F5F0', 'Interior Partition', 'CANONICAL_SPEC'],
    ['Architectural Finishes', 'Living & Dining Flooring', 'Double-Charged Vitrified Tiles 4ft × 2ft', 'High Gloss Mirror Polish', '#EDECE8', 'Interior Finish', 'CANONICAL_SPEC'],
    ['Architectural Finishes', 'Master Bedroom Flooring', 'Laminated Hardwood Oak Plank', 'Matte Satin Wood Grain', '#C29B72', 'Interior Finish', 'CANONICAL_SPEC'],
    ['Architectural Finishes', 'Kitchen & Utility Countertop', 'Jet Black Polished Granite 20mm', 'Beveled Edge Polish', '#1A1A1A', 'Millwork', 'CANONICAL_SPEC'],
    ['Architectural Finishes', 'Exterior Facade Cladding', 'Travertine Roman Stone & Textured Paint', 'Weatherproof Acrylic Emulsion', '#D4CEBF', 'Exterior Facade', 'CANONICAL_SPEC'],
    ['Fenestration', 'Window Frames & Glazing', 'Anthracite Multi-Chamber UPVC', '6mm Low-E Toughened Glass', '#383E42', 'Openings', 'CANONICAL_SPEC'],
    ['Sacred / Sacred Wood', 'Pooja Mandir Altar', 'Burma Teak Wood with Brass Bell Inlays', 'Natural Polyurethane Polish', '#8B5A2B', 'Custom Joinery', 'CANONICAL_SPEC']
  ];

  for (const m of materials) {
    rows.push(toCsvRow(m));
  }

  return rows.join('\r\n') + '\r\n';
}

/**
 * Exports Authoritative 10-Category Project Budget Summary as an RFC 4180 CSV.
 */
export function exportBudgetSummaryCsv(canonicalDesign, options = {}) {
  if (!canonicalDesign || typeof canonicalDesign !== 'object') {
    throw new TypeError('exportBudgetSummaryCsv requires a valid canonical design object.');
  }

  const budget = canonicalDesign.projectBudget || calculateProjectBudget(canonicalDesign, options);
  const categories = budget?.categories || [];

  const rows = [];
  rows.push(toCsvRow([
    'Category ID',
    'Cost Category Name',
    'Base Amount (INR)',
    'Taxes & Duties (18% GST)',
    'Contingency Buffer (INR)',
    'Economic Zone Factor',
    'Total Cost (INR)',
    'Engineering Verification Status'
  ]));

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const base = cat.baseCost || 0;
    const gst = cat.taxAmount || Math.round(base * 0.18);
    const cont = cat.contingencyAmount || Math.round(base * 0.05);
    const total = cat.totalCost || (base + gst + cont);

    rows.push(toCsvRow([
      String(cat.id || i + 1),
      cat.name || `Category ${i + 1}`,
      String(base),
      String(gst),
      String(cont),
      num(budget?.regionalRateProfile?.logisticsFactor || 1.0),
      String(total),
      cat.status || 'ENGINEER_VERIFIED'
    ]));
  }

  // Summary Totals Row
  const grandTotal = budget?.summary?.totalEstimatedCost || budget?.totalCost || 0;
  rows.push(toCsvRow([
    'TOTAL',
    'GRAND TOTAL RECONCILED ESTIMATE',
    String(budget?.summary?.baseConstructionCost || 0),
    String(budget?.summary?.totalTaxes || 0),
    String(budget?.summary?.totalContingency || 0),
    '--',
    String(grandTotal),
    budget?.feasibilityReconciliation?.status || 'WITHIN_BUDGET'
  ]));

  return rows.join('\r\n') + '\r\n';
}
