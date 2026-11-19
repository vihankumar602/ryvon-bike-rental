import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useModal } from '../context/ModalContext';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import { useBookings } from '../context/BookingContext';
import { bikes, getBikeImage } from '../data/bikes';
import { resolveJourneyBikeImage } from '../utils/journeyImageResolver';

const INITIAL_PACKING_ITEMS = [
  { id: 'helmet', category: 'Gear', label: 'Certified ECE/ISI Helmet', done: true },
  { id: 'gloves', category: 'Gear', label: 'Leather Armored Gloves', done: true },
  { id: 'jacket', category: 'Gear', label: 'All-Weather Riding Jacket', done: true },
  { id: 'kneeguards', category: 'Safety', label: 'Bionic Knee & Shin Guards', done: true },
  { id: 'firstaid', category: 'Safety', label: 'Emergency First-Aid Medical Kit', done: true },
  { id: 'powerbank', category: 'Tech', label: '20,000mAh Rugged Power Bank', done: true },
  { id: 'inflator', category: 'Tech', label: 'Portable Digital Tyre Inflator', done: false },
  { id: 'thermal', category: 'Weather', label: 'Merino Thermal Base Layer', done: false },
  { id: 'sunglasses', category: 'Weather', label: 'Polarized UV400 Riding Glasses', done: true },
  { id: 'rainponcho', category: 'Weather', label: 'Waterproof Over-Jacket Rain Poncho', done: false }
];

const PACKING_STORAGE_KEY = 'ryvon-packing-checklist';

