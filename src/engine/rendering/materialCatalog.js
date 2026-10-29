/**
 * LabourConnect Design Engine - Architectural Material Catalog (Sprint 3, Task S3-T04)
 * 
 * Centralized, deterministic architectural material definition and assignment system.
 * Defines physically motivated material properties for residential components across
 * the 5 canonical architectural styles:
 * - Modern Contemporary
 * - Minimalist
 * - Luxury Villa
 * - Traditional Kerala
 * - Eco-Friendly
 * 
 * Material Invariants:
 * 1. Semantic component-to-material mapping (no scattered ad-hoc color decisions).
 * 2. Immutable, validated material definitions with safe fallbacks.
 * 3. Rendering-only: applying or switching materials never mutates canonical geometry,
 *    dimensions, room layouts, or structural grids.
 */

// =============================================================================
// 1. MATERIAL CATEGORIES & COMPONENT CONTRACT
// =============================================================================

export const MATERIAL_CATEGORIES = Object.freeze({
  MASONRY: 'masonry',
  WOOD: 'wood',
  GLASS: 'glass',
  METAL: 'metal',
  CONCRETE: 'concrete',
  TILE: 'tile',
  SITE: 'site'
});

export const MATERIAL_KEYS = Object.freeze({
  // Plasters & Wall Finishes
  PLASTER_CONTEMPORARY_OFFWHITE: 'plaster_contemporary_offwhite',
  PLASTER_MINIMALIST_GREY: 'plaster_minimalist_grey',
  PLASTER_LUXURY_TRAVERTINE: 'plaster_luxury_travertine',
  PLASTER_KERALA_OCHRE: 'plaster_kerala_ochre',
  PLASTER_ECO_LIMEWASH: 'plaster_eco_limewash',
  INTERIOR_WARM_EMULSION: 'interior_warm_emulsion',
  INTERIOR_CERAMIC_TILE: 'interior_ceramic_tile',

  // Concrete & Structural Elements
  CONCRETE_STRUCTURAL_RCC: 'concrete_structural_rcc',
  CONCRETE_PLINTH_GRANITE: 'concrete_plinth_granite',
  CONCRETE_WEATHER_CHAJJA: 'concrete_weather_chajja',
  CONCRETE_PARAPET_WALL: 'concrete_parapet_wall',

  // Floor Slabs
  SLAB_RCC_INTERMEDIATE: 'slab_rcc_intermediate',
  SLAB_TERRACE_REFLECTIVE: 'slab_terrace_reflective',
  SLAB_BALCONY_CANTILEVER: 'slab_balcony_cantilever',

  // Roof Components
  ROOF_MANGALORE_CLAY_TILE: 'roof_mangalore_clay_tile',
  ROOF_MANGALORE_RIDGE_CAP: 'roof_mangalore_ridge_cap',
  ROOF_PERGOLA_TRELLIS_TIMBER: 'roof_pergola_trellis_timber',
  ROOF_PERGOLA_TRELLIS_STEEL: 'roof_pergola_trellis_steel',
  ROOF_STEPPED_PARAPET_COPING: 'roof_stepped_parapet_coping',

  // Fenestration (Doors & Windows)
  GLASS_ACOUSTIC_TINTED: 'glass_acoustic_tinted',
  GLASS_LOW_E_CLEAR: 'glass_low_e_clear',
  FRAME_UPVC_CHARCOAL: 'frame_upvc_charcoal',
  FRAME_UPVC_WHITE: 'frame_upvc_white',
  FRAME_TIMBER_TEAK: 'frame_timber_teak',
  DOOR_PANEL_SOLID_TEAK: 'door_panel_solid_teak',
  DOOR_PANEL_CONTEMPORARY_FLUSH: 'door_panel_contemporary_flush',

  // Railings & Columns
  RAILING_SS316_POST: 'railing_ss316_post',
  RAILING_TEAK_HANDRAIL: 'railing_teak_handrail',
  RAILING_GLASS_PANEL: 'railing_glass_panel',
  COLUMN_RCC_PILLAR: 'column_rcc_pillar',
  COLUMN_TEAK_VERANDAH_POST: 'column_teak_verandah_post',

  // Site & Terrain
  SITE_GRASS_LAWN: 'site_grass_lawn',
  SITE_PAVER_WALKWAY: 'site_paver_walkway'
});

// =============================================================================
// 2. AUTHORITATIVE ARCHITECTURAL MATERIAL CATALOG
// =============================================================================

