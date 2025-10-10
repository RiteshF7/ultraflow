/**
 * Theme Template Generator for Flowchart Styling
 * Generates theme instructions for Mermaid flowcharts based on user preferences
 */

/**
 * Flowchart orientation types
 */
export type FlowchartOrientation = 
  | 'vertical'      // Top-Down (TD)
  | 'horizontal'    // Left-Right (LR)
  | 'pipeline'      // Straight line pipeline
  | 'radial'        // Hub-and-spoke
  | 'circular'      // Loop/cycle
  | 'swimlane'      // Divided by roles/modules
  | 'grid'          // Matrix layout
  | 'hierarchical'  // Tree structure
  | 'layered';      // Stacked layers

/**
 * Interface for theme configuration parameters
 */
export interface ThemeConfig {
  /** Font family name (e.g., 'Arial', 'Roboto') */
  fontName?: string;
  /** Text color in hex or CSS color name (e.g., '#000000', 'black') */
  textColor?: string;
  /** Text size in pixels (e.g., 14, 16, 18) */
  textSize?: number;
  /** Arrow/line color in hex or CSS color name */
  arrowColor?: string;
  /** Background color for node containers */
  boxContainerColor?: string;
  /** Border color for node containers */
  containerBoxBorderColor?: string;
  /** Use different shapes for different node types */
  useSuitableShapes?: boolean;
  /** Maximum vertical depth/levels of flowchart (e.g., 5 = max 5 levels deep) */
  maxHeight?: number;
  /** Maximum horizontal width/branches of flowchart (e.g., 4 = max 4 branches wide) */
  maxWidth?: number;
  /** Flowchart orientation/layout style */
  orientation?: FlowchartOrientation;
  /** User's additional custom prompt instructions */
  userAdditionalCustomPrompt?: string;
}

/**
 * Default theme configuration values
 */
export const DEFAULT_THEME_CONFIG: Required<Omit<ThemeConfig, 'userAdditionalCustomPrompt'>> & { userAdditionalCustomPrompt: string } = {
  fontName: 'Arial',
  textColor: '#000000',
  textSize: 14,
  arrowColor: '#333333',
  boxContainerColor: '#FFFFFF',
  containerBoxBorderColor: '#000000',
  useSuitableShapes: false,
  maxHeight: 5,  // Maximum 5 vertical levels/depth (balanced)
  maxWidth: 4,   // Maximum 4 horizontal branches (balanced)
  orientation: 'vertical',  // Default to top-down flow
  userAdditionalCustomPrompt: ''
};

/**
 * Generates a theme prompt for Mermaid flowcharts based on provided configuration
 * 
 * @param config - Theme configuration object
 * @returns Formatted theme prompt string to be used in flowchart generation
 * 
 * @example
 * ```typescript
 * const themePrompt = generateThemePrompt({
 *   fontName: 'Roboto',
 *   textColor: '#2C3E50',
 *   useSuitableShapes: true,
 *   maxHeight: 5,  // Maximum 5 levels deep vertically
 *   maxWidth: 4     // Maximum 4 branches wide horizontally
 * });
 * ```
 */
