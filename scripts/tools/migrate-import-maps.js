/**
 * Migrate Import Maps to EDS Standard
 *
 * Updates all HTML files to use the canonical import map pattern
 * pointing to /scripts/__dropins__/ directory.
 *
 * Run: node scripts/tools/migrate-import-maps.js
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Canonical import map (EDS standard)
const CANONICAL_IMPORT_MAP = `<script type="importmap">
{
  "imports": {
    "@dropins/tools/": "/scripts/__dropins__/tools/",
    "@dropins/storefront-auth/": "/scripts/__dropins__/storefront-auth/",
    "@dropins/storefront-cart/": "/scripts/__dropins__/storefront-cart/",
    "@dropins/storefront-checkout/": "/scripts/__dropins__/storefront-checkout/",
    "@dropins/storefront-order/": "/scripts/__dropins__/storefront-order/",
    "@dropins/storefront-pdp/": "/scripts/__dropins__/storefront-pdp/",
    "@dropins/storefront-product-discovery/": "/scripts/__dropins__/storefront-product-discovery/"
  }
}
</script>`;

// Regex to match existing import map scripts (multiline)
const IMPORT_MAP_REGEX = /<script\s+type="importmap"[^>]*>[\s\S]*?<\/script>/gi;

// Also match any comments about import maps right before
const IMPORT_MAP_WITH_COMMENTS_REGEX = /(\s*<!--[^>]*[Ii]mport\s*[Mm]ap[^>]*-->\s*)?<script\s+type="importmap"[^>]*>[\s\S]*?<\/script>/gi;

async function migrateImportMaps() {
  console.log('');
  console.log('🔄 Migrating import maps to EDS standard...');
  console.log('');

  const rootDir = path.join(__dirname, '..', '..');

  // Find all HTML files
  const htmlFiles = await glob('**/*.html', {
    cwd: rootDir,
    ignore: ['node_modules/**', 'scripts/__dropins__/**'],
    absolute: true
  });

  let updatedCount = 0;
  let skippedCount = 0;

  for (const filePath of htmlFiles) {
    const relativePath = path.relative(rootDir, filePath);
    let content = fs.readFileSync(filePath, 'utf8');

    // Check if file has an import map
    if (!IMPORT_MAP_REGEX.test(content)) {
      continue;
    }

    // Reset regex lastIndex
    IMPORT_MAP_REGEX.lastIndex = 0;
    IMPORT_MAP_WITH_COMMENTS_REGEX.lastIndex = 0;

    // Skip head.html (it's the source of truth)
    if (relativePath === 'head.html') {
      console.log(`  ⏭️  ${relativePath} (source of truth, skipped)`);
      skippedCount++;
      continue;
    }

    // Replace old import map with canonical one
    const newContent = content.replace(
      IMPORT_MAP_WITH_COMMENTS_REGEX,
      `<!-- Commerce Dropins Import Map (EDS Standard) -->
  ${CANONICAL_IMPORT_MAP}`
    );

    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`  ✅ ${relativePath}`);
      updatedCount++;
    } else {
      console.log(`  ⏭️  ${relativePath} (no changes needed)`);
      skippedCount++;
    }
  }

  console.log('');
  console.log(`✅ Updated ${updatedCount} files`);
  console.log(`⏭️  Skipped ${skippedCount} files`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. Run: npm run install:dropins');
  console.log('  2. Test: npm run serve');
  console.log('');
}

migrateImportMaps().catch(console.error);
