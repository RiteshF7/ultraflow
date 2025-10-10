/**
 * Banner Image Generator Feature
 * 
 * A modular, reusable feature for generating AI-powered banner images
 * using Google's Gemini 2.5 Flash Image model.
 * 
 * @module bannerImageGenerator
 */

export { default as BannerGeneratorButton } from './components/BannerGeneratorButton';
export { default as BannerImageModal } from './components/BannerImageModal';
export { default as BannerSettingsPanel } from './components/BannerSettingsPanel';
export { useBannerImageGenerator } from './hooks/useBannerImageGenerator';
export type { BannerSettings, GenerationResult, ImageScope, PromptType, DisplayBehavior, ButtonPlacement } from './types';

