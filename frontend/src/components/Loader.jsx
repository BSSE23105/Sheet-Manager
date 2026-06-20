/**
 * Loader Component
 * Animated loading spinner with optional message text.
 * Uses CSS keyframe animations for smooth, performant rendering.
 */

import './Loader.css';

function Loader({ message = 'Loading records...' }) {
  return (
    <div className="loader-container" id="loader">
      <div className="loader-spinner">
        <div className="loader-ring"></div>
        <div className="loader-ring"></div>
        <div className="loader-ring"></div>
      </div>
      <p className="loader-message">{message}</p>
    </div>
  );
}

export default Loader;
