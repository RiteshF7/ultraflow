/**
 * Article to Flow Chart Executor
 * 
 * High-level functions that orchestrate the three-step pipeline:
 * 1. Article → JSON
 * 2. JSON → MMD
 * 3. MMD → Image
 */

// Load environment variables for Node.js execution
import { config } from 'dotenv';
config();

import { convertArticleToMermaid, type ArticleToMermaidResult, type DiagramData } from './step1-articleToMermaid';
import { convertMmdToImage, type MmdToImageResult, type MmdToImageOptions } from './step2-mmdToImage';

/**
 * Mermaid diagrams result (compatible with old Step 2 format)
 */
export interface MermaidDiagramsResult {
  diagrams: DiagramData[];
  count: number;
  originalJson: string;
  timestamp: number;
}

/**
 * Result of the complete article to flow chart conversion
 */
export interface ArticleToFlowChartResult {
  /**
   * Result from Step 1: Article to Mermaid diagrams (single AI call)
   */
  step1: ArticleToMermaidResult;

  /**
   * Result from Step 2: Passthrough (for backward compatibility)
   */
  step2: MermaidDiagramsResult;

  /**
   * Result from Step 3: MMD to Image (optional)
   */
  step3?: MmdToImageResult;
}

/**
 * Execute the complete article to flowchart pipeline
 * Returns MMD code (does not generate image file)
 * 
 * @param articleText - The article text to convert
 * @param themeInstructions - Optional theme instructions for the flowchart
 * @returns Promise with the complete pipeline results
 * 
 * @example
 * ```typescript
 * const result = await executeArticleToFlowChart(articleText, themeInstructions);
 * console.log('MMD Code:', result.step2.mmdCode);
 * ```
 */
export async function executeArticleToFlowChart(
  articleText: string,
  themeInstructions?: string,
  count: number = 3
): Promise<Omit<ArticleToFlowChartResult, 'step3'>> {
  try {
    // Step 1: Convert article directly to Mermaid diagrams (single AI call)
    const step1Result = await convertArticleToMermaid(articleText, themeInstructions, count);

    // Step 2: Just pass through the diagrams (no additional AI call needed)
    const step2Result: MermaidDiagramsResult = {
      diagrams: step1Result.diagrams,
      count: step1Result.count,
      originalJson: articleText,
      timestamp: Date.now()
    };

    console.log('✅ Pipeline complete - single AI call optimization');

    return {
      step1: step1Result,
      step2: step2Result
    };
  } catch (error) {
    console.error('❌ Error in executeArticleToFlowChart:', error);
    throw error;
  }
}

/**
 * Execute the complete article to flowchart pipeline with image generation
 * 
 * @param articleText - The article text to convert
 * @param imageOptions - Options for image generation (Step 3)
 * @param themeInstructions - Optional theme instructions for the flowchart
 * @returns Promise with the complete pipeline results including image
 * 
 * @example
 * ```typescript
 * const result = await executeArticleToFlowChartWithImage(articleText, {
 *   format: 'svg',
 *   outputDir: './diagrams',
 *   theme: 'default'
 * }, themeInstructions);
 * 
 * console.log('Image saved to:', result.step3.imagePath);
 * ```
 */
export async function executeArticleToFlowChartWithImage(
  articleText: string,
  imageOptions: MmdToImageOptions = {},
  themeInstructions?: string
): Promise<ArticleToFlowChartResult> {
  try {
    // Execute Steps 1 & 2
    const result = await executeArticleToFlowChart(articleText, themeInstructions);

    // Step 3: Convert first MMD to Image (for backwards compatibility)
    const firstDiagram = result.step2.diagrams[0];
    if (!firstDiagram) {
      throw new Error('No diagrams generated');
    }

    const step3Result = await convertMmdToImage(firstDiagram.mermaidCode, {
      format: 'svg',
      backgroundColor: 'white',
      theme: 'default',
      ...imageOptions
    });

    return {
      step1: result.step1,
      step2: result.step2,
      step3: step3Result
    };
  } catch (error) {
    console.error('❌ Error in executeArticleToFlowChartWithImage:', error);
    throw error;
  }
}

/**
 * Execute just Step 1: Article to Mermaid diagrams
 * Useful for testing or when you only need the diagrams
 * 
 * @param articleText - The article text to convert
 * @param themeInstructions - Optional theme instructions for the flowchart
 * @returns Promise with Mermaid diagrams result
 */
export async function executeStep1Only(
  articleText: string,
  themeInstructions?: string
): Promise<ArticleToMermaidResult> {
  return await convertArticleToMermaid(articleText, themeInstructions);
}

/**
 * Execute Steps 1 & 2: Article to Mermaid diagrams
 * Note: Step 2 is now just a passthrough for backward compatibility
 * 
 * @param articleText - The article text to convert
 * @param themeInstructions - Optional theme instructions for the flowchart
 * @returns Promise with step results
 */
export async function executeSteps1And2(
  articleText: string,
  themeInstructions?: string
): Promise<{ step1: ArticleToMermaidResult; step2: MermaidDiagramsResult }> {
  return await executeArticleToFlowChart(articleText, themeInstructions);
}
