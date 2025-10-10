/**
 * Gemini AI Provider Implementation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseAIProvider } from '../BaseAIProvider';
import { 
  AIResponse, 
  ModelInfo, 
  AIProviderConfig,
  AIProvider 
} from '../types';

export class GeminiProvider extends BaseAIProvider {
  private currentModel: string = 'gemini-2.5-flash';

  constructor() {
    super('gemini', 'Google Gemini');
  }

  validateConfig(config: AIProviderConfig): boolean {
    return this.validateRequiredFields(config, ['apiKey']);
  }

  async getAvailableModels(): Promise<ModelInfo[]> {
    try {
      // Get API key from environment if not configured
      const apiKey = this.config?.apiKey || process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error('Gemini API key is required. Set GEMINI_API_KEY environment variable or configure the provider.');
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.models || !Array.isArray(data.models)) {
        throw new Error('Invalid response format from models API');
      }

      return data.models
        .filter((model: any) => model.supportedGenerationMethods?.includes('generateContent'))
        .map((model: any) => ({
          id: model.name,
          name: model.name,
          displayName: model.displayName || model.name,
          provider: 'gemini' as AIProvider,
          modelType: model.name, // Use the actual model name from API
          description: model.description,
          maxTokens: model.inputTokenLimit,
          supportedFeatures: model.supportedGenerationMethods || []
        }));
    } catch (error) {
      console.error('Error fetching Gemini models:', error);
      throw error;
    }
  }


  async askAI(prompt: string, options?: AIProviderConfig): Promise<AIResponse> {
    try {
      console.log('🔵 GeminiProvider.askAI called');
      console.log('🔵 Prompt length:', prompt.length);
      console.log('🔵 Prompt preview:', prompt.substring(0, 200));
      
      if (!options) {
        console.error('❌ No options provided');
        return this.createErrorResponse('Configuration options are required');
      }

      // Use the provided config directly
      const config = options;
      console.log('🔵 Config:', { 
        model: config.model, 
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        apiKeyPresent: !!config.apiKey 
      });
      
      // Always create a fresh instance to avoid state issues
      // This ensures clean state for each request with fresh token allocation
      const genAI = new GoogleGenerativeAI(config.apiKey);
      console.log('🔵 GoogleGenerativeAI instance created (fresh for this request)');

      // Ensure maximum tokens for each request - no token sharing between requests
      const maxTokensForRequest = config.maxTokens || 8192;
      
      const model = genAI.getGenerativeModel({ 
        model: config.model || this.currentModel,
        generationConfig: {
          temperature: config.temperature || 0.7,
          maxOutputTokens: maxTokensForRequest,  // Fresh token allocation per request
        }
      });
      console.log('🔵 Model instance created:', config.model || this.currentModel);
      console.log('🔵 Max output tokens for this request:', maxTokensForRequest);

      console.log('🔵 Calling generateContent...');
      const result = await model.generateContent(prompt);
      console.log('🔵 generateContent completed');
      
      const response = await result.response;
      console.log('🔵 Response object:', {
        candidates: response.candidates?.length,
        usageMetadata: response.usageMetadata
      });
      
      const text = response.text();
      console.log('🔵 Response text length:', text?.length || 0);
      console.log('🔵 Response text preview:', text?.substring(0, 300));

      return this.createSuccessResponse(text, config.model || this.currentModel, {
        promptTokens: result.response.usageMetadata?.promptTokenCount,
        completionTokens: result.response.usageMetadata?.candidatesTokenCount,
        totalTokens: result.response.usageMetadata?.totalTokenCount
      });
    } catch (error) {
      console.error('❌ Gemini API Error:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined
      });
      return this.createErrorResponse(
        error instanceof Error ? error.message : 'Unknown error occurred',
        options?.model || this.currentModel
      );
    }
  }

}
