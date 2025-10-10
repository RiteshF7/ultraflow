'use client';

import React from 'react';
import { THEME } from '@/constants/theme';
import type { BannerSettings } from '../types';

interface BannerSettingsPanelProps {
  settings: BannerSettings;
  onSettingChange: <K extends keyof BannerSettings>(key: K, value: BannerSettings[K]) => void;
  visible: boolean;
  onClose: () => void;
}

export default function BannerSettingsPanel({
  settings,
  onSettingChange,
  visible,
  onClose,
}: BannerSettingsPanelProps) {
  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: THEME.zIndex.dropdown - 1,
        }}
        onClick={onClose}
      />

      {/* Settings Panel */}
      <div
        style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: THEME.spacing.xs,
          backgroundColor: THEME.colors.cardBg,
          border: `1px solid ${THEME.colors.border}`,
          borderRadius: THEME.borderRadius.sm,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
          padding: THEME.spacing.lg,
          minWidth: '300px',
          zIndex: THEME.zIndex.dropdown,
          fontFamily: THEME.typography.fontFamily,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            margin: `0 0 ${THEME.spacing.lg} 0`,
            fontSize: THEME.typography.fontSize.md,
            fontWeight: THEME.typography.fontWeight.medium,
            color: THEME.colors.text,
          }}
        >
          ⚙️ Banner Generation Settings
        </h3>

        {/* Image Scope */}
        <div style={{ marginBottom: THEME.spacing.lg }}>
          <label
            style={{
              display: 'block',
              marginBottom: THEME.spacing.xs,
              fontSize: THEME.typography.fontSize.sm,
              color: THEME.colors.textMuted,
              fontWeight: THEME.typography.fontWeight.medium,
            }}
          >
            Image Scope
          </label>
          <select
            value={settings.imageScope}
            onChange={(e) => onSettingChange('imageScope', e.target.value as BannerSettings['imageScope'])}
            style={{
              width: '100%',
              padding: THEME.spacing.md,
              backgroundColor: THEME.colors.active,
              color: THEME.colors.text,
              border: `1px solid ${THEME.colors.border}`,
              borderRadius: THEME.borderRadius.sm,
              fontSize: THEME.typography.fontSize.sm,
              cursor: 'pointer',
              fontFamily: THEME.typography.fontFamily,
            }}
          >
            <option value="article">Entire Article</option>
            <option value="diagram">Per Diagram</option>
            <option value="modal-only">Modal Preview Only</option>
          </select>
        </div>

        {/* Prompt Type */}
        <div style={{ marginBottom: THEME.spacing.lg }}>
          <label
            style={{
              display: 'block',
              marginBottom: THEME.spacing.xs,
              fontSize: THEME.typography.fontSize.sm,
              color: THEME.colors.textMuted,
              fontWeight: THEME.typography.fontWeight.medium,
            }}
          >
            Prompt Generation
          </label>
          <select
            value={settings.promptType}
            onChange={(e) => onSettingChange('promptType', e.target.value as BannerSettings['promptType'])}
            style={{
              width: '100%',
              padding: THEME.spacing.md,
              backgroundColor: THEME.colors.active,
              color: THEME.colors.text,
              border: `1px solid ${THEME.colors.border}`,
              borderRadius: THEME.borderRadius.sm,
              fontSize: THEME.typography.fontSize.sm,
              cursor: 'pointer',
              fontFamily: THEME.typography.fontFamily,
            }}
          >
            <option value="auto">Auto-generate from Content</option>
            <option value="custom">Custom Prompt</option>
          </select>
        </div>

        {/* Custom Prompt Textarea */}
        {settings.promptType === 'custom' && (
          <div style={{ marginBottom: THEME.spacing.lg }}>
            <label
              style={{
                display: 'block',
                marginBottom: THEME.spacing.xs,
                fontSize: THEME.typography.fontSize.sm,
                color: THEME.colors.textMuted,
                fontWeight: THEME.typography.fontWeight.medium,
              }}
            >
              Custom Prompt
            </label>
            <textarea
              value={settings.customPrompt}
              onChange={(e) => onSettingChange('customPrompt', e.target.value)}
              placeholder="Describe the banner image you want..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: THEME.spacing.md,
                backgroundColor: THEME.colors.background,
                color: THEME.colors.text,
                border: `1px solid ${THEME.colors.border}`,
                borderRadius: THEME.borderRadius.sm,
                fontSize: THEME.typography.fontSize.sm,
                fontFamily: THEME.typography.fontFamilyMono,
                resize: 'vertical',
              }}
            />
          </div>
        )}

        {/* Display Behavior */}
        <div style={{ marginBottom: THEME.spacing.lg }}>
          <label
            style={{
              display: 'block',
              marginBottom: THEME.spacing.xs,
              fontSize: THEME.typography.fontSize.sm,
              color: THEME.colors.textMuted,
              fontWeight: THEME.typography.fontWeight.medium,
            }}
          >
            Display Behavior
          </label>
          <select
            value={settings.displayBehavior}
            onChange={(e) => onSettingChange('displayBehavior', e.target.value as BannerSettings['displayBehavior'])}
            style={{
              width: '100%',
              padding: THEME.spacing.md,
              backgroundColor: THEME.colors.active,
              color: THEME.colors.text,
              border: `1px solid ${THEME.colors.border}`,
              borderRadius: THEME.borderRadius.sm,
              fontSize: THEME.typography.fontSize.sm,
              cursor: 'pointer',
              fontFamily: THEME.typography.fontFamily,
            }}
          >
            <option value="modal">Preview in Modal</option>
            <option value="auto-download">Auto-download PNG</option>
            <option value="inline">Display Inline</option>
          </select>
        </div>

        {/* Button Placement */}
        <div style={{ marginBottom: 0 }}>
          <label
            style={{
              display: 'block',
              marginBottom: THEME.spacing.xs,
              fontSize: THEME.typography.fontSize.sm,
              color: THEME.colors.textMuted,
              fontWeight: THEME.typography.fontWeight.medium,
            }}
          >
            Button Placement
          </label>
          <select
            value={settings.buttonPlacement}
            onChange={(e) => onSettingChange('buttonPlacement', e.target.value as BannerSettings['buttonPlacement'])}
            style={{
              width: '100%',
              padding: THEME.spacing.md,
              backgroundColor: THEME.colors.active,
              color: THEME.colors.text,
              border: `1px solid ${THEME.colors.border}`,
              borderRadius: THEME.borderRadius.sm,
              fontSize: THEME.typography.fontSize.sm,
              cursor: 'pointer',
              fontFamily: THEME.typography.fontFamily,
            }}
          >
            <option value="header">Header Toolbar</option>
            <option value="floating">Floating Button</option>
            <option value="card">Within Diagram Cards</option>
          </select>
        </div>
      </div>
    </>
  );
}

