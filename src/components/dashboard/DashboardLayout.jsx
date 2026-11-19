import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function DashboardLayout({ active = 'dash', children }) {
  const { logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    toast('You have been signed out.');
    navigate('/login');
  };

  return (
    <main id="app" tabIndex="-1">
      <nav className="dashboard-nav" aria-label="Dashboard sub navigation">
        <div className="dashboard-nav-container">
          <Link className={`dashboard-nav-item ${active === 'dash' ? 'active' : ''}`} to="/dashboard">
            <span className="nav-item-icon">📊</span> OVERVIEW
          </Link>
          <Link className={`dashboard-nav-item ${active === 'history' ? 'active' : ''}`} to="/booking-history">
            <span className="nav-item-icon">📑</span> JOURNEY LOGS
          </Link>
          <Link className={`dashboard-nav-item ${active === 'profile' ? 'active' : ''}`} to="/profile">
            <span className="nav-item-icon">👤</span> RIDER PROFILE
          </Link>
          <Link className={`dashboard-nav-item ${active === 'wishlist' ? 'active' : ''}`} to="/wishlist">
            <span className="nav-item-icon">🔖</span> SAVED FLEET
          </Link>
          <button
            className="dashboard-nav-item logout-link"
            type="button"
            onClick={handleSignOut}
          >
            <span className="nav-item-icon">↪</span> SIGN OUT
          </button>
        </div>
      </nav>

      <section className="section-tight dashboard-main-content-section" style={{ minHeight: '60vh' }}>
        <div className="container dashboard-container">
          <div className="dashboard-content-grid">
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
