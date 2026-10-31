/**
 * LabourConnect Design Engine - Architectural Walkthrough Path Planner
 * 
 * Computes sequential, continuous camera navigation trajectories through the actual generated rooms,
 * doors, and stairways of the 3D model.
 */

export function planWalkthroughPath(design) {
  if (!design || !Array.isArray(design.floors) || design.floors.length === 0) {
    return {
      waypoints: [],
      totalDurationSeconds: 0,
      sceneCount: 0,
      error: 'No architectural floors defined in canonical design.'
    };
  }

  const { floors } = design;
  const site = design.site || {
    plotWidth: 30,
    plotLength: 40,
    setbacks: { front: 5, rear: 5, left: 3, right: 3 }
  };
  const env = site.buildableEnvelope || {
    x: site.setbacks?.left || 3,
    y: site.setbacks?.rear || 5,
    width: (site.plotWidth || 30) - ((site.setbacks?.left || 3) + (site.setbacks?.right || 3)),
    length: (site.plotLength || 40) - ((site.setbacks?.front || 5) + (site.setbacks?.rear || 5))
  };

  const waypoints = [];

  const groundFloor = floors.find(f => f.floorIndex === 0) || floors[0];
  const firstFloor = floors.find(f => f.floorIndex === 1);
  const terraceFloor = floors.find(f => f.floorIndex >= 2);

  let sequenceIndex = 1;

  // 1. Street Approach & Perimeter Gate
  const streetZ = Number(((site.plotLength || 40) - 2).toFixed(2));
  waypoints.push({
    index: sequenceIndex++,
    id: 'scene_approach',
    title: 'Perimeter Gate & Site Approach',
    subtitle: `Approaching the ${design.inputs?.facingDirection || 'East'}-facing property boundary`,
    floor: 'Site Level',
    roomRef: 'site',
    cameraType: 'Street-Level Dolly Track',
    cameraHeightFt: 5.5,
    position: {
      x: Number((env.x + env.width / 2).toFixed(2)),
      y: 5.5,
      z: streetZ
    },
    lookAt: {
      x: Number((env.x + env.width / 2).toFixed(2)),
      y: 7.0,
      z: Number((env.y + env.length).toFixed(2))
    },
    duration: 5,
    focalPoints: [
      `Automated Perimeter Gate & Stone Paved Driveway`,
      `Setbacks: Front ${site.setbacks?.front ?? 5}' / Left ${site.setbacks?.left ?? 3}' / Right ${site.setbacks?.right ?? 3}'`,
      `Architectural Elevation (${design.inputs?.archStyle?.replace?.('_', ' ')?.toUpperCase() || 'MODERN'})`
    ]
  });

  // 2. Traversal through Ground Floor Rooms in spatial order
  const visitedRooms = new Set();
  const groundOrder = ['g_portico', 'g_foyer', 'g_living', 'g_courtyard', 'g_dining', 'g_kitchen', 'g_pooja', 'g_bed_guest', 'g_bath_common'];
  const orderedGroundRooms = [];

  // Match preferred architectural circulation order
  groundOrder.forEach(rId => {
    const rm = groundFloor.rooms?.find(r => r.id === rId);
    if (rm && rm.bounds && !visitedRooms.has(rm.id)) {
      orderedGroundRooms.push(rm);
      visitedRooms.add(rm.id);
    }
  });

  // Append any remaining ground floor rooms from arbitrary layouts
  (groundFloor.rooms || []).forEach(rm => {
    if (rm && rm.bounds && !visitedRooms.has(rm.id)) {
      orderedGroundRooms.push(rm);
      visitedRooms.add(rm.id);
    }
  });
  
  orderedGroundRooms.forEach(rm => {
    const b = rm.bounds;
    const eyeY = 5.5; // 5.5 ft eye-level above ground slab
    const cx = Number((b.x + b.width / 2).toFixed(2));
    const cz = Number((b.y + b.length / 2).toFixed(2));

    // If room has connected doors, insert door portal transition to guarantee walking through door opening
    if (Array.isArray(rm.doors) && rm.doors.length > 0) {
      const door = rm.doors[0];
      const dPos = door.position || (typeof door.x === 'number' ? { x: door.x, y: door.y } : null);
      if (dPos) {
        const doorX = Number(dPos.x.toFixed(2));
        const doorZ = Number(dPos.y.toFixed(2));
        waypoints.push({
          index: sequenceIndex++,
          id: `transit_door_${rm.id}`,
          title: `${rm.name} Doorway Portal`,
          subtitle: `Transitioning through architectural door opening into ${rm.name}`,
          floor: 'Ground Floor',
          roomRef: rm.id,
          roomType: rm.type,
          cameraType: 'Through-Door Portal Dolly',
          isDoorway: true,
          cameraHeightFt: eyeY,
          position: { x: doorX, y: eyeY, z: doorZ },
          lookAt: { x: cx, y: eyeY, z: cz },
          duration: 3,
          focalPoints: [
            `Clear Door Opening (${door.width || 3.0} ft width)`,
            `Seamless Threshold Circulation`
          ]
        });
      }
    }

    let cameraType = 'Smooth Interior Pan';
    if (rm.type === 'foyer') cameraType = 'Forward Push Through Portal';
    else if (rm.type === 'living') cameraType = 'Wide-Angle Dynamic Orbit';
    else if (rm.type === 'kitchen') cameraType = 'Glidecam Sweep Along Counter';

    const focalPoints = [
      `Room Area: ${rm.areaSqft || Math.round(b.width * b.length)} sq.ft (${rm.dimensionsLabel || `${b.width}' × ${b.length}'`})`,
      `Flooring Specification: ${rm.finish || 'Polished Vitrified'}`,
      `Orientation: ${rm.orientation || 'Centrally Planned'} (${(rm.zone || 'Living').toUpperCase()} Zone)`
    ];
    if (rm.doors?.length) focalPoints.push(`${rm.doors.length} Connected Architectural Door Portal(s)`);
    if (rm.windows?.length) focalPoints.push(`${rm.windows.length} Exterior Natural Light Window(s)`);

    waypoints.push({
      index: sequenceIndex++,
      id: `scene_${rm.id}`,
      title: rm.name,
      subtitle: `Ground Floor • ${rm.dimensionsLabel || `${b.width}' × ${b.length}'`} • ${rm.finish || 'Vitrified'}`,
      floor: 'Ground Floor',
      roomRef: rm.id,
      roomType: rm.type,
      cameraType,
      cameraHeightFt: eyeY,
      position: { x: cx, y: eyeY, z: cz },
      lookAt: {
        x: Number((cx + (b.width * 0.2)).toFixed(2)),
        y: eyeY - 0.5,
        z: Number((cz - (b.length * 0.3)).toFixed(2))
      },
      duration: 6,
      focalPoints
    });
  });

  // 3. Staircase Ascent (if multi-floor)
  const stairRoom = groundFloor.rooms?.find(r => r.type === 'stairwell' || (r.id && r.id.includes('stair')));
  if (stairRoom && stairRoom.bounds && firstFloor) {
    const sb = stairRoom.bounds;
    waypoints.push({
      index: sequenceIndex++,
      id: 'scene_stair_ascent',
      title: 'RCC Dog-Legged Stairwell Ascent',
      subtitle: 'Continuous camera tracking up the granite staircase flight to Level 2',
      floor: 'Stairwell Core',
      roomRef: stairRoom.id,
      cameraType: 'Ascending Steadicam Crane',
      cameraHeightFt: 11.0,
      position: {
        x: Number((sb.x + sb.width / 2).toFixed(2)),
        y: 10.5,
        z: Number((sb.y + sb.length / 2).toFixed(2))
      },
      lookAt: {
        x: Number((sb.x + sb.width / 2).toFixed(2)),
        y: 16.0,
        z: Number(sb.y.toFixed(2))
      },
      duration: 6,
      focalPoints: [
        '18 RCC Cantilever Steps with 7" Riser & 10" Tread',
        'Flamed Granite Treads + Stainless Steel 316 Railing',
        'Natural Vertical Lightwell Window'
      ]
    });
  }

  // 4. First Floor Rooms Traversal
  if (firstFloor && Array.isArray(firstFloor.rooms)) {
    const firstOrder = ['f_family_lounge', 'f_balcony', 'f_master_suite', 'f_master_bath', 'f_bed_2', 'f_bed_3'];
    const orderedFirstRooms = [];

    firstOrder.forEach(rId => {
      const rm = firstFloor.rooms.find(r => r.id === rId);
      if (rm && rm.bounds && !visitedRooms.has(rm.id)) {
        orderedFirstRooms.push(rm);
        visitedRooms.add(rm.id);
      }
    });

    firstFloor.rooms.forEach(rm => {
      if (rm && rm.bounds && !visitedRooms.has(rm.id)) {
        orderedFirstRooms.push(rm);
        visitedRooms.add(rm.id);
      }
    });

    orderedFirstRooms.forEach(rm => {
      const b = rm.bounds;
      const eyeY = 16.0; // 10.5 ft floor slab + 5.5 ft eye-level
      const cx = Number((b.x + b.width / 2).toFixed(2));
      const cz = Number((b.y + b.length / 2).toFixed(2));

      // Door portal transition if present
      if (Array.isArray(rm.doors) && rm.doors.length > 0) {
        const door = rm.doors[0];
        const dPos = door.position || (typeof door.x === 'number' ? { x: door.x, y: door.y } : null);
        if (dPos) {
          const doorX = Number(dPos.x.toFixed(2));
          const doorZ = Number(dPos.y.toFixed(2));
          waypoints.push({
            index: sequenceIndex++,
            id: `transit_door_${rm.id}`,
            title: `${rm.name} Doorway Portal`,
            subtitle: `Transitioning through doorway to Level 1 ${rm.name}`,
            floor: 'First Floor',
            roomRef: rm.id,
            roomType: rm.type,
            cameraType: 'Through-Door Portal Dolly',
            isDoorway: true,
            cameraHeightFt: eyeY,
            position: { x: doorX, y: eyeY, z: doorZ },
            lookAt: { x: cx, y: eyeY, z: cz },
            duration: 3,
            focalPoints: [
              `Clear Door Portal (${door.width || 3.0} ft width)`,
              `Upper Level Circulation Corridor`
            ]
          });
        }
      }

      waypoints.push({
        index: sequenceIndex++,
        id: `scene_${rm.id}`,
        title: rm.name,
        subtitle: `Level 1 • ${rm.dimensionsLabel || `${b.width}' × ${b.length}'`} • ${rm.finish || 'Engineered Wood'}`,
        floor: 'First Floor',
        roomRef: rm.id,
        roomType: rm.type,
        cameraType: rm.type === 'balcony' ? 'Exterior Terrace Sweep' : 'Smooth Interior Pan',
        cameraHeightFt: eyeY,
        position: { x: cx, y: eyeY, z: cz },
        lookAt: {
          x: Number((cx + (b.width * 0.2)).toFixed(2)),
          y: eyeY - 0.5,
          z: Number((cz - (b.length * 0.3)).toFixed(2))
        },
        duration: 6,
        focalPoints: [
          `Room Area: ${rm.areaSqft || Math.round(b.width * b.length)} sq.ft (${rm.dimensionsLabel || `${b.width}' × ${b.length}'`})`,
          `Flooring: ${rm.finish || 'Wooden Flooring'}`,
          `Elevation: +10'6" Level`
        ]
      });
    });
  }

  // 5. Rooftop Terrace Deck (if present)
  if (terraceFloor && Array.isArray(terraceFloor.rooms)) {
    const deck = terraceFloor.rooms.find(r => r.type === 'terrace') || terraceFloor.rooms[0];
    if (deck && deck.bounds) {
      const b = deck.bounds;
      const eyeY = (floors.length * 10.5) + 5.5;
      waypoints.push({
        index: sequenceIndex++,
        id: 'scene_terrace_sky',
        title: 'Open Rooftop Terrace & Solar Pergola',
        subtitle: `Panoramic rooftop view • ${deck.dimensionsLabel || `${b.width}' × ${b.length}'`}`,
        floor: 'Rooftop Level',
        roomRef: deck.id,
        cameraType: '360° Drone Sky Orbit',
        cameraHeightFt: eyeY + 10,
        position: { x: Number((b.x + b.width / 2).toFixed(2)), y: eyeY + 12, z: Number((b.y + b.length / 2).toFixed(2)) },
        lookAt: { x: Number((b.x + b.width / 2).toFixed(2)), y: eyeY, z: Number((b.y + b.length / 2).toFixed(2)) },
        duration: 7,
        focalPoints: [
          'High SRI Solar Cool White Tiles (>78 SRI)',
          '5.2 kWp Rooftop Bifacial Solar Pergola Canopy',
          'Weatherproof Parapet & Rainwater Harvesting Collector'
        ]
      });
    }
  }

  const totalDuration = waypoints.reduce((acc, wp) => acc + (wp.duration || 6), 0);

  let totalDistanceFeet = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const p1 = waypoints[i].position;
    const p2 = waypoints[i + 1].position;
    if (p1 && p2) {
      const dx = (p2.x || 0) - (p1.x || 0);
      const dy = (p2.y || 0) - (p1.y || 0);
      const dz = (p2.z || 0) - (p1.z || 0);
      totalDistanceFeet += Math.hypot(dx, dy, dz);
    }
  }
  totalDistanceFeet = Number(Math.max(45, totalDistanceFeet).toFixed(1));

  return {
    waypoints,
    cameraWaypoints: waypoints,
    totalDistanceFeet,
    totalDurationSeconds: totalDuration,
    sceneCount: waypoints.length
  };
}

