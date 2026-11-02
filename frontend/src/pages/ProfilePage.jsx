import React, { useState, useEffect } from 'react';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileInfoCard from '../components/profile/ProfileInfoCard';
import AboutSection from '../components/profile/AboutSection';
import SkillsSection from '../components/profile/SkillsSection';
import AcademicInfo from '../components/profile/AcademicInfo';
import EditProfileForm from '../components/profile/EditProfileForm';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';
import { getCurrentUserApi, updateUserProfileApi } from '../services/userService';
import { Edit3, CheckCircle2 } from 'lucide-react';
import Button from '../components/ui/Button';

/**
 * CampusHub Profile Page
 * Enables students to view and edit their CampusHub identity.
 * Consumes GET /api/users/me and updates via PUT /api/users/profile.
 */
export default function ProfilePage() {
  const { user: contextUser, updateProfile } = useApp();
  const { addToast } = useToast();

  const [currentUser, setCurrentUser] = useState(contextUser || null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  // Fetch student profile using GET /api/users/me abstraction
  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setIsLoading(true);
      try {
        const response = await getCurrentUserApi(contextUser);
        if (isMounted && response.success && response.user) {
          setCurrentUser(response.user);
          if (updateProfile) {
            updateProfile(response.user);
          }
        }
      } catch (err) {
        if (isMounted) {
          setCurrentUser(contextUser);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // Save changes using PUT /api/users/profile abstraction
  const handleSaveProfile = async (formData) => {
    setIsSaving(true);
    setApiError('');

    try {
      const response = await updateUserProfileApi(formData, currentUser);

      if (response.success && response.user) {
        setCurrentUser(response.user);
        if (updateProfile) {
          updateProfile(response.user);
        }

        setIsEditing(false);
        addToast({
          title: 'Profile Updated',
          message: 'Profile updated successfully.',
          type: 'success',
        });
      } else {
        const errMsg = response.error || 'Please check the entered information.';
        setApiError(errMsg);
        addToast({
          title: 'Unable to update profile.',
          message: errMsg,
          type: 'error',
        });
      }
    } catch (err) {
      const genericErr = 'Unable to update profile. Please try again.';
      setApiError(genericErr);
      addToast({
        title: 'Unable to update profile.',
        message: genericErr,
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setApiError('');
  };

  // Loading Skeleton State
  if (isLoading && !currentUser) {
    return (
      <div className="space-y-6 animate-pulse" aria-busy="true">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-neutral-200 rounded-lg" />
          <div className="h-4 w-80 bg-neutral-200 rounded-md" />
        </div>
        <div className="h-48 bg-neutral-200 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <div className="h-36 bg-neutral-200 rounded-xl" />
            <div className="h-36 bg-neutral-200 rounded-xl" />
          </div>
          <div className="lg:col-span-5 space-y-6">
            <div className="h-52 bg-neutral-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const profileUser = currentUser || contextUser || {};

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <ProfileHeader
        title="My Profile"
        subtitle="Manage your personal information and campus profile."
        action={
          !isEditing ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={Edit3}
              onClick={() => setIsEditing(true)}
              className="font-semibold bg-white text-[#171717] border border-[#E5E5E5] hover:border-[#DC2626] hover:text-[#DC2626] hover:bg-white transition-colors"
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                Editing Mode
              </span>
            </div>
          )
        }
      />

      {/* 2. Main Profile Display or Edit Form */}
      {!isEditing ? (
        <div className="space-y-6">
          {/* Profile Header Card */}
          <ProfileInfoCard
            user={profileUser}
            onEditClick={() => setIsEditing(true)}
          />

          {/* Responsive Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (7 cols): About & Skills */}
            <div className="lg:col-span-7 space-y-6">
              {/* About Section */}
              <AboutSection
                bio={profileUser.bio}
                onEditClick={() => setIsEditing(true)}
              />

              {/* Skills Section */}
              <SkillsSection
                skills={profileUser.skills || []}
                isEditing={false}
                onAddSkillClick={() => setIsEditing(true)}
              />
            </div>

            {/* Right Column (5 cols): Academic Information */}
            <div className="lg:col-span-5 space-y-6">
              <AcademicInfo
                user={profileUser}
                onEditClick={() => setIsEditing(true)}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Edit Mode Form */
        <div className="animate-in fade-in duration-150">
          <EditProfileForm
            initialUser={profileUser}
            onSave={handleSaveProfile}
            onCancel={handleCancelEdit}
            isSaving={isSaving}
            apiError={apiError}
          />
        </div>
      )}
    </div>
  );
}
