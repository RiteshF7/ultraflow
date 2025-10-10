'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  renderMermaidToElement,
  initializeMermaid,
  MERMAID_THEMES,
  type MermaidTheme,
  type CustomThemeVariables
} from '@/lib/ArticleToFlowChart/step2-mmdToImage-browser';
import {
  downloadSvg,
  downloadPng
} from '@/utils/downloadHelpers';
import { THEME } from '@/constants/theme';
import Button from './ui/Button';
import ErrorBanner from './ui/ErrorBanner';

// Example templates from interactive playground
const EXAMPLES = {
  flowchart: `flowchart TD
    Start([Start]) --> Input[Get User Input]
    Input --> Process{Process Data}
    Process -->|Valid| Success[Display Success]
    Process -->|Invalid| Error[Show Error]
    Error --> Input
    Success --> End([End])
    
    style Start fill:#90EE90
    style End fill:#90EE90
    style Error fill:#FFB6C1
    style Success fill:#87CEEB`,

  sequence: `sequenceDiagram
    participant User
    participant App
    participant API
    participant DB
    
    User->>App: Click Login
    App->>API: POST /auth/login
    activate API
    API->>DB: Query User
    DB-->>API: User Data
    API->>API: Validate Password
    API-->>App: JWT Token
    deactivate API
    App->>User: Redirect to Dashboard`,

  class: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +String breed
        +bark()
    }
    class Cat {
        +boolean indoor
        +meow()
    }
    Animal <|-- Dog
    Animal <|-- Cat`,

  state: `stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: Start
    Processing --> Success: Complete
    Processing --> Failed: Error
    Failed --> Idle: Reset
    Success --> [*]`,

  er: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER {
        string name
        string email
    }
    ORDER {
        int orderNumber
        date orderDate
    }
    LINE-ITEM {
        int quantity
        float price
    }`,

  gantt: `gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    section Phase 1
    Task 1    :done, t1, 2024-01-01, 30d
    Task 2    :active, t2, after t1, 20d
    section Phase 2
    Task 3    :t3, after t2, 25d
    Task 4    :t4, after t3, 15d`,

  pie: `pie title Favorite Programming Languages
    "JavaScript" : 45
    "Python" : 30
    "Java" : 15
    "Go" : 10`,

  gitgraph: `gitGraph
    commit
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    merge develop
    branch feature
    checkout feature
    commit
    checkout main
    merge feature`,

  journey: `journey
    title My Shopping Journey
    section Browse
      Visit Site: 5: Me
      Search Product: 3: Me
    section Purchase
      Add to Cart: 4: Me
      Checkout: 2: Me, System
      Payment: 5: Me, PayPal
    section Delivery
      Track Order: 4: Me
      Receive: 5: Me`,

  mindmap: `mindmap
  root((Mermaid))
    Diagrams
      Flowchart
      Sequence
      Class
      State
    Features
      Easy Syntax
      Version Control
      Live Editor
    Use Cases
      Documentation
      Planning
      Architecture`
};

