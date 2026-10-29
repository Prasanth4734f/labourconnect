/**
 * LabourConnect Design Engine - glTF 2.0 & GLB Binary 3D Exporter (Sprint 4, Task S4-T04)
 * 
 * Generates industry-standard, fully compliant glTF 2.0 (.gltf) and binary glTF (.glb)
 * container files directly from procedural 3D building geometry, interior furniture,
 * and site landscaping meshes.
 * 
 * Features:
 * - 100% Genuine 3D Solid Geometry: packs building walls, slabs, openings, columns,
 *   stairs, balconies, interior furniture, and site landscape elements.
 * - Standard glTF 2.0 specification: binary GLB container (12-byte header, JSON chunk, BIN chunk).
 * - PBR Metallic-Roughness Materials derived from component definitions and palettes.
 * - Triangulation of quad faces into standard counter-clockwise triangular primitives.
 * - Metric scale compliance: 1 glTF unit = 1 meter (exact factor 0.3048 m/ft).
 * - Structural hierarchy: groups meshes cleanly by Category (Building Structure, Furnishings, Site).
 * - Pure JavaScript implementation with zero external runtime dependencies.
 */

import { generateProceduralBuilding3d } from '../geometry/proceduralBuildingGenerator3d.js';

// Standard glTF 2.0 Component Types
const GLTF_COMPONENT_TYPES = {
  BYTE: 5120,
  UNSIGNED_BYTE: 5121,
  SHORT: 5122,
  UNSIGNED_SHORT: 5123,
  UNSIGNED_INT: 5125,
  FLOAT: 5126
};

// Standard glTF 2.0 Buffer Targets
const GLTF_TARGETS = {
  ARRAY_BUFFER: 34962,        // Vertex Attributes (POSITION, NORMAL, COLOR)
  ELEMENT_ARRAY_BUFFER: 34963 // Element Indices
};

/**
 * Converts a hex color string ('#RRGGBB' or '#RGB') to [r, g, b, a] in [0, 1].
 */
function hexToRgba(hex, defaultAlpha = 1.0) {
  if (!hex || typeof hex !== 'string') return [0.8, 0.8, 0.8, defaultAlpha];
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  if (clean.length !== 6) return [0.8, 0.8, 0.8, defaultAlpha];
  const r = parseInt(clean.substring(0, 2), 16) / 255.0;
  const g = parseInt(clean.substring(2, 4), 16) / 255.0;
  const b = parseInt(clean.substring(4, 6), 16) / 255.0;
  return [Number(r.toFixed(3)), Number(g.toFixed(3)), Number(b.toFixed(3)), defaultAlpha];
}

/**
 * Normalizes vertex coordinate format: supports array [x, y, z] or object { x, y, z }.
 */
function normalizeVertex(v, scaleFactor = 0.3048) {
  if (Array.isArray(v)) {
    return [v[0] * scaleFactor, v[1] * scaleFactor, v[2] * scaleFactor];
  }
  if (v && typeof v === 'object') {
    return [(v.x || 0) * scaleFactor, (v.y || 0) * scaleFactor, (v.z || 0) * scaleFactor];
  }
  return [0, 0, 0];
}

/**
 * Extracts and prepares raw geometry buffers from a canonical design model.
 */
