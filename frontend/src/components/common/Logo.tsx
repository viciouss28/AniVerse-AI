import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const dimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  }[size];

  return (
    <div className={`relative flex items-center justify-center ${dimensions} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="logo-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>

          <linearGradient id="orbit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.8" />
          </linearGradient>

          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer dashed orbital guide ring */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="#8B5CF6"
          strokeWidth="1"
          strokeOpacity="0.3"
          strokeDasharray="3 3"
        />

        {/* Tilted Orbit Ring */}
        <ellipse
          cx="50"
          cy="50"
          rx="44"
          ry="17"
          stroke="url(#orbit-grad)"
          strokeWidth="2.5"
          transform="rotate(-25 50 50)"
        />

        {/* Main central dark badge */}
        <circle
          cx="50"
          cy="50"
          r="32"
          fill="#0B0C14"
          stroke="url(#logo-glow)"
          strokeWidth="2"
          filter="url(#shadow)"
        />

        {/* Geometric 'A' */}
        {/* Left leg */}
        <path
          d="M 33 67 L 48 31 H 52 L 67 67 H 60 L 55 54 H 45 L 40 67 Z"
          fill="#F8FAFC"
        />
        {/* Cyan horizontal crossbar */}
        <rect x="42" y="55" width="16" height="3" fill="#22D3EE" rx="1.5" />

        {/* Top cyan glowing dot */}
        <circle cx="50" cy="27" r="3.5" fill="#22D3EE" />
      </svg>
    </div>
  );
};
