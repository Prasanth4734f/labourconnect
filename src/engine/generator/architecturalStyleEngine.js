/**
 * LabourConnect Generative Architecture Engine - Architectural Style Intelligence
 * 
 * Deep architectural intelligence layer that interprets architectural styles and building typologies.
 * Influences the entire building anatomy:
 * 1. Massing & Proportions
 * 2. Roof Geometry & Overhangs
 * 3. Floor Planning & Spatial Hierarchy
 * 4. Facade Composition & Fenestration
 * 5. Structural Expression (Columns, Verandahs, Thinnais, Porticos)
 * 6. Material Palettes & Textures
 * 7. Interior Architectural Features
 * 8. Landscaping Character
 */

import { ROOFLINE_STYLES, FACADE_MODULATIONS, FENESTRATION_RHYTHMS } from './architecturalVariationEngine.js';
import { MASSING_FAMILIES } from './designSpaceExplorer.js';

// =============================================================================
// 1. EXTENSIBLE ARCHITECTURAL STYLE FAMILIES
// =============================================================================

export const COMPREHENSIVE_ARCHITECTURAL_STYLES = Object.freeze({
  // --- INDIAN TRADITIONAL ARCHITECTURE ---
  VINTAGE_INDIAN: {
    id: 'vintage_indian',
    category: 'indian_traditional',
    name: 'Vintage Indian Heritage',
    preferredMassing: [MASSING_FAMILIES.COURTYARD_NAALUKETTU, MASSING_FAMILIES.RECTANGULAR_CLASSIC, MASSING_FAMILIES.U_SHAPE_CENTRAL],
    roofline: ROOFLINE_STYLES.SLOPING_PITCHED,
    roofPitchDegrees: 28,
    eavesOverhangFt: 3.2,
    roofMaterial: 'TERRACOTTA_MANGALORE_TILE',
    facadeModulation: FACADE_MODULATIONS.PROJECTING_CHAJJAS,
    fenestrationRhythm: FENESTRATION_RHYTHMS.TRADITIONAL_DIVIDED,
    porticoStyle: 'CARVED_TEAK_THINNAI',
    columnStyle: 'CARVED_TEAK_WITH_STONE_BASE',
    verandahType: 'WRAP_AROUND_VERANDAH',
    description: 'Heritage Indian residence with carved teakwood pillars, terracotta Mangalore tile eaves with deep overhangs, central courtyard, and continuous verandahs.',
    materials: {
      exteriorWall: '#fef3c7',     // Warm lime-plaster cream
      trimColor: '#78350f',        // Deep seasoned Burma teak
      roofColor: '#b45309',        // Weathered terracotta red
      plinthColor: '#1e293b',      // Polished Sadahalli/black granite plinth
      doorColor: '#451a03',        // Handcrafted solid teak door with brass studs
      railingColor: '#92400e'      // Turned timber balusters
    },
    interiorFeatures: ['Teakwood door frames with brass studs', 'Aathangudi hand-crafted tiles', 'Central thotti brass uruli', 'Carved timber rafters']
  },

  CHETTINAD: {
    id: 'chettinad',
    category: 'indian_traditional',
    name: 'Chettinad Heritage Mansion',
    preferredMassing: [MASSING_FAMILIES.COURTYARD_NAALUKETTU, MASSING_FAMILIES.LINEAR_PAVILION],
    roofline: ROOFLINE_STYLES.SLOPING_PITCHED,
    roofPitchDegrees: 32,
    eavesOverhangFt: 3.5,
    roofMaterial: 'TERRACOTTA_MANGALORE_TILE',
    facadeModulation: FACADE_MODULATIONS.PROJECTING_CHAJJAS,
    fenestrationRhythm: FENESTRATION_RHYTHMS.TRADITIONAL_DIVIDED,
    porticoStyle: 'CHETTINAD_MUGAPPU',
    columnStyle: 'POLISHED_BLACK_GRANITE_CARVED_TEAK',
    verandahType: 'RAISED_THINNAI_WITH_PILLARS',
    description: 'Palatial Chettinad architecture featuring a majestic entrance mugappu, raised thinnai verandah with fluted granite/timber pillars, dual courtyards, and Athangudi patterned tiles.',
    materials: {
      exteriorWall: '#fffbeb',
      trimColor: '#78350f',
      roofColor: '#991b1b',
      plinthColor: '#0f172a',
      doorColor: '#3c1303',
      railingColor: '#78350f'
    },
    interiorFeatures: ['Fluted black granite columns with teak capitals', 'Authentic Athangudi tiles', 'Belgian glass transoms', 'Valavu inner courtyard']
  },

  KERALA_TRADITIONAL: {
    id: 'kerala_traditional',
    category: 'indian_traditional',
    name: 'Traditional Kerala Nalukettu',
    preferredMassing: [MASSING_FAMILIES.COURTYARD_NAALUKETTU, MASSING_FAMILIES.L_SHAPE_COURT],
    roofline: ROOFLINE_STYLES.SLOPING_PITCHED,
    roofPitchDegrees: 35,
    eavesOverhangFt: 4.0,
    roofMaterial: 'TERRACOTTA_MANGALORE_TILE',
    facadeModulation: FACADE_MODULATIONS.PROJECTING_CHAJJAS,
    fenestrationRhythm: FENESTRATION_RHYTHMS.PASSIVE_VENTILATED,
    porticoStyle: 'POOMUKHAM_VERANDAH',
    columnStyle: 'ROUND_TAPERED_WOODEN_PILLARS',
    verandahType: 'POOMUKHAM_WITH_CHARUPADI_BENCH',
    description: 'Classical Kerala Nalukettu with prominent multi-tiered pitched gables, carved timber gables, poomukham entrance with charupadi wood bench, and rain-harvesting central thotti.',
    materials: {
      exteriorWall: '#fef9c3',
      trimColor: '#854d0e',
      roofColor: '#b91c1c',
      plinthColor: '#1c1917',
      doorColor: '#451a03',
      railingColor: '#713f12'
    },
    interiorFeatures: ['Charupadi wooden perimeter bench', 'Carved mukhadwaram entrance', 'Ankanam rain courtyard', 'Exposed timber ceilings']
  },

  TAMIL_TRADITIONAL: {
    id: 'tamil_traditional',
    category: 'indian_traditional',
    name: 'Tamil Traditional Agraharam',
    preferredMassing: [MASSING_FAMILIES.LINEAR_PAVILION, MASSING_FAMILIES.COURTYARD_NAALUKETTU],
    roofline: ROOFLINE_STYLES.SLOPING_PITCHED,
    roofPitchDegrees: 26,
    eavesOverhangFt: 2.8,
    roofMaterial: 'TERRACOTTA_MANGALORE_TILE',
    facadeModulation: FACADE_MODULATIONS.PROJECTING_CHAJJAS,
    fenestrationRhythm: FENESTRATION_RHYTHMS.TRADITIONAL_DIVIDED,
    porticoStyle: 'AGRAHARAM_THINNAI',
    columnStyle: 'STONE_BASE_TIMBER_SHAFT',
    verandahType: 'FRONT_THINNAI_SEATING',
    description: 'Traditional Tamil Agraharam dwelling with street-facing stone thinnai, central muttam courtyard, and passive cross-ventilation.',
    materials: {
      exteriorWall: '#fffbeb',
      trimColor: '#92400e',
      roofColor: '#c2410c',
      plinthColor: '#334155',
      doorColor: '#451a03',
      railingColor: '#9a3412'
    },
    interiorFeatures: ['Street-facing thinnai seating', 'Open central muttam', 'Reetham timber rafters', 'Brass hardware']
  },

  VILLAGE_RURAL: {
    id: 'village_rural',
    category: 'indian_traditional',
    name: 'Traditional Village House',
    preferredMassing: [MASSING_FAMILIES.L_SHAPE_COURT, MASSING_FAMILIES.RECTANGULAR_CLASSIC],
    roofline: ROOFLINE_STYLES.SLOPING_PITCHED,
    roofPitchDegrees: 24,
    eavesOverhangFt: 3.0,
    roofMaterial: 'TERRACOTTA_MANGALORE_TILE',
    facadeModulation: FACADE_MODULATIONS.PROJECTING_CHAJJAS,
    fenestrationRhythm: FENESTRATION_RHYTHMS.TRADITIONAL_DIVIDED,
    porticoStyle: 'VILLAGE_VERANDAH',
    columnStyle: 'LIMEWASH_MASONRY_PILLARS',
    verandahType: 'DEEP_SHADED_VERANDAH',
    description: 'Authentic village farmhouse with open courtyard, deep shaded verandah, lime-washed masonry, and native clay tile roofing.',
    materials: {
      exteriorWall: '#fefce8',
      trimColor: '#a16207',
      roofColor: '#ea580c',
      plinthColor: '#475569',
      doorColor: '#713f12',
      railingColor: '#854d0e'
    },
    interiorFeatures: ['Mud-plaster stipple wall textures', 'Exposed bamboo/timber ceiling framing', 'Tulsi maadam courtyard pedestal']
  },

  // --- CONTEMPORARY ARCHITECTURE ---
  MODERN_MINIMALIST: {
    id: 'modern_minimalist',
    category: 'contemporary',
    name: 'Modern Minimalist',
    preferredMassing: [MASSING_FAMILIES.STAGGERED_OFFSET, MASSING_FAMILIES.RECTANGULAR_CLASSIC, MASSING_FAMILIES.STEPPED_TERRACE],
    roofline: ROOFLINE_STYLES.PARAPET_PROFILE,
    roofPitchDegrees: 0,
    eavesOverhangFt: 0.0,
    roofMaterial: 'WHITE_SOLAR_REFLECTIVE_TILE',
    facadeModulation: FACADE_MODULATIONS.FLUSH,
    fenestrationRhythm: FENESTRATION_RHYTHMS.BALANCED_PUNCHED,
    porticoStyle: 'CANTILEVERED_SLAB',
    columnStyle: 'RECTANGULAR_CONCRETE_PIER',
    verandahType: 'MINIMAL_RECESSED_PORTAL',
    description: 'Pure geometric cuboid massing, recessed apertures, flush monolithic parapets, crisp clean planes, and zero extraneous ornament.',
    materials: {
      exteriorWall: '#f8fafc',
      trimColor: '#0f172a',
      roofColor: '#f1f5f9',
      plinthColor: '#020617',
      doorColor: '#0f172a',
      railingColor: '#0f172a'
    },
    interiorFeatures: ['Concealed shadow-line skirting', 'Frameless doors', 'Monolithic polished concrete floors', 'Hidden cove lighting']
  },

  CONTEMPORARY_LUXURY: {
    id: 'contemporary_luxury',
    category: 'contemporary',
    name: 'Contemporary Luxury Villa',
    preferredMassing: [MASSING_FAMILIES.U_SHAPE_CENTRAL, MASSING_FAMILIES.L_SHAPE_COURT, MASSING_FAMILIES.STEPPED_TERRACE],
    roofline: ROOFLINE_STYLES.PERGOLA_TERRACE,
    roofPitchDegrees: 0,
    eavesOverhangFt: 1.5,
    roofMaterial: 'ITALIAN_PORCELAIN_TERRACE_PAVERS',
    facadeModulation: FACADE_MODULATIONS.ARCHITECTURAL_FINS,
    fenestrationRhythm: FENESTRATION_RHYTHMS.FLOOR_TO_CEILING_SLIDER,
    porticoStyle: 'GRAND_DOUBLE_HEIGHT_PORTICO',
    columnStyle: 'STEEL_COMPOSITE_FLUTED_COLUMNS',
    verandahType: 'CANTILEVERED_GLASS_DECK',
    description: 'Sculptural luxury villa with expansive double-height volume, architectural solar fins, floor-to-ceiling glass sliders, rooftop pergola terrace, and infinity deck.',
    materials: {
      exteriorWall: '#ffffff',
      trimColor: '#1e293b',
      roofColor: '#334155',
      plinthColor: '#090d16',
      doorColor: '#18181b',
      railingColor: '#38bdf8'
    },
    interiorFeatures: ['Imported Statuario marble flooring', 'Acoustic double-glazed facade', 'Smart touch automation panels', 'Floating architectural staircase']
  },

  JAPANDI: {
    id: 'japandi',
    category: 'contemporary',
    name: 'Japandi Minimalist',
    preferredMassing: [MASSING_FAMILIES.L_SHAPE_COURT, MASSING_FAMILIES.COURTYARD_NAALUKETTU],
    roofline: ROOFLINE_STYLES.PARAPET_PROFILE,
    roofPitchDegrees: 15,
    eavesOverhangFt: 2.2,
    roofMaterial: 'MATTE_CHARCOAL_TILES',
    facadeModulation: FACADE_MODULATIONS.FLUSH,
    fenestrationRhythm: FENESTRATION_RHYTHMS.PASSIVE_VENTILATED,
    porticoStyle: 'SLATTED_OAK_PORTAL',
    columnStyle: 'SQUARE_TIMBER_POSTS',
    verandahType: 'ENGAWA_WOODEN_VERANDAH',
    description: 'Harmonious fusion of Scandinavian functionality and Japanese wabi-sabi minimalism, featuring natural lightwells, light oak slatted screens, and an engawa perimeter deck.',
    materials: {
      exteriorWall: '#fafaf9',
      trimColor: '#78716c',
      roofColor: '#292524',
      plinthColor: '#44403c',
      doorColor: '#57534e',
      railingColor: '#a8a29e'
    },
    interiorFeatures: ['Light natural white oak finishes', 'Shoji-inspired slatted partitions', 'Indoor pebble zen court', 'Neutral earth tones']
  },

  TROPICAL_MODERN: {
    id: 'tropical_modern',
    category: 'contemporary',
    name: 'Tropical Modern Architecture',
    preferredMassing: [MASSING_FAMILIES.L_SHAPE_COURT, MASSING_FAMILIES.U_SHAPE_CENTRAL, MASSING_FAMILIES.H_SHAPE_DUAL_COURT],
    roofline: ROOFLINE_STYLES.PERGOLA_TERRACE,
    roofPitchDegrees: 18,
    eavesOverhangFt: 3.5,
    roofMaterial: 'TERRACOTTA_OR_SLATE_PITCHED',
    facadeModulation: FACADE_MODULATIONS.PROJECTING_CHAJJAS,
    fenestrationRhythm: FENESTRATION_RHYTHMS.PANORAMIC_RIBBON,
    porticoStyle: 'TROPICAL_BREEZEWAY',
    columnStyle: 'TIMBER_EXPOSED_RCC_HYBRID',
    verandahType: 'EXPANSIVE_OUTDOOR_LIVING_LOGGIA',
    description: 'Bawa-inspired tropical modernism with porous indoor-outdoor boundaries, deep shading overhangs, louvered screens, landscaped breezeways, and water courtyards.',
    materials: {
      exteriorWall: '#f5f5f4',
      trimColor: '#44403c',
      roofColor: '#78716c',
      plinthColor: '#1c1917',
      doorColor: '#292524',
      railingColor: '#57534e'
    },
    interiorFeatures: ['Exposed form-finish concrete ceilings', 'Louvered teak doors for cross-ventilation', 'Water-body light court', 'Rough-cut granite accents']
  },

  MEDITERRANEAN: {
    id: 'mediterranean',
    category: 'contemporary',
    name: 'Mediterranean Villa',
    preferredMassing: [MASSING_FAMILIES.U_SHAPE_CENTRAL, MASSING_FAMILIES.COURTYARD_NAALUKETTU],
    roofline: ROOFLINE_STYLES.SLOPING_PITCHED,
    roofPitchDegrees: 20,
    eavesOverhangFt: 1.8,
    roofMaterial: 'SPANISH_BARREL_TERRACOTTA',
    facadeModulation: FACADE_MODULATIONS.PROJECTING_CHAJJAS,
    fenestrationRhythm: FENESTRATION_RHYTHMS.TRADITIONAL_DIVIDED,
    porticoStyle: 'ROMAN_ARCHED_PORTICO',
    columnStyle: 'ROUND_TUSCAN_STUCCO_COLUMNS',
    verandahType: 'ARCHED_PERGOLA_PATIO',
    description: 'Warm Mediterranean residence featuring rounded stucco arches, barrel terracotta tile roofs, sheltered courtyard with fountain, and wrought iron balustrades.',
    materials: {
      exteriorWall: '#fffbeb',
      trimColor: '#78350f',
      roofColor: '#c2410c',
      plinthColor: '#78716c',
      doorColor: '#7c2d12',
      railingColor: '#0f172a'
    },
    interiorFeatures: ['Terracotta quarry floor tiles', 'Exposed timber ceiling beams', 'Central courtyard fountain', 'Arched interior portals']
  }
});

