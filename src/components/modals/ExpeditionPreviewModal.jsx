import React from 'react';
import { Link } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import { useCurrency } from '../../context/CurrencyContext';
import { destinations } from '../../data/destinations';
import { getBike, bikeImg } from '../../data/bikes';

export default function ExpeditionPreviewModal({ destId }) {
  const { closeModal } = useModal();
  const { money } = useCurrency();

  const d = destinations.find(x => x.id === destId) || destinations[0];
  const durationDays = parseInt(d.idealDays) || 4;

  let bestId = 'himalayan', advId = 'ktmadv390', comfortId = 'scram411';
  let bestWhy = 'Purpose-built for mountain passes with 220mm ground clearance & long-travel suspension.';
  let advWhy = 'High-output rally performance with cornering ABS and offroad traction mode.';
  let comfortWhy = 'Relaxed upright ergonomics and approachable seat height for endurance touring.';

  if (d.cat === 'mountain') {
    if (d.id === 'ladakh' || d.id === 'zanskar' || d.id === 'spiti') {
      bestId = 'himalayan'; advId = 'ktmadv390'; comfortId = 'scram411';
      bestWhy = `Engineered for ${d.elevation} high-altitude passes with 220mm ground clearance & 21-inch front spoke wheel.`;
      advWhy = '43.5 PS LC4c engine with WP Apex suspension handles extreme gravel climbs and rocky river crossings.';
      comfortWhy = 'Low 795mm seat height and torquey LS410 engine provide confidence-inspiring low-speed tractor torque.';
    } else if (d.id === 'manali' || d.id === 'kashmir') {
      bestId = 'bmw310'; advId = 'scrambler400x'; comfortId = 'speed400';
    } else {
      bestId = 'scrambler400x'; advId = 'himalayan'; comfortId = 'classic350';
    }
  } else if (d.cat === 'coastal') {
    if (d.id === 'goa') {
      bestId = 'trident'; advId = 'aerox'; comfortId = 'activa6g';
    } else {
      bestId = 'gt650'; advId = 'speed400'; comfortId = 'meteor';
    }
  } else if (d.cat === 'desert') {
    bestId = 'supermeteor'; advId = 'classic350'; comfortId = 'meteor';
  } else {
    bestId = 'meteor'; advId = 'scrambler400x'; comfortId = 'speed400';
  }

  const recs = [
    { bike: getBike(bestId), badge: '🏆 BEST OVERALL MATCH', badgeColor: '#fbbf24', why: bestWhy },
    { bike: getBike(advId), badge: '⚡ PERFORMANCE MATCH', badgeColor: '#38bdf8', why: advWhy },
    { bike: getBike(comfortId), badge: '🛡️ RELAXED & ENDURANCE', badgeColor: '#34d399', why: comfortWhy }
  ];

  return (
    <div className="modal" style={{ width: 'min(720px,95vw)', maxHeight: '90vh', overflowY: 'auto', padding: '24px', position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button className="icon-btn modal-close" type="button" aria-label="Close" onClick={closeModal}>✕</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <img
            src={d.img}
            width="90"
            height="70"
            style={{ objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--line)' }}
            alt={d.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
              <span className="badge" style={{ background: 'var(--lime,#fbbf24)', color: '#070a0f', fontWeight: 800, fontSize: '10px' }}>{d.season}</span>
              <span className="elevation-badge" style={{ fontSize: '10px' }}>🏔️ {d.elevation}</span>
            </div>
            <h2 style={{ margin: '2px 0 4px', fontFamily: 'var(--font-serif)', fontSize: '22px' }}>{d.name}</h2>
            <span style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>Base Hub: <strong>{d.baseHub}</strong> · {d.idealDays}</span>
          </div>
        </div>

        <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: '12px', padding: '12px', marginBottom: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', fontSize: '11.5px' }}>
          <div><span className="muted" style={{ display: 'block', fontSize: '9.5px', fontWeight: 800 }}>WEATHER</span><strong>{d.weather}</strong></div>
          <div><span className="muted" style={{ display: 'block', fontSize: '9.5px', fontWeight: 800 }}>ROAD QUALITY</span><strong>{d.road}</strong></div>
          <div><span className="muted" style={{ display: 'block', fontSize: '9.5px', fontWeight: 800 }}>DIFFICULTY</span><strong>{d.difficulty}</strong></div>
          <div><span className="muted" style={{ display: 'block', fontSize: '9.5px', fontWeight: 800 }}>TERRAIN</span><strong>{d.terrainType}</strong></div>
        </div>

        <div style={{ background: 'rgba(245,158,11,0.1)', borderLeft: '4px solid #f59e0b', padding: '10px 14px', borderRadius: '0 10px 10px 0', fontSize: '12px', fontWeight: 600, marginBottom: '16px', color: 'var(--ink)' }}>
          💡 <strong>AI Trip Advisory:</strong> "{d.desc}"
        </div>

        <div style={{ marginBottom: '12px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', margin: '0 0 10px 0' }}>Recommended Machines for This Route:</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            {recs.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '12px', flexWrap: 'wrap' }}>
                <img
                  src={bikeImg(r.bike)}
                  width="70"
                  height="50"
                  style={{ objectFit: 'cover', borderRadius: '8px' }}
                  alt={r.bike.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/assets/images/ryvon-superbike.png';
                  }}
                />
                <div style={{ flex: 1, minWidth: '160px' }}>
                  <span className="badge" style={{ background: r.badgeColor, color: '#070a0f', fontSize: '9px', fontWeight: 800, padding: '2px 6px' }}>{r.badge}</span>
                  <h4 style={{ margin: '2px 0 1px 0', fontSize: '14px' }}>{r.bike.name}</h4>
                  <small className="muted" style={{ fontSize: '11px' }}>{r.bike.engine} · {r.bike.power} · <strong>{money(r.bike.price)}/day</strong></small>
                </div>
                <Link
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '11.5px', fontWeight: 800 }}
                  to={`/booking?bike=${r.bike.id}&dest=${encodeURIComponent(d.name)}&city=${encodeURIComponent(d.baseHub)}&days=${durationDays}`}
                  onClick={closeModal}
                >
                  Book for {d.name.split(' ')[0]} →
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <Link
            className="btn btn-outline btn-sm"
            style={{ flex: 1, textAlign: 'center' }}
            to={`/destinations?dest=${d.id}`}
            state={{ cardImg: d.img }}
            onClick={closeModal}
          >
            Open Full Route Dossier 🗺️
          </Link>
          <button className="btn btn-primary btn-sm modal-close" type="button" onClick={closeModal} style={{ flex: 1 }}>Done</button>
        </div>
      </div>
  );
}
