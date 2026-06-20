/**
 * RecordTable Component
 * Displays all records in a styled, responsive table with action buttons
 * for editing and deleting individual records.
 */

import './RecordTable.css';

function RecordTable({ records, onEdit, onDelete }) {
  if (records.length === 0) {
    return (
      <div className="table-empty" id="empty-state">
        <div className="table-empty__icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="6" y="10" width="36" height="28" rx="4" stroke="currentColor" strokeWidth="2" />
            <line x1="6" y1="18" x2="42" y2="18" stroke="currentColor" strokeWidth="2" />
            <line x1="18" y1="18" x2="18" y2="38" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="30" y1="18" x2="30" y2="38" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
          </svg>
        </div>
        <h3 className="table-empty__title">No records yet</h3>
        <p className="table-empty__subtitle">
          Create your first record using the button above.
        </p>
      </div>
    );
  }

  return (
    <div className="table-wrapper" id="records-table-wrapper">
      <table className="records-table" id="records-table">
        <thead>
          <tr>
            <th className="col-id">ID</th>
            <th className="col-name">Name</th>
            <th className="col-email">Email</th>
            <th className="col-department">Department</th>
            <th className="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => (
            <tr
              key={record.id}
              className="records-table__row"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <td className="col-id">
                <span className="id-badge">{record.id}</span>
              </td>
              <td className="col-name">
                <span className="name-text">{record.name}</span>
              </td>
              <td className="col-email">
                <span className="email-text">{record.email}</span>
              </td>
              <td className="col-department">
                <span className="department-tag">{record.department}</span>
              </td>
              <td className="col-actions">
                <div className="action-buttons">
                  <button
                    className="action-btn action-btn--edit"
                    onClick={() => onEdit(record)}
                    aria-label={`Edit record ${record.id}`}
                    id={`edit-btn-${record.id}`}
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path
                        d="M10.586 1.586a2 2 0 112.828 2.828l-8.5 8.5L1.5 13.5l.586-3.414 8.5-8.5z"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Edit</span>
                  </button>
                  <button
                    className="action-btn action-btn--delete"
                    onClick={() => onDelete(record)}
                    aria-label={`Delete record ${record.id}`}
                    id={`delete-btn-${record.id}`}
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path
                        d="M2.5 4.5h10M5.5 4.5V2.5h4v2M6 7v4M9 7v4M3.5 4.5l.5 8h7l.5-8"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Delete</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RecordTable;