export const ARCHITECTURAL_MATERIALS = Object.freeze({
  // --- MASONRY & PLASTERS ---
  [MATERIAL_KEYS.PLASTER_CONTEMPORARY_OFFWHITE]: Object.freeze({
    id: MATERIAL_KEYS.PLASTER_CONTEMPORARY_OFFWHITE,
    name: 'Contemporary Smooth Off-White Acrylic Plaster',
    category: MATERIAL_CATEGORIES.MASONRY,
    baseColor: '#f8fafc',
    roughness: 0.80,
    metalness: 0.02,
    opacity: 1.0,
    ambientCoeff: 0.35,
    diffuseCoeff: 0.65,
    specularCoeff: 0.10,
    shininess: 12,
    strokeColor: '#94a3b8',
    strokeWidth: 0.8,
    surfaceTexture: 'fine_sponge'
  }),
  [MATERIAL_KEYS.PLASTER_MINIMALIST_GREY]: Object.freeze({
    id: MATERIAL_KEYS.PLASTER_MINIMALIST_GREY,
    name: 'Minimalist Architectural Cast Concrete Plaster',
    category: MATERIAL_CATEGORIES.MASONRY,
    baseColor: '#e2e8f0',
    roughness: 0.88,
    metalness: 0.01,
    opacity: 1.0,
    ambientCoeff: 0.32,
    diffuseCoeff: 0.68,
    specularCoeff: 0.08,
    shininess: 8,
    strokeColor: '#64748b',
    strokeWidth: 0.7,
    surfaceTexture: 'matte_concrete'
  }),
  [MATERIAL_KEYS.PLASTER_LUXURY_TRAVERTINE]: Object.freeze({
    id: MATERIAL_KEYS.PLASTER_LUXURY_TRAVERTINE,
    name: 'Honed Roman Travertine Stone Cladding',
    category: MATERIAL_CATEGORIES.MASONRY,
    baseColor: '#f5f5f4',
    roughness: 0.65,
    metalness: 0.04,
    opacity: 1.0,
    ambientCoeff: 0.36,
    diffuseCoeff: 0.64,
    specularCoeff: 0.20,
    shininess: 24,
    strokeColor: '#a8a29e',
    strokeWidth: 0.9,
    surfaceTexture: 'honed_stone'
  }),
  [MATERIAL_KEYS.PLASTER_KERALA_OCHRE]: Object.freeze({
    id: MATERIAL_KEYS.PLASTER_KERALA_OCHRE,
    name: 'Traditional Kerala Ochre Lime-Wash Plaster',
    category: MATERIAL_CATEGORIES.MASONRY,
    baseColor: '#fef3c7',
    roughness: 0.85,
    metalness: 0.01,
    opacity: 1.0,
    ambientCoeff: 0.38,
    diffuseCoeff: 0.62,
    specularCoeff: 0.08,
    shininess: 10,
    strokeColor: '#d97706',
    strokeWidth: 0.8,
    surfaceTexture: 'warm_limewash'
  }),
  [MATERIAL_KEYS.PLASTER_ECO_LIMEWASH]: Object.freeze({
    id: MATERIAL_KEYS.PLASTER_ECO_LIMEWASH,
    name: 'Natural Biophilic Breathable Lime Plaster',
    category: MATERIAL_CATEGORIES.MASONRY,
    baseColor: '#f0fdf4',
    roughness: 0.86,
    metalness: 0.01,
    opacity: 1.0,
    ambientCoeff: 0.35,
    diffuseCoeff: 0.65,
    specularCoeff: 0.08,
    shininess: 8,
    strokeColor: '#86efac',
    strokeWidth: 0.8,
    surfaceTexture: 'eco_mineral'
  }),
  [MATERIAL_KEYS.INTERIOR_WARM_EMULSION]: Object.freeze({
    id: MATERIAL_KEYS.INTERIOR_WARM_EMULSION,
    name: 'Interior Silk Sheen Warm Emulsion',
    category: MATERIAL_CATEGORIES.MASONRY,
    baseColor: '#fffbeb',
    roughness: 0.70,
    metalness: 0.02,
    opacity: 1.0,
    ambientCoeff: 0.40,
    diffuseCoeff: 0.60,
    specularCoeff: 0.12,
    shininess: 14,
    strokeColor: '#cbd5e1',
    strokeWidth: 0.5,
    surfaceTexture: 'silk_matte'
  }),
  [MATERIAL_KEYS.INTERIOR_CERAMIC_TILE]: Object.freeze({
    id: MATERIAL_KEYS.INTERIOR_CERAMIC_TILE,
    name: 'Glazed Anti-Skid Ceramic Wet-Area Tile',
    category: MATERIAL_CATEGORIES.TILE,
    baseColor: '#e0f2fe',
    roughness: 0.45,
    metalness: 0.08,
    opacity: 1.0,
    ambientCoeff: 0.32,
    diffuseCoeff: 0.68,
    specularCoeff: 0.28,
    shininess: 32,
    strokeColor: '#7dd3fc',
    strokeWidth: 0.6,
    surfaceTexture: 'glazed_ceramic'
  }),

  // --- CONCRETE & STRUCTURAL ---
  [MATERIAL_KEYS.CONCRETE_STRUCTURAL_RCC]: Object.freeze({
    id: MATERIAL_KEYS.CONCRETE_STRUCTURAL_RCC,
    name: 'Structural M25 Reinforced Cement Concrete',
    category: MATERIAL_CATEGORIES.CONCRETE,
    baseColor: '#cbd5e1',
    roughness: 0.90,
    metalness: 0.02,
    opacity: 1.0,
    ambientCoeff: 0.30,
    diffuseCoeff: 0.70,
    specularCoeff: 0.06,
    shininess: 6,
    strokeColor: '#475569',
    strokeWidth: 0.9,
    surfaceTexture: 'formwork_concrete'
  }),
  [MATERIAL_KEYS.CONCRETE_PLINTH_GRANITE]: Object.freeze({
    id: MATERIAL_KEYS.CONCRETE_PLINTH_GRANITE,
    name: 'Polished Jet-Black Granite Plinth Cladding',
    category: MATERIAL_CATEGORIES.CONCRETE,
    baseColor: '#0f172a',
    roughness: 0.30,
    metalness: 0.12,
    opacity: 1.0,
    ambientCoeff: 0.25,
    diffuseCoeff: 0.75,
    specularCoeff: 0.40,
    shininess: 48,
    strokeColor: '#020617',
    strokeWidth: 1.0,
    surfaceTexture: 'flamed_granite'
  }),
  [MATERIAL_KEYS.CONCRETE_WEATHER_CHAJJA]: Object.freeze({
    id: MATERIAL_KEYS.CONCRETE_WEATHER_CHAJJA,
    name: 'Cantilevered Concrete Weather-Shade (Chajja)',
    category: MATERIAL_CATEGORIES.CONCRETE,
    baseColor: '#94a3b8',
    roughness: 0.75,
    metalness: 0.03,
    opacity: 1.0,
    ambientCoeff: 0.32,
    diffuseCoeff: 0.68,
    specularCoeff: 0.15,
    shininess: 16,
    strokeColor: '#334155',
    strokeWidth: 0.9,
    surfaceTexture: 'smooth_render'
  }),
  [MATERIAL_KEYS.CONCRETE_PARAPET_WALL]: Object.freeze({
    id: MATERIAL_KEYS.CONCRETE_PARAPET_WALL,
    name: 'Waterproof Acrylic Screeded Parapet Wall',
    category: MATERIAL_CATEGORIES.CONCRETE,
    baseColor: '#94a3b8',
    roughness: 0.82,
    metalness: 0.02,
    opacity: 1.0,
    ambientCoeff: 0.33,
    diffuseCoeff: 0.67,
    specularCoeff: 0.10,
    shininess: 12,
    strokeColor: '#475569',
    strokeWidth: 0.8,
    surfaceTexture: 'weatherproof_plaster'
  }),

  // --- FLOOR SLABS ---
  [MATERIAL_KEYS.SLAB_RCC_INTERMEDIATE]: Object.freeze({
    id: MATERIAL_KEYS.SLAB_RCC_INTERMEDIATE,
    name: 'Intermediate Floor RCC Slab & Edge Band',
    category: MATERIAL_CATEGORIES.CONCRETE,
    baseColor: '#cbd5e1',
    roughness: 0.78,
    metalness: 0.04,
    opacity: 1.0,
    ambientCoeff: 0.32,
    diffuseCoeff: 0.68,
    specularCoeff: 0.12,
    shininess: 14,
    strokeColor: '#334155',
    strokeWidth: 0.9,
    surfaceTexture: 'slab_edge'
  }),
  [MATERIAL_KEYS.SLAB_TERRACE_REFLECTIVE]: Object.freeze({
    id: MATERIAL_KEYS.SLAB_TERRACE_REFLECTIVE,
    name: 'Solar-Reflective High SRI Ceramic Terrace Screed',
    category: MATERIAL_CATEGORIES.TILE,
    baseColor: '#f8fafc',
    roughness: 0.55,
    metalness: 0.05,
    opacity: 1.0,
    ambientCoeff: 0.35,
    diffuseCoeff: 0.65,
    specularCoeff: 0.22,
    shininess: 20,
    strokeColor: '#94a3b8',
    strokeWidth: 0.8,
    surfaceTexture: 'cooling_screed'
  }),
  [MATERIAL_KEYS.SLAB_BALCONY_CANTILEVER]: Object.freeze({
    id: MATERIAL_KEYS.SLAB_BALCONY_CANTILEVER,
    name: 'Cantilever Balcony Deck with Waterproof Screed',
    category: MATERIAL_CATEGORIES.CONCRETE,
    baseColor: '#64748b',
    roughness: 0.70,
    metalness: 0.05,
    opacity: 1.0,
    ambientCoeff: 0.30,
    diffuseCoeff: 0.70,
    specularCoeff: 0.15,
    shininess: 16,
    strokeColor: '#1e293b',
    strokeWidth: 1.0,
    surfaceTexture: 'anti_skid_deck'
  }),

  // --- ROOF COMPONENTS ---
  [MATERIAL_KEYS.ROOF_MANGALORE_CLAY_TILE]: Object.freeze({
    id: MATERIAL_KEYS.ROOF_MANGALORE_CLAY_TILE,
    name: 'Traditional Kerala Terracotta Mangalore Clay Roof Tiles',
    category: MATERIAL_CATEGORIES.TILE,
    baseColor: '#b45309',
    roughness: 0.82,
    metalness: 0.02,
    opacity: 1.0,
    ambientCoeff: 0.34,
    diffuseCoeff: 0.66,
    specularCoeff: 0.12,
    shininess: 14,
    strokeColor: '#78350f',
    strokeWidth: 1.2,
    surfaceTexture: 'corrugated_tiles'
  }),
  [MATERIAL_KEYS.ROOF_MANGALORE_RIDGE_CAP]: Object.freeze({
    id: MATERIAL_KEYS.ROOF_MANGALORE_RIDGE_CAP,
    name: 'Terracotta Half-Round Roof Ridge Cap',
    category: MATERIAL_CATEGORIES.TILE,
    baseColor: '#78350f',
    roughness: 0.78,
    metalness: 0.03,
    opacity: 1.0,
    ambientCoeff: 0.30,
    diffuseCoeff: 0.70,
    specularCoeff: 0.15,
    shininess: 16,
    strokeColor: '#451a03',
    strokeWidth: 1.1,
    surfaceTexture: 'ridge_tile'
  }),
  [MATERIAL_KEYS.ROOF_PERGOLA_TRELLIS_TIMBER]: Object.freeze({
    id: MATERIAL_KEYS.ROOF_PERGOLA_TRELLIS_TIMBER,
    name: 'Treated Hardwood Pergola Solar Trellis Beams',
    category: MATERIAL_CATEGORIES.WOOD,
    baseColor: '#451a03',
    roughness: 0.68,
    metalness: 0.04,
    opacity: 1.0,
    ambientCoeff: 0.30,
    diffuseCoeff: 0.70,
    specularCoeff: 0.18,
    shininess: 20,
    strokeColor: '#1c1917',
    strokeWidth: 1.0,
    surfaceTexture: 'treated_timber'
  }),
  [MATERIAL_KEYS.ROOF_PERGOLA_TRELLIS_STEEL]: Object.freeze({
    id: MATERIAL_KEYS.ROOF_PERGOLA_TRELLIS_STEEL,
    name: 'Powder-Coated Matte Charcoal Steel Pergola Beams',
    category: MATERIAL_CATEGORIES.METAL,
    baseColor: '#1e293b',
    roughness: 0.40,
    metalness: 0.75,
    opacity: 1.0,
    ambientCoeff: 0.25,
    diffuseCoeff: 0.75,
    specularCoeff: 0.45,
    shininess: 50,
    strokeColor: '#090d16',
    strokeWidth: 1.1,
    surfaceTexture: 'powder_coated_steel'
  }),
  [MATERIAL_KEYS.ROOF_STEPPED_PARAPET_COPING]: Object.freeze({
    id: MATERIAL_KEYS.ROOF_STEPPED_PARAPET_COPING,
    name: 'Sculpted Architectural Parapet Coping Pier',
    category: MATERIAL_CATEGORIES.CONCRETE,
    baseColor: '#334155',
    roughness: 0.72,
    metalness: 0.05,
    opacity: 1.0,
    ambientCoeff: 0.30,
    diffuseCoeff: 0.70,
    specularCoeff: 0.16,
    shininess: 18,
    strokeColor: '#0f172a',
    strokeWidth: 1.0,
    surfaceTexture: 'precast_coping'
  }),

  // --- FENESTRATION (DOORS & WINDOWS) ---
  [MATERIAL_KEYS.GLASS_ACOUSTIC_TINTED]: Object.freeze({
    id: MATERIAL_KEYS.GLASS_ACOUSTIC_TINTED,
    name: 'Double-Glazed Low-E Tinted Acoustic Glass',
    category: MATERIAL_CATEGORIES.GLASS,
    baseColor: '#38bdf8',
    roughness: 0.12,
    metalness: 0.15,
    opacity: 0.45,
    ambientCoeff: 0.20,
    diffuseCoeff: 0.30,
    specularCoeff: 0.85,
    shininess: 96,
    strokeColor: '#0284c7',
    strokeWidth: 0.7,
    surfaceTexture: 'tinted_glass'
  }),
  [MATERIAL_KEYS.GLASS_LOW_E_CLEAR]: Object.freeze({
    id: MATERIAL_KEYS.GLASS_LOW_E_CLEAR,
    name: 'Ultra-Clear Low-Iron Float Glass',
    category: MATERIAL_CATEGORIES.GLASS,
    baseColor: '#bae6fd',
    roughness: 0.08,
    metalness: 0.10,
    opacity: 0.45,
    ambientCoeff: 0.18,
    diffuseCoeff: 0.25,
    specularCoeff: 0.90,
    shininess: 110,
    strokeColor: '#38bdf8',
    strokeWidth: 0.6,
    surfaceTexture: 'clear_float'
  }),
  [MATERIAL_KEYS.FRAME_UPVC_CHARCOAL]: Object.freeze({
    id: MATERIAL_KEYS.FRAME_UPVC_CHARCOAL,
    name: 'Architectural Charcoal UPVC Window Frame',
    category: MATERIAL_CATEGORIES.METAL,
    baseColor: '#1e293b',
    roughness: 0.45,
    metalness: 0.35,
    opacity: 1.0,
    ambientCoeff: 0.25,
    diffuseCoeff: 0.75,
    specularCoeff: 0.25,
    shininess: 30,
    strokeColor: '#0f172a',
    strokeWidth: 1.0,
    surfaceTexture: 'satin_frame'
  }),
  [MATERIAL_KEYS.FRAME_UPVC_WHITE]: Object.freeze({
    id: MATERIAL_KEYS.FRAME_UPVC_WHITE,
    name: 'Virgin White Multi-Chamber UPVC Window Frame',
    category: MATERIAL_CATEGORIES.PLASTIC,
    baseColor: '#f1f5f9',
    roughness: 0.50,
    metalness: 0.10,
    opacity: 1.0,
    ambientCoeff: 0.35,
    diffuseCoeff: 0.65,
    specularCoeff: 0.20,
    shininess: 24,
    strokeColor: '#94a3b8',
    strokeWidth: 0.9,
    surfaceTexture: 'white_upvc'
  }),
  [MATERIAL_KEYS.FRAME_TIMBER_TEAK]: Object.freeze({
    id: MATERIAL_KEYS.FRAME_TIMBER_TEAK,
    name: 'Seasoned Nilambur Teak Heavy Section Frame',
    category: MATERIAL_CATEGORIES.WOOD,
    baseColor: '#78350f',
    roughness: 0.60,
    metalness: 0.04,
    opacity: 1.0,
    ambientCoeff: 0.30,
    diffuseCoeff: 0.70,
    specularCoeff: 0.22,
    shininess: 22,
    strokeColor: '#451a03',
    strokeWidth: 1.1,
    surfaceTexture: 'teak_grain'
  }),
  [MATERIAL_KEYS.DOOR_PANEL_SOLID_TEAK]: Object.freeze({
    id: MATERIAL_KEYS.DOOR_PANEL_SOLID_TEAK,
    name: 'Handcrafted Solid Teak Multi-Panel Shutter',
    category: MATERIAL_CATEGORIES.WOOD,
    baseColor: '#92400e',
    roughness: 0.58,
    metalness: 0.05,
    opacity: 1.0,
    ambientCoeff: 0.32,
    diffuseCoeff: 0.68,
    specularCoeff: 0.25,
    shininess: 26,
    strokeColor: '#451a03',
    strokeWidth: 1.0,
    surfaceTexture: 'polished_timber'
  }),
  [MATERIAL_KEYS.DOOR_PANEL_CONTEMPORARY_FLUSH]: Object.freeze({
    id: MATERIAL_KEYS.DOOR_PANEL_CONTEMPORARY_FLUSH,
    name: 'Contemporary Flush Laminated Architectural Door',
    category: MATERIAL_CATEGORIES.WOOD,
    baseColor: '#475569',
    roughness: 0.52,
    metalness: 0.08,
    opacity: 1.0,
    ambientCoeff: 0.28,
    diffuseCoeff: 0.72,
    specularCoeff: 0.20,
    shininess: 20,
    strokeColor: '#1e293b',
    strokeWidth: 0.9,
    surfaceTexture: 'matte_laminate'
  }),

  // --- RAILINGS & COLUMNS ---
  [MATERIAL_KEYS.RAILING_SS316_POST]: Object.freeze({
    id: MATERIAL_KEYS.RAILING_SS316_POST,
    name: 'Brushed Marine Grade SS 316 Baluster Post',
    category: MATERIAL_CATEGORIES.METAL,
    baseColor: '#94a3b8',
    roughness: 0.32,
    metalness: 0.85,
    opacity: 1.0,
    ambientCoeff: 0.22,
    diffuseCoeff: 0.78,
    specularCoeff: 0.60,
    shininess: 64,
    strokeColor: '#334155',
    strokeWidth: 0.8,
    surfaceTexture: 'brushed_steel'
  }),
  [MATERIAL_KEYS.RAILING_TEAK_HANDRAIL]: Object.freeze({
    id: MATERIAL_KEYS.RAILING_TEAK_HANDRAIL,
    name: 'Ergonomic Polished Teak Wood Top Handrail',
    category: MATERIAL_CATEGORIES.WOOD,
    baseColor: '#78350f',
    roughness: 0.52,
    metalness: 0.06,
    opacity: 1.0,
    ambientCoeff: 0.32,
    diffuseCoeff: 0.68,
    specularCoeff: 0.30,
    shininess: 32,
    strokeColor: '#451a03',
    strokeWidth: 1.0,
    surfaceTexture: 'polished_handrail'
  }),
  [MATERIAL_KEYS.RAILING_GLASS_PANEL]: Object.freeze({
    id: MATERIAL_KEYS.RAILING_GLASS_PANEL,
    name: '12mm Toughened Laminated Clear Balcony Safety Glass',
    category: MATERIAL_CATEGORIES.GLASS,
    baseColor: '#e0f2fe',
    roughness: 0.10,
    metalness: 0.10,
    opacity: 0.50,
    ambientCoeff: 0.20,
    diffuseCoeff: 0.30,
    specularCoeff: 0.88,
    shininess: 100,
    strokeColor: '#0284c7',
    strokeWidth: 0.7,
    surfaceTexture: 'laminated_glass'
  }),
  [MATERIAL_KEYS.COLUMN_RCC_PILLAR]: Object.freeze({
    id: MATERIAL_KEYS.COLUMN_RCC_PILLAR,
    name: 'RCC Column Pillar with Smooth Primer Finish',
    category: MATERIAL_CATEGORIES.CONCRETE,
    baseColor: '#e2e8f0',
    roughness: 0.84,
    metalness: 0.02,
    opacity: 1.0,
    ambientCoeff: 0.33,
    diffuseCoeff: 0.67,
    specularCoeff: 0.10,
    shininess: 10,
    strokeColor: '#475569',
    strokeWidth: 0.8,
    surfaceTexture: 'smooth_column'
  }),
  [MATERIAL_KEYS.COLUMN_TEAK_VERANDAH_POST]: Object.freeze({
    id: MATERIAL_KEYS.COLUMN_TEAK_VERANDAH_POST,
    name: 'Hand-Carved Traditional Teak Poomukham Pillar',
    category: MATERIAL_CATEGORIES.WOOD,
    baseColor: '#92400e',
    roughness: 0.55,
    metalness: 0.04,
    opacity: 1.0,
    ambientCoeff: 0.32,
    diffuseCoeff: 0.68,
    specularCoeff: 0.25,
    shininess: 24,
    strokeColor: '#451a03',
    strokeWidth: 1.0,
    surfaceTexture: 'carved_teak'
  }),

  // --- SITE & TERRAIN ---
  [MATERIAL_KEYS.SITE_GRASS_LAWN]: Object.freeze({
    id: MATERIAL_KEYS.SITE_GRASS_LAWN,
    name: 'Bermuda Grass Natural Landscape Lawn',
    category: MATERIAL_CATEGORIES.SITE,
    baseColor: '#15803d',
    roughness: 0.95,
    metalness: 0.01,
    opacity: 1.0,
    ambientCoeff: 0.35,
    diffuseCoeff: 0.65,
    specularCoeff: 0.05,
    shininess: 4,
    strokeColor: '#166534',
    strokeWidth: 1.2,
    surfaceTexture: 'lawn_turf'
  }),
  [MATERIAL_KEYS.SITE_PAVER_WALKWAY]: Object.freeze({
    id: MATERIAL_KEYS.SITE_PAVER_WALKWAY,
    name: 'Interlocking Permeable Concrete Pavers',
    category: MATERIAL_CATEGORIES.CONCRETE,
    baseColor: '#64748b',
    roughness: 0.88,
    metalness: 0.02,
    opacity: 1.0,
    ambientCoeff: 0.30,
    diffuseCoeff: 0.70,
    specularCoeff: 0.08,
    shininess: 8,
    strokeColor: '#334155',
    strokeWidth: 0.8,
    surfaceTexture: 'paver_grid'
  })
});

