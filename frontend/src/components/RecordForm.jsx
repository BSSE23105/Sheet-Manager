/**
 * RecordForm Component
 * Modal form for creating or editing records.
 * Includes client-side validation for required fields and email format.
 */

import { useState, useEffect, useRef } from 'react';
import './RecordForm.css';

function RecordForm({ isOpen, onClose, onSubmit, editingRecord, isSubmitting }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
  });
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);
  const nameInputRef = useRef(null);

  const isEditMode = !!editingRecord;

  // Populate form when editing
  useEffect(() => {
    if (editingRecord) {
      setFormData({
        name: editingRecord.name || '',
        email: editingRecord.email || '',
        department: editingRecord.department || '',
      });
    } else {
      setFormData({ name: '', email: '', department: '' });
    }
    setErrors({});
  }, [editingRecord, isOpen]);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isSubmitting, onClose]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Name must be 100 characters or less';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    } else if (formData.department.trim().length > 100) {
      newErrors.department = 'Department must be 100 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const trimmedData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        department: formData.department.trim(),
      };
      onSubmit(trimmedData);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      id="record-form-modal"
    >
      <div className="modal-content" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditMode ? 'Edit Record' : 'Create New Record'}
          </h2>
          <button
            className="modal-close"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close form"
            id="close-form-btn"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="modal-form" noValidate>
          <div className={`form-group ${errors.name ? 'form-group--error' : ''}`}>
            <label htmlFor="name" className="form-label">Name</label>
            <input
              ref={nameInputRef}
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              disabled={isSubmitting}
              autoComplete="name"
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className={`form-group ${errors.email ? 'form-group--error' : ''}`}>
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. john@example.com"
              disabled={isSubmitting}
              autoComplete="email"
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className={`form-group ${errors.department ? 'form-group--error' : ''}`}>
            <label htmlFor="department" className="form-label">Department</label>
            <input
              type="text"
              id="department"
              name="department"
              className="form-input"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g. Engineering"
              disabled={isSubmitting}
              autoComplete="organization"
            />
            {errors.department && <span className="form-error">{errors.department}</span>}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
              disabled={isSubmitting}
              id="cancel-form-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitting}
              id="submit-form-btn"
            >
              {isSubmitting ? (
                <>
                  <span className="btn-spinner"></span>
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditMode ? 'Update Record' : 'Create Record'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RecordForm;
