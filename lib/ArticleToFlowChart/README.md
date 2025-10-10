# Article to Flow Chart Module

This module converts articles into flowcharts using AI and Mermaid diagrams.

## Features

- Convert article text to structured JSON using AI
- Transform JSON into Mermaid flowchart diagrams
- Generate SVG images from Mermaid code
- Web UI for easy article-to-flowchart conversion

## Components

### 1. Article to Flow Chart Executor (`articleToFlowChartExecutor.ts`)
Chains two AI prompts to convert articles into Mermaid diagrams:
- **Step 1**: Convert article text to structured JSON
- **Step 2**: Convert JSON to Mermaid MMD format
- **Step 3**: Convert MMD to SVG (optional)

### 2. Mermaid to SVG Converter (`mermaidToSvg.ts`)
Utility for converting Mermaid code to SVG images using the Mermaid CLI.

## Installation

Make sure you have the Mermaid CLI available. It will be automatically installed when needed via npx, or you can install it globally:

```bash
npm install -g @mermaid-js/mermaid-cli
```

## Usage

### Basic Conversion

```typescript
import { convertMermaidToSvg } from './mermaidToSvg';

const mmdCode = `
flowchart TD
    Start([Start]) --> Process[Process Data]
    Process --> End([End])
`;

const result = await convertMermaidToSvg(mmdCode);
console.log('SVG created at:', result.svgPath);
```

### With Custom Options

```typescript
const result = await convertMermaidToSvg(mmdCode, {
  outputDir: './my-diagrams',
  filename: 'my-flowchart',
  keepMmdFile: true,
  backgroundColor: 'white',
  theme: 'default'
});
```

### Convert to String (No Files)

```typescript
import { convertMermaidToSvgString } from './mermaidToSvg';

const svgContent = await convertMermaidToSvgString(mmdCode);
// Use svgContent directly without saving to disk
```

### Batch Conversion

```typescript
import { batchConvertMermaidToSvg } from './mermaidToSvg';

const results = await batchConvertMermaidToSvg([
  { mmdCode: diagram1, filename: 'chart-1' },
  { mmdCode: diagram2, filename: 'chart-2' }
], {
  outputDir: './batch-output',
  theme: 'neutral'
});
```

## API Reference

### `convertMermaidToSvg(mmdCode, options?)`

Converts Mermaid code to an SVG file.

**Parameters:**
- `mmdCode` (string): The Mermaid diagram code
- `options` (MermaidToSvgOptions): Configuration options
  - `outputDir` (string): Output directory (default: `'./output'`)
  - `filename` (string): Base filename without extension (default: `'flowchart-{timestamp}'`)
  - `keepMmdFile` (boolean): Keep the intermediate .mmd file (default: `false`)
  - `configFile` (string): Path to Mermaid config file (optional)
  - `backgroundColor` (string): Background color (default: `'white'`)
  - `theme` ('default' | 'forest' | 'dark' | 'neutral'): Diagram theme (default: `'default'`)

**Returns:**
- `Promise<MermaidToSvgResult>` with properties:
  - `svgPath` (string): Path to the generated SVG file
  - `mmdPath` (string | undefined): Path to the MMD file (if kept)
  - `svgContent` (string): The SVG content as a string

### `convertMermaidToSvgString(mmdCode, options?)`

Converts Mermaid code directly to SVG string without saving files permanently.

**Parameters:**
- `mmdCode` (string): The Mermaid diagram code
- `options`: Same as `convertMermaidToSvg` except `outputDir` and `keepMmdFile`

**Returns:**
- `Promise<string>`: The SVG content as a string

### `batchConvertMermaidToSvg(diagrams, options?)`

Batch converts multiple Mermaid diagrams to SVG.

**Parameters:**
- `diagrams` (Array): Array of objects with `mmdCode` and `filename` properties
- `options`: Same as `convertMermaidToSvg` except `filename`

**Returns:**
- `Promise<MermaidToSvgResult[]>`: Array of conversion results

## Running Examples

Run the example file to see all features in action:

```bash
npm run test:mermaid
```

Or directly with tsx:

```bash
npx tsx src/lib/ArticleToFlowChart/example-mermaid-to-svg.ts
```

## Complete Workflow

To go from article to SVG:

```typescript
import { chainArticleToFlowChart } from './articleToFlowChartExecutor';
import { convertMermaidToSvg } from './mermaidToSvg';

// Step 1: Convert article to MMD
const mmdCode = await chainArticleToFlowChart();

// Step 2: Convert MMD to SVG
const result = await convertMermaidToSvg(mmdCode, {
  outputDir: './flowcharts',
  filename: 'article-flowchart',
  backgroundColor: 'white',
  theme: 'default'
});

console.log('Flow chart created at:', result.svgPath);
```

## Output Structure

By default, files are saved to:
```
./output/
  ├── flowchart-{timestamp}.svg
  └── flowchart-{timestamp}.mmd (if keepMmdFile: true)
```

## Themes

Available Mermaid themes:
- `default`: Standard theme [[memory:7731239]]
- `forest`: Green theme
- `dark`: Dark theme
- `neutral`: Neutral gray theme

## Error Handling

The utility provides clear error messages:
- If Mermaid CLI is not available, it will suggest installation
- If file operations fail, it will clean up partial files
- All errors include helpful context for debugging

## Notes

- The utility uses `npx -y` to automatically use Mermaid CLI without requiring global installation
- Temporary files are automatically cleaned up on error
- The `convertMermaidToSvgString` function creates and removes temporary files automatically
- All file paths are normalized for cross-platform compatibility

