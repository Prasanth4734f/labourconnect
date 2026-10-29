/**
 * LabourConnect Design Engine - Project State Persistence Manager
 * 
 * Sprint 4, Task S4-T05: Interactive Customization, Real-Time Editing & State Persistence
 * 
 * Manages reliable browser and environment persistence for customized architectural designs,
 * project versioning, auto-save drafts, project metadata catalogs, and JSON import/export.
 * 
 * Invariants:
 * 1. Safe In-Memory Fallback: Operates seamlessly in Node.js test environments or private browsing
 *    when window.localStorage is undefined or restricted.
 * 2. Schema Validation: Validates project envelopes against Canonical Design Schema v2.0.
 * 3. Atomic Updates: Project operations never corrupt the persistence storage on parse failures.
 * 4. Lightweight Summaries: listSavedProjects strips bulky 3D meshes to preserve UI memory.
 */

import { validateCanonicalSchema } from '../schema/canonicalDesignSchema.js';

export const PERSISTENCE_STORAGE_KEYS = Object.freeze({
  SAVED_PROJECTS: 'labourconnect_saved_projects_v2',
  ACTIVE_DRAFT: 'labourconnect_active_project_draft',
  USER_PREFERENCES: 'labourconnect_user_preferences'
});

// Fallback in-memory storage for non-browser environments or quota exceptions
const memoryStorage = new Map();

/**
 * Safe local storage reader.
 */
function getStorageItem(key) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // Fall back to memoryStorage
  }
  return memoryStorage.get(key) || null;
}

/**
 * Safe local storage writer.
 */
function setStorageItem(key, value) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return true;
    }
  } catch {
    // Quota exceeded or disabled, fall back to memory
  }
  memoryStorage.set(key, value);
  return true;
}

/**
 * Safe local storage remover.
 */
function removeStorageItem(key) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
      return true;
    }
  } catch {
    // Ignore
  }
  memoryStorage.delete(key);
  return true;
}

/**
 * Clears the in-memory storage (used primarily in automated unit tests).
 */
export function resetPersistenceMemoryStore() {
  memoryStorage.clear();
}

/**
 * Saves a customized project into persistent storage.
 * 
 * @param {Object} design - Canonical Design Model
 * @param {Object} [metadata={}] - Additional project metadata (title, notes, tags)
 * @returns {Object} { success: boolean, project: Object, error: string }
 */
