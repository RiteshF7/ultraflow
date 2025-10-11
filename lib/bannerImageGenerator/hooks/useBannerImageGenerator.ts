/**
 * Banner Image Generator - Custom Hook
 * Manages all state and logic for banner image generation
 */

import { useState, useCallback } from 'react';
import type { BannerSettings, GenerationResult } from '../types';
import { callBannerAPIWithRetry } from '../api/imageGenerationService';
import { generatePromptFromArticle, enhanceCustomPrompt } from '../utils/promptGenerator';
import { downloadBase64Image, generateImageFilename } from '../utils/imageDownloader';

const DEFAULT_SETTINGS: BannerSettings = {
  imageScope: 'article',
  promptType: 'auto',
  displayBehavior: 'modal',
  buttonPlacement: 'header',
  customPrompt: '',
};

export function useBannerImageGenerator() {
  const [settings, setSettings] = useState<BannerSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [imageData, setImageData] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);

  /**
   * Update a specific setting
   */
  const updateSetting = useCallback(<K extends keyof BannerSettings>(
    key: K,
    value: BannerSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  /**
   * Update all settings at once
   */
  const updateSettings = useCallback((newSettings: Partial<BannerSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  /**
   * Generate banner image
   */
  const generateImage = useCallback(async (articleContent: string, articleTitle?: string): Promise<GenerationResult> => {
    if (!articleContent || articleContent.trim().length === 0) {
      const errorMsg = 'Article content is required';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    setLoading(true);
    setError('');
    setImageData('');

    try {
      // Generate or use custom prompt
      const prompt = settings.promptType === 'auto'
        ? generatePromptFromArticle(articleContent)
        : enhanceCustomPrompt(settings.customPrompt);

      console.log('🎨 Generating banner with prompt:', prompt);

      // Call API with retry logic
      const result = await callBannerAPIWithRetry(prompt, articleContent);

      if (!result.success || !result.imageData) {
        throw new Error(result.error || 'No image data returned');
      }

      setImageData(result.imageData);

      // Handle display behavior
      switch (settings.displayBehavior) {
        case 'modal':
          setModalVisible(true);
          break;
        
        case 'auto-download':
          const filename = generateImageFilename(articleTitle);
          await downloadBase64Image(result.imageData, filename);
          break;
        
        case 'inline':
          // Image is already set in state, parent component will display it
          break;
      }

      return { success: true, imageData: result.imageData };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate image';
      console.error('❌ Banner generation error:', err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [settings]);

  /**
   * Download current image
   */
  const downloadImage = useCallback(async (articleTitle?: string) => {
    if (!imageData) {
      setError('No image to download');
      return;
    }

    try {
      const filename = generateImageFilename(articleTitle);
      await downloadBase64Image(imageData, filename);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Download failed';
      setError(errorMessage);
    }
  }, [imageData]);

  /**
   * Clear current image and error
   */
  const clearImage = useCallback(() => {
    setImageData('');
    setError('');
    setModalVisible(false);
  }, []);

  /**
   * Show modal
   */
  const showModal = useCallback(() => {
    if (imageData) {
      setModalVisible(true);
    }
  }, [imageData]);

  /**
   * Hide modal
   */
  const hideModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  return {
    // State
    settings,
    loading,
    error,
    imageData,
    modalVisible,
    
    // Actions
    generateImage,
    downloadImage,
    clearImage,
    showModal,
    hideModal,
    updateSetting,
    updateSettings,
  };
}

