/**
 * A4 Page Size Optimizer for Mermaid Flowcharts
 * 
 * This utility analyzes mermaid flowchart code and restructures it
 * into subgraphs with different directions (TB/LR) when the diagram
 * would exceed A4 page dimensions.
 * 
 * A4 dimensions (at 96 DPI):
 * - Width: 794px (210mm)
 * - Height: 1123px (297mm)
 */

// A4 dimensions in pixels (at 96 DPI, standard web resolution)
export const A4_DIMENSIONS = {
  WIDTH: 794,  // 210mm
  HEIGHT: 1123, // 297mm
  MARGIN: 50    // Safe margin
} as const;

// Effective drawing area (accounting for margins)
const EFFECTIVE_WIDTH = A4_DIMENSIONS.WIDTH - (A4_DIMENSIONS.MARGIN * 2);
const EFFECTIVE_HEIGHT = A4_DIMENSIONS.HEIGHT - (A4_DIMENSIONS.MARGIN * 2);

// Estimated node dimensions
const NODE_DIMENSIONS = {
  AVG_WIDTH: 150,
  AVG_HEIGHT: 60,
  VERTICAL_SPACING: 80,
  HORIZONTAL_SPACING: 120
} as const;

interface FlowchartNode {
  id: string;
  text: string;
  connections: string[];
}

interface ParsedFlowchart {
  direction: string;
  nodes: FlowchartNode[];
  styles: string[];
}

/**
 * Parse mermaid flowchart code to extract nodes and connections
 */
function parseFlowchart(mermaidCode: string): ParsedFlowchart | null {
  const lines = mermaidCode.split('\n').map(line => line.trim());
  
  // Find the flowchart declaration
  const flowchartLine = lines.find(line => line.startsWith('flowchart') || line.startsWith('graph'));
  if (!flowchartLine) return null;
  
  // Extract direction (TD, LR, etc.)
  const directionMatch = flowchartLine.match(/flowchart\s+([A-Z]+)|graph\s+([A-Z]+)/);
  const direction = directionMatch ? (directionMatch[1] || directionMatch[2] || 'TD') : 'TD';
  
  const nodes: FlowchartNode[] = [];
  const styles: string[] = [];
  
  for (const line of lines) {
    if (line.startsWith('flowchart') || line.startsWith('graph') || !line || line.startsWith('%%')) {
      continue;
    }
    
    // Extract style lines
    if (line.startsWith('style ')) {
      styles.push(line);
      continue;
    }
    
    // Extract node connections
    const connectionMatch = line.match(/^([A-Za-z0-9_]+)(?:\[.*?\]|\(.*?\)|\{.*?\}|\[\[.*?\]\]|\(\(.*?\)\)|\>.*?\])?(?:\s*(?:-->|---|-\.\->|===>|-.->)\s*\|?.*?\|?\s*([A-Za-z0-9_]+))?/);
    
    if (connectionMatch) {
      const sourceId = connectionMatch[1];
      const targetId = connectionMatch[2];
      
      // Find or create source node
      let sourceNode = nodes.find(n => n.id === sourceId);
      if (!sourceNode) {
        sourceNode = { id: sourceId, text: '', connections: [] };
        nodes.push(sourceNode);
      }
      
      // Add connection if target exists
      if (targetId && !sourceNode.connections.includes(targetId)) {
        sourceNode.connections.push(targetId);
        
        // Create target node if doesn't exist
        if (!nodes.find(n => n.id === targetId)) {
          nodes.push({ id: targetId, text: '', connections: [] });
        }
      }
    }
  }
  
  return { direction, nodes, styles };
}

/**
 * Estimate flowchart dimensions based on direction and node count
 */
function estimateDimensions(parsed: ParsedFlowchart): { width: number; height: number } {
  const nodeCount = parsed.nodes.length;
  
  if (parsed.direction === 'TD' || parsed.direction === 'TB') {
    // Vertical layout
    const avgNodesPerLevel = Math.ceil(Math.sqrt(nodeCount));
    const levels = Math.ceil(nodeCount / avgNodesPerLevel);
    
    return {
      width: avgNodesPerLevel * (NODE_DIMENSIONS.AVG_WIDTH + NODE_DIMENSIONS.HORIZONTAL_SPACING),
      height: levels * (NODE_DIMENSIONS.AVG_HEIGHT + NODE_DIMENSIONS.VERTICAL_SPACING)
    };
  } else {
    // Horizontal layout (LR, RL)
    const avgNodesPerColumn = Math.ceil(Math.sqrt(nodeCount));
    const columns = Math.ceil(nodeCount / avgNodesPerColumn);
    
    return {
      width: columns * (NODE_DIMENSIONS.AVG_WIDTH + NODE_DIMENSIONS.HORIZONTAL_SPACING),
      height: avgNodesPerColumn * (NODE_DIMENSIONS.AVG_HEIGHT + NODE_DIMENSIONS.VERTICAL_SPACING)
    };
  }
}

/**
 * Check if flowchart exceeds A4 dimensions
 */
export function exceedsA4Dimensions(mermaidCode: string): boolean {
  const parsed = parseFlowchart(mermaidCode);
  if (!parsed) return false;
  
  const dimensions = estimateDimensions(parsed);
  
  return dimensions.width > EFFECTIVE_WIDTH || dimensions.height > EFFECTIVE_HEIGHT;
}

/**
 * Extract full node definition from original code
 */
