import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((text) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts(prev => [...prev, { id, text }]);
    setTimeout(() => {
      dismissToast(id);
    }, 3400);
  }, [dismissToast]);

  return (
    <ToastContext.Provider value={{ toast, dismissToast, toasts }}>
      {children}
      <div className="toast-region" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className="toast" onClick={() => dismissToast(t.id)}>
            <span className="toast-icon">⚡</span>
            <span>{t.text}</span>
            <span className="toast-bar"></span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toast: (msg) => { console.log('Toast:', msg); },
      dismissToast: () => {},
      toasts: []
    };
  }
  return context;
}
