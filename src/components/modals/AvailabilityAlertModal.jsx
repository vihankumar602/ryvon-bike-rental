import React, { useState } from 'react';
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { useCurrency } from '../../context/CurrencyContext';
import { bikes, getBikeImage } from '../../data/bikes';
import { Link } from 'react-router-dom';

export default function AvailabilityAlertModal({ bike }) {
  const { closeModal } = useModal();
  const { toast } = useToast();
  const { money } = useCurrency();
  const [contact, setContact] = useState('vihan@example.com');

  if (!bike) return null;

  const alts = bikes.filter(b => b.available && b.id !== bike.id && (b.type === bike.type || b.brand === bike.brand)).slice(0, 2);

  const handleNotify = (e) => {
    e.preventDefault();
    toast(`Notification alert set! We will SMS you when ${bike.name} opens.`);
    closeModal();
  };

  return (
    <div className="modal" style={{ width: 'min(580px, 94vw)' }}>
      <button className="icon-btn modal-close" onClick={closeModal} aria-label="Close">✕</button>
      <span className="eyebrow">📡 SMART AVAILABILITY ALERTS</span>
      <h2 style={{ margin: '4px 0 12px' }}>{bike.name} is Unavailable</h2>

      <div style={{ margin: '16px 0', padding: '14px', background: 'var(--paper)', borderRadius: '14px', border: '1px solid var(--line)' }}>
        <strong>Get Notified When Available:</strong>
        <form onSubmit={handleNotify} style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <input
            placeholder="Enter mobile or email"
            className="filter-select"
            style={{ flex: 1 }}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
          />
          <button className="btn btn-primary btn-sm" type="submit">
            Notify Me →
          </button>
        </form>
      </div>

      <h3 style={{ margin: '14px 0 8px' }}>Closest In-Stock Alternatives Recommended by AI</h3>
      <div style={{ display: 'grid', gap: '8px' }}>
        {alts.map(a => {
          const altImg = getBikeImage(a);
          return (
            <div key={a.id} className="alternative-bike-tile">
              <img
                src={altImg}
                width="60"
                height="45"
                alt={a.name}
                style={{ objectFit: 'cover', borderRadius: '6px' }}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/images/ryvon-superbike.png'; }}
              />
              <div style={{ flex: 1 }}>
                <strong>{a.name}</strong>
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--ink-soft)' }}>
                  {a.type} • {money(a.price)}/day
                </span>
              </div>
              <Link className="btn btn-primary btn-sm" to={`/booking?bike=${a.id}`} onClick={closeModal}>
                Book Alternative →
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
