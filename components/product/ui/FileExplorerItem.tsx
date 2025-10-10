'use client';

import React from 'react';
import { THEME } from '@/constants/theme';

interface FileExplorerItemProps {
  id: string;
  name: string;
  type: 'file' | 'pasted';
  isSelected: boolean;
  onClick: () => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
}

export default function FileExplorerItem({
  id,
  name,
  type,
  isSelected,
  onClick,
  onDelete,
  disabled = false,
}: FileExplorerItemProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      onDelete(id);
    }
  };

  const getIcon = () => {
    return type === 'file' ? '📄' : '📝';
  };

  const baseStyles: React.CSSProperties = {
    padding: `${THEME.spacing.md} ${THEME.spacing.lg}`,
    fontSize: THEME.typography.fontSize.base,
    color: isSelected ? THEME.colors.text : THEME.colors.textSecondary,
    backgroundColor: isSelected ? THEME.colors.active : 'transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: THEME.spacing.sm,
    transition: THEME.transitions.fast,
    borderLeft: isSelected 
      ? `2px solid ${THEME.colors.primary}` 
      : '2px solid transparent',
    fontFamily: THEME.typography.fontFamily,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled && !isSelected) {
      e.currentTarget.style.backgroundColor = THEME.colors.hover;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled && !isSelected) {
      e.currentTarget.style.backgroundColor = 'transparent';
    }
  };

  return (
    <div
      onClick={disabled ? undefined : onClick}
      style={baseStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: THEME.spacing.sm,
        flex: 1,
        minWidth: 0
      }}>
        <span style={{ fontSize: THEME.typography.fontSize.md }}>
          {getIcon()}
        </span>
        <span style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {name}
        </span>
      </div>
      
      <button
        onClick={handleDelete}
        disabled={disabled}
        style={{
          padding: `${THEME.spacing.xs} ${THEME.spacing.sm}`,
          backgroundColor: 'transparent',
          color: isSelected ? THEME.colors.text : THEME.colors.error,
          border: 'none',
          fontSize: THEME.typography.fontSize.sm,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: 0.7,
          transition: THEME.transitions.normal,
          borderRadius: THEME.borderRadius.sm,
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.backgroundColor = THEME.colors.hover;
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.opacity = '0.7';
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        ✕
      </button>
    </div>
  );
}
