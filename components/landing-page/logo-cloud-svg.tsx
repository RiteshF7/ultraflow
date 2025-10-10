'use client';
import { useEffect, useState } from 'react';
import {
  StripeSvg,
  NextjsSvg,
  SupabaseSvg,
  VercelSvg,
  GithubSvg,
  LogoSupacrawler
} from '@/components/svg';
import { logoCloudContent } from '@/config/landing-page';

export default function LogoCloud() {
  const [primaryColor, setPrimaryColor] = useState('');

  useEffect(() => {
    // Get the computed style of the primary color
    const rootStyles = getComputedStyle(document.documentElement);
    const primaryColorValue = rootStyles.getPropertyValue('--primary');
    setPrimaryColor(primaryColorValue.trim());
  }, []);

  return (
    <div>
      <p className="mt-12 text-xs uppercase text-primary text-center font-bold tracking-[0.3em]">
        {logoCloudContent.heading}
      </p>
      <div className="grid grid-cols-1 place-items-center justify-center my-12 space-y-4 sm:mt-8 sm:space-y-0 md:mx-auto md:max-w-2xl sm:grid sm:gap-10 sm:grid-cols-6">
        <div className="flex items-center justify-center h-15 w-24">
          <a href={logoCloudContent.logos[0].href} aria-label={logoCloudContent.logos[0].ariaLabel}>
            <NextjsSvg className="size-full" style={{ color: primaryColor }} />
          </a>
        </div>
        <div className="flex items-center justify-center h-15 w-24">
          <a href={logoCloudContent.logos[1].href} aria-label={logoCloudContent.logos[1].ariaLabel}>
            <VercelSvg className="size-full" style={{ color: primaryColor }} />
          </a>
        </div>
        <div className="flex items-center justify-center h-12 w-24">
          <a href={logoCloudContent.logos[2].href} aria-label={logoCloudContent.logos[2].ariaLabel}>
            <StripeSvg className="size-full" style={{ color: primaryColor }} />
          </a>
        </div>
        <LogoSupacrawler />
        <div className="flex items-center justify-center h-15 w-24 sm:ml-8">
          <a href={logoCloudContent.logos[3].href} aria-label={logoCloudContent.logos[3].ariaLabel}>
            <SupabaseSvg
              className="size-full"
              style={{ color: primaryColor }}
            />
          </a>
        </div>
        <div className="flex items-center justify-center h-15 w-24">
          <a href={logoCloudContent.logos[4].href} aria-label={logoCloudContent.logos[4].ariaLabel}>
            <GithubSvg className="size-full" style={{ color: primaryColor }} />
          </a>
        </div>
      </div>
    </div>
  );
}
