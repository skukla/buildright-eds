// Project Visualizer - SVG generation for room and framing visualizations

/**
 * Project feature mapping - determines which projects get visualization
 */
export const PROJECT_FEATURES = {
  'new_construction.residential_home': {
    hasVisualization: true,
    visualizationType: 'room_with_framing',
    measurements: ['length', 'width', 'height', 'doors', 'windows']
  },
  'new_construction.addition': {
    hasVisualization: true,
    visualizationType: 'room_with_framing',
    measurements: ['length', 'width', 'height', 'doors', 'windows']
  },
  'remodel.bathroom': {
    hasVisualization: true,
    visualizationType: 'room',
    measurements: ['length', 'width', 'height', 'doors', 'windows']
  },
  'remodel.kitchen': {
    hasVisualization: true,
    visualizationType: 'room',
    measurements: ['length', 'width', 'height', 'doors', 'windows']
  },
  'remodel.basement': {
    hasVisualization: true,
    visualizationType: 'room_with_framing',
    measurements: ['length', 'width', 'height', 'doors', 'windows']
  }
};

/**
 * Check if a project should show visualization
 */
export function shouldShowVisualization(projectType, projectDetail) {
  if (!projectType || !projectDetail) return false;
  const key = `${projectType}.${projectDetail}`;
  return PROJECT_FEATURES[key]?.hasVisualization || false;
}

/**
 * Get visualization type for a project
 */
export function getVisualizationType(projectType, projectDetail) {
  if (!projectType || !projectDetail) return null;
  const key = `${projectType}.${projectDetail}`;
  return PROJECT_FEATURES[key]?.visualizationType || null;
}

/**
 * Render room floor plan visualization
 */
export function renderRoomVisualization(measurements) {
  const { length = 10, width = 10, height = 8, doors = 0, windows = 0 } = measurements;
  const scale = 20; // pixels per foot
  const padding = 100;
  const svgWidth = width * scale + padding;
  const svgHeight = length * scale + padding;
  
  const roomX = padding / 2;
  const roomY = padding / 2;
  const roomWidth = width * scale;
  const roomHeight = length * scale;
  
  // Calculate areas
  const floorArea = length * width;
  const wallArea = 2 * (length + width) * height;
  
  // Door opening (centered on bottom wall)
  const doorWidth = 32; // 32" door
  const doorX = roomX + (roomWidth / 2) - (doorWidth / 2);
  const doorY = roomY + roomHeight;
  
  // Window (on left wall, centered vertically)
  const windowWidth = 40;
  const windowHeight = 30;
  const windowX = roomX - 3;
  const windowY = roomY + (roomHeight / 2) - (windowHeight / 2);
  
  return `
    <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="project-visualizer" xmlns="http://www.w3.org/2000/svg">
      <!-- Room outline -->
      <rect x="${roomX}" y="${roomY}" 
            width="${roomWidth}" 
            height="${roomHeight}" 
            fill="#f5f5f5" 
            stroke="#333" 
            stroke-width="3"/>
      
      <!-- Door opening (if any) -->
      ${doors > 0 ? `
        <line x1="${doorX}" y1="${doorY}" 
              x2="${doorX + doorWidth}" y2="${doorY}" 
              stroke="#ff6b6b" 
              stroke-width="4"/>
        <text x="${roomX + roomWidth / 2}" y="${doorY + 20}" 
              text-anchor="middle" 
              class="label" 
              font-size="12" 
              fill="#ff6b6b">Door</text>
      ` : ''}
      
      <!-- Window (if any) -->
      ${windows > 0 ? `
        <rect x="${windowX}" 
              y="${windowY}" 
              width="6" 
              height="${windowHeight}" 
              fill="#87ceeb" 
              stroke="#4682b4" 
              stroke-width="2"/>
        <text x="${windowX - 15}" 
              y="${windowY + windowHeight / 2}" 
              text-anchor="middle" 
              class="label" 
              font-size="12" 
              fill="#4682b4">Window</text>
      ` : ''}
      
      <!-- Dimension labels -->
      <text x="${roomX + roomWidth / 2}" 
            y="${roomY - 10}" 
            text-anchor="middle" 
            class="dimension" 
            font-size="14" 
            font-weight="600" 
            fill="#333">Width: ${width} ft</text>
      
      <text x="${roomX - 20}" 
            y="${roomY + roomHeight / 2}" 
            text-anchor="middle" 
            class="dimension" 
            font-size="14" 
            font-weight="600" 
            fill="#333"
            transform="rotate(-90, ${roomX - 20}, ${roomY + roomHeight / 2})">
        Length: ${length} ft
      </text>
      
      <!-- Calculated results -->
      <text x="${svgWidth / 2}" 
            y="${svgHeight - 30}" 
            text-anchor="middle" 
            class="calc-result" 
            font-size="12" 
            font-weight="600" 
            fill="#0f5ba7">
        Floor Area: ${floorArea} sq ft | Wall Area: ${wallArea} sq ft
      </text>
    </svg>
  `;
}

