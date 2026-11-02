import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Dropdown from '../ui/Dropdown';
import { useApp } from '../../context/AppContext';
import { useToast } from '../ui/Toast';

/**
 * Reusable UserMenu component for authenticated navigation
 * Contains: User avatar, User name, Dropdown arrow
 * Menu items: Profile, Settings, Logout
 */
export default function UserMenu({ className = '' }) {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useApp();
  const { addToast } = useToast();

  const handleSignOut = () => {
    logout();
    addToast({
      title: 'Signed Out',
      message: 'You have signed out. Log in to continue.',
      type: 'info',
    });
    navigate('/login');
  };

  const isFaculty =
    (user?.role || '').toLowerCase() === 'faculty' ||
    (user?.email || '').includes('faculty') ||
    (user?.name || '').toLowerCase().includes('dr.');

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Profile',
      icon: User,
      onClick: () => navigate('/app/profile'),
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: Settings,
      onClick: () => navigate('/app/settings'),
    },
    {
      key: 'switch-role',
      label: isFaculty ? 'Switch to Student View' : 'Switch to Faculty View',
      onClick: () => {
        if (updateProfile) {
          if (isFaculty) {
            updateProfile({
              id: 'u-1',
              name: 'Alex Morgan',
              email: 'alex.morgan@university.edu',
              role: 'Student',
              department: 'Computer Science & Engineering',
              departmentCode: 'CSE',
              semester: 7,
            });
            addToast({
              title: 'Switched to Student Portal',
              description: 'Viewing portal as student.',
              variant: 'default',
            });
          } else {
            updateProfile({
              id: 'u-faculty-1',
              name: 'Dr. Sarah Chen, Ph.D.',
              email: 'dr.chen@faculty.university.edu',
              role: 'Faculty',
              department: 'Computer Science & Engineering',
              departmentCode: 'CSE',
              designation: 'Associate Professor & Lab Director',
              academicRank: 'Associate Professor',
            });
            addToast({
              title: 'Switched to Faculty Portal',
              description: 'Welcome Dr. Sarah Chen, Ph.D. - Faculty mode active.',
              variant: 'success',
            });
          }
        }
      },
    },
    { divider: true },
    {
      key: 'logout',
      label: 'Logout',
      icon: LogOut,
      variant: 'danger',
      onClick: handleSignOut,
    },
  ];

  const displayName = user?.name || user?.fullName || 'Student';

  return (
    <div className={className}>
      <Dropdown
        align="right"
        width="w-56"
        trigger={
          <button
            type="button"
            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#FEF2F2] transition-colors cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20"
            aria-label="User profile options"
          >
            <Avatar
              src={user?.avatar}
              name={displayName}
              size="sm"
              status="online"
            />
            <span className="hidden md:inline-block text-xs font-bold text-[#171717] truncate max-w-[130px]">
              {displayName}
            </span>
            <ChevronDown className="h-4 w-4 text-[#737373]" />
          </button>
        }
        items={userMenuItems}
      />
    </div>
  );
}
