import React from 'react';
import { Link } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import { useCurrency } from '../../context/CurrencyContext';
import { bikes, getBikeImage } from '../../data/bikes';

export default function AICompareModal({ bikeAId, bikeBId }) {
  const { closeModal } = useModal();
  const { money } = useCurrency();

  const a = bikes.find(x => x.id === bikeAId) || bikes[0];
  const b = bikes.find(x => x.id === bikeBId) || bikes[1] || bikes[0];

  if (!a || !b) return null;

  const aDna = a.dna || { comfort: 90, adventure: 90, mileage: 80 };
  const bDna = b.dna || { comfort: 90, adventure: 90, mileage: 80 };

  return (
    <div
      className="modal"
      style={{
        maxWidth: '780px',
        width: '95%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px',
        position: 'relative'
      }}
      onClick={e => e.stopPropagation()}
    >
      <button className="icon-btn modal-close" type="button" aria-label="Close" onClick={closeModal}>✕</button>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <span className="badge" style={{ background: 'var(--gold, #f59e0b)', color: '#070a0f', fontWeight: 800, marginBottom: '6px' }}>
          ⚡ AI COMPARATIVE TELEMETRY
        </span>
        <h2 style={{ margin: '4px 0 0', fontFamily: 'var(--font-serif)', fontSize: '24px' }}>
          Side-by-Side Match Matrix
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {/* Bike A */}
        <div style={{ textAlign: 'center', background: 'var(--paper)', padding: '16px', borderRadius: '14px', border: '1px solid var(--line)' }}>
          <img
            src={getBikeImage(a)}
            alt={a.name}
            style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '10px', marginBottom: '10px', background: 'var(--surface)' }}
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/images/ryvon-superbike.png'; }}
          />
          <h3 style={{ margin: '0 0 4px', fontSize: '18px' }}>{a.name}</h3>
          <span className="badge ghost" style={{ fontSize: '11px', marginBottom: '8px' }}>{a.type}</span>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--gold, #f59e0b)', marginTop: '6px' }}>
            {money(a.price)} <small style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>/ day</small>
          </div>
          <Link
            to={`/booking?bike=${a.id}`}
            className="btn btn-primary btn-sm"
            style={{ width: '100%', marginTop: '12px', fontWeight: 800 }}
            onClick={closeModal}
          >
            Book {a.name.split(' ')[0]} →
          </Link>
        </div>

        {/* Bike B */}
        <div style={{ textAlign: 'center', background: 'var(--paper)', padding: '16px', borderRadius: '14px', border: '1px solid var(--line)' }}>
          <img
            src={getBikeImage(b)}
            alt={b.name}
            style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '10px', marginBottom: '10px', background: 'var(--surface)' }}
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/images/ryvon-superbike.png'; }}
          />
          <h3 style={{ margin: '0 0 4px', fontSize: '18px' }}>{b.name}</h3>
          <span className="badge ghost" style={{ fontSize: '11px', marginBottom: '8px' }}>{b.type}</span>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--gold, #f59e0b)', marginTop: '6px' }}>
            {money(b.price)} <small style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>/ day</small>
          </div>
          <Link
            to={`/booking?bike=${b.id}`}
            className="btn btn-primary btn-sm"
            style={{ width: '100%', marginTop: '12px', fontWeight: 800 }}
            onClick={closeModal}
          >
            Book {b.name.split(' ')[0]} →
          </Link>
        </div>
      </div>

      {/* Spec Comparison Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '12px', overflow: 'hidden' }}>
        {[
          ['Engine Displacement', a.engine, b.engine],
          ['Max Power', a.power, b.power],
          ['Torque', a.torque, b.torque],
          ['Kerb Weight', a.weight, b.weight],
          ['Seat Height', a.seat, b.seat],
          ['Top Speed', a.topSpeed, b.topSpeed],
          ['Transmission', a.transmission, b.transmission],
          ['Fuel Capacity', a.fuelCap, b.fuelCap],
          ['Security Deposit', money(a.deposit), money(b.deposit)],
          ['Comfort Score', `${aDna.comfort}%`, `${bDna.comfort}%`],
          ['Adventure Score', `${aDna.adventure}%`, `${bDna.adventure}%`],
          ['Efficiency Score', `${aDna.mileage}%`, `${bDna.mileage}%`]
        ].map(([label, valA, valB], idx) => (
          <div
            key={idx}
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr 1fr',
              padding: '10px 16px',
              borderBottom: '1px solid var(--line)',
              background: idx % 2 === 0 ? 'var(--paper)' : 'transparent',
              fontSize: '12.5px'
            }}
          >
            <span style={{ fontWeight: 700, color: 'var(--ink-soft)' }}>{label}</span>
            <strong style={{ textAlign: 'center' }}>{valA}</strong>
            <strong style={{ textAlign: 'center' }}>{valB}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
