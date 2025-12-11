/**
 * BOM Calculator Service
 * 
 * Dynamic Bill of Materials generation for house templates.
 * Applies estimating formulas from MATERIAL-ESTIMATING-RULES.md and looks up
 * actual products from ACO catalog.
 * 
 * @module scripts/services/bom-calculator
 */

import { findProductByName, findProductByCategory, getProductPrice } from './product-lookup.js';
import { formatCurrency } from '../utils.js';

/**
 * Calculate BOM for a house template
 * 
 * @param {Object} template - Template data from templates.json
 * @param {Object} selectionPackage - Selection package from templates.json
 * @param {Object} [variant] - Optional variant data
 * @returns {Promise<Object>} Complete BOM with all phases
 */
export async function calculateBOM(template, selectionPackage, variant = null) {
  console.log('');
  console.log('='.repeat(70));
  console.log(`CALCULATING BOM: ${template.name}`);
  console.log('='.repeat(70));
  console.log(`Template: ${template.name} (${template.sqft} sqft)`);
  console.log(`Package: ${selectionPackage.name} (${selectionPackage.tier})`);
  if (variant) {
    console.log(`Variant: ${variant.name} (+${variant.addedCost})`);
  }
  console.log('');
  
  // Calculate base measurements
  const measurements = calculateMeasurements(template);
  
  // Calculate each phase
  const foundationFraming = await calculateFoundationFraming(measurements, selectionPackage);
  const envelope = await calculateEnvelope(measurements, selectionPackage);
  const interiorFinish = await calculateInteriorFinish(measurements, selectionPackage);
  
  // Calculate totals
  const totalCost = foundationFraming.totalCost + envelope.totalCost + interiorFinish.totalCost;
  const totalItems = foundationFraming.items.length + envelope.items.length + interiorFinish.items.length;
  
  return {
    templateId: template.id,
    templateName: template.name,
    sqft: template.sqft,
    stories: template.stories,
    bedrooms: template.bedrooms,
    bathrooms: template.bathrooms,
    packageId: selectionPackage.id,
    packageName: selectionPackage.name,
    packageTier: selectionPackage.tier,
    variantId: variant?.id,
    variantName: variant?.name,
    generated: new Date().toISOString(),
    measurements,
    phases: {
      foundation_framing: foundationFraming,
      envelope,
      interior_finish: interiorFinish
    },
    summary: {
      totalCost,
      totalItems,
      costByPhase: {
        foundation_framing: foundationFraming.totalCost,
        envelope: envelope.totalCost,
        interior_finish: interiorFinish.totalCost
      }
    }
  };
}

/**
 * Calculate base measurements for estimating
 */
function calculateMeasurements(template) {
  const sqft = template.sqft;
  const stories = template.stories || 1;
  const wallHeight = 8; // Standard wall height in feet
  
  // Estimate perimeter: assume roughly square footprint, adjust for typical house shape
  const perimeter = Math.round(Math.sqrt(sqft) * 4 * 0.8);
  
  // Estimate roof area: add 12% for pitch
  const roofArea = Math.round(sqft * 1.12);
  
  return {
    sqft,
    stories,
    wallHeight,
    perimeter,
    roofArea,
    bedrooms: template.bedrooms,
    bathrooms: template.bathrooms
  };
}

/**
 * Calculate Foundation & Framing phase
 */