function getNodeDefinition(nodeId: string, originalLines: string[]): string {
  for (const line of originalLines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('style ') || trimmedLine.startsWith('%%') || 
        trimmedLine.startsWith('flowchart') || trimmedLine.startsWith('graph') ||
        trimmedLine.startsWith('subgraph')) {
      continue;
    }
    
    // Check if this line defines the node
    if (trimmedLine.startsWith(nodeId)) {
      return trimmedLine;
    }
  }
  return nodeId; // Return just the ID if no definition found
}

/**
 * Split flowchart into optimized subgraphs
 */
function createSubgraphs(parsed: ParsedFlowchart, originalCode: string): string {
  const nodes = parsed.nodes;
  const totalNodes = nodes.length;
  const originalLines = originalCode.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // If very few nodes, don't split
  if (totalNodes <= 3) {
    return originalCode;
  }
  
  // Calculate optimal subgraph size
  const nodesPerSubgraph = Math.ceil(totalNodes / 2);
  
  let mermaidCode = 'flowchart TD\n';
  
  // Create vertical subgraph (first half)
  mermaidCode += '    subgraph vertical["Vertical Section"]\n';
  mermaidCode += '        direction TB\n';
  
  const verticalNodes = nodes.slice(0, nodesPerSubgraph);
  const horizontalNodes = nodes.slice(nodesPerSubgraph);
  
  const addedVerticalConnections = new Set<string>();
  
  // Add vertical nodes with full definitions
  for (const node of verticalNodes) {
    for (const target of node.connections) {
      // Only add connections within this subgraph
      if (verticalNodes.some(n => n.id === target)) {
        const connectionKey = `${node.id}->${target}`;
        if (!addedVerticalConnections.has(connectionKey)) {
          const fullDef = getNodeDefinition(node.id, originalLines);
          mermaidCode += `        ${fullDef}\n`;
          addedVerticalConnections.add(connectionKey);
          break; // Only add the node definition once
        }
      }
    }
  }
  
  mermaidCode += '    end\n\n';
  
  // Create horizontal subgraph (second half)
  if (horizontalNodes.length > 0) {
    mermaidCode += '    subgraph horizontal["Horizontal Section"]\n';
    mermaidCode += '        direction LR\n';
    
    const addedHorizontalConnections = new Set<string>();
    
    for (const node of horizontalNodes) {
      for (const target of node.connections) {
        // Only add connections within this subgraph
        if (horizontalNodes.some(n => n.id === target)) {
          const connectionKey = `${node.id}->${target}`;
          if (!addedHorizontalConnections.has(connectionKey)) {
            const fullDef = getNodeDefinition(node.id, originalLines);
            mermaidCode += `        ${fullDef}\n`;
            addedHorizontalConnections.add(connectionKey);
            break; // Only add the node definition once
          }
        }
      }
    }
    
    mermaidCode += '    end\n\n';
    
    // Find cross-subgraph connections
    const crossConnections: Array<{from: string, to: string}> = [];
    for (const vNode of verticalNodes) {
      for (const target of vNode.connections) {
        if (horizontalNodes.some(n => n.id === target)) {
          crossConnections.push({ from: vNode.id, to: target });
        }
      }
    }
    
    // Add cross-subgraph connections or create a default one
    if (crossConnections.length > 0) {
      for (const conn of crossConnections) {
        mermaidCode += `    ${conn.from} --> ${conn.to}\n`;
      }
    } else {
      // Create a connection between the last vertical and first horizontal node
      const lastVertical = verticalNodes[verticalNodes.length - 1];
      const firstHorizontal = horizontalNodes[0];
      mermaidCode += `    ${lastVertical.id} --> ${firstHorizontal.id}\n`;
    }
    mermaidCode += '\n';
  }
  
  // Add styles for subgraphs
  mermaidCode += 'style vertical fill:#ffffff,stroke:#cccccc,stroke-width:1px\n';
  if (horizontalNodes.length > 0) {
    mermaidCode += 'style horizontal fill:#ffffff,stroke:#cccccc,stroke-width:1px\n';
  }
  
  // Add original styles
  if (parsed.styles.length > 0) {
    mermaidCode += '\n' + parsed.styles.join('\n') + '\n';
  }
  
  return mermaidCode;
}

/**
 * Optimize flowchart for A4 page size
 * If the flowchart exceeds A4 dimensions, restructure it into subgraphs
 */
export function optimizeForA4(mermaidCode: string): { 
  optimized: string; 
  wasOptimized: boolean;
  originalDimensions: { width: number; height: number } | null;
} {
  const parsed = parseFlowchart(mermaidCode);
  
  if (!parsed) {
    return { 
      optimized: mermaidCode, 
      wasOptimized: false,
      originalDimensions: null
    };
  }
  
  const originalDimensions = estimateDimensions(parsed);
  
  // Check if optimization is needed
  if (originalDimensions.width <= EFFECTIVE_WIDTH && originalDimensions.height <= EFFECTIVE_HEIGHT) {
    return { 
      optimized: mermaidCode, 
      wasOptimized: false,
      originalDimensions
    };
  }
  
  // Create optimized version with subgraphs
  const optimized = createSubgraphs(parsed, mermaidCode);
  
  return { 
    optimized, 
    wasOptimized: true,
    originalDimensions
  };
}

/**
 * Get A4 page styling for rendering
 */
export function getA4PageStyles(): React.CSSProperties {
  return {
    width: `${A4_DIMENSIONS.WIDTH}px`,
    height: `${A4_DIMENSIONS.HEIGHT}px`,
    padding: `${A4_DIMENSIONS.MARGIN}px`,
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    margin: '0 auto',
    overflow: 'auto'
  };
}

