'use client';

import { useEffect, useState } from 'react';

const BackgroundParallax = () => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect if mobile/touch device
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkMobile();
  }, []);

  useEffect(() => {
    if (isMobile) {
      // On mobile, use scroll position for horizontal movement
      const handleScroll = () => {
        const scrollY = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

        // Convert scroll to -1 to 1 range
        const scrollPercent = maxScroll > 0 ? (scrollY / maxScroll) * 2 - 1 : 0;

        setOffset({ x: scrollPercent * 0.3, y: 0 }); // Subtle horizontal shift based on scroll
      };

      // Initialize with current scroll position to prevent hop
      handleScroll();

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      // On desktop, use mouse position (horizontal only)
      const handleMouseMove = (e: MouseEvent) => {
        // Get mouse position relative to viewport center
        const centerX = window.innerWidth / 2;

        // Calculate offset from center as percentage (-1 to 1)
        const offsetX = (e.clientX - centerX) / centerX;

        setOffset({ x: offsetX, y: 0 });
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isMobile]);

  // Background moves opposite direction, more subtly (horizontal only)
  const translateX = -offset.x * 15;

  return (
    <div
      className="background-bg"
      style={{
        transform: `translateX(${translateX}px) scale(1.1)`,
        transition: 'transform 0.3s ease-out',
      }}
    />
  );
};

export default BackgroundParallax;
