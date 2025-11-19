// Block injection build script for EDS preparation
// Injects reusable blocks into HTML files at build time

const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

const BLOCKS_DIR = 'blocks';
const BLOCK_PLACEHOLDER = /<!-- block:(.*?) -->/g;

// Ignore patterns for files we don't want to process
const IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/.git/**',
  '**/docs/**',
  '**/*.md',
  '**/404.html'
];

function loadBlock(blockName) {
  const blockPath = path.join(BLOCKS_DIR, blockName.trim(), `${blockName.trim()}.html`);
  
  if (!fs.existsSync(blockPath)) {
    console.error(`Warning: Block not found: ${blockPath}`);
    return `<!-- Error: Block "${blockName.trim()}" not found -->`;
  }
  
  return fs.readFileSync(blockPath, 'utf8');
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Replace all block placeholders
  content = content.replace(BLOCK_PLACEHOLDER, (match, blockName) => {
    console.log(`  Injecting block: ${blockName.trim()} into ${filePath}`);
    return loadBlock(blockName);
  });
  
  // Only write if content changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Processed: ${filePath}`);
  }
}

// Main execution
console.log('Starting block injection...\n');

// Find all HTML files, excluding ignored patterns
const htmlFiles = globSync('**/*.html', {
  ignore: IGNORE_PATTERNS
});

if (htmlFiles.length === 0) {
  console.log('No HTML files found to process.');
  process.exit(0);
}

console.log(`Found ${htmlFiles.length} HTML file(s) to process:\n`);

htmlFiles.forEach(processFile);

console.log('\n✓ Block injection complete!');

