# capabilities.md

## Module: /lib/ArticleToFlowChart

### 🧩 Capabilities
- [x] Handles conversion of article text to Mermaid flowchart diagrams
- [x] Exposes `executeArticleToFlowChart()` for end-to-end article → diagram conversion
- [x] Converts articles directly to multiple Mermaid diagrams in a single AI call (optimized pipeline)
- [x] Supports optional image generation (SVG/PNG) from Mermaid code
- [x] Provides `convertArticleToMermaid()` for Step 1: Article → Mermaid diagrams
- [x] Provides `convertMmdToImage()` for Step 2: Mermaid → Image file (server-side CLI)
- [x] Provides browser-based rendering utilities via `renderMermaidToElement()`
- [x] Depends on `promptManager` for AI-powered article analysis
- [x] Supports custom theme instructions for flowchart styling
- [x] Parses delimiter-based diagram format from AI responses
- [x] Cleans and validates Mermaid code automatically
- [x] Emits detailed console logs for debugging pipeline flow
- [x] Returns structured results with diagram data, counts, and metadata

### 📥 Inputs

**High-Level Executor Functions:**

- `executeArticleToFlowChart(articleText: string, themeInstructions?: string): Promise<ArticleToFlowChartResult>`
  - `articleText`: The article content to convert (minimum 10 characters)
  - `themeInstructions`: Optional styling/theme instructions for flowcharts
  - Returns MMD code without generating image files

- `executeArticleToFlowChartWithImage(articleText: string, imageOptions?: MmdToImageOptions, themeInstructions?: string): Promise<ArticleToFlowChartResult>`
  - `articleText`: The article content to convert
  - `imageOptions`: Image generation options (format, theme, outputDir, etc.)
  - `themeInstructions`: Optional flowchart styling instructions
  - Returns complete result including image file generation

- `executeStep1Only(articleText: string, themeInstructions?: string): Promise<ArticleToMermaidResult>`
  - Executes only Step 1: Article → Mermaid diagrams

- `executeSteps1And2(articleText: string, themeInstructions?: string): Promise<{ step1, step2 }>`
  - Executes Steps 1 & 2 (Step 2 is passthrough for backward compatibility)

**Step 1: Article to Mermaid:**

- `convertArticleToMermaid(articleText: string, themeInstructions?: string): Promise<ArticleToMermaidResult>`
  - Converts article directly to Mermaid diagrams using AI
  - Parses delimiter format: `---DIAGRAM: Title---`
  - Cleans and validates Mermaid code
  - Returns multiple diagrams with titles

**Step 2: Mermaid to Image (Server-side):**

- `convertMmdToImage(mermaidCode: string, options?: MmdToImageOptions): Promise<MmdToImageResult>`
  - `mermaidCode`: Mermaid diagram code
  - `options.format?`: 'svg' | 'png' (default: 'svg')
  - `options.outputDir?`: Output directory path
  - `options.fileName?`: Custom filename
  - `options.theme?`: Mermaid theme ('default', 'forest', 'dark', 'neutral')
  - `options.backgroundColor?`: Background color
  - `options.width?`: Image width
  - `options.height?`: Image height

- `batchConvertMmdToImage(diagrams: DiagramData[], options?: MmdToImageOptions): Promise<MmdToImageResult[]>`
  - Convert multiple diagrams at once

- `convertMmdToBothFormats(mermaidCode: string, options?: MmdToImageOptions): Promise<{ svg, png }>`
  - Generate both SVG and PNG from same diagram

**Step 2: Browser-based Rendering:**

- `initializeMermaid(theme?: MermaidTheme): void` - Initialize Mermaid in browser
- `renderMermaidToElement(code: string, elementId: string): Promise<void>` - Render to DOM element
- `validateMermaidCode(code: string): { valid: boolean, error?: string }` - Validate syntax
- `sanitizeMermaidCode(code: string): string` - Clean and sanitize code
- `extractMultipleDiagrams(text: string): DiagramData[]` - Parse multiple diagrams
- `downloadSvg(svgElement: SVGElement, filename: string): void` - Download as SVG
- `downloadPng(svgElement: SVGElement, filename: string): Promise<void>` - Download as PNG

