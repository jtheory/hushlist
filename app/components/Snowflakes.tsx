
'use client';

import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import './fun.css';

const snowflakeShapes = [
  // Classic 6-pointed snowflake
  <svg viewBox="0 0 24 24" fill="white" key="shape1">
    <path d="M12 2L12 22M2 12L22 12M6 6L18 18M18 6L6 18M12 2L9 5M12 2L15 5M12 22L9 19M12 22L15 19M2 12L5 9M2 12L5 15M22 12L19 9M22 12L19 15M6 6L9 9M6 6L3 9M18 18L15 15M18 18L21 15M18 6L15 9M18 6L21 9M6 18L9 15M6 18L3 15" stroke="white" strokeWidth="1" fill="none"/>
  </svg>,
  // Simple star snowflake
  <svg viewBox="0 0 24 24" fill="white" key="shape2">
    <path d="M12 1L14 10H23L16 15L19 24L12 18L5 24L8 15L1 10H10L12 1Z"/>
  </svg>,
  // Detailed snowflake
  <svg viewBox="0 0 24 24" fill="white" key="shape3">
    <path d="M12 3L12 21M5 12L19 12M7 7L17 17M17 7L7 17M12 3L10 6L12 6L14 6M12 21L10 18L14 18M5 12L8 10L8 14M19 12L16 10L16 14M7 7L9 10M17 17L15 14M17 7L14 9M7 17L10 15"/>
  </svg>,
  // 8-pointed snowflake
  <svg viewBox="0 0 24 24" fill="white" key="shape4">
    <path d="M12 2L12 22M2 12L22 12M5 5L19 19M19 5L5 19M12 2L11 4L13 4M12 22L11 20L13 20M2 12L4 11L4 13M22 12L20 11L20 13M5 5L7 7M19 19L17 17M19 5L17 7M5 19L7 17" stroke="white" strokeWidth="1" fill="none"/>
  </svg>,
  // Delicate branched snowflake
  <svg viewBox="0 0 24 24" fill="white" key="shape5">
    <path d="M12 3L12 21M3 12L21 12M6 6L18 18M18 6L6 18" stroke="white" strokeWidth="1.5" fill="none"/>
    <circle cx="12" cy="12" r="1.5" fill="white"/>
    <circle cx="12" cy="7" r="0.8" fill="white"/>
    <circle cx="12" cy="17" r="0.8" fill="white"/>
    <circle cx="7" cy="12" r="0.8" fill="white"/>
    <circle cx="17" cy="12" r="0.8" fill="white"/>
  </svg>,
];

const Snowflakes = () => {
  const [snowflakes, setSnowflakes] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const createSnowflake = () => {
      const size = Math.random() * 15 + 8;
      const left = Math.random() * 100;
      const animationDuration = Math.random() * 5 + 5;
      const shapeIndex = Math.floor(Math.random() * snowflakeShapes.length);
      const rotation = Math.random() * 360;

      return (
        <div
          key={Date.now() + Math.random()}
          className="snowflake"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${left}vw`,
            animationDuration: `${animationDuration}s`,
            transform: `rotate(${rotation}deg)`,
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

  return <div className="snowflakes">{snowflakes}</div>;
};

export default Snowflakes;
