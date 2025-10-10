'use client';

import React, { useState } from 'react';
import { THEME } from '@/constants/theme';
import { Button } from '@/components/ui/button';
import { createImageDataUrl } from '../utils/imageDownloader';

interface BannerImageModalProps {
  imageData: string;
  onClose: () => void;
  onDownload: () => void;
  loading?: boolean;
  error?: string;
}

export default function BannerImageModal({
  imageData,
  onClose,
  onDownload,
  loading = false,
  error = ''
}: BannerImageModalProps) {
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const handleZoomReset = () => setZoomLevel(1);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: THEME.colors.overlay,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: THEME.zIndex.modal,
        padding: THEME.spacing.xl,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: THEME.colors.cardBg,
          borderRadius: THEME.borderRadius.lg,
          border: `1px solid ${THEME.colors.border}`,
          maxWidth: '90vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: THEME.spacing.lg,
            borderBottom: `1px solid ${THEME.colors.border}`,
            backgroundColor: THEME.colors.secondaryBg,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: THEME.typography.fontSize.lg,
              fontWeight: THEME.typography.fontWeight.medium,
              color: THEME.colors.text,
              fontFamily: THEME.typography.fontFamily,
            }}
          >
            🎨 Generated Banner Image
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: THEME.typography.fontSize.xl,
              color: THEME.colors.textMuted,
              cursor: 'pointer',
              padding: THEME.spacing.sm,
              lineHeight: 1,
              transition: THEME.transitions.normal,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = THEME.colors.text)}
            onMouseLeave={(e) => (e.currentTarget.style.color = THEME.colors.textMuted)}
          >
            ×
          </button>
        </div>

        {/* Image Container */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: THEME.spacing.xl,
            backgroundColor: THEME.colors.previewBg,
            overflow: 'hidden',
            minHeight: '400px',
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  border: `4px solid ${THEME.colors.border}`,
                  borderTop: `4px solid ${THEME.colors.primary}`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto',
                }}
              />
              <p
                style={{
                  marginTop: THEME.spacing.lg,
                  color: THEME.colors.text,
                  fontSize: THEME.typography.fontSize.md,
                  fontFamily: THEME.typography.fontFamily,
                }}
              >
                Generating your banner image...
              </p>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : error ? (
            <div
              style={{
                textAlign: 'center',
                color: THEME.colors.error,
                padding: THEME.spacing.xl,
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: THEME.spacing.lg }}>⚠️</div>
              <p
                style={{
                  fontSize: THEME.typography.fontSize.lg,
                  fontWeight: THEME.typography.fontWeight.medium,
                  marginBottom: THEME.spacing.sm,
                }}
              >
                Generation Failed
              </p>
              <p
                style={{
                  fontSize: THEME.typography.fontSize.md,
                  color: THEME.colors.textMuted,
                  fontFamily: THEME.typography.fontFamily,
                }}
              >
                {error}
              </p>
            </div>
          ) : imageData ? (
            <div
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center',
                transition: THEME.transitions.normal,
                maxWidth: '100%',
                maxHeight: '100%',
              }}
            >
              <img
                src={createImageDataUrl(imageData)}
                alt="Generated banner"
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  borderRadius: THEME.borderRadius.sm,
                  border: `1px solid ${THEME.colors.border}`,
                }}
              />
            </div>
          ) : (
            <p
              style={{
                color: THEME.colors.textMuted,
                fontSize: THEME.typography.fontSize.md,
                fontFamily: THEME.typography.fontFamily,
              }}
            >
              No image to display
            </p>
          )}
        </div>

        {/* Footer with Controls */}
        {imageData && !loading && !error && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: THEME.spacing.lg,
              borderTop: `1px solid ${THEME.colors.border}`,
              backgroundColor: THEME.colors.secondaryBg,
            }}
          >
            {/* Zoom Controls */}
            <div
              style={{
                display: 'flex',
                gap: THEME.spacing.xs,
                alignItems: 'center',
              }}
            >
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
                style={{
                  padding: `${THEME.spacing.md} ${THEME.spacing.sm}`,
                  backgroundColor: THEME.colors.active,
                  color: zoomLevel <= 0.5 ? THEME.colors.textMuted : THEME.colors.text,
                  border: `1px solid ${THEME.colors.border}`,
                  borderRadius: THEME.borderRadius.sm,
                  fontSize: THEME.typography.fontSize.md,
                  cursor: zoomLevel <= 0.5 ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                }}
              >
                −
              </button>
              <span
                style={{
                  padding: `${THEME.spacing.md} ${THEME.spacing.sm}`,
                  fontSize: THEME.typography.fontSize.sm,
                  color: THEME.colors.text,
                  minWidth: '60px',
                  textAlign: 'center',
                  fontFamily: THEME.typography.fontFamily,
                }}
              >
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                style={{
                  padding: `${THEME.spacing.md} ${THEME.spacing.sm}`,
                  backgroundColor: THEME.colors.active,
                  color: zoomLevel >= 3 ? THEME.colors.textMuted : THEME.colors.text,
                  border: `1px solid ${THEME.colors.border}`,
                  borderRadius: THEME.borderRadius.sm,
                  fontSize: THEME.typography.fontSize.md,
                  cursor: zoomLevel >= 3 ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                }}
              >
                +
              </button>
              <button
                onClick={handleZoomReset}
                style={{
                  padding: `${THEME.spacing.md} ${THEME.spacing.sm}`,
                  backgroundColor: THEME.colors.active,
                  color: THEME.colors.text,
                  border: `1px solid ${THEME.colors.border}`,
                  borderRadius: THEME.borderRadius.sm,
                  fontSize: THEME.typography.fontSize.xs,
                  cursor: 'pointer',
                  marginLeft: THEME.spacing.sm,
                }}
              >
                Reset
              </button>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: THEME.spacing.sm }}>
              <Button variant="secondary" size="md" onClick={onClose}>
                Close
              </Button>
              <Button variant="default" size="md" onClick={onDownload}>
                📥 Download PNG
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

