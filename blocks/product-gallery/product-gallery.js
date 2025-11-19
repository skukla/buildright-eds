// Product Gallery Block Decoration
import { getProductImageUrl } from '../../scripts/data-mock.js';

export default async function decorate(block) {
  const sku = block.getAttribute('data-sku');
  if (!sku) return;

  // Import product data
  const { getProductBySKU } = await import('../../scripts/data-mock.js');
  const product = await getProductBySKU(sku);
  if (!product) return;

  const mainImageEl = block.querySelector('#product-gallery-main-image');
  const thumbnailsContainer = block.querySelector('#product-gallery-thumbnails');
  const zoomBtn = block.querySelector('#product-gallery-zoom-btn');
  const lightbox = block.querySelector('#product-gallery-lightbox');
  const lightboxImage = block.querySelector('#product-gallery-lightbox-image');
  const lightboxClose = block.querySelector('#product-gallery-lightbox-close');

  // Get product image URL
  const imageUrl = getProductImageUrl(product);
  
  // For now, use single image. In future, could support multiple images
  // When multiple images are available, they would be passed here
  const images = imageUrl ? [imageUrl] : [];

  // Set main image or show placeholder
  if (mainImageEl) {
    if (images[0]) {
      mainImageEl.src = images[0];
      mainImageEl.alt = product.name || 'Product image';
      
      // Handle image load error - show placeholder
      mainImageEl.addEventListener('error', () => {
        mainImageEl.src = '';
        mainImageEl.classList.add('hidden');
        const wrapper = mainImageEl.closest('.product-gallery-image-wrapper');
        if (wrapper) {
          wrapper.classList.add('product-gallery-placeholder', 'image-placeholder-pattern');
        }
      });
    } else {
      // No image - show CSS placeholder
      mainImageEl.classList.add('hidden');
      const wrapper = mainImageEl.closest('.product-gallery-image-wrapper');
      if (wrapper) {
        wrapper.classList.add('product-gallery-placeholder');
      }
    }
  }

  // Create thumbnails
  if (thumbnailsContainer && images.length > 1) {
    images.forEach((imgUrl, index) => {
      const thumbnail = document.createElement('div');
      thumbnail.className = 'product-gallery-thumbnail';
      if (index === 0) thumbnail.classList.add('active');
      
      const img = document.createElement('img');
      img.src = imgUrl;
      img.alt = `${product.name || 'Product'} - Image ${index + 1}`;
      img.loading = index === 0 ? 'eager' : 'lazy';
      
      // Handle image load error - show placeholder
      img.addEventListener('error', () => {
        img.classList.add('hidden');
        thumbnail.classList.add('product-gallery-thumbnail-placeholder', 'image-placeholder-pattern');
      });
      
      thumbnail.appendChild(img);
      
      thumbnail.addEventListener('click', () => {
        // Don't update if this is a placeholder thumbnail
        if (thumbnail.classList.contains('product-gallery-thumbnail-placeholder')) {
          return;
        }
        
        // Update main image
        if (mainImageEl && img.src && !img.classList.contains('hidden')) {
          mainImageEl.src = imgUrl;
          mainImageEl.alt = img.alt;
          mainImageEl.classList.remove('hidden');
          
          // Remove placeholder class from wrapper if it exists
          const wrapper = mainImageEl.closest('.product-gallery-image-wrapper');
          if (wrapper) {
            wrapper.classList.remove('product-gallery-placeholder', 'image-placeholder-pattern');
          }
        }
        
        // Update active thumbnail
        thumbnailsContainer.querySelectorAll('.product-gallery-thumbnail').forEach(thumb => {
          thumb.classList.remove('active');
        });
        thumbnail.classList.add('active');
      });
      
      thumbnailsContainer.appendChild(thumbnail);
    });
  } else if (thumbnailsContainer && images.length === 1) {
    // Hide thumbnails if only one image
    thumbnailsContainer.classList.add('hidden');
  }

  // Zoom button click - open lightbox
  if (zoomBtn && mainImageEl) {
    zoomBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (mainImageEl.src && !mainImageEl.classList.contains('hidden')) {
        openLightbox(mainImageEl.src, mainImageEl.alt);
      }
    });
  }

  // Main image click - open lightbox (only if image exists)
  if (mainImageEl) {
    mainImageEl.addEventListener('click', () => {
      if (mainImageEl.src && !mainImageEl.classList.contains('hidden')) {
        openLightbox(mainImageEl.src, mainImageEl.alt);
      }
    });
  }
  
  // Prevent lightbox on placeholder wrapper click
  const imageWrapper = block.querySelector('.product-gallery-image-wrapper');
  if (imageWrapper) {
    imageWrapper.addEventListener('click', (e) => {
      if (imageWrapper.classList.contains('product-gallery-placeholder')) {
        e.stopPropagation();
      }
    });
  }

  // Lightbox close
  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  // Close lightbox on background click
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  // Close lightbox on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });

  function openLightbox(imageSrc, imageAlt) {
    if (lightbox && lightboxImage) {
      lightboxImage.src = imageSrc;
      lightboxImage.alt = imageAlt;
      lightbox.classList.add('active');
      document.body.classList.add('no-scroll');
    }
  }

  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.remove('active');
      document.body.classList.remove('no-scroll');
    }
  }
}

