import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';

export default function AuthRequiredModal({
  onClose,
  title = 'Your Ride Awaits!',
  description = 'Please sign in or create your RYVON account to continue with your motorcycle booking and secure your ride.',
  message,
  redirectUrl,
  cancelText = 'Continue Exploring'
}) {
  const navigate = useNavigate();
  const { closeModal } = useModal();

  const handleClose = () => {
    if (onClose) onClose();
    else closeModal();
  };

  const resolvedDesc = description || message || 'Please sign in or create your RYVON account to continue with your motorcycle booking and secure your ride.';

  const handleSignIn = () => {
    handleClose();
    const dest = redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login';
    navigate(dest);
  };

  const handleCreateAccount = () => {
    handleClose();
    const dest = redirectUrl ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : '/register';
    navigate(dest);
  };

  return (
    <div
      className="auth-required-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="auth-required-card animate-in">
        <button
          className="modal-close-btn"
          onClick={handleClose}
          aria-label="Close modal"
        >
          &times;
        </button>

        <div className="auth-required-icon-wrap">
          <span className="auth-required-badge">👑 RIDER CIRCLE SECURITY</span>
        </div>

        <h3 id="auth-modal-title" className="auth-required-title">
          {title}
        </h3>

        <p className="auth-required-desc">
          {resolvedDesc}
        </p>

        <div className="auth-required-actions">
          <button
            type="button"
            className="btn btn-primary auth-btn-gold"
            onClick={handleSignIn}
          >
            <span>Sign In</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </button>

          <button
            type="button"
            className="btn btn-outline auth-btn-outline"
            onClick={handleCreateAccount}
          >
            Create Account
          </button>

          <button
            type="button"
            className="auth-btn-ghost"
            onClick={handleClose}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
