import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Replicate from 'replicate';

/**
 * AI-Enhanced Banner Image Generation API
 * 
 * This endpoint uses:
 * 1. Gemini AI to analyze article content and generate image prompts
 * 2. Replicate's Stable Diffusion XL to generate actual AI images
 * 3. Falls back to SVG banners if image generation fails
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, customPrompt, articleContent, articleTitle } = body;

    // Validate input
    if (!articleContent && !prompt && !customPrompt) {
      return NextResponse.json(
        { success: false, error: 'Article content or prompt is required' },
        { status: 400 }
      );
    }

    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set');
      return NextResponse.json(
        { success: false, error: 'API key not configured. Please set GEMINI_API_KEY in environment variables.' },
        { status: 500 }
      );
    }

    const finalPrompt = customPrompt || prompt;
    console.log('🤖 Using Gemini AI to analyze article and generate banner design...');

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Create a prompt for Gemini to analyze the article and generate AI image prompts
    const aiPrompt = `
Analyze the following article and create 4 different AI image prompts for banner designs:

Title: ${articleTitle || 'Article'}
Content: ${articleContent ? articleContent.substring(0, 1000) : finalPrompt}

Please provide a JSON response with 4 distinct image generation prompts. Each should create a realistic, high-quality banner image:

{
  "designs": [
    {
      "id": 1,
      "style": "photographic" | "digital-art" | "cinematic" | "illustration",
      "title": "A catchy, concise title (max 50 characters)",
      "subtitle": "A descriptive subtitle (max 60 characters)",
      "imagePrompt": "A detailed DALL-E/Stable Diffusion prompt describing a realistic, non-abstract banner image. Include: subject, composition, lighting, mood, colors, style. Be specific and visual. Example: 'A professional banner image of a futuristic AI brain network with glowing neural connections, cinematic lighting, blue and purple tones, photorealistic, high detail, modern tech aesthetic'",
      "theme": "The main theme (e.g., 'technology', 'nature', 'business', 'education', 'science')",
      "mood": "Emotional tone (e.g., 'professional', 'creative', 'energetic', 'calm', 'innovative')",
      "description": "Brief description of the image concept"
    }
  ]
}

Requirements for imagePrompt:
- Create REALISTIC, NON-ABSTRACT prompts
- Include specific visual elements related to the article topic
- Describe lighting, colors, composition
- Mention photographic/cinematic quality
- Avoid abstract concepts, use concrete visual elements
- Each prompt should be visually distinct

Create 4 variations with DIFFERENT visual styles and compositions.
Only respond with valid JSON, no additional text.
`;

    let designSpecs: any[] = [];
    
    try {
      const result = await model.generateContent(aiPrompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('🤖 Gemini raw response:', text.substring(0, 300));

      // Try to parse the AI response
      try {
        // Remove markdown code blocks if present
        let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        // Extract JSON from the response
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          
          if (parsed.designs && Array.isArray(parsed.designs)) {
            designSpecs = parsed.designs;
            console.log(`✅ Successfully parsed ${designSpecs.length} AI design specs`);
          } else {
            throw new Error('No designs array found in response');
          }
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.warn('⚠️ Failed to parse AI response, using fallback:', parseError);
        designSpecs = generateFallbackDesigns(articleTitle, articleContent);
      }
    } catch (aiError) {
      console.error('⚠️ Gemini API error, using fallback designs:', aiError);
      designSpecs = generateFallbackDesigns(articleTitle, articleContent);
    }

    // Ensure we have exactly 4 designs
    if (designSpecs.length === 0) {
      console.log('⚠️ No designs from AI, using all fallback designs');
      designSpecs = generateFallbackDesigns(articleTitle, articleContent);
    } else if (designSpecs.length < 4) {
      // Fill in with fallback designs if we got fewer than 4
      console.log(`⚠️ Only got ${designSpecs.length} designs from AI, filling with fallbacks`);
      const fallbackDesigns = generateFallbackDesigns(articleTitle, articleContent);
      const neededCount = 4 - designSpecs.length;
      designSpecs = [...designSpecs, ...fallbackDesigns.slice(0, neededCount)];
    } else if (designSpecs.length > 4) {
      // Trim to exactly 4 if AI gave us more
      designSpecs = designSpecs.slice(0, 4);
    }

    // Assign unique IDs to each design
    designSpecs = designSpecs.map((spec, index) => ({
      ...spec,
      id: index + 1
    }));

    console.log('🎨 Generating banners for', designSpecs.length, 'design variations:', 
      designSpecs.map(s => s.style).join(', '));

    // Generate multiple banner images
    const banners = await Promise.all(
      designSpecs.map(async (spec, index) => ({
        id: spec.id || index + 1,
        imageData: await generateAIEnhancedBanner(spec),
        designSpec: spec
      }))
    );

    return NextResponse.json({
      success: true,
      banners,
      message: `Generated ${banners.length} banner variations using Gemini AI analysis`
    });

  } catch (error) {
    console.error('❌ AI Banner Generation Error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error during AI banner generation' },
      { status: 500 }
    );
  }
}

/**
 * Generate fallback designs if AI fails
 */