// =============================================================================
// 3. ARCHITECTURAL STYLE PALETTE MAPPINGS
// =============================================================================

export const STYLE_MATERIAL_PALETTES = Object.freeze({
  modern_contemporary: Object.freeze({
    styleId: 'modern_contemporary',
    name: 'Modern Contemporary Palette',
    description: 'Crisp neutral off-white surfaces, charcoal UPVC frames, acoustic glass, and dark granite plinth.',
    components: Object.freeze({
      wall_exterior: MATERIAL_KEYS.PLASTER_CONTEMPORARY_OFFWHITE,
      wall_interior: MATERIAL_KEYS.INTERIOR_WARM_EMULSION,
      plinth: MATERIAL_KEYS.CONCRETE_PLINTH_GRANITE,
      slab_floor: MATERIAL_KEYS.SLAB_RCC_INTERMEDIATE,
      slab_terrace: MATERIAL_KEYS.SLAB_TERRACE_REFLECTIVE,
      slab_balcony: MATERIAL_KEYS.SLAB_BALCONY_CANTILEVER,
      window_pane: MATERIAL_KEYS.GLASS_ACOUSTIC_TINTED,
      window_frame: MATERIAL_KEYS.FRAME_UPVC_CHARCOAL,
      door_leaf: MATERIAL_KEYS.DOOR_PANEL_CONTEMPORARY_FLUSH,
      door_frame: MATERIAL_KEYS.FRAME_UPVC_CHARCOAL,
      roofline: MATERIAL_KEYS.ROOF_PERGOLA_TRELLIS_STEEL,
      chajja: MATERIAL_KEYS.CONCRETE_WEATHER_CHAJJA,
      railing_post: MATERIAL_KEYS.RAILING_SS316_POST,
      railing_handrail: MATERIAL_KEYS.RAILING_TEAK_HANDRAIL,
      railing_panel: MATERIAL_KEYS.RAILING_GLASS_PANEL,
      column: MATERIAL_KEYS.COLUMN_RCC_PILLAR,
      parapet: MATERIAL_KEYS.CONCRETE_PARAPET_WALL,
      stair_tread: MATERIAL_KEYS.CONCRETE_PLINTH_GRANITE,
      site_ground: MATERIAL_KEYS.SITE_GRASS_LAWN
    })
  }),

  minimalist: Object.freeze({
    styleId: 'minimalist',
    name: 'Minimalist Architecture Palette',
    description: 'Monolithic fair-faced concrete render, ultra-slim black fenestration, and flush parapets.',
    components: Object.freeze({
      wall_exterior: MATERIAL_KEYS.PLASTER_MINIMALIST_GREY,
      wall_interior: MATERIAL_KEYS.INTERIOR_WARM_EMULSION,
      plinth: MATERIAL_KEYS.CONCRETE_PLINTH_GRANITE,
      slab_floor: MATERIAL_KEYS.SLAB_RCC_INTERMEDIATE,
      slab_terrace: MATERIAL_KEYS.SLAB_TERRACE_REFLECTIVE,
      slab_balcony: MATERIAL_KEYS.SLAB_BALCONY_CANTILEVER,
      window_pane: MATERIAL_KEYS.GLASS_LOW_E_CLEAR,
      window_frame: MATERIAL_KEYS.FRAME_UPVC_CHARCOAL,
      door_leaf: MATERIAL_KEYS.DOOR_PANEL_CONTEMPORARY_FLUSH,
      door_frame: MATERIAL_KEYS.FRAME_UPVC_CHARCOAL,
      roofline: MATERIAL_KEYS.CONCRETE_PARAPET_WALL,
      chajja: MATERIAL_KEYS.CONCRETE_WEATHER_CHAJJA,
      railing_post: MATERIAL_KEYS.RAILING_SS316_POST,
      railing_handrail: MATERIAL_KEYS.RAILING_SS316_POST,
      railing_panel: MATERIAL_KEYS.RAILING_GLASS_PANEL,
      column: MATERIAL_KEYS.COLUMN_RCC_PILLAR,
      parapet: MATERIAL_KEYS.CONCRETE_PARAPET_WALL,
      stair_tread: MATERIAL_KEYS.CONCRETE_STRUCTURAL_RCC,
      site_ground: MATERIAL_KEYS.SITE_PAVER_WALKWAY
    })
  }),

  luxury_villa: Object.freeze({
    styleId: 'luxury_villa',
    name: 'Luxury Villa Palette',
    description: 'Honed travertine stone, solid teak craftsmanship, double-height acoustic glazing, and stepped piers.',
    components: Object.freeze({
      wall_exterior: MATERIAL_KEYS.PLASTER_LUXURY_TRAVERTINE,
      wall_interior: MATERIAL_KEYS.INTERIOR_WARM_EMULSION,
      plinth: MATERIAL_KEYS.CONCRETE_PLINTH_GRANITE,
      slab_floor: MATERIAL_KEYS.SLAB_RCC_INTERMEDIATE,
      slab_terrace: MATERIAL_KEYS.SLAB_TERRACE_REFLECTIVE,
      slab_balcony: MATERIAL_KEYS.SLAB_BALCONY_CANTILEVER,
      window_pane: MATERIAL_KEYS.GLASS_ACOUSTIC_TINTED,
      window_frame: MATERIAL_KEYS.FRAME_UPVC_CHARCOAL,
      door_leaf: MATERIAL_KEYS.DOOR_PANEL_SOLID_TEAK,
      door_frame: MATERIAL_KEYS.FRAME_TIMBER_TEAK,
      roofline: MATERIAL_KEYS.ROOF_STEPPED_PARAPET_COPING,
      chajja: MATERIAL_KEYS.CONCRETE_WEATHER_CHAJJA,
      railing_post: MATERIAL_KEYS.RAILING_SS316_POST,
      railing_handrail: MATERIAL_KEYS.RAILING_TEAK_HANDRAIL,
      railing_panel: MATERIAL_KEYS.RAILING_GLASS_PANEL,
      column: MATERIAL_KEYS.COLUMN_RCC_PILLAR,
      parapet: MATERIAL_KEYS.ROOF_STEPPED_PARAPET_COPING,
      stair_tread: MATERIAL_KEYS.CONCRETE_PLINTH_GRANITE,
      site_ground: MATERIAL_KEYS.SITE_GRASS_LAWN
    })
  }),

  traditional_kerala: Object.freeze({
    styleId: 'traditional_kerala',
    name: 'Traditional Kerala Architecture Palette',
    description: 'Terracotta mangalore clay tile roof, carved teak timber, warm ochre plaster, and projecting chajjas.',
    components: Object.freeze({
      wall_exterior: MATERIAL_KEYS.PLASTER_KERALA_OCHRE,
      wall_interior: MATERIAL_KEYS.INTERIOR_WARM_EMULSION,
      plinth: MATERIAL_KEYS.CONCRETE_PLINTH_GRANITE,
      slab_floor: MATERIAL_KEYS.SLAB_RCC_INTERMEDIATE,
      slab_terrace: MATERIAL_KEYS.ROOF_MANGALORE_CLAY_TILE,
      slab_balcony: MATERIAL_KEYS.SLAB_BALCONY_CANTILEVER,
      window_pane: MATERIAL_KEYS.GLASS_LOW_E_CLEAR,
      window_frame: MATERIAL_KEYS.FRAME_TIMBER_TEAK,
      door_leaf: MATERIAL_KEYS.DOOR_PANEL_SOLID_TEAK,
      door_frame: MATERIAL_KEYS.FRAME_TIMBER_TEAK,
      roofline: MATERIAL_KEYS.ROOF_MANGALORE_CLAY_TILE,
      chajja: MATERIAL_KEYS.CONCRETE_WEATHER_CHAJJA,
      railing_post: MATERIAL_KEYS.COLUMN_TEAK_VERANDAH_POST,
      railing_handrail: MATERIAL_KEYS.RAILING_TEAK_HANDRAIL,
      railing_panel: MATERIAL_KEYS.RAILING_GLASS_PANEL,
      column: MATERIAL_KEYS.COLUMN_TEAK_VERANDAH_POST,
      parapet: MATERIAL_KEYS.CONCRETE_PARAPET_WALL,
      stair_tread: MATERIAL_KEYS.FRAME_TIMBER_TEAK,
      site_ground: MATERIAL_KEYS.SITE_GRASS_LAWN
    })
  }),

  eco_friendly: Object.freeze({
    styleId: 'eco_friendly',
    name: 'Eco-Friendly Biophilic Palette',
    description: 'Breathable lime-wash render, sustainable timber pergola trellis, deep passive solar sunshades.',
    components: Object.freeze({
      wall_exterior: MATERIAL_KEYS.PLASTER_ECO_LIMEWASH,
      wall_interior: MATERIAL_KEYS.INTERIOR_WARM_EMULSION,
      plinth: MATERIAL_KEYS.CONCRETE_PLINTH_GRANITE,
      slab_floor: MATERIAL_KEYS.SLAB_RCC_INTERMEDIATE,
      slab_terrace: MATERIAL_KEYS.SLAB_TERRACE_REFLECTIVE,
      slab_balcony: MATERIAL_KEYS.SLAB_BALCONY_CANTILEVER,
      window_pane: MATERIAL_KEYS.GLASS_LOW_E_CLEAR,
      window_frame: MATERIAL_KEYS.FRAME_TIMBER_TEAK,
      door_leaf: MATERIAL_KEYS.DOOR_PANEL_SOLID_TEAK,
      door_frame: MATERIAL_KEYS.FRAME_TIMBER_TEAK,
      roofline: MATERIAL_KEYS.ROOF_PERGOLA_TRELLIS_TIMBER,
      chajja: MATERIAL_KEYS.CONCRETE_WEATHER_CHAJJA,
      railing_post: MATERIAL_KEYS.RAILING_SS316_POST,
      railing_handrail: MATERIAL_KEYS.RAILING_TEAK_HANDRAIL,
      railing_panel: MATERIAL_KEYS.RAILING_GLASS_PANEL,
      column: MATERIAL_KEYS.COLUMN_RCC_PILLAR,
      parapet: MATERIAL_KEYS.CONCRETE_PARAPET_WALL,
      stair_tread: MATERIAL_KEYS.CONCRETE_PLINTH_GRANITE,
      site_ground: MATERIAL_KEYS.SITE_GRASS_LAWN
    })
  })
});