export function generateThemePrompt(config: ThemeConfig = {}): string {
  // Merge user config with defaults
  const {
    fontName,
    textColor,
    textSize,
    arrowColor,
    boxContainerColor,
    containerBoxBorderColor,
    useSuitableShapes,
    maxHeight,
    maxWidth,
    orientation,
    userAdditionalCustomPrompt
  } = { ...DEFAULT_THEME_CONFIG, ...config };

  // Build the theme prompt
  let themePrompt = `
VISUAL STYLING REQUIREMENTS:

1. FONT STYLING:
   - Font Family: ${fontName}
   - Text Color: ${textColor}
   - Font Size: ${textSize}px
   - Apply consistent font styling to all nodes and text elements

2. COLOR SCHEME:
   - Node Background Color: ${boxContainerColor}
   - Node Border Color: ${containerBoxBorderColor}
   - Arrow/Link Color: ${arrowColor}
   - Ensure sufficient contrast for readability

3. DIAGRAM STRUCTURE:
   - Maximum Vertical Depth: ${maxHeight} levels
   - Maximum Horizontal Branches: ${maxWidth} branches
   - Keep flowchart hierarchy within ${maxHeight} levels deep
   - Limit horizontal branching to ${maxWidth} parallel paths
   - Aim for balanced proportions - avoid extremely tall or wide diagrams
   - Target 6-12 total nodes per diagram for optimal readability
   - If content exceeds these limits, split into multiple separate diagrams
   - Better to create multiple focused diagrams than one large complex diagram

${getOrientationInstructions(orientation)}
`;

  // Add shape instructions
  if (useSuitableShapes) {
    themePrompt += `
5. NODE SHAPES - Use appropriate shapes based on node type:
   - START/END nodes: Use rounded rectangle [Start] or stadium shape ([Start])
   - PROCESS/ACTION nodes: Use rectangle [Process Step]
   - DECISION nodes: Use diamond shape {Decision?}
   - INPUT/OUTPUT nodes: Use parallelogram [/Input Output/]
   - SUBPROCESS nodes: Use rectangle with double borders [[Subprocess]]
   - DATA/DOCUMENT nodes: Use asymmetric shape [\\Document/]
   - DATABASE nodes: Use cylindrical shape [(Database)]
   - CONNECTOR nodes: Use circle ((Connector))
   
   Example Mermaid syntax:
   flowchart TD
       start([Start])
       process[Process Step]
       decision{Is Valid?}
       input[/User Input/]
       output[/Display Result/]
       subprocess[[Call Function]]
       data[\\Data Store/]
       db[(Database)]
       connector((A))
`;
  } else {
    themePrompt += `
5. NODE SHAPES:
   - Use consistent rectangular shapes [Node Text] for all nodes
   - Maintain uniform appearance throughout the diagram
`;
  }

  // Add Mermaid styling syntax
  themePrompt += `
6. MERMAID STYLING SYNTAX:
   Apply theme styling using Mermaid's classDef and class syntax:
   
   %%{init: {'theme':'base', 'themeVariables': { 'primaryColor':'${boxContainerColor}', 'primaryTextColor':'${textColor}', 'primaryBorderColor':'${containerBoxBorderColor}', 'lineColor':'${arrowColor}', 'fontSize':'${textSize}px', 'fontFamily':'${fontName}'}}}%%
   
   OR use classDef for individual styling:
   
   classDef defaultStyle fill:${boxContainerColor},stroke:${containerBoxBorderColor},stroke-width:2px,color:${textColor}
   
   And apply styles to all nodes using:
   class A,B,C,D,E,F defaultStyle
`;

  // Add link styling
  themePrompt += `
7. LINK/ARROW STYLING:
   - Use appropriate arrow types:
     * Solid arrows for normal flow: A --> B
     * Dotted arrows for optional paths: A -.-> B
     * Thick arrows for emphasis: A ==> B
   - All arrows should use color: ${arrowColor}
   - Add descriptive labels where needed: A -->|Yes| B
`;

  // Add user's custom instructions if provided
  if (userAdditionalCustomPrompt && userAdditionalCustomPrompt.trim()) {
    themePrompt += `
8. ADDITIONAL CUSTOM INSTRUCTIONS:
${userAdditionalCustomPrompt.trim()}
`;
  }

  // Add general guidelines
  themePrompt += `

GENERAL GUIDELINES:
- Maintain consistency across all generated flowcharts
- Ensure text remains readable with chosen colors
- Keep diagrams clean and uncluttered
- Use proper spacing between nodes
- Label all connections clearly when necessary
- Follow best practices for flowchart design
`;

  return themePrompt.trim();
}

/**
 * Get orientation-specific instructions for the flowchart
 */