async function calculateFoundationFraming(measurements, selectionPackage) {
  const items = [];
  const { sqft, perimeter, wallHeight, roofArea, stories } = measurements;
  const tier = selectionPackage.tier;
  
  console.log('📦 Foundation & Framing Phase...');
  
  // 1. Concrete for slab foundation (CY)
  const concreteQty = Math.ceil(sqft * 4 / 324 * 1.05); // 4-inch slab, 5% waste
  const concrete = await findProductByCategory({ category: 'concrete', type: 'ready-mix', tier });
  if (concrete) {
    items.push({
      category: 'concrete',
      description: 'Ready-mix concrete for slab foundation',
      formula: 'sqft × 4 / 324 × 1.05',
      calculation: `${sqft} × 4 / 324 × 1.05 = ${concreteQty}`,
      quantity: concreteQty,
      unit: 'CY',
      sku: concrete.sku,
      name: concrete.name,
      pricePerUnit: getProductPrice(concrete),
      totalCost: concreteQty * getProductPrice(concrete)
    });
  }
  
  // 2. 2x4 Studs - interior walls (EA)
  const studs2x4Qty = Math.ceil(sqft * 0.18 * 1.10);
  const studs2x4 = await findProductByName('2x4', { tier });
  if (studs2x4) {
    items.push({
      category: 'structural_materials',
      description: '2x4 Stud - 8ft (wall framing)',
      formula: 'sqft × 0.18 × 1.10',
      calculation: `${sqft} × 0.18 × 1.10 = ${studs2x4Qty}`,
      quantity: studs2x4Qty,
      unit: 'EA',
      sku: studs2x4.sku,
      name: studs2x4.name,
      pricePerUnit: getProductPrice(studs2x4),
      totalCost: studs2x4Qty * getProductPrice(studs2x4)
    });
  }
  
  // 3. 2x6 Studs - exterior walls (EA)
  const studs2x6Qty = Math.ceil(perimeter * wallHeight / 1.33 / 8 * 1.10);
  const studs2x6 = await findProductByName('2x6', { tier });
  if (studs2x6) {
    items.push({
      category: 'structural_materials',
      description: '2x6 Stud - 8ft (exterior walls)',
      formula: 'perimeter × wallHeight / 1.33 / 8 × 1.10',
      calculation: `${perimeter} × ${wallHeight} / 1.33 / 8 × 1.10 = ${studs2x6Qty}`,
      quantity: studs2x6Qty,
      unit: 'EA',
      sku: studs2x6.sku,
      name: studs2x6.name,
      pricePerUnit: getProductPrice(studs2x6),
      totalCost: studs2x6Qty * getProductPrice(studs2x6)
    });
  }
  
  // 4. Plywood Sheathing - Walls (SHEET)
  const plywoodWallQty = Math.ceil(perimeter * wallHeight / 32 * 1.10);
  const plywoodWall = await findProductByName('OSB', { tier });
  if (plywoodWall) {
    items.push({
      category: 'structural_materials',
      description: 'OSB Sheathing - 4x8 (walls)',
      formula: 'perimeter × wallHeight / 32 × 1.10',
      calculation: `${perimeter} × ${wallHeight} / 32 × 1.10 = ${plywoodWallQty}`,
      quantity: plywoodWallQty,
      unit: 'SHEET',
      sku: plywoodWall.sku,
      name: plywoodWall.name,
      pricePerUnit: getProductPrice(plywoodWall),
      totalCost: plywoodWallQty * getProductPrice(plywoodWall)
    });
  }
  
  // 5. Plywood Sheathing - Roof (SHEET)
  const plywoodRoofQty = Math.ceil(roofArea / 32 * 1.10);
  const plywoodRoof = await findProductByName('CDX', { tier }) || await findProductByName('plywood', { tier });
  if (plywoodRoof) {
    items.push({
      category: 'structural_materials',
      description: 'Plywood Sheathing - 4x8 (roof)',
      formula: 'roofArea / 32 × 1.10',
      calculation: `${roofArea} / 32 × 1.10 = ${plywoodRoofQty}`,
      quantity: plywoodRoofQty,
      unit: 'SHEET',
      sku: plywoodRoof.sku,
      name: plywoodRoof.name,
      pricePerUnit: getProductPrice(plywoodRoof),
      totalCost: plywoodRoofQty * getProductPrice(plywoodRoof)
    });
  }
  
  // 6. Framing Nails (BOX)
  const nailsQty = Math.ceil(sqft / 100 / 5 * 1.10);
  const nails = await findProductByName('nail', { tier }) || await findProductByName('16d', { tier });
  if (nails) {
    items.push({
      category: 'fasteners_hardware',
      description: 'Framing nails - 16d (5lb box)',
      formula: 'sqft / 100 / 5 × 1.10',
      calculation: `${sqft} / 100 / 5 × 1.10 = ${nailsQty}`,
      quantity: nailsQty,
      unit: 'BOX',
      sku: nails.sku,
      name: nails.name,
      pricePerUnit: getProductPrice(nails),
      totalCost: nailsQty * getProductPrice(nails)
    });
  }
  
  // 7. Drywall (SHEET)
  const drywallQty = Math.ceil(((perimeter * wallHeight * 2) / 32 + sqft / 32) * 1.10);
  const drywall = await findProductByName('drywall', { tier });
  if (drywall) {
    items.push({
      category: 'drywall',
      description: 'Drywall 1/2" - 4x8 Sheet',
      formula: '((perimeter × wallHeight × 2) / 32 + sqft / 32) × 1.10',
      calculation: `((${perimeter} × ${wallHeight} × 2) / 32 + ${sqft} / 32) × 1.10 = ${drywallQty}`,
      quantity: drywallQty,
      unit: 'SHEET',
      sku: drywall.sku,
      name: drywall.name,
      pricePerUnit: getProductPrice(drywall),
      totalCost: drywallQty * getProductPrice(drywall)
    });
  }
  
  const totalCost = items.reduce((sum, item) => sum + item.totalCost, 0);
  
  console.log(`  ✅ ${items.length} line items, ${formatCurrency(totalCost)}`);
  
  return { items, totalCost };
}

