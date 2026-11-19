import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return children;
  }

  return (
    <main id="app" className="protected-guest-gate" tabIndex="-1">
      <section className="guest-barrier-section">
        <div className="guest-barrier-backdrop" aria-hidden="true" />
        <div className="container guest-barrier-container">
          <div className="guest-barrier-card animate-in">
            <div className="guest-barrier-badge-wrap">
              <span className="guest-barrier-badge">👑 RIDER CIRCLE ACCESS</span>
            </div>

            <h1 className="guest-barrier-title">
              Your Journey Starts Here
            </h1>

            <p className="guest-barrier-desc">
              Sign in or create your RYVON account to access your personal riding experience, manage bookings and explore exclusive rider benefits.
            </p>

            <div className="guest-barrier-actions">
              <Link to="/login" className="btn btn-primary guest-btn-gold">
                <span>Sign In</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              </Link>

              <Link to="/register" className="btn btn-outline guest-btn-outline">
                Create Account
              </Link>

              <Link to="/bikes" className="guest-btn-ghost">
                Explore Available Fleet →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
