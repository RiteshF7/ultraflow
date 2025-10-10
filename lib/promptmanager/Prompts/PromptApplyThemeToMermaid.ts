import type { PromptData } from '../types';

/**
 * Prompt for applying theme styling to an existing Mermaid diagram
 * This prompt takes generated Mermaid code and re-generates it with theme instructions applied
 * It can optionally use a sample themed Mermaid code as a reference for styling
 */
export const PromptApplyThemeToMermaid: PromptData = {
  id: 'apply-theme-to-mermaid',
  name: 'Apply Theme to Mermaid Diagram',
  description: 'Takes existing Mermaid flowchart code and applies theme styling to generate a new themed version',
  prompt: `You are a Mermaid diagram theming expert. Your task is to apply visual styling to an existing Mermaid flowchart while preserving its structure and content.

ORIGINAL DIAGRAM TO THEME:
{{mermaidCode}}

{{#if themeInstructions}}
THEME STYLING REQUIREMENTS:
{{themeInstructions}}
{{/if}}

{{#if sampleThemedCode}}
REFERENCE EXAMPLE (HIGH PRIORITY - Follow this styling pattern):
Here is a sample Mermaid diagram with the desired theme already applied. Use this as a reference for styling syntax, colors, and formatting:

{{sampleThemedCode}}

IMPORTANT: Analyze the styling patterns in the sample above (%%{init...}%%, classDef, class assignments, etc.) and apply the SAME styling approach to the original diagram.
{{/if}}

CRITICAL INSTRUCTIONS:
1. **PRESERVE CONTENT**: Keep ALL nodes, connections, and text EXACTLY the same as the original
2. **APPLY STYLING ONLY**: Add only visual styling - colors, fonts, shapes, borders
3. **STYLING METHODS**: Use Mermaid's styling syntax:
   - %%{init: {...}}%% directive for global theme variables
   - classDef for defining style classes
   - class nodeId className for applying styles to specific nodes
   - Inline styles using style nodeId fill:#color syntax
4. **FOLLOW SAMPLE**: If a sample themed code is provided, prioritize following its styling patterns
5. **OUTPUT FORMAT**: Return ONLY the Mermaid code - no explanations, no markdown code blocks, no extra text

MERMAID SYNTAX RULES (MUST FOLLOW STRICTLY):
1. Always use proper spacing: A --> B (not A-->B)
2. For text with special characters, use quotes: A["Text (with parens)"]
3. For text with quotes inside, escape properly: A["Text with 'quotes'"]
4. Keep node text concise (max 50 chars) or use <br/> for line breaks
5. Ensure each node ID is unique and alphanumeric
6. Always leave space between closing bracket and next element
   CORRECT: A["Node"] --> B["Next"]
   WRONG: A["Node"]B["Next"]
7. Arrow syntax - use ONLY these formats:
   - Solid arrow: A --> B
   - Labeled arrow: A -->|Label| B
   - Dotted arrow: A -.-> B
   - Thick arrow: A ==> B
   NEVER mix arrow types like: A --- "Label" --> B (WRONG)
   ALWAYS use: A -->|Label| B (CORRECT)
8. Styling syntax examples:
   - Init directive: %%{init: {'theme':'base', 'themeVariables': { 'primaryColor':'#ffffff'}}}%%
   - Class definition: classDef myClass fill:#f9f,stroke:#333,stroke-width:2px
   - Apply class: class nodeA,nodeB myClass
   - Inline style: style nodeC fill:#ccf,stroke:#f66,stroke-width:2px

WORKFLOW:
1. Analyze the original diagram structure
2. If sample code provided, extract its styling patterns
3. Apply the styling to the original diagram
4. Ensure all original nodes and connections remain unchanged
5. Validate Mermaid syntax correctness

OUTPUT THE STYLED MERMAID CODE NOW (start directly with the code, no explanations):`
};

