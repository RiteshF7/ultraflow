/**
 * Step 3: Mermaid to Image (Browser-based rendering)
 * Handles client-side rendering of Mermaid diagrams
 */

import mermaid from 'mermaid';

/**
 * Available Mermaid themes
 */
export const MERMAID_THEMES = {
  'default': 'Light Blue (Default)',
  'dark': 'Dark Theme',
  'base': 'Base Theme',
  'forest': 'Forest (Green)',
  'neutral': 'Neutral Theme'
} as const;

export type MermaidTheme = keyof typeof MERMAID_THEMES;

/**
 * Custom theme variables interface
 */
export interface CustomThemeVariables {
  [key: string]: string | undefined;
}

/**
 * Initialize Mermaid with customizable theme settings
 */
export function initializeMermaid(theme: MermaidTheme = 'default', customThemeVariables?: CustomThemeVariables) {
  const defaultThemeVars = {
    // Line and arrow colors
    lineColor: '#000000',
    defaultLinkColor: '#000000',
    
    // Border colors
    primaryBorderColor: '#000000',
    nodeBorder: '#000000',
    
    // Text colors
    primaryTextColor: theme === 'dark' ? '#ffffff' : '#000000',
    textColor: theme === 'dark' ? '#ffffff' : '#000000',
    nodeTextColor: theme === 'dark' ? '#ffffff' : '#000000',
    
    // Background colors
    primaryColor: '#4f46e5',
    mainBkg: '#4f46e5',
    nodeBkg: '#4f46e5',
    
    // Decision text colors - using the correct Mermaid variables
    nodeTextColor: '#000000',
    edgeLabelColor: '#000000',
    clusterTextColor: '#000000',
  };

  // Filter out empty/undefined custom theme variables and map decision variables
  const filteredCustomVars: Record<string, string> = {};
  if (customThemeVariables) {
    Object.entries(customThemeVariables).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        // Map custom decision variables to Mermaid's actual variables
        if (key === 'decisionSecondaryTextColor' || key === 'decisionTertiaryTextColor') {
          // Apply decision text color to multiple relevant variables
          filteredCustomVars['nodeTextColor'] = value;
          filteredCustomVars['edgeLabelColor'] = value;
          filteredCustomVars['clusterTextColor'] = value;
        } else {
          filteredCustomVars[key] = value;
        }
      }
    });
  }

  console.log('🎨 Initializing Mermaid with theme:', theme);
  console.log('🎨 Custom theme variables:', filteredCustomVars);
  console.log('🎨 Decision text colors:', {
    nodeTextColor: filteredCustomVars['nodeTextColor'],
    edgeLabelColor: filteredCustomVars['edgeLabelColor'],
    clusterTextColor: filteredCustomVars['clusterTextColor']
  });

  mermaid.initialize({
    startOnLoad: false,
    theme: theme,
    securityLevel: 'loose',
    fontFamily: 'Segoe UI, sans-serif',
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true, // Enable HTML labels for proper text color rendering
      curve: 'basis',
      nodeSpacing: 50,
      rankSpacing: 80
    },
    // Merge custom theme variables with defaults
    themeVariables: {
      ...defaultThemeVars,
      ...filteredCustomVars
    }
  });
}

/**
 * Sanitize Mermaid code to fix common syntax issues
 * @param mmdCode - Raw Mermaid code
 * @returns Sanitized Mermaid code
 */
export function sanitizeMermaidCode(mmdCode: string): string {
  let sanitized = mmdCode.trim();
  
  console.log('🧹 Original MMD length:', sanitized.length);
  console.log('📄 Original MMD preview:', sanitized.substring(0, 200));
  
  // Fix node labels with parentheses - replace parentheses with dashes or spaces
  // Pattern: NodeID[Label with (content)]
  sanitized = sanitized.replace(/\[([^\]]*?)\(([^)]*?)\)([^\]]*?)\]/g, (match, before, inside, after) => {
    // Replace parentheses content with dashes
    const cleaned = `${before}- ${inside} -${after}`;
    return `[${cleaned}]`;
  });
  
  // Alternative: If there are still nested parentheses, remove them
  sanitized = sanitized.replace(/\[([^\[]*?)\(([^)]*?)\)([^\]]*?)\]/g, (match, before, inside, after) => {
    const cleaned = `${before}${inside}${after}`;
    return `[${cleaned}]`;
  });
  
  // Keep classDef and class declarations for styled templates
  // DO NOT remove them - they are needed for custom styling
  
  // Ensure proper line endings
  sanitized = sanitized.replace(/\r\n/g, '\n');
  
  console.log('✨ Sanitized MMD length:', sanitized.length);
  console.log('📄 Sanitized MMD preview:', sanitized.substring(0, 200));
  
  return sanitized;
}

/**
 * Validate Mermaid code syntax
 * @param mmdCode - Mermaid code to validate
 * @returns Object with isValid flag and error message if invalid
 */
export async function validateMermaidCode(mmdCode: string): Promise<{
  isValid: boolean;
  error?: string;
  sanitizedCode?: string;
}> {
  try {
    const sanitized = sanitizeMermaidCode(mmdCode);
    
    // Try to parse it with Mermaid
    await mermaid.parse(sanitized);
    
    return {
      isValid: true,
      sanitizedCode: sanitized
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error',
      sanitizedCode: sanitizeMermaidCode(mmdCode)
    };
  }
}

/**
 * Render Mermaid diagram to HTML element
 * @param mmdCode - Mermaid code to render
 * @param containerId - ID of container element
 * @param theme - Optional theme
 * @param customThemeVars - Optional custom theme variables
 * @returns Promise with SVG string
 */
