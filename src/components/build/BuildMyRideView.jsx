import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { useBookings } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { bikes, getBikeImage } from '../../data/bikes';
import { speakText, stopSpeech } from '../../utils/speech';
import {
  getTodayDateString,
  getMinReturnDate,
  addDays,
  validateBookingDates
} from '../../utils/dateValidation';
import DateErrorNotice from '../common/DateErrorNotice';

export const CITIES = [
  { id: 'Chandigarh', name: 'Chandigarh Base Hub' },
  { id: 'Delhi', name: 'Delhi NCR Central Hub' },
  { id: 'Bengaluru', name: 'Bengaluru Tech Hub' },
  { id: 'Manali', name: 'Manali Alpine Hub' },
  { id: 'Dehradun', name: 'Dehradun Foothills Hub' },
  { id: 'Goa', name: 'Goa Coastal Hub' },
  { id: 'Jaipur', name: 'Jaipur Royal Hub' }
];

export const DESTINATIONS = [
  {
    id: 'Spiti Valley',
    name: 'Spiti Cold Desert & Kaza Circuit',
    terrain: 'Mountain',
    distance: '~ 760 km (Round Trip)',
    elevation: 'High Altitude (3,800 m+)',
    img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
    minDays: 4,
    defaultStart: 'Chandigarh Base Hub'
  },
  {
    id: 'Leh Ladakh',
    name: 'Leh Ladakh & Khardung La Pass',
    terrain: 'Mountain',
    distance: '~ 980 km (Round Trip)',
    elevation: 'Extreme Altitude (5,359 m)',
    img: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80',
    minDays: 6,
    defaultStart: 'Manali Alpine Hub'
  },
  {
    id: 'Manali & Solang',
    name: 'Manali, Solang & Rohtang Pass',
    terrain: 'Mountain',
    distance: '~ 620 km (Round Trip)',
    elevation: 'Alpine Ridge (3,978 m)',
    img: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80',
    minDays: 3,
    defaultStart: 'Chandigarh Base Hub'
  },
  {
    id: 'Goa Coastline',
    name: 'Goa Coastal Highway & Palolem',
    terrain: 'Coastal',
    distance: '~ 340 km (Round Trip)',
    elevation: 'Coastal Sea Level (15 m)',
    img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    minDays: 3,
    defaultStart: 'Goa Coastal Hub'
  },
  {
    id: 'Coorg & Chikmagalur',
    name: 'Coorg Coffee Valleys & Chikmagalur',
    terrain: 'Mountain',
    distance: '~ 520 km (Round Trip)',
    elevation: 'Misty Ghats (1,150 m)',
    img: '/assets/images/destinations/coorg-chikmagalur.jpg',
    minDays: 3,
    defaultStart: 'Bengaluru Tech Hub'
  },
  {
    id: 'Jaipur & Amer Fort',
    name: 'Jaipur Pink City & Amer Fort',
    terrain: 'Highway',
    distance: '~ 320 km (Round Trip)',
    elevation: 'Royal Foothills (430 m)',
    img: '/assets/images/destinations/jaipur-amer-fort.jpg',
    minDays: 2,
    defaultStart: 'Jaipur Royal Hub'
  },
  {
    id: 'Thar Desert & Jaisalmer',
    name: 'Jaipur to Jaisalmer Thar Dunes',
    terrain: 'Highway',
    distance: '~ 840 km (Round Trip)',
    elevation: 'Desert Plains (225 m)',
    img: '/assets/images/destinations/jaipur-jaisalmer.jpg',
    minDays: 4,
    defaultStart: 'Jaipur Royal Hub'
  },
  {
    id: 'Srinagar & Gulmarg',
    name: 'Srinagar to Gulmarg High Pass',
    terrain: 'Mountain',
    distance: '~ 480 km (Round Trip)',
    elevation: 'Alpine Valley (2,690 m)',
    img: '/assets/images/destinations/srinagar-gulmarg.jpg',
    minDays: 4,
    defaultStart: 'Chandigarh Base Hub'
  }
];

export const TERRAINS = [
  { id: 'Mountain', icon: '🏔️', title: 'Mountain & Alpine Passes', desc: 'Offroad gravel, hairpin climbs & river crossings' },
  { id: 'Highway', icon: '🛣️', title: 'Smooth Highway Touring', desc: 'High-speed stability, windscreen & touring posture' },
  { id: 'Coastal', icon: '🌊', title: 'Coastal Highways', desc: 'Laidback cruisers, scenic twists & sea breezes' },
  { id: 'City', icon: '🏙️', title: 'Urban Streets & Commutes', desc: 'Lightweight agility, effortless clutch & city filtering' }
];

