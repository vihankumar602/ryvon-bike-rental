import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FAQ_CATEGORIES, FAQ_DATA } from '../data/faqs';

const INITIAL_VISIBLE_COUNT = 6;

export default function Faq() {
  const [activeCat, setActiveCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(0); // Question 0 open by default
  const [expandAll, setExpandAll] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 340);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset pagination when category or search changes
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
    setExpandAll(false);
  }, [activeCat, searchQuery]);

  const toggleItem = (idx) => {
    if (expandAll) {
      setExpandAll(false);
    }
    setExpandedId(prev => (prev === idx ? null : idx));
  };

  const handleToggleAll = () => {
    if (expandAll) {
      setExpandAll(false);
      setExpandedId(null);
    } else {
      setExpandAll(true);
      setExpandedId(null);
    }
  };

  const handleChipClick = (term) => {
    if (searchQuery.toLowerCase() === term.toLowerCase()) {
      setSearchQuery('');
    } else {
      setSearchQuery(term);
    }
  };

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return FAQ_DATA.map((item, originalIndex) => ({ ...item, originalIndex })).filter(item => {
      if (q) {
        const fullTxt = `${item.q} ${item.a} ${item.tag}`.toLowerCase();
        return fullTxt.includes(q);
      }
      if (activeCat === 'all') return true;
      return item.cat === activeCat;
    });
  }, [activeCat, searchQuery]);

  const displayedFaqs = useMemo(() => {
    return filteredFaqs.slice(0, visibleCount);
  }, [filteredFaqs, visibleCount]);

  return (
    <main id="app" className="ryvon-faq-page" tabIndex="-1">
      {/* 1. CINEMATIC HD HERO SECTION (Preserved strictly as requested) */}
      <section className="faq-cinematic-hero">
        <div className="faq-hero-mountains-layer" aria-hidden="true">
          <img
            src="/assets/images/faq-hero-himalayan-hd.jpg"
            alt="Touring motorcycle on Himalayan mountain road"
            className="faq-hero-mountains-img"
          />
          <div className="faq-hero-gradient-scrim" />
        </div>

        <div className="container faq-hero-inner-container">
          {/* Top Gold Pill Badge */}
          <div className="faq-hero-badge-pill">
            <span className="faq-badge-icon">🎧</span>
            <span>HELP CENTER &amp; FAQ</span>
          </div>

          {/* Master Headline */}
          <h1 className="faq-hero-headline">
            Find Answers. <span className="faq-headline-gold-italic">Ride Confidently.</span>
          </h1>

          {/* Subtitle */}
          <p className="faq-hero-subtext">
            Your one-stop hub for bookings, documents, safety, payments, and everything about riding with RYVON.
          </p>

          {/* Compact Search Capsule */}
          <div className="faq-search-capsule-wrap">
            <span className="faq-search-lens-icon" aria-hidden="true">🔍</span>
            <input
              type="text"
              id="faq-search-input"
              className="faq-search-capsule-input"
              placeholder="Search for answers... (e.g., license, deposit, safety, cancellation)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoComplete="off"
              aria-label="Search FAQ knowledge base"
            />
            {searchQuery ? (
              <button
                type="button"
                className="faq-search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
              >
                ✕
              </button>
            ) : null}
            <button
              type="button"
              className="faq-search-gold-submit-btn"
              onClick={() => {
                const el = document.getElementById('faq-content-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              aria-label="Submit search"
            >
              →
            </button>
          </div>

          {/* Popular Topic Chips */}
          <div className="faq-popular-topics-row">
            <span className="faq-popular-label">Popular Topics:</span>
            <div className="faq-popular-chips-list">
              <button
                type="button"
                className={`faq-popular-chip ${searchQuery.toLowerCase() === 'deposit' ? 'active' : ''}`}
                onClick={() => handleChipClick('deposit')}
              >
                <span className="faq-chip-icon">🛡️</span> Escrow Deposit
              </button>
              <button
                type="button"
                className={`faq-popular-chip ${searchQuery.toLowerCase() === 'licence' || searchQuery.toLowerCase() === 'license' ? 'active' : ''}`}
                onClick={() => handleChipClick('licence')}
              >
                <span className="faq-chip-icon">💳</span> Driving Licence
              </button>
              <button
                type="button"
                className={`faq-popular-chip ${searchQuery.toLowerCase() === 'gear' || searchQuery.toLowerCase() === 'high-altitude' ? 'active' : ''}`}
                onClick={() => handleChipClick('gear')}
              >
                <span className="faq-chip-icon">⚠️</span> High-Altitude Gear
              </button>
              <button
                type="button"
                className={`faq-popular-chip ${searchQuery.toLowerCase() === 'cancellation' ? 'active' : ''}`}
                onClick={() => handleChipClick('cancellation')}
              >
                <span className="faq-chip-icon">✖</span> Cancellation
              </button>
              <button
                type="button"
                className={`faq-popular-chip ${searchQuery.toLowerCase() === 'refund' ? 'active' : ''}`}
                onClick={() => handleChipClick('refund')}
              >
                <span className="faq-chip-icon">🔄</span> Refunds
              </button>
            </div>
          </div>

          {/* 4 Feature / Trust Highlights Bar */}
          <div className="faq-hero-trust-highlights-grid" aria-label="RYVON Trust Guarantees">
            <div className="faq-trust-highlight-card">
              <div className="faq-trust-icon-box trust-shield">🛡️</div>
              <div className="faq-trust-info">
                <span className="faq-trust-title">32-Point Safety Audit</span>
                <span className="faq-trust-desc">Mechanically certified fleet</span>
              </div>
            </div>
            <div className="faq-trust-highlight-card">
              <div className="faq-trust-icon-box trust-lightning">⚡</div>
              <div className="faq-trust-info">
                <span className="faq-trust-title">24h Escrow Release</span>
                <span className="faq-trust-desc">100% automated refund</span>
              </div>
            </div>
            <div className="faq-trust-highlight-card">
              <div className="faq-trust-icon-box trust-helmet">🪖</div>
              <div className="faq-trust-info">
                <span className="faq-trust-title">Sanitized ECE Helmets</span>
                <span className="faq-trust-desc">Included free with every ride</span>
              </div>
            </div>
            <div className="faq-trust-highlight-card">
              <div className="faq-trust-icon-box trust-sos">🆘</div>
              <div className="faq-trust-info">
                <span className="faq-trust-title">24/7 Highway SOS</span>
                <span className="faq-trust-desc">500+ highway corridors</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REFINED THREE-COLUMN CONTENT SECTION (Strictly Targeted) */}
      <section className="faq-content-section" id="faq-content-section">
        <div className="container">
          <div className="faq-3col-layout-grid">
            {/* ========================================================
                COLUMN 1: LEFT CATEGORY NAVIGATION (~22%)
                ======================================================== */}
            <aside className="faq-col-nav">
              <div className="faq-nav-card">
                <div className="faq-nav-header">
                  <div className="faq-nav-header-left">
                    <span className="faq-nav-header-icon">📑</span>
                    <h3 className="faq-nav-title">Categories</h3>
                  </div>
                  <span className="faq-nav-total-badge">{FAQ_DATA.length}</span>
                </div>

                <nav className="faq-nav-list" aria-label="FAQ Categories">
                  {FAQ_CATEGORIES.map(cat => {
                    const count = cat.id === 'all'
                      ? FAQ_DATA.length
                      : FAQ_DATA.filter(x => x.cat === cat.id).length;
                    const isActive = activeCat === cat.id && !searchQuery;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        className={`faq-nav-item ${isActive ? 'active' : ''}`}
                        onClick={() => {
                          setActiveCat(cat.id);
                          setSearchQuery('');
                        }}
                      >
                        <span className="faq-nav-item-icon">{cat.icon}</span>
                        <span className="faq-nav-item-label">{cat.label}</span>
                        <span className="faq-nav-item-count">{count}</span>
                        {isActive && <span className="faq-nav-active-arrow" aria-hidden="true">›</span>}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* ========================================================
                COLUMN 2: CENTER MAIN FAQ CONTENT (~53%)
                ======================================================== */}
            <section className="faq-col-main" aria-label="Frequently Asked Questions">
              {/* Header with Title and Expand All Action */}
              <div className="faq-main-header">
                <div className="faq-main-header-text">
                  <div className="faq-most-asked-eyebrow">
                    <span className="faq-eyebrow-line">─</span> MOST ASKED QUESTIONS <span className="faq-eyebrow-line">─</span>
                  </div>
                  <h2 className="faq-main-heading">
                    Frequently Asked <span className="faq-serif-gold-italic">Questions</span>
                  </h2>
                  <p className="faq-main-subtitle">
                    Everything you need to know before, during and after your ride.
                  </p>
                </div>

                <div className="faq-main-header-actions">
                  <span className="faq-results-counter">
                    Showing {displayedFaqs.length} of {filteredFaqs.length} Questions
                  </span>
                  <button
                    type="button"
                    className="faq-expand-all-pill"
                    onClick={handleToggleAll}
                    aria-label={expandAll ? 'Collapse all questions' : 'Expand all questions'}
                  >
                    <span>{expandAll ? 'Collapse All' : 'Expand All'}</span>
                    <span className="faq-expand-symbol">{expandAll ? '⊖' : '⊕'}</span>
                  </button>
                </div>
              </div>

              {/* Search Active Indicator */}
              {searchQuery && (
                <div className="faq-search-status-bar">
                  <span>Found {filteredFaqs.length} question{filteredFaqs.length === 1 ? '' : 's'} matching "{searchQuery}"</span>
                  <button
                    type="button"
                    className="faq-search-reset-btn"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Filter
                  </button>
                </div>
              )}

              {/* Questions Accordion List (Initial 6 Displayed) */}
              {displayedFaqs.length > 0 ? (
                <div className="faq-questions-stack" role="region" aria-label="Questions list">
                  {displayedFaqs.map((item) => {
                    const isOpen = expandAll ? true : expandedId === item.originalIndex;

                    return (
                      <article
                        key={item.originalIndex}
                        className={`faq-card ${isOpen ? 'active-expanded' : ''}`}
                      >
                        <button
                          type="button"
                          className="faq-card-bar"
                          aria-expanded={isOpen}
                          onClick={() => toggleItem(item.originalIndex)}
                        >
                          <span className={`faq-q-icon-box faq-icon-box-${item.cat}`} aria-hidden="true">
                            {item.icon || '📄'}
                          </span>
                          <span className="faq-card-question-text">{item.q}</span>
                          <span className={`faq-card-toggle-pill ${isOpen ? 'pill-open' : 'pill-closed'}`} aria-hidden="true">
                            {isOpen ? '−' : '+'}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="faq-card-content">
                            {item.hasDocGraphic || item.originalIndex === 0 ? (
                              <div className="faq-doc-answer-layout">
                                <div className="faq-doc-thumb-box">
                                  <img
                                    src="/assets/images/faq-docs-graphic.png"
                                    alt="Indian Passport and Driving Licence Verification"
                                    className="faq-doc-thumb-img"
                                  />
                                </div>
                                <div className="faq-doc-text-block">
                                  <p className="faq-doc-answer-p">
                                    You need a valid <strong>driving licence</strong> (with motorcycle gear/MCWG endorsement), a government-issued ID (Aadhaar/Passport/Voter ID), and a security deposit (refundable). For international riders, a valid passport and <strong>International Driving Permit (IDP)</strong> are required.
                                  </p>
                                  <div className="faq-doc-quick-chips">
                                    <span className="faq-doc-chip">
                                      <strong className="chip-label">Domestic Riders:</strong> Valid DL (MCWG) + Govt ID + Escrow Deposit
                                    </span>
                                    <span className="faq-doc-chip">
                                      <strong className="chip-label">International Riders:</strong> Valid Passport + 1949/1968 IDP + Card Escrow
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div
                                className="faq-answer-rich-content"
                                dangerouslySetInnerHTML={{ __html: item.a }}
                              />
                            )}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="faq-empty-search-card">
                  <span className="faq-empty-lens">🔍</span>
                  <h3>No matching questions found</h3>
                  <p>Try searching with terms like <em>license, deposit, helmet, insurance, Spiti,</em> or <em>SOS</em>.</p>
                  <button
                    type="button"
                    className="faq-empty-view-all-btn"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCat('all');
                    }}
                  >
                    View All Questions
                  </button>
                </div>
              )}

              {/* Bottom Section: Pagination & Load More Controls */}
              {filteredFaqs.length > INITIAL_VISIBLE_COUNT && (
                <div className="faq-pagination-bar">
                  <div className="faq-pagination-progress">
                    <span className="faq-pagination-counter">
                      Showing {displayedFaqs.length} of {filteredFaqs.length} Questions
                    </span>
                    <div className="faq-progress-track">
                      <div
                        className="faq-progress-fill"
                        style={{ width: `${(displayedFaqs.length / filteredFaqs.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="faq-pagination-buttons">
                    {visibleCount < filteredFaqs.length ? (
                      <>
                        <button
                          type="button"
                          className="faq-load-more-btn"
                          onClick={() => setVisibleCount(prev => Math.min(prev + 6, filteredFaqs.length))}
                        >
                          Load More Questions (+6)
                        </button>
                        <button
                          type="button"
                          className="faq-view-all-btn"
                          onClick={() => setVisibleCount(filteredFaqs.length)}
                        >
                          View All ({filteredFaqs.length})
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="faq-collapse-btn"
                        onClick={() => {
                          setVisibleCount(INITIAL_VISIBLE_COUNT);
                          const el = document.getElementById('faq-content-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                      >
                        Show Less (Collapse to 6)
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom Section: Reassurance Footer Strip */}
              <div className="faq-reassurance-strip">
                <div className="faq-reassurance-group">
                  <span className="faq-reassurance-icon" aria-hidden="true">💬</span>
                  <div className="faq-reassurance-text">
                    <h4 className="faq-reassurance-title">Can't find the exact answer you're looking for?</h4>
                    <p className="faq-reassurance-desc">
                      Our 24/7 Ride Command Hub is standing by to assist with routes, permits, and reservations.
                    </p>
                  </div>
                </div>
                <Link to="/contact" className="faq-reassurance-btn">
                  Contact Command Hub →
                </Link>
              </div>
            </section>

            {/* ========================================================
                COLUMN 3: RIGHT CUSTOMER SUPPORT CARD (~25%)
                ======================================================== */}
            <aside className="faq-col-support">
              <div className="faq-support-card">
                {/* Small sharp motorcycle adventure image */}
                <div className="faq-support-img-header">
                  <img
                    src="/assets/images/faq-support-rider.jpg"
                    alt="Motorcycle adventure on mountain summit"
                    className="faq-support-img"
                  />
                  <div className="faq-support-scrim" />
                </div>

                <div className="faq-support-content">
                  {/* Glowing headphone badge */}
                  <div className="faq-support-headset-badge" aria-hidden="true">
                    <span>🎧</span>
                  </div>

                  <h3 className="faq-support-title">Still Need Help?</h3>
                  <p className="faq-support-desc">
                    Speak directly with our support crew or trip planners.
                  </p>

                  {/* Primary Gold Call Button */}
                  <a href="tel:18007986699" className="faq-support-call-btn">
                    <span>📞</span> Call 1800-RYVON-RIDE
                  </a>

                  {/* Secondary Message Button */}
                  <Link to="/contact" className="faq-support-msg-btn">
                    <span>💬</span> Message Command Hub <span className="faq-arrow-icon">→</span>
                  </Link>

                  {/* Compact 24/7 Dispatch Live Status */}
                  <div className="faq-dispatch-card">
                    <div className="faq-dispatch-header-row">
                      <div className="faq-dispatch-live-tag">
                        <span className="faq-green-dot" />
                        <strong>24/7 Dispatch Live</strong>
                      </div>
                      <div className="faq-mini-soundwave" aria-hidden="true">
                        <span /><span /><span /><span /><span />
                      </div>
                    </div>
                    <span className="faq-dispatch-caption">
                      Real-time trip &amp; roadside support
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Back to Top Floating Button */}
      {showBackToTop && (
        <button
          type="button"
          className="faq-back-to-top-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll back to top"
        >
          ↑
        </button>
      )}
    </main>
  );
}
