'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import BannerImageModal from './BannerImageModal';
import BannerSettingsPanel from './BannerSettingsPanel';
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

  const handleGenerate = async () => {
    if (!articleContent || articleContent.trim().length === 0) {
      return;
    }

    await generateImage(articleContent, articleTitle);
  };

  const handleDownload = () => {
    downloadImage(articleTitle);
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

      {/* Generate Button */}
      <Button
        variant={mapVariant(variant)}
        size={mapSize(size)}
        onClick={handleGenerate}
        disabled={isDisabled}
        loading={loading}
      >
        {loading ? '⏳ Generating...' : '🎨 Generate Banner'}
      </Button>

      {/* Modal */}
      {modalVisible && (
        <BannerImageModal
          imageData={imageData}
          onClose={hideModal}
          onDownload={handleDownload}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
}

