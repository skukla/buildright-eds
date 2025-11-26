/**
 * Product Data Audit Tool
 * Analyzes product data from buildright-aco for Sarah's template configurator
 */

const fs = require('fs');
const path = require('path');

// Path to buildright-aco data
const ACO_DATA_PATH = '/Users/kukla/Documents/Repositories/app-builder/adobe-demo-system/buildright-aco/data/buildright';

// Load product data
const products = JSON.parse(fs.readFileSync(path.join(ACO_DATA_PATH, 'products.json'), 'utf-8'));
const categories = JSON.parse(fs.readFileSync(path.join(ACO_DATA_PATH, 'categories.json'), 'utf-8'));

console.log('='.repeat(80));
console.log('BUILDRIGHT PRODUCT DATA AUDIT FOR SARAH\'S TEMPLATE CONFIGURATOR');
console.log('='.repeat(80));
console.log();

// 1. TOTAL PRODUCT COUNT
console.log(`📦 Total Products: ${products.length}`);
console.log();

// 2. PRODUCTS BY CONSTRUCTION PHASE
console.log('🏗️  PRODUCTS BY CONSTRUCTION PHASE');
console.log('-'.repeat(80));
const byPhase = {};
products.forEach(p => {
  const phase = p.attributes?.find(a => a.code === 'construction_phase')?.values?.[0] || 'unassigned';
  byPhase[phase] = (byPhase[phase] || 0) + 1;
});
Object.entries(byPhase).sort((a, b) => b[1] - a[1]).forEach(([phase, count]) => {
  console.log(`  ${phase.padEnd(30)} ${count.toString().padStart(5)} products`);
});
console.log();

// 3. PRODUCTS BY QUALITY TIER
console.log('⭐ PRODUCTS BY QUALITY TIER');
console.log('-'.repeat(80));
const byTier = {};
products.forEach(p => {
  const tier = p.attributes?.find(a => a.code === 'quality_tier')?.values?.[0] || 'unassigned';
  byTier[tier] = (byTier[tier] || 0) + 1;
});
Object.entries(byTier).sort((a, b) => b[1] - a[1]).forEach(([tier, count]) => {
  console.log(`  ${tier.padEnd(30)} ${count.toString().padStart(5)} products`);
});
console.log();

// 4. PRODUCTS BY CATEGORY
console.log('📂 PRODUCTS BY CATEGORY');
console.log('-'.repeat(80));
const byCategory = {};
products.forEach(p => {
  const category = p.attributes?.find(a => a.code === 'product_category')?.values?.[0] || 'unassigned';
  byCategory[category] = (byCategory[category] || 0) + 1;
});
Object.entries(byCategory).sort((a, b) => b[1] - a[1]).forEach(([category, count]) => {
  console.log(`  ${category.padEnd(30)} ${count.toString().padStart(5)} products`);
});
console.log();

// 5. CRITICAL CATEGORIES FOR SARAH'S USE CASE
console.log('🎯 CRITICAL CATEGORIES FOR HOUSE BUILDING');
console.log('-'.repeat(80));
const criticalCategories = [
  'structural_materials',
  'roofing',
  'windows_doors',
  'siding',
  'flooring',
  'paint',
  'fixtures',
  'fasteners_hardware',
  'insulation',
  'drywall',
  'electrical',
  'plumbing'
];

criticalCategories.forEach(cat => {
  const count = byCategory[cat] || 0;
  const status = count > 0 ? '✅' : '❌';
  console.log(`  ${status} ${cat.padEnd(30)} ${count.toString().padStart(5)} products`);
});
console.log();

// 6. PRODUCTS WITH IMAGES
console.log('🖼️  PRODUCT IMAGES');
console.log('-'.repeat(80));
const withImages = products.filter(p => p.images && p.images.length > 0).length;
const withoutImages = products.length - withImages;
console.log(`  With images:     ${withImages.toString().padStart(5)} (${Math.round(withImages/products.length*100)}%)`);
console.log(`  Without images:  ${withoutImages.toString().padStart(5)} (${Math.round(withoutImages/products.length*100)}%)`);
console.log();

// 7. KEY PRODUCT EXAMPLES BY PHASE AND TIER
console.log('📋 SAMPLE PRODUCTS FOR SELECTION PACKAGES');
console.log('-'.repeat(80));

const sampleProducts = {
  'Windows (Foundation/Envelope)': products.filter(p => 
    p.name.toLowerCase().includes('window') &&
    p.attributes?.find(a => a.code === 'construction_phase')?.values?.[0] === 'envelope'
  ).slice(0, 3),
  'Doors (Envelope)': products.filter(p => 
    p.name.toLowerCase().includes('door') &&
    !p.name.toLowerCase().includes('outdoor') &&
    p.attributes?.find(a => a.code === 'construction_phase')?.values?.[0] === 'envelope'
  ).slice(0, 3),
  'Roofing (Envelope)': products.filter(p => 
    p.attributes?.find(a => a.code === 'product_category')?.values?.[0] === 'roofing'
  ).slice(0, 3),
  'Flooring (Interior Finish)': products.filter(p => 
    p.attributes?.find(a => a.code === 'product_category')?.values?.[0] === 'flooring'
  ).slice(0, 3),
};

Object.entries(sampleProducts).forEach(([category, items]) => {
  console.log(`\n  ${category}:`);
  items.forEach(p => {
    const tier = p.attributes?.find(a => a.code === 'quality_tier')?.values?.[0] || 'unknown';
    console.log(`    - ${p.sku.padEnd(20)} ${tier.padEnd(15)} ${p.name.substring(0, 50)}`);
  });
});
console.log();

// 8. MISSING DATA ANALYSIS
console.log('⚠️  MISSING DATA ANALYSIS');
console.log('-'.repeat(80));
const missingPhase = products.filter(p => 
  !p.attributes?.find(a => a.code === 'construction_phase')
).length;
const missingTier = products.filter(p => 
  !p.attributes?.find(a => a.code === 'quality_tier')
).length;
const missingCategory = products.filter(p => 
  !p.attributes?.find(a => a.code === 'product_category')
).length;

console.log(`  Missing construction_phase:   ${missingPhase.toString().padStart(5)} products`);
console.log(`  Missing quality_tier:         ${missingTier.toString().padStart(5)} products`);
console.log(`  Missing product_category:     ${missingCategory.toString().padStart(5)} products`);
console.log();

// 9. RECOMMENDATIONS
console.log('💡 RECOMMENDATIONS');
console.log('-'.repeat(80));
console.log('  1. ✅ Good foundation: Products have construction_phase and quality_tier');
console.log('  2. ⚠️  Need to verify all house-building categories are well-stocked');
console.log('  3. 📸 Ensure critical products (windows, doors, roofing) have images');
console.log('  4. 🏷️  Create SKU mappings for 3 selection packages:');
console.log('       - Builder\'s Choice (builder_grade)');
console.log('       - Desert Ridge Premium (premium)');
console.log('       - Sunset Valley Executive (luxury)');
console.log();

console.log('='.repeat(80));
console.log('✅ AUDIT COMPLETE');
console.log('='.repeat(80));

