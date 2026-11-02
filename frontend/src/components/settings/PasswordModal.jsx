import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useToast } from '../ui/Toast';

/**
 * PasswordModal Component
 * Fields: Current Password, New Password, Confirm New Password
 * Actions: Cancel, Update Password
 */
export default function PasswordModal({
  isOpen,
  onClose,
  onPasswordUpdated,
}) {
  const { addToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required.';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required.';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirmation password is required.';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    // Simulate update operation
    setTimeout(() => {
      setIsSubmitting(false);
      handleClose();

      addToast({
        title: 'Security Updated',
        message: 'Password updated successfully.',
        type: 'success',
      });

      onPasswordUpdated?.();
    }, 450);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Change Password"
      description="Update your password regularly to keep your account secure."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Password */}
        <Input
          id="current-password"
          label="Current Password"
          type={showPasswords ? 'text' : 'password'}
          icon={Lock}
          required
          placeholder="Enter current password"
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value);
            if (errors.currentPassword) {
              setErrors((prev) => ({ ...prev, currentPassword: '' }));
            }
          }}
          error={errors.currentPassword}
          helperText={errors.currentPassword}
        />

        {/* New Password */}
        <Input
          id="new-password"
          label="New Password"
          type={showPasswords ? 'text' : 'password'}
          icon={Lock}
          required
          placeholder="Minimum 6 characters"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            if (errors.newPassword) {
              setErrors((prev) => ({ ...prev, newPassword: '' }));
            }
          }}
          error={errors.newPassword}
          helperText={errors.newPassword}
        />

        {/* Confirm New Password */}
        <Input
          id="confirm-password"
          label="Confirm New Password"
          type={showPasswords ? 'text' : 'password'}
          icon={Lock}
          required
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword) {
              setErrors((prev) => ({ ...prev, confirmPassword: '' }));
            }
          }}
          error={errors.confirmPassword}
          helperText={errors.confirmPassword}
        />

        {/* Show password toggle */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            className="text-xs text-[#737373] hover:text-[#171717] flex items-center gap-1.5 cursor-pointer select-none"
          >
            {showPasswords ? (
              <>
                <EyeOff className="h-3.5 w-3.5" />
                <span>Hide passwords</span>
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" />
                <span>Show passwords</span>
              </>
            )}
          </button>
        </div>

        {/* Modal Actions */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E5E5E5] mt-5">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={ShieldCheck}
            className="font-semibold"
          >
            Update Password
          </Button>
        </div>
      </form>
    </Modal>
  );
}
