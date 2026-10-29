/**
 * LabourConnect Design Engine - Parametric Landscape & Outdoor Living Catalog
 * 
 * Defines standard residential exterior elements across Indian climate zones:
 * 1. Ground & Lawn Surfaces (Bermuda grass, paver walkways, cobblestone driveways, patio paving)
 * 2. Vegetation (Native shade trees, columnar screening trees, flowering ornamental trees, evergreen shrubs)
 * 3. Compound Boundary & Access (Perimeter boundary walls, gate pillars, vehicle & pedestrian gates)
 * 4. Outdoor Living (Patio tables, wicker chairs, stone benches, planter boxes)
 * 5. Architectural Lighting (Pathway bollards, gate pillar lanterns)
 */

export const LANDSCAPE_CATEGORIES = Object.freeze({
  SURFACES: 'surfaces',
  VEGETATION: 'vegetation',
  BOUNDARY: 'boundary',
  OUTDOOR_LIVING: 'outdoor_living',
  LIGHTING: 'lighting'
});

export const LANDSCAPE_TYPES = Object.freeze({
  // Surfaces
  LAWN_BERMUDA_GRASS: 'lawn_bermuda_grass',
  PAVER_WALKWAY: 'paver_walkway',
  DRIVEWAY_PAVERS: 'driveway_pavers',
  PATIO_TERRACE: 'patio_terrace',

  // Vegetation
  TREE_NEEM_SHADE: 'tree_neem_shade',
  TREE_ASHOKA_COLUMNAR: 'tree_ashoka_columnar',
  TREE_FRANGIPANI_FLOWERING: 'tree_frangipani_flowering',
  SHRUB_BOUGAINVILLEA: 'shrub_bougainvillea',
  SHRUB_EVERGREEN_BOXWOOD: 'shrub_evergreen_boxwood',
  FLOWER_BED_BORDER: 'flower_bed_border',

  // Boundary
  COMPOUND_WALL_SECTION: 'compound_wall_section',
  GATE_PILLAR: 'gate_pillar',
  ENTRANCE_GATE_VEHICLE: 'entrance_gate_vehicle',
  ENTRANCE_GATE_PEDESTRIAN: 'entrance_gate_pedestrian',

  // Outdoor Living
  PATIO_GARDEN_TABLE: 'patio_garden_table',
  PATIO_GARDEN_CHAIR: 'patio_garden_chair',
  GARDEN_STONE_BENCH: 'garden_stone_bench',
  STONE_PLANTER_BOX: 'stone_planter_box',

  // Lighting
  LIGHT_BOLLARD_PATHWAY: 'light_bollard_pathway',
  LIGHT_GATE_PILLAR_LANTERN: 'light_gate_pillar_lantern'
});

