/**
 * Type definitions for Prompt Manager
 */

/**
 * Prompt data structure as stored in JSON files
 */
export interface PromptData {
  id: string;
  name: string;
  description: string;
  prompt: string;
}

/**
 * Prompt metadata (without the full prompt text)
 */
export interface PromptMetadata {
  id: string;
  name: string;
  description: string;
}

/**
 * Variables object for prompt template replacement
 */
export interface PromptVariables {
  [key: string]: string | number | boolean;
}

/**
 * Options for executing a prompt
 */
export interface ExecutePromptOptions {
  /** Variables to replace in the prompt template */
  variables?: PromptVariables;
  /** Text to prepend to the prompt */
  prependText?: string;
  /** Text to append to the prompt */
  appendText?: string;
  /** AI provider to use (default: 'gemini') */
  provider?: string;
  /** Additional AI configuration */
  aiConfig?: AIConfig;
}

/**
 * AI Engine configuration options
 */
export interface AIConfig {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  [key: string]: any;
}

