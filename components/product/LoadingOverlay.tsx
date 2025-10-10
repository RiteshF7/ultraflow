'use client';

import React, { useEffect, useState } from 'react';
import { THEME } from '@/constants/theme';

const BACKGROUND_COLOR = '#FFFFFF';
const PRIMARY_COLOR = THEME.colors.primary;

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
        backgroundColor: '#E5E7EB',
        zIndex: 9999,
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          backgroundColor: PRIMARY_COLOR,
          width: `${progress}%`,
          transition: 'width 0.3s ease-out',
          boxShadow: `0 0 10px ${PRIMARY_COLOR}`,
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
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9998,
          gap: '2rem'
        }}>
          {/* Loading Spinner Container */}
          <div style={{
            backgroundColor: BACKGROUND_COLOR,
            borderRadius: '1rem',
            padding: '3rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            minWidth: '300px'
          }}>
            {/* Spinner */}
            <div style={{
              width: '64px',
              height: '64px',
              border: '6px solid #E5E7EB',
              borderTop: `6px solid ${PRIMARY_COLOR}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            
            {/* Message */}
            <div style={{
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '0.5rem'
              }}>
                {message}
              </p>
              <p style={{
                fontSize: '0.875rem',
                color: '#6B7280'
              }}>
                Please wait, do not close or refresh the page
              </p>
            </div>

            {/* Progress Percentage */}
            <div style={{
              fontSize: '0.875rem',
              fontWeight: '500',
              color: PRIMARY_COLOR
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

