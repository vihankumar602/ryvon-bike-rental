import React from 'react';
import { useModal } from '../../context/ModalContext';

export default function VerifiedInfoModal({ bikeName = 'Vehicle' }) {
  const { closeModal } = useModal();

  return (
    <div className="modal" style={{ width: 'min(540px, 94vw)' }}>
      <button className="icon-btn modal-close" onClick={closeModal} aria-label="Close">✕</button>
      <span className="badge" style={{ background: 'rgba(16,185,129,0.18)', color: '#047857', marginBottom: '4px' }}>
        🛡️ RIDE OS TRUST CHARTER
      </span>
      <h2>Why is {bikeName} verified?</h2>

      <div className="verified-check-list">
        <div className="verified-check-item">
          <span className="verified-check-icon">✓</span>
          <div className="verified-check-info">
            <strong>Identity verified</strong>
            <span>Owner identity & papers authenticated.</span>
          </div>
        </div>
        <div className="verified-check-item">
          <span className="verified-check-icon">✓</span>
          <div className="verified-check-info">
            <strong>Vehicle documents verified</strong>
            <span>Zero-dep insurance & RC active.</span>
          </div>
        </div>
        <div className="verified-check-item">
          <span className="verified-check-icon">✓</span>
          <div className="verified-check-info">
            <strong>Condition checked</strong>
            <span>32-point diagnostics verified.</span>
          </div>
        </div>
        <div className="verified-check-item">
          <span className="verified-check-icon">✓</span>
          <div className="verified-check-info">
            <strong>Recent inspection</strong>
            <span>Test-driven within 48 hours.</span>
          </div>
        </div>
      </div>

      <button className="btn btn-primary" onClick={closeModal} style={{ width: '100%', marginTop: '16px' }}>
        Got it, Thanks! →
      </button>
    </div>
  );
}
