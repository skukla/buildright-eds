/**
 * Download Product Images from Unsplash
 * Uses actual Unsplash photo IDs for photo-realistic product images
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Verified Unsplash Photo IDs for each product type
const productImageMap = {
  // Lumber Studs - Photo ID P6V6liXycW4 (wood with nail)
  'lumber_stud': 'P6V6liXycW4',
  // Lumber Joists - Photo ID gO7ED0LX0bM (white wooden plank)
  'lumber_joist': 'gO7ED0LX0bM',
  // Plywood - Photo ID MV2yfBgOkOk (brown wooden surface)
  'plywood': 'MV2yfBgOkOk',
  // Metal Studs - Photo ID h57adCyVoLU (close up of wall made of wood - has industrial look)
  'metal_stud': 'h57adCyVoLU',
  // Drywall - Photo ID PuIAy6JegRI (wooden structure under construction)
  'drywall': 'PuIAy6JegRI'
};

function downloadImage(photoId, filename) {
  return new Promise((resolve, reject) => {
    // Unsplash download URL format
    const url = `https://images.unsplash.com/photo-${photoId}?w=800&h=600&fit=crop&auto=format&q=80`;
    
    const outputPath = path.join(__dirname, '..', 'images', 'products', filename);
    const file = fs.createWriteStream(outputPath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log('Downloading photo-realistic product images from Unsplash...\n');
  
  // Create images directory if it doesn't exist
  const imagesDir = path.join(__dirname, '..', 'images', 'products');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  
  // Download images
  const downloads = [
    downloadImage(productImageMap.lumber_stud, 'lumber-stud.jpg'),
    downloadImage(productImageMap.lumber_joist, 'lumber-joist.jpg'),
    downloadImage(productImageMap.plywood, 'plywood.jpg'),
    downloadImage(productImageMap.metal_stud, 'metal-stud.jpg'),
    downloadImage(productImageMap.drywall, 'drywall.jpg')
  ];
  
  try {
    await Promise.all(downloads);
    console.log('\n✅ All images downloaded successfully!');
    console.log('📁 Images saved to: buildright-eds/images/products/\n');
    
    // Update product data
    updateProductData();
  } catch (error) {
    console.error('❌ Error downloading images:', error.message);
    process.exit(1);
  }
}

function updateProductData() {
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
      product.image_url = `images/products/${imageFile}`;
      updated++;
    }
  }
  
  fs.writeFileSync(productsPath, JSON.stringify(productsData, null, 2));
  console.log(`📝 Updated ${updated} products with image URLs`);
}

main();

