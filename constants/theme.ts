/**
 * Theme Constants
 * 
 * Centralized theme configuration for consistent styling across the application.
 * These constants are used throughout the codebase to maintain design consistency.
 */

export const THEME = {
  // Color Palette
  colors: {
    // Primary colors
    primary: '#3b82f6', // Blue
    primaryHover: '#2563eb', // Darker blue for hover
    secondary: '#10b981', // Green
    accent: '#8b5cf6', // Purple
    error: '#ef4444', // Red
    errorHover: '#dc2626', // Darker red for hover
    warning: '#f59e0b', // Orange
    success: '#10b981', // Green
    successHover: '#059669', // Darker green for hover
    
    // Text colors
    text: '#f5f5f5', // Light gray for text
    textMuted: '#9ca3af', // Muted gray
    textSecondary: '#d1d5db', // Secondary text
    
    // Background colors
    background: '#1e1e1e', // Dark background
    secondaryBg: '#252526', // Slightly lighter dark
    cardBg: '#2d2d2d', // Card background
    sidebarBg: '#252526', // Sidebar background
    overlay: 'rgba(0, 0, 0, 0.7)', // Modal overlay
    previewBg: '#1a1a1a', // Preview area background
    
    // Interactive states
    hover: '#3a3a3b', // Hover state
    active: '#37373d', // Active state
    focus: '#3b82f6', // Focus ring color
    
    // Borders
    border: '#3e3e42', // Border color
    borderLight: '#555555', // Light border
  },
  
  // Typography
  typography: {
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    fontFamilyMono: '"Consolas", "Courier New", monospace',
    
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      md: '16px',
      lg: '20px',
      xl: '24px',
      '2xl': '32px',
    },
    
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  
  // Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
    xxxl: '32px',
  },
  
  // Border Radius
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    primary: '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
    success: '0 4px 14px 0 rgba(16, 185, 129, 0.39)',
  },
  
  // Transitions
  transitions: {
    fast: 'all 0.15s ease',
    normal: 'all 0.3s ease',
    slow: 'all 0.5s ease',
  },
  
  // Z-Index layers
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },
} as const;

// Type export for TypeScript users
export type Theme = typeof THEME;