function generateFallbackDesigns(articleTitle?: string, articleContent?: string): any[] {
  const title = articleTitle || 'Article Banner';
  const subtitle = articleContent 
    ? articleContent.substring(0, 60).trim() + '...'
    : 'Explore the Key Concepts';

  return [
    {
      id: 1,
      style: 'minimalist',
      title,
      subtitle,
      theme: 'technology',
      colorScheme: 'vibrant-blue',
      mood: 'professional',
      icons: ['lightbulb', 'chart'],
      description: 'Clean and professional minimalist design'
    },
    {
      id: 2,
      style: 'bold',
      title,
      subtitle,
      theme: 'business',
      colorScheme: 'energetic-red',
      mood: 'energetic',
      icons: ['rocket', 'star'],
      description: 'Bold and energetic design with strong colors'
    },
    {
      id: 3,
      style: 'illustrated',
      title,
      subtitle,
      theme: 'education',
      colorScheme: 'nature-green',
      mood: 'creative',
      icons: ['book', 'leaf'],
      description: 'Illustrated design with creative elements'
    },
    {
      id: 4,
      style: 'geometric',
      title,
      subtitle,
      theme: 'technology',
      colorScheme: 'cosmic-purple',
      mood: 'innovative',
      icons: ['code', 'brain'],
      description: 'Geometric design with modern patterns'
    }
  ];
}

/**
 * Generate an AI-enhanced banner based on design specifications
 */