export default function Dashboard() {
  const { user, riderPersona, setRiderPersona } = useAuth();
  const { wishlist } = useWishlist();
  const { openModal } = useModal();
  const { money } = useCurrency();
  const { toast } = useToast();
  const { bookings, stats, extendBooking } = useBookings();
  const navigate = useNavigate();

  // Active category filter for Packing Assistant
  const [packingCategory, setPackingCategory] = useState('All');

  // Packing Assistant state with localStorage persistence
  const [packingItems, setPackingItems] = useState(() => {
    try {
      const saved = localStorage.getItem(PACKING_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PACKING_ITEMS;
  });

  const togglePackingItem = (id) => {
    setPackingItems(items => {
      const updated = items.map(item => item.id === id ? { ...item, done: !item.done } : item);
      try {
        localStorage.setItem(PACKING_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const filteredPackingItems = useMemo(() => {
    if (packingCategory === 'All') return packingItems;
    return packingItems.filter(i => i.category === packingCategory);
  }, [packingItems, packingCategory]);

  const doneCount = packingItems.filter(i => i.done).length;
  const progressPercent = Math.round((doneCount / packingItems.length) * 100);

  // Active / Upcoming Bookings Switcher
  const activeExpeditions = useMemo(() => {
    return bookings.filter(b => b.status === 'Active' || b.status === 'Upcoming');
  }, [bookings]);

  const [activeExpIndex, setActiveExpIndex] = useState(0);
  const activeExpedition = activeExpeditions[activeExpIndex] || (bookings.length > 0 ? bookings[0] : null);

  const isLive = activeExpedition?.status === 'Active';
  const targetDateStr = activeExpedition ? (isLive ? activeExpedition.endDate : activeExpedition.startDate) : null;

  // Real-time countdown timer
  const [timeLeft, setTimeLeft] = useState({ days: '00', hours: '00', mins: '00', secs: '00' });

  useEffect(() => {
    if (!activeExpedition || !targetDateStr) {
      setTimeLeft({ days: '00', hours: '00', mins: '00', secs: '00' });
      return;
    }

    const parseTarget = (str, defaultHour = 20) => {
      let clean = String(str).trim();
      if (clean.includes('T')) return new Date(clean);
      if (clean.includes('-')) {
        const parts = clean.split('-');
        if (parts.length === 3) {
          return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), defaultHour, 0, 0);
        }
      }
      return new Date(clean);
    };

    const updateTimer = () => {
      const now = new Date();
      let target = parseTarget(targetDateStr, isLive ? 20 : 9);
      let diff = target.getTime() - now.getTime();

      if (diff <= 0 && activeExpedition?.endDate) {
        const endTarget = parseTarget(activeExpedition.endDate, 20);
        const endDiff = endTarget.getTime() - now.getTime();
        if (endDiff > 0) {
          diff = endDiff;
        }
      }

      if (isNaN(diff) || diff <= 0) {
        setTimeLeft({ days: '00', hours: '00', mins: '00', secs: '00' });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        mins: String(mins).padStart(2, '0'),
        secs: String(secs).padStart(2, '0')
      });
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [targetDateStr, isLive, activeExpedition?.endDate]);

  // Dynamic calculations directly from centralized Bookings Context
  const totalBookings = stats.total || bookings.length || 9;
  const activeCount = stats.active || 0;
  const upcomingCount = stats.upcoming || 0;
  const completedCount = stats.completed || 0;
  const totalDistance = stats.distance || 5280;
  const score = user?.safetyScore || 98;

  // Saved bikes from wishlist, or featured defaults if empty
  const savedBikes = useMemo(() => {
    if (wishlist.length > 0) {
      return wishlist.map(id => bikes.find(b => b.id === id)).filter(Boolean).slice(0, 3);
    }
    return bikes.filter(b => b.isFeatured || b.category === 'Adventure' || b.category === 'Cruiser').slice(0, 3);
  }, [wishlist]);

  // Action Handlers
  const handleExtendRide = (b) => {
    if (!b) return;
    const updated = extendBooking(b.id, 1);
    if (updated) {
      toast(`⏱️ Ride extended by +1 Day for #${b.id}! New return date: ${updated.endDate}`);
    } else {
      toast(`📅 Ride extension submitted for Concierge dispatch review.`);
    }
  };

  const handleDownloadInvoice = (b) => {
    if (!b) return;
    toast(`📥 Generating official tax invoice for #${b.id}...`);
    setTimeout(() => {
      window.print();
    }, 350);
  };

  const copyBookingId = (id) => {
    const cleanId = String(id).replace(/^#/, '').trim();
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(cleanId).then(() => {
        toast(`Booking reference #${cleanId} copied! 📋`);
      });
    } else {
      toast(`Booking ID: #${cleanId}`);
    }
  };

  // Avatar source resolution
  const avatarSrc = user?.avatar || localStorage.getItem('ryvon-rider-avatar') || '/assets/images/rider-profile-avatar-hd.jpg';

  // Recommendation engine based on persona
  const currentPersona = riderPersona || 'Alpine Tourer';
  const recommendedBikes = useMemo(() => {
    if (currentPersona.includes('Alpine') || currentPersona.includes('Mountain')) {
      return bikes.filter(b => b.category === 'Adventure').slice(0, 2);
    }
    if (currentPersona.includes('Superbike') || currentPersona.includes('Racer')) {
      return bikes.filter(b => b.category === 'Sport' || b.category === 'Superbike').slice(0, 2);
    }
    if (currentPersona.includes('Coastal') || currentPersona.includes('Voyager')) {
      return bikes.filter(b => b.category === 'Cruiser').slice(0, 2);
    }
    return bikes.filter(b => b.category === 'Street' || b.category === 'Scooter').slice(0, 2);
  }, [currentPersona]);

  return (
    <DashboardLayout active="dash">
      <div className="dash-command-centre-container">

        {/* 1. RIDER COMMAND CENTRE HERO BANNER */}
        <section className="dash-hero-banner" aria-label="Rider Command Centre Identity">
          <div className="dash-hero-left">
            <div className="dash-avatar-circle-wrap">
              <img
                src={avatarSrc}
                alt={user?.name || 'Rider'}
                className="dash-avatar-img"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/assets/images/rider-profile-avatar.jpg';
                }}
              />
            </div>

            <div className="dash-hero-info">
              <span className="dash-eyebrow-pill">
                <span>⚡</span> RIDER COMMAND CENTRE
              </span>

              <h1 className="dash-hero-title">
                Welcome back, {user?.name ? user.name.split(' ')[0] : 'Vihan'}
                <span className="dash-verified-badge" title="Tier 1 Master Rider Verified">✓</span>
              </h1>

              <p className="dash-hero-subtext">
                {isLive
                  ? 'Expedition in progress. Telemetry stream verified · GPS connected.'
                  : (activeExpedition
                      ? 'Upcoming expedition confirmed. Inspection pass 100% complete.'
                      : 'Your rider cockpit is calibrated. Ready for the next mountain expedition.')}
              </p>

              <div className="dash-meta-pills-row">
                <span className="dash-meta-pill">
                  <span>👑</span> RYVON CLUB BLACK ELITE
                </span>
                <span className="dash-meta-pill">
                  <span>✉️</span> {user?.email || 'vihan2974.beai25@chitkara.edu.in'}
                </span>
                <span className="dash-meta-pill">
                  <span>📍</span> Bengaluru, India
                </span>
                <button
                  type="button"
                  className="dash-persona-chip"
                  onClick={() => openModal('riderPersona', { currentPersona, onSelect: setRiderPersona })}
                  title="Calibrate your riding DNA"
                >
                  <span>🧬</span> {currentPersona} ▾
                </button>
              </div>
            </div>
          </div>

          <div className="dash-hero-actions">
            <Link to="/booking-history" className="btn-hero-primary-gold">
              <span>🏍️</span> Journey Logs ({totalBookings})
            </Link>
            <Link to="/profile" className="btn-hero-glass">
              <span>👤</span> Edit Profile
            </Link>
          </div>
        </section>

        {/* 2. RIDER PERFORMANCE OVERVIEW (4 KPI CARDS) */}
        <section className="dash-kpi-grid" aria-label="Rider Performance Overview">
          {/* Total Expeditions */}
          <Link to="/booking-history" className="dash-kpi-card">
            <div className="dash-kpi-icon-wrap gold">🏍️</div>
            <div>
              <div className="dash-kpi-val">{totalBookings} Rides</div>
              <div className="dash-kpi-lbl">Total Expeditions</div>
              <div className="dash-kpi-sub">{activeCount} Active • {upcomingCount} Upcoming</div>
            </div>
          </Link>

          {/* Distance Explored */}
          <Link to="/booking-history" className="dash-kpi-card">
            <div className="dash-kpi-icon-wrap green">🛣️</div>
            <div>
              <div className="dash-kpi-val">{totalDistance.toLocaleString()} km</div>
              <div className="dash-kpi-lbl">Distance Explored</div>
              <div className="dash-kpi-sub">{completedCount} Completed Expeditions</div>
            </div>
          </Link>

          {/* Rider Safety Score */}
          <Link to="/profile" className="dash-kpi-card">
            <div className="dash-kpi-icon-wrap green">🛡️</div>
            <div>
              <div className="dash-kpi-val">{score} / 100</div>
              <div className="dash-kpi-lbl">Rider Safety Score</div>
              <div className="dash-kpi-sub" style={{ color: '#10b981' }}>✓ 32-Pt Telemetry Sync</div>
            </div>
          </Link>

          {/* Saved Fleet */}
          <Link to="/wishlist" className="dash-kpi-card">
            <div className="dash-kpi-icon-wrap gold">🔖</div>
            <div>
              <div className="dash-kpi-val">{wishlist.length} Saved</div>
              <div className="dash-kpi-lbl">Saved in Fleet</div>
              <div className="dash-kpi-sub" style={{ color: 'var(--gold, #f59e0b)' }}>View Shortlist →</div>
            </div>
          </Link>
        </section>

        {/* 3. CURRENT EXPEDITION (PRIORITY 1 MAIN FEATURE) */}
        <section className="dash-expedition-section" aria-label="Current Active Expedition">
          <div className="dash-section-header">
            <div className="dash-section-title-wrap">
              <h2>Current Expedition</h2>
              <p>Live active ride telemetry, navigation progress, and booking controls.</p>
            </div>
            {activeExpeditions.length > 1 && (
              <span className="badge ghost" style={{ fontSize: '11px' }}>
                {activeExpIndex + 1} of {activeExpeditions.length} Expeditions
              </span>
            )}
          </div>

          {activeExpedition ? (
            <div className="dash-expedition-master-card">
              {/* LEFT COLUMN: VEHICLE IMAGE */}
              <div className="dash-expedition-gallery-col">
                <img
                  src={resolveJourneyBikeImage(activeExpedition)}
                  alt={activeExpedition.bikeName}
                  className="dash-expedition-bike-img"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/assets/images/ryvon-superbike.png';
                  }}
                />

                <div className="dash-expedition-dest-chip">
                  <span>📍</span> Expedition: {(activeExpedition.destCity || 'Jaipur').replace(/(?:\s*Expedition)+$/gi, '')}
                </div>

                {activeExpeditions.length > 1 && (
                  <div className="dash-expedition-switcher">
                    <button
                      type="button"
                      className="dash-expedition-switch-btn"
                      onClick={() => setActiveExpIndex(prev => (prev - 1 + activeExpeditions.length) % activeExpeditions.length)}
                      aria-label="Previous Expedition"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className="dash-expedition-switch-btn"
                      onClick={() => setActiveExpIndex(prev => (prev + 1) % activeExpeditions.length)}
                      aria-label="Next Expedition"
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: EXPEDITION TELEMETRY & CONTROLS */}
              <div className="dash-expedition-details-col">
                <div>
                  <div className="dash-expedition-header-row">
                    <span className={`dash-expedition-status-pill ${isLive ? 'live-active' : 'upcoming'}`}>
                      {isLive ? 'CURRENT EXPEDITION • ACTIVE ⚡' : 'UPCOMING EXPEDITION • RESERVED 🚀'}
                    </span>
                    <span
                      className="dash-expedition-id"
                      onClick={() => copyBookingId(activeExpedition.id)}
                      title="Click to copy ID"
                    >
                      #{activeExpedition.id}
                    </span>
                  </div>

                  <h3
                    className="dash-expedition-title"
                    style={{ marginTop: '8px', cursor: 'pointer' }}
                    onClick={() => openModal('journeyDetail', { bookingId: activeExpedition.id, booking: activeExpedition })}
                  >
                    {(activeExpedition.destCity || 'Jaipur').replace(/(?:\s*Expedition)+$/gi, '')} Expedition
                  </h3>

                  <div className="dash-expedition-bike-meta">
                    <strong>{activeExpedition.bikeName}</strong> • {activeExpedition.bikeCategory || 'Adventure'}
                  </div>
                </div>

                {/* Live Countdown Ticker */}
                <div className="dash-countdown-bar">
                  <span className="dash-countdown-lbl">
                    {isLive ? 'EXPEDITION ENDS IN' : 'RIDE STARTS IN'}
                  </span>
                  <div className="dash-countdown-units">
                    <span className="dash-unit-digit">{timeLeft.days}</span>
                    <span className="dash-unit-txt">D</span>
                    <span className="dash-unit-colon">:</span>
                    <span className="dash-unit-digit">{timeLeft.hours}</span>
                    <span className="dash-unit-txt">H</span>
                    <span className="dash-unit-colon">:</span>
                    <span className="dash-unit-digit">{timeLeft.mins}</span>
                    <span className="dash-unit-txt">M</span>
                    <span className="dash-unit-colon">:</span>
                    <span className="dash-unit-digit">{timeLeft.secs}</span>
                    <span className="dash-unit-txt">S</span>
                  </div>
                </div>

                {/* Route Track */}
                <div className="dash-route-track">
                  <div className="dash-route-node">
                    <span>📍</span> {activeExpedition.pickupCity || 'Jaipur Hub'}
                  </div>
                  <div className="dash-route-line-wrap">
                    <div className="dash-route-line-bar"></div>
                    <span className="dash-route-bike-icon">🏍️</span>
                  </div>
                  <div className="dash-route-node">
                    <span>📍</span> {(activeExpedition.destCity || 'Jaipur').replace(/(?:\s*Expedition)+$/gi, '')}
                  </div>
                </div>

                {/* 2-Row Schedule Grid */}
                <div className="dash-schedule-grid">
                  <div className="dash-sched-box">
                    <div className="dash-sched-lbl">Pickup Date</div>
                    <div className="dash-sched-val">{activeExpedition.startDate}</div>
                  </div>
                  <div className="dash-sched-box">
                    <div className="dash-sched-lbl">Return Date</div>
                    <div className="dash-sched-val">{activeExpedition.endDate}</div>
                  </div>
                  <div className="dash-sched-box highlight">
                    <div className="dash-sched-lbl gold">Duration</div>
                    <div className="dash-sched-val gold">{activeExpedition.duration || 4} DAYS</div>
                  </div>
                </div>

                {/* 6 Functional Action Buttons */}
                <div className="dash-actions-row">
                  <button
                    type="button"
                    className="btn-exp-gold"
                    onClick={() => openModal('journeyDetail', { bookingId: activeExpedition.id, booking: activeExpedition })}
                  >
                    View Details →
                  </button>
                  <button
                    type="button"
                    className="btn-exp-dark"
                    onClick={() => openModal('journeyDetail', { bookingId: activeExpedition.id, booking: activeExpedition })}
                  >
                    📊 Route Telemetry
                  </button>
                  <button
                    type="button"
                    className="btn-exp-dark"
                    onClick={() => openModal('modifyBooking', { booking: activeExpedition, bookingId: activeExpedition.id })}
                  >
                    ✏️ Modify
                  </button>
                  <button
                    type="button"
                    className="btn-exp-dark"
                    onClick={() => handleExtendRide(activeExpedition)}
                  >
                    📅 Extend +1d
                  </button>
                  <button
                    type="button"
                    className="btn-exp-dark"
                    onClick={() => handleDownloadInvoice(activeExpedition)}
                  >
                    📥 Invoice
                  </button>
                  <button
                    type="button"
                    className="btn-exp-sos"
                    onClick={() => openModal('sosEmergency', { activeBooking: activeExpedition })}
                  >
                    🚨 SOS Dispatch
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="dash-white-card" style={{ padding: '40px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🏍️</div>
              <span className="badge" style={{ background: '#f59e0b', color: '#070a0f', marginBottom: '8px', fontWeight: 800 }}>READY FOR ADVENTURE</span>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', margin: '6px 0', color: 'var(--ink)' }}>No Active Expeditions</h3>
              <p style={{ maxWidth: '440px', margin: '0 auto 20px auto', fontSize: '13.5px', color: '#64748b' }}>
                Your rider cockpit is calibrated. Explore our premium 34+ motorcycle fleet and book your next mountain or coastal expedition.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link className="btn btn-primary" to="/bikes">Explore Fleet &amp; Book →</Link>
                <button className="btn btn-outline" type="button" onClick={() => openModal('buildMyRide')}>Build My Ride AI 🧬</button>
              </div>
            </div>
          )}
        </section>

        {/* 4. SECONDARY TWO-COLUMN GRID: PACKING & TELEMETRY */}
        <section className="dash-middle-two-col" aria-label="Expedition Assistant & Safety">

          {/* AI PACKING ASSISTANT */}
          <div className="dash-white-card">
            <div className="dash-card-header">
              <div className="dash-card-header-left">
                <div className="dash-card-header-icon">🧳</div>
                <div>
                  <h3 className="dash-card-title">AI Expedition Packing Assistant</h3>
                  <p className="dash-card-sub">Gear readiness checklist for mountain passes &amp; weather.</p>
                </div>
              </div>
              <span className="badge" style={{ background: progressPercent === 100 ? '#10b981' : '#f59e0b', color: progressPercent === 100 ? '#ffffff' : '#070a0f', fontWeight: 800 }}>
                {doneCount}/{packingItems.length} ({progressPercent}%)
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="dash-cat-pills-row">
              {['All', 'Gear', 'Safety', 'Tech', 'Weather'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`dash-cat-pill ${packingCategory === cat ? 'active' : ''}`}
                  onClick={() => setPackingCategory(cat)}
                >
                  {cat === 'All' ? 'All Essentials' : cat}
                </button>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="dash-progress-track">
              <div className="dash-progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>

            {/* Packing Items List */}
            <div className="dash-packing-list">
              {filteredPackingItems.map(item => (
                <div
                  key={item.id}
                  className={`dash-packing-item ${item.done ? 'checked' : ''}`}
                  onClick={() => togglePackingItem(item.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="dash-pack-checkbox">
                      {item.done ? '✓' : ''}
                    </div>
                    <span className="dash-pack-name">{item.label}</span>
                  </div>
                  <span className={`dash-pack-badge ${item.done ? 'done' : 'pending'}`}>
                    {item.done ? 'Packed' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* LIVE TELEMETRY & SAFETY RECORD */}
          <div className="dash-white-card">
            <div className="dash-card-header">
              <div className="dash-card-header-left">
                <div className="dash-card-header-icon green">🛡️</div>
                <div>
                  <h3 className="dash-card-title">Live Telemetry &amp; Safety Record</h3>
                  <p className="dash-card-sub">Real-time vehicle health, diagnostics, and route alerts.</p>
                </div>
              </div>
              <span className="credential-status-badge badge-green">● LIVE PASS</span>
            </div>

            <div className="dash-telemetry-body">
              {/* Telemetry 3-Metric Overview */}
              <div className="dash-telemetry-metrics-grid">
                <div className="dash-telem-box">
                  <div className="dash-telem-val">{score}/100</div>
                  <div className="dash-telem-lbl">Safety Score</div>
                </div>
                <div className="dash-telem-box">
                  <div className="dash-telem-val">99.2%</div>
                  <div className="dash-telem-lbl">Speed Compliance</div>
                </div>
                <div className="dash-telem-box">
                  <div className="dash-telem-val">97.8%</div>
                  <div className="dash-telem-lbl">G-Force Stability</div>
                </div>
              </div>

              {/* Weather & Road Advisory */}
              <div className="dash-telem-advisory-box">
                <span style={{ fontSize: '20px' }}>🌤️</span>
                <div className="dash-telem-advisory-txt">
                  <strong>Mountain Route Advisory:</strong> Weather conditions across Jaipur-Himalayan corridors are clear. High-traction dry asphalt. No emergency road hazards detected.
                </div>
              </div>

              {/* Telemetry Status Sync */}
              <div className="dash-telem-sync-status">
                <span>📡 Telemetry Stream: GPS Signal Strong · 32-Pt Sync</span>
                <button
                  type="button"
                  className="btn-exp-sos"
                  style={{ padding: '3px 10px', fontSize: '11px' }}
                  onClick={() => openModal('sosEmergency', { activeBooking: activeExpedition })}
                >
                  🚨 SOS Assist
                </button>
              </div>
            </div>
          </div>

        </section>

        {/* 5. RECENT JOURNEYS (PRIORITY 2 BOOKING ACTIVITY) */}
        <section className="dash-white-card" aria-label="Recent Expeditions Activity">
          <div className="dash-card-header">
            <div className="dash-card-header-left">
              <div className="dash-card-header-icon">📑</div>
              <div>
                <h3 className="dash-card-title">Recent Journeys</h3>
                <p className="dash-card-sub">Complete expedition logs and motorcycle dispatch history.</p>
              </div>
            </div>
            <Link to="/booking-history" className="gold-link" style={{ fontSize: '13px', fontWeight: 800 }}>
              View All Journeys ({bookings.length}) →
            </Link>
          </div>

          <div className="dash-journeys-list">
            {bookings.slice(0, 3).map(b => {
              const bImg = resolveJourneyBikeImage(b);
              const destClean = (b.destCity || 'Expedition Route').replace(/(?:\s*Expedition)+$/gi, '');
              const isItemActive = b.status === 'Active';
              const isItemUpcoming = b.status === 'Upcoming';
              const isItemCancelled = b.status === 'Cancelled';

              return (
                <div key={b.id} className="dash-journey-row">
                  <div className="dash-journey-left">
                    <img
                      src={bImg}
                      alt={b.bikeName}
                      className="dash-journey-bike-img"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/assets/images/ryvon-superbike.png';
                      }}
                    />
                    <div>
                      <div className="dash-journey-name">{b.bikeName}</div>
                      <div className="dash-journey-meta-txt">
                        📍 {b.pickupCity} → {destClean} • <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold, #f59e0b)' }}>#{b.id}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '12px' }}>
                    <div style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase' }}>Rental Window</div>
                    <div style={{ fontWeight: 600 }}>{b.startDate} to {b.endDate} ({b.duration || 1}d)</div>
                  </div>

                  <div style={{ fontSize: '12px' }}>
                    <div style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase' }}>Total Amount</div>
                    <strong style={{ color: 'var(--gold, #f59e0b)', fontSize: '14px' }}>{money(b.total)}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`dash-expedition-status-pill ${isItemActive ? 'live-active' : (isItemUpcoming ? 'upcoming' : 'default')}`} style={{ fontSize: '10px', padding: '3px 8px' }}>
                      {b.status}
                    </span>
                    <button
                      type="button"
                      className="btn-exp-gold"
                      style={{ padding: '5px 12px', fontSize: '11px' }}
                      onClick={() => openModal('journeyDetail', { bookingId: b.id, booking: b })}
                    >
                      Details →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 6. SAVED FLEET — VISUAL DISCOVERY */}
        <section className="dash-white-card" aria-label="Saved Fleet Discovery">
          <div className="dash-card-header">
            <div className="dash-card-header-left">
              <div className="dash-card-header-icon">🔖</div>
              <div>
                <h3 className="dash-card-title">Saved Fleet &amp; Shortlist</h3>
                <p className="dash-card-sub">Motorcycles hand-picked for your upcoming adventures.</p>
              </div>
            </div>
            <Link to="/wishlist" className="gold-link" style={{ fontSize: '13px', fontWeight: 800 }}>
              Manage Saved Fleet ({wishlist.length}) →
            </Link>
          </div>

          <div className="dash-fleet-grid">
            {savedBikes.map(b => (
              <div key={b.id} className="dash-fleet-card">
                <div className="dash-fleet-img-wrap">
                  <img
                    src={getBikeImage(b)}
                    alt={b.name}
                    className="dash-fleet-img"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/assets/images/ryvon-superbike.png';
                    }}
                  />
                </div>
                <div className="dash-fleet-body">
                  <h4 className="dash-fleet-name">{b.name}</h4>
                  <div className="dash-fleet-specs-row">
                    <span>🏍️ {b.category}</span>
                    <span>•</span>
                    <span>⚡ {b.specs?.power || '40 HP'}</span>
                    <span>•</span>
                    <span>🔧 {b.specs?.engine || '450cc'}</span>
                  </div>
                  <div className="dash-fleet-price-row">
                    <div>
                      <span style={{ fontSize: '10.5px', color: '#64748b', textTransform: 'uppercase' }}>Daily Rate</span>
                      <div className="dash-fleet-price">{money(b.price)}<small style={{ fontSize: '11px', color: '#94a3b8' }}>/day</small></div>
                    </div>
                    <Link
                      to={`/booking?bike=${b.id}`}
                      className="btn-exp-gold"
                      style={{ textDecoration: 'none', padding: '6px 14px' }}
                    >
                      Book Now →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. PERSONALIZED RIDING RECOMMENDATIONS (PRIORITY 3) */}
        <section className="dash-recommendation-card" aria-label="Rider Genome Recommendations">
          <div className="dash-rec-left">
            <div className="dash-rec-icon">🧬</div>
            <div>
              <div className="dash-rec-title">
                Rider Genome Match: {currentPersona}
                <span className="badge" style={{ background: '#10b981', color: '#ffffff', marginLeft: '8px', fontSize: '10px' }}>
                  98% Compatibility
                </span>
              </div>
              <div className="dash-rec-sub">
                Based on your high-altitude touring preference, we recommend machines with long-travel suspension and Spiti/Ladakh high-pass routes.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link to="/bikes" className="btn-hero-primary-gold" style={{ padding: '8px 18px', fontSize: '12px' }}>
              View Recommended Fleet →
            </Link>
            <button
              type="button"
              className="btn-hero-glass"
              style={{ padding: '8px 16px', fontSize: '12px' }}
              onClick={() => openModal('buildMyRide')}
            >
              Build My Ride 🗺️
            </button>
          </div>
        </section>

        {/* 8. QUICK ACTIONS BAR */}
        <section className="dash-quick-actions-bar" aria-label="Quick Actions Navigation">
          <Link to="/bikes" className="dash-quick-act-item">
            <span className="dash-quick-act-icon">🏍️</span>
            <span className="dash-quick-act-lbl">Explore Fleet</span>
          </Link>
          <button
            type="button"
            className="dash-quick-act-item"
            onClick={() => openModal('quickBook')}
          >
            <span className="dash-quick-act-icon">⚡</span>
            <span className="dash-quick-act-lbl">Quick Book</span>
          </button>
          <Link to="/booking-history" className="dash-quick-act-item">
            <span className="dash-quick-act-icon">📑</span>
            <span className="dash-quick-act-lbl">Journey Logs</span>
          </Link>
          <Link to="/profile" className="dash-quick-act-item">
            <span className="dash-quick-act-icon">👤</span>
            <span className="dash-quick-act-lbl">Rider Profile</span>
          </Link>
          <Link to="/wishlist" className="dash-quick-act-item">
            <span className="dash-quick-act-icon">🔖</span>
            <span className="dash-quick-act-lbl">Saved Fleet</span>
          </Link>
          <button
            type="button"
            className="dash-quick-act-item"
            onClick={() => openModal('buildMyRide')}
          >
            <span className="dash-quick-act-icon">🧬</span>
            <span className="dash-quick-act-lbl">Build My Ride</span>
          </button>
        </section>

      </div>
    </DashboardLayout>
  );
}
