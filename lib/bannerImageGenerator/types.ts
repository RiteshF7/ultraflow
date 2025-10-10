export type ImageScope = 'article' | 'diagram' | 'modal-only';
export type PromptType = 'auto' | 'custom';
export type DisplayBehavior = 'inline' | 'auto-download' | 'modal';
export type ButtonPlacement = 'header' | 'floating' | 'card';

export interface BannerSettings {
  imageScope: ImageScope;
  promptType: PromptType;
  displayBehavior: DisplayBehavior;
  buttonPlacement: ButtonPlacement;
  customPrompt: string;
}

export interface GenerationResult {
  success: boolean;
  imageData?: string; // base64 encoded image
  error?: string;
}

export interface ImageGenerationRequest {
  prompt?: string;
  articleContent?: string;
  customPrompt?: string;
}

export interface ImageGenerationResponse {
  success: boolean;
  imageData?: string;
  error?: string;
}

