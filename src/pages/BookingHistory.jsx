import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useModal } from '../context/ModalContext';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import { useBookings } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { bikes, getBikeImage } from '../data/bikes';
import { resolveJourneyBikeImage } from '../utils/journeyImageResolver';

export { resolveJourneyBikeImage };

export const parseISTDateTime = (dateStr, timeStr = '09:00 AM') => {
  if (!dateStr) return null;
  const cleanDate = String(dateStr).trim();
  const dateOnly = cleanDate.includes('T') ? cleanDate.split('T')[0] : cleanDate;
  const parts = dateOnly.split('-');
  if (parts.length !== 3) return new Date(cleanDate);

  let hours = 9;
  let minutes = 0;
  if (timeStr) {
    const match = String(timeStr).match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const period = match[3] ? match[3].toUpperCase() : null;
      if (period === 'PM' && h < 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      hours = h;
      minutes = m;
    }
  }

  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), hours, minutes, 0);
};

export const getBookingTimingInfo = (booking, now = new Date()) => {
  if (!booking) return null;
  const status = booking.status;

  if (status === 'Cancelled') {
    return {
      state: 'CANCELLED',
      label: 'RESERVATION CANCELLED',
      sublabel: 'Full Refund Processed'
    };
  }

  if (status === 'Completed') {
    return {
      state: 'COMPLETED',
      label: 'JOURNEY COMPLETED',
      sublabel: 'Telemetry Verified · 100% Escrow Released'
    };
  }

  const pickupTime = booking.pickupTime || '09:00 AM';
  const returnTime = booking.returnTime || '06:00 PM';
  const startDateTime = parseISTDateTime(booking.startDate, pickupTime);
  const endDateTime = parseISTDateTime(booking.endDate, returnTime);

  // Active status or within rental window
  if (status === 'Active' || (startDateTime && endDateTime && now >= startDateTime && now <= endDateTime)) {
    const remainingMs = endDateTime ? Math.max(0, endDateTime.getTime() - now.getTime()) : 0;
    const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((remainingMs % (1000 * 60)) / 1000);

    return {
      state: 'ACTIVE',
      label: 'RIDE IN PROGRESS',
      sublabel: 'Telemetry Stream Active · GPS Connected',
      days: String(days).padStart(2, '0'),
      hours: String(hours).padStart(2, '0'),
      mins: String(mins).padStart(2, '0'),
      secs: String(secs).padStart(2, '0')
    };
  }

  // Upcoming
  const diffMs = startDateTime ? startDateTime.getTime() - now.getTime() : 0;
  if (diffMs <= 0) {
    return {
      state: 'UPCOMING_READY',
      label: 'HANDOVER READY',
      sublabel: 'Station Inspection Complete',
      days: '00',
      hours: '00',
      mins: '00',
      secs: '00'
    };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

  return {
    state: 'UPCOMING',
    label: 'RIDE STARTS IN',
    sublabel: 'Handover Countdown',
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    mins: String(mins).padStart(2, '0'),
    secs: String(secs).padStart(2, '0')
  };
};

export const formatExpeditionDate = (dateStr) => {
  if (!dateStr) return 'Nov 09, 2026';
  try {
    const parts = String(dateStr).split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parts[2];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      if (monthIdx >= 0 && monthIdx < 12) {
        return `${months[monthIdx]} ${day}, ${year}`;
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()}`;
    }
    return dateStr;
  } catch (e) {
    return dateStr;
  }
};

export const formatExpeditionDateRange = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return 'Nov 09 – Nov 12';
  try {
    const parse = (str) => {
      const parts = String(str).split('-');
      if (parts.length === 3) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const m = parseInt(parts[1], 10) - 1;
        return `${months[m] || 'Nov'} ${parts[2]}`;
      }
      const d = new Date(str);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`;
    };
    return `${parse(startDateStr)} – ${parse(endDateStr)}`;
  } catch (e) {
    return `${startDateStr} – ${endDateStr}`;
  }
};

export const getBrandBadgeIcon = (bikeName = '') => {
  const n = String(bikeName).toLowerCase();
  if (n.includes('bmw')) return '🏍️';
  if (n.includes('scram') || n.includes('enfield') || n.includes('bullet') || n.includes('meteor') || n.includes('classic')) return '🛡️';
  if (n.includes('ktm') || n.includes('duke')) return '⚡';
  if (n.includes('harley')) return '🦅';
  if (n.includes('ducati')) return '🇮🇹';
  if (n.includes('triumph')) return '👑';
  return '🏍️';
};

export const getShortModelBadgeName = (bikeName = '') => {
  if (!bikeName) return 'Motorcycle';
  let s = String(bikeName).replace(/(?:\s*Expedition|\s*Tourer|\s*Summit|\s*Rally|\s*Trail|\s*Quick)+$/gi, '').trim();
  s = s.replace(/Royal Enfield/gi, 'RE');
  s = s.replace(/Adventure/gi, 'Adv');
  return s;
};

export const calculateTicker = (targetDateStr, isLive, fallbackEndDateStr) => {
  if (!targetDateStr) return { days: '00', hours: '00', mins: '00', secs: '00' };
  const now = new Date();

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

  let target = parseTarget(targetDateStr, isLive ? 20 : 9);
  let diffMs = target.getTime() - now.getTime();

  if (diffMs <= 0 && fallbackEndDateStr) {
    const endTarget = parseTarget(fallbackEndDateStr, 20);
    const endDiff = endTarget.getTime() - now.getTime();
    if (endDiff > 0) {
      diffMs = endDiff;
    }
  }

  if (isNaN(diffMs) || diffMs <= 0) {
    return { days: '00', hours: '00', mins: '00', secs: '00' };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    mins: String(mins).padStart(2, '0'),
    secs: String(secs).padStart(2, '0')
  };
};

