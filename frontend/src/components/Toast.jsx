import { useState, useEffect } from 'react';
import { setAddToastFn } from '../helpers/toast.js';

const TOAST_DURATION = 4000;

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    setAddToastFn((toast) => {
      setToasts((prev) => [...prev, toast]);
    });
    return () => { setAddToastFn(null); };
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [toasts]);

  const icons = {
    success: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    error: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    info: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      pointerEvents: 'none',
    }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            borderRadius: '10px',
            background: toast.type === 'error' ? 'rgba(239,68,68,0.15)' : toast.type === 'info' ? 'rgba(59,130,246,0.15)' : 'rgba(34,197,94,0.15)',
            border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.3)' : toast.type === 'info' ? 'rgba(59,130,246,0.3)' : 'rgba(34,197,94,0.3)'}`,
            color: toast.type === 'error' ? '#fca5a5' : toast.type === 'info' ? '#93c5fd' : '#86efac',
            fontSize: '14px',
            fontWeight: 500,
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            animation: 'slideUp 0.3s ease',
            pointerEvents: 'auto',
            maxWidth: '400px',
          }}
          onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
        >
          <span style={{ width: '20px', height: '20px', flexShrink: 0 }}>
            {icons[toast.type] || icons.success}
          </span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
