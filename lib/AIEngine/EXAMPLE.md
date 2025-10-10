# AI Engine & Prompt Manager Examples

Complete examples showing how to use the centralized configuration system.

## Quick Start

### 1. Set Environment Variables

Create `.env.local` in your project root:

```bash
GEMINI_API_KEY=your_gemini_key_here
OPENAI_API_KEY=your_openai_key_here
```

### 2. Use with Default Settings

```typescript
import { promptManager } from '@/lib/promptmanager';

// Uses default provider (Gemini) with default config
const result = await promptManager.executePrompt('article-to-json', {
  variables: {
    content: 'AI is transforming industries...'
  }
});

console.log(result);
```

## Real-World Examples

### Example 1: Article Processing with Multiple Providers

```typescript
import { promptManager } from '@/lib/promptmanager';

async function processArticle(articleText: string) {
  try {
    // Step 1: Convert to JSON using Gemini (fast & cheap)
    const jsonResult = await promptManager.executePrompt('article-to-json', {
      variables: { content: articleText },
      provider: 'gemini'
    });
    
    const articleData = JSON.parse(jsonResult);
    
    // Step 2: Extract topics using OpenAI (more accurate)
    const topicsResult = await promptManager.executePrompt('json-to-topics', {
      variables: { content: jsonResult },
      provider: 'openai'
    });
    
    return {
      article: articleData,
      topics: topicsResult
    };
  } catch (error) {
    console.error('Failed to process article:', error);
    throw error;
  }
}

// Usage
const article = "Your long article text here...";
const processed = await processArticle(article);
```

### Example 2: Dynamic Provider Selection

```typescript
import { promptManager } from '@/lib/promptmanager';
import { setDefaultProvider } from '@/lib/AIEngine';

function selectProviderBasedOnTask(taskType: string) {
  switch (taskType) {
    case 'quick':
      setDefaultProvider('gemini');
      break;
    case 'accurate':
      setDefaultProvider('openai');
      break;
    case 'creative':
      setDefaultProvider('claude');
      break;
  }
}

async function executeTask(task: string, taskType: string) {
  selectProviderBasedOnTask(taskType);
  
  return await promptManager.executePrompt(task, {
    variables: { /* your variables */ }
  });
}
```

### Example 3: Configuration Override

```typescript
import { promptManager } from '@/lib/promptmanager';
import { getProviderConfig } from '@/lib/AIEngine';

async function generateCreativeContent(topic: string) {
  // Get default OpenAI config
  const baseConfig = getProviderConfig('openai');
  
  // Use higher temperature for creativity
  const result = await promptManager.executePrompt(
    'Generate a creative article about {{topic}}',
    {
      variables: { topic },
      provider: 'openai',
      aiConfig: {
        ...baseConfig,
        temperature: 0.95,  // Override for more creativity
        maxTokens: 4096     // Override for longer output
      }
    }
  );
  
  return result;
}
```

### Example 4: Multi-Provider Fallback

```typescript
import { promptManager } from '@/lib/promptmanager';

async function executeWithFallback(promptId: string, variables: any) {
  const providers = ['gemini', 'openai', 'claude'];
  
  for (const provider of providers) {
    try {
      console.log(`Trying ${provider}...`);
      
      const result = await promptManager.executePrompt(promptId, {
        variables,
        provider
      });
      
      console.log(`Success with ${provider}`);
      return result;
    } catch (error) {
      console.error(`${provider} failed:`, error);
      // Try next provider
    }
  }
  
  throw new Error('All providers failed');
}

// Usage
const result = await executeWithFallback('article-to-json', {
  content: 'Article text...'
});
```

### Example 5: Custom Configuration at Runtime

```typescript
import { updateProviderConfig, getProviderConfig } from '@/lib/AIEngine';
import { promptManager } from '@/lib/promptmanager';

// Update configuration at app startup
function initializeAI() {
  // Configure OpenAI for production use
  updateProviderConfig('openai', {
    model: 'gpt-4-turbo',
    temperature: 0.7,
    maxTokens: 4096
  });
  
  // Configure Gemini for development
  updateProviderConfig('gemini', {
    model: 'gemini-2.5-flash',
    temperature: 0.5,
    maxTokens: 2048
  });
}

// In your app initialization (e.g., layout.tsx)
initializeAI();

// Now all requests use updated config
const result = await promptManager.executePrompt('article-to-json', {
  variables: { content: 'Article...' },
  provider: 'openai'  // Uses gpt-4-turbo with updated settings
});
```

