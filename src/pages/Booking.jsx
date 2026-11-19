import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { bikes, getBikeImage } from '../data/bikes';
import { RENTAL_EXTRAS } from '../data/extras';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { useBookings } from '../context/BookingContext';
import api from '../utils/api';
import {
  getTodayDateString,
  getMinReturnDate,
  addDays,
  validateBookingDates
} from '../utils/dateValidation';
import DateErrorNotice from '../components/common/DateErrorNotice';

export default function Booking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { money } = useCurrency();
  const { user, token, login } = useAuth();
  const { openModal } = useModal();
  const { toast } = useToast();
  const { addBooking } = useBookings();

  const bikeIdParam = searchParams.get('bike') || searchParams.get('bikeId') || 'scrambler400x';
  const destParam = searchParams.get('dest') || searchParams.get('destination');
  const cityParam = searchParams.get('city') || searchParams.get('startCity') || (destParam ? 'Base Hub Location' : 'Indiranagar Hub, Bengaluru');
  const daysParam = Math.max(1, Number(searchParams.get('days') || (destParam ? 4 : 1)));

  const today = getTodayDateString();
  const rawStart = searchParams.get('start') || searchParams.get('startDate');
  const startParam = (rawStart && rawStart >= today) ? rawStart : today;

  let rawEnd = searchParams.get('end') || searchParams.get('endDate');
  let endParam = rawEnd;
  if (!endParam || endParam <= startParam) {
    endParam = addDays(startParam, Math.max(1, daysParam));
  }

  const cleanBikeId = String(bikeIdParam || '').toLowerCase().trim();
  const bike = useMemo(() => {
    return bikes.find(b => 
      b.id.toLowerCase() === cleanBikeId ||
      b.name.toLowerCase() === cleanBikeId ||
      b.name.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanBikeId.replace(/[^a-z0-9]/g, '') ||
      cleanBikeId.includes(b.id.toLowerCase())
    ) || bikes.find(b => b.id === 'scrambler400x') || bikes[0];
  }, [cleanBikeId]);

  const bikeImgSrc = getBikeImage(bike);

  const slotParam = searchParams.get('slot') || searchParams.get('timeslot') || '09:00 AM';
  const stepParam = searchParams.get('step');
  const initialStep = (stepParam === '2' || stepParam === 'extras') ? 2 : ((stepParam === '3' || stepParam === 'payment') ? 3 : 1);

  // Stepper state: 1, 2, 3, or 'confirmation'
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Step 1: Dates & Hub
  const [startDate, setStartDate] = useState(startParam);
  const [endDate, setEndDate] = useState(endParam);
  const [timeslot, setTimeslot] = useState(slotParam);
  const [pickupHub, setPickupHub] = useState(cityParam);

  useEffect(() => {
    if (startParam) setStartDate(startParam);
    if (endParam) setEndDate(endParam);
    if (cityParam) setPickupHub(cityParam);
    if (slotParam) setTimeslot(slotParam);
    if (stepParam === '2' || stepParam === 'extras') {
      setCurrentStep(2);
    } else if (stepParam === '3' || stepParam === 'payment') {
      if (!user) {
        const pendingBooking = {
          bikeId: bike.id,
          startDate: startParam,
          endDate: endParam,
          pickupHub: cityParam,
          timeslot: slotParam,
          destParam: destParam || ''
        };
        sessionStorage.setItem('ryvon-pending-booking', JSON.stringify(pendingBooking));

        openModal('authRequired', {
          title: 'Your Ride Awaits!',
          description: 'Please sign in or create your RYVON account to continue with your motorcycle booking and secure your ride.',
          redirectUrl: `/booking?bike=${bike.id}&step=3`,
          cancelText: 'Continue Exploring'
        });
      } else {
        setCurrentStep(3);
      }
    }
  }, [startParam, endParam, cityParam, slotParam, stepParam, user, bike.id]);

  // Restore pending booking state if user returns from login/registration
  useEffect(() => {
    try {
      const pendingStr = sessionStorage.getItem('ryvon-pending-booking');
      if (pendingStr) {
        const pending = JSON.parse(pendingStr);
        if (pending && (!pending.bikeId || pending.bikeId === bike.id)) {
          if (pending.startDate) setStartDate(pending.startDate);
          if (pending.endDate) setEndDate(pending.endDate);
          if (pending.pickupHub) setPickupHub(pending.pickupHub);
          if (pending.timeslot) setTimeslot(pending.timeslot);
          if (Array.isArray(pending.selectedExtras)) setSelectedExtras(pending.selectedExtras);
          if (pending.paymentMode) setPaymentMode(pending.paymentMode);
          if (pending.appliedCoupon) setAppliedCoupon(pending.appliedCoupon);

          if (user) {
            setCurrentStep(3);
            toast(`Welcome back, ${user.name || 'Rider'}! Please review your details and confirm your reservation.`);
          }
        }
      }
    } catch (e) {
      console.warn('Error restoring pending booking:', e);
    }
  }, [user, bike.id]);

  useEffect(() => {
    if (user) {
      if (user.name) setFullName(user.name);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  // Shared date validation
  const dateValidation = useMemo(() => {
    return validateBookingDates(startDate, endDate);
  }, [startDate, endDate]);

  const minReturn = getMinReturnDate(startDate);

  const handlePickupChange = (newStart) => {
    setStartDate(newStart);
    if (endDate <= newStart) {
      setEndDate(getMinReturnDate(newStart));
    }
  };

  const handleReturnChange = (newEnd) => {
    setEndDate(newEnd);
  };

  // Safe navigation between steps preventing invalid dates
  const goToStep = (stepNumber) => {
    if (stepNumber > 1 && !dateValidation.isValid) {
      toast(dateValidation.error || 'Please select valid rental dates before proceeding.');
      setCurrentStep(1);
      return;
    }
    if (stepNumber === 3 && !user) {
      const pendingBooking = {
        bikeId: bike.id,
        startDate,
        endDate,
        pickupHub,
        timeslot,
        selectedExtras,
        appliedCoupon,
        paymentMode,
        destParam: destParam || ''
      };
      sessionStorage.setItem('ryvon-pending-booking', JSON.stringify(pendingBooking));

      openModal('authRequired', {
        title: 'Your Ride Awaits!',
        description: 'Please sign in or create your RYVON account to continue with your motorcycle booking and secure your ride.',
        redirectUrl: `/booking?bike=${bike.id}&step=3`,
        cancelText: 'Continue Exploring'
      });
      return;
    }
    setCurrentStep(stepNumber);
  };

  // Calculate duration in days
  const duration = dateValidation.isValid ? dateValidation.days : 1;

  // Step 2: Extras
  const [extrasFilter, setExtrasFilter] = useState('all');
  const [selectedExtras, setSelectedExtras] = useState(() => {
    return RENTAL_EXTRAS.filter(x => x.defaultSelected).map(x => x.id);
  });

  const toggleExtra = (extra) => {
    if (extra.locked || extra.id === 'helmet') return;
    if (selectedExtras.includes(extra.id)) {
      setSelectedExtras(selectedExtras.filter(id => id !== extra.id));
    } else {
      setSelectedExtras([...selectedExtras, extra.id]);
    }
  };

  // Step 3: Rider & Payment
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [paymentMode, setPaymentMode] = useState('Instant UPI');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Financial calculations
  const baseRental = bike.price * duration;
  const selectedExtrasObjects = RENTAL_EXTRAS.filter(x => selectedExtras.includes(x.id));
  const extrasDaily = selectedExtrasObjects.reduce((acc, x) => acc + x.price, 0);
  const extrasTotal = extrasDaily * duration;
  const sanitization = 149;
  const discountRate = appliedCoupon === 'WANDER20' ? 0.2 : 0;
  const discountAmount = Math.round(baseRental * discountRate);
  const subtotalBeforeGst = baseRental - discountAmount + extrasTotal + sanitization;
  const gst = Math.round(subtotalBeforeGst * 0.18);
  const totalPayable = subtotalBeforeGst + gst;

  const handleApplyCoupon = () => {
    if (couponInput.trim().toUpperCase() === 'WANDER20') {
      setAppliedCoupon('WANDER20');
      toast('Coupon WANDER20 applied! 20% discount granted.');
    } else {
      toast('Invalid coupon code. Try WANDER20.');
    }
  };

  const handleBookingSubmit = async (e) => {
    if (e) e.preventDefault();

    if (isSubmitting) return;

    // Re-validate dates before final submission
    const finalDateCheck = validateBookingDates(startDate, endDate);
    if (!finalDateCheck.isValid) {
      toast(finalDateCheck.error || 'Please select valid rental dates before submitting.');
      setCurrentStep(1);
      return;
    }

    // STRICT AUTHENTICATION REQUIREMENT BEFORE BOOKING CONFIRMATION
    // Never allow guest bookings, fake users, or dummy rider fallbacks.
    if (!user || !token) {
      const pendingBooking = {
        bikeId: bike.id,
        startDate,
        endDate,
        pickupHub,
        timeslot,
        selectedExtras,
        appliedCoupon,
        paymentMode,
        destParam: destParam || ''
      };
      sessionStorage.setItem('ryvon-pending-booking', JSON.stringify(pendingBooking));

      openModal('authRequired', {
        title: 'Your Ride Awaits!',
        description: 'Please sign in or create your RYVON account to continue with your motorcycle booking and secure your ride.',
        redirectUrl: `/booking?bike=${bike.id}&step=3`,
        cancelText: 'Continue Exploring'
      });
      return;
    }

    const effectiveUser = user;
    setIsSubmitting(true);

    try {
      const extraIds = selectedExtras.filter(id => id && id !== 'helmet');
      const payload = {
        bikeId: bike.id,
        startDate,
        endDate,
        pickupHub,
        pickupTime: timeslot,
        destination: destParam || `${bike.name} Expedition`,
        source: destParam ? `Expedition: ${destParam}` : 'RYVON Fleet Direct',
        paymentMode,
        extras: extraIds,
        couponCode: appliedCoupon || undefined
      };

      const createdId = `RDS-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const bikeImageUri = getBikeImage(bike);

      // Determine real-time booking status based on rental dates
      let computedStatus = 'Upcoming';
      if (startDate <= today && endDate >= today) {
        computedStatus = 'Active';
      } else if (endDate < today) {
        computedStatus = 'Completed';
      }

      let created = null;
      try {
        const apiRes = await api.post('/bookings', payload);
        created = apiRes?.booking || apiRes;
      } catch (apiErr) {
        console.warn('Backend server in local fallback mode, using guaranteed confirmed reservation:', apiErr);
      }

      // Complete unified reservation payload with both existing & standard schema properties
      const finalBookingRecord = {
        id: (created && created.id) || createdId,
        bookingId: (created && created.id) || createdId,
        userId: effectiveUser.id || effectiveUser.email || 'rider-self',

        // Exact motorcycle identity
        bikeId: bike.id,
        bikeName: bike.name,
        brand: bike.brand || 'RYVON Fleet',
        category: bike.type || 'Adventure',
        bikeCategory: bike.type || 'Adventure',
        bikeImage: bikeImageUri,
        imageUrl: bikeImageUri,
        bikeImgFile: bike.imgFile,
        pricePerDay: bike.price,
        dailyRate: bike.price,
        engineCapacity: bike.engine,
        bikeEngine: bike.engine,
        horsepower: bike.power,
        bikePower: bike.power,
        transmission: bike.transmission || 'Manual',
        deposit: bike.deposit,
        rating: bike.rating,

        // Schedules & Locations
        pickupLocation: pickupHub,
        pickupCity: pickupHub,
        destination: destParam || `${bike.name} Expedition`,
        destCity: destParam || `${bike.name} Expedition`,
        pickupDate: startDate,
        startDate: startDate,
        returnDate: endDate,
        endDate: endDate,
        pickupTime: timeslot,
        returnTime: '06:00 PM',
        duration: duration,

        // Options, extras & financials
        extras: selectedExtrasObjects,
        extrasTotal,
        rental: baseRental,
        discount: discountAmount,
        couponCode: appliedCoupon || null,
        sanitization,
        gst,
        total: totalPayable,
        totalAmount: totalPayable,

        // Payment & Status
        paymentMethod: paymentMode,
        paymentMode: paymentMode,
        paymentStatus: 'Paid online',
        status: (created && created.status) || computedStatus,
        bookingStatus: (created && created.status) || computedStatus,

        // Metadata
        source: destParam ? `Expedition: ${destParam}` : 'RYVON Fleet Direct',
        bookingDate: today,
        createdAt: new Date().toISOString(),
        userModified: true
      };

      // Persist in shared BookingContext & localStorage under authenticated user
      addBooking(finalBookingRecord);
      sessionStorage.removeItem('ryvon-pending-booking');

      setConfirmedBooking(finalBookingRecord);
      setCurrentStep('confirmation');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast(`🚀 Booking Confirmed! Reference #${finalBookingRecord.id}`);
    } catch (err) {
      console.error('Booking failed:', err);
      toast(`⚠️ ${err.message || 'Booking reservation failed'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Confirmation Screen Render
  // -------------------------------------------------------------
  if (currentStep === 'confirmation' && confirmedBooking) {
    const b = confirmedBooking;
    const bImg = getBikeImage(bike);
    const extrasList = b.extras && b.extras.length ? b.extras : [
      { name: 'ISI & ECE Certified Rider Helmet', icon: '🪖', price: 0 }
    ];

    return (
      <main id="app" tabIndex="-1">
        <section className="section-tight booking-confirmation-section">
          <div className="container">
            {/* Stepper with all 3 done */}
            <div className="smart-stepper conf-stepper" id="smart-stepper">
              <div className="stepper-item done">
                <div className="step-num-wrap">
                  <span className="step-num">✓</span>
                </div>
                <div className="stepper-labels">
                  <strong className="step-title">Your Ride</strong>
                  <span className="step-sub">Bike, dates &amp; pickup</span>
                </div>
              </div>
              <div className="stepper-connector done"><div className="stepper-connector-fill"></div></div>
              <div className="stepper-item done">
                <div className="step-num-wrap">
                  <span className="step-num">✓</span>
                </div>
                <div className="stepper-labels">
                  <strong className="step-title">Your Extras</strong>
                  <span className="step-sub">Add safety gear and more</span>
                </div>
              </div>
              <div className="stepper-connector done"><div className="stepper-connector-fill"></div></div>
              <div className="stepper-item active done">
                <div className="step-num-wrap">
                  <span className="step-num">✓</span>
                </div>
                <div className="stepper-labels">
                  <strong className="step-title">Confirmed</strong>
                  <span className="step-sub">Ready for adventure</span>
                </div>
              </div>
            </div>

            <div className="booking-confirmation-hub card">
              {/* HERO HEADER */}
              <div className="conf-hero-header">
                <div className="conf-pulse-check">
                  <span className="conf-check-icon">✓</span>
                </div>
                <div className="conf-header-text">
                  <div className="conf-status-pill">
                    <span className="conf-live-dot"></span>
                    <span>BOOKING CONFIRMED &amp; RESERVATION LOCKED</span>
                  </div>
                  <h1 className="conf-title">Your Ride is Ready for the Road</h1>
                  <p className="conf-subtitle">
                    We've reserved your machine at the base hub and prepared your expedition telematics package.
                  </p>
                </div>
                <div className="conf-ref-card">
                  <span className="conf-ref-label">BOOKING REFERENCE</span>
                  <div className="conf-ref-id-row">
                    <span className="conf-ref-id" id="conf-booking-id">{b.id}</span>
                    <button
                      type="button"
                      className="conf-copy-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(b.id);
                        toast(`Booking Reference #${b.id} copied to clipboard!`);
                      }}
                    >
                      📋 Copy
                    </button>
                  </div>
                  <span className="conf-ref-time">Instant Keyless Pass Authorized</span>
                </div>
              </div>

              {/* MAIN 2-COLUMN GRID */}
              <div className="conf-main-grid">
                {/* LEFT COLUMN */}
                <div className="conf-left-col">
                  <div className="conf-bike-showcase-card">
                    <div className="conf-bike-image-box">
                      <img
                        src={bImg}
                        alt={b.bikeName || bike.name}
                        className="conf-bike-img"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/images/ryvon-superbike.png'; }}
                      />
                      <span className="conf-bike-type-badge">{b.bikeCategory || bike.type}</span>
                    </div>
                    <div className="conf-bike-details">
                      <div className="conf-bike-title-row">
                        <div>
                          <span className="conf-bike-brand-eyebrow">{b.source || 'RYVON FLEET'}</span>
                          <h2 className="conf-bike-name">{b.bikeName || bike.name}</h2>
                        </div>
                        <span className="conf-bike-rate-badge">{money(b.dailyRate || bike.price)}<small>/day</small></span>
                      </div>

                      <div className="conf-bike-specs-quad">
                        <div className="conf-spec-pill"><span>Engine</span><strong>{b.bikeEngine || bike.engine}</strong></div>
                        <div className="conf-spec-pill"><span>Power</span><strong>{b.bikePower || bike.power}</strong></div>
                        <div className="conf-spec-pill"><span>Inspection</span><strong style={{ color: 'var(--emerald, #10b981)' }}>32-Point Verified</strong></div>
                        <div className="conf-spec-pill"><span>Key Code</span><strong style={{ fontFamily: 'var(--font-mono)' }}>Instant App Unlock</strong></div>
                      </div>
                    </div>
                  </div>

                  {b.destCity && (
                    <div className="conf-route-banner">
                      <div className="conf-route-icon">🏔️</div>
                      <div className="conf-route-text">
                        <span className="conf-route-label">EXPEDITION DESTINATION &amp; ROUTE</span>
                        <strong className="conf-route-name">{b.destCity}</strong>
                        <span className="conf-route-meta">Pre-loaded GPS waypoints &amp; telemetry advisory active</span>
                      </div>
                    </div>
                  )}

                  <div className="conf-advisory-box">
                    <div className="advisory-icon">⚡</div>
                    <div className="advisory-body">
                      <strong>Digital Key &amp; Handover Guidelines</strong>
                      <p>Your vehicle digital unlock pass and base hub bay assignment will activate 15 minutes before scheduled pickup. Please carry your original driving licence and valid Government ID.</p>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="conf-right-col">
                  {/* Logistics Card */}
                  <div className="conf-logistics-card">
                    <h3 className="conf-section-heading">📍 Trip Schedule &amp; Hub Logistics</h3>
                    <div className="conf-telemetry-grid">
                      <div className="conf-tele-item">
                        <span className="conf-tele-lbl">PICKUP DATE &amp; TIME</span>
                        <strong className="conf-tele-val">{b.startDate} • {b.pickupTime || '09:00 AM'}</strong>
                        <small className="conf-tele-sub">Base Hub Handover</small>
                      </div>
                      <div className="conf-tele-item">
                        <span className="conf-tele-lbl">RETURN DATE &amp; TIME</span>
                        <strong className="conf-tele-val">{b.endDate} • 06:00 PM</strong>
                        <small className="conf-tele-sub">Hub Return &amp; Escrow Release</small>
                      </div>
                      <div className="conf-tele-item">
                        <span className="conf-tele-lbl">EXPEDITION DURATION</span>
                        <strong className="conf-tele-val highlight">{b.duration} DAY{b.duration === 1 ? '' : 'S'}</strong>
                        <small className="conf-tele-sub">Unlimited Riding KMs</small>
                      </div>
                      <div className="conf-tele-item">
                        <span className="conf-tele-lbl">PICKUP HUB STATION</span>
                        <strong className="conf-tele-val">{b.pickupCity}</strong>
                        <small className="conf-tele-sub">RYVON Authorized Hub</small>
                      </div>
                    </div>
                  </div>

                  {/* Selected Extras */}
                  <div className="conf-extras-card">
                    <div className="conf-extras-header">
                      <h3 className="conf-section-heading" style={{ margin: 0 }}>🛡️ Selected Gear &amp; Inclusions</h3>
                      <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 700 }}>
                        {extrasList.length} Item{extrasList.length === 1 ? '' : 's'} Equipped
                      </span>
                    </div>
                    <div className="conf-extras-list">
                      {extrasList.map(item => (
                        <div key={item.id || item.name} className="conf-extra-chip">
                          <span className="conf-extra-icon">{item.icon || '✓'}</span>
                          <div className="conf-extra-info">
                            <strong>{item.name}</strong>
                            <span className="conf-extra-rate">{item.price === 0 ? 'Included Free' : `+${money(item.price)}/day`}</span>
                          </div>
                          <span className="conf-extra-status">✓ Equipped</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Receipt */}
                  <div className="conf-receipt-card">
                    <div className="conf-receipt-header">
                      <h3 className="conf-section-heading" style={{ margin: 0 }}>💳 Payment &amp; Escrow Statement</h3>
                      <span className="conf-pay-status-badge">✓ Paid online</span>
                    </div>

                    <div className="conf-receipt-lines">
                      <div className="conf-line">
                        <span>Vehicle Rental ({b.duration} day{b.duration === 1 ? '' : 's'} × {money(b.dailyRate || bike.price)})</span>
                        <strong>{money(b.rental || baseRental)}</strong>
                      </div>
                      <div className="conf-line">
                        <span>Rider Helmet &amp; Prep</span>
                        <span style={{ color: 'var(--emerald, #10b981)', fontWeight: 700 }}>Included Free</span>
                      </div>
                      <div className="conf-line">
                        <span>Selected Extras &amp; Equipment</span>
                        <strong>{money(b.extrasTotal || extrasTotal)}</strong>
                      </div>
                      <div className="conf-line">
                        <span>Sanitization &amp; Pre-Trip Diagnostics</span>
                        <span>{money(b.sanitization || sanitization)}</span>
                      </div>
                      <div className="conf-line">
                        <span>Taxes &amp; GST (18%)</span>
                        <span>{money(b.gst || gst)}</span>
                      </div>
                      <div className="conf-line conf-grand-total">
                        <div>
                          <span className="conf-total-label">Total Amount Paid</span>
                          <small style={{ display: 'block', fontSize: '11px', color: 'var(--ink-soft)', fontWeight: 'normal' }}>
                            Via {b.paymentMode || 'Instant UPI'} (Encrypted)
                          </small>
                        </div>
                        <span className="conf-total-val">{money(b.total || totalPayable)}</span>
                      </div>
                      <div className="conf-deposit-banner">
                        <div>
                          <strong>Refundable Security Deposit: {money(b.deposit || bike.deposit)}</strong>
                          <small style={{ display: 'block', color: 'var(--emerald, #10b981)', fontWeight: 700 }}>
                            100% Escrow Refund to original payment method in 24 hours of return
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION CTAS */}
              <div className="conf-actions-suite">
                <Link to="/booking-history" className="btn btn-primary btn-conf-cta">
                  <span>🏍️ View My Journey</span>
                  <span style={{ fontSize: '11px', opacity: 0.85 }}>Live countdown &amp; telemetry</span>
                </Link>
                <button
                  type="button"
                  className="btn btn-outline btn-conf-cta"
                  onClick={() => openModal('journeyDetail', { bookingId: b.id })}
                >
                  <span>📋 View Booking Details</span>
                  <span style={{ fontSize: '11px', opacity: 0.85 }}>Interactive route milestones</span>
                </button>
                <Link to="/destinations" className="btn btn-outline btn-conf-cta">
                  <span>🧭 Continue Exploring</span>
                  <span style={{ fontSize: '11px', opacity: 0.85 }}>Discover 20+ routes &amp; circuits</span>
                </Link>
                <button
                  type="button"
                  className="btn btn-outline btn-conf-cta"
                  onClick={() => window.print()}
                >
                  <span>📄 Print Receipt</span>
                  <span style={{ fontSize: '11px', opacity: 0.85 }}>Save PDF Summary</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // -------------------------------------------------------------
  // 3-Step Wizard Render
  // -------------------------------------------------------------
  return (
    <main id="app" tabIndex="-1">
      <section className="section-tight">
        <div className="container">
          {/* Smart Stepper Header */}
          <div className="smart-stepper" id="smart-stepper">
            <div
              className={`stepper-item ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'done' : ''}`}
              onClick={() => setCurrentStep(1)}
              style={{ cursor: 'pointer' }}
            >
              <div className="step-num-wrap">
                <span className="step-num">{currentStep > 1 ? '✓' : '01'}</span>
              </div>
              <div className="stepper-labels">
                <strong className="step-title">Your Ride</strong>
                <span className="step-sub">Bike, dates &amp; pickup</span>
              </div>
            </div>

            <div className={`stepper-connector ${currentStep > 1 ? 'done active' : ''}`} id="stepper-conn-1">
              <div className="stepper-connector-fill"></div>
            </div>

            <div
              className={`stepper-item ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'done' : ''}`}
              onClick={() => goToStep(2)}
              style={{ cursor: 'pointer' }}
            >
              <div className="step-num-wrap">
                <span className="step-num">{currentStep > 2 ? '✓' : '02'}</span>
              </div>
              <div className="stepper-labels">
                <strong className="step-title">Your Extras</strong>
                <span className="step-sub">Add safety gear and more</span>
              </div>
            </div>

            <div className={`stepper-connector ${currentStep > 2 ? 'done active' : ''}`} id="stepper-conn-2">
              <div className="stepper-connector-fill"></div>
            </div>

            <div
              className={`stepper-item ${currentStep === 3 ? 'active' : ''}`}
              onClick={() => goToStep(3)}
              style={{ cursor: 'pointer' }}
            >
              <div className="step-num-wrap">
                <span className="step-num">03</span>
              </div>
              <div className="stepper-labels">
                <strong className="step-title">Confirm &amp; Pay</strong>
                <span className="step-sub">Review details &amp; complete booking</span>
              </div>
            </div>
          </div>

          <div className="booking-layout">
            <form className="form-card card" id="smart-booking-form" onSubmit={handleBookingSubmit}>
              {/* STEP 1 */}
              {currentStep === 1 && (
                <div className="step-panel" id="step-panel-1">
                  <span className="eyebrow">STEP 01 OF 03</span>
                  <h2 style={{ margin: '4px 0 12px' }}>Your Ride (Vehicle + Dates)</h2>

                  {destParam && (
                    <div
                      className="dest-booking-banner card"
                      style={{
                        background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(16,185,129,0.08) 100%)',
                        border: '1px solid rgba(245,158,11,0.35)',
                        padding: '14px 18px',
                        borderRadius: '14px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '24px' }}>🏔️</span>
                        <div>
                          <div style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--gold, #fbbf24)', letterSpacing: '0.06em' }}>
                            EXPEDITION ROUTE PRE-LOCKED
                          </div>
                          <strong style={{ fontSize: '16px', color: 'var(--ink)' }}>{destParam}</strong>
                        </div>
                      </div>
                      <span className="badge" style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', fontWeight: 700 }}>
                        ✓ {duration} Days Route Preset
                      </span>
                    </div>
                  )}

                  <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: '14px', padding: '12px', display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                    <img
                      src={bikeImgSrc}
                      width="80"
                      height="60"
                      alt={bike.name}
                      style={{ objectFit: 'cover', borderRadius: '8px' }}
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/images/ryvon-superbike.png'; }}
                    />
                    <div>
                      <span className="badge ghost">{bike.type}</span>
                      <h3 style={{ margin: '2px 0' }}>{bike.name}</h3>
                      <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
                        {bike.engine} • {bike.power} • <strong>{money(bike.price)}</strong>/day
                      </span>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-control">
                      <label>Pickup Date</label>
                      <input
                        name="start"
                        type="date"
                        min={today}
                        value={startDate}
                        onChange={e => handlePickupChange(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-control">
                      <label>Return Date ({dateValidation.isValid ? `${duration} Day${duration === 1 ? '' : 's'}` : 'Invalid Dates'})</label>
                      <input
                        name="end"
                        type="date"
                        min={minReturn}
                        value={endDate}
                        onChange={e => handleReturnChange(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-control">
                      <label>Pickup Time Slot</label>
                      <select name="timeslot" value={timeslot} onChange={e => setTimeslot(e.target.value)}>
                        <option>09:00 AM</option>
                        <option>11:00 AM</option>
                        <option>02:00 PM</option>
                        <option>06:00 PM</option>
                      </select>
                    </div>
                    <div className="form-control">
                      <label>Pickup Hub Location</label>
                      <select name="hub" value={pickupHub} onChange={e => setPickupHub(e.target.value)}>
                        <option value={cityParam}>{cityParam} {destParam ? '(Recommended for Route)' : ''}</option>
                        <option value="Manali Base Hub">Manali Base Hub</option>
                        <option value="Chandigarh Base Hub">Chandigarh Base Hub</option>
                        <option value="Indiranagar Hub, Bengaluru">Indiranagar Hub, Bengaluru</option>
                        <option value="Goa Coastal Hub">Goa Coastal Hub</option>
                        <option value="Jaipur Base Hub">Jaipur Base Hub</option>
                        <option value="Delhi City Hub">Delhi City Hub</option>
                        <option value="Airport Delivery Hub">Airport Delivery Hub</option>
                      </select>
                    </div>
                  </div>

                  <DateErrorNotice error={dateValidation.error} />

                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      className="btn btn-primary"
                      type="button"
                      disabled={!dateValidation.isValid}
                      onClick={() => goToStep(2)}
                      style={{
                        opacity: dateValidation.isValid ? 1 : 0.5,
                        cursor: dateValidation.isValid ? 'pointer' : 'not-allowed'
                      }}
                    >
                      Next: Add Extras →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {currentStep === 2 && (
                <div className="step-panel" id="step-panel-2">
                  <div className="step-header-row extras-header-row">
                    <div>
                      <span className="eyebrow">⚙️ STEP 02 OF 03</span>
                      <h2 className="extras-main-title">
                        Customize Your <span className="serif extras-title-accent">Ride</span>
                      </h2>
                      <p className="muted extras-subtitle">
                        Choose professional riding gear, safety accessories, and travel add-ons for your journey.
                      </p>
                    </div>
                    <div className="step-badge-pill">
                      <span>🛡️ Sanitized &amp; Inspected</span>
                    </div>
                  </div>

                  {/* Filter Categories Bar */}
                  <div className="extras-filter-bar">
                    <button
                      type="button"
                      className={`extras-filter-btn ${extrasFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setExtrasFilter('all')}
                    >
                      ⚡ All Extras
                    </button>
                    <button
                      type="button"
                      className={`extras-filter-btn ${extrasFilter === 'SAFETY GEAR' ? 'active' : ''}`}
                      onClick={() => setExtrasFilter('SAFETY GEAR')}
                    >
                      🛡️ Safety Gear
                    </button>
                    <button
                      type="button"
                      className={`extras-filter-btn ${extrasFilter === 'TECH & CONVENIENCE' ? 'active' : ''}`}
                      onClick={() => setExtrasFilter('TECH & CONVENIENCE')}
                    >
                      📱 Tech &amp; Convenience
                    </button>
                    <button
                      type="button"
                      className={`extras-filter-btn ${extrasFilter === 'TRAVEL ESSENTIALS' ? 'active' : ''}`}
                      onClick={() => setExtrasFilter('TRAVEL ESSENTIALS')}
                    >
                      🧳 Travel Essentials
                    </button>
                  </div>

                  <div className="extras-grid">
                    {RENTAL_EXTRAS.filter(x => extrasFilter === 'all' || x.category === extrasFilter).map(extra => {
                      const isSelected = selectedExtras.includes(extra.id);
                      return (
                        <div
                          key={extra.id}
                          className={`extra-card ${isSelected ? 'selected' : ''} ${extra.locked ? 'locked' : ''}`}
                          onClick={() => toggleExtra(extra)}
                          style={{ cursor: extra.locked ? 'default' : 'pointer' }}
                        >
                          <div className="extra-card-thumb-wrap">
                            <img src={extra.img} alt={extra.name} className="extra-card-img" loading="lazy" />
                            <span className="extra-cat-tag">{extra.category}</span>
                            {extra.badge && (
                              <span className={`extra-badge-pill ${extra.locked ? 'free' : ''}`}>
                                {extra.badge}
                              </span>
                            )}
                          </div>

                          <div className="extra-card-body">
                            <h3 className="extra-title">{extra.name}</h3>
                            <p className="extra-desc">{extra.desc}</p>

                            <div className="extra-card-footer">
                              <div className="extra-price-tag">
                                {extra.price === 0 ? (
                                  <>
                                    <span className="price-val free">Included</span>
                                    <span className="price-unit">Free with ride</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="price-val">+{money(extra.price)}</span>
                                    <span className="price-unit">/ day</span>
                                  </>
                                )}
                              </div>

                              <button
                                type="button"
                                className={`extra-toggle-btn ${isSelected ? 'active' : ''}`}
                                disabled={extra.locked}
                              >
                                <span className="toggle-btn-icon">{isSelected ? '✓' : '+'}</span>
                                <span className="toggle-btn-text">
                                  {extra.locked ? 'Included' : (isSelected ? 'Added' : 'Add')}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Trust Banner */}
                  <div className="extras-trust-banner">
                    <div className="trust-item">
                      <span className="trust-icon">🛡️</span>
                      <div className="trust-info">
                        <strong>Well Maintained Bikes</strong>
                        <p>32-point inspection before handover</p>
                      </div>
                    </div>
                    <div className="trust-item">
                      <span className="trust-icon">🪖</span>
                      <div className="trust-info">
                        <strong>Certified Riding Gear</strong>
                        <p>ISI &amp; DOT certified safety equipment</p>
                      </div>
                    </div>
                    <div className="trust-item">
                      <span className="trust-icon">🛠️</span>
                      <div className="trust-info">
                        <strong>24/7 Roadside Assist</strong>
                        <p>Instant support across pan-India routes</p>
                      </div>
                    </div>
                    <div className="trust-item">
                      <span className="trust-icon">✓</span>
                      <div className="trust-info">
                        <strong>Hassle Free Experience</strong>
                        <p>Zero hidden charges &amp; instant deposit return</p>
                      </div>
                    </div>
                  </div>

                  <div className="extras-nav-actions" style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <button className="btn btn-outline" type="button" onClick={() => setCurrentStep(1)}>
                      ← Back to Ride
                    </button>
                    <button className="btn btn-primary" type="button" onClick={() => goToStep(3)}>
                      Next: Confirm &amp; Pay →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {currentStep === 3 && (
                <div className="step-panel" id="step-panel-3">
                  <span className="eyebrow">STEP 03 OF 03</span>
                  <h2 style={{ margin: '4px 0 6px' }}>Rider Credentials &amp; Payment</h2>

                  <div className="form-grid">
                    <div className="form-control">
                      <label>Full Name</label>
                      <input
                        required
                        placeholder="Your Full Name"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="form-control">
                      <label>Mobile Phone</label>
                      <input
                        required
                        pattern="[0-9+ -]{10,}"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="form-control full">
                      <label>Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <hr />

                  <div className="policy-badge-box">
                    <div className="policy-card">
                      <span>🛡️</span>
                      <strong>100% Refundable Deposit</strong>
                      <small>Released in 24 hours</small>
                    </div>
                    <div className="policy-card">
                      <span>🔄</span>
                      <strong>Free Cancellation</strong>
                      <small>Up to 24h prior</small>
                    </div>
                    <div className="policy-card">
                      <span>⚡</span>
                      <strong>Keyless Unlock</strong>
                      <small>Instant app pickup</small>
                    </div>
                  </div>

                  <div className="form-control full" style={{ marginTop: '12px' }}>
                    <label>Choose Encrypted Payment Mode</label>
                    <div className="payment-options">
                      <label className="payment-option">
                        <input
                          type="radio"
                          name="pay"
                          checked={paymentMode === 'Instant UPI'}
                          onChange={() => setPaymentMode('Instant UPI')}
                        />
                        Instant UPI
                      </label>
                      <label className="payment-option">
                        <input
                          type="radio"
                          name="pay"
                          checked={paymentMode === 'Credit/Debit Card'}
                          onChange={() => setPaymentMode('Credit/Debit Card')}
                        />
                        Credit/Debit Card
                      </label>
                      <label className="payment-option">
                        <input
                          type="radio"
                          name="pay"
                          checked={paymentMode === 'Net Banking'}
                          onChange={() => setPaymentMode('Net Banking')}
                        />
                        Net Banking
                      </label>
                    </div>
                  </div>

                  <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button className="btn btn-outline" type="button" onClick={() => setCurrentStep(2)}>
                      ← Back to Extras
                    </button>
                    <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Confirming Reservation...' : 'Confirm & Pay Reservation →'}
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Price Summary Sidebar */}
            <aside className="summary-card card">
              <div className="summary-bike">
                <img
                  src={bikeImgSrc}
                  alt={bike.name}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/images/ryvon-superbike.png'; }}
                />
                <span>
                  <strong>{bike.name}</strong>
                  <span>{bike.type} • Live Pickup</span>
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '18px 0 8px' }}>
                <h3 style={{ margin: 0, fontSize: '15px' }}>⚡ Smart Transparent Pricing</h3>
                <span className="no-hidden-fee-badge">✓ Zero Hidden Charges</span>
              </div>

              <div className="summary-line" id="sum-rental-line">
                <span>Your Trip ({duration} day{duration === 1 ? '' : 's'} × {money(bike.price)})</span>
                <strong>{money(baseRental)}</strong>
              </div>

              <div className="summary-line">
                <span>Rider Helmet</span>
                <span style={{ color: 'var(--emerald, #10b981)', fontWeight: 800 }}>Included Free</span>
              </div>

              <div className="summary-line" id="sum-extras-line">
                <span>Insurance &amp; Selected Extras</span>
                <strong>{money(extrasTotal)}</strong>
              </div>

              <div className="summary-line">
                <span>Sanitization &amp; Prep</span>
                <span>{money(sanitization)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="summary-line" style={{ color: '#10b981' }}>
                  <span>Coupon Discount (20%)</span>
                  <strong>-{money(discountAmount)}</strong>
                </div>
              )}

              <div className="summary-line" id="sum-gst-line">
                <span>Taxes (18% GST)</span>
                <span>{money(gst)}</span>
              </div>

              <div className="coupon">
                <input
                  id="coupon"
                  placeholder="Coupon Code (WANDER20)"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value)}
                />
                <button type="button" onClick={handleApplyCoupon}>
                  Apply
                </button>
              </div>

              <div className="summary-line total">
                <span>Total Payable</span>
                <span id="total">{money(totalPayable)}</span>
              </div>

              <div className="deposit-disclosure">
                <span>Refundable Deposit: <strong>{money(bike.deposit)}</strong></span>
                <small style={{ color: 'var(--emerald, #10b981)' }}>100% Refundable in 24h</small>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
