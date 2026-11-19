import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useBookings } from '../context/BookingContext';

const PERSONAS = [
  {
    id: 'Alpine Tourer',
    legacyId: 'Mountain Rider',
    icon: '⛰️',
    name: 'Alpine Tourer',
    img: '/assets/images/persona-alpine.jpg',
    desc: 'High-altitude expeditions & mountain riding'
  },
  {
    id: 'Superbike Pilot',
    legacyId: 'Superbike Racer',
    icon: '⚡',
    name: 'Superbike Pilot',
    img: '/assets/images/persona-superbike.jpg',
    desc: 'Precision, speed & performance rides'
  },
  {
    id: 'Coastal Voyager',
    legacyId: 'Coastal Tourer',
    icon: '🌊',
    name: 'Coastal Voyager',
    img: '/assets/images/persona-coastal.jpg',
    desc: 'Scenic coastal routes & long highway rides'
  },
  {
    id: 'Urban Striker',
    legacyId: 'Urban Commuter',
    icon: '🏙️',
    name: 'Urban Striker',
    img: '/assets/images/persona-urban.jpg',
    desc: 'City escapes & weekend sprints'
  }
];

export default function Profile() {
  const { user, updateUser, riderPersona, setRiderPersona, changePassword } = useAuth();
  const { bookings, stats } = useBookings();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('profile');

  // Modals state
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  // Password update form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  const userEmail = (user?.email || '').toLowerCase().trim();
  const profileStorageKey = userEmail ? `ryvon-rider-profile-${userEmail}` : 'ryvon-rider-profile';
  const emergencyStorageKey = userEmail ? `ryvon-emergency-contact-${userEmail}` : 'ryvon-emergency-contact';
  const avatarStorageKey = userEmail ? `ryvon-rider-avatar-${userEmail}` : 'ryvon-rider-avatar';

  // Profile fields state (persisted per user)
  const [profileData, setProfileData] = useState(() => {
    try {
      const saved = localStorage.getItem(profileStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          name: parsed.name || user?.name || 'Rider',
          email: parsed.email || user?.email || '',
          phone: parsed.phone || user?.phone || '',
          licenseNumber: parsed.licenseNumber || user?.licenseNumber || '',
          location: parsed.location || user?.location || '',
          gender: parsed.gender || user?.gender || '',
          since: parsed.since || 'Nov 2024'
        };
      }
    } catch (e) {}
    return {
      name: user?.name || 'Rider',
      phone: user?.phone || '',
      email: user?.email || '',
      location: user?.location || '',
      licenseNumber: user?.licenseNumber || '',
      gender: user?.gender || '',
      since: 'Nov 2024'
    };
  });

  // Emergency contact state (persisted per user)
  const [emergencyContact, setEmergencyContact] = useState(() => {
    try {
      const saved = localStorage.getItem(emergencyStorageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      name: user?.emergencyName || '',
      relationship: user?.emergencyRelation || '',
      phone: user?.emergencyPhone || ''
    };
  });

  // Edit forms local draft
  const [editForm, setEditForm] = useState({ ...profileData });
  const [emergencyForm, setEmergencyForm] = useState({ ...emergencyContact });

  // Sync profileData with user context if changed
  useEffect(() => {
    if (user) {
      try {
        const pKey = user.email ? `ryvon-rider-profile-${user.email.toLowerCase().trim()}` : 'ryvon-rider-profile';
        const emKey = user.email ? `ryvon-emergency-contact-${user.email.toLowerCase().trim()}` : 'ryvon-emergency-contact';
        const saved = localStorage.getItem(pKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          const merged = {
            name: parsed.name || user.name || 'Rider',
            phone: parsed.phone || user.phone || '',
            email: parsed.email || user.email || '',
            location: parsed.location || user.location || '',
            licenseNumber: parsed.licenseNumber || user.licenseNumber || '',
            gender: parsed.gender || user.gender || '',
            since: parsed.since || 'Nov 2024'
          };
          setProfileData(merged);
          setEditForm(merged);
        } else {
          const fresh = {
            name: user.name || 'Rider',
            phone: user.phone || '',
            email: user.email || '',
            location: user.location || '',
            licenseNumber: user.licenseNumber || '',
            gender: user.gender || '',
            since: 'Nov 2024'
          };
          setProfileData(fresh);
          setEditForm(fresh);
        }
        const savedEm = localStorage.getItem(emKey);
        if (savedEm) {
          const parsedEm = JSON.parse(savedEm);
          setEmergencyContact(parsedEm);
          setEmergencyForm(parsedEm);
        }
      } catch (e) {}
    }
  }, [user]);

  // Dynamic calculations from actual booking records (Zero default for new riders)
  const dynamicStats = useMemo(() => {
    const totalCount = stats?.total ?? bookings.length;
    const totalDist = bookings.length > 0 
      ? bookings.reduce((sum, b) => sum + (Number(b.duration) || 1) * 220, 0)
      : 0;
    
    const uniqueDests = bookings.length > 0 
      ? new Set(bookings.map(b => b.destCity || b.destination)).size
      : 0;

    const expeditions = bookings.filter(b => (b.destCity || '').toLowerCase().includes('expedition') || (Number(b.duration) || 1) >= 3).length;
    const rideDays = bookings.length > 0 ? bookings.reduce((sum, b) => sum + (Number(b.duration) || 1), 0) : 0;
    const avgDistance = totalCount > 0 ? Math.round(totalDist / totalCount) : 0;

    return {
      totalRides: totalCount,
      totalDistance: totalDist.toLocaleString(),
      destinations: uniqueDests,
      expeditions: expeditions,
      rideDays: rideDays,
      avgDistance,
      highestAltitude: totalCount > 0 ? '4,562 m' : '0 m',
      safetyScore: user?.safetyScore || 98
    };
  }, [bookings, stats, user]);

  // Handle avatar upload via file picker
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      if (updateUser) {
        updateUser({ avatar: dataUrl });
      }
      localStorage.setItem('ryvon-rider-avatar', dataUrl);
      toast('Profile photo updated successfully! 📸');
    };
    reader.readAsDataURL(file);
  };

  // Persona selection handler
  const activePersonaName = useMemo(() => {
    const current = riderPersona || 'Alpine Tourer';
    if (current === 'Mountain Rider' || current === 'Alpine Tourer') return 'Alpine Tourer';
    if (current === 'Superbike Racer' || current === 'Superbike Pilot') return 'Superbike Pilot';
    if (current === 'Coastal Tourer' || current === 'Coastal Voyager') return 'Coastal Voyager';
    if (current === 'Urban Commuter' || current === 'Urban Striker') return 'Urban Striker';
    return current;
  }, [riderPersona]);

  const handleSelectPersona = (p) => {
    if (setRiderPersona) {
      setRiderPersona(p.id);
    }
    localStorage.setItem('ryvon-rider-persona', p.id);
    localStorage.setItem('rideos-rider-persona', p.id);
    toast(`Riding Persona calibrated: ${p.name} 🎯`);
  };

  // Save profile changes
  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileData(editForm);
    localStorage.setItem(profileStorageKey, JSON.stringify(editForm));
    if (editForm.licenseNumber) {
      localStorage.setItem(`ryvon-driving-licence-${userEmail}`, editForm.licenseNumber);
      localStorage.setItem('ryvon-driving-licence', editForm.licenseNumber);
    }
    if (updateUser) {
      updateUser({
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        licenseNumber: editForm.licenseNumber,
        location: editForm.location,
        gender: editForm.gender
      });
    }
    setShowEditProfileModal(false);
    toast('Personal Information saved successfully! ✓');
  };

  // Dedicated change password handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordMsg({ type: 'error', text: 'Please fill in both current and new passwords.' });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setPasswordLoading(true);
    setPasswordMsg({ type: '', text: '' });

    if (changePassword) {
      const res = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordLoading(false);
      if (res.success) {
        setPasswordMsg({ type: 'success', text: 'Password successfully updated! ✓' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        toast('Password successfully updated! ✓');
      } else {
        setPasswordMsg({ type: 'error', text: res.error || 'Failed to update password.' });
      }
    } else {
      setPasswordLoading(false);
      setPasswordMsg({ type: 'error', text: 'Change password service is currently unavailable.' });
    }
  };

  // Save emergency contact
  const handleSaveEmergency = (e) => {
    e.preventDefault();
    setEmergencyContact(emergencyForm);
    localStorage.setItem(emergencyStorageKey, JSON.stringify(emergencyForm));
    setShowEmergencyModal(false);
    toast('Emergency contact updated successfully! ✓');
  };

  // Resolved Profile Avatar Image Source
  const avatarSrc = user?.avatar || localStorage.getItem(avatarStorageKey) || localStorage.getItem('ryvon-rider-avatar') || '/assets/images/rider-profile-avatar-hd.jpg';

  return (
    <DashboardLayout active="profile">
      <div className="rider-profile-container">

        {/* 1. CINEMATIC TOP PROFILE HERO SECTION */}
        <section className="rider-profile-hero" aria-label="Rider Profile Hero Banner">
          {/* Edit Profile Upper-Right Button */}
          <button
            type="button"
            className="btn-edit-profile-hero"
            onClick={() => {
              setEditForm({ ...profileData });
              setShowEditProfileModal(true);
            }}
            aria-label="Edit Profile"
          >
            <span>✏️</span> Edit Profile
          </button>

          <div className="rider-hero-main-row">
            {/* Circular Avatar with Golden Ring & Camera Button */}
            <div className="rider-avatar-circle-wrap">
              <img
                src={avatarSrc}
                alt={profileData.name}
                className="rider-avatar-img"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/assets/images/rider-profile-avatar.jpg';
                }}
              />
              <button
                type="button"
                className="rider-avatar-camera-btn"
                onClick={handleAvatarClick}
                title="Change profile photo"
                aria-label="Change profile photo"
              >
                📷
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Rider Identity & Contact Details */}
            <div className="rider-hero-meta">
              <div className="rider-badge-club">
                <span>👑</span> RYVON CLUB BLACK ELITE
              </div>

              <div className="rider-name-header-row">
                <h1 className="rider-display-name">{profileData.name}</h1>
                <span className="rider-verified-badge" title="Verified Tier 1 Master Rider">✓</span>
              </div>

              <div className="rider-sub-info-row">
                <span>📍 City Explorer</span>
                <span>|</span>
                <span>Since {profileData.since}</span>
              </div>

              <div className="rider-contact-pills-row">
                <span className="rider-contact-item">
                  <span>📍</span> {profileData.location || 'Location not added'}
                </span>
                <span className="rider-contact-item">
                  <span>📞</span> {profileData.phone || 'Phone not added'}
                </span>
                <span className="rider-contact-item">
                  <span>✉️</span> {profileData.email}
                </span>
              </div>

              {/* 4 Premium Metric Stat Cards */}
              <div className="rider-hero-stats-bar">
                {/* Total Rides */}
                <div className="rider-hero-stat-card">
                  <div className="rider-hero-stat-icon-wrap bg-gold">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6h-3l-3 6.5h7.5L14 6z"/><path d="M5.5 17.5L9 12.5l5 5"/><path d="M18.5 17.5L15 11l-3-5"/></svg>
                  </div>
                  <div>
                    <div className="rider-hero-stat-val">{dynamicStats.totalRides}</div>
                    <div className="rider-hero-stat-lbl">Total Rides</div>
                  </div>
                </div>

                {/* Total Distance */}
                <div className="rider-hero-stat-card stat-green">
                  <div className="rider-hero-stat-icon-wrap bg-green">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  </div>
                  <div>
                    <div className="rider-hero-stat-val">{dynamicStats.totalDistance} km</div>
                    <div className="rider-hero-stat-lbl">Total Distance</div>
                  </div>
                </div>

                {/* Destinations */}
                <div className="rider-hero-stat-card">
                  <div className="rider-hero-stat-icon-wrap bg-yellow">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>
                  </div>
                  <div>
                    <div className="rider-hero-stat-val">{dynamicStats.destinations}</div>
                    <div className="rider-hero-stat-lbl">Destinations</div>
                  </div>
                </div>

                {/* Expeditions */}
                <div className="rider-hero-stat-card">
                  <div className="rider-hero-stat-icon-wrap bg-gold">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H7.5"/><path d="M14 14.66V17c0 .55.45 1 1 1h1.5"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                  </div>
                  <div>
                    <div className="rider-hero-stat-val">{dynamicStats.expeditions}</div>
                    <div className="rider-hero-stat-lbl">Expeditions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. HORIZONTAL PROFILE NAVIGATION TABS */}
        <nav className="rider-profile-nav-tabs" aria-label="Profile Sections Navigation">
          <button
            type="button"
            className={`rider-profile-tab-btn ${activeTab === 'profile' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span>👤</span> Profile
          </button>
          <button
            type="button"
            className={`rider-profile-tab-btn ${activeTab === 'documents' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <span>📄</span> Documents
          </button>
          <button
            type="button"
            className={`rider-profile-tab-btn ${activeTab === 'safety' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('safety')}
          >
            <span>🛡️</span> Safety &amp; Compliance
          </button>
          <button
            type="button"
            className={`rider-profile-tab-btn ${activeTab === 'preferences' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <span>⚙️</span> Preferences
          </button>
          <button
            type="button"
            className={`rider-profile-tab-btn ${activeTab === 'insights' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            <span>📊</span> Activity &amp; Insights
          </button>
          <button
            type="button"
            className={`rider-profile-tab-btn ${activeTab === 'settings' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span>⚙️</span> Account Settings
          </button>
        </nav>

        {/* 3. MAIN TAB CONTENT: PROFILE (MASTER 2-COLUMN LAYOUT) */}
        {activeTab === 'profile' && (
          <div className="rider-profile-columns-grid">

            {/* LEFT COLUMN: Personal Info + Riding Persona + Rider Insights */}
            <div className="rider-profile-col">

              {/* A. PERSONAL INFORMATION CARD */}
              <div className="rider-white-card">
                <div className="rider-card-top-header">
                  <div className="rider-card-header-left">
                    <div className="rider-card-header-icon icon-yellow">
                      <span>👤</span>
                    </div>
                    <div>
                      <h2 className="rider-card-title">Personal Information</h2>
                      <p className="rider-card-subtitle">Your identity &amp; contact details</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-card-edit-pill"
                    onClick={() => {
                      setEditForm({ ...profileData });
                      setShowEditProfileModal(true);
                    }}
                  >
                    <span>✏️</span> Edit
                  </button>
                </div>

                <div className="personal-info-fields-grid">
                  {/* Full Name */}
                  <div className="personal-info-item">
                    <div className="personal-info-icon-circle">👤</div>
                    <div>
                      <div className="personal-info-label">Full Name</div>
                      <div className="personal-info-value">{profileData.name}</div>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="personal-info-item">
                    <div className="personal-info-icon-circle">📞</div>
                    <div>
                      <div className="personal-info-label">Phone Number</div>
                      <div className="personal-info-value">
                        {profileData.phone ? profileData.phone : <span style={{ color: 'var(--ink-soft, #94a3b8)', fontStyle: 'italic' }}>Not added</span>}
                      </div>
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="personal-info-item">
                    <div className="personal-info-icon-circle">✉️</div>
                    <div>
                      <div className="personal-info-label">Email Address</div>
                      <div className="personal-info-value">{profileData.email}</div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="personal-info-item">
                    <div className="personal-info-icon-circle">📍</div>
                    <div>
                      <div className="personal-info-label">Location</div>
                      <div className="personal-info-value">
                        {profileData.location ? profileData.location : <span style={{ color: 'var(--ink-soft, #94a3b8)', fontStyle: 'italic' }}>Not added</span>}
                      </div>
                    </div>
                  </div>

                  {/* Driving Licence Number */}
                  <div className="personal-info-item">
                    <div className="personal-info-icon-circle">💳</div>
                    <div>
                      <div className="personal-info-label">Driving Licence Number</div>
                      <div className="personal-info-value">
                        {profileData.licenseNumber ? profileData.licenseNumber : <span style={{ color: 'var(--ink-soft, #94a3b8)', fontStyle: 'italic' }}>Not added</span>}
                      </div>
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="personal-info-item">
                    <div className="personal-info-icon-circle">⚧</div>
                    <div>
                      <div className="personal-info-label">Gender</div>
                      <div className="personal-info-value">
                        {profileData.gender ? profileData.gender : <span style={{ color: 'var(--ink-soft, #94a3b8)', fontStyle: 'italic' }}>Not added</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* B. RIDING PERSONA CARD */}
              <div className="rider-white-card">
                <div className="rider-card-top-header" style={{ marginBottom: '14px' }}>
                  <div className="rider-card-header-left">
                    <div className="rider-card-header-icon icon-yellow">
                      <span>🏍️</span>
                    </div>
                    <div>
                      <h2 className="rider-card-title">Riding Persona</h2>
                      <p className="rider-card-subtitle">Your riding style helps us personalize bike suggestions, routes and experiences.</p>
                    </div>
                  </div>
                </div>

                <div className="persona-cards-row">
                  {PERSONAS.map((p) => {
                    const isSelected = activePersonaName === p.name;
                    return (
                      <div
                        key={p.id}
                        className={`persona-item-card ${isSelected ? 'selected-persona' : ''}`}
                        onClick={() => handleSelectPersona(p)}
                        role="button"
                        tabIndex={0}
                        aria-pressed={isSelected}
                      >
                        <div className="persona-img-viewport">
                          <img
                            src={p.img}
                            alt={p.name}
                            className="persona-img"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/assets/images/destinations/cat-mountain-hd.jpg';
                            }}
                          />
                          {isSelected && (
                            <span className="persona-check-badge">✓</span>
                          )}
                        </div>

                        <div className="persona-body-content">
                          <div className="persona-name-row">
                            <span>{p.icon}</span>
                            <span className="persona-title">{p.name}</span>
                          </div>
                          <p className="persona-desc">{p.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* C. RIDER INSIGHTS BANNER CARD */}
              <div className="rider-insights-banner-card">
                <div className="rider-insights-header">
                  <div className="metric-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>
                    📊
                  </div>
                  <div>
                    <h3 className="rider-insights-title">Rider Insights</h3>
                    <p className="rider-insights-subtitle">Your riding journey at a glance.</p>
                  </div>
                </div>

                <div className="rider-insights-metrics-row">
                  {/* Ride Days */}
                  <div className="rider-insights-metric-item">
                    <div className="metric-icon-wrap">🚩</div>
                    <div>
                      <div className="metric-value-num">{dynamicStats.rideDays}</div>
                      <div className="metric-label-txt">Ride Days</div>
                    </div>
                  </div>

                  {/* Avg. per Ride */}
                  <div className="rider-insights-metric-item">
                    <div className="metric-icon-wrap">🛣️</div>
                    <div>
                      <div className="metric-value-num">{dynamicStats.avgDistance} <small>km</small></div>
                      <div className="metric-label-txt">Avg. per Ride</div>
                    </div>
                  </div>

                  {/* Highest Altitude */}
                  <div className="rider-insights-metric-item">
                    <div className="metric-icon-wrap">⛰️</div>
                    <div>
                      <div className="metric-value-num">{dynamicStats.highestAltitude}</div>
                      <div className="metric-label-txt">Highest Altitude</div>
                    </div>
                  </div>

                  {/* Safety Score */}
                  <div className="rider-insights-metric-item">
                    <div className="metric-icon-wrap">🍃</div>
                    <div>
                      <div className="metric-value-num">{dynamicStats.safetyScore}<small>/100</small></div>
                      <div className="metric-label-txt">Safety Score</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Trust Charter Credentials + Emergency Contact + Quick Actions */}
            <div className="rider-profile-col">

              {/* D. TRUST CHARTER CREDENTIALS CARD */}
              <div className="rider-white-card">
                <div className="rider-card-top-header">
                  <div className="rider-card-header-left">
                    <div className="rider-card-header-icon icon-green">
                      <span>🛡️</span>
                    </div>
                    <div>
                      <h2 className="rider-card-title">Trust Charter Credentials</h2>
                      <p className="rider-card-subtitle">Your verified documents and compliance status.</p>
                    </div>
                  </div>
                </div>

                <div className="credentials-items-list">
                  {/* Driver Licence (MCWG) */}
                  <div className="credential-row-item">
                    <div className="credential-left-info">
                      <div className="credential-icon">💳</div>
                      <div>
                        <div className="credential-name">Driver Licence (MCWG)</div>
                        <div className="credential-subtext">
                          {profileData.licenseNumber ? `${profileData.licenseNumber} • Valid till Nov 2029` : 'Licence document not uploaded yet'}
                        </div>
                      </div>
                    </div>
                    <span className={`credential-status-badge ${profileData.licenseNumber ? 'badge-green' : 'badge-yellow'}`}>
                      {profileData.licenseNumber ? '✓ APPROVED' : 'PENDING'}
                    </span>
                  </div>

                  {/* Government KYC Identity */}
                  <div className="credential-row-item">
                    <div className="credential-left-info">
                      <div className="credential-icon">🪪</div>
                      <div>
                        <div className="credential-name">Government KYC Identity</div>
                        <div className="credential-subtext">Aadhaar Biometric e-KYC</div>
                      </div>
                    </div>
                    <span className="credential-status-badge badge-green">✓ VERIFIED</span>
                  </div>

                  {/* Escrow Security Deposit */}
                  <div className="credential-row-item">
                    <div className="credential-left-info">
                      <div className="credential-icon">🔒</div>
                      <div>
                        <div className="credential-name">Escrow Security Deposit</div>
                        <div className="credential-subtext">Zero-Hold Pre-Authorized Privileges</div>
                      </div>
                    </div>
                    <span className="credential-status-badge badge-blue">ACTIVE</span>
                  </div>
                </div>
              </div>

              {/* E. EMERGENCY CONTACT CARD */}
              <div className="rider-white-card">
                <div className="rider-card-top-header">
                  <div className="rider-card-header-left">
                    <div className="rider-card-header-icon icon-yellow">
                      <span>📞</span>
                    </div>
                    <div>
                      <h2 className="rider-card-title">Emergency Contact</h2>
                      <p className="rider-card-subtitle">In case of any incident during your ride.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-card-edit-pill"
                    onClick={() => {
                      setEmergencyForm({ ...emergencyContact });
                      setShowEmergencyModal(true);
                    }}
                  >
                    <span>✏️</span> Edit
                  </button>
                </div>

                <div className="emergency-contact-display-box">
                  {emergencyContact.name || emergencyContact.phone ? (
                    <>
                      <div className="emergency-contact-item">
                        <span className="icon">👤</span>
                        <span>{emergencyContact.name || 'Primary Contact'} {emergencyContact.relationship ? `(${emergencyContact.relationship})` : ''}</span>
                      </div>
                      <div className="emergency-contact-item">
                        <span className="icon">📞</span>
                        <span>{emergencyContact.phone || <span style={{ color: 'var(--ink-soft, #94a3b8)', fontStyle: 'italic' }}>Not added</span>}</span>
                      </div>
                    </>
                  ) : (
                    <div className="emergency-contact-item" style={{ color: 'var(--ink-soft, #94a3b8)', fontStyle: 'italic' }}>
                      <span className="icon">⚠️</span>
                      <span>No emergency contact added yet. Click &apos;Edit&apos; to configure your primary contact.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* F. QUICK ACTIONS CARD */}
              <div className="rider-white-card">
                <div className="rider-card-top-header">
                  <div className="rider-card-header-left">
                    <div className="rider-card-header-icon icon-yellow">
                      <span>⚡</span>
                    </div>
                    <div>
                      <h2 className="rider-card-title">Quick Actions</h2>
                      <p className="rider-card-subtitle">Manage your riding experience faster.</p>
                    </div>
                  </div>
                </div>

                <div className="quick-actions-items-grid">
                  {/* Book a Ride */}
                  <Link to="/bikes" className="quick-action-btn-item">
                    <div className="quick-action-icon-wrap tint-gold">🏍️</div>
                    <span className="quick-action-lbl">Book a Ride</span>
                  </Link>

                  {/* View Journeys */}
                  <Link to="/booking-history" className="quick-action-btn-item">
                    <div className="quick-action-icon-wrap">📑</div>
                    <span className="quick-action-lbl">View Journeys</span>
                  </Link>

                  {/* Saved Fleet */}
                  <Link to="/wishlist" className="quick-action-btn-item">
                    <div className="quick-action-icon-wrap">🔖</div>
                    <span className="quick-action-lbl">Saved Fleet</span>
                  </Link>

                  {/* Ride Preferences */}
                  <button
                    type="button"
                    className="quick-action-btn-item"
                    onClick={() => setActiveTab('preferences')}
                    style={{ background: 'transparent', width: '100%' }}
                  >
                    <div className="quick-action-icon-wrap">⚙️</div>
                    <span className="quick-action-lbl">Ride Preferences</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 4. OTHER SUB-TABS: DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className="rider-white-card" style={{ padding: '32px' }}>
            <div className="rider-card-top-header">
              <div>
                <h2 className="rider-card-title" style={{ fontSize: '22px' }}>Verified Rider Documents</h2>
                <p className="rider-card-subtitle">Digital regulatory vault and government-certified credentials.</p>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                style={{ fontSize: '13px', padding: '8px 18px' }}
                onClick={() => toast('Document upload dialog initialized. Select file to verify.')}
              >
                + Upload New Document
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '20px' }}>
              <div style={{ padding: '18px', border: '1px solid #e2e8f0', borderRadius: '14px', background: 'var(--paper)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '24px' }}>💳</span>
                  <span className={`credential-status-badge ${profileData.licenseNumber ? 'badge-green' : 'badge-yellow'}`}>
                    {profileData.licenseNumber ? '✓ VERIFIED' : 'PENDING UPLOAD'}
                  </span>
                </div>
                <strong style={{ display: 'block', fontSize: '15px' }}>Indian Driving Licence (MCWG)</strong>
                <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                  {profileData.licenseNumber ? `${profileData.licenseNumber} • Valid till Nov 2029` : 'No licence uploaded yet'}
                </span>
                <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                  <button type="button" className="btn btn-outline" style={{ fontSize: '11px', padding: '5px 12px' }} onClick={() => toast(profileData.licenseNumber ? 'Previewing Driving Licence document' : 'Please upload your driving licence first')}>
                    {profileData.licenseNumber ? 'View Document' : 'Upload Licence'}
                  </button>
                  {profileData.licenseNumber && (
                    <button type="button" className="btn btn-ghost" style={{ fontSize: '11px', padding: '5px 12px' }} onClick={() => toast('Downloading encrypted PDF copy')}>
                      Download PDF
                    </button>
                  )}
                </div>
              </div>

              <div style={{ padding: '18px', border: '1px solid #e2e8f0', borderRadius: '14px', background: 'var(--paper)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '24px' }}>🪪</span>
                  <span className="credential-status-badge badge-green">✓ VERIFIED</span>
                </div>
                <strong style={{ display: 'block', fontSize: '15px' }}>National Aadhaar Identity</strong>
                <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>UIDAI Biometric e-KYC Verified</span>
                <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                  <button type="button" className="btn btn-outline" style={{ fontSize: '11px', padding: '5px 12px' }} onClick={() => toast('e-KYC token authenticated')}>Verify Token</button>
                </div>
              </div>

              <div style={{ padding: '18px', border: '1px solid #e2e8f0', borderRadius: '14px', background: 'var(--paper)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '24px' }}>🛡️</span>
                  <span className="credential-status-badge badge-blue">ACTIVE</span>
                </div>
                <strong style={{ display: 'block', fontSize: '15px' }}>Zero-Hold Escrow Charter</strong>
                <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>Pre-authorized instant security clearance</span>
                <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                  <button type="button" className="btn btn-outline" style={{ fontSize: '11px', padding: '5px 12px' }} onClick={() => toast('Policy terms verified')}>View Coverage</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. SUB-TAB: SAFETY & COMPLIANCE */}
        {activeTab === 'safety' && (
          <div className="rider-white-card" style={{ padding: '32px' }}>
            <div className="rider-card-top-header">
              <div>
                <h2 className="rider-card-title" style={{ fontSize: '22px' }}>Telemetry Safety &amp; Compliance</h2>
                <p className="rider-card-subtitle">Real-time riding metrics and road safety certifications.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginTop: '20px' }}>
              <div style={{ textAlign: 'center', padding: '24px', border: '1px solid #e2e8f0', borderRadius: '16px', background: 'var(--paper)' }}>
                <div style={{ fontSize: '56px', fontWeight: 800, color: '#10b981', lineHeight: 1 }}>98<small style={{ fontSize: '24px', color: '#64748b' }}>/100</small></div>
                <strong style={{ display: 'block', fontSize: '16px', marginTop: '10px' }}>Tier 1 Master Rider</strong>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '6px 0 0' }}>Exemplary cornering stability and speed regulation.</p>
              </div>

              <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                    <span>Speed Limit Adherence</span>
                    <span style={{ color: '#10b981' }}>99.2%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginTop: '6px' }}>
                    <div style={{ width: '99.2%', height: '100%', background: '#10b981' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                    <span>Lean Angle Smoothness</span>
                    <span style={{ color: '#10b981' }}>97.8%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginTop: '6px' }}>
                    <div style={{ width: '97.8%', height: '100%', background: '#10b981' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                    <span>Emergency Braking Control</span>
                    <span style={{ color: '#10b981' }}>98.5%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginTop: '6px' }}>
                    <div style={{ width: '98.5%', height: '100%', background: '#10b981' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. SUB-TAB: PREFERENCES */}
        {activeTab === 'preferences' && (
          <div className="rider-white-card" style={{ padding: '32px' }}>
            <h2 className="rider-card-title" style={{ fontSize: '22px' }}>Rider Ecosystem Preferences</h2>
            <p className="rider-card-subtitle" style={{ marginBottom: '24px' }}>Customize your motorcycle recommendations and journey alerts.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ padding: '18px', border: '1px solid #e2e8f0', borderRadius: '14px' }}>
                <strong style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>Preferred Motorcycle Categories</strong>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="badge" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>✓ Adventure Touring</span>
                  <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>Cruiser</span>
                  <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>Superbike</span>
                </div>
              </div>

              <div style={{ padding: '18px', border: '1px solid #e2e8f0', borderRadius: '14px' }}>
                <strong style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>Notification Channels</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" defaultChecked /> SMS Handover Codes
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" defaultChecked /> WhatsApp Route Dispatches
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" defaultChecked /> Tax Invoice Email Receipts
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. SUB-TAB: ACTIVITY & INSIGHTS */}
        {activeTab === 'insights' && (
          <div className="rider-white-card" style={{ padding: '32px' }}>
            <h2 className="rider-card-title" style={{ fontSize: '22px' }}>Expedition Analytics &amp; Telemetry</h2>
            <p className="rider-card-subtitle" style={{ marginBottom: '24px' }}>Detailed historical breakdown of high-altitude and coastal routes.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '18px', border: '1px solid #e2e8f0', borderRadius: '14px', background: 'var(--paper)' }}>
                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Total Kilometers</span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--gold, #f59e0b)' }}>{dynamicStats.totalDistance} km</div>
              </div>
              <div style={{ padding: '18px', border: '1px solid #e2e8f0', borderRadius: '14px', background: 'var(--paper)' }}>
                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Highest Mountain Pass</span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981' }}>{dynamicStats.highestAltitude}</div>
              </div>
              <div style={{ padding: '18px', border: '1px solid #e2e8f0', borderRadius: '14px', background: 'var(--paper)' }}>
                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Active Expeditions</span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#38bdf8' }}>{dynamicStats.expeditions}</div>
              </div>
            </div>
          </div>
        )}

        {/* 8. SUB-TAB: ACCOUNT SETTINGS */}
        {activeTab === 'settings' && (
          <div className="rider-white-card" style={{ padding: '32px' }}>
            <h2 className="rider-card-title" style={{ fontSize: '22px' }}>Account &amp; Security Settings</h2>
            <p className="rider-card-subtitle" style={{ marginBottom: '24px' }}>Manage security, authentication credentials and account settings.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
              {/* Account Information */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--ink)' }}>Account Information</h3>
                <div>
                  <label className="profile-modal-label">Registered Email</label>
                  <input type="text" className="profile-modal-input" value={profileData.email} disabled />
                </div>
                <div>
                  <label className="profile-modal-label">Account Tier</label>
                  <input type="text" className="profile-modal-input" value="RYVON CLUB BLACK ELITE" disabled />
                </div>
                <div>
                  <label className="profile-modal-label">Session Protection</label>
                  <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#10b981', fontSize: '13px', fontWeight: 600 }}>
                    🔒 256-bit Encrypted Session Active
                  </div>
                </div>
              </div>

              {/* Dedicated Change Password Form */}
              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--paper)', padding: '24px', borderRadius: '14px', border: '1px solid var(--line)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--ink)' }}>Change Password</h3>
                <p style={{ fontSize: '13px', color: 'var(--ink-soft)', margin: '0 0 10px 0' }}>Ensure your account stays secure with a strong password.</p>

                {passwordMsg.text && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      background: passwordMsg.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                      border: `1px solid ${passwordMsg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      color: passwordMsg.type === 'success' ? '#10b981' : '#ef4444'
                    }}
                  >
                    {passwordMsg.text}
                  </div>
                )}

                <div>
                  <label className="profile-modal-label" htmlFor="current-password-input">Current Password</label>
                  <input
                    id="current-password-input"
                    type="password"
                    required
                    placeholder="Enter current password"
                    className="profile-modal-input"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  />
                </div>

                <div>
                  <label className="profile-modal-label" htmlFor="new-password-input">New Password (min. 8 characters)</label>
                  <input
                    id="new-password-input"
                    type="password"
                    required
                    minLength={8}
                    placeholder="Enter new strong password"
                    className="profile-modal-input"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                </div>

                <div>
                  <label className="profile-modal-label" htmlFor="confirm-password-input">Confirm New Password</label>
                  <input
                    id="confirm-password-input"
                    type="password"
                    required
                    placeholder="Re-enter new password"
                    className="profile-modal-input"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ marginTop: '8px', width: 'fit-content' }}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Updating Password...' : 'Update Password →'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* EDIT PROFILE MODAL */}
        {showEditProfileModal && (
          <div className="profile-modal-overlay" onClick={() => setShowEditProfileModal(false)}>
            <div className="profile-modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="profile-modal-header">
                <h3 className="profile-modal-title">Edit Personal Information</h3>
                <button
                  type="button"
                  className="btn-modal-close-x"
                  onClick={() => setShowEditProfileModal(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProfile}>
                <div className="profile-modal-grid-fields">
                  <div className="profile-modal-field span-full">
                    <label className="profile-modal-label">Full Name</label>
                    <input
                      type="text"
                      className="profile-modal-input"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="profile-modal-field">
                    <label className="profile-modal-label">Phone Number</label>
                    <input
                      type="tel"
                      className="profile-modal-input"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="profile-modal-field">
                    <label className="profile-modal-label">Email Address</label>
                    <input
                      type="email"
                      className="profile-modal-input"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="profile-modal-field">
                    <label className="profile-modal-label">Location</label>
                    <input
                      type="text"
                      className="profile-modal-input"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      required
                    />
                  </div>

                  <div className="profile-modal-field">
                    <label className="profile-modal-label">Driving Licence Number</label>
                    <input
                      type="text"
                      className="profile-modal-input"
                      value={editForm.licenseNumber || ''}
                      onChange={(e) => setEditForm({ ...editForm, licenseNumber: e.target.value })}
                      placeholder="Enter driving licence number"
                      required
                    />
                  </div>

                  <div className="profile-modal-field span-full">
                    <label className="profile-modal-label">Gender</label>
                    <select
                      className="profile-modal-input"
                      value={editForm.gender}
                      onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-Binary">Non-Binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="profile-modal-actions-row">
                  <button
                    type="button"
                    className="btn-modal-cancel"
                    onClick={() => setShowEditProfileModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-modal-save">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT EMERGENCY CONTACT MODAL */}
        {showEmergencyModal && (
          <div className="profile-modal-overlay" onClick={() => setShowEmergencyModal(false)}>
            <div className="profile-modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="profile-modal-header">
                <h3 className="profile-modal-title">Edit Emergency Contact</h3>
                <button
                  type="button"
                  className="btn-modal-close-x"
                  onClick={() => setShowEmergencyModal(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEmergency}>
                <div className="profile-modal-grid-fields">
                  <div className="profile-modal-field span-full">
                    <label className="profile-modal-label">Contact Name</label>
                    <input
                      type="text"
                      className="profile-modal-input"
                      value={emergencyForm.name}
                      onChange={(e) => setEmergencyForm({ ...emergencyForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="profile-modal-field">
                    <label className="profile-modal-label">Relationship</label>
                    <input
                      type="text"
                      className="profile-modal-input"
                      value={emergencyForm.relationship}
                      onChange={(e) => setEmergencyForm({ ...emergencyForm, relationship: e.target.value })}
                      placeholder="e.g. Brother, Spouse, Parent"
                      required
                    />
                  </div>

                  <div className="profile-modal-field">
                    <label className="profile-modal-label">Phone Number</label>
                    <input
                      type="tel"
                      className="profile-modal-input"
                      value={emergencyForm.phone}
                      onChange={(e) => setEmergencyForm({ ...emergencyForm, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="profile-modal-actions-row">
                  <button
                    type="button"
                    className="btn-modal-cancel"
                    onClick={() => setShowEmergencyModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-modal-save">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
