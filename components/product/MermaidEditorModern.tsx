'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  renderMermaidToElement,
  type CustomThemeVariables
} from '@/lib/ArticleToFlowChart/step2-mmdToImage-browser';
import {
  downloadSvg,
  downloadPng
} from '@/utils/downloadHelpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download,
  Copy,
  ExternalLink,
  Shuffle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Settings,
  Palette
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { MERMAID_COLOR_THEMES, DEFAULT_MERMAID_THEME } from '@/constants/mermaidThemes';

// Example templates
const EXAMPLES = {
  flowchart: `flowchart TD
    Start([Start]) --> Input[Get User Input]
    Input --> Process{Process Data}
    Process -->|Yes| Success[Display Success]
    Process -->|No| Error[Show Error]
    Process -->|Maybe| Review[Review Again]
    Error --> Input
    Success --> End([End])
    Review --> Process
    
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
};

export default function MermaidEditorModern() {
  const [mermaidCode, setMermaidCode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedCode = localStorage.getItem('mermaid-editor-code');
      if (savedCode) {
        localStorage.removeItem('mermaid-editor-code');
        return savedCode;
      }
    }
    return EXAMPLES.flowchart;
  });
  const [renderError, setRenderError] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showZoomControls, setShowZoomControls] = useState(false);
  
  // Preview customization
  const [previewBgColor, setPreviewBgColor] = useState(DEFAULT_MERMAID_THEME.previewBg);
  
  // Mermaid theme customization
  const [customTheme, setCustomTheme] = useState<Partial<CustomThemeVariables>>({
    // Node background colors
    primaryColor: DEFAULT_MERMAID_THEME.nodeColor,
    secondaryColor: DEFAULT_MERMAID_THEME.nodeColor,
    tertiaryColor: DEFAULT_MERMAID_THEME.nodeColor,
    mainBkg: DEFAULT_MERMAID_THEME.nodeColor,
    nodeBkg: DEFAULT_MERMAID_THEME.nodeColor,
    
    // Text colors - FORCE WHITE TEXT
    primaryTextColor: '#ffffff',
    textColor: '#ffffff',
    nodeTextColor: '#ffffff',
    
    // Border colors
    primaryBorderColor: DEFAULT_MERMAID_THEME.borderColor,
    nodeBorder: DEFAULT_MERMAID_THEME.borderColor,
    
    // Line/Arrow colors
    lineColor: DEFAULT_MERMAID_THEME.arrowColor,
    edgeLabelBackground: DEFAULT_MERMAID_THEME.previewBg,
    
    // Decision text color - FORCE WHITE TEXT
    decisionSecondaryTextColor: '#ffffff',
    decisionTertiaryTextColor: '#ffffff',
  });
  
  const mermaidRef = useRef<HTMLDivElement>(null);
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const renderDiagram = async () => {
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
        'default',
        customTheme
      );
      
      mermaidRef.current.innerHTML = svg;
    } catch (err) {
      console.error('Mermaid rendering error:', err);
      setRenderError('❌ Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

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
  }, [mermaidCode, customTheme]);

  const exportSVG = () => {
    const svg = mermaidRef.current?.querySelector('svg');
    if (!svg) {
      alert('Please render a diagram first!');
      return;
    }
    downloadSvg(svg as SVGSVGElement, 'mermaid-diagram');
  };

  const exportPNG = async () => {
    const svg = mermaidRef.current?.querySelector('svg');
    if (!svg) {
      alert('Please render a diagram first!');
      return;
    }
    await downloadPng(svg as SVGSVGElement, 'mermaid-diagram');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(mermaidCode).then(() => {
      alert('✅ Code copied to clipboard!');
    });
  };

  const openInMermaidLive = () => {
    try {
      const state = {
        code: mermaidCode,
        mermaid: { theme: 'default' }
      };
      const json = JSON.stringify(state);
      const bytes = new TextEncoder().encode(json);
      const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join('');
      const encoded = btoa(binString);
      const url = `https://mermaid.live/edit#base64:${encoded}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening in mermaid.live:', error);
      alert('Error opening in mermaid.live');
    }
  };

  const loadExample = (example: string) => {
    if (example && EXAMPLES[example as keyof typeof EXAMPLES]) {
      setMermaidCode(EXAMPLES[example as keyof typeof EXAMPLES]);
    }
  };


  const shuffleDirection = () => {
    const directions = ['TD', 'LR', 'RL', 'BT'];
    const currentMatch = mermaidCode.match(/(flowchart|graph)\s+(TD|LR|RL|BT)/);
    if (!currentMatch) {
      alert('⚠️ This only works with flowcharts!');
      return;
    }
    const currentDir = currentMatch[2];
    const availableDirs = directions.filter(d => d !== currentDir);
    const newDir = availableDirs[Math.floor(Math.random() * availableDirs.length)];
    const newCode = mermaidCode.replace(
      /(flowchart|graph)\s+(TD|LR|RL|BT)/,
      `$1 ${newDir}`
    );
    setMermaidCode(newCode);
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const handleZoomReset = () => setZoomLevel(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            🧜 Ultra Editor
          </h1>
          <p className="text-muted-foreground text-lg">
            Create and edit diagrams with live preview
          </p>
        </div>

        {/* Action Bar */}
        <div className="mb-6 flex flex-wrap gap-2">
          <select
            onChange={(e) => loadExample(e.target.value)}
            className="px-4 py-2 bg-background border border-input rounded-lg text-sm cursor-pointer hover:bg-accent"
          >
            <option value=""> Load Example...</option>
            <option value="flowchart">Flowchart</option>
            <option value="sequence">Sequence Diagram</option>
            <option value="class">Class Diagram</option>
            <option value="state">State Diagram</option>
            <option value="er">ER Diagram</option>
            <option value="gantt">Gantt Chart</option>
            <option value="pie">Pie Chart</option>
          </select>


          <Button variant="outline" size="sm" onClick={shuffleDirection}>
            <Shuffle className="h-4 w-4 mr-2" />
            Shuffle Direction
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Palette className="h-4 w-4 mr-2" />
                Customize Theme
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 max-h-[600px] overflow-y-auto">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Theme Customization</h4>
                

                <div className="border-t pt-3">
                  <Label className="text-xs font-semibold">Custom Colors</Label>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="preview-bg" className="text-xs">Preview Background</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="preview-bg"
                        type="color"
                        value={previewBgColor}
                        onChange={(e) => setPreviewBgColor(e.target.value)}
                        className="h-9 w-16"
                      />
                      <Input
                        type="text"
                        value={previewBgColor}
                        onChange={(e) => setPreviewBgColor(e.target.value)}
                        className="h-9 flex-1 font-mono text-xs"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="node-color" className="text-xs">Node Container Color</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="node-color"
                        type="color"
                        value={customTheme.primaryColor || '#4f46e5'}
                        onChange={(e) => setCustomTheme(prev => ({ 
                          ...prev, 
                          primaryColor: e.target.value,
                          mainBkg: e.target.value,
                          nodeBkg: e.target.value,
                          secondaryColor: e.target.value,
                          tertiaryColor: e.target.value
                        }))}
                        className="h-9 w-16"
                      />
                      <Input
                        type="text"
                        value={customTheme.primaryColor || '#4f46e5'}
                        onChange={(e) => setCustomTheme(prev => ({ 
                          ...prev, 
                          primaryColor: e.target.value,
                          mainBkg: e.target.value,
                          nodeBkg: e.target.value,
                          secondaryColor: e.target.value,
                          tertiaryColor: e.target.value
                        }))}
                        className="h-9 flex-1 font-mono text-xs"
                        placeholder="#4f46e5"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="border-color" className="text-xs">Border Color</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="border-color"
                        type="color"
                        value={customTheme.primaryBorderColor || '#4338ca'}
                        onChange={(e) => setCustomTheme(prev => ({ 
                          ...prev, 
                          primaryBorderColor: e.target.value,
                          nodeBorder: e.target.value
                        }))}
                        className="h-9 w-16"
                      />
                      <Input
                        type="text"
                        value={customTheme.primaryBorderColor || '#4338ca'}
                        onChange={(e) => setCustomTheme(prev => ({ 
                          ...prev, 
                          primaryBorderColor: e.target.value,
                          nodeBorder: e.target.value
                        }))}
                        className="h-9 flex-1 font-mono text-xs"
                        placeholder="#4338ca"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="arrow-color" className="text-xs">Arrow/Line Color</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="arrow-color"
                        type="color"
                        value={customTheme.lineColor || '#6366f1'}
                        onChange={(e) => setCustomTheme(prev => ({ ...prev, lineColor: e.target.value }))}
                        className="h-9 w-16"
                      />
                      <Input
                        type="text"
                        value={customTheme.lineColor || '#6366f1'}
                        onChange={(e) => setCustomTheme(prev => ({ ...prev, lineColor: e.target.value }))}
                        className="h-9 flex-1 font-mono text-xs"
                        placeholder="#6366f1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="text-color" className="text-xs">Node Text Color (Fixed to White)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="text-color"
                        type="color"
                        value="#ffffff"
                        disabled
                        className="h-9 w-16 opacity-50"
                      />
                      <Input
                        type="text"
                        value="#ffffff"
                        disabled
                        className="h-9 flex-1 font-mono text-xs opacity-50"
                        placeholder="#ffffff"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Text color is fixed to white for better readability</p>
                  </div>


                  <div>
                    <Label htmlFor="decision-text" className="text-xs">Decision Text Color (Fixed to White)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="decision-text"
                        type="color"
                        value="#ffffff"
                        disabled
                        className="h-9 w-16 opacity-50"
                      />
                      <Input
                        type="text"
                        value="#ffffff"
                        disabled
                        className="h-9 flex-1 font-mono text-xs opacity-50"
                        placeholder="#ffffff"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Decision text color is fixed to white for better readability</p>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      setPreviewBgColor(DEFAULT_MERMAID_THEME.previewBg);
                      setCustomTheme({
                        // Node background colors
                        primaryColor: DEFAULT_MERMAID_THEME.nodeColor,
                        secondaryColor: DEFAULT_MERMAID_THEME.nodeColor,
                        tertiaryColor: DEFAULT_MERMAID_THEME.nodeColor,
                        mainBkg: DEFAULT_MERMAID_THEME.nodeColor,
                        nodeBkg: DEFAULT_MERMAID_THEME.nodeColor,
                        
                        // Text colors - FORCE WHITE TEXT
                        primaryTextColor: '#ffffff',
                        textColor: '#ffffff',
                        nodeTextColor: '#ffffff',
                        
                        // Border colors
                        primaryBorderColor: DEFAULT_MERMAID_THEME.borderColor,
                        nodeBorder: DEFAULT_MERMAID_THEME.borderColor,
                        
                        // Line/Arrow colors
                        lineColor: DEFAULT_MERMAID_THEME.arrowColor,
                        edgeLabelBackground: DEFAULT_MERMAID_THEME.previewBg,
                        
                        // Decision text color - FORCE WHITE TEXT
                        decisionSecondaryTextColor: '#ffffff',
                        decisionTertiaryTextColor: '#ffffff',
                      });
                    }}
                  >
                    <RotateCcw className="h-3 w-3 mr-2" />
                    Reset to Default
          </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="sm" onClick={exportSVG}>
            <Download className="h-4 w-4 mr-2" />
            Export SVG
          </Button>

          <Button variant="outline" size="sm" onClick={exportPNG}>
            <Download className="h-4 w-4 mr-2" />
            Export PNG
          </Button>

          <Button variant="outline" size="sm" onClick={copyCode}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Code
          </Button>

          <Button variant="outline" size="sm" onClick={openInMermaidLive}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in Mermaid Live
          </Button>
        </div>

        {/* Error Display */}
        {renderError && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
            <p className="font-medium">{renderError}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Editor Card */}
          <Card>
            <CardHeader>
              <CardTitle>Mermaid Code</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={mermaidCode}
                onChange={(e) => setMermaidCode(e.target.value)}
                placeholder="Enter your Mermaid code here..."
                className="min-h-[600px] font-mono text-sm resize-none"
                spellCheck={false}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Press Ctrl+Enter to render • {mermaidCode.split('\n').length} lines
              </p>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="relative rounded-lg overflow-hidden min-h-[600px] flex items-center justify-center"
                style={{ backgroundColor: previewBgColor }}
                onMouseEnter={() => setShowZoomControls(true)}
                onMouseLeave={() => setShowZoomControls(false)}
              >
                <div
                  ref={mermaidRef}
                  className="p-4"
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'center',
                    transition: 'transform 0.3s ease'
                  }}
                />

                {/* Zoom Controls */}
                {showZoomControls && (
                  <div className="absolute bottom-4 right-4 flex gap-1 bg-background/95 border rounded-lg p-1 shadow-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= 0.5}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleZoomReset}
                      className="min-w-[60px]"
                    >
                      {Math.round(zoomLevel * 100)}%
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleZoomIn}
                      disabled={zoomLevel >= 3}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