/**
 * Calculate Envelope phase
 */
async function calculateEnvelope(measurements, selectionPackage) {
  const items = [];
  const { sqft, perimeter, wallHeight, roofArea, bedrooms, bathrooms } = measurements;
  const tier = selectionPackage.tier;
  
  console.log('📦 Envelope Phase...');
  
  // 1. Windows (EA)
  const windowsQty = Math.ceil(sqft / 200 + bedrooms + (bathrooms > 0 ? 1 : 0));
  const windows = await findProductByName('window', { tier });
  if (windows) {
    items.push({
      category: 'windows_doors',
      description: 'Windows - Double Hung',
      formula: 'sqft / 200 + bedrooms + 1',
      calculation: `${sqft} / 200 + ${bedrooms} + 1 = ${windowsQty}`,
      quantity: windowsQty,
      unit: 'EA',
      sku: windows.sku,
      name: windows.name,
      pricePerUnit: getProductPrice(windows),
      totalCost: windowsQty * getProductPrice(windows)
    });
  }
  
  // 2. Entry Door (EA)
  const entryDoor = await findProductByName('door', { tier });
  if (entryDoor) {
    items.push({
      category: 'windows_doors',
      description: 'Entry Door',
      formula: 'Fixed: 1 per house',
      calculation: '1',
      quantity: 1,
      unit: 'EA',
      sku: entryDoor.sku,
      name: entryDoor.name,
      pricePerUnit: getProductPrice(entryDoor),
      totalCost: getProductPrice(entryDoor)
    });
  }
  
  // 3. Roofing Shingles (SQ)
  const shinglesQty = Math.ceil(roofArea / 100 * 1.10);
  const shingles = await findProductByName('shingle', { tier }) || await findProductByName('roof', { tier });
  if (shingles) {
    items.push({
      category: 'roofing',
      description: 'Architectural Shingles',
      formula: 'roofArea / 100 × 1.10',
      calculation: `${roofArea} / 100 × 1.10 = ${shinglesQty}`,
      quantity: shinglesQty,
      unit: 'SQ',
      sku: shingles.sku,
      name: shingles.name,
      pricePerUnit: getProductPrice(shingles),
      totalCost: shinglesQty * getProductPrice(shingles)
    });
  }
  
  // 4. Underlayment (ROLL)
  const underlaymentQty = Math.ceil(roofArea / 400 * 1.10);
  const underlayment = await findProductByName('underlayment', { tier }) || await findProductByName('ice', { tier });
  if (underlayment) {
    items.push({
      category: 'roofing',
      description: 'Synthetic Underlayment',
      formula: 'roofArea / 400 × 1.10',
      calculation: `${roofArea} / 400 × 1.10 = ${underlaymentQty}`,
      quantity: underlaymentQty,
      unit: 'ROLL',
      sku: underlayment.sku,
      name: underlayment.name,
      pricePerUnit: getProductPrice(underlayment),
      totalCost: underlaymentQty * getProductPrice(underlayment)
    });
  }
  
  // 5. Siding/Stucco (SQ)
  const sidingQty = Math.ceil((perimeter * wallHeight - (windowsQty * 15 + 21 + 40)) / 100 * 1.10);
  const siding = await findProductByName('stucco', { tier }) || await findProductByName('siding', { tier });
  if (siding) {
    items.push({
      category: 'siding',
      description: 'Stucco Finish',
      formula: '(perimeter × wallHeight - openings) / 100 × 1.10',
      calculation: `(${perimeter} × ${wallHeight} - ${windowsQty * 15 + 61}) / 100 × 1.10 = ${sidingQty}`,
      quantity: sidingQty,
      unit: 'SQ',
      sku: siding.sku,
      name: siding.name,
      pricePerUnit: getProductPrice(siding),
      totalCost: sidingQty * getProductPrice(siding)
    });
  }
  
  // 6. Insulation - Wall (ROLL)
  const wallInsulationQty = Math.ceil(perimeter * wallHeight * 0.9 / 45 * 1.10);
  const wallInsulation = await findProductByName('insulation', { tier });
  if (wallInsulation) {
    items.push({
      category: 'insulation',
      description: 'Fiberglass Batt Insulation R-19',
      formula: 'perimeter × wallHeight × 0.9 / 45 × 1.10',
      calculation: `${perimeter} × ${wallHeight} × 0.9 / 45 × 1.10 = ${wallInsulationQty}`,
      quantity: wallInsulationQty,
      unit: 'ROLL',
      sku: wallInsulation.sku,
      name: wallInsulation.name,
      pricePerUnit: getProductPrice(wallInsulation),
      totalCost: wallInsulationQty * getProductPrice(wallInsulation)
    });
  }
  
  const totalCost = items.reduce((sum, item) => sum + item.totalCost, 0);
  
  console.log(`  ✅ ${items.length} line items, ${formatCurrency(totalCost)}`);
  
  return { items, totalCost };
}

