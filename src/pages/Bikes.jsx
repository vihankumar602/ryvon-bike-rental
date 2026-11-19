import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import { useModal } from '../context/ModalContext';
import { bikes } from '../data/bikes';
import BikeCard from '../components/bikes/BikeCard';

const FLEET_ITEMS_PER_PAGE = 12;

const BRAND_LIST = [
  'All Brands', 'Honda', 'TVS', 'Suzuki', 'Yamaha', 'Royal Enfield',
  'Triumph', 'BMW', 'KTM', 'Kawasaki', 'Harley-Davidson', 'Ducati'
];

const CATEGORY_STYLES = [
  {
    id: 'all',
    name: 'All Bikes',
    count: 34,
    icon: '🏍️',
    img: '/assets/images/destinations/gokarna-om-beach-sunset.jpg'
  },
  {
    id: 'Adventure',
    name: 'Adventure',
    count: 8,
    icon: '🏔️',
    img: '/assets/images/destinations/cat-mountain-hd.jpg'
  },
  {
    id: 'Cruiser',
    name: 'Cruiser',
    count: 6,
    icon: '🌊',
    img: '/assets/images/destinations/cat-desert-hd.jpg'
  },
  {
    id: 'Sport',
    name: 'Sport',
    count: 7,
    icon: '⚡',
    img: '/assets/images/ryvon-cinematic-sport.png'
  },
  {
    id: 'Touring',
    name: 'Touring',
    count: 5,
    icon: '🛣️',
    img: '/assets/images/destinations/ladakh-pangong-tso.jpg'
  },
  {
    id: 'Scooter',
    name: 'Scooter',
    count: 4,
    icon: '🛵',
    img: '/assets/images/destinations/kanyakumari-memorial-sunset.jpg'
  },
  {
    id: 'Commuter',
    name: 'Commuter',
    count: 4,
    icon: '🏙️',
    img: '/assets/images/destinations/cat-forest-hd.jpg'
  }
];

