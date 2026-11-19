import React, { useState } from 'react';
import { useModal } from '../../context/ModalContext';
import { useBookings } from '../../context/BookingContext';
import { useToast } from '../../context/ToastContext';
import { useCurrency } from '../../context/CurrencyContext';
import { resolveJourneyBikeImage } from '../../pages/BookingHistory';

export default function DeleteBookingConfirmModal({ booking, bookingId, onDeleted }) {
  const { closeModal } = useModal();
  const { getBooking, deleteBooking, cancelBooking } = useBookings();
  const { toast } = useToast();
  const { money } = useCurrency();
  const [isProcessing, setIsProcessing] = useState(false);

  const currentBooking = booking || getBooking(bookingId);

  if (!currentBooking) {
    return (
      <div className="modal" style={{ maxWidth: '420px', padding: '24px', textAlign: 'center' }}>
        <button className="icon-btn modal-close" type="button" onClick={closeModal}>✕</button>
        <h3>Booking Not Found</h3>
        <button className="btn btn-primary btn-sm" type="button" onClick={closeModal}>Close</button>
      </div>
    );
  }

  const b = currentBooking;
  const isCompleted = b.status === 'Completed';
  const isCancelled = b.status === 'Cancelled';
  const isActiveOrUpcoming = b.status === 'Active' || b.status === 'Upcoming';

  const bikeImg = resolveJourneyBikeImage(b);
  const rawDest = (b.destCity || 'Expedition Route').trim();
  const cleanDestName = rawDest.replace(/(?:\s*Expedition)+$/gi, '').trim() || 'Expedition Destination';

  const handleConfirmAction = () => {
    if (isProcessing) return; // Prevent duplicate clicks
    setIsProcessing(true);

    try {
      let success = false;
      if (isCompleted) {
        // COMPLETED JOURNEY DELETION: Permanently removes the historical record
        success = deleteBooking(b.id);
        if (success) {
          toast(`🗑️ Completed reservation #${b.id} removed from Journey History.`);
        }
      } else if (isCancelled) {
        // CANCELLED RECORD DELETION: Removes the cancelled record
        success = deleteBooking(b.id);
        if (success) {
          toast(`🗑️ Booking record #${b.id} removed from your history.`);
        }
      } else {
        // ACTIVE / UPCOMING CANCELLATION: Retains cancellation workflow & refunds deposit
        success = cancelBooking(b.id);
        if (success) {
          toast(`Booking reservation #${b.id} cancelled. 100% deposit refunded.`);
        }
      }

      if (onDeleted) onDeleted(b.id);
      closeModal();
    } catch (err) {
      console.error(err);
      toast('Error processing reservation update. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="modal delete-confirm-modal"
      onClick={(e) => e.stopPropagation()}
      style={{
        maxWidth: '520px',
        width: '92%',
        padding: '0',
        borderRadius: '22px',
        overflow: 'hidden',
        border: '1.5px solid rgba(239, 68, 68, 0.45)',
        background: '#090e17',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(239, 68, 68, 0.15)'
      }}
      aria-label={isCompleted ? 'Delete Completed Reservation' : 'Cancel Reservation'}
    >
      {/* Top Banner with Clear Warning */}
      <div style={{ padding: '24px 26px', background: 'radial-gradient(circle at 10% 50%, rgba(239, 68, 68, 0.22) 0%, transparent 70%)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.16)', border: '1.5px solid rgba(239, 68, 68, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
            {isCompleted ? '🗑️' : '🛡️'}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '20px', fontFamily: 'var(--font-serif)', color: '#ffffff' }}>
              {isCompleted
                ? 'Delete Completed Reservation'
                : isCancelled
                ? 'Delete Cancelled Record'
                : 'Cancel Expedition Reservation'}
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
              {isCompleted
                ? `Are you sure you want to permanently delete completed journey #${b.id}?`
                : isCancelled
                ? `Are you sure you want to remove cancelled record #${b.id}?`
                : `Are you sure you want to cancel your reservation for #${b.id}?`}
            </p>
          </div>
          <button
            type="button"
            onClick={closeModal}
            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer', padding: '4px' }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Target Booking Details Card */}
      <div style={{ padding: '18px 26px', background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img
            src={bikeImg}
            alt={b.bikeName}
            style={{ width: '84px', height: '56px', objectFit: 'cover', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.14)', background: '#070a12', flexShrink: 0 }}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/assets/images/ryvon-superbike.png';
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
              <strong style={{ color: '#ffffff', fontSize: '15px' }}>{b.bikeName}</strong>
              <span style={{ fontSize: '10.5px', padding: '2px 8px', borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1', fontWeight: 700 }}>
                {b.bikeCategory || 'Motorcycle'}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              📍 {b.pickupCity || 'Base Hub'} → {cleanDestName} • {b.duration || 1} Days
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rental Total</span>
            <strong style={{ fontSize: '16px', color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>{money(b.total)}</strong>
          </div>
        </div>
      </div>

      {/* Clear Policy & Impact Explanation */}
      <div style={{ padding: '16px 26px', background: 'rgba(15, 23, 42, 0.55)', fontSize: '12.5px', color: '#cbd5e1', lineHeight: 1.55 }}>
        {isCompleted ? (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
              <span style={{ color: '#ef4444', fontSize: '15px' }}>⚠️</span>
              <div>
                <strong style={{ color: '#ffffff' }}>Removal from Journey History:</strong> This completed expedition will be removed from your Journey History, expedition logs, and activity stats.
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span style={{ color: '#f59e0b', fontSize: '15px' }}>ℹ️</span>
              <div>
                This action is permanent and only removes booking <strong>#{b.id}</strong>. All your other bookings remain completely unaffected.
              </div>
            </div>
          </>
        ) : isCancelled ? (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ color: '#ef4444', fontSize: '15px' }}>⚠️</span>
            <div>
              <strong style={{ color: '#ffffff' }}>Permanent Removal:</strong> This cancelled booking record <strong>#{b.id}</strong> will be permanently removed from your dashboard.
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
              <span style={{ color: '#10b981', fontSize: '15px' }}>✓</span>
              <div>
                <strong style={{ color: '#ffffff' }}>100% Escrow &amp; Deposit Refund:</strong> Your payment of {money(b.total)} and security deposit will be refunded to your original payment method ({b.paymentMode || 'Instant UPI'}) within 24 hours.
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span style={{ color: '#f59e0b', fontSize: '15px' }}>ℹ️</span>
              <div>
                The reserved motorcycle at <strong>{b.pickupCity || 'Base Hub'}</strong> will be released back into fleet availability.
              </div>
            </div>
          </>
        )}
      </div>

      {/* Action Buttons: Keep Reservation vs Confirm Delete / Cancellation */}
      <div style={{ padding: '18px 26px', display: 'flex', gap: '12px', justifyContent: 'flex-end', background: 'rgba(255, 255, 255, 0.02)' }}>
        <button
          type="button"
          onClick={closeModal}
          disabled={isProcessing}
          style={{
            padding: '10px 22px',
            borderRadius: '9999px',
            background: 'transparent',
            border: '1.5px solid rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 700,
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Keep Reservation
        </button>

        <button
          type="button"
          onClick={handleConfirmAction}
          disabled={isProcessing}
          style={{
            padding: '10px 26px',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            border: 'none',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 800,
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 16px rgba(239, 68, 68, 0.45)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          {isProcessing
            ? 'Processing...'
            : isCompleted || isCancelled
            ? 'Confirm Delete 🗑️'
            : 'Confirm Cancellation ✕'}
        </button>
      </div>
    </div>
  );
}
