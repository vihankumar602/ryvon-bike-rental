import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { destinations, destCategoryMeta, DEST_CATEGORIES, getCategoryCounts, matchesDestinationSeason } from '../data/destinations';
import { bikes, getBikeImage } from '../data/bikes';
import { useCurrency } from '../context/CurrencyContext';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

function getStateBadge(d) {
  const st = (d.state || '').toLowerCase();
  const id = (d.id || '').toLowerCase();
  if (st.includes('kashmir') || st.includes('jammu')) {
    return { icon: '⛰️', label: 'Jammu & Kashmir', className: 'dest-tag-green' };
  }
  if (st.includes('karnataka')) {
    return { icon: '📍', label: 'Karnataka', className: 'dest-tag-green' };
  }
  if (st.includes('rajasthan')) {
    return { icon: id.includes('jaisalmer') ? '🐪' : '🏰', label: 'Rajasthan', className: 'dest-tag-purple' };
  }
  if (st.includes('himachal') || st.includes('ladakh') || st.includes('uttarakhand')) {
    return { icon: '⛰️', label: d.state, className: 'dest-tag-blue' };
  }
  if (st.includes('goa') || st.includes('kerala') || st.includes('maharashtra')) {
    return { icon: '🌊', label: d.state, className: 'dest-tag-teal' };
  }
  return { icon: '📍', label: d.state || 'India', className: 'dest-tag-default' };
}