export default function Bikes() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { money } = useCurrency();
  const { openModal } = useModal();

  // Initial params
  const initialQ = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || '';
  const initialBrand = searchParams.get('brand') || 'All Brands';

  // Filters state
  const [searchTerm, setSearchTerm] = useState(initialQ);
  const [activeCategory, setActiveCategory] = useState(initialType || 'all');
  const [activeBrand, setActiveBrand] = useState(initialBrand);
  const [maxPrice, setMaxPrice] = useState(4000);
  const [selectedTrans, setSelectedTrans] = useState([]);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Booking bar state
  const [activeTab, setActiveTab] = useState('rent');
  const [pickupCity, setPickupCity] = useState('Bengaluru');
  const [datesSelected, setDatesSelected] = useState('Select Dates');

  // Accordion toggle states in sidebar
  const [brandOpen, setBrandOpen] = useState(true);
  const [catOpen, setCatOpen] = useState(true);
  const [transOpen, setTransOpen] = useState(true);

  const handleResetFilters = () => {
    setSearchTerm('');
    setActiveCategory('all');
    setActiveBrand('All Brands');
    setMaxPrice(4000);
    setSelectedTrans([]);
    setAvailableOnly(false);
    setSortBy('popular');
    setCurrentPage(1);
  };

  // Filtered bikes calculation
  const filteredBikes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    let list = bikes.filter(bike => {
      // 1. Daily Budget
      if (bike.price > maxPrice) return false;

      // 2. Keyword Search
      if (term) {
        const fullTxt = `${bike.name} ${bike.brand} ${bike.type}`.toLowerCase();
        if (!fullTxt.includes(term)) return false;
      }

      // 3. Brand Filter
      if (activeBrand !== 'All Brands' && bike.brand !== activeBrand) return false;

      // 4. Category / Ride Style Filter
      if (activeCategory !== 'all') {
        if (activeCategory === 'Commuter') {
          if (bike.type !== 'Roadster' && bike.type !== 'Commuter') return false;
        } else if (bike.type !== activeCategory) {
          return false;
        }
      }

      // 5. Transmission
      if (selectedTrans.length > 0 && !selectedTrans.includes(bike.transmission)) {
        return false;
      }

      // 6. Availability
      if (availableOnly && !bike.available) return false;

      return true;
    });

    // Sorting logic
    if (sortBy === 'low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [searchTerm, activeCategory, activeBrand, maxPrice, selectedTrans, availableOnly, sortBy]);

  const totalVehicles = bikes.length;
  const totalPages = Math.ceil(filteredBikes.length / FLEET_ITEMS_PER_PAGE) || 1;
  const paginatedBikes = filteredBikes.slice(
    (currentPage - 1) * FLEET_ITEMS_PER_PAGE,
    currentPage * FLEET_ITEMS_PER_PAGE
  );

  return (
    <main id="app" className="ryvon-fleet-page" tabIndex="-1">
      {/* =====================================================================
          1. CINEMATIC SUNRISE HERO SECTION
          ===================================================================== */}
      <section className="fleet-cinematic-hero">
        <div className="fleet-hero-bg-layer" aria-hidden="true">
          <img
            src="/assets/images/fleet-hero-sunrise.jpg"
            alt="Himalayan Mountain Sunrise Adventure Rider"
            className="fleet-hero-backdrop-img"
          />
          <div className="fleet-hero-gradient-scrim" />
        </div>

        <div className="fleet-hero-inner-container">
          <div className="fleet-hero-left-column">
            {/* Eyebrow Tag */}
            <div className="fleet-eyebrow-wrap">
              <span className="fleet-eyebrow-line" />
              <span className="fleet-eyebrow-label">EXPLORE FLEET</span>
            </div>

            {/* Main Headline */}
            <h1 className="fleet-hero-headline">
              <span className="fleet-headline-serif">Find Your</span>{' '}
              <span className="fleet-headline-gold-italic">Next Ride</span>
            </h1>

            {/* Supporting Description */}
            <p className="fleet-hero-subtext">
              A premium fleet of adventure, tourer, and city motorcycles — curated for every terrain, every journey.
            </p>

            {/* Trust Metrics & How It Works CTA */}
            <div className="fleet-hero-trust-row">
              <div className="fleet-trust-item">
                <span className="fleet-trust-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFB000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="6"/>
                    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
                  </svg>
                </span>
                <div className="fleet-trust-text">
                  <strong className="fleet-trust-val">34+</strong>
                  <span className="fleet-trust-lbl">Premium Bikes</span>
                </div>
              </div>

              <div className="fleet-trust-item">
                <span className="fleet-trust-icon">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#FFB000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="m9 12 2 2 4-4"/>
                  </svg>
                </span>
                <div className="fleet-trust-text">
                  <strong className="fleet-trust-val">100%</strong>
                  <span className="fleet-trust-lbl">Verified Fleet</span>
                </div>
              </div>

              <div className="fleet-trust-item">
                <span className="fleet-trust-icon">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#FFB000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                  </svg>
                </span>
                <div className="fleet-trust-text">
                  <strong className="fleet-trust-val">Expert</strong>
                  <span className="fleet-trust-lbl">Maintenance</span>
                </div>
              </div>

              <div className="fleet-trust-item">
                <span className="fleet-trust-icon">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#FFB000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
                  </svg>
                </span>
                <div className="fleet-trust-text">
                  <strong className="fleet-trust-val">24/7</strong>
                  <span className="fleet-trust-lbl">Ride Support</span>
                </div>
              </div>

              <button
                className="fleet-how-it-works-btn"
                type="button"
                onClick={() => openModal('quick-book')}
                aria-label="Learn how RYVON motorcycle rental works"
              >
                <span className="play-triangle">▶</span>
                <span>How It Works</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. GLASSMORPHISM BOOKING & SEARCH BAR (FLOATING CAPSULE)
          ===================================================================== */}
      <section className="fleet-booking-bar-section">
        <div className="fleet-booking-bar-container">
          <div className="fleet-glass-booking-capsule">
            {/* Left Mode Tabs */}
            <div className="fleet-booking-tabs">
              <button
                type="button"
                className={`fleet-tab-btn ${activeTab === 'rent' ? 'active' : ''}`}
                onClick={() => setActiveTab('rent')}
              >
                <span className="tab-icon">🏍️</span>
                <span>Rent a Bike</span>
              </button>

              <button
                type="button"
                className={`fleet-tab-btn ${activeTab === 'trip' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('trip');
                  navigate('/destinations');
                }}
              >
                <span className="tab-icon">📍</span>
                <span>Plan by Trip</span>
              </button>

              <button
                type="button"
                className={`fleet-tab-btn ai-tab ${activeTab === 'ai' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('ai');
                  openModal('build-my-ride');
                }}
              >
                <span className="tab-icon">✦</span>
                <span>Build with AI</span>
              </button>
            </div>

            {/* Keyword Search Input */}
            <div className="fleet-booking-search-box">
              <span className="search-lens-icon">🔍</span>
              <input
                id="catalog-search"
                type="text"
                className="fleet-search-input"
                placeholder="Search bikes (e.g., KTM Adventure, Royal Enfield...)"
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Pickup Location Selector */}
            <div className="fleet-booking-select-group">
              <span className="group-icon">📍</span>
              <div className="group-content">
                <span className="group-label">Pickup Location</span>
                <select
                  className="fleet-booking-select"
                  value={pickupCity}
                  onChange={e => setPickupCity(e.target.value)}
                >
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Manali">Manali</option>
                  <option value="Leh">Leh</option>
                  <option value="Goa">Goa</option>
                  <option value="Jaipur">Jaipur</option>
                </select>
              </div>
            </div>

            {/* Rental Dates Selector */}
            <div
              className="fleet-booking-select-group dates-group"
              onClick={() => openModal('quick-book')}
            >
              <span className="group-icon">📅</span>
              <div className="group-content">
                <span className="group-label">Rental Dates</span>
                <span className="group-value">{datesSelected}</span>
              </div>
            </div>

            {/* Search Fleet Button */}
            <button
              className="fleet-search-cta-btn"
              type="button"
              onClick={() => {
                const el = document.getElementById('catalog-results-anchor');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span>Search Fleet</span>
              <span className="btn-arrow">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. BROWSE BY RIDE STYLE (7 IMAGE-BASED CATEGORY CARDS)
          ===================================================================== */}
      <section className="fleet-categories-section">
        <div className="fleet-categories-container">
          <div className="fleet-categories-header">
            <h2 className="fleet-categories-title">Browse by Ride Style</h2>
            <button
              type="button"
              className="fleet-view-all-link"
              onClick={() => {
                setActiveCategory('all');
                setCurrentPage(1);
              }}
            >
              <span>View All</span>
              <span>→</span>
            </button>
          </div>

          <div className="fleet-categories-grid">
            {CATEGORY_STYLES.map(cat => {
              const isActive = activeCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  className={`fleet-cat-card ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setCurrentPage(1);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setActiveCategory(cat.id);
                      setCurrentPage(1);
                    }
                  }}
                >
                  <div className="fleet-cat-img-wrap" aria-hidden="true">
                    <img
                      src={cat.img}
                      alt={cat.name}
                      className="fleet-cat-bg-img"
                      loading="lazy"
                    />
                    <div className="fleet-cat-gradient-scrim" />
                  </div>

                  <div className="fleet-cat-content">
                    <div className="fleet-cat-icon-circle">
                      <span>{cat.icon}</span>
                    </div>
                    <div className="fleet-cat-info">
                      <strong className="fleet-cat-name">{cat.name}</strong>
                      <span className="fleet-cat-count">({cat.count})</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Anchor for Smooth Scrolling */}
      <div id="catalog-results-anchor" style={{ position: 'relative', top: '-20px' }} />

      {/* =====================================================================
          4. MAIN 2-COLUMN FLEET LISTINGS (REFINE SIDEBAR + MOTORCYCLE GRID)
          ===================================================================== */}
      <section className="fleet-listings-main-section">
        <div className="fleet-listings-container">
          <div className="fleet-2col-layout">
            {/* LEFT SIDE: REFINE FLEET SIDEBAR */}
            <aside className={`fleet-refine-sidebar ${mobileFilterOpen ? 'open' : ''}`}>
              <div className="fleet-sidebar-header">
                <div className="fleet-sidebar-title-group">
                  <span className="sidebar-filter-icon">⚙️</span>
                  <h3 className="fleet-sidebar-title">Refine Fleet</h3>
                </div>
                <button
                  type="button"
                  className="fleet-reset-btn"
                  onClick={handleResetFilters}
                >
                  Reset
                </button>
              </div>

              {/* 1. Daily Budget Dual/Single Slider */}
              <div className="fleet-filter-block budget-block">
                <div className="fleet-filter-block-header">
                  <span className="fleet-filter-label">Daily Budget</span>
                  <span className="fleet-budget-value-tag" id="price-out">
                    {maxPrice >= 4000 ? `₹500 – ₹4,000+` : `Up to ${money(maxPrice)}`}
                  </span>
                </div>

                <div className="fleet-slider-wrapper">
                  <input
                    id="price"
                    type="range"
                    min="500"
                    max="4000"
                    step="100"
                    value={maxPrice}
                    aria-label="Max Daily Budget"
                    className="fleet-range-input"
                    onChange={e => {
                      setMaxPrice(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  />
                  <div className="fleet-slider-ticks">
                    <span>₹500</span>
                    <span>₹2,000</span>
                    <span>₹3,000</span>
                    <span>₹4,000+</span>
                  </div>
                </div>
              </div>

              {/* 2. Brand Filter Accordion */}
              <div className="fleet-filter-block accordion-block">
                <button
                  type="button"
                  className="fleet-accordion-trigger"
                  onClick={() => setBrandOpen(!brandOpen)}
                  aria-expanded={brandOpen}
                >
                  <span className="fleet-filter-label">Brand</span>
                  <span className="fleet-accordion-chevron">{brandOpen ? '▴' : '▾'}</span>
                </button>

                {brandOpen && (
                  <div className="fleet-accordion-content brand-options-list">
                    {BRAND_LIST.map(brand => {
                      const isSelected = activeBrand === brand;
                      return (
                        <label key={brand} className="fleet-checkbox-row">
                          <input
                            type="radio"
                            name="fleet-brand-radio"
                            checked={isSelected}
                            onChange={() => {
                              setActiveBrand(brand);
                              setCurrentPage(1);
                            }}
                            className="fleet-radio-input"
                          />
                          <span className="fleet-radio-custom" />
                          <span className="fleet-checkbox-text">{brand}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. Category Filter Accordion */}
              <div className="fleet-filter-block accordion-block">
                <button
                  type="button"
                  className="fleet-accordion-trigger"
                  onClick={() => setCatOpen(!catOpen)}
                  aria-expanded={catOpen}
                >
                  <span className="fleet-filter-label">Category</span>
                  <span className="fleet-accordion-chevron">{catOpen ? '▴' : '▾'}</span>
                </button>

                {catOpen && (
                  <div className="fleet-accordion-content category-options-list">
                    {['Adventure', 'Cruiser', 'Sport', 'Touring', 'Scooter', 'Roadster'].map(cat => {
                      const isSelected = activeCategory === cat;
                      return (
                        <label key={cat} className="fleet-checkbox-row">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setActiveCategory(isSelected ? 'all' : cat);
                              setCurrentPage(1);
                            }}
                            className="fleet-checkbox-input"
                          />
                          <span className="fleet-checkbox-custom" />
                          <span className="fleet-checkbox-text">{cat}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 4. Transmission Filter Accordion */}
              <div className="fleet-filter-block accordion-block">
                <button
                  type="button"
                  className="fleet-accordion-trigger"
                  onClick={() => setTransOpen(!transOpen)}
                  aria-expanded={transOpen}
                >
                  <span className="fleet-filter-label">Transmission</span>
                  <span className="fleet-accordion-chevron">{transOpen ? '▴' : '▾'}</span>
                </button>

                {transOpen && (
                  <div className="fleet-accordion-content trans-options-list">
                    {['Manual', 'Automatic'].map(trans => {
                      const isSelected = selectedTrans.includes(trans);
                      return (
                        <label key={trans} className="fleet-checkbox-row">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              if (isSelected) {
                                setSelectedTrans(selectedTrans.filter(t => t !== trans));
                              } else {
                                setSelectedTrans([...selectedTrans, trans]);
                              }
                              setCurrentPage(1);
                            }}
                            className="fleet-checkbox-input"
                          />
                          <span className="fleet-checkbox-custom" />
                          <span className="fleet-checkbox-text">{trans}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 5. Live Availability Filter */}
              <div className="fleet-filter-block availability-block">
                <label className="fleet-checkbox-row available-today-row">
                  <input
                    id="available"
                    type="checkbox"
                    checked={availableOnly}
                    onChange={e => {
                      setAvailableOnly(e.target.checked);
                      setCurrentPage(1);
                    }}
                    className="fleet-checkbox-input"
                  />
                  <span className="fleet-checkbox-custom" />
                  <span className="fleet-checkbox-text">⚡ Available Today</span>
                </label>
              </div>
            </aside>

            {/* RIGHT SIDE: MOTORCYCLE LISTINGS */}
            <div className="fleet-listings-column">
              {/* Top Control Bar: Count, View Mode, Sorting */}
              <div className="fleet-listings-topbar">
                <div className="fleet-result-count-wrap">
                  <p id="result-count" className="fleet-result-count">
                    {filteredBikes.length > 0 ? (
                      <>
                        Showing{' '}
                        <strong>
                          {(currentPage - 1) * FLEET_ITEMS_PER_PAGE + 1}–
                          {Math.min(currentPage * FLEET_ITEMS_PER_PAGE, filteredBikes.length)}
                        </strong>{' '}
                        of <strong>{totalVehicles}</strong> vehicles
                      </>
                    ) : (
                      <>No vehicles found</>
                    )}
                  </p>

                  <button
                    className="fleet-mobile-filter-btn"
                    type="button"
                    onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                  >
                    <span>⚙️ Filter Options</span>
                  </button>
                </div>

                <div className="fleet-tools-actions">
                  {/* Grid / List View Toggle */}
                  <div className="fleet-view-toggle">
                    <button
                      type="button"
                      className={`fleet-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setViewMode('grid')}
                      aria-label="Grid View"
                      title="4-Column Grid View"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="3" y="3" width="7" height="7" rx="1.5" />
                        <rect x="14" y="3" width="7" height="7" rx="1.5" />
                        <rect x="3" y="14" width="7" height="7" rx="1.5" />
                        <rect x="14" y="14" width="7" height="7" rx="1.5" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className={`fleet-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                      onClick={() => setViewMode('list')}
                      aria-label="List View"
                      title="List View"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="8" y1="6" x2="21" y2="6" />
                        <line x1="8" y1="12" x2="21" y2="12" />
                        <line x1="8" y1="18" x2="21" y2="18" />
                        <line x1="3" y1="6" x2="3.01" y2="6" />
                        <line x1="3" y1="12" x2="3.01" y2="12" />
                        <line x1="3" y1="18" x2="3.01" y2="18" />
                      </svg>
                    </button>
                  </div>

                  {/* Sorting Dropdown */}
                  <div className="fleet-sort-dropdown-wrap">
                    <label htmlFor="sort" className="visually-hidden">Sort bikes</label>
                    <span className="sort-label-prefix">Sort by:</span>
                    <select
                      id="sort"
                      className="fleet-sort-select"
                      value={sortBy}
                      onChange={e => {
                        setSortBy(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="popular">Most Popular</option>
                      <option value="low">Price: Low to High</option>
                      <option value="high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 4-Column Motorcycle Grid */}
              <div
                id="catalog"
                className={`fleet-motorcycle-grid ${viewMode === 'list' ? 'list-view' : ''}`}
              >
                {paginatedBikes.length > 0 ? (
                  paginatedBikes.map((bike, idx) => (
                    <BikeCard key={bike.id} bike={bike} index={idx} />
                  ))
                ) : (
                  <div className="fleet-no-results-card">
                    <span className="no-res-icon">🏍️</span>
                    <h3>No motorcycles match your current filter selection.</h3>
                    <p>Try widening your daily budget or selecting "All Bikes".</p>
                    <button
                      className="fleet-reset-all-btn"
                      type="button"
                      onClick={handleResetFilters}
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div id="fleet-pagination" className="fleet-pagination-wrap">
                  <button
                    className="fleet-page-btn prev-btn"
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage(p => Math.max(1, p - 1));
                      const el = document.getElementById('catalog-results-anchor');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    ← Prev
                  </button>

                  <div className="fleet-page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        type="button"
                        className={`fleet-page-number-btn ${page === currentPage ? 'active' : ''}`}
                        onClick={() => {
                          setCurrentPage(page);
                          const el = document.getElementById('catalog-results-anchor');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    className="fleet-page-btn next-btn"
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage(p => Math.min(totalPages, p + 1));
                      const el = document.getElementById('catalog-results-anchor');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
