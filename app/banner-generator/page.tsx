'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, Download, Loader2, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

type GenerationType = 'svg' | 'ai-gemini';

interface Banner {
  id: number;
  imageData: string;
  designSpec: any;
}

export default function BannerGeneratorPage() {
  const router = useRouter();
  const [articleContent, setArticleContent] = useState('');
  const [articleTitle, setArticleTitle] = useState('');
  const [bannerTitleText, setBannerTitleText] = useState('');
  const [bannerSubtitleText, setBannerSubtitleText] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [generationType, setGenerationType] = useState<GenerationType>('svg');
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [error, setError] = useState('');
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);

  // Load article data from sessionStorage on mount
  React.useEffect(() => {
    const storedContent = sessionStorage.getItem('bannerGen_articleContent');
    const storedTitle = sessionStorage.getItem('bannerGen_articleTitle');
    
    if (storedContent) {
      setArticleContent(storedContent);
      // Clear from storage after loading
      sessionStorage.removeItem('bannerGen_articleContent');
    }
    if (storedTitle) {
      setArticleTitle(storedTitle);
      sessionStorage.removeItem('bannerGen_articleTitle');
    }
  }, []);

  const handleGenerate = async () => {
    if (!articleContent.trim()) {
      setError('Please enter article content');
      return;
    }

    setLoading(true);
    setError('');
    setBanners([]);
    setSelectedBanner(null);

    try {
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
          articleTitle: articleTitle || 'Article Banner',
          customInstructions,
          bannerTitleText: bannerTitleText || undefined,
          bannerSubtitleText: bannerSubtitleText || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Failed to generate ${typeLabel} banners`);
      }

      console.log(`✅ Generated ${data.banners?.length || 0} ${typeLabel} banner variations`);
      setBanners(data.banners || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate banners';
      console.error('Banner Generation Error:', err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (banner: Banner) => {
    try {
      // Convert base64 to blob
      const base64Data = banner.imageData.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/svg+xml' });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = `${articleTitle || 'banner'}-${banner.designSpec?.style || banner.id}.svg`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log(`✅ Downloaded: ${filename}`);
    } catch (err) {
      console.error('Download failed:', err);
      setError('Failed to download image');
    }
  };

  const handleDownloadSelected = () => {
    if (selectedBanner) {
      handleDownload(selectedBanner);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Banner Generator</h1>
              <p className="text-sm text-muted-foreground">Create stunning banners with AI</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Input & Settings */}
          <div className="space-y-4">
            <div className="bg-card rounded-lg border p-6 space-y-4">
              <h2 className="text-lg font-semibold">Article Content</h2>
              
              {/* Title Input */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Banner Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Enter banner title..."
                  value={articleTitle}
                  onChange={(e) => setArticleTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>

              {/* Banner Text Customization */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-semibold">Banner Text Overlay (Optional)</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  Customize the text that appears on your banner images
                </p>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Main Title Text
                  </label>
                  <input
                    type="text"
                    placeholder="Leave empty to auto-generate from article"
                    value={bannerTitleText}
                    onChange={(e) => setBannerTitleText(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                    maxLength={50}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {bannerTitleText.length}/50 characters
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Subtitle/Description Text
                  </label>
                  <input
                    type="text"
                    placeholder="Leave empty to auto-generate from article"
                    value={bannerSubtitleText}
                    onChange={(e) => setBannerSubtitleText(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {bannerSubtitleText.length}/60 characters
                  </p>
                </div>
              </div>

              {/* Article Content */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Article Content *
                </label>
                <Textarea
                  placeholder="Paste your article content here..."
                  value={articleContent}
                  onChange={(e) => setArticleContent(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
              </div>

              {/* Custom Instructions */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Custom Instructions (Optional)
                </label>
                <Textarea
                  placeholder="e.g., Focus on technical aspects, use blue colors, modern style..."
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              {/* Generation Type Selection */}
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Generation Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setGenerationType('svg')}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      generationType === 'svg'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-semibold mb-1">🎨 SVG Banners</div>
                    <div className="text-xs text-muted-foreground">
                      Fast, customizable gradient designs
                    </div>
                  </button>

                  <button
                    onClick={() => setGenerationType('ai-gemini')}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      generationType === 'ai-gemini'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-semibold mb-1">🤖 Gemini AI</div>
                    <div className="text-xs text-muted-foreground">
                      AI-powered realistic images
                    </div>
                  </button>
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={loading || !articleContent.trim()}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating {generationType === 'ai-gemini' ? 'AI' : 'SVG'} Banners...
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Generate Banners
                  </>
                )}
              </Button>

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="space-y-4">
            {/* Selected Banner Preview */}
            {selectedBanner && (
              <div className="bg-card rounded-lg border p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Selected Banner</h2>
                  <Button onClick={handleDownloadSelected} size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
                <div className="rounded-lg overflow-hidden border">
                  <img
                    src={selectedBanner.imageData}
                    alt="Selected banner"
                    className="w-full h-auto"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium capitalize">
                    {selectedBanner.designSpec?.style || 'Design'}
                  </span>
                  {selectedBanner.designSpec?.description && (
                    <> - {selectedBanner.designSpec.description}</>
                  )}
                </div>
              </div>
            )}

            {/* Generated Banners Grid */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">
                {banners.length > 0
                  ? `Generated Banners (${banners.length})`
                  : 'Generated Banners'}
              </h2>

              {banners.length === 0 && !loading && (
                <div className="text-center py-12 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No banners generated yet</p>
                  <p className="text-sm mt-1">Fill in the form and click "Generate Banners"</p>
                </div>
              )}

              {loading && (
                <div className="text-center py-12">
                  <Loader2 className="h-12 w-12 mx-auto mb-3 animate-spin text-primary" />
                  <p className="text-muted-foreground">Generating your banners...</p>
                </div>
              )}

              {banners.length > 0 && (
                <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                  <div className="grid grid-cols-2 gap-4">
                    {banners.map((banner) => (
                      <div
                        key={banner.id}
                        className={`group relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                          selectedBanner?.id === banner.id
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedBanner(banner)}
                      >
                        <img
                          src={banner.imageData}
                          alt={`${banner.designSpec?.style} style banner`}
                          className="w-full h-auto"
                        />
                        
                        {/* Hover Overlay with Download */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(banner);
                            }}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>

                        {/* Info Badge */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                          <div className="text-white text-sm font-medium capitalize">
                            {banner.designSpec?.style || `Design ${banner.id}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

