'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Image as ImageIcon } from 'lucide-react';

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
  const router = useRouter();

  const handleOpenBannerGenerator = () => {
    // Store article data in sessionStorage for the banner generator page
    if (articleContent) {
      sessionStorage.setItem('bannerGen_articleContent', articleContent);
    }
    if (articleTitle) {
      sessionStorage.setItem('bannerGen_articleTitle', articleTitle);
    }
    
    // Navigate to banner generator page
    router.push('/banner-generator');
  };

  return (
    <Button
      variant={mapVariant(variant)}
      size={mapSize(size)}
      onClick={handleOpenBannerGenerator}
      disabled={disabled}
      title="Open banner generator"
    >
      <ImageIcon className="mr-2 h-4 w-4" />
      Generate Banner
    </Button>
  );
}
