'use client';

import React from 'react';
import { THEME } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'success' | 'error';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

const getVariantStyles = (variant: ButtonVariant, disabled: boolean, loading: boolean) => {
  const baseStyles = {
    border: 'none',
    borderRadius: THEME.borderRadius.md,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: THEME.transitions.normal,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.sm,
    fontWeight: THEME.typography.fontWeight.medium,
  };

  switch (variant) {
    case 'primary':
      return {
        ...baseStyles,
        backgroundColor: disabled || loading ? THEME.colors.border : THEME.colors.primary,
        color: disabled || loading ? THEME.colors.textMuted : THEME.colors.white,
        boxShadow: disabled || loading ? 'none' : THEME.shadows.primary,
      };
    case 'secondary':
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        color: THEME.colors.text,
        border: `1px solid ${THEME.colors.border}`,
      };
    case 'ghost':
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        color: THEME.colors.text,
        border: 'none',
      };
    case 'success':
      return {
        ...baseStyles,
        backgroundColor: disabled || loading ? THEME.colors.border : THEME.colors.success,
        color: disabled || loading ? THEME.colors.textMuted : THEME.colors.white,
        boxShadow: disabled || loading ? 'none' : THEME.shadows.success,
      };
    case 'error':
      return {
        ...baseStyles,
        backgroundColor: disabled || loading ? THEME.colors.border : THEME.colors.error,
        color: disabled || loading ? THEME.colors.textMuted : THEME.colors.white,
      };
    default:
      return baseStyles;
  }
};

const getSizeStyles = (size: ButtonSize) => {
  switch (size) {
    case 'small':
      return {
        padding: `${THEME.spacing.sm} ${THEME.spacing.md}`,
        fontSize: THEME.typography.fontSize.sm,
      };
    case 'medium':
      return {
        padding: `${THEME.spacing.md} ${THEME.spacing.lg}`,
        fontSize: THEME.typography.fontSize.sm,
      };
    case 'large':
      return {
        padding: `${THEME.spacing.lg} ${THEME.spacing.xl}`,
        fontSize: THEME.typography.fontSize.base,
      };
    default:
      return {
        padding: `${THEME.spacing.md} ${THEME.spacing.lg}`,
        fontSize: THEME.typography.fontSize.sm,
      };
  }
};

export default function Button({
  variant = 'secondary',
  size = 'medium',
  loading = false,
  disabled = false,
  children,
  onMouseEnter,
  onMouseLeave,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const baseStyles = getVariantStyles(variant, disabled, loading);
  const sizeStyles = getSizeStyles(size);

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      const target = e.currentTarget;
      switch (variant) {
        case 'secondary':
        case 'ghost':
          target.style.backgroundColor = THEME.colors.hover;
          break;
        case 'primary':
          target.style.backgroundColor = THEME.colors.primaryHover;
          break;
        case 'success':
          target.style.backgroundColor = THEME.colors.successHover;
          break;
        case 'error':
          target.style.backgroundColor = THEME.colors.errorHover;
          break;
      }
    }
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      const target = e.currentTarget;
      switch (variant) {
        case 'secondary':
        case 'ghost':
          target.style.backgroundColor = 'transparent';
          break;
        case 'primary':
          target.style.backgroundColor = THEME.colors.primary;
          break;
        case 'success':
          target.style.backgroundColor = THEME.colors.success;
          break;
        case 'error':
          target.style.backgroundColor = THEME.colors.error;
          break;
      }
    }
    onMouseLeave?.(e);
  };

  return (
    <button
      disabled={isDisabled}
      style={{
        ...baseStyles,
        ...sizeStyles,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {loading && <span>⏳</span>}
      {children}
    </button>
  );
}