function getOrientationInstructions(orientation: FlowchartOrientation): string {
  const orientationMap: Record<FlowchartOrientation, string> = {
    vertical: `
4. ORIENTATION - VERTICAL (Top-Down):
   - Use 'flowchart TD' or 'graph TD' syntax
   - Flow direction: Top to Bottom
   - Best for: Linear processes, decision trees, sequential workflows
   - Example:
     flowchart TD
         A[Start] --> B[Process]
         B --> C[Decision]`,

    horizontal: `
4. ORIENTATION - HORIZONTAL (Left-Right):
   - Use 'flowchart LR' or 'graph LR' syntax
   - Flow direction: Left to Right
   - Best for: Timelines, pipelines, data flows
   - Example:
     flowchart LR
         A[Input] --> B[Transform] --> C[Output]`,

    pipeline: `
4. ORIENTATION - PIPELINE (Conveyor):
   - Use 'flowchart LR' with straight-line sequential flow
   - Arrange modules in a single horizontal line
   - Clearly mark inputs/outputs for each stage
   - Best for: Data pipelines, agent chains, ETL processes
   - Example:
     flowchart LR
         A[Input] --> B[Stage 1] --> C[Stage 2] --> D[Stage 3] --> E[Output]`,

    radial: `
4. ORIENTATION - RADIAL (Hub-and-Spoke):
   - Use 'flowchart TD' with a central hub node
   - Branch all modules/agents radiating from center
   - Central node should be clearly emphasized
   - Best for: Central controller systems, dispatcher patterns
   - Example:
     flowchart TD
         Hub((Central Hub))
         Hub --> A[Module 1]
         Hub --> B[Module 2]
         Hub --> C[Module 3]
         Hub --> D[Module 4]`,

    circular: `
4. ORIENTATION - CIRCULAR (Loop/Cycle):
   - Create cyclical flow showing feedback loops
   - Use bidirectional arrows where appropriate
   - Emphasize the iterative nature
   - Best for: Iterative processes, feedback systems, continuous cycles
   - Example:
     flowchart TD
         A[Start] --> B[Process]
         B --> C[Evaluate]
         C -->|Continue| D[Refine]
         D --> B
         C -->|Complete| E[End]`,

    swimlane: `
4. ORIENTATION - SWIMLANE (Multi-Lane):
   - Use 'subgraph' to create separate lanes for each role/module/agent
   - Clearly label each swimlane
   - Show cross-lane interactions with arrows
   - Best for: Multi-agent systems, parallel workflows, role-based processes
   - Example:
     flowchart TD
         subgraph Agent1[Agent 1]
             A1[Task 1] --> A2[Task 2]
         end
         subgraph Agent2[Agent 2]
             B1[Task 1] --> B2[Task 2]
         end
         A2 -.-> B1`,

    grid: `
4. ORIENTATION - GRID (Matrix):
   - Arrange nodes in a grid pattern
   - Show relationships both horizontally and vertically
   - Use consistent spacing between nodes
   - Best for: Cross-functional systems, modular mapping, dependency matrices
   - Example:
     flowchart TD
         A1 --> A2 --> A3
         B1 --> B2 --> B3
         C1 --> C2 --> C3
         A1 --> B1 --> C1
         A2 --> B2 --> C2`,

    hierarchical: `
4. ORIENTATION - HIERARCHICAL (Tree):
   - Use 'flowchart TD' with branching tree structure
   - Parent nodes at top, children below
   - Show clear parent-child relationships
   - Best for: Decision trees, classification systems, organizational charts
   - Example:
     flowchart TD
         Root[Root Decision]
         Root --> A[Branch A]
         Root --> B[Branch B]
         A --> A1[Leaf 1]
         A --> A2[Leaf 2]
         B --> B1[Leaf 3]
         B --> B2[Leaf 4]`,

    layered: `
4. ORIENTATION - LAYERED (Stacked):
   - Use 'subgraph' to create horizontal layers
   - Each layer represents an abstraction level (UI, Logic, Data, etc.)
   - Show vertical flow between layers
   - Best for: Architecture diagrams, abstraction layers, system tiers
   - Example:
     flowchart TD
         subgraph UI[UI Layer]
             U1[Component 1] --- U2[Component 2]
         end
         subgraph Logic[Logic Layer]
             L1[Service 1] --- L2[Service 2]
         end
         subgraph Data[Data Layer]
             D1[Database] --- D2[Cache]
         end
         U1 --> L1
         U2 --> L2
         L1 --> D1
         L2 --> D2`
  };

  return orientationMap[orientation] || orientationMap.vertical;
}


/**
 * Validates theme configuration and returns any warnings
 * 
 * @param config - Theme configuration to validate
 * @returns Array of warning messages, empty if no issues
 */