/**
 * Render framing elevation view
 */
function renderFramingVisualization(measurements) {
  const { length = 10, width = 10, height = 8, doors = 0, windows = 0 } = measurements;
  const scale = 20;
  const padding = 100;
  const svgWidth = width * scale + padding;
  const svgHeight = height * scale + padding;
  
  const wallX = padding / 2;
  const wallY = padding / 2;
  const wallWidth = width * scale;
  const wallHeight = height * scale;
  
  // Calculate framing materials
  const framing = calculateFramingMaterials(length, width, height, doors, windows);
  
  // Stud spacing (16" on center = 1.33 ft)
  const studSpacing = 16 / 12;
  const studCount = Math.floor(width / studSpacing) + 1;
  
  // Bottom plate
  const plateY = wallY + wallHeight;
  
  // Door opening (if any)
  const doorWidth = 32;
  const doorHeight = 80;
  const doorX = wallX + (wallWidth / 2) - (doorWidth / 2);
  const doorTopY = plateY - doorHeight;
  
  // Window opening (if any)
  const windowWidth = 40;
  const windowHeight = 30;
  const windowX = wallX + 30;
  const windowY = wallY + 40;
  
  // Generate stud lines
  let studLines = '';
  for (let i = 0; i <= studCount; i++) {
    const x = wallX + (i * studSpacing * scale);
    studLines += `
      <line x1="${x}" y1="${wallY}" 
            x2="${x}" y2="${plateY}" 
            stroke="#cd853f" 
            stroke-width="2" 
            stroke-dasharray="4,4"/>
    `;
  }
  
  return `
    <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="project-visualizer" xmlns="http://www.w3.org/2000/svg">
      <!-- Wall outline -->
      <rect x="${wallX}" y="${wallY}" 
            width="${wallWidth}" 
            height="${wallHeight}" 
            fill="#f9f9f9" 
            stroke="#333" 
            stroke-width="3"/>
      
      <!-- Bottom plate -->
      <line x1="${wallX}" y1="${plateY}" 
            x2="${wallX + wallWidth}" y2="${plateY}" 
            stroke="#8b4513" 
            stroke-width="6"/>
      
      <!-- Top plate -->
      <line x1="${wallX}" y1="${wallY}" 
            x2="${wallX + wallWidth}" y2="${wallY}" 
            stroke="#8b4513" 
            stroke-width="6"/>
      
      <!-- Studs -->
      ${studLines}
      
      <!-- Door opening (if any) -->
      ${doors > 0 ? `
        <rect x="${doorX}" 
              y="${doorTopY}" 
              width="${doorWidth}" 
              height="${doorHeight}" 
              fill="#fff" 
              stroke="#ff6b6b" 
              stroke-width="2"/>
        <line x1="${doorX}" y1="${doorTopY}" 
              x2="${doorX + doorWidth}" y2="${doorTopY}" 
              stroke="#ff6b6b" 
              stroke-width="4"/>
        <text x="${doorX + doorWidth / 2}" y="${doorTopY + doorHeight / 2}" 
              text-anchor="middle" 
              class="label" 
              font-size="12" 
              fill="#ff6b6b">Door</text>
      ` : ''}
      
      <!-- Window opening (if any) -->
      ${windows > 0 ? `
        <rect x="${windowX}" 
              y="${windowY}" 
              width="${windowWidth}" 
              height="${windowHeight}" 
              fill="#87ceeb" 
              stroke="#4682b4" 
              stroke-width="2"/>
        <line x1="${windowX}" y1="${windowY}" 
              x2="${windowX + windowWidth}" y2="${windowY}" 
              stroke="#4682b4" 
              stroke-width="3"/>
        <text x="${windowX + windowWidth / 2}" y="${windowY - 10}" 
              text-anchor="middle" 
              class="label" 
              font-size="12" 
              fill="#4682b4">Window</text>
      ` : ''}
      
      <!-- Dimensions -->
      <text x="${wallX + wallWidth / 2}" 
            y="${plateY + 30}" 
            text-anchor="middle" 
            class="dimension" 
            font-size="14" 
            font-weight="600" 
            fill="#333">Wall Length: ${width} ft</text>
      
      <text x="${wallX - 20}" 
            y="${wallY + wallHeight / 2}" 
            text-anchor="middle"
            class="dimension" 
            font-size="14" 
            font-weight="600" 
            fill="#333"
            transform="rotate(-90, ${wallX - 20}, ${wallY + wallHeight / 2})">
        Wall Height: ${height} ft
      </text>
      
      <!-- Material calculations -->
      <text x="${svgWidth / 2}" 
            y="${svgHeight - 30}" 
            text-anchor="middle" 
            class="calc-result" 
            font-size="12" 
            font-weight="600" 
            fill="#0f5ba7">
        Studs: ${framing.studs} @ 16" O.C. | Plates: ${framing.plates} LF | Drywall: ${framing.drywall} sheets
      </text>
    </svg>
  `;
}

