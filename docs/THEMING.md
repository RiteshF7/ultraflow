# Theming Guide

## Overview

This project uses a centralized theming system to ensure visual consistency across all components. All theme values are defined in a single source of truth: `constants/theme.ts`.

## Table of Contents

- [Single Source of Truth Principle](#single-source-of-truth-principle)
- [Theme Structure](#theme-structure)
- [Usage Guide](#usage-guide)
- [Color Palette Reference](#color-palette-reference)
- [Adding New Theme Values](#adding-new-theme-values)
- [Best Practices](#best-practices)
- [Migration Guide](#migration-guide)
- [Examples](#examples)

## Single Source of Truth Principle

**All styling values MUST come from the `THEME` constant.**

### Why This Matters

1. **Consistency**: Changes to the theme automatically propagate to all components
2. **Maintainability**: Update colors/spacing in one place instead of hunting through hundreds of files
3. **Design System**: Enforces a coherent design language across the application
4. **Refactoring**: Easy to switch themes, adjust spacing, or update the entire color scheme

### The Rule

✅ **DO**: Use `THEME` constants
```typescript
import { THEME } from '@/constants/theme';

<div style={{
  backgroundColor: THEME.colors.background,
  color: THEME.colors.text,
  padding: THEME.spacing.lg
}}>
```

❌ **DON'T**: Hard-code values
```typescript
// Never do this!
<div style={{
  backgroundColor: '#1e1e1e',
  color: '#f5f5f5',
  padding: '16px'
}}>
```

## Theme Structure

The `THEME` constant is organized into logical categories:

```typescript
THEME = {
  colors: { /* All color values */ },
  typography: { /* Font families, sizes, weights */ },
  spacing: { /* Consistent spacing units */ },
  borderRadius: { /* Border radius values */ },
  shadows: { /* Box shadow presets */ },
  transitions: { /* Animation timing */ },
  zIndex: { /* Layer stacking order */ }
}
```

## Usage Guide

### Importing the Theme

Always import the theme at the top of your component file:

```typescript
import { THEME } from '@/constants/theme';
```

### Applying Theme Values

Use template literals for complex values:

```typescript
// Borders
border: `1px solid ${THEME.colors.border}`

// Padding/Margin with multiple values
padding: `${THEME.spacing.sm} ${THEME.spacing.lg}`

// Box shadows
boxShadow: THEME.shadows.lg
```

### TypeScript Support

The theme is fully typed for autocomplete and type safety:

```typescript
import { THEME, type Theme } from '@/constants/theme';

// TypeScript will autocomplete available properties
const color = THEME.colors.primary; // ✓
const invalid = THEME.colors.notExist; // ✗ TypeScript error
```

## Color Palette Reference

### Dark Theme Colors

Our application uses a dark theme optimized for code editing and long reading sessions.

#### Primary Colors
- `primary` - Main brand color (Blue #3b82f6)
- `primaryHover` - Darker blue for hover states
- `secondary` - Secondary accent (Green #10b981)
- `accent` - Purple accent (#8b5cf6)
- `error` - Error states (Red #ef4444)
- `errorHover` - Darker red for hover
- `warning` - Warning states (Orange #f59e0b)
- `success` - Success states (Green #10b981)
- `successHover` - Darker green for hover

#### Text Colors
- `text` - Primary text color (Light gray #f5f5f5)
- `textMuted` - Muted text (Gray #9ca3af)
- `textSecondary` - Secondary text (#d1d5db)
- `white` - Pure white for text on colored backgrounds

#### Background Colors
- `background` - Main background (#1e1e1e)
- `secondaryBg` - Slightly lighter dark (#252526)
- `cardBg` - Card backgrounds (#2d2d2d)
- `sidebarBg` - Sidebar background (#252526)
- `previewBg` - Preview area (#1a1a1a)
- `overlay` - Modal overlay (rgba(0, 0, 0, 0.7))
- `overlayLight` - Lighter overlay (rgba(0, 0, 0, 0.5))
- `cardBgTransparent` - Semi-transparent card (rgba(37, 37, 38, 0.95))

#### Interactive States
- `hover` - Hover state (#3a3a3b)
- `hoverLight` - Light hover for light backgrounds (#F3F4F6)
- `active` - Active/selected state (#37373d)
- `focus` - Focus ring color (Blue)

#### Banner Backgrounds
- `errorBg` - Error banner background (rgba)
- `warningBg` - Warning banner background (rgba)
- `infoBg` - Info banner background (rgba)

#### Borders
- `border` - Standard border color (#3e3e42)
- `borderLight` - Lighter border (#555555)

### When to Use Which Color

| Use Case | Color |
|----------|-------|
| Primary buttons | `primary` / `primaryHover` |
| Success messages | `success` / `successHover` |
| Error messages | `error` / `errorHover` |
| Warnings | `warning` |
| Main text content | `text` |
| Disabled or secondary text | `textMuted` |
| Card/panel background | `cardBg` |
| Sidebar background | `sidebarBg` |
| Hover effects | `hover` |
| Borders and dividers | `border` |
| Modal overlays | `overlay` |

## Adding New Theme Values

### When to Add a New Value

Add a new theme value when:
1. You need a color/spacing/value used in multiple places
2. It's part of the design system and should be consistent
3. It might need to change globally in the future

### How to Add a New Value

1. **Open `constants/theme.ts`**

2. **Add to the appropriate category:**
```typescript
export const THEME = {
  colors: {
    // ... existing colors ...
    myNewColor: '#hexvalue', // Add your color with a descriptive name
  },
  // ... rest of theme ...
} as const;
```

3. **Document the color** (add a comment explaining its purpose):
```typescript
myNewColor: '#hexvalue', // Brief description of when to use
```

4. **Update this documentation** with the new value

### Naming Conventions

- Use semantic names: `error`, `success`, `warning` (not `red`, `green`, `yellow`)
- Use purpose-based names: `cardBg`, `sidebarBg` (not `darkGray1`, `darkGray2`)
- Use state suffixes: `primaryHover`, `errorHover` (for hover states)
- Use descriptive qualifiers: `textMuted`, `borderLight`

## Best Practices

### 1. Never Hard-Code Values

❌ **Wrong:**
```typescript
<div style={{ color: '#f5f5f5' }}>
```

✅ **Correct:**
```typescript
<div style={{ color: THEME.colors.text }}>
```

### 2. Use Spacing Constants

❌ **Wrong:**
```typescript
<div style={{ padding: '16px', margin: '8px' }}>
```

✅ **Correct:**
```typescript
<div style={{ 
  padding: THEME.spacing.lg, 
  margin: THEME.spacing.sm 
}}>
```

### 3. Use Typography Constants

❌ **Wrong:**
```typescript
<h1 style={{ 
  fontSize: '24px', 
  fontWeight: '600',
  fontFamily: 'Segoe UI, sans-serif'
}}>
```

✅ **Correct:**
```typescript
<h1 style={{ 
  fontSize: THEME.typography.fontSize.xl, 
  fontWeight: THEME.typography.fontWeight.semibold,
  fontFamily: THEME.typography.fontFamily
}}>
```

### 4. Consistent Border Radius

❌ **Wrong:**
```typescript
<div style={{ borderRadius: '8px' }}>
```

✅ **Correct:**
```typescript
<div style={{ borderRadius: THEME.borderRadius.lg }}>
```

### 5. Use Shadow Presets

❌ **Wrong:**
```typescript
<div style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
```

✅ **Correct:**
```typescript
<div style={{ boxShadow: THEME.shadows.md }}>
```

### 6. Transition Consistency

❌ **Wrong:**
```typescript
<button style={{ transition: 'all 0.3s ease' }}>
```

✅ **Correct:**
```typescript
<button style={{ transition: THEME.transitions.normal }}>
```

### 7. Z-Index Management

❌ **Wrong:**
```typescript
<div style={{ zIndex: 9999 }}>
```

✅ **Correct:**
```typescript
<div style={{ zIndex: THEME.zIndex.modal }}>
```

## Migration Guide

### Migrating Existing Components

If you encounter a component with hard-coded values, follow these steps:

#### Step 1: Import the Theme

```typescript
import { THEME } from '@/constants/theme';
```

#### Step 2: Identify Hard-Coded Values

Look for:
- Hex colors: `#3b82f6`, `#ffffff`
- RGB/RGBA: `rgba(0, 0, 0, 0.7)`
- Pixel values: `16px`, `24px`
- Font properties: `'Segoe UI'`, `600`

#### Step 3: Replace with Theme Constants

Create a mapping table:

| Hard-Coded Value | THEME Constant |
|------------------|----------------|
| `#1e1e1e` | `THEME.colors.background` |
| `#f5f5f5` | `THEME.colors.text` |
| `16px` | `THEME.spacing.lg` |
| `24px` | `THEME.spacing.xxl` |
| `600` | `THEME.typography.fontWeight.semibold` |

#### Step 4: Test the Component

Verify the component looks the same after migration.

### Example Migration

**Before:**
```typescript
const ArticleHistory = () => {
  const BACKGROUND_COLOR = '#FFFFFF';
  const TEXT_COLOR = '#000000';
  const BORDER_COLOR = '#E5E7EB';
  
  return (
    <div style={{
      backgroundColor: BACKGROUND_COLOR,
      color: TEXT_COLOR,
      border: `1px solid ${BORDER_COLOR}`,
      padding: '1.5rem',
      borderRadius: '0.5rem'
    }}>
      {/* content */}
    </div>
  );
};
```

**After:**
```typescript
import { THEME } from '@/constants/theme';

const ArticleHistory = () => {
  return (
    <div style={{
      backgroundColor: THEME.colors.cardBg,
      color: THEME.colors.text,
      border: `1px solid ${THEME.colors.border}`,
      padding: THEME.spacing.xxl,
      borderRadius: THEME.borderRadius.lg
    }}>
      {/* content */}
    </div>
  );
};
```

## Examples

### Complete Component Example

```typescript
'use client';

import React from 'react';
import { THEME } from '@/constants/theme';

interface CardProps {
  title: string;
  children: React.ReactNode;
}

export default function Card({ title, children }: CardProps) {
  return (
    <div style={{
      backgroundColor: THEME.colors.cardBg,
      border: `1px solid ${THEME.colors.border}`,
      borderRadius: THEME.borderRadius.lg,
      padding: THEME.spacing.xl,
      boxShadow: THEME.shadows.md,
      fontFamily: THEME.typography.fontFamily,
    }}>
      <h2 style={{
        fontSize: THEME.typography.fontSize.lg,
        fontWeight: THEME.typography.fontWeight.semibold,
        color: THEME.colors.text,
        marginBottom: THEME.spacing.md
      }}>
        {title}
      </h2>
      <div style={{
        fontSize: THEME.typography.fontSize.sm,
        color: THEME.colors.textMuted,
        lineHeight: THEME.typography.lineHeight.normal
      }}>
        {children}
      </div>
    </div>
  );
}
```

### Button with Hover States

```typescript
const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.backgroundColor = THEME.colors.primaryHover;
};

const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.backgroundColor = THEME.colors.primary;
};

<button
  style={{
    backgroundColor: THEME.colors.primary,
    color: THEME.colors.white,
    padding: `${THEME.spacing.sm} ${THEME.spacing.lg}`,
    borderRadius: THEME.borderRadius.md,
    border: 'none',
    fontSize: THEME.typography.fontSize.sm,
    fontWeight: THEME.typography.fontWeight.medium,
    cursor: 'pointer',
    transition: THEME.transitions.normal,
  }}
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
>
  Click Me
</button>
```

### Modal Overlay

```typescript
<div style={{
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: THEME.colors.overlay,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: THEME.zIndex.modal
}}>
  <div style={{
    backgroundColor: THEME.colors.cardBg,
    border: `1px solid ${THEME.colors.border}`,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.xxxl,
    boxShadow: THEME.shadows.xl
  }}>
    {/* Modal content */}
  </div>
</div>
```

## Common Patterns

### IDE-Style Layout (VS Code-like)

```typescript
// Top bar
<div style={{
  height: '48px',
  backgroundColor: THEME.colors.secondaryBg,
  borderBottom: `1px solid ${THEME.colors.border}`,
  padding: `0 ${THEME.spacing.lg}`
}}>

// Sidebar
<div style={{
  width: '250px',
  backgroundColor: THEME.colors.sidebarBg,
  borderRight: `1px solid ${THEME.colors.border}`
}}>

// Main content area
<div style={{
  flex: 1,
  backgroundColor: THEME.colors.background,
  color: THEME.colors.text
}}>
```

### Form Inputs

```typescript
<input
  type="text"
  style={{
    width: '100%',
    padding: THEME.spacing.md,
    fontSize: THEME.typography.fontSize.sm,
    border: `1px solid ${THEME.colors.border}`,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.background,
    color: THEME.colors.text,
    fontFamily: THEME.typography.fontFamily,
    outline: 'none'
  }}
/>
```

### Error/Warning Messages

```typescript
<div style={{
  padding: THEME.spacing.lg,
  backgroundColor: THEME.colors.errorBg,
  borderLeft: `4px solid ${THEME.colors.error}`,
  color: THEME.colors.error,
  borderRadius: THEME.borderRadius.md,
  fontSize: THEME.typography.fontSize.sm
}}>
  Error message here
</div>
```

## Troubleshooting

### Theme Not Updating

If theme changes don't appear:
1. Verify you imported from `@/constants/theme`
2. Check for hard-coded values overriding theme
3. Clear build cache and restart dev server

### Finding Hard-Coded Values

Use regex to find hard-coded values in your codebase:
```bash
# Find hex colors
grep -r "#[0-9a-fA-F]\{6\}" components/

# Find rgba values
grep -r "rgba(" components/

# Find pixel values (spacing)
grep -r "[0-9]\+px" components/
```

## Future Considerations

### Theme Switching

The current structure supports theme switching. To add a light theme:

1. Create a new theme object with light colors
2. Add theme context/provider
3. Switch between theme objects based on user preference

### CSS Variables

Consider migrating to CSS custom properties for better performance:

```css
:root {
  --color-primary: #3b82f6;
  --spacing-lg: 16px;
}
```

---

**Remember:** When in doubt, use the theme! Every hard-coded value is a potential inconsistency waiting to happen. Keep the theme as the single source of truth.

