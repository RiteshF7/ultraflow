/**
 * Centralized AI Engine Configuration
 * Single source of truth for all AI provider settings
 */

export interface ProviderConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  apiKey?: string;
}

export interface AIEngineConfigType {
  defaultProvider: 'gemini' | 'openai' | 'claude' | 'anthropic';
  
  providers: {
    gemini: ProviderConfig;
    openai: ProviderConfig;
    claude: ProviderConfig;
    anthropic: ProviderConfig;
  };
}

/**
 * Global AI Engine Configuration
 * Modify this to change default settings across your application
 */
export const AIEngineConfig: AIEngineConfigType = {
  // Default provider used when none is specified
  defaultProvider: 'gemini',
  
  // Provider-specific configurations
  providers: {
    gemini: {
      model: 'gemini-2.5-flash',
      temperature: 0.7,
      maxTokens: 18192,  // Increased from 2048 to 8192 for flowchart generation
      apiKey: process.env.GEMINI_API_KEY
    },
    openai: {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 4096,  // Increased from 2048 to 4096
      apiKey: process.env.OPENAI_API_KEY
    },
    claude: {
      model: 'claude-3-sonnet-20240229',
      temperature: 0.7,
      maxTokens: 4096,  // Increased from 2048 to 4096
      apiKey: process.env.CLAUDE_API_KEY
    },
    anthropic: {
      model: 'claude-3-opus-20240229',
      temperature: 0.7,
      maxTokens: 4096,  // Increased from 2048 to 4096
      apiKey: process.env.ANTHROPIC_API_KEY
    }
  }
};

/**
 * Get configuration for a specific provider
 * Returns a copy to prevent accidental mutations
 * @param provider - The AI provider name
 * @returns Provider configuration object
 */
export function getProviderConfig(provider: keyof AIEngineConfigType['providers']): ProviderConfig {
  return { ...AIEngineConfig.providers[provider] };
}

/**
 * Get the default provider's configuration
 * @returns Default provider configuration
 */
export function getDefaultConfig(): ProviderConfig {
  return getProviderConfig(AIEngineConfig.defaultProvider);
}

/**
 * Get the current default provider name
 * @returns Current default provider
 */
export function getDefaultProvider(): keyof AIEngineConfigType['providers'] {
  return AIEngineConfig.defaultProvider;
}

/**
 * Update configuration for a specific provider
 * @param provider - The AI provider to update
 * @param updates - Partial configuration to merge
 */
export function updateProviderConfig(
  provider: keyof AIEngineConfigType['providers'],
  updates: Partial<ProviderConfig>
): void {
  AIEngineConfig.providers[provider] = {
    ...AIEngineConfig.providers[provider],
    ...updates
  };
}

/**
 * Set the default provider
 * @param provider - The provider to set as default
 */
export function setDefaultProvider(provider: keyof AIEngineConfigType['providers']): void {
  AIEngineConfig.defaultProvider = provider;
}

/**
 * Get all provider configurations
 * @returns All provider configs
 */
export function getAllProviderConfigs(): AIEngineConfigType['providers'] {
  return {
    gemini: { ...AIEngineConfig.providers.gemini },
    openai: { ...AIEngineConfig.providers.openai },
    claude: { ...AIEngineConfig.providers.claude },
    anthropic: { ...AIEngineConfig.providers.anthropic }
  };
}

/**
 * Reset a provider to default configuration
 * @param provider - The provider to reset
 */
export function resetProviderConfig(provider: keyof AIEngineConfigType['providers']): void {
  const defaults: Record<string, ProviderConfig> = {
    gemini: {
      model: 'gemini-2.5-flash',
      temperature: 0.7,
      maxTokens: 8192,  // Increased from 2048 to 8192 for flowchart generation
      apiKey: process.env.GEMINI_API_KEY
    },
    openai: {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 4096,  // Increased from 2048 to 4096
      apiKey: process.env.OPENAI_API_KEY
    },
    claude: {
      model: 'claude-3-sonnet-20240229',
      temperature: 0.7,
      maxTokens: 4096,  // Increased from 2048 to 4096
      apiKey: process.env.CLAUDE_API_KEY
    },
    anthropic: {
      model: 'claude-3-opus-20240229',
      temperature: 0.7,
      maxTokens: 4096,  // Increased from 2048 to 4096
      apiKey: process.env.ANTHROPIC_API_KEY
    }
  };

  AIEngineConfig.providers[provider] = defaults[provider];
}