export function validateThemeConfig(config: ThemeConfig): string[] {
  const warnings: string[] = [];

  // Check text size
  if (config.textSize !== undefined && (config.textSize < 8 || config.textSize > 32)) {
    warnings.push('Text size should be between 8px and 32px for optimal readability');
  }

  // Check flowchart structure limits
  if (config.maxHeight !== undefined && config.maxHeight < 2) {
    warnings.push('Maximum height should be at least 2 levels for meaningful flowcharts');
  }

  if (config.maxHeight !== undefined && config.maxHeight > 10) {
    warnings.push('Maximum height above 10 levels may result in overly complex diagrams');
  }

  if (config.maxWidth !== undefined && config.maxWidth < 2) {
    warnings.push('Maximum width should be at least 2 branches for meaningful flowcharts');
  }

  if (config.maxWidth !== undefined && config.maxWidth > 8) {
    warnings.push('Maximum width above 8 branches may result in cluttered diagrams');
  }

  // Check color contrast (basic validation)
  if (config.textColor && config.boxContainerColor) {
    if (config.textColor.toLowerCase() === config.boxContainerColor.toLowerCase()) {
      warnings.push('Text color and background color are the same - text will be invisible');
    }
  }

  return warnings;
}

/**
 * Example usage and preset configurations
 */
export const PRESET_THEMES = {
  default: {
    fontName: 'Arial',
    textColor: '#000000',
    textSize: 14,
    arrowColor: '#333333',
    boxContainerColor: '#FFFFFF',
    containerBoxBorderColor: '#000000',
    useSuitableShapes: false,
    maxHeight: 5,  // 5 levels deep
    maxWidth: 4,   // 4 branches wide
    orientation: 'vertical' as FlowchartOrientation
  },
  modern: {
    fontName: 'Segoe UI',
    textColor: '#2C3E50',
    textSize: 16,
    arrowColor: '#3498DB',
    boxContainerColor: '#ECF0F1',
    containerBoxBorderColor: '#3498DB',
    useSuitableShapes: true,
    maxHeight: 5,  // 5 levels deep (balanced with width)
    maxWidth: 4,   // 4 branches wide (balanced proportions)
    orientation: 'swimlane' as FlowchartOrientation
  },
  minimal: {
    fontName: 'Helvetica',
    textColor: '#000000',
    textSize: 14,
    arrowColor: '#666666',
    boxContainerColor: '#FFFFFF',
    containerBoxBorderColor: '#CCCCCC',
    useSuitableShapes: false,
    maxHeight: 4,  // 4 levels deep for simpler diagrams
    maxWidth: 3,   // 3 branches wide
    orientation: 'horizontal' as FlowchartOrientation
  },
  professional: {
    fontName: 'Roboto',
    textColor: '#1A1A1A',
    textSize: 15,
    arrowColor: '#34495E',
    boxContainerColor: '#F8F9FA',
    containerBoxBorderColor: '#34495E',
    useSuitableShapes: true,
    maxHeight: 5,  // 5 levels deep (balanced for clarity)
    maxWidth: 4,   // 4 branches wide (balanced proportions)
    orientation: 'layered' as FlowchartOrientation
  },
  'gradient-dark': {
    fontName: 'Georgia',
    textColor: '#FFFFFF',
    textSize: 14,
    arrowColor: '#000000',
    boxContainerColor: '#2D3748',
    containerBoxBorderColor: '#1A202C',
    useSuitableShapes: false,
    maxHeight: 5,  // 5 levels deep (balanced)
    maxWidth: 4,   // 4 branches wide (balanced)
    orientation: 'vertical' as FlowchartOrientation,
    userAdditionalCustomPrompt: 'Use dark gradient backgrounds for nodes (dark gray to black gradient). Keep arrows black and thin. Use rounded rectangle shapes for all nodes. Apply gradient effect from #2D3748 to #1A202C for node backgrounds.'
  }
} as const;

/**
 * Orientation options with descriptions
 */
export const ORIENTATION_OPTIONS = [
  { value: 'vertical', label: 'Vertical (Top-Down)', description: 'Linear processes, decision trees' },
  { value: 'horizontal', label: 'Horizontal (Left-Right)', description: 'Timelines, pipelines' },
  { value: 'pipeline', label: 'Pipeline (Conveyor)', description: 'Data pipelines, agent chains' },
  { value: 'radial', label: 'Radial (Hub-Spoke)', description: 'Central controller, dispatcher' },
  { value: 'circular', label: 'Circular (Loop)', description: 'Iterative processes, feedback' },
  { value: 'swimlane', label: 'Swimlane (Multi-Lane)', description: 'Multi-agent, parallel workflows' },
  { value: 'grid', label: 'Grid (Matrix)', description: 'Cross-functional, dependencies' },
  { value: 'hierarchical', label: 'Hierarchical (Tree)', description: 'Decision trees, classifications' },
  { value: 'layered', label: 'Layered (Stacked)', description: 'Architecture, abstraction layers' }
] as const;
