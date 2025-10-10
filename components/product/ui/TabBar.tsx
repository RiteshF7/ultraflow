'use client';

import React from 'react';
import { THEME } from '@/constants/theme';

interface TabBarProps {
  fileName: string;
  fileType: 'file' | 'pasted';
  stats?: {
    characters: number;
    lines: number;
  };
}

export default function TabBar({ fileName, fileType, stats }: TabBarProps) {
  const getIcon = () => {
    return fileType === 'file' ? '📄' : '📝';
  };

  return (
    <div style={{
      height: '36px',
      backgroundColor: THEME.colors.secondaryBg,
      borderBottom: `1px solid ${THEME.colors.border}`,
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
    }}>
      {/* Active Tab */}
      <div style={{
        padding: `${THEME.spacing.md} ${THEME.spacing.lg}`,
        fontSize: THEME.typography.fontSize.base,
        color: THEME.colors.text,
        backgroundColor: THEME.colors.background,
        borderRight: `1px solid ${THEME.colors.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: THEME.spacing.sm,
        height: '100%',
        fontFamily: THEME.typography.fontFamily,
      }}>
        <span>{getIcon()}</span>
        <span>{fileName}</span>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div style={{
          padding: `${THEME.spacing.sm} ${THEME.spacing.lg}`,
          fontSize: THEME.typography.fontSize.xs,
          color: THEME.colors.textMuted,
          backgroundColor: THEME.colors.secondaryBg,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flex: 1,
          fontFamily: THEME.typography.fontFamily,
        }}>
          <span>Plain Text</span>
          <span>{stats.characters} characters | {stats.lines} lines</span>
        </div>
      )}
    </div>
  );
}
