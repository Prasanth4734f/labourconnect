/**
 * LabourConnect Design Engine - Automated Test Suite #26
 * 
 * S4-T05: Interactive Customization, Real-Time Editing & State Persistence
 * 
 * Verifies object picking, raycasting, spatial transformations (move, rotate, add, remove),
 * material replacements, command-pattern undo/redo sessions, real-time budget synchronization,
 * project persistence, auto-save drafts, and JSON import/export.
 */

import { generateLayoutCandidate } from '../generator/layoutGenerator.js';
import {
  isPointInPolygon,
  pickObjectAtScreenCoordinates,
  ensureCustomizableDesign,
  findCustomizableObjectById,
  listCustomizableObjects,
  moveObject,
  rotateObject,
  removeObject,
  addCustomObject,
  changeObjectMaterial,
  changeRoomFinish,
  changeExteriorFacadeMaterial,
  createCustomizationSession,
  applySessionCommand,
  undoSession,
  redoSession,
  recalculateCustomizedDesign,
  CUSTOMIZATION_ACTION_TYPES,
  OBJECT_CATEGORIES
} from '../customization/interactiveCustomizationEngine.js';
import {
  saveProject,
  loadProject,
  listSavedProjects,
  deleteProject,
  saveDraft,
  loadDraft,
  clearDraft,
  exportProjectBundleJson,
  importProjectBundleJson,
  resetPersistenceMemoryStore
} from '../customization/projectPersistenceManager.js';
import { exportDesignArtifact, EXPORT_FORMATS } from '../export/exportPipelineOrchestrator.js';
import { designEngine } from '../index.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    passedTests++;
    console.log(`✅ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`❌ FAIL: ${testName}`);
  }
}

export function runInteractiveCustomizationTests() {
  console.log('\n===============================================================');
  console.log('LABOURCONNECT ENGINE: INTERACTIVE CUSTOMIZATION & PERSISTENCE (S4-T05)');
  console.log('===============================================================\n');

  // Baseline Canonical Design for Testing
  const baselineDesign = generateLayoutCandidate({
    plotWidth: 40,
    plotLength: 60,
    floorsCount: 2,
    bhkCount: 3,
    hasBalcony: true,
    hasPooja: true,
    hasParking: true,
    homeBudgetInr: 4500000
  });

  // --- Group 1: Object Picking & Spatial Queries ---
  console.log('--- Group 1: Object Picking & Spatial Queries ---');

  // Test 1: isPointInPolygon inside/outside testing
  const quadPoly = [[0, 0], [10, 0], [10, 10], [0, 10]];
  assert(isPointInPolygon({ x: 5, y: 5 }, quadPoly) === true, 'Test 1: Raycast detects point inside 2D polygon');
  assert(isPointInPolygon({ x: 15, y: 5 }, quadPoly) === false, 'Test 2: Raycast correctly rejects point outside 2D polygon');

  // Test 3: pickObjectAtScreenCoordinates sorts by camera depth
  const mockPolygons = [
    { id: 'poly_bg', points: '0,0 20,0 20,20 0,20', depth: 10, type: 'wall' },
    { id: 'poly_fg', points: '5,5 15,5 15,15 5,15', depth: 25, isFurniture: true, mesh: { objectId: 'bed_master' } }
  ];
  const pickResult = pickObjectAtScreenCoordinates({ x: 10, y: 10 }, mockPolygons);
  assert(pickResult.hit === true && pickResult.objectId === 'bed_master', 'Test 3: Object picker returns closest foreground item based on depth');

  // Test 4: listCustomizableObjects returns all major categories
  const readyDesign = ensureCustomizableDesign(baselineDesign);
  const outliner = listCustomizableObjects(readyDesign);
  assert(
    Array.isArray(outliner.furniture) && outliner.furniture.length > 0 &&
    Array.isArray(outliner.landscape) && outliner.landscape.length > 0 &&
    Array.isArray(outliner.rooms) && outliner.rooms.length > 0,
    'Test 4: listCustomizableObjects compiles furniture, landscape, and rooms'
  );

  // Test 5: findCustomizableObjectById locates specific item
  const sampleFurnId = outliner.furniture[0].id;
  const foundItem = findCustomizableObjectById(readyDesign, sampleFurnId);
  assert(foundItem !== null && foundItem.category === OBJECT_CATEGORIES.FURNITURE, 'Test 5: findCustomizableObjectById locates furniture item');

  // --- Group 2: Spatial Translation (Move) & Boundary Clamping ---
  console.log('\n--- Group 2: Spatial Translation & Boundary Clamping ---');

  const furnToMove = outliner.furniture[0];
  const origX = furnToMove.position.x;
  const origZ = furnToMove.position.z;

  const moveRes = moveObject(readyDesign, furnToMove.id, 2.0, 1.5);
  assert(moveRes.success === true, 'Test 6: moveObject successfully translates furniture position');
  const movedItem = findCustomizableObjectById(moveRes.updatedDesign, furnToMove.id);
  assert(
    movedItem.object.position.x !== origX || movedItem.object.position.z !== origZ,
    'Test 7: Furniture object position is updated in design'
  );

  // Test 8: Extreme translation is safely clamped to room bounds
  const extremeMoveRes = moveObject(readyDesign, furnToMove.id, 500, 500);
  const clampedItem = findCustomizableObjectById(extremeMoveRes.updatedDesign, furnToMove.id);
  assert(clampedItem.object.position.x < 100 && clampedItem.object.position.z < 100, 'Test 8: Out-of-bounds move is strictly clamped within boundaries');

  // --- Group 3: Rotation Transformations ---
  console.log('\n--- Group 3: Rotation Transformations ---');

  const furnToRotate = outliner.furniture[1] || outliner.furniture[0];
  const origRot = furnToRotate.rotation || 0;
  const rotRes = rotateObject(readyDesign, furnToRotate.id, 90);
  assert(rotRes.success === true, 'Test 9: rotateObject executes successfully');
  const rotatedItem = findCustomizableObjectById(rotRes.updatedDesign, furnToRotate.id);
  assert(rotatedItem.object.rotation === (origRot + 90) % 360, 'Test 10: Object rotation angle increments accurately');

  // Test 11: 360-degree rotation returns to original angle
  const fullRotRes = rotateObject(rotRes.updatedDesign, furnToRotate.id, 270);
  const fullRotatedItem = findCustomizableObjectById(fullRotRes.updatedDesign, furnToRotate.id);
  assert(fullRotatedItem.object.rotation === origRot, 'Test 11: 360-degree rotation returns to original orientation');

  // --- Group 4: Catalog Item Addition & Removal ---
  console.log('\n--- Group 4: Catalog Item Addition & Removal ---');

  const initialFurnCount = readyDesign.furnishings.allFurnitureItems.length;
  const addRes = addCustomObject(readyDesign, 'king_bed', OBJECT_CATEGORIES.FURNITURE);
  assert(addRes.success === true && addRes.addedObject !== null, 'Test 12: addCustomObject adds new catalog furniture item');
  assert(
    addRes.updatedDesign.furnishings.allFurnitureItems.length === initialFurnCount + 1,
    'Test 13: Furnishings count increments upon item addition'
  );

  // Test 14: Remove item
  const removeRes = removeObject(addRes.updatedDesign, addRes.addedObject.id);
  assert(removeRes.success === true, 'Test 14: removeObject executes successfully');
  assert(
    removeRes.updatedDesign.furnishings.allFurnitureItems.length === initialFurnCount,
    'Test 15: Furnishings count decrements back upon item removal'
  );

  // Test 16: Add custom landscape tree
  const initialTreeCount = readyDesign.landscape.takeoff?.treesCount || 0;
  const addTreeRes = addCustomObject(readyDesign, 'tree_neem_shade', OBJECT_CATEGORIES.LANDSCAPE, { x: 8, z: 8 });
  assert(addTreeRes.success === true, 'Test 16: addCustomObject successfully adds outdoor tree');
  assert(
    (addTreeRes.updatedDesign.landscape.takeoff?.treesCount || 0) >= initialTreeCount + 1,
    'Test 17: Landscape takeoff tree count increments upon tree addition'
  );

  // --- Group 5: Material Swapping & Finishes ---
  console.log('\n--- Group 5: Material Swapping & Finishes ---');

  const matRes = changeObjectMaterial(readyDesign, furnToMove.id, 'wood_teak_matte');
  assert(matRes.success === true, 'Test 18: changeObjectMaterial applies custom material override');
  assert(
    matRes.updatedDesign.customMaterials[furnToMove.id] === 'wood_teak_matte',
    'Test 19: Material key is recorded in customMaterials registry'
  );

  const roomToFinish = readyDesign.floors[0].rooms[0];
  const roomFinRes = changeRoomFinish(readyDesign, roomToFinish.id, 'floor', 'tile_italian_marble');
  assert(roomFinRes.success === true, 'Test 20: changeRoomFinish updates room flooring finish');
  assert(
    roomFinRes.updatedDesign.customMaterials[`room_${roomToFinish.id}_floor`] === 'tile_italian_marble',
    'Test 21: Room floor material override is saved in registry'
  );

  const facadeRes = changeExteriorFacadeMaterial(readyDesign, 'plaster_luxury_travertine');
  assert(facadeRes.success === true, 'Test 22: changeExteriorFacadeMaterial updates building facade');
  assert(
    facadeRes.updatedDesign.customMaterials.exterior_facade === 'plaster_luxury_travertine',
    'Test 23: Exterior facade override is saved in registry'
  );

  // --- Group 6: Command-Pattern Undo / Redo Session ---
  console.log('\n--- Group 6: Command-Pattern Undo / Redo Session ---');

  const session = createCustomizationSession(readyDesign);
  assert(session.canUndo === false && session.canRedo === false, 'Test 24: New session initializes with empty undo/redo state');

  applySessionCommand(session, CUSTOMIZATION_ACTION_TYPES.MOVE_OBJECT, {
    objectId: furnToMove.id,
    deltaX: 1.0,
    deltaZ: 1.0
  });
  assert(session.canUndo === true && session.canRedo === false, 'Test 25: Applying action enables undo');

  // Test Undo
  const undoRes = undoSession(session);
  assert(undoRes.success === true, 'Test 26: undoSession successfully executes rollback');
  assert(session.canRedo === true, 'Test 27: Undoing an action enables redo');

  // Test Redo
  const redoRes = redoSession(session);
  assert(redoRes.success === true && session.canRedo === false, 'Test 28: redoSession successfully reapplies action');

  // --- Group 7: Real-Time Budget Recalculation ---
  console.log('\n--- Group 7: Real-Time Budget Recalculation ---');

  const baselineBudgetCost = recalculateCustomizedDesign(JSON.parse(JSON.stringify(readyDesign))).projectBudget?.totalEstimatedCost || 0;
  // Add multiple luxury furniture items
  let expandedDesign = addCustomObject(readyDesign, 'king_bed', OBJECT_CATEGORIES.FURNITURE).updatedDesign;
  expandedDesign = addCustomObject(expandedDesign, 'sofa_sectional_l', OBJECT_CATEGORIES.FURNITURE).updatedDesign;
  const synchronizedDesign = recalculateCustomizedDesign(expandedDesign);

  const newBudgetCost = synchronizedDesign.projectBudget?.totalEstimatedCost || 0;
  assert(newBudgetCost > baselineBudgetCost, 'Test 29: Adding furniture dynamically increases total project budget');
  assert(synchronizedDesign.boqEstimate.totalCostInr === newBudgetCost, 'Test 30: Canonical boqEstimate synchronizes with live project budget');

  // --- Group 8: Project State Persistence & JSON Import/Export ---
  console.log('\n--- Group 8: Project State Persistence & JSON Import/Export ---');

  resetPersistenceMemoryStore();

  const saveRes = saveProject(synchronizedDesign, {
    title: 'My Custom Lakefront Villa',
    notes: 'Extended master bedroom with teak furniture and palm garden'
  });
  assert(saveRes.success === true && saveRes.project?.id, 'Test 31: saveProject saves customized project with metadata');

  const loadRes = loadProject(saveRes.project.id);
  assert(loadRes.success === true && loadRes.project.title === 'My Custom Lakefront Villa', 'Test 32: loadProject retrieves saved project intact');

  const projectList = listSavedProjects();
  assert(Array.isArray(projectList) && projectList.length === 1, 'Test 33: listSavedProjects returns project catalog summary');

  // Auto-Save Draft
  const draftRes = saveDraft(synchronizedDesign);
  assert(draftRes.success === true, 'Test 34: saveDraft records active working draft');
  const loadedDraft = loadDraft();
  assert(loadedDraft !== null && loadedDraft.id === synchronizedDesign.id, 'Test 35: loadDraft successfully restores active draft');
  clearDraft();
  assert(loadDraft() === null, 'Test 36: clearDraft flushes active draft');

  // JSON Import & Export Bundle
  const jsonBundle = exportProjectBundleJson(synchronizedDesign, { title: 'Exported Lakefront Villa' });
  assert(typeof jsonBundle === 'string' && jsonBundle.includes('LABOURCONNECT_PROJECT_BUNDLE_V2'), 'Test 37: exportProjectBundleJson formats RFC 8259 bundle');

  const importRes = importProjectBundleJson(jsonBundle);
  assert(importRes.success === true && importRes.design !== null, 'Test 38: importProjectBundleJson parses and validates bundle schema');

  // Delete Project
  const delRes = deleteProject(saveRes.project.id);
  assert(delRes.success === true && listSavedProjects().length === 0, 'Test 39: deleteProject removes project from persistent catalog');

  // --- Group 9: Immutability & Export Pipeline Synchronization ---
  console.log('\n--- Group 9: Immutability & Export Pipeline Synchronization ---');

  const origInputClone = JSON.parse(JSON.stringify(baselineDesign));
  moveObject(baselineDesign, sampleFurnId, 5.0, 5.0);
  assert(
    (baselineDesign.site?.plotWidth || baselineDesign.plotWidth) === (origInputClone.site?.plotWidth || origInputClone.plotWidth) &&
    baselineDesign.floors.length === origInputClone.floors.length,
    'Test 40: Customization operations preserve original input design immutability'
  );

  // Test DXF export on customized design
  const dxfArtifact = exportDesignArtifact(synchronizedDesign, EXPORT_FORMATS.DXF_ALL_FLOORS);
  assert(typeof dxfArtifact.content === 'string' && dxfArtifact.content.length > 0, 'Test 41: Export pipeline (CAD DXF) reflects customized design state');

  // Test designEngine method wrappers
  const engineSession = designEngine.createCustomizationSession(baselineDesign);
  assert(engineSession !== null && typeof engineSession.historyIndex === 'number', 'Test 42: designEngine.createCustomizationSession method accessible');

  console.log('\n===============================================================');
  console.log(`CUSTOMIZATION & PERSISTENCE TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('===============================================================\n');

  if (failedTests > 0) {
    throw new Error(`Test suite failed with ${failedTests} failing assertion(s).`);
  }

  return { passed: passedTests, failed: failedTests };
}

if (process.argv[1]?.includes('interactiveCustomizationPersistence.test.js')) {
  runInteractiveCustomizationTests();
}
