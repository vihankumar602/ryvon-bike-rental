import React from 'react';

export default function DateErrorNotice({ error, style = {} }) {
  if (!error) return null;

  return (
    <div
      className="booking-date-error-notice"
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        marginTop: '6px',
        borderRadius: '8px',
        background: 'rgba(239, 68, 68, 0.12)',
        border: '1px solid rgba(239, 68, 68, 0.4)',
        color: '#ef4444',
        fontSize: '12px',
        fontWeight: 600,
        lineHeight: 1.4,
        animation: 'fadeIn 0.2s ease',
        ...style
      }}
    >
      <span style={{ fontSize: '14px', flexShrink: 0 }}>⚠️</span>
      <span>{error}</span>
    </div>
  );
}
