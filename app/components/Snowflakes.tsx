
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { JSX } from 'react';
import './fun.css';

const snowflakeShapes = [
  // Simple 6-pointed
  <svg viewBox="0 0 24 24" fill="white" key="shape1">
    <path d="M12 2L12 22M2 12L22 12M6 6L18 18M18 6L6 18" stroke="white" strokeWidth="1" fill="none"/>
  </svg>,
  // 8-pointed
  <svg viewBox="0 0 24 24" fill="white" key="shape2">
    <path d="M12 3L12 21M5 12L19 12M7 7L17 17M17 7L7 17" stroke="white" strokeWidth="1" fill="none"/>
  </svg>,
  // Dotted center
  <svg viewBox="0 0 24 24" fill="white" key="shape3">
    <path d="M12 4L12 20M6 12L18 12M8 8L16 16M16 8L8 16" stroke="white" strokeWidth="1" fill="none"/>
    <circle cx="12" cy="12" r="1" fill="white"/>
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
    }, 4000); // Match wind animation duration
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

  // Listen for custom wind trigger events
  useEffect(() => {
    const handleWindTrigger = () => {
      setWindActive(true);
      const timer = setTimeout(() => {
        setWindActive(false);
      }, 4000); // Match wind animation duration
      return () => clearTimeout(timer);
    };

    window.addEventListener('triggerWind', handleWindTrigger);
    return () => window.removeEventListener('triggerWind', handleWindTrigger);
  }, []);

  useEffect(() => {
    let rafId: number | null = null;
    let latestValue = 0;

    if (isMobile) {
      // On mobile, use scroll position
      const handleScroll = () => {
        const scrollY = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = maxScroll > 0 ? (scrollY / maxScroll) * 2 - 1 : 0;
        latestValue = scrollPercent * 0.5;

        if (rafId === null) {
          rafId = requestAnimationFrame(() => {
            setOffset({ x: latestValue });
            rafId = null;
          });
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
        if (rafId !== null) cancelAnimationFrame(rafId);
      };
    } else {
      // On desktop, use mouse position (horizontal only)
      const handleMouseMove = (e: MouseEvent) => {
        const centerX = window.innerWidth / 2;
        const offsetX = (e.clientX - centerX) / centerX;
        latestValue = offsetX;

        if (rafId === null) {
          rafId = requestAnimationFrame(() => {
            setOffset({ x: latestValue });
            rafId = null;
          });
        }
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        if (rafId !== null) cancelAnimationFrame(rafId);
      };
    }
  }, [isMobile]);

  const createSnowflake = () => {
    const size = Math.random() * 15 + 8;
    // Spawn from 15vw to 135vw (relative to centered 150vw container) to cover viewport -10vw to 110vw
    const left = Math.random() * 120 + 15;
    const animationDuration = Math.random() * 5 + 8; // 8-13 seconds to fall
    const shapeIndex = Math.floor(Math.random() * snowflakeShapes.length);
    const rotationDuration = Math.random() * 6 + 4; // 4-10 seconds for rotation
    const rotationDirection = Math.random() > 0.5 ? 1 : -1; // Random direction
    const id = `snow-${Date.now()}-${Math.random()}`;

    return (
      <div
        key={id}
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
        onAnimationIteration={(e) => {
          // Remove snowflake after it completes one fall cycle
          if (e.animationName === 'fall') {
            setSnowflakes((prev) => prev.filter((sf) => sf.key !== id));
          }
        }}
      >
        {snowflakeShapes[shapeIndex]}
      </div>
    );
  };

  useEffect(() => {
    const MAX_SNOWFLAKES = 300;
    const CREATION_INTERVAL = 100; // Create new snowflake every 100ms (~30s to reach max)

    const interval = setInterval(() => {
      setSnowflakes((prev) => {
        // Keep creating new snowflakes to maintain count
        if (prev.length < MAX_SNOWFLAKES) {
          return [...prev, createSnowflake()];
        }
        return prev;
      });
    }, CREATION_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Create extra snowflakes rapidly during wind gusts
  useEffect(() => {
    if (!windActive) return;

    const WIND_CREATION_INTERVAL = 30; // Much faster during wind
    const interval = setInterval(() => {
      setSnowflakes((prev) => [...prev, createSnowflake()]);
    }, WIND_CREATION_INTERVAL);

    return () => clearInterval(interval);
  }, [windActive]);

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