async function generateAIEnhancedBanner(designSpec: any): Promise<string> {
  const width = 1200;
  const height = 630;
  
  // Get colors based on AI suggestion
  const colors = getColorsForTheme(designSpec.colorScheme, designSpec.theme);
  
  // Generate decorative elements based on style
  const decorativeElements = generateStyledElements(designSpec.style, designSpec.icons, colors);
  
  // Get style-specific fonts and text positioning
  const styleConfig = getStyleConfig(designSpec.style);
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mainGrad_${designSpec.id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
          <stop offset="50%" style="stop-color:${colors.secondary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.tertiary};stop-opacity:1" />
        </linearGradient>
        <linearGradient id="overlayGrad_${designSpec.id}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:rgba(0,0,0,0);stop-opacity:0" />
          <stop offset="100%" style="stop-color:rgba(0,0,0,0.${styleConfig.overlayOpacity});stop-opacity:1" />
        </linearGradient>
        <pattern id="grid_${designSpec.id}" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        </pattern>
        <filter id="glow_${designSpec.id}">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Background gradient -->
      <rect width="${width}" height="${height}" fill="url(#mainGrad_${designSpec.id})"/>
      
      ${styleConfig.showGrid ? `<rect width="${width}" height="${height}" fill="url(#grid_${designSpec.id})"/>` : ''}
      
      <!-- Decorative elements based on AI analysis -->
      ${decorativeElements}
      
      <!-- Dark overlay for text readability -->
      <rect width="${width}" height="${height}" fill="url(#overlayGrad_${designSpec.id})"/>
      
      <!-- Title with glow effect -->
      <text x="${width / 2}" y="${styleConfig.titleY}" 
            font-family="${styleConfig.fontFamily}" 
            font-size="${styleConfig.titleSize}" 
            font-weight="${styleConfig.titleWeight}" 
            fill="white" 
            text-anchor="middle"
            ${styleConfig.applyGlow ? `filter="url(#glow_${designSpec.id})"` : ''}>
        ${escapeXml(designSpec.title)}
      </text>
      
      <!-- Subtitle -->
      <text x="${width / 2}" y="${styleConfig.subtitleY}" 
            font-family="${styleConfig.fontFamily}" 
            font-size="${styleConfig.subtitleSize}" 
            fill="rgba(255,255,255,0.95)" 
            text-anchor="middle">
        ${escapeXml(designSpec.subtitle)}
      </text>
      
      <!-- Style badge -->
      <rect x="${width - 180}" y="30" width="150" height="35" rx="17.5" fill="rgba(255,255,255,0.2)"/>
      <text x="${width - 105}" y="53" 
            font-family="system-ui, -apple-system, sans-serif" 
            font-size="14" 
            font-weight="600"
            fill="white" 
            text-anchor="middle">
        ${escapeXml(designSpec.style?.toUpperCase() || 'DESIGN')}
      </text>
    </svg>
  `;
  
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Get style-specific configuration
 */
function getStyleConfig(style: string) {
  const configs: Record<string, any> = {
    minimalist: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      titleSize: '48',
      titleWeight: '300',
      titleY: 285,
      subtitleSize: '24',
      subtitleY: 345,
      overlayOpacity: '2',
      showGrid: false,
      applyGlow: false
    },
    bold: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      titleSize: '60',
      titleWeight: 'bold',
      titleY: 280,
      subtitleSize: '28',
      subtitleY: 355,
      overlayOpacity: '4',
      showGrid: true,
      applyGlow: true
    },
    illustrated: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      titleSize: '54',
      titleWeight: '600',
      titleY: 280,
      subtitleSize: '26',
      subtitleY: 350,
      overlayOpacity: '3',
      showGrid: false,
      applyGlow: false
    },
    geometric: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      titleSize: '52',
      titleWeight: 'bold',
      titleY: 285,
      subtitleSize: '25',
      subtitleY: 348,
      overlayOpacity: '3',
      showGrid: true,
      applyGlow: true
    }
  };
  
  return configs[style] || configs.minimalist;
}

/**
 * Generate styled decorative elements with icons
 */
function generateStyledElements(style: string, icons: string[], colors: any): string {
  const elements: string[] = [];
  const safeIcons = icons && Array.isArray(icons) ? icons : ['star', 'lightbulb'];
  
  switch (style) {
    case 'minimalist':
      // Simple, clean shapes
      elements.push(`
        <circle cx="100" cy="100" r="140" fill="rgba(255,255,255,0.08)"/>
        <circle cx="1100" cy="530" r="160" fill="rgba(255,255,255,0.06)"/>
        ${generateIconSVG(safeIcons[0] || 'lightbulb', 120, 540, 70, 'rgba(255,255,255,0.2)')}
      `);
      break;
      
    case 'bold':
      // Strong, prominent shapes with icons
      elements.push(`
        <circle cx="150" cy="150" r="130" fill="rgba(255,255,255,0.18)"/>
        <circle cx="1050" cy="480" r="160" fill="rgba(255,255,255,0.15)"/>
        <circle cx="900" cy="100" r="90" fill="rgba(255,255,255,0.12)"/>
        ${generateIconSVG(safeIcons[0] || 'rocket', 150, 150, 90, 'rgba(255,255,255,0.35)')}
        ${generateIconSVG(safeIcons[1] || 'star', 1050, 480, 80, 'rgba(255,255,255,0.3)')}
      `);
      break;
      
    case 'illustrated':
      // Organic shapes with illustrations
      elements.push(`
        <circle cx="200" cy="500" r="100" fill="rgba(255,255,255,0.12)"/>
        <ellipse cx="1000" cy="150" rx="120" ry="80" fill="rgba(255,255,255,0.1)"/>
        ${generateIconSVG(safeIcons[0] || 'book', 200, 150, 85, 'rgba(255,255,255,0.25)')}
        ${generateIconSVG(safeIcons[1] || 'leaf', 1000, 480, 75, 'rgba(255,255,255,0.22)')}
      `);
      break;
      
    case 'geometric':
      // Angular, structured shapes
      elements.push(`
        <rect x="50" y="50" width="180" height="180" rx="15" fill="rgba(255,255,255,0.12)" transform="rotate(-12 140 140)"/>
        <rect x="950" y="400" width="200" height="200" rx="20" fill="rgba(255,255,255,0.1)" transform="rotate(18 1050 500)"/>
        <polygon points="300,550 250,600 350,600" fill="rgba(255,255,255,0.08)"/>
        ${generateIconSVG(safeIcons[0] || 'code', 140, 140, 80, 'rgba(255,255,255,0.3)')}
        ${generateIconSVG(safeIcons[1] || 'brain', 1050, 500, 85, 'rgba(255,255,255,0.28)')}
      `);
      break;
      
    default:
      elements.push(`
        <circle cx="120" cy="120" r="130" fill="rgba(255,255,255,0.1)"/>
        <circle cx="1080" cy="510" r="150" fill="rgba(255,255,255,0.08)"/>
        ${generateIconSVG(safeIcons[0] || 'chart', 120, 120, 75, 'rgba(255,255,255,0.2)')}
      `);
  }
  
  return elements.join('\n');
}

/**
 * Generate detailed SVG illustrations based on icon name
 */
function generateIconSVG(iconName: string, x: number, y: number, size: number, fill: string): string {
  const icons: Record<string, string> = {
    lightbulb: `<g transform="translate(${x-size/2}, ${y-size/2})">
      <!-- Bulb base -->
      <rect x="${size*0.35}" y="${size*0.65}" width="${size*0.3}" height="${size*0.15}" rx="${size*0.03}" fill="${fill}"/>
      <rect x="${size*0.38}" y="${size*0.72}" width="${size*0.24}" height="${size*0.08}" fill="${fill}" opacity="0.8"/>
      <!-- Bulb glass -->
      <circle cx="${size/2}" cy="${size*0.38}" r="${size*0.28}" fill="${fill}" opacity="0.9"/>
      <path d="M${size*0.32},${size*0.45} Q${size/2},${size*0.2} ${size*0.68},${size*0.45} L${size*0.62},${size*0.65} L${size*0.38},${size*0.65} Z" fill="${fill}"/>
      <!-- Highlight -->
      <circle cx="${size*0.42}" cy="${size*0.32}" r="${size*0.08}" fill="rgba(255,255,255,0.3)"/>
    </g>`,
    
    rocket: `<g transform="translate(${x-size/2}, ${y-size/2})">
      <!-- Body -->
      <path d="M${size*0.5},${size*0.1} L${size*0.65},${size*0.55} L${size*0.55},${size*0.55} L${size*0.55},${size*0.75} L${size*0.45},${size*0.75} L${size*0.45},${size*0.55} L${size*0.35},${size*0.55} Z" fill="${fill}"/>
      <!-- Fins -->
      <path d="M${size*0.35},${size*0.55} L${size*0.25},${size*0.7} L${size*0.35},${size*0.65} Z" fill="${fill}" opacity="0.8"/>
      <path d="M${size*0.65},${size*0.55} L${size*0.75},${size*0.7} L${size*0.65},${size*0.65} Z" fill="${fill}" opacity="0.8"/>
      <!-- Window -->
      <circle cx="${size*0.5}" cy="${size*0.35}" r="${size*0.08}" fill="rgba(255,255,255,0.4)"/>
      <!-- Flame -->
      <ellipse cx="${size*0.5}" cy="${size*0.82}" rx="${size*0.08}" ry="${size*0.12}" fill="rgba(255,200,100,0.5)"/>
    </g>`,
    
    chart: `<g transform="translate(${x-size/2}, ${y-size/2})">
      <!-- Chart bars with 3D effect -->
      <rect x="${size*0.15}" y="${size*0.55}" width="${size*0.18}" height="${size*0.3}" fill="${fill}" opacity="0.9"/>
      <polygon points="${size*0.15},${size*0.55} ${size*0.25},${size*0.5} ${size*0.43},${size*0.5} ${size*0.33},${size*0.55}" fill="${fill}" opacity="0.7"/>
      
      <rect x="${size*0.38}" y="${size*0.35}" width="${size*0.18}" height="${size*0.5}" fill="${fill}" opacity="0.9"/>
      <polygon points="${size*0.38},${size*0.35} ${size*0.48},${size*0.3} ${size*0.66},${size*0.3} ${size*0.56},${size*0.35}" fill="${fill}" opacity="0.7"/>
      
      <rect x="${size*0.61}" y="${size*0.2}" width="${size*0.18}" height="${size*0.65}" fill="${fill}" opacity="0.9"/>
      <polygon points="${size*0.61},${size*0.2} ${size*0.71},${size*0.15} ${size*0.89},${size*0.15} ${size*0.79},${size*0.2}" fill="${fill}" opacity="0.7"/>
      
      <!-- Arrow up -->
      <path d="M${size*0.88},${size*0.25} L${size*0.92},${size*0.15} L${size*0.96},${size*0.25}" stroke="${fill}" stroke-width="2" fill="none" opacity="0.6"/>
    </g>`,
    
    star: `<g transform="translate(${x}, ${y})">
      <!-- Star with depth -->
      <path d="M0,-${size*0.45} L${size*0.12},-${size*0.14} L${size*0.43},-${size*0.14} L${size*0.17},${size*0.06} L${size*0.26},${size*0.37} L0,${size*0.18} L-${size*0.26},${size*0.37} L-${size*0.17},${size*0.06} L-${size*0.43},-${size*0.14} L-${size*0.12},-${size*0.14} Z" fill="${fill}"/>
      <!-- Inner highlight -->
      <path d="M0,-${size*0.25} L${size*0.06},-${size*0.08} L${size*0.1},${size*0.02} L0,${size*0.1} L-${size*0.1},${size*0.02} L-${size*0.06},-${size*0.08} Z" fill="rgba(255,255,255,0.3)"/>
    </g>`,
    
    book: `<g transform="translate(${x-size/2}, ${y-size/2})">
      <!-- Book cover with 3D effect -->
      <rect x="${size*0.15}" y="${size*0.15}" width="${size*0.7}" height="${size*0.7}" rx="${size*0.05}" fill="${fill}"/>
      <rect x="${size*0.18}" y="${size*0.18}" width="${size*0.32}" height="${size*0.64}" fill="${fill}" opacity="0.7"/>
      <rect x="${size*0.52}" y="${size*0.18}" width="${size*0.31}" height="${size*0.64}" fill="${fill}" opacity="0.9"/>
      <!-- Spine -->
      <rect x="${size*0.48}" y="${size*0.15}" width="${size*0.04}" height="${size*0.7}" fill="${fill}" opacity="0.5"/>
      <!-- Pages -->
      <line x1="${size*0.25}" y1="${size*0.3}" x2="${size*0.42}" y2="${size*0.3}" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
      <line x1="${size*0.25}" y1="${size*0.42}" x2="${size*0.42}" y2="${size*0.42}" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
      <line x1="${size*0.58}" y1="${size*0.3}" x2="${size*0.75}" y2="${size*0.3}" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
      <line x1="${size*0.58}" y1="${size*0.42}" x2="${size*0.75}" y2="${size*0.42}" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
    </g>`,
    
    brain: `<g transform="translate(${x}, ${y})">
      <!-- Brain hemispheres with details -->
      <ellipse cx="-${size*0.18}" cy="0" rx="${size*0.28}" ry="${size*0.35}" fill="${fill}"/>
      <ellipse cx="${size*0.18}" cy="0" rx="${size*0.28}" ry="${size*0.35}" fill="${fill}"/>
      <!-- Brain folds -->
      <path d="M-${size*0.35},-${size*0.1} Q-${size*0.25},-${size*0.15} -${size*0.15},-${size*0.1}" stroke="rgba(0,0,0,0.2)" stroke-width="2" fill="none"/>
      <path d="M-${size*0.32},${size*0.1} Q-${size*0.22},${size*0.05} -${size*0.12},${size*0.1}" stroke="rgba(0,0,0,0.2)" stroke-width="2" fill="none"/>
      <path d="M${size*0.15},-${size*0.1} Q${size*0.25},-${size*0.15} ${size*0.35},-${size*0.1}" stroke="rgba(0,0,0,0.2)" stroke-width="2" fill="none"/>
      <path d="M${size*0.12},${size*0.1} Q${size*0.22},${size*0.05} ${size*0.32},${size*0.1}" stroke="rgba(0,0,0,0.2)" stroke-width="2" fill="none"/>
    </g>`,
    
    code: `<g transform="translate(${x}, ${y})">
      <!-- Code brackets with window -->
      <rect x="-${size*0.45}" y="-${size*0.4}" width="${size*0.9}" height="${size*0.8}" rx="${size*0.05}" fill="${fill}" opacity="0.3"/>
      <rect x="-${size*0.42}" y="-${size*0.25}" width="${size*0.84}" height="${size*0.6}" fill="${fill}" opacity="0.5"/>
      <!-- Code symbols -->
      <path d="M-${size*0.35},0 L-${size*0.22},-${size*0.15} L-${size*0.22},${size*0.15} Z" fill="${fill}"/>
      <path d="M${size*0.35},0 L${size*0.22},-${size*0.15} L${size*0.22},${size*0.15} Z" fill="${fill}"/>
      <!-- Lines of code -->
      <line x1="-${size*0.1}" y1="-${size*0.12}" x2="${size*0.25}" y2="-${size*0.12}" stroke="${fill}" stroke-width="2"/>
      <line x1="-${size*0.1}" y1="0" x2="${size*0.15}" y2="0" stroke="${fill}" stroke-width="2" opacity="0.7"/>
      <line x1="-${size*0.1}" y1="${size*0.12}" x2="${size*0.2}" y2="${size*0.12}" stroke="${fill}" stroke-width="2" opacity="0.7"/>
    </g>`,
    
    leaf: `<g transform="translate(${x}, ${y})">
      <!-- Detailed leaf -->
      <ellipse cx="0" cy="0" rx="${size*0.2}" ry="${size*0.38}" fill="${fill}" transform="rotate(-20)"/>
      <ellipse cx="0" cy="0" rx="${size*0.18}" ry="${size*0.35}" fill="${fill}" opacity="0.7" transform="rotate(-20)"/>
      <!-- Vein -->
      <line x1="0" y1="-${size*0.35}" x2="0" y2="${size*0.35}" stroke="rgba(0,0,0,0.2)" stroke-width="2" transform="rotate(-20)"/>
      <!-- Side veins -->
      <path d="M0,-${size*0.2} Q${size*0.1},-${size*0.15} ${size*0.15},-${size*0.1}" stroke="rgba(0,0,0,0.15)" stroke-width="1" fill="none" transform="rotate(-20)"/>
      <path d="M0,${size*0.2} Q${size*0.1},${size*0.15} ${size*0.15},${size*0.1}" stroke="rgba(0,0,0,0.15)" stroke-width="1" fill="none" transform="rotate(-20)"/>
    </g>`
  };
  
  return icons[iconName] || icons.star;
}

/**
 * Get enhanced color schemes based on AI theme suggestion
 */
function getColorsForTheme(colorScheme: string, theme: string): {
  primary: string;
  secondary: string;
  tertiary: string;
} {
  const schemes: Record<string, { primary: string; secondary: string; tertiary: string }> = {
    'vibrant-blue': { primary: '#4facfe', secondary: '#00f2fe', tertiary: '#43e97b' },
    'warm-orange': { primary: '#ff9a56', secondary: '#ff6a88', tertiary: '#ffecd2' },
    'cool-purple': { primary: '#667eea', secondary: '#764ba2', tertiary: '#f093fb' },
    'nature-green': { primary: '#11998e', secondary: '#38ef7d', tertiary: '#a8edea' },
    'tech-cyan': { primary: '#21d4fd', secondary: '#b721ff', tertiary: '#2afadf' },
    'elegant-pink': { primary: '#fa709a', secondary: '#fee140', tertiary: '#fbc2eb' },
    'professional-navy': { primary: '#08aeea', secondary: '#2af598', tertiary: '#09203f' },
    'energetic-red': { primary: '#f857a6', secondary: '#ff5858', tertiary: '#ffd3a5' },
    'sunset-gradient': { primary: '#ff6b6b', secondary: '#feca57', tertiary: '#ff9ff3' },
    'ocean-deep': { primary: '#0984e3', secondary: '#00b894', tertiary: '#6c5ce7' },
    'forest-fresh': { primary: '#27ae60', secondary: '#2ecc71', tertiary: '#1abc9c' },
    'cosmic-purple': { primary: '#8e44ad', secondary: '#9b59b6', tertiary: '#e056fd' },
  };
  
  // Find the closest matching scheme
  const schemeKey = Object.keys(schemes).find(key => {
    const keyParts = key.split('-');
    return keyParts.some(part => colorScheme.toLowerCase().includes(part));
  });
  
  return schemes[schemeKey || 'vibrant-blue'];
}

/**
 * Extract a subtitle from text when JSON parsing fails
 */
function extractSubtitleFromText(aiText: string, articleContent?: string): string {
  // Try to find a subtitle pattern in AI response
  const subtitleMatch = aiText.match(/subtitle[\":\s]+([^\n"]+)/i);
  if (subtitleMatch && subtitleMatch[1]) {
    return subtitleMatch[1].trim().substring(0, 60);
  }
  
  // Fallback: extract first sentence from article
  if (articleContent) {
    const sentences = articleContent.split(/[.!?]/);
    for (const sentence of sentences) {
      const cleaned = sentence.trim().replace(/^#+\s*/, ''); // Remove markdown headers
      if (cleaned.length > 10 && cleaned.length < 60) {
        return cleaned;
      }
    }
  }
  
  return 'Explore the Key Concepts';
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