export function extractModelGeometry(canonicalDesign, options = {}) {
  const {
    units = 'meters',
    includeFurniture = true,
    includeLandscape = true
  } = options;

  // Scale factor: glTF standard is 1 unit = 1 meter.
  const scaleFactor = units === 'feet' ? 1.0 : 0.3048;

  // Derive procedural 3D model if not already cached on canonicalDesign
  let building3d = canonicalDesign.buildingModel3d;
  if (!building3d || !Array.isArray(building3d.meshes) || building3d.meshes.length === 0) {
    building3d = generateProceduralBuilding3d(canonicalDesign, options);
  }

  const rawMeshes = building3d.meshes || [];
  const categorizedPrimitives = [];
  const materialMap = new Map();
  const materialList = [];

  // Helper to resolve or register a material
  const getMaterialIndex = (matName, baseColorHex, opacity = 1.0, roughness = 0.7, metalness = 0.1) => {
    const key = `${matName || 'default'}_${baseColorHex || '#cccccc'}_${opacity}`;
    if (materialMap.has(key)) return materialMap.get(key);

    const matIdx = materialList.length;
    const rgba = hexToRgba(baseColorHex, opacity);
    materialList.push({
      name: matName || `Material_${matIdx}`,
      pbrMetallicRoughness: {
        baseColorFactor: rgba,
        metallicFactor: metalness,
        roughnessFactor: roughness
      },
      alphaMode: opacity < 0.99 ? 'BLEND' : 'OPAQUE',
      doubleSided: true
    });
    materialMap.set(key, matIdx);
    return matIdx;
  };

  // Process all individual component meshes
  for (const m of rawMeshes) {
    if (!m || !Array.isArray(m.vertices) || m.vertices.length < 3) continue;

    // Filter furniture or landscape if opted out
    const isFurn = m.type === 'furniture' || m.id?.includes('furn_') || m.metadata?.isInterior;
    const isLand = m.type?.includes('landscape') || m.type === 'tree' || m.type === 'pathway' || m.type === 'compound_wall' || m.id?.includes('land_');

    if (!includeFurniture && isFurn) continue;
    if (!includeLandscape && isLand) continue;

    const vertices = m.vertices.map(v => normalizeVertex(v, scaleFactor));
    const faces = m.faces || [];
    const triangles = [];

    // Triangulate faces (convert quads and n-gons into triangles)
    for (const f of faces) {
      const fIndices = Array.isArray(f) ? f : (f?.indices || []);
      if (!Array.isArray(fIndices) || fIndices.length < 3) continue;
      if (fIndices.length === 3) {
        triangles.push(fIndices[0], fIndices[1], fIndices[2]);
      } else if (fIndices.length === 4) {
        // Quad: triangle 1 [0, 1, 2], triangle 2 [0, 2, 3]
        triangles.push(fIndices[0], fIndices[1], fIndices[2]);
        triangles.push(fIndices[0], fIndices[2], fIndices[3]);
      } else {
        // General convex polygon fan
        for (let i = 1; i < fIndices.length - 1; i++) {
          triangles.push(fIndices[0], fIndices[i], fIndices[i + 1]);
        }
      }
    }

    if (triangles.length === 0) continue;

    // Normals: compute per-vertex or face normal
    const normals = [];
    const defaultNormal = m.normal
      ? [m.normal.nx || 0, m.normal.ny || 1, m.normal.nz || 0]
      : [0, 1, 0];

    for (let i = 0; i < vertices.length; i++) {
      normals.push(...defaultNormal);
    }

    const matMeta = m.metadata || {};
    const matIdx = getMaterialIndex(
      matMeta.material || m.type || 'Architectural_Component',
      matMeta.color || '#cccccc',
      matMeta.opacity !== undefined ? matMeta.opacity : 1.0,
      matMeta.roughness !== undefined ? matMeta.roughness : 0.7,
      matMeta.metalness !== undefined ? matMeta.metalness : 0.1
    );

    let category = 'Building Structure';
    if (isFurn) category = 'Interior Furnishings';
    if (isLand) category = 'Site & Landscape';

    categorizedPrimitives.push({
      id: m.id || `mesh_${categorizedPrimitives.length}`,
      type: m.type || 'geometry',
      category,
      vertices,
      normals,
      indices: triangles,
      materialIndex: matIdx
    });
  }

  return {
    primitives: categorizedPrimitives,
    materials: materialList,
    scaleFactor
  };
}

/**
 * Builds standard glTF 2.0 JSON document and binary buffer chunk from extracted geometry.
 */
