# Prompt Manager

A flexible prompt management system that handles prompt templates, variable replacement, and AI execution.

## Features

- 📝 Load prompts from JSON files
- 🔍 Get prompts by ID
- ➕ Append and prepend text to prompts
- 🔄 Variable replacement with template syntax
- 🤖 Execute prompts using AI Engine
- 📋 List all available prompts

## Directory Structure

```
promptmanager/
├── PromptManager.ts      # Main prompt manager class
├── types.ts              # TypeScript type definitions
├── index.ts              # Export file
├── README.md             # This file
└── Prompts/              # Prompt templates directory
    ├── index.ts          # Central prompt registry
    ├── PromptArticleToJSON.ts
    └── PromptJSONToTopics.ts
```

## Usage

### Basic Usage

```typescript
import { promptManager } from '@/lib/promptmanager';

// Get a prompt by ID
const prompt = promptManager.getPromptText('article-to-json');

// List all available prompts
const prompts = promptManager.listPrompts();
console.log(prompts);
```

### Modifying Prompts

```typescript
// Append text to a prompt
const modifiedPrompt = promptManager.appendToPrompt(
  prompt,
  'Additional instructions: Be concise.'
);

// Prepend text to a prompt
const modifiedPrompt = promptManager.prependToPrompt(
  prompt,
  'Important: Follow these guidelines.'
);
```

### Variable Replacement

Prompts can contain variables in the format `{{variableName}}`:

```typescript
const prompt = "Hello {{name}}, your role is {{role}}";
const result = promptManager.replaceVariables(prompt, {
  name: "Alice",
  role: "Developer"
});
// Result: "Hello Alice, your role is Developer"
```

### Executing Prompts with AI

The PromptManager automatically uses centralized AI configuration from `AIEngine/config.ts`.

```typescript
// Simple: Uses default provider and config
const response = await promptManager.executePrompt('article-to-json', {
  variables: {
    content: 'Your article content here...'
  }
});

// Specify provider: Auto-loads that provider's config
const response = await promptManager.executePrompt('article-to-json', {
  variables: {
    content: 'Your article content here...'
  },
  provider: 'openai'  // Uses OpenAI with its centralized config
});

// Override specific settings while using defaults
const response = await promptManager.executePrompt('json-to-topics', {
  variables: {
    content: jsonData
  },
  provider: 'openai',
  aiConfig: {
    temperature: 0.9  // Override only temperature
  }
});

// Full custom config
const response = await promptManager.executePrompt('article-to-json', {
  variables: {
    content: 'Your article content here...'
  },
  provider: 'gemini',
  aiConfig: {
    model: 'gemini-2.5-flash',
    temperature: 0.7,
    maxTokens: 1000
  }
});

// Execute with prepend/append
const response = await promptManager.executePrompt('json-to-topics', {
  variables: {
    content: jsonData
  },
  prependText: 'You are an expert analyst.',
  appendText: 'Provide detailed explanations.'
});

// Execute direct prompt text (not from file)
const response = await promptManager.executePrompt(
  'Summarize this text: {{text}}',
  {
    variables: { text: 'Some text to summarize' }
  }
);
```

## Prompt File Format

Each prompt file in the `Prompts/` directory should be a TypeScript file that exports a `PromptData` object:

```typescript
import type { PromptData } from '../types';

export const MyPrompt: PromptData = {
  id: 'unique-prompt-id',
  name: 'Human-readable name',
  description: 'Description of what this prompt does',
  prompt: `The actual prompt text with {{variables}}`
};
```

### Example Prompt File

```typescript
import type { PromptData } from '../types';

export const PromptArticleToJSON: PromptData = {
  id: 'article-to-json',
  name: 'Article to JSON Converter',
  description: 'Converts article content into structured JSON format',
  prompt: `Convert the following article into JSON.

Article:
{{content}}`
};
```

## API Reference

### `getPromptById(id: string): Object`
Returns the full prompt data object by ID.

### `getPromptText(id: string): string`
Returns only the prompt text by ID.

### `appendToPrompt(prompt: string, text: string): string`
Appends text to the end of a prompt.

