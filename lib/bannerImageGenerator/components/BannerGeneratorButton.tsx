'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import BannerImageModal from './BannerImageModal';
import BannerSettingsPanel from './BannerSettingsPanel';
import BannerSelectionGallery from './BannerSelectionGallery';
import { useBannerImageGenerator } from '../hooks/useBannerImageGenerator';

type GenerationType = 'svg' | 'ai-gemini';

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
    updateSetting,
  } = useBannerImageGenerator();

  const [settingsPanelVisible, setSettingsPanelVisible] = useState(false);
  const [generationType, setGenerationType] = useState<GenerationType>('svg');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
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

    setAiLoading(true);
    setAiError('');
    setAiBanners([]);

    try {
      // Choose API endpoint based on generation type
      const endpoint = generationType === 'ai-gemini' 
        ? '/api/generate-banner-image-gemini'
        : '/api/generate-banner-image-ai';
      
      const typeLabel = generationType === 'ai-gemini' ? 'Gemini AI' : 'SVG';
      console.log(`🎨 Generating ${typeLabel} banners...`);

      const response = await fetch(endpoint, {
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
        throw new Error(data.error || `Failed to generate ${typeLabel} banners`);
      }

      console.log(`✅ Generated ${data.banners?.length || 0} ${typeLabel} banner variations`);
      setAiBanners(data.banners || []);
      setShowGallery(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate banners';
      console.error('Banner Generation Error:', err);
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

  const getButtonLabel = () => {
    if (aiLoading) {
      return generationType === 'ai-gemini' ? '🤖 Generating AI...' : '🎨 Generating SVG...';
    }
    return generationType === 'ai-gemini' ? '🤖 AI Banner' : '🎨 SVG Banner';
  };

  const getButtonTitle = () => {
    return generationType === 'ai-gemini'
      ? 'Generate AI images using Gemini'
      : 'Generate SVG banners with AI-enhanced design';
  };

  return (
    <div style={{ position: 'relative', display: 'flex', gap: '8px', alignItems: 'center' }}>
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

      {/* Banner Generation with Type Selector */}
      <div style={{ position: 'relative', display: 'flex', gap: '0' }}>
        {/* Main Generate Button */}
        <Button
          variant={mapVariant(variant)}
          size={mapSize(size)}
          onClick={handleGenerate}
          disabled={isDisabled || aiLoading}
          loading={aiLoading}
          title={getButtonTitle()}
          style={{ 
            borderTopRightRadius: 0, 
            borderBottomRightRadius: 0,
            paddingRight: '12px'
          }}
        >
          {getButtonLabel()}
        </Button>

        {/* Type Dropdown Button */}
        <Button
          variant={mapVariant(variant)}
          size={mapSize(size)}
          onClick={() => setShowTypeDropdown(!showTypeDropdown)}
          disabled={disabled || aiLoading}
          title="Select generation type"
          style={{ 
            borderTopLeftRadius: 0, 
            borderBottomLeftRadius: 0,
            borderLeft: '1px solid rgba(255,255,255,0.2)',
            paddingLeft: '8px',
            paddingRight: '8px',
            minWidth: '32px'
          }}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>

        {/* Dropdown Menu */}
        {showTypeDropdown && (
          <>
            {/* Backdrop to close dropdown */}
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 40
              }}
              onClick={() => setShowTypeDropdown(false)}
            />
            
            {/* Dropdown Content */}
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                minWidth: '220px',
                zIndex: 50,
                overflow: 'hidden'
              }}
            >
              <div style={{ padding: '8px 0' }}>
                {/* SVG Option */}
                <button
                  onClick={() => {
                    setGenerationType('svg');
                    setShowTypeDropdown(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    textAlign: 'left',
                    backgroundColor: generationType === 'svg' ? 'hsl(var(--accent))' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    if (generationType !== 'svg') {
                      e.currentTarget.style.backgroundColor = 'hsl(var(--accent) / 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (generationType !== 'svg') {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '500',
                    color: 'hsl(var(--foreground))'
                  }}>
                    🎨 SVG Banners
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: 'hsl(var(--muted-foreground))'
                  }}>
                    Fast, customizable gradient designs
                  </div>
                </button>

                {/* AI Gemini Option */}
                <button
                  onClick={() => {
                    setGenerationType('ai-gemini');
                    setShowTypeDropdown(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    textAlign: 'left',
                    backgroundColor: generationType === 'ai-gemini' ? 'hsl(var(--accent))' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    if (generationType !== 'ai-gemini') {
                      e.currentTarget.style.backgroundColor = 'hsl(var(--accent) / 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (generationType !== 'ai-gemini') {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '500',
                    color: 'hsl(var(--foreground))'
                  }}>
                    🤖 Gemini AI Images
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: 'hsl(var(--muted-foreground))'
                  }}>
                    AI-powered realistic image generation
                  </div>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

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