/**
 * Calculate Interior Finish phase
 */
async function calculateInteriorFinish(measurements, selectionPackage) {
  const items = [];
  const { sqft, perimeter, wallHeight, bedrooms, bathrooms } = measurements;
  const tier = selectionPackage.tier;
  
  console.log('📦 Interior Finish Phase...');
  
  // 1. Flooring - Hardwood (CASE)
  const hardwoodArea = Math.round(sqft * 0.6); // Assume 60% hardwood
  const hardwoodQty = Math.ceil(hardwoodArea * 1.10 / 22);
  const hardwood = await findProductByName('hardwood', { tier }) || await findProductByName('floor', { tier });
  if (hardwood) {
    items.push({
      category: 'flooring',
      description: 'Engineered Hardwood',
      formula: 'hardwoodArea × 1.10 / 22',
      calculation: `${hardwoodArea} × 1.10 / 22 = ${hardwoodQty}`,
      quantity: hardwoodQty,
      unit: 'CASE',
      sku: hardwood.sku,
      name: hardwood.name,
      pricePerUnit: getProductPrice(hardwood),
      totalCost: hardwoodQty * getProductPrice(hardwood)
    });
  }
  
  // 2. Interior Paint (BUCKET)
  const interiorPaintQty = Math.ceil(((perimeter * wallHeight) + sqft) / 350 / 5 * 2 * 1.10);
  const interiorPaint = await findProductByName('paint', { tier });
  if (interiorPaint) {
    items.push({
      category: 'paint',
      description: 'Interior Paint - Satin (5-gal bucket)',
      formula: '((perimeter × wallHeight) + sqft) / 350 / 5 × 2 × 1.10',
      calculation: `((${perimeter} × ${wallHeight}) + ${sqft}) / 350 / 5 × 2 × 1.10 = ${interiorPaintQty}`,
      quantity: interiorPaintQty,
      unit: 'BUCKET',
      sku: interiorPaint.sku,
      name: interiorPaint.name,
      pricePerUnit: getProductPrice(interiorPaint),
      totalCost: interiorPaintQty * getProductPrice(interiorPaint)
    });
  }
  
  // 3. Lighting Fixtures (EA)
  const lightsQty = Math.ceil((bedrooms + Math.ceil(bathrooms)) * 4);
  const lights = await findProductByName('light', { tier }) || await findProductByName('recessed', { tier });
  if (lights) {
    items.push({
      category: 'lighting_fixtures',
      description: 'Recessed LED Light - 6"',
      formula: '(bedrooms + bathrooms) × 4',
      calculation: `(${bedrooms} + ${Math.ceil(bathrooms)}) × 4 = ${lightsQty}`,
      quantity: lightsQty,
      unit: 'EA',
      sku: lights.sku,
      name: lights.name,
      pricePerUnit: getProductPrice(lights),
      totalCost: lightsQty * getProductPrice(lights)
    });
  }
  
  // 4. Plumbing Fixtures - Faucets (EA)
  const faucetsQty = Math.ceil(bathrooms + 1); // Bathrooms + kitchen
  const faucets = await findProductByName('faucet', { tier });
  if (faucets) {
    items.push({
      category: 'plumbing_fixtures',
      description: 'Faucet',
      formula: 'bathrooms + 1 (kitchen)',
      calculation: `${bathrooms} + 1 = ${faucetsQty}`,
      quantity: faucetsQty,
      unit: 'EA',
      sku: faucets.sku,
      name: faucets.name,
      pricePerUnit: getProductPrice(faucets),
      totalCost: faucetsQty * getProductPrice(faucets)
    });
  }
  
  const totalCost = items.reduce((sum, item) => sum + item.totalCost, 0);
  
  console.log(`  ✅ ${items.length} line items, ${formatCurrency(totalCost)}`);
  
  return { items, totalCost };
}

export default {
  calculateBOM
};

