/**
 * Step 3: Mermaid to Image (Browser-based rendering)
 * Handles client-side rendering of Mermaid diagrams
 */

import mermaid from 'mermaid';

/**
 * Available Mermaid themes
 */
export const MERMAID_THEMES = {
  'default': 'Modern Blue',
  'dark': 'Dark Mode',
  'base': 'Base',
  'forest': 'Forest Green',
  'neutral': 'Neutral',
  'ocean': 'Ocean Blue',
  'sunset': 'Sunset Orange',
  'purple': 'Purple Dream',
  'rose': 'Rose Pink',
  'neon': 'Neon Night',
  'pastel': 'Pastel Dreams',
  'monochrome': 'Monochrome',
  'mint': 'Mint Green',
  'crimson': 'Crimson Wave',
  'slate': 'Slate Professional',
  'amber': 'Amber Warmth',
  'teal': 'Teal Calm',
  'grape': 'Grape Purple',
  'emerald': 'Emerald Shine',
  'fuchsia': 'Fuchsia Burst',
  'indigo': 'Indigo Deep',
  'lime': 'Lime Zest',
  'sky': 'Sky Blue',
  'neo': 'Neo Green',
  'neoDark': 'Neo Dark',
  'forestMermaid': 'Forest Mermaid',
  'redux': 'Redux',
  'reduxDark': 'Redux Dark',
  'modern': 'Modern Gradient',
  'corporate': 'Corporate Blue',
  'creative': 'Creative Orange',
  'nature': 'Nature Green',
  'royal': 'Royal Purple',
  'lavender': 'Lavender'
} as const;

export type MermaidTheme = keyof typeof MERMAID_THEMES;

/**
 * Custom theme variables interface
 */
export interface CustomThemeVariables {
  [key: string]: string | undefined;
}

/**
 * Utility: Pick readable text color for a given background
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.trim().toLowerCase();
  const short = /^#?([a-f0-9]{3})$/i;
  const long = /^#?([a-f0-9]{6})$/i;
  if (short.test(normalized)) {
    const [, s] = normalized.match(short) as RegExpMatchArray;
    const r = parseInt(s[0] + s[0], 16);
    const g = parseInt(s[1] + s[1], 16);
    const b = parseInt(s[2] + s[2], 16);
    return { r, g, b };
  }
  if (long.test(normalized)) {
    const [, l] = normalized.match(long) as RegExpMatchArray;
    const r = parseInt(l.slice(0, 2), 16);
    const g = parseInt(l.slice(2, 4), 16);
    const b = parseInt(l.slice(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 1; // default to bright so we choose dark text
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const r = toLinear(rgb.r);
  const g = toLinear(rgb.g);
  const b = toLinear(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getReadableTextColor(backgroundHex: string): string {
  // WCAG recommends contrast ratio >= 4.5; we approximate with luminance threshold
  // Pick near-black for light backgrounds, white for dark backgrounds
  try {
    const L = luminance(backgroundHex);
    return L > 0.5 ? '#111827' : '#ffffff';
  } catch {
    return '#111827';
  }
}

/**
 * Initialize Mermaid with customizable theme settings
 */
export function initializeMermaid(theme: MermaidTheme = 'default', customThemeVariables?: CustomThemeVariables) {
  // Import color themes dynamically to avoid circular imports
  const { MERMAID_COLOR_THEMES, DEFAULT_MERMAID_THEME } = require('@/constants/mermaidThemes');
  
  // Get theme colors from our color themes or use defaults
  const themeColors = MERMAID_COLOR_THEMES[theme] || DEFAULT_MERMAID_THEME;
  
  // Determine effective node background and text colors
  const providedVars = customThemeVariables || {};
  const nodeBackground =
    (providedVars.nodeBkg && providedVars.nodeBkg.trim()) ||
    (providedVars.mainBkg && providedVars.mainBkg.trim()) ||
    (providedVars.primaryColor && providedVars.primaryColor.trim()) ||
    themeColors.nodeColor;

  const explicitText =
    (providedVars.nodeTextColor && providedVars.nodeTextColor.trim()) ||
    (providedVars.textColor && providedVars.textColor.trim()) ||
    (providedVars.primaryTextColor && providedVars.primaryTextColor.trim());

  const computedTextColor = explicitText || getReadableTextColor(nodeBackground);

  const defaultThemeVars = {
    // Line and arrow colors
    lineColor: themeColors.arrowColor,
    defaultLinkColor: themeColors.arrowColor,
    
    // Border colors
    primaryBorderColor: themeColors.borderColor,
    nodeBorder: themeColors.borderColor,
    
    // Text colors - auto-contrast for readability (overridable by custom vars)
    primaryTextColor: computedTextColor,
    textColor: computedTextColor,
    nodeTextColor: computedTextColor,
    
    // Background colors
    primaryColor: nodeBackground,
    mainBkg: nodeBackground,
    nodeBkg: nodeBackground,
    secondaryColor: nodeBackground,
    tertiaryColor: nodeBackground,
    
    // Label colors - match computed text
    edgeLabelColor: computedTextColor,
    clusterTextColor: computedTextColor,
    
    // Decision colors - match computed text
    decisionSecondaryTextColor: computedTextColor,
    decisionTertiaryTextColor: computedTextColor,
    
    // Edge label background
    edgeLabelBackground: themeColors.previewBg,
  };

  // Filter out empty/undefined custom theme variables
  const filteredCustomVars: Record<string, string> = {};
  if (customThemeVariables) {
    Object.entries(customThemeVariables).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        filteredCustomVars[key] = value;
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

  // Inject CSS to enforce readable text color across both SVG text and HTML labels
  const finalTextColor = filteredCustomVars['nodeTextColor'] || filteredCustomVars['textColor'] || defaultThemeVars.textColor;
  const finalNodeFill = filteredCustomVars['nodeBkg'] || filteredCustomVars['mainBkg'] || filteredCustomVars['primaryColor'] || defaultThemeVars.nodeBkg;
  const finalBorder = filteredCustomVars['nodeBorder'] || filteredCustomVars['primaryBorderColor'] || defaultThemeVars.nodeBorder;
  const css = `
    /* Ensure node shapes use configured background/border */
    .node rect, .node circle, .node ellipse, .node polygon, .node path { fill: ${finalNodeFill} !important; stroke: ${finalBorder} !important; }
    /* Labels inside nodes and clusters - apply both fill and CSS color */
    .node .label, .label, .nodeLabel, .edgeLabel, .cluster text, .cluster .title, .clusterLabel, .flowchartLabel,
    .node foreignObject div, .edgeLabel foreignObject div { color: ${finalTextColor} !important; fill: ${finalTextColor} !important; }
    /* Edge label background should remain readable */
    .edgeLabel rect { fill: ${defaultThemeVars.edgeLabelBackground} !important; }
  `;

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
    },
    themeCSS: css
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

