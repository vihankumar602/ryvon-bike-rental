import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function MobileBottomNav() {
  const location = useLocation();
  const { openModal } = useModal();
  const { currency, setCurrency } = useCurrency();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const pathname = location.pathname;

  return (
    <>
      <div id="mobile-bottom-nav-root">
        <nav className="mobile-bottom-nav" id="mobile-bottom-nav" aria-label="Mobile Navigation">
          <Link
            className={`bottom-nav-item ${pathname === '/' || pathname === '/index.html' ? 'active' : ''}`}
            to="/"
            data-nav="home"
            aria-label="Home"
          >
            <div className="bottom-nav-icon-box">
              <svg className="nav-svg-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 20v-9.5z" />
                <polyline points="9 21 9 12 15 12 15 21" />
              </svg>
            </div>
            <span className="bottom-nav-label">Home</span>
          </Link>

          <Link
            className={`bottom-nav-item ${pathname === '/bikes' || pathname.startsWith('/bike') ? 'active' : ''}`}
            to="/bikes"
            data-nav="fleet"
            aria-label="Explore Fleet"
          >
            <div className="bottom-nav-icon-box">
              <svg className="nav-svg-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="5.5" cy="17" r="3.2" />
                <circle cx="18.5" cy="17" r="3.2" />
                <path d="M5.5 17l4.5-8.5h5l2.5 8.5" />
                <path d="M10 8.5l4 8.5" />
                <path d="M13.5 5.5h3.5" />
              </svg>
            </div>
            <span className="bottom-nav-label">Fleet</span>
          </Link>

          <Link
            className={`bottom-nav-item ${pathname === '/booking-history' || pathname === '/dashboard' ? 'active' : ''}`}
            to={user ? "/booking-history" : "#"}
            onClick={(e) => {
              if (!user) {
                e.preventDefault();
                openModal('authPrompt');
              }
            }}
            data-nav="journeys"
            aria-label="My Journeys"
          >
            <div className="bottom-nav-icon-box" style={{ position: 'relative' }}>
              <svg className="nav-svg-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="3" width="14" height="18" rx="2" ry="2" />
                <line x1="8.5" y1="8" x2="15.5" y2="8" />
                <line x1="8.5" y1="12" x2="15.5" y2="12" />
                <line x1="8.5" y1="16" x2="12.5" y2="16" />
              </svg>
            </div>
            <span className="bottom-nav-label">Journeys</span>
          </Link>

          <Link
            className={`bottom-nav-item ${pathname === '/destinations' ? 'active' : ''}`}
            to="/destinations"
            data-nav="destinations"
            aria-label="Destinations"
          >
            <div className="bottom-nav-icon-box">
              <svg className="nav-svg-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 19L9 7.5L14 15L17.5 10L22 19H2.5Z" />
              </svg>
            </div>
            <span className="bottom-nav-label">Destinations</span>
          </Link>

          <button
            className={`bottom-nav-item ${moreOpen ? 'active' : ''}`}
            id="bottom-nav-more-btn"
            type="button"
            aria-label="More Options"
            aria-haspopup="dialog"
            aria-expanded={moreOpen}
            data-nav="more"
            onClick={() => setMoreOpen(!moreOpen)}
          >
            <div className="bottom-nav-icon-box">
              <svg className="nav-svg-icon" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <circle cx="5.5" cy="12" r="2.2" />
                <circle cx="12" cy="12" r="2.2" />
                <circle cx="18.5" cy="12" r="2.2" />
              </svg>
            </div>
            <span className="bottom-nav-label">More</span>
          </button>
        </nav>
      </div>

      {/* More Bottom Sheet */}
      {moreOpen && (
        <>
          <div className="more-sheet-overlay show" onClick={() => setMoreOpen(false)} style={{ display: 'block' }}></div>
          <div className="more-sheet open" style={{ display: 'block' }}>
            <div className="more-sheet-handle"></div>
            <div className="more-sheet-header">
              <h3>More Options</h3>
              <button className="icon-btn" type="button" onClick={() => setMoreOpen(false)}>✕</button>
            </div>
            <div className="more-sheet-content">
              <div className="more-sheet-grid">
                <Link to="/wishlist" className="more-sheet-item" onClick={() => setMoreOpen(false)}>
                  <span className="more-sheet-icon">♡</span>
                  <span>Wishlist</span>
                </Link>
                <a
                  href="#build-my-ride"
                  className="more-sheet-item"
                  onClick={(e) => { e.preventDefault(); setMoreOpen(false); openModal('build-my-ride'); }}
                >
                  <span className="more-sheet-icon">✨</span>
                  <span>Build My Ride</span>
                </a>
                <Link to="/faq" className="more-sheet-item" onClick={() => setMoreOpen(false)}>
                  <span className="more-sheet-icon">❓</span>
                  <span>FAQs & Help</span>
                </Link>
                <Link to="/contact" className="more-sheet-item" onClick={() => setMoreOpen(false)}>
                  <span className="more-sheet-icon">📞</span>
                  <span>Contact Hub</span>
                </Link>
                <Link to={user ? "/profile" : "/login"} className="more-sheet-item" onClick={() => setMoreOpen(false)}>
                  <span className="more-sheet-icon">👤</span>
                  <span>{user ? "Profile" : "Sign In"}</span>
                </Link>
                {user && (
                  <button
                    type="button"
                    className="more-sheet-item"
                    style={{ color: '#ef4444' }}
                    onClick={() => {
                      setMoreOpen(false);
                      openModal('logoutConfirm');
                    }}
                  >
                    <span className="more-sheet-icon">🚪</span>
                    <span>Sign Out</span>
                  </button>
                )}
                <button
                  type="button"
                  className="more-sheet-item"
                  id="more-theme-toggle"
                  onClick={toggleTheme}
                >
                  <span className="more-sheet-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Select Currency</span>
                <select
                  id="more-currency-picker"
                  className="filter-select"
                  style={{ width: '120px' }}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="INR">₹ INR</option>
                  <option value="USD">$ USD</option>
                  <option value="EUR">€ EUR</option>
                  <option value="GBP">£ GBP</option>
                </select>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
