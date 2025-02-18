'use client';

import FloatingElements from './floating-elements';
import GetStartedButton from './get-started-button';
import GradientHeadline from './gradient-headline';
<<<<<<< HEAD
=======
import { fireConfetti, fireRocket } from '@/lib/confetti';
import { Badge } from '@tutur3u/ui/badge';
import { Card } from '@tutur3u/ui/card';
>>>>>>> main
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRef, useState } from 'react';

export default function MarketingPage() {
  const t = useTranslations();

  const logoRef = useRef<HTMLDivElement>(null);
  const [, setMousePosition] = useState({ x: 0, y: 0 });
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-100, 100], [30, -30]));
  const rotateY = useSpring(useTransform(mouseX, [-100, 100], [-30, 30]));

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!logoRef.current) return;
    const rect = logoRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setMousePosition({ x, y });
    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <div
      className="relative -mt-[53px] flex w-full flex-col items-center"
      suppressHydrationWarning
    >
      <FloatingElements />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="from-background via-background to-dynamic-light-pink/10 relative min-h-[calc(100vh-3.5rem+53px)] w-full bg-gradient-to-b"
      >
        {/* Enhanced Animated Background Patterns */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute -left-32 top-0 h-[20rem] w-[20rem] rounded-full bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-transparent blur-3xl sm:-left-64 sm:h-[40rem] sm:w-[40rem]"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute -right-32 top-[30%] h-[17.5rem] w-[17.5rem] rounded-full bg-gradient-to-br from-blue-500/30 via-cyan-500/20 to-transparent blur-3xl sm:-right-64 sm:h-[35rem] sm:w-[35rem]"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute -bottom-32 left-1/2 h-[22.5rem] w-[22.5rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-green-500/20 via-emerald-500/15 to-transparent blur-3xl sm:-bottom-64 sm:h-[45rem] sm:w-[45rem]"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.05)_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(var(--primary-rgb),0.02)_1px,transparent_1px)] bg-[size:120px] opacity-20" />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.15, 0.1] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(var(--primary-rgb),0.05),transparent)]"
          />
        </div>

        {/* Main Content */}
        <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-32">
          {/* Enhanced 3D Floating Logo */}
          <motion.div
            ref={logoRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
              mouseX.set(0);
              mouseY.set(0);
            }}
            style={{ perspective: 1000 }}
            className="group relative mb-12"
          >
            <motion.div
              style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
              }}
              className="relative"
            >
              <div className="from-primary/20 absolute inset-0 -z-10 rounded-full bg-gradient-to-br via-transparent to-transparent opacity-50 blur-lg transition-all duration-300 group-hover:opacity-100" />
              <Image
                src="/media/logos/transparent.png"
                width={200}
                height={200}
                alt="Smart Agri Logo"
                priority
                className="relative transition-all duration-300 group-hover:scale-110 group-hover:brightness-110"
              />
            </motion.div>
          </motion.div>

          {/* Enhanced Headline and CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative text-center"
          >
            <div className="from-primary/20 via-primary/10 to-primary/20 absolute -inset-x-4 -inset-y-2 rounded-xl bg-gradient-to-r opacity-0 blur-xl transition-all duration-300 group-hover:opacity-100" />
            <h1 className="text-foreground relative mx-auto mb-4 text-center text-2xl font-bold tracking-tight md:text-4xl lg:text-6xl">
              <span className="from-primary/20 to-primary/10 absolute -inset-1 rounded-lg bg-gradient-to-r opacity-0 blur transition-all duration-300 group-hover:opacity-100" />
              <GradientHeadline title={t('landing.headline')} />
            </h1>
            <h2 className="text-foreground mb-12 text-balance text-lg font-bold tracking-tight md:text-2xl lg:text-3xl">
              {t('landing.subheadline')}
            </h2>

            <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
              <GetStartedButton href="/login" />
            </div>
          </motion.div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-x-0 bottom-12 flex w-full flex-col items-center"
        >
          <div className="text-muted-foreground flex flex-col items-center gap-2">
            <span className="text-sm font-medium">
              {t('common.scroll_to_explore')}
            </span>
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="relative h-8 w-8"
            >
              <div className="bg-primary/20 absolute inset-0 animate-ping rounded-full" />
              <div className="bg-primary/10 relative flex h-full w-full items-center justify-center rounded-full">
                ↓
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
