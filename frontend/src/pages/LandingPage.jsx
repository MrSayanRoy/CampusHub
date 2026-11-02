import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Plus,
  Globe,
  Check,
  Menu,
  X,
  Layers,
  Compass,
  FileText,
  Users,
  Calendar,
  Building,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Zap,
  ShoppingBag,
  Bell,
  MessageSquare,
  BookOpen,
} from 'lucide-react';
import HeroCanvas from '../components/landing/HeroCanvas';
import CountUp from '../components/landing/CountUp';
import { useScrollEffects, useScrollReveal } from '../hooks/useScrollEffects';
import { useToast } from '../components/ui/Toast';

/* =============================================================================
   EDITABLE LANDING PAGE CONFIGURATION & PLACEHOLDERS
   Edit the values below to customize numbers, content, and section details.
   ============================================================================= */

// SECTION 3: STATS ROW PLACEHOLDERS (Easily customizable)
const STATS_DATA = [
  { id: 'students', target: 4200, prefix: '', suffix: '+', label: 'Active Students Enrolled' },
  { id: 'clubs', target: 120, prefix: '', suffix: '+', label: 'Student Clubs & Guilds' },
  { id: 'events', target: 350, prefix: '', suffix: '+', label: 'Annual Campus Events Hosted' },
  { id: 'resources', target: 1800, prefix: '', suffix: '+', label: 'Peer Study Notes & Resources' },
];

// SECTION 4: VERTICAL TABS / HORIZONTAL PILL ROW (Real Campus Features)
const FEATURES_TABS = [
  {
    id: 'events',
    label: 'Events',
    tagline: 'Campus Happenings & Gatherings',
    title: 'Workshops, Hackathons & Keynote Summits',
    description: 'Discover verified student club events, academic seminars, and inter-college hackathons. RSVP with one tap and sync seamlessly to your personal calendar.',
    bullets: [
      'Interactive campus calendar synced with departmental timelines',
      'Instant digital tickets & QR check-ins for attendees',
      'Automated reminder notifications before kickoff',
    ],
    metric: '142 Avg. Attendees',
    badge: 'Real-Time Sync',
  },
  {
    id: 'clubs',
    label: 'Clubs & Projects',
    tagline: 'Collaborative Student Networks',
    title: 'Find Capstone Partners & Autonomous Guilds',
    description: 'Connect with peers across disciplines possessing the exact skills you need—from embedded firmware to UI design—for engineering capstones and competition squads.',
    bullets: [
      'AI-assisted skill graph matching student proficiencies',
      'Track open spots and role requirements in real time',
      'Showcase completed project prototypes to alumni recruiters',
    ],
    metric: '120+ Active Guilds',
    badge: 'Skill Matching',
  },
  {
    id: 'notes',
    label: 'Notes & Resources',
    tagline: 'Academic Knowledge Repository',
    title: 'Course Syllabi, Lecture Archives & Exam Papers',
    description: 'Access curated peer-reviewed lecture notes, past exam question papers, and official faculty reference guides organized cleanly by semester and department.',
    bullets: [
      'Search notes by course code, professor, or topic tag',
      'Download high-resolution laboratory experiment guides',
      'Contribute notes to earn verified campus academic badges',
    ],
    metric: '1,800+ Files Shared',
    badge: 'Peer Reviewed',
  },
  {
    id: 'announcements',
    label: 'Announcements',
    tagline: 'Official Department Alerts',
    title: 'Instant Examination Timetables & Campus Circulars',
    description: 'Never miss an administrative circular. Receive urgent push alerts for timetable releases, room reassignments, and scholarship application deadlines.',
    bullets: [
      'Verified notices from Dean of Academics and Exam Cell',
      'Categorized by branch, year, and urgency level',
      'Downloadable PDF attachments and admit card notices',
    ],
    metric: 'Zero Missed Deadlines',
    badge: 'Verified Source',
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    tagline: 'Campus Student Exchange',
    title: 'Textbook Swaps, Lab Kits & Student Essentials',
    description: 'A trusted, student-only circular economy. Trade textbooks, lab gear, electronic components, and dorm furniture directly with fellow verified undergraduates.',
    bullets: [
      'Verified .edu email barrier prevents external spam',
      'Direct peer messaging with campus pick-up zones',
      'Zero seller commission or transaction surcharges',
    ],
    metric: '$180K+ Saved',
    badge: 'Zero Fees',
  },
];

