import React, { useEffect, useState } from 'react';

interface AmbientBackgroundProps {
  variant?: 'default' | 'public' | 'portal' | 'dark';
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  variant = 'default',
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Only track pointer gently on desktop screens with fine pointer
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)');
    if (!mediaQuery.matches) return;

    let frameId: number;
    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        // Very subtle fractional offset (-16px to +16px max)
        const xOffset = ((e.clientX / window.innerWidth) - 0.5) * 32;
        const yOffset = ((e.clientY / window.innerHeight) - 0.5) * 32;
        setMousePos({ x: xOffset, y: yOffset });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
    >
      {/* Dynamic Parallax Container */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`,
          transition: 'transform 1.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Layer 1: Primary ChemPoint Aurora Gradient Orb (Top Left/Center) */}
        <div
          className="absolute -top-40 left-1/5 w-[680px] h-[640px] rounded-full bg-gradient-to-br from-purple-600/10 via-indigo-600/8 to-transparent blur-[130px] animate-cp-aurora-1"
        />

        {/* Layer 2: Electric Violet / Blue Atmosphere (Mid Right) */}
        <div
          className="absolute top-1/4 -right-40 w-[720px] h-[680px] rounded-full bg-gradient-to-bl from-indigo-500/8 via-purple-600/7 to-transparent blur-[140px] animate-cp-aurora-2"
        />

        {/* Layer 3: Deep Lower Violet Glow (Bottom Left) */}
        <div
          className="absolute -bottom-48 left-1/10 w-[780px] h-[700px] rounded-full bg-gradient-to-tr from-purple-700/8 via-indigo-500/6 to-transparent blur-[150px] animate-cp-aurora-3"
        />

        {/* Layer 4: Floating Micro Scientific Geometric Watermark (Hexagonal Carbon Lattice) */}
        <svg
          className="absolute top-1/3 right-1/6 w-96 h-96 opacity-[0.025] text-purple-900 pointer-events-none animate-cp-orbit-slow"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.75"
        >
          <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" />
          <polygon points="50,20 76,35 76,65 50,80 24,65 24,35" strokeDasharray="2,2" />
          <circle cx="50" cy="50" r="12" strokeWidth="0.5" />
          <line x1="50" y1="5" x2="50" y2="20" />
          <line x1="90" y1="27.5" x2="76" y2="35" />
          <line x1="90" y1="72.5" x2="76" y2="65" />
          <line x1="50" y1="95" x2="50" y2="80" />
          <line x1="10" y1="72.5" x2="24" y2="65" />
          <line x1="10" y1="27.5" x2="24" y2="35" />
        </svg>

        {/* Secondary Floating Ring */}
        <svg
          className="absolute bottom-1/4 left-12 w-64 h-64 opacity-[0.02] text-indigo-900 pointer-events-none animate-cp-orbit-reverse"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
        >
          <ellipse cx="50" cy="50" rx="42" ry="20" transform="rotate(-30 50 50)" />
          <ellipse cx="50" cy="50" rx="42" ry="20" transform="rotate(30 50 50)" />
          <circle cx="50" cy="50" r="4" fill="currentColor" />
        </svg>
      </div>

      {/* Layer 5: Subtle Sub-Pixel Grid for Academic Precision & Depth */}
      <div className="absolute inset-0 opacity-[0.018] bg-[radial-gradient(#6b21a8_1px,transparent_1px)] [background-size:28px_28px]" />
    </div>
  );
};