// =============================================================================
// 2. EXTENSIBLE BUILDING TYPOLOGIES
// =============================================================================

export const BUILDING_TYPOLOGIES = Object.freeze({
  INDEPENDENT_HOUSE: {
    id: 'independent_house',
    name: 'Independent Residence / Villa',
    category: 'residential',
    defaultFloors: 2,
    spacePriorities: ['living', 'foyer', 'dining', 'kitchen', 'pooja', 'bedrooms', 'terrace'],
    circulationFactor: 0.15,
    requiresParking: true,
    description: 'Private multi-story standalone residential home with private setbacks, garden, and parking.'
  },
  COMPACT_URBAN: {
    id: 'compact_urban',
    name: 'Compact Urban Home',
    category: 'residential',
    defaultFloors: 2,
    spacePriorities: ['living', 'kitchen', 'dining', 'compact_stair', 'bedrooms', 'balcony'],
    circulationFactor: 0.12,
    requiresParking: true,
    description: 'High-efficiency space-saving urban home optimized for narrow or small city plots.'
  },
  FARMHOUSE_BUNGALOW: {
    id: 'farmhouse_bungalow',
    name: 'Contemporary Farmhouse / Bungalow',
    category: 'residential',
    defaultFloors: 1,
    spacePriorities: ['grand_verandah', 'open_living', 'country_kitchen', 'outdoor_dining', 'suites'],
    circulationFactor: 0.18,
    requiresParking: true,
    description: 'Expansive single-story or 1.5-story sprawling residence celebrating outdoor landscape and expansive verandahs.'
  },
  DUPLEX_VILLA: {
    id: 'duplex_villa',
    name: 'Luxury Duplex Residence',
    category: 'residential',
    defaultFloors: 2,
    spacePriorities: ['double_height_living', 'formal_dining', 'island_kitchen', 'sky_lounge', 'master_suites'],
    circulationFactor: 0.16,
    requiresParking: true,
    description: 'Modern two-floor residence with vertical integration, double-height living room, and upstairs family lounge.'
  },
  MULTI_GENERATIONAL: {
    id: 'multi_generational',
    name: 'Multi-Generational Family Home',
    category: 'residential',
    defaultFloors: 2,
    spacePriorities: ['ground_master_suite', 'prayer_room', 'large_dining', 'second_floor_family_suite', 'private_pantries'],
    circulationFactor: 0.16,
    requiresParking: true,
    description: 'Designed with dual master suites (one on ground floor for elders) and semi-private zoning for extended family harmony.'
  },
  COMMERCIAL_RETAIL_OFFICE: {
    id: 'commercial_retail_office',
    name: 'Commercial Mixed-Use / Office Building',
    category: 'commercial',
    defaultFloors: 3,
    spacePriorities: ['ground_retail_showroom', 'open_office_floorplate', 'conference_room', 'service_core', 'restrooms'],
    circulationFactor: 0.20,
    requiresParking: true,
    description: 'Commercial facility with street-facing ground retail showroom, flexible upper office plates, and high-capacity fire stair core.'
  }
});

