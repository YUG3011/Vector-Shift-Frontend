import React from 'react';

export const Toast = ({ message, type = 'info', duration = 3500 }) => {
  React.useEffect(() => {
    const t = setTimeout(() => {}, duration);
    return () => clearTimeout(t);
  }, [duration]);

  const bg = type === 'error' ? 'rgba(220,38,38,0.95)' : 'rgba(37,99,235,0.95)';

  return (
    <div className="vs-toast" style={{ background: bg }} role="status" aria-live="polite">
      {message}
    </div>
  );
};

export default Toast;
