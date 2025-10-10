# capabilities.md

## Module: /lib/promptmanager

### 🧩 Capabilities
- [x] Handles prompt template management and execution
- [x] Exposes `promptManager.executePrompt()` for executing AI prompts with variable substitution
- [x] Manages a centralized registry of reusable prompt templates
- [x] Supports dynamic variable replacement using `{{varName}}` syntax
- [x] Implements conditional blocks with `{{#if varName}}...{{/if}}` syntax
- [x] Depends on `AIEngine` for executing prompts with AI providers
- [x] Provides `getPromptById()` for retrieving prompt templates
- [x] Supports prepending and appending text to prompts dynamically
- [x] Caches loaded prompts for performance optimization
- [x] Emits console logs (🟢 prefix) for debugging prompt execution flow
- [x] Validates prompt existence before execution
- [x] Supports direct prompt text execution (not just template IDs)
- [x] Returns plain text AI responses as strings

### 📥 Inputs

**Main Execution Function:**
- `promptManager.executePrompt(promptIdOrText: string, options?: ExecutePromptOptions): Promise<string>`
  - `promptIdOrText`: Either a prompt template ID (e.g., 'article-to-json') or direct prompt text
  - `options.variables?`: Object for variable replacement (e.g., `{content: "...", themeInstructions: "..."}`)
  - `options.prependText?`: Text to add before the prompt
  - `options.appendText?`: Text to add after the prompt
  - `options.provider?`: AI provider to use (default: 'gemini')
  - `options.aiConfig?`: AI configuration overrides

**Template Management:**
- `promptManager.getPromptById(id: string): PromptData` - Get full prompt data
- `promptManager.getPromptText(id: string): string` - Get just the prompt text
- `promptManager.hasPrompt(id: string): boolean` - Check if prompt exists
- `promptManager.listPrompts(): PromptMetadata[]` - List all available prompts

**Text Manipulation:**
- `promptManager.replaceVariables(prompt: string, variables: PromptVariables): string` - Replace variables in template
- `promptManager.appendToPrompt(prompt: string, text: string): string` - Append text to prompt
- `promptManager.prependToPrompt(prompt: string, text: string): string` - Prepend text to prompt

**Cache Management:**
- `promptManager.clearCache(): void` - Clear the prompt cache
- `promptManager.getPromptCount(): number` - Get number of loaded prompts

### 📤 Outputs

**Execute Prompt:**
- Returns `Promise<string>` - The AI-generated text response
- Throws error if prompt not found or AI execution fails

**Prompt Data Structure:**
```typescript
interface PromptData {
  id: string;          // Unique prompt identifier
  name: string;        // Human-readable name
  description: string; // What the prompt does
  prompt: string;      // The actual prompt template
}
```

**Prompt Metadata:**
```typescript
interface PromptMetadata {
  id: string;          // Prompt ID
  name: string;        // Prompt name
  description: string; // Prompt description
}
```

### ⚠️ Side Effects
- Reads prompt templates from `./Prompts/index.ts` registry
- Caches prompts in memory (`Map<string, PromptData>`)
- Makes AI API calls through `AIEngine.askAI()`
- Logs execution details to console (prefixed with 🟢)
- Reads provider configurations from `AIEngineConfig`
- Uses environment variables for API keys via `getProviderConfig()`

### 🎨 Template Syntax

**Variable Replacement:**
```typescript
// Template: "Analyze this: {{content}}"
// Variables: { content: "Hello World" }
// Result: "Analyze this: Hello World"
```

**Conditional Blocks:**
```typescript
// Template: "{{#if themeInstructions}}Theme: {{themeInstructions}}{{/if}}"
// Variables: { themeInstructions: "Modern style" }
// Result: "Theme: Modern style"

// If themeInstructions is empty or falsy:
// Result: "" (block removed)
```

### 📚 Available Prompts

**article-to-json:**
- **ID:** `article-to-json`
- **Purpose:** Convert article text directly to Mermaid flowchart diagrams
- **Variables:** 
  - `content` (required): The article text to convert
  - `themeInstructions` (optional): Theme/style instructions for flowcharts
- **Output:** Multiple Mermaid diagrams in delimiter format

### 🧪 Example Usage

