/**
 * Common types and interfaces for AI models
 */

export interface AIResponse {
  text: string;
  success: boolean;
  error?: string;
  model?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface ModelInfo {
  id: string;
  name: string;
  displayName: string;
  provider: AIProvider;
  modelType: string;
  description?: string;
  maxTokens?: number;
  supportedFeatures: string[];
}


export interface AIProviderConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}


export type AIProvider = 'gemini' | 'claude' | 'openai' | 'anthropic';

export interface AIProviderInterface {
  readonly provider: AIProvider;
  readonly name: string;
  
  // Core methods
  askAI(prompt: string, options?: AIProviderConfig): Promise<AIResponse>;
  getAvailableModels(): Promise<ModelInfo[]>;
  validateConfig(config: AIProviderConfig): boolean;
}

export interface ModelSelection {
  provider: AIProvider;
  modelId: string;
  config: AIProviderConfig;
}

