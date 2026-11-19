import React, { useState } from 'react';
import { useModal } from '../../context/ModalContext';
import { bikes, getBikeImage } from '../../data/bikes';

export default function Bike360Modal({ bikeId }) {
  const { closeModal } = useModal();
  const bike = bikes.find(b => b.id === bikeId) || bikes[0];
  const [rotation, setRotation] = useState(0);

  const imgSrc = getBikeImage(bike);

  return (
    <div
      className="modal"
      style={{
        maxWidth: '640px',
        width: '100%',
        padding: '24px',
        textAlign: 'center',
        position: 'relative'
      }}
      onClick={e => e.stopPropagation()}
    >
      <button className="icon-btn modal-close" type="button" aria-label="Close" onClick={closeModal}>✕</button>

      <span className="badge" style={{ background: 'var(--gold, #f59e0b)', color: '#070a0f', fontWeight: 800, marginBottom: '8px' }}>
        ✦ 360° IMMERSIVE STUDIO
      </span>
      <h2 style={{ margin: '4px 0 16px', fontFamily: 'var(--font-serif)', fontSize: '22px' }}>
        {bike.name}
      </h2>

      <div style={{ position: 'relative', width: '100%', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--line)', marginBottom: '16px' }}>
        <img
          src={imgSrc}
          alt={bike.name}
          style={{
            maxHeight: '220px',
            maxWidth: '90%',
            objectFit: 'contain',
            transform: `rotateY(${rotation}deg)`,
            transition: 'transform 0.05s ease-out'
          }}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/assets/images/ryvon-superbike.png';
          }}
        />
        <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.7)', padding: '4px 14px', borderRadius: '20px', color: '#fff', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
          Perspective: {rotation}°
        </div>
      </div>

      <div>
        <label style={{ fontSize: '12px', fontWeight: 800, display: 'block', marginBottom: '8px', color: 'var(--ink-soft)' }}>
          Drag Slider or Touch to Rotate Showroom Angle
        </label>
        <input
          type="range"
          min="-180"
          max="180"
          value={rotation}
          onChange={(e) => setRotation(Number(e.target.value))}
          style={{ width: '85%', accentColor: 'var(--gold, #f59e0b)', cursor: 'pointer' }}
        />
      </div>

      <div style={{ marginTop: '16px' }}>
        <button className="btn btn-outline btn-sm" type="button" onClick={closeModal}>
          Close Studio
        </button>
      </div>
    </div>
  );
}