**Execute Prompt Template with Variables:**
```ts
import { promptManager } from '@/lib/promptmanager';

// Execute prompt template with variable substitution
const result = await promptManager.executePrompt('article-to-json', {
  variables: {
    content: articleText,
    themeInstructions: 'Use modern, clean styling with blue accents'
  }
});

console.log('Generated diagrams:', result);
```

**Execute Direct Prompt Text:**
```ts
import { promptManager } from '@/lib/promptmanager';

// Execute direct prompt (not a template)
const response = await promptManager.executePrompt(
  'Explain the concept of recursion in programming',
  {
    provider: 'gemini',
    aiConfig: {
      temperature: 0.7,
      maxTokens: 2048
    }
  }
);

console.log(response);
```

**Get and Use Prompt Template:**
```ts
import { promptManager } from '@/lib/promptmanager';

// Get prompt template
const promptData = promptManager.getPromptById('article-to-json');
console.log('Prompt:', promptData.name);
console.log('Description:', promptData.description);

// Replace variables manually
const processedPrompt = promptManager.replaceVariables(
  promptData.prompt,
  { content: 'My article text', themeInstructions: '' }
);
```

**Prepend/Append Text:**
```ts
import { promptManager } from '@/lib/promptmanager';

// Add context before and after the prompt
const result = await promptManager.executePrompt('article-to-json', {
  variables: { content: articleText },
  prependText: 'Important: Focus on technical accuracy.',
  appendText: 'Please ensure all diagrams are valid Mermaid syntax.'
});
```

**List Available Prompts:**
```ts
import { promptManager } from '@/lib/promptmanager';

// Get all available prompts
const prompts = promptManager.listPrompts();

prompts.forEach(p => {
  console.log(`${p.id}: ${p.name} - ${p.description}`);
});

// Check if specific prompt exists
if (promptManager.hasPrompt('article-to-json')) {
  console.log('Prompt exists!');
}

// Get total count
console.log('Total prompts:', promptManager.getPromptCount());
```

**Custom AI Configuration:**
```ts
import { promptManager } from '@/lib/promptmanager';

// Execute with custom AI settings
const result = await promptManager.executePrompt('article-to-json', {
  variables: { content: 'My article' },
  provider: 'gemini',
  aiConfig: {
    model: 'gemini-2.5-pro',
    temperature: 0.5,
    maxTokens: 8192,
    apiKey: process.env.CUSTOM_API_KEY
  }
});
```

**Manual Variable Replacement:**
```ts
import { promptManager } from '@/lib/promptmanager';

// Replace variables in custom template
const template = 'Hello {{name}}! {{#if greeting}}{{greeting}}{{/if}}';
const result = promptManager.replaceVariables(template, {
  name: 'Alice',
  greeting: 'Welcome to the app!'
});

console.log(result); // "Hello Alice! Welcome to the app!"
```

### 🏗️ Architecture

**Singleton Pattern:**
- Exports `promptManager` singleton instance for global use
- Also exports `PromptManager` class for custom instances

**Lazy Loading:**
- Prompts are loaded on first access via `_loadPrompts()`
- Cached in `Map<string, PromptData>` for performance

**Registry System:**
- All prompts registered in `./Prompts/index.ts` as `ALL_PROMPTS` array
- Easy to add new prompts by importing them into registry

### 🔗 Dependencies
- `@/lib/AIEngine` - For AI text generation
- `@/lib/AIEngine/config` - For provider configuration management
- `./Prompts/index.ts` - Central registry of all prompt templates
- Theme utilities from `./Prompts/PromptThemeTemplate`

### 🏷️ Tags
#prompt-management #template-engine #variable-substitution #ai-orchestration #text-generation #singleton-pattern

### 📝 Notes
- Prompt templates use a simple but powerful variable system
- Conditional blocks support truthiness checks (empty strings are falsy)
- Each `executePrompt()` call gets fresh token allocation from `AIEngineConfig` (8192 for Gemini)
- Prompts are immutable after loading (returns copies to prevent mutation)
- Error handling provides clear messages for missing prompts or AI failures
- Supports both template IDs and direct prompt text for flexibility
- Theme prompt utilities available via `generateThemePrompt()` from Prompts module

