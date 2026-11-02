import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, ArrowLeft } from 'lucide-react';
import NotificationButton from './NotificationButton';
import UserMenu from './UserMenu';
import Logo from '../ui/Logo';

/**
 * CampusHub Authenticated Top Navbar
 * Left: Mobile hamburger + Back icon + CampusHub logo + Page title
 * Right: Notification bell + User avatar/name/dropdown (UserMenu)
 */
export default function TopNavbar({ onOpenMobileMenu }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/app/dashboard');
    }
  };

  // Determine current page title
  const getPageTitle = (pathname) => {
    if (pathname.includes('/courses')) return 'My Courses & Classes';
    if (pathname.includes('/students')) return 'My Students & Rosters';
    if (pathname.includes('/materials')) return 'Study Materials & Repository';
    if (pathname.includes('/announcements')) return 'Faculty Circulars & Notices';
    if (pathname.includes('/feed')) return 'Feed & Notices';
    if (pathname.includes('/assignments')) return 'Assignments & Submissions';
    if (pathname.includes('/timetable') || pathname.includes('/schedule') || pathname.includes('/routine')) return 'Class Timetable';
    if (pathname.includes('/fees') || pathname.includes('/payments')) return 'Payments & Fees';
    if (pathname.includes('/exams')) return 'Online Exams & Evaluations';
    if (pathname.includes('/results')) return 'Academic Results';
    if (pathname.includes('/academics')) return 'Academics & Teaching';
    if (pathname.includes('/projects')) return 'Projects & Mentorship';
    if (pathname.includes('/events')) return 'Events & Workshops';
    if (pathname.includes('/map')) return 'Campus Map';
    if (pathname.includes('/report')) return 'Report Issue';
    if (pathname.includes('/profile')) return 'My Profile';
    if (pathname.includes('/settings')) return 'Settings';
    return 'Dashboard';
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-[#E5E5E5] px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger, Back button, CampusHub logo, and Page title */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-[#737373] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
          aria-label="Open mobile menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Back navigation button */}
        <button
          type="button"
          onClick={handleGoBack}
          className="p-2 rounded-lg text-[#737373] hover:text-[#DC2626] hover:bg-[#FEF2F2] border border-transparent hover:border-red-200 transition-colors cursor-pointer group flex items-center justify-center"
          aria-label="Go back"
          title="Go backwards"
        >
          <ArrowLeft className="h-4.5 w-4.5 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Unified CampusHub Logo */}
        <div className="lg:hidden">
          <Logo to="/app/dashboard" size="sm" showText={false} />
        </div>

        <div className="hidden sm:block lg:hidden h-5 w-px bg-[#E5E5E5]" />

        {/* Page Title */}
        <h1 className="text-base sm:text-lg font-bold text-[#171717] tracking-tight">
          {pageTitle}
        </h1>
      </div>

      {/* Right: Notification bell + User profile menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification Bell */}
        <NotificationButton />

        <div className="h-5 w-px bg-[#E5E5E5] hidden sm:block" />

        {/* User Avatar, Name, Dropdown Arrow with Profile, Settings, Logout */}
        <UserMenu />
      </div>
    </header>
  );
}
