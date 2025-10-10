/**
 * Step 3: Mermaid to Image Converter
 * Converts Mermaid MMD code to SVG or PNG images using the Mermaid CLI
 */

import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

/**
 * Image format options
 */
export type ImageFormat = 'svg' | 'png';

/**
 * Theme options for Mermaid diagrams
 */
export type MermaidTheme = 'default' | 'forest' | 'dark' | 'neutral';

/**
 * Options for converting Mermaid code to images
 */
export interface MmdToImageOptions {
  /**
   * Output directory for generated files (default: './output')
   */
  outputDir?: string;
  
  /**
   * Base filename without extension (default: 'diagram-{timestamp}')
   */
  filename?: string;
  
  /**
   * Whether to keep the intermediate .mmd file (default: false)
   */
  keepMmdFile?: boolean;
  
  /**
   * Image format: 'svg' or 'png' (default: 'svg')
   */
  format?: ImageFormat;
  
  /**
   * Mermaid CLI config file path (optional)
   */
  configFile?: string;
  
  /**
   * Background color for the image (default: 'white')
   */
  backgroundColor?: string;
  
  /**
   * Theme for the diagram (default: 'default')
   */
  theme?: MermaidTheme;
  
  /**
   * Width for PNG output (only applies to PNG format)
   */
  width?: number;
  
  /**
   * Height for PNG output (only applies to PNG format)
   */
  height?: number;
}

/**
 * Result of the Mermaid to Image conversion
 */
export interface MmdToImageResult {
  /**
   * Path to the generated image file
   */
  imagePath: string;
  
  /**
   * Path to the intermediate MMD file (if kept)
   */
  mmdPath?: string;
  
  /**
   * The image content as a string
   */
  imageContent: string;
  
  /**
   * Image format used
   */
  format: ImageFormat;
}

/**
 * Converts Mermaid code to an image file (SVG or PNG)
 * 
 * @param mmdCode - The Mermaid diagram code
 * @param options - Configuration options
 * @returns Promise with paths to generated files and image content
 * 
 * @example
 * ```typescript
 * // Generate SVG
 * const result = await convertMmdToImage(mmdCode, {
 *   format: 'svg',
 *   outputDir: './diagrams',
 *   filename: 'my-flowchart'
 * });
 * 
 * // Generate PNG
 * const pngResult = await convertMmdToImage(mmdCode, {
 *   format: 'png',
 *   width: 1920,
 *   height: 1080
 * });
 * ```
 */
