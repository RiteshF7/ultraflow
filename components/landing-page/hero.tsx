'use client';
import Link from 'next/link';
import { heroContent } from '@/config/landing-page';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Star, Loader2 } from 'lucide-react';
import Particles from '@/components/magicui/particles';
import Ripple from '@/components/magicui/ripple';
import AnimatedGradientText from '@/components/magicui/animated-shiny-text';
import AvatarCircles from '@/components/magicui/avatar-circles';
import { useTheme } from 'next-themes';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function HeroSection() {
  const { theme } = useTheme();
  const router = useRouter();
  const [currentQuote, setCurrentQuote] = useState(0)
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentQuote((prevQuote) => (prevQuote + 1) % heroContent.quotes.length)
    }, 5000) // Change quote every 5 seconds

    return () => clearInterval(intervalId)
  }, [])

  const handleGetStarted = () => {
    setIsNavigating(true)
    router.push(heroContent.cta.primary.href)
  }

  return (
    <section className="relative w-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Particles
          className="absolute inset-0"
          quantity={heroContent.particles.quantity}
          ease={heroContent.particles.ease}
          color={theme === 'dark' ? '#FFFFFF' : '#000000'}
          refresh
        />
        <Ripple />
      </div>
      <div className="container mx-auto px-4 py-12 md:py-16 lg:py-32">
        <div className="relative z-10 flex max-w-[64rem] flex-col items-center gap-4 text-center mx-auto">
          <div
            className={cn(
              'group rounded-full border border-black/5 bg-neutral-100 text-base text-secondary transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800',
            )}
          >
            <AnimatedGradientText className="inline-flex items-center justify-center gap-2 px-4 py-2">
              <span>{heroContent.announcement.emoji}</span>
              <span
                className={cn(
                  `animate-gradient bg-gradient-to-r from-[#b76a24] via-[#6a24b7] to-[#b76a24] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`,
                )}
              >
                {heroContent.announcement.text}
              </span>
            </AnimatedGradientText>
          </div>

          <h1 className="font-heading tracking-tight font-bold text-2xl sm:text-4xl md:text-5xl lg:text-6xl [text-shadow:0_0_2px_rgba(0,0,0,0.1)] dark:[text-shadow:0_0_20px_rgba(255,255,255,0.3)]">
            {heroContent.heading}
          </h1>
          <div className="max-w-[42rem] font-bold tracking-tight text-primary sm:text-xl sm:leading-8 rounded-full p-2">
            {heroContent.subheading}
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={handleGetStarted}
              disabled={isNavigating}
              className={cn(
                buttonVariants({ size: 'xl' }),
                'rounded-full border-2 border-primary dark:border-white text-bold text-white',
                isNavigating && 'opacity-90 cursor-not-allowed'
              )}
            >
              {isNavigating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                heroContent.cta.primary.text
              )}
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2 w-full">
            <AvatarCircles numPeople={heroContent.socialProof.totalUsers} avatarUrls={heroContent.socialProof.avatarUrls} />
            <div className="flex flex-col mt-2">
              <div className="flex flex-row justify-center sm:justify-start">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="fill-yellow-200 text-yellow-300 size-5"
                  />
                ))}
              </div>
              <span className="text-xs font-semibold">
                {heroContent.socialProof.displayText}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
