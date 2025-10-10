# AI Engine Configuration Guide

## Centralized Configuration System

All AI provider settings are managed in one place through `config.ts`. This makes it easy to:
- Switch providers globally
- Manage API keys
- Set provider-specific defaults
- Override settings per request

## Configuration File Location

`src/lib/AIEngine/config.ts`

## Default Configuration

```typescript
{
  defaultProvider: 'gemini',
  
  providers: {
    gemini: {
      model: 'gemini-2.5-flash',
      temperature: 0.7,
      maxTokens: 2048,
      apiKey: process.env.GEMINI_API_KEY
    },
    openai: {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2048,
      apiKey: process.env.OPENAI_API_KEY
    },
    claude: {
      model: 'claude-3-sonnet-20240229',
      temperature: 0.7,
      maxTokens: 2048,
      apiKey: process.env.CLAUDE_API_KEY
    },
    anthropic: {
      model: 'claude-3-opus-20240229',
      temperature: 0.7,
      maxTokens: 2048,
      apiKey: process.env.ANTHROPIC_API_KEY
    }
  }
}
```

## Usage Examples

### 1. Using Default Configuration

```typescript
import { promptManager } from '@/lib/promptmanager';

// Uses default provider (gemini) with default config
const response = await promptManager.executePrompt('article-to-json', {
  variables: { content: article }
});
```

### 2. Specify Provider (Auto Config)

```typescript
// Uses OpenAI with its default config from centralized settings
const response = await promptManager.executePrompt('article-to-json', {
  variables: { content: article },
  provider: 'openai'
});
```

### 3. Override Specific Settings

```typescript
// Uses OpenAI defaults but overrides temperature
const response = await promptManager.executePrompt('article-to-json', {
  variables: { content: article },
  provider: 'openai',
  aiConfig: {
    temperature: 0.9  // Override just this setting
  }
});
```

### 4. Direct AI Engine Usage

```typescript
import { askAI, getProviderConfig } from '@/lib/AIEngine';

// Use centralized config directly
const config = getProviderConfig('openai');
const response = await askAI('Your prompt here', {
  provider: 'openai',
  ...config
});
```

## Configuration Functions

### Get Provider Config

```typescript
import { getProviderConfig } from '@/lib/AIEngine';

const geminiConfig = getProviderConfig('gemini');
const openaiConfig = getProviderConfig('openai');
```

### Get Default Config

```typescript
import { getDefaultConfig, getDefaultProvider } from '@/lib/AIEngine';

const defaultProvider = getDefaultProvider(); // 'gemini'
const config = getDefaultConfig(); // Gemini's config
```

### Update Provider Config at Runtime

```typescript
import { updateProviderConfig } from '@/lib/AIEngine';

// Change OpenAI model globally
updateProviderConfig('openai', {
  model: 'gpt-4-turbo',
  temperature: 0.8
});
```

### Change Default Provider

```typescript
import { setDefaultProvider } from '@/lib/AIEngine';

// Switch default from Gemini to OpenAI
setDefaultProvider('openai');
```

### Get All Provider Configs

```typescript
import { getAllProviderConfigs } from '@/lib/AIEngine';

const allConfigs = getAllProviderConfigs();
console.log(allConfigs.gemini);
console.log(allConfigs.openai);
```

### Reset to Default

```typescript
import { resetProviderConfig } from '@/lib/AIEngine';

// Reset OpenAI to its original default settings
resetProviderConfig('openai');
```

## Environment Variables

Set these in your `.env.local` file:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
CLAUDE_API_KEY=your_claude_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## Modifying Default Settings

### Option 1: Edit config.ts directly

```typescript
// src/lib/AIEngine/config.ts
export const AIEngineConfig: AIEngineConfigType = {
  defaultProvider: 'openai', // Change default provider
  
  providers: {
    openai: {
      model: 'gpt-4-turbo', // Change default model
      temperature: 0.8,      // Change default temperature
      maxTokens: 4096,       // Change default max tokens
      apiKey: process.env.OPENAI_API_KEY
    },
    // ...
  }
};
```

### Option 2: Update at application startup

```typescript
// In your app initialization (e.g., layout.tsx or _app.tsx)
import { setDefaultProvider, updateProviderConfig } from '@/lib/AIEngine';

// Set OpenAI as default
setDefaultProvider('openai');

// Update specific provider settings
updateProviderConfig('openai', {
  model: 'gpt-4-turbo',
  temperature: 0.8
});
```

## Benefits

✅ **Single Source of Truth** - All AI settings in one place  
✅ **Easy Provider Switching** - Change providers with one line  
✅ **Type Safety** - Full TypeScript support  
✅ **Flexible Overrides** - Override globally or per-request  
✅ **Environment Aware** - Automatically uses env variables  
✅ **No Hardcoding** - Change settings without modifying code  

## Example: Multi-Provider Application

```typescript
import { promptManager } from '@/lib/promptmanager';
import { setDefaultProvider } from '@/lib/AIEngine';

// Use Gemini for cost-effective tasks
setDefaultProvider('gemini');
const summary = await promptManager.executePrompt('article-to-json', {
  variables: { content: article }
});

// Switch to OpenAI for complex tasks
const analysis = await promptManager.executePrompt('complex-analysis', {
  variables: { data: complexData },
  provider: 'openai'
});

// Use Claude for specific features
const creative = await promptManager.executePrompt('creative-writing', {
  variables: { topic: 'AI future' },
  provider: 'claude'
});
```

## TypeScript Types

```typescript
import type { 
  ProviderConfig, 
  AIEngineConfigType 
} from '@/lib/AIEngine';

const config: ProviderConfig = {
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2048,
  apiKey: 'your-key'
};
```

