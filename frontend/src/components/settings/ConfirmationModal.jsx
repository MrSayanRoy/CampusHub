import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { AlertTriangle, Trash2 } from 'lucide-react';

/**
 * Reusable ConfirmationModal Component
 * Used for dangerous or irreversible account actions.
 */
export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Account',
  message = 'Are you sure you want to delete your account? This action cannot be undone.',
  confirmLabel = 'Delete Account',
  cancelLabel = 'Cancel',
  isLoading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA]">
          <div className="p-2 rounded-lg bg-[#FEE2E2] text-[#DC2626] shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#991B1B]">Warning: Irreversible Action</h4>
            <p className="text-xs text-[#B91C1C] leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <p className="text-xs text-[#737373]">
          All your enrolled projects, RSVPs, campus history, and profile data will be permanently scheduled for purge.
        </p>

        {/* Modal Actions */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E5E5E5] mt-5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            variant="danger"
            isLoading={isLoading}
            leftIcon={Trash2}
            onClick={onConfirm}
            className="font-semibold shadow-xs"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
