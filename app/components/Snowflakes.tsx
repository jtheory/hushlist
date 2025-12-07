
'use client';

import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import './fun.css';

const Snowflakes = () => {
  const [snowflakes, setSnowflakes] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const createSnowflake = () => {
      const size = Math.random() * 5 + 2;
      const left = Math.random() * 100;
      const animationDuration = Math.random() * 5 + 5;

      return (
        <div
          key={Date.now() + Math.random()}
          className="snowflake"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${left}vw`,
            animationDuration: `${animationDuration}s`,
          }}
        ></div>
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