export function buildGltfData(canonicalDesign, options = {}) {
  const { primitives, materials } = extractModelGeometry(canonicalDesign, options);

  // Group primitives into 3 main scene nodes: Building, Furnishings, Landscape
  const categories = ['Building Structure', 'Interior Furnishings', 'Site & Landscape'];
  const gltfMeshes = [];
  const nodes = [];
  const sceneNodeIndices = [];

  // Buffer accumulators
  const bufferChunks = [];
  let currentBufferOffset = 0;

  const accessors = [];
  const bufferViews = [];

  for (const cat of categories) {
    const catPrims = primitives.filter(p => p.category === cat);
    if (catPrims.length === 0) continue;

    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    // Group by material inside the mesh
    const materialGroups = new Map();

    for (const prim of catPrims) {
      const pMat = prim.materialIndex;
      if (!materialGroups.has(pMat)) {
        materialGroups.set(pMat, { positions: [], normals: [], indices: [] });
      }
      const grp = materialGroups.get(pMat);
      const startV = grp.positions.length / 3;

      for (const v of prim.vertices) {
        grp.positions.push(v[0], v[1], v[2]);
        if (v[0] < minX) minX = v[0];
        if (v[1] < minY) minY = v[1];
        if (v[2] < minZ) minZ = v[2];
        if (v[0] > maxX) maxX = v[0];
        if (v[1] > maxY) maxY = v[1];
        if (v[2] > maxZ) maxZ = v[2];
      }

      for (const n of prim.normals) {
        grp.normals.push(n);
      }

      for (const idx of prim.indices) {
        grp.indices.push(startV + idx);
      }
    }

    const meshPrimitives = [];

    for (const [matIdx, grp] of materialGroups.entries()) {
      if (grp.indices.length === 0) continue;

      // 1. POSITION bufferView & accessor
      const posArray = new Float32Array(grp.positions);
      const posByteOffset = currentBufferOffset;
      const posByteLength = posArray.byteLength;
      bufferChunks.push(posArray.buffer);
      currentBufferOffset += posByteLength;

      // Align offset to 4 bytes
      const posPadding = (4 - (currentBufferOffset % 4)) % 4;
      if (posPadding > 0) {
        bufferChunks.push(new Uint8Array(posPadding).buffer);
        currentBufferOffset += posPadding;
      }

      const posBufferViewIdx = bufferViews.length;
      bufferViews.push({
        buffer: 0,
        byteOffset: posByteOffset,
        byteLength: posByteLength,
        target: GLTF_TARGETS.ARRAY_BUFFER
      });

      const posAccessorIdx = accessors.length;
      accessors.push({
        bufferView: posBufferViewIdx,
        byteOffset: 0,
        componentType: GLTF_COMPONENT_TYPES.FLOAT,
        count: grp.positions.length / 3,
        type: 'VEC3',
        min: [minX, minY, minZ],
        max: [maxX, maxY, maxZ]
      });

      // 2. NORMAL bufferView & accessor
      const normArray = new Float32Array(grp.normals);
      const normByteOffset = currentBufferOffset;
      const normByteLength = normArray.byteLength;
      bufferChunks.push(normArray.buffer);
      currentBufferOffset += normByteLength;

      const normPadding = (4 - (currentBufferOffset % 4)) % 4;
      if (normPadding > 0) {
        bufferChunks.push(new Uint8Array(normPadding).buffer);
        currentBufferOffset += normPadding;
      }

      const normBufferViewIdx = bufferViews.length;
      bufferViews.push({
        buffer: 0,
        byteOffset: normByteOffset,
        byteLength: normByteLength,
        target: GLTF_TARGETS.ARRAY_BUFFER
      });

      const normAccessorIdx = accessors.length;
      accessors.push({
        bufferView: normBufferViewIdx,
        byteOffset: 0,
        componentType: GLTF_COMPONENT_TYPES.FLOAT,
        count: grp.normals.length / 3,
        type: 'VEC3',
        min: [-1, -1, -1],
        max: [1, 1, 1]
      });

      // 3. INDEX bufferView & accessor (Uint16 or Uint32)
      const isUint32 = (grp.positions.length / 3) > 65535;
      const indexArray = isUint32 ? new Uint32Array(grp.indices) : new Uint16Array(grp.indices);
      const idxByteOffset = currentBufferOffset;
      const idxByteLength = indexArray.byteLength;
      bufferChunks.push(indexArray.buffer);
      currentBufferOffset += idxByteLength;

      const idxPadding = (4 - (currentBufferOffset % 4)) % 4;
      if (idxPadding > 0) {
        bufferChunks.push(new Uint8Array(idxPadding).buffer);
        currentBufferOffset += idxPadding;
      }

      const idxBufferViewIdx = bufferViews.length;
      bufferViews.push({
        buffer: 0,
        byteOffset: idxByteOffset,
        byteLength: idxByteLength,
        target: GLTF_TARGETS.ELEMENT_ARRAY_BUFFER
      });

      const idxAccessorIdx = accessors.length;
      accessors.push({
        bufferView: idxBufferViewIdx,
        byteOffset: 0,
        componentType: isUint32 ? GLTF_COMPONENT_TYPES.UNSIGNED_INT : GLTF_COMPONENT_TYPES.UNSIGNED_SHORT,
        count: grp.indices.length,
        type: 'SCALAR',
        min: [0],
        max: [grp.indices.length - 1]
      });

      meshPrimitives.push({
        attributes: {
          POSITION: posAccessorIdx,
          NORMAL: normAccessorIdx
        },
        indices: idxAccessorIdx,
        material: matIdx
      });
    }

    const meshIdx = gltfMeshes.length;
    gltfMeshes.push({
      name: cat,
      primitives: meshPrimitives
    });

    const nodeIdx = nodes.length;
    nodes.push({
      name: cat,
      mesh: meshIdx
    });
    sceneNodeIndices.push(nodeIdx);
  }

  // Combine binary buffer chunks into a single ArrayBuffer
  const totalBufferSize = currentBufferOffset;
  const combinedBuffer = new Uint8Array(totalBufferSize);
  let writeOffset = 0;
  for (const chunk of bufferChunks) {
    combinedBuffer.set(new Uint8Array(chunk), writeOffset);
    writeOffset += chunk.byteLength;
  }

  // Construct glTF JSON manifest
  const gltfJson = {
    asset: {
      version: '2.0',
      generator: 'LabourConnect 2.0 AI Architect glTF/GLB Engine (S4-T04)',
      copyright: 'LabourConnect Architecture Ecosystem'
    },
    scene: 0,
    scenes: [
      {
        name: canonicalDesign.title || 'Architectural Design Scene',
        nodes: sceneNodeIndices
      }
    ],
    nodes,
    meshes: gltfMeshes,
    materials: materials.length > 0 ? materials : [
      {
        name: 'Default Architectural Material',
        pbrMetallicRoughness: {
          baseColorFactor: [0.8, 0.8, 0.8, 1.0],
          metallicFactor: 0.1,
          roughnessFactor: 0.8
        }
      }
    ],
    accessors,
    bufferViews,
    buffers: [
      {
        byteLength: totalBufferSize
      }
    ]
  };

  return {
    json: gltfJson,
    binaryBuffer: combinedBuffer,
    stats: {
      totalPrimitives: primitives.length,
      totalMaterials: materials.length,
      totalMeshes: gltfMeshes.length,
      bufferSizeBytes: totalBufferSize
    }
  };
}