/**
 * Render room with framing (combined view)
 */
function renderRoomWithFramingVisualization(measurements) {
  const roomSVG = renderRoomVisualization(measurements);
  const framingSVG = renderFramingVisualization(measurements);
  
  return `
    <div class="viz-tabs">
      <button class="viz-tab active" data-view="room">Floor Plan</button>
      <button class="viz-tab" data-view="framing">Framing Detail</button>
    </div>
    <div class="viz-view active" data-view="room">${roomSVG}</div>
    <div class="viz-view" data-view="framing">${framingSVG}</div>
  `;
}

/**
 * Create visualization based on project type and measurements
 */
export function createVisualization(projectType, projectDetail, measurements) {
  const vizType = getVisualizationType(projectType, projectDetail);
  
  if (!vizType) return null;
  
  switch(vizType) {
    case 'room':
      return renderRoomVisualization(measurements);
    case 'room_with_framing':
      return renderRoomWithFramingVisualization(measurements);
    default:
      return null;
  }
}

/**
 * Calculate framing materials needed
 * Exported for use in project builder
 */
export function calculateFramingMaterials(length, width, height, doors, windows) {
  const perimeter = 2 * (length + width);
  const studSpacing = 16 / 12; // 16" on center in feet
  
  // Studs: perimeter / spacing, plus extras for corners and openings
  const baseStuds = Math.ceil(perimeter / studSpacing);
  const cornerStuds = 4;
  const openingStuds = (doors + windows) * 2; // King studs
  const totalStuds = baseStuds + cornerStuds + openingStuds;
  
  // Plates: bottom, top, and cap (triple plate)
  const plateLinearFeet = perimeter * 3;
  
  // Headers: 2x material for each opening
  const headers = doors + windows;
  
  // Drywall: wall area / 32 sq ft (4x8 sheet)
  const wallArea = perimeter * height;
  const drywallSheets = Math.ceil(wallArea / 32);
  
  return {
    studs: totalStuds,
    plates: plateLinearFeet,
    headers: headers,
    drywall: drywallSheets,
    wallArea: wallArea
  };
}

