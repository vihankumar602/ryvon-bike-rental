import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { useBookings } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { bikes, getBikeImage } from '../../data/bikes';
import {
  getTodayDateString,
  getMinReturnDate,
  addDays,
  validateBookingDates
} from '../../utils/dateValidation';

const CITIES = [
  'Indiranagar Hub, Bengaluru',
  'Koramangala Hub, Bengaluru',
  'Chandigarh Base Hub',
  'Manali Base Hub',
  'Dehradun Base Hub',
  'Goa Coastal Hub',
  'Jaipur Base Hub',
  'Delhi City Hub'
];

const CATEGORIES = [
  'All',
  'Adventure',
  'Touring',
  'Cruiser',
  'Sport',
  'Roadster',
  'Scooter'
];

export default function QuickBookModal({ bike: propBike }) {
  const { closeModal, openModal } = useModal();
  const { money } = useCurrency();
  const { toast } = useToast();
  const { addBooking } = useBookings();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fleetScrollRef = useRef(null);

  const today = getTodayDateString();
  const defaultReturn = addDays(today, 3);

  const [pickupCity, setPickupCity] = useState(CITIES[0]);
  const [selectedCategory, setSelectedCategory] = useState(propBike?.type || 'All');
  const [selectedBikeId, setSelectedBikeId] = useState(() => propBike?.id || 'scrambler400x');

  const [pickupDate, setPickupDate] = useState(today);
  const [returnDate, setReturnDate] = useState(defaultReturn);
  const [timeslot, setTimeslot] = useState('09:00 AM');

  // Angle index for 3 thumbnails (0: Side Profile, 1: Front Perspective, 2: Rear Angle)
  const [activeAngle, setActiveAngle] = useState(0);

  // Date validation
  const dateValidation = useMemo(() => {
    return validateBookingDates(pickupDate, returnDate);
  }, [pickupDate, returnDate]);

  const minReturn = getMinReturnDate(pickupDate);

  const handlePickupChange = (newPickup) => {
    setPickupDate(newPickup);
    if (returnDate <= newPickup) {
      setReturnDate(getMinReturnDate(newPickup));
    }
  };

  const handleReturnChange = (newReturn) => {
    setReturnDate(newReturn);
  };

  // Filter available bikes by category
  const availableBikes = useMemo(() => {
    if (selectedCategory === 'All') return bikes;
    return bikes.filter(b => b.type === selectedCategory);
  }, [selectedCategory]);

  // Keep selected bike valid if category changes
  const activeBike = useMemo(() => {
    const found = availableBikes.find(b => b.id === selectedBikeId);
    if (found) return found;
    return availableBikes[0] || bikes[0];
  }, [availableBikes, selectedBikeId]);

  const durationDays = dateValidation.isValid ? dateValidation.days : 0;
  const rentalSubtotal = activeBike.price * (durationDays || 1);
  const deposit = activeBike.deposit || 4000;
  const estimatedTotal = rentalSubtotal + deposit;

  // Handle angle rotation
  const handlePrevAngle = (e) => {
    e.stopPropagation();
    setActiveAngle((prev) => (prev - 1 + 3) % 3);
  };

  const handleNextAngle = (e) => {
    e.stopPropagation();
    setActiveAngle((prev) => (prev + 1) % 3);
  };

  // Navigation handlers
  const handleCustomizeCheckout = () => {
    if (!dateValidation.isValid) {
      toast(dateValidation.error || 'Please select valid rental dates.');
      return;
    }

    closeModal();
    const params = new URLSearchParams({
      bike: activeBike.id,
      city: pickupCity,
      start: pickupDate,
      end: returnDate,
      days: String(durationDays),
      slot: timeslot,
      step: '2'
    });
    const targetUrl = `/booking?${params.toString()}`;

    if (!isAuthenticated) {
      const pendingBooking = {
        bikeId: activeBike.id,
        bikeName: activeBike.name,
        bikeImage: bikeImgSrc,
        startDate: pickupDate,
        endDate: returnDate,
        pickupHub: pickupCity,
        pickupCity,
        timeslot,
        duration: durationDays,
        redirectUrl: targetUrl
      };
      sessionStorage.setItem('ryvon-pending-booking', JSON.stringify(pendingBooking));

      openModal('authRequired', {
        title: 'Your Ride Awaits!',
        description: 'Please sign in or create your RYVON account to continue with your motorcycle booking and secure your ride.',
        redirectUrl: targetUrl,
        cancelText: 'Continue Exploring'
      });
      return;
    }

    navigate(targetUrl);
  };

  const handleInstantConfirm = () => {
    if (!dateValidation.isValid) {
      toast(dateValidation.error || 'Please select valid rental dates.');
      return;
    }

    closeModal();
    const params = new URLSearchParams({
      bike: activeBike.id,
      city: pickupCity,
      start: pickupDate,
      end: returnDate,
      days: String(durationDays),
      slot: timeslot,
      step: '2'
    });
    const targetUrl = `/booking?${params.toString()}`;

    if (!isAuthenticated) {
      const pendingBooking = {
        bikeId: activeBike.id,
        bikeName: activeBike.name,
        bikeImage: bikeImgSrc,
        startDate: pickupDate,
        endDate: returnDate,
        pickupHub: pickupCity,
        pickupCity,
        timeslot,
        duration: durationDays,
        redirectUrl: targetUrl
      };
      sessionStorage.setItem('ryvon-pending-booking', JSON.stringify(pendingBooking));

      openModal('authRequired', {
        title: 'Your Ride Awaits!',
        description: 'Please sign in or create your RYVON account to continue with your motorcycle booking and secure your ride.',
        redirectUrl: targetUrl,
        cancelText: 'Continue Exploring'
      });
      return;
    }

    toast(`⚡ Quick Book: Add extras or proceed to payment for ${activeBike.name}...`);
    navigate(targetUrl);
  };

  // Scroll horizontal fleet cards
  const scrollFleetRight = () => {
    if (fleetScrollRef.current) {
      fleetScrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const bikeImgSrc = getBikeImage(activeBike);

  return (
    <div
      className="modal quick-book-modal"
      onClick={e => e.stopPropagation()}
      aria-label="Quick Book Express Reservation"
    >
      {/* =========================================================================
          LEFT PANEL: MOTORCYCLE SHOWCASE (42% WIDTH, CINEMATIC MOUNTAIN SUNSET)
          ========================================================================= */}
      <div className="qb-left-showcase">
        {/* Dark Scrim Overlays for Superior Legibility */}
        <div className="qb-scrim-top" aria-hidden="true"></div>
        <div className="qb-scrim-bottom" aria-hidden="true"></div>

        <div className="qb-left-inner-content">
          {/* Top Badge & Header */}
          <div className="qb-showcase-header">
            <div className="qb-badge-pill-row">
              <span className="qb-badge-mode">
                ⚡ 1-CLICK QUICK BOOK MODE
              </span>
              <span className="qb-badge-tag">
                EXPRESS FLEET RESERVATION
              </span>
            </div>

            <h2 className="qb-showcase-main-title">
              Express Motorcycle<br />
              <span className="qb-title-gold-accent">Reservation</span>
            </h2>

            <p className="qb-showcase-subtitle">
              Pick your ride, set your dates, and hit the road instantly.
            </p>
          </div>

          {/* Central Motorcycle Stage with 360° and Navigation Controls */}
          <div className="qb-showcase-stage">
            {/* 360° Viewing Interactive Indicator Button */}
            <button
              type="button"
              className="qb-360-indicator-btn"
              onClick={() => openModal('bike360', { bikeId: activeBike.id })}
              title="Open 360° Immersive Studio"
              aria-label="Open 360° Immersive Studio"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              <span>360°</span>
            </button>

            {/* Previous Arrow */}
            <button
              type="button"
              className="qb-stage-arrow-btn qb-arrow-left"
              onClick={handlePrevAngle}
              aria-label="Previous bike view"
            >
              ‹
            </button>

            {/* Large Prominent Motorcycle Image */}
            <div className="qb-bike-img-wrap">
              <img
                src={bikeImgSrc}
                alt={activeBike.name}
                className={`qb-showcase-bike-img angle-${activeAngle}`}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/assets/images/ryvon-superbike.png';
                }}
              />
            </div>

            {/* Next Arrow */}
            <button
              type="button"
              className="qb-stage-arrow-btn qb-arrow-right"
              onClick={handleNextAngle}
              aria-label="Next bike view"
            >
              ›
            </button>
          </div>

          {/* 3 Image Thumbnails */}
          <div className="qb-thumbnails-bar" role="tablist" aria-label="Motorcycle View Angles">
            {[0, 1, 2].map((idx) => {
              const isSelected = activeAngle === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  className={`qb-thumb-card ${isSelected ? 'active-thumb' : ''}`}
                  onClick={() => setActiveAngle(idx)}
                  title={`View Angle ${idx + 1}`}
                >
                  <img
                    src={bikeImgSrc}
                    alt={`${activeBike.name} angle ${idx + 1}`}
                    className={`qb-thumb-img thumb-angle-${idx}`}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/assets/images/ryvon-superbike.png';
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* Bottom Vehicle Identity & Technical Specifications */}
          <div className="qb-showcase-footer">
            <div className="qb-identity-block">
              {/* Brand Logo Shield / Emblem */}
              <div className="qb-brand-emblem-wrap">
                <svg width="34" height="34" viewBox="0 0 100 90" fill="none" aria-hidden="true">
                  <polygon points="50,85 10,15 90,15" fill="rgba(11, 15, 23, 0.75)" stroke="#ffffff" strokeWidth="5" />
                  <path d="M 28 36 L 72 36 M 50 36 L 50 68" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
                  <text x="50" y="27" fill="#ffffff" fontSize="11" fontWeight="900" textAnchor="middle" letterSpacing="0.8">
                    {(activeBike.brand || 'TRIUMPH').toUpperCase()}
                  </text>
                </svg>
              </div>

              <div className="qb-identity-text">
                <span className="qb-category-badge">
                  {(activeBike.type || 'Adventure').toUpperCase()}
                </span>
                <h3 className="qb-model-title">
                  {activeBike.name}
                </h3>
              </div>
            </div>

            {/* 3-Column Specification Row with Golden Highlights */}
            <div className="qb-specs-grid">
              <div className="qb-spec-box">
                <div className="qb-spec-icon-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 10h10M7 14h6"/></svg>
                </div>
                <div>
                  <div className="qb-spec-value">{activeBike.engine || '398 cc'}</div>
                  <div className="qb-spec-label">Engine</div>
                </div>
              </div>

              <div className="qb-spec-box">
                <div className="qb-spec-icon-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                <div>
                  <div className="qb-spec-value">{activeBike.power || '40 PS'}</div>
                  <div className="qb-spec-label">Power</div>
                </div>
              </div>

              <div className="qb-spec-box">
                <div className="qb-spec-icon-wrap">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </div>
                <div>
                  <div className="qb-spec-value">{activeBike.transmission || 'Manual'}</div>
                  <div className="qb-spec-label">Transmission</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          RIGHT PANEL: BOOKING INTERFACE (58% WIDTH, CRISP LUXURY WHITE THEME)
          ========================================================================= */}
      <div className="qb-right-booking">
        {/* Top-Right Round Close Button */}
        <button
          className="qb-modal-close-round-btn"
          type="button"
          onClick={closeModal}
          aria-label="Close Quick Book Modal"
        >
          ✕
        </button>

        {/* 1. PICKUP HUB STATION & CATEGORY FILTER */}
        <div className="qb-form-row-hub-cat">
          <div className="qb-field-group">
            <label className="qb-field-label">
              <span className="qb-label-icon icon-red">📍</span> PICKUP HUB STATION
            </label>
            <div className="qb-select-container">
              <select
                className="qb-custom-select"
                value={pickupCity}
                onChange={(e) => setPickupCity(e.target.value)}
              >
                {CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <span className="qb-chevron-arrow">▾</span>
            </div>
          </div>

          <div className="qb-field-group">
            <label className="qb-field-label">
              <span className="qb-label-icon icon-gold">🏷️</span> CATEGORY FILTER
            </label>
            <div className="qb-select-container">
              <select
                className="qb-custom-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Vehicle Categories' : cat}
                  </option>
                ))}
              </select>
              <span className="qb-chevron-arrow">▾</span>
            </div>
          </div>
        </div>

        {/* 2. PICKUP DATE, RETURN DATE & HANDOVER SLOT */}
        <div className="qb-form-row-dates-slot">
          <div className="qb-field-group">
            <label className="qb-field-label">
              <span className="qb-label-icon icon-purple">📅</span> PICKUP DATE
            </label>
            <div className="qb-input-wrap">
              <input
                type="date"
                className="qb-custom-input qb-date-input"
                min={today}
                value={pickupDate}
                onChange={e => handlePickupChange(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="qb-field-group">
            <label className="qb-field-label">
              <span className="qb-label-icon icon-purple">📅</span> RETURN DATE
            </label>
            <div className="qb-input-wrap">
              <input
                type="date"
                className="qb-custom-input qb-date-input"
                min={minReturn}
                value={returnDate}
                onChange={e => handleReturnChange(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="qb-field-group">
            <label className="qb-field-label">
              <span className="qb-label-icon icon-red">⏰</span> HANDOVER SLOT
            </label>
            <div className="qb-select-container">
              <select
                className="qb-custom-select"
                value={timeslot}
                onChange={e => setTimeslot(e.target.value)}
              >
                <option value="09:00 AM">09:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="06:00 PM">06:00 PM</option>
              </select>
              <span className="qb-chevron-arrow">▾</span>
            </div>
          </div>
        </div>

        {/* 3. RENTAL VALIDITY MESSAGE & DURATION BADGE */}
        <div className="qb-validity-status-strip">
          <div className="qb-validity-text">
            {dateValidation.isValid ? (
              <>
                <span className="qb-check-symbol">✓</span>
                <span>
                  Valid rental window: <strong>{pickupDate}</strong> to <strong>{returnDate}</strong>
                </span>
              </>
            ) : (
              <span className="qb-error-text">
                ⚠️ {dateValidation.error || 'Please select valid rental dates.'}
              </span>
            )}
          </div>

          {dateValidation.isValid && (
            <div className="qb-duration-green-pill">
              <span className="qb-cal-icon">📅</span>
              <span>{durationDays} Day{durationDays === 1 ? '' : 's'} Duration</span>
            </div>
          )}
        </div>

        {/* 4. AVAILABLE FLEET HEADING & SELECTED MODEL */}
        <div className="qb-fleet-header-row">
          <div className="qb-fleet-headline">
            AVAILABLE FLEET ({availableBikes.length} MODELS IN ALL)
          </div>
          <div className="qb-fleet-selected-tag">
            Selected: <span className="qb-selected-name">{activeBike.name}</span>
          </div>
        </div>

        {/* 5. HORIZONTAL MOTORCYCLE SELECTION CARDS CAROUSEL */}
        <div className="qb-fleet-carousel-container">
          <div className="qb-fleet-cards-track" ref={fleetScrollRef}>
            {availableBikes.map(b => {
              const isSelected = activeBike.id === b.id;
              return (
                <div
                  key={b.id}
                  className={`qb-fleet-item-card ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => setSelectedBikeId(b.id)}
                  title={`Select ${b.name}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedBikeId(b.id);
                    }
                  }}
                >
                  {/* Selected Gold Checkmark Badge */}
                  {isSelected && (
                    <div className="qb-card-selected-badge">✓</div>
                  )}

                  <div className="qb-card-thumb-wrap">
                    <img
                      src={getBikeImage(b)}
                      alt={b.name}
                      className="qb-card-thumb-img"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/assets/images/ryvon-superbike.png';
                      }}
                    />
                  </div>

                  <div className="qb-card-details">
                    <div className="qb-card-bike-title" title={b.name}>
                      {b.name}
                    </div>
                    <div className="qb-card-bike-rate">
                      {money(b.price)}/day
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Browse Arrow Button */}
          <button
            type="button"
            className="qb-fleet-scroll-arrow-btn"
            onClick={scrollFleetRight}
            aria-label="Scroll Fleet Carousel"
          >
            ›
          </button>
        </div>

        {/* 6. BOOKING SUMMARY CARD */}
        <div className="qb-booking-summary-card">
          <div className="qb-summary-card-header">
            <span className="qb-summary-clipboard-icon">📋</span>
            <span className="qb-summary-heading-text">Booking Summary</span>
          </div>

          <div className="qb-summary-row">
            <div className="qb-summary-row-label">
              <span className="qb-row-icon">📅</span> Rental Duration
            </div>
            <div className="qb-summary-row-calc">
              {durationDays} Day{durationDays === 1 ? '' : 's'} × {money(activeBike.price)}
            </div>
            <div className="qb-summary-row-amount">
              {money(rentalSubtotal)}
            </div>
          </div>

          <div className="qb-summary-row qb-deposit-row">
            <div className="qb-summary-row-label">
              <span className="qb-row-icon">🛡️</span> Refundable Security Deposit (100% Escrow)
            </div>
            <div className="qb-summary-row-amount">
              {money(deposit)}
            </div>
          </div>

          <div className="qb-summary-total-footer">
            <div className="qb-total-label-text">
              Estimated Total Payable
            </div>
            <div className="qb-total-amount-display">
              {money(estimatedTotal)}
            </div>
          </div>
        </div>

        {/* 7. BOTTOM ACTION BUTTONS */}
        <div className="qb-bottom-action-buttons">
          <button
            type="button"
            className="qb-btn-customize-gear"
            onClick={handleCustomizeCheckout}
            disabled={!dateValidation.isValid}
          >
            <span className="qb-btn-icon">⚙️</span>
            <span>Customize &amp; Add Gear →</span>
          </button>

          <button
            type="button"
            className="qb-btn-instant-confirm"
            onClick={handleInstantConfirm}
            disabled={!dateValidation.isValid}
          >
            <span className="qb-btn-icon">⚡</span>
            <span>Instant 1-Click Confirm ({money(estimatedTotal)})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
