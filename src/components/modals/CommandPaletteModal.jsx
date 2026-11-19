import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import { bikes } from '../../data/bikes';
import { destinations } from '../../data/destinations';

export default function CommandPaletteModal() {
  const { closeModal, openModal } = useModal();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const q = query.toLowerCase().trim();

  const filteredBikes = bikes.filter(b =>
    !q || b.name.toLowerCase().includes(q) || b.brand.toLowerCase().includes(q) || b.type.toLowerCase().includes(q)
  ).slice(0, 5);

  const filteredDests = destinations.filter(d =>
    !q || d.name.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q) || d.cat.toLowerCase().includes(q)
  ).slice(0, 4);

  const actions = [
    { title: '✨ Build My Ride AI', desc: 'Neural route planner & machine matcher', icon: '✨', action: () => openModal('build-my-ride') },
    { title: '⚡ Quick Book Express', desc: 'Instant 60-second reservation shortcut', icon: '⚡', action: () => openModal('quick-book') },
    { title: '🆘 Emergency Highway SOS', desc: '24/7 Satellite telemetry & emergency assist', icon: '🆘', action: () => openModal('sos') },
    { title: '🧠 Change Rider Persona', desc: 'Calibrate your riding DNA & recommendations', icon: '🧠', action: () => openModal('rider-persona') },
    { title: '♡ Saved Fleet Garage', desc: 'View shortlisted bikes and comparisons', icon: '♡', action: () => navigate('/wishlist') },
    { title: '📊 Telemetry Dashboard', desc: 'Live ride metrics and expedition status', icon: '📊', action: () => navigate('/dashboard') },
    { title: '🏍️ My Journeys', desc: 'Active telemetry logs & booking history', icon: '🏍️', action: () => navigate('/booking-history') },
    { title: '❓ Help Center & FAQs', desc: 'Licensing, escrow, safety charter & policies', icon: '❓', action: () => navigate('/faq') }
  ].filter(a => !q || a.title.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q));

  const handleSelect = (callback) => {
    closeModal();
    callback();
  };

  return (
    <div
      className="modal cmdk-modal"
      style={{
        maxWidth: '620px',
        width: '95vw',
        padding: '0',
        overflow: 'hidden',
        borderRadius: '18px',
        border: '1px solid var(--line)',
        background: 'var(--surface)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--line)', gap: '12px' }}>
        <span style={{ fontSize: '18px', color: 'var(--gold, #f59e0b)' }}>⌕</span>
        <input
          ref={inputRef}
          type="search"
          placeholder="Type a motorcycle, destination, or command..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%',
            border: 'none',
            background: 'transparent',
            fontSize: '15px',
            color: 'var(--ink)',
            outline: 'none',
            fontFamily: 'inherit'
          }}
        />
        <button
          className="icon-btn"
          style={{ width: '30px', height: '30px', minWidth: '30px', fontSize: '13px' }}
          onClick={closeModal}
          aria-label="Close search"
        >
          ✕
        </button>
      </div>

      <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '14px' }}>
        {/* Commands & Shortcuts */}
        {actions.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <span className="eyebrow" style={{ fontSize: '10.5px', margin: '4px 8px 8px', display: 'block', color: 'var(--gold, #f59e0b)' }}>
              QUICK COMMANDS &amp; TOOLS
            </span>
            {actions.map((act, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease, transform 0.15s ease',
                  marginBottom: '4px'
                }}
                className="cmdk-item"
                onClick={() => handleSelect(act.action)}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--paper)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '15px' }}>{act.icon}</span>
                  <strong style={{ fontSize: '13.5px', color: 'var(--ink)' }}>{act.title}</strong>
                </div>
                <span className="muted" style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>{act.desc}</span>
              </div>
            ))}
          </div>
        )}

        {/* Matching Vehicles */}
        {filteredBikes.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <span className="eyebrow" style={{ fontSize: '10.5px', margin: '4px 8px 8px', display: 'block', color: 'var(--gold, #f59e0b)' }}>
              FLEET MOTORCYCLES
            </span>
            {filteredBikes.map((b) => (
              <div
                key={b.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  marginBottom: '4px'
                }}
                className="cmdk-item"
                onClick={() => handleSelect(() => navigate(`/bike-details?bike=${b.id}`))}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--paper)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '18px' }}>🏍️</span>
                  <div>
                    <strong style={{ fontSize: '13.5px', color: 'var(--ink)', display: 'block' }}>{b.name}</strong>
                    <span style={{ fontSize: '11.5px', color: 'var(--ink-soft)' }}>{b.engine} · {b.power}</span>
                  </div>
                </div>
                <span className="badge ghost" style={{ fontSize: '11px', fontWeight: 700 }}>
                  {b.type} · ₹{b.price}/d
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Matching Destinations */}
        {filteredDests.length > 0 && (
          <div>
            <span className="eyebrow" style={{ fontSize: '10.5px', margin: '4px 8px 8px', display: 'block', color: 'var(--gold, #f59e0b)' }}>
              EXPEDITION DESTINATIONS
            </span>
            {filteredDests.map((d) => (
              <div
                key={d.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  marginBottom: '4px'
                }}
                className="cmdk-item"
                onClick={() => handleSelect(() => navigate(`/destinations?dest=${d.id}`, { state: { cardImg: d.img } }))}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--paper)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '18px' }}>🏔️</span>
                  <div>
                    <strong style={{ fontSize: '13.5px', color: 'var(--ink)', display: 'block' }}>{d.name}</strong>
                    <span style={{ fontSize: '11.5px', color: 'var(--ink-soft)' }}>{d.terrainType}</span>
                  </div>
                </div>
                <span className="muted" style={{ fontSize: '11.5px', color: 'var(--gold, #f59e0b)', fontWeight: 600 }}>
                  {d.elevation}
                </span>
              </div>
            ))}
          </div>
        )}

        {actions.length === 0 && filteredBikes.length === 0 && filteredDests.length === 0 && (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--ink-soft)' }}>
            <p style={{ margin: 0 }}>No results found for &ldquo;{query}&rdquo;</p>
            <span style={{ fontSize: '12px', opacity: 0.7 }}>Try searching for &ldquo;Himalayan&rdquo;, &ldquo;Spiti&rdquo;, or &ldquo;Quick Book&rdquo;</span>
          </div>
        )}
      </div>

      <div style={{ padding: '10px 16px', background: 'var(--paper)', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--ink-soft)' }}>
        <span>Navigate commands &amp; fleet catalog</span>
        <span>Press <kbd style={{ padding: '2px 5px', borderRadius: '4px', background: 'var(--surface)', border: '1px solid var(--line)' }}>ESC</kbd> to exit</span>
      </div>
    </div>
  );
}
