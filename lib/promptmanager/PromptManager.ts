import { AIEngine, getProviderConfig, getDefaultProvider } from '../AIEngine';
import { ALL_PROMPTS } from './Prompts';
import type { 
  PromptData, 
  PromptMetadata, 
  PromptVariables, 
  ExecutePromptOptions 
} from './types';

/**
 * PromptManager - Manages prompt templates and executes them using AI Engine
 */
class PromptManager {
  private promptsCache: Map<string, PromptData>;

  constructor() {
    this.promptsCache = new Map();
    this._loadPrompts();
  }

  /**
   * Load all prompts from the registry
   * @private
   */
  private _loadPrompts(): void {
    if (this.promptsCache.size > 0) {
      return; // Already loaded
    }

    try {
      ALL_PROMPTS.forEach(promptData => {
        if (promptData.id) {
          this.promptsCache.set(promptData.id, promptData);
        }
      });
    } catch (error) {
      console.error('Error loading prompts:', error);
      throw new Error(`Failed to load prompts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a prompt by its ID
   * @param id - The prompt ID
   * @returns The prompt data object
   */
  getPromptById(id: string): PromptData {
    this._loadPrompts();
    
    const prompt = this.promptsCache.get(id);
    if (!prompt) {
      throw new Error(`Prompt with ID "${id}" not found`);
    }
    
    return { ...prompt }; // Return a copy to prevent mutation
  }

  /**
   * Get the prompt text by ID
   * @param id - The prompt ID
   * @returns The prompt text
   */
  getPromptText(id: string): string {
    const promptData = this.getPromptById(id);
    return promptData.prompt;
  }

  /**
   * Append text to a prompt
   * @param prompt - The original prompt text
   * @param text - The text to append
   * @returns The modified prompt
   */
  appendToPrompt(prompt: string, text: string): string {
    if (typeof prompt !== 'string' || typeof text !== 'string') {
      throw new Error('Both prompt and text must be strings');
    }
    return prompt + '\n\n' + text;
  }

  /**
   * Prepend text to a prompt
   * @param prompt - The original prompt text
   * @param text - The text to prepend
   * @returns The modified prompt
   */
  prependToPrompt(prompt: string, text: string): string {
    if (typeof prompt !== 'string' || typeof text !== 'string') {
      throw new Error('Both prompt and text must be strings');
    }
    return text + '\n\n' + prompt;
  }

  /**
   * Replace variables in prompt template
   * Supports simple variables {{varName}} and conditional blocks {{#if varName}}...{{/if}}
   * @param prompt - The prompt template
   * @param variables - Key-value pairs for variable replacement
   * @returns The prompt with variables replaced
   */
  replaceVariables(prompt: string, variables: PromptVariables = {}): string {
    let result = prompt;
    
    // First, handle conditional blocks {{#if varName}}...{{/if}}
    Object.keys(variables).forEach(key => {
      const value = variables[key];
      const ifBlockRegex = new RegExp(
        `\\{\\{#if\\s+${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}\\}([\\s\\S]*?)\\{\\{/if\\}\\}`,
        'g'
      );
      
      // If value is truthy and not empty string, include the block content
      // Otherwise, remove the entire block
      if (value && String(value).trim().length > 0) {
        result = result.replace(ifBlockRegex, '$1');
      } else {
        result = result.replace(ifBlockRegex, '');
      }
    });
    
    // Then, replace simple variable placeholders {{varName}}
    Object.keys(variables).forEach(key => {
      const placeholder = `{{${key}}}`;
      const value = String(variables[key]);
      result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
    });
    
    return result;
  }

  /**
   * Execute a prompt using the AI Engine
   * @param promptIdOrText - The prompt ID or direct prompt text
   * @param options - Execution options
   * @returns The AI response
   */
  async executePrompt(
    promptIdOrText: string, 
    options: ExecutePromptOptions = {}
  ): Promise<string> {
    const {
      variables = {},
      prependText = '',
      appendText = '',
      provider,
      aiConfig = {}
    } = options;

    // Determine which provider to use
    const selectedProvider = provider || getDefaultProvider();
    
    // Get centralized config for the provider and merge with custom aiConfig
    // Each request gets fresh token allocation from config (8192 for Gemini)
    const providerConfig = getProviderConfig(selectedProvider as any);
    const finalConfig = {
      apiKey: aiConfig.apiKey || providerConfig.apiKey,
      model: aiConfig.model || providerConfig.model,
      temperature: aiConfig.temperature ?? providerConfig.temperature,
      maxTokens: aiConfig.maxTokens || providerConfig.maxTokens  // Uses 8192 from config
    };

    let promptText: string;

    // Check if it's a prompt ID or direct text
    try {
      promptText = this.getPromptText(promptIdOrText);
    } catch (error) {
      // If not found as ID, treat as direct prompt text
      promptText = promptIdOrText;
    }

    // Replace variables
    if (Object.keys(variables).length > 0) {
      promptText = this.replaceVariables(promptText, variables);
    }

    // Prepend text if provided
    if (prependText) {
      promptText = this.prependToPrompt(promptText, prependText);
    }

    // Append text if provided
    if (appendText) {
      promptText = this.appendToPrompt(promptText, appendText);
    }

    // Execute using AI Engine with centralized config
    try {
      console.log('🟢 PromptManager.executePrompt - calling AIEngine.askAI');
      console.log('🟢 Final prompt length:', promptText.length);
      console.log('🟢 Final config:', {
        provider: selectedProvider,
        model: finalConfig.model,
        temperature: finalConfig.temperature,
        maxTokens: finalConfig.maxTokens,
        apiKeyPresent: !!finalConfig.apiKey
      });
      
      const response = await AIEngine.askAI(promptText, {
        provider: selectedProvider as any,
        apiKey: finalConfig.apiKey,
        model: finalConfig.model,
        temperature: finalConfig.temperature,
        maxTokens: finalConfig.maxTokens
      });

      console.log('🟢 AIEngine.askAI response received:', {
        success: response.success,
        textLength: response.text?.length || 0,
        error: response.error
      });

      if (!response.success) {
        console.error('❌ AI request failed:', response.error);
        throw new Error(response.error || 'AI request failed');
      }

      console.log('🟢 Returning response text, length:', response.text.length);
      return response.text;
    } catch (error) {
      console.error('❌ Error executing prompt:', error);
      throw new Error(`Failed to execute prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List all available prompts
   * @returns Array of prompt metadata (id, name, description)
   */
  listPrompts(): PromptMetadata[] {
    this._loadPrompts();
    
    return Array.from(this.promptsCache.values()).map(prompt => ({
      id: prompt.id,
      name: prompt.name,
      description: prompt.description
    }));
  }

  /**
   * Clear the prompts cache (useful for reloading)
   */
  clearCache(): void {
    this.promptsCache.clear();
  }

  /**
   * Check if a prompt exists by ID
   * @param id - The prompt ID
   * @returns True if the prompt exists
   */
  hasPrompt(id: string): boolean {
    this._loadPrompts();
    return this.promptsCache.has(id);
  }

  /**
   * Get the number of loaded prompts
   * @returns The count of loaded prompts
   */
  getPromptCount(): number {
    this._loadPrompts();
    return this.promptsCache.size;
  }
}

// Export singleton instance
export const promptManager = new PromptManager();

// Also export the class for custom instances
export { PromptManager };
export type { PromptData, PromptMetadata, PromptVariables, ExecutePromptOptions };

