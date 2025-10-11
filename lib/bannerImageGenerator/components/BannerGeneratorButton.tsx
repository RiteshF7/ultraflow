'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import BannerImageModal from './BannerImageModal';
import BannerSettingsPanel from './BannerSettingsPanel';
import BannerSelectionGallery from './BannerSelectionGallery';
import { useBannerImageGenerator } from '../hooks/useBannerImageGenerator';

interface BannerGeneratorButtonProps {
  articleContent?: string;
  articleTitle?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'error';
  size?: 'small' | 'medium' | 'large';
}

// Map custom variant to Button component variant
const mapVariant = (variant: 'primary' | 'secondary' | 'ghost' | 'success' | 'error') => {
  const variantMap = {
    'primary': 'default' as const,
    'secondary': 'secondary' as const,
    'ghost': 'ghost' as const,
    'success': 'default' as const,
    'error': 'destructive' as const,
  };
  return variantMap[variant];
};

// Map custom size to Button component size
const mapSize = (size: 'small' | 'medium' | 'large') => {
  const sizeMap = {
    'small': 'sm' as const,
    'medium': 'md' as const,
    'large': 'lg' as const,
  };
  return sizeMap[size];
};

export default function BannerGeneratorButton({
  articleContent,
  articleTitle,
  disabled = false,
  variant = 'secondary',
  size = 'small',
}: BannerGeneratorButtonProps) {
  const {
    settings,
    loading,
    error,
    imageData,
    modalVisible,
    generateImage,
    downloadImage,
    hideModal,
    updateSetting,
  } = useBannerImageGenerator();

  const [settingsPanelVisible, setSettingsPanelVisible] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiBanners, setAiBanners] = useState<any[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedAIBanner, setSelectedAIBanner] = useState<any>(null);
  const [showSelectedModal, setShowSelectedModal] = useState(false);
  const [aiError, setAiError] = useState('');

  const handleGenerate = async () => {
    if (!articleContent || articleContent.trim().length === 0) {
      return;
    }

    await generateImage(articleContent, articleTitle);
  };

  const handleAIGenerate = async () => {
    if (!articleContent || articleContent.trim().length === 0) {
      return;
    }

    setAiLoading(true);
    setAiError('');
    setAiBanners([]);

    try {
      const response = await fetch('/api/generate-banner-image-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleContent,
          articleTitle,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate AI banners');
      }

      console.log('🤖 Generated', data.banners?.length || 0, 'banner variations');
      setAiBanners(data.banners || []);
      setShowGallery(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate AI banners';
      console.error('AI Banner Error:', err);
      setAiError(errorMsg);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSelectBanner = (banner: any) => {
    setSelectedAIBanner(banner);
    setShowGallery(false);
    setShowSelectedModal(true);
  };

  const handleDownload = async () => {
    await downloadImage(articleTitle);
  };

  const handleSelectedBannerDownload = async () => {
    if (!selectedAIBanner) return;
    
    try {
      const { downloadBase64Image, generateImageFilename } = await import('../utils/imageDownloader');
      const filename = generateImageFilename(
        articleTitle 
          ? `${articleTitle}-${selectedAIBanner.designSpec.style}`
          : `ai-banner-${selectedAIBanner.designSpec.style}`
      );
      await downloadBase64Image(selectedAIBanner.imageData, filename);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const isDisabled = disabled || !articleContent || articleContent.trim().length === 0;

  return (
    <div style={{ position: 'relative', display: 'flex', gap: '8px' }}>
      {/* Settings Button */}
      <div style={{ position: 'relative' }}>
        <Button
          variant="secondary"
          size={mapSize(size)}
          onClick={() => setSettingsPanelVisible(!settingsPanelVisible)}
          disabled={disabled}
        >
          ⚙️
        </Button>

        {/* Settings Panel */}
        <BannerSettingsPanel
          settings={settings}
          onSettingChange={updateSetting}
          visible={settingsPanelVisible}
          onClose={() => setSettingsPanelVisible(false)}
        />
      </div>

      {/* Quick Gradient Banner Button */}
      <Button
        variant="secondary"
        size={mapSize(size)}
        onClick={handleGenerate}
        disabled={isDisabled || loading}
        loading={loading}
        title="Generate quick gradient banner"
      >
        {loading ? '⏳ Generating...' : '🎨 Quick Banner'}
      </Button>

      {/* AI-Enhanced Banner Button */}
      <Button
        variant={mapVariant(variant)}
        size={mapSize(size)}
        onClick={handleAIGenerate}
        disabled={isDisabled || aiLoading}
        loading={aiLoading}
        title="Generate AI-enhanced banner using Gemini"
      >
        {aiLoading ? '🤖 AI Generating...' : '🤖 AI Banner'}
      </Button>

      {/* Quick Banner Modal */}
      {modalVisible && (
        <BannerImageModal
          imageData={imageData}
          onClose={hideModal}
          onDownload={handleDownload}
          loading={loading}
          error={error}
        />
      )}

      {/* AI Banner Selection Gallery */}
      {showGallery && aiBanners.length > 0 && (
        <BannerSelectionGallery
          banners={aiBanners}
          onClose={() => setShowGallery(false)}
          onSelectBanner={handleSelectBanner}
          articleTitle={articleTitle}
        />
      )}

      {/* Selected AI Banner Modal */}
      {showSelectedModal && selectedAIBanner && (
        <BannerImageModal
          imageData={selectedAIBanner.imageData}
          onClose={() => setShowSelectedModal(false)}
          onDownload={handleSelectedBannerDownload}
          loading={false}
          error={aiError}
        />
      )}
    </div>
  );
}

