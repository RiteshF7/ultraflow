/**
 * Banner Image Generator - Image Download Utilities
 * Handles conversion and downloading of base64 images
 */

/**
 * Check if data is SVG
 */
function isSVGData(base64Data: string): boolean {
  return base64Data.includes('data:image/svg+xml');
}

/**
 * Convert SVG to PNG using canvas
 */
async function convertSVGToPNG(svgDataUrl: string, width = 1200, height = 630): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Draw image on canvas
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to PNG data URL
      const pngDataUrl = canvas.toDataURL('image/png');
      resolve(pngDataUrl);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load SVG image'));
    };
    
    img.src = svgDataUrl;
  });
}

/**
 * Convert base64 string to Blob object
 */
export function createImageBlob(base64Data: string): Blob {
  // Remove data URL prefix if present
  const base64String = base64Data.replace(/^data:image\/[\w+\-]+;base64,/, '');
  
  // Convert base64 to binary
  const binaryString = atob(base64String);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return new Blob([bytes], { type: 'image/png' });
}

/**
 * Download base64 image as PNG file
 */
export async function downloadBase64Image(base64Data: string, filename: string): Promise<void> {
  try {
    let finalDataUrl = base64Data;
    
    // Convert SVG to PNG if necessary
    if (isSVGData(base64Data)) {
      console.log('Converting SVG to PNG for download...');
      finalDataUrl = await convertSVGToPNG(base64Data);
    }
    
    const blob = createImageBlob(finalDataUrl);
    const url = URL.createObjectURL(blob);
    
    // Create temporary download link
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download image:', error);
    throw new Error('Image download failed');
  }
}

/**
 * Create a data URL from base64 string
 */
export function createImageDataUrl(base64Data: string): string {
  // Add data URL prefix if not present
  if (base64Data.startsWith('data:image/')) {
    return base64Data;
  }
  return `data:image/png;base64,${base64Data}`;
}

/**
 * Generate filename from article title or timestamp
 */
export function generateImageFilename(articleTitle?: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  
  if (articleTitle) {
    // Sanitize title for filename
    const sanitized = articleTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
    return `banner-${sanitized}-${timestamp}`;
  }
  
  return `banner-${timestamp}`;
}