// =============================================================================
// 4. RESOLVER & VALIDATION UTILITIES
// =============================================================================

/**
 * Validates a material object ensuring all numeric and color invariants are satisfied.
 * 
 * @param {Object} material
 * @returns {boolean} true if valid
 */
export function validateMaterial(material) {
  if (!material || typeof material !== 'object') return false;
  if (!material.id || typeof material.id !== 'string') return false;
  if (!material.baseColor || typeof material.baseColor !== 'string' || !material.baseColor.startsWith('#')) return false;

  const numericFields = ['roughness', 'metalness', 'opacity', 'ambientCoeff', 'diffuseCoeff', 'specularCoeff', 'shininess'];
  for (const f of numericFields) {
    if (material[f] === undefined || typeof material[f] !== 'number' || !Number.isFinite(material[f])) {
      return false;
    }
  }

  // Range checks
  if (material.roughness < 0 || material.roughness > 1) return false;
  if (material.metalness < 0 || material.metalness > 1) return false;
  if (material.opacity < 0 || material.opacity > 1) return false;
  if (material.ambientCoeff < 0 || material.ambientCoeff > 1) return false;
  if (material.diffuseCoeff < 0 || material.diffuseCoeff > 1) return false;
  if (material.specularCoeff < 0 || material.specularCoeff > 1) return false;
  if (material.shininess <= 0) return false;

  return true;
}

