
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { JSX } from 'react';
import './fun.css';

const snowflakeShapes = [
  // Classic 6-pointed snowflake
  <svg viewBox="0 0 24 24" fill="white" key="shape1">
    <path d="M12 2L12 22M2 12L22 12M6 6L18 18M18 6L6 18M12 2L9 5M12 2L15 5M12 22L9 19M12 22L15 19M2 12L5 9M2 12L5 15M22 12L19 9M22 12L19 15M6 6L9 9M6 6L3 9M18 18L15 15M18 18L21 15M18 6L15 9M18 6L21 9M6 18L9 15M6 18L3 15" stroke="white" strokeWidth="1" fill="none"/>
  </svg>,
  // Detailed snowflake
  <svg viewBox="0 0 24 24" fill="white" key="shape2">
    <path d="M12 3L12 21M5 12L19 12M7 7L17 17M17 7L7 17M12 3L10 6L12 6L14 6M12 21L10 18L14 18M5 12L8 10L8 14M19 12L16 10L16 14M7 7L9 10M17 17L15 14M17 7L14 9M7 17L10 15"/>
  </svg>,
  // 8-pointed snowflake
  <svg viewBox="0 0 24 24" fill="white" key="shape3">
    <path d="M12 2L12 22M2 12L22 12M5 5L19 19M19 5L5 19M12 2L11 4L13 4M12 22L11 20L13 20M2 12L4 11L4 13M22 12L20 11L20 13M5 5L7 7M19 19L17 17M19 5L17 7M5 19L7 17" stroke="white" strokeWidth="1" fill="none"/>
  </svg>,
  // Delicate branched snowflake
  <svg viewBox="0 0 24 24" fill="white" key="shape4">
    <path d="M12 3L12 21M3 12L21 12M6 6L18 18M18 6L6 18" stroke="white" strokeWidth="1.5" fill="none"/>
    <circle cx="12" cy="12" r="1.5" fill="white"/>
    <circle cx="12" cy="7" r="0.8" fill="white"/>
    <circle cx="12" cy="17" r="0.8" fill="white"/>
    <circle cx="7" cy="12" r="0.8" fill="white"/>
    <circle cx="17" cy="12" r="0.8" fill="white"/>
  </svg>,
  // Crystalline snowflake
  <svg viewBox="0 0 24 24" fill="white" key="shape5">
    <path d="M12 2L12 22M2 12L22 12M6 6L18 18M18 6L6 18" stroke="white" strokeWidth="0.8" fill="none"/>
    <path d="M12 6L10 8L14 8L12 6M12 18L10 16L14 16L12 18M6 12L8 10L8 14L6 12M18 12L16 10L16 14L18 12" fill="white"/>
  </svg>,
  // Hexagonal snowflake
  <svg viewBox="0 0 24 24" fill="white" key="shape6">
    <path d="M12 4L12 20M7 8L17 16M17 8L7 16" stroke="white" strokeWidth="1.2" fill="none"/>
    <path d="M12 4L11 6L13 6M12 20L11 18L13 18M7 8L9 9M17 16L15 15M17 8L15 9M7 16L9 15" stroke="white" strokeWidth="1" fill="none"/>
    <circle cx="12" cy="12" r="2" fill="none" stroke="white" strokeWidth="1"/>
  </svg>,
  // Fern-like snowflake
  <svg viewBox="0 0 24 24" fill="white" key="shape7">
    <path d="M12 2L12 22M2 12L22 12M6 6L18 18M18 6L6 18" stroke="white" strokeWidth="1" fill="none"/>
    <path d="M12 5L10 8L14 8M12 19L10 16L14 16M5 12L8 10L8 14M19 12L16 10L16 14M8 8L9 10M16 16L15 14M16 8L14 10M8 16L10 14" stroke="white" strokeWidth="0.8" fill="none"/>
  </svg>,
  // Intricate 12-pointed snowflake
  <svg viewBox="0 0 24 24" fill="white" key="shape8">
    <g stroke="white" strokeWidth="0.7" fill="none">
      <path d="M12 3L12 21M5 12L19 12M7 7L17 17M17 7L7 17"/>
      <path d="M12 6L12 18M7.5 10.5L16.5 13.5M16.5 10.5L7.5 13.5M9 9L15 15M15 9L9 15"/>
    </g>
  </svg>,
];

const Snowflakes = () => {
  const [snowflakes, setSnowflakes] = useState<JSX.Element[]>([]);
  const [offset, setOffset] = useState({ x: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [windActive, setWindActive] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Detect if mobile/touch device
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkMobile();
  }, []);

  // Trigger wind gust effect on route changes
  useEffect(() => {
    setWindActive(true);
    const timer = setTimeout(() => {
      setWindActive(false);
    }, 1600); // Full rotation duration
    return () => clearTimeout(timer);
  }, [pathname]);

  // Pre-trigger wind effect on link clicks (before navigation)
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');

      if (link && link.href && !link.href.startsWith('http') && !link.target) {
        // Internal navigation link - trigger wind effect early
        setWindActive(true);
      }
    };

    document.addEventListener('click', handleLinkClick, true);
    return () => document.removeEventListener('click', handleLinkClick, true);
  }, []);

  useEffect(() => {
    if (isMobile) {
      // On mobile, use scroll position
      const handleScroll = () => {
        const scrollY = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

        // Convert scroll to -1 to 1 range
        const scrollPercent = maxScroll > 0 ? (scrollY / maxScroll) * 2 - 1 : 0;

        setOffset({ x: scrollPercent * 0.5 }); // Horizontal shift based on scroll
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      // On desktop, use mouse position (horizontal only)
      const handleMouseMove = (e: MouseEvent) => {
        // Get mouse position relative to viewport center
        const centerX = window.innerWidth / 2;

        // Calculate offset from center as percentage
        const offsetX = (e.clientX - centerX) / centerX;

        setOffset({ x: offsetX });
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isMobile]);

  useEffect(() => {
    const createSnowflake = () => {
      const size = Math.random() * 15 + 8;
      // Spawn from 15vw to 135vw (relative to centered 150vw container) to cover viewport -10vw to 110vw
      const left = Math.random() * 120 + 15;
      const animationDuration = Math.random() * 5 + 5;
      const shapeIndex = Math.floor(Math.random() * snowflakeShapes.length);
      const rotationDuration = Math.random() * 6 + 4; // 4-10 seconds for rotation
      const rotationDirection = Math.random() > 0.5 ? 1 : -1; // Random direction

      return (
        <div
          key={Date.now() + Math.random()}
          className="snowflake"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${left}vw`,
            animationDuration: `${animationDuration}s`,
            // @ts-expect-error CSS custom properties
            '--rotation-duration': `${rotationDuration}s`,
            '--rotation-direction': rotationDirection,
          }}
        >
          {snowflakeShapes[shapeIndex]}
        </div>
      );
    };

    const interval = setInterval(() => {
      setSnowflakes((prev) => [...prev, createSnowflake()]);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Snowflakes move in same direction as mouse, more dramatically (70px horizontal movement)
  const translateX = offset.x * 70;

  return (
    <div
      className={`snowflakes ${windActive ? 'wind-active' : ''}`}
      style={{
        // @ts-expect-error CSS custom property
        '--translate-x': `${translateX}px`,
      }}
    >
      {snowflakes}
    </div>
  );
};

export default Snowflakes;
