/**
 * Download utilities for SVG and PNG export
 */

/**
 * Remove file extension from filename
 */
function stripExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex > 0) {
    return filename.substring(0, lastDotIndex);
  }
  return filename;
}

/**
 * Download SVG element as .svg file
 */
export function downloadSvg(svgElement: SVGSVGElement | null, filename: string): void {
  if (!svgElement) {
    console.error('No SVG element provided');
    return;
  }

  try {
    // Clone the SVG to avoid modifying the original
    const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
    
    // Get the intrinsic SVG dimensions (not the rendered/cropped dimensions)
    const viewBox = svgElement.getAttribute('viewBox');
    let actualWidth: number;
    let actualHeight: number;
    
    if (viewBox) {
      // Use viewBox dimensions for accurate sizing
      const [, , width, height] = viewBox.split(' ').map(Number);
      actualWidth = width;
      actualHeight = height;
    } else {
      // Fallback to width/height attributes or defaults
      actualWidth = parseFloat(svgElement.getAttribute('width') || '800');
      actualHeight = parseFloat(svgElement.getAttribute('height') || '600');
    }
    
    // Add margin (10% padding around the content)
    const margin = Math.max(actualWidth, actualHeight) * 0.1;
    const paddedWidth = actualWidth + (margin * 2);
    const paddedHeight = actualHeight + (margin * 2);
    
    // Set explicit dimensions with padding
    clonedSvg.setAttribute('width', `${paddedWidth}`);
    clonedSvg.setAttribute('height', `${paddedHeight}`);
    clonedSvg.setAttribute('viewBox', `0 0 ${paddedWidth} ${paddedHeight}`);
    
    // Center the content within the padded area
    const g = clonedSvg.querySelector('g');
    if (g) {
      g.setAttribute('transform', `translate(${margin}, ${margin})`);
    }
    
    // Serialize the SVG
    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    // Create download link with proper extension
    const link = document.createElement('a');
    link.href = url;
    link.download = `${stripExtension(filename)}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading SVG:', error);
    throw error;
  }
}

/**
 * Download SVG element as .png file
 * Uses proper dimensions with margins for better quality
 */
export async function downloadPng(svgElement: SVGSVGElement | null, filename: string): Promise<void> {
  if (!svgElement) {
    console.error('No SVG element provided');
    return;
  }

  return new Promise((resolve, reject) => {
    try {
      // Clone the SVG
      const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
      
      // Get the intrinsic SVG dimensions (not the rendered/cropped dimensions)
      const viewBox = svgElement.getAttribute('viewBox');
      let actualWidth: number;
      let actualHeight: number;
      
      if (viewBox) {
        // Use viewBox dimensions for accurate sizing
        const [, , width, height] = viewBox.split(' ').map(Number);
        actualWidth = width;
        actualHeight = height;
      } else {
        // Fallback to width/height attributes or defaults
        actualWidth = parseFloat(svgElement.getAttribute('width') || '800');
        actualHeight = parseFloat(svgElement.getAttribute('height') || '600');
      }
      
      // Add margin (10% padding around the content)
      const margin = Math.max(actualWidth, actualHeight) * 0.1;
      const paddedWidth = actualWidth + (margin * 2);
      const paddedHeight = actualHeight + (margin * 2);
      
      // Set explicit dimensions with padding
      clonedSvg.setAttribute('width', `${paddedWidth}`);
      clonedSvg.setAttribute('height', `${paddedHeight}`);
      clonedSvg.setAttribute('viewBox', `0 0 ${paddedWidth} ${paddedHeight}`);
      
      // Center the content within the padded area
      const g = clonedSvg.querySelector('g');
      if (g) {
        g.setAttribute('transform', `translate(${margin}, ${margin})`);
      }
      
      // Inline all styles to avoid external dependencies
      const styles = clonedSvg.querySelectorAll('style');
      styles.forEach(style => {
        style.textContent = style.textContent || '';
      });
      
      // Serialize SVG with XML declaration
      const svgData = '<?xml version="1.0" encoding="UTF-8"?>' + 
        new XMLSerializer().serializeToString(clonedSvg);
      
      // Create a data URL
      const svgBase64 = btoa(unescape(encodeURIComponent(svgData)));
      const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;
      
      // Create image
      const img = new Image();
      
      img.onload = () => {
        try {
          // Create canvas with proper dimensions and high quality
          const canvas = document.createElement('canvas');
          const scale = 2; // 2x for better quality
          canvas.width = paddedWidth * scale;
          canvas.height = paddedHeight * scale;
          
          const ctx = canvas.getContext('2d', { willReadFrequently: false });
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          // White background for better visibility
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Scale and draw the entire SVG with proper dimensions
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0, paddedWidth, paddedHeight);
          
          // Convert to blob and download with proper extension
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create PNG blob'));
                return;
              }
              
              const pngUrl = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = pngUrl;
              link.download = `${stripExtension(filename)}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              
              // Clean up
              URL.revokeObjectURL(pngUrl);
              resolve();
            },
            'image/png',
            0.95 // High quality
          );
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = (error) => {
        reject(new Error(`Failed to load SVG image: ${error}`));
      };
      
      // Use data URL to avoid CORS issues
      img.src = dataUrl;
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Download both SVG and PNG versions
 */
export async function downloadBoth(svgElement: SVGSVGElement | null, filename: string): Promise<void> {
  if (!svgElement) {
    console.error('No SVG element provided');
    return;
  }

  try {
    // Download SVG first
    downloadSvg(svgElement, filename);
    
    // Wait a bit to avoid browser blocking multiple downloads
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Download PNG
    await downloadPng(svgElement, filename);
  } catch (error) {
    console.error('Error downloading both formats:', error);
    throw error;
  }
}

