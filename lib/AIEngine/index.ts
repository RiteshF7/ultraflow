/**
 * Main AI Engine - Abstract layer for AI models
 * This is the main entry point that exposes the askAI function
 */

import { AIFactory } from './AIFactory';
import { AIResponse, AIProvider, AIProviderConfig, ModelInfo, ModelSelection } from './types';

export class AIEngine {
  private static currentSelection: ModelSelection | null = null;


  /**
   * Set the current model selection
   */
  static setModelSelection(selection: ModelSelection): void {
    this.currentSelection = selection;
  }


  /**
   * Main function to ask AI - this is the primary interface
   * Uses Gemini as default provider
   */
  static async askAI(prompt: string, options?: {
    provider?: AIProvider;
    apiKey?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<AIResponse> {
    try {
      console.log('🟡 AIEngine.askAI called');
      console.log('🟡 Options:', { 
        provider: options?.provider,
        model: options?.model,
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
        apiKeyPresent: !!options?.apiKey
      });
      
      // Use Gemini as default provider
      const provider = options?.provider || 'gemini';
      const apiKey = options?.apiKey || process.env.GEMINI_API_KEY || '';

      if (!apiKey) {
        console.error('❌ No API key provided');
        return {
          text: '',
          success: false,
          error: 'API key is required. Please provide apiKey in options or set GEMINI_API_KEY environment variable.'
        };
      }

      // Get provider instance
      console.log('🟡 Getting provider instance:', provider);
      const providerInstance = AIFactory.getProvider(provider);
      if (!providerInstance) {
        console.error('❌ Provider not available:', provider);
        return {
          text: '',
          success: false,
          error: `Provider ${provider} is not available`
        };
      }

      // Create config with required API key
      // Each request gets fresh token allocation - no carryover between requests
      const config: AIProviderConfig = {
        apiKey,
        model: options?.model || 'gemini-2.5-flash', // Default model
        temperature: options?.temperature || 0.7,
        maxTokens: options?.maxTokens || 8192  // Fresh 8192 tokens for every request
      };

      console.log('🟡 Config created:', {
        model: config.model,
        temperature: config.temperature,
        maxTokens: config.maxTokens
      });

      // Validate config
      if (!providerInstance.validateConfig(config)) {
        console.error('❌ Invalid config for provider:', provider);
        return {
          text: '',
          success: false,
          error: `Invalid configuration for ${provider} provider`
        };
      }

      console.log('🟡 Calling providerInstance.askAI...');
      const result = await providerInstance.askAI(prompt, config);
      console.log('🟡 Provider returned:', {
        success: result.success,
        textLength: result.text?.length || 0,
        error: result.error
      });
      
      return result;
    } catch (error) {
      console.error('❌ AI Engine Error:', error);
      return {
        text: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get all available models from all providers
   */
  static async getAvailableModels(): Promise<ModelInfo[]> {
    return await AIFactory.getAllAvailableModels();
  }

  /**
   * Get models for a specific provider
   */
  static async getModelsForProvider(provider: AIProvider): Promise<ModelInfo[]> {
    return await AIFactory.getModelsForProvider(provider);
  }

  /**
   * Get available providers
   */
  static getAvailableProviders(): AIProvider[] {
    return AIFactory.getAvailableProviders();
  }

  /**
   * Set default provider
   */
  static setDefaultProvider(provider: AIProvider): void {
    AIFactory.setDefaultProvider(provider);
  }

  /**
   * Get default provider
   */
  static getDefaultProvider(): AIProvider {
    return AIFactory.getDefaultProvider();
  }
}

// Export the main askAI function for easy access
export const askAI = AIEngine.askAI.bind(AIEngine);

// Export configuration utilities
export {
  AIEngineConfig,
  getProviderConfig,
  getDefaultConfig,
  getDefaultProvider,
  updateProviderConfig,
  setDefaultProvider,
  getAllProviderConfigs,
  resetProviderConfig
} from './config';

// Export types for external use
export type { AIResponse, AIProvider, AIProviderConfig, ModelInfo, ModelSelection } from './types';
export type { ProviderConfig, AIEngineConfigType } from './config';