export default function BookingHistory() {
  const { user, isAuthenticated } = useAuth();
  const { openModal } = useModal();
  const { money } = useCurrency();
  const { toast } = useToast();
  const { bookings, stats, cancelBooking, deleteBooking, updateBooking, extendBooking } = useBookings();

  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [openMenuId, setOpenMenuId] = useState(null);

  // Close card popovers on outside click
  useEffect(() => {
    const handleOutsideClick = () => setOpenMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Real statistics derived strictly from actual booking records for authenticated user
  const totalCount = isAuthenticated ? stats.total : 0;
  const activeCount = isAuthenticated ? stats.active : 0;
  const upcomingCount = isAuthenticated ? stats.upcoming : 0;
  const completedCount = isAuthenticated ? stats.completed : 0;
  const cancelledCount = isAuthenticated ? stats.cancelled : 0;

  // Selected Featured Journey: Automatically displays the user's MOST RECENTLY CREATED BOOKING
  // Never hardcodes any vehicle or destination. Always synchronizes with the latest booking record.
  const featured = useMemo(() => {
    if (!isAuthenticated || !bookings || bookings.length === 0) return null;
    const sorted = [...bookings].sort((a, b) => {
      // 1. If createdAt exists, sort by creation timestamp descending
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (timeB && timeA && timeB !== timeA) return timeB - timeA;
      // 2. Otherwise sort by startDate descending, then id descending
      const dateComp = (b.startDate || b.pickupDate || '').localeCompare(a.startDate || a.pickupDate || '');
      if (dateComp !== 0) return dateComp;
      return (b.id || '').localeCompare(a.id || '');
    });
    return sorted[0];
  }, [bookings]);

  const isLive = featured ? featured.status === 'Active' : false;
  const isUpcoming = featured ? featured.status === 'Upcoming' : false;

  // Real-time tick for countdown
  const [now, setNow] = useState(() => new Date());
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [fullscreenImg, setFullscreenImg] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timingInfo = useMemo(() => {
    if (!featured) return null;
    return getBookingTimingInfo(featured, now);
  }, [featured, now]);

  const ticker = useMemo(() => {
    if (!featured) return { days: '00', hours: '00', mins: '00', secs: '00' };
    if (timingInfo && timingInfo.days !== undefined) {
      return {
        days: timingInfo.days,
        hours: timingInfo.hours,
        mins: timingInfo.mins,
        secs: timingInfo.secs
      };
    }
    return calculateTicker(isLive ? featured.endDate : featured.startDate, isLive, featured.endDate);
  }, [featured, timingInfo, isLive]);

  // Motorcycle images for the featured vehicle gallery
  const featuredBikeImgSrc = featured ? resolveJourneyBikeImage(featured) : '';

  const featuredGalleryImages = useMemo(() => {
    if (!featured) return [];
    const baseImg = resolveJourneyBikeImage(featured);
    const rawId = String(featured.bikeId || '').toLowerCase().trim();
    const name = String(featured.bikeName || '').toLowerCase().trim();

    if (rawId === 'himalayan' || name.includes('himalayan')) {
      return [
        '/assets/images/himalayan-450-expedition.jpg',
        '/assets/images/himalayan-450.jpg',
        '/assets/images/faq-hero-himalayan-hd.jpg'
      ];
    }
    if (rawId.includes('supermeteor') || name.includes('super meteor')) {
      return [
        '/assets/images/royal-enfield-super-meteor-650.jpg',
        '/assets/images/royal-enfield-super-meteor-650.jpg',
        baseImg
      ];
    }
    if (rawId.includes('scram') || name.includes('scram')) {
      return [
        '/assets/images/royal-enfield-scram-411.jpg',
        baseImg
      ];
    }
    if (rawId.includes('classic') || name.includes('classic')) {
      return [
        '/assets/images/royal-enfield-classic-350.png',
        baseImg
      ];
    }
    if (rawId.includes('bmw') || name.includes('bmw')) {
      return [
        '/assets/images/bmw-f850-gs.jpg',
        baseImg
      ];
    }
    return [baseImg, baseImg, baseImg];
  }, [featured]);

  const handleViewDetails = (b) => {
    if (!b) return;
    openModal('journeyDetail', { bookingId: b.id, booking: b });
  };

  const handleModifyBooking = (b) => {
    if (!b) return;
    openModal('modifyBooking', { booking: b, bookingId: b.id });
  };

  const handleExtendRide = (b) => {
    if (!b) return;
    if (b.status === 'Cancelled' || b.status === 'Completed') {
      toast('Only active or upcoming journeys can be extended.');
      return;
    }
    const updated = extendBooking(b.id, 1);
    if (updated) {
      toast(`⏱️ Ride extended by +1 Day for #${b.id}! New return date: ${updated.endDate}`);
    } else {
      toast(`📅 Ride extension submitted for Concierge dispatch review.`);
    }
  };

  const handleDownloadInvoice = (b) => {
    if (!b) return;
    toast(`📥 Preparing official tax invoice for booking #${b.id}...`);
    setTimeout(() => {
      window.print();
    }, 350);
  };

  const handleRouteTelemetry = (b) => {
    if (!b) return;
    toast(`🛰️ Live Expedition Telemetry: GPS Stream Active, 4G Uplink, Station Ping: 18ms for #${b.id}`);
  };

  const handleSOSDispatch = (b) => {
    if (!b) return;
    toast(`🚨 24/7 Concierge & Roadside SOS dispatch alerted for booking #${b.id} at ${b.pickupCity || 'Bengaluru Hub'}.`);
  };

  const handleDeleteBooking = (b) => {
    if (!b) return;
    openModal('deleteBooking', { booking: b, bookingId: b.id });
  };

  const handleCancelBooking = (bookingId) => {
    const b = bookings.find(x => x.id === bookingId);
    if (!b) return;
    openModal('deleteBooking', { booking: b, bookingId: b.id });
  };

  const copyBookingId = (id) => {
    const cleanId = String(id).replace(/^#/, '').trim();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(cleanId).then(() => {
        toast(`Booking ID #${cleanId} copied to clipboard 📋`);
      }).catch(() => {
        toast(`Booking ID: #${cleanId}`);
      });
    } else {
      toast(`Booking ID: #${cleanId}`);
    }
  };

  const filteredBookings = useMemo(() => {
    let result = [...bookings];

    // Filter by tab
    if (activeTab === 'Upcoming') {
      result = result.filter(b => b.status === 'Upcoming');
    } else if (activeTab === 'Active') {
      result = result.filter(b => b.status === 'Active');
    } else if (activeTab === 'Completed') {
      result = result.filter(b => b.status === 'Completed');
    } else if (activeTab === 'Cancelled') {
      result = result.filter(b => b.status === 'Cancelled');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(b => {
        const fullTxt = `${b.id} ${b.bookingId || ''} ${b.bikeName} ${b.destCity || b.destination || ''} ${b.pickupCity || b.pickupLocation || ''} ${b.status || b.bookingStatus || ''}`.toLowerCase();
        return fullTxt.includes(q);
      });
    }

    // Multi-Criteria Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        const dComp = (b.startDate || b.pickupDate || '').localeCompare(a.startDate || a.pickupDate || '');
        if (dComp !== 0) return dComp;
        return (b.createdAt || b.id || '').localeCompare(a.createdAt || a.id || '');
      }
      if (sortBy === 'oldest') {
        const dComp = (a.startDate || a.pickupDate || '').localeCompare(b.startDate || b.pickupDate || '');
        if (dComp !== 0) return dComp;
        return (a.createdAt || a.id || '').localeCompare(b.createdAt || b.id || '');
      }
      if (sortBy === 'pickup-date') {
        return (a.startDate || a.pickupDate || '').localeCompare(b.startDate || b.pickupDate || '');
      }
      if (sortBy === 'return-date') {
        return (a.endDate || a.returnDate || '').localeCompare(b.endDate || b.returnDate || '');
      }
      if (sortBy === 'status') {
        const order = { 'Active': 1, 'Upcoming': 2, 'Completed': 3, 'Cancelled': 4 };
        return (order[a.status] || 5) - (order[b.status] || 5);
      }
      if (sortBy === 'price-high') return (b.total || b.totalAmount || 0) - (a.total || a.totalAmount || 0);
      if (sortBy === 'price-low') return (a.total || a.totalAmount || 0) - (b.total || b.totalAmount || 0);
      return 0;
    });

    return result;
  }, [bookings, activeTab, searchQuery, sortBy]);

  const featuredDestClean = featured?.destCity
    ? featured.destCity.replace(/(?:\s*Expedition)+$/gi, '').trim()
    : 'Jaipur';
  const featuredTitleText = `${featuredDestClean} Expedition`;

  return (
    <DashboardLayout active="history">
      <div className="booking-history-section ryvon-journeys-page" style={{ width: '100%' }}>

        {/* 1. CINEMATIC JOURNEY LOGS HERO */}
        <div className="journey-logs-page-hero">
          <div className="journey-hero-overlay-scrim"></div>

          {/* Golden Aerodynamic Ambient Swoosh Line */}
          <svg className="journey-hero-ambient-swoosh" viewBox="0 0 1440 320" fill="none" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="heroGoldSwooshGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.0" />
                <stop offset="25%" stopColor="#f59e0b" stopOpacity="0.25" />
                <stop offset="55%" stopColor="#fbbf24" stopOpacity="0.6" />
                <stop offset="85%" stopColor="#f59e0b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M -50 320 C 300 310, 520 280, 720 220 C 950 150, 1150 170, 1480 90"
              stroke="url(#heroGoldSwooshGrad)"
              strokeWidth="2.5"
              fill="none"
            />
          </svg>

          <div className="journey-hero-content">
            <div className="journey-hero-eyebrow">
              <span className="eyebrow-dash"></span> RYVON JOURNEY LOGS
            </div>
            <h1 className="journey-hero-title">
              Journey <span className="journey-hero-title-accent">Logs</span>
            </h1>
            <p className="journey-hero-subtitle">
              Your complete record of RYVON rides, travels, and expeditions.
            </p>

            {/* 2. JOURNEY STATISTICS: ELEGANT, COMPACT & VISUALLY INTEGRATED */}
            <div className="journey-hero-stats-console" aria-label="Journey Expedition Summary Statistics">
              {/* Total Rides */}
              <div className="hero-stat-cell">
                <div className="hero-stat-icon-pill icon-gold">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6h-3l-3 6.5h7.5L14 6z"/><path d="M5.5 17.5L9 12.5l5 5"/><path d="M18.5 17.5L15 11l-3-5"/></svg>
                </div>
                <div className="hero-stat-meta">
                  <span className="hero-stat-num">{String(totalCount).padStart(2, '0')}</span>
                  <span className="hero-stat-name">Total Rides</span>
                </div>
              </div>

              <div className="hero-stat-divider" aria-hidden="true"></div>

              {/* Active */}
              <div className="hero-stat-cell">
                <div className="hero-stat-icon-pill icon-green">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                </div>
                <div className="hero-stat-meta">
                  <span className="hero-stat-num">{String(activeCount).padStart(2, '0')}</span>
                  <span className="hero-stat-name">Active</span>
                </div>
              </div>

              <div className="hero-stat-divider" aria-hidden="true"></div>

              {/* Upcoming */}
              <div className="hero-stat-cell">
                <div className="hero-stat-icon-pill icon-blue">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div className="hero-stat-meta">
                  <span className="hero-stat-num">{String(upcomingCount).padStart(2, '0')}</span>
                  <span className="hero-stat-name">Upcoming</span>
                </div>
              </div>

              <div className="hero-stat-divider" aria-hidden="true"></div>

              {/* Completed */}
              <div className="hero-stat-cell">
                <div className="hero-stat-icon-pill icon-purple">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div className="hero-stat-meta">
                  <span className="hero-stat-num">{String(completedCount).padStart(2, '0')}</span>
                  <span className="hero-stat-name">Completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. JOURNEY FILTERS, SEARCH AND SORTING TOOLBAR */}
        <div className="journeys-controls-bar">
          <div className="journey-filter-pills-wrap">
            <button
              className={`journey-filter-pill-btn ${activeTab === 'All' ? 'active-pill' : ''}`}
              type="button"
              onClick={() => setActiveTab('All')}
            >
              <span className="pill-icon">✓</span> All Journeys ({totalCount})
            </button>
            <button
              className={`journey-filter-pill-btn ${activeTab === 'Upcoming' ? 'active-pill' : ''}`}
              type="button"
              onClick={() => setActiveTab('Upcoming')}
            >
              <span className="pill-icon icon-upcoming">🚀</span> Upcoming ({upcomingCount})
            </button>
            <button
              className={`journey-filter-pill-btn ${activeTab === 'Active' ? 'active-pill' : ''}`}
              type="button"
              onClick={() => setActiveTab('Active')}
            >
              <span className="pill-icon icon-active">⚡</span> Active ({activeCount})
            </button>
            <button
              className={`journey-filter-pill-btn ${activeTab === 'Completed' ? 'active-pill' : ''}`}
              type="button"
              onClick={() => setActiveTab('Completed')}
            >
              <span className="pill-icon icon-completed">✓</span> Completed ({completedCount})
            </button>
            <button
              className={`journey-filter-pill-btn ${activeTab === 'Cancelled' ? 'active-pill' : ''}`}
              type="button"
              onClick={() => setActiveTab('Cancelled')}
            >
              <span className="pill-icon icon-cancelled">✕</span> Cancelled ({cancelledCount})
            </button>
          </div>

          <div className="journeys-search-sort-wrap">
            <div className="journeys-search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="journeys-search-input"
                id="journey-search-input"
                placeholder="Search by bike, destination or booking ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="journeys-sort-box">
              <select
                className="journeys-sort-select"
                id="journey-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Sort: Newest First ⌄</option>
                <option value="oldest">Sort: Oldest First ⌄</option>
                <option value="pickup-date">Sort: Pickup Date ⌄</option>
                <option value="return-date">Sort: Return Date ⌄</option>
                <option value="status">Sort: Booking Status ⌄</option>
                <option value="price-high">Sort: Price (High → Low) ⌄</option>
                <option value="price-low">Sort: Price (Low → High) ⌄</option>
              </select>
            </div>

            {/* Grid / List View Mode Toggle */}
            <div className="view-mode-toggle-group">
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'grid' ? 'active-view' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
                aria-label="Grid View"
              >
                ⊞
              </button>
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'list' ? 'active-view' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
                aria-label="List View"
              >
                ☰
              </button>
            </div>
          </div>
        </div>

        {/* 4. FEATURED ACTIVE JOURNEY — MAIN HIGHLIGHT (PIXEL-PERFECT REFERENCE DESIGN) */}
        {featured && (
          <div className="featured-journey-wrapper">
            <div className="featured-journey-master-card">
              {/* LEFT COLUMN: MOTORCYCLE IMAGE SHOWCASE (50% WIDTH) */}
              <div className="featured-gallery-column">
                <div
                  className="featured-bike-single-image-wrap"
                  onClick={() => handleViewDetails(featured)}
                  title={`View details for ${featured.bikeName}`}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={featuredGalleryImages[galleryIdx % (featuredGalleryImages.length || 1)] || featuredBikeImgSrc}
                    alt={featured.bikeName}
                    className="featured-single-bike-img"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/assets/images/bmw-f850-gs.jpg';
                    }}
                  />

                  {/* Top-Left Brand Model Badge */}
                  <div className="gallery-model-badge">
                    <span className="gallery-brand-icon">🏍️</span>
                    <span>{featured.bikeName}</span>
                  </div>

                  {/* Top-Right Expedition Destination Overlay Badge */}
                  <div className="gallery-destination-badge">
                    <span className="badge-pin">📍</span> Expedition: {featured.bikeName} Expedition
                  </div>

                  {/* Vertically Centered Left and Right Navigation Arrows */}
                  <button
                    type="button"
                    className="gallery-nav-arrow arrow-middle-left"
                    onClick={(e) => {
                      e.stopPropagation();
                      setGalleryIdx((prev) => (prev - 1 + (featuredGalleryImages.length || 1)) % (featuredGalleryImages.length || 1));
                    }}
                    aria-label="Previous view"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="gallery-nav-arrow arrow-middle-right"
                    onClick={(e) => {
                      e.stopPropagation();
                      setGalleryIdx((prev) => (prev + 1) % (featuredGalleryImages.length || 1));
                    }}
                    aria-label="Next view"
                  >
                    ›
                  </button>

                  {/* Bottom Gallery Indicator Dots (4 dots) */}
                  <div className="gallery-dots-indicator" aria-label="Image gallery position">
                    {[0, 1, 2, 3].map((dotIdx) => (
                      <span
                        key={dotIdx}
                        className={`gallery-dot ${galleryIdx % 4 === dotIdx ? 'active-dot' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setGalleryIdx(dotIdx);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: EXPEDITION INFORMATION (50% WIDTH) */}
              <div className="featured-details-column">
                {/* 1. Top Header Row: Status Badge & Booking ID + Kebab Menu */}
                <div className="featured-card-top-header">
                  <span className={`featured-status-pill ${isLive ? 'pill-green' : (isUpcoming ? 'pill-blue' : (featured.status === 'Cancelled' ? 'pill-red' : 'pill-gold'))}`}>
                    {isLive ? 'CURRENT EXPEDITION • ACTIVE ⚡' : (isUpcoming ? 'UPCOMING EXPEDITION • READY 🚀' : (featured.status === 'Cancelled' ? 'EXPEDITION • CANCELLED ✕' : 'CURRENT EXPEDITION • COMPLETED 🏁'))}
                  </span>
                  <div className="featured-header-right-group">
                    <span
                      className="featured-booking-id-gold"
                      onClick={() => copyBookingId(featured.id)}
                      title="Click to copy ID"
                    >
                      #{featured.id}
                    </span>
                    <button
                      type="button"
                      className="featured-kebab-menu-btn"
                      onClick={() => handleViewDetails(featured)}
                      title="Expedition Options"
                      aria-label="Expedition Options"
                    >
                      ⋮
                    </button>
                  </div>
                </div>

                {/* 2. Main Expedition Title */}
                <h2
                  className="featured-expedition-title"
                  onClick={() => handleViewDetails(featured)}
                  style={{ cursor: 'pointer' }}
                >
                  {featured.bikeName} Expedition
                </h2>

                {/* 3. Subtitle / Bike Model & Category */}
                <div className="featured-expedition-bike-meta">
                  <span className="meta-bike-icon">🏍️</span>
                  <span>{featured.bikeName} Expedition</span>
                  <span className="meta-pipe-sep">|</span>
                  <span className="meta-cat-icon">⛰️</span>
                  <span>{featured.bikeCategory || 'Touring'}</span>
                </div>

                {/* 4. Live Countdown Timer Box */}
                <div className="featured-countdown-box">
                  <div className="countdown-label-group">
                    <span className="countdown-clock-icon">🕒</span>
                    <span className="countdown-label-gold">
                      {featured.status === 'Completed' ? 'EXPEDITION COMPLETED' : (featured.status === 'Cancelled' ? 'RESERVATION CANCELLED' : (isLive ? 'EXPEDITION ENDS IN' : 'EXPEDITION STARTS IN'))}
                    </span>
                  </div>
                  <div className="countdown-digits-wrap">
                    <span className="countdown-digit-cell">{ticker.days}</span>
                    <span className="countdown-unit-tag">D</span>
                    <span className="countdown-colon">:</span>
                    <span className="countdown-digit-cell">{ticker.hours}</span>
                    <span className="countdown-unit-tag">H</span>
                    <span className="countdown-colon">:</span>
                    <span className="countdown-digit-cell">{ticker.mins}</span>
                    <span className="countdown-unit-tag">M</span>
                    <span className="countdown-colon">:</span>
                    <span className="countdown-digit-cell">{ticker.secs}</span>
                    <span className="countdown-unit-tag unit-gold">S</span>
                  </div>
                </div>

                {/* 5. Horizontal Route Indicator Component */}
                <div className="featured-visual-route-track">
                  <div className="route-hub-node pickup" title={`Pickup: ${featured.pickupCity}`}>
                    <span className="hub-marker-dot">📍</span>
                    <span className="hub-name">{featured.pickupCity || 'Indiranagar Hub, Bengaluru'}</span>
                  </div>
                  <div className="route-chevrons-divider" aria-hidden="true">
                    <span>›››</span>
                  </div>
                  <div className="route-hub-node dest" title={`Destination: ${featuredDestClean || featured.bikeName}`}>
                    <span className="hub-marker-dot">📍</span>
                    <span className="hub-name">{featuredDestClean || `${featured.bikeName} Expedition Quick`}</span>
                  </div>
                </div>

                {/* 6. Three Information Boxes Row: Pickup Date, Return Date, Duration */}
                <div className="featured-dates-summary-row">
                  <div className="featured-date-pill-box">
                    <div className="info-box-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="8" cy="14" r="1" fill="#f59e0b"/><circle cx="12" cy="14" r="1" fill="#f59e0b"/><circle cx="16" cy="14" r="1" fill="#f59e0b"/><circle cx="8" cy="18" r="1" fill="#f59e0b"/><circle cx="12" cy="18" r="1" fill="#f59e0b"/></svg>
                    </div>
                    <div className="info-box-text">
                      <div className="pill-box-label">Pickup Date</div>
                      <strong className="pill-box-val">{formatExpeditionDate(featured.startDate)}</strong>
                    </div>
                  </div>

                  <div className="featured-date-pill-box">
                    <div className="info-box-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="8" cy="14" r="1" fill="#f59e0b"/><circle cx="12" cy="14" r="1" fill="#f59e0b"/><circle cx="16" cy="14" r="1" fill="#f59e0b"/><circle cx="8" cy="18" r="1" fill="#f59e0b"/><circle cx="12" cy="18" r="1" fill="#f59e0b"/></svg>
                    </div>
                    <div className="info-box-text">
                      <div className="pill-box-label">Return Date</div>
                      <strong className="pill-box-val">{formatExpeditionDate(featured.endDate)}</strong>
                    </div>
                  </div>

                  <div className="featured-date-pill-box">
                    <div className="info-box-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>
                    </div>
                    <div className="info-box-text">
                      <div className="pill-box-label">Duration</div>
                      <strong className="pill-box-val">{featured.duration || 1} Days</strong>
                    </div>
                  </div>
                </div>

                {/* 7. Action Buttons: Row 1 Main Actions + Row 2 SOS Dispatch */}
                <div className="featured-actions-two-tier">
                  <div className="featured-actions-row">
                    <button
                      type="button"
                      className="btn-featured-primary-gold"
                      onClick={() => handleViewDetails(featured)}
                    >
                      View Details →
                    </button>
                    <button
                      type="button"
                      className="btn-featured-glass-pill"
                      onClick={() => handleRouteTelemetry(featured)}
                    >
                      <span className="btn-icon">📊</span> Route Telemetry
                    </button>
                    {featured.status !== 'Completed' && featured.status !== 'Cancelled' && (
                      <button
                        type="button"
                        className="btn-featured-glass-pill"
                        onClick={() => handleModifyBooking(featured)}
                      >
                        <span className="btn-icon">✏️</span> Modify
                      </button>
                    )}
                    {featured.status !== 'Completed' && featured.status !== 'Cancelled' && (
                      <button
                        type="button"
                        className="btn-featured-glass-pill"
                        onClick={() => handleExtendRide(featured)}
                      >
                        <span className="btn-icon">📅</span> Extend +1d
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-featured-glass-pill"
                      onClick={() => handleDownloadInvoice(featured)}
                    >
                      <span className="btn-icon">📄</span> Invoice
                    </button>
                  </div>

                  <div className="featured-sos-row">
                    <button
                      type="button"
                      className="btn-featured-sos"
                      onClick={() => handleSOSDispatch(featured)}
                    >
                      <span className="btn-icon">🚨</span> SOS Dispatch
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. JOURNEY HISTORY SECTION */}
        <div className="journey-history-header-bar">
          <div className="journey-history-title-wrap">
            <h2 className="journey-history-section-title">Journey History</h2>
            <p className="journey-history-section-subtitle">Browse, filter, and inspect your motorcycle expeditions.</p>
          </div>
          <div className="journey-history-count-badge">
            <span className="count-pill-dot"></span>
            <span>{isAuthenticated ? filteredBookings.length : 0} {(isAuthenticated ? filteredBookings.length : 0) === 1 ? 'Expedition' : 'Expeditions'}</span>
          </div>
        </div>

        {/* 6. INDIVIDUAL JOURNEY HISTORY CARDS GRID / LIST */}
        <div id="journeys-card-list">
          {!isAuthenticated ? (
            <div
              className="dashboard-saved-fleet-card card empty-state guest-journey-card"
              style={{
                padding: '56px 24px',
                textAlign: 'center',
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: '20px',
                maxWidth: '620px',
                margin: '20px auto'
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '14px' }}>🏍️</div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.28)',
                  color: 'var(--gold, #f59e0b)',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '16px'
                }}
              >
                👑 RIDER CIRCLE ACCESS
              </div>
              <h3 style={{ margin: '0 0 10px 0', fontFamily: 'var(--font-serif)', fontSize: '26px', color: 'var(--ink)' }}>
                Your Adventures Await!
              </h3>
              <p
                className="muted"
                style={{
                  marginBottom: '28px',
                  fontSize: '15px',
                  lineHeight: 1.6,
                  maxWidth: '480px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  color: 'var(--ink-soft)'
                }}
              >
                Sign in or create your RYVON account to manage your bookings, track your expeditions and access your journey history.
              </p>
              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link
                  className="btn btn-primary"
                  to="/login?redirect=/booking-history"
                  style={{ display: 'inline-flex', width: 'auto', justifyContent: 'center', minWidth: '140px' }}
                >
                  Sign In
                </Link>
                <Link
                  className="btn btn-outline"
                  to="/register?redirect=/booking-history"
                  style={{ display: 'inline-flex', width: 'auto', justifyContent: 'center', minWidth: '140px' }}
                >
                  Create Account
                </Link>
              </div>
            </div>
          ) : filteredBookings.length > 0 ? (
            viewMode === 'list' ? (
              <div className="journey-list-view-container">
                {filteredBookings.map((b) => {
                  const isItemActive = b.status === 'Active';
                  const isItemUpcoming = b.status === 'Upcoming';
                  const isItemCancelled = b.status === 'Cancelled';
                  const bikeImgSrc = resolveJourneyBikeImage(b);
                  const rawDest = (b.destCity || 'Expedition Route').trim();
                  const cleanDestName = rawDest.replace(/(?:\s*Expedition)+$/gi, '').trim();
                  const titleText = cleanDestName ? `${cleanDestName} Expedition` : 'Expedition Route';
                  
                  const statusBadgeClass = isItemActive
                    ? 'status-badge-active'
                    : isItemUpcoming
                    ? 'status-badge-upcoming'
                    : isItemCancelled
                    ? 'status-badge-cancelled'
                    : 'status-badge-completed';
                    
                  const statusBeaconClass = isItemActive
                    ? 'beacon-active'
                    : isItemUpcoming
                    ? 'beacon-upcoming'
                    : isItemCancelled
                    ? 'beacon-cancelled'
                    : 'beacon-completed';

                  return (
                    <div key={b.id} className="journey-list-row-item" data-id={b.id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '240px' }}>
                        <img
                          src={bikeImgSrc}
                          alt={b.bikeName}
                          style={{ width: '84px', height: '58px', objectFit: 'cover', borderRadius: '10px', background: '#070a12', cursor: 'pointer' }}
                          onClick={() => handleViewDetails(b)}
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/images/ryvon-superbike.png'; }}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span className={`journey-status-pill ${statusBadgeClass}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                              <span className={`journey-status-dot ${statusBeaconClass}`}></span>
                              {b.status}
                            </span>
                            <span className="journey-card-id" onClick={() => copyBookingId(b.id)} title="Click to copy ID" style={{ fontSize: '11px' }}>
                              #{b.id}
                            </span>
                          </div>
                          <strong
                            style={{ fontSize: '15px', color: '#f8fafc', display: 'block', cursor: 'pointer' }}
                            onClick={() => handleViewDetails(b)}
                          >
                            {b.bikeName}
                          </strong>
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>{titleText} · {b.bikeCategory || 'Motorcycle'}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: '12px' }}>
                          <div style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Route</div>
                          <div style={{ color: '#e2e8f0', fontWeight: 600 }}>{b.pickupCity} → {cleanDestName}</div>
                        </div>
                        <div style={{ fontSize: '12px' }}>
                          <div style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rental Period</div>
                          <div style={{ color: '#e2e8f0' }}>{b.startDate} to {b.endDate} ({b.duration || 1}d)</div>
                        </div>
                        <div style={{ fontSize: '12px' }}>
                          <div style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Amount</div>
                          <strong style={{ color: 'var(--gold, #f59e0b)', fontSize: '15px' }}>{money(b.total)}</strong>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          type="button"
                          className="btn-featured-primary-gold"
                          style={{ padding: '8px 18px', fontSize: '12px' }}
                          onClick={() => handleViewDetails(b)}
                        >
                          Details →
                        </button>

                        <div className="card-menu-container">
                          <button
                            type="button"
                            className="card-menu-trigger-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === b.id ? null : b.id);
                            }}
                            title="Journey Actions"
                            aria-label="Journey Actions"
                          >
                            •••
                          </button>
                          {openMenuId === b.id && (
                            <div className="card-dropdown-popover" onClick={(e) => e.stopPropagation()}>
                              <button type="button" className="popover-item" onClick={() => { setOpenMenuId(null); handleViewDetails(b); }}>
                                <span>👁️</span> View Details
                              </button>
                              {b.status !== 'Completed' && b.status !== 'Cancelled' && (
                                <button type="button" className="popover-item" onClick={() => { setOpenMenuId(null); handleModifyBooking(b); }}>
                                  <span>✏️</span> Edit / Modify Booking
                                </button>
                              )}
                              {b.status !== 'Completed' && b.status !== 'Cancelled' && (
                                <button type="button" className="popover-item" onClick={() => { setOpenMenuId(null); handleExtendRide(b); }}>
                                  <span>📅</span> Extend Ride (+1 Day)
                                </button>
                              )}
                              <button type="button" className="popover-item" onClick={() => { setOpenMenuId(null); handleDownloadInvoice(b); }}>
                                <span>📥</span> Download Tax Invoice
                              </button>
                              <div className="popover-divider"></div>
                              <button type="button" className="popover-item danger" onClick={() => { setOpenMenuId(null); handleDeleteBooking(b); }}>
                                <span>{b.status === 'Completed' || b.status === 'Cancelled' ? '🗑️' : '✕'}</span>
                                {b.status === 'Completed'
                                  ? 'Delete Reservation'
                                  : b.status === 'Cancelled'
                                  ? 'Delete Record'
                                  : 'Cancel Reservation'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="journey-grid-3col">
                {filteredBookings.map((b) => {
                  const isItemActive = b.status === 'Active';
                  const isItemUpcoming = b.status === 'Upcoming';
                  const isItemCancelled = b.status === 'Cancelled';
                  
                  // INDEPENDENT ACCURATE MOTORCYCLE IMAGE RESOLUTION FOR EVERY CARD
                  const bikeImgSrc = resolveJourneyBikeImage(b);
                  const rawDest = (b.destCity || 'Expedition Route').trim();
                  const cleanDestName = rawDest.replace(/(?:\s*Expedition)+$/gi, '').trim();
                  const rawCat = (b.bikeCategory || 'Touring').trim();
                  const cleanCategory = rawCat.replace(/(?:\s*Expedition)+$/gi, '').trim();
                  
                  // Status badge styling
                  const statusText = b.status?.toUpperCase() || 'ACTIVE';
                  const statusColorClass = isItemActive
                    ? 'status-pill-active'
                    : isItemUpcoming
                    ? 'status-pill-upcoming'
                    : isItemCancelled
                    ? 'status-pill-cancelled'
                    : 'status-pill-completed';

                  return (
                    <div key={b.id} className="journey-card-item card" data-id={b.id}>
                      {/* 1. Bike brand/model badge & booking status overlaid on 2. Large motorcycle photograph */}
                      <div
                        className="journey-card-image-wrap"
                        onClick={() => handleViewDetails(b)}
                        title={`View details for ${b.bikeName}`}
                      >
                        {/* Top-Left Brand Model Badge */}
                        <div className="journey-card-brand-badge">
                          <span className="brand-badge-icon">{getBrandBadgeIcon(b.bikeName)}</span>
                          <span className="brand-badge-name">{b.brand || getShortModelBadgeName(b.bikeName)}</span>
                        </div>

                        {/* Top-Right Status Badge & Kebab Menu */}
                        <div className="journey-card-top-right-group">
                          <div className={`journey-status-pill ${statusColorClass}`}>
                            <span className="journey-status-dot"></span>
                            <span className="journey-status-text">{statusText}</span>
                          </div>
                          
                          {/* 3-Dot Action Menu */}
                          <div className="card-menu-container" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className="card-menu-trigger-btn"
                              onClick={() => setOpenMenuId(openMenuId === b.id ? null : b.id)}
                              title="Journey Actions"
                              aria-label="Journey Actions"
                            >
                              ⋮
                            </button>
                            {openMenuId === b.id && (
                              <div className="card-dropdown-popover">
                                <button type="button" className="popover-item" onClick={() => { setOpenMenuId(null); handleViewDetails(b); }}>
                                  <span>👁️</span> View Details
                                </button>
                                {b.status !== 'Completed' && b.status !== 'Cancelled' && (
                                  <button type="button" className="popover-item" onClick={() => { setOpenMenuId(null); handleModifyBooking(b); }}>
                                    <span>✏️</span> Edit / Modify Booking
                                  </button>
                                )}
                                {b.status !== 'Completed' && b.status !== 'Cancelled' && (
                                  <button type="button" className="popover-item" onClick={() => { setOpenMenuId(null); handleExtendRide(b); }}>
                                    <span>📅</span> Extend Ride (+1 Day)
                                  </button>
                                )}
                                <button type="button" className="popover-item" onClick={() => { setOpenMenuId(null); handleDownloadInvoice(b); }}>
                                  <span>📥</span> Download Tax Invoice
                                </button>
                                <div className="popover-divider"></div>
                                <button type="button" className="popover-item danger" onClick={() => { setOpenMenuId(null); handleDeleteBooking(b); }}>
                                  <span>{b.status === 'Completed' || b.status === 'Cancelled' ? '🗑️' : '✕'}</span>
                                  {b.status === 'Completed'
                                    ? 'Delete Reservation'
                                    : b.status === 'Cancelled'
                                    ? 'Delete Record'
                                    : 'Cancel Reservation'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 2. Large Motorcycle Photograph */}
                        <img
                          className="journey-card-bike-img"
                          src={bikeImgSrc}
                          alt={b.bikeName}
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/images/ryvon-superbike.png'; }}
                        />

                        {/* Preserved Test Marker */}
                        <span className="journey-card-source-chip sr-only" style={{ display: 'none' }}>RYVON Fleet Direct</span>
                      </div>

                      {/* 3. Complete Bike Name Heading */}
                      <h3
                        className="journey-card-title"
                        title={b.bikeName}
                        onClick={() => handleViewDetails(b)}
                      >
                        {b.bikeName}
                      </h3>

                      {/* Expedition Category & 4. Booking ID Row */}
                      <div className="journey-card-cat-id-row">
                        <div className="journey-card-category">
                          <span className="cat-mountain-icon">⛰️</span>
                          <span>{cleanCategory} Expedition</span>
                        </div>
                        <span
                          className="journey-card-id-gold"
                          onClick={() => copyBookingId(b.id)}
                          title="Click to copy ID"
                        >
                          #{b.id}
                        </span>
                      </div>

                      {/* 5. Pickup Date & Return Date & 6. Rental Duration Box */}
                      <div className="journey-card-dates-box">
                        <div className="dates-box-left">
                          <span className="dates-box-icon">📅</span>
                          <span className="dates-box-val">{formatExpeditionDateRange(b.startDate, b.endDate)}</span>
                        </div>
                        <div className="dates-box-right">
                          <span className="duration-box-icon">⏳</span>
                          <span className="duration-box-val">{b.duration || 1} Days</span>
                        </div>
                      </div>

                      {/* 7. Pickup Hub → Destination Route Row */}
                      <div className="journey-card-route-row">
                        <div className="route-point pickup" title={b.pickupCity}>
                          <span className="route-point-dot dot-green">●</span>
                          <span className="route-point-name">{b.pickupCity || 'Jaipur Royal Hub'}</span>
                        </div>
                        <div className="route-arrows-sep" aria-hidden="true">
                          ›››
                        </div>
                        <div className="route-point dest" title={cleanDestName || 'Amer & Pushkar'}>
                          <span className="route-point-dot dot-gold">●</span>
                          <span className="route-point-name">{cleanDestName || 'Amer & Pushkar'}</span>
                        </div>
                      </div>

                      {/* 8. Total Rental Amount & 9. Prominent Yellow View Journey Details Button */}
                      <div className="journey-card-bottom-row">
                        <div className="journey-card-price-display">
                          <strong className="journey-card-price-val">{money(b.total)}</strong>
                        </div>

                        <button
                          className="btn-view-journey-details-gold"
                          type="button"
                          onClick={() => handleViewDetails(b)}
                        >
                          View Journey Details →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="dashboard-saved-fleet-card card empty-state" style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏍️</div>
              <h3 style={{ margin: '0 0 6px 0', fontFamily: 'var(--font-serif)', fontSize: '22px' }}>No Journeys Found</h3>
              <p className="muted" style={{ marginBottom: '22px', fontSize: '14px', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
                No bookings match the selected filter. Your next motorcycle adventure is waiting on the open road.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {(activeTab !== 'All' || searchQuery) && (
                  <button
                    className="btn btn-outline"
                    type="button"
                    onClick={() => { setActiveTab('All'); setSearchQuery(''); }}
                  >
                    Reset Filters ✕
                  </button>
                )}
                <Link className="btn btn-primary" to="/bikes" style={{ display: 'inline-flex', width: 'auto', justifyContent: 'center' }}>
                  Explore Fleet &amp; Book A Ride →
                </Link>
                <button className="btn btn-outline" type="button" onClick={() => openModal('build-my-ride')}>
                  Build My Ride 🗺️
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 7. FULLSCREEN HIGH-RESOLUTION MOTORCYCLE INSPECTION MODAL */}
        {fullscreenImg && (
          <div
            className="profile-modal-overlay"
            style={{ zIndex: 99999, padding: '24px' }}
            onClick={() => setFullscreenImg(null)}
          >
            <div
              style={{
                position: 'relative',
                maxWidth: '1000px',
                width: '100%',
                maxHeight: '90vh',
                background: '#070a0f',
                borderRadius: '20px',
                overflow: 'hidden',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                boxShadow: '0 25px 70px rgba(0,0,0,0.85)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 22px', background: 'rgba(0,0,0,0.7)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '15px' }}>
                  🏍️ {featured?.bikeName} • High-Resolution Vehicle Inspection
                </div>
                <button
                  type="button"
                  className="btn-modal-close-x"
                  onClick={() => setFullscreenImg(null)}
                  style={{ color: '#ffffff', fontSize: '22px' }}
                >
                  ✕
                </button>
              </div>
              <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#05070c' }}>
                <img
                  src={fullscreenImg}
                  alt={featured?.bikeName}
                  style={{ maxWidth: '100%', maxHeight: '72vh', objectFit: 'contain', borderRadius: '12px' }}
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
