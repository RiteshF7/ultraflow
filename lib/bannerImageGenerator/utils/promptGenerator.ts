/**
 * Banner Image Generator - Prompt Generation Utilities
 * Extracts key concepts from article content to create visual prompts
 */

/**
 * Extracts the title from markdown or plain text content
 */
function extractTitle(content: string): string {
  const lines = content.trim().split('\n');
  
  // Look for markdown h1
  const h1Match = lines.find(line => line.startsWith('# '));
  if (h1Match) {
    return h1Match.replace(/^#\s+/, '').trim();
  }
  
  // Look for first non-empty line
  const firstLine = lines.find(line => line.trim().length > 0);
  return firstLine?.trim().substring(0, 100) || 'Article Banner';
}

/**
 * Extracts key topics and keywords from article content
 */
function extractKeywords(content: string): string[] {
  const keywords: string[] = [];
  
  // Extract h2 and h3 headers (main topics)
  const headerRegex = /^#{2,3}\s+(.+)$/gm;
  let match;
  while ((match = headerRegex.exec(content)) !== null) {
    keywords.push(match[1].trim());
  }
  
  // Limit to top 5 keywords
  return keywords.slice(0, 5);
}

/**
 * Determines the theme/style based on content analysis
 */
function determineVisualStyle(content: string): string {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('technology') || lowerContent.includes('ai') || lowerContent.includes('software')) {
    return 'modern, tech-focused, digital';
  } else if (lowerContent.includes('business') || lowerContent.includes('management')) {
    return 'professional, corporate, clean';
  } else if (lowerContent.includes('science') || lowerContent.includes('research')) {
    return 'scientific, academic, precise';
  } else if (lowerContent.includes('art') || lowerContent.includes('creative')) {
    return 'artistic, vibrant, expressive';
  }
  
  return 'clean, modern, professional';
}

/**
 * Generate a visual prompt from article content
 */
export function generatePromptFromArticle(content: string): string {
  if (!content || content.trim().length === 0) {
    return 'A professional, modern banner image with abstract geometric patterns in a minimalist style.';
  }
  
  const title = extractTitle(content);
  const keywords = extractKeywords(content);
  const style = determineVisualStyle(content);
  
  const keywordText = keywords.length > 0 
    ? `focusing on themes of ${keywords.join(', ')}` 
    : 'with abstract professional imagery';
  
  return `Create a stunning banner image for an article titled "${title}". The image should be ${style}, ${keywordText}. Use a wide aspect ratio (16:9) suitable for a header banner. The composition should be visually striking with balanced colors, professional lighting, and high visual impact. Avoid text overlays.`;
}

/**
 * Create a custom image prompt with title and keywords
 */
export function createImagePrompt(title: string, keywords: string[]): string {
  const keywordText = keywords.length > 0 
    ? `incorporating elements of ${keywords.join(', ')}` 
    : 'with professional abstract design';
  
  return `Design a professional banner image for "${title}", ${keywordText}. Create a visually compelling composition with modern aesthetics, balanced color palette, and professional quality. Wide format (16:9). No text in the image.`;
}

/**
 * Validate and enhance custom prompts
 */
export function enhanceCustomPrompt(customPrompt: string): string {
  if (!customPrompt || customPrompt.trim().length === 0) {
    return generatePromptFromArticle('');
  }
  
  // Ensure prompt includes banner/wide format guidance
  const prompt = customPrompt.trim();
  const enhancements = [];
  
  if (!prompt.toLowerCase().includes('banner') && !prompt.toLowerCase().includes('wide')) {
    enhancements.push('Create as a wide banner format (16:9)');
  }
  
  if (!prompt.toLowerCase().includes('professional') && !prompt.toLowerCase().includes('quality')) {
    enhancements.push('with professional quality');
  }
  
  return enhancements.length > 0 
    ? `${prompt}. ${enhancements.join(', ')}.`
    : prompt;
}

