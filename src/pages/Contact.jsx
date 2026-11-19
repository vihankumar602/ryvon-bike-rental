import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function Contact() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Booking & Availability');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    toast('Message dispatched to 24/7 Ride Command. Concierge response in ~15 mins.');
    setName('');
    setPhone('');
    setEmail('');
    setMessage('');
  };

  return (
    <main id="app" className="ryvon-contact-page" tabIndex="-1">
      <div className="contact-master-hub">
        {/* 1. CINEMATIC MOUNTAIN SUNSET HERO */}
        <section className="contact-master-hero">
          <div className="contact-hero-mountains-bg" aria-hidden="true">
            <img
              src="/assets/images/contact-hero-backdrop.jpg"
              alt="Himalayan Sunset Highway Adventure Rider"
              className="contact-hero-img"
            />
            <div className="contact-hero-gradient-overlay" />
          </div>

          <div className="contact-hero-container">
            <div className="contact-hero-content-col">
              {/* Breadcrumb Navigation */}
              <nav className="contact-breadcrumbs" aria-label="Breadcrumbs">
                <span className="contact-bread-icon">🏠</span>
                <Link to="/" className="contact-bread-link">Home</Link>
                <span className="contact-bread-sep">/</span>
                <span className="contact-bread-current">Contact Command</span>
              </nav>

              {/* Gold Pill Badge */}
              <div className="contact-hero-pill-badge">
                <span className="contact-badge-icon">🎧</span>
                <span>CONTACT COMMAND</span>
              </div>

              {/* Main Headline */}
              <h1 className="contact-hero-title">
                24/7 Ride <span className="contact-title-gold-italic">Command Hub.</span>
              </h1>

              {/* Subtitle */}
              <p className="contact-hero-desc">
                Our telematics and support team is ready to assist with reservations, route tips, and roadside assistance — anytime, anywhere across India.
              </p>

              {/* 3 Pill Badges */}
              <div className="contact-hero-chips-row">
                <div className="contact-hero-chip">
                  <span className="contact-chip-icon">24/7</span>
                  <span>24/7 Support</span>
                </div>
                <div className="contact-hero-chip">
                  <span className="contact-chip-icon">📍</span>
                  <span>Route Guidance</span>
                </div>
                <div className="contact-hero-chip">
                  <span className="contact-chip-icon">⚠️</span>
                  <span>Roadside Help</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. MAIN BALANCED 2-COLUMN CONTACT SECTION */}
        <section className="contact-main-grid-section">
          <div className="contact-grid-container">
            <div className="contact-3col-master-layout contact-2col-layout">
              {/* LEFT COLUMN: SEND A MESSAGE (~60%) */}
              <div className="contact-card-col contact-form-column">
                <div className="contact-form-card-master">
                  <div className="contact-form-header">
                    <span className="contact-eyebrow-tag">
                      <span className="tag-icon">✉️</span> INSTANT DISPATCH
                    </span>
                    <h2 className="contact-card-headline">
                      Send a <span className="contact-title-gold-italic">Message</span>
                    </h2>
                    <p className="contact-form-subtext">
                      Have a question, need assistance, or want to plan your next ride? Drop us a message — we usually respond within 15 minutes.
                    </p>
                  </div>

                  <form id="contact-form" className="contact-master-form" onSubmit={handleSubmit}>
                    {/* Row 1: Full Name & Contact Number */}
                    <div className="contact-form-double-row">
                      <div className="contact-field-wrap">
                        <label htmlFor="contact-name">
                          Full Name <span className="field-req">*</span>
                        </label>
                        <div className="contact-input-box">
                          <span className="contact-input-icon">👤</span>
                          <input
                            type="text"
                            id="contact-name"
                            name="name"
                            required
                            placeholder="Captain Rider"
                            className="contact-text-input"
                            value={name}
                            onChange={e => setName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="contact-field-wrap">
                        <label htmlFor="contact-phone">
                          Contact Number <span className="field-req">*</span>
                        </label>
                        <div className="contact-input-box">
                          <span className="contact-input-icon">📞</span>
                          <input
                            type="tel"
                            id="contact-phone"
                            name="phone"
                            required
                            placeholder="+91 98765 43210"
                            className="contact-text-input"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Email Address */}
                    <div className="contact-field-wrap">
                      <label htmlFor="contact-email">
                        Email Address <span className="field-req">*</span>
                      </label>
                      <div className="contact-input-box">
                        <span className="contact-input-icon">✉️</span>
                        <input
                          type="email"
                          id="contact-email"
                          name="email"
                          required
                          placeholder="rider@domain.com"
                          className="contact-text-input"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Row 3: Subject Dropdown */}
                    <div className="contact-field-wrap">
                      <label htmlFor="contact-subject">
                        Subject <span className="field-req">*</span>
                      </label>
                      <div className="contact-input-box select-box">
                        <span className="contact-input-icon">🏍️</span>
                        <select
                          id="contact-subject"
                          name="subject"
                          required
                          className="contact-select-input"
                          value={subject}
                          onChange={e => setSubject(e.target.value)}
                        >
                          <option value="Booking & Availability">Booking &amp; Availability</option>
                          <option value="Expedition Route Planning">Expedition Route Planning</option>
                          <option value="Fleet & Customization">Fleet &amp; Customization</option>
                          <option value="Roadside Assistance & SOS">Roadside Assistance &amp; SOS</option>
                          <option value="Refund & Escrow Query">Refund &amp; Escrow Query</option>
                          <option value="Corporate / Group Tour">Corporate / Group Tour</option>
                        </select>
                        <span className="contact-select-chevron">▾</span>
                      </div>
                    </div>

                    {/* Row 4: Message Textarea */}
                    <div className="contact-field-wrap">
                      <label htmlFor="contact-message">
                        Message <span className="field-req">*</span>
                      </label>
                      <div className="contact-input-box textarea-box">
                        <span className="contact-input-icon textarea-icon">💬</span>
                        <textarea
                          id="contact-message"
                          name="message"
                          required
                          rows="4"
                          placeholder="How can our Ride Command assist you today?"
                          className="contact-textarea-input"
                          value={message}
                          onChange={e => setMessage(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Primary Submit Button */}
                    <button className="contact-send-gold-btn" type="submit">
                      <span className="send-icon">✈</span> Send Message →
                    </button>

                    {/* Security Footnote */}
                    <div className="contact-security-footnote">
                      <span className="lock-icon">🔒</span> Your information is secure and encrypted.
                    </div>
                  </form>
                </div>
              </div>

              {/* RIGHT COLUMN: DIRECT ASSISTANCE (~40%) */}
              <div className="contact-card-col contact-channels-column">
                <div className="contact-channels-header">
                  <span className="contact-channels-eyebrow">
                    <span className="tag-icon">🔗</span> COMMAND CHANNELS
                  </span>
                  <h2 className="contact-channels-headline">Direct Assistance</h2>
                  <p className="contact-channels-subtext">
                    Connect immediately with dedicated dispatch marshals, trip coordinators, and roadside response.
                  </p>
                </div>

                <div className="contact-channels-list">
                  {/* Card 1: Hotline */}
                  <div className="contact-channel-card">
                    <div className="contact-channel-icon-circle phone">
                      <span>📞</span>
                    </div>
                    <div className="contact-channel-details">
                      <span className="contact-channel-label">HOTLINE</span>
                      <strong className="contact-channel-value">+91 1800-RYVON-RIDE</strong>
                      <span className="contact-channel-sub">Mon – Sun, 24/7 Emergency Line</span>
                    </div>
                    <a
                      href="tel:18007986699"
                      className="contact-channel-action-btn gold"
                      aria-label="Call Hotline"
                    >
                      <span>📞</span>
                    </a>
                  </div>

                  {/* Card 2: Email Support */}
                  <div className="contact-channel-card">
                    <div className="contact-channel-icon-circle email">
                      <span>✉️</span>
                    </div>
                    <div className="contact-channel-details">
                      <span className="contact-channel-label">EMAIL SUPPORT</span>
                      <strong className="contact-channel-value">support@ryvon.com</strong>
                      <span className="contact-channel-sub">Priority response in ~15 mins</span>
                    </div>
                    <a
                      href="mailto:support@ryvon.com"
                      className="contact-channel-action-btn outline"
                      aria-label="Email Support"
                    >
                      <span>↗</span>
                    </a>
                  </div>

                  {/* Card 3: Headquarters */}
                  <div className="contact-channel-card">
                    <div className="contact-channel-icon-circle location">
                      <span>📍</span>
                    </div>
                    <div className="contact-channel-details">
                      <span className="contact-channel-label">HEADQUARTERS</span>
                      <strong className="contact-channel-value">Indiranagar Tech Corridor</strong>
                      <span className="contact-channel-sub">Bengaluru, KA 560038, India</span>
                    </div>
                    <a
                      href="https://maps.google.com/?q=Indiranagar,Bengaluru"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-channel-action-btn outline"
                      aria-label="View Headquarters on Map"
                    >
                      <span>↗</span>
                    </a>
                  </div>
                </div>

                {/* Live Support Status Card */}
                <div className="contact-live-status-card">
                  <div className="contact-live-status-left">
                    <div className="contact-live-pill">
                      <span className="contact-pulse-green-dot" />
                      <span>Live Support Status</span>
                    </div>
                    <h3 className="contact-live-title">24/7 Dispatch Online</h3>
                    <p className="contact-live-sub">Real-time ride &amp; roadside assistance</p>
                  </div>

                  <div className="contact-live-status-right">
                    <img
                      src="/assets/images/contact-headset-wave.png"
                      alt="Gold Headset and Audio Waveform"
                      className="contact-headset-visual-img"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. COMPACT HORIZONTAL FLEET ASSURANCE SECTION (BELOW 2-COLUMN GRID) */}
            <div className="contact-assurance-card-master contact-assurance-horizontal">
              <div className="contact-assurance-horizontal-inner">
                {/* Assurance Title & Eyebrow */}
                <div className="contact-assurance-header">
                  <span className="contact-eyebrow-tag gold">
                    <span className="tag-icon">⚡</span> FLEET ASSURANCE
                  </span>
                  <h2 className="contact-card-headline">
                    Ride with <span className="contact-title-gold-italic">Confidence.</span>
                  </h2>
                  <p className="contact-assurance-subtext">
                    Every motorcycle in the RYVON fleet is mechanically vetted, telematics-monitored, and backed by comprehensive coverage.
                  </p>
                </div>

                {/* 4 Assurance Checkmark Points */}
                <ul className="contact-assurance-points-list">
                  <li className="contact-point-item">
                    <span className="contact-point-check">✓</span>
                    <span>Verified &amp; insured fleet</span>
                  </li>
                  <li className="contact-point-item">
                    <span className="contact-point-check">✓</span>
                    <span>32-point inspection</span>
                  </li>
                  <li className="contact-point-item">
                    <span className="contact-point-check">✓</span>
                    <span>Real-time telematics</span>
                  </li>
                  <li className="contact-point-item">
                    <span className="contact-point-check">✓</span>
                    <span>Expert travel support</span>
                  </li>
                </ul>

                {/* Horizontal Statistics Panel with 3 Sections */}
                <div className="contact-stats-panel-trio">
                  <div className="contact-stat-box">
                    <span className="contact-stat-icon">🏍️</span>
                    <strong className="contact-stat-val">24/7</strong>
                    <span className="contact-stat-lbl">Support</span>
                  </div>

                  <div className="contact-stat-sep" />

                  <div className="contact-stat-box">
                    <span className="contact-stat-icon">🛡️</span>
                    <strong className="contact-stat-val">99.9%</strong>
                    <span className="contact-stat-lbl">Uptime</span>
                  </div>

                  <div className="contact-stat-sep" />

                  <div className="contact-stat-box">
                    <span className="contact-stat-icon">👥</span>
                    <strong className="contact-stat-val">10K+</strong>
                    <span className="contact-stat-lbl">Riders Assisted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