### 📤 Outputs

**ArticleToFlowChartResult:**
```typescript
{
  step1: {
    diagrams: DiagramData[];      // Array of generated diagrams
    count: number;                 // Number of diagrams
    originalArticle: string;       // Original article text
  },
  step2: {
    diagrams: DiagramData[];       // Passthrough from step1
    count: number;                 // Diagram count
    originalJson: string;          // Original article
    timestamp: number;             // Generation timestamp
  },
  step3?: {                        // Optional image generation result
    imagePath: string;             // Path to generated image
    format: 'svg' | 'png';         // Image format
    success: boolean;              // Generation success
  }
}
```

**DiagramData:**
```typescript
{
  title: string;        // Diagram title
  mermaidCode: string;  // Mermaid flowchart code
}
```

**ArticleToMermaidResult:**
```typescript
{
  diagrams: DiagramData[];   // Generated diagrams
  count: number;             // Number of diagrams
  originalArticle: string;   // Original article text
}
```

**MmdToImageResult:**
```typescript
{
  imagePath: string;     // Path to saved image file
  format: ImageFormat;   // 'svg' or 'png'
  success: boolean;      // Whether generation succeeded
  mermaidCode?: string;  // Original Mermaid code
  error?: string;        // Error message if failed
}
```

### ⚠️ Side Effects
- Makes AI API calls through `promptManager.executePrompt()`
- Writes image files to disk when using server-side `convertMmdToImage()`
- Loads environment variables via `dotenv` config
- Logs detailed pipeline progress to console (prefixed with 📝, ✅, ❌, ⚠️)
- Manipulates DOM when using browser-based rendering functions
- Creates output directories if they don't exist (server-side image generation)
- Executes Mermaid CLI commands (server-side rendering)

### 🎨 Delimiter Format

AI responses use a delimiter format to separate multiple diagrams:

```
---DIAGRAM: User Authentication Flow---
graph TD
    A[Start] --> B{Logged In?}
    B -->|Yes| C[Dashboard]
    B -->|No| D[Login Page]

---DIAGRAM: Payment Processing---
graph LR
    A[Cart] --> B[Checkout]
    B --> C[Payment]
    C --> D[Confirmation]
```

### 🧪 Example Usage

**Basic Article to Flowchart:**
```ts
import { executeArticleToFlowChart } from '@/lib/ArticleToFlowChart';

const article = `
The user authentication process begins when a user visits the login page.
They enter credentials, which are validated against the database.
If valid, a session is created and the user is redirected to the dashboard.
Otherwise, an error message is shown.
`;

const result = await executeArticleToFlowChart(article);

console.log(`Generated ${result.step1.count} diagram(s)`);
result.step1.diagrams.forEach(diagram => {
  console.log(`Title: ${diagram.title}`);
  console.log(`Code: ${diagram.mermaidCode}`);
});
```

**With Theme Instructions:**
```ts
import { executeArticleToFlowChart } from '@/lib/ArticleToFlowChart';

const themeInstructions = `
Use modern styling with:
- Blue color scheme
- Rounded corners
- Clear, concise labels
- Left-to-right orientation
`;

const result = await executeArticleToFlowChart(
  articleText,
  themeInstructions
);
```

**With Image Generation:**
```ts
import { executeArticleToFlowChartWithImage } from '@/lib/ArticleToFlowChart';

const result = await executeArticleToFlowChartWithImage(
  articleText,
  {
    format: 'svg',
    outputDir: './flowcharts',
    fileName: 'user-flow',
    theme: 'default',
    backgroundColor: 'white'
  },
  themeInstructions
);

console.log('Image saved to:', result.step3?.imagePath);
```

**Step-by-Step Execution:**
```ts
import { 
  convertArticleToMermaid,
  convertMmdToImage 
} from '@/lib/ArticleToFlowChart';

// Step 1: Generate diagrams
const mermaidResult = await convertArticleToMermaid(articleText);

// Step 2: Convert each diagram to image
for (const diagram of mermaidResult.diagrams) {
  const imageResult = await convertMmdToImage(diagram.mermaidCode, {
    format: 'png',
    outputDir: './output',
    fileName: diagram.title.toLowerCase().replace(/\s+/g, '-'),
    theme: 'forest'
  });
  
  console.log(`Saved: ${imageResult.imagePath}`);
}
```

