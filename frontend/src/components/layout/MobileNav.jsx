import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  X,
  LayoutDashboard,
  Newspaper,
  GraduationCap,
  Users,
  Calendar,
  MapPin,
  AlertTriangle,
  User,
  Settings,
  BookOpen,
  FolderOpen,
  Bell,
  Clock,
  CalendarCheck,
  FileText,
  Award,
} from 'lucide-react';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Logo from '../ui/Logo';
import { useApp } from '../../context/AppContext';

export default function MobileNav({ isOpen, onClose }) {
  const location = useLocation();
  const { user, notices = [] } = useApp();

  const unreadNoticesCount = notices.filter((n) => !n.read).length;

  useEffect(() => {
    onClose?.();
  }, [location.pathname]);

  if (!isOpen) return null;

  const isFaculty =
    (user?.role || '').toLowerCase() === 'faculty' ||
    (user?.email || '').includes('faculty') ||
    (user?.name || '').toLowerCase().includes('dr.');

  const navLinks = isFaculty
    ? [
        { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard, end: true },
        { name: 'My Courses & Classes', path: '/app/courses', icon: BookOpen },
        { name: 'Timetable', path: '/app/academics?tab=timetable', icon: Clock },
        { name: 'Attendance', path: '/app/academics?tab=attendance', icon: CalendarCheck },
        { name: 'Assignments', path: '/app/academics?tab=assignments', icon: FileText },
        { name: 'Exams & Results', path: '/app/academics?tab=exams', icon: GraduationCap },
        { name: 'Study Materials', path: '/app/materials', icon: FolderOpen },
        { name: 'My Students', path: '/app/students', icon: Users },
        { name: 'Announcements', path: '/app/announcements', icon: Bell },
        { name: 'Projects & Mentorship', path: '/app/projects', icon: Award },
        { name: 'Events', path: '/app/events', icon: Calendar },
        { name: 'Campus Map', path: '/app/map', icon: MapPin },
        { name: 'Report Issue', path: '/app/report', icon: AlertTriangle },
        { name: 'Profile & Settings', path: '/app/profile', icon: User },
      ]
    : [
        { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard, end: true },
        {
          name: 'Feed & Notices',
          path: '/app/feed',
          icon: Newspaper,
          badge: unreadNoticesCount > 0 ? `${unreadNoticesCount} new` : undefined,
        },
        {
          name: 'Academics',
          path: '/app/academics',
          icon: GraduationCap,
          subItems: [
            { name: 'Attendance Records', path: '/app/academics?tab=attendance', tab: 'attendance' },
            { name: 'Assignments', path: '/app/academics?tab=assignments', tab: 'assignments' },
            { name: 'Class Timetable', path: '/app/academics?tab=timetable', tab: 'timetable' },
            { name: 'Online Exams', path: '/app/academics?tab=exams', tab: 'exams' },
            { name: 'Semester Fees', path: '/app/academics?tab=fees', tab: 'fees' },
          ],
        },
        { name: 'Projects', path: '/app/projects', icon: Users },
        { name: 'Events', path: '/app/events', icon: Calendar },
        { name: 'Campus Map', path: '/app/map', icon: MapPin },
        { name: 'Report Issue', path: '/app/report', icon: AlertTriangle },
        { name: 'Profile', path: '/app/profile', icon: User },
        { name: 'Settings', path: '/app/settings', icon: Settings },
      ];

  const displayName = user?.name || user?.fullName || 'Student';

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer */}
      <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
        <div>
          {/* Header */}
          <div className="h-16 px-5 border-b border-[#E5E5E5] flex items-center justify-between">
            <Logo to="/app/dashboard" size="sm" showBadge={false} />
            <button
              onClick={onClose}
              type="button"
              className="p-2 text-[#737373] hover:text-[#DC2626] rounded-lg cursor-pointer"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Links */}
          <nav className="p-3 space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isItemActive = location.pathname.startsWith(item.path);

              return (
                <div key={item.path} className="space-y-1">
                  <NavLink
                    to={item.path}
                    end={item.end}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors
                      ${
                        isActive
                          ? 'bg-[#FEF2F2] text-[#DC2626] font-bold'
                          : 'text-[#737373] hover:text-[#171717] hover:bg-[#FEF2F2]'
                      }
                    `}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    <span className="flex-1 truncate">{item.name}</span>
                    {item.badge && (
                      <Badge size="sm" variant="secondary" className="text-[10px]">
                        {item.badge}
                      </Badge>
                    )}
                  </NavLink>

                  {/* Sub-items for Academics */}
                  {item.subItems && isItemActive && (
                    <div className="ml-6 pl-3 py-1 space-y-1 border-l-2 border-red-200">
                      {item.subItems.map((sub) => {
                        const isSubActive = sub.tab
                          ? location.search.includes(`tab=${sub.tab}`)
                          : (!location.search.includes('tab=') && location.pathname === item.path);
                        return (
                          <NavLink
                            key={sub.name}
                            to={sub.path}
                            onClick={onClose}
                            className={`block text-xs font-medium py-1.5 px-2.5 rounded-md transition-colors ${
                              isSubActive
                                ? 'text-[#DC2626] font-bold bg-[#FEF2F2]'
                                : 'text-[#737373] hover:text-[#171717] hover:bg-neutral-100'
                            }`}
                          >
                            {sub.name}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* User Card */}
        <div className="p-4 border-t border-[#E5E5E5] bg-[#FAFAFA]">
          <NavLink
            to="/app/profile"
            className="flex items-center gap-3 group"
            onClick={onClose}
          >
            <Avatar src={user?.avatar} name={displayName} size="md" status="online" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#171717] truncate group-hover:text-[#DC2626] transition-colors">
                {displayName}
              </p>
              <p className="text-[11px] text-[#737373] truncate">
                {user?.department || 'Student'}
              </p>
            </div>
          </NavLink>
        </div>
      </div>
    </div>
  );
}