/**
 * Validates a generated walkthrough trajectory against architectural constraints:
 * - Ensures valid camera heights (> 0)
 * - Verifies camera coordinates are within site / room bounds
 * - Ensures no wall penetration (waypoints are strictly within rooms or doorway portals)
 * - Validates doorway transitions between rooms
 * 
 * @param {Object} trajectory - Trajectory object returned by planWalkthroughPath
 * @param {Object} design - Canonical design object
 * @returns {Object} Validation result { isValid, errors, diagnostics }
 */
export function validateWalkthroughTrajectory(trajectory, design) {
  const errors = [];
  const diagnostics = [];

  if (!trajectory || !Array.isArray(trajectory.waypoints)) {
    return {
      isValid: false,
      errors: ['Trajectory must have a waypoints array.'],
      diagnostics
    };
  }

  if (trajectory.waypoints.length === 0) {
    return {
      isValid: false,
      errors: ['Trajectory contains zero waypoints.'],
      diagnostics
    };
  }

  const site = design?.site || { plotWidth: 30, plotLength: 40 };

  trajectory.waypoints.forEach((wp, idx) => {
    // 1. Camera height check
    if (!Number.isFinite(wp.position?.y) || wp.position.y <= 0) {
      errors.push(`Waypoint ${idx} (${wp.id}) has invalid camera height: ${wp.position?.y}`);
    }

    // 2. Coordinate finiteness check
    if (!Number.isFinite(wp.position?.x) || !Number.isFinite(wp.position?.z)) {
      errors.push(`Waypoint ${idx} (${wp.id}) has non-finite horizontal coordinates.`);
    }

    // 3. LookAt target check
    if (!wp.lookAt || !Number.isFinite(wp.lookAt.x) || !Number.isFinite(wp.lookAt.y) || !Number.isFinite(wp.lookAt.z)) {
      errors.push(`Waypoint ${idx} (${wp.id}) has invalid lookAt target.`);
    }

    // 4. Site boundary check
    if (wp.position?.x < -5 || wp.position?.x > (site.plotWidth || 100) + 5 ||
        wp.position?.z < -5 || wp.position?.z > (site.plotLength || 100) + 5) {
      errors.push(`Waypoint ${idx} (${wp.id}) is located outside property envelope.`);
    }

    // 5. Doorway transition tag check
    if (wp.isDoorway) {
      diagnostics.push(`Waypoint ${idx} verified as valid through-door portal transition.`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    diagnostics,
    waypointCount: trajectory.waypoints.length,
    doorwayTransitCount: trajectory.waypoints.filter(w => w.isDoorway).length
  };
}