export const PRIORITIES = [
  { id: 'Comfort', label: '🛋️ Plush Comfort & Ergonomics' },
  { id: 'Performance', label: '⚡ Throttle Response & High Power' },
  { id: 'Adventure', label: '🏕️ Offroad Clearance & Suspension' },
  { id: 'Budget', label: '💰 Best Value & Cost Optimization' },
  { id: 'Fuel Efficiency', label: '⛽ Fuel Range & Efficiency' }
];

export default function BuildMyRideView({ isModal = false, onClose }) {
  const { openModal, closeModal } = useModal();
  const { user, isAuthenticated } = useAuth();
  const { money } = useCurrency();
  const { toast } = useToast();
  const { addBooking } = useBookings();
  const navigate = useNavigate();

  const handleClose = onClose || closeModal;

  const today = getTodayDateString();
  const defaultEnd = addDays(today, 4);

  // Steps: 1: Route & Dates, 2: Rider Profile, 3: Riding Style, 4: AI Recommendations
  const [step, setStep] = useState(1);

  // Form State
  const [startCity, setStartCity] = useState(CITIES[0].name);
  const [destination, setDestination] = useState(
    DESTINATIONS.find(d => d.name === 'Srinagar to Gulmarg High Pass')?.name || DESTINATIONS[0].name
  );
  const [pickupDate, setPickupDate] = useState(today);
  const [returnDate, setReturnDate] = useState(defaultEnd);

  const [experience, setExperience] = useState('Intermediate');
  const [groupType, setGroupType] = useState('Solo Explorer');
  const [budget, setBudget] = useState(25000);

  const [selectedTerrain, setSelectedTerrain] = useState('Mountain');
  const [selectedPriorities, setSelectedPriorities] = useState(['Comfort', 'Adventure', 'Performance']);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMsg, setProcessingMsg] = useState('');
  const [selectedBike, setSelectedBike] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);

  useEffect(() => {
    return () => stopSpeech();
  }, []);

  // Shared date validation
  const dateValidation = useMemo(() => {
    return validateBookingDates(pickupDate, returnDate);
  }, [pickupDate, returnDate]);

  const minReturn = getMinReturnDate(pickupDate);

  const handlePickupChange = (newVal) => {
    setPickupDate(newVal);
    if (returnDate <= newVal) {
      setReturnDate(getMinReturnDate(newVal));
    }
  };

  const handleReturnChange = (newVal) => {
    setReturnDate(newVal);
  };

  const durationDays = dateValidation.isValid ? dateValidation.days : 0;

  // Selected destination metadata
  const currentDestObj = useMemo(() => {
    return DESTINATIONS.find(d => d.name === destination) || DESTINATIONS[0];
  }, [destination]);

  const togglePriority = (pId) => {
    if (selectedPriorities.includes(pId)) {
      if (selectedPriorities.length > 1) {
        setSelectedPriorities(selectedPriorities.filter(p => p !== pId));
      }
    } else {
      setSelectedPriorities([...selectedPriorities, pId]);
    }
  };

  // AI Recommendation engine
  const recommendations = useMemo(() => {
    if (durationDays < 1) return [];

    return bikes.map(bike => {
      const rentalTotal = bike.price * durationDays;
      const budgetRatio = rentalTotal / Math.max(1, budget * 0.45);

      let budgetScore = 90;
      if (budgetRatio <= 0.8) budgetScore = 98;
      else if (budgetRatio <= 1.0) budgetScore = 94;
      else if (budgetRatio <= 1.3) budgetScore = 80;
      else budgetScore = 65;

      let terrainScore = 80;
      if (selectedTerrain === 'Mountain') {
        if (bike.type === 'Adventure') terrainScore = 98;
        else if (bike.type === 'Touring') terrainScore = 92;
        else if (bike.type === 'Roadster') terrainScore = 84;
        else terrainScore = 65;
      } else if (selectedTerrain === 'Highway') {
        if (bike.type === 'Touring') terrainScore = 98;
        else if (bike.type === 'Cruiser') terrainScore = 95;
        else if (bike.type === 'Sport') terrainScore = 90;
        else terrainScore = 70;
      } else if (selectedTerrain === 'Coastal') {
        if (bike.type === 'Cruiser') terrainScore = 98;
        else if (bike.type === 'Roadster') terrainScore = 94;
        else terrainScore = 75;
      } else {
        if (bike.type === 'Scooter') terrainScore = 98;
        else if (bike.type === 'Roadster') terrainScore = 92;
        else terrainScore = 70;
      }

      let expScore = 90;
      const cc = parseInt(bike.engine) || 350;
      if (experience === 'Beginner') {
        if (cc <= 250 || bike.transmission === 'Automatic') expScore = 98;
        else if (cc <= 400) expScore = 85;
        else expScore = 60;
      } else if (experience === 'Intermediate') {
        if (cc >= 300 && cc <= 650) expScore = 98;
        else expScore = 88;
      } else {
        if (cc >= 400) expScore = 98;
        else expScore = 86;
      }

      let priorityBonus = 0;
      if (selectedPriorities.includes('Comfort') && (bike.type === 'Touring' || bike.type === 'Cruiser')) priorityBonus += 8;
      if (selectedPriorities.includes('Performance') && (bike.type === 'Sport' || cc >= 400)) priorityBonus += 8;
      if (selectedPriorities.includes('Adventure') && bike.type === 'Adventure') priorityBonus += 10;
      if (selectedPriorities.includes('Budget') && bike.price <= 1500) priorityBonus += 8;
      if (selectedPriorities.includes('Fuel Efficiency') && (bike.type === 'Scooter' || cc <= 350)) priorityBonus += 8;

      const rawMatch = (terrainScore * 0.4) + (budgetScore * 0.3) + (expScore * 0.2) + priorityBonus;
      const matchPercent = Math.min(99, Math.max(72, Math.round(rawMatch)));

      const reasons = [];
      if (terrainScore >= 90) reasons.push(`✓ Optimally tuned for ${selectedTerrain} terrain`);
      if (rentalTotal <= budget * 0.45) reasons.push(`✓ Within your ${money(budget)} expedition budget`);
      if (expScore >= 90) reasons.push(`✓ Matches your ${experience} rider profile`);
      if (bike.rating >= '4.8') reasons.push(`✓ Top-rated ${bike.rating}★ reliability`);

      return {
        bike,
        matchPercent,
        rentalTotal,
        deposit: bike.deposit || 3000,
        reasons
      };
    }).sort((a, b) => b.matchPercent - a.matchPercent).slice(0, 3);
  }, [budget, durationDays, experience, selectedTerrain, selectedPriorities, money]);

  // Set default selected bike when recommendations change
  useEffect(() => {
    if (recommendations.length > 0 && (!selectedBike || !recommendations.some(r => r.bike.id === selectedBike.id))) {
      setSelectedBike(recommendations[0].bike);
    }
  }, [recommendations, selectedBike]);

  const triggerAiSynthesis = () => {
    if (!dateValidation.isValid) {
      toast(dateValidation.error || 'Please select valid rental dates.');
      return;
    }

    setIsProcessing(true);
    const stages = [
      `Analyzing elevation gradients from ${startCity.split(' ')[0]} to ${destination.split(' ')[0]}...`,
      `Synthesizing engine torque curves for ${selectedTerrain} terrain...`,
      `Calibrating rider ergonomics for ${experience} experience profile...`,
      `Balancing ${money(budget)} budget across rental, fuel & escrows...`,
      `Pairing top neural matches from available fleet...`
    ];

    let i = 0;
    setProcessingMsg(stages[0]);
    const timer = setInterval(() => {
      i++;
      if (i < stages.length) {
        setProcessingMsg(stages[i]);
      } else {
        clearInterval(timer);
        setIsProcessing(false);
        setStep(4);
      }
    }, 450);
  };

  const toggleVoiceBriefing = (bikeToSpeak) => {
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
    } else {
      const speech = `Welcome to RYVON Ride Architect. Here is your expedition itinerary from ${startCity} to ${destination} over ${durationDays} days. We have paired you with the ${bikeToSpeak.name}, an exceptional machine for ${selectedTerrain} terrain. Digital telemetry check is verified and keys are ready at hub bay 4. Have an unforgettable expedition.`;
      speakText(speech);
      setIsPlayingAudio(true);
    }
  };

  const handleInstantConfirm = () => {
    if (!selectedBike) return;

    // STRICT AUTHENTICATION REQUIREMENT BEFORE BOOKING CONFIRMATION
    if (!isAuthenticated || !user) {
      const pendingBooking = {
        bikeId: selectedBike.id,
        startDate: pickupDate,
        endDate: returnDate,
        pickupHub: startCity,
        timeslot: '09:00 AM',
        selectedExtras: [],
        paymentMode: 'Instant UPI / Card',
        destParam: destination
      };
      sessionStorage.setItem('ryvon-pending-booking', JSON.stringify(pendingBooking));

      if (isModal) handleClose();
      openModal('authRequired', {
        title: 'Your Ride Awaits!',
        description: 'Please sign in or create your RYVON account to continue with your motorcycle booking and secure your ride.',
        redirectUrl: `/booking?bike=${selectedBike.id}&city=${encodeURIComponent(startCity)}&start=${pickupDate}&end=${returnDate}&days=${durationDays}&dest=${encodeURIComponent(destination)}&step=3`,
        cancelText: 'Continue Exploring'
      });
      return;
    }

    const ref = `RDS-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const rentalTotal = selectedBike.price * durationDays;
    const deposit = selectedBike.deposit || 3000;
    const gst = Math.round(rentalTotal * 0.18);
    const total = rentalTotal + gst + 149;

    const newBooking = {
      id: ref,
      status: 'Upcoming',
      bikeId: selectedBike.id,
      bikeName: selectedBike.name,
      bikeCategory: selectedBike.type,
      bikeEngine: selectedBike.engine,
      bikePower: selectedBike.power,
      bikeImage: getBikeImage(selectedBike),
      pickupCity: startCity,
      destCity: destination,
      source: 'Build My Ride AI',
      startDate: pickupDate,
      endDate: returnDate,
      pickupTime: '09:00 AM',
      duration: durationDays,
      dailyRate: selectedBike.price,
      rental: rentalTotal,
      extras: [{ name: 'Certified ISI Rider Helmet', price: 0, icon: '🪖' }],
      extrasTotal: 0,
      discount: 0,
      sanitization: 149,
      gst,
      total,
      deposit,
      paymentMode: 'Instant UPI / Card',
      paymentStatus: 'Paid online',
      bookingDate: today,
      createdAt: new Date().toISOString()
    };

    addBooking(newBooking);
    toast(`🎉 Neural Expedition Confirmed! Reference #${ref}`);
    if (isModal) handleClose();
    navigate('/booking-history');
  };

  return (
    <div className={`build-ride-wrapper ${isModal ? 'as-modal' : 'as-page'}`}>
      {/* Outer Scenic Glass Glow Frame */}
      <div className="build-ride-card">
        {isModal && (
          <button className="build-ride-close-btn" onClick={handleClose} aria-label="Close modal">
            ✕
          </button>
        )}

        {/* 2-COLUMN LUXURY LAYOUT */}
        <div className="build-ride-split-grid">
          {/* LEFT SIDEBAR: RIDE ARCHITECT AI SPOTLIGHT */}
          <aside className="build-ride-sidebar">
            <div className="build-ride-brand-eyebrow">
              <span className="build-ride-dash">—</span> RIDE ARCHITECT AI
            </div>

            <div className="build-ride-brand-title-wrap">
              <span className="build-ride-laurel">🌿</span>
              <h1 className="build-ride-brand-title">
                Build My Ride <span className="build-ride-gold-italic">AI</span>
              </h1>
              <span className="build-ride-laurel flipped">🌿</span>
            </div>

            <p className="build-ride-brand-sub">
              Your intelligent ride planner that creates a personalized motorcycle experience — from route to the perfect ride.
            </p>

            {/* 4 FEATURE PILLARS */}
            <div className="build-ride-pillars-list">
              <div className="build-pillar-item">
                <div className="build-pillar-icon-box">⚡</div>
                <div className="build-pillar-text">
                  <strong>AI-Powered Planning</strong>
                  <span>Smart routes, bikes &amp; travel insights</span>
                </div>
              </div>

              <div className="build-pillar-item">
                <div className="build-pillar-icon-box">⛰️</div>
                <div className="build-pillar-text">
                  <strong>Terrain &amp; Route Intelligence</strong>
                  <span>Matched to your destination &amp; style</span>
                </div>
              </div>

              <div className="build-pillar-item">
                <div className="build-pillar-icon-box">🎚️</div>
                <div className="build-pillar-text">
                  <strong>Personalized Recommendations</strong>
                  <span>Based on experience, group &amp; preferences</span>
                </div>
              </div>

              <div className="build-pillar-item">
                <div className="build-pillar-icon-box">🛡️</div>
                <div className="build-pillar-text">
                  <strong>Safe, Flexible &amp; Hassle-Free</strong>
                  <span>Verified fleet, easy booking &amp; 24/7 support</span>
                </div>
              </div>
            </div>

            {/* MEET YOUR RIDE ARCHITECT AI PROMOTIONAL CARD */}
            <div 
              className="build-architect-promo-card"
              onClick={() => setShowHowItWorksModal(true)}
              role="region"
              aria-label="Meet Your Ride Architect AI promotional feature"
            >
              <img
                src="/assets/images/ride-architect-promo.png"
                alt="Meet Your Ride Architect AI - Personalized routes, real-time insights & smarter ride plans"
                className="build-architect-promo-img"
              />
              {/* Interactive golden button overlay */}
              <button
                type="button"
                className="build-architect-promo-hit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHowItWorksModal(true);
                }}
                aria-label="See How It Works"
                title="See How It Works - Ride Architect AI"
              >
                <span className="sr-only">See How It Works</span>
              </button>
            </div>
          </aside>

          {/* RIGHT MAIN PANEL: INTERACTIVE MULTI-STEP FLOW */}
          <main className="build-ride-main">
            {/* 4-STEP WIZARD PROGRESS BAR */}
            <div className="build-wizard-header">
              {/* Step 1 */}
              <div className={`build-step-item ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                <div className="build-step-num-circle">
                  {step > 1 ? '✓' : '1'}
                </div>
                <div className="build-step-labels">
                  <span className="build-step-name">Route &amp; Dates</span>
                  <span className="build-step-sub">Plan your journey</span>
                </div>
              </div>

              <div className={`build-step-connector ${step > 1 ? 'active' : ''}`} />

              {/* Step 2 */}
              <div className={`build-step-item ${step === 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                <div className="build-step-num-circle">
                  {step > 2 ? '✓' : '👤'}
                </div>
                <div className="build-step-labels">
                  <span className="build-step-name">Rider Profile</span>
                  <span className="build-step-sub">Tell us about you</span>
                </div>
              </div>

              <div className={`build-step-connector ${step > 2 ? 'active' : ''}`} />

              {/* Step 3 */}
              <div className={`build-step-item ${step === 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
                <div className="build-step-num-circle">
                  {step > 3 ? '✓' : '🏍️'}
                </div>
                <div className="build-step-labels">
                  <span className="build-step-name">Riding Style</span>
                  <span className="build-step-sub">Choose your style</span>
                </div>
              </div>

              <div className={`build-step-connector ${step > 3 ? 'active' : ''}`} />

              {/* Step 4 */}
              <div className={`build-step-item ${step === 4 ? 'active' : ''}`}>
                <div className="build-step-num-circle">
                  ✨
                </div>
                <div className="build-step-labels">
                  <span className="build-step-name">AI Recommendation</span>
                  <span className="build-step-sub">Get your perfect ride</span>
                </div>
              </div>
            </div>

            {/* PROCESSING OVERLAY */}
            {isProcessing && (
              <div className="build-processing-card">
                <div className="build-neural-spinner" />
                <h3 className="build-processing-title">Calibrating Ride Architect AI</h3>
                <p className="build-processing-msg">{processingMsg}</p>
                <div className="build-processing-bar">
                  <div className="build-processing-fill" />
                </div>
              </div>
            )}

            {/* STEP 1: ROUTE & DATES */}
            {!isProcessing && step === 1 && (
              <div className="build-inner-card">
                <div className="build-inner-header">
                  <div>
                    <h2 className="build-inner-title">
                      Plan Your <span className="build-inner-gold-italic">Journey</span>
                    </h2>
                    <p className="build-inner-sub">
                      Set your route and travel dates to get started with an AI-personalized ride.
                    </p>
                  </div>

                  {/* Route line pill */}
                  <div className="build-route-pill">
                    <span className="build-route-dot start">📍</span>
                    <span className="build-route-name">{startCity.split(' ')[0]}</span>
                    <span className="build-route-dashes">-------------</span>
                    <span className="build-route-dot end">📍</span>
                    <span className="build-route-name">
                      {destination.includes('to') ? destination.split('to')[0].trim() : destination.split(' ')[0]}
                    </span>
                  </div>
                </div>

                <div className="build-form-grid-2col">
                  {/* Left Form Inputs */}
                  <div className="build-form-col">
                    <div className="build-field-group">
                      <label className="build-label">
                        <span>📍</span> Starting City
                      </label>
                      <select
                        className="build-select"
                        value={startCity}
                        onChange={(e) => setStartCity(e.target.value)}
                      >
                        {CITIES.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="build-field-group">
                      <label className="build-label">
                        <span>🏔️</span> Expedition Destination
                      </label>
                      <select
                        className="build-select"
                        value={destination}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDestination(val);
                          const matched = DESTINATIONS.find(d => d.name === val);
                          if (matched?.terrain) {
                            setSelectedTerrain(matched.terrain);
                          }
                        }}
                      >
                        {DESTINATIONS.map(d => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Dates & Duration Row */}
                    <div className="build-dates-row">
                      <div className="build-field-group">
                        <label className="build-label">
                          <span>📅</span> Pickup Date
                        </label>
                        <input
                          type="date"
                          className="build-input"
                          min={today}
                          value={pickupDate}
                          onChange={(e) => handlePickupChange(e.target.value)}
                          required
                        />
                      </div>

                      <div className="build-field-group">
                        <label className="build-label">
                          <span>📅</span> Return Date
                        </label>
                        <input
                          type="date"
                          className="build-input"
                          min={minReturn}
                          value={returnDate}
                          onChange={(e) => handleReturnChange(e.target.value)}
                          required
                        />
                      </div>

                      <div className="build-duration-box">
                        <label className="build-label">
                          <span>⌛</span> TRIP DURATION
                        </label>
                        <div className="build-duration-val">
                          {durationDays} Days
                        </div>
                        <span className="build-duration-sub">~ UNLIMITED KMS</span>
                      </div>
                    </div>

                    <DateErrorNotice error={dateValidation.error} style={{ margin: '8px 0 0' }} />
                  </div>

                  {/* Right Destination Preview Card */}
                  <div className="build-dest-preview-card">
                    <div className="build-dest-img-wrap">
                      <img
                        key={currentDestObj.id}
                        src={currentDestObj.img}
                        alt={currentDestObj.name}
                        className="build-dest-img"
                        loading="eager"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/assets/images/destinations/srinagar-gulmarg.jpg';
                        }}
                      />
                      <div className="build-dest-overlay-bar">
                        <span className="build-dest-route-title">
                          {startCity.split(' ')[0]} → {currentDestObj.id}
                        </span>
                      </div>
                    </div>

                    <div className="build-dest-meta-row">
                      <div className="build-dest-meta-block">
                        <strong className="build-dest-meta-val">
                          {currentDestObj.distance.replace(/\(.*?\)/g, '').trim()}
                        </strong>
                        <span className="build-dest-meta-sub">
                          <span>🗺️</span> {currentDestObj.distance.includes('(') ? currentDestObj.distance.match(/\((.*?)\)/)[0] : '(Round Trip)'}
                        </span>
                      </div>
                      <div className="build-dest-meta-block">
                        <strong className="build-dest-meta-val">
                          {currentDestObj.elevation.replace(/\(.*?\)/g, '').trim()}
                        </strong>
                        <span className="build-dest-meta-sub">
                          <span>⛰️</span> {currentDestObj.elevation.includes('(') ? currentDestObj.elevation.match(/\((.*?)\)/)[0] : '(2,690 m)'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="build-action-row">
                  <button
                    type="button"
                    className="build-btn-primary"
                    disabled={!dateValidation.isValid}
                    onClick={() => setStep(2)}
                  >
                    Continue to Rider Profile →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: RIDER PROFILE */}
            {!isProcessing && step === 2 && (
              <div className="build-inner-card">
                <div className="build-inner-header">
                  <div>
                    <h2 className="build-inner-title">
                      Rider Profile &amp; <span className="build-inner-gold-italic">Experience</span>
                    </h2>
                    <p className="build-inner-sub">
                      Calibrate engine CC, rider ergonomics, and group logistics for the optimal pairing.
                    </p>
                  </div>
                </div>

                <div className="build-step2-content">
                  {/* Experience Level */}
                  <div className="build-section-block">
                    <label className="build-label"><span>👤</span> Riding Experience Level</label>
                    <div className="build-selector-grid-3">
                      {[
                        { id: 'Beginner', title: 'Beginner Rider', desc: '0–1 yr • Up to 250cc & lightweight automatics' },
                        { id: 'Intermediate', title: 'Intermediate', desc: '2–4 yrs • 300cc–650cc versatile roadsters & ADVs' },
                        { id: 'Expert', title: 'Expert Explorer', desc: '5+ yrs • 650cc+ superbikes & high-torque scramblers' }
                      ].map(lvl => (
                        <button
                          key={lvl.id}
                          type="button"
                          className={`build-card-pill ${experience === lvl.id ? 'active' : ''}`}
                          onClick={() => setExperience(lvl.id)}
                        >
                          <strong>{lvl.title}</strong>
                          <span>{lvl.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Group Type */}
                  <div className="build-section-block">
                    <label className="build-label"><span>👥</span> Expedition Group Type</label>
                    <div className="build-selector-grid-3">
                      {[
                        { id: 'Solo Explorer', title: 'Solo Explorer', icon: '🏍️', desc: 'Agile riding & maximum solo freedom' },
                        { id: 'Duo / With Pillion', title: 'Duo With Pillion', icon: '👫', desc: 'Plush pillion seat & rear luggage mount' },
                        { id: 'Motorcycle Pack', title: 'Motorcycle Pack', icon: '🏁', desc: 'Convoy sync & multi-bike telemetry' }
                      ].map(grp => (
                        <button
                          key={grp.id}
                          type="button"
                          className={`build-card-pill ${groupType === grp.id ? 'active' : ''}`}
                          onClick={() => setGroupType(grp.id)}
                        >
                          <span style={{ fontSize: '20px' }}>{grp.icon}</span>
                          <strong>{grp.title}</strong>
                          <span>{grp.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Expedition Budget Slider */}
                  <div className="build-section-block">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label className="build-label" style={{ margin: 0 }}>
                        <span>💰</span> Total Expedition Budget
                      </label>
                      <span className="build-budget-val">{money(budget)}</span>
                    </div>

                    <input
                      type="range"
                      className="build-range-slider"
                      min={5000}
                      max={80000}
                      step={2500}
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                    />

                    <div className="build-presets-row">
                      {[15000, 25000, 45000, 65000].map(val => (
                        <button
                          key={val}
                          type="button"
                          className={`build-preset-chip ${budget === val ? 'active' : ''}`}
                          onClick={() => setBudget(val)}
                        >
                          {money(val)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="build-actions-split">
                  <button type="button" className="build-btn-outline" onClick={() => setStep(1)}>
                    ← Back to Route
                  </button>
                  <button type="button" className="build-btn-primary" onClick={() => setStep(3)}>
                    Continue to Riding Style →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: RIDING STYLE & PRIORITIES */}
            {!isProcessing && step === 3 && (
              <div className="build-inner-card">
                <div className="build-inner-header">
                  <div>
                    <h2 className="build-inner-title">
                      Riding Style &amp; <span className="build-inner-gold-italic">Priorities</span>
                    </h2>
                    <p className="build-inner-sub">
                      Fine-tune chassis geometry, suspension travel, and performance preferences.
                    </p>
                  </div>
                </div>

                <div className="build-step3-content">
                  {/* Primary Terrain Selection */}
                  <div className="build-section-block">
                    <label className="build-label"><span>🗺️</span> Dominant Expedition Terrain</label>
                    <div className="build-selector-grid-2">
                      {TERRAINS.map(t => (
                        <button
                          key={t.id}
                          type="button"
                          className={`build-terrain-card ${selectedTerrain === t.id ? 'active' : ''}`}
                          onClick={() => setSelectedTerrain(t.id)}
                        >
                          <span className="build-terrain-icon">{t.icon}</span>
                          <div style={{ textAlign: 'left' }}>
                            <strong>{t.title}</strong>
                            <span>{t.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Key Priorities Chips */}
                  <div className="build-section-block">
                    <label className="build-label"><span>🎯</span> Key Priorities (Select all that apply)</label>
                    <div className="build-priorities-wrap">
                      {PRIORITIES.map(p => {
                        const isSelected = selectedPriorities.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            className={`build-priority-chip ${isSelected ? 'active' : ''}`}
                            onClick={() => togglePriority(p.id)}
                          >
                            <span>{p.label}</span>
                            {isSelected && <span style={{ marginLeft: '4px' }}>✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="build-actions-split">
                  <button type="button" className="build-btn-outline" onClick={() => setStep(2)}>
                    ← Back to Profile
                  </button>
                  <button type="button" className="build-btn-primary" onClick={triggerAiSynthesis}>
                    Generate AI Recommendations ✨
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: AI RECOMMENDATIONS & ITINERARY */}
            {!isProcessing && step === 4 && (
              <div className="build-inner-card">
                <div className="build-inner-header">
                  <div>
                    <h2 className="build-inner-title">
                      AI Neural Fleet <span className="build-inner-gold-italic">Recommendations</span>
                    </h2>
                    <p className="build-inner-sub">
                      Top 3 optimal motorcycle pairings calculated for {startCity.split(' ')[0]} → {destination.split(' ')[0]} ({durationDays} days).
                    </p>
                  </div>
                </div>

                {/* 3 RECOMMENDATION CARDS */}
                <div className="build-recs-grid">
                  {recommendations.map((rec, idx) => {
                    const isSelected = selectedBike?.id === rec.bike.id;
                    return (
                      <div
                        key={rec.bike.id}
                        className={`build-rec-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedBike(rec.bike)}
                      >
                        <div className="build-rec-top">
                          <span className="build-match-badge">
                            {idx === 0 ? '🏆 TOP PICK • ' : ''}{rec.matchPercent}% MATCH
                          </span>
                          <span className="build-rec-price">
                            {money(rec.bike.price)}<small>/day</small>
                          </span>
                        </div>

                        <img
                          src={getBikeImage(rec.bike)}
                          alt={rec.bike.name}
                          className="build-rec-img"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/assets/images/ryvon-superbike.png';
                          }}
                        />

                        <h3 className="build-rec-title">{rec.bike.name}</h3>
                        <div className="build-rec-specs">
                          {rec.bike.engine} • {rec.bike.power} • {rec.bike.type}
                        </div>

                        <div className="build-rec-reasons">
                          {rec.reasons.slice(0, 2).map((r, ri) => (
                            <span key={ri} className="build-reason-tag">{r}</span>
                          ))}
                        </div>

                        <div className="build-rec-actions">
                          <button
                            type="button"
                            className={`build-btn-select ${isSelected ? 'active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); setSelectedBike(rec.bike); }}
                          >
                            {isSelected ? '✓ Selected Machine' : 'Select Machine'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* SELECTED BIKE ITINERARY & INSTANT CONFIRM */}
                {selectedBike && (
                  <div className="build-selected-spotlight">
                    <div className="build-spotlight-top">
                      <div>
                        <span className="build-spotlight-eyebrow">CONFIRMED EXPEDITION PAIRING</span>
                        <h3 className="build-spotlight-name">
                          {selectedBike.name}
                        </h3>
                        <p className="build-spotlight-sub">
                          {durationDays} Days • {startCity} ⇄ {destination}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="build-voice-btn"
                          onClick={() => toggleVoiceBriefing(selectedBike)}
                        >
                          {isPlayingAudio ? '🔊 Stop Briefing' : '🎙️ Audio AI Briefing'}
                        </button>
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="build-spotlight-finance-strip">
                      <div className="build-fin-cell">
                        <span>Rental ({durationDays}d × {money(selectedBike.price)}):</span>
                        <strong>{money(selectedBike.price * durationDays)}</strong>
                      </div>
                      <div className="build-fin-cell">
                        <span>Refundable Deposit (100% Escrow):</span>
                        <strong>{money(selectedBike.deposit || 3000)}</strong>
                      </div>
                      <div className="build-fin-cell total">
                        <span>Estimated Total:</span>
                        <strong className="build-gold-total">
                          {money((selectedBike.price * durationDays) + (selectedBike.deposit || 3000))}
                        </strong>
                      </div>
                    </div>

                    <div className="build-actions-split">
                      <button type="button" className="build-btn-outline" onClick={() => setStep(3)}>
                        ← Adjust Parameters
                      </button>
                      <button type="button" className="build-btn-primary" onClick={handleInstantConfirm}>
                        Instant 1-Click Confirm Reservation ({money((selectedBike.price * durationDays) + (selectedBike.deposit || 3000))}) ⚡
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* RIDE ARCHITECT AI "SEE HOW IT WORKS" MODAL */}
      {showHowItWorksModal && (
        <div className="build-how-modal-backdrop" onClick={() => setShowHowItWorksModal(false)}>
          <div className="build-how-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              className="build-how-modal-close" 
              onClick={() => setShowHowItWorksModal(false)}
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="build-how-modal-header">
              <div className="build-how-modal-eyebrow">
                <span>⚡</span> NEURAL EXPEDITION ENGINE
              </div>
              <h2 className="build-how-modal-title">
                Meet Your <span className="gold-text">Ride Architect AI</span>
              </h2>
              <p className="build-how-modal-desc">
                Personalized routes, real-time insights &amp; smarter ride plans. RYVON analyzes elevation gradients, terrain dynamics, and rider ergonomics to pair you with the ultimate motorcycle expedition.
              </p>
            </div>

            <div className="build-how-steps-grid">
              <div className="build-how-step-card">
                <div className="build-how-step-badge">01</div>
                <div className="build-how-step-icon">🗺️</div>
                <h3>Route &amp; Dates</h3>
                <p>Pick your starting hub, high-altitude destination, and travel window.</p>
              </div>

              <div className="build-how-step-card">
                <div className="build-how-step-badge">02</div>
                <div className="build-how-step-icon">👤</div>
                <h3>Rider Profile</h3>
                <p>Tell us your riding experience level, touring group, and comfort needs.</p>
              </div>

              <div className="build-how-step-card">
                <div className="build-how-step-badge">03</div>
                <div className="build-how-step-icon">🏍️</div>
                <h3>Riding Style</h3>
                <p>Select your terrain preference, budget range, and motorcycle dynamics.</p>
              </div>

              <div className="build-how-step-card">
                <div className="build-how-step-badge">04</div>
                <div className="build-how-step-icon">✨</div>
                <h3>AI Recommendation</h3>
                <p>Get your perfectly calibrated motorcycle with verified telemetry &amp; 1-click booking.</p>
              </div>
            </div>

            <div className="build-how-modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', height: '46px', fontSize: '15px' }}
                onClick={() => {
                  setShowHowItWorksModal(false);
                  setStep(1);
                }}
              >
                Start Planning My Ride →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
