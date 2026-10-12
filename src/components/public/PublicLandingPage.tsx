import React from 'react';
import {
  GraduationCap,
  BookOpen,
  Award,
  Phone,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  FlaskConical,
  Layers,
  Users,
  ShieldCheck,
  ChevronRight,
  Mail,
  Instagram,
} from 'lucide-react';
import { ChemPointLogo } from '../common/ChemPointLogo';
import { TeacherPortrait } from '../common/TeacherPortrait';
import { ScrollReveal } from '../common/ScrollReveal';
import { useAuth } from '../../context/AuthContext';

interface PublicLandingPageProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onExploreCourses: () => void;
}

export const PublicLandingPage: React.FC<PublicLandingPageProps> = ({
  onOpenLogin,
  onOpenRegister,
  onExploreCourses,
}) => {
  const { user } = useAuth();

  const academicPrograms = [
    {
      id: 'class-9',
      title: 'Class 9 Foundation Program',
      category: 'Science Group + Mathematics',
      badge: 'Classes 9–10',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      description:
        'Complete Science group (Physics, Chemistry, Biology) along with Mathematics. Builds an unshakeable foundation for senior secondary excellence.',
      highlights: [
        'Complete Science + Mathematics syllabus',
        'Conceptual foundation for senior science',
        'Board & foundation Olympiad alignment',
        'Regular DPPs and numerical problem drills',
      ],
      tag: 'Science & Maths',
      grade: 'Class 9',
    },
    {
      id: 'class-10',
      title: 'Class 10 Board Excellence',
      category: 'Science Group + Mathematics',
      badge: 'Board Target',
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200/80',
      description:
        'Intensive coaching in complete Science and Mathematics. Comprehensive preparation for Class 10 Board Examinations with chapter-wise assessments.',
      highlights: [
        'Complete Science + Mathematics coverage',
        'In-depth NCERT mastery & exemplar questions',
        'Regular chapter-wise test series & mock exams',
        'Special focus on board answer-writing technique',
      ],
      tag: 'Science & Maths',
      grade: 'Class 10',
    },
    {
      id: 'class-11',
      title: 'Class 11 Chemistry Program',
      category: 'Specialized Chemistry',
      badge: 'Senior Secondary',
      badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
      description:
        'Mastering Physical, Inorganic, and Organic Chemistry fundamentals. Bridge the gap from school science to senior competitive standards.',
      highlights: [
        'Physical Chemistry: Mole concept, Thermodynamics, Equilibrium',
        'Organic Chemistry: Basic principles, Nomenclature, Hydrocarbons',
        'Inorganic Chemistry: Periodic trends, Chemical Bonding',
        'Integrated NEET & JEE foundation problem-solving',
      ],
      tag: 'Chemistry Specialist',
      grade: 'Class 11',
    },
    {
      id: 'class-12',
      title: 'Class 12 Chemistry Program',
      category: 'Specialized Chemistry',
      badge: 'Board & Competitive',
      badgeColor: 'bg-amber-50 text-amber-900 border-amber-200/80',
      description:
        'Complete Class 12 Chemistry syllabus mastery. Rigorous preparation for Board examinations alongside NEET, JEE, and TBJEE entrance standards.',
      highlights: [
        'Physical Chemistry: Solutions, Electrochemistry, Kinetics',
        'Organic Chemistry: Complete reaction mechanisms & conversions',
        'Inorganic Chemistry: Coordination compounds & d-block',
        'Previous 10-year board questions & competitive drills',
      ],
      tag: 'Chemistry Specialist',
      grade: 'Class 12',
    },
    {
      id: 'bsc-chemistry',
      title: 'B.Sc Chemistry (Major & Minor)',
      category: 'Undergraduate University Degree',
      badge: 'MBB & TU University',
      badgeColor: 'bg-purple-50 text-purple-900 border-purple-300/80',
      description:
        'In-depth undergraduate coaching for B.Sc Chemistry Major and Minor students. Aligned specifically with Maharaja Bir Bikram (MBB) & Tripura University (TU) syllabi.',
      highlights: [
        'Advanced Organic, Inorganic & Physical Chemistry',
        'MBB University & Tripura University (TU) curriculum aligned',
        'Spectroscopy, Thermodynamics, Reaction Dynamics',
        'Comprehensive study notes & university exam question analysis',
      ],
      tag: 'Higher Education',
      grade: 'B.Sc (Degree)',
    },
  ];

  const coveredExams = [
    { name: 'CBSE', subtitle: 'Central Board' },
    { name: 'TBSE', subtitle: 'Tripura Board' },
    { name: 'ICSE / ISC', subtitle: 'Council Board' },
    { name: 'Board Exams', subtitle: 'Class 9–12 Boards' },
    { name: 'NEET', subtitle: 'National Medical' },
    { name: 'JEE Main & Adv', subtitle: 'National Engineering' },
    { name: 'TBJEE', subtitle: 'Tripura State Entrance' },
    { name: 'CUCET', subtitle: 'Central Universities' },
  ];

  const centers = [
    {
      name: 'Ker Chowmuhani Center',
      locality: 'Ker Chowmuhani, Agartala',
      description: 'Convenient batch timings for School & College students.',
      contact: '9366389429',
    },
    {
      name: 'Badharghat Center',
      locality: 'Badharghat, Agartala',
      description: 'Fully equipped classroom with focused batch sizes.',
      contact: '9366389429',
    },
    {
      name: 'Bordowali Center',
      locality: 'Bordowali, Agartala',
      description: 'Accessible learning center with separate medium batches.',
      contact: '9366389429',
    },
  ];

  return (
    <div className="w-full relative z-10 selection:bg-purple-600 selection:text-white">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-6 pb-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Brand Pill */}
              <ScrollReveal direction="down">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-purple-200/80 shadow-xs">
                  <ChemPointLogo className="w-6 h-6" />
                  <span className="text-xs font-black uppercase tracking-wider text-purple-950">
                    CHEMPOINT • A Chemistry Institution
                  </span>
                </div>
              </ScrollReveal>

              {/* Main Headline */}
              <ScrollReveal delay={80}>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-[1.14]">
                  Master Chemistry with{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-900">
                    Deep Clarity & Confidence
                  </span>
                </h1>
              </ScrollReveal>

              {/* Subtitle Description */}
              <ScrollReveal delay={140}>
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                  Premier academic coaching by <strong className="text-slate-900 font-bold">Tapas Majumder</strong>.
                  Comprehensive classroom courses & digital learning resources for{' '}
                  <span className="font-semibold text-slate-900">Classes 9 to 12</span>,{' '}
                  <span className="font-semibold text-slate-900">Complete Science & Maths (9–10)</span>, and{' '}
                  <span className="font-semibold text-purple-900">B.Sc Chemistry Major & Minor</span>.
                </p>
              </ScrollReveal>

              {/* Key Value Badges */}
              <ScrollReveal delay={180}>
                <div className="flex flex-wrap gap-2.5 pt-1 text-xs font-semibold text-slate-700">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    8+ Years Teaching Experience
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50/90 text-purple-900 border border-purple-200/80 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
                    English & Bengali Medium Batches
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50/90 text-indigo-900 border border-indigo-200/80 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    CBSE • TBSE • ICSE • NEET • JEE • TBJEE
                  </span>
                </div>
              </ScrollReveal>

              {/* CTAs */}
              <ScrollReveal delay={220}>
                <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                  {user ? (
                    <>
                      <button
                        type="button"
                        id="hero-btn-dashboard"
                        onClick={onExploreCourses}
                        className="px-6 py-3.5 rounded-2xl btn-primary-cp text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <GraduationCap className="w-4 h-4" />
                        <span>{user.role === 'admin' ? 'Go to Faculty Console' : 'Go to My Classes'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/90 backdrop-blur-md text-purple-900 border border-purple-200 text-xs font-semibold shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Signed in as <strong>{user.full_name}</strong> ({user.role === 'admin' ? 'Faculty Admin' : 'Student'})</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        id="hero-btn-create-account"
                        onClick={onOpenRegister}
                        className="px-6 py-3.5 rounded-2xl btn-primary-cp text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Create Student Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        id="hero-btn-signin"
                        onClick={onOpenLogin}
                        className="px-6 py-3.5 rounded-2xl bg-white/90 backdrop-blur-md hover:bg-white text-slate-900 font-bold text-sm border border-slate-300/90 hover:border-purple-300 shadow-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer btn-tactile"
                      >
                        <span>Sign In to Portal</span>
                      </button>

                      <button
                        type="button"
                        id="hero-btn-explore"
                        onClick={onExploreCourses}
                        className="px-5 py-3.5 rounded-2xl text-purple-900 hover:bg-purple-50/80 font-bold text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer btn-tactile"
                      >
                        <span>Explore Courses</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </ScrollReveal>

              {/* Direct Faculty Contact & Social Row */}
              <ScrollReveal delay={260}>
                <div className="pt-3 flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Phone className="w-4 h-4 text-emerald-600" />
                      Helpline:
                    </span>
                    <a
                      href="tel:9366389429"
                      aria-label="Call Tapas Majumder: 9366389429"
                      className="font-extrabold text-purple-700 hover:text-purple-900 hover:underline tracking-wide text-sm"
                    >
                      9366389429
                    </a>
                  </div>

                  <span className="text-slate-300 hidden sm:inline">•</span>

                  <a
                    href="mailto:tapash489@gmail.com"
                    aria-label="Email Tapas Majumder: tapash489@gmail.com"
                    className="inline-flex items-center gap-1.5 text-slate-700 hover:text-purple-700 font-semibold transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-purple-600" />
                    <span>tapash489@gmail.com</span>
                  </a>

                  <span className="text-slate-300 hidden sm:inline">•</span>

                  <a
                    href="https://www.instagram.com/tapasmajumder.14/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Tapas Majumder on Instagram: @tapasmajumder.14"
                    className="inline-flex items-center gap-1.5 text-purple-700 hover:text-pink-600 font-semibold transition-colors"
                  >
                    <Instagram className="w-3.5 h-3.5 text-pink-600" />
                    <span>@tapasmajumder.14</span>
                  </a>
                </div>
              </ScrollReveal>
            </div>

            {/* Right Column: Dimensional 3D Chemistry Composition */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
              {/* Floating Translucent Scientific Formula Card (Top Left) */}
              <div
                aria-hidden="true"
                className="hidden xl:flex absolute -top-6 -left-12 z-20 items-center gap-2.5 p-3 rounded-2xl bg-white/90 backdrop-blur-xl border border-purple-200/80 shadow-xl shadow-purple-950/10 animate-cp-float select-none"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-purple-800">Reaction Kinetics</p>
                  <p className="text-xs font-mono font-bold text-slate-700">k = A · e^(-Ea/RT)</p>
                </div>
              </div>

              {/* Floating Chemistry Metric Card (Bottom Right) */}
              <div
                aria-hidden="true"
                className="hidden xl:flex absolute -bottom-6 -right-6 z-20 items-center gap-2.5 p-3 rounded-2xl bg-slate-950/90 text-white backdrop-blur-xl border border-purple-800/60 shadow-2xl shadow-purple-950/30 animate-cp-float-delayed select-none"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-900/60 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Agartala Centers</p>
                  <p className="text-xs font-bold text-white">Ker Chowmuhani • Badharghat</p>
                </div>
              </div>

              {/* Orbital Molecular Geometry Ring */}
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-full border border-purple-400/20 pointer-events-none animate-cp-orbit-slow"
              />

              <ScrollReveal direction="left" delay={120} className="w-full max-w-sm sm:max-w-md relative z-10">
                <TeacherPortrait size="hero" showBadges={true} />
              </ScrollReveal>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. BOARD & COMPETITIVE EXAM COVERAGE TICKER */}
      {/* ========================================================================= */}
      <section className="bg-slate-950 text-white py-6 border-y border-purple-900/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Curriculum & Examination Alignment
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 w-full md:w-auto">
              {coveredExams.map((exam) => (
                <div
                  key={exam.name}
                  className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center hover:border-purple-500/50 hover:bg-slate-800/80 transition-colors"
                >
                  <p className="text-xs font-black text-white">{exam.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{exam.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FACULTY PROFILE & METHODOLOGY SECTION */}
      {/* ========================================================================= */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Qualifications & Identity */}
            <div className="lg:col-span-5 space-y-6">
              <ScrollReveal>
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50/90 px-3.5 py-1 rounded-full border border-purple-200">
                  Lead Faculty & Mentor
                </span>
                <h2 className="text-3xl font-black text-slate-900 mt-2.5 tracking-tight">
                  Tapas Majumder
                </h2>
                <p className="text-base font-bold text-purple-900 mt-1">
                  B.Sc, M.Sc in Chemistry, B.Ed
                </p>
                <p className="text-sm font-semibold text-slate-500">
                  8+ Years of Dedicated Teaching Experience
                </p>
              </ScrollReveal>

              {/* Bio & Philosophy */}
              <ScrollReveal delay={80}>
                <div className="space-y-3.5 text-sm text-slate-600 leading-relaxed">
                  <p>
                    At <strong className="text-slate-900 font-bold">ChemPoint</strong>, education is anchored in the belief
                    that chemistry is not a subject of rote memorization, but a profound conceptual discipline.
                    Every reaction mechanism, thermodynamic derivation, and molecular structure has an intuitive logic.
                  </p>
                  <p>
                    With more than eight years of dedicated classroom teaching across Tripura, Tapas Majumder provides
                    meticulously structured guidance tailored to both school board excellence (TBSE, CBSE, ICSE) and
                    competitive examinations (NEET, JEE, TBJEE, CUCET).
                  </p>
                </div>
              </ScrollReveal>

              {/* Key Credentials Pills */}
              <ScrollReveal delay={120}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-2xs card-hover-effect">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Academic Degrees</p>
                    <p className="text-sm font-black text-slate-900 mt-0.5">B.Sc, M.Sc (Chemistry), B.Ed</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-purple-50/90 backdrop-blur-md border border-purple-200/80 shadow-2xs card-hover-effect">
                    <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Classroom Experience</p>
                    <p className="text-sm font-black text-purple-950 mt-0.5">7+ Years Teaching</p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Connect with Tapas Majumder Card */}
              <ScrollReveal delay={160}>
                <div className="p-4.5 rounded-2xl bg-gradient-to-r from-purple-950 via-slate-950 to-indigo-950 text-white shadow-xl shadow-purple-950/10 border border-purple-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-purple-300">Connect with Tapas</p>
                      <p className="text-xs text-slate-300 mt-0.5">Official Faculty Contact & Academic Counseling</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-200 border border-purple-400/30">
                      Direct Access
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                    {/* Phone */}
                    <a
                      href="tel:9366389429"
                      aria-label="Call Tapas Majumder: 9366389429"
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-purple-900/50 hover:border-purple-400/60 transition-all duration-200 group/call cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover/call:bg-emerald-500 group-hover/call:text-white transition-colors shrink-0">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase font-bold text-slate-400 leading-tight">Call / WhatsApp</p>
                        <p className="font-bold text-white group-hover/call:text-purple-200 text-xs truncate">9366389429</p>
                      </div>
                    </a>

                    {/* Email */}
                    <a
                      href="mailto:tapash489@gmail.com"
                      aria-label="Email Tapas Majumder: tapash489@gmail.com"
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-purple-900/50 hover:border-purple-400/60 transition-all duration-200 group/mail cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover/mail:bg-purple-600 group-hover/mail:text-white transition-colors shrink-0">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase font-bold text-slate-400 leading-tight">Public Email</p>
                        <p className="font-bold text-white group-hover/mail:text-purple-200 text-xs truncate">tapash489@gmail.com</p>
                      </div>
                    </a>

                    {/* Instagram */}
                    <a
                      href="https://www.instagram.com/tapasmajumder.14/"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Visit Tapas Majumder Instagram: @tapasmajumder.14"
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-purple-900/50 hover:border-pink-500/60 transition-all duration-200 group/insta cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-xs shrink-0">
                        <Instagram className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase font-bold text-slate-400 leading-tight">Instagram</p>
                        <p className="font-bold text-white group-hover/insta:text-pink-300 text-xs truncate">@tapasmajumder.14</p>
                      </div>
                    </a>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right Column: Teaching Focus & Distinctive Strengths */}
            <div className="lg:col-span-7 space-y-4">
              <ScrollReveal>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Teaching Methodology & Core Competencies
                </h3>
              </ScrollReveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ScrollReveal delay={60}>
                  <div className="p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 hover:border-purple-300 card-hover-effect">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-800 mb-3 shadow-2xs">
                      <FlaskConical className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900">Concept-First Chemistry</h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      Organic reaction mechanisms, physical calculations, and inorganic trends taught through step-by-step logic, eliminating fear of reactions.
                    </p>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={100}>
                  <div className="p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 hover:border-purple-300 card-hover-effect">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-800 mb-3 shadow-2xs">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900">Complete Science & Maths (9–10)</h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      Complete Science group (Physics, Chemistry, Biology) and Mathematics taught systematically to ensure top tier board results.
                    </p>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={140}>
                  <div className="p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 hover:border-purple-300 card-hover-effect">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-800 mb-3 shadow-2xs">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900">B.Sc Chemistry Degree Specialist</h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      Dedicated university level guidance for B.Sc Chemistry Major and Minor students aligned with MBB University and Tripura University (TU).
                    </p>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={180}>
                  <div className="p-5 rounded-2xl bg-purple-50/90 backdrop-blur-md border border-purple-200/80 hover:border-purple-300 card-hover-effect">
                    <div className="w-10 h-10 rounded-xl bg-purple-200 flex items-center justify-center text-purple-900 mb-3 shadow-2xs">
                      <Users className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-bold text-purple-950">English & Bengali Medium</h4>
                    <p className="text-xs text-purple-900/80 mt-1.5 leading-relaxed">
                      Separate batches for English and Bengali medium students, ensuring seamless concept comprehension while building strong exam terminology.
                    </p>
                  </div>
                </ScrollReveal>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. ACADEMIC PROGRAMS & COURSES */}
      {/* ========================================================================= */}
      <section id="courses-section" className="py-16 lg:py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100/90 px-3.5 py-1 rounded-full border border-purple-200">
                Structured Academic Offerings
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 mt-3 tracking-tight">
                Classroom & Digital Learning Programs
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-2">
                Explore specialized academic tracks engineered for foundation development, board excellence, and competitive entrance preparation.
              </p>
            </div>
          </ScrollReveal>

          {/* Course Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {academicPrograms.map((prog, idx) => (
              <ScrollReveal key={prog.id} delay={idx * 60}>
                <div className="rounded-3xl glass-panel-interactive p-6 flex flex-col justify-between h-full group">
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-xl border border-purple-200/80">
                        {prog.grade}
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border ${prog.badgeColor}`}>
                        {prog.badge}
                      </span>
                    </div>

                    {/* Title & Category */}
                    <h3 className="text-xl font-bold text-slate-950 group-hover:text-purple-700 transition-colors">
                      {prog.title}
                    </h3>
                    <p className="text-xs font-bold text-purple-600 mt-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {prog.category}
                    </p>

                    <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                      {prog.description}
                    </p>

                    {/* Highlights List */}
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                      {prog.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action Area */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">
                      Eng & Beng Batches
                    </span>
                    <button
                      type="button"
                      onClick={user ? onExploreCourses : onOpenRegister}
                      className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-700 text-purple-700 hover:text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer btn-tactile"
                    >
                      <span>{user ? (user.role === 'admin' ? 'View Batches' : 'Go to My Classes') : 'Enroll Now'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            ))}

            {/* Special Callout Card: Separate Medium Batches */}
            <ScrollReveal delay={300}>
              <div className="rounded-3xl bg-gradient-to-br from-purple-950 via-slate-950 to-indigo-950 text-white border border-purple-800/60 p-6 flex flex-col justify-between shadow-xl shadow-purple-950/15 h-full">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-400/30 mb-4">
                    <Sparkles className="w-3.5 h-3.5" />
                    Language Inclusivity
                  </div>
                  <h3 className="text-xl font-black text-white">
                    Separate Batches for English & Bengali Medium
                  </h3>
                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                    We recognize the importance of learning scientific principles in your preferred language.
                    Students receive clear bilingual explanations with complete mastery of English scientific terms, formulas, and board presentation formats.
                  </p>
                  <div className="mt-5 space-y-2 text-xs text-slate-300">
                    <p className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Dedicated notes for both mediums
                    </p>
                    <p className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Board exam answer writing techniques
                    </p>
                    <p className="flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      One-on-one doubt clarification
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={user ? onExploreCourses : onOpenRegister}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer btn-tactile"
                  >
                    <span>{user ? (user.role === 'admin' ? 'Open Faculty Console' : 'Go to My Classes') : 'Register for Upcoming Batch'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. INSTITUTIONAL ACHIEVEMENTS & PILLARS */}
      {/* ========================================================================= */}
      <section className="py-16 bg-white/70 backdrop-blur-sm border-y border-purple-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                Institutional Pillars
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mt-2.5">
                Why Students & Parents Trust ChemPoint
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ScrollReveal delay={60}>
              <div className="p-6 rounded-2xl bg-white/90 border border-slate-200/80 text-center card-hover-effect">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-black text-xl mb-3 shadow-2xs">
                  7+
                </div>
                <h3 className="text-base font-bold text-slate-900">Years of Experience</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Continuous track record of shaping student conceptual foundations and board achievements.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={120}>
              <div className="p-6 rounded-2xl bg-white/90 border border-slate-200/80 text-center card-hover-effect">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center mb-3 shadow-2xs">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Curated Materials & DPPs</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Handcrafted chapter notes, numerical problem sheets, and board revision compilations.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={180}>
              <div className="p-6 rounded-2xl bg-white/90 border border-slate-200/80 text-center card-hover-effect">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3 shadow-2xs">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Chapter-wise Test Series</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Regular evaluation simulating exact board and entrance exam formats for confidence.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={240}>
              <div className="p-6 rounded-2xl bg-white/90 border border-slate-200/80 text-center card-hover-effect">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3 shadow-2xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Personal Doubt Resolution</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Direct faculty interaction where every student query is resolved thoroughly.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CLASSROOM CENTERS & CONTACT DETAILS */}
      {/* ========================================================================= */}
      <section className="py-16 lg:py-20 bg-slate-950 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column: Contact Details */}
            <div className="lg:col-span-5 space-y-6">
              <ScrollReveal>
                <div className="flex items-center gap-3">
                  <ChemPointLogo className="w-10 h-10" />
                  <div>
                    <h3 className="text-2xl font-black text-white">ChemPoint</h3>
                    <p className="text-xs text-purple-300 font-semibold tracking-wide">A Chemistry Institution</p>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed mt-4">
                  Enrollment is currently open for the academic session. For batch timings, fee structures, and classroom seat availability across our three Agartala centers, get in touch directly.
                </p>
              </ScrollReveal>

              {/* Admissions & Teacher Contact Information Cards */}
              <ScrollReveal delay={80}>
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-900/40 space-y-4 shadow-xl shadow-purple-950/20">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">
                      <Phone className="w-4 h-4" />
                      Primary Admissions Contact
                    </div>
                    <a
                      href="tel:9366389429"
                      aria-label="Call Admissions: 9366389429"
                      className="text-2xl sm:text-3xl font-black text-white hover:text-purple-300 transition-colors block tracking-tight"
                    >
                      9366389429
                    </a>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Direct Line to Faculty Tapas Majumder (Calls & WhatsApp)
                    </p>
                  </div>

                  {/* Complete Faculty Contact Row */}
                  <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <a
                      href="mailto:tapash489@gmail.com"
                      aria-label="Email Faculty Tapas Majumder: tapash489@gmail.com"
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-purple-500/60 text-slate-200 hover:text-white transition-all group/mail"
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover/mail:bg-purple-600 group-hover/mail:text-white transition-colors shrink-0">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Email Faculty</p>
                        <p className="font-bold truncate text-xs">tapash489@gmail.com</p>
                      </div>
                    </a>

                    <a
                      href="https://www.instagram.com/tapasmajumder.14/"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Tapas Majumder Instagram profile @tapasmajumder.14"
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-pink-500/60 text-slate-200 hover:text-white transition-all group/insta"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Instagram className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Instagram</p>
                        <p className="font-bold truncate text-xs group-hover/insta:text-pink-300">@tapasmajumder.14</p>
                      </div>
                    </a>
                  </div>
                </div>
              </ScrollReveal>

              {/* Quick Actions */}
              <ScrollReveal delay={120}>
                <div className="flex flex-wrap gap-3">
                  {user ? (
                    <button
                      type="button"
                      onClick={onExploreCourses}
                      className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-2 btn-tactile"
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>{user.role === 'admin' ? 'Open Faculty Console' : 'Go to My Classes'}</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={onOpenRegister}
                        className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors cursor-pointer btn-tactile"
                      >
                        Register Online
                      </button>
                      <button
                        type="button"
                        onClick={onOpenLogin}
                        className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 transition-colors cursor-pointer btn-tactile"
                      >
                        Student Sign In
                      </button>
                    </>
                  )}
                </div>
              </ScrollReveal>
            </div>

            {/* Right Column: Classroom Locations */}
            <div className="lg:col-span-7 space-y-4">
              <ScrollReveal>
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-400" />
                    Classroom Centers in Agartala
                  </h4>
                  <span className="text-xs font-semibold text-purple-300">3 Verified Centers</span>
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {centers.map((c, i) => (
                  <ScrollReveal key={c.name} delay={i * 80}>
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-purple-500/60 transition-colors h-full">
                      <div>
                        <div className="w-8 h-8 rounded-xl bg-purple-900/50 text-purple-300 flex items-center justify-center font-bold text-xs mb-3 border border-purple-700/50 shadow-2xs">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <h5 className="text-sm font-bold text-white">{c.name}</h5>
                        <p className="text-xs text-purple-300 font-medium mt-1">{c.locality}</p>
                        <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{c.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Phone:</span>
                        <a href={`tel:${c.contact}`} className="font-bold text-white hover:text-purple-300">
                          {c.contact}
                        </a>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>

              {/* Institution Guarantee */}
              <ScrollReveal delay={200}>
                <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-xs text-purple-200 flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-purple-400 shrink-0" />
                  <span>
                    Students can attend batches at any of the three centers with identical curriculum progression and synchronized study materials.
                  </span>
                </div>
              </ScrollReveal>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FOOTER */}
      {/* ========================================================================= */}
      <footer className="py-12 bg-slate-950 text-slate-400 text-xs border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Institution Brand */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-3">
                <ChemPointLogo className="w-8 h-8" />
                <div>
                  <h4 className="text-base font-black text-white">ChemPoint</h4>
                  <p className="text-[11px] text-purple-300 font-semibold">A Chemistry Institution • Agartala</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Dedicated conceptual coaching for Classes 9–12, Complete Science & Mathematics (9–10), and B.Sc Chemistry Major & Minor across Tripura.
              </p>
            </div>

            {/* Official Contact Column */}
            <div className="md:col-span-4 space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-purple-400">Faculty Contact</p>
              <div>
                <p className="text-sm font-black text-white">Tapas Majumder</p>
                <p className="text-xs text-purple-200 font-medium">B.Sc, M.Sc in Chemistry, B.Ed</p>
                <p className="text-[11px] text-slate-400">8+ Years Teaching Experience</p>
              </div>

              <div className="pt-1 space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-slate-400">Phone:</span>
                  <a
                    href="tel:9366389429"
                    aria-label="Call Tapas Majumder at 9366389429"
                    className="font-bold text-white hover:text-purple-300 transition-colors"
                  >
                    9366389429
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="text-slate-400">Email:</span>
                  <a
                    href="mailto:tapash489@gmail.com"
                    aria-label="Email Tapas Majumder at tapash489@gmail.com"
                    className="font-bold text-white hover:text-purple-300 transition-colors"
                  >
                    tapash489@gmail.com
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <Instagram className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span className="text-slate-400">Instagram:</span>
                  <a
                    href="https://www.instagram.com/tapasmajumder.14/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Tapas Majumder Instagram profile @tapasmajumder.14"
                    className="font-bold text-purple-300 hover:text-pink-300 hover:underline transition-colors"
                  >
                    @tapasmajumder.14
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links & Centers */}
            <div className="md:col-span-3 space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-purple-400">Classroom Centers</p>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Ker Chowmuhani Center</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Badharghat Center</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Bordowali Center</span>
                </li>
              </ul>
              <div className="pt-2">
                {user ? (
                  <button
                    type="button"
                    onClick={onExploreCourses}
                    className="text-xs text-purple-300 hover:text-white cursor-pointer font-bold transition-colors"
                  >
                    Open {user.role === 'admin' ? 'Faculty Portal' : 'Student Portal'} &rarr;
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="text-xs text-purple-300 hover:text-white cursor-pointer font-bold transition-colors"
                  >
                    Student / Faculty Login &rarr;
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <span>
              © {new Date().getFullYear()} ChemPoint — A Chemistry Institution. All rights reserved.
            </span>
            <div className="flex items-center gap-3">
              <span>Agartala, Tripura</span>
              <span>•</span>
              <a
                href="https://www.instagram.com/tapasmajumder.14/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-pink-300 transition-colors"
              >
                Instagram: @tapasmajumder.14
              </a>
              <span>•</span>
              <a href="tel:9366389429" className="text-purple-400 hover:text-purple-300 transition-colors">
                Helpline: 9366389429
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
