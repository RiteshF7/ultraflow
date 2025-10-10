/**
 * AI Factory for creating and managing AI providers
 */

import { AIProviderInterface, AIProvider, AIProviderConfig, ModelInfo } from './types';
import { GeminiProvider } from './providers/GeminiProvider';

export class AIFactory {
  private static providers: Map<AIProvider, AIProviderInterface> = new Map();
  private static defaultProvider: AIProvider = 'gemini';

  /**
   * Register a provider
   */
  static registerProvider(provider: AIProvider, instance: AIProviderInterface): void {
    this.providers.set(provider, instance);
  }

  /**
   * Get a provider instance
   */
  static getProvider(provider: AIProvider): AIProviderInterface | null {
    return this.providers.get(provider) || null;
  }

  /**
   * Get all registered providers
   */
  static getAllProviders(): AIProviderInterface[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get available providers
   */
  static getAvailableProviders(): AIProvider[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Set default provider
   */
  static setDefaultProvider(provider: AIProvider): void {
    if (this.providers.has(provider)) {
      this.defaultProvider = provider;
    } else {
      throw new Error(`Provider ${provider} is not registered`);
    }
  }

  /**
   * Get default provider
   */
  static getDefaultProvider(): AIProvider {
    return this.defaultProvider;
  }


  /**
   * Get all available models from all providers
   */
  static async getAllAvailableModels(): Promise<ModelInfo[]> {
    const allModels: ModelInfo[] = [];
    
    for (const provider of Array.from(this.providers.values())) {
      try {
        const models = await provider.getAvailableModels();
        allModels.push(...models);
      } catch (error) {
        console.error(`Failed to get models from ${provider.name}:`, error);
      }
    }
    
    return allModels;
  }

  /**
   * Get models for a specific provider
   */
  static async getModelsForProvider(provider: AIProvider): Promise<ModelInfo[]> {
    const providerInstance = this.providers.get(provider);
    if (!providerInstance) {
      throw new Error(`Provider ${provider} is not registered`);
    }
    
    return await providerInstance.getAvailableModels();
  }
}

// Initialize default providers
AIFactory.registerProvider('gemini', new GeminiProvider());
