import React, { useState } from 'react';
import { useModal } from '../../context/ModalContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AuthModalForBooking({ email: defaultEmail, name, phone, onSuccess }) {
  const { closeModal } = useModal();
  const { login, register } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState(defaultEmail || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');

    try {
      let res = await login(email, password);
      if (!res.success) {
        if (password.length >= 8) {
          // Attempt register
          res = await register(name || email.split('@')[0], email, password, phone);
        }
      }

      if (res.success) {
        toast(`Signed in as ${email}`);
        closeModal();
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal" style={{ maxWidth: '440px', padding: '26px' }}>
      <button className="icon-btn modal-close" onClick={closeModal} aria-label="Close">✕</button>
      <span className="eyebrow" style={{ color: 'var(--gold, #f59e0b)' }}>🛡️ RIDER VERIFICATION</span>
      <h3 style={{ margin: '6px 0 8px', fontFamily: 'var(--font-serif)', fontSize: '20px' }}>
        Sign In to Confirm Booking
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: 1.5, marginBottom: '18px' }}>
        To lock this motorcycle in PostgreSQL and activate live telemetry, please enter your password or sign in.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--paper)', color: 'var(--ink)' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
            Password
          </label>
          <input
            type="password"
            placeholder="Enter password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--paper)', color: 'var(--ink)' }}
          />
        </div>

        {error && (
          <div style={{ color: '#ef4444', fontSize: '12px', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <button
          className="btn btn-primary"
          type="submit"
          disabled={loading}
          style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}
        >
          {loading ? 'Authenticating...' : 'Sign In & Complete Reservation →'}
        </button>
      </form>
    </div>
  );
}
