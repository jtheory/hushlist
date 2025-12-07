'use client';

import { useEffect, useState } from 'react';

const BackgroundParallax = () => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = 2000; // Adjust this to control how far to scroll for full zoom
      const maxScale = 1.3; // Maximum zoom level
      const newScale = 1 + (scrollY / maxScroll) * (maxScale - 1);
      setScale(Math.min(newScale, maxScale));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="background-bg"
      style={{
        transform: `scale(${scale})`,
        transition: 'transform 0.1s ease-out',
      }}
    />
  );
};

export default BackgroundParallax;
