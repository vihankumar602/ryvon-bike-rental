import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { bikes } from '../data/bikes';
import '../styles/urban-striker.css';

export default function UrbanStriker() {
  const navigate = useNavigate();
  const { openModal } = useModal();
  const { toast } = useToast();

  // Recommended Fleet Data
  const fleet = [
    {
      id: 'speed400',
      name: 'Triumph Speed 400',
      tagline: 'Agile • Stylish • City-Ready',
      image: '/assets/images/triumph-speed-400.png',
      isTopPick: true
    },
    {
      id: 'hunter',
      name: 'Royal Enfield Hunter 350',
      tagline: 'Lightweight • Nimble • Versatile',
      image: '/assets/images/royal-enfield-hunter-350.png',
      isTopPick: false
    },
    {
      id: 'duke',
      name: 'KTM 250 Duke',
      tagline: 'Sharp • Responsive • Fun',
      image: '/assets/images/ktm-duke-390.jpg',
      isTopPick: false
    },
    {
      id: 'x440',
      name: 'Yezdi Roadster',
      tagline: 'Urban • Sporty • Refined',
      image: '/assets/images/velora-roadster.png',
      isTopPick: false
    }
  ];

  const [selectedBikeIndex, setSelectedBikeIndex] = useState(0);

  // Urban Routes Data
  const urbanRoutes = [
    {
      id: 'blr-loop',
      name: 'Bengaluru City Loop',
      distance: '58 km',
      duration: '2-3 hrs',
      terrain: 'Urban',
      image: '/assets/images/urban-striker-hero.jpg'
    },
    {
      id: 'mum-marine',
      name: 'Mumbai Coastal Boulevard',
      distance: '42 km',
      duration: '1.5 hrs',
      terrain: 'Coastal Highway',
      image: '/assets/images/urban-striker-hero.jpg'
    },
    {
      id: 'del-ridge',
      name: 'Delhi Aerocity - Ridge Run',
      distance: '48 km',
      duration: '2 hrs',
      terrain: 'Urban Corridor',
      image: '/assets/images/urban-striker-hero.jpg'
    }
  ];

  const [activeRouteIndex, setActiveRouteIndex] = useState(0);

  const handlePrevBike = () => {
    setSelectedBikeIndex(prev => (prev === 0 ? fleet.length - 1 : prev - 1));
  };

  const handleNextBike = () => {
    setSelectedBikeIndex(prev => (prev === fleet.length - 1 ? 0 : prev + 1));
  };

  const handleBookBike = (bike) => {
    // Locate full bike in bikes catalog if available
    const matched = bikes.find(b => b.id === bike.id || b.name.toLowerCase().includes(bike.name.toLowerCase())) || bikes[0];
    openModal('quick-book', { bike: matched, bikeId: matched.id });
  };

  const handleRoutePlay = (route) => {
    toast(`🗺️ Previewing ${route.name} (${route.distance}) telemetry & turn-by-turn waypoints!`);
  };

  const activeBike = fleet[selectedBikeIndex];
  const activeRoute = urbanRoutes[activeRouteIndex];

  return (
    <main className="urban-striker-page" tabIndex="-1">
      <div className="container">

        {/* 1. Top Back Navigation Bar */}
        <div className="urban-top-back-bar">
          <button
            type="button"
            className="urban-back-link"
            onClick={() => navigate('/profile')}
            aria-label="Back to Rider DNA Profile"
          >
            ← Back to Rider DNA
          </button>
        </div>

        {/* 2. Hero Section */}
        <section className="urban-striker-hero" aria-label="Urban Striker Profile Hero">
          <div className="urban-hero-content">
            <div className="urban-hero-badge">
              <span role="img" aria-label="Building">🏛️</span> URBAN STRIKER PROFILE
            </div>
            <h1 className="urban-hero-title">
              Urban <span className="striker-italic">Striker</span>
            </h1>
            <p className="urban-hero-subtitle">
              The city is your playground. Agile, stylish, and always in control — built for dynamic urban riding and everyday adventures.
            </p>

            <div className="urban-hero-pills-row">
              <div className="urban-hero-pill">
                <span className="pill-icon-gold">🏛️</span> City Mobility
              </div>
              <div className="urban-hero-pill">
                <span className="pill-icon-gold">⚡</span> Quick &amp; Nimble
              </div>
              <div className="urban-hero-pill">
                <span className="pill-icon-gold">🛣️</span> Daily Commuting
              </div>
            </div>
          </div>
        </section>

        {/* 3. Row 1 Grid: Rider DNA Match + Recommended Fleet */}
        <div className="urban-grid-row-1">

          {/* Card A: Rider DNA Match */}
          <div className="urban-card urban-dna-card">
            <div className="urban-card-header">
              <div className="urban-card-title-wrap">
                <h2 className="urban-card-title">
                  <span className="card-title-icon-gold">🎯</span> Rider DNA Match
                </h2>
              </div>
            </div>

            <div className="urban-dna-body">
              {/* Circular SVG Match Gauge: 94% */}
              <div className="urban-gauge-wrap" aria-label="94% DNA Match Gauge">
                <svg className="urban-gauge-svg" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="9"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="9"
                    strokeDasharray="283"
                    strokeDashoffset="17"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="urban-gauge-center">
                  <span className="gauge-pct">94%</span>
                  <span className="gauge-lbl">Match</span>
                </div>
              </div>

              {/* DNA Traits List */}
              <div className="urban-dna-traits-list">
                <div className="urban-dna-trait-item">
                  <span className="trait-check-gold">✓</span>
                  <span>Urban Navigation</span>
                </div>
                <div className="urban-dna-trait-item">
                  <span className="trait-check-gold">✓</span>
                  <span>Agile Handling</span>
                </div>
                <div className="urban-dna-trait-item">
                  <span className="trait-check-gold">✓</span>
                  <span>Daily Commuting</span>
                </div>
                <div className="urban-dna-trait-item">
                  <span className="trait-check-gold">✓</span>
                  <span>Traffic Efficiency</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card B: Recommended Fleet for Urban Strikers */}
          <div className="urban-card urban-fleet-card">
            <div className="urban-card-header">
              <div className="urban-card-title-wrap">
                <h2 className="urban-card-title">
                  <span className="card-title-icon-gold">🏍️</span> Recommended Fleet for Urban Strikers
                </h2>
              </div>
              <Link to="/bikes" className="urban-link-btn" title="Explore all recommended motorcycles">
                View All Recommended →
              </Link>
            </div>

            <div className="urban-fleet-carousel-wrap">
              {/* Navigation Arrows */}
              <button
                type="button"
                className="fleet-nav-arrow-btn arrow-prev"
                onClick={handlePrevBike}
                aria-label="Previous motorcycle"
              >
                ‹
              </button>

              <div className="urban-fleet-cards-row">
                {fleet.map((bike, idx) => {
                  const isSelected = selectedBikeIndex === idx;
                  return (
                    <div
                      key={bike.id}
                      className={`urban-bike-item-card ${isSelected ? 'is-top-pick' : ''}`}
                      onClick={() => {
                        setSelectedBikeIndex(idx);
                        handleBookBike(bike);
                      }}
                      role="button"
                      tabIndex="0"
                      aria-pressed={isSelected}
                      title={`Click to inspect & reserve ${bike.name}`}
                    >
                      {/* Top Pick Badge on selected/featured bike */}
                      {isSelected ? (
                        <span className="urban-top-pick-badge">
                          👑 Top Pick
                        </span>
                      ) : (
                        <div style={{ height: '21px' }} />
                      )}

                      <div className="urban-bike-img-wrap">
                        <img
                          src={bike.image}
                          alt={bike.name}
                          className="urban-bike-img"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/assets/images/royal-enfield-hunter-350.png';
                          }}
                        />
                      </div>

                      <div className="urban-bike-meta">
                        <div className="urban-bike-model-name">{bike.name}</div>
                        <div className="urban-bike-tagline">{bike.tagline}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                className="fleet-nav-arrow-btn arrow-next"
                onClick={handleNextBike}
                aria-label="Next motorcycle"
              >
                ›
              </button>
            </div>
          </div>

        </div>

        {/* 4. Row 2 Grid: Environment + Routes + Setup */}
        <div className="urban-grid-row-2">

          {/* Card C: Ideal Riding Environment */}
          <div className="urban-card urban-env-card">
            <div className="urban-card-header">
              <div className="urban-card-title-wrap">
                <h2 className="urban-card-title">
                  <span className="card-title-icon-gold">🏛️</span> Ideal Riding Environment
                </h2>
              </div>
            </div>

            <div className="urban-env-body">
              <div className="urban-env-thumb-wrap">
                <img
                  src="/assets/images/urban-striker-hero.jpg"
                  alt="City streets and flyovers at night"
                  className="urban-env-thumb"
                  style={{ objectPosition: '20% 50%', transform: 'scale(1.25)' }}
                  loading="lazy"
                />
              </div>

              <div className="urban-env-list">
                <div className="urban-env-item">
                  <span className="env-icon-gold">🏛️</span>
                  <span>City Streets &amp; Flyovers</span>
                </div>
                <div className="urban-env-item">
                  <span className="env-icon-gold">🛣️</span>
                  <span>Short &amp; Mid-distance Rides</span>
                </div>
                <div className="urban-env-item">
                  <span className="env-icon-gold">💼</span>
                  <span>Daily Commute &amp; Work Rides</span>
                </div>
                <div className="urban-env-item">
                  <span className="env-icon-gold">☕</span>
                  <span>Weekend City Escapes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card D: Recommended Urban Routes */}
          <div className="urban-card urban-routes-card">
            <div className="urban-card-header">
              <div className="urban-card-title-wrap">
                <h2 className="urban-card-title">
                  <span className="card-title-icon-gold">📍</span> Recommended Urban Routes
                </h2>
              </div>
              <Link to="/destinations" className="urban-link-btn" title="View all urban route destinations">
                View Routes →
              </Link>
            </div>

            <div
              className="urban-route-hero-card"
              style={{
                backgroundImage: `url('${activeRoute.image}')`,
                backgroundPosition: 'center 45%'
              }}
              onClick={() => handleRoutePlay(activeRoute)}
            >
              <div className="urban-route-scrim" />

              <button
                type="button"
                className="route-play-btn"
                aria-label={`Preview ${activeRoute.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoutePlay(activeRoute);
                }}
              >
                ▶
              </button>

              <div className="route-bottom-content">
                <h3 className="route-name">{activeRoute.name}</h3>
                <div className="route-metrics">
                  <span>🛣️ {activeRoute.distance}</span>
                  <span className="metric-sep">|</span>
                  <span>⏱️ {activeRoute.duration}</span>
                  <span className="metric-sep">|</span>
                  <span>🏛️ {activeRoute.terrain}</span>
                </div>
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="route-dots-row" role="tablist" aria-label="Urban routes selector">
              {urbanRoutes.map((r, rIdx) => (
                <button
                  key={r.id}
                  type="button"
                  className={`route-dot ${rIdx === activeRouteIndex ? 'active-dot' : 'inactive-dot'}`}
                  onClick={() => setActiveRouteIndex(rIdx)}
                  aria-label={`Select route ${r.name}`}
                  role="tab"
                  aria-selected={rIdx === activeRouteIndex}
                />
              ))}
            </div>
          </div>

          {/* Card E: Riding Setup & Preferences */}
          <div className="urban-card urban-setup-card">
            <div className="urban-card-header">
              <div className="urban-card-title-wrap">
                <h2 className="urban-card-title">
                  <span className="card-title-icon-gold">⚙️</span> Riding Setup &amp; Preferences
                </h2>
              </div>
            </div>

            <div className="urban-setup-rows-wrap">
              <div className="urban-setup-row">
                <span className="setup-label">
                  <span className="setup-label-icon">🏍️</span> Ride Style
                </span>
                <span className="setup-value-pill">Agile &amp; Responsive</span>
              </div>

              <div className="urban-setup-row">
                <span className="setup-label">
                  <span className="setup-label-icon">💺</span> Seat Preference
                </span>
                <span className="setup-value-pill">Low / Mid</span>
              </div>

              <div className="urban-setup-row">
                <span className="setup-label">
                  <span className="setup-label-icon">🌀</span> Suspension
                </span>
                <span className="setup-value-pill">Balanced (City + Some Rough)</span>
              </div>

              <div className="urban-setup-row">
                <span className="setup-label">
                  <span className="setup-label-icon">📦</span> Accessories
                </span>
                <span className="setup-value-pill">Commuter Pack, Smartphone Mount</span>
              </div>
            </div>
          </div>

        </div>

        {/* 5. Bottom Banner: Personalize Your Urban Striker Experience */}
        <section className="urban-personalize-banner" aria-label="Personalize Your Urban Striker Experience">
          <div className="urban-personalize-left">
            <div className="personalize-icon-ring" aria-hidden="true">
              🎯
            </div>
            <div className="personalize-text">
              <h2 className="personalize-title">Personalize Your Urban Striker Experience</h2>
              <p className="personalize-subtitle">
                Fine-tune your bike, add accessories, and get AI-powered route suggestions for your city rides.
              </p>
            </div>
          </div>

          <div className="urban-personalize-actions">
            <Link
              to="/build-my-ride"
              className="urban-ghost-btn"
              title="Open AI Custom Ride Architect"
            >
              <span>⚙️</span> Customize My Ride
            </Link>
            <button
              type="button"
              className="urban-primary-btn"
              onClick={() => handleBookBike(activeBike)}
              title="Instant express booking for Urban Striker fleet"
            >
              <span>🛣️</span> Plan an Urban Ride
            </button>
          </div>
        </section>

      </div>
    </main>
  );
}
