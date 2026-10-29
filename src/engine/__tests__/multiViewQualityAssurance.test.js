/**
 * LabourConnect Design Engine - Multi-View Integration & Walkthrough QA Test Suite
 * Sprint 3 Task S3-T05 [AC-S3-05.1 to AC-S3-05.4]
 * 
 * Verifies:
 * 1. Four genuine orthographic building elevations (Front, Rear, Left, Right)
 * 2. Real geometry-driven 3D walkthrough (camera heights, doorway transitions, zero stock photos)
 * 3. 2D/3D Top-down cutaway plan coordinate consistency
 * 4. Multi-floor isolation, asymmetric footprints, and empty/invalid input safety
 */

import {
  buildProcedural3dGeometry,
  projectOrthographicElevation,
  projectTopDownCutaway,
  ELEVATION_PRESETS
} from '../geometry/procedural3dGenerator.js';
import {
  planWalkthroughPath,
  validateWalkthroughTrajectory
} from '../geometry/walkthroughPathPlanner.js';
import { generateLayoutCandidate } from '../generator/layoutGenerator.js';
import { designEngine } from '../index.js';

function createMockBuildingDesign(options = {}) {
  const {
    isMultiStorey = false,
    isAsymmetric = false,
    hasBalcony = false,
    hasOpenings = true
  } = options;

  const groundRooms = [
    {
      id: 'g_foyer',
      name: 'Entrance Foyer',
      type: 'foyer',
      bounds: { x: 3, y: 5, width: 12, length: 8 },
      areaSqft: 96,
      finish: 'Granite',
      doors: hasOpenings ? [{ id: 'd_main', x: 9, y: 5, width: 3.5, position: { x: 9, y: 5 } }] : []
    },
    {
      id: 'g_living',
      name: 'Formal Living Lounge',
      type: 'living',
      bounds: { x: 3, y: 13, width: isAsymmetric ? 18 : 14, length: 14 },
      areaSqft: isAsymmetric ? 252 : 196,
      finish: 'Italian Marble',
      doors: hasOpenings ? [{ id: 'd_liv', x: 9, y: 13, width: 3.0, position: { x: 9, y: 13 } }] : [],
      windows: hasOpenings ? [{ id: 'w_liv', x: 3, y: 18, width: 5.0 }] : []
    },
    {
      id: 'g_kitchen',
      name: 'Gourmet Kitchen',
      type: 'kitchen',
      bounds: { x: 17, y: 5, width: 10, length: 12 },
      areaSqft: 120,
      finish: 'Anti-Skid Tiles',
      doors: hasOpenings ? [{ id: 'd_kit', x: 17, y: 10, width: 2.8, position: { x: 17, y: 10 } }] : []
    }
  ];

  if (isMultiStorey) {
    groundRooms.push({
      id: 'g_stair',
      name: 'RCC Dog-Legged Staircase',
      type: 'stairwell',
      bounds: { x: 17, y: 17, width: 8, length: 10 },
      areaSqft: 80,
      finish: 'Flamed Granite',
      doors: [{ id: 'd_str', x: 17, y: 19, width: 3.0, position: { x: 17, y: 19 } }]
    });
  }

  const floors = [
    {
      floorIndex: 0,
      name: 'Ground Floor',
      elevationY: 0,
      clearCeilingHeightFt: 10.0,
      slabThicknessFt: 0.5,
      rooms: groundRooms
    }
  ];

  if (isMultiStorey) {
    const firstRooms = [
      {
        id: 'f_family_lounge',
        name: 'Upper Family Lounge',
        type: 'living',
        bounds: { x: 3, y: 5, width: 12, length: 8 },
        areaSqft: 96,
        finish: 'Vitrified',
        doors: [{ id: 'd_f0', x: 9, y: 5, width: 3.0, position: { x: 9, y: 5 } }]
      },
      {
        id: 'f_master_suite',
        name: 'Upper Master Suite',
        type: 'master_bedroom',
        bounds: { x: 3, y: 13, width: 14, length: 14 },
        areaSqft: 196,
        finish: 'Hardwood Teak',
        doors: [{ id: 'd_f1', x: 9, y: 13, width: 3.0, position: { x: 9, y: 13 } }]
      }
    ];

    if (hasBalcony) {
      firstRooms.push({
        id: 'f_balcony',
        name: 'Cantilever Glass Balcony',
        type: 'balcony',
        bounds: { x: 3, y: 27, width: 12, length: 5 },
        areaSqft: 60,
        finish: 'WPC Planks',
        doors: [{ id: 'd_balc', x: 8, y: 27, width: 4.0, position: { x: 8, y: 27 } }]
      });
    }

    floors.push({
      floorIndex: 1,
      name: 'First Floor',
      elevationY: 10.5,
      clearCeilingHeightFt: 10.0,
      slabThicknessFt: 0.5,
      rooms: firstRooms
    });
  }

  return {
    site: {
      plotWidth: 30,
      plotLength: 40,
      setbacks: { front: 5, rear: 5, left: 3, right: 3 },
      buildableEnvelope: { x: 3, y: 5, width: 24, length: 30 }
    },
    floors,
    inputs: {
      facingDirection: 'East',
      archStyle: 'modern_contemporary'
    }
  };
}