### `prependToPrompt(prompt: string, text: string): string`
Prepends text to the beginning of a prompt.

### `replaceVariables(prompt: string, variables: Object): string`
Replaces `{{variable}}` placeholders with actual values.

### `executePrompt(promptIdOrText: string, options: Object): Promise<string>`
Executes a prompt using the AI Engine.

**Options:**
- `variables` (Object): Variables to replace in the prompt
- `prependText` (string): Text to prepend
- `appendText` (string): Text to append
- `provider` (string): AI provider (default: 'gemini')
- `aiConfig` (Object): Additional AI configuration

### `listPrompts(): Array`
Returns an array of all available prompts with their metadata.

### `clearCache(): void`
Clears the internal cache, forcing prompts to be reloaded.

## Integration with AI Engine

The Prompt Manager uses the AI Engine's centralized configuration system. This means:

1. **Automatic Config Loading** - Provider configs are loaded automatically
2. **Environment Variables** - Set API keys in `.env.local`:
   ```bash
   GEMINI_API_KEY=your_key
   OPENAI_API_KEY=your_key
   CLAUDE_API_KEY=your_key
   ANTHROPIC_API_KEY=your_key
   ```
3. **Centralized Settings** - All defaults are in `src/lib/AIEngine/config.ts`
4. **Easy Overrides** - Override per request or globally

See [AI Engine Configuration Guide](../AIEngine/CONFIG_GUIDE.md) for detailed configuration options.

## Adding New Prompts

To add a new prompt:

1. Create a new TypeScript file in the `Prompts/` directory
2. Export a prompt object following the `PromptData` interface
3. Add the prompt to the `ALL_PROMPTS` array in `Prompts/index.ts`

### Step-by-step Example:

**1. Create `Prompts/PromptMyNewFeature.ts`:**

```typescript
import type { PromptData } from '../types';

export const PromptMyNewFeature: PromptData = {
  id: 'my-new-feature',
  name: 'My New Feature',
  description: 'What this prompt does',
  prompt: `Your prompt text here with {{variables}}`
};
```

**2. Add to `Prompts/index.ts`:**

```typescript
import { PromptArticleToJSON } from './PromptArticleToJSON';
import { PromptJSONToTopics } from './PromptJSONToTopics';
import { PromptMyNewFeature } from './PromptMyNewFeature'; // Add import

export const ALL_PROMPTS: PromptData[] = [
  PromptArticleToJSON,
  PromptJSONToTopics,
  PromptMyNewFeature  // Add to array
];

export { PromptArticleToJSON, PromptJSONToTopics, PromptMyNewFeature };
```

That's it! The prompt is now available throughout your application.

## Performance Benefits

By using TypeScript modules instead of JSON files:

- ✅ **No File System I/O** - Prompts are bundled at compile time
- ✅ **Type Safety** - Full TypeScript type checking
- ✅ **Tree Shaking** - Unused prompts can be eliminated by the bundler
- ✅ **Faster Loading** - No runtime file reading or JSON parsing
- ✅ **Better IDE Support** - IntelliSense and autocomplete for prompts

## Error Handling

The Prompt Manager throws errors for:
- Prompt ID not found
- Invalid prompt configuration
- AI Engine execution failures

Always wrap calls in try-catch blocks:

```typescript
try {
  const response = await promptManager.executePrompt('article-to-json', {
    variables: { content: article }
  });
} catch (error) {
  console.error('Prompt execution failed:', error.message);
}
```

## TypeScript Support

The Prompt Manager is fully typed with TypeScript. Import types as needed:

```typescript
import { 
  promptManager, 
  PromptManager,
  PromptData,
  PromptMetadata,
  PromptVariables,
  ExecutePromptOptions,
  AIConfig
} from '@/lib/promptmanager';

// Type-safe variable replacement
const variables: PromptVariables = {
  content: 'Article text',
  author: 'John Doe'
};

// Type-safe execution options
const options: ExecutePromptOptions = {
  variables,
  provider: 'gemini',
  aiConfig: {
    temperature: 0.7,
    maxTokens: 2000
  }
};

const response = await promptManager.executePrompt('article-to-json', options);
```

