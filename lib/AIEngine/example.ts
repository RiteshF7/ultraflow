/**
 * Example usage of the AI Engine - Essential Usage Only
 */

import { AIEngine, askAI } from './index';

// Example 1: Basic usage with the askAI function (Gemini as default)
export async function basicExample() {
  const response = await askAI('What is the capital of France?');
  
  if (response.success) {
    console.log('AI Response:', response.text);
  } else {
    console.error('Error:', response.error);
  }
}

// Example 2: Advanced usage with custom options
export async function advancedExample() {
  const response = await AIEngine.askAI('Explain quantum computing', {
    model: 'gemini-1.5-pro',
    temperature: 0.9,
    maxTokens: 1500
  });

  return response;
}

// Example 3: Getting available models
export async function getModelsExample() {
  const geminiModels = await AIEngine.getModelsForProvider('gemini');
  console.log('Available models:', geminiModels);
  return geminiModels;
}