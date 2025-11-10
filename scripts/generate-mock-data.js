// Script to generate mock-products.json from BuildRight ACO data
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to source data
const productsPath = path.join(__dirname, '../../buildright-aco/data/buildright/products.json');
const pricesPath = path.join(__dirname, '../../buildright-aco/data/buildright/prices.json');
const inventoryPath = path.join(__dirname, '../../buildright-aco/data/buildright/inventory.json');
const categoriesPath = path.join(__dirname, '../../buildright-aco/data/buildright/categories.json');
const sourcesPath = path.join(__dirname, '../../buildright-aco/data/buildright/sources.json');

// Read source data
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
const prices = JSON.parse(fs.readFileSync(pricesPath, 'utf8'));
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
const sources = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'));

// Helper to extract attribute value
function getAttribute(product, code) {
  const attr = product.attributes?.find(a => a.code === code);
  return attr?.value || null;
}

// Helper to get base price for a SKU
function getBasePriceForSKU(sku) {
  const skuPrice = prices.find(p => p.sku === sku);
  return skuPrice?.amount || 0;
}

// Helper to get inventory for a SKU
function getInventoryForSKU(sku) {
  const inv = inventory.find(i => i.sku === sku);
  if (!inv) return {};
  
  const invMap = {};
  inv.sources?.forEach(source => {
    invMap[source.source_code] = source.quantity || 0;
  });
  
  return invMap;
}

// Convert products to mock format
const mockProducts = [];
const processedSKUs = new Set();

// Define target categories and how many products per category
const targetCategories = [
  'structural_materials',
  'framing_drywall', 
  'windows_doors',
  'fasteners_hardware',
  'roofing'
];

// Get 4 products from each category (20 total)
targetCategories.forEach(targetCategory => {
  const categoryProducts = products
    .filter(p => {
      const category = getAttribute(p, 'product_category');
      return p.type === 'simple' && 
             !processedSKUs.has(p.sku) && 
             category === targetCategory;
    })
    .slice(0, 4);
  
  categoryProducts.forEach(product => {
    processedSKUs.add(product.sku);
    
    const projectTypes = getAttribute(product, 'project_types') || [];
    const category = getAttribute(product, 'product_category') || 'structural_materials';
    const brand = getAttribute(product, 'brand') || 'BuildRight';
    
    // Get base price
    const basePrice = getBasePriceForSKU(product.sku) || product.price || 0;
    
    // Build pricing object with tier-based discounts
    // Commercial-Tier1: 3% discount
    // Commercial-Tier2: 5% discount  
    // Residential-Builder: 3% discount
    // Pro-Specialty: 2% discount
    const pricing = {
      base: basePrice,
      commercial_tier1: {
        '1-99': Math.round(basePrice * 0.97 * 100) / 100,
        '100-293': Math.round(basePrice * 0.95 * 100) / 100,
        '294+': Math.round(basePrice * 0.93 * 100) / 100
      },
      commercial_tier2: {
        '1-99': Math.round(basePrice * 0.95 * 100) / 100,
        '100-293': Math.round(basePrice * 0.93 * 100) / 100,
        '294+': Math.round(basePrice * 0.90 * 100) / 100
      },
      residential_builder: {
        '1-99': basePrice,
        '100-293': Math.round(basePrice * 0.97 * 100) / 100,
        '294+': Math.round(basePrice * 0.95 * 100) / 100
      },
      pro_specialty: {
        '1-99': basePrice,
        '100-293': Math.round(basePrice * 0.98 * 100) / 100,
        '294+': Math.round(basePrice * 0.96 * 100) / 100
      }
    };
    
    // Get inventory
    const invMap = getInventoryForSKU(product.sku);
    
    // Build attributes object
    const attributes = {};
    product.attributes?.forEach(attr => {
      if (attr.code !== 'project_types' && attr.code !== 'product_category' && attr.code !== 'brand') {
        const key = attr.code.replace(/_/g, ' ');
        attributes[key] = Array.isArray(attr.value) ? attr.value.join(', ') : attr.value;
      }
    });
    
    // Create description
    const description = `${product.name}. ${category.replace(/_/g, ' ')} product${brand !== 'BuildRight' ? ` from ${brand}` : ''}.`;
    
    // Determine image based on category
    let imageUrl = 'images/products/default.svg';
    if (category.includes('structural')) imageUrl = 'images/products/lumber-stud.svg';
    else if (category.includes('framing') || category.includes('drywall')) imageUrl = 'images/products/drywall.svg';
    else if (category.includes('windows')) imageUrl = 'images/products/window.svg';
    else if (category.includes('fasteners')) imageUrl = 'images/products/fastener.svg';
    else if (category.includes('roofing')) imageUrl = 'images/products/default.svg';
    
    mockProducts.push({
      sku: product.sku,
      name: product.name,
      category: category,
      project_types: Array.isArray(projectTypes) ? projectTypes : [projectTypes].filter(Boolean),
      description: description,
      pricing: pricing,
      inventory: {
        warehouse_west: invMap.warehouse_west || 0,
        warehouse_east: invMap.warehouse_east || 0,
        warehouse_phoenix: invMap.warehouse_phoenix || 0,
        warehouse_denver: invMap.warehouse_denver || 0,
        warehouse_atlanta: invMap.warehouse_atlanta || 0,
        dropship_premium_windows: invMap.dropship_premium_windows || 0
      },
      attributes: attributes,
      image_url: imageUrl
    });
  });
});

// Build categories list
const mockCategories = categories.map(cat => ({
  id: cat.categoryId,
  name: cat.name
}));

// Build warehouses list
const mockWarehouses = sources.map(source => ({
  id: source.source_code,
  name: source.name,
  location: source.location || source.name,
  priority: source.priority || 1
}));

// Write output
const output = {
  products: mockProducts,
  categories: mockCategories,
  warehouses: mockWarehouses
};

const outputPath = path.join(__dirname, '../data/mock-products.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`Generated ${mockProducts.length} products`);
console.log(`Generated ${mockCategories.length} categories`);
console.log(`Generated ${mockWarehouses.length} warehouses`);
console.log(`Output written to: ${outputPath}`);

