import React, { useRef, useState } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'interactive' | 'purple' | 'subtle' | 'dark' | 'outline' | 'flat';
  hoverable?: boolean;
  spotlight?: boolean;
  padded?: boolean | 'sm' | 'md' | 'lg' | 'none';
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'glass',
  hoverable = false,
  spotlight = true,
  padded = 'md',
  className = '',
  children,
  ...rest
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!spotlight || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      opacity: 1,
    });
  };

  const handleMouseLeave = () => {
    if (!spotlight) return;
    setMousePos((prev) => ({ ...prev, opacity: 0 }));
  };

  const variantStyles = {
    glass:
      'bg-white/85 backdrop-blur-xl border border-slate-200/80 shadow-xs text-slate-900',
    interactive:
      'bg-white/85 backdrop-blur-2xl border border-purple-200/70 shadow-sm text-slate-900 hover:border-purple-400/80 hover:shadow-xl hover:shadow-purple-950/5',
    purple:
      'bg-gradient-to-br from-purple-50/90 via-white/80 to-indigo-50/60 backdrop-blur-xl border border-purple-200/80 shadow-xs text-slate-900',
    subtle:
      'bg-slate-50/80 backdrop-blur-xs border border-slate-200/60 shadow-none text-slate-900',
    dark:
      'bg-gradient-to-br from-slate-950 via-purple-950/90 to-indigo-950 text-white border border-purple-900/60 shadow-xl shadow-purple-950/30',
    outline: 'bg-transparent border border-slate-200 text-slate-900',
    flat: 'bg-white border border-slate-100 shadow-2xs text-slate-900',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3.5 sm:p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const chosenPadding =
    typeof padded === 'boolean'
      ? padded
        ? paddingStyles.md
        : paddingStyles.none
      : paddingStyles[padded];

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 ${variantStyles[variant]} ${chosenPadding} ${
        hoverable ? 'card-hover-effect cursor-pointer' : ''
      } ${className}`}
      {...rest}
    >
      {/* Subtle cursor-following spotlight glow */}
      {spotlight && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px rounded-2xl sm:rounded-3xl transition-opacity duration-500 ease-out z-0"
          style={{
            opacity: mousePos.opacity,
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(168, 85, 247, 0.08), transparent 80%)`,
          }}
        />
      )}

      {/* Content wrapper */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
