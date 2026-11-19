import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password strength calculation
  const getStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[0-9!@#$%^&*]/.test(pass)) score++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
    if (pass.length >= 12) score++;
    return score;
  };

  const strengthScore = getStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError('Please accept RYVON Terms & Ride Policies.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    const res = await register(name, email, password);
    setLoading(false);

    if (res.success) {
      toast(`Welcome to RYVON Club, ${name}!`);
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
      setError(res.error || 'Registration failed. Please check your details.');
    }
  };

  return (
    <main id="app" tabIndex="-1">
      <section className="auth-fullscreen">
        <div className="auth-bg-overlay"></div>
        <div className="container auth-center-container">
          <div className="auth-card-glass">
            <div className="auth-card-head">
              <span className="auth-badge">👑 RIDER CIRCLE ACCESS</span>
              <h2>Create Account</h2>
              <p>Register your rider profile to unlock 24/7 keyless access &amp; member rewards.</p>
            </div>

            {error && (
              <div id="auth-alert" className="auth-alert" role="alert" style={{ display: 'block' }}>
                {error}
              </div>
            )}

            <form id="auth-form" className="auth-form-centered" onSubmit={handleSubmit}>
              <div className="field-wrap">
                <label htmlFor="auth-fullname">Full Name</label>
                <div className="input-with-icon">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    required
                    placeholder="Captain Rider"
                    id="auth-fullname"
                    autoComplete="name"
                    minLength={2}
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="field-wrap">
                <label htmlFor="auth-email">Email Address</label>
                <div className="input-with-icon">
                  <span className="input-icon">✉️</span>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    id="auth-email"
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="field-wrap">
                <label htmlFor="auth-password">Password</label>
                <div className="input-with-icon">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Create a password (min 8 chars)"
                    id="auth-password"
                    className="has-toggle"
                    autoComplete="new-password"
                    minLength={8}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    aria-label="Toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg className="eye-closed" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg className="eye-open" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>

                {password && (
                  <div className="password-strength-wrap" id="password-strength-box" style={{ display: 'block', marginTop: '8px' }}>
                    <div className="strength-bars">
                      <div className={`strength-segment ${strengthScore >= 1 ? 'active' : ''}`} id="str-seg-1"></div>
                      <div className={`strength-segment ${strengthScore >= 2 ? 'active' : ''}`} id="str-seg-2"></div>
                      <div className={`strength-segment ${strengthScore >= 3 ? 'active' : ''}`} id="str-seg-3"></div>
                      <div className={`strength-segment ${strengthScore >= 4 ? 'active' : ''}`} id="str-seg-4"></div>
                    </div>
                    <div className="strength-label-row">
                      <span id="strength-label">
                        Password Strength: {strengthScore < 2 ? 'Too Weak' : (strengthScore === 2 ? 'Moderate' : (strengthScore === 3 ? 'Strong' : 'Very Strong'))}
                      </span>
                    </div>
                    <div className="password-reqs">
                      <span className="password-req-item" id="req-len">
                        {password.length >= 8 ? '✓' : '•'} Min 8 characters
                      </span>
                      <span className="password-req-item" id="req-num">
                        {/[0-9!@#$%^&*]/.test(password) ? '✓' : '•'} At least 1 number or symbol
                      </span>
                      <span className="password-req-item" id="req-case">
                        {/[a-z]/.test(password) && /[A-Z]/.test(password) ? '✓' : '•'} Mixed case (A-Z &amp; a-z)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="field-wrap">
                <label htmlFor="auth-confirm-password">Confirm Password</label>
                <div className="input-with-icon">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter your password"
                    id="auth-confirm-password"
                    className="has-toggle"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="auth-options-row">
                <label className="remember-check">
                  <input
                    type="checkbox"
                    id="auth-agree-terms"
                    checked={agreeTerms}
                    onChange={e => setAgreeTerms(e.target.checked)}
                  />
                  <span>I accept RYVON Terms &amp; Ride Policies</span>
                </label>
              </div>

              <button className="btn btn-gold-solid btn-full" id="auth-submit-btn" type="submit" disabled={loading}>
                {loading ? 'Creating Profile...' : 'Register Rider Profile →'}
              </button>
            </form>

            <div className="auth-switch-footer">
              <span>Already registered?</span>
              <Link to={searchParams.get('redirect') ? `/login?redirect=${encodeURIComponent(searchParams.get('redirect'))}` : '/login'} className="switch-link">
                Sign In →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
