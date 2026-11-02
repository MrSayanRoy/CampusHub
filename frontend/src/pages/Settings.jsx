import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  Shield,
  Bell,
  Lock,
  Mail,
  GraduationCap,
  Calendar,
  Edit3,
  Trash2,
  AlertTriangle,
  Check,
  Save,
  Link2,
  ArrowLeft,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';
import SettingsSidebar, { DEFAULT_SETTINGS_SECTIONS } from '../components/settings/SettingsSidebar';
import SettingsSection from '../components/settings/SettingsSection';
import ConnectedAccountsSection from '../components/settings/ConnectedAccountsSection';
import Toggle from '../components/settings/Toggle';
import PasswordModal from '../components/settings/PasswordModal';
import ConfirmationModal from '../components/settings/ConfirmationModal';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const PREFERENCES_STORAGE_KEY = 'campushub_user_preferences';

/**
 * CampusHub Settings Page
 * Calm, minimal, and functional account settings adhering to the CampusHub design system.
 */
export default function Settings() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useApp();
  const { addToast } = useToast();

  const initialSection = searchParams.get('section') || searchParams.get('tab') || 'account';
  const [activeSection, setActiveSection] = useState(initialSection);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync active section with URL query params
  useEffect(() => {
    const sectionFromUrl = searchParams.get('section') || searchParams.get('tab');
    if (sectionFromUrl && sectionFromUrl !== activeSection) {
      setActiveSection(sectionFromUrl);
    }
  }, [searchParams]);

  const handleSelectSection = (sectionId) => {
    setActiveSection(sectionId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (sectionId === 'account') {
        next.delete('section');
      } else {
        next.set('section', sectionId);
      }
      return next;
    });
  };

  // Preferences state
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    campusUpdates: true,
  });

  // Load saved preferences from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (saved) {
        setPreferences(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleTogglePreference = (key, value) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);

    try {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    addToast({
      title: 'Preferences Updated',
      message: 'Preferences saved.',
      type: 'success',
    });
  };

  const handleDeleteAccountConfirm = () => {
    setIsDeleting(true);

    // Simulate safe de-provisioning flow (Phase 1)
    setTimeout(() => {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);

      addToast({
        title: 'Request Received',
        message: 'Your account deletion request has been submitted for review.',
        type: 'info',
      });
    }, 600);
  };

  const student = user || {};
  const studentName = student.name || 'Sayan Ghosh';
  const studentEmail = student.email || 'sayan@college.edu';
  const department = student.department || 'Computer Science & Engineering';
  const semester = student.semester || '7th Semester';

  return (
    <div className="space-y-6">
      {/* Page Header with Back Navigation Icon */}
      <div className="flex items-start sm:items-center gap-3.5">
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/app/dashboard');
            }
          }}
          className="p-2 sm:p-2.5 rounded-xl border border-[#E5E5E5] bg-white text-[#737373] hover:text-[#DC2626] hover:bg-[#FEF2F2] hover:border-red-200 transition-all shadow-2xs cursor-pointer group shrink-0 mt-0.5 sm:mt-0 flex items-center justify-center"
          title="Go backwards"
          aria-label="Go backwards"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
            Settings
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-[#737373] leading-relaxed">
            Manage your account and preferences.
          </p>
        </div>
      </div>

      {/* Main Settings Layout: Responsive grid with left vertical nav & right content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Settings Navigation */}
        <div className="md:col-span-4 lg:col-span-3">
          <SettingsSidebar
            activeSection={activeSection}
            onSelectSection={handleSelectSection}
            sections={DEFAULT_SETTINGS_SECTIONS}
          />
        </div>

        {/* Right: Content Sections */}
        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          {/* SECTION 1: ACCOUNT */}
          {(activeSection === 'account' || activeSection === 'all') && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <SettingsSection
                id="section-account"
                title="Account Information"
                description="Your personal and college-affiliated identity credentials."
                icon={User}
              >
                <div className="space-y-4">
                  {/* Account Information Display Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="p-3.5 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA]">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#737373] uppercase tracking-wider mb-1">
                        <User className="h-3.5 w-3.5 text-neutral-400" />
                        Full Name
                      </div>
                      <p className="text-sm font-bold text-[#171717] truncate">
                        {studentName}
                      </p>
                    </div>

                    {/* Email (Read-Only) */}
                    <div className="p-3.5 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA]">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#737373] uppercase tracking-wider">
                          <Mail className="h-3.5 w-3.5 text-neutral-400" />
                          College Email
                        </div>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-neutral-200 text-[#737373]">
                          Read-only
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[#171717] truncate">
                        {studentEmail}
                      </p>
                    </div>

                    {/* Department */}
                    <div className="p-3.5 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA]">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#737373] uppercase tracking-wider mb-1">
                        <GraduationCap className="h-3.5 w-3.5 text-neutral-400" />
                        Department
                      </div>
                      <p className="text-sm font-bold text-[#171717] truncate">
                        {department}
                      </p>
                    </div>

                    {/* Semester */}
                    <div className="p-3.5 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA]">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#737373] uppercase tracking-wider mb-1">
                        <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                        Semester
                      </div>
                      <p className="text-sm font-bold text-[#171717] truncate">
                        {semester}
                      </p>
                    </div>
                  </div>

                  {/* Navigation trigger to Profile */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#E5E5E5]">
                    <p className="text-xs text-[#737373]">
                      Need to modify your bio, skills, or departmental enrollment?
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      leftIcon={Edit3}
                      onClick={() => navigate('/app/profile')}
                      className="font-semibold shrink-0"
                    >
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </SettingsSection>
            </div>
          )}

          {/* SECTION 2: SECURITY */}
          {(activeSection === 'security' || activeSection === 'all') && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <SettingsSection
                id="section-security"
                title="Security"
                description="Manage your password and protect your campus student account."
                icon={Shield}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                      <Lock className="h-4 w-4 text-[#DC2626]" />
                      Change Password
                    </h4>
                    <p className="text-xs text-[#737373] leading-relaxed max-w-lg">
                      Update your password regularly to keep your account secure.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={Lock}
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="font-semibold shrink-0 self-start sm:self-auto"
                  >
                    Change Password
                  </Button>
                </div>
              </SettingsSection>
            </div>
          )}

          {/* SECTION: CONNECTED ACCOUNTS */}
          {(activeSection === 'connected-accounts' || activeSection === 'all') && (
            <ConnectedAccountsSection />
          )}

          {/* SECTION 3: PREFERENCES */}
          {(activeSection === 'preferences' || activeSection === 'all') && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <SettingsSection
                id="section-preferences"
                title="Notifications"
                description="Configure how and when you receive campus updates and alerts."
                icon={Bell}
              >
                <div className="divide-y divide-[#E5E5E5]">
                  {/* Email Notifications Toggle */}
                  <Toggle
                    id="toggle-email-notifications"
                    label="Email Notifications"
                    description="Receive updates about events, project requests, and campus activity."
                    checked={preferences.emailNotifications}
                    onChange={(checked) =>
                      handleTogglePreference('emailNotifications', checked)
                    }
                  />

                  {/* Campus Updates Toggle */}
                  <Toggle
                    id="toggle-campus-updates"
                    label="Campus Updates"
                    description="Receive important campus announcements."
                    checked={preferences.campusUpdates}
                    onChange={(checked) =>
                      handleTogglePreference('campusUpdates', checked)
                    }
                  />
                </div>
              </SettingsSection>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}
