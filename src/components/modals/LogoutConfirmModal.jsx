import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function LogoutConfirmModal({ onClose }) {
  const navigate = useNavigate();
  const { closeModal } = useModal();
  const { logout } = useAuth();
  const { toast } = useToast();

  const handleClose = () => {
    if (onClose) onClose();
    else closeModal();
  };

  const handleConfirmLogout = () => {
    logout();
    handleClose();
    toast('You have been signed out successfully.');
    navigate('/');
  };

  return (
    <div
      className="modal active logout-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="modal-card logout-modal-card animate-in">
        <button
          className="modal-close-btn"
          onClick={handleClose}
          aria-label="Close modal"
        >
          &times;
        </button>

        <div className="logout-icon-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>

        <h3 id="logout-modal-title" className="logout-modal-title">
          Sign Out of RYVON?
        </h3>

        <p className="logout-modal-desc">
          Are you sure you want to end your riding session? Your active bookings, fleet preferences and saved routes are safely preserved.
        </p>

        <div className="logout-modal-actions">
          <button
            type="button"
            className="btn btn-primary logout-btn-confirm"
            onClick={handleConfirmLogout}
          >
            Sign Out
          </button>

          <button
            type="button"
            className="btn btn-outline logout-btn-cancel"
            onClick={handleClose}
          >
            Stay Signed In
          </button>
        </div>
      </div>
    </div>
  );
}