// =============================================================================
// 3. STYLE & TYPOLOGY RESOLUTION ENGINE
// =============================================================================

/**
 * Intelligently resolves the architectural style and building typology from
 * prompt keywords, explicit inputs, and context.
 * 
 * @param {Object|string} promptOrSpecs - User prompt string or parsed specs
 * @returns {Object} Resolved style, typology, and design directives
 */
export function resolveStyleAndTypology(promptOrSpecs) {
  let promptText = '';
  let requestedStyle = '';

  if (typeof promptOrSpecs === 'string') {
    promptText = promptOrSpecs.toLowerCase();
  } else if (promptOrSpecs && typeof promptOrSpecs === 'object') {
    promptText = (promptOrSpecs.userPrompt || promptOrSpecs.prompt || '').toLowerCase();
    requestedStyle = (promptOrSpecs.archStyle || promptOrSpecs.style || '').toLowerCase();
  }

  const combined = `${promptText} ${requestedStyle}`;

  // 1. Resolve Architectural Style
  let resolvedStyle = COMPREHENSIVE_ARCHITECTURAL_STYLES.MODERN_MINIMALIST;

  if (combined.includes('vintage') || combined.includes('heritage') || combined.includes('colonial')) {
    resolvedStyle = COMPREHENSIVE_ARCHITECTURAL_STYLES.VINTAGE_INDIAN;
  } else if (combined.includes('chettinad')) {
    resolvedStyle = COMPREHENSIVE_ARCHITECTURAL_STYLES.CHETTINAD;
  } else if (combined.includes('kerala') || combined.includes('nalukettu')) {
    resolvedStyle = COMPREHENSIVE_ARCHITECTURAL_STYLES.KERALA_TRADITIONAL;
  } else if (combined.includes('tamil') || combined.includes('agraharam') || combined.includes('thinnai')) {
    resolvedStyle = COMPREHENSIVE_ARCHITECTURAL_STYLES.TAMIL_TRADITIONAL;
  } else if (combined.includes('village') || combined.includes('rural')) {
    resolvedStyle = COMPREHENSIVE_ARCHITECTURAL_STYLES.VILLAGE_RURAL;
  } else if (combined.includes('japandi') || combined.includes('zen') || combined.includes('wabi')) {
    resolvedStyle = COMPREHENSIVE_ARCHITECTURAL_STYLES.JAPANDI;
  } else if (combined.includes('tropical') || combined.includes('bawa')) {
    resolvedStyle = COMPREHENSIVE_ARCHITECTURAL_STYLES.TROPICAL_MODERN;
  } else if (combined.includes('mediterranean') || combined.includes('spanish')) {
    resolvedStyle = COMPREHENSIVE_ARCHITECTURAL_STYLES.MEDITERRANEAN;
  } else if (combined.includes('luxury') || combined.includes('villa') || combined.includes('mansion')) {
    resolvedStyle = COMPREHENSIVE_ARCHITECTURAL_STYLES.CONTEMPORARY_LUXURY;
  } else if (combined.includes('minimalist') || combined.includes('modern')) {
    resolvedStyle = COMPREHENSIVE_ARCHITECTURAL_STYLES.MODERN_MINIMALIST;
  }

  // 2. Resolve Building Typology
  let resolvedTypology = BUILDING_TYPOLOGIES.INDEPENDENT_HOUSE;

  if (combined.includes('commercial') || combined.includes('office') || combined.includes('retail') || combined.includes('shop')) {
    resolvedTypology = BUILDING_TYPOLOGIES.COMMERCIAL_RETAIL_OFFICE;
  } else if (combined.includes('farmhouse') || combined.includes('bungalow') || combined.includes('resort')) {
    resolvedTypology = BUILDING_TYPOLOGIES.FARMHOUSE_BUNGALOW;
  } else if (combined.includes('multi-gen') || combined.includes('two family') || combined.includes('joint family')) {
    resolvedTypology = BUILDING_TYPOLOGIES.MULTI_GENERATIONAL;
  } else if (combined.includes('duplex') || combined.includes('double height')) {
    resolvedTypology = BUILDING_TYPOLOGIES.DUPLEX_VILLA;
  } else if (combined.includes('compact') || combined.includes('small plot') || combined.includes('urban')) {
    resolvedTypology = BUILDING_TYPOLOGIES.COMPACT_URBAN;
  }

  return {
    style: resolvedStyle,
    typology: resolvedTypology,
    summary: `${resolvedStyle.name} (${resolvedTypology.name})`
  };
}

