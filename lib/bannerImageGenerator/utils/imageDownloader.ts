/**
 * Banner Image Generator - Image Download Utilities
 * Handles conversion and downloading of base64 images
 */

/**
 * Convert base64 string to Blob object
 */
export function createImageBlob(base64Data: string): Blob {
  // Remove data URL prefix if present
  const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');
  
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
export function downloadBase64Image(base64Data: string, filename: string): void {
  try {
    const blob = createImageBlob(base64Data);
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

