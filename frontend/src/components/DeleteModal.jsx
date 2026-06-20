/**
 * DeleteModal Component
 * Confirmation dialog shown before deleting a record.
 * Prevents accidental deletions by requiring explicit confirmation.
 */

import { useEffect } from 'react';
import './DeleteModal.css';

function DeleteModal({ isOpen, record, onConfirm, onCancel, isDeleting }) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isDeleting, onCancel]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onCancel();
    }
  };

  if (!isOpen || !record) return null;

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      id="delete-modal"
    >
      <div className="delete-modal" role="alertdialog" aria-modal="true">
        <div className="delete-modal__icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.5" />
            <path d="M14 9V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="14" cy="19" r="1" fill="currentColor" />
          </svg>
        </div>

        <h3 className="delete-modal__title">Delete Record</h3>
        <p className="delete-modal__message">
          Are you sure you want to delete the record for{' '}
          <strong>{record.name}</strong> (ID: {record.id})?
          This action cannot be undone.
        </p>

        <div className="delete-modal__info">
          <div className="delete-modal__info-row">
            <span className="delete-modal__info-label">Email</span>
            <span className="delete-modal__info-value">{record.email}</span>
          </div>
          <div className="delete-modal__info-row">
            <span className="delete-modal__info-label">Department</span>
            <span className="delete-modal__info-value">{record.department}</span>
          </div>
        </div>

        <div className="delete-modal__actions">
          <button
            className="btn btn--secondary"
            onClick={onCancel}
            disabled={isDeleting}
            id="cancel-delete-btn"
          >
            Cancel
          </button>
          <button
            className="btn btn--danger"
            onClick={() => onConfirm(record.id)}
            disabled={isDeleting}
            id="confirm-delete-btn"
          >
            {isDeleting ? (
              <>
                <span className="btn-spinner btn-spinner--danger"></span>
                Deleting...
              </>
            ) : (
              'Delete Record'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteModal;
