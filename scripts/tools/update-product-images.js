/**
 * Update Product Images
 * Maps downloaded images to products in mock-products.json
 */

const fs = require('fs');
const path = require('path');

function main() {
  const productsPath = path.join(__dirname, '..', 'data', 'mock-products.json');
  const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  
  let updated = 0;
  
  for (const product of productsData.products) {
    let imageFile;
    
    // Map products to image files
    if (product.sku.startsWith('LBR-') && (product.name.includes('Stud') || product.name.includes('Post'))) {
      imageFile = 'lumber-stud.jpg';
    } else if (product.sku.startsWith('LBR-')) {
      imageFile = 'lumber-joist.jpg';
    } else if (product.sku.startsWith('PLY-')) {
      imageFile = 'plywood.jpg';
    } else if (product.sku.startsWith('STUD-')) {
      imageFile = 'metal-stud.jpg';
    } else if (product.sku.startsWith('DRYWALL-')) {
      imageFile = 'drywall.jpg';
    }
    
    if (imageFile) {
      // Check if file exists (try both .jpg and .svg)
      const imagesDir = path.join(__dirname, '..', 'images', 'products');
      const jpgPath = path.join(imagesDir, imageFile);
      const svgFile = imageFile.replace('.jpg', '.svg');
      const svgPath = path.join(imagesDir, svgFile);
      
      if (fs.existsSync(jpgPath)) {
        product.image_url = `images/products/${imageFile}`;
        updated++;
      } else if (fs.existsSync(svgPath)) {
        product.image_url = `images/products/${svgFile}`;
        updated++;
      }
    }
  }
  
  fs.writeFileSync(productsPath, JSON.stringify(productsData, null, 2));
  console.log(`✅ Updated ${updated} products with image URLs`);
}

main();

