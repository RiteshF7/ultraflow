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
import { THEME } from '@/constants/theme';
import Button from './ui/Button';
import ErrorBanner from './ui/ErrorBanner';

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
      
      // Force refresh: clear any mermaid cache and reinitialize with current theme
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
    <div 
      style={{
        position: 'relative',
        backgroundColor: THEME.colors.cardBg,
        border: `1px solid ${THEME.colors.border}`,
        overflow: 'hidden',
        height: '100%'
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Flowchart Area - Full Space, No Scroll (Zoom Instead) */}
      <div style={{
        height: '100%',
        padding: THEME.spacing.sm,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: THEME.colors.previewBg
      }}>
        <div 
          ref={mermaidRef}
          style={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            color: THEME.colors.textMuted,
            fontSize: THEME.typography.fontSize.sm,
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: THEME.transitions.normal
          }}
          dangerouslySetInnerHTML={
            isRendered && svgContent 
              ? { __html: svgContent }
              : { __html: renderError || 'Rendering...' }
          }
        />
      </div>

      {/* Loading Editor Overlay */}
      {isLoadingEditor && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: THEME.colors.overlay,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            color: THEME.colors.text,
            fontSize: THEME.typography.fontSize.md,
            marginBottom: THEME.spacing.lg,
            fontFamily: THEME.typography.fontFamily,
          }}>
            Loading Editor...
          </div>
          <div style={{
            width: '200px',
            height: '3px',
            backgroundColor: THEME.colors.border,
            borderRadius: THEME.borderRadius.sm,
            overflow: 'hidden'
          }}>
            <div style={{
              width: '50%',
              height: '100%',
              backgroundColor: THEME.colors.primary,
              animation: 'loadingBar 1.5s ease-in-out infinite'
            }} />
          </div>
          <style>{`
            @keyframes loadingBar {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(200%); }
            }
          `}</style>
        </div>
      )}

      {/* Top Right Buttons - Download & Edit (Show on Hover) */}
      {showActions && (
        <div style={{
          position: 'absolute',
          top: THEME.spacing.sm,
          right: THEME.spacing.sm,
          display: 'flex',
          gap: THEME.spacing.xs,
          zIndex: 10
        }}>
          <Button
            variant="secondary"
            size="small"
            onClick={handleEditCode}
            disabled={isLoadingEditor}
            style={{
              backgroundColor: THEME.colors.cardBgTransparent,
              boxShadow: THEME.shadows.md,
              border: `1px solid ${THEME.colors.border}`,
            }}
          >
            ✏️ Edit
          </Button>
          <Button
            variant="secondary"
            size="small"
            onClick={handleForceRefresh}
            disabled={!isRendered}
            style={{
              backgroundColor: THEME.colors.cardBgTransparent,
              boxShadow: THEME.shadows.md,
              border: `1px solid ${THEME.colors.border}`,
              color: isRendered ? THEME.colors.warning : THEME.colors.textMuted,
            }}
          >
            🔄
          </Button>
          <Button
            variant="secondary"
            size="small"
            onClick={handleDownloadSvg}
            disabled={!isRendered || downloadType === 'svg'}
            style={{
              backgroundColor: THEME.colors.cardBgTransparent,
              boxShadow: THEME.shadows.md,
              border: `1px solid ${THEME.colors.border}`,
            }}
          >
            {downloadType === 'svg' ? '⏳' : '📄'} SVG
          </Button>
          <Button
            variant="secondary"
            size="small"
            onClick={handleDownloadPng}
            disabled={!isRendered || isDownloading || downloadType === 'png'}
            style={{
              backgroundColor: THEME.colors.cardBgTransparent,
              boxShadow: THEME.shadows.md,
              border: `1px solid ${THEME.colors.border}`,
            }}
          >
            {downloadType === 'png' ? '⏳' : '🖼️'} PNG
          </Button>
        </div>
      )}

      {/* Bottom Right Zoom Controls (Show on Hover) */}
      {showActions && (
        <div style={{
          position: 'absolute',
          bottom: THEME.spacing.sm,
          right: THEME.spacing.sm,
          display: 'flex',
          gap: THEME.spacing.xs,
          backgroundColor: THEME.colors.cardBgTransparent,
          padding: THEME.spacing.xs,
          borderRadius: THEME.borderRadius.sm,
          border: `1px solid ${THEME.colors.border}`,
          boxShadow: THEME.shadows.md,
          zIndex: 10
        }}>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            disabled={zoomLevel <= 0.5}
            style={{
              padding: `${THEME.spacing.md} ${THEME.spacing.sm}`,
              backgroundColor: 'transparent',
              color: zoomLevel <= 0.5 ? THEME.colors.textMuted : THEME.colors.text,
              border: 'none',
              borderRadius: THEME.borderRadius.sm,
              fontSize: THEME.typography.fontSize.md,
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
              padding: `${THEME.spacing.md} ${THEME.spacing.sm}`,
              backgroundColor: 'transparent',
              color: THEME.colors.text,
              border: 'none',
              borderRadius: THEME.borderRadius.sm,
              fontSize: THEME.typography.fontSize.xs,
              cursor: 'pointer',
              transition: THEME.transitions.normal
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
              padding: `${THEME.spacing.md} ${THEME.spacing.sm}`,
              backgroundColor: 'transparent',
              color: zoomLevel >= 3 ? THEME.colors.textMuted : THEME.colors.text,
              border: 'none',
              borderRadius: THEME.borderRadius.sm,
              fontSize: THEME.typography.fontSize.md,
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
  );
}

export default function ResultsGrid({
  diagrams,
  loading,
  error
}: ResultsGridProps) {
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] = useState<MermaidTheme>('default');

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: THEME.colors.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: THEME.colors.text,
        fontFamily: THEME.typography.fontFamily,
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: `4px solid ${THEME.colors.border}`,
          borderTop: `4px solid ${THEME.colors.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ 
          marginTop: THEME.spacing.lg, 
          fontSize: THEME.typography.fontSize.lg 
        }}>
          Processing your article...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      backgroundColor: THEME.colors.background,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: THEME.typography.fontFamily,
    }}>
      {/* Compact Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: `${THEME.spacing.lg} ${THEME.spacing.lg}`,
        backgroundColor: THEME.colors.secondaryBg,
        borderBottom: `1px solid ${THEME.colors.border}`
      }}>
        <div style={{
          fontSize: THEME.typography.fontSize.md,
          color: THEME.colors.text,
          fontWeight: THEME.typography.fontWeight.medium
        }}>
          Flowcharts ({diagrams.length})
        </div>

        <div style={{ display: 'flex', gap: THEME.spacing.sm, alignItems: 'center' }}>
          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value as MermaidTheme)}
            style={{
              padding: `${THEME.spacing.md} ${THEME.spacing.sm}`,
              backgroundColor: THEME.colors.active,
              color: THEME.colors.text,
              border: `1px solid ${THEME.colors.border}`,
              borderRadius: THEME.borderRadius.sm,
              fontSize: THEME.typography.fontSize.sm,
              cursor: 'pointer',
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
            onClick={() => router.push('/')}
          >
            ← Home
          </Button>
        </div>
      </div>

      {/* Error Display - Compact */}
      {error && (
        <ErrorBanner 
          message={error}
          type="error"
        />
      )}

      {/* Grid Container - Show ALL diagrams */}
      <div style={{
        flex: 1,
        padding: THEME.spacing.sm,
        overflow: 'auto',
        minHeight: 0
      }}>
        {diagrams.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gridAutoRows: '55vh',
            gap: THEME.spacing.sm
          }}>
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: THEME.colors.textMuted,
            fontSize: THEME.typography.fontSize.md,
            fontFamily: THEME.typography.fontFamily,
          }}>
            No diagrams to display
          </div>
        )}
      </div>
    </div>
  );
}