export default function Destinations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { money } = useCurrency();
  const { openModal } = useModal();
  const { toast } = useToast();
  const { wishes, toggleWish } = useWishlist();
  const { isAuthenticated } = useAuth();

  const destParam = searchParams.get('dest');

  // Selected single destination lookup (handles exact ID, name, aliases, or clean prefix/substring)
  const selectedDest = useMemo(() => {
    if (!destParam) return null;
    const p = destParam.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!p) return null;

    // 1. Exact ID
    let match = destinations.find(x => x.id.toLowerCase().replace(/[^a-z0-9]/g, '') === p);
    if (match) return match;

    // 2. Exact Name
    match = destinations.find(x => x.name.toLowerCase().replace(/[^a-z0-9]/g, '') === p);
    if (match) return match;

    // 3. Exact Alias
    match = destinations.find(x => (x.aliases || []).some(a => a.toLowerCase().replace(/[^a-z0-9]/g, '') === p));
    if (match) return match;

    // 4. Name contains query
    match = destinations.find(x => x.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(p));
    if (match) return match;

    // 5. ID contains query (e.g. 'kolli' -> 'kollihills')
    match = destinations.find(x => x.id.toLowerCase().replace(/[^a-z0-9]/g, '').includes(p));
    if (match) return match;

    // 6. Query contains ID (longest ID first to avoid prefix collisions like jaipur vs jaipur-to-jaisalmer)
    const idMatches = destinations.filter(x => {
      const cleanId = x.id.toLowerCase().replace(/[^a-z0-9]/g, '');
      return cleanId.length >= 3 && p.includes(cleanId);
    });
    if (idMatches.length > 0) {
      idMatches.sort((a, b) => b.id.length - a.id.length);
      return idMatches[0];
    }

    return destinations[0];
  }, [destParam]);

  // Catalog State
  const [activeCategory, setActiveCategory] = useState('all');
  const [seasonFilter, setSeasonFilter] = useState('all');
  const [diffFilter, setDiffFilter] = useState('all');
  const [terrainFilter, setTerrainFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // 4 destinations per page (1 row of 4 on desktop, matching target reference design)

  // Detail Page State
  const [activeTab, setActiveTab] = useState('overview');
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showItineraryModal, setShowItineraryModal] = useState(false);
  const [showSpecsModal, setShowSpecsModal] = useState(null);
  const [isFullscreenGallery, setIsFullscreenGallery] = useState(false);
  const [selectedBikeId, setSelectedBikeId] = useState('himalayan');
  const [pickupCity, setPickupCity] = useState('Jaipur Royal Hub');
  const [pickupDate, setPickupDate] = useState('2026-11-06');
  const [returnDate, setReturnDate] = useState('2026-11-10');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Card Image synchronization: prioritize state passed from clicked card, fallback to destination default
  const cardImg = location.state?.cardImg || selectedDest?.img || '';

  // Unconditionally called at top level — guarantees invariant hook call order
  const galleryImages = useMemo(() => {
    if (!selectedDest) return [];
    const rawGallery = Array.isArray(selectedDest.gallery) && selectedDest.gallery.length > 0
      ? selectedDest.gallery
      : [selectedDest.img, selectedDest.heroBackdrop || selectedDest.img];
    if (cardImg && rawGallery[0] !== cardImg) {
      return [cardImg, ...rawGallery.filter(img => img !== cardImg)];
    }
    return rawGallery;
  }, [selectedDest, cardImg]);

  // Tag body with data-page="destinations" for header & theme matching
  useEffect(() => {
    document.body.setAttribute('data-page', 'destinations');
    return () => {
      document.body.removeAttribute('data-page');
    };
  }, []);

  // Sync default pickup hub when destination changes
  useEffect(() => {
    if (selectedDest?.baseHub) {
      setPickupCity(selectedDest.baseHub);
    }
  }, [selectedDest]);

  // Reset active gallery image, tab, and smoothly reset scroll when opening or switching destination
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setActiveGalleryIdx(0);
    setActiveTab('overview');
  }, [destParam]);

  const tripDays = useMemo(() => {
    if (!pickupDate || !returnDate) return 4;
    const p = new Date(pickupDate);
    const r = new Date(returnDate);
    const diff = Math.ceil((r.getTime() - p.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [pickupDate, returnDate]);

  const counts = useMemo(() => getCategoryCounts(), []);

  // Filtered destinations list for catalog
  const filteredDestinations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return destinations.filter(d => {
      // Category filter
      if (activeCategory !== 'all' && d.cat !== activeCategory) {
        return false;
      }

      // Season filter
      if (seasonFilter !== 'all' && !matchesDestinationSeason(d, seasonFilter)) {
        return false;
      }

      // Difficulty filter
      if (diffFilter !== 'all') {
        const dDiff = (d.difficulty || '').toLowerCase();
        if (diffFilter === 'easy' && !dDiff.includes('easy')) return false;
        if (diffFilter === 'moderate' && !dDiff.includes('moderate')) return false;
        if (diffFilter === 'hard' && !(dDiff.includes('hard') || dDiff.includes('extreme'))) return false;
      }

      // Terrain filter
      if (terrainFilter !== 'all' && d.cat !== terrainFilter) {
        return false;
      }

      // Region filter
      if (regionFilter !== 'all') {
        const st = (d.state || '').toLowerCase();
        if (regionFilter === 'north' && !['jammu', 'kashmir', 'ladakh', 'himachal', 'uttarakhand', 'punjab'].some(s => st.includes(s))) return false;
        if (regionFilter === 'south' && !['karnataka', 'tamil nadu', 'kerala', 'puducherry', 'goa'].some(s => st.includes(s))) return false;
        if (regionFilter === 'west' && !['rajasthan', 'gujarat', 'maharashtra'].some(s => st.includes(s))) return false;
        if (regionFilter === 'east' && !['sikkim', 'meghalaya', 'assam', 'arunachal', 'bengal'].some(s => st.includes(s))) return false;
      }

      // Search query
      if (q) {
        const fullTxt = `${d.name} ${d.desc || ''} ${d.state || ''} ${d.terrainType || ''} ${d.elevation || ''}`.toLowerCase();
        if (!fullTxt.includes(q)) return false;
      }

      return true;
    });
  }, [activeCategory, seasonFilter, diffFilter, terrainFilter, regionFilter, searchQuery]);

  // Paginated slice
  const totalPages = Math.max(1, Math.ceil(filteredDestinations.length / itemsPerPage));
  const displayedDestinations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDestinations.slice(start, start + itemsPerPage);
  }, [filteredDestinations, currentPage]);

  const getPaginationPages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [];
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  // Dynamically calibrated recommended fleet for selected destination
  const recBikes = useMemo(() => {
    if (!selectedDest) return [];
    const cat = selectedDest.cat;
    let pool = [];

    if (cat === 'mountain') {
      pool = [
        { badge: '👑 Best Match', badgeType: 'best', bike: bikes.find(b => b.id === 'himalayan') || bikes[0], price: 1499 },
        { badge: '⚡ Performance', badgeType: 'perf', bike: bikes.find(b => b.id === 'ktmadv390') || bikes[1], price: 1749 },
        { badge: '🏷️ Budget Friendly', badgeType: 'budget', bike: bikes.find(b => b.id === 'scram411') || bikes[2], price: 1299 },
        { badge: '🏔️ Alpine Touring', badgeType: 'perf', bike: bikes.find(b => b.id === 'bmw310gs') || bikes[3], price: 1899 },
        { badge: '🌲 Scrambler Pro', badgeType: 'best', bike: bikes.find(b => b.id === 'scrambler400x') || bikes[0], price: 1649 },
        { badge: '🧭 Dual Sport', badgeType: 'budget', bike: bikes.find(b => b.id === 'meteor350') || bikes[2], price: 1199 }
      ];
    } else if (cat === 'forest') {
      pool = [
        { badge: '👑 Best Match', badgeType: 'best', bike: bikes.find(b => b.id === 'scrambler400x') || bikes[0], price: 1649 },
        { badge: '⚡ Agile Roadster', badgeType: 'perf', bike: bikes.find(b => b.id === 'speed400') || bikes[1], price: 1549 },
        { badge: '🏷️ Smooth Cruiser', badgeType: 'budget', bike: bikes.find(b => b.id === 'meteor350') || bikes[2], price: 1199 },
        { badge: '⛰️ All-Terrain', badgeType: 'best', bike: bikes.find(b => b.id === 'himalayan') || bikes[3], price: 1499 },
        { badge: '🏍️ Trail Master', badgeType: 'perf', bike: bikes.find(b => b.id === 'scram411') || bikes[2], price: 1299 },
        { badge: '☕ Classic Tourer', badgeType: 'budget', bike: bikes.find(b => b.id === 'classic350') || bikes[1], price: 1149 }
      ];
    } else if (cat === 'desert') {
      pool = [
        { badge: '👑 Best Match', badgeType: 'best', bike: bikes.find(b => b.id === 'himalayan') || bikes[0], price: 1499 },
        { badge: '⚡ Rally Pro', badgeType: 'perf', bike: bikes.find(b => b.id === 'ktmadv390') || bikes[1], price: 1749 },
        { badge: '🏷️ Highway Cruiser', badgeType: 'budget', bike: bikes.find(b => b.id === 'classic350') || bikes[2], price: 1149 },
        { badge: '🏰 Grand Tourer', badgeType: 'perf', bike: bikes.find(b => b.id === 'supermeteor') || bikes[3], price: 2199 },
        { badge: '🏜️ Scrambler', badgeType: 'best', bike: bikes.find(b => b.id === 'scrambler400x') || bikes[0], price: 1649 },
        { badge: '☀️ Comfort Cruiser', badgeType: 'budget', bike: bikes.find(b => b.id === 'meteor350') || bikes[1], price: 1199 }
      ];
    } else {
      // Coastal
      pool = [
        { badge: '👑 Best Match', badgeType: 'best', bike: bikes.find(b => b.id === 'meteor350') || bikes[0], price: 1199 },
        { badge: '⚡ Coast Cruiser', badgeType: 'perf', bike: bikes.find(b => b.id === 'supermeteor') || bikes[1], price: 2199 },
        { badge: '🏷️ Retro Classic', badgeType: 'budget', bike: bikes.find(b => b.id === 'classic350') || bikes[2], price: 1149 },
        { badge: '🌊 Urban Scrambler', badgeType: 'best', bike: bikes.find(b => b.id === 'scrambler400x') || bikes[3], price: 1649 },
        { badge: '🚀 Speedster', badgeType: 'perf', bike: bikes.find(b => b.id === 'speed400') || bikes[0], price: 1549 },
        { badge: '🌴 Adventure Tourer', badgeType: 'budget', bike: bikes.find(b => b.id === 'scram411') || bikes[2], price: 1299 }
      ];
    }

    return pool.map(item => ({
      ...item,
      engine: item.bike.engine || '452 cc',
      power: item.bike.power || '40 PS',
      weight: item.bike.weight || '196 kg',
      seat: item.bike.seat || '825 mm',
      deposit: item.bike.deposit || 3500
    }));
  }, [selectedDest]);

  const activeBike = useMemo(() => {
    return recBikes.find(r => r.bike.id === selectedBikeId) || recBikes[0] || null;
  }, [recBikes, selectedBikeId]);

  // Complete Day-by-Day Expedition Itinerary
  const destinationItinerary = useMemo(() => {
    if (!selectedDest) return [];
    const d = selectedDest;
    const stops = d.routeOverview || ['Base Hub', 'Waypoint 1', 'Waypoint 2', 'Summit'];
    return [
      {
        day: 'Day 01',
        title: `Flagoff from ${stops[0]} to ${stops[1] || 'Foothills'}`,
        distance: '~ 120 km',
        time: '3 – 4 Hours',
        notes: `Collect your fully inspected motorcycle at ${d.baseHub || 'the Hub'}. Complete orientation, telemetry sync, and embark on wide expressway tarmac as the scenery transitions.`,
        terrain: 'Smooth Multilane Asphalt'
      },
      {
        day: 'Day 02',
        title: `Ascent to ${stops[2] || 'High Passes'} & Scenic Hairpins`,
        distance: '~ 180 km',
        time: '5 – 6 Hours',
        notes: `Carve through technical sweepers, hairpin bends, and panoramic valley viewpoints. Roadside tea stops and telemetry elevation climbs.`,
        terrain: 'Winding Mountain / Ghats Twisties'
      },
      {
        day: 'Day 03',
        title: `Expedition Summit at ${stops[3] || stops[2] || 'The Destination'}`,
        distance: '~ 90 km',
        time: '3 – 4 Hours',
        notes: `Conquer the high summit point (${d.elevation}) and explore iconic landmarks: ${d.featureBadges?.map(b => b.label).join(', ') || 'verified scenic trails'}. Sunset photography and celebration camp.`,
        terrain: 'Summit Roadways & Offroad Detours'
      },
      {
        day: 'Day 04',
        title: `Return Loop to ${stops[0]} & Debrief`,
        distance: '~ 170 km',
        time: '4 – 5 Hours',
        notes: `Descend via alternate scenic loops, completing your journey with safe return to base hub, telemetry analysis, and security deposit release.`,
        terrain: 'Fast Return Highway Corridor'
      }
    ];
  }, [selectedDest]);

  // Scroll to booking card on detail page
  const scrollToBooking = () => {
    const el = document.getElementById('dest-booking-widget');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      openModal('quick-book');
    }
  };

  const handleBookNow = (bikeId) => {
    const targetUrl = `/booking?bike=${bikeId}&dest=${encodeURIComponent(selectedDest?.name || '')}&city=${encodeURIComponent(pickupCity)}`;
    if (!isAuthenticated) {
      const selectedBike = bikes.find(b => b.id === bikeId);
      const pendingBooking = {
        bikeId,
        bikeName: selectedBike?.name || 'Motorcycle',
        bikeImage: selectedBike ? getBikeImage(selectedBike) : '',
        pickupCity,
        pickupHub: pickupCity,
        destParam: selectedDest?.name || '',
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

  const handleShareDestination = () => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        toast('🔗 Destination link copied to clipboard!');
      } else {
        toast('🔗 ' + window.location.href);
      }
    } catch {
      toast('🔗 ' + window.location.href);
    }
  };

  // Suggested 5-Step Itinerary for lower content card
  const suggestedItinerary = useMemo(() => {
    if (!selectedDest) return [];
    const d = selectedDest;
    if (d.id === 'zanskar') {
      return [
        { day: 'Day 1', route: 'Manali → Darcha (135 km)' },
        { day: 'Day 2', route: 'Darcha → Shinkula (40 km)' },
        { day: 'Day 3', route: 'Shinkula → Padum (80 km)' },
        { day: 'Day 4–7', route: 'Zanskar Exploration (Monasteries, Local Rides)' },
        { day: 'Day 8', route: 'Padum → Kargil (230 km)' }
      ];
    }
    const stops = d.routeOverview && d.routeOverview.length >= 2
      ? d.routeOverview
      : [d.baseHub?.replace(/ (Alpine|Royal|Base|Tech|Coastal|Foothills) Hub/i, '') || 'Base Hub', 'Scenic Waypoint', d.name];
    const totalDist = parseInt(d.distance?.replace(/\D/g, '')) || 450;
    const daysNum = parseInt(d.idealDays) || 4;
    return [
      { day: 'Day 1', route: `${stops[0]} → ${stops[1] || 'Foothills'} (${Math.round(totalDist * 0.25)} km)` },
      { day: 'Day 2', route: `${stops[1] || 'Foothills'} → ${stops[2] || d.name} (${Math.round(totalDist * 0.35)} km)` },
      { day: 'Day 3', route: `${stops[2] || d.name} Summit & Iconic Passes (${Math.round(totalDist * 0.15)} km)` },
      { day: `Day 4–${Math.max(4, daysNum)}`, route: `${d.name} Scenic Exploration & Local Trails` },
      { day: `Day ${Math.max(5, daysNum + 1)}`, route: `Return Circuit → ${stops[0]} (${Math.round(totalDist * 0.25)} km)` }
    ];
  }, [selectedDest]);

  // Dynamic 5 Expedition Highlights for lower content card
  const expeditionHighlights = useMemo(() => {
    if (!selectedDest) return [];
    const d = selectedDest;
    if (d.id === 'zanskar') {
      return [
        `Cross the high-altitude Shinkula Pass (${d.elevation || '5,091 m'})`,
        'Explore ancient Zanskar monasteries',
        'Ride through barren, surreal landscapes',
        'Rivers, gorges and dramatic mountain views',
        'A true off-road Himalayan riding experience'
      ];
    }
    const badges = d.featureBadges?.map(b => b.label) || [];
    return [
      `Conquer the high-altitude ${d.name} (${d.elevation || 'Iconic Ridge'})`,
      badges[0] ? `Explore verified landmark at ${badges[0]}` : `Explore verified waypoints along ${d.name}`,
      `Ride through ${d.terrainType || 'scenic curves & sweeping panoramic landscapes'}`,
      d.photoSpot ? `Golden hour photography at ${d.photoSpot}` : `Dramatic mountain, coast & river valley perspectives`,
      `A curated, verified motorcycle touring route (${d.road || '70%+ Road Quality'})`
    ];
  }, [selectedDest]);

  // =========================================================================
  // 1. DESTINATION DOSSIER / DETAIL VIEW (Matches media_1793976813972_13962845.jpg)
  // =========================================================================
  if (selectedDest) {
    const d = selectedDest;
    const isWished = wishes.includes(d.id);

    // Active image driven by gallery thumbnails / arrows (initially cardImg at index 0)
    const safeGalleryIdx = activeGalleryIdx < galleryImages.length ? activeGalleryIdx : 0;
    const currentImg = galleryImages[safeGalleryIdx] || cardImg || d.img;

    // Split name for gold serif styling
    const nameParts = d.name.split('to');
    const hasTo = nameParts.length > 1;

    return (
      <main id="app" className="destination-detail-page" tabIndex="-1">
        {/* Breadcrumb Navigation */}
        <div className="dest-detail-container">
          <nav className="dest-detail-breadcrumb" aria-label="Breadcrumbs">
            <Link to="/">Home</Link>
            <span className="dest-breadcrumb-sep">/</span>
            <button
              type="button"
              className="dest-breadcrumb-link-btn"
              onClick={() => setSearchParams({})}
            >
              Destinations
            </button>
            <span className="dest-breadcrumb-sep">/</span>
            <span className="dest-breadcrumb-current">{d.name}</span>
          </nav>
        </div>

        {/* HERO SECTION */}
        <header
          className="dest-detail-hero"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(7, 10, 15, 0.4) 0%, rgba(7, 10, 15, 0.85) 85%, #070a0f 100%), url('${currentImg}')`
          }}
        >
          <div className="dest-hero-backdrop-glow" />
          <div className="dest-detail-container">
            {/* Top Right 4K ULTRA HD Badge */}
            <div className="dest-hero-4k-badge">
              <span className="dest-4k-icon">4K</span> ULTRA HD
            </div>

            <div className="dest-hero-content-split">
              {/* Left Column: Title & Telemetry */}
              <div className="dest-hero-main-col">
                <div className="dest-hero-badges-row">
                  <span className="dest-badge-expedition">
                    <span>⚠️</span> Expedition Route
                  </span>
                  <span className="dest-badge-season">
                    <span>📅</span> Best Season: {d.season}
                  </span>
                </div>

                {/* Mountain Contour SVG Icon */}
                <div className="dest-hero-mountain-contour" aria-hidden="true">
                  <svg viewBox="0 0 54 26" width="54" height="26" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2,24 16,8 24,18 36,4 52,24" />
                    <polyline points="10,14 18,6 28,16" />
                  </svg>
                </div>

                <h1 className="dest-hero-title">
                  {(() => {
                    if (d.name.includes('to')) {
                      const parts = d.name.split('to');
                      return (
                        <>
                          {parts[0].trim()} to <span className="dest-title-gold-italic">{parts[1].trim()}</span>
                        </>
                      );
                    }
                    const words = d.name.split(' ');
                    if (words.length > 1) {
                      const lastWord = words.pop();
                      return (
                        <>
                          {words.join(' ')} <span className="dest-title-gold-italic">{lastWord}</span>
                        </>
                      );
                    }
                    return <span className="dest-title-gold-italic">{d.name}</span>;
                  })()}
                </h1>

                <p className="dest-hero-sub">
                  {d.desc || 'High-altitude mountain wilderness, dramatic rock formations & remote monastery hamlets.'}
                </p>

                {/* 4 Telemetry Metrics */}
                <div className="dest-hero-meta-strip">
                  <div className="dest-meta-chip">
                    <span className="dest-meta-icon">⛰️</span>
                    <div className="dest-meta-info">
                      <strong>{d.elevation || '5,091 m'}</strong>
                      <span>Max Elevation</span>
                    </div>
                  </div>

                  <div className="dest-meta-chip">
                    <span className="dest-meta-icon">🛣️</span>
                    <div className="dest-meta-info">
                      <strong>{d.distance || '~ 890 km'}</strong>
                      <span>{d.distanceType || 'Round Trip'}</span>
                    </div>
                  </div>

                  <div className="dest-meta-chip">
                    <span className="dest-meta-icon">📅</span>
                    <div className="dest-meta-info">
                      <strong>{d.idealDays || '7 – 9 Days'}</strong>
                      <span>Ideal Duration</span>
                    </div>
                  </div>

                  <div className="dest-meta-chip">
                    <span className="dest-meta-icon">📊</span>
                    <div className="dest-meta-info">
                      <strong>{d.difficulty || 'Extreme'}</strong>
                      <span>Difficulty</span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="dest-hero-actions">
                  <button
                    type="button"
                    className="dest-btn-primary"
                    onClick={scrollToBooking}
                  >
                    <span>🏍️</span> Plan This Ride →
                  </button>

                  <button
                    type="button"
                    className={`dest-btn-outline ${isWished ? 'favorited' : ''}`}
                    onClick={() => {
                      toggleWish(d.id);
                      toast(isWished ? 'Removed from your Journeys' : '✨ Added to My Journeys!');
                    }}
                  >
                    <span>{isWished ? '❤️' : '♡'}</span> {isWished ? 'Saved in Journeys' : 'Add to My Journeys'}
                  </button>

                  <button
                    type="button"
                    className="dest-btn-share-icon"
                    onClick={handleShareDestination}
                    title="Share Destination Link"
                    aria-label="Share Destination Link"
                  >
                    <span>🔗</span>
                  </button>
                </div>
              </div>

              {/* Right Column: 4K Video Preview Pill */}
              <div className="dest-hero-preview-col">
                <button
                  type="button"
                  className="dest-route-preview-pill"
                  onClick={() => setShowVideoModal(true)}
                  aria-label="Watch Route Preview in 4K"
                >
                  <div className="dest-play-circle">
                    <span>▶</span>
                  </div>
                  <div className="dest-preview-text">
                    <strong>Watch Route Preview</strong>
                    <span>3:45 min | 4K Cinematic</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* STICKY NAVIGATION BAR */}
        <nav className="dest-sticky-nav-bar" aria-label="Route sections">
          <div className="dest-detail-container">
            <div className="dest-nav-tabs-wrap">
              {[
                { id: 'overview', label: 'Overview', icon: '🏠' },
                { id: 'itinerary', label: 'Route & Itinerary', icon: '📖' },
                { id: 'highlights', label: 'Highlights', icon: '✨' },
                { id: 'gallery', label: 'Gallery', icon: '🖼️' },
                { id: 'fleet', label: 'Fleet Match', icon: '🏍️' },
                { id: 'safety', label: 'Advisory & Safety', icon: '🛡️' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  className={`dest-nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'overview') {
                      const el = document.getElementById('dest-sec-overview');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else if (tab.id === 'itinerary') {
                      const el = document.getElementById('dest-card-itinerary');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } else if (tab.id === 'highlights') {
                      const el = document.getElementById('dest-card-highlights');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } else if (tab.id === 'gallery') {
                      const el = document.getElementById('dest-gallery-container');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } else if (tab.id === 'fleet') {
                      const el = document.getElementById('dest-card-rec-ride');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } else if (tab.id === 'safety') {
                      const el = document.getElementById('dest-sec-safety');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                >
                  <span>{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* MAIN BODY CONTENT */}
        <div className="dest-main-layout dest-detail-container">
          {/* TIER 1: 3-COLUMN OVERVIEW ROW (About, Interactive HD Gallery Carousel, Plan Your Ride) */}
          <section id="dest-sec-overview" className="dest-overview-top-3col">
            {/* Left Column: About & 4 Feature Badges */}
            <div className="dest-about-card-col">
              <div>
                <div className="dest-eyebrow-line">
                  <span className="dest-eyebrow-dash">—</span>
                  <span className="dest-eyebrow-text">EXPEDITION OVERVIEW</span>
                  <span className="dest-eyebrow-dash">—</span>
                </div>
                <h2 className="dest-about-title">
                  About <span className="dest-gold-serif-italic">This Expedition</span>
                </h2>
                <p className="dest-expedition-intro">
                  {d.aboutDesc || d.desc || 'One of the most rugged and raw adventure riding routes on planet earth, crossing the high passes into untouched landscapes.'}
                </p>
              </div>

              {/* 4 Feature Badges Grid */}
              <div className="dest-feature-badges-4grid">
                {(d.featureBadges || [
                  { label: 'High Passes', icon: '⛰️' },
                  { label: 'Monasteries', icon: '🏛️' },
                  { label: 'Valley Views', icon: '🌲' },
                  { label: 'Raw Adventure', icon: '🍃' }
                ]).slice(0, 4).map((badge, idx) => (
                  <div key={idx} className="dest-feature-badge-box">
                    <div className="dest-feature-badge-icon">{badge.icon}</div>
                    <span className="dest-feature-badge-label">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Center Column: Large HD Interactive Gallery Carousel */}
            <div id="dest-gallery-container" className="dest-gallery-center-col">
              <div className="dest-master-gallery-frame">
                <img
                  src={currentImg}
                  alt={`${d.name} View ${activeGalleryIdx + 1}`}
                  className="dest-master-gallery-img"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = cardImg;
                  }}
                />

                {/* Fullscreen Button */}
                <button
                  type="button"
                  className="dest-gallery-fs-btn"
                  onClick={() => setIsFullscreenGallery(true)}
                  title="Fullscreen Gallery"
                  aria-label="View gallery in fullscreen"
                >
                  ⛶
                </button>

                {/* Previous and Next Glass Arrows */}
                <button
                  type="button"
                  className="dest-gallery-arrow prev"
                  onClick={() => setActiveGalleryIdx(prev => (prev > 0 ? prev - 1 : galleryImages.length - 1))}
                  aria-label="Previous destination image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="dest-gallery-arrow next"
                  onClick={() => setActiveGalleryIdx(prev => (prev < galleryImages.length - 1 ? prev + 1 : 0))}
                  aria-label="Next destination image"
                >
                  ›
                </button>

                {/* Bottom Overlay: Signature View & 2-Digit Counter */}
                <div className="dest-master-gallery-overlay">
                  <span className="dest-gallery-location-tag">
                    <span className="dest-loc-pin">📍</span> {d.name} • Signature View
                  </span>
                  <span className="dest-gallery-counter-badge">
                    {String(activeGalleryIdx + 1).padStart(2, '0')} / {String(galleryImages.length).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Gold Pagination Dashes */}
              <div className="dest-gallery-dashes-row">
                {galleryImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`dest-gallery-dash ${activeGalleryIdx === idx ? 'active' : ''}`}
                    onClick={() => setActiveGalleryIdx(idx)}
                    aria-label={`Switch to gallery photo ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Right Column: Plan Your Ride Booking Card */}
            <div id="dest-booking-widget" className="dest-booking-card-col">
              <div className="dest-booking-card-v2">
                <div className="dest-booking-card-header">
                  <span className="dest-booking-cal-icon">📅</span>
                  <h3 className="dest-booking-title">Plan Your Ride</h3>
                </div>

                <form
                  className="dest-booking-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const targetUrl = `/booking?dest=${encodeURIComponent(d.name)}&city=${encodeURIComponent(pickupCity)}&bike=${selectedBikeId}&pickupDate=${pickupDate}&returnDate=${returnDate}`;
                    if (!isAuthenticated) {
                      const selectedBike = bikes.find(b => b.id === selectedBikeId);
                      const pendingBooking = {
                        bikeId: selectedBikeId,
                        bikeName: selectedBike?.name || 'Motorcycle',
                        bikeImage: selectedBike ? getBikeImage(selectedBike) : '',
                        startDate: pickupDate,
                        endDate: returnDate,
                        pickupCity,
                        pickupHub: pickupCity,
                        destParam: d.name,
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
                  }}
                >
                  <div className="dest-booking-field">
                    <label className="dest-booking-label">
                      <span>📍</span> Pick-up City
                    </label>
                    <select
                      className="dest-booking-select"
                      value={pickupCity}
                      onChange={(e) => setPickupCity(e.target.value)}
                    >
                      <option value={d.baseHub || 'Manali Alpine Hub'}>{d.baseHub || 'Manali Alpine Hub'}</option>
                      <option value="Manali Alpine Hub">Manali Alpine Hub</option>
                      <option value="Jaipur Royal Hub">Jaipur Royal Hub</option>
                      <option value="Chandigarh Base Hub">Chandigarh Base Hub</option>
                      <option value="Bengaluru Tech Hub">Bengaluru Tech Hub</option>
                      <option value="Goa Coastal Hub">Goa Coastal Hub</option>
                      <option value="Srinagar Foothills Hub">Srinagar Foothills Hub</option>
                    </select>
                  </div>

                  <div className="dest-booking-dates-grid">
                    <div className="dest-booking-field">
                      <label className="dest-booking-label">
                        <span>📅</span> Pick-up Date
                      </label>
                      <input
                        type="date"
                        className="dest-booking-input"
                        value={pickupDate}
                        min={todayStr}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPickupDate(val);
                          if (returnDate && val > returnDate) {
                            setReturnDate(val);
                          }
                        }}
                        required
                      />
                    </div>

                    <div className="dest-booking-field">
                      <label className="dest-booking-label">
                        <span>📅</span> Return Date
                      </label>
                      <input
                        type="date"
                        className="dest-booking-input"
                        value={returnDate}
                        min={pickupDate || todayStr}
                        onChange={(e) => setReturnDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="dest-booking-duration-pill">
                    <span className="dest-dur-icon">📅</span>
                    <span>Trip Duration: <strong>{tripDays} Day{tripDays > 1 ? 's' : ''}</strong> (Unlimited KMs Included)</span>
                  </div>

                  <button type="submit" className="dest-booking-submit-btn-v2">
                    Check Availability &amp; Book →
                  </button>
                </form>
              </div>
            </div>
          </section>

          {/* TIER 2: LOWER CONTENT 3-CARD ROW (Suggested Itinerary, Expedition Highlights, Recommended Ride) */}
          <section className="dest-overview-bottom-3col">
            {/* Card 1: Suggested Itinerary */}
            <div id="dest-card-itinerary" className="dest-lower-card dest-itinerary-card">
              <div className="dest-lower-card-header">
                <span className="dest-lower-card-icon">📅</span>
                <h3 className="dest-lower-card-title">
                  Suggested Itinerary ({d.idealDays || '7–9 Days'})
                </h3>
              </div>

              <div className="dest-timeline-vertical">
                {suggestedItinerary.map((item, idx) => (
                  <div key={idx} className="dest-timeline-row">
                    <div className="dest-timeline-badge">{item.day}</div>
                    <div className="dest-timeline-text">{item.route}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: Expedition Highlights */}
            <div id="dest-card-highlights" className="dest-lower-card dest-highlights-card">
              <div className="dest-lower-card-header">
                <span className="dest-lower-card-icon">⚠️</span>
                <h3 className="dest-lower-card-title">Expedition Highlights</h3>
              </div>

              <ul className="dest-highlights-checklist">
                {expeditionHighlights.map((hl, idx) => (
                  <li key={idx} className="dest-highlight-check-item">
                    <span className="dest-check-icon">✓</span>
                    <span className="dest-check-text">{hl}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 3: Recommended Ride (ONE carefully selected motorcycle) */}
            <div id="dest-card-rec-ride" className="dest-lower-card dest-rec-ride-card">
              <div className="dest-lower-card-header">
                <span className="dest-lower-card-icon">🏍️</span>
                <h3 className="dest-lower-card-title">Recommended Ride</h3>
              </div>

              <div className="dest-rec-ride-body">
                <div className="dest-rec-ride-info">
                  <h4 className="dest-rec-bike-name">{activeBike ? activeBike.bike.name : 'Royal Enfield Himalayan 450'}</h4>
                  <div className="dest-rec-specs-chips">
                    <span className="dest-spec-chip">🏍️ {activeBike ? activeBike.engine : '452 cc'}</span>
                    <span className="dest-spec-chip">⚡ {activeBike ? activeBike.power : '40 PS'}</span>
                    <span className="dest-spec-chip">⚖️ {activeBike ? activeBike.weight : '196 kg'}</span>
                  </div>
                </div>

                <div className="dest-rec-bike-visual">
                  <img
                    src={activeBike ? getBikeImage(activeBike.bike) : '/assets/images/himalayan-450.jpg'}
                    alt={activeBike ? activeBike.bike.name : 'Recommended Ride'}
                    className="dest-rec-bike-img"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/assets/images/ryvon-superbike.png';
                    }}
                  />
                </div>

                <div className="dest-rec-ride-footer">
                  <button
                    type="button"
                    className="dest-rec-details-btn"
                    onClick={() => {
                      if (activeBike) {
                        setShowSpecsModal(activeBike.bike);
                      }
                    }}
                  >
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: RIDER ADVISORY & SAFETY */}
          <section id="dest-sec-safety" className="dest-safety-banner">
            <div className="dest-safety-header-pill">
              <span>🛡️</span> Rider Advisory &amp; Safety
            </div>

            <div className="dest-safety-items-grid">
              <div className="dest-safety-item">
                <span className="dest-safety-icon">🪖</span>
                <div className="dest-safety-text">
                  <strong>Carry Riding Gear</strong>
                  <span>(Helmet, Jacket, Gloves Mandatory)</span>
                </div>
              </div>

              <div className="dest-safety-item">
                <span className="dest-safety-icon">💧</span>
                <div className="dest-safety-text">
                  <strong>Stay Hydrated</strong>
                  <span>(High Altitude / Desert Climate)</span>
                </div>
              </div>

              <div className="dest-safety-item">
                <span className="dest-safety-icon">⚠️</span>
                <div className="dest-safety-text">
                  <strong>Check Road Conditions</strong>
                  <span>(Live Highway + High Pass Updates)</span>
                </div>
              </div>

              <div className="dest-safety-item">
                <span className="dest-safety-icon">📄</span>
                <div className="dest-safety-text">
                  <strong>Permits &amp; Licences</strong>
                  <span>(Valid Motorcycle Licence Verified)</span>
                </div>
              </div>
            </div>

            <Link to="/faq" className="dest-safety-link">
              View Full Advisory →
            </Link>
          </section>
        </div>

        {/* DAY-BY-DAY ITINERARY MODAL */}
        {showItineraryModal && (
          <div className="dest-modal-backdrop" onClick={() => setShowItineraryModal(false)}>
            <div className="dest-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="dest-modal-header">
                <div>
                  <span className="dest-trending-eyebrow">EXPEDITION BLUEPRINT</span>
                  <h3>{d.name} • Full Itinerary</h3>
                </div>
                <button
                  type="button"
                  className="dest-modal-close"
                  onClick={() => setShowItineraryModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="dest-modal-body">
                {destinationItinerary.map((item, idx) => (
                  <div key={idx} className="dest-day-block">
                    <div className="dest-day-badge">{item.day}</div>
                    <div className="dest-day-content">
                      <h4>{item.title}</h4>
                      <div className="dest-day-meta-row">
                        <span>📏 {item.distance}</span>
                        <span>⏱️ {item.time}</span>
                        <span>🏔️ {item.terrain}</span>
                      </div>
                      <p>{item.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VEHICLE SPECIFICATIONS MODAL */}
        {showSpecsModal && (
          <div className="dest-modal-backdrop" onClick={() => setShowSpecsModal(null)}>
            <div className="dest-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="dest-modal-header">
                <div>
                  <span className="dest-trending-eyebrow">{showSpecsModal.brand} ADVENTURE SPEC</span>
                  <h3>{showSpecsModal.name}</h3>
                </div>
                <button
                  type="button"
                  className="dest-modal-close"
                  onClick={() => setShowSpecsModal(null)}
                >
                  ✕
                </button>
              </div>

              <div className="dest-modal-body">
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <img
                    src={getBikeImage(showSpecsModal)}
                    alt={showSpecsModal.name}
                    style={{ maxHeight: '180px', objectFit: 'contain' }}
                  />
                </div>

                <div className="dest-modal-spec-grid">
                  <div className="dest-modal-spec-item">
                    <span>Engine Displacement</span>
                    <strong>{showSpecsModal.engine || '452 cc Liquid-Cooled'}</strong>
                  </div>
                  <div className="dest-modal-spec-item">
                    <span>Peak Power</span>
                    <strong>{showSpecsModal.power || '40.0 PS @ 8,000 RPM'}</strong>
                  </div>
                  <div className="dest-modal-spec-item">
                    <span>Peak Torque</span>
                    <strong>{showSpecsModal.torque || '40.0 Nm @ 5,500 RPM'}</strong>
                  </div>
                  <div className="dest-modal-spec-item">
                    <span>Fuel Tank Capacity</span>
                    <strong>{showSpecsModal.fuelTank || '17.0 Litres'}</strong>
                  </div>
                  <div className="dest-modal-spec-item">
                    <span>Kerb Weight</span>
                    <strong>{showSpecsModal.weight || '196 kg'}</strong>
                  </div>
                  <div className="dest-modal-spec-item">
                    <span>Seat Height</span>
                    <strong>{showSpecsModal.seat || '825 mm'}</strong>
                  </div>
                  <div className="dest-modal-spec-item">
                    <span>Braking & ABS</span>
                    <strong>Dual-Channel Switchable ABS</strong>
                  </div>
                  <div className="dest-modal-spec-item">
                    <span>Security Deposit</span>
                    <strong style={{ color: '#f59e0b' }}>₹{showSpecsModal.deposit || 3500} (100% Refundable)</strong>
                  </div>
                </div>

                <div className="dest-modal-actions-row" style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    className="dest-booking-submit-btn"
                    onClick={() => {
                      const bId = showSpecsModal.id;
                      setShowSpecsModal(null);
                      handleBookNow(bId);
                    }}
                  >
                    Book This Motorcycle Now →
                  </button>
                  <button
                    type="button"
                    className="dest-fleet-specs-btn"
                    style={{ padding: '12px 20px', borderRadius: '10px' }}
                    onClick={() => setShowSpecsModal(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4K Aerial Video Preview Modal */}
        {showVideoModal && (
          <div className="dest-video-modal-backdrop" onClick={() => setShowVideoModal(false)}>
            <div className="dest-video-modal-card" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="dest-video-close-btn"
                onClick={() => setShowVideoModal(false)}
                aria-label="Close video"
              >
                ✕
              </button>
              <div className="dest-video-header">
                <h3>{d.name} • 4K Route Telemetry Preview</h3>
              </div>
              <div className="dest-video-screen">
                <img
                  src={d.heroBackdrop || d.img}
                  alt={`${d.name} 4K Preview`}
                  className="dest-video-placeholder-img"
                />
                <div className="dest-video-play-center">
                  <div className="dest-play-pulse">▶</div>
                  <span>Streaming Satellite Drone Telemetry (4K)</span>
                </div>
              </div>
              <div className="dest-video-footer">
                <p>Telemetry certified for highway grade, elevation curves &amp; fuel stops across {d.name}.</p>
              </div>
            </div>
          </div>
        )}

        {/* FULLSCREEN GALLERY LIGHTBOX MODAL */}
        {isFullscreenGallery && (
          <div className="dest-fs-lightbox-backdrop" onClick={() => setIsFullscreenGallery(false)}>
            <div className="dest-fs-lightbox-modal" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="dest-fs-close-btn"
                onClick={() => setIsFullscreenGallery(false)}
                aria-label="Close fullscreen gallery"
              >
                ✕
              </button>
              <div className="dest-fs-img-container">
                <img
                  src={currentImg}
                  alt={`${d.name} Fullscreen View`}
                  className="dest-fs-main-img"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = cardImg;
                  }}
                />

                <button
                  type="button"
                  className="dest-fs-arrow prev"
                  onClick={() => setActiveGalleryIdx(prev => (prev > 0 ? prev - 1 : galleryImages.length - 1))}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="dest-fs-arrow next"
                  onClick={() => setActiveGalleryIdx(prev => (prev < galleryImages.length - 1 ? prev + 1 : 0))}
                  aria-label="Next image"
                >
                  ›
                </button>
              </div>
              <div className="dest-fs-caption-bar">
                <strong>{d.name} • 4K Signature View</strong>
                <span>Photo {activeGalleryIdx + 1} of {galleryImages.length}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  // =========================================================================
  // 2. MAIN DESTINATIONS CATALOG VIEW (Matches media_1793976813986_e05f5660.jpg)
  // =========================================================================
  return (
    <main id="app" className="destinations-listing-page" tabIndex="-1">
      {/* 1. CINEMATIC HERO SECTION (Zero duplicate text, crisp Himalayan photograph) */}
      <section className="dest-listing-hero">
        {/* Dedicated Photographic Backdrop Layer for precise object-position & helmet headroom */}
        <div className="dest-hero-bg-photo-layer" aria-hidden="true">
          <img
            src="/assets/images/destinations/destinations-hero-listing.jpg"
            alt="Himalayan Adventure Rider Overlook"
            className="dest-hero-backdrop-img"
          />
          <div className="dest-hero-gradient-overlay" />
        </div>
        <div className="dest-hero-bg-overlay" />
        <div className="dest-listing-hero-container container">
          <div className="dest-hero-main-split">
            {/* Left: Titles & Buttons */}
            <div className="dest-hero-heading-block">
              <span className="dest-hero-eyebrow">
                <span className="dash">—</span> EXPLORE INDIA ON TWO WHEELS <span className="dash">—</span>
              </span>

              <h1 className="dest-hero-main-title">
                <span className="dest-title-line">Discover India's Most Iconic</span>
                <span className="dest-gold-serif-italic">Riding Destinations</span>
              </h1>

              <p className="dest-hero-description">
                Handpicked motorcycle routes for every kind of rider — from snowy Himalayan passes to golden deserts, coastal highways and lush valleys.
              </p>

              {/* Action Buttons */}
              <div className="dest-hero-buttons-row">
                <button
                  type="button"
                  className="dest-hero-btn-primary"
                  onClick={() => {
                    const el = document.getElementById('dest-catalog-strip');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span>🏍️</span> Explore Routes →
                </button>

                <Link to="/build-my-ride" className="dest-hero-btn-outline">
                  <span>✨</span> Plan with AI
                </Link>
              </div>

              {/* Mobile-Only Clean Responsive 2x2 Statistics Grid (Zero impact on desktop) */}
              <div className="dest-hero-mobile-stats-grid" aria-label="Destinations Key Statistics">
                <div className="dest-mobile-stat-box">
                  <span className="dest-stat-ico">🛣️</span>
                  <div className="dest-stat-content">
                    <strong>50+</strong>
                    <span>Epic Routes</span>
                  </div>
                </div>
                <div className="dest-mobile-stat-box">
                  <span className="dest-stat-ico">⛰️</span>
                  <div className="dest-stat-content">
                    <strong>18,380 ft</strong>
                    <span>Highest Peak</span>
                  </div>
                </div>
                <div className="dest-mobile-stat-box">
                  <span className="dest-stat-ico">👥</span>
                  <div className="dest-stat-content">
                    <strong>10K+</strong>
                    <span>Riders Explored</span>
                  </div>
                </div>
                <div className="dest-mobile-stat-box">
                  <span className="dest-stat-ico">🌲</span>
                  <div className="dest-stat-content">
                    <strong>4</strong>
                    <span>Terrain Types</span>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </section>

      {/* 2. FOUR DESTINATION CATEGORY CARDS (Strict replication of reference image) */}
      <section className="dest-categories-strip-section container">
        <div className="dest-categories-grid-4">
          {/* Card 1: Mountain & Himalayan */}
          <div
            className={`dest-category-card ${activeCategory === 'mountain' || activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory(activeCategory === 'mountain' ? 'all' : 'mountain');
              setCurrentPage(1);
            }}
            role="button"
            tabIndex={0}
          >
            <div className="dest-cat-img-wrap">
              <img
                src="/assets/images/destinations/cat-mountain-hd.jpg"
                alt="Mountain & Himalayan Routes"
                className="dest-cat-bg-img"
              />
              <div className="dest-cat-overlay" />
            </div>
            <div className="dest-cat-content">
              <span className="dest-cat-icon-pill cat-mountain-pill">
                ⛰️
              </span>
              <div className="dest-cat-text">
                <span className="dest-cat-title">Mountain &amp; Himalayan</span>
                <span className="dest-cat-count">7 Routes</span>
              </div>
              <span className="dest-cat-arrow">→</span>
            </div>
          </div>

          {/* Card 2: Coastal & Beach */}
          <div
            className={`dest-category-card ${activeCategory === 'coastal' ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory(activeCategory === 'coastal' ? 'all' : 'coastal');
              setCurrentPage(1);
            }}
            role="button"
            tabIndex={0}
          >
            <div className="dest-cat-img-wrap">
              <img
                src="/assets/images/destinations/cat-coastal-hd.jpg"
                alt="Coastal & Beach Routes"
                className="dest-cat-bg-img"
              />
              <div className="dest-cat-overlay" />
            </div>
            <div className="dest-cat-content">
              <span className="dest-cat-icon-pill cat-coastal-pill">
                🌊
              </span>
              <div className="dest-cat-text">
                <span className="dest-cat-title">Coastal &amp; Beach</span>
                <span className="dest-cat-count">4 Routes</span>
              </div>
              <span className="dest-cat-arrow">→</span>
            </div>
          </div>

          {/* Card 3: Desert & Heritage */}
          <div
            className={`dest-category-card ${activeCategory === 'desert' ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory(activeCategory === 'desert' ? 'all' : 'desert');
              setCurrentPage(1);
            }}
            role="button"
            tabIndex={0}
          >
            <div className="dest-cat-img-wrap">
              <img
                src="/assets/images/destinations/cat-desert-hd.jpg"
                alt="Desert & Heritage Routes"
                className="dest-cat-bg-img"
              />
              <div className="dest-cat-overlay" />
            </div>
            <div className="dest-cat-content">
              <span className="dest-cat-icon-pill cat-desert-pill">
                🏰
              </span>
              <div className="dest-cat-text">
                <span className="dest-cat-title">Desert &amp; Heritage</span>
                <span className="dest-cat-count">5 Routes</span>
              </div>
              <span className="dest-cat-arrow">→</span>
            </div>
          </div>

          {/* Card 4: Forest & Valleys */}
          <div
            className={`dest-category-card ${activeCategory === 'forest' ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory(activeCategory === 'forest' ? 'all' : 'forest');
              setCurrentPage(1);
            }}
            role="button"
            tabIndex={0}
          >
            <div className="dest-cat-img-wrap">
              <img
                src="/assets/images/destinations/cat-forest-hd.jpg"
                alt="Forest & Valleys Routes"
                className="dest-cat-bg-img"
              />
              <div className="dest-cat-overlay" />
            </div>
            <div className="dest-cat-content">
              <span className="dest-cat-icon-pill cat-forest-pill">
                🌲
              </span>
              <div className="dest-cat-text">
                <span className="dest-cat-title">Forest &amp; Valleys</span>
                <span className="dest-cat-count">5 Routes</span>
              </div>
              <span className="dest-cat-arrow">→</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FILTER & SEARCH BAR */}
      <section id="dest-catalog-strip" className="dest-filter-bar-section container">
        <div className="dest-filter-bar-card">
          <button
            type="button"
            className="dest-filter-toggle-btn"
            onClick={() => {
              setActiveCategory('all');
              setSeasonFilter('all');
              setDiffFilter('all');
              setTerrainFilter('all');
              setRegionFilter('all');
              setSearchQuery('');
              setCurrentPage(1);
            }}
          >
            <span>⚡</span> Filter Routes
          </button>

          {/* Season Dropdown */}
          <div className="dest-filter-select-wrap">
            <select
              className="dest-filter-select"
              value={seasonFilter}
              onChange={(e) => { setSeasonFilter(e.target.value); setCurrentPage(1); }}
              aria-label="Filter by season"
            >
              <option value="all">📅 All Seasons</option>
              <option value="oct-mar">Oct – Mar (Peak)</option>
              <option value="apr-nov">Apr – Nov (Summer/Autumn)</option>
              <option value="jun-oct">Jun – Oct (Monsoon/Passes)</option>
              <option value="year-round">Year-Round</option>
            </select>
          </div>

          {/* Difficulty Dropdown */}
          <div className="dest-filter-select-wrap">
            <select
              className="dest-filter-select"
              value={diffFilter}
              onChange={(e) => { setDiffFilter(e.target.value); setCurrentPage(1); }}
              aria-label="Filter by difficulty"
            >
              <option value="all">📊 All Difficulty</option>
              <option value="easy">Easy (Cruiser / City)</option>
              <option value="moderate">Moderate (Touring)</option>
              <option value="hard">Hard / Extreme (Passes)</option>
            </select>
          </div>

          {/* Terrain Dropdown */}
          <div className="dest-filter-select-wrap">
            <select
              className="dest-filter-select"
              value={terrainFilter}
              onChange={(e) => { setTerrainFilter(e.target.value); setCurrentPage(1); }}
              aria-label="Filter by terrain"
            >
              <option value="all">⛰️ All Terrain</option>
              <option value="mountain">Mountain Passes</option>
              <option value="coastal">Coastal Highways</option>
              <option value="desert">Desert Trails</option>
              <option value="forest">Forest Valleys</option>
            </select>
          </div>

          {/* Region Dropdown */}
          <div className="dest-filter-select-wrap">
            <select
              className="dest-filter-select"
              value={regionFilter}
              onChange={(e) => { setRegionFilter(e.target.value); setCurrentPage(1); }}
              aria-label="Filter by region"
            >
              <option value="all">📍 All Regions</option>
              <option value="north">North India (Himalayas)</option>
              <option value="south">South India (Ghats &amp; Coast)</option>
              <option value="west">West India (Deserts &amp; Konkan)</option>
            </select>
          </div>

          {/* Search Input & Button */}
          <div className="dest-filter-search-wrap">
            <span className="dest-search-glass-icon">🔍</span>
            <input
              type="text"
              className="dest-filter-search-input"
              placeholder="Search destinations, routes, or passes..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              aria-label="Search destinations"
            />
            <button
              type="button"
              className="dest-search-submit-btn"
              onClick={() => setCurrentPage(1)}
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* 4 & 5. FEATURED ROUTE BANNER & TRENDING RIDES WITH PANORAMIC MOUNTAIN BACKDROP */}
      <section className="dest-trending-section container">
        {/* Top: Horizontal Featured Route Banner (Chandigarh → Spiti Valley) */}
        <div className="dest-featured-card">
          <div className="dest-featured-img-col">
            <img
              src="/assets/images/destinations/featured-spiti-thumb.jpg"
              alt="Chandigarh to Spiti Valley"
              className="dest-featured-bg-img"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/assets/images/destinations/destinations-hero-backdrop.jpg';
              }}
            />
            <div className="dest-featured-play-overlay">
              <div className="dest-featured-play-btn">▶</div>
            </div>
          </div>

          <div className="dest-featured-info-col">
            <span className="dest-featured-crown-badge">
              <span>👑</span> FEATURED ROUTE
            </span>
            <h3 className="dest-featured-title">
              Chandigarh → Spiti Valley
              <span className="dest-featured-title-swoosh" aria-hidden="true" />
            </h3>
            <p className="dest-featured-desc">
              A ride through changing landscapes — from city highways to high-altitude Himalayan deserts.
            </p>
          </div>

          <div className="dest-featured-telemetry-col">
            <div className="dest-featured-meta-item">
              <span className="dest-meta-ico">🛣️</span>
              <div>
                <strong>~ 780 km</strong>
                <span>(Round Trip)</span>
              </div>
            </div>
            <div className="dest-featured-meta-item">
              <span className="dest-meta-ico">⛰️</span>
              <div>
                <strong>4,550 m</strong>
                <span>(Max Altitude)</span>
              </div>
            </div>
            <div className="dest-featured-meta-item">
              <span className="dest-meta-ico">📅</span>
              <div>
                <strong>8 Days</strong>
                <span>(Recommended)</span>
              </div>
            </div>
          </div>

          <div className="dest-featured-cta-col">
            <Link
              to="/destinations?dest=spiti"
              state={{ cardImg: '/assets/images/destinations/card-spiti-monastery.jpg' }}
              className="dest-featured-cta-btn"
            >
              Explore Route →
            </Link>
          </div>
        </div>

        {/* Section Header: Trending Rides for Every Explorer */}
        <div className="dest-trending-header-row">
          <div>
            <span className="dest-trending-eyebrow">📍 TOP DESTINATIONS →</span>
            <h2 className="dest-trending-title">
              Trending Rides for <span className="dest-gold-serif-italic">Every Explorer</span>
            </h2>
          </div>
          <button
            type="button"
            className="dest-view-all-link"
            onClick={() => {
              setActiveCategory('all');
              setSeasonFilter('all');
              setSearchQuery('');
              setCurrentPage(1);
            }}
          >
            View All Destinations →
          </button>
        </div>

        {/* 4 Cards Grid with Carousel Side Buttons */}
        <div className="dest-trending-cards-wrapper">
          <button
            type="button"
            className="dest-trending-nav-arrow prev"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            aria-label="Previous destinations"
          >
            ‹
          </button>

          <div className="dest-trending-cards-grid">
            {displayedDestinations.map((d, index) => {
              const isWished = wishes.includes(d.id);
              // Card 2 (Coorg) in 'all' view or popular is featured with glowing golden highlight
              const isFeaturedCard = d.id === 'coorg' || (activeCategory === 'all' && index === 1) || (activeCategory === 'mountain' ? d.id === 'spiti' : (d.isPopular || d.isFeatured));
              
              const titleIcon = d.id === 'srinagar-to-gulmarg' ? '⛰️'
                : d.id === 'coorg' ? '🍃'
                : d.id === 'jaipur' ? '🏛️'
                : d.id === 'jaipur-to-jaisalmer' ? '⛰️'
                : (d.cat === 'mountain' ? '⛰️' : d.cat === 'forest' ? '🍃' : d.cat === 'desert' ? '🏛️' : '🌊');

              const routeCount = d.id === 'srinagar-to-gulmarg' ? '7 Routes'
                : d.id === 'coorg' ? '4 Routes'
                : d.id === 'jaipur' ? '5 Routes'
                : d.id === 'jaipur-to-jaisalmer' ? '6 Routes'
                : `${d.highlights?.length ? d.highlights.length * 2 : 4} Routes`;

              const stateBadge = getStateBadge(d);

              return (
                <div
                  key={d.id}
                  className={`dest-card-box ${isFeaturedCard ? 'dest-card-featured-golden' : ''}`}
                >
                  {/* Media Image Wrap - Primary Visual Focus */}
                  <div className="dest-card-media-wrap">
                    <Link to={`/destinations?dest=${d.id}`} state={{ cardImg: d.img }}>
                      <img
                        src={d.img}
                        alt={d.name}
                        className="dest-card-photo"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/assets/images/destinations/destinations-hero-backdrop.jpg';
                        }}
                      />
                    </Link>

                    {/* Dark gradient for text legibility and image depth */}
                    <div className="dest-card-img-gradient" aria-hidden="true" />

                    {/* Top Badges */}
                    <div className="dest-card-badges-top">
                      {isFeaturedCard ? (
                        <span className="dest-card-popular-pill">
                          👑 Most Popular
                        </span>
                      ) : (
                        <span className={`dest-card-state-tag ${stateBadge.className}`}>
                          <span>{stateBadge.icon}</span> {stateBadge.label}
                        </span>
                      )}

                      <div className="dest-card-right-tags">
                        <span className="dest-card-rating-tag">
                          <span className="star-icon">★</span> {d.rating || '4.8 (1.2K)'}
                        </span>
                        <button
                          type="button"
                          className={`dest-card-heart-btn ${isWished ? 'active' : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            toggleWish(d.id);
                            toast(isWished ? 'Removed from your Journeys' : '✨ Added to My Journeys!');
                          }}
                          aria-label="Save destination"
                        >
                          {isWished ? '❤️' : '♡'}
                        </button>
                      </div>
                    </div>

                    {/* Location Badge on bottom-left of photo for featured card */}
                    {isFeaturedCard && (
                      <span className="dest-card-img-loc-pill">
                        📍 {d.state}
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="dest-card-body">
                    <h3 className="dest-card-title">
                      <Link to={`/destinations?dest=${d.id}`} state={{ cardImg: d.img }}>
                        <span className="dest-card-title-icon">{titleIcon}</span> {d.name}
                      </Link>
                    </h3>

                    <p className="dest-card-desc">
                      {d.tagline || d.desc}
                    </p>

                    {/* Middle Meta Chips Row (Matches reference image) */}
                    <div className="dest-card-meta-chips-row">
                      <span className="dest-card-chip">
                        <span className="chip-ico">★</span> {d.rating || '4.8 (1.2K)'}
                      </span>
                      <span className="dest-card-chip-divider" aria-hidden="true">|</span>
                      <span className="dest-card-chip route-count-chip">
                        <span className="chip-ico">🏍️</span> {routeCount}
                      </span>
                    </div>

                    {/* Telemetry Row */}
                    <div className="dest-card-telemetry-row">
                      <div className="dest-card-telemetry-item">
                        <span className="dest-ico">🛣️</span>
                        <div>
                          <strong>{d.distance || '~ 480 km'}</strong>
                          <small>{d.distanceType || '(Round Trip)'}</small>
                        </div>
                      </div>

                      <div className="dest-card-telemetry-item">
                        <span className="dest-ico">⛰️</span>
                        <div>
                          <strong>{d.elevation || '2,690 m'}</strong>
                          <small>{d.elevationType || '(Alpine Valley)'}</small>
                        </div>
                      </div>

                      <Link
                        to={`/destinations?dest=${d.id}`}
                        state={{ cardImg: d.img }}
                        className="dest-card-circle-arrow-btn"
                        aria-label={`Explore ${d.name}`}
                      >
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="dest-trending-nav-arrow next"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            aria-label="Next destinations"
          >
            ›
          </button>
        </div>

        {/* Empty State */}
        {displayedDestinations.length === 0 && (
          <div className="dest-empty-state-card">
            <span className="dest-empty-icon">🏜️</span>
            <h3>No destinations match your filters</h3>
            <p>Try resetting your season or category to view all available motorcycle expeditions.</p>
            <button
              type="button"
              className="dest-hero-btn-primary"
              style={{ margin: '16px auto 0' }}
              onClick={() => {
                setActiveCategory('all');
                setSeasonFilter('all');
                setSearchQuery('');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* 6. INTERACTIVE PAGINATION BAR (Strict replication of user uploaded design) */}
        {totalPages > 1 && (
          <nav className="dest-pagination-nav" aria-label="Destinations Pagination">
            <button
              type="button"
              className="dest-pagination-btn dest-pagination-prev"
              disabled={currentPage <= 1}
              onClick={() => {
                setCurrentPage(p => Math.max(1, p - 1));
                const el = document.getElementById('dest-catalog-strip');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              aria-label="Previous destinations page"
            >
              ← Prev
            </button>

            <div className="dest-pagination-pages">
              {getPaginationPages().map((pageItem, idx) => {
                if (pageItem === '...') {
                  return (
                    <span key={`ellipsis-${idx}`} className="dest-pagination-ellipsis" aria-hidden="true">
                      …
                    </span>
                  );
                }
                return (
                  <button
                    key={pageItem}
                    type="button"
                    className={`dest-pagination-num ${currentPage === pageItem ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentPage(pageItem);
                      const el = document.getElementById('dest-catalog-strip');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    aria-label={`Go to page ${pageItem}`}
                    aria-current={currentPage === pageItem ? 'page' : undefined}
                  >
                    {pageItem}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="dest-pagination-btn dest-pagination-next"
              disabled={currentPage >= totalPages}
              onClick={() => {
                setCurrentPage(p => Math.min(totalPages, p + 1));
                const el = document.getElementById('dest-catalog-strip');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              aria-label="Next destinations page"
            >
              Next →
            </button>
          </nav>
        )}

        {/* Decorative Golden Topographical Contours */}
        <div className="dest-topo-decor-left" aria-hidden="true">
          <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-40 160 C30 140, 80 180, 160 140 C220 110, 250 130, 290 90" stroke="rgba(245, 158, 11, 0.35)" strokeWidth="1.2" />
            <path d="M-40 180 C40 155, 100 200, 180 160 C230 130, 260 150, 310 110" stroke="rgba(245, 158, 11, 0.25)" strokeWidth="1.2" />
            <path d="M-40 200 C50 170, 120 220, 200 180 C250 150, 280 170, 330 130" stroke="rgba(245, 158, 11, 0.18)" strokeWidth="1.2" />
          </svg>
        </div>
        <div className="dest-topo-decor-right" aria-hidden="true">
          <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M320 160 C250 140, 200 180, 120 140 C60 110, 30 130, -10 90" stroke="rgba(245, 158, 11, 0.35)" strokeWidth="1.2" />
            <path d="M320 180 C240 155, 180 200, 100 160 C50 130, 20 150, -30 110" stroke="rgba(245, 158, 11, 0.25)" strokeWidth="1.2" />
            <path d="M320 200 C230 170, 160 220, 80 180 C30 150, 0 170, -50 130" stroke="rgba(245, 158, 11, 0.18)" strokeWidth="1.2" />
          </svg>
        </div>
      </section>

      {/* Subtle Golden Wavy Bottom Decoration */}
      <div className="dest-wavy-bg" aria-hidden="true" />
    </main>
  );
}
