#!/usr/bin/env node
/**
 * Generate Bill of Materials (BOM) for a Template
 * 
 * Uses the BOM Calculator service to generate a complete, realistic BOM
 * for any house template with dynamic product lookup from ACO.
 * 
 * Usage:
 *   node scripts/generate-bom.js <templateId> <packageId>
 *   node scripts/generate-bom.js sedona premium-select
 *   node scripts/generate-bom.js --all  # Generate for all templates
 * 
 * @module scripts/generate-bom
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateBOM } from './services/bom-calculator.js';
import templatesData from '../data/templates.json' assert { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../data/boms');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`Created output directory: ${OUTPUT_DIR}`);
}

/**
 * Format currency
 */
function formatCurrency(amount) {
  return `$${(amount || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/**
 * Generate BOM for a single template + package
 */
async function generateSingleBOM(templateId, packageId) {
  const template = templatesData.templates.find(t => t.id === templateId);
  const selectionPackage = templatesData.packages.find(p => p.id === packageId);
  
  if (!template) {
    console.error(`❌ Template '${templateId}' not found`);
    return false;
  }
  
  if (!selectionPackage) {
    console.error(`❌ Package '${packageId}' not found`);
    return false;
  }
  
  try {
    // Calculate BOM
    const bom = await calculateBOM(template, selectionPackage);
    
    // Print summary
    console.log('');
    console.log('='.repeat(70));
    console.log('BOM SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total Line Items: ${bom.summary.totalItems}`);
    console.log(`Total Cost: ${formatCurrency(bom.summary.totalCost)}`);
    console.log('');
    console.log('By Phase:');
    console.log(`  Foundation & Framing: ${formatCurrency(bom.summary.costByPhase.foundation_framing)} (${(bom.summary.costByPhase.foundation_framing / bom.summary.totalCost * 100).toFixed(0)}%)`);
    console.log(`  Envelope: ${formatCurrency(bom.summary.costByPhase.envelope)} (${(bom.summary.costByPhase.envelope / bom.summary.totalCost * 100).toFixed(0)}%)`);
    console.log(`  Interior Finish: ${formatCurrency(bom.summary.costByPhase.interior_finish)} (${(bom.summary.costByPhase.interior_finish / bom.summary.totalCost * 100).toFixed(0)}%)`);
    console.log('='.repeat(70));
    console.log('');
    
    // Save to file
    const filename = `${templateId}-${packageId}.json`;
    const outputPath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(outputPath, JSON.stringify(bom, null, 2), 'utf8');
    
    console.log(`✅ BOM saved to: ${outputPath}`);
    console.log('');
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to generate BOM:`, error.message);
    return false;
  }
}

/**
 * Generate BOMs for all templates × packages
 */
async function generateAllBOMs() {
  console.log('');
  console.log('='.repeat(70));
  console.log('GENERATING BOMs FOR ALL TEMPLATES');
  console.log('='.repeat(70));
  console.log('');
  console.log(`Templates: ${templatesData.templates.length}`);
  console.log(`Packages: ${templatesData.packages.length}`);
  console.log(`Total BOMs: ${templatesData.templates.length * templatesData.packages.length}`);
  console.log('');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const template of templatesData.templates) {
    for (const pkg of templatesData.packages) {
      console.log(`Generating: ${template.name} × ${pkg.name}...`);
      const success = await generateSingleBOM(template.id, pkg.id);
      
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }
  }
  
  console.log('');
  console.log('='.repeat(70));
  console.log('GENERATION COMPLETE');
  console.log('='.repeat(70));
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log('');
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/generate-bom.js <templateId> <packageId>');
    console.log('  node scripts/generate-bom.js sedona premium-select');
    console.log('  node scripts/generate-bom.js --all');
    console.log('');
    console.log('Available Templates:');
    templatesData.templates.forEach(t => {
      console.log(`  - ${t.id}: ${t.name}`);
    });
    console.log('');
    console.log('Available Packages:');
    templatesData.packages.forEach(p => {
      console.log(`  - ${p.id}: ${p.name}`);
    });
    console.log('');
    process.exit(0);
  }
  
  if (args[0] === '--all') {
    await generateAllBOMs();
  } else {
    const templateId = args[0];
    const packageId = args[1];
    
    if (!packageId) {
      console.error('❌ Error: Please specify both templateId and packageId');
      console.log('Example: node scripts/generate-bom.js sedona premium-select');
      process.exit(1);
    }
    
    await generateSingleBOM(templateId, packageId);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

