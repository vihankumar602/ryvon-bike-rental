import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useModal } from '../context/ModalContext';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import { bikes } from '../data/bikes';
import BikeCard from '../components/bikes/BikeCard';
import {
  getTodayDateString,
  getMinReturnDate,
  addDays,
  validateBookingDates
} from '../utils/dateValidation';
import DateErrorNotice from '../components/common/DateErrorNotice';

const SLIDES = [
  {
    img: '/assets/images/ryvon-cinematic-sport.png',
    alt: 'Black sport motorcycle on a mountain pass at golden hour'
  },
  {
    img: '/assets/images/ryvon-cinematic-group.png',
    alt: 'Motorcyclists riding together through a dramatic mountain valley'
  },
  {
    img: '/assets/images/ryvon-cinematic-journey.png',
    alt: 'Father with two children beside a motorcycle overlooking a mountain valley'
  }
];

export default function Home() {
  const navigate = useNavigate();
  const { openModal } = useModal();
  const { money } = useCurrency();
  const { toast } = useToast();

  // Carousel state
  const [activeSlide, setActiveSlide] = useState(0);
  const startXRef = useRef(null);

  // Search state with global date validation
  const today = getTodayDateString();
  const defaultReturn = addDays(today, 3);
  const [city, setCity] = useState('Bengaluru');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(defaultReturn);
  const [vehicleClass, setVehicleClass] = useState('All');

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

  // Set body data-page attribute for accurate theme and scoped styling
  useEffect(() => {
    document.body.setAttribute('data-page', 'home');
    return () => {
      document.body.removeAttribute('data-page');
    };
  }, []);

  // Auto advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(curr => (curr + 1) % SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!dateValidation.isValid) {
      toast(dateValidation.error || 'Please select valid rental dates.');
      return;
    }
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (startDate) params.set('start', startDate);
    if (endDate) params.set('end', endDate);
    if (vehicleClass && vehicleClass !== 'All') params.set('type', vehicleClass);
    navigate(`/bikes?${params.toString()}`);
  };

  // Curated 4 bikes
  const curatedIds = ['bmw310', 'duke', 'himalayan', 'meteor'];
  const curatedBikes = curatedIds.map(id => bikes.find(b => b.id === id)).filter(Boolean);

  return (
    <main id="app" data-static-home="true" tabIndex="-1">
      <section className="hero" aria-roledescription="carousel" aria-label="Featured RYVON journeys">
        <div className="hero-carousel" aria-live="polite">
          <div
            className="hero-carousel-track"
            style={{
              transform: `translate3d(-${activeSlide * 100}%, 0, 0)`,
              transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onPointerDown={(e) => { startXRef.current = e.clientX; }}
            onPointerUp={(e) => {
              if (startXRef.current === null) return;
              const diff = e.clientX - startXRef.current;
              if (Math.abs(diff) > 48) {
                if (diff < 0) {
                  setActiveSlide(curr => (curr + 1) % SLIDES.length);
                } else {
                  setActiveSlide(curr => (curr - 1 + SLIDES.length) % SLIDES.length);
                }
              }
              startXRef.current = null;
            }}
          >
            {SLIDES.map((slide, idx) => (
              <div key={idx} className="hero-slide">
                <img src={slide.img} alt={slide.alt} fetchPriority={idx === 0 ? 'high' : 'low'} />
              </div>
            ))}
          </div>
        </div>

        <div className="container">
          <h1>
            Where Peak<br />
            <span className="caps-serif">ALTITUDE MEETS</span><br />
            <span className="serif-gold-underline">Pure Freedom.</span>
          </h1>
          <p className="hero-copy">
            Recommended for your persona: <strong>Himalayan 450</strong>. 33+ Superbikes, Activas &amp; Adventure Tourers, AI route intelligence, 32-point inspection, and instant keyless pickup.
          </p>
          <p className="hero-mobile-copy">Your next great ride begins where the road opens up.</p>

          <div className="quick-trip-chips">
            <button
              className="trip-chip"
              type="button"
              onClick={() => openModal('weekendEscape')}
            >
              <span className="chip-icon">🚀</span> I Have a Weekend
            </button>
            <button
              className="trip-chip"
              type="button"
              onClick={() => navigate('/bikes?q=Activa')}
            >
              <span className="chip-icon">🛵</span> Activa City Commute
            </button>
            <button
              className="trip-chip"
              type="button"
              onClick={() => navigate('/destinations?dest=ladakh', { state: { cardImg: '/assets/images/destinations/card-ladakh-pass.jpg' } })}
            >
              <span className="chip-icon">🏔️</span> Leh Ladakh
            </button>
            <button
              className="trip-chip"
              type="button"
              onClick={() => navigate('/destinations?dest=goa', { state: { cardImg: '/assets/images/destinations/card-goa-beach.jpg' } })}
            >
              <span className="chip-icon">🌊</span> Goa Coast
            </button>
            <button
              className="trip-chip"
              type="button"
              onClick={() => openModal('buildMyRide')}
            >
              <span className="chip-icon">🧬</span> Build My Ride AI
            </button>
          </div>

          <div className="hero-controls-wrapper">
            <div className="hero-carousel-controls" aria-label="Hero carousel controls">
              <button
                className="hero-carousel-arrow hero-carousel-prev"
                type="button"
                aria-label="Previous scene"
                onClick={() => setActiveSlide(curr => (curr - 1 + SLIDES.length) % SLIDES.length)}
              >
                ‹
              </button>
              <button
                className="hero-carousel-arrow hero-carousel-next"
                type="button"
                aria-label="Next scene"
                onClick={() => setActiveSlide(curr => (curr + 1) % SLIDES.length)}
              >
                ›
              </button>
            </div>
            <div className="hero-carousel-dots" role="tablist" aria-label="Choose a featured journey">
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  className={`hero-carousel-dot ${activeSlide === idx ? 'is-active' : ''}`}
                  type="button"
                  role="tab"
                  aria-selected={activeSlide === idx}
                  aria-label={`Slide ${idx + 1}`}
                  onClick={() => setActiveSlide(idx)}
                />
              ))}
            </div>
          </div>

          <div className="hero-stats">
            <div><strong>4.98/5</strong><span>Rider Score</span></div>
            <div><strong>50,000+</strong><span>Escapes Logged</span></div>
            <div><strong>100%</strong><span>32-Point Check</span></div>
            <div><strong>24/7</strong><span>Ride Concierge</span></div>
          </div>

          <div className="search-shell glass">
            <form className="search-form" id="search-form" onSubmit={handleSearchSubmit}>
              <div className="field">
                <label>PICKUP CITY</label>
                <div className="field-select-wrap">
                  <span className="field-icon">📍</span>
                  <select id="city" value={city} onChange={e => setCity(e.target.value)}>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Goa">Goa Coast</option>
                    <option value="Manali">Manali</option>
                    <option value="Leh">Leh Ladakh</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>PICKUP DATE</label>
                <div className="field-select-wrap">
                  <span className="field-icon">📅</span>
                  <input
                    id="start"
                    type="date"
                    min={today}
                    value={startDate}
                    onChange={e => handlePickupChange(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="field">
                <label>RETURN DATE</label>
                <div className="field-select-wrap">
                  <span className="field-icon">📅</span>
                  <input
                    id="end"
                    type="date"
                    min={minReturn}
                    value={endDate}
                    onChange={e => handleReturnChange(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="field">
                <label>VEHICLE CLASS</label>
                <div className="field-select-wrap">
                  <span className="field-icon">⚡</span>
                  <select id="type" value={vehicleClass} onChange={e => setVehicleClass(e.target.value)}>
                    <option value="All">All Categories</option>
                    <option value="Touring">Touring</option>
                    <option value="Cruiser">Cruiser</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Sport">Sport</option>
                    <option value="Roadster">Roadster</option>
                    <option value="Scooter">Scooter</option>
                  </select>
                </div>
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
                Find Available Rides →
              </button>
            </form>
            <DateErrorNotice error={dateValidation.error} style={{ marginTop: '12px' }} />
          </div>
        </div>
      </section>

      {/* Curated Fleet Section */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Curated Fleet</span>
              <h2>Precision engineered. <span className="serif">Meticulously maintained.</span></h2>
            </div>
            <Link className="view-link" to="/bikes">
              View All 33+ Vehicles
            </Link>
          </div>
          <div className="bike-grid">
            {curatedBikes.map((bike, idx) => (
              <BikeCard key={bike.id} bike={bike} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* Expedition Zones */}
      <section className="section" style={{ background: 'var(--surface)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Expedition Zones</span>
              <h2>Curated routes. <span className="serif">Unmatched vistas.</span></h2>
            </div>
            <Link className="view-link" to="/destinations">
              View All Expeditions
            </Link>
          </div>
          <div className="destination-grid">
            <Link
              to="/destinations?dest=ladakh"
              state={{ cardImg: '/assets/images/destinations/card-ladakh-pass.jpg' }}
              className="dest-card"
            >
              <img
                src="/assets/images/destinations/card-ladakh-pass.jpg"
                alt="Leh Ladakh Pass"
                className="dest-card-bg"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="dest-overlay"></div>
              
              <div className="dest-card-top">
                <span className="dest-card-badge">
                  <span className="dest-card-badge-dot"></span>
                  Himalayan High Pass
                </span>
                <span className="dest-card-arrow-circle" aria-hidden="true">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </span>
              </div>

              <div className="dest-content">
                <span className="dest-card-eyebrow">18,380 FT ELEVATION</span>
                <h3 className="dest-title">Leh Ladakh Pass</h3>
                <div className="dest-subtitle">High altitude passes, Khardung La &amp; Pangong Tso lake.</div>
                <div className="dest-tags">
                  <span className="dest-tag">May — Sep</span>
                  <span className="dest-tag">14°C Crisp ❄️</span>
                  <span className="dest-tag dest-tag-extreme">Difficulty: Extreme</span>
                </div>
              </div>
            </Link>

            <Link
              to="/destinations?dest=spiti"
              state={{ cardImg: '/assets/images/destinations/card-spiti-monastery.jpg' }}
              className="dest-card"
            >
              <img
                src="/assets/images/destinations/card-spiti-monastery.jpg"
                alt="Spiti Valley"
                className="dest-card-bg"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="dest-overlay"></div>
              
              <div className="dest-card-top">
                <span className="dest-card-badge">
                  <span className="dest-card-badge-dot"></span>
                  Trans-Himalayan Desert
                </span>
                <span className="dest-card-arrow-circle" aria-hidden="true">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </span>
              </div>

              <div className="dest-content">
                <span className="dest-card-eyebrow">CHANDRATAL &amp; KAZA</span>
                <h3 className="dest-title">Spiti Valley</h3>
                <div className="dest-subtitle">Rugged cold desert trails, ancient monasteries &amp; riverbeds.</div>
                <div className="dest-tags">
                  <span className="dest-tag">Jun — Oct</span>
                  <span className="dest-tag">12°C Dry 🏔️</span>
                  <span className="dest-tag dest-tag-hard">Difficulty: Hard</span>
                </div>
              </div>
            </Link>

            <Link
              to="/destinations?dest=goa"
              state={{ cardImg: '/assets/images/destinations/card-goa-beach.jpg' }}
              className="dest-card"
            >
              <img
                src="/assets/images/destinations/card-goa-beach.jpg"
                alt="Goa Coastal Drive"
                className="dest-card-bg"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="dest-overlay"></div>
              
              <div className="dest-card-top">
                <span className="dest-card-badge">
                  <span className="dest-card-badge-dot"></span>
                  Arabian Sea Coast
                </span>
                <span className="dest-card-arrow-circle" aria-hidden="true">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </span>
              </div>

              <div className="dest-content">
                <span className="dest-card-eyebrow">KONKAN HIGHWAY ESCAPE</span>
                <h3 className="dest-title">Goa Coastal Drive</h3>
                <div className="dest-subtitle">Palm-fringed sea highways, cliff overlooks &amp; sunset rides.</div>
                <div className="dest-tags">
                  <span className="dest-tag">Oct — Mar</span>
                  <span className="dest-tag">28°C Sunny 🌊</span>
                  <span className="dest-tag dest-tag-easy">Difficulty: Easy</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Band */}
      <section className="stats-band">
        <div className="container">
          <div className="stats-grid">
            <div className="stat"><strong>50k+</strong><span>rides completed</span></div>
            <div className="stat"><strong>18</strong><span>expedition hubs</span></div>
            <div className="stat"><strong>4.98/5</strong><span>rider satisfaction</span></div>
            <div className="stat"><strong>100%</strong><span>telemetry verified</span></div>
          </div>
        </div>
      </section>
    </main>
  );
}