// SECTION 5: FEATURE CARDS GRID (3 Columns Desktop / 1 Column Mobile)
const FEATURE_GRID = [
  {
    id: 1,
    title: 'Project Partner Finder',
    category: 'Student Guilds',
    description: 'Discover peers with complementary skills—firmware engineers, UI designers, and ML researchers—for capstones and hackathons.',
    action: 'Browse projects',
  },
  {
    id: 2,
    title: 'Spatial Campus Navigation',
    category: 'Indoor Wayfinding',
    description: 'Find lecture halls, research labs, dining hubs, and quiet study alcoves with sub-meter accurate indoor campus maps.',
    action: 'Open campus map',
  },
  {
    id: 3,
    title: 'Automated Issue Reporting',
    category: 'Campus Facilities',
    description: 'Log maintenance tickets with photo attachments and geolocated pins. Follow resolution stages in real time.',
    action: 'Report a problem',
  },
  {
    id: 4,
    title: 'Academic Hub & Attendance',
    category: 'Curriculum & Syllabi',
    description: 'Track course attendance compliance, download faculty lecture notes, and receive early warning eligibility alerts.',
    action: 'Access courses',
  },
  {
    id: 5,
    title: 'Event Hub & Hackathons',
    category: 'Campus Community',
    description: 'Discover technical workshops, club competitions, and guest keynotes with instant registration and calendar sync.',
    action: 'View calendar',
  },
  {
    id: 6,
    title: 'Dual Student & Faculty Portals',
    category: 'Enterprise SSO',
    description: 'Secure, dedicated sign-in portals for students and faculty members protected with Turnstile human verification.',
    action: 'Sign in to portal',
  },
];

// SECTION 6: HORIZONTAL SCROLL-SNAP CAROUSEL (Events & Clubs Portrait Cards)
const CAROUSEL_ITEMS = [
  {
    id: 1,
    number: '01',
    category: 'Robotics Guild',
    title: 'Autonomous Rover Challenge',
    subtitle: 'ROS2 & Computer Vision Team',
    desc: 'Designing navigation algorithms for autonomous deliveries across walking paths.',
    status: '1 spot left',
    spots: '3/4 Members',
  },
  {
    id: 2,
    number: '02',
    category: 'Hackathon',
    title: 'AI & Cloud Spring Sprint',
    subtitle: '48h Development Marathon',
    desc: '$5,000 prize pool, free mentor sessions, and hands-on cloud credits.',
    status: 'April 14',
    spots: '142 Enrolled',
  },
  {
    id: 3,
    number: '03',
    category: 'Clean Energy',
    title: 'EcoTrack Smart Solar Sensor',
    subtitle: 'IoT Telemetry Mesh',
    desc: 'Low-cost sensor deployment monitoring solar canopy efficiency across rooftops.',
    status: '2 spots left',
    spots: '2/4 Members',
  },
  {
    id: 4,
    number: '04',
    category: 'Aerospace Lab',
    title: 'AeroDrone Search & Rescue',
    subtitle: 'Autonomous Quadcopter',
    desc: '3D-printed airframes with integrated OpenCV camera payloads for GPS-denied zones.',
    status: 'April 30',
    spots: '1/4 Members',
  },
  {
    id: 5,
    number: '05',
    category: 'Health Tech',
    title: 'BioScribe Community Outreach',
    subtitle: 'Multilingual Clinical Tool',
    desc: 'Offline-capable transcription model assisting doctors at free student clinics.',
    status: 'Active Lab',
    spots: '2/4 Members',
  },
];

// SECTION 7: HOW IT WORKS STEPS
const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Sign up in seconds',
    description: 'Register with your verified university credentials. Choose between Student and Faculty portal modes with Turnstile protection.',
  },
  {
    step: '02',
    title: 'Join your campus cohort',
    description: 'Instantly connect with your department, enrolled courses, student clubs, and ongoing student projects.',
  },
  {
    step: '03',
    title: 'Connect, build & explore',
    description: 'Find teammates, access lecture syllabi, RSVP to hackathons, trade textbooks, and log facility tickets with one tap.',
  },
];

