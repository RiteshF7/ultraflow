'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface Banner {
  id: number;
  imageData: string;
  designSpec: any;
}

interface BannerSelectionGalleryProps {
  banners: Banner[];
  onClose: () => void;
  onSelectBanner: (banner: Banner) => void;
  articleTitle?: string;
}

export default function BannerSelectionGallery({
  banners,
  onClose,
  onSelectBanner,
  articleTitle
}: BannerSelectionGalleryProps) {
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [zoom, setZoom] = useState(100);

  const handleSelectBanner = (banner: Banner) => {
    setSelectedBanner(banner);
  };

  const handleDownload = async () => {
    if (!selectedBanner) return;
    
    try {
      const { downloadBase64Image, generateImageFilename } = await import('../utils/imageDownloader');
      const filename = generateImageFilename(
        articleTitle 
          ? `${articleTitle}-${selectedBanner.designSpec.style}`
          : `banner-${selectedBanner.designSpec.style}`
      );
      await downloadBase64Image(selectedBanner.imageData, filename);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleUseThis = () => {
    if (selectedBanner) {
      onSelectBanner(selectedBanner);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
    >
      <div className="w-full max-w-7xl h-[90vh] bg-background rounded-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-2xl font-bold">🎨 Select Your Banner Design</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedBanner 
                ? `${selectedBanner.designSpec.style} - ${selectedBanner.designSpec.description || ''}`
                : 'Click on any design to preview'}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Gallery Sidebar - Scrollable */}
          <div className="w-80 border-r flex flex-col overflow-hidden">
            <div className="p-3 border-b bg-muted/50">
              <p className="text-sm font-medium">{banners.length} Design Variations</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {banners.map((banner, index) => (
                  <div
                    key={banner.id || index}
                    onClick={() => handleSelectBanner(banner)}
                    className={`
                      cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                      ${selectedBanner?.id === banner.id 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-border hover:border-primary/50'}
                    `}
                  >
                    <img 
                      src={banner.imageData}
                      alt={`${banner.designSpec.style} style banner`}
                      className="w-full h-auto"
                    />
                    <div className="p-3 bg-muted/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm capitalize">
                          {banner.designSpec.style}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {banner.designSpec.colorScheme?.split('-')[0]}
                        </span>
                      </div>
                      {banner.designSpec.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {banner.designSpec.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Area - Scrollable */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedBanner ? (
              <>
                {/* Zoom Controls */}
                <div className="flex items-center justify-center gap-2 p-4 border-b flex-shrink-0">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setZoom(Math.max(50, zoom - 10))}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium w-16 text-center">{zoom}%</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setZoom(Math.min(200, zoom + 10))}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setZoom(100)}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>

                {/* Image Preview - Scrollable */}
                <div className="flex-1 overflow-auto bg-muted/20">
                  <div className="min-h-full flex items-center justify-center p-8">
                    <img 
                      src={selectedBanner.imageData}
                      alt="Selected banner"
                      style={{ 
                        width: zoom > 100 ? `${zoom}%` : 'auto',
                        maxWidth: zoom <= 100 ? '100%' : 'none',
                        height: 'auto'
                      }}
                      className="shadow-2xl rounded-lg"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 p-4 border-t flex-shrink-0">
                  <Button variant="outline" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PNG
                  </Button>
                  <Button onClick={handleUseThis}>
                    Use This Design
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎨</div>
                  <p className="text-lg">Select a banner from the left to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

