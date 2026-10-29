/**
 * LabourConnect AI Architect - Professional Architectural Material & Procedural Texture System
 * 
 * Generates high-fidelity procedural canvas textures and physically-based materials (PBR)
 * matching modern luxury and contemporary residential architectural visualizations.
 * 
 * 100% self-contained, offline-capable, zero external network dependency.
 */

import * as THREE from 'three';

// Cache generated textures to reuse across materials and prevent memory duplication
const textureCache = new Map();

/**
 * Creates a seamless natural oak / teak wood floor plank texture with bevels and grain.
 */
export function getWoodFloorTexture(repeatX = 4, repeatY = 4) {
  const cacheKey = `wood_floor_${repeatX}_${repeatY}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Roughness canvas for specular highlight definition along plank edges
  const rCanvas = document.createElement('canvas');
  rCanvas.width = 1024;
  rCanvas.height = 1024;
  const rCtx = rCanvas.getContext('2d');

  // Grout / groove base
  ctx.fillStyle = '#382312';
  ctx.fillRect(0, 0, 1024, 1024);
  rCtx.fillStyle = '#ffffff'; // Max roughness in grooves
  rCtx.fillRect(0, 0, 1024, 1024);

  const numRows = 12;
  const rowHeight = 1024 / numRows;
  const woodBasePalettes = [
    { base: '#c69966', grain: '#9e7344', dark: '#805930' },
    { base: '#bc8f5c', grain: '#936a3c', dark: '#734e26' },
    { base: '#cd9f6c', grain: '#a47847', dark: '#865f34' },
    { base: '#b48552', grain: '#8a6033', dark: '#6b4520' },
    { base: '#bf925f', grain: '#966d3d', dark: '#785227' }
  ];

  for (let r = 0; r < numRows; r++) {
    const y = r * rowHeight + 1.5;
    const h = rowHeight - 3;
    const rowOffset = ((r * 317) % 400);

    let x = -rowOffset;
    while (x < 1024) {
      const plankLen = 220 + ((r * 113 + x * 17) % 180);
      const palette = woodBasePalettes[Math.abs(Math.floor(r * 3 + x)) % woodBasePalettes.length];

      // Plank body
      ctx.fillStyle = palette.base;
      ctx.fillRect(Math.max(0, x), y, Math.min(1024 - x, plankLen - 2), h);

      // Plank roughness (smooth satin face)
      rCtx.fillStyle = '#555555';
      rCtx.fillRect(Math.max(0, x), y, Math.min(1024 - x, plankLen - 2), h);

      // Fine wood grain lines
      ctx.save();
      ctx.beginPath();
      ctx.rect(Math.max(0, x), y, Math.min(1024 - x, plankLen - 2), h);
      ctx.clip();

      for (let g = 0; g < 18; g++) {
        const gy = y + (g / 18) * h + (Math.sin(g + x) * 2);
        ctx.strokeStyle = g % 3 === 0 ? palette.dark : palette.grain;
        ctx.globalAlpha = 0.22 + (g % 4) * 0.05;
        ctx.lineWidth = 0.8 + (g % 2) * 0.4;
        ctx.beginPath();
        ctx.moveTo(x, gy);
        ctx.bezierCurveTo(
          x + plankLen * 0.33, gy + Math.sin(x * 0.05) * 3,
          x + plankLen * 0.66, gy - Math.sin(x * 0.05) * 3,
          x + plankLen, gy
        );
        ctx.stroke();
      }
      ctx.restore();
      ctx.globalAlpha = 1.0;

      // Subtle edge bevel shading
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(Math.max(0, x), y + h - 1.5, Math.min(1024 - x, plankLen - 2), 1.5);
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(Math.max(0, x), y, Math.min(1024 - x, plankLen - 2), 1.2);

      x += plankLen;
    }
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(repeatX, repeatY);
  map.colorSpace = THREE.SRGBColorSpace;

  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(repeatX, repeatY);

  const result = { map, roughnessMap };
  textureCache.set(cacheKey, result);
  return result;
}

/**
 * Creates high-fidelity horizontal teak wood decking planks for terraces, balconies, and patios.
 * Perfectly matches luxury architectural dollhouse cutaways with fine dark grooves and warm wood tones.
 */
export function getTeakDeckingTexture(repeatX = 3, repeatY = 3) {
  const cacheKey = `teak_deck_${repeatX}_${repeatY}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  const rCanvas = document.createElement('canvas');
  rCanvas.width = 1024;
  rCanvas.height = 1024;
  const rCtx = rCanvas.getContext('2d');

  // Deep shadow gap between decking slats
  ctx.fillStyle = '#1c1005';
  ctx.fillRect(0, 0, 1024, 1024);
  rCtx.fillStyle = '#ffffff';
  rCtx.fillRect(0, 0, 1024, 1024);

  const numSlats = 24; // Fine horizontal architectural slats
  const slatHeight = 1024 / numSlats;
  const gap = 3;

  const teakPalette = [
    { base: '#b46b2b', grain: '#8a4e1a', dark: '#69380e' },
    { base: '#a86124', grain: '#7e4414', dark: '#5e2f0a' },
    { base: '#be7433', grain: '#945520', dark: '#733e12' },
    { base: '#9c571e', grain: '#723a10', dark: '#522706' },
    { base: '#b06727', grain: '#864a18', dark: '#63330c' }
  ];

  for (let s = 0; s < numSlats; s++) {
    const y = s * slatHeight + gap / 2;
    const h = slatHeight - gap;
    const pal = teakPalette[s % teakPalette.length];

    // Slat base body
    ctx.fillStyle = pal.base;
    ctx.fillRect(0, y, 1024, h);

    // Roughness (satin outdoor wood oil)
    rCtx.fillStyle = '#606060';
    rCtx.fillRect(0, y, 1024, h);

    // Horizontal linear grain
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, y, 1024, h);
    ctx.clip();

    for (let g = 0; g < 6; g++) {
      const gy = y + (g / 6) * h + Math.sin(s * 1.5 + g) * 0.8;
      ctx.strokeStyle = g % 2 === 0 ? pal.dark : pal.grain;
      ctx.globalAlpha = 0.28;
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(1024, gy);
      ctx.stroke();
    }

    // Top subtle bevel highlight & bottom drop shadow
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(0, y, 1024, 1.2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.fillRect(0, y + h - 1.5, 1024, 1.5);

    ctx.restore();
    ctx.globalAlpha = 1.0;
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(repeatX, repeatY);
  map.colorSpace = THREE.SRGBColorSpace;

  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(repeatX, repeatY);

  const result = { map, roughnessMap };
  textureCache.set(cacheKey, result);
  return result;
}

/**
 * Creates large-format porcelain tile texture for bathrooms, kitchens, and terraces.
 */
export function getPorcelainTileTexture(repeatX = 3, repeatY = 3, type = 'marble_calacatta') {
  const cacheKey = `tile_${type}_${repeatX}_${repeatY}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Grout background
  ctx.fillStyle = '#d1d5db';
  ctx.fillRect(0, 0, 1024, 1024);

  const gridSize = 4;
  const tileSize = 1024 / gridSize;
  const groutWidth = 3;

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const x = c * tileSize + groutWidth;
      const y = r * tileSize + groutWidth;
      const size = tileSize - groutWidth * 2;

      // Tile body
      ctx.fillStyle = type === 'dark_slate' ? '#1e293b' : '#f8fafc';
      ctx.fillRect(x, y, size, size);

      // Subtle marbling veining
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, size, size);
      ctx.clip();

      const veinColor = type === 'dark_slate' ? 'rgba(255,255,255,0.08)' : 'rgba(148, 163, 184, 0.18)';
      ctx.strokeStyle = veinColor;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.moveTo(x + (r * 45) % size, y);
      ctx.bezierCurveTo(
        x + size * 0.4, y + size * 0.35,
        x + size * 0.6, y + size * 0.7,
        x + size, y + size * 0.8
      );
      ctx.stroke();

      ctx.restore();

      // Delicate bevel highlight
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillRect(x, y, size, 1.5);
      ctx.fillRect(x, y, 1.5, size);
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(x, y + size - 1.5, size, 1.5);
      ctx.fillRect(x + size - 1.5, y, 1.5, size);
    }
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(repeatX, repeatY);
  map.colorSpace = THREE.SRGBColorSpace;

  const result = { map };
  textureCache.set(cacheKey, result);
  return result;
}

/**
 * Creates woven wool area rug texture for living rooms and bedrooms.
 */
export function getAreaRugTexture() {
  const cacheKey = 'area_rug_woven';
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base warm heathered oatmeal
  ctx.fillStyle = '#e5e2da';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle border
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 14;
  ctx.strokeRect(18, 18, 476, 476);

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 4;
  ctx.strokeRect(28, 28, 456, 456);

  // Woven micro texture
  ctx.fillStyle = 'rgba(0,0,0,0.035)';
  for (let y = 35; y < 475; y += 4) {
    for (let x = 35; x < 475; x += 4) {
      if ((x + y) % 8 === 0) {
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;

  textureCache.set(cacheKey, map);
  return map;
}

/**
 * Creates modern running-bond brick accent wall texture.
 */
export function getBrickAccentTexture(repeatX = 2, repeatY = 2) {
  const cacheKey = `brick_accent_${repeatX}_${repeatY}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Mortar
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(0, 0, 1024, 512);

  const rows = 16;
  const rowH = 512 / rows;
  const brickW = 128;
  const brickH = rowH - 3;

  const brickColors = ['#9a3412', '#c2410c', '#b45309', '#7c2d12', '#a16207'];

  for (let r = 0; r < rows; r++) {
    const y = r * rowH + 1.5;
    const offset = (r % 2 === 0) ? 0 : brickW / 2;
    for (let x = -offset; x < 1024; x += brickW) {
      const color = brickColors[(r * 7 + Math.abs(Math.floor(x / brickW))) % brickColors.length];
      ctx.fillStyle = color;
      ctx.fillRect(Math.max(0, x + 2), y, Math.min(1024 - x - 2, brickW - 4), brickH);

      // Brick speckle
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.fillRect(Math.max(0, x + 10), y + 3, 6, 4);
      ctx.fillRect(Math.max(0, x + 40), y + 8, 8, 3);
    }
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(repeatX, repeatY);
  map.colorSpace = THREE.SRGBColorSpace;

  textureCache.set(cacheKey, map);
  return map;
}

/**
 * Creates vertical acoustic timber slats texture for feature accent walls.
 */
export function getWoodSlatsTexture(repeatX = 3, repeatY = 1) {
  const cacheKey = `wood_slats_${repeatX}_${repeatY}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Acoustic dark felt backdrop
  ctx.fillStyle = '#18181b';
  ctx.fillRect(0, 0, 512, 512);

  const numSlats = 16;
  const slatSlot = 512 / numSlats;
  const slatW = slatSlot * 0.72;

  for (let i = 0; i < numSlats; i++) {
    const x = i * slatSlot;
    // Slat wood body
    ctx.fillStyle = '#c29b6b';
    ctx.fillRect(x, 0, slatW, 512);

    // Subtle grain lines
    ctx.fillStyle = 'rgba(90, 50, 20, 0.25)';
    ctx.fillRect(x + 4, 0, 1.5, 512);
    ctx.fillRect(x + 12, 0, 2, 512);

    // Edge highlight & shadow
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(x, 0, 1.5, 512);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + slatW - 1.5, 0, 1.5, 512);
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(repeatX, repeatY);
  map.colorSpace = THREE.SRGBColorSpace;

  textureCache.set(cacheKey, map);
  return map;
}

/**
 * Creates subtle stipple bump map for plastered walls to eliminate synthetic smoothness.
 */
export function getPlasterBumpMap() {
  const cacheKey = 'plaster_bump_map';
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  const imgData = ctx.getImageData(0, 0, 256, 256);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 36;
    const val = Math.max(0, Math.min(255, 128 + noise));
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }
  ctx.putImageData(imgData, 0, 0);

  const bump = new THREE.CanvasTexture(canvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(6, 6);

  textureCache.set(cacheKey, bump);
  return bump;
}

/**
 * Automatically calculates dimensionally accurate planar UV coordinates for any 3D buffer geometry.
 * 
 * Inspects triangle normal to project:
 * - Horizontal surfaces (Normal ~ Y): UV = (x, z)
 * - Vertical East-West (Normal ~ X): UV = (z, y)
 * - Vertical North-South (Normal ~ Z): UV = (x, y)
 * - Sloping roofs: projected along slope length
 */
export function applyPlanarUVs(geometry, worldScale = 10.0) {
  if (!geometry || !geometry.attributes.position) return geometry;

  const pos = geometry.attributes.position;
  const count = pos.count;
  const uvs = new Float32Array(count * 2);

  // If index exists, compute per-vertex UV based on vertex positions
  for (let i = 0; i < count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    // Compute surface normal approximation if normal attribute exists
    let nx = 0, ny = 1, nz = 0;
    if (geometry.attributes.normal) {
      nx = geometry.attributes.normal.getX(i);
      ny = geometry.attributes.normal.getY(i);
      nz = geometry.attributes.normal.getZ(i);
    }

    const absX = Math.abs(nx);
    const absY = Math.abs(ny);
    const absZ = Math.abs(nz);

    if (absY >= absX && absY >= absZ) {
      // Horizontal plane (floors, roofs, slabs, countertops)
      uvs[i * 2] = x / worldScale;
      uvs[i * 2 + 1] = z / worldScale;
    } else if (absX >= absZ) {
      // Vertical East/West plane
      uvs[i * 2] = z / worldScale;
      uvs[i * 2 + 1] = y / worldScale;
    } else {
      // Vertical North/South plane
      uvs[i * 2] = x / worldScale;
      uvs[i * 2 + 1] = y / worldScale;
    }
  }

  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.attributes.uv.needsUpdate = true;
  return geometry;
}

/**
 * Creates genuine Mangalore Terracotta Clay Tile texture for sloping pitched roofs.
 * Renders interlocking arched tile profiles with realistic terracotta color gradients,
 * edge overlap shadows, ridge highlights, and natural kiln firing variations.
 */
export function getMangaloreRoofTileTexture(repeatX = 6, repeatY = 6) {
  const cacheKey = `roof_mangalore_clay_${repeatX}_${repeatY}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  const rCanvas = document.createElement('canvas');
  rCanvas.width = 1024;
  rCanvas.height = 1024;
  const rCtx = rCanvas.getContext('2d');

  // Deep shadow base for inter-tile joints
  ctx.fillStyle = '#450a0a';
  ctx.fillRect(0, 0, 1024, 1024);
  rCtx.fillStyle = '#ffffff';
  rCtx.fillRect(0, 0, 1024, 1024);

  const numCourses = 16; // 16 horizontal courses of overlapping tiles
  const courseH = 1024 / numCourses;
  const tilesPerCourse = 12;
  const tileW = 1024 / tilesPerCourse;

  const terracottaPalettes = [
    { base: '#b91c1c', highlight: '#dc2626', shadow: '#7f1d1d', dark: '#571010' },
    { base: '#c2410c', highlight: '#ea580c', shadow: '#9a3412', dark: '#631d07' },
    { base: '#a13317', highlight: '#c04a25', shadow: '#77240e', dark: '#4f1406' },
    { base: '#b4341b', highlight: '#d24727', shadow: '#88210c', dark: '#591507' }
  ];

  for (let c = 0; c < numCourses; c++) {
    const y = c * courseH;
    const h = courseH + 4; // slight overlap over row below
    const courseOffset = (c % 2) * (tileW * 0.5);

    for (let t = -1; t <= tilesPerCourse + 1; t++) {
      const x = t * tileW + courseOffset;
      const pal = terracottaPalettes[(c * 7 + Math.abs(t)) % terracottaPalettes.length];

      // Draw curved corrugated barrel tile profile
      const grad = ctx.createLinearGradient(x, y, x + tileW, y);
      grad.addColorStop(0, pal.dark);
      grad.addColorStop(0.18, pal.shadow);
      grad.addColorStop(0.48, pal.highlight); // Barrel crest highlight
      grad.addColorStop(0.78, pal.base);
      grad.addColorStop(1.0, pal.dark); // Water trough shadow

      ctx.fillStyle = grad;
      ctx.fillRect(Math.max(0, x + 1), y, Math.min(1024 - x - 1, tileW - 2), h);

      // Roughness map (clay surface: semi-rough with smoother crest)
      const rGrad = rCtx.createLinearGradient(x, y, x + tileW, y);
      rGrad.addColorStop(0, '#c0c0c0');
      rGrad.addColorStop(0.48, '#707070'); // Crest has slight clay sheen
      rGrad.addColorStop(1.0, '#d0d0d0');
      rCtx.fillStyle = rGrad;
      rCtx.fillRect(Math.max(0, x + 1), y, Math.min(1024 - x - 1, tileW - 2), h);

      // Subtle clay surface stipple / grain
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      for (let s = 0; s < 4; s++) {
        const sx = x + ((s * 23 + c * 17) % (tileW - 6)) + 3;
        const sy = y + ((s * 19 + t * 13) % (h - 4)) + 2;
        ctx.fillRect(sx, sy, 3, 2);
      }

      // Bottom overlap drop shadow onto lower course
      ctx.fillStyle = 'rgba(20, 5, 5, 0.45)';
      ctx.fillRect(Math.max(0, x), y + h - 3, Math.min(1024 - x, tileW), 3);

      // Top edge delicate highlight
      ctx.fillStyle = 'rgba(255, 230, 210, 0.22)';
      ctx.fillRect(Math.max(0, x + 2), y, Math.min(1024 - x - 4, tileW - 4), 1.5);
    }
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(repeatX, repeatY);
  map.colorSpace = THREE.SRGBColorSpace;

  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(repeatX, repeatY);

  const result = { map, roughnessMap };
  textureCache.set(cacheKey, result);
  return result;
}

/**
 * Creates Honed Italian Travertine / Natural Limestone texture.
 * Features subtle horizontal sedimentary banding and micropores.
 */
export function getTravertineStoneTexture(repeatX = 3, repeatY = 3) {
  const cacheKey = `travertine_${repeatX}_${repeatY}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Base warm honed cream/ivory
  ctx.fillStyle = '#f5efe6';
  ctx.fillRect(0, 0, 1024, 1024);

  // Soft horizontal sedimentary bands
  const bands = 36;
  const bandH = 1024 / bands;
  for (let b = 0; b < bands; b++) {
    const y = b * bandH;
    const bandTone = (b % 3 === 0) ? 'rgba(226, 215, 198, 0.55)' : (b % 2 === 0 ? 'rgba(238, 230, 217, 0.4)' : 'rgba(214, 201, 182, 0.35)');
    ctx.fillStyle = bandTone;
    ctx.fillRect(0, y, 1024, bandH + (Math.sin(b * 0.8) * 3));

    // Natural horizontal porous striations
    ctx.strokeStyle = 'rgba(180, 165, 145, 0.22)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, y + bandH * 0.5);
    ctx.bezierCurveTo(
      340, y + bandH * 0.5 + Math.sin(b) * 4,
      680, y + bandH * 0.5 - Math.sin(b) * 4,
      1024, y + bandH * 0.5
    );
    ctx.stroke();
  }

  // Scattered tiny limestone micropores
  ctx.fillStyle = 'rgba(140, 125, 105, 0.18)';
  for (let i = 0; i < 400; i++) {
    const px = (i * 137.5) % 1024;
    const py = (i * 269.3) % 1024;
    const pw = 1 + (i % 3);
    const ph = 1 + (i % 2);
    ctx.fillRect(px, py, pw, ph);
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(repeatX, repeatY);
  map.colorSpace = THREE.SRGBColorSpace;

  textureCache.set(cacheKey, map);
  return map;
}

/**
 * Creates Board-Formed Architectural Exposed Concrete texture.
 * Imprints horizontal timber formwork boards, wood grain relief, and tie-rod holes.
 */
export function getBoardFormedConcreteTexture(repeatX = 2, repeatY = 4) {
  const cacheKey = `board_formed_concrete_${repeatX}_${repeatY}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Base raw architectural concrete
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(0, 0, 1024, 1024);

  const numBoards = 12;
  const boardH = 1024 / numBoards;

  for (let i = 0; i < numBoards; i++) {
    const y = i * boardH;
    const shade = (i % 2 === 0) ? '#d1d9e2' : '#c4ceda';
    ctx.fillStyle = shade;
    ctx.fillRect(0, y, 1024, boardH);

    // Board wood grain lines
    ctx.fillStyle = 'rgba(100, 116, 139, 0.12)';
    for (let g = 0; g < 5; g++) {
      ctx.fillRect(0, y + (g / 5) * boardH, 1024, 1.2);
    }

    // Horizontal formwork board seam shadow & highlight
    ctx.fillStyle = 'rgba(51, 65, 85, 0.45)';
    ctx.fillRect(0, y + boardH - 2, 1024, 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(0, y, 1024, 1.2);

    // Form tie-rod holes (circular indented plugs spaced evenly)
    [180, 512, 844].forEach(hx => {
      ctx.beginPath();
      ctx.arc(hx, y + boardH / 2, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#64748b';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(hx, y + boardH / 2, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#334155';
      ctx.fill();
    });
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(repeatX, repeatY);
  map.colorSpace = THREE.SRGBColorSpace;

  textureCache.set(cacheKey, map);
  return map;
}

/**
 * Creates High-Gloss Calacatta Gold / Carrara Polished Marble texture.
 * Features branching fractal veins with soft smoke boundaries and gold accents.
 */
export function getCalacattaMarbleTexture(repeatX = 2, repeatY = 2) {
  const cacheKey = `calacatta_marble_${repeatX}_${repeatY}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Polished luminous white marble ground
  ctx.fillStyle = '#fafbfc';
  ctx.fillRect(0, 0, 1024, 1024);

  // Soft atmospheric marble clouding
  const grad = ctx.createRadialGradient(400, 450, 50, 512, 512, 600);
  grad.addColorStop(0, 'rgba(241, 245, 249, 0.6)');
  grad.addColorStop(0.5, 'rgba(226, 232, 240, 0.35)');
  grad.addColorStop(1, 'rgba(248, 250, 252, 0.8)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Major organic branching veins
  const drawVein = (startX, startY, endX, endY, width, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    const midX1 = (startX * 2 + endX) / 3 + (Math.sin(startX) * 45);
    const midY1 = (startY * 2 + endY) / 3 + (Math.cos(startY) * 40);
    const midX2 = (startX + endX * 2) / 3 - (Math.cos(endX) * 45);
    const midY2 = (startY + endY * 2) / 3 - (Math.sin(endY) * 40);
    ctx.bezierCurveTo(midX1, midY1, midX2, midY2, endX, endY);
    ctx.stroke();
  };

  // 1. Broad soft smoke feather veins
  drawVein(50, 0, 950, 1024, 18, 'rgba(148, 163, 184, 0.12)');
  drawVein(0, 300, 1024, 750, 14, 'rgba(148, 163, 184, 0.10)');

  // 2. Defined charcoal grey veins
  drawVein(60, 0, 940, 1024, 5, 'rgba(71, 85, 105, 0.28)');
  drawVein(0, 310, 1024, 740, 4, 'rgba(71, 85, 105, 0.25)');
  drawVein(420, 280, 780, 520, 3, 'rgba(71, 85, 105, 0.22)');

  // 3. Delicate Italian gold veining accents
  drawVein(70, 10, 930, 1010, 2, 'rgba(217, 145, 30, 0.25)');
  drawVein(10, 318, 1010, 735, 1.8, 'rgba(217, 145, 30, 0.22)');

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(repeatX, repeatY);
  map.colorSpace = THREE.SRGBColorSpace;

  textureCache.set(cacheKey, map);
  return map;
}

/**
 * Creates Woven Linen / Fabric Texture for sofas, upholstered chairs, cushions, and headboards.
 */
export function getLinenFabricTexture(repeatX = 8, repeatY = 8) {
  const cacheKey = `linen_fabric_${repeatX}_${repeatY}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#64748b';
  ctx.fillRect(0, 0, 512, 512);

  // Warp and weft yarn weave
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  for (let y = 0; y < 512; y += 4) {
    for (let x = 0; x < 512; x += 4) {
      if ((x + y) % 8 === 0) {
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }

  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  for (let y = 0; y < 512; y += 4) {
    for (let x = 0; x < 512; x += 4) {
      if ((x - y + 512) % 8 === 0) {
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(repeatX, repeatY);
  map.colorSpace = THREE.SRGBColorSpace;

  textureCache.set(cacheKey, map);
  return map;
}

/**
 * Creates Natural Landscape Grass Lawn texture.
 * Features multi-toned emerald and olive stippled blades for garden plots.
 */
export function getGrassLawnTexture(repeatX = 12, repeatY = 12) {
  const cacheKey = `grass_lawn_${repeatX}_${repeatY}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#22543d';
  ctx.fillRect(0, 0, 512, 512);

  const grassColors = ['#15803d', '#166534', '#14532d', '#2d6a4f', '#1b4332'];
  for (let i = 0; i < 3500; i++) {
    const x = (i * 73) % 512;
    const y = (i * 127) % 512;
    ctx.fillStyle = grassColors[i % grassColors.length];
    ctx.fillRect(x, y, 2, 3);
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(repeatX, repeatY);
  map.colorSpace = THREE.SRGBColorSpace;

  textureCache.set(cacheKey, map);
  return map;
}

/**
 * Creates Natural Stone / Granite Paver texture for walkways and driveways.
 */
export function getStonePaverTexture(repeatX = 4, repeatY = 4) {
  const cacheKey = `stone_paver_${repeatX}_${repeatY}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Mortar joint base
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, 0, 1024, 1024);

  const rows = 8;
  const rowH = 1024 / rows;
  const paverW = 128;
  const paverColors = ['#94a3b8', '#cbd5e1', '#64748b', '#a0aec0', '#718096'];

  for (let r = 0; r < rows; r++) {
    const y = r * rowH + 3;
    const h = rowH - 6;
    const offset = (r % 2 === 0) ? 0 : paverW / 2;

    for (let x = -offset; x < 1024; x += paverW) {
      const color = paverColors[(r * 5 + Math.abs(Math.floor(x / paverW))) % paverColors.length];
      ctx.fillStyle = color;
      ctx.fillRect(Math.max(0, x + 3), y, Math.min(1024 - x - 3, paverW - 6), h);

      // Subtle edge bevel
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.fillRect(Math.max(0, x + 3), y, Math.min(1024 - x - 3, paverW - 6), 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.fillRect(Math.max(0, x + 3), y + h - 2, Math.min(1024 - x - 3, paverW - 6), 2);
    }
  }

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(repeatX, repeatY);
  map.colorSpace = THREE.SRGBColorSpace;

  textureCache.set(cacheKey, map);
  return map;
}

/**
 * Creates procedural HDR equirectangular sky & atmosphere environment map.
 * Generates natural daylight zenith, atmospheric horizon haze, and ground bounce
 * so glass, chrome, and polished materials receive realistic architectural reflections.
 */
export function createArchitecturalSkyEnvironment(renderer, isNight = false, solarTime = 12) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  if (isNight) {
    grad.addColorStop(0, '#020617'); // Deep cosmic zenith
    grad.addColorStop(0.48, '#0f172a');
    grad.addColorStop(0.50, '#1e293b'); // Horizon glow
    grad.addColorStop(0.52, '#090d16');
    grad.addColorStop(1.0, '#020617'); // Night ground
  } else if (solarTime >= 16.5 || solarTime <= 7.0) {
    // Warm Golden Hour
    grad.addColorStop(0, '#38bdf8'); // Clear sky zenith
    grad.addColorStop(0.45, '#fed7aa'); // Golden atmosphere
    grad.addColorStop(0.50, '#f97316'); // Blazing horizon
    grad.addColorStop(0.52, '#7c2d12');
    grad.addColorStop(1.0, '#1c1917'); // Warm ground
  } else {
    // Clean Architectural Daylight
    grad.addColorStop(0, '#0284c7'); // Rich blue zenith
    grad.addColorStop(0.42, '#7dd3fc');
    grad.addColorStop(0.50, '#f8fafc'); // Crisp white horizon haze
    grad.addColorStop(0.52, '#94a3b8');
    grad.addColorStop(1.0, '#334155'); // Earth bounce
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}

/**
 * Creates authentic physical architectural glass with real transmission and refraction.
 */
export function createArchitecturalGlassMaterial(options = {}) {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(options.color || '#bae6fd'),
    transmission: options.transmission !== undefined ? options.transmission : 0.92,
    opacity: 1.0,
    transparent: true,
    roughness: 0.04,
    metalness: 0.08,
    ior: 1.52, // Architectural float glass index of refraction
    thickness: 0.3,
    specularIntensity: 1.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    side: THREE.DoubleSide,
    depthWrite: false
  });
}