// SECTION 8: TESTIMONIALS / STUDENT VOICES
const TESTIMONIALS = [
  {
    id: 1,
    quote: 'CampusHub made finding capstone partners effortless. I formed an entire 4-person robotics team with ROS2 and CAD expertise in less than two days.',
    author: 'Alex Morgan',
    role: 'Senior, Computer Science & Engineering',
    avatar: 'AM',
  },
  {
    id: 2,
    quote: 'Having our course syllabi, attendance percentage, and exam timetables in one unified app completely changed how our entire cohort prepares for finals.',
    author: 'Elena Rostova',
    role: 'Junior, Software Engineering & Design',
    avatar: 'ER',
  },
  {
    id: 3,
    quote: 'Managing student club events used to mean spreadsheets and messy group chats. Now, our 200-member coding guild handles RSVPs and grants with total transparency.',
    author: 'Marcus Chen',
    role: 'President, ACM Student Chapter',
    avatar: 'MC',
  },
];

// SECTION 9: FAQ ACCORDION DATA
const FAQS = [
  {
    question: 'How does CampusHub connect with my existing university ID?',
    answer: 'CampusHub integrates with your institution’s verified email domain and single sign-on system. Both student and faculty members receive customized, secure dashboards based on their departmental affiliation without migrating passwords.',
  },
  {
    question: 'Can student clubs and organizations publish events autonomously?',
    answer: 'Yes. Recognized student chapters receive verified organizer permissions to publish workshops, manage attendee RSVP caps, and share digital ticket passes directly across the student body.',
  },
  {
    question: 'What privacy standards are enforced for student attendance and records?',
    answer: 'All student academic data and attendance metrics are strictly private, encrypted at rest, and accessible only by the verified student and authorized departmental faculty. No third-party data tracking is ever permitted.',
  },
  {
    question: 'How do I submit and follow campus maintenance or facility tickets?',
    answer: 'Navigate to the Report Issue module, describe the issue, optionally attach a location or photo, and submit. The facilities team updates ticket statuses in real time from review to resolution.',
  },
  {
    question: 'Is the student marketplace completely free for peer-to-peer exchanges?',
    answer: 'Yes. CampusHub Marketplace is 100% free with zero transaction commissions or listing fees. It connects verified students for safe textbook, lab equipment, and housing swaps right on campus.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { scrollProgress, isHeaderScrolled, parallaxOffset, prefersReducedMotion } = useScrollEffects();
  useScrollReveal();

  // Mobile menu drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Section 4: Features active tab state
  const [activeTab, setActiveTab] = useState('events');

  // Section 6: Carousel scroll ref
  const carouselRef = useRef(null);

  // Section 8: Testimonials active index state
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  // Section 9: FAQ accordion open item index
  const [openFaq, setOpenFaq] = useState(0);

  // Language selector state
  const [selectedLanguage, setSelectedLanguage] = useState('English (US)');
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English (US)' },
    { code: 'en-gb', name: 'English (UK)' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ja', name: '日本語' },
  ];

  // Carousel scroll handler (smooth horizontal scrolling)
  const scrollCarousel = (direction) => {
    if (!carouselRef.current) return;
    const cardWidth = 340;
    const scrollAmount = direction === 'next' ? cardWidth : -cardWidth;
    carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // Smooth scroll helper for on-page navigation
  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentTab = FEATURES_TABS.find((t) => t.id === activeTab) || FEATURES_TABS[0];
  const currentTestimonial = TESTIMONIALS[testimonialIndex];

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] selection:bg-[#2563EB] selection:text-white relative font-sans">
      {/* 0. THIN SCROLL PROGRESS BAR AT TOP OF PAGE */}
      <div
        className="fixed top-0 left-0 h-[2px] bg-[#2563EB] z-50 transition-all duration-75 ease-out"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      {/* =========================================================================
          SECTION 1: STICKY HEADER
          - CampusHub logo left
          - Nav links center: Events, Clubs, Notes, Marketplace, Community
          - "Log In" + pill "Get Started →" right
          - Transparent at top, blurred light background after 40px scroll
          - Mobile hamburger menu with smooth slide-down panel
         ========================================================================= */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isHeaderScrolled
            ? 'bg-white/85 backdrop-blur-md border-b border-black/[0.06] shadow-[0_1px_4px_rgba(0,0,0,0.03)] py-3.5'
            : 'bg-transparent border-b border-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo on Left */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 cursor-pointer focus-visible:outline-none group"
          >
            <span
              className={`text-xl font-bold tracking-tight font-headline transition-colors ${
                isHeaderScrolled ? 'text-black' : 'text-white'
              }`}
            >
              CampusHub<span className="text-[#2563EB]">.</span>
            </span>
          </button>

          {/* Nav Links in Center (Desktop) */}
          <nav className="hidden md:flex items-center gap-7">
            <button
              onClick={() => scrollToSection('features-section')}
              className={`text-sm font-medium transition-colors cursor-pointer ${
                isHeaderScrolled ? 'text-neutral-600 hover:text-black' : 'text-white/85 hover:text-white'
              }`}
            >
              Events
            </button>
            <button
              onClick={() => scrollToSection('carousel-section')}
              className={`text-sm font-medium transition-colors cursor-pointer ${
                isHeaderScrolled ? 'text-neutral-600 hover:text-black' : 'text-white/85 hover:text-white'
              }`}
            >
              Clubs & Projects
            </button>
            <button
              onClick={() => scrollToSection('features-section')}
              className={`text-sm font-medium transition-colors cursor-pointer ${
                isHeaderScrolled ? 'text-neutral-600 hover:text-black' : 'text-white/85 hover:text-white'
              }`}
            >
              Notes
            </button>
            <button
              onClick={() => scrollToSection('features-section')}
              className={`text-sm font-medium transition-colors cursor-pointer ${
                isHeaderScrolled ? 'text-neutral-600 hover:text-black' : 'text-white/85 hover:text-white'
              }`}
            >
              Marketplace
            </button>
            <button
              onClick={() => scrollToSection('how-it-works-section')}
              className={`text-sm font-medium transition-colors cursor-pointer ${
                isHeaderScrolled ? 'text-neutral-600 hover:text-black' : 'text-white/85 hover:text-white'
              }`}
            >
              Community
            </button>
          </nav>

          {/* "Log In" + Pill "Get Started →" on Right */}
          <div className="hidden sm:flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className={`text-sm font-semibold transition-colors cursor-pointer px-3 py-1.5 rounded-full ${
                isHeaderScrolled ? 'text-neutral-800 hover:text-black' : 'text-white/90 hover:text-white'
              }`}
            >
              Log In
            </button>

            {/* Pill-shaped solid button with sliding arrow on hover */}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className={`group inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer shadow-xs ${
                isHeaderScrolled
                  ? 'bg-black text-white hover:bg-neutral-800'
                  : 'bg-white text-black hover:bg-neutral-100'
              }`}
            >
              <span>Get Started</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1 font-sans">
                →
              </span>
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-full cursor-pointer transition-colors ${
                isHeaderScrolled ? 'text-black hover:bg-neutral-100' : 'text-white hover:bg-white/10'
              }`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-white border-b border-neutral-200 px-6 py-6 space-y-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="space-y-1">
              <button
                onClick={() => scrollToSection('features-section')}
                className="w-full text-left py-2.5 text-base font-semibold text-neutral-900 border-b border-neutral-100"
              >
                Events
              </button>
              <button
                onClick={() => scrollToSection('carousel-section')}
                className="w-full text-left py-2.5 text-base font-semibold text-neutral-900 border-b border-neutral-100"
              >
                Clubs & Projects
              </button>
              <button
                onClick={() => scrollToSection('features-section')}
                className="w-full text-left py-2.5 text-base font-semibold text-neutral-900 border-b border-neutral-100"
              >
                Notes & Resources
              </button>
              <button
                onClick={() => scrollToSection('features-section')}
                className="w-full text-left py-2.5 text-base font-semibold text-neutral-900 border-b border-neutral-100"
              >
                Marketplace
              </button>
              <button
                onClick={() => scrollToSection('how-it-works-section')}
                className="w-full text-left py-2.5 text-base font-semibold text-neutral-900"
              >
                Community
              </button>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full py-3 rounded-full border border-neutral-300 text-sm font-semibold text-neutral-900 text-center"
              >
                Log In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full py-3 rounded-full bg-black text-white text-sm font-semibold flex items-center justify-center gap-2 group"
              >
                <span>Get Started</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          SECTION 2: FULL-SCREEN HERO
          - Huge headline: "Your campus, all in one place" (staggered fade up by 100ms)
          - Short subline
          - Two buttons: primary "Get Started →" and outlined "Explore Features"
          - Looping muted background video/canvas with dark gradient overlay
          - Subtle parallax (~0.3x scroll speed)
         ========================================================================= */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black text-white px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Parallax Background Canvas / Media with Dark Gradient Overlay */}
        <HeroCanvas parallaxOffset={prefersReducedMotion ? 0 : parallaxOffset} />

        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Staggered Headline (clamp(2.5rem, 7vw, 6rem), weight 500-600, line-height ~1.05) */}
          <h1
            className="font-headline font-semibold tracking-tight text-white leading-[1.05] text-balance mb-6"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}
          >
            <span className="block hero-fade-line-1">Your campus,</span>
            <span className="block hero-fade-line-2">all in one place.</span>
          </h1>

          {/* Staggered Subline (1rem - 1.125rem, line-height 1.6) */}
          <p className="hero-fade-line-3 text-neutral-300 text-base sm:text-lg md:text-xl font-normal leading-[1.6] max-w-2xl mx-auto mb-10 text-balance">
            Discover student project partners, upcoming campus events, peer study notes, and student organizations—brought together in one minimal, unified platform.
          </p>

          {/* Two Buttons: Primary "Get Started →" and Outlined "Explore Features" */}
          <div className="hero-fade-line-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-white text-black hover:bg-neutral-100 font-semibold text-base transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl"
            >
              <span>Get Started</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1 font-sans">
                →
              </span>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('features-section')}
              className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-white/20 text-white hover:border-white/60 font-medium text-base transition-colors cursor-pointer"
            >
              Explore Features
            </button>
          </div>
        </div>

        {/* Quiet Bottom Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-xs flex flex-col items-center gap-2 pointer-events-none">
          <span className="tracking-widest uppercase text-[10px]">Scroll to explore</span>
          <div className="w-[1px] h-6 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: STATS ROW
          - Three or four numbers counting up when scrolled into view (~1.5s ease-out)
          - Small label beneath each
         ========================================================================= */}
      <section className="py-20 sm:py-28 bg-[#FAFAFA] border-b border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 divide-y sm:divide-y-0 sm:divide-x divide-neutral-200/80">
            {STATS_DATA.map((stat, idx) => (
              <div key={stat.id} className="pt-4 sm:pt-0 sm:px-6 first:pl-0 last:pr-0">
                <CountUp
                  target={stat.target}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  duration={1500}
                  label={stat.label}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: FEATURES SECTION (Sticky Vertical Tabs / Horizontal Pill Row)
          - Sticky vertical tab list on left: Events, Clubs, Notes, Announcements, Marketplace
          - Content panel on right that cross-fades when tab changes
          - On mobile: horizontally scrollable pill row
         ========================================================================= */}
      <section id="features-section" className="py-24 md:py-32 bg-white border-b border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="max-w-2xl mb-16 reveal-on-scroll">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
              Platform Modules
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight font-headline text-black mt-2">
              Everything happening on campus.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-neutral-600 font-normal leading-relaxed">
              Consolidate extracurriculars, coursework, peer notes, and department circulars into a single fluid workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Sticky Vertical Tab List (Desktop) / Horizontal Pill Row (Mobile) */}
            <div className="lg:col-span-4 sticky top-28 z-20">
              <div className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
                {FEATURES_TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`whitespace-nowrap lg:whitespace-normal px-5 py-3.5 rounded-full lg:rounded-2xl text-left text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center justify-between ${
                        isActive
                          ? 'bg-black text-white shadow-md'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80 lg:bg-transparent lg:hover:bg-neutral-100'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        {tab.id === 'events' && <Calendar className="h-4 w-4" />}
                        {tab.id === 'clubs' && <Users className="h-4 w-4" />}
                        {tab.id === 'notes' && <BookOpen className="h-4 w-4" />}
                        {tab.id === 'announcements' && <Bell className="h-4 w-4" />}
                        {tab.id === 'marketplace' && <ShoppingBag className="h-4 w-4" />}
                        <span>{tab.label}</span>
                      </span>
                      <ChevronRight
                        className={`hidden lg:block h-4 w-4 transition-transform duration-200 ${
                          isActive ? 'translate-x-1 text-white' : 'opacity-0'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cross-Fading Content Panel on Right */}
            <div className="lg:col-span-8">
              <div className="bg-[#FAFAFA] border border-neutral-200/80 rounded-2xl md:rounded-3xl p-6 sm:p-10 shadow-xs transition-opacity duration-300 ease-out">
                {/* Tag & Metric Bar */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-semibold text-[#2563EB] tracking-wide uppercase">
                    {currentTab.badge}
                  </span>
                  <span className="text-xs font-medium text-neutral-500 bg-white border border-neutral-200 px-3 py-1 rounded-full">
                    {currentTab.metric}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-semibold font-headline text-black tracking-tight mb-3">
                  {currentTab.title}
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 font-normal leading-relaxed mb-8">
                  {currentTab.description}
                </p>

                {/* Checklist Deliverables */}
                <div className="space-y-3.5 mb-10">
                  {currentTab.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm text-neutral-800">
                      <div className="mt-0.5 h-4 w-4 rounded-full bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3" />
                      </div>
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>

                {/* Pill CTA Button with sliding arrow */}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-black text-white hover:bg-neutral-800 text-sm font-medium transition-colors cursor-pointer"
                >
                  <span>Explore {currentTab.label}</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1 font-sans">
                    →
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: FEATURE CARD GRID (3 Columns Desktop / 1 Column Mobile)
          - Rounded cards (16-24px) that lift 6px on hover with 300ms transition
         ========================================================================= */}
      <section className="py-24 md:py-32 bg-white border-b border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16 reveal-on-scroll">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
              Integrated Tools
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight font-headline text-black mt-2">
              Built for everyday campus life.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-neutral-600 font-normal leading-relaxed">
              Designed with generous whitespace, rounded geometry, and zero clutter so you can focus on what matters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURE_GRID.map((feat) => (
              <div
                key={feat.id}
                onClick={() => navigate('/login')}
                className="lift-card-transition bg-white border border-neutral-200/80 hover:border-black/30 rounded-2xl md:rounded-3xl p-8 flex flex-col justify-between cursor-pointer hover:shadow-xl hover:shadow-black/[0.03] group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-semibold text-neutral-400">
                      0{feat.id}
                    </span>
                    <span className="text-xs font-medium text-[#2563EB]">
                      {feat.category}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-semibold font-headline text-black tracking-tight mb-3">
                    {feat.title}
                  </h3>
                  <p className="text-sm sm:text-base text-neutral-600 font-normal leading-[1.6]">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-8 mt-8 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold text-neutral-900 group-hover:text-[#2563EB]">
                  <span>{feat.action}</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1 font-sans text-sm">
                    →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: HORIZONTAL SCROLL-SNAP CAROUSEL
          - Upcoming events or student clubs as portrait cards
          - Previous / Next buttons
          - Subtle scale-up on hover
         ========================================================================= */}
      <section id="carousel-section" className="py-24 md:py-32 bg-[#FAFAFA] border-b border-neutral-200/80 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="reveal-on-scroll">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
              Upcoming & Active
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight font-headline text-black mt-2">
              Featured clubs & initiatives.
            </h2>
          </div>

          {/* Previous / Next Controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => scrollCarousel('prev')}
              className="p-3 rounded-full border border-neutral-300 text-neutral-700 hover:text-black hover:border-black transition-colors cursor-pointer"
              aria-label="Previous card"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollCarousel('next')}
              className="p-3 rounded-full border border-neutral-300 text-neutral-700 hover:text-black hover:border-black transition-colors cursor-pointer"
              aria-label="Next card"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scroll-Snap Horizontal Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-6 pt-2"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {CAROUSEL_ITEMS.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate('/login')}
                className="snap-start shrink-0 w-[300px] sm:w-[340px] aspect-[3/4] rounded-2xl md:rounded-3xl p-6 sm:p-8 flex flex-col justify-between text-white relative overflow-hidden group cursor-pointer transition-transform duration-300 ease-out hover:scale-[1.02] shadow-lg"
                style={{
                  background:
                    item.id % 2 === 0
                      ? 'linear-gradient(145deg, #111318 0%, #08090C 100%)'
                      : 'linear-gradient(145deg, #181A20 0%, #0C0E12 100%)',
                }}
              >
                {/* Subtle ambient light */}
                <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-[#2563EB]/10 blur-3xl pointer-events-none group-hover:bg-[#2563EB]/25 transition-all duration-300" />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-400">
                    {item.number}
                  </span>
                  <span className="text-[11px] font-medium text-neutral-300 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-xs">
                    {item.category}
                  </span>
                </div>

                <div className="relative z-10 my-auto py-4">
                  <span className="text-xs font-semibold text-[#60A5FA] uppercase tracking-wider block mb-1">
                    {item.status}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-semibold font-headline text-white tracking-tight leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-medium text-white/80 group-hover:text-white">
                  <span>{item.spots}</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1 font-sans">
                    View Guild →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: "HOW IT WORKS" (Three Numbered Steps Revealed on Scroll)
         ========================================================================= */}
      <section id="how-it-works-section" className="py-24 md:py-32 bg-white border-b border-neutral-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16 reveal-on-scroll">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
              Simple Onboarding
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight font-headline text-black mt-2">
              How CampusHub works.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-neutral-600 font-normal leading-relaxed">
              Get set up in three straightforward steps and start collaborating across your campus immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {HOW_IT_WORKS_STEPS.map((step, idx) => (
              <div
                key={idx}
                className="reveal-on-scroll p-8 rounded-2xl md:rounded-3xl border border-neutral-200/80 bg-[#FAFAFA] flex flex-col justify-between"
              >
                <div>
                  <span className="text-4xl sm:text-5xl font-semibold font-headline text-black block mb-6">
                    {step.step}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-semibold font-headline text-black tracking-tight mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-neutral-600 font-normal leading-[1.6]">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: TESTIMONIALS / STUDENT VOICES (Simple Fade Carousel)
         ========================================================================= */}
      <section className="py-24 md:py-32 bg-[#FAFAFA] border-b border-neutral-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#2563EB] block mb-4">
            Student Voices
          </span>

          {/* Testimonial Quote Display */}
          <div className="min-h-[180px] flex items-center justify-center transition-opacity duration-300">
            <blockquote className="text-2xl sm:text-3xl md:text-4xl font-headline font-semibold text-black tracking-tight leading-snug">
              “{currentTestimonial.quote}”
            </blockquote>
          </div>

          {/* Author Details */}
          <div className="mt-8 flex flex-col items-center">
            <div className="w-11 h-11 rounded-full bg-black text-white font-semibold text-sm flex items-center justify-center mb-2">
              {currentTestimonial.avatar}
            </div>
            <div className="text-base font-semibold text-black">
              {currentTestimonial.author}
            </div>
            <div className="text-sm text-neutral-500">
              {currentTestimonial.role}
            </div>
          </div>

          {/* Carousel Pagination Dots */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTestimonialIndex(idx)}
                className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                  testimonialIndex === idx ? 'w-8 bg-black' : 'w-2 bg-neutral-300 hover:bg-neutral-400'
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 9: FAQ ACCORDION (Smooth height animation, "+" rotates to "×")
         ========================================================================= */}
      <section id="faq-section" className="py-24 md:py-32 bg-white border-b border-neutral-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal-on-scroll">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
              Common Inquiries
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight font-headline text-black mt-2">
              Frequently asked questions.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-neutral-600 font-normal leading-relaxed">
              Everything you need to know about joining your campus platform.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-neutral-200/80 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-6 sm:px-8 py-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-neutral-50 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base sm:text-lg font-semibold text-black tracking-tight">
                      {faq.question}
                    </span>
                    <span
                      className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-neutral-300 text-neutral-800 transition-transform duration-300 ${
                        isOpen ? 'rotate-45 border-black text-black' : ''
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                    </span>
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out px-6 sm:px-8 ${
                      isOpen ? 'max-h-64 pb-6 opacity-100' : 'max-h-0 pb-0 opacity-0 overflow-hidden'
                    }`}
                  >
                    <p className="text-sm sm:text-base text-neutral-600 font-normal leading-[1.6]">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 10: FINAL CTA BAND (Full-width dark section)
         ========================================================================= */}
      <section className="py-24 sm:py-36 bg-[#0A0A0A] text-white relative overflow-hidden">
        {/* Subtle radial lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#2563EB]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#60A5FA] mb-4">
            Unified Campus Hub
          </span>
          <h2
            className="font-headline font-semibold tracking-tight text-white leading-[1.05] text-balance mb-6"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
          >
            Ready to connect with your campus?
          </h2>
          <p className="text-neutral-400 text-base sm:text-lg md:text-xl font-normal leading-[1.6] max-w-xl mx-auto mb-10 text-balance">
            Join thousands of fellow students and faculty members across academic departments, student clubs, and research projects today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black hover:bg-neutral-100 font-semibold text-base transition-all duration-200 cursor-pointer shadow-xl hover:shadow-2xl"
            >
              <span>Get Started</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1 font-sans">
                →
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center px-8 py-4 rounded-full border border-white/20 text-white hover:border-white/60 font-medium text-base transition-colors cursor-pointer"
            >
              Log in to Portal
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 11: MULTI-COLUMN FOOTER
         ========================================================================= */}
      <footer className="bg-white border-t border-neutral-200/80 pt-16 pb-12 text-[#171717]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 pb-16 border-b border-neutral-200/80">
            {/* Wordmark & Statement */}
            <div className="col-span-2 space-y-4">
              <span className="text-xl font-bold tracking-tight font-headline text-black">
                CampusHub<span className="text-[#2563EB]">.</span>
              </span>
              <p className="text-sm text-neutral-500 max-w-sm leading-relaxed">
                The minimal, modern digital platform built for ambitious college students, campus clubs, and university faculty.
              </p>
              <div className="text-xs text-neutral-400">
                Operating with institutional single sign-on and data integrity.
              </div>
            </div>

            {/* Platform Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-black">
                Platform
              </h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li>
                  <button onClick={() => navigate('/login')} className="hover:text-black transition-colors cursor-pointer">
                    Events Calendar
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/login')} className="hover:text-black transition-colors cursor-pointer">
                    Clubs & Projects
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/login')} className="hover:text-black transition-colors cursor-pointer">
                    Notes & Syllabi
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/login')} className="hover:text-black transition-colors cursor-pointer">
                    Marketplace
                  </button>
                </li>
              </ul>
            </div>

            {/* Community Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-black">
                Community
              </h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li>
                  <button onClick={() => scrollToSection('carousel-section')} className="hover:text-black transition-colors cursor-pointer">
                    Student Guilds
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('features-section')} className="hover:text-black transition-colors cursor-pointer">
                    Hackathons
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('features-section')} className="hover:text-black transition-colors cursor-pointer">
                    Research Labs
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/login')} className="hover:text-black transition-colors cursor-pointer">
                    Issue Reporting
                  </button>
                </li>
              </ul>
            </div>

            {/* Portals & Resources */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-black">
                Portals
              </h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li>
                  <button onClick={() => navigate('/login')} className="hover:text-black transition-colors cursor-pointer">
                    Student Login
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/login')} className="hover:text-black transition-colors cursor-pointer">
                    Faculty Login
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('faq-section')} className="hover:text-black transition-colors cursor-pointer">
                    Help & FAQ
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('how-it-works-section')} className="hover:text-black transition-colors cursor-pointer">
                    Security & Trust
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Row: Copyright + Language Selector */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
            <div>
              © 2026 CampusHub. Built for ambitious campuses.
            </div>

            {/* Interactive Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-300 hover:border-black text-neutral-800 transition-colors cursor-pointer"
                aria-label="Select language"
              >
                <Globe className="h-3.5 w-3.5 text-neutral-500" />
                <span>{selectedLanguage}</span>
                <ChevronDown className="h-3 w-3 text-neutral-400" />
              </button>

              {languageMenuOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-44 bg-white border border-neutral-200 rounded-xl shadow-xl p-1 z-30 animate-in fade-in duration-150">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLanguage(lang.name);
                        setLanguageMenuOpen(false);
                        addToast({
                          title: 'Language Updated',
                          message: `Switched language to ${lang.name}.`,
                          type: 'info',
                        });
                      }}
                      className={`w-full px-3 py-2 text-left text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                        selectedLanguage === lang.name
                          ? 'bg-neutral-100 font-semibold text-black'
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <span>{lang.name}</span>
                      {selectedLanguage === lang.name && <Check className="h-3 w-3 text-[#2563EB]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