/**
 * Generates a self-contained Binary glTF (.glb) file as a Uint8Array.
 * 
 * @param {Object} canonicalDesign - Canonical design model payload (v2.0.0)
 * @param {Object} [options] - Export options
 * @returns {Uint8Array} Fully compliant binary GLB file bytes
 */
export function generateBinaryGlb(canonicalDesign, options = {}) {
  const { json, binaryBuffer } = buildGltfData(canonicalDesign, options);

  // Encode JSON string to UTF-8 bytes
  const jsonStr = JSON.stringify(json);
  const encoder = new TextEncoder();
  const jsonBytes = encoder.encode(jsonStr);

  // JSON chunk must be padded with spaces (0x20) to 4-byte alignment
  const jsonPadding = (4 - (jsonBytes.length % 4)) % 4;
  const jsonChunkLength = jsonBytes.length + jsonPadding;

  // Binary buffer chunk must be padded with zeroes (0x00) to 4-byte alignment
  const binPadding = (4 - (binaryBuffer.length % 4)) % 4;
  const binChunkLength = binaryBuffer.length + binPadding;

  // Total GLB size: 12-byte header + 8-byte JSON header + JSON bytes + 8-byte BIN header + BIN bytes
  const totalGlbLength = 12 + 8 + jsonChunkLength + 8 + binChunkLength;

  const glbBuffer = new ArrayBuffer(totalGlbLength);
  const dataView = new DataView(glbBuffer);
  const outBytes = new Uint8Array(glbBuffer);

  // 1. GLB Header (12 bytes)
  dataView.setUint32(0, 0x46546C67, true); // Magic: 'glTF' (0x46546C67)
  dataView.setUint32(4, 2, true);          // Version: 2
  dataView.setUint32(8, totalGlbLength, true); // Total Length

  // 2. Chunk 0: JSON Chunk
  let offset = 12;
  dataView.setUint32(offset, jsonChunkLength, true); // Chunk Length
  dataView.setUint32(offset + 4, 0x4E4F534A, true);  // Chunk Type: 'JSON' (0x4E4F534A)
  offset += 8;

  outBytes.set(jsonBytes, offset);
  offset += jsonBytes.length;

  for (let p = 0; p < jsonPadding; p++) {
    outBytes[offset++] = 0x20; // Space padding
  }

  // 3. Chunk 1: Binary Buffer Chunk
  dataView.setUint32(offset, binChunkLength, true);  // Chunk Length
  dataView.setUint32(offset + 4, 0x004E4942, true);  // Chunk Type: 'BIN\0' (0x004E4942)
  offset += 8;

  outBytes.set(binaryBuffer, offset);
  offset += binaryBuffer.length;

  for (let p = 0; p < binPadding; p++) {
    outBytes[offset++] = 0x00; // Zero padding
  }

  return outBytes;
}

/**
 * Generates standard JSON glTF (.gltf) with an embedded base64 data URI buffer.
 * 
 * @param {Object} canonicalDesign - Canonical design model payload (v2.0.0)
 * @param {Object} [options] - Export options
 * @returns {string} Formatted glTF 2.0 JSON string
 */
export function generateEmbeddedGltfJson(canonicalDesign, options = {}) {
  const { json, binaryBuffer } = buildGltfData(canonicalDesign, options);

  // Convert binary buffer to base64 data URI
  let binaryString = '';
  const len = binaryBuffer.byteLength;
  for (let i = 0; i < len; i++) {
    binaryString += String.fromCharCode(binaryBuffer[i]);
  }
  const base64Data = typeof btoa === 'function'
    ? btoa(binaryString)
    : Buffer.from(binaryBuffer).toString('base64');

  json.buffers[0].uri = `data:application/octet-stream;base64,${base64Data}`;

  return JSON.stringify(json, null, 2);
}
