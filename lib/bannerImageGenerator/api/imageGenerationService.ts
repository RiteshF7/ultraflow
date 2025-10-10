/**
 * Banner Image Generator - API Service
 * Centralized API communication for image generation
 */

import type { ImageGenerationRequest, ImageGenerationResponse } from '../types';

/**
 * Call the banner image generation API
 */
export async function callBannerAPI(
  prompt: string,
  articleContent?: string
): Promise<ImageGenerationResponse> {
  try {
    const requestBody: ImageGenerationRequest = {
      prompt,
      articleContent,
    };

    const response = await fetch('/api/generate-banner-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }

    const data: ImageGenerationResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Image generation failed');
    }

    return data;
  } catch (error) {
    console.error('Banner API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Call banner API with retry logic
 */
export async function callBannerAPIWithRetry(
  prompt: string,
  articleContent?: string,
  maxRetries: number = 2
): Promise<ImageGenerationResponse> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await callBannerAPI(prompt, articleContent);
      
      if (result.success) {
        return result;
      }
      
      lastError = new Error(result.error || 'Generation failed');
      
      // Don't retry if it's a client error
      if (result.error?.includes('API key') || result.error?.includes('Invalid')) {
        break;
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
    }
  }
  
  return {
    success: false,
    error: lastError?.message || 'Failed after multiple attempts',
  };
}

