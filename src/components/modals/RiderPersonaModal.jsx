import React, { useState } from 'react';
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const PERSONAS = [
  {
    id: 'Mountain Rider',
    name: 'Mountain Rider',
    icon: '🏔️',
    tag: 'Alpine & High Altitude',
    desc: 'Optimized for steep ascents, hairpin mountain passes, rough terrain and high-altitude Himalayan expeditions.',
    highlight: 'Dual-Channel ABS • High Ground Clearance'
  },
  {
    id: 'City Explorer',
    name: 'City Explorer',
    icon: '🏙️',
    tag: 'Agile Urban Commuter',
    desc: 'Designed for fluid urban navigation, responsive commuting, traffic filtering and quick city hub rentals.',
    highlight: 'Flickable Handling • Low Seat Height'
  },
  {
    id: 'Coastal Cruiser',
    name: 'Coastal Cruiser',
    icon: '🌊',
    tag: 'Scenic Ocean Corridors',
    desc: 'Relaxed upright ergonomics, low-end roll-on torque, and plush seating for endless shoreline highways.',
    highlight: 'Deep Exhaust Rumble • Relaxed Foot-Forward'
  },
  {
    id: 'Performance Rider',
    name: 'Performance Rider',
    icon: '⚡',
    tag: 'Precision & Adrenaline',
    desc: 'Aggressive clip-on geometry, instant throttle response, aerodynamic tuck, and race-derived braking.',
    highlight: 'High RPM Redline • Radial Calipers'
  },
  {
    id: 'Weekend Explorer',
    name: 'Weekend Explorer',
    icon: '🌲',
    tag: 'Misty Valleys & Escapes',
    desc: 'Versatile sport-touring with pannier compatibility and comfortable pillion ergonomics for 2-3 day getaways.',
    highlight: 'Touring Windscreen • 400km+ Range'
  },
  {
    id: 'Long Distance Rider',
    name: 'Long Distance Rider',
    icon: '🏍️',
    tag: 'Cross-Country Endurance',
    desc: 'Maximum touring comfort, massive fuel capacity, all-weather wind protection, and heavy luggage support.',
    highlight: 'Cruise Ergonomics • Heavy Cargo Rack'
  }
];

export default function RiderPersonaModal({ currentPersona, onSelect }) {
  const { closeModal } = useModal();
  const { toast } = useToast();
  const { riderPersona, setRiderPersona } = useAuth();

  const [selected, setSelected] = useState(() => {
    return currentPersona || riderPersona || localStorage.getItem('ryvon-rider-persona') || localStorage.getItem('rideos-rider-persona') || 'Mountain Rider';
  });

  const handleSelect = (pId) => {
    setSelected(pId);
    if (setRiderPersona) {
      setRiderPersona(pId);
    }
    localStorage.setItem('ryvon-rider-persona', pId);
    localStorage.setItem('rideos-rider-persona', pId);
    if (onSelect) onSelect(pId);
    toast(`Rider Persona calibrated: ${pId} 🎯`);
    closeModal();
  };

  return (
    <div
      className="modal rider-dna-modal"
      onClick={e => e.stopPropagation()}
    >
      <button className="icon-btn modal-close" onClick={closeModal} aria-label="Close">✕</button>

      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="badge" style={{ background: 'var(--lime)', color: '#070a0f', fontWeight: 800, fontSize: '10px', padding: '3px 9px' }}>
            ⚡ RIDER PROFILE INTELLIGENCE
          </span>
        </div>
        <h2 style={{ margin: '6px 0 4px', fontFamily: 'var(--font-serif)', fontSize: '23px', color: 'var(--ink)' }}>
          Calibrate Your Rider DNA
        </h2>
        <p style={{ color: 'var(--ink-soft)', fontSize: '13px', margin: '0 0 16px', lineHeight: 1.5, maxWidth: '580px' }}>
          Select your dominant riding style to personalize AI fleet recommendations, telemetry tuning, and recommended expedition routes.
        </p>
      </div>

      {/* Persona Selection Grid */}
      <div className="rider-dna-grid">
        {PERSONAS.map(p => {
          const isCurrent = selected === p.id;
          return (
            <div
              key={p.id}
              className={`rider-dna-card ${isCurrent ? 'active' : ''}`}
              onClick={() => handleSelect(p.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelect(p.id); }}
            >
              <div className="rider-dna-card-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="rider-dna-icon-wrap">{p.icon}</div>
                  <span className="rider-dna-tag">{p.tag}</span>
                </div>
                {isCurrent && (
                  <span className="rider-dna-active-badge">✓ Active</span>
                )}
              </div>

              <h3 className="rider-dna-card-title">{p.name}</h3>
              <p className="rider-dna-card-desc">{p.desc}</p>
              <div className="rider-dna-card-highlight">{p.highlight}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
