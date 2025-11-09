/**
 * Generate Simple SVG Product Images
 * Creates placeholder SVG images for each product type
 */

const fs = require('fs');
const path = require('path');

// Product image configurations
const imageConfigs = {
  'lumber_stud': {
    color: '#8B6F47',
    icon: `<rect x="30" y="20" width="140" height="160" fill="#A0826D" stroke="#6B5741" stroke-width="2"/>
           <line x1="100" y1="20" x2="100" y2="180" stroke="#6B5741" stroke-width="1" opacity="0.3"/>
           <line x1="60" y1="20" x2="60" y2="180" stroke="#6B5741" stroke-width="1" opacity="0.3"/>
           <line x1="140" y1="20" x2="140" y2="180" stroke="#6B5741" stroke-width="1" opacity="0.3"/>`,
    text: '2x4 LUMBER'
  },
  'lumber_joist': {
    color: '#7A5C3D',
    icon: `<rect x="20" y="40" width="160" height="40" fill="#8B6F47" stroke="#5C4433" stroke-width="2"/>
           <rect x="20" y="90" width="160" height="40" fill="#8B6F47" stroke="#5C4433" stroke-width="2"/>
           <rect x="20" y="140" width="160" height="40" fill="#8B6F47" stroke="#5C4433" stroke-width="2"/>`,
    text: 'JOISTS'
  },
  'plywood': {
    color: '#D4A574',
    icon: `<rect x="30" y="30" width="140" height="140" fill="#D4A574" stroke="#8B6F47" stroke-width="3"/>
           <line x1="30" y1="60" x2="170" y2="60" stroke="#8B6F47" stroke-width="1" opacity="0.2"/>
           <line x1="30" y1="90" x2="170" y2="90" stroke="#8B6F47" stroke-width="1" opacity="0.2"/>
           <line x1="30" y1="120" x2="170" y2="120" stroke="#8B6F47" stroke-width="1" opacity="0.2"/>
           <line x1="30" y1="150" x2="170" y2="150" stroke="#8B6F47" stroke-width="1" opacity="0.2"/>`,
    text: 'PLYWOOD'
  },
  'metal_stud': {
    color: '#8C8C8C',
    icon: `<rect x="40" y="30" width="30" height="140" fill="#A8A8A8" stroke="#6C6C6C" stroke-width="2"/>
           <rect x="80" y="30" width="30" height="140" fill="#A8A8A8" stroke="#6C6C6C" stroke-width="2"/>
           <rect x="120" y="30" width="30" height="140" fill="#A8A8A8" stroke="#6C6C6C" stroke-width="2"/>
           <line x1="40" y1="100" x2="150" y2="100" stroke="#6C6C6C" stroke-width="1" opacity="0.3"/>`,
    text: 'METAL STUD'
  },
  'drywall': {
    color: '#E8E8E8',
    icon: `<rect x="30" y="30" width="140" height="140" fill="#F5F5F5" stroke="#CCCCCC" stroke-width="2"/>
           <rect x="35" y="35" width="130" height="130" fill="none" stroke="#DDDDDD" stroke-width="1"/>
           <circle cx="100" cy="100" r="3" fill="#CCCCCC"/>`,
    text: 'DRYWALL'
  }
};

function generateSVG(config, productName) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${config.color};stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:${config.color};stop-opacity:0.6" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="200" height="200" fill="url(#bg)"/>
  
  <!-- Icon -->
  ${config.icon}
  
  <!-- Text -->
  <text x="100" y="195" font-family="Arial, sans-serif" font-size="12" font-weight="bold" 
        text-anchor="middle" fill="#333" opacity="0.7">${config.text}</text>
</svg>`;
}

// Read products
const productsPath = path.join(__dirname, '..', 'data', 'mock-products.json');
const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// Generate images and update product data
const imageMap = {};

for (const product of productsData.products) {
  let configKey;
  let fileName;
  
  // Determine which config to use based on product
  if (product.sku.startsWith('LBR-') && (product.name.includes('Stud') || product.name.includes('Post'))) {
    configKey = 'lumber_stud';
    fileName = 'lumber-stud.svg';
  } else if (product.sku.startsWith('LBR-')) {
    configKey = 'lumber_joist';
    fileName = 'lumber-joist.svg';
  } else if (product.sku.startsWith('PLY-')) {
    configKey = 'plywood';
    fileName = 'plywood.svg';
  } else if (product.sku.startsWith('STUD-')) {
    configKey = 'metal_stud';
    fileName = 'metal-stud.svg';
  } else if (product.sku.startsWith('DRYWALL-')) {
    configKey = 'drywall';
    fileName = 'drywall.svg';
  }
  
  if (configKey && !imageMap[fileName]) {
    const config = imageConfigs[configKey];
    const svg = generateSVG(config, product.name);
    const imagePath = path.join(__dirname, '..', 'images', 'products', fileName);
    fs.writeFileSync(imagePath, svg);
    imageMap[fileName] = true;
    console.log(`✓ Generated ${fileName}`);
  }
  
  // Update product with image URL
  product.image_url = `images/products/${fileName}`;
}

// Save updated products
fs.writeFileSync(productsPath, JSON.stringify(productsData, null, 2));

console.log('\n✅ Generated product images and updated mock-products.json');
console.log(`📁 Images saved to: buildright-eds/images/products/`);
console.log(`\nGenerated ${Object.keys(imageMap).length} unique SVG images`);

