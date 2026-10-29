/**
 * LabourConnect Design Engine - Automated Test Suite: S3-T04
 * Professional Materials, Lighting & Rendering
 * 
 * Tests:
 * - Group A: Material Catalog, Properties & Schema Validation
 * - Group B: Architectural Style Material Palettes (5 Canonical Styles)
 * - Group C: Semantic Component Material Assignment & Openings Distinction
 * - Group D: Continuous Diurnal Solar Cycle & Directional Sun Modeling
 * - Group E: Tri-Planar Face Shading & Blinn-Phong Highlights
 * - Group F: 3D Viewport Projection, Depth Sorting & Floor Isolation
 * - Group G: Architectural Invariants, Regression & Performance Benchmark
 */

import {
  MATERIAL_CATEGORIES,
  MATERIAL_KEYS,
  ARCHITECTURAL_MATERIALS,
  validateMaterial,
  resolveMaterial,
  getMaterialForComponent,
  getAllMaterials,
  getAllStylePalettes,
  calculateSunPosition,
  calculateFaceShading,
  modulateHexColor,
  hexToRgb,
  rgbToHex,
  generateProceduralBuilding3d,
  project3dToViewport,
  generateArchitecturalAlternatives,
  designEngine
} from '../index.js';
import { validateCanonicalSchema } from '../schema/canonicalDesignSchema.js';

