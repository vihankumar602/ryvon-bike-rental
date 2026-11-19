import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';

export default function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot / Reset Password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      toast(`Welcome back, ${res.user.name || 'Rider'}!`);
      const redirectParam = searchParams.get('redirect');
      const hasPendingBooking = sessionStorage.getItem('ryvon-pending-booking');
      if (redirectParam) {
        navigate(redirectParam);
      } else if (hasPendingBooking) {
        try {
          const pb = JSON.parse(hasPendingBooking);
          if (pb && pb.redirectUrl) {
            navigate(pb.redirectUrl);
            return;
          }
          if (pb && pb.bikeId) {
            navigate(`/booking?bike=${pb.bikeId}&step=3`);
            return;
          }
        } catch (e) {}
        navigate('/booking?step=3');
      } else {
        navigate('/');
      }
    } else {
      setError(res.error || 'Invalid credentials. Please verify your email and password.');
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetEmail || !resetNewPassword || !resetConfirmPassword) {
      setResetError('Please fill in all fields.');
      return;
    }
    if (resetNewPassword.length < 8) {
      setResetError('Password must be at least 8 characters long.');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('Passwords do not match. Please re-enter.');
      return;
    }

    setResetLoading(true);
    setResetError('');
    setResetSuccess('');

    try {
      const res = await api.post('/auth/reset-password', {
        email: resetEmail.trim(),
        newPassword: resetNewPassword
      });
      setResetLoading(false);
      const msg = res?.message || 'Password has been successfully updated!';
      setResetSuccess(msg);
      toast('Password reset successfully! You can now sign in. ✓');
      setEmail(resetEmail.trim());
      setPassword(resetNewPassword);
      setError('');
      setTimeout(() => {
        setShowForgotModal(false);
        setResetSuccess('');
      }, 1400);
    } catch (err) {
      setResetLoading(false);
      setResetError(err.message || 'Unable to reset password. Please check your email.');
    }
  };

  return (
    <main id="app" tabIndex="-1">
      <section className="auth-fullscreen-cinematic">
        {/* Subtle golden ambient glow beneath navbar */}
        <div className="auth-golden-beam" aria-hidden="true"></div>

        {/* Delicate background overlay for card contrast and landscape vibrancy */}
        <div className="auth-cinematic-scrim" aria-hidden="true"></div>

        <div className="auth-signin-layout">
          {/* Central-Left Promotional Brand Composition */}
          <div className="auth-hero-promo">
            <div className="auth-hero-eyebrow">
              <span className="eyebrow-line" aria-hidden="true"></span>
              <span>EXPLORE INDIA ON TWO WHEELS</span>
              <span className="eyebrow-line" aria-hidden="true"></span>
            </div>

            <h1 className="auth-hero-headline">
              <span className="headline-line-white">Ride. Explore.</span>
              <span className="headline-line-gold">
                Belong.
                <svg className="hero-gold-swoosh" viewBox="0 0 240 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M 2 12 Q 110 22 238 2 Q 120 17 2 12 Z" fill="#f59e0b" />
                </svg>
              </span>
            </h1>

            <p className="auth-hero-subtitle">Your journey, our passion.</p>

            <div className="auth-hero-features-row">
              <div className="auth-hero-feature-item">
                <div className="feature-icon-box">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    <polyline points="9 12 11 14 15 10"></polyline>
                  </svg>
                </div>
                <span className="feature-label">Secure<br />Access</span>
              </div>

              <div className="feature-vertical-divider" aria-hidden="true"></div>

              <div className="auth-hero-feature-item">
                <div className="feature-icon-box">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                    <circle cx="8" cy="14" r="1" fill="#f59e0b"></circle>
                    <circle cx="12" cy="14" r="1" fill="#f59e0b"></circle>
                    <circle cx="16" cy="14" r="1" fill="#f59e0b"></circle>
                    <circle cx="8" cy="18" r="1" fill="#f59e0b"></circle>
                    <circle cx="12" cy="18" r="1" fill="#f59e0b"></circle>
                    <circle cx="16" cy="18" r="1" fill="#f59e0b"></circle>
                  </svg>
                </div>
                <span className="feature-label">Manage<br />Bookings</span>
              </div>

              <div className="feature-vertical-divider" aria-hidden="true"></div>

              <div className="auth-hero-feature-item">
                <div className="feature-icon-box">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
                  </svg>
                </div>
                <span className="feature-label">Track<br />Journeys</span>
              </div>
            </div>
          </div>

          {/* Right-Aligned Compact Member Sign In Card */}
          <div className="auth-card-glassmorphic">
            <div className="auth-card-head">
              <span className="auth-badge-gold">👑 RIDER CIRCLE ACCESS</span>
              <h2 className="auth-card-heading">
                Member <span className="gold-italic">Sign In</span>
              </h2>
              <p className="auth-card-sub">
                Enter your credentials to manage active bookings, digital keys &amp; telemetry.
              </p>
            </div>

            {error && (
              <div id="auth-alert" className="auth-alert auth-alert-error" role="alert">
                <span className="auth-alert-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form id="auth-form" className="auth-form-glow" onSubmit={handleSubmit}>
              <div className="field-wrap-glow">
                <label htmlFor="auth-email">
                  <span className="label-icon">✉</span> EMAIL ADDRESS OR USERNAME
                </label>
                <div className="input-wrap-glow">
                  <span className="input-prefix-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="you@example.com"
                    id="auth-email"
                    autoComplete="username email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="field-wrap-glow">
                <label htmlFor="auth-password">
                  <span className="label-icon">🔒</span> PASSWORD
                </label>
                <div className="input-wrap-glow">
                  <span className="input-prefix-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    id="auth-password"
                    className="has-toggle"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn-glow"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="auth-glow-options">
                <label className="glow-remember">
                  <input type="checkbox" id="auth-remember" defaultChecked />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className="glow-forgot-link"
                  onClick={() => {
                    setResetEmail(email);
                    setResetNewPassword('');
                    setResetConfirmPassword('');
                    setResetError('');
                    setResetSuccess('');
                    setShowForgotModal(true);
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <button className="btn-glow-submit" id="auth-submit-btn" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In to Dashboard →'}
              </button>

              <div className="glow-divider">
                <span>or</span>
              </div>

              <Link
                to={searchParams.get('redirect') ? `/register?redirect=${encodeURIComponent(searchParams.get('redirect'))}` : '/register'}
                className="btn-glow-create"
              >
                New to RYVON? <span className="gold-text">Create Account →</span>
              </Link>
            </form>
          </div>
        </div>

        {/* FORGOT / RESET PASSWORD MODAL (CENTERED VIEWPORT MODAL) */}
        {showForgotModal && (
          <div
            className="forgot-password-modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-modal-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowForgotModal(false);
            }}
          >
            <div className="forgot-password-modal-card">
              {/* Top-Right Close Button */}
              <button
                type="button"
                className="forgot-modal-close-btn"
                onClick={() => setShowForgotModal(false)}
                aria-label="Close modal"
              >
                ✕
              </button>

              {/* RIDER CIRCLE SECURITY Badge */}
              <div className="forgot-modal-badge-wrap">
                <span className="forgot-modal-badge">
                  <span className="badge-shield-icon">🛡️</span> RIDER CIRCLE SECURITY
                </span>
              </div>

              {/* Reset Your Password Heading */}
              <h2 id="reset-modal-title" className="forgot-modal-heading">
                Reset Your Password
              </h2>

              {/* Short Explanatory Subtitle */}
              <p className="forgot-modal-subtitle">
                Enter your registered email and choose a new password to restore access to your RYVON account.
              </p>

              {resetError && (
                <div className="forgot-modal-alert-error" role="alert">
                  <span>⚠️</span>
                  <span>{resetError}</span>
                </div>
              )}

              {resetSuccess && (
                <div className="forgot-modal-alert-success" role="alert">
                  <span>✓</span>
                  <span>{resetSuccess}</span>
                </div>
              )}

              <form className="forgot-modal-form" onSubmit={handleResetSubmit}>
                {/* 1. Registered Email Field */}
                <div className="forgot-field-group">
                  <label htmlFor="reset-email" className="forgot-field-label">
                    Registered Email
                  </label>
                  <div className="forgot-input-wrap">
                    <span className="forgot-input-icon">✉️</span>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      id="reset-email"
                      className="forgot-input"
                      autoComplete="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* 2. New Password Field */}
                <div className="forgot-field-group">
                  <label htmlFor="reset-password" className="forgot-field-label">
                    <span>New Password</span>
                    <span className="label-hint">(min. 8 characters)</span>
                  </label>
                  <div className="forgot-input-wrap">
                    <span className="forgot-input-icon">🔒</span>
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      placeholder="••••••••"
                      id="reset-password"
                      className="forgot-input has-toggle"
                      autoComplete="new-password"
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="forgot-password-toggle-btn"
                      aria-label={showResetPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowResetPassword(!showResetPassword)}
                    >
                      {showResetPassword ? (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* 3. Confirm New Password Field */}
                <div className="forgot-field-group">
                  <label htmlFor="reset-confirm-password" className="forgot-field-label">
                    Confirm New Password
                  </label>
                  <div className="forgot-input-wrap">
                    <span className="forgot-input-icon">🔒</span>
                    <input
                      type={showResetConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      placeholder="••••••••"
                      id="reset-confirm-password"
                      className="forgot-input has-toggle"
                      autoComplete="new-password"
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="forgot-password-toggle-btn"
                      aria-label={showResetConfirmPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                    >
                      {showResetConfirmPassword ? (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* 4. Full-width Save New Password & Sign In Button */}
                <button
                  type="submit"
                  className="btn-forgot-save-gold"
                  disabled={resetLoading}
                >
                  {resetLoading ? 'Updating Password...' : 'Save New Password & Sign In →'}
                </button>

                {/* 5. Cancel / Back to Sign In Link */}
                <button
                  type="button"
                  className="btn-forgot-cancel-link"
                  onClick={() => setShowForgotModal(false)}
                >
                  Cancel / Back to Sign In
                </button>
              </form>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
