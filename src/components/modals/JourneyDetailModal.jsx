import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { useBookings } from '../../context/BookingContext';
import { bikes } from '../../data/bikes';
import { resolveJourneyBikeImage } from '../../pages/BookingHistory';

const formatShortDate = (dateStr) => {
  if (!dateStr) return 'TBD';
  try {
    const parts = String(dateStr).split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    return dateStr;
  } catch (e) {
    return dateStr;
  }
};

export default function JourneyDetailModal({ booking: initialBooking, bookingId }) {
  const { closeModal, openModal } = useModal();
  const { money } = useCurrency();
  const { toast } = useToast();
  const { getBooking, extendBooking } = useBookings();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'financials' | 'timeline'

  const currentBooking = initialBooking || getBooking(bookingId);
  const [localBooking] = useState(currentBooking);

  if (!localBooking) {
    return (
      <div className="modal" style={{ maxWidth: '480px', width: '92%', padding: '24px', textAlign: 'center' }}>
        <button className="icon-btn modal-close" type="button" aria-label="Close" onClick={closeModal}>✕</button>
        <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🔍</span>
        <h3 style={{ margin: '0 0 6px' }}>Journey Record Not Found</h3>
        <p className="muted" style={{ fontSize: '13px', margin: '0 0 16px' }}>
          We could not locate booking reference #{bookingId || 'N/A'}.
        </p>
        <button className="btn btn-primary btn-sm" type="button" onClick={closeModal}>Close</button>
      </div>
    );
  }

  const b = localBooking;
  const resolvedBike = bikes.find(x => x.id === b.bikeId || x.name === b.bikeName);
  const bikeImgSrc = resolveJourneyBikeImage(b);

  const copyId = () => {
    const cleanId = String(b.id).replace(/^#/, '').trim();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(cleanId);
    }
    toast(`Booking ID #${cleanId} copied to clipboard! 📋`);
  };

  const handleDownloadInvoice = () => {
    toast(`📄 Generating official tax invoice for #${b.id}...`);
    setTimeout(() => {
      window.print();
    }, 350);
  };

  const handleModify = () => {
    openModal('modifyBooking', { booking: b });
  };

  const handleExtend = () => {
    const updated = extendBooking(b.id, 1);
    if (updated) {
      toast(`⏱️ Ride extended by +1 Day for #${b.id}! New return date: ${updated.endDate}`);
    } else {
      toast(`Ride extension submitted for Concierge dispatch review.`);
    }
  };

  const handleDeletePrompt = () => {
    openModal('deleteBooking', { booking: b });
  };

  const pickupTimeStr = b.pickupTime || '09:00 AM';
  const returnTimeStr = b.returnTime || '06:00 PM';
  const formattedPickup = formatShortDate(b.startDate || b.pickupDate);
  const formattedReturn = formatShortDate(b.endDate || b.returnDate);

  // Financial calculations
  const dailyRate = Number(b.dailyRate || b.pricePerDay || 1499);
  const duration = Number(b.duration || 1);
  const baseRental = dailyRate * duration;
  const securityDeposit = Number(b.deposit || 3000);
  const extrasCost = (b.extras && Array.isArray(b.extras))
    ? b.extras.reduce((s, x) => s + (Number(x.price) || 0), 0)
    : 449;
  const gstTax = Math.round(baseRental * 0.18);
  const grandTotal = Number(b.total || b.totalAmount || (baseRental + extrasCost));

  // Timeline Milestones based on actual status
  const isCancelled = b.status === 'Cancelled';
  const isCompleted = b.status === 'Completed';
  const isActive = b.status === 'Active';
  const isUpcoming = b.status === 'Upcoming';

  const milestones = [
    {
      id: 'created',
      title: 'Booking Created & Telemetry Paired',
      date: b.bookingDate || b.createdAt ? formatShortDate(b.bookingDate || b.createdAt) : formattedPickup,
      desc: 'Vehicle reserved and locked in fleet inventory.',
      done: true,
      current: false
    },
    {
      id: 'payment',
      title: 'Payment & Escrow Secured',
      date: b.bookingDate || formattedPickup,
      desc: `${b.paymentMode || 'Instant UPI'} confirmed. Escrow held with 100% refund guarantee.`,
      done: true,
      current: false
    },
    {
      id: 'handover',
      title: 'Station Handover & Keyless Access',
      date: `${formattedPickup}, ${pickupTimeStr}`,
      desc: `32-point inspection verified at ${b.pickupCity || 'Base Hub'}.`,
      done: isActive || isCompleted,
      current: isUpcoming
    },
    {
      id: 'active',
      title: 'Expedition Ride Active',
      date: `${formattedPickup} → ${formattedReturn}`,
      desc: `Live telemetry and 24/7 SOS dispatch enabled on route to ${b.destCity || 'Destination'}.`,
      done: isCompleted,
      current: isActive
    },
    {
      id: 'return',
      title: isCancelled ? 'Reservation Cancelled & Refunded' : 'Expedition Return & Escrow Released',
      date: isCancelled ? 'Refund Processed' : `${formattedReturn}, ${returnTimeStr}`,
      desc: isCancelled ? '100% deposit refunded to original payment method.' : 'Vehicle telemetry cleared and 100% deposit released.',
      done: isCompleted || isCancelled,
      current: isCompleted,
      isCancelled
    }
  ];

  return (
    <div
      className="modal jdetail-modal-card"
      onClick={e => e.stopPropagation()}
      style={{
        maxWidth: '920px',
        width: '95%',
        maxHeight: '92vh',
        overflowY: 'auto',
        borderRadius: '24px',
        background: '#090e17',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.85), 0 0 40px rgba(245, 158, 11, 0.08)',
        padding: 0
      }}
    >
      {/* Close button */}
      <button
        className="jdetail-modal-close"
        type="button"
        aria-label="Close"
        onClick={closeModal}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'rgba(10, 14, 23, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          cursor: 'pointer',
          zIndex: 10
        }}
      >
        ✕
      </button>

      {/* 1. HERO HEADER WITH CINEMATIC LANDSCAPE */}
      <div
        style={{
          position: 'relative',
          padding: '28px 32px',
          background: 'linear-gradient(to right, rgba(6, 9, 15, 0.98) 0%, rgba(6, 9, 15, 0.85) 45%, rgba(6, 9, 15, 0.3) 100%), url("/assets/images/journey-hero-sunset.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'right center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ maxWidth: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', color: '#f59e0b', textTransform: 'uppercase', marginBottom: '8px' }}>
            <span>RYVON LUXURY EXPEDITION RECORD</span>
            <span>•</span>
            <span>#{b.id}</span>
          </div>

          <h2 style={{ margin: '0 0 6px 0', fontFamily: 'var(--font-serif)', fontSize: '28px', color: '#ffffff', fontWeight: 700 }}>
            {b.destCity ? `${b.destCity} Expedition` : `${b.bikeName} Tour`}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '10px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                background: isActive ? 'rgba(16, 185, 129, 0.15)' : (isUpcoming ? 'rgba(56, 189, 248, 0.15)' : (isCancelled ? 'rgba(239, 68, 68, 0.15)' : 'rgba(168, 85, 247, 0.15)')),
                border: `1px solid ${isActive ? '#10b981' : (isUpcoming ? '#38bdf8' : (isCancelled ? '#ef4444' : '#c084fc'))}`,
                color: isActive ? '#34d399' : (isUpcoming ? '#38bdf8' : (isCancelled ? '#f87171' : '#c084fc'))
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
              {b.status}
            </span>

            <span style={{ fontSize: '13px', color: '#94a3b8' }}>
              Booked on {b.bookingDate || '2026-11-05'}
            </span>

            <button
              type="button"
              onClick={copyId}
              style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.14)', borderRadius: '9999px', color: '#cbd5e1', fontSize: '11.5px', padding: '3px 10px', cursor: 'pointer' }}
            >
              Copy Reference 📋
            </button>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: '4px', padding: '12px 24px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: '#0b101c' }}>
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'overview' ? '2px solid #f59e0b' : '2px solid transparent',
            color: activeTab === 'overview' ? '#ffffff' : '#94a3b8',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          Overview &amp; Machine
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('timeline')}
          style={{
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'timeline' ? '2px solid #f59e0b' : '2px solid transparent',
            color: activeTab === 'timeline' ? '#ffffff' : '#94a3b8',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          Journey Timeline ({milestones.filter(m => m.done).length}/5)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('financials')}
          style={{
            padding: '10px 18px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'financials' ? '2px solid #f59e0b' : '2px solid transparent',
            color: activeTab === 'financials' ? '#ffffff' : '#94a3b8',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          Payment &amp; Invoice Breakdown
        </button>
      </div>

      {/* 3. TAB CONTENT */}
      <div style={{ padding: '24px 28px' }}>
        {activeTab === 'overview' && (
          <div>
            {/* 2-Column: Vehicle Photo & Specs + Route Schedule */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '24px' }}>
              {/* Left Column: Authentic Motorcycle Details */}
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: '100%', height: '220px', borderRadius: '14px', overflow: 'hidden', background: '#070a0f', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '16px' }}>
                  <img
                    src={bikeImgSrc}
                    alt={b.bikeName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 2px 0', fontSize: '18px', color: '#ffffff' }}>{b.bikeName}</h3>
                    <span style={{ fontSize: '12.5px', color: '#f59e0b', fontWeight: 600 }}>{b.brand || 'RYVON Fleet'} • {b.bikeCategory || 'Tourer'}</span>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#f59e0b', fontSize: '12px', fontWeight: 800 }}>
                    {money(dailyRate)}/day
                  </span>
                </div>

                {/* Machine Specs Badges */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
                  <div style={{ padding: '8px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '9.5px', color: '#94a3b8', textTransform: 'uppercase' }}>Engine</span>
                    <strong style={{ fontSize: '12px', color: '#ffffff' }}>{b.bikeEngine || resolvedBike?.engine || '452cc'}</strong>
                  </div>
                  <div style={{ padding: '8px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '9.5px', color: '#94a3b8', textTransform: 'uppercase' }}>Power</span>
                    <strong style={{ fontSize: '12px', color: '#ffffff' }}>{b.bikePower || resolvedBike?.power || '40 PS'}</strong>
                  </div>
                  <div style={{ padding: '8px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '9.5px', color: '#94a3b8', textTransform: 'uppercase' }}>Gearbox</span>
                    <strong style={{ fontSize: '12px', color: '#ffffff' }}>{b.transmission || resolvedBike?.transmission || '6-Speed'}</strong>
                  </div>
                </div>

                {/* Safety & Equipment */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: 'auto' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#34d399' }}>
                    ✓ 32-Point Quality Verified
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#38bdf8' }}>
                    ✓ GPS Telemetry Active
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#c084fc' }}>
                    ✓ Roadside Assist 24/7
                  </span>
                </div>
              </div>

              {/* Right Column: Schedule & Route Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Route Visualizer */}
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '20px' }}>
                  <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, marginBottom: '12px' }}>
                    Expedition Route Track
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: 'rgba(10, 14, 23, 0.7)', borderRadius: '9999px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <span style={{ color: '#10b981', fontWeight: 700, fontSize: '13px' }}>📍 {b.pickupCity || 'Jaipur Hub'}</span>
                    <span style={{ color: '#f59e0b', fontSize: '12px' }}>── 🏍️ ──</span>
                    <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '13px' }}>📍 {b.destCity || 'Jaipur'}</span>
                  </div>
                </div>

                {/* Schedule Grid */}
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '20px' }}>
                  <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, marginBottom: '12px' }}>
                    Rental Window &amp; Handover
                  </span>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Pickup Schedule</span>
                      <strong style={{ fontSize: '13.5px', color: '#ffffff' }}>{formattedPickup}</strong>
                      <span style={{ display: 'block', fontSize: '11px', color: '#34d399', marginTop: '2px' }}>{pickupTimeStr}</span>
                    </div>

                    <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>Return Schedule</span>
                      <strong style={{ fontSize: '13.5px', color: '#ffffff' }}>{formattedReturn}</strong>
                      <span style={{ display: 'block', fontSize: '11px', color: '#f59e0b', marginTop: '2px' }}>{returnTimeStr}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '10px' }}>
                    <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Total Calculated Duration:</span>
                    <strong style={{ fontSize: '14px', color: '#f59e0b' }}>{duration} Days ({duration * 24} Hours)</strong>
                  </div>
                </div>

                {/* Selected Extras */}
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '20px' }}>
                  <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, marginBottom: '10px' }}>
                    Selected Expedition Equipment
                  </span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ padding: '5px 12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff', fontSize: '12px' }}>
                      🪖 DOT Touring Helmet
                    </span>
                    <span style={{ padding: '5px 12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff', fontSize: '12px' }}>
                      🧳 Aluminium Panniers (38L)
                    </span>
                    <span style={{ padding: '5px 12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff', fontSize: '12px' }}>
                      📹 4K Action Cam Bar Mount
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <div style={{ maxWidth: '640px', margin: '0 auto', padding: '10px 0' }}>
            <div style={{ position: 'relative', paddingLeft: '32px' }}>
              <div style={{ position: 'absolute', top: '10px', bottom: '10px', left: '11px', width: '2px', background: 'rgba(255, 255, 255, 0.12)' }} />

              {milestones.map((m) => (
                <div key={m.id} style={{ position: 'relative', marginBottom: '28px' }}>
                  {/* Dot */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '2px',
                      left: '-32px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: m.done ? (m.isCancelled ? '#ef4444' : '#10b981') : (m.current ? '#f59e0b' : '#1e293b'),
                      border: '3px solid #090e17',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '11px',
                      boxShadow: m.current ? '0 0 14px rgba(245, 158, 11, 0.7)' : 'none'
                    }}
                  >
                    {m.done ? (m.isCancelled ? '✕' : '✓') : (m.current ? '⚡' : '•')}
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: `1px solid ${m.current ? 'rgba(245, 158, 11, 0.5)' : 'rgba(255, 255, 255, 0.08)'}`, borderRadius: '14px', padding: '14px 18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '14px', color: m.isCancelled ? '#f87171' : (m.current ? '#f59e0b' : '#ffffff') }}>{m.title}</strong>
                      <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>{m.date}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '12.5px', color: '#cbd5e1' }}>{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FINANCIALS TAB */}
        {activeTab === 'financials' && (
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px', marginBottom: '16px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px', color: '#ffffff' }}>Official Tax Invoice Breakdown</h4>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>GSTIN: 08AAECR9214K1Z5 • RYVON Expeditions Ltd.</span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadInvoice}
                  style={{ padding: '8px 16px', borderRadius: '9999px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.35)', color: '#f59e0b', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Print Invoice 📄
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                  <span>Base Fleet Rental ({duration} Days × {money(dailyRate)})</span>
                  <strong>{money(baseRental)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                  <span>Selected Touring Equipment &amp; Panniers</span>
                  <strong>{money(extrasCost)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                  <span>Comprehensive Damage Waiver &amp; Telemetry</span>
                  <span style={{ color: '#34d399' }}>COMPLIMENTARY</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                  <span>Applicable GST (18%)</span>
                  <span>{money(gstTax)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                  <span>Refundable Security Deposit (Escrow)</span>
                  <span style={{ color: '#38bdf8' }}>{money(securityDeposit)} (Escrow Held)</span>
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '14px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Paid Amount</span>
                    <strong style={{ fontSize: '22px', color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>{money(grandTotal)}</strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#34d399', fontWeight: 700 }}>
                      ✓ {b.paymentStatus || 'Paid online via Instant UPI'}
                    </span>
                    <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8' }}>Payment Ref: PAY-{b.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. MANAGEMENT ACTION FOOTER */}
      <div
        style={{
          padding: '18px 28px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(255, 255, 255, 0.02)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        {/* Left Danger / Cancel action */}
        {b.status !== 'Completed' && (
          <button
            type="button"
            onClick={handleDeletePrompt}
            style={{
              padding: '9px 18px',
              borderRadius: '9999px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {b.status === 'Cancelled' ? 'Delete Record ✕' : 'Cancel Reservation ✕'}
          </button>
        )}

        {/* Right Primary Actions */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginLeft: 'auto', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleDownloadInvoice}
            style={{
              padding: '9px 16px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Download Invoice 📥
          </button>

          {b.status !== 'Cancelled' && b.status !== 'Completed' && (
            <>
              <button
                type="button"
                onClick={handleExtend}
                style={{
                  padding: '9px 16px',
                  borderRadius: '9999px',
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38bdf8',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Extend +1 Day ⏱️
              </button>

              <button
                type="button"
                onClick={handleModify}
                style={{
                  padding: '9px 18px',
                  borderRadius: '9999px',
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  color: '#fbbf24',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Modify Dates ✏️
              </button>
            </>
          )}

          <button
            type="button"
            onClick={closeModal}
            style={{
              padding: '9px 22px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
              border: 'none',
              color: '#090e17',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)'
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