/**
 * Resolves a material by identifier with deterministic fallback.
 * 
 * @param {string} materialKey
 * @param {Object} [overrides={}]
 * @returns {Object} Validated material definition
 */
export function resolveMaterial(materialKey, overrides = {}) {
  const base = ARCHITECTURAL_MATERIALS[materialKey] || ARCHITECTURAL_MATERIALS[MATERIAL_KEYS.PLASTER_CONTEMPORARY_OFFWHITE];
  if (!overrides || Object.keys(overrides).length === 0) {
    return base;
  }
  return {
    ...base,
    ...overrides
  };
}

/**
 * Resolves the appropriate semantic material for a 3D component under a specified style.
 * 
 * @param {string} componentType - e.g. 'wall_exterior', 'window_pane', 'window_frame', 'roofline'
 * @param {string} [styleId='modern_contemporary']
 * @param {Object} [options={}]
 * @returns {Object} Validated material definition
 */
export function getMaterialForComponent(componentType, styleId = 'modern_contemporary', options = {}) {
  let normalizedStyle = (styleId || 'modern_contemporary').toLowerCase().replace(/[\s-]/g, '_');
  if (normalizedStyle.includes('vintage') || normalizedStyle.includes('kerala') || normalizedStyle.includes('traditional')) {
    normalizedStyle = 'traditional_kerala';
  } else if (normalizedStyle.includes('tropical') || normalizedStyle.includes('eco') || normalizedStyle.includes('biophilic')) {
    normalizedStyle = 'eco_friendly';
  } else if (normalizedStyle.includes('luxury') || normalizedStyle.includes('villa') || normalizedStyle.includes('penthouse')) {
    normalizedStyle = 'luxury_villa';
  } else if (normalizedStyle.includes('minimal')) {
    normalizedStyle = 'minimalist';
  } else if (normalizedStyle.includes('modern') || normalizedStyle.includes('multi')) {
    normalizedStyle = 'modern_contemporary';
  }
  const palette = STYLE_MATERIAL_PALETTES[normalizedStyle] || STYLE_MATERIAL_PALETTES.modern_contemporary;
  
  // Semantic component mapping
  let matKey = null;

  if (componentType === 'wall_exterior' || componentType === 'wall_solid' || componentType === 'wall_header' || componentType === 'wall_apron' || componentType === 'wall_jamb') {
    matKey = palette.components.wall_exterior;
  } else if (componentType === 'wall_interior') {
    matKey = palette.components.wall_interior;
  } else if (componentType === 'window_pane' || componentType === 'glass') {
    matKey = palette.components.window_pane;
  } else if (componentType === 'window_frame') {
    matKey = palette.components.window_frame;
  } else if (componentType === 'door_leaf') {
    matKey = palette.components.door_leaf;
  } else if (componentType === 'door_frame') {
    matKey = palette.components.door_frame;
  } else if (componentType === 'foundation_plinth') {
    matKey = palette.components.plinth;
  } else if (componentType === 'intermediate_rcc_slab' || componentType === 'slab_strip' || componentType === 'slab_flank') {
    matKey = palette.components.slab_floor;
  } else if (componentType === 'roof_terrace_slab') {
    matKey = palette.components.slab_terrace;
  } else if (componentType === 'balcony_slab' || componentType === 'balcony_cantilever') {
    matKey = palette.components.slab_balcony;
  } else if (componentType === 'roof_sloping_pitch' || componentType === 'roof_ridge_cap' || componentType === 'roof_trellis_beam' || componentType === 'roof_stepped_pier' || componentType === 'roofline') {
    if (componentType === 'roof_ridge_cap') {
      matKey = MATERIAL_KEYS.ROOF_MANGALORE_RIDGE_CAP;
    } else {
      matKey = palette.components.roofline;
    }
  } else if (componentType === 'chajja' || componentType === 'window_chajja') {
    matKey = palette.components.chajja;
  } else if (componentType === 'railing_post' || componentType === 'balcony_post') {
    matKey = palette.components.railing_post;
  } else if (componentType === 'railing_handrail') {
    matKey = palette.components.railing_handrail;
  } else if (componentType === 'column' || componentType === 'structural_column') {
    matKey = palette.components.column;
  } else if (componentType === 'parapet' || componentType === 'parapet_wall') {
    matKey = palette.components.parapet;
  } else if (componentType === 'stair_tread' || componentType === 'stair_landing') {
    matKey = palette.components.stair_tread;
  } else {
    // Default safe fallback
    matKey = palette.components.wall_exterior || MATERIAL_KEYS.PLASTER_CONTEMPORARY_OFFWHITE;
  }

  return resolveMaterial(matKey, options.materialOverrides);
}

/**
 * Returns all available architectural materials in catalog.
 */
export function getAllMaterials() {
  return { ...ARCHITECTURAL_MATERIALS };
}

/**
 * Returns all supported architectural style material palettes.
 */
export function getAllStylePalettes() {
  return { ...STYLE_MATERIAL_PALETTES };
}
