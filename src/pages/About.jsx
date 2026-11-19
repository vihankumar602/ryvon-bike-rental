import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <main id="app" tabIndex="-1">
      <div className="brand-story-page">
        {/* 1. Full-Width Cinematic Hero with Proper Centered Container */}
        <section className="brand-story-hero">
          <div className="brand-story-hero-overlay"></div>
          <div className="brand-story-container">
            <div className="brand-story-hero-content">
              <nav className="breadcrumbs brand-story-breadcrumbs">
                <span className="brand-story-bread-bar"></span>
                <Link to="/">Home</Link>
                <span>/</span>
                <span>Brand Story</span>
              </nav>
              <h1 className="brand-story-hero-title">
                Engineered for the <span className="serif brand-hero-accent">scenic detour.</span>
              </h1>
              <p className="brand-story-hero-desc">
                RYVON was created to deliver world-class motorcycle and scooter rental experiences with uncompromised quality, 32-point inspection, and AI route intelligence.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Clean Editorial Philosophy & The RYVON Standard */}
        <section className="brand-story-philosophy">
          <div className="brand-story-container">
            <div className="brand-story-philosophy-grid">
              <div className="brand-story-phil-left">
                <div className="brand-story-eyebrow-row">
                  <span className="brand-story-gold-bar"></span>
                  <span className="eyebrow brand-story-eyebrow">OUR PHILOSOPHY</span>
                </div>
                <h2 className="brand-story-heading">
                  Built for the ride <span className="serif">beyond the obvious.</span>
                </h2>
                <p className="brand-story-p">
                  RYVON is built around a simple idea: renting a motorcycle should feel like the beginning of an adventure, not a transaction.
                </p>
                <p className="brand-story-p muted">
                  From high-altitude mountain passes to coastal highways, we make it easier to choose the right machine and the right road.
                </p>
              </div>

              <div className="brand-story-phil-right">
                <div className="brand-story-standard-panel">
                  <div className="brand-story-standard-top">
                    <span className="brand-story-standard-tag">⚡ THE RYVON STANDARD</span>
                    <span className="brand-story-standard-sub">Fleet Charter</span>
                  </div>
                  <div className="brand-story-standard-list">
                    <div className="brand-story-std-item">
                      <span className="brand-story-std-num">01</span>
                      <div className="brand-story-std-content">
                        <strong>32-POINT INSPECTION</strong>
                        <span>Checked before handover.</span>
                      </div>
                    </div>
                    <div className="brand-story-std-item">
                      <span className="brand-story-std-num">02</span>
                      <div className="brand-story-std-content">
                        <strong>VERIFIED RIDES</strong>
                        <span>Condition &amp; readiness verified.</span>
                      </div>
                    </div>
                    <div className="brand-story-std-item">
                      <span className="brand-story-std-num">03</span>
                      <div className="brand-story-std-content">
                        <strong>SMART ROUTES</strong>
                        <span>Intelligence for better journeys.</span>
                      </div>
                    </div>
                    <div className="brand-story-std-item">
                      <span className="brand-story-std-num">04</span>
                      <div className="brand-story-std-content">
                        <strong>READY TO RIDE</strong>
                        <span>Streamlined digital pickup.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Why RYVON Specification Cards */}
        <section className="brand-story-why">
          <div className="brand-story-container">
            <div className="brand-story-why-header">
              <div>
                <div className="brand-story-eyebrow-row">
                  <span className="brand-story-gold-bar"></span>
                  <span className="eyebrow brand-story-eyebrow">THE RYVON STANDARD</span>
                </div>
                <h2 className="brand-story-why-title">Why RYVON?</h2>
              </div>
              <p className="brand-story-why-desc">Engineered for better rides, from pickup to the open road.</p>
            </div>
            <div className="brand-story-why-grid">
              <div className="brand-story-why-card">
                <div className="brand-story-card-accent"></div>
                <span className="brand-story-card-idx">01</span>
                <strong>32-POINT</strong>
                <span>Inspection</span>
              </div>
              <div className="brand-story-why-card">
                <div className="brand-story-card-accent"></div>
                <span className="brand-story-card-idx">02</span>
                <strong>VERIFIED</strong>
                <span>Ride readiness</span>
              </div>
              <div className="brand-story-why-card">
                <div className="brand-story-card-accent"></div>
                <span className="brand-story-card-idx">03</span>
                <strong>SMART</strong>
                <span>Route intelligence</span>
              </div>
              <div className="brand-story-why-card">
                <div className="brand-story-card-accent"></div>
                <span className="brand-story-card-idx">04</span>
                <strong>READY</strong>
                <span>Seamless pickup</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Compact Premium CTA Strip */}
        <section className="brand-story-cta">
          <div className="brand-story-container">
            <div className="brand-story-cta-strip">
              <div className="brand-story-cta-text">
                <span className="eyebrow brand-story-cta-eyebrow">START YOUR DETOUR</span>
                <h3>Your next detour is waiting.</h3>
                <p>Explore the fleet and find your next ride.</p>
              </div>
              <div className="brand-story-cta-action">
                <Link className="btn btn-primary brand-story-cta-btn" to="/bikes">
                  Explore Fleet →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
