/**
 * Article to Flow Chart Module
 * 
 * Optimized single-step pipeline for converting articles to flowchart diagrams:
 * 1. Article → Mermaid diagrams (multiple flowcharts in one AI call)
 * 2. Mermaid → Image (SVG or PNG, optional)
 */

// Step 1: Article to Mermaid Diagrams (direct conversion)
export {
  convertArticleToMermaid,
  type ArticleToMermaidResult,
  type DiagramData
} from './step1-articleToMermaid';

// Step 2: Mermaid to Image (Server-side CLI)
export {
  convertMmdToImage,
  convertMmdToImageString,
  batchConvertMmdToImage,
  convertMmdToBothFormats,
  type MmdToImageOptions,
  type MmdToImageResult,
  type ImageFormat,
  type MermaidTheme
} from './step2-mmdToImage';

// Step 2: Mermaid to Image (Browser-based)
export {
  initializeMermaid,
  sanitizeMermaidCode,
  validateMermaidCode,
  renderMermaidToElement,
  extractMultipleDiagrams,
  downloadSvg,
  downloadPng
} from './step2-mmdToImage-browser';

// Legacy SVG exports for backward compatibility
export {
  convertMermaidToSvg,
  convertMermaidToSvgString,
  batchConvertMermaidToSvg,
  type MermaidToSvgOptions,
  type MermaidToSvgResult
} from './step2-mmdToImage';

// High-level executor functions
export {
  executeArticleToFlowChart,
  executeArticleToFlowChartWithImage,
  executeStep1Only,
  executeSteps1And2,
  type ArticleToFlowChartResult,
  type MermaidDiagramsResult
} from './articleToFlowChartExecutor';

