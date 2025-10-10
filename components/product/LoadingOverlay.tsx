'use client';

import React, { useEffect, useState } from 'react';
import { THEME } from '@/constants/theme';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export default function LoadingOverlay({ isLoading, message = 'Processing...' }: LoadingOverlayProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      
      // Simulate progress animation
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          // Slow down as we approach 95%
          const increment = prev < 50 ? 5 : prev < 80 ? 2 : 0.5;
          return Math.min(prev + increment, 95);
        });
      }, 300);

      return () => clearInterval(interval);
    } else {
      // Complete the progress bar when done
      setProgress(100);
      const timeout = setTimeout(() => {
        setProgress(0);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  if (!isLoading && progress === 0) {
    return null;
  }

  return (
    <>
      {/* Progress Bar at Top */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        backgroundColor: THEME.colors.border,
        zIndex: THEME.zIndex.tooltip,
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          backgroundColor: THEME.colors.primary,
          width: `${progress}%`,
          transition: THEME.transitions.normal,
          boxShadow: THEME.shadows.primary,
        }} />
      </div>

      {/* Full Screen Overlay */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: THEME.colors.overlayLight,
          backdropFilter: 'blur(4px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: THEME.zIndex.modal,
          gap: THEME.spacing.xxxl,
          fontFamily: THEME.typography.fontFamily,
        }}>
          {/* Loading Spinner Container */}
          <div style={{
            backgroundColor: THEME.colors.cardBg,
            borderRadius: THEME.borderRadius.xl,
            padding: THEME.spacing.xxxl,
            boxShadow: THEME.shadows.xl,
            border: `1px solid ${THEME.colors.border}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: THEME.spacing.xxl,
            minWidth: '300px'
          }}>
            {/* Spinner */}
            <div style={{
              width: '64px',
              height: '64px',
              border: `6px solid ${THEME.colors.border}`,
              borderTop: `6px solid ${THEME.colors.primary}`,
              borderRadius: THEME.borderRadius.full,
              animation: 'spin 1s linear infinite'
            }} />
            
            {/* Message */}
            <div style={{
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: THEME.typography.fontSize.lg,
                fontWeight: THEME.typography.fontWeight.semibold,
                color: THEME.colors.text,
                marginBottom: THEME.spacing.sm
              }}>
                {message}
              </p>
              <p style={{
                fontSize: THEME.typography.fontSize.sm,
                color: THEME.colors.textMuted
              }}>
                Please wait, do not close or refresh the page
              </p>
            </div>

            {/* Progress Percentage */}
            <div style={{
              fontSize: THEME.typography.fontSize.sm,
              fontWeight: THEME.typography.fontWeight.medium,
              color: THEME.colors.primary
            }}>
              {Math.round(progress)}%
            </div>
          </div>

          {/* CSS Animation */}
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}

