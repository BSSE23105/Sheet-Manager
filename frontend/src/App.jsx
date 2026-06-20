/**
 * App Component — Main Application Shell
 *
 * Manages application state (records, loading, errors) and orchestrates
 * CRUD operations by communicating with the FastAPI backend.
 */

import { useState, useEffect, useCallback } from 'react';
import RecordTable from './components/RecordTable';
import RecordForm from './components/RecordForm';
import DeleteModal from './components/DeleteModal';
import Loader from './components/Loader';
import ErrorBanner from './components/ErrorBanner';
import './App.css';

// In dev (npm run dev): calls http://localhost:8000 directly
// In production build (served from backend via ngrok): uses relative URLs (same origin)
const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:8000' : '';

function App() {
  // ─── State ──────────────────────────────────────────────────────────────
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [deleteRecord, setDeleteRecord] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Success notification
  const [notification, setNotification] = useState(null);

  // ─── Fetch Records ──────────────────────────────────────────────────────

  const fetchRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/records`);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Failed to fetch records (${response.status})`);
      }

      const data = await response.json();
      setRecords(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch records. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // ─── Show Notification ─────────────────────────────────────────────────

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // ─── Create Record ─────────────────────────────────────────────────────

  const handleCreate = async (formData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Failed to create record (${response.status})`);
      }

      const created = await response.json();
      setRecords((prev) => [...prev, created]);
      setIsFormOpen(false);
      showNotification(`Record for "${created.name}" created successfully!`);
    } catch (err) {
      setError(err.message || 'Failed to create record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Update Record ─────────────────────────────────────────────────────

  const handleUpdate = async (formData) => {
    if (!editingRecord) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/record/${editingRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Failed to update record (${response.status})`);
      }

      const updated = await response.json();
      setRecords((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
      setIsFormOpen(false);
      setEditingRecord(null);
      showNotification(`Record for "${updated.name}" updated successfully!`);
    } catch (err) {
      setError(err.message || 'Failed to update record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Delete Record ─────────────────────────────────────────────────────

  const handleDelete = async (id) => {
    try {
      setIsDeleting(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/record/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Failed to delete record (${response.status})`);
      }

      const recordName = deleteRecord?.name || `ID ${id}`;
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setDeleteRecord(null);
      showNotification(`Record for "${recordName}" deleted successfully!`);
    } catch (err) {
      setError(err.message || 'Failed to delete record.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Modal Handlers ────────────────────────────────────────────────────

  const openCreateForm = () => {
    setEditingRecord(null);
    setIsFormOpen(true);
  };

  const openEditForm = (record) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingRecord(null);
  };

  const openDeleteModal = (record) => {
    setDeleteRecord(record);
  };

  const closeDeleteModal = () => {
    setDeleteRecord(null);
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="app">
      {/* Background decoration */}
      <div className="app__bg-glow app__bg-glow--1"></div>
      <div className="app__bg-glow app__bg-glow--2"></div>

      {/* Header */}
      <header className="app__header">
        <div className="app__header-content">
          <div className="app__logo">
            <div className="app__logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.9" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.3" />
              </svg>
            </div>
            <div>
              <h1 className="app__title">Sheet Manager</h1>
              <p className="app__subtitle">Google Sheets CRUD Application</p>
            </div>
          </div>

          <button
            className="btn btn--primary app__add-btn"
            onClick={openCreateForm}
            id="add-record-btn"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Add Record
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="app__main">
        <div className="app__container">
          {/* Stats bar */}
          {!isLoading && !error && (
            <div className="app__stats">
              <span className="app__stats-count">{records.length}</span>
              <span className="app__stats-label">
                {records.length === 1 ? 'record' : 'records'} in sheet
              </span>
              <button
                className="app__refresh-btn"
                onClick={fetchRecords}
                title="Refresh records"
                id="refresh-btn"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M1.5 7A5.5 5.5 0 0111.97 4M12.5 7A5.5 5.5 0 012.03 10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path d="M12 1.5V4H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12.5V10H4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}

          {/* Notification */}
          {notification && (
            <div className="app__notification" id="success-notification">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M5 8L7 10L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {notification}
            </div>
          )}

          {/* Error */}
          {error && (
            <ErrorBanner
              message={error}
              onDismiss={() => setError(null)}
            />
          )}

          {/* Content */}
          {isLoading ? (
            <Loader />
          ) : (
            <RecordTable
              records={records}
              onEdit={openEditForm}
              onDelete={openDeleteModal}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="app__footer">
        <p>Built with React + FastAPI · Google Sheets Integration</p>
      </footer>

      {/* Modals */}
      <RecordForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={editingRecord ? handleUpdate : handleCreate}
        editingRecord={editingRecord}
        isSubmitting={isSubmitting}
      />

      <DeleteModal
        isOpen={!!deleteRecord}
        record={deleteRecord}
        onConfirm={handleDelete}
        onCancel={closeDeleteModal}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default App;
