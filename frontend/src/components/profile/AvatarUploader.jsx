import React, { useRef } from 'react';
import { Camera, Trash2, UploadCloud } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

/**
 * AvatarUploader Component
 * Provides "Change Photo" functionality, local file selection,
 * live preview before saving, and fallback to student initials.
 */
export default function AvatarUploader({
  avatarSrc,
  userName = 'Student',
  onAvatarChange,
  isEditing = true,
  className = '',
}) {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP).');
      return;
    }

    // Read and create preview URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (result && typeof onAvatarChange === 'function') {
        onAvatarChange(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    if (typeof onAvatarChange === 'function') {
      onAvatarChange('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 ${className}`}>
      {/* Avatar Preview */}
      <div className="relative group">
        <Avatar
          src={avatarSrc}
          name={userName}
          size="2xl"
          className="ring-4 ring-slate-100 shadow-sm"
        />

        {isEditing && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2 bg-[#DC2626] text-white rounded-full shadow-md hover:bg-[#B91C1C] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DC2626]"
            title="Change Photo"
            aria-label="Change profile photo"
          >
            <Camera className="h-4 w-4" />
          </button>
        )}
      </div>

      {isEditing && (
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div>
            <h4 className="text-sm font-bold text-[#171717]">Profile Photo</h4>
            <p className="text-xs text-[#737373]">
              Display a clear headshot or avatar across your campus teams and projects.
            </p>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={UploadCloud}
              onClick={() => fileInputRef.current?.click()}
            >
              Change Photo
            </Button>

            {avatarSrc && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                leftIcon={Trash2}
                onClick={handleRemovePhoto}
                className="text-[#DC2626] hover:text-[#B91C1C] hover:bg-[#FEF2F2]"
              >
                Remove
              </Button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/gif"
            className="hidden"
            onChange={handleFileSelect}
          />
          <p className="text-[11px] text-[#A3A3A3]">
            JPG, PNG, or WEBP up to 5MB. Photo preview will be confirmed upon saving.
          </p>
        </div>
      )}
    </div>
  );
}