### Example 6: React Component Integration

```tsx
'use client';

import { useState } from 'react';
import { promptManager } from '@/lib/promptmanager';
import { getProviderConfig } from '@/lib/AIEngine';

export default function ArticleConverter() {
  const [article, setArticle] = useState('');
  const [result, setResult] = useState('');
  const [provider, setProvider] = useState<'gemini' | 'openai'>('gemini');
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    setLoading(true);
    try {
      const response = await promptManager.executePrompt('article-to-json', {
        variables: { content: article },
        provider
      });
      setResult(response);
    } catch (error) {
      console.error('Conversion failed:', error);
      alert('Failed to convert article');
    } finally {
      setLoading(false);
    }
  };

  const config = getProviderConfig(provider);

  return (
    <div>
      <h1>Article to JSON Converter</h1>
      
      <div>
        <label>Provider:</label>
        <select 
          value={provider} 
          onChange={(e) => setProvider(e.target.value as any)}
        >
          <option value="gemini">Gemini</option>
          <option value="openai">OpenAI</option>
        </select>
        <p>Model: {config.model}</p>
      </div>

      <textarea
        value={article}
        onChange={(e) => setArticle(e.target.value)}
        placeholder="Paste your article here..."
        rows={10}
      />

      <button onClick={handleConvert} disabled={loading}>
        {loading ? 'Converting...' : 'Convert to JSON'}
      </button>

      {result && (
        <pre>
          <code>{result}</code>
        </pre>
      )}
    </div>
  );
}
```

### Example 7: API Route Handler

```typescript
// app/api/convert-article/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { promptManager } from '@/lib/promptmanager';

export async function POST(req: NextRequest) {
  try {
    const { article, provider = 'gemini' } = await req.json();

    if (!article) {
      return NextResponse.json(
        { error: 'Article content is required' },
        { status: 400 }
      );
    }

    const result = await promptManager.executePrompt('article-to-json', {
      variables: { content: article },
      provider
    });

    return NextResponse.json({ 
      success: true, 
      data: JSON.parse(result) 
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process article' },
      { status: 500 }
    );
  }
}
```

## Configuration Best Practices

### 1. Set Defaults at App Startup

```typescript
// app/layout.tsx or similar
import { setDefaultProvider, updateProviderConfig } from '@/lib/AIEngine';

export default function RootLayout({ children }) {
  // Set defaults on server
  if (typeof window === 'undefined') {
    setDefaultProvider('gemini');
    updateProviderConfig('gemini', {
      temperature: 0.7
    });
  }

  return <html>{children}</html>;
}
```

### 2. Environment-Based Configuration

```typescript
// lib/ai-init.ts
import { setDefaultProvider, updateProviderConfig } from '@/lib/AIEngine';

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  // Production: Use more reliable provider
  setDefaultProvider('openai');
  updateProviderConfig('openai', {
    model: 'gpt-4',
    temperature: 0.7
  });
} else {
  // Development: Use cheaper provider
  setDefaultProvider('gemini');
  updateProviderConfig('gemini', {
    model: 'gemini-2.5-flash',
    temperature: 0.8
  });
}
```

### 3. User-Specific Configuration

```typescript
async function getUserAISettings(userId: string) {
  // Fetch from database
  const userPrefs = await db.userPreferences.findUnique({
    where: { userId }
  });

  return {
    provider: userPrefs.preferredProvider || 'gemini',
    aiConfig: {
      temperature: userPrefs.temperature || 0.7
    }
  };
}

async function processUserRequest(userId: string, article: string) {
  const settings = await getUserAISettings(userId);
  
  return await promptManager.executePrompt('article-to-json', {
    variables: { content: article },
    ...settings
  });
}
```

## Summary

✅ **Use centralized config** for consistency  
✅ **Override when needed** for flexibility  
✅ **Set defaults at startup** for best performance  
✅ **Use different providers** for different tasks  
✅ **Implement fallbacks** for reliability  