**Batch Convert to Images:**
```ts
import { 
  convertArticleToMermaid,
  batchConvertMmdToImage 
} from '@/lib/ArticleToFlowChart';

const mermaidResult = await convertArticleToMermaid(articleText);

const imageResults = await batchConvertMmdToImage(
  mermaidResult.diagrams,
  {
    format: 'svg',
    outputDir: './diagrams',
    theme: 'default'
  }
);

imageResults.forEach((result, i) => {
  console.log(`Diagram ${i + 1}: ${result.imagePath}`);
});
```

**Browser-based Rendering:**
```ts
import { 
  initializeMermaid,
  renderMermaidToElement,
  validateMermaidCode,
  downloadSvg
} from '@/lib/ArticleToFlowChart';

// Initialize Mermaid in browser
initializeMermaid('default');

// Validate code before rendering
const validation = validateMermaidCode(mermaidCode);
if (!validation.valid) {
  console.error('Invalid Mermaid code:', validation.error);
  return;
}

// Render to DOM element
await renderMermaidToElement(mermaidCode, 'diagram-container');

// Download rendered diagram
const svgElement = document.querySelector('#diagram-container svg');
downloadSvg(svgElement, 'my-flowchart.svg');
```

**Parse Multiple Diagrams from Text:**
```ts
import { extractMultipleDiagrams } from '@/lib/ArticleToFlowChart';

const aiResponse = `
---DIAGRAM: Process A---
graph TD
  A --> B

---DIAGRAM: Process B---
graph LR
  X --> Y
`;

const diagrams = extractMultipleDiagrams(aiResponse);
diagrams.forEach(d => {
  console.log(`${d.title}: ${d.mermaidCode}`);
});
```

**Generate Both SVG and PNG:**
```ts
import { convertMmdToBothFormats } from '@/lib/ArticleToFlowChart';

const { svg, png } = await convertMmdToBothFormats(mermaidCode, {
  outputDir: './exports',
  fileName: 'flowchart'
});

console.log('SVG:', svg.imagePath);  // ./exports/flowchart.svg
console.log('PNG:', png.imagePath);  // ./exports/flowchart.png
```

### 🏗️ Architecture

**Optimized Pipeline:**
1. **Step 1 (AI):** Article → Multiple Mermaid Diagrams (single AI call)
2. **Step 2 (Passthrough):** Diagrams pass through for backward compatibility
3. **Step 3 (Optional):** Mermaid Code → Image File (SVG/PNG)

**Key Optimizations:**
- Single AI call generates all diagrams at once (vs. multi-step conversion)
- Delimiter-based parsing separates multiple diagrams efficiently
- Automatic code cleaning removes markdown wrappers and artifacts
- Fallback handling treats entire response as single diagram if no delimiters

**Dual Rendering Modes:**
- **Server-side:** Uses Mermaid CLI for Node.js environments
- **Browser-side:** Uses Mermaid.js library for client-side rendering

### 🔗 Dependencies
- `@/lib/promptmanager` - For AI-powered diagram generation
- `dotenv` - For environment variable loading
- Mermaid CLI (server-side rendering)
- Mermaid.js library (browser-side rendering)

### 🏷️ Tags
#flowchart-generation #mermaid #diagram-automation #article-analysis #ai-powered #image-generation #visualization #pipeline

### 📝 Notes
- Minimum article length: 10 characters
- Supports multiple diagrams per article
- Delimiter format: `---DIAGRAM: Title---`
- Automatic cleaning removes markdown code blocks
- Browser rendering requires Mermaid.js library loaded
- Server rendering requires Mermaid CLI installed
- Fresh token allocation (8192 for Gemini) per conversion
- Theme instructions significantly affect diagram style and structure
- Backward compatible with legacy three-step pipeline
- Step 2 is now a passthrough (optimization from original JSON → MMD step)

