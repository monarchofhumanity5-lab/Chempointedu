import React from 'react';
import chempointLogoImage from '../../assets/images/regenerated_image_1788767009328.png';

interface ChemPointLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  tagline?: boolean;
  variant?: 'light' | 'dark' | 'full';
}

export const ChemPointLogo: React.FC<ChemPointLogoProps> = ({
  className = 'w-10 h-10',
  size,
  showText = false,
  tagline = false,
  variant = 'full',
}) => {
  const dimension = size ? (typeof size === 'number' ? `${size}px` : size) : undefined;

  const [logoSrc, setLogoSrc] = React.useState<string>(chempointLogoImage);
  const [hasFailed, setHasFailed] = React.useState(false);

  return (
    <div className={`flex items-center gap-3 ${showText ? 'select-none' : ''}`}>
      {/* Official Uploaded ChemPoint Logo Badge */}
      <div
        className={`relative shrink-0 flex items-center justify-center rounded-full transition-transform duration-300 hover:scale-105 overflow-hidden ${className}`}
        style={dimension ? { width: dimension, height: dimension } : undefined}
      >
        {!hasFailed ? (
          <img
            id="chempoint-official-logo"
            src={logoSrc || chempointLogoImage || '/chempoint-logo.svg'}
            alt="ChemPoint - A Chemistry Institution"
            className="w-full h-full object-contain drop-shadow-md select-none pointer-events-none"
            referrerPolicy="no-referrer"
            onError={() => {
              if (logoSrc === chempointLogoImage) {
                setLogoSrc('/src/assets/images/regenerated_image_1788767009328.png');
              } else if (logoSrc === '/src/assets/images/regenerated_image_1788767009328.png') {
                setLogoSrc('/chempoint-logo.svg');
              } else {
                setHasFailed(true);
              }
            }}
          />
        ) : (
          /* Stylized SVG Crest Fallback in Institution Colors */
          <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-950 via-purple-900 to-amber-950 border border-amber-400/40 flex items-center justify-center p-1.5 shadow-inner">
            <svg viewBox="0 0 48 48" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="22" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" />
              <path d="M20 12h8v4l-4 6-4-6v-4z" fill="#f8fafc" />
              <path d="M16 22l8 12 8-12H16z" fill="#9333ea" opacity="0.85" />
              <circle cx="24" cy="24" r="3" fill="#f59e0b" />
            </svg>
          </div>
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`text-xl font-extrabold tracking-tight ${
                variant === 'dark' ? 'text-white' : 'text-slate-900'
              }`}
            >
              CHEM<span className="text-purple-600">POINT</span>
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
              Est. 2017
            </span>
          </div>
          {tagline && (
            <p
              className={`text-xs font-semibold tracking-wide ${
                variant === 'dark' ? 'text-purple-200/80' : 'text-purple-900/70'
              }`}
            >
              A Chemistry Institution
            </p>
          )}
        </div>
      )}
    </div>
  );
};
