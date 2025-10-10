# capabilities.md

## Module: /lib/AIEngine

### 🧩 Capabilities
- [x] Handles AI provider abstraction and management
- [x] Exposes `AIEngine.askAI()` for unified AI text generation across multiple providers
- [x] Supports multiple AI providers: Gemini (default), OpenAI, Claude, Anthropic
- [x] Provides model discovery and validation via `getAvailableModels()` and `getModelsForProvider()`
- [x] Manages provider-specific configurations through centralized `AIEngineConfig`
- [x] Implements factory pattern for provider instantiation via `AIFactory`
- [x] Depends on `BaseAIProvider` abstract class for consistent provider interface
- [x] Depends on `GeminiProvider` for Google Gemini API integration
- [x] Emits console logs for debugging AI request/response flow
- [x] Returns structured `AIResponse` with text, success status, error messages, and token usage
- [x] Validates provider configurations before making API calls
- [x] Supports configurable temperature, maxTokens, and model selection per request

### 📥 Inputs

**Main Function:**
- `AIEngine.askAI(prompt: string, options?: AIEngineOptions): Promise<AIResponse>`
  - `prompt`: The text prompt to send to the AI model
  - `options.provider?`: AI provider to use ('gemini' | 'openai' | 'claude' | 'anthropic')
  - `options.apiKey?`: API key for authentication (falls back to env variables)
  - `options.model?`: Specific model to use (e.g., 'gemini-2.5-flash', 'gpt-4')
  - `options.temperature?`: Controls randomness (0.0-1.0, default: 0.7)
  - `options.maxTokens?`: Maximum output tokens (default: 8192 for Gemini)

**Configuration Functions:**
- `getProviderConfig(provider: string): ProviderConfig` - Get config for specific provider
- `updateProviderConfig(provider: string, updates: Partial<ProviderConfig>): void` - Update provider settings
- `setDefaultProvider(provider: string): void` - Set default AI provider
- `AIEngine.setModelSelection(selection: ModelSelection): void` - Set current model selection

**Model Discovery:**
- `AIEngine.getAvailableModels(): Promise<ModelInfo[]>` - Get all available models from all providers
- `AIEngine.getModelsForProvider(provider: AIProvider): Promise<ModelInfo[]>` - Get models for specific provider

### 📤 Outputs

**AIResponse Interface:**
```typescript
{
  text: string;              // Generated text from AI
  success: boolean;          // Whether request succeeded
  error?: string;            // Error message if failed
  model?: string;            // Model used for generation
  usage?: {
    promptTokens?: number;   // Tokens used in prompt
    completionTokens?: number; // Tokens in completion
    totalTokens?: number;    // Total tokens consumed
  }
}
```

**ModelInfo Interface:**
```typescript
{
  id: string;                // Unique model identifier
  name: string;              // Model name
  displayName: string;       // Human-readable name
  provider: AIProvider;      // Provider name
  modelType: string;         // Model type/category
  description?: string;      // Model description
  maxTokens?: number;        // Maximum token limit
  supportedFeatures: string[]; // Supported features array
}
```

### ⚠️ Side Effects
- Reads API keys from environment variables (`GEMINI_API_KEY`, `OPENAI_API_KEY`, etc.)
- Makes HTTP requests to external AI provider APIs (Google Gemini, OpenAI, Claude, Anthropic)
- Logs debug information to console (prefixed with 🟡 for AIEngine, 🔵 for providers)
- Creates fresh AI client instances per request to ensure clean state
- Mutates global `AIEngineConfig` when calling `updateProviderConfig()` or `setDefaultProvider()`

### 🏗️ Architecture

**Factory Pattern:**
- `AIFactory` manages provider registration and retrieval
- Providers are registered at initialization (e.g., `GeminiProvider`)
- Supports dynamic provider switching via factory methods

**Provider Interface:**
```typescript
interface AIProviderInterface {
  provider: AIProvider;
  name: string;
  askAI(prompt: string, options?: AIProviderConfig): Promise<AIResponse>;
  getAvailableModels(): Promise<ModelInfo[]>;
  validateConfig(config: AIProviderConfig): boolean;
}
```

**Base Provider:**
- `BaseAIProvider` abstract class provides:
  - Config merging utilities
  - Error/success response helpers
  - Field validation helpers
  - Consistent interface for all providers

### 🧪 Example Usage

**Basic AI Request:**
```ts
import { AIEngine } from '@/lib/AIEngine';

// Simple request with default Gemini provider
const response = await AIEngine.askAI('Explain quantum computing in simple terms');

if (response.success) {
  console.log(response.text);
  console.log('Tokens used:', response.usage?.totalTokens);
}
```

**Custom Provider and Options:**
```ts
import { AIEngine } from '@/lib/AIEngine';

// Request with custom configuration
const response = await AIEngine.askAI(
  'Write a haiku about coding',
  {
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    temperature: 0.9,
    maxTokens: 1000,
    apiKey: process.env.GEMINI_API_KEY
  }
);
```

**Get Available Models:**
```ts
import { AIEngine } from '@/lib/AIEngine';

// Get all models from all providers
const allModels = await AIEngine.getAvailableModels();

// Get models for specific provider
const geminiModels = await AIEngine.getModelsForProvider('gemini');

console.log('Gemini models:', geminiModels.map(m => m.displayName));
```

**Configuration Management:**
```ts
import { 
  getProviderConfig, 
  updateProviderConfig,
  setDefaultProvider 
} from '@/lib/AIEngine';

// Get current config
const geminiConfig = getProviderConfig('gemini');
console.log('Current model:', geminiConfig.model);

// Update configuration
updateProviderConfig('gemini', {
  model: 'gemini-2.5-pro',
  temperature: 0.5,
  maxTokens: 4096
});

// Change default provider
setDefaultProvider('openai');
```

**Using Standalone askAI Function:**
```ts
import { askAI } from '@/lib/AIEngine';

// Convenient shorthand for AIEngine.askAI
const result = await askAI('What is the meaning of life?');
```

### 🔗 Dependencies
- `@google/generative-ai` - Google Gemini API SDK
- Environment variables: `GEMINI_API_KEY`, `OPENAI_API_KEY`, `CLAUDE_API_KEY`, `ANTHROPIC_API_KEY`

### 🏷️ Tags
#ai-abstraction #provider-pattern #gemini #openai #claude #text-generation #factory-pattern #configuration

### 📝 Notes
- Each AI request gets a fresh token allocation (8192 for Gemini by default)
- No token carryover between requests
- Provider instances are created fresh for each request to avoid state issues
- Default provider is Gemini with `gemini-2.5-flash` model
- Comprehensive error handling with structured error responses
- Supports future expansion to additional AI providers through factory pattern