export const LANDSCAPE_CATALOG = Object.freeze({
  // ---------------------------------------------------------------------------
  // 1. SURFACES
  // ---------------------------------------------------------------------------
  [LANDSCAPE_TYPES.LAWN_BERMUDA_GRASS]: Object.freeze({
    id: LANDSCAPE_TYPES.LAWN_BERMUDA_GRASS,
    name: 'Bermuda Grass Natural Landscape Lawn',
    category: LANDSCAPE_CATEGORIES.SURFACES,
    rateKey: 'garden_turf_lawn',
    unit: 'sq.ft',
    baseRateInr: 45,
    materialKey: 'site_grass_lawn',
    color: '#15803d',
    strokeColor: '#166534',
    defaultElevationY: 0.05
  }),

  [LANDSCAPE_TYPES.PAVER_WALKWAY]: Object.freeze({
    id: LANDSCAPE_TYPES.PAVER_WALKWAY,
    name: 'Interlocking Concrete Paver Walkway',
    category: LANDSCAPE_CATEGORIES.SURFACES,
    rateKey: 'garden_walkway_pavers',
    unit: 'sq.ft',
    baseRateInr: 85,
    materialKey: 'site_paver_walkway',
    color: '#94a3b8',
    strokeColor: '#64748b',
    defaultWidth: 3.5,
    defaultElevationY: 0.12
  }),

  [LANDSCAPE_TYPES.DRIVEWAY_PAVERS]: Object.freeze({
    id: LANDSCAPE_TYPES.DRIVEWAY_PAVERS,
    name: 'Heavy-Duty Interlocking Driveway Paving',
    category: LANDSCAPE_CATEGORIES.SURFACES,
    rateKey: 'driveway_paving',
    unit: 'sq.ft',
    baseRateInr: 95,
    materialKey: 'driveway_cobblestone',
    color: '#475569',
    strokeColor: '#334155',
    defaultWidth: 10.0,
    defaultElevationY: 0.10
  }),

  [LANDSCAPE_TYPES.PATIO_TERRACE]: Object.freeze({
    id: LANDSCAPE_TYPES.PATIO_TERRACE,
    name: 'Sandstone Paved Garden Patio Sit-Out',
    category: LANDSCAPE_CATEGORIES.SURFACES,
    rateKey: 'garden_walkway_pavers',
    unit: 'sq.ft',
    baseRateInr: 90,
    materialKey: 'patio_tile',
    color: '#d97706',
    strokeColor: '#b45309',
    defaultDimensions: { width: 10.0, depth: 8.0, height: 0.15 },
    defaultElevationY: 0.12
  }),

  // ---------------------------------------------------------------------------
  // 2. VEGETATION
  // ---------------------------------------------------------------------------
  [LANDSCAPE_TYPES.TREE_NEEM_SHADE]: Object.freeze({
    id: LANDSCAPE_TYPES.TREE_NEEM_SHADE,
    name: 'Native Indian Neem Shade Tree (Azadirachta indica)',
    category: LANDSCAPE_CATEGORIES.VEGETATION,
    rateKey: 'garden_ornamental_plants',
    unit: 'nos',
    baseRateInr: 3500,
    dimensions: {
      trunkRadius: 0.45,
      trunkHeight: 6.0,
      canopyRadius: 3.8,
      totalHeight: 15.0
    },
    materials: {
      trunk: { color: '#5c3a21', stroke: '#3e2723' },
      foliage: { color: '#166534', stroke: '#14532d' },
      accent: { color: '#15803d', stroke: '#166534' }
    },
    spacingClearance: 4.5
  }),

  [LANDSCAPE_TYPES.TREE_ASHOKA_COLUMNAR]: Object.freeze({
    id: LANDSCAPE_TYPES.TREE_ASHOKA_COLUMNAR,
    name: 'Columnar Ashoka Screening Tree (Polyalthia longifolia)',
    category: LANDSCAPE_CATEGORIES.VEGETATION,
    rateKey: 'garden_ornamental_plants',
    unit: 'nos',
    baseRateInr: 2200,
    dimensions: {
      trunkRadius: 0.35,
      trunkHeight: 4.0,
      canopyRadius: 1.8,
      totalHeight: 13.5
    },
    materials: {
      trunk: { color: '#4a2c11', stroke: '#2e1906' },
      foliage: { color: '#14532d', stroke: '#052e16' }
    },
    spacingClearance: 2.2
  }),

  [LANDSCAPE_TYPES.TREE_FRANGIPANI_FLOWERING]: Object.freeze({
    id: LANDSCAPE_TYPES.TREE_FRANGIPANI_FLOWERING,
    name: 'Flowering Frangipani / Temple Champa (Plumeria)',
    category: LANDSCAPE_CATEGORIES.VEGETATION,
    rateKey: 'garden_ornamental_plants',
    unit: 'nos',
    baseRateInr: 4500,
    dimensions: {
      trunkRadius: 0.4,
      trunkHeight: 4.5,
      canopyRadius: 3.0,
      totalHeight: 10.0
    },
    materials: {
      trunk: { color: '#78716c', stroke: '#57534e' },
      foliage: { color: '#15803d', stroke: '#166534' },
      blossoms: { color: '#fef08a', stroke: '#eab308' }
    },
    spacingClearance: 3.2
  }),

  [LANDSCAPE_TYPES.SHRUB_BOUGAINVILLEA]: Object.freeze({
    id: LANDSCAPE_TYPES.SHRUB_BOUGAINVILLEA,
    name: 'Flowering Bougainvillea Landscape Shrub',
    category: LANDSCAPE_CATEGORIES.VEGETATION,
    rateKey: 'garden_ornamental_plants',
    unit: 'nos',
    baseRateInr: 850,
    dimensions: { width: 2.5, depth: 2.5, height: 3.2 },
    materials: {
      foliage: { color: '#166534', stroke: '#14532d' },
      blossoms: { color: '#e11d48', stroke: '#be123c' }
    },
    spacingClearance: 1.5
  }),

  [LANDSCAPE_TYPES.SHRUB_EVERGREEN_BOXWOOD]: Object.freeze({
    id: LANDSCAPE_TYPES.SHRUB_EVERGREEN_BOXWOOD,
    name: 'Manicured Evergreen Garden Shrub',
    category: LANDSCAPE_CATEGORIES.VEGETATION,
    rateKey: 'garden_ornamental_plants',
    unit: 'nos',
    baseRateInr: 650,
    dimensions: { width: 2.0, depth: 2.0, height: 2.4 },
    materials: {
      foliage: { color: '#15803d', stroke: '#166534' }
    },
    spacingClearance: 1.2
  }),

  [LANDSCAPE_TYPES.FLOWER_BED_BORDER]: Object.freeze({
    id: LANDSCAPE_TYPES.FLOWER_BED_BORDER,
    name: 'Perennial Flowering Garden Bed Border',
    category: LANDSCAPE_CATEGORIES.VEGETATION,
    rateKey: 'garden_ornamental_plants',
    unit: 'r.ft',
    baseRateInr: 450,
    materials: {
      soil: { color: '#3e2723', stroke: '#27160c' },
      plants: { color: '#16a34a', stroke: '#15803d' },
      flowers: { color: '#f59e0b', stroke: '#d97706' }
    }
  }),

  // ---------------------------------------------------------------------------
  // 3. BOUNDARY & ACCESS
  // ---------------------------------------------------------------------------
  [LANDSCAPE_TYPES.COMPOUND_WALL_SECTION]: Object.freeze({
    id: LANDSCAPE_TYPES.COMPOUND_WALL_SECTION,
    name: 'Plastered Masonry Compound Wall with RCC Coping',
    category: LANDSCAPE_CATEGORIES.BOUNDARY,
    rateKey: 'compound_wall',
    unit: 'r.ft',
    baseRateInr: 1150,
    defaultDimensions: {
      height: 5.5,
      thickness: 0.65,
      copingHeight: 0.25,
      copingOverhang: 0.1
    },
    materials: {
      wall: { color: '#e2e8f0', stroke: '#94a3b8' },
      coping: { color: '#475569', stroke: '#334155' }
    }
  }),

  [LANDSCAPE_TYPES.GATE_PILLAR]: Object.freeze({
    id: LANDSCAPE_TYPES.GATE_PILLAR,
    name: 'RCC Gate Pillar with Dressed Granite Cap',
    category: LANDSCAPE_CATEGORIES.BOUNDARY,
    rateKey: 'compound_wall',
    unit: 'nos',
    baseRateInr: 6500,
    defaultDimensions: { width: 1.35, depth: 1.35, height: 6.5 },
    materials: {
      body: { color: '#cbd5e1', stroke: '#64748b' },
      cap: { color: '#1e293b', stroke: '#0f172a' }
    }
  }),

  [LANDSCAPE_TYPES.ENTRANCE_GATE_VEHICLE]: Object.freeze({
    id: LANDSCAPE_TYPES.ENTRANCE_GATE_VEHICLE,
    name: 'Contemporary Powder-Coated MS Louvered Sliding/Swing Gate',
    category: LANDSCAPE_CATEGORIES.BOUNDARY,
    rateKey: 'entrance_gate',
    unit: 'nos',
    baseRateInr: 38000,
    defaultDimensions: { width: 11.0, depth: 0.35, height: 5.0 },
    materials: {
      frame: { color: '#1e293b', stroke: '#0f172a' },
      louvers: { color: '#334155', stroke: '#1e293b' }
    }
  }),

  [LANDSCAPE_TYPES.ENTRANCE_GATE_PEDESTRIAN]: Object.freeze({
    id: LANDSCAPE_TYPES.ENTRANCE_GATE_PEDESTRIAN,
    name: 'Matching Pedestrian Wicket Gate',
    category: LANDSCAPE_CATEGORIES.BOUNDARY,
    rateKey: 'entrance_gate',
    unit: 'nos',
    baseRateInr: 12000,
    defaultDimensions: { width: 3.5, depth: 0.3, height: 5.0 },
    materials: {
      frame: { color: '#1e293b', stroke: '#0f172a' },
      louvers: { color: '#334155', stroke: '#1e293b' }
    }
  }),

  // ---------------------------------------------------------------------------
  // 4. OUTDOOR LIVING
  // ---------------------------------------------------------------------------
  [LANDSCAPE_TYPES.PATIO_GARDEN_TABLE]: Object.freeze({
    id: LANDSCAPE_TYPES.PATIO_GARDEN_TABLE,
    name: 'All-Weather Teakwood Outdoor Patio Dining Table',
    category: LANDSCAPE_CATEGORIES.OUTDOOR_LIVING,
    rateKey: 'garden_ornamental_plants',
    unit: 'nos',
    baseRateInr: 16000,
    defaultDimensions: { width: 4.5, depth: 4.5, height: 2.5 },
    materials: {
      top: { color: '#92400e', stroke: '#78350f' },
      legs: { color: '#78350f', stroke: '#451a03' }
    }
  }),

  [LANDSCAPE_TYPES.PATIO_GARDEN_CHAIR]: Object.freeze({
    id: LANDSCAPE_TYPES.PATIO_GARDEN_CHAIR,
    name: 'Synthetic Wicker Garden Armchair',
    category: LANDSCAPE_CATEGORIES.OUTDOOR_LIVING,
    rateKey: 'garden_ornamental_plants',
    unit: 'nos',
    baseRateInr: 5500,
    defaultDimensions: { width: 2.0, depth: 2.0, height: 2.8 },
    materials: {
      body: { color: '#78350f', stroke: '#451a03' },
      cushion: { color: '#fef08a', stroke: '#eab308' }
    }
  }),

  [LANDSCAPE_TYPES.GARDEN_STONE_BENCH]: Object.freeze({
    id: LANDSCAPE_TYPES.GARDEN_STONE_BENCH,
    name: 'Polished Granite Garden Park Bench',
    category: LANDSCAPE_CATEGORIES.OUTDOOR_LIVING,
    rateKey: 'garden_ornamental_plants',
    unit: 'nos',
    baseRateInr: 8500,
    defaultDimensions: { width: 4.5, depth: 1.6, height: 1.6 },
    materials: {
      slab: { color: '#334155', stroke: '#1e293b' },
      supports: { color: '#475569', stroke: '#334155' }
    }
  }),

  [LANDSCAPE_TYPES.STONE_PLANTER_BOX]: Object.freeze({
    id: LANDSCAPE_TYPES.STONE_PLANTER_BOX,
    name: 'Architectural Dressed Stone Planter Box',
    category: LANDSCAPE_CATEGORIES.OUTDOOR_LIVING,
    rateKey: 'garden_ornamental_plants',
    unit: 'nos',
    baseRateInr: 3200,
    defaultDimensions: { width: 4.0, depth: 1.4, height: 1.6 },
    materials: {
      box: { color: '#64748b', stroke: '#475569' },
      foliage: { color: '#16a34a', stroke: '#15803d' },
      flowers: { color: '#f43f5e', stroke: '#e11d48' }
    }
  }),

  // ---------------------------------------------------------------------------
  // 5. ARCHITECTURAL LIGHTING
  // ---------------------------------------------------------------------------
  [LANDSCAPE_TYPES.LIGHT_BOLLARD_PATHWAY]: Object.freeze({
    id: LANDSCAPE_TYPES.LIGHT_BOLLARD_PATHWAY,
    name: 'Architectural Die-Cast Aluminium Pathway Bollard Light',
    category: LANDSCAPE_CATEGORIES.LIGHTING,
    rateKey: 'garden_lighting_outdoor',
    unit: 'nos',
    baseRateInr: 2800,
    defaultDimensions: { width: 0.45, depth: 0.45, height: 2.2 },
    materials: {
      pole: { color: '#0f172a', stroke: '#020617' },
      head: { color: '#fef08a', stroke: '#fde047' }
    }
  }),

  [LANDSCAPE_TYPES.LIGHT_GATE_PILLAR_LANTERN]: Object.freeze({
    id: LANDSCAPE_TYPES.LIGHT_GATE_PILLAR_LANTERN,
    name: 'Waterproof Brass & Glass Gate Pillar Lantern',
    category: LANDSCAPE_CATEGORIES.LIGHTING,
    rateKey: 'garden_lighting_outdoor',
    unit: 'nos',
    baseRateInr: 3600,
    defaultDimensions: { width: 0.8, depth: 0.8, height: 1.2 },
    materials: {
      frame: { color: '#1e293b', stroke: '#0f172a' },
      glass: { color: '#fef9c3', stroke: '#fef08a' }
    }
  })
});

/**
 * Returns catalog entry for a landscape element type.
 */
export function getLandscapeDefinition(type) {
  return LANDSCAPE_CATALOG[type] || null;
}
