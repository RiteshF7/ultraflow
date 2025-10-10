'use client';

import React from 'react';
import { THEME } from '@/constants/theme';

interface ErrorBannerProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
  dismissible?: boolean;
  onDismiss?: () => void;
}

export default function ErrorBanner({ 
  message, 
  type = 'error', 
  dismissible = false, 
  onDismiss 
}: ErrorBannerProps) {
  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return {
          backgroundColor: 'rgba(248, 81, 73, 0.1)',
          borderColor: THEME.colors.error,
          color: THEME.colors.error,
        };
      case 'warning':
        return {
          backgroundColor: 'rgba(210, 153, 34, 0.1)',
          borderColor: THEME.colors.warning,
          color: THEME.colors.warning,
        };
      case 'info':
        return {
          backgroundColor: 'rgba(88, 166, 255, 0.1)',
          borderColor: THEME.colors.primary,
          color: THEME.colors.primary,
        };
      default:
        return {
          backgroundColor: 'rgba(248, 81, 73, 0.1)',
          borderColor: THEME.colors.error,
          color: THEME.colors.error,
        };
    }
  };

  const typeStyles = getTypeStyles();

  const containerStyles: React.CSSProperties = {
    padding: `${THEME.spacing.lg} ${THEME.spacing.lg}`,
    backgroundColor: typeStyles.backgroundColor,
    borderBottom: `1px solid ${typeStyles.borderColor}`,
    color: typeStyles.color,
    fontSize: THEME.typography.fontSize.sm,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: THEME.spacing.md,
    fontFamily: THEME.typography.fontFamily,
  };

  const messageStyles: React.CSSProperties = {
    flex: 1,
    lineHeight: THEME.typography.lineHeight.normal,
  };

  const dismissButtonStyles: React.CSSProperties = {
    padding: `${THEME.spacing.xs} ${THEME.spacing.sm}`,
    backgroundColor: 'transparent',
    color: typeStyles.color,
    border: 'none',
    fontSize: THEME.typography.fontSize.sm,
    cursor: 'pointer',
    opacity: 0.7,
    transition: THEME.transitions.normal,
    borderRadius: THEME.borderRadius.sm,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={containerStyles}>
      <div style={messageStyles}>
        {message}
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          style={dismissButtonStyles}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.7';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
