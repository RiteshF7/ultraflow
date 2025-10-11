import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * AI-Enhanced Banner Image Generation API
 * 
 * This endpoint uses Gemini AI to analyze the article content and generate
 * an intelligent, context-aware banner with enhanced colors, layout, and design elements.
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

    // Create a prompt for Gemini to analyze the article and suggest banner design
    const aiPrompt = `
Analyze the following article and create a banner design specification:

Title: ${articleTitle || 'Article'}
Content: ${articleContent ? articleContent.substring(0, 1000) : finalPrompt}

Please provide a JSON response with the following structure:
{
  "title": "A catchy, concise title for the banner (max 50 characters)",
  "subtitle": "A descriptive subtitle (max 60 characters)",
  "theme": "The main theme/mood (e.g., 'technology', 'nature', 'business', 'education', 'science')",
  "colorScheme": "Suggest a color scheme name (e.g., 'vibrant-blue', 'warm-orange', 'cool-purple', 'nature-green', 'tech-cyan', 'elegant-pink', 'professional-navy', 'energetic-red')",
  "keywords": ["3-5 key visual elements or concepts to represent"],
  "mood": "The emotional tone (e.g., 'professional', 'creative', 'energetic', 'calm', 'innovative')"
}

Only respond with valid JSON, no additional text.
`;

    let designSpec;
    
    try {
      const result = await model.generateContent(aiPrompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('🤖 Gemini raw response:', text.substring(0, 200));

      // Try to parse the AI response
      try {
        // Remove markdown code blocks if present
        let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        // Extract JSON from the response
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          designSpec = JSON.parse(jsonMatch[0]);
          console.log('✅ Successfully parsed AI design spec');
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.warn('⚠️ Failed to parse AI response, using fallback:', parseError);
        // Fallback: extract information from text
        designSpec = {
          title: articleTitle || 'Article Banner',
          subtitle: extractSubtitleFromText(text, articleContent),
          theme: 'technology',
          colorScheme: 'vibrant-blue',
          keywords: ['innovation', 'ideas', 'knowledge'],
          mood: 'professional'
        };
      }
    } catch (aiError) {
      console.error('⚠️ Gemini API error, using fallback design:', aiError);
      // Complete fallback if Gemini fails
      designSpec = {
        title: articleTitle || 'Article Banner',
        subtitle: 'Explore the Key Concepts',
        theme: 'technology',
        colorScheme: 'vibrant-blue',
        keywords: ['knowledge', 'insights', 'learning'],
        mood: 'professional'
      };
    }

    console.log('🎨 Final design specification:', designSpec);

    // Generate enhanced banner based on AI suggestions
    const imageData = await generateAIEnhancedBanner(designSpec);

    return NextResponse.json({
      success: true,
      imageData,
      designSpec,
      message: 'Banner generated using Gemini AI analysis'
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
 * Generate an AI-enhanced banner based on design specifications
 */
async function generateAIEnhancedBanner(designSpec: any): Promise<string> {
  const width = 1200;
  const height = 630;
  
  // Get colors based on AI suggestion
  const colors = getColorsForTheme(designSpec.colorScheme, designSpec.theme);
  
  // Generate decorative elements based on keywords
  const decorativeElements = generateDecorativeElements(designSpec.keywords, designSpec.mood);
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
          <stop offset="50%" style="stop-color:${colors.secondary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.tertiary};stop-opacity:1" />
        </linearGradient>
        <linearGradient id="overlayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:rgba(0,0,0,0);stop-opacity:0" />
          <stop offset="100%" style="stop-color:rgba(0,0,0,0.3);stop-opacity:1" />
        </linearGradient>
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        </pattern>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Background gradient -->
      <rect width="${width}" height="${height}" fill="url(#mainGrad)"/>
      
      <!-- Grid overlay -->
      <rect width="${width}" height="${height}" fill="url(#grid)"/>
      
      <!-- Decorative elements based on AI analysis -->
      ${decorativeElements}
      
      <!-- Dark overlay for text readability -->
      <rect width="${width}" height="${height}" fill="url(#overlayGrad)"/>
      
      <!-- Title with glow effect -->
      <text x="${width / 2}" y="${height / 2 - 30}" 
            font-family="system-ui, -apple-system, sans-serif" 
            font-size="52" 
            font-weight="bold" 
            fill="white" 
            text-anchor="middle"
            filter="url(#glow)">
        ${escapeXml(designSpec.title)}
      </text>
      
      <!-- Subtitle -->
      <text x="${width / 2}" y="${height / 2 + 35}" 
            font-family="system-ui, -apple-system, sans-serif" 
            font-size="26" 
            fill="rgba(255,255,255,0.95)" 
            text-anchor="middle">
        ${escapeXml(designSpec.subtitle)}
      </text>
      
      <!-- Mood badge -->
      <rect x="${width - 180}" y="30" width="150" height="35" rx="17.5" fill="rgba(255,255,255,0.2)"/>
      <text x="${width - 105}" y="53" 
            font-family="system-ui, -apple-system, sans-serif" 
            font-size="16" 
            fill="white" 
            text-anchor="middle">
        ${escapeXml(designSpec.mood.toUpperCase())}
      </text>
    </svg>
  `;
  
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Generate decorative elements based on keywords and mood
 */
function generateDecorativeElements(keywords: string[], mood: string): string {
  const elements: string[] = [];
  
  // Base decorative circles
  if (mood.includes('energetic') || mood.includes('creative')) {
    // Dynamic, scattered circles
    elements.push(`
      <circle cx="150" cy="150" r="120" fill="rgba(255,255,255,0.15)"/>
      <circle cx="1050" cy="480" r="150" fill="rgba(255,255,255,0.12)"/>
      <circle cx="900" cy="100" r="80" fill="rgba(255,255,255,0.1)"/>
      <circle cx="300" cy="500" r="60" fill="rgba(255,255,255,0.18)"/>
    `);
  } else if (mood.includes('professional') || mood.includes('business')) {
    // Structured, geometric shapes
    elements.push(`
      <rect x="50" y="50" width="200" height="200" rx="20" fill="rgba(255,255,255,0.1)" transform="rotate(-15 150 150)"/>
      <rect x="950" y="380" width="180" height="180" rx="20" fill="rgba(255,255,255,0.12)" transform="rotate(20 1040 470)"/>
    `);
  } else {
    // Calm, subtle circles
    elements.push(`
      <circle cx="100" cy="100" r="150" fill="rgba(255,255,255,0.12)"/>
      <circle cx="1100" cy="530" r="180" fill="rgba(255,255,255,0.1)"/>
    `);
  }
  
  return elements.join('\n');
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
  };
  
  // Find the closest matching scheme
  const schemeKey = Object.keys(schemes).find(key => 
    colorScheme.toLowerCase().includes(key.split('-')[0]) || 
    colorScheme.toLowerCase().includes(key.split('-')[1])
  );
  
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

