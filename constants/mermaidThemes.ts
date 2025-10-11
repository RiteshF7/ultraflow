/**
 * Mermaid Editor Color Theme Presets
 * Centralized color constants for theme customization
 */

export interface ColorTheme {
  name: string;
  previewBg: string;
  nodeColor: string;
  borderColor: string;
  arrowColor: string;
  textColor: string;
}

export const MERMAID_COLOR_THEMES: Record<string, ColorTheme> = {
  default: {
    name: 'Default Blue',
    previewBg: '#f0f9ff',
    nodeColor: '#4f46e5',
    borderColor: '#4338ca',
    arrowColor: '#6366f1',
    textColor: '#ffffff',
  },
  ocean: {
    name: 'Ocean Breeze',
    previewBg: '#f0f9ff',
    nodeColor: '#0ea5e9',
    borderColor: '#0284c7',
    arrowColor: '#38bdf8',
    textColor: '#ffffff',
  },
  sunset: {
    name: 'Sunset Glow',
    previewBg: '#fff7ed',
    nodeColor: '#f97316',
    borderColor: '#ea580c',
    arrowColor: '#fb923c',
    textColor: '#ffffff',
  },
  forest: {
    name: 'Forest Green',
    previewBg: '#f0fdf4',
    nodeColor: '#10b981',
    borderColor: '#059669',
    arrowColor: '#34d399',
    textColor: '#ffffff',
  },
  purple: {
    name: 'Purple Dream',
    previewBg: '#faf5ff',
    nodeColor: '#a855f7',
    borderColor: '#9333ea',
    arrowColor: '#c084fc',
    textColor: '#ffffff',
  },
  rose: {
    name: 'Rose Garden',
    previewBg: '#fff1f2',
    nodeColor: '#f43f5e',
    borderColor: '#e11d48',
    arrowColor: '#fb7185',
    textColor: '#ffffff',
  },
  dark: {
    name: 'Dark Mode',
    previewBg: '#f9fafb',
    nodeColor: '#374151',
    borderColor: '#6b7280',
    arrowColor: '#9ca3af',
    textColor: '#f9fafb',
  },
  neon: {
    name: 'Neon Night',
    previewBg: '#f0f9ff',
    nodeColor: '#22d3ee',
    borderColor: '#06b6d4',
    arrowColor: '#67e8f9',
    textColor: '#0f172a',
  },
  pastel: {
    name: 'Pastel Dreams',
    previewBg: '#fefce8',
    nodeColor: '#fbbf24',
    borderColor: '#f59e0b',
    arrowColor: '#fcd34d',
    textColor: '#78350f',
  },
  monochrome: {
    name: 'Monochrome',
    previewBg: '#f9fafb',
    nodeColor: '#6b7280',
    borderColor: '#374151',
    arrowColor: '#9ca3af',
    textColor: '#ffffff',
  },
  mint: {
    name: 'Mint Fresh',
    previewBg: '#ecfdf5',
    nodeColor: '#14b8a6',
    borderColor: '#0d9488',
    arrowColor: '#2dd4bf',
    textColor: '#ffffff',
  },
  crimson: {
    name: 'Crimson Wave',
    previewBg: '#fef2f2',
    nodeColor: '#dc2626',
    borderColor: '#b91c1c',
    arrowColor: '#ef4444',
    textColor: '#ffffff',
  },
  slate: {
    name: 'Slate Professional',
    previewBg: '#f8fafc',
    nodeColor: '#475569',
    borderColor: '#334155',
    arrowColor: '#64748b',
    textColor: '#f1f5f9',
  },
  amber: {
    name: 'Amber Warmth',
    previewBg: '#fffbeb',
    nodeColor: '#f59e0b',
    borderColor: '#d97706',
    arrowColor: '#fbbf24',
    textColor: '#451a03',
  },
  teal: {
    name: 'Teal Calm',
    previewBg: '#f0fdfa',
    nodeColor: '#14b8a6',
    borderColor: '#0f766e',
    arrowColor: '#2dd4bf',
    textColor: '#ffffff',
  },
  grape: {
    name: 'Grape Purple',
    previewBg: '#f5f3ff',
    nodeColor: '#8b5cf6',
    borderColor: '#7c3aed',
    arrowColor: '#a78bfa',
    textColor: '#ffffff',
  },
  emerald: {
    name: 'Emerald Shine',
    previewBg: '#f0fdf4',
    nodeColor: '#059669',
    borderColor: '#047857',
    arrowColor: '#10b981',
    textColor: '#ffffff',
  },
  fuchsia: {
    name: 'Fuchsia Burst',
    previewBg: '#fdf4ff',
    nodeColor: '#d946ef',
    borderColor: '#c026d3',
    arrowColor: '#e879f9',
    textColor: '#ffffff',
  },
  indigo: {
    name: 'Indigo Deep',
    previewBg: '#eef2ff',
    nodeColor: '#6366f1',
    borderColor: '#4f46e5',
    arrowColor: '#818cf8',
    textColor: '#ffffff',
  },
  lime: {
    name: 'Lime Zest',
    previewBg: '#f7fee7',
    nodeColor: '#84cc16',
    borderColor: '#65a30d',
    arrowColor: '#a3e635',
    textColor: '#1a2e05',
  },
  sky: {
    name: 'Sky Blue',
    previewBg: '#f0f9ff',
    nodeColor: '#0ea5e9',
    borderColor: '#0284c7',
    arrowColor: '#38bdf8',
    textColor: '#ffffff',
  },
  neo: {
    name: 'Neo',
    previewBg: '#ffffff',
    nodeColor: '#00d4aa',
    borderColor: '#00b894',
    arrowColor: '#00cec9',
    textColor: '#ffffff',
  },
  neoDark: {
    name: 'Neo Dark',
    previewBg: '#f0fdfa',
    nodeColor: '#00d4aa',
    borderColor: '#00b894',
    arrowColor: '#00cec9',
    textColor: '#ffffff',
  },
  forestMermaid: {
    name: 'Forest',
    previewBg: '#f0fdf4',
    nodeColor: '#22c55e',
    borderColor: '#16a34a',
    arrowColor: '#4ade80',
    textColor: '#ffffff',
  },
  base: {
    name: 'Base',
    previewBg: '#f9fafb',
    nodeColor: '#6b7280',
    borderColor: '#374151',
    arrowColor: '#9ca3af',
    textColor: '#ffffff',
  },
  neutral: {
    name: 'Neutral',
    previewBg: '#fafafa',
    nodeColor: '#737373',
    borderColor: '#525252',
    arrowColor: '#a3a3a3',
    textColor: '#ffffff',
  },
  redux: {
    name: 'Redux',
    previewBg: '#faf5ff',
    nodeColor: '#764abc',
    borderColor: '#5b21b6',
    arrowColor: '#8b5cf6',
    textColor: '#ffffff',
  },
  reduxDark: {
    name: 'Redux Dark',
    previewBg: '#faf5ff',
    nodeColor: '#764abc',
    borderColor: '#5b21b6',
    arrowColor: '#8b5cf6',
    textColor: '#ffffff',
  },
};

// Default theme values
export const DEFAULT_MERMAID_THEME = MERMAID_COLOR_THEMES.default;

