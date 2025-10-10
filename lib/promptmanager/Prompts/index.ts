import type { PromptData } from '../types';
import { PromptArticleToJSON } from './PromptArticleToMermaid';
import { PromptApplyThemeToMermaid } from './PromptApplyThemeToMermaid';

/**
 * Central registry of all available prompts
 * Add new prompts here to make them available to the PromptManager
 */
export const ALL_PROMPTS: PromptData[] = [
  PromptArticleToJSON,
  PromptApplyThemeToMermaid
];

// Export individual prompts for direct access
export { PromptArticleToJSON, PromptApplyThemeToMermaid };

// Export theme template utilities
export { 
  generateThemePrompt, 
  validateThemeConfig, 
  DEFAULT_THEME_CONFIG,
  PRESET_THEMES,
  ORIENTATION_OPTIONS,
  type ThemeConfig,
  type FlowchartOrientation
} from './PromptThemeTemplate';

