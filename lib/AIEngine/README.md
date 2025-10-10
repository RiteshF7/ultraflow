# AI Engine - Universal AI Provider Interface

A clean, extensible TypeScript library that provides a unified interface for multiple AI providers. Currently supports Google Gemini with easy extensibility for additional providers.

## 🚀 Quick Start

```typescript
import { askAI } from '@/lib/AIEngine';

// Simple usage - Gemini as default provider
const response = await askAI('What is the capital of France?');

if (response.success) {
  console.log(response.text);
} else {
  console.error(response.error);
}
```

## 📋 Table of Contents

- [Core Capabilities](#core-capabilities)
- [API Reference](#api-reference)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Usage Examples](#usage-examples)
- [Extending the Engine](#extending-the-engine)
- [Error Handling](#error-handling)
- [Environment Setup](#environment-setup)

## 🔧 Core Capabilities

### Primary Functions

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `askAI()` | Main AI interaction function | `prompt: string, options?: AIOptions` | `Promise<AIResponse>` |
| `AIEngine.askAI()` | Class-based AI interaction | `prompt: string, options?: AIOptions` | `Promise<AIResponse>` |
| `AIEngine.getAvailableModels()` | Get all available models | None | `Promise<ModelInfo[]>` |
| `AIEngine.getModelsForProvider()` | Get models for specific provider | `provider: AIProvider` | `Promise<ModelInfo[]>` |
| `AIEngine.setModelSelection()` | Set persistent model configuration | `selection: ModelSelection` | `void` |
| `AIEngine.getAvailableProviders()` | Get list of available providers | None | `AIProvider[]` |
| `AIEngine.setDefaultProvider()` | Set default provider | `provider: AIProvider` | `void` |
| `AIEngine.getDefaultProvider()` | Get current default provider | None | `AIProvider` |

### Supported Providers

- **Google Gemini** (Primary) - Full implementation with model discovery
- **Future Providers** - Extensible architecture for Claude, OpenAI, Anthropic

### Response Format

All functions return a standardized `AIResponse`:

```typescript
interface AIResponse {
  text: string;           // Generated AI response text
  success: boolean;       // Whether the request succeeded
  error?: string;         // Error message if failed
  model?: string;         // Model used for generation
  usage?: {               // Token usage information
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}
```

## 📚 API Reference

### Core Interface

```typescript
// Main function for AI interactions
export function askAI(prompt: string, options?: {
  provider?: AIProvider;      // Override default provider
  apiKey?: string;           // Override API key
  model?: string;            // Specific model to use
  temperature?: number;      // Creativity level (0-2)
  maxTokens?: number;        // Maximum response length
}): Promise<AIResponse>

// Class-based interface with additional methods
export class AIEngine {
  static askAI(prompt: string, options?: AIOptions): Promise<AIResponse>
  static getAvailableModels(): Promise<ModelInfo[]>
  static getModelsForProvider(provider: AIProvider): Promise<ModelInfo[]>
  static setModelSelection(selection: ModelSelection): void
  static getAvailableProviders(): AIProvider[]
  static setDefaultProvider(provider: AIProvider): void
  static getDefaultProvider(): AIProvider
}
```

### Type Definitions

```typescript
type AIProvider = 'gemini' | 'claude' | 'openai' | 'anthropic';

interface AIProviderConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface ModelInfo {
  id: string;
  name: string;
  displayName: string;
  provider: AIProvider;
  modelType: string;
  description?: string;
  maxTokens?: number;
  supportedFeatures: string[];
}

interface ModelSelection {
  provider: AIProvider;
  modelId: string;
  config: AIProviderConfig;
}
```

## 🏗️ Architecture

### Component Structure

```
AIEngine (Main Interface)
├── AIFactory (Provider Management)
├── BaseAIProvider (Abstract Base Class)
└── Providers/
    ├── GeminiProvider (Google Gemini Implementation)
    └── [Future Providers]
```

### Core Components

1. **AIEngine** (`index.ts`) - Main interface and entry point
2. **AIFactory** (`AIFactory.ts`) - Provider registration and management
3. **BaseAIProvider** (`BaseAIProvider.ts`) - Abstract base class for all providers
4. **Types** (`types.ts`) - TypeScript interfaces and type definitions
5. **GeminiProvider** (`providers/GeminiProvider.ts`) - Google Gemini implementation

### Design Patterns

- **Factory Pattern** - AIFactory manages provider instances
- **Strategy Pattern** - Different providers implement the same interface
- **Singleton Pattern** - Single instance of each provider
- **Abstract Factory** - BaseAIProvider defines common interface

## ⚙️ Configuration

### Environment Variables

**Client-side (Next.js):**
```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

**Server-side:**
```bash
GEMINI_API_KEY=your_gemini_api_key
```

### Programmatic Configuration

```typescript
// Set model selection for persistent configuration
AIEngine.setModelSelection({
  provider: 'gemini',
  modelId: 'gemini-1.5-flash-001',
  config: {
    apiKey: 'your-api-key',
    model: 'gemini-1.5-flash-001',
    temperature: 0.8,
    maxTokens: 1024
  }
});

// Set default provider
AIEngine.setDefaultProvider('gemini');
```

### Web Configuration Interface

Visit `/model-config` for a web-based configuration interface that allows:
- Provider and model selection
- API key configuration
- Parameter tuning (temperature, max tokens)
- Connection testing
- Configuration persistence

## 💡 Usage Examples

### Basic Usage

```typescript
import { askAI } from '@/lib/AIEngine';

// Simple question
const response = await askAI('What is machine learning?');

if (response.success) {
  console.log('Answer:', response.text);
  console.log('Model used:', response.model);
  console.log('Tokens used:', response.usage?.totalTokens);
} else {
  console.error('Error:', response.error);
}
```

### Advanced Usage

```typescript
import { AIEngine } from '@/lib/AIEngine';

// Custom configuration
const response = await AIEngine.askAI('Write a creative story', {
  model: 'gemini-1.5-pro',
  temperature: 1.2,
  maxTokens: 2000
});

// Get available models
const models = await AIEngine.getAvailableModels();
console.log('Available models:', models.map(m => m.displayName));

// Provider-specific models
const geminiModels = await AIEngine.getModelsForProvider('gemini');
```

### Error Handling

```typescript
try {
  const response = await askAI('Test prompt');
  
  if (!response.success) {
    // Handle API errors
    console.error('AI request failed:', response.error);
    
    // Check specific error types
    if (response.error?.includes('API key')) {
      // Handle authentication error
    } else if (response.error?.includes('rate limit')) {
      // Handle rate limiting
    }
    return null;
  }
  
  return response.text;
} catch (error) {
  // Handle unexpected errors
  console.error('Unexpected error:', error);
  return null;
}
```

### Model Discovery

```typescript
// Get all available models
const allModels = await AIEngine.getAvailableModels();

// Filter by provider
const geminiModels = allModels.filter(m => m.provider === 'gemini');

// Find specific model
const proModel = allModels.find(m => m.id.includes('pro'));

// Display model information
geminiModels.forEach(model => {
  console.log(`${model.displayName}: ${model.description}`);
  console.log(`Max tokens: ${model.maxTokens}`);
  console.log(`Features: ${model.supportedFeatures.join(', ')}`);
});
```

## 🔌 Extending the Engine

### Adding a New Provider

1. **Create Provider Class:**

```typescript
// providers/ClaudeProvider.ts
import { BaseAIProvider } from '../BaseAIProvider';
import { AIResponse, ModelInfo, AIProviderConfig } from '../types';

export class ClaudeProvider extends BaseAIProvider {
  constructor() {
    super('claude', 'Anthropic Claude');
  }

  async askAI(prompt: string, options?: AIProviderConfig): Promise<AIResponse> {
    // Implementation for Claude API
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${options?.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: options?.model || 'claude-3-sonnet-20240229',
          max_tokens: options?.maxTokens || 1024,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      const data = await response.json();
      
      return this.createSuccessResponse(
        data.content[0].text,
        options?.model,
        {
          promptTokens: data.usage?.input_tokens,
          completionTokens: data.usage?.output_tokens,
          totalTokens: data.usage?.input_tokens + data.usage?.output_tokens
        }
      );
    } catch (error) {
      return this.createErrorResponse(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  async getAvailableModels(): Promise<ModelInfo[]> {
    // Return Claude models
    return [
      {
        id: 'claude-3-sonnet-20240229',
        name: 'claude-3-sonnet-20240229',
        displayName: 'Claude 3 Sonnet',
        provider: 'claude',
        modelType: 'claude-3-sonnet',
        description: 'Balanced performance and speed',
        maxTokens: 200000,
        supportedFeatures: ['text-generation', 'reasoning']
      }
    ];
  }

  validateConfig(config: AIProviderConfig): boolean {
    return this.validateRequiredFields(config, ['apiKey']);
  }
}
```

2. **Register Provider:**

```typescript
// In AIFactory.ts
import { ClaudeProvider } from './providers/ClaudeProvider';

// Register the provider
AIFactory.registerProvider('claude', new ClaudeProvider());
```

3. **Update Types:**

```typescript
// In types.ts - already includes 'claude' in AIProvider type
export type AIProvider = 'gemini' | 'claude' | 'openai' | 'anthropic';
```

### Provider Interface Requirements

All providers must implement three core methods:

- `askAI(prompt, options)` - Generate AI response
- `getAvailableModels()` - Return available models
- `validateConfig(config)` - Validate provider configuration

## 🚨 Error Handling

### Error Types

| Error Type | Description | Common Causes |
|------------|-------------|---------------|
| **API Key Error** | Missing or invalid API key | `API key is required` |
| **Provider Error** | Provider not available | `Provider not registered` |
| **Config Error** | Invalid configuration | `Invalid configuration for provider` |
| **API Error** | External API failure | Network issues, rate limits |
| **Model Error** | Model not found | Invalid model name |

### Error Response Format

```typescript
{
  text: '',
  success: false,
  error: 'Descriptive error message',
  model?: 'model-name'
}
```

### Best Practices

1. **Always check `response.success`** before using `response.text`
2. **Handle specific error types** for better user experience
3. **Log errors** for debugging purposes
4. **Provide fallback behavior** when possible
5. **Validate configuration** before making requests

## 🌍 Environment Setup

### Development Setup

1. **Install dependencies:**
```bash
npm install @google/generative-ai
```

2. **Set environment variables:**
```bash
# .env.local
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

3. **Import and use:**
```typescript
import { askAI } from '@/lib/AIEngine';
```

### Production Considerations

- **API Key Security**: Use environment variables, never hardcode keys
- **Rate Limiting**: Implement appropriate delays between requests
- **Error Monitoring**: Log errors for production debugging
- **Caching**: Consider caching responses for repeated queries
- **Cost Management**: Monitor token usage and implement limits

### Testing

```typescript
// Test basic functionality
const response = await askAI('Hello, world!');
console.assert(response.success, 'Basic request should succeed');

// Test error handling
const errorResponse = await askAI('test', { apiKey: 'invalid' });
console.assert(!errorResponse.success, 'Invalid API key should fail');
```

## 🔄 Migration Guide

### From Previous Versions

If migrating from a previous version:

1. **Update imports** - Use the new import structure
2. **Update configuration** - Use new `ModelSelection` interface
3. **Update error handling** - Check for new error response format
4. **Remove deprecated methods** - `initialize()` and `getCurrentSelection()` removed

### Breaking Changes

- Removed `initialize()` method (not used)
- Removed `getCurrentSelection()` method (not used)
- Simplified `AIProviderConfig` (removed unused fields)
- Removed `AIEngineConfig` interface (not implemented)

## 📈 Performance Considerations

- **Provider Initialization**: Providers are initialized lazily
- **Model Caching**: Model lists are cached per session
- **Connection Pooling**: HTTP connections are reused when possible
- **Token Usage**: Monitor and optimize token consumption

## 🔮 Roadmap

### Planned Features

- [ ] **Additional Providers**: Claude, OpenAI, Anthropic implementations
- [ ] **Streaming Support**: Real-time response streaming
- [ ] **Conversation Memory**: Multi-turn conversation support
- [ ] **Rate Limiting**: Built-in rate limiting and backoff
- [ ] **Health Checks**: Provider health monitoring
- [ ] **Usage Analytics**: Token usage tracking and reporting
- [ ] **Plugin System**: Extensible plugin architecture

### Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests for new functionality
5. Update documentation
6. Submit a pull request

---

## 📞 Support

For questions, issues, or contributions:

- **Documentation**: This README
- **Examples**: See `example.ts` for usage patterns
- **Configuration**: Visit `/model-config` for web interface
- **Issues**: Create GitHub issues for bugs or feature requests

---

*This AI Engine provides a clean, extensible foundation for integrating multiple AI providers into your applications. The unified interface ensures consistent behavior across different AI services while maintaining the flexibility to leverage provider-specific features.*