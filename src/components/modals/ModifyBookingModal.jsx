import React, { useState, useMemo } from 'react';
import { useModal } from '../../context/ModalContext';
import { useBookings } from '../../context/BookingContext';
import { useToast } from '../../context/ToastContext';
import { useCurrency } from '../../context/CurrencyContext';
import { resolveJourneyBikeImage } from '../../pages/BookingHistory';

const HUBS = [
  'Jaipur Royal Hub',
  'Manali Base Hub',
  'Chandigarh Base Hub',
  'Bengaluru Indiranagar Hub',
  'Goa Coastal Station',
  'Leh Ladakh Base',
  'Delhi Central Hub',
  'Mumbai Bandra Hub'
];

const TIME_SLOTS = [
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '02:00 PM',
  '04:00 PM',
  '06:00 PM',
  '08:00 PM'
];

export default function ModifyBookingModal({ booking, bookingId }) {
  const { closeModal } = useModal();
  const { getBooking, updateBooking } = useBookings();
  const { toast } = useToast();
  const { money } = useCurrency();

  const currentBooking = booking || getBooking(bookingId);

  const [pickupCity, setPickupCity] = useState(currentBooking?.pickupCity || currentBooking?.pickupLocation || HUBS[0]);
  const [startDate, setStartDate] = useState(currentBooking?.startDate || currentBooking?.pickupDate || '');
  const [endDate, setEndDate] = useState(currentBooking?.endDate || currentBooking?.returnDate || '');
  const [pickupTime, setPickupTime] = useState(currentBooking?.pickupTime || '09:00 AM');
  const [returnTime, setReturnTime] = useState(currentBooking?.returnTime || '06:00 PM');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!currentBooking) {
    return (
      <div className="modal" style={{ maxWidth: '440px', padding: '24px', textAlign: 'center' }}>
        <button className="icon-btn modal-close" type="button" onClick={closeModal}>✕</button>
        <h3>Booking Not Found</h3>
        <p className="muted">Unable to load booking details for modification.</p>
        <button className="btn btn-primary btn-sm" type="button" onClick={closeModal}>Close</button>
      </div>
    );
  }

  const b = currentBooking;
  const bikeImg = resolveJourneyBikeImage(b);
  const dailyRate = Number(b.dailyRate || b.pricePerDay || 1499);

  // Dynamic duration calculation
  const computedDuration = useMemo(() => {
    if (!startDate || !endDate) return Number(b.duration) || 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) return 0;
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(1, days);
  }, [startDate, endDate, b.duration]);

  // Dynamic price recalculation
  const computedTotal = useMemo(() => {
    const baseAmount = dailyRate * computedDuration;
    const extrasAmount = (b.extras && Array.isArray(b.extras))
      ? b.extras.reduce((sum, item) => sum + (Number(item.price) || 0), 0)
      : 0;
    return baseAmount + extrasAmount;
  }, [dailyRate, computedDuration, b.extras]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!startDate || !endDate) {
      setErrorMessage('Please select both pickup and return dates.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setErrorMessage('Return date cannot be earlier than pickup date.');
      return;
    }

    if (computedDuration <= 0) {
      setErrorMessage('Rental duration must be at least 1 day.');
      return;
    }

    setIsSaving(true);

    try {
      const updated = updateBooking(b.id, {
        pickupCity,
        pickupLocation: pickupCity,
        startDate,
        pickupDate: startDate,
        endDate,
        returnDate: endDate,
        pickupTime,
        returnTime,
        duration: computedDuration,
        total: computedTotal,
        totalAmount: computedTotal
      });

      if (updated) {
        toast(`✅ Booking #${b.id} updated! ${computedDuration} Days (${startDate} to ${endDate}).`);
        closeModal();
      } else {
        setErrorMessage('Failed to update booking. Please try again.');
        setIsSaving(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('An error occurred while saving modifications.');
      setIsSaving(false);
    }
  };

  return (
    <div className="modal modify-booking-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px', width: '94%', padding: '0', overflow: 'hidden', borderRadius: '20px', border: '1px solid rgba(245, 158, 11, 0.35)', background: '#090e17', boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(245, 158, 11, 0.1)' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>✏️</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontFamily: 'var(--font-serif)', color: '#ffffff' }}>Modify Booking Schedule</h3>
            <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>Booking #{b.id} • {b.bikeName}</span>
          </div>
        </div>
        <button type="button" onClick={closeModal} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer', padding: '4px' }}>✕</button>
      </div>

      {/* Vehicle Summary Banner */}
      <div style={{ padding: '14px 24px', background: 'rgba(245, 158, 11, 0.06)', borderBottom: '1px solid rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <img src={bikeImg} alt={b.bikeName} style={{ width: '64px', height: '44px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }} />
        <div style={{ flex: 1 }}>
          <strong style={{ display: 'block', color: '#ffffff', fontSize: '14px' }}>{b.bikeName}</strong>
          <span style={{ fontSize: '11.5px', color: '#f59e0b', fontWeight: 600 }}>Daily Rate: {money(dailyRate)}/day</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Total</span>
          <strong style={{ fontSize: '15px', color: '#ffffff' }}>{money(b.total)}</strong>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ padding: '22px 24px' }}>
        {errorMessage && (
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', fontSize: '12.5px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠️</span> {errorMessage}
          </div>
        )}

        {/* Pickup Hub */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            📍 Station Handover Hub
          </label>
          <select
            value={pickupCity}
            onChange={(e) => setPickupCity(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '10px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
          >
            {HUBS.map(hub => (
              <option key={hub} value={hub} style={{ background: '#0b1120', color: '#ffffff' }}>{hub}</option>
            ))}
          </select>
        </div>

        {/* Dates Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              📅 Pickup Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '10px', color: '#ffffff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              📅 Return Date
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '10px', color: '#ffffff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              required
            />
          </div>
        </div>

        {/* Times Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              ⏱️ Pickup Time
            </label>
            <select
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '10px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
            >
              {TIME_SLOTS.map(t => (
                <option key={t} value={t} style={{ background: '#0b1120', color: '#ffffff' }}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              ⏱️ Return Time
            </label>
            <select
              value={returnTime}
              onChange={(e) => setReturnTime(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '10px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
            >
              {TIME_SLOTS.map(t => (
                <option key={t} value={t} style={{ background: '#0b1120', color: '#ffffff' }}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Real-time Recalculation Summary Box */}
        <div style={{ padding: '14px 18px', background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', marginBottom: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recalculated Duration</span>
            <strong style={{ fontSize: '16px', color: '#38bdf8' }}>{computedDuration} {computedDuration === 1 ? 'Day' : 'Days'}</strong>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Updated Total Amount</span>
            <strong style={{ fontSize: '19px', color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>{money(computedTotal)}</strong>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={closeModal}
            disabled={isSaving}
            style={{ padding: '10px 18px', borderRadius: '9999px', background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.16)', color: '#e2e8f0', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || computedDuration <= 0}
            style={{ padding: '10px 24px', borderRadius: '9999px', background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', border: 'none', color: '#090e17', fontSize: '13px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 16px rgba(245, 158, 11, 0.35)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            {isSaving ? 'Updating...' : 'Save Modifications ✓'}
          </button>
        </div>
      </form>
    </div>
  );
}
