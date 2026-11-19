import React, { useState, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { bikes, getBikeImage } from '../data/bikes';
import { useCurrency } from '../context/CurrencyContext';
import { useWishlist } from '../context/WishlistContext';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  getTodayDateString,
  getMinReturnDate,
  getTomorrowDateString,
  validateBookingDates
} from '../utils/dateValidation';
import DateErrorNotice from '../components/common/DateErrorNotice';

import WhyThisBike from '../components/bikes/WhyThisBike';
import EcoRideScore from '../components/bikes/EcoRideScore';
import RoutePersonalitySelector from '../components/bikes/RoutePersonalitySelector';
import TripCostSimulator from '../components/bikes/TripCostSimulator';
import BikeDNA from '../components/bikes/BikeDNA';
import PerformanceChart from '../components/bikes/PerformanceChart';

export default function BikeDetails() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { money } = useCurrency();
  const { isSaved, toggleWishlist } = useWishlist();
  const { openModal } = useModal();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const bikeId = searchParams.get('bike') || 'bmw310';
  const destParam = searchParams.get('dest');
  const cityParam = searchParams.get('city');

  const bike = bikes.find(b => b.id === bikeId) || bikes[0];
  const imgSrc = getBikeImage(bike);
  const gallery = Array.from(new Set([(bike.gallery && bike.gallery.length) ? bike.gallery : imgSrc].flat().filter(Boolean)));

  const [activeImg, setActiveImg] = useState(gallery[0] || imgSrc);
  const [activeTab, setActiveTab] = useState('spec');

  const today = getTodayDateString();
  const tomorrow = getTomorrowDateString();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(tomorrow);

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

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!dateValidation.isValid) {
      toast(dateValidation.error || 'Please select valid rental dates.');
      return;
    }
    const params = new URLSearchParams();
    params.set('bike', bike.id);
    if (startDate) params.set('start', startDate);
    if (endDate) params.set('end', endDate);
    if (destParam) params.set('dest', destParam);
    if (cityParam) params.set('city', cityParam);

    const targetUrl = `/booking?${params.toString()}`;

    if (!isAuthenticated) {
      // Save pending booking intent with exact bike, dates, destination, and pickup hub
      const pendingBooking = {
        bikeId: bike.id,
        bikeName: bike.name,
        bikeImage: imgSrc,
        startDate,
        endDate,
        pickupHub: cityParam || 'Bengaluru',
        pickupCity: cityParam || 'Bengaluru',
        destParam: destParam || '',
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

  const specsList = [
    ['Engine', bike.engine],
    ['Power', bike.power],
    ['Torque', bike.torque],
    ['Transmission', bike.transmission],
    ['Seat Height', bike.seat],
    ['Curb Weight', bike.weight],
    ['Top Speed', bike.topSpeed],
    ['Fuel Capacity', bike.fuelCap],
    ['Brakes', 'Dual ABS / CBS']
  ];

  return (
    <main id="app" tabIndex="-1">
      <section className="section-tight">
        <div className="container">
          {/* Breadcrumbs */}
          <nav className="breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            {destParam ? (
              <>
                <Link to={`/destinations?dest=${encodeURIComponent(destParam)}`}>{destParam}</Link>
                <span>/</span>
              </>
            ) : (
              <>
                <Link to="/bikes">Explore Fleet</Link>
                <span>/</span>
              </>
            )}
            <span>{bike.name}</span>
          </nav>

          {/* Expedition Preset Banner */}
          {destParam && (
            <div
              className="card"
              style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.14) 0%, rgba(16,185,129,0.1) 100%)',
                border: '1px solid rgba(245,158,11,0.4)',
                padding: '14px 18px',
                borderRadius: '14px',
                marginTop: '16px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>🏔️</span>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.06em', color: 'var(--gold, #fbbf24)', textTransform: 'uppercase' }}>
                    EXPEDITION ROUTE PRESET
                  </span>
                  <strong style={{ display: 'block', fontSize: '16px', color: 'var(--ink)' }}>
                    Curated for {destParam}
                  </strong>
                  <small className="muted" style={{ fontSize: '11.5px' }}>
                    Recommended Base Hub: <strong>{cityParam || 'Base Hub Location'}</strong>
                  </small>
                </div>
              </div>
              <Link
                className="btn btn-primary btn-sm"
                style={{ fontWeight: 800, padding: '8px 16px' }}
                to={`/booking?bike=${bike.id}&dest=${encodeURIComponent(destParam)}${cityParam ? '&city=' + encodeURIComponent(cityParam) : ''}`}
              >
                Direct Expedition Booking →
              </Link>
            </div>
          )}

          {/* Detail Layout */}
          <div className="detail-layout" style={{ marginTop: '20px' }}>
            <div>
              <div className="gallery-main" id="main-gallery">
                <img
                  src={activeImg}
                  alt={bike.name}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/images/ryvon-superbike.png'; }}
                />
              </div>

              {gallery.length > 1 && (
                <div className="gallery-thumbs">
                  {gallery.map((img, n) => (
                    <button
                      key={n}
                      className={`gallery-thumb ${img === activeImg ? 'active' : ''}`}
                      type="button"
                      onClick={() => setActiveImg(img)}
                    >
                      <img src={img} alt={`View ${n + 1}`} />
                    </button>
                  ))}
                </div>
              )}

              <div className="detail-gallery-actions" style={{ marginTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-outline"
                  type="button"
                  onClick={() => openModal('arPreview', { bike })}
                >
                  🔮 See This Vehicle in AR
                </button>
                <button
                  className="btn btn-outline"
                  type="button"
                  onClick={() => openModal('bike360', { bike })}
                >
                  🔄 360° Inspection
                </button>
              </div>
            </div>

            <div>
              <div className="detail-title">
                <div>
                  <span className="eyebrow">{bike.brand} • {bike.type}</span>
                  <h1>{bike.name}</h1>
                  <p className="rating">
                    ★ {bike.rating} <b>Excellent</b> • 120 verified rider reviews{' '}
                    <span
                      className="verified-ride-badge"
                      style={{ cursor: 'pointer' }}
                      onClick={() => openModal('verifiedInfo', { bikeName: bike.name })}
                    >
                      🛡️ VERIFIED RIDE
                    </span>
                  </p>
                </div>
                <button
                  className={`icon-btn ${isSaved(bike.id) ? 'active' : ''}`}
                  type="button"
                  aria-label="Save to Wishlist"
                  onClick={() => toggleWishlist(bike.id)}
                >
                  {isSaved(bike.id) ? '♥' : '♡'}
                </button>
              </div>

              <div className="detail-price">
                <span>
                  <strong>{money(bike.price)}</strong> <small>per 24 hours</small>
                </span>
                <span className="badge">Instant Pickup</span>
              </div>

              <div className="perks">
                <span className="perk">
                  <b>✓ Free Helmet</b>Certified Helmet
                </span>
                <span className="perk">
                  <b>✓ {money(bike.deposit)}</b>Deposit
                </span>
                <span className="perk">
                  <b>✓ Inspected</b>32-Point Check
                </span>
              </div>

              <form className="booking-mini" id="detail-form" onSubmit={handleBookingSubmit}>
                <div className="booking-mini-field">
                  <label htmlFor="detail-start">Pickup Date</label>
                  <input
                    id="detail-start"
                    name="start"
                    type="date"
                    min={today}
                    value={startDate}
                    onChange={e => handlePickupChange(e.target.value)}
                    required
                    className="detail-date-input"
                  />
                </div>
                <div className="booking-mini-field">
                  <label htmlFor="detail-end">Return Date</label>
                  <input
                    id="detail-end"
                    name="end"
                    type="date"
                    min={minReturn}
                    value={endDate}
                    onChange={e => handleReturnChange(e.target.value)}
                    required
                    className="detail-date-input"
                  />
                </div>
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={!dateValidation.isValid}
                  style={{
                    opacity: dateValidation.isValid ? 1 : 0.5,
                    cursor: dateValidation.isValid ? 'pointer' : 'not-allowed'
                  }}
                >
                  Reserve {bike.name} →
                </button>
              </form>
              <DateErrorNotice error={dateValidation.error} style={{ marginTop: '8px' }} />
            </div>
          </div>

          {/* AI Features & Simulators */}
          <WhyThisBike bike={bike} />
          <EcoRideScore bike={bike} />
          <RoutePersonalitySelector />
          <TripCostSimulator bike={bike} />
          <BikeDNA bike={bike} />
          <PerformanceChart bike={bike} />

          {/* Details Tabs */}
          <div className="details-tabs">
            <div className="tab-buttons">
              <button
                className={activeTab === 'spec' ? 'active' : ''}
                type="button"
                onClick={() => setActiveTab('spec')}
              >
                Specifications
              </button>
              <button
                className={activeTab === 'accessories' ? 'active' : ''}
                type="button"
                onClick={() => setActiveTab('accessories')}
              >
                Accessories
              </button>
              <button
                className={activeTab === 'about' ? 'active' : ''}
                type="button"
                onClick={() => setActiveTab('about')}
              >
                About Vehicle
              </button>
            </div>

            <div className="tab-panel" id="tab-panel">
              {activeTab === 'spec' && (
                <div className="specs">
                  {specsList.map(([lbl, val]) => (
                    <div key={lbl} className="spec">
                      <span>{lbl}</span>
                      <strong>{val}</strong>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'accessories' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', padding: '10px 0' }}>
                  <div style={{ padding: '14px', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--line)' }}>
                    <strong>Complimentary ISI Certified Helmet</strong>
                    <p style={{ fontSize: '12px', color: 'var(--ink-soft)', margin: '4px 0 0' }}>Sanitized and equipped with clear visor.</p>
                  </div>
                  <div style={{ padding: '14px', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--line)' }}>
                    <strong>Rain Poncho &amp; Dust Mask Kit</strong>
                    <p style={{ fontSize: '12px', color: 'var(--ink-soft)', margin: '4px 0 0' }}>Weather protection for mountain &amp; monsoon trails.</p>
                  </div>
                  <div style={{ padding: '14px', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--line)' }}>
                    <strong>Vibration-Dampened Mobile Mount</strong>
                    <p style={{ fontSize: '12px', color: 'var(--ink-soft)', margin: '4px 0 0' }}>Quick-clamp with integrated USB-C charging.</p>
                  </div>
                  <div style={{ padding: '14px', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--line)' }}>
                    <strong>Puncture Repair &amp; Tool Kit</strong>
                    <p style={{ fontSize: '12px', color: 'var(--ink-soft)', margin: '4px 0 0' }}>Tubeless plug kit, mini pump, and hex key set.</p>
                  </div>
                </div>
              )}

              {activeTab === 'about' && (
                <div style={{ lineHeight: 1.7, fontSize: '14px', color: 'var(--ink-soft)', padding: '10px 0' }}>
                  <p>
                    The <strong>{bike.name}</strong> is meticulously tuned and certified under our strict 32-point inspection standard.
                    Whether carving through high-altitude Himalayan passes or gliding smoothly along coastal highways, this vehicle provides exceptional balance, responsive throttle mapping, and confidence-inspiring braking stability.
                  </p>
                  <p style={{ marginTop: '10px' }}>
                    Every RYVON rental includes full telemetry health diagnostics, zero-dep insurance options, and 24/7 highway concierge assistance.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
