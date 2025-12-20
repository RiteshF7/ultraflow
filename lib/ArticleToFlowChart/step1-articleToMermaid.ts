/**
 * Step 1: Article to Mermaid Diagrams Converter
 * Converts article text directly into multiple Mermaid flowchart diagrams using AI
 */

import { promptManager } from '../promptmanager';

/**
 * Single diagram result from AI
 */
export interface DiagramData {
  title: string;
  mermaidCode: string;
}

/**
 * Result from article to Mermaid diagrams conversion
 */
export interface ArticleToMermaidResult {
  /**
   * Array of diagrams generated directly from article
   */
  diagrams: DiagramData[];

  /**
   * Number of diagrams
   */
  count: number;

  /**
   * Original article text
   */
  originalArticle: string;
}

/**
 * Convert article text directly to Mermaid diagrams (no intermediate JSON step)
 * 
 * @param articleText - The article text to convert
 * @param themeInstructions - Optional theme instructions for the flowchart
 * @returns Promise with Mermaid diagrams
 * 
 * @example
 * ```typescript
 * const result = await convertArticleToMermaid(articleText, themeInstructions);
 * console.log(`Generated ${result.count} diagrams`);
 * result.diagrams.forEach(d => console.log(d.title, d.mermaidCode));
 * ```
 */
export async function convertArticleToMermaid(
  articleText: string,
  themeInstructions?: string,
  count: number = 3
): Promise<ArticleToMermaidResult> {
  if (!articleText || articleText.trim().length < 10) {
    throw new Error('Article text is too short or empty');
  }

  try {
    console.log(`📝 Converting article directly to ${count} Mermaid diagrams...`);
    console.log('📏 Article length:', articleText.length);
    if (themeInstructions) {
      console.log('🎨 Theme instructions provided:', themeInstructions.substring(0, 100));
    }

    const response = await promptManager.executePrompt('article-to-json', {
      variables: {
        content: articleText,
        themeInstructions: themeInstructions || '',
        count: count.toString()
      }
    });

    console.log('✅ Received response from AI');
    console.log('📏 Response length:', response?.length || 0);
    console.log('📄 Response preview:', response?.substring(0, 300));

    if (!response || response.trim().length === 0) {
      throw new Error('AI returned empty response');
    }

    // Parse delimiter-based format
    const diagrams = parseDelimiterBasedDiagrams(response);

    if (diagrams.length === 0) {
      // Fallback: Treat entire response as single Mermaid diagram
      console.warn('⚠️ No delimiters found, treating as single diagram');

      const cleanedMmd = cleanMermaidCode(response);

      return {
        diagrams: [{
          title: 'Generated Flowchart',
          mermaidCode: cleanedMmd
        }],
        count: 1,
        originalArticle: articleText
      };
    }

    console.log(`✅ Generated ${diagrams.length} flowchart(s) directly from article`);
    diagrams.forEach((diagram, i) => {
      console.log(`  ${i + 1}. "${diagram.title}" (${diagram.mermaidCode.split('\n')[0]})`);
    });

    return {
      diagrams,
      count: diagrams.length,
      originalArticle: articleText
    };
  } catch (error) {
    console.error('❌ Error in convertArticleToMermaid:', error);
    throw error;
  }
}

/**
 * Parse delimiter-based diagram format
 * Format: ---DIAGRAM: Title---\nMermaid code\n\n---DIAGRAM: Title2---\nMermaid code
 */
function parseDelimiterBasedDiagrams(response: string): DiagramData[] {
  const diagrams: DiagramData[] = [];

  // Clean the response first
  let cleaned = response.trim();

  // Remove any markdown code blocks that might wrap the entire response
  cleaned = cleaned.replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/i, '');

  // Split by the delimiter pattern: ---DIAGRAM: Title---
  const delimiterRegex = /---DIAGRAM:\s*(.+?)---/gi;
  const parts = cleaned.split(delimiterRegex);

  // parts will be: [text before first delimiter, title1, content1, title2, content2, ...]
  // We skip the first element (text before first delimiter) and process pairs
  for (let i = 1; i < parts.length; i += 2) {
    const title = parts[i]?.trim();
    const mermaidCode = parts[i + 1]?.trim();

    if (title && mermaidCode) {
      // Clean the mermaid code
      const cleanedCode = cleanMermaidCode(mermaidCode);

      if (cleanedCode) {
        diagrams.push({
          title,
          mermaidCode: cleanedCode
        });
      }
    }
  }

  return diagrams;
}

/**
 * Clean Mermaid code by removing markdown wrappers and extra whitespace
 */
function cleanMermaidCode(code: string): string {
  let cleaned = code.trim();

  // Remove markdown code block wrappers
  if (cleaned.startsWith('```mermaid')) {
    cleaned = cleaned.replace(/^```mermaid\s*/i, '').replace(/```\s*$/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/i, '').replace(/```\s*$/i, '');
  }

  // Remove any leading/trailing whitespace
  cleaned = cleaned.trim();

  // Remove text after the last line of valid mermaid code
  // (sometimes AI adds explanatory text after)
  const lines = cleaned.split('\n');
  let lastValidLine = lines.length - 1;

  // Find the last line that looks like valid mermaid syntax
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (line && !line.startsWith('---') && !line.match(/^(note|explanation|description):/i)) {
      lastValidLine = i;
      break;
    }
  }

  cleaned = lines.slice(0, lastValidLine + 1).join('\n');

  return cleaned.trim();
}

