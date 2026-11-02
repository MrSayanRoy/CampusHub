import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Newspaper,
  GraduationCap,
  Users,
  Calendar,
  MapPin,
  AlertTriangle,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
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

/**
 * CampusHub Collapsible Sidebar
 * Dynamically renders role-aware navigation:
 * - Faculty: Main, Teaching, Students & Campus, Campus, Account
 * - Student: Dashboard, Community, Campus, Account
 */
export default function Sidebar({ isCollapsed, onToggleCollapse, className = '' }) {
  const location = useLocation();
  const { user, notices = [] } = useApp();

  const unreadNoticesCount = notices.filter((n) => !n.read).length;

  const isFaculty =
    (user?.role || '').toLowerCase() === 'faculty' ||
    (user?.email || '').includes('faculty') ||
    (user?.name || '').toLowerCase().includes('dr.');

  const navSections = isFaculty
    ? [
        {
          title: 'Main',
          items: [
            {
              name: 'Dashboard',
              path: '/app/dashboard',
              icon: LayoutDashboard,
              end: true,
            },
          ],
        },
        {
          title: 'Teaching',
          items: [
            {
              name: 'My Courses & Classes',
              path: '/app/courses',
              icon: BookOpen,
            },
            {
              name: 'Timetable',
              path: '/app/academics?tab=timetable',
              icon: Clock,
            },
            {
              name: 'Attendance',
              path: '/app/academics?tab=attendance',
              icon: CalendarCheck,
            },
            {
              name: 'Assignments',
              path: '/app/academics?tab=assignments',
              icon: FileText,
            },
            {
              name: 'Exams & Results',
              path: '/app/academics?tab=exams',
              icon: GraduationCap,
            },
            {
              name: 'Study Materials',
              path: '/app/materials',
              icon: FolderOpen,
            },
          ],
        },
        {
          title: 'Students & Campus',
          items: [
            {
              name: 'My Students',
              path: '/app/students',
              icon: Users,
            },
            {
              name: 'Announcements',
              path: '/app/announcements',
              icon: Bell,
            },
            {
              name: 'Projects & Mentorship',
              path: '/app/projects',
              icon: Award,
            },
            {
              name: 'Events',
              path: '/app/events',
              icon: Calendar,
            },
          ],
        },
        {
          title: 'Campus',
          items: [
            {
              name: 'Campus Map',
              path: '/app/map',
              icon: MapPin,
            },
            {
              name: 'Report Issue',
              path: '/app/report',
              icon: AlertTriangle,
            },
          ],
        },
        {
          title: 'Account',
          items: [
            {
              name: 'Profile & Settings',
              path: '/app/profile',
              icon: User,
            },
          ],
        },
      ]
    : [
        {
          title: null,
          items: [
            {
              name: 'Dashboard',
              path: '/app/dashboard',
              icon: LayoutDashboard,
              end: true,
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              name: 'Feed',
              path: '/app/feed',
              icon: Newspaper,
              badge: unreadNoticesCount > 0 ? `${unreadNoticesCount} new` : undefined,
              badgeVariant: 'secondary',
            },
            {
              name: 'Academics',
              path: '/app/academics',
              icon: GraduationCap,
              subItems: [
                { name: 'Attendance Tracker', path: '/app/academics?tab=attendance', tab: 'attendance' },
                { name: 'Assignments', path: '/app/academics?tab=assignments', tab: 'assignments' },
                { name: 'Class Timetable', path: '/app/academics?tab=timetable', tab: 'timetable' },
                { name: 'Online Exams', path: '/app/academics?tab=exams', tab: 'exams' },
                { name: 'Semester Fees', path: '/app/academics?tab=fees', tab: 'fees' },
              ],
            },
            {
              name: 'Projects',
              path: '/app/projects',
              icon: Users,
            },
            {
              name: 'Events',
              path: '/app/events',
              icon: Calendar,
            },
          ],
        },
        {
          title: 'Campus',
          items: [
            {
              name: 'Campus Map',
              path: '/app/map',
              icon: MapPin,
            },
            {
              name: 'Report Issue',
              path: '/app/report',
              icon: AlertTriangle,
            },
          ],
        },
        {
          title: 'Account',
          items: [
            {
              name: 'Profile',
              path: '/app/profile',
              icon: User,
            },
            {
              name: 'Settings',
              path: '/app/settings',
              icon: Settings,
            },
          ],
        },
      ];

  const displayName = user?.name || user?.fullName || 'Student';

  return (
    <aside
      className={`
        bg-white border-r border-[#E5E5E5] flex flex-col transition-all duration-200 z-30
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${className}
      `}
    >
      {/* Brand Header */}
      <div className="h-16 border-b border-[#E5E5E5] px-4 flex items-center justify-between">
        {!isCollapsed ? (
          <Logo to="/app/dashboard" size="md" showText={true} showBadge={false} />
        ) : (
          <Logo to="/app/dashboard" size="md" showText={false} className="mx-auto" />
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        <nav className="space-y-6">
          {navSections.map((section, idx) => (
            <div key={section.title || `sec-${idx}`} className="space-y-1">
              {!isCollapsed && section.title && (
                <div className="px-3 pb-1 text-[11px] font-bold text-[#A3A3A3] uppercase tracking-wider">
                  {section.title}
                </div>
              )}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const hasQuery = item.path.includes('?');
                  const queryPart = hasQuery ? item.path.split('?')[1] : null;
                  const isItemActive = hasQuery
                    ? location.pathname === item.path.split('?')[0] && location.search.includes(queryPart)
                    : item.end
                    ? location.pathname === item.path
                    : location.pathname.startsWith(item.path);

                  return (
                    <React.Fragment key={item.path}>
                      <NavLink
                        to={item.path}
                        end={item.end}
                        title={isCollapsed ? item.name : undefined}
                        className={({ isActive }) => {
                          const active = hasQuery ? isItemActive : isActive;
                          return `
                          w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 relative group
                          ${
                            active
                              ? 'bg-[#FEF2F2] text-[#DC2626] font-bold before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-[#DC2626] before:rounded-r'
                              : 'text-[#737373] hover:text-[#171717] hover:bg-neutral-100'
                          }
                          ${isCollapsed ? 'justify-center px-0' : ''}
                        `;
                        }}
                      >
                        {({ isActive }) => {
                          const active = hasQuery ? isItemActive : isActive;
                          return (
                          <>
                            <Icon
                              className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                                active
                                  ? 'text-[#DC2626]'
                                  : 'text-[#737373] group-hover:text-[#171717]'
                              }`}
                            />

                            {!isCollapsed && (
                              <div className="flex-1 flex items-center justify-between truncate">
                                <span className="truncate">{item.name}</span>
                                {item.badge && (
                                  <Badge
                                    size="sm"
                                    variant={item.badgeVariant || (active ? 'primary' : 'secondary')}
                                    className="text-[10px] px-1.5 py-0.2"
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </>
                          );
                        }}
                      </NavLink>

                      {/* Sub-sections underneath navigation item */}
                      {item.subItems && !isCollapsed && isItemActive && (
                        <div className="ml-5 pl-3 py-1 space-y-1 border-l border-red-200">
                          {item.subItems.map((sub) => {
                            const isSubActive = sub.tab
                              ? location.search.includes(`tab=${sub.tab}`)
                              : (!location.search.includes('tab=') && location.pathname === item.path);
                            return (
                              <NavLink
                                key={sub.name}
                                to={sub.path}
                                className={`block text-[11px] font-medium py-1 px-2.5 rounded-md transition-colors ${
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
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User Footer Profile snippet & Collapse Control on Mini */}
      <div className="p-3 border-t border-[#E5E5E5]">
        {!isCollapsed ? (
          <div className="flex items-center justify-between gap-2 p-1.5">
            <NavLink
              to="/app/profile"
              className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-neutral-100 transition-colors group flex-1 min-w-0"
            >
              <Avatar
                src={user?.avatar}
                name={displayName}
                size="sm"
                status="online"
              />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-bold text-[#171717] truncate group-hover:text-[#171717] transition-colors">
                  {displayName}
                </p>
                <p className="text-[11px] text-[#737373] truncate">
                  {user?.role || 'Student'}
                </p>
              </div>
            </NavLink>

            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1 rounded-md text-[#737373] hover:text-[#171717] hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <NavLink to="/app/profile" title={displayName}>
              <Avatar
                src={user?.avatar}
                name={displayName}
                size="sm"
                status="online"
              />
            </NavLink>
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-[#737373] hover:text-[#171717] hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
