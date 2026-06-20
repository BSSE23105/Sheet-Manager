/**
 * ErrorBanner Component
 * Dismissable error notification banner with animation.
 * Displays API errors and other failure states to the user.
 */

import { useState, useEffect } from 'react';
import './ErrorBanner.css';

function ErrorBanner({ message, onDismiss }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 300);
  };

  if (!message) return null;

  return (
    <div
      className={`error-banner ${isVisible ? 'error-banner--visible' : ''}`}
      role="alert"
      id="error-banner"
    >
      <div className="error-banner__icon">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 2L18.66 17H1.34L10 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M10 8V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="10" cy="14" r="0.75" fill="currentColor" />
        </svg>
      </div>
      <p className="error-banner__message">{message}</p>
      <button
        className="error-banner__dismiss"
        onClick={handleDismiss}
        aria-label="Dismiss error"
        id="dismiss-error-btn"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export default ErrorBanner;
