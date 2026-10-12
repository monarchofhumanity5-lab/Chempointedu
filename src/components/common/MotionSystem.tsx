import React, { useEffect, useState } from 'react';

/**
 * AnimatedCounter: smoothly increments from 0 to target number
 */
export const AnimatedCounter: React.FC<{
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}> = ({ value, duration = 1200, suffix = '', prefix = '', className = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Respect reduced motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(value);
      return;
    }

    let startTimestamp: number | null = null;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(easeProgress * value));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
};

/**
 * SkeletonShimmer: high-end skeleton loader with smooth purple tint
 */
export const SkeletonShimmer: React.FC<{
  className?: string;
}> = ({ className = 'h-4 w-full rounded-xl' }) => {
  return (
    <div
      className={`relative overflow-hidden bg-slate-200/70 dark:bg-slate-800/70 ${className}`}
    >
      <div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-purple-300/25 to-transparent animate-[shimmer_1.8s_infinite]"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(168,85,247,0.12) 50%, rgba(255,255,255,0) 100%)',
        }}
      />
    </div>
  );
};
