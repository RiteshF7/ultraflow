/**
 * Abstract base class for AI providers
 */

import { 
  AIProviderInterface, 
  AIResponse, 
  ModelInfo, 
  AIProviderConfig,
  AIProvider 
} from './types';

export abstract class BaseAIProvider implements AIProviderInterface {
  protected config: AIProviderConfig | null = null;

  constructor(
    public readonly provider: AIProvider,
    public readonly name: string
  ) {}

  // Abstract methods that must be implemented by concrete providers
  abstract askAI(prompt: string, options?: AIProviderConfig): Promise<AIResponse>;
  abstract getAvailableModels(): Promise<ModelInfo[]>;
  abstract validateConfig(config: AIProviderConfig): boolean;

  // Helper method to merge options with default config
  protected mergeConfig(options?: AIProviderConfig): AIProviderConfig {
    if (!this.config) {
      throw new Error('Provider not configured');
    }
    return {
      ...this.config,
      ...options
    };
  }

  // Helper method to create error response
  protected createErrorResponse(error: string, model?: string): AIResponse {
    return {
      text: '',
      success: false,
      error,
      model
    };
  }

  // Helper method to create success response
  protected createSuccessResponse(text: string, model?: string, usage?: AIResponse['usage']): AIResponse {
    return {
      text,
      success: true,
      model,
      usage
    };
  }

  // Helper method to validate required fields
  protected validateRequiredFields(config: AIProviderConfig, requiredFields: string[]): boolean {
    return requiredFields.every(field => {
      const value = (config as any)[field];
      return value !== undefined && value !== null && value !== '';
    });
  }
}
