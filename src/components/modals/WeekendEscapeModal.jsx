import React from 'react';
import { useModal } from '../../context/ModalContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Link } from 'react-router-dom';

const escapes = [
  {
    name: 'Kasauli Pine Trail',
    dist: '58 km',
    bike: 'Meteor 350',
    budget: 3200,
    weather: '21°C Pleasant 🌤️',
    diff: 'Easy',
    time: '1h 45m',
    img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Shimla Ridge Circuit',
    dist: '112 km',
    bike: 'Classic 350',
    budget: 4800,
    weather: '18°C Alpine 🌲',
    diff: 'Moderate',
    time: '3h 10m',
    img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Tirthan Valley Escapes',
    dist: '240 km',
    bike: 'Himalayan 450',
    budget: 7500,
    weather: '15°C Crisp 🏔️',
    diff: 'Intermediate',
    time: '5h 30m',
    img: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=600&q=80'
  }
];

export default function WeekendEscapeModal() {
  const { closeModal } = useModal();
  const { money } = useCurrency();

  return (
    <div className="modal" style={{ width: 'min(780px, 94vw)' }}>
      <button className="icon-btn modal-close" onClick={closeModal} aria-label="Close">✕</button>
      <span className="eyebrow">🚀 "I HAVE A WEEKEND" AI ESCAPE GENERATOR</span>
      <h2 style={{ margin: '4px 0 16px' }}>Starting from Chandigarh — 3 Curated Weekend Escapes</h2>

      <div className="weekend-escape-grid">
        {escapes.map(e => (
          <div key={e.name} className="weekend-escape-card">
            <img
              src={e.img}
              alt={e.name}
              style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '10px', marginBottom: '10px' }}
            />
            <span className="badge" style={{ background: 'var(--lime)', color: '#070a0f' }}>{e.diff}</span>
            <h3 style={{ margin: '6px 0 2px' }}>{e.name}</h3>
            <p style={{ fontSize: '11px', color: 'var(--ink-soft)', marginBottom: '8px' }}>
              <strong>{e.dist}</strong> • Est. {e.time}
            </p>

            <div style={{ fontSize: '11px', lineHeight: 1.6, marginBottom: '12px', background: 'var(--surface)', padding: '8px', borderRadius: '8px', border: '1px solid var(--line)' }}>
              <div>🏍️ Bike: <strong>{e.bike}</strong></div>
              <div>💳 Budget: <strong>{money(e.budget)}</strong></div>
              <div>🌤️ Weather: <strong>{e.weather}</strong></div>
            </div>

            <Link
              className="btn btn-primary btn-sm"
              style={{ width: '100%', textAlign: 'center' }}
              to={`/bikes?q=${encodeURIComponent(e.bike)}`}
              onClick={closeModal}
            >
              Book This Escape →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
