import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Users,
  BookOpen,
  MapPin,
  Calendar,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import Logo from '../ui/Logo';

/**
 * Split-screen AuthLayout for CampusHub
 * Left side: ~45% screen width branded visual panel with abstract CSS/UI campus network illustration
 * Right side: Centered form container with mobile-responsive header
 */
export default function AuthLayout({
  children,
  headline = 'Your campus. Connected.',
  supportingText = 'Discover projects, events, campus information, and opportunities around you.',
  mobileTitle = 'Welcome back',
  mobileSubtitle = 'Log in to continue to CampusHub.',
}) {
  return (
    <div className="min-h-screen md:h-screen md:max-h-screen w-full flex flex-col md:flex-row bg-[#FAFAFA] overflow-y-auto md:overflow-hidden">
      {/* ---------------------------------------------------- */}
      {/* LEFT PANEL: Branded Visual (~44% on desktop, tablet) */}
      {/* Hidden on mobile, visible on laptop and desktop (md+) */}
      {/* ---------------------------------------------------- */}
      <div className="hidden md:flex md:w-[40%] lg:w-[44%] xl:w-[45%] bg-gradient-to-br from-[#991B1B] via-[#B91C1C] to-[#DC2626] text-white p-5 lg:p-8 xl:p-10 flex-col justify-between relative select-none shrink-0 shadow-xl h-full max-h-screen overflow-hidden">
        {/* Subtle background decorative shapes and ambient glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-red-400/10 blur-3xl pointer-events-none" />

        {/* Top: CampusHub Logo */}
        <div className="relative z-10 shrink-0">
          <Logo to="/" variant="white" size="md" />
        </div>

        {/* Middle: Headline, Supporting Text & Abstract Campus-Network Illustration */}
        <div className="relative z-10 my-auto py-2 lg:py-4 shrink-0">
          <div className="max-w-md">
            <h1 className="text-xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
              {headline}
            </h1>
            <p className="mt-1.5 text-xs lg:text-sm text-red-100/90 leading-relaxed">
              {supportingText}
            </p>
          </div>

          {/* Abstract Campus-Network Illustration */}
          <div className="mt-3 lg:mt-5 relative w-full h-36 lg:h-48 xl:h-52 max-w-xs lg:max-w-sm rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-3 lg:p-4 shadow-xl overflow-hidden">
            {/* Ambient grid lines */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />

            {/* Connecting SVG Network Vectors */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none stroke-white/25"
              fill="none"
            >
              {/* Lines between nodes */}
              <line x1="50%" y1="50%" x2="22%" y2="28%" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="50%" y1="50%" x2="78%" y2="25%" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="50%" y1="50%" x2="20%" y2="76%" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="50%" y1="50%" x2="80%" y2="75%" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="22%" y1="28%" x2="78%" y2="25%" strokeWidth="1" strokeDasharray="2 2" />
            </svg>

            {/* Central Node: Student Union / Campus Core */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group">
              <div className="relative flex items-center justify-center">
                <span className="absolute inline-flex h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-white/20 animate-ping opacity-75" />
                <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-xl bg-white text-[#DC2626] shadow-lg flex items-center justify-center border-2 border-red-200">
                  <GraduationCap className="h-4 w-4 lg:h-5 lg:w-5 text-[#DC2626]" />
                </div>
              </div>
              <span className="mt-1 px-2 py-0.5 rounded-full bg-black/40 text-[9px] font-semibold text-white backdrop-blur-xs tracking-wide">
                Campus Core
              </span>
            </div>

            {/* Node 1 (Top Left): Engineering Quad */}
            <div className="absolute top-[12%] left-[8%] z-10 flex items-center gap-1.5 p-1.5 rounded-lg bg-white/15 backdrop-blur-md border border-white/20 shadow-sm">
              <div className="h-5 w-5 lg:h-6 lg:w-6 rounded-md bg-emerald-400 text-slate-900 flex items-center justify-center font-bold text-xs">
                <Users className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-[10px] font-bold text-white leading-tight">Teams Hub</p>
                <p className="text-[8px] text-emerald-200">8 open roles</p>
              </div>
            </div>

            {/* Node 2 (Top Right): Central Library / Quiet Hub */}
            <div className="absolute top-[12%] right-[8%] z-10 flex items-center gap-1.5 p-1.5 rounded-lg bg-white/15 backdrop-blur-md border border-white/20 shadow-sm">
              <div className="h-5 w-5 lg:h-6 lg:w-6 rounded-md bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-xs">
                <BookOpen className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-[10px] font-bold text-white leading-tight">Quiet Library</p>
                <p className="text-[8px] text-amber-200">Study Zones Open</p>
              </div>
            </div>

            {/* Node 3 (Bottom Left): Live Events */}
            <div className="absolute bottom-[10%] left-[8%] z-10 flex items-center gap-1.5 p-1.5 rounded-lg bg-white/15 backdrop-blur-md border border-white/20 shadow-sm">
              <div className="h-5 w-5 lg:h-6 lg:w-6 rounded-md bg-pink-400 text-slate-900 flex items-center justify-center font-bold text-xs">
                <Calendar className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-[10px] font-bold text-white leading-tight">Hackathon</p>
                <p className="text-[8px] text-pink-200">Starts Friday</p>
              </div>
            </div>

            {/* Node 4 (Bottom Right): Interactive Map */}
            <div className="absolute bottom-[10%] right-[8%] z-10 flex items-center gap-1.5 p-1.5 rounded-lg bg-white/15 backdrop-blur-md border border-white/20 shadow-sm">
              <div className="h-5 w-5 lg:h-6 lg:w-6 rounded-md bg-sky-400 text-slate-900 flex items-center justify-center font-bold text-xs">
                <MapPin className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-[10px] font-bold text-white leading-tight">Wayfinding</p>
                <p className="text-[8px] text-sky-200">12 Buildings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: College community reassurance banner */}
        <div className="relative z-10 pt-2 lg:pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-red-100 shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-red-200" />
            Verified University Authentication
          </span>
          <span className="text-white/60 text-[10px]">CampusHub v2.4</span>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* RIGHT PANEL: Form Container                          */}
      {/* Target: div#root > div:nth-of-type(1) > div:nth-of-type(2) */}
      {/* ---------------------------------------------------- */}
      <div className="flex-1 flex flex-col justify-start md:justify-center items-center px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-6 lg:py-8 bg-white min-h-screen md:min-h-0 md:h-full overflow-y-auto">
        <div className="w-full max-w-sm sm:max-w-md mx-auto my-auto flex flex-col justify-start">
          {/* Mobile Header */}
          <div className="md:hidden flex flex-col items-center text-center mb-4">
            <Logo to="/" size="md" className="mb-1.5" />
          </div>

          {/* Children renders the actual Login / Auth form */}
          {children}
        </div>
      </div>
    </div>
  );
}