export async function renderMermaidToElement(
  mmdCode: string,
  containerId: string = `mermaid-${Date.now()}`,
  theme?: MermaidTheme,
  customThemeVars?: CustomThemeVariables
): Promise<{ svg: string; bindFunctions?: any }> {
  try {
    console.log('🎨 Starting Mermaid rendering...');
    console.log('📏 Original code length:', mmdCode.length);
    
    // Force reinitialize before rendering if theme params are provided
    if (theme || customThemeVars) {
      initializeMermaid(theme || 'default', customThemeVars);
    }
    
    // Sanitize the code first
    const sanitized = sanitizeMermaidCode(mmdCode);
    
    console.log('📏 Sanitized code length:', sanitized.length);
    console.log('📄 First 300 chars of sanitized:', sanitized.substring(0, 300));
    
    // Render the diagram
    console.log('🔧 Calling mermaid.render...');
    const result = await mermaid.render(containerId, sanitized);
    
    console.log('✅ Diagram rendered successfully!');
    console.log('📏 SVG length:', result.svg.length);
    
    // Apply decision text color styling if provided
    if (customThemeVars && (customThemeVars.decisionSecondaryTextColor || customThemeVars.decisionTertiaryTextColor)) {
      result.svg = applyDecisionTextStyling(result.svg, customThemeVars);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Mermaid rendering error:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error(`Failed to render diagram: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Apply decision text color styling to SVG
 * @param svg - SVG string
 * @param customThemeVars - Custom theme variables
 * @returns Modified SVG string
 */
function applyDecisionTextStyling(svg: string, customThemeVars: CustomThemeVariables): string {
  try {
    console.log('🎨 Applying decision text styling...');
    
    const decisionTextColor = customThemeVars.decisionSecondaryTextColor || customThemeVars.decisionTertiaryTextColor;
    if (!decisionTextColor) return svg;
    
    let modifiedSvg = svg;
    
    // Apply decision text color to edge labels (like "Yes", "No", "Maybe")
    modifiedSvg = modifiedSvg.replace(
      /<text([^>]*class="[^"]*edgeLabel[^"]*"[^>]*)fill="[^"]*"/g,
      `$1fill="${decisionTextColor}"`
    );
    
    // Apply decision text color to any text that looks like decision labels
    modifiedSvg = modifiedSvg.replace(
      /<text([^>]*>)\s*(Yes|No|Maybe|True|False|Pass|Fail)\s*(<\/text>)/gi,
      `$1$2$3`.replace(/<text([^>]*)fill="[^"]*"/g, `$1fill="${decisionTextColor}"`)
    );
    
    console.log('✅ Decision text styling applied with color:', decisionTextColor);
    return modifiedSvg;
  } catch (error) {
    console.error('❌ Error applying decision text styling:', error);
    return svg; // Return original SVG if styling fails
  }
}

/**
 * Extract multiple diagrams from text
 * Some AI responses might contain multiple diagram variations
 */
export function extractMultipleDiagrams(text: string): string[] {
  console.log('🔍 Extracting diagrams from text...');
  console.log('📏 Text length:', text.length);
  console.log('📄 Text preview:', text.substring(0, 100));
  
  const diagrams: string[] = [];
  
  // Just return the whole text as one diagram if it starts with flowchart/graph
  const trimmedText = text.trim();
  if (trimmedText.startsWith('flowchart') || trimmedText.startsWith('graph')) {
    console.log('✅ Found diagram, returning as single diagram');
    diagrams.push(trimmedText);
    return diagrams;
  }
  
  // If no diagram found, still return it and let sanitization handle it
  if (trimmedText.length > 0) {
    console.log('⚠️ No flowchart/graph declaration found, returning text as-is');
    diagrams.push(trimmedText);
  }
  
  console.log('📊 Extracted', diagrams.length, 'diagram(s)');
  return diagrams;
}

/**
 * Download SVG to file with proper dimensions and margins
 */
export function downloadSvg(svgElement: SVGElement | null, filename: string = 'flowchart') {
  if (!svgElement) {
    console.error('No SVG element to download');
    return;
  }
  
  try {
    // Clone the SVG to avoid modifying the original
    const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
    
    // Get the actual rendered dimensions
    const rect = svgElement.getBoundingClientRect();
    
    // Use the actual rendered size or fallback to attributes
    const actualWidth = rect.width || parseFloat(svgElement.getAttribute('width') || '800');
    const actualHeight = rect.height || parseFloat(svgElement.getAttribute('height') || '600');
    
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
    
    const svgData = clonedSvg.outerHTML;
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading SVG:', error);
  }
}

/**
 * Download PNG (convert SVG to PNG in browser) with proper dimensions
 */
export function downloadPng(svgElement: SVGElement | null, filename: string = 'flowchart') {
  if (!svgElement) {
    console.error('No SVG element to download');
    return;
  }
  
  try {
    // Clone the SVG
    const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
    
    // Get the actual rendered dimensions
    const rect = svgElement.getBoundingClientRect();
    
    // Use the actual rendered size or fallback to attributes
    const actualWidth = rect.width || parseFloat(svgElement.getAttribute('width') || '800');
    const actualHeight = rect.height || parseFloat(svgElement.getAttribute('height') || '600');
    
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
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size with high quality scaling
    const scale = 2; // 2x for better quality
    canvas.width = paddedWidth * scale;
    canvas.height = paddedHeight * scale;
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const img = new Image();
    
    img.onload = () => {
      // Scale and draw the SVG
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, paddedWidth, paddedHeight);
      
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png', 0.95);
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  } catch (error) {
    console.error('Error downloading PNG:', error);
  }
}

