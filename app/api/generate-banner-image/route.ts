import { NextRequest, NextResponse } from 'next/server';

/**
 * Banner Image Generation API
 * 
 * NOTE: This API generates placeholder banner images using a placeholder service.
 * For production use, you should integrate with a proper image generation API like:
 * - DALL-E 3 (OpenAI)
 * - Stable Diffusion
 * - Midjourney API
 * - Google Imagen
 * 
 * Gemini does not support image generation - it's a text-based AI model.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, customPrompt, articleContent } = body;

    // Validate input
    if (!prompt && !customPrompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const finalPrompt = customPrompt || prompt;
    console.log('🎨 Generating banner image with prompt:', finalPrompt.substring(0, 100) + '...');

    // Generate a unique, deterministic banner image based on the prompt
    // Using a placeholder/gradient service for now
    const imageData = await generatePlaceholderBanner(finalPrompt, articleContent);

    return NextResponse.json({
      success: true,
      imageData,
      message: 'Banner generated using placeholder service. For production, integrate with DALL-E, Stable Diffusion, or similar image generation API.'
    });

  } catch (error) {
    console.error('❌ Banner Image Generation Error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error during image generation' },
      { status: 500 }
    );
  }
}

/**
 * Generate a placeholder banner image
 * This creates a gradient banner with text overlay
 * In production, replace this with actual AI image generation
 */
async function generatePlaceholderBanner(prompt: string, articleContent?: string): Promise<string> {
  // Extract key themes from the prompt to generate colors
  const themes = extractThemes(prompt);
  const colors = getColorsForThemes(themes);
  
  // Generate SVG banner
  const width = 1200;
  const height = 630;
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
          <stop offset="50%" style="stop-color:${colors.secondary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.tertiary};stop-opacity:1" />
        </linearGradient>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
        </pattern>
      </defs>
      
      <!-- Background gradient -->
      <rect width="${width}" height="${height}" fill="url(#grad1)"/>
      
      <!-- Grid overlay -->
      <rect width="${width}" height="${height}" fill="url(#grid)"/>
      
      <!-- Decorative circles -->
      <circle cx="100" cy="100" r="150" fill="rgba(255,255,255,0.1)"/>
      <circle cx="${width - 100}" cy="${height - 100}" r="180" fill="rgba(255,255,255,0.1)"/>
      
      <!-- Title -->
      <text x="${width / 2}" y="${height / 2 - 20}" 
            font-family="Arial, sans-serif" 
            font-size="48" 
            font-weight="bold" 
            fill="white" 
            text-anchor="middle">
        ${themes.title}
      </text>
      
      <!-- Subtitle -->
      <text x="${width / 2}" y="${height / 2 + 40}" 
            font-family="Arial, sans-serif" 
            font-size="24" 
            fill="rgba(255,255,255,0.9)" 
            text-anchor="middle">
        ${themes.subtitle}
      </text>
    </svg>
  `;
  
  // Convert SVG to base64
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Extract themes from the prompt
 */
function extractThemes(prompt: string): { title: string; subtitle: string } {
  // Extract title from prompt (looking for "article titled" pattern)
  const titleMatch = prompt.match(/titled\s+"([^"]+)"/i);
  const title = titleMatch ? titleMatch[1] : 'Article Banner';
  
  // Extract main theme
  const themesMatch = prompt.match(/themes of ([^.]+)/i);
  const subtitle = themesMatch ? themesMatch[1].split(',')[0].trim() : 'Visual Guide';
  
  return {
    title: title.length > 40 ? title.substring(0, 40) + '...' : title,
    subtitle: subtitle.length > 50 ? subtitle.substring(0, 50) + '...' : subtitle
  };
}

/**
 * Get colors based on themes (deterministic)
 */
function getColorsForThemes(themes: { title: string; subtitle: string }): {
  primary: string;
  secondary: string;
  tertiary: string;
} {
  // Generate colors based on the title hash for consistency
  const hash = themes.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const colorSchemes = [
    { primary: '#667eea', secondary: '#764ba2', tertiary: '#f093fb' }, // Purple
    { primary: '#4facfe', secondary: '#00f2fe', tertiary: '#43e97b' }, // Blue-Green
    { primary: '#fa709a', secondary: '#fee140', tertiary: '#30cfd0' }, // Pink-Yellow
    { primary: '#a8edea', secondary: '#fed6e3', tertiary: '#fbc2eb' }, // Pastel
    { primary: '#ff9a56', secondary: '#ff6a88', tertiary: '#ffecd2' }, // Orange-Pink
    { primary: '#21d4fd', secondary: '#b721ff', tertiary: '#2afadf' }, // Cyan-Purple
    { primary: '#08aeea', secondary: '#2af598', tertiary: '#09203f' }, // Deep Blue
    { primary: '#f857a6', secondary: '#ff5858', tertiary: '#ffd3a5' }, // Red-Pink
  ];
  
  return colorSchemes[hash % colorSchemes.length];
}

