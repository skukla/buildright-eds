/**
 * Validate Selection Package SKU Mappings
 * Ensures all SKUs in packages exist in the product database
 */

const fs = require('fs');
const path = require('path');

// Path to data files
const TEMPLATES_FILE = path.join(__dirname, '../../data/templates.json');
const ACO_PRODUCTS_FILE = '/Users/kukla/Documents/Repositories/app-builder/adobe-demo-system/buildright-aco/data/buildright/products.json';

// Load data
const templatesData = JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf-8'));
const products = JSON.parse(fs.readFileSync(ACO_PRODUCTS_FILE, 'utf-8'));

// Create SKU lookup
const productBySku = {};
products.forEach(p => {
  productBySku[p.sku] = p;
});

console.log('='.repeat(80));
console.log('SELECTION PACKAGE SKU VALIDATION');
console.log('='.repeat(80));
console.log();

let totalMappings = 0;
let validMappings = 0;
let invalidMappings = 0;
const errors = [];

// Validate each package
templatesData.packages.forEach((pkg, idx) => {
  console.log(`📦 Package ${idx + 1}: ${pkg.name}`);
  console.log(`   ID: ${pkg.id}`);
  console.log(`   Tier: ${pkg.tier}`);
  console.log(`   Added Cost: $${pkg.addedCost.toLocaleString()}`);
  console.log(`   Subdivision: ${pkg.subdivisionSpecific || 'Universal'}`);
  console.log();
  
  const mappings = Object.entries(pkg.skuMappings);
  let packageValid = 0;
  let packageInvalid = 0;
  
  mappings.forEach(([category, sku]) => {
    totalMappings++;
    const product = productBySku[sku];
    
    if (product) {
      validMappings++;
      packageValid++;
      const tier = product.attributes?.find(a => a.code === 'quality_tier')?.values?.[0] || 'unknown';
      console.log(`   ✅ ${category.padEnd(30)} → ${sku.padEnd(25)} (${tier})`);
    } else {
      invalidMappings++;
      packageInvalid++;
      console.log(`   ❌ ${category.padEnd(30)} → ${sku.padEnd(25)} NOT FOUND`);
      errors.push({
        package: pkg.name,
        category,
        sku,
        issue: 'SKU not found in product database'
      });
    }
  });
  
  console.log();
  console.log(`   Summary: ${packageValid}/${mappings.length} valid SKUs`);
  console.log();
  console.log('-'.repeat(80));
  console.log();
});

// Template validation
console.log('📄 TEMPLATE PACKAGE COMPATIBILITY');
console.log('-'.repeat(80));
templatesData.templates.forEach(template => {
  const compatible = template.compatiblePackages || [];
  const validPackages = compatible.filter(pkgId => 
    templatesData.packages.some(p => p.id === pkgId)
  );
  const invalidPackages = compatible.filter(pkgId => 
    !templatesData.packages.some(p => p.id === pkgId)
  );
  
  const status = invalidPackages.length === 0 ? '✅' : '❌';
  console.log(`${status} ${template.name.padEnd(30)} ${validPackages.length}/${compatible.length} valid packages`);
  
  if (invalidPackages.length > 0) {
    invalidPackages.forEach(pkgId => {
      errors.push({
        template: template.name,
        packageId: pkgId,
        issue: 'Referenced package does not exist'
      });
    });
  }
});

console.log();
console.log('='.repeat(80));
console.log('VALIDATION SUMMARY');
console.log('='.repeat(80));
console.log(`Total Packages:        ${templatesData.packages.length}`);
console.log(`Total SKU Mappings:    ${totalMappings}`);
console.log(`Valid Mappings:        ${validMappings} ✅`);
console.log(`Invalid Mappings:      ${invalidMappings} ${invalidMappings > 0 ? '❌' : ''}`);
console.log(`Total Templates:       ${templatesData.templates.length}`);
console.log();

if (errors.length > 0) {
  console.log('⚠️  ERRORS FOUND');
  console.log('-'.repeat(80));
  errors.forEach((err, idx) => {
    console.log(`${idx + 1}. ${err.issue}`);
    if (err.package) console.log(`   Package: ${err.package}`);
    if (err.template) console.log(`   Template: ${err.template}`);
    if (err.category) console.log(`   Category: ${err.category}`);
    if (err.sku) console.log(`   SKU: ${err.sku}`);
    if (err.packageId) console.log(`   Package ID: ${err.packageId}`);
    console.log();
  });
  console.log('='.repeat(80));
  console.log('❌ VALIDATION FAILED');
  process.exit(1);
} else {
  console.log('='.repeat(80));
  console.log('✅ ALL VALIDATIONS PASSED!');
  console.log('='.repeat(80));
}