export async function convertMmdToImage(
  mmdCode: string,
  options: MmdToImageOptions = {}
): Promise<MmdToImageResult> {
  // Set default options
  const {
    outputDir = './output',
    filename = `diagram-${Date.now()}`,
    keepMmdFile = false,
    format = 'svg',
    configFile,
    backgroundColor = 'white',
    theme = 'default',
    width,
    height
  } = options;

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  // Define file paths
  const mmdPath = path.join(outputDir, `${filename}.mmd`);
  const imageExt = format === 'png' ? 'png' : 'svg';
  const imagePath = path.join(outputDir, `${filename}.${imageExt}`);

  try {
    // Write the Mermaid code to a .mmd file
    await fs.writeFile(mmdPath, mmdCode, 'utf-8');
    
    // Build the Mermaid CLI command
    // Correct format: npx -y -p @mermaid-js/mermaid-cli mmdc -i input.mmd -o output.svg
    let command = `npx -y -p @mermaid-js/mermaid-cli mmdc -i "${mmdPath}" -o "${imagePath}"`;
    
    // Add optional config file
    if (configFile) {
      command += ` -c "${configFile}"`;
    }
    
    // Execute the Mermaid CLI command
    const { stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('Done in')) {
      console.warn('⚠️ Mermaid CLI warnings:', stderr);
    }
    
    // Read the generated image content
    const imageContent = await fs.readFile(imagePath, 'utf-8');
    
    // Optionally delete the .mmd file
    if (!keepMmdFile) {
      await fs.unlink(mmdPath);
    }
    
    return {
      imagePath,
      mmdPath: keepMmdFile ? mmdPath : undefined,
      imageContent,
      format
    };
    
  } catch (error) {
    // Clean up on error
    try {
      await fs.unlink(mmdPath).catch(() => {});
      await fs.unlink(imagePath).catch(() => {});
    } catch {}
    
    if (error instanceof Error) {
      // Check for common errors
      if (error.message.includes('command not found') || error.message.includes('not recognized')) {
        throw new Error(
          'Mermaid CLI is not installed. It will be automatically installed via npx on first use.'
        );
      }
      throw new Error(`Failed to convert Mermaid to ${format.toUpperCase()}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Converts Mermaid code directly to image content without saving files
 * Note: This still creates temporary files but cleans them up
 * 
 * @param mmdCode - The Mermaid diagram code
 * @param options - Configuration options (outputDir will be a temp directory)
 * @returns Promise with the image content as a string
 */
export async function convertMmdToImageString(
  mmdCode: string,
  options: Omit<MmdToImageOptions, 'outputDir' | 'keepMmdFile'> = {}
): Promise<string> {
  const tempDir = path.join(process.cwd(), '.tmp-mermaid');
  
  try {
    const result = await convertMmdToImage(mmdCode, {
      ...options,
      outputDir: tempDir,
      keepMmdFile: false
    });
    
    // Clean up the image file after reading
    await fs.unlink(result.imagePath).catch(() => {});
    
    // Try to remove temp directory
    await fs.rmdir(tempDir).catch(() => {});
    
    return result.imageContent;
  } catch (error) {
    // Ensure cleanup on error
    try {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    } catch {}
    throw error;
  }
}

/**
 * Batch convert multiple Mermaid diagrams to images
 * 
 * @param diagrams - Array of objects with mmdCode and filename
 * @param options - Common configuration options for all conversions
 * @returns Promise with array of conversion results
 */
export async function batchConvertMmdToImage(
  diagrams: Array<{ mmdCode: string; filename: string }>,
  options: Omit<MmdToImageOptions, 'filename'> = {}
): Promise<MmdToImageResult[]> {
  const results: MmdToImageResult[] = [];
  
  for (const { mmdCode, filename } of diagrams) {
    const result = await convertMmdToImage(mmdCode, {
      ...options,
      filename
    });
    
    results.push(result);
  }
  
  return results;
}

/**
 * Convert Mermaid code to both SVG and PNG formats
 * 
 * @param mmdCode - The Mermaid diagram code
 * @param options - Configuration options
 * @returns Promise with results for both formats
 */
export async function convertMmdToBothFormats(
  mmdCode: string,
  options: MmdToImageOptions = {}
): Promise<{
  svg: MmdToImageResult;
  png: MmdToImageResult;
}> {
  const svgResult = await convertMmdToImage(mmdCode, {
    ...options,
    format: 'svg'
  });
  
  const pngResult = await convertMmdToImage(mmdCode, {
    ...options,
    format: 'png',
    filename: options.filename ? `${options.filename}` : undefined
  });
  
  return {
    svg: svgResult,
    png: pngResult
  };
}

// ============================================================================
// Legacy SVG-specific exports (for backward compatibility)
// ============================================================================

/**
 * Legacy: Options for converting Mermaid code to SVG
 * @deprecated Use MmdToImageOptions with format: 'svg' instead
 */
export interface MermaidToSvgOptions {
  outputDir?: string;
  filename?: string;
  keepMmdFile?: boolean;
  configFile?: string;
  backgroundColor?: string;
  theme?: MermaidTheme;
}

/**
 * Legacy: Result of the Mermaid to SVG conversion
 * @deprecated Use MmdToImageResult instead
 */
export interface MermaidToSvgResult {
  svgPath: string;
  mmdPath?: string;
  svgContent: string;
}

/**
 * Legacy: Converts Mermaid code to an SVG image file
 * @deprecated Use convertMmdToImage with format: 'svg' instead
 * 
 * @param mmdCode - The Mermaid diagram code
 * @param options - Configuration options
 * @returns Promise with paths to generated files and SVG content
 */
export async function convertMermaidToSvg(
  mmdCode: string,
  options: MermaidToSvgOptions = {}
): Promise<MermaidToSvgResult> {
  const result = await convertMmdToImage(mmdCode, {
    ...options,
    format: 'svg'
  });
  
  return {
    svgPath: result.imagePath,
    mmdPath: result.mmdPath,
    svgContent: result.imageContent
  };
}

/**
 * Legacy: Converts Mermaid code directly to SVG content without saving files
 * @deprecated Use convertMmdToImageString with format: 'svg' instead
 * 
 * @param mmdCode - The Mermaid diagram code
 * @param options - Configuration options (outputDir will be a temp directory)
 * @returns Promise with the SVG content as a string
 */
export async function convertMermaidToSvgString(
  mmdCode: string,
  options: Omit<MermaidToSvgOptions, 'outputDir' | 'keepMmdFile'> = {}
): Promise<string> {
  return await convertMmdToImageString(mmdCode, {
    ...options,
    format: 'svg'
  });
}

/**
 * Legacy: Batch convert multiple Mermaid diagrams to SVG
 * @deprecated Use batchConvertMmdToImage with format: 'svg' instead
 * 
 * @param diagrams - Array of objects with mmdCode and filename
 * @param options - Common configuration options for all conversions
 * @returns Promise with array of conversion results
 */
export async function batchConvertMermaidToSvg(
  diagrams: Array<{ mmdCode: string; filename: string }>,
  options: Omit<MermaidToSvgOptions, 'filename'> = {}
): Promise<MermaidToSvgResult[]> {
  const results = await batchConvertMmdToImage(diagrams, {
    ...options,
    format: 'svg'
  });
  
  return results.map(result => ({
    svgPath: result.imagePath,
    mmdPath: result.mmdPath,
    svgContent: result.imageContent
  }));
}