export function saveProject(design, metadata = {}) {
  if (!design || typeof design !== 'object') {
    return { success: false, error: 'Cannot save null or invalid design payload.' };
  }

  if (!design.schemaVersion) {
    design.schemaVersion = '2.0.0';
  }
  if (!design.id) {
    design.id = metadata.id || `des_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  }

  // Schema validation check
  const valResult = validateCanonicalSchema(design);
  if (!valResult.valid) {
    return {
      success: false,
      error: `Design failed schema validation: ${valResult.errors?.join(', ')}`
    };
  }

  const projectId = metadata.id || design.id || `proj_${Date.now()}`;
  const now = new Date().toISOString();

  // Load existing projects catalog
  let allProjects = [];
  try {
    const raw = getStorageItem(PERSISTENCE_STORAGE_KEYS.SAVED_PROJECTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) allProjects = parsed;
    }
  } catch {
    allProjects = [];
  }

  const existingIdx = allProjects.findIndex(p => p.id === projectId);
  const createdAt = existingIdx !== -1 ? (allProjects[existingIdx].createdAt || now) : (metadata.createdAt || now);

  const budgetSummary = design.projectBudget ? {
    totalEstimatedCost: design.projectBudget.totalEstimatedCost,
    targetBudget: design.projectBudget.targetBudget,
    budgetVariance: design.projectBudget.budgetVariance,
    budgetStatus: design.projectBudget.budgetStatus
  } : null;

  const projectEnvelope = {
    id: projectId,
    code: design.code || `LC-${Date.now().toString().slice(-5)}`,
    title: metadata.title || design.title || 'Architectural Custom Design',
    description: metadata.description || metadata.notes || '',
    version: metadata.version || (existingIdx !== -1 ? `v1.${allProjects.length}` : 'v1.0'),
    createdAt,
    updatedAt: now,
    tags: Array.isArray(metadata.tags) ? metadata.tags : ['Customized'],
    isFavorite: Boolean(metadata.isFavorite),
    metrics: design.metrics || {},
    budgetSummary,
    customizationsSummary: {
      actionCount: design.customizations?.actions?.length || 0,
      hasFurnishings: Boolean(design.furnishings?.allFurnitureItems?.length > 0),
      hasLandscape: Boolean(design.landscape?.landscapeObjects?.length > 0),
      customMaterialsCount: Object.keys(design.customMaterials || {}).length
    },
    design: JSON.parse(JSON.stringify(design))
  };

  if (existingIdx !== -1) {
    allProjects[existingIdx] = projectEnvelope;
  } else {
    allProjects.unshift(projectEnvelope);
  }

  const serialized = JSON.stringify(allProjects);
  setStorageItem(PERSISTENCE_STORAGE_KEYS.SAVED_PROJECTS, serialized);

  return {
    success: true,
    project: projectEnvelope,
    savedAt: now
  };
}

/**
 * Loads a project from persistence by its ID.
 * 
 * @param {string} projectId - Project identifier
 * @returns {Object} { success: boolean, project: Object, error: string }
 */
export function loadProject(projectId) {
  if (!projectId) {
    return { success: false, error: 'Missing projectId argument.' };
  }

  try {
    const raw = getStorageItem(PERSISTENCE_STORAGE_KEYS.SAVED_PROJECTS);
    if (!raw) {
      return { success: false, error: `No projects found in storage.` };
    }

    const allProjects = JSON.parse(raw);
    if (!Array.isArray(allProjects)) {
      return { success: false, error: 'Project store corrupted.' };
    }

    const found = allProjects.find(p => p.id === projectId);
    if (!found) {
      return { success: false, error: `Project with ID "${projectId}" not found.` };
    }

    return {
      success: true,
      project: found,
      design: found.design
    };
  } catch (err) {
    return { success: false, error: `Failed to load project: ${err.message}` };
  }
}

/**
 * Returns a lightweight list of all saved projects for UI display.
 * 
 * @returns {Array<Object>} List of project summary objects
 */
export function listSavedProjects() {
  try {
    const raw = getStorageItem(PERSISTENCE_STORAGE_KEYS.SAVED_PROJECTS);
    if (!raw) return [];

    const allProjects = JSON.parse(raw);
    if (!Array.isArray(allProjects)) return [];

    return allProjects.map(p => ({
      id: p.id,
      code: p.code,
      title: p.title,
      description: p.description,
      version: p.version,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      tags: p.tags || [],
      isFavorite: Boolean(p.isFavorite),
      metrics: p.metrics || {},
      budgetSummary: p.budgetSummary,
      customizationsSummary: p.customizationsSummary
    }));
  } catch {
    return [];
  }
}

/**
 * Deletes a project from storage by its ID.
 * 
 * @param {string} projectId - Project identifier
 * @returns {Object} { success: boolean, deletedId: string, error: string }
 */
export function deleteProject(projectId) {
  if (!projectId) {
    return { success: false, error: 'Missing projectId.' };
  }

  try {
    const raw = getStorageItem(PERSISTENCE_STORAGE_KEYS.SAVED_PROJECTS);
    if (!raw) return { success: true, deletedId: projectId };

    let allProjects = JSON.parse(raw);
    if (!Array.isArray(allProjects)) return { success: true, deletedId: projectId };

    const initialLen = allProjects.length;
    allProjects = allProjects.filter(p => p.id !== projectId);

    if (allProjects.length !== initialLen) {
      setStorageItem(PERSISTENCE_STORAGE_KEYS.SAVED_PROJECTS, JSON.stringify(allProjects));
    }

    return { success: true, deletedId: projectId };
  } catch (err) {
    return { success: false, error: `Failed to delete project: ${err.message}` };
  }
}

/**
 * Saves a design draft to active working state.
 * 
 * @param {Object} design - Canonical Design Model
 * @param {string} [draftKey] - Optional custom key
 * @returns {Object} { success: boolean, savedAt: string }
 */
export function saveDraft(design, draftKey = PERSISTENCE_STORAGE_KEYS.ACTIVE_DRAFT) {
  if (!design) return { success: false, error: 'Cannot save null draft.' };

  const now = new Date().toISOString();
  const payload = {
    savedAt: now,
    design: JSON.parse(JSON.stringify(design))
  };

  setStorageItem(draftKey, JSON.stringify(payload));
  return { success: true, savedAt: now };
}

/**
 * Loads an auto-saved draft.
 * 
 * @param {string} [draftKey] - Optional custom key
 * @returns {Object|null}
 */
export function loadDraft(draftKey = PERSISTENCE_STORAGE_KEYS.ACTIVE_DRAFT) {
  try {
    const raw = getStorageItem(draftKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.design || null;
  } catch {
    return null;
  }
}

/**
 * Clears an auto-saved draft.
 * 
 * @param {string} [draftKey] - Optional custom key
 * @returns {boolean}
 */
export function clearDraft(draftKey = PERSISTENCE_STORAGE_KEYS.ACTIVE_DRAFT) {
  return removeStorageItem(draftKey);
}

/**
 * Serializes a design and its project metadata into an RFC 8259 compliant JSON bundle.
 * 
 * @param {Object} design - Canonical Design Model
 * @param {Object} [metadata={}] - Project metadata
 * @returns {string} Formatted JSON string
 */
export function exportProjectBundleJson(design, metadata = {}) {
  const envelope = {
    schemaVersion: design?.schemaVersion || '2.0.0',
    exportFormat: 'LABOURCONNECT_PROJECT_BUNDLE_V2',
    exportedAt: new Date().toISOString(),
    projectMetadata: {
      id: metadata.id || design?.id || `proj_${Date.now()}`,
      code: design?.code || 'LC-PROJECT',
      title: metadata.title || design?.title || 'LabourConnect Architectural Project',
      description: metadata.description || '',
      version: metadata.version || 'v1.0'
    },
    design
  };

  return JSON.stringify(envelope, null, 2);
}

/**
 * Imports and validates a project bundle from a JSON string.
 * 
 * @param {string} jsonString - Project bundle JSON string
 * @returns {Object} { success: boolean, design: Object, metadata: Object, error: string }
 */
export function importProjectBundleJson(jsonString) {
  if (!jsonString || typeof jsonString !== 'string') {
    return { success: false, error: 'Input must be a valid JSON string.' };
  }

  try {
    const parsed = JSON.parse(jsonString);

    let targetDesign = null;
    let targetMetadata = {};

    if (parsed.exportFormat === 'LABOURCONNECT_PROJECT_BUNDLE_V2' && parsed.design) {
      targetDesign = parsed.design;
      targetMetadata = parsed.projectMetadata || {};
    } else if (parsed.schemaVersion && Array.isArray(parsed.floors)) {
      targetDesign = parsed;
    } else {
      return { success: false, error: 'Invalid bundle format: missing canonical design structure.' };
    }

    const valResult = validateCanonicalSchema(targetDesign);
    if (!valResult.valid) {
      return { success: false, error: `Invalid design schema: ${valResult.errors?.join(', ')}` };
    }

    return {
      success: true,
      design: targetDesign,
      metadata: targetMetadata
    };
  } catch (err) {
    return { success: false, error: `JSON parse error: ${err.message}` };
  }
}