export default function MermaidEditor() {
  // Load code from localStorage if available (from ResultsGrid edit button)
  const [mermaidCode, setMermaidCode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedCode = localStorage.getItem('mermaid-editor-code');
      if (savedCode) {
        // Clear it after loading
        localStorage.removeItem('mermaid-editor-code');
        return savedCode;
      }
    }
    return EXAMPLES.flowchart;
  });
  const [renderError, setRenderError] = useState('');
  const [editorWidth, setEditorWidth] = useState(50);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showZoomControls, setShowZoomControls] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<MermaidTheme>('default');
  const [showThemeSidebar, setShowThemeSidebar] = useState(false);
  const [customThemeVars, setCustomThemeVars] = useState<CustomThemeVariables>({});
  const [pendingThemeVars, setPendingThemeVars] = useState<CustomThemeVariables>({});
  const [activeSection, setActiveSection] = useState<string>('basic');
  const [hasUnappliedChanges, setHasUnappliedChanges] = useState(false);
  
  const mermaidRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);

  // Flowchart directions
  const FLOWCHART_DIRECTIONS = ['TD', 'TB', 'BT', 'LR', 'RL'] as const;
  const DIRECTION_LABELS = {
    TD: 'Top → Down',
    TB: 'Top → Bottom', 
    BT: 'Bottom → Top',
    LR: 'Left → Right',
    RL: 'Right → Left'
  };

  // Render diagram
  const renderDiagram = async (forceRefresh = false) => {
    if (!mermaidRef.current || !mermaidCode.trim()) {
      setRenderError('No code to render');
      return;
    }

    try {
      mermaidRef.current.innerHTML = '';
      setRenderError('');
      
      const { svg } = await renderMermaidToElement(
        mermaidCode,
        `mermaid-preview-${Date.now()}`,
        selectedTheme,
        customThemeVars
      );
      
      mermaidRef.current.innerHTML = svg;
    } catch (err) {
      console.error('Mermaid rendering error:', err);
      setRenderError('❌ Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Auto-render on code change with debounce
  useEffect(() => {
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }
    
    renderTimeoutRef.current = setTimeout(() => {
      renderDiagram();
    }, 500);
    
    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mermaidCode, selectedTheme, customThemeVars]);

  // Export SVG
  const exportSVG = () => {
    const svg = mermaidRef.current?.querySelector('svg');
    if (!svg) {
      alert('Please render a diagram first!');
      return;
    }
    
    try {
      downloadSvg(svg as SVGSVGElement, 'mermaid-diagram');
    } catch (error) {
      console.error('Error downloading SVG:', error);
      alert('Error downloading SVG file');
    }
  };

  // Export PNG
  const exportPNG = async () => {
    const svg = mermaidRef.current?.querySelector('svg');
    if (!svg) {
      alert('Please render a diagram first!');
      return;
    }
    
    try {
      await downloadPng(svg as SVGSVGElement, 'mermaid-diagram');
    } catch (error) {
      console.error('Error downloading PNG:', error);
      alert('Error downloading PNG file');
    }
  };

  // Copy code
  const copyCode = () => {
    navigator.clipboard.writeText(mermaidCode).then(() => {
      alert('✅ Code copied to clipboard!');
    });
  };

  // Open in mermaid.live
  const openInMermaidLive = () => {
    try {
      // Create the state object for mermaid.live
      const state = {
        code: mermaidCode,
        mermaid: {
          theme: selectedTheme
        }
      };
      
      // Convert to JSON and encode to base64 (UTF-8 safe)
      const json = JSON.stringify(state);
      // Use TextEncoder for proper UTF-8 encoding
      const bytes = new TextEncoder().encode(json);
      const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join('');
      const encoded = btoa(binString);
      
      // Open in new tab with base64 format
      const url = `https://mermaid.live/edit#base64:${encoded}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening in mermaid.live:', error);
      alert('Error opening in mermaid.live. Please check the console for details.');
    }
  };

  // Load example
  const loadExample = (example: string) => {
    if (example && EXAMPLES[example as keyof typeof EXAMPLES]) {
      setMermaidCode(EXAMPLES[example as keyof typeof EXAMPLES]);
    }
  };

  // Check if current code is a flowchart
  const isFlowchart = () => {
    const trimmedCode = mermaidCode.trim();
    // Check for flowchart with or without initialization code
    return /(?:^%%\{.*?\}%%)?\s*^(flowchart|graph)\s+(TD|TB|BT|LR|RL)/ims.test(trimmedCode);
  };

  // Get current flowchart direction
  const getCurrentDirection = (): string | null => {
    const trimmedCode = mermaidCode.trim();
    // Look for direction after flowchart/graph, handling initialization code
    const match = trimmedCode.match(/(?:^%%\{.*?\}%%)?\s*(flowchart|graph)\s+(TD|TB|BT|LR|RL)/ims);
    if (match) {
      const dir = match[2].toUpperCase();
      // Normalize TB to TD for consistency in filtering
      return dir === 'TB' ? 'TD' : dir;
    }
    return null;
  };

  // Shuffle flowchart direction
  const shuffleDirection = () => {
    if (!isFlowchart()) {
      alert('⚠️ This only works with flowcharts! Please load a flowchart example first.');
      return;
    }

    const currentDir = getCurrentDirection();
    if (!currentDir) {
      alert('⚠️ Could not detect flowchart direction. Make sure your code starts with "flowchart TD" or similar.');
      return;
    }

    // Get available directions (excluding current one and its equivalent)
    const availableDirections = FLOWCHART_DIRECTIONS.filter(dir => {
      // Exclude current direction and its equivalent (TD/TB are equivalent)
      if (currentDir === 'TD') return dir !== 'TD' && dir !== 'TB';
      if (currentDir === 'TB') return dir !== 'TD' && dir !== 'TB';
      return dir !== currentDir;
    });
    
    // Pick a random direction each time
    const newDirection = availableDirections[Math.floor(Math.random() * availableDirections.length)];
    
    // Replace the direction in the code - preserves all nodes and connections
    // Handle both regular flowcharts and those with initialization code
    const newCode = mermaidCode.replace(
      /(^%%\{.*?\}%%)?\s*(flowchart|graph)\s+(TD|TB|BT|LR|RL)/ims,
      (match, init, type, currentDir) => {
        return init ? `${init}\n${type} ${newDirection}` : `${type} ${newDirection}`;
      }
    );
    
    setMermaidCode(newCode);
    
    // Auto-render after shuffle to see the change immediately
    setTimeout(() => {
      renderDiagram(false);
    }, 100);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        renderDiagram();
      }
    };

    const textarea = textareaRef.current;
    textarea?.addEventListener('keydown', handleKeyDown);
    
    return () => {
      textarea?.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mermaidCode]);

  // Resizable panes
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current || !mainRef.current) return;
      
      const containerWidth = mainRef.current.offsetWidth;
      const newWidth = (e.clientX / containerWidth) * 100;
      
      if (newWidth > 20 && newWidth < 80) {
        setEditorWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleResizeStart = () => {
    isResizingRef.current = true;
    document.body.style.cursor = 'ew-resize';
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const handleZoomReset = () => setZoomLevel(1);

  const handleThemeChange = (theme: MermaidTheme) => {
    setSelectedTheme(theme);
    initializeMermaid(theme, customThemeVars);
  };

  const updateThemeVariable = (key: string, value: string) => {
    const newVars = { ...pendingThemeVars, [key]: value };
    setPendingThemeVars(newVars);
    setHasUnappliedChanges(true);
  };

  const applyThemeChanges = () => {
    setCustomThemeVars(pendingThemeVars);
    setHasUnappliedChanges(false);
    initializeMermaid(selectedTheme, pendingThemeVars);
  };

  const resetThemeVariables = () => {
    setCustomThemeVars({});
    setPendingThemeVars({});
    setHasUnappliedChanges(false);
    initializeMermaid(selectedTheme, {});
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: THEME.typography.fontFamily,
    }}>
      {/* Header */}
      <div style={{
        background: THEME.colors.secondaryBg,
        padding: `${THEME.spacing.xl} ${THEME.spacing.xl}`,
        borderBottom: `1px solid ${THEME.colors.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{
          fontSize: THEME.typography.fontSize.lg,
          fontWeight: THEME.typography.fontWeight.semibold,
          color: THEME.colors.text,
          margin: 0
        }}>
          🧜‍♀️ Mermaid Interactive Playground
        </h1>

        <div style={{ display: 'flex', gap: THEME.spacing.sm, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            onChange={(e) => loadExample(e.target.value)}
            style={{
              padding: `${THEME.spacing.sm} ${THEME.spacing.md}`,
              background: THEME.colors.active,
              color: THEME.colors.text,
              border: `1px solid ${THEME.colors.border}`,
              borderRadius: THEME.borderRadius.sm,
              cursor: 'pointer',
              fontSize: THEME.typography.fontSize.sm,
              fontFamily: THEME.typography.fontFamily,
            }}
          >
            <option value="">Load Example...</option>
            <option value="flowchart">Flowchart</option>
            <option value="sequence">Sequence Diagram</option>
            <option value="class">Class Diagram</option>
            <option value="state">State Diagram</option>
            <option value="er">ER Diagram</option>
            <option value="gantt">Gantt Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="gitgraph">Git Graph</option>
            <option value="journey">User Journey</option>
            <option value="mindmap">Mindmap</option>
          </select>

          <select
            value={selectedTheme}
            onChange={(e) => handleThemeChange(e.target.value as MermaidTheme)}
            style={{
              padding: `${THEME.spacing.sm} ${THEME.spacing.md}`,
              background: THEME.colors.active,
              color: THEME.colors.text,
              border: `1px solid ${THEME.colors.border}`,
              borderRadius: THEME.borderRadius.sm,
              cursor: 'pointer',
              fontSize: THEME.typography.fontSize.sm,
              fontFamily: THEME.typography.fontFamily,
            }}
          >
            {Object.entries(MERMAID_THEMES).map(([key, label]) => (
              <option key={key} value={key}>
                🎨 {label}
              </option>
            ))}
          </select>

          <Button
            variant="secondary"
            size="small"
            onClick={shuffleDirection}
            title="Shuffle flowchart direction (TD/LR/BT/RL)"
          >
            🔀 Shuffle Direction
          </Button>

          <Button
            variant="primary"
            size="small"
            onClick={() => renderDiagram(false)}
          >
            ▶ Render
          </Button>

          <Button
            variant="secondary"
            size="small"
            onClick={() => renderDiagram(true)}
          >
            🔄 Force Refresh
          </Button>

          <Button
            variant="secondary"
            size="small"
            onClick={exportSVG}
          >
            💾 Export SVG
          </Button>

          <Button
            variant="secondary"
            size="small"
            onClick={exportPNG}
          >
            🖼️ Export PNG
          </Button>

          <Button
            variant="secondary"
            size="small"
            onClick={copyCode}
          >
            📋 Copy Code
          </Button>

          <Button
            variant="secondary"
            size="small"
            onClick={openInMermaidLive}
            title="Open in mermaid.live editor"
          >
            🌐 Open in Mermaid Live
          </Button>

          <Button
            variant={showThemeSidebar ? "primary" : "secondary"}
            size="small"
            onClick={() => setShowThemeSidebar(!showThemeSidebar)}
          >
            🎨 Theme Editor
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {renderError && (
        <ErrorBanner 
          message={renderError}
          type="error"
        />
      )}

      {/* Main Content */}
      <div ref={mainRef} style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Theme Customization Sidebar */}
        {showThemeSidebar && (
          <div style={{
            width: '350px',
            background: THEME.colors.sidebarBg,
            borderRight: `1px solid ${THEME.colors.border}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Sidebar Header */}
            <div style={{
              background: THEME.colors.secondaryBg,
              padding: `${THEME.spacing.xl} ${THEME.spacing.xl}`,
              borderBottom: `1px solid ${THEME.colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                fontSize: THEME.typography.fontSize.md,
                fontWeight: THEME.typography.fontWeight.semibold,
                color: THEME.colors.text,
                margin: 0,
                fontFamily: THEME.typography.fontFamily,
              }}>
                🎨 Theme Customization
              </h3>
              <button
                onClick={() => setShowThemeSidebar(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: THEME.colors.text,
                  cursor: 'pointer',
                  fontSize: '18px',
                  padding: `${THEME.spacing.xs} ${THEME.spacing.sm}`,
                  borderRadius: THEME.borderRadius.sm,
                  transition: THEME.transitions.normal,
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = THEME.colors.hover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                ×
              </button>
            </div>

            {/* Action Buttons */}
            <div style={{ 
              padding: `${THEME.spacing.xl} ${THEME.spacing.xl}`, 
              borderBottom: `1px solid ${THEME.colors.border}`, 
              display: 'flex', 
              gap: THEME.spacing.sm 
            }}>
              <Button
                variant={hasUnappliedChanges ? "primary" : "secondary"}
                size="small"
                onClick={applyThemeChanges}
                disabled={!hasUnappliedChanges}
                style={{ flex: 1 }}
              >
                ✓ Apply Changes
              </Button>
              <Button
                variant="error"
                size="small"
                onClick={resetThemeVariables}
                style={{ flex: 1 }}
              >
                🔄 Reset All
              </Button>
            </div>

            {/* Section Tabs */}
            <div style={{
              display: 'flex',
              gap: THEME.spacing.xs,
              padding: `${THEME.spacing.sm} ${THEME.spacing.lg}`,
              borderBottom: `1px solid ${THEME.colors.border}`,
              overflowX: 'auto'
            }}>
              {['basic', 'flowchart', 'text', 'sequence', 'gantt', 'state', 'other'].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  style={{
                    padding: `${THEME.spacing.sm} ${THEME.spacing.md}`,
                    background: activeSection === section ? THEME.colors.primary : THEME.colors.active,
                    color: activeSection === section ? THEME.colors.white : THEME.colors.text,
                    border: 'none',
                    borderRadius: THEME.borderRadius.sm,
                    cursor: 'pointer',
                    fontSize: THEME.typography.fontSize.xs,
                    whiteSpace: 'nowrap',
                    fontFamily: THEME.typography.fontFamily,
                    transition: THEME.transitions.normal,
                  }}
                  onMouseEnter={(e) => {
                    if (activeSection !== section) {
                      e.currentTarget.style.backgroundColor = THEME.colors.hover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeSection !== section) {
                      e.currentTarget.style.backgroundColor = THEME.colors.active;
                    }
                  }}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
            </div>

            {/* Variables List */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: `${THEME.spacing.xl} ${THEME.spacing.xl}`
            }}>
              {activeSection === 'basic' && (
                <div>
                  <ThemeVariableInput label="Background" varKey="background" value={pendingThemeVars.background} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Primary Color" varKey="primaryColor" value={pendingThemeVars.primaryColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Secondary Color" varKey="secondaryColor" value={pendingThemeVars.secondaryColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Tertiary Color" varKey="tertiaryColor" value={pendingThemeVars.tertiaryColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Main Background" varKey="mainBkg" value={pendingThemeVars.mainBkg} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Secondary Background" varKey="secondBkg" value={pendingThemeVars.secondBkg} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Line Color" varKey="lineColor" value={pendingThemeVars.lineColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Arrow Head Color" varKey="arrowheadColor" value={pendingThemeVars.arrowheadColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Default Link Color" varKey="defaultLinkColor" value={pendingThemeVars.defaultLinkColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Font Family" varKey="fontFamily" value={pendingThemeVars.fontFamily} onChange={updateThemeVariable} type="text" />
                  <ThemeVariableInput label="Font Size" varKey="fontSize" value={pendingThemeVars.fontSize} onChange={updateThemeVariable} type="text" />
                </div>
              )}

              {activeSection === 'flowchart' && (
                <div>
                  <ThemeVariableInput label="Node Background" varKey="nodeBkg" value={pendingThemeVars.nodeBkg} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Node Border" varKey="nodeBorder" value={pendingThemeVars.nodeBorder} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Node Text Color" varKey="nodeTextColor" value={pendingThemeVars.nodeTextColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Cluster Background" varKey="clusterBkg" value={pendingThemeVars.clusterBkg} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Cluster Border" varKey="clusterBorder" value={pendingThemeVars.clusterBorder} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Edge Label Background" varKey="edgeLabelBackground" value={pendingThemeVars.edgeLabelBackground} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Title Color" varKey="titleColor" value={pendingThemeVars.titleColor} onChange={updateThemeVariable} />
                </div>
              )}

              {activeSection === 'text' && (
                <div>
                  <ThemeVariableInput label="Primary Text Color" varKey="primaryTextColor" value={pendingThemeVars.primaryTextColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Secondary Text Color" varKey="secondaryTextColor" value={pendingThemeVars.secondaryTextColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Tertiary Text Color" varKey="tertiaryTextColor" value={pendingThemeVars.tertiaryTextColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Text Color" varKey="textColor" value={pendingThemeVars.textColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Label Text Color" varKey="labelTextColor" value={pendingThemeVars.labelTextColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Primary Border Color" varKey="primaryBorderColor" value={pendingThemeVars.primaryBorderColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Secondary Border Color" varKey="secondaryBorderColor" value={pendingThemeVars.secondaryBorderColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Tertiary Border Color" varKey="tertiaryBorderColor" value={pendingThemeVars.tertiaryBorderColor} onChange={updateThemeVariable} />
                </div>
              )}

              {activeSection === 'sequence' && (
                <div>
                  <ThemeVariableInput label="Actor Border" varKey="actorBorder" value={pendingThemeVars.actorBorder} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Actor Background" varKey="actorBkg" value={pendingThemeVars.actorBkg} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Actor Text Color" varKey="actorTextColor" value={pendingThemeVars.actorTextColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Actor Line Color" varKey="actorLineColor" value={pendingThemeVars.actorLineColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Signal Color" varKey="signalColor" value={pendingThemeVars.signalColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Signal Text Color" varKey="signalTextColor" value={pendingThemeVars.signalTextColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Label Box Background" varKey="labelBoxBkgColor" value={pendingThemeVars.labelBoxBkgColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Label Box Border" varKey="labelBoxBorderColor" value={pendingThemeVars.labelBoxBorderColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Loop Text Color" varKey="loopTextColor" value={pendingThemeVars.loopTextColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Note Border Color" varKey="noteBorderColor" value={pendingThemeVars.noteBorderColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Note Background" varKey="noteBkgColor" value={pendingThemeVars.noteBkgColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Note Text Color" varKey="noteTextColor" value={pendingThemeVars.noteTextColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Activation Border" varKey="activationBorderColor" value={pendingThemeVars.activationBorderColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Activation Background" varKey="activationBkgColor" value={pendingThemeVars.activationBkgColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Sequence Number Color" varKey="sequenceNumberColor" value={pendingThemeVars.sequenceNumberColor} onChange={updateThemeVariable} />
                </div>
              )}

              {activeSection === 'gantt' && (
                <div>
                  <ThemeVariableInput label="Section Background" varKey="sectionBkgColor" value={pendingThemeVars.sectionBkgColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Alt Section Background" varKey="altSectionBkgColor" value={pendingThemeVars.altSectionBkgColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Section Background 2" varKey="sectionBkgColor2" value={pendingThemeVars.sectionBkgColor2} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Task Border Color" varKey="taskBorderColor" value={pendingThemeVars.taskBorderColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Task Background" varKey="taskBkgColor" value={pendingThemeVars.taskBkgColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Task Text Color" varKey="taskTextColor" value={pendingThemeVars.taskTextColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Active Task Border" varKey="activeTaskBorderColor" value={pendingThemeVars.activeTaskBorderColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Active Task Background" varKey="activeTaskBkgColor" value={pendingThemeVars.activeTaskBkgColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Done Task Background" varKey="doneTaskBkgColor" value={pendingThemeVars.doneTaskBkgColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Done Task Border" varKey="doneTaskBorderColor" value={pendingThemeVars.doneTaskBorderColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Critical Border" varKey="critBorderColor" value={pendingThemeVars.critBorderColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Critical Background" varKey="critBkgColor" value={pendingThemeVars.critBkgColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Today Line Color" varKey="todayLineColor" value={pendingThemeVars.todayLineColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Grid Color" varKey="gridColor" value={pendingThemeVars.gridColor} onChange={updateThemeVariable} />
                </div>
              )}

              {activeSection === 'state' && (
                <div>
                  <ThemeVariableInput label="State Background" varKey="stateBkg" value={pendingThemeVars.stateBkg} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="State Label Color" varKey="stateLabelColor" value={pendingThemeVars.stateLabelColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Transition Color" varKey="transitionColor" value={pendingThemeVars.transitionColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Transition Label Color" varKey="transitionLabelColor" value={pendingThemeVars.transitionLabelColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Composite Background" varKey="compositeBackground" value={pendingThemeVars.compositeBackground} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Composite Border" varKey="compositeBorder" value={pendingThemeVars.compositeBorder} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Alt Background" varKey="altBackground" value={pendingThemeVars.altBackground} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Special State Color" varKey="specialStateColor" value={pendingThemeVars.specialStateColor} onChange={updateThemeVariable} />
                </div>
              )}

              {activeSection === 'other' && (
                <div>
                  <ThemeVariableInput label="Error Background" varKey="errorBkgColor" value={pendingThemeVars.errorBkgColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Error Text Color" varKey="errorTextColor" value={pendingThemeVars.errorTextColor} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Git Branch 0" varKey="git0" value={pendingThemeVars.git0} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Git Branch 1" varKey="git1" value={pendingThemeVars.git1} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Git Branch 2" varKey="git2" value={pendingThemeVars.git2} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Git Branch 3" varKey="git3" value={pendingThemeVars.git3} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Pie 1" varKey="pie1" value={pendingThemeVars.pie1} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Pie 2" varKey="pie2" value={pendingThemeVars.pie2} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Pie 3" varKey="pie3" value={pendingThemeVars.pie3} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Requirement Background" varKey="requirementBackground" value={pendingThemeVars.requirementBackground} onChange={updateThemeVariable} />
                  <ThemeVariableInput label="Requirement Border" varKey="requirementBorderColor" value={pendingThemeVars.requirementBorderColor} onChange={updateThemeVariable} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Editor Pane */}
        <div style={{
          width: `${editorWidth}%`,
          display: 'flex',
          flexDirection: 'column',
          borderRight: `1px solid ${THEME.colors.border}`
        }}>
          <div style={{
            background: THEME.colors.sidebarBg,
            padding: `${THEME.spacing.sm} ${THEME.spacing.lg}`,
            borderBottom: `1px solid ${THEME.colors.border}`,
            fontSize: THEME.typography.fontSize.sm,
            fontWeight: THEME.typography.fontWeight.semibold,
            color: THEME.colors.textMuted,
            fontFamily: THEME.typography.fontFamily,
          }}>
            📝 Mermaid Code
          </div>

          <textarea
            ref={textareaRef}
            value={mermaidCode}
            onChange={(e) => setMermaidCode(e.target.value)}
            spellCheck={false}
            style={{
              flex: 1,
              padding: THEME.spacing.lg,
              background: THEME.colors.background,
              color: THEME.colors.text,
              fontFamily: THEME.typography.fontFamilyMono,
              fontSize: THEME.typography.fontSize.md,
              lineHeight: THEME.typography.lineHeight.relaxed,
              border: 'none',
              resize: 'none',
              outline: 'none',
              overflow: 'auto'
            }}
          />
        </div>

        {/* Resize Handle */}
        <div
          onMouseDown={handleResizeStart}
          style={{
            width: '4px',
            cursor: 'ew-resize',
            background: THEME.colors.border,
            transition: THEME.transitions.normal
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = THEME.colors.primary}
          onMouseLeave={(e) => e.currentTarget.style.background = THEME.colors.border}
        />

        {/* Preview Pane */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: THEME.colors.cardBg,
          position: 'relative'
        }}>
          <div style={{
            background: THEME.colors.hover,
            padding: `${THEME.spacing.sm} ${THEME.spacing.lg}`,
            borderBottom: `1px solid ${THEME.colors.border}`,
            fontSize: THEME.typography.fontSize.sm,
            fontWeight: THEME.typography.fontWeight.semibold,
            color: THEME.colors.text,
            fontFamily: THEME.typography.fontFamily,
          }}>
            👁️ Preview
          </div>

          <div 
            style={{
              flex: 1,
              padding: THEME.spacing.xxxl,
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: THEME.colors.cardBg,
              position: 'relative'
            }}
            onMouseEnter={() => setShowZoomControls(true)}
            onMouseLeave={() => setShowZoomControls(false)}
          >
            <div 
              ref={mermaidRef} 
              style={{ 
                maxWidth: '100%',
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: THEME.transitions.normal
              }} 
            />

            {/* Zoom Controls - Bottom Right (Show on Hover) */}
            {showZoomControls && (
              <div style={{
                position: 'absolute',
                bottom: THEME.spacing.lg,
                right: THEME.spacing.lg,
                display: 'flex',
                gap: THEME.spacing.xs,
                backgroundColor: THEME.colors.cardBgTransparent,
                padding: THEME.spacing.sm,
                borderRadius: THEME.borderRadius.lg,
                border: `1px solid ${THEME.colors.border}`,
                boxShadow: THEME.shadows.lg,
                zIndex: 10
              }}>
                <button
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  disabled={zoomLevel <= 0.5}
                  style={{
                    padding: `${THEME.spacing.sm} ${THEME.spacing.lg}`,
                    backgroundColor: 'transparent',
                    color: zoomLevel <= 0.5 ? THEME.colors.textMuted : THEME.colors.text,
                    border: 'none',
                    borderRadius: THEME.borderRadius.sm,
                    fontSize: '1rem',
                    cursor: zoomLevel <= 0.5 ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    transition: THEME.transitions.normal
                  }}
                  onMouseEnter={(e) => {
                    if (zoomLevel > 0.5) e.currentTarget.style.backgroundColor = THEME.colors.hover;
                  }}
                  onMouseLeave={(e) => {
                    if (zoomLevel > 0.5) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  −
                </button>
                <button
                  onClick={handleZoomReset}
                  title="Reset Zoom"
                  style={{
                    padding: `${THEME.spacing.sm} ${THEME.spacing.lg}`,
                    backgroundColor: 'transparent',
                    color: THEME.colors.text,
                    border: 'none',
                    borderRadius: THEME.borderRadius.sm,
                    fontSize: THEME.typography.fontSize.sm,
                    cursor: 'pointer',
                    transition: THEME.transitions.normal,
                    minWidth: '60px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = THEME.colors.hover}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  onClick={handleZoomIn}
                  title="Zoom In"
                  disabled={zoomLevel >= 3}
                  style={{
                    padding: `${THEME.spacing.sm} ${THEME.spacing.lg}`,
                    backgroundColor: 'transparent',
                    color: zoomLevel >= 3 ? THEME.colors.textMuted : THEME.colors.text,
                    border: 'none',
                    borderRadius: THEME.borderRadius.sm,
                    fontSize: '1rem',
                    cursor: zoomLevel >= 3 ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    transition: THEME.transitions.normal
                  }}
                  onMouseEnter={(e) => {
                    if (zoomLevel < 3) e.currentTarget.style.backgroundColor = THEME.colors.hover;
                  }}
                  onMouseLeave={(e) => {
                    if (zoomLevel < 3) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Component for Theme Variable Input
function ThemeVariableInput({ 
  label, 
  varKey, 
  value, 
  onChange,
  type = 'color'
}: { 
  label: string; 
  varKey: string; 
  value?: string; 
  onChange: (key: string, value: string) => void;
  type?: 'color' | 'text';
}) {
  return (
    <div style={{ marginBottom: THEME.spacing.xl }}>
      <label style={{
        display: 'block',
        fontSize: THEME.typography.fontSize.xs,
        color: THEME.colors.text,
        marginBottom: THEME.spacing.sm,
        fontWeight: THEME.typography.fontWeight.medium,
        fontFamily: THEME.typography.fontFamily,
      }}>
        {label}
      </label>
      <div style={{ display: 'flex', gap: THEME.spacing.sm, alignItems: 'center' }}>
        <input
          type={type}
          value={value || (type === 'color' ? THEME.colors.background : '')}
          onChange={(e) => onChange(varKey, e.target.value)}
          style={{
            width: type === 'color' ? '50px' : '100%',
            height: '32px',
            background: THEME.colors.active,
            border: `1px solid ${THEME.colors.border}`,
            borderRadius: THEME.borderRadius.sm,
            cursor: 'pointer',
            padding: type === 'text' ? `0 ${THEME.spacing.sm}` : '0',
            color: THEME.colors.text,
            fontSize: THEME.typography.fontSize.sm,
            fontFamily: THEME.typography.fontFamily,
          }}
        />
        {type === 'color' && (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(varKey, e.target.value)}
            placeholder={THEME.colors.background}
            style={{
              flex: 1,
              height: '32px',
              background: THEME.colors.active,
              border: `1px solid ${THEME.colors.border}`,
              borderRadius: THEME.borderRadius.sm,
              padding: `0 ${THEME.spacing.sm}`,
              color: THEME.colors.text,
              fontSize: THEME.typography.fontSize.sm,
              fontFamily: THEME.typography.fontFamily,
            }}
          />
        )}
      </div>
    </div>
  );
}
