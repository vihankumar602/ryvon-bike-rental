import React, { useState } from 'react';
import { useModal } from '../../context/ModalContext';
import { getBikeImage, bikes } from '../../data/bikes';

export default function ARPreviewModal({ bike: propBike, bikeId }) {
  const { closeModal } = useModal();
  const bike = propBike || (bikeId ? bikes.find(b => b.id === bikeId) : null) || bikes[0];
  const imgSrc = getBikeImage(bike);

  const [scale, setScale] = useState(1);
  const [flip, setFlip] = useState(false);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.15, 1.6));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.15, 0.6));
  const handleFlip = () => setFlip(f => !f);

  return (
    <div className="modal" style={{ width: 'min(680px, 94vw)' }}>
      <button className="icon-btn modal-close" onClick={closeModal} aria-label="Close">✕</button>
      <span className="eyebrow">🔮 WebAR Spatial Intelligence</span>
      <h2 style={{ margin: '4px 0 14px' }}>See {bike.name} in AR</h2>

      <div className="ar-preview-shell" id="ar-shell">
        <img
          src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"
          className="ar-camera-bg"
          alt="Camera Feed Simulation"
        />
        <div className="ar-grid-overlay"></div>
        <img
          src={imgSrc}
          className="ar-bike-model"
          id="ar-model"
          alt={bike.name}
          style={{
            transform: `scale(${scale}) ${flip ? 'scaleX(-1)' : ''}`,
            transition: 'transform 0.2s ease'
          }}
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/assets/images/ryvon-superbike.png'; }}
        />
        <div className="ar-controls-bar">
          <button
            className="btn btn-sm btn-outline"
            style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
            type="button"
            onClick={handleZoomIn}
          >
            🔍 Zoom +
          </button>
          <button
            className="btn btn-sm btn-outline"
            style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
            type="button"
            onClick={handleZoomOut}
          >
            🔍 Zoom -
          </button>
          <button
            className="btn btn-sm btn-outline"
            style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
            type="button"
            onClick={handleFlip}
          >
            🔄 Flip View
          </button>
        </div>
      </div>
    </div>
  );
}