export function runProfessionalMaterialsAndLightingTests() {
  console.log('===============================================================');
  console.log('LABOURCONNECT 3D ENGINE: PROFESSIONAL MATERIALS & LIGHTING (S3-T04)');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} - ${details}`);
      failed++;
    }
  }

  // =========================================================================
  // GROUP A: MATERIAL CATALOG & VALIDATION
  // =========================================================================
  console.log('--- Group A: Material Catalog, Properties & Schema Validation ---');
  {
    const materials = getAllMaterials();
    const matKeys = Object.keys(materials);

    assert(matKeys.length >= 24, 'Test A.1: Catalog contains at least 24 architectural materials', `Found ${matKeys.length}`);

    // All categories represented
    const categoriesPresent = new Set(Object.values(materials).map(m => m.category));
    assert(categoriesPresent.has(MATERIAL_CATEGORIES.MASONRY), 'Test A.2.1: MASONRY category present');
    assert(categoriesPresent.has(MATERIAL_CATEGORIES.CONCRETE), 'Test A.2.2: CONCRETE category present');
    assert(categoriesPresent.has(MATERIAL_CATEGORIES.WOOD), 'Test A.2.3: WOOD category present');
    assert(categoriesPresent.has(MATERIAL_CATEGORIES.GLASS), 'Test A.2.4: GLASS category present');
    assert(categoriesPresent.has(MATERIAL_CATEGORIES.METAL), 'Test A.2.5: METAL category present');
    assert(categoriesPresent.has(MATERIAL_CATEGORIES.TILE), 'Test A.2.6: TILE category present');
    assert(categoriesPresent.has(MATERIAL_CATEGORIES.SITE), 'Test A.2.7: SITE category present');

    // Property validation across all catalog materials
    let allValid = true;
    let validCount = 0;
    for (const [key, mat] of Object.entries(materials)) {
      const isValid = validateMaterial(mat);
      if (!isValid) {
        allValid = false;
        console.error(`Material ${key} failed validation`);
      } else {
        validCount++;
      }
    }
    assert(allValid && validCount === matKeys.length, `Test A.3: All ${validCount} materials pass strict schema validation`);

    // Immutability / frozen
    const sampleMat = materials[MATERIAL_KEYS.PLASTER_CONTEMPORARY_OFFWHITE];
    assert(Object.isFrozen(sampleMat), 'Test A.4: Material definitions are frozen / immutable against mutations');

    // Unknown material identifier fallback
    const fallbackMat = resolveMaterial('unknown_nonexistent_key');
    assert(fallbackMat !== null && fallbackMat.id === MATERIAL_KEYS.PLASTER_CONTEMPORARY_OFFWHITE, 'Test A.5: Unknown material identifier gracefully falls back to default offwhite plaster');

    // Invalid material definition validation rejects bad input
    const badMat = { id: 'bad', baseColor: 'not-a-color', roughness: 5.0 };
    const badRes = validateMaterial(badMat);
    assert(badRes === false, 'Test A.6: Malformed material fails validation cleanly');
  }

  // =========================================================================
  // GROUP B: ARCHITECTURAL STYLE MATERIAL PALETTES
  // =========================================================================
  console.log('--- Group B: Architectural Style Material Palettes ---');
  {
    const palettes = getAllStylePalettes();
    const supportedStyles = [
      'modern_contemporary',
      'minimalist',
      'luxury_villa',
      'traditional_kerala',
      'eco_friendly'
    ];

    assert(supportedStyles.every(s => palettes[s] !== undefined), 'Test B.1: All 5 canonical styles have dedicated material palettes');

    // Each style maps all critical components
    const requiredComponents = [
      'wall_exterior',
      'wall_interior',
      'foundation_plinth',
      'intermediate_rcc_slab',
      'roof_terrace_slab',
      'roof_sloping_pitch',
      'roof_ridge_cap',
      'roof_trellis_beam',
      'roof_stepped_pier',
      'window_pane',
      'window_frame',
      'door_leaf',
      'column',
      'parapet',
      'balcony_cantilever',
      'railing_post',
      'railing_handrail',
      'stair_tread',
      'stair_landing',
      'chajja'
    ];

    let allStylesComplete = true;
    for (const styleId of supportedStyles) {
      for (const comp of requiredComponents) {
        const mat = getMaterialForComponent(comp, styleId);
        if (!mat || !mat.id) {
          allStylesComplete = false;
          console.error(`Component ${comp} failed to resolve for style ${styleId}`);
        }
      }
    }
    assert(allStylesComplete, 'Test B.2: All 5 style palettes comprehensively map all 20 architectural components');

    // Palettes are visually distinct
    const modernWall = getMaterialForComponent('wall_exterior', 'modern_contemporary');
    const minimalistWall = getMaterialForComponent('wall_exterior', 'minimalist');
    const luxuryWall = getMaterialForComponent('wall_exterior', 'luxury_villa');
    const keralaWall = getMaterialForComponent('wall_exterior', 'traditional_kerala');
    const ecoWall = getMaterialForComponent('wall_exterior', 'eco_friendly');

    const uniqueWallColors = new Set([
      modernWall.baseColor,
      minimalistWall.baseColor,
      luxuryWall.baseColor,
      keralaWall.baseColor,
      ecoWall.baseColor
    ]);
    assert(uniqueWallColors.size === 5, 'Test B.3: All 5 styles feature distinct exterior wall material colors', `Unique: ${uniqueWallColors.size}/5`);

    // Kerala style maps terracotta roof tiles
    const keralaRoof = getMaterialForComponent('roof_sloping_pitch', 'traditional_kerala');
    assert(keralaRoof.id === MATERIAL_KEYS.ROOF_MANGALORE_CLAY_TILE, 'Test B.4: Traditional Kerala style assigns authentic clay roof tile material');

    // Eco-friendly style maps natural timber pergola
    const ecoPergola = getMaterialForComponent('roof_trellis_beam', 'eco_friendly');
    assert(ecoPergola.id === MATERIAL_KEYS.WOOD_TEAK_NATURAL || ecoPergola.category === MATERIAL_CATEGORIES.WOOD, 'Test B.5: Eco-friendly style assigns natural timber pergola beams');
  }

  // =========================================================================
  // GROUP C: SEMANTIC COMPONENT MATERIAL ASSIGNMENT & OPENINGS
  // =========================================================================
  console.log('--- Group C: Semantic Component Material Assignment & Openings ---');
  {
    const cand = {
      schemaVersion: '2.0.0',
      id: 'mat_test_house',
      metadata: { style: 'modern_contemporary' },
      site: { plotWidth: 35, plotLength: 50, buildableEnvelope: { x: 3, y: 5, width: 29, length: 40 } },
      floors: [
        {
          floorIndex: 0,
          elevation: 0,
          rooms: [
            { id: 'living', name: 'Living Room', type: 'living', bounds: { x: 3, y: 5, width: 16, length: 18 } }
          ],
          walls: [
            { id: 'w_front', type: 'exterior', start: { x: 3, y: 5 }, end: { x: 19, y: 5 }, thickness: 0.75, height: 10 },
            { id: 'w_part', type: 'interior', start: { x: 11, y: 5 }, end: { x: 11, y: 23 }, thickness: 0.375, height: 10 }
          ],
          doors: [
            { id: 'd_main', wallId: 'w_front', position: { x: 7, y: 5 }, width: 3.5, height: 7.0 }
          ],
          windows: [
            { id: 'w_win', wallId: 'w_front', position: { x: 15, y: 5 }, width: 4.0, height: 4.5, sillHeight: 2.5 }
          ]
        },
        {
          floorIndex: 1,
          elevation: 10.5,
          rooms: [
            { id: 'bed', name: 'Bedroom', type: 'bedroom', bounds: { x: 3, y: 5, width: 16, length: 18 } },
            { id: 'balcony_rm', name: 'Balcony', type: 'balcony', bounds: { x: 19, y: 5, width: 10, length: 6 } }
          ],
          walls: [
            { id: 'w_f1_front', type: 'exterior', start: { x: 3, y: 5 }, end: { x: 19, y: 5 }, thickness: 0.75, height: 10 }
          ]
        }
      ]
    };

    const res = generateProceduralBuilding3d(cand, { style: 'modern_contemporary', includeChajjas: true });
    assert(res.meshes.length > 0, 'Test C.1: Generates procedural 3D building assembly');

    // Find window frame and glass pane
    const frameMesh = res.meshes.find(m => m.componentType === 'window_frame');
    const glassMesh = res.meshes.find(m => m.componentType === 'window_pane');
    const doorMesh = res.meshes.find(m => m.componentType === 'door_leaf');

    assert(frameMesh !== undefined, 'Test C.2: Window frame component mesh generated');
    assert(glassMesh !== undefined, 'Test C.3: Window glass pane component mesh generated');
    assert(doorMesh !== undefined, 'Test C.4: Door leaf component mesh generated');

    // Distinct materials and opacity
    assert(frameMesh.materialId !== glassMesh.materialId, 'Test C.5: Window frame and glass have distinct material IDs');
    assert(glassMesh.opacity < 1.0, 'Test C.6: Glass has semi-transparent opacity (< 1.0)', `Opacity: ${glassMesh.opacity}`);
    assert(frameMesh.opacity === 1.0, 'Test C.7: Window frame is fully opaque (1.0)');
    assert(doorMesh.opacity === 1.0, 'Test C.8: Door leaf is fully opaque (1.0)');

    // Exterior vs Interior wall materials
    const extWall = res.meshes.find(m => m.componentType === 'wall' && (m.wallType === 'wall_exterior' || m.metadata?.wallType === 'wall_exterior'));
    const intWall = res.meshes.find(m => m.componentType === 'wall' && (m.wallType === 'wall_interior' || m.metadata?.wallType === 'wall_interior'));
    assert(extWall !== undefined, 'Test C.9: Exterior wall mesh exists with wall_exterior semantic type');
    assert(intWall !== undefined, 'Test C.10: Interior wall mesh exists with wall_interior semantic type');

    // Balcony and railing materials
    const balconySlab = res.meshes.find(m => m.componentType === 'balcony_slab');
    const railingPost = res.meshes.find(m => m.componentType === 'railing_post');
    const railingRail = res.meshes.find(m => m.componentType === 'railing_top_rail');
    assert(balconySlab !== undefined, 'Test C.11: Balcony slab component generated');
    assert(railingPost !== undefined, 'Test C.12: Balcony railing post generated');
    assert(railingRail !== undefined, 'Test C.13: Balcony railing handrail generated');
    assert(railingPost.metalness >= 0.7, 'Test C.14: Railing post has metallic response (metalness >= 0.7)', `Metalness: ${railingPost.metalness}`);
  }

  // =========================================================================
  // GROUP D: DIURNAL SOLAR CYCLE & DIRECTIONAL LIGHTING
  // =========================================================================
  console.log('--- Group D: Diurnal Solar Cycle & Directional Sun Modeling ---');
  {
    // Sun position at 5 solar milestones
    const dawn = calculateSunPosition(6.5, 'North');
    const midday = calculateSunPosition(12.0, 'North');
    const goldenHour = calculateSunPosition(17.5, 'North');
    const twilight = calculateSunPosition(19.0, 'North');
    const night = calculateSunPosition(0.0, 'North');

    assert(dawn.preset === 'dawn', 'Test D.1.1: 6:30 is recognized as DAWN', dawn.preset);
    assert(midday.preset === 'midday', 'Test D.1.2: 12:00 is recognized as MIDDAY', midday.preset);
    assert(goldenHour.preset === 'golden_hour', 'Test D.1.3: 17:30 is recognized as GOLDEN_HOUR', goldenHour.preset);
    assert(twilight.preset === 'twilight', 'Test D.1.4: 19:00 is recognized as TWILIGHT', twilight.preset);
    assert(night.preset === 'night', 'Test D.1.5: 0:00 is recognized as NIGHT', night.preset);

    // Zenith angle at midday is high
    assert(midday.altitudeDegrees > dawn.altitudeDegrees, 'Test D.2: Solar altitude is significantly higher at midday than dawn');
    assert(midday.sunVector[1] > 0.8, 'Test D.3: Sun direction Y vector is near zenith at midday (> 0.8)', `Y: ${midday.sunVector[1]}`);

    // Normalized sun vectors
    for (const [timeName, sun] of Object.entries({ dawn, midday, goldenHour, twilight, night })) {
      const mag = Math.hypot(sun.sunVector[0], sun.sunVector[1], sun.sunVector[2]);
      assert(Math.abs(mag - 1.0) < 1e-3, `Test D.4: Sun vector for ${timeName} is normalized (magnitude = 1.0)`);
    }

    // Determinism: Same input yields exact same solar vector
    const sun1 = calculateSunPosition(14.25, 'East');
    const sun2 = calculateSunPosition(14.25, 'East');
    assert(
      sun1.sunVector[0] === sun2.sunVector[0] &&
      sun1.sunVector[1] === sun2.sunVector[1] &&
      sun1.sunVector[2] === sun2.sunVector[2],
      'Test D.5: Solar lighting calculation is 100% deterministic across repeated calls'
    );

    // Orientation offsets rotate solar vector
    const sunEast = calculateSunPosition(12.0, 'East');
    const sunWest = calculateSunPosition(12.0, 'West');
    assert(sunEast.sunVector[0] !== sunWest.sunVector[0], 'Test D.6: Facing orientation (East vs West) rotates the azimuth solar direction');
  }

  // =========================================================================
  // GROUP E: TRI-PLANAR FACE SHADING & BLINN-PHONG HIGHLIGHTS
  // =========================================================================
  console.log('--- Group E: Tri-Planar Face Shading & Blinn-Phong Highlights ---');
  {
    const middayLighting = calculateSunPosition(12.0, 'North');
    const plasterMat = ARCHITECTURAL_MATERIALS[MATERIAL_KEYS.PLASTER_CONTEMPORARY_OFFWHITE];
    const metalMat = ARCHITECTURAL_MATERIALS[MATERIAL_KEYS.METAL_STEEL_BRUSHED];

    // Upward face (Roof/Terrace Slab)
    const upwardNormal = [0, 1, 0];
    const upShading = calculateFaceShading(upwardNormal, plasterMat, middayLighting);

    // Downward face (Soffit/Ceiling)
    const downwardNormal = [0, -1, 0];
    const downShading = calculateFaceShading(downwardNormal, plasterMat, middayLighting);

    // Vertical face facing sun
    const sunLitNormal = [middayLighting.sunVector[0], 0, middayLighting.sunVector[2]];
    const mag = Math.hypot(sunLitNormal[0], sunLitNormal[2]) || 1;
    sunLitNormal[0] /= mag;
    sunLitNormal[2] /= mag;
    const verticalLitShading = calculateFaceShading(sunLitNormal, plasterMat, middayLighting);

    // Vertical face facing away from sun
    const verticalShadowNormal = [-sunLitNormal[0], 0, -sunLitNormal[2]];
    const verticalShadowShading = calculateFaceShading(verticalShadowNormal, plasterMat, middayLighting);

    assert(upShading.shadingFactor > downShading.shadingFactor, 'Test E.1: Upward-facing horizontal face is brighter than downward-facing soffit', `Up: ${upShading.shadingFactor} > Down: ${downShading.shadingFactor}`);
    assert(verticalLitShading.shadingFactor > verticalShadowShading.shadingFactor, 'Test E.2: Sun-lit vertical face is brighter than opposite shadow-facing face', `Lit: ${verticalLitShading.shadingFactor} > Shadow: ${verticalShadowShading.shadingFactor}`);

    // Clamping limits [0.22, 1.45]
    assert(downShading.shadingFactor >= 0.22, 'Test E.3: Downward face brightness does not drop below architectural minimum of 0.22');
    assert(upShading.shadingFactor <= 1.45, 'Test E.4: Upward face brightness does not exceed maximum limit of 1.45');

    // Specular response on metal vs plaster
    const halfDir = [0, 1, 0]; // Halfway vector
    const metalShading = calculateFaceShading(upwardNormal, metalMat, middayLighting, { viewVector: halfDir });
    const plasterShading = calculateFaceShading(upwardNormal, plasterMat, middayLighting, { viewVector: halfDir });
    assert(metalShading.components.specular >= plasterShading.components.specular, 'Test E.5: Metallic surface produces stronger specular highlight than matte plaster', `Metal spec: ${metalShading.components.specular} >= Plaster: ${plasterShading.components.specular}`);

    // Color modulation utility
    const modulated = modulateHexColor('#f8fafc', 0.85);
    assert(typeof modulated === 'string' && modulated.startsWith('#') && modulated.length === 7, 'Test E.6: ModulateHexColor returns valid 7-character hex string', modulated);

    const [r, g, b] = hexToRgb('#38bdf8');
    assert(r === 56 && g === 189 && b === 248, 'Test E.7: hexToRgb parses hex colors accurately');
    const backToHex = rgbToHex(r, g, b);
    assert(backToHex.toLowerCase() === '#38bdf8', 'Test E.8: rgbToHex converts back to hex accurately');
  }

  // =========================================================================
  // GROUP F: 3D VIEWPORT PROJECTION, DEPTH SORTING & FLOOR ISOLATION
  // =========================================================================
  console.log('--- Group F: 3D Viewport Projection, Depth Sorting & Floor Isolation ---');
  {
    const cand = {
      schemaVersion: '2.0.0',
      id: 'proj_test_duplex',
      metadata: { style: 'modern_contemporary' },
      site: { plotWidth: 35, plotLength: 50, buildableEnvelope: { x: 3, y: 5, width: 29, length: 40 } },
      floors: [
        {
          floorIndex: 0,
          elevation: 0,
          rooms: [{ id: 'r_g0', name: 'Living', bounds: { x: 3, y: 5, width: 20, length: 25 } }],
          walls: [{ id: 'w_g0', type: 'exterior', start: { x: 3, y: 5 }, end: { x: 23, y: 5 }, thickness: 0.75, height: 10 }]
        },
        {
          floorIndex: 1,
          elevation: 10.5,
          rooms: [{ id: 'r_f1', name: 'Master Bed', bounds: { x: 3, y: 5, width: 20, length: 25 } }],
          walls: [{ id: 'w_f1', type: 'exterior', start: { x: 3, y: 5 }, end: { x: 23, y: 5 }, thickness: 0.75, height: 10 }]
        }
      ]
    };

    const res = generateProceduralBuilding3d(cand, { style: 'modern_contemporary' });
    const camera = {
      azimuth: 45,
      elevation: 30,
      zoom: 1.0,
      panX: 0,
      panY: 0,
      width: 800,
      height: 600,
      solarTime: 12.0,
      facing: 'North'
    };

    const projected = project3dToViewport(res.meshes, camera);
    assert(projected.faces.length > 0, 'Test F.1: Viewport projector yields visible projected faces', `Faces: ${projected.faces.length}`);

    // Every projected face has shaded color and material attached
    const allFacesHaveShading = projected.faces.every(f => typeof f.shadedColor === 'string' && f.shadedColor.startsWith('#'));
    assert(allFacesHaveShading, 'Test F.2: All projected faces have calculated shadedColor hex strings');

    // Depth sorting order (Painter's algorithm: descending depth / furthest back rendered first)
    let sorted = true;
    for (let i = 0; i < projected.faces.length - 1; i++) {
      if (projected.faces[i].depth < projected.faces[i + 1].depth - 1e-4) {
        sorted = false;
        break;
      }
    }
    assert(sorted, 'Test F.3: Faces are sorted in Painter depth order (furthest back to nearest foreground)');

    // Floor isolation
    const isolatedGround = project3dToViewport(res.meshes, { ...camera, isolatedFloor: 0 });
    const isolatedFirst = project3dToViewport(res.meshes, { ...camera, isolatedFloor: 1 });

    assert(isolatedGround.faces.length > 0 && isolatedFirst.faces.length > 0, 'Test F.4: Floor isolation produces non-empty face lists for both floors');
    assert(isolatedGround.faces.length < projected.faces.length, 'Test F.5: Isolated floor has fewer faces than whole building model');

    const groundOnlyHasFloor0 = isolatedGround.faces.every(f => f.floorIndex === 0 || f.floorIndex === undefined);
    assert(groundOnlyHasFloor0, 'Test F.6: Isolated ground floor contains only floorIndex 0 elements');
  }

  // =========================================================================
  // GROUP G: ARCHITECTURAL INVARIANTS, REGRESSION & PERFORMANCE
  // =========================================================================
  console.log('--- Group G: Architectural Invariants, Regression & Performance ---');
  {
    const specs = {
      plotWidth: 35,
      plotLength: 50,
      bhkCount: 3,
      floorsCount: 2,
      archStyle: 'modern'
    };

    const res = generateArchitecturalAlternatives(specs, { count: 2, seed: 42 });
    assert(res.success && res.alternatives.length >= 2, 'Test G.1: Generates canonical alternatives');

    const alts = res.alternatives || [];
    const baseCand = alts[0];
    const schemaRes = validateCanonicalSchema(baseCand);
    assert(schemaRes.valid, 'Test G.2: Base candidate complies 100% with Canonical Schema v2.0.0');

    // Generate with style A vs style B
    const modelModern = generateProceduralBuilding3d(baseCand, { style: 'modern_contemporary' });
    const modelKerala = generateProceduralBuilding3d(baseCand, { style: 'traditional_kerala' });

    // Architectural geometry invariant: room counts and wall counts remain identical
    assert(modelModern.meshes.length === modelKerala.meshes.length, 'Test G.3: Material style palette change does not alter total mesh count', `Modern: ${modelModern.meshes.length} === Kerala: ${modelKerala.meshes.length}`);

    // Vertex count and bounds invariant
    const modernWall = modelModern.meshes.find(m => m.componentType === 'wall');
    const keralaWall = modelKerala.meshes.find(m => m.componentType === 'wall');
    assert(
      modernWall.vertices.length === keralaWall.vertices.length &&
      Math.abs(modernWall.bounds.min[0] - keralaWall.bounds.min[0]) < 1e-4 &&
      Math.abs(modernWall.bounds.max[0] - keralaWall.bounds.max[0]) < 1e-4,
      'Test G.4: Mesh geometry vertex positions are strictly invariant to material styling'
    );

    // Appearance difference: materials and colors differ
    assert(modernWall.metadata.color !== keralaWall.metadata.color, 'Test G.5: Different styles assign distinct material colors to the exact same wall mesh', `Modern: ${modernWall.metadata.color} !== Kerala: ${keralaWall.metadata.color}`);

    // Engine export verification
    assert(typeof designEngine.getMaterialForComponent === 'function', 'Test G.6: designEngine exports getMaterialForComponent');
    assert(typeof designEngine.calculateSunPosition === 'function', 'Test G.7: designEngine exports calculateSunPosition');
    assert(typeof designEngine.calculateFaceShading === 'function', 'Test G.8: designEngine exports calculateFaceShading');

    // Performance Benchmark: 3D generation with materials and lighting
    const t0 = Date.now();
    for (let i = 0; i < 10; i++) {
      const bld = generateProceduralBuilding3d(baseCand, { style: 'luxury_villa' });
      project3dToViewport(bld.meshes, {
        azimuth: 45,
        elevation: 30,
        zoom: 1.0,
        panX: 0,
        panY: 0,
        width: 800,
        height: 600,
        solarTime: 14.5,
        facing: 'North'
      });
    }
    const elapsed = Date.now() - t0;
    const perRunMs = elapsed / 10;
    console.log(`       Benchmark: 10 iterations of full 3D building generation + tri-planar daylight shading executed in ${elapsed}ms (${perRunMs.toFixed(2)}ms/run)`);
    assert(perRunMs < 25.0, 'Test G.9: High performance - Full procedural material & lighting pass executes in < 25ms', `${perRunMs.toFixed(2)}ms < 25ms`);
  }

  console.log('\n===============================================================');
  console.log(`S3-T04 PROFESSIONAL MATERIALS & LIGHTING SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    throw new Error(`S3-T04 Test Suite failed with ${failed} failures.`);
  }

  return { passed, failed };
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  runProfessionalMaterialsAndLightingTests();
}
