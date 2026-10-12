import React, { useState } from 'react';
import { Award, GraduationCap, Phone, MapPin, CheckCircle, Sparkles, Mail, Instagram } from 'lucide-react';
import tapasMajumderPhoto from '../../assets/images/regenerated_image_1788766999494.png';

interface TeacherPortraitProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showBadges?: boolean;
}

export const TeacherPortrait: React.FC<TeacherPortraitProps> = ({
  className = '',
  size = 'hero',
  showBadges = true,
}) => {
  // Direct authentic photograph sources preserving real identity
  const candidateSources = [
    tapasMajumderPhoto,
    '/src/assets/images/regenerated_image_1788766999494.png',
    '/IMG_4747.PNG',
    '/IMG_4747.png',
    '/assets/tapas-majumder.png',
  ];
  const [sourceIndex, setSourceIndex] = useState(0);

  const handleImageError = () => {
    if (sourceIndex < candidateSources.length - 1) {
      setSourceIndex((prev) => prev + 1);
    }
  };

  return (
    <div className={`relative group select-none ${className}`}>
      
      {/* 1. Ambient Fluid Multi-layered Aura behind portrait */}
      <div
        aria-hidden="true"
        className="absolute -inset-6 rounded-[3.5rem] bg-gradient-to-tr from-purple-600/35 via-indigo-600/25 to-purple-400/20 blur-3xl opacity-80 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none motion-reduce:transition-none"
      />
      
      {/* 2. Secondary soft accent ring */}
      <div
        aria-hidden="true"
        className="absolute -inset-1 rounded-[3rem] bg-gradient-to-b from-purple-300/40 via-purple-500/20 to-transparent blur-sm pointer-events-none"
      />

      {/* 3. Subtle Molecular Orbit SVG Background Accent */}
      <svg
        className="absolute -top-10 -right-10 w-44 h-44 text-purple-600/20 animate-cp-orbit-slow pointer-events-none"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <ellipse cx="50" cy="50" rx="44" ry="18" transform="rotate(35 50 50)" />
        <ellipse cx="50" cy="50" rx="44" ry="18" transform="rotate(-35 50 50)" />
        <circle cx="50" cy="50" r="3" fill="currentColor" />
      </svg>

      {/* 4. Main Dimensional Frame with Glassmorphic Rim */}
      <div className="relative rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden bg-slate-950 border border-purple-200/50 shadow-2xl shadow-purple-950/25">
        
        {/* Subtle interior edge glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-white/10 z-10 pointer-events-none" />

        {/* Authentic Photograph Frame with natural aspect ratio */}
        <div className="relative w-full aspect-[4/5] overflow-hidden bg-slate-900">
          <img
            id="tapas-majumder-photo"
            src={candidateSources[sourceIndex] || tapasMajumderPhoto}
            alt="Tapas Majumder - Founder & Lead Chemistry Faculty of ChemPoint"
            className="w-full h-full object-cover object-top sm:object-center transform group-hover:scale-103 transition-transform duration-700 ease-out motion-reduce:transform-none motion-reduce:transition-none"
            referrerPolicy="no-referrer"
            onError={handleImageError}
          />

          {/* Organic lower gradient fade seamlessly integrating photograph into information strip */}
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent z-10 pointer-events-none" />

          {/* Teacher Identity Overlay inside photo baseline */}
          <div className="absolute bottom-4 inset-x-5 sm:inset-x-6 z-20 text-white">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-400/40 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse motion-reduce:animate-none" />
                Founder & Lead Faculty
              </span>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Tapas Majumder</span>
              <CheckCircle className="w-5 h-5 text-purple-400 fill-purple-400/20 shrink-0" />
            </h3>
            
            <p className="text-xs sm:text-sm text-purple-200 font-semibold mt-0.5">
              B.Sc, M.Sc in Chemistry, B.Ed
            </p>
          </div>
        </div>

        {/* Integrated Bottom Details & Contact Strip */}
        <div className="p-4 sm:p-5 bg-slate-950/95 border-t border-purple-900/40 text-slate-300 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
              <Award className="w-4 h-4 text-amber-400" />
              8+ Years Teaching Experience
            </span>
            <span className="flex items-center gap-1.5 text-purple-300 font-semibold">
              <GraduationCap className="w-4 h-4 text-purple-400" />
              Classes 9–12 & B.Sc
            </span>
          </div>

          {/* Interactive Teacher Contact Actions (Email, Phone, Instagram) */}
          <div className="pt-2.5 border-t border-slate-800/80 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href="tel:9366389429"
                aria-label="Call Tapas Majumder: 9366389429"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/60 hover:bg-slate-850 font-bold text-white hover:text-purple-300 transition-all duration-200 cursor-pointer group/call btn-tactile"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover/call:bg-emerald-500 group-hover/call:text-white transition-colors shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <span className="truncate text-[11px]">9366389429</span>
              </a>

              <a
                href="mailto:tapash489@gmail.com"
                aria-label="Email Tapas Majumder: tapash489@gmail.com"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/60 hover:bg-slate-850 font-bold text-white hover:text-purple-300 transition-all duration-200 cursor-pointer group/mail btn-tactile"
              >
                <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover/mail:bg-purple-600 group-hover/mail:text-white transition-colors shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span className="truncate text-[11px]">Email Faculty</span>
              </a>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px]">
              <a
                href="https://www.instagram.com/tapasmajumder.14/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Tapas Majumder Instagram profile @tapasmajumder.14"
                className="inline-flex items-center gap-1.5 text-purple-300 hover:text-pink-300 font-semibold transition-colors group/insta"
              >
                <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                  <Instagram className="w-3 h-3" />
                </div>
                <span className="group-hover/insta:underline">@tapasmajumder.14</span>
              </a>

              <span className="text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                Agartala (3 Centers)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Floating Translucent Chemistry Glass Badges */}
      {showBadges && (
        <>
          {/* Top Right Floating Specialization Pill */}
          <div className="hidden sm:flex absolute -top-3 -right-3 z-30 items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/92 backdrop-blur-xl text-purple-950 text-xs font-bold shadow-xl shadow-purple-950/10 border border-purple-200/80 transform hover:-translate-y-1 transition-transform animate-cp-float">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Specialized Chemistry</span>
          </div>

          {/* Bottom Left Floating Classroom Mediums Card */}
          <div className="hidden sm:flex absolute -bottom-3 -left-3 z-30 items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-xl text-slate-900 shadow-xl shadow-purple-950/10 border border-purple-100 transform hover:-translate-y-1 transition-transform animate-cp-float-delayed">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none">
                Bilingual Batches
              </p>
              <p className="text-xs font-black text-slate-900 mt-1">
                English & Bengali Medium
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
