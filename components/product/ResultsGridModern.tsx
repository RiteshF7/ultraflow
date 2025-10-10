'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  renderMermaidToElement,
  initializeMermaid,
  MERMAID_THEMES,
  type MermaidTheme
} from '@/lib/ArticleToFlowChart/step2-mmdToImage-browser';
import {
  downloadSvg,
  downloadPng
} from '@/utils/downloadHelpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Download, 
  Edit, 
  Home, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  RefreshCw 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiagramData {
  title: string;
  mermaidCode: string;
}

interface ResultsGridProps {
  diagrams: DiagramData[];
  loading: boolean;
  error: string;
}

// Diagram Card Component
function DiagramCard({ diagram, index, theme }: { diagram: DiagramData; index: number; theme: MermaidTheme }) {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [renderError, setRenderError] = useState('');
  const [isRendered, setIsRendered] = useState(false);
  const [svgContent, setSvgContent] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLoadingEditor, setIsLoadingEditor] = useState(false);
  const [forceRefreshTrigger, setForceRefreshTrigger] = useState(0);

  const renderDiagram = async (forceRefresh = false) => {
    if (!mermaidRef.current) return;
    
    try {
      setRenderError('');
      setIsRendered(false);
      
      if (forceRefresh && typeof window !== 'undefined') {
        initializeMermaid(theme);
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const result = await renderMermaidToElement(
        diagram.mermaidCode,
        `mermaid-card-${index}-${Date.now()}`
      );
      
      if (result.svg) {
        setSvgContent(result.svg);
        setIsRendered(true);
      } else {
        throw new Error('No SVG returned from renderer');
      }
    } catch (err) {
      console.error(`❌ Mermaid rendering error for diagram ${index}:`, err);
      setRenderError(`Failed to render: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    if (!mermaidRef.current && diagram.mermaidCode && retryCount < 5) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    }
    
    if (mermaidRef.current && diagram.mermaidCode) {
      renderDiagram(false);
    } else if (retryCount >= 5) {
      setRenderError('Failed to initialize diagram container');
    }
  }, [diagram.mermaidCode, index, retryCount, forceRefreshTrigger, theme]);

  const [downloadType, setDownloadType] = useState<'svg' | 'png' | null>(null);

  const handleDownloadSvg = async () => {
    if (!mermaidRef.current) return;
    setDownloadType('svg');
    try {
      const svgElement = mermaidRef.current.querySelector('svg');
      if (svgElement) {
        downloadSvg(svgElement, diagram.title.toLowerCase().replace(/\s+/g, '-'));
      }
    } finally {
      setTimeout(() => setDownloadType(null), 500);
    }
  };

  const handleDownloadPng = async () => {
    if (!mermaidRef.current) return;
    setDownloadType('png');
    setIsDownloading(true);
    try {
      const svgElement = mermaidRef.current.querySelector('svg');
      if (svgElement) {
        await downloadPng(svgElement, diagram.title.toLowerCase().replace(/\s+/g, '-'));
      }
    } catch (error) {
      console.error('Failed to download PNG:', error);
    } finally {
      setIsDownloading(false);
      setTimeout(() => setDownloadType(null), 500);
    }
  };

  const handleEditCode = () => {
    setIsLoadingEditor(true);
    localStorage.setItem('mermaid-editor-code', diagram.mermaidCode);
    setTimeout(() => {
      router.push('/mermaid-editor');
    }, 100);
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const handleZoomReset = () => setZoomLevel(1);

  const handleForceRefresh = async () => {
    await renderDiagram(true);
    setForceRefreshTrigger(prev => prev + 1);
  };

  return (
    <Card 
      className="relative overflow-hidden transition-shadow hover:shadow-lg"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-1">{diagram.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Diagram Display */}
        <div className="relative bg-muted/30 rounded-lg overflow-hidden" style={{ minHeight: '300px' }}>
          <div 
            className="flex items-center justify-center p-4"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center',
              transition: 'transform 0.3s ease'
            }}
          >
            <div 
              ref={mermaidRef}
              className="flex justify-center items-center text-muted-foreground text-sm"
              dangerouslySetInnerHTML={
                isRendered && svgContent 
                  ? { __html: svgContent }
                  : { __html: renderError || 'Rendering...' }
              }
            />
          </div>

          {/* Loading Editor Overlay */}
          {isLoadingEditor && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
              <p className="text-lg mb-4">Loading Editor...</p>
              <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
                <div className="w-1/2 h-full bg-primary animate-pulse" />
              </div>
            </div>
          )}

          {/* Action Buttons (Show on Hover) */}
          {showActions && isRendered && (
            <div className="absolute top-2 right-2 flex gap-2 z-10">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleEditCode}
                disabled={isLoadingEditor}
                className="shadow-lg"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleForceRefresh}
                className="shadow-lg"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownloadSvg}
                disabled={downloadType === 'svg'}
                className="shadow-lg"
              >
                <Download className="h-4 w-4 mr-1" />
                SVG
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownloadPng}
                disabled={isDownloading || downloadType === 'png'}
                className="shadow-lg"
              >
                <Download className="h-4 w-4 mr-1" />
                PNG
              </Button>
            </div>
          )}

          {/* Zoom Controls (Show on Hover) */}
          {showActions && isRendered && (
            <div className="absolute bottom-2 right-2 flex gap-1 bg-background/95 border rounded-lg p-1 shadow-lg">
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
  );
}

export default function ResultsGridModern({
  diagrams,
  loading,
  error
}: ResultsGridProps) {
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] = useState<MermaidTheme>('default');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Processing your article...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              Generated Flowcharts
            </h1>
            <p className="text-muted-foreground text-lg">
              {diagrams.length} diagram{diagrams.length !== 1 ? 's' : ''} created from your article
            </p>
          </div>

          <div className="flex gap-2 items-center">
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value as MermaidTheme)}
              className="px-4 py-2 bg-background border border-input rounded-lg text-sm cursor-pointer hover:bg-accent"
            >
              {Object.entries(MERMAID_THEMES).map(([key, label]) => (
                <option key={key} value={key}>
                  🎨 {label}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              onClick={() => router.push('/')}
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Grid of Diagrams */}
        {diagrams.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {diagrams.map((diagram, index) => (
              <DiagramCard
                key={index}
                diagram={diagram}
                index={index}
                theme={selectedTheme}
              />
            ))}
          </div>
        ) : (
          <Card className="py-16">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <svg className="h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">No Diagrams to Display</h3>
              <p className="text-muted-foreground">
                Generate flowcharts from your articles to see them here
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

