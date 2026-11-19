import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useWishlist } from '../../context/WishlistContext';
import { useModal } from '../../context/ModalContext';

export default function Header() {
  const location = useLocation();
  const { user, riderPersona, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const { wishes } = useWishlist();
  const { openModal } = useModal();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Expedition Booking Confirmed',
      message: 'Super Meteor 650 Tourer is prepared for handover at Indiranagar Hub.',
      time: '12m ago',
      category: 'Expedition',
      icon: '🏍️',
      unread: true,
      link: '/booking-history'
    },
    {
      id: 'notif-2',
      title: 'Trust Charter Verified',
      message: 'Driver Licence MCWG & KYC approved. Zero-Hold Escrow privileges unlocked.',
      time: '1h ago',
      category: 'Trust Charter',
      icon: '🛡️',
      unread: true,
      link: '/profile'
    },
    {
      id: 'notif-3',
      title: 'High-Altitude Pass Telemetry',
      message: 'Himalayan Pass road conditions optimal. Clear skies and 14°C at elevation.',
      time: '4h ago',
      category: 'Weather Telemetry',
      icon: '⛅',
      unread: false,
      link: '/destinations'
    },
    {
      id: 'notif-4',
      title: 'RYVON Club Black Elite Active',
      message: 'Complimentary helmet & premium riding kit pre-assigned for upcoming rides.',
      time: '1d ago',
      category: 'Privilege',
      icon: '👑',
      unread: false,
      link: '/profile'
    }
  ]);

  const unreadNotifCount = notifications.filter(n => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleClearNotifs = () => {
    setNotifications([]);
  };

  const handleNotifClick = (notif) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, unread: false } : n));
    setNotifOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const pathname = location.pathname;

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotifOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setUserDropdownOpen(false);
        setNotifOpen(false);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openModal('cmdk');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openModal]);

  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : (user?.email ? user.email.trim().charAt(0).toUpperCase() : 'R');
  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : 'Rider');

  return (
    <header id="site-header" className="site-header">
      <div className="container nav">
        <Link className="brand" to="/">
          <img className="brand-logo" src="/assets/images/ryvon-logo.png" alt="RYVON logo" />
          <span className="brand-text">RYVON</span>
        </Link>

        <ul className={`nav-links ${mobileMenuOpen ? 'open' : ''}`} id="mobile-navigation" style={{ display: mobileMenuOpen ? 'flex' : undefined }}>
          <li className="mobile-drawer-header" style={{ display: mobileMenuOpen ? 'block' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid var(--line)' }}>
              <span className="brand">
                <img className="brand-logo" src="/assets/images/ryvon-logo.png" alt="RYVON logo" />
                <strong>RYVON</strong>
              </span>
              <button className="icon-btn mobile-close-btn" type="button" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)}>✕</button>
            </div>
          </li>

          <li>
            <Link className={pathname === '/' || pathname === '/index.html' ? 'active' : ''} to="/">Home</Link>
          </li>
          <li>
            <Link className={pathname === '/bikes' || pathname.startsWith('/bike') ? 'active' : ''} to="/bikes">Explore Fleet</Link>
          </li>
          <li>
            <Link className={pathname === '/booking-history' || pathname === '/dashboard' || pathname === '/history' ? 'active' : ''} to="/booking-history">
              🏍️ My Journeys
            </Link>
          </li>
          <li>
            <Link className={pathname === '/destinations' || pathname.startsWith('/destination') ? 'active' : ''} to="/destinations">Destinations</Link>
          </li>
          <li>
            <Link
              to="/build-my-ride"
              className={pathname === '/build-my-ride' || pathname === '/ai-build' ? 'active' : ''}
            >
              Build My Ride
            </Link>
          </li>
          <li>
            <Link className={pathname === '/faq' ? 'active' : ''} to="/faq">FAQs</Link>
          </li>
          <li>
            <Link className={pathname === '/contact' ? 'active' : ''} to="/contact">Contact</Link>
          </li>

          <li className="mobile-drawer-controls" style={{ display: mobileMenuOpen ? 'block' : 'none' }}>
            <div className="mobile-controls-wrap" style={{ display: 'grid', gap: '10px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-soft)' }}>Currency</span>
                <select
                  className="currency-picker-mobile filter-select"
                  style={{ width: '130px', minHeight: '34px' }}
                  aria-label="Currency Selector Mobile"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="INR">₹ INR</option>
                  <option value="USD">$ USD</option>
                  <option value="EUR">€ EUR</option>
                  <option value="GBP">£ GBP</option>
                </select>
              </div>
              <Link
                className="btn btn-outline btn-sm"
                to={user ? "/booking-history" : "#"}
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    openModal('authPrompt');
                  }
                }}
                style={{ width: '100%', marginTop: '4px', textAlign: 'center', justifyContent: 'center' }}
              >
                🏍️ My Journeys
              </Link>
              {user ? (
                <>
                  <Link className="btn btn-dark btn-sm" to="/profile" style={{ width: '100%', marginTop: '8px', textAlign: 'center', justifyContent: 'center' }}>
                    My Rider Profile
                  </Link>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openModal('logoutConfirm');
                    }}
                    style={{ width: '100%', marginTop: '6px', textAlign: 'center', justifyContent: 'center', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                  >
                    🚪 Sign Out
                  </button>
                </>
              ) : (
                <Link className="btn btn-dark btn-sm" to="/login" style={{ width: '100%', marginTop: '8px', textAlign: 'center', justifyContent: 'center' }}>
                  Sign in to Member Circle
                </Link>
              )}
            </div>
          </li>
        </ul>

        <div className="header-actions">
          {/* 1. Quick Book Button */}
          <button
            className="btn btn-outline btn-sm desktop-only quick-book-header-btn"
            type="button"
            onClick={() => openModal('quick-book')}
            title="Instant 1-Click Reservation Shortcut"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
          >
            <span style={{ color: 'var(--gold, #f59e0b)' }}>⚡</span> Quick Book
          </button>

          {/* 2. Urban Striker / Rider Persona Button */}
          <Link
            to="/urban-striker"
            className={`btn btn-outline btn-sm desktop-only persona-header-btn ${pathname === '/urban-striker' ? 'active' : ''}`}
            title="Urban Striker Dashboard & Rider DNA Profile"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            <span style={{ color: '#ec4899', fontSize: '13px' }}>💬</span> Urban Striker
          </Link>

          {/* 3. Currency Selector */}
          <div className="currency-selector desktop-only" title="Change Currency">
            <label
              className="currency-select-btn"
              htmlFor="currency-picker"
              style={{
                cursor: 'pointer',
                margin: 0,
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <select
                id="currency-picker"
                aria-label="Currency Selector Desktop"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontWeight: 800,
                  fontSize: '11px',
                  color: 'inherit',
                  cursor: 'pointer',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  paddingRight: '14px',
                  paddingLeft: '2px'
                }}
              >
                <option value="INR" style={{ background: 'var(--surface)', color: 'var(--ink)' }}>₹ INR</option>
                <option value="USD" style={{ background: 'var(--surface)', color: 'var(--ink)' }}>$ USD</option>
                <option value="EUR" style={{ background: 'var(--surface)', color: 'var(--ink)' }}>€ EUR</option>
                <option value="GBP" style={{ background: 'var(--surface)', color: 'var(--ink)' }}>£ GBP</option>
              </select>
              <span
                className="currency-arrow"
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  right: '8px',
                  fontSize: '9px',
                  pointerEvents: 'none',
                  opacity: 0.8
                }}
              >
                ▾
              </span>
            </label>
          </div>

          {/* 4. Command Palette Search (Ctrl+K) */}
          <button
            className="icon-btn cmdk-open-btn"
            type="button"
            aria-label="Quick search (Ctrl+K)"
            title="Search motorcycles, routes & commands (Ctrl+K)"
            onClick={() => openModal('cmdk')}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}
          >
            ⌕
          </button>

          {/* 5. Wishlist Shortlist Button */}
          <Link
            className="icon-btn header-wishlist-btn"
            to="/wishlist"
            aria-label="Saved Garage Shortlist"
            title={`Saved Fleet Garage (${wishes.length} saved)`}
            style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={wishes.length > 0 ? "var(--gold, #f59e0b)" : "none"}
              stroke={wishes.length > 0 ? "var(--gold, #f59e0b)" : "currentColor"}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {wishes.length > 0 && (
              <span
                className="header-badge-count"
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--gold, #f59e0b)',
                  color: '#070a0f',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9.5px',
                  fontWeight: 800,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.35)'
                }}
              >
                {wishes.length}
              </span>
            )}
          </Link>

          {/* 5.5 Notification Bell Button & Expedition Telemetry Dropdown */}
          <div className="header-notif-container" ref={notifRef}>
            <button
              className="icon-btn header-notif-btn"
              type="button"
              aria-label="Expedition Alerts"
              aria-expanded={notifOpen}
              title={`Expedition Alerts & Telemetry (${unreadNotifCount} unread)`}
              onClick={() => setNotifOpen(prev => !prev)}
              style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}
            >
              <span>🔔</span>
              {unreadNotifCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: 'var(--gold, #f59e0b)',
                    boxShadow: '0 0 8px #f59e0b, 0 0 2px #f59e0b'
                  }}
                  aria-label={`${unreadNotifCount} unread notifications`}
                />
              )}
            </button>

            <div
              className={`header-notif-dropdown ${notifOpen ? 'show' : ''}`}
              role="region"
              aria-label="Expedition Alerts Menu"
            >
              <div className="header-notif-header">
                <div className="notif-header-title-wrap">
                  <span className="notif-header-title">Expedition Alerts</span>
                  {unreadNotifCount > 0 && (
                    <span className="notif-badge-pill">{unreadNotifCount} New</span>
                  )}
                </div>
                <div className="notif-header-actions">
                  {unreadNotifCount > 0 && (
                    <button
                      className="notif-action-btn"
                      type="button"
                      onClick={handleMarkAllRead}
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      className="notif-action-btn"
                      type="button"
                      onClick={handleClearNotifs}
                      title="Clear notifications"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="notif-empty-state">
                  <span>🏁 All expedition alerts cleared. Safe travels!</span>
                </div>
              ) : (
                <ul className="notif-list">
                  {notifications.map(n => (
                    <li
                      key={n.id}
                      className={`notif-item ${n.unread ? 'unread' : ''}`}
                      onClick={() => handleNotifClick(n)}
                      role="button"
                      tabIndex="0"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleNotifClick(n);
                        }
                      }}
                    >
                      <div className="notif-icon-circle" aria-hidden="true">
                        {n.icon}
                      </div>
                      <div className="notif-content">
                        <div className="notif-top-row">
                          <span className="notif-category">{n.category}</span>
                          <span className="notif-time">{n.time}</span>
                        </div>
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-body">{n.message}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="notif-footer">
                <Link
                  to="/booking-history"
                  className="notif-footer-link"
                  onClick={() => setNotifOpen(false)}
                >
                  View All Journey Logs & Telemetry →
                </Link>
              </div>
            </div>
          </div>

          {/* 6. Theme Toggle (Dark / Light) */}
          <button
            className="theme-toggle icon-btn"
            type="button"
            aria-label="Toggle dark/light mode"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            onClick={toggleTheme}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* 7. User Avatar & Profile Dropdown */}
          {user ? (
            <div className="user-profile-menu-container" ref={dropdownRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <button
                className="user-avatar-btn"
                type="button"
                aria-expanded={userDropdownOpen}
                aria-label="Open user menu"
                onClick={() => setUserDropdownOpen(prev => !prev)}
                title={displayName}
              >
                {user.avatar ? (
                  <img className="user-avatar-img" src={user.avatar} alt={displayName} />
                ) : (
                  <span className="user-avatar-img user-avatar-initial" aria-hidden="true">{userInitial}</span>
                )}
                <span className="avatar-arrow">⌄</span>
              </button>

              <div
                className={`user-dropdown-menu ${userDropdownOpen ? 'show' : ''}`}
                role="menu"
                aria-hidden={!userDropdownOpen}
              >
                <div className="user-dropdown-header">
                  {user.avatar ? (
                    <img className="dropdown-avatar-img" src={user.avatar} alt={displayName} />
                  ) : (
                    <span className="dropdown-avatar-img user-avatar-initial" aria-hidden="true">{userInitial}</span>
                  )}
                  <div className="user-dropdown-info">
                    <span className="user-dropdown-name">{displayName}</span>
                    <span className="user-dropdown-email">{user.email}</span>
                  </div>
                </div>
                <div className="user-dropdown-divider"></div>
                <ul className="user-dropdown-links">
                  <li>
                    <Link to="/profile" onClick={() => setUserDropdownOpen(false)}>
                      👤 My Profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/booking-history" onClick={() => setUserDropdownOpen(false)}>
                      🏍️ My Journeys
                    </Link>
                  </li>
                  <li>
                    <Link to="/dashboard" onClick={() => setUserDropdownOpen(false)}>
                      📊 Telemetry Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/wishlist" onClick={() => setUserDropdownOpen(false)}>
                      ♡ Saved Fleet Garage
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" onClick={() => setUserDropdownOpen(false)}>
                      ⚙️ Account Settings
                    </Link>
                  </li>
                  <div className="user-dropdown-divider"></div>
                  <li>
                    <a
                      href="#logout"
                      onClick={(e) => {
                        e.preventDefault();
                        setUserDropdownOpen(false);
                        openModal('logoutConfirm');
                      }}
                      style={{ color: '#ef4444' }}
                    >
                      🚪 Sign Out
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <Link className="btn btn-dark btn-sm desktop-only" to="/login">Sign in</Link>
          )}

          <button
            className="icon-btn menu-toggle"
            type="button"
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}
