import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { FiAlertTriangle } from 'react-icons/fi';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone. Please confirm to proceed.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // danger, warning, primary
  loading = false,
}) => {
  const colors = {
    danger: {
      iconBg: 'bg-red-50 dark:bg-red-950/20',
      iconText: 'text-red-650 dark:text-red-400',
      btnVariant: 'danger',
    },
    warning: {
      iconBg: 'bg-amber-50 dark:bg-amber-950/20',
      iconText: 'text-amber-650 dark:text-amber-400',
      btnVariant: 'primary', // standard alert
    },
    primary: {
      iconBg: 'bg-brand-50 dark:bg-brand-950/20',
      iconText: 'text-brand-650 dark:text-brand-400',
      btnVariant: 'primary',
    },
  };

  const selectedColor = colors[type] || colors.danger;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" closeOnOverlayClick={!loading}>
      <div className="flex flex-col items-center text-center">
        <div className={`p-3 rounded-full ${selectedColor.iconBg} ${selectedColor.iconText} mb-4`}>
          <FiAlertTriangle className="h-6 w-6" />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          {message}
        </p>
        <div className="flex items-center justify-end w-full gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={selectedColor.btnVariant} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