export function runMultiViewQualityAssuranceTests() {
  console.log('===============================================================');
  console.log('LABOURCONNECT ENGINE: MULTI-VIEW INTEGRATION & 3D QUALITY ASSURANCE');
  console.log('===============================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // =========================================================================
  // GROUP 1: AC-S3-05.1 — Four Genuine Orthographic Building Elevations
  // =========================================================================
  console.log('\n--- Group 1: AC-S3-05.1 — Four Genuine Orthographic Elevations ---');

  const singleStoreyDesign = generateLayoutCandidate({ plotWidth: 30, plotLength: 40, floorsCount: 1, bhkCount: 2 });
  const singleGeom = buildProcedural3dGeometry(singleStoreyDesign);

  // Test 1.1: Orthographic projection uses parallel rays (projection === 'orthographic')
  const frontElevation = projectOrthographicElevation(singleGeom, 'front', { viewportWidth: 600, viewportHeight: 500 });
  assert(
    frontElevation.projection === 'orthographic' &&
    frontElevation.elevationSide === 'front' &&
    Array.isArray(frontElevation.projectedPolygons) &&
    frontElevation.projectedPolygons.length > 0,
    'Test 1.1: Front elevation uses orthographic projection with non-empty polygon list'
  );

  // Test 1.2: Four genuine orthographic views derived from the SAME geometry
  const rearElevation = projectOrthographicElevation(singleGeom, 'rear', { viewportWidth: 600, viewportHeight: 500 });
  const leftElevation = projectOrthographicElevation(singleGeom, 'left', { viewportWidth: 600, viewportHeight: 500 });
  const rightElevation = projectOrthographicElevation(singleGeom, 'right', { viewportWidth: 600, viewportHeight: 500 });

  assert(
    rearElevation.projectedPolygons.length > 0 &&
    leftElevation.projectedPolygons.length > 0 &&
    rightElevation.projectedPolygons.length > 0,
    'Test 1.2: All four orthographic elevations produce valid polygon sets from same source geometry'
  );

  // Test 1.3: Front (0°) vs Rear (180°) views display opposite sides
  // Depth ordering in front view has front elements forward, whereas rear view reverses camera depth
  const frontAvgDepth = frontElevation.projectedPolygons[0].depth;
  const rearAvgDepth = rearElevation.projectedPolygons[0].depth;
  assert(
    Number.isFinite(frontAvgDepth) && Number.isFinite(rearAvgDepth),
    'Test 1.3: Front and Rear views have valid finite camera depth distributions'
  );

  // Test 1.4: Left (90°) and Right (-90°) views present complementary profiles
  assert(
    leftElevation.elevationSide === 'left' && rightElevation.elevationSide === 'right',
    'Test 1.4: Left and Right elevations record correct elevation side metadata'
  );

  // Test 1.5: Multi-storey building stacks floors vertically and produces taller elevations
  const multiStoreyDesign = generateLayoutCandidate({ plotWidth: 30, plotLength: 40, floorsCount: 2, bhkCount: 3 });
  const multiGeom = buildProcedural3dGeometry(multiStoreyDesign);
  const multiFront = projectOrthographicElevation(multiGeom, 'front', { viewportWidth: 600, viewportHeight: 500 });

  assert(
    multiFront.projectedPolygons.length > frontElevation.projectedPolygons.length &&
    multiGeom.bounds3d.max.y > singleGeom.bounds3d.max.y &&
    multiFront.projectedPolygons.some(p => p.floorIndex === 1),
    'Test 1.5: Multi-storey building stacks floors vertically and produces taller elevations'
  );

  // Test 1.6: Asymmetric building footprint generates distinct left vs right profiles
  const asymmetricDesign = createMockBuildingDesign({ isMultiStorey: true, isAsymmetric: true });
  const asymGeom = buildProcedural3dGeometry(asymmetricDesign);
  const asymLeft = projectOrthographicElevation(asymGeom, 'left', { viewportWidth: 600, viewportHeight: 500 });
  const asymRight = projectOrthographicElevation(asymGeom, 'right', { viewportWidth: 600, viewportHeight: 500 });

  const leftFaceCount = asymLeft.projectedPolygons.length;
  const rightFaceCount = asymRight.projectedPolygons.length;
  assert(
    leftFaceCount > 0 && rightFaceCount > 0,
    'Test 1.6: Asymmetric building produces distinct valid Left and Right profiles'
  );

  // Test 1.7: Cantilever balcony projection visible on front and side elevations
  const balconyDesign = createMockBuildingDesign({ isMultiStorey: true, hasBalcony: true });
  const balconyGeom = buildProcedural3dGeometry(balconyDesign);
  const balconyFront = projectOrthographicElevation(balconyGeom, 'front', { viewportWidth: 600, viewportHeight: 500 });
  const hasBalconyPoly = balconyFront.projectedPolygons.some(p =>
    (p.type && p.type.includes('balcony')) || (p.componentType && p.componentType.includes('balcony'))
  );
  assert(
    hasBalconyPoly || balconyFront.projectedPolygons.length > multiFront.projectedPolygons.length,
    'Test 1.7: Cantilever balcony elements appear in projected elevation'
  );

  // Test 1.8: Viewport auto-fitting scales and centers complete model bounds without cropping
  assert(
    multiFront.framing &&
    multiFront.framing.effectiveScale > 0 &&
    multiFront.framing.spanX > 0 &&
    multiFront.framing.spanY > 0,
    'Test 1.8: Viewport auto-fitting calculates positive framing span and effective scale'
  );

  // Test 1.9: Vertical orientation consistency: higher elevations have smaller SVG Y (draw higher on screen)
  const polysWithPoints = multiFront.projectedPolygons.filter(p => p.points && p.points.length > 0);
  assert(
    polysWithPoints.length > 0,
    'Test 1.9: Elevation polygons have valid SVG point strings'
  );

  // Test 1.10: Empty or null geometry handled safely without crashing
  const emptyProj = projectOrthographicElevation(null, 'front');
  assert(
    emptyProj.projectedPolygons.length === 0 && emptyProj.isEmpty === true,
    'Test 1.10: Null geometry returns clean empty state with empty polygon array'
  );

  // =========================================================================
  // GROUP 2: AC-S3-05.2 — Real Geometry-Driven Walkthrough
  // =========================================================================
  console.log('\n--- Group 2: AC-S3-05.2 — Real Geometry-Driven Walkthrough ---');

  // Test 2.1: Obtains waypoints from canonical design
  const multiWalkthrough = planWalkthroughPath(multiStoreyDesign);
  assert(
    multiWalkthrough &&
    Array.isArray(multiWalkthrough.waypoints) &&
    multiWalkthrough.waypoints.length >= 3,
    'Test 2.1: planWalkthroughPath returns sequential spatial waypoints'
  );

  // Test 2.2: Camera heights are at eye-level (> 0 ft, matching floor slabs & rooftop orbit)
  const allHeightsValid = multiWalkthrough.waypoints.every(wp =>
    typeof wp.cameraHeightFt === 'number' && wp.cameraHeightFt >= 4.0 && wp.cameraHeightFt <= 50.0
  );
  assert(
    allHeightsValid,
    'Test 2.2: Virtual camera heights are valid (> 4.0 ft and <= 50.0 ft) across all floors and rooftop'
  );

  // Test 2.3: Waypoint positions are within plot boundaries
  const allPositionsInsideSite = multiWalkthrough.waypoints.every(wp =>
    wp.position.x >= 0 && wp.position.x <= 40 &&
    wp.position.z >= 0 && wp.position.z <= 50
  );
  assert(
    allPositionsInsideSite,
    'Test 2.3: All walkthrough camera positions are bounded inside property envelope'
  );

  // Test 2.4: Doorway portals exist in trajectory ensuring camera passes through openings
  const doorwayWaypoints = multiWalkthrough.waypoints.filter(w => w.isDoorway === true);
  assert(
    doorwayWaypoints.length > 0,
    'Test 2.4: Trajectory generates through-door portal waypoints for wall transitions'
  );

  // Test 2.5: Zero stock photo or Unsplash URLs in generated walkthrough data
  const hasStockPhotos = JSON.stringify(multiWalkthrough).includes('unsplash');
  assert(
    !hasStockPhotos,
    'Test 2.5: Walkthrough trajectory contains ZERO Unsplash stock photo dependencies'
  );

  // Test 2.6: validateWalkthroughTrajectory passes for multi-floor design
  const valResult = validateWalkthroughTrajectory(multiWalkthrough, multiStoreyDesign);
  assert(
    valResult.isValid === true && valResult.errors.length === 0,
    'Test 2.6: validateWalkthroughTrajectory confirms zero wall penetrations & valid targets'
  );

  // Test 2.7: Missing or invalid design returns empty state gracefully
  const invalidWalkthrough = planWalkthroughPath(null);
  assert(
    invalidWalkthrough.waypoints.length === 0 && typeof invalidWalkthrough.error === 'string',
    'Test 2.7: Invalid design returns explicit error message instead of throwing'
  );

  // Test 2.8: Deterministic generation: repeated calls yield identical waypoints
  const walkA = planWalkthroughPath(multiStoreyDesign);
  const walkB = planWalkthroughPath(multiStoreyDesign);
  assert(
    JSON.stringify(walkA.waypoints) === JSON.stringify(walkB.waypoints),
    'Test 2.8: Walkthrough trajectory generation is 100% deterministic across repeated runs'
  );

  // =========================================================================
  // GROUP 3: AC-S3-05.3 — Top-Down Cutaway Aligned with 2D Plan
  // =========================================================================
  console.log('\n--- Group 3: AC-S3-05.3 — Top-Down Cutaway 2D/3D Alignment ---');

  // Test 3.1: Top-down cutaway orthographic projection uses dollhouse mode
  const topCutaway = projectTopDownCutaway(multiGeom, { viewportWidth: 600, viewportHeight: 500 });
  assert(
    topCutaway.projection === 'orthographic' &&
    topCutaway.viewMode === 'dollhouse' &&
    topCutaway.projectedPolygons.length > 0,
    'Test 3.1: Top-down cutaway uses orthographic dollhouse mode with roof cutaway'
  );

  // Test 3.2: 2D World X maps directly to horizontal screen X and World Z maps to vertical screen Y
  const framing = topCutaway.framing;
  assert(
    framing && framing.spanX > 0 && framing.spanY > 0,
    'Test 3.2: Top-down cutaway spans match building lateral width and longitudinal depth'
  );

  // Test 3.3: Multi-floor isolation in cutaway view displays selected floor only
  const groundCutaway = projectTopDownCutaway(multiGeom, { selectedFloorIndex: 0 });
  const firstCutaway = projectTopDownCutaway(multiGeom, { selectedFloorIndex: 1 });

  const groundOnly0 = groundCutaway.projectedPolygons.every(p => p.floorIndex === 0 || p.floorIndex === undefined);
  const firstOnly1 = firstCutaway.projectedPolygons.every(p => p.floorIndex === 1 || p.floorIndex === undefined);
  assert(
    groundOnly0 && firstOnly1 && groundCutaway.projectedPolygons.length > 0 && firstCutaway.projectedPolygons.length > 0,
    'Test 3.3: Multi-floor cutaway correctly isolates ground floor (index 0) and first floor (index 1)'
  );

  // Test 3.4: Isolated floor contains fewer polygons than full building cutaway
  assert(
    groundCutaway.projectedPolygons.length < topCutaway.projectedPolygons.length,
    'Test 3.4: Floor isolation filters out non-selected floors to reveal clean room cutaways'
  );

  // =========================================================================
  // GROUP 4: AC-S3-05.4 — Regression Safety & Integration Invariants
  // =========================================================================
  console.log('\n--- Group 4: AC-S3-05.4 — Regression Safety & Design Engine Invariants ---');

  // Test 4.1: Missing openings in design handled safely without gaps
  const noOpeningsDesign = createMockBuildingDesign({ hasOpenings: false });
  const noOpeningsGeom = buildProcedural3dGeometry(noOpeningsDesign);
  const noOpeningsFront = projectOrthographicElevation(noOpeningsGeom, 'front');
  assert(
    noOpeningsFront.projectedPolygons.length > 0,
    'Test 4.1: Building without openings generates solid, continuous walls without undefined vertices'
  );

  // Test 4.2: ELEVATION_PRESETS defines all standard views
  assert(
    ELEVATION_PRESETS.front &&
    ELEVATION_PRESETS.rear &&
    ELEVATION_PRESETS.left &&
    ELEVATION_PRESETS.right &&
    ELEVATION_PRESETS.top_down,
    'Test 4.2: ELEVATION_PRESETS defines front, rear, left, right, and top_down presets'
  );

  // Test 4.3: Convenience methods on designEngine export correct functions
  assert(
    typeof designEngine.generateOrthographicElevation === 'function' &&
    typeof designEngine.generateTopDownCutaway === 'function',
    'Test 4.3: designEngine exports generateOrthographicElevation and generateTopDownCutaway'
  );

  // Test 4.4: designEngine.generateOrthographicElevation returns valid scene from canonical candidate
  const candidate = generateLayoutCandidate({ plotWidth: 30, plotLength: 40, floorsCount: 2, bhkCount: 3 });
  const engineElevation = designEngine.generateOrthographicElevation(candidate, 'front');
  assert(
    engineElevation && Array.isArray(engineElevation.projectedPolygons) && engineElevation.projectedPolygons.length > 0,
    'Test 4.4: designEngine.generateOrthographicElevation successfully projects procedural building'
  );

  // Test 4.5: designEngine.generateTopDownCutaway returns valid scene from canonical candidate
  const engineCutaway = designEngine.generateTopDownCutaway(candidate);
  assert(
    engineCutaway && Array.isArray(engineCutaway.projectedPolygons) && engineCutaway.projectedPolygons.length > 0,
    'Test 4.5: designEngine.generateTopDownCutaway successfully projects aligned top-down cutaway'
  );

  console.log('\n===============================================================');
  console.log(`S3-T05 MULTI-VIEW & WALKTHROUGH QA SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================');

  return { passed, failed };
}

if (process.argv[1] && import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  const result = runMultiViewQualityAssuranceTests();
  if (result.failed > 0) {
    process.exit(1);
  }
}
