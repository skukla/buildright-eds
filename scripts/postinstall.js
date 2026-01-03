/**
 * Postinstall Script - Copy Dropin Packages to __dropins__
 *
 * Following Adobe EDS Commerce Boilerplate standard pattern.
 * Copies @dropins/* packages from node_modules to scripts/__dropins__/
 * for browser import map resolution.
 *
 * @see https://github.com/hlxsites/aem-boilerplate-commerce
 */

const fs = require('fs');
const path = require('path');

const DROPINS_DIR = path.join(__dirname, '__dropins__');
const NODE_MODULES = path.join(__dirname, '..', 'node_modules', '@dropins');

// List of dropin packages to copy
const DROPIN_PACKAGES = [
  'storefront-auth',
  'storefront-cart',
  'storefront-checkout',
  'storefront-order',
  'storefront-pdp',
  'storefront-product-discovery',
  'tools'
];

/**
 * Recursively copy directory
 */
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`  ⚠️  Source not found: ${src}`);
    return false;
  }

  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }

  return true;
}

/**
 * Main postinstall function
 */
function postinstall() {
  console.log('');
  console.log('📦 Copying @dropins packages to scripts/__dropins__/');
  console.log('');

  // Create __dropins__ directory if it doesn't exist
  if (fs.existsSync(DROPINS_DIR)) {
    console.log('  Cleaning existing __dropins__ directory...');
    fs.rmSync(DROPINS_DIR, { recursive: true });
  }
  fs.mkdirSync(DROPINS_DIR, { recursive: true });

  // Copy each package
  let successCount = 0;
  let failCount = 0;

  for (const pkg of DROPIN_PACKAGES) {
    const src = path.join(NODE_MODULES, pkg);
    const dest = path.join(DROPINS_DIR, pkg);

    process.stdout.write(`  @dropins/${pkg}... `);

    if (copyDir(src, dest)) {
      console.log('✅');
      successCount++;
    } else {
      console.log('❌ (not installed)');
      failCount++;
    }
  }

  console.log('');
  console.log(`✅ Copied ${successCount} packages to scripts/__dropins__/`);

  if (failCount > 0) {
    console.log(`⚠️  ${failCount} packages not found (run npm install first)`);
  }

  console.log('');
}

// Run
postinstall();
