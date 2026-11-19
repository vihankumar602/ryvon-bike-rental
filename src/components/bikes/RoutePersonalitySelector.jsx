import React, { useState } from 'react';

export default function RoutePersonalitySelector() {
  const [selectedRoute, setSelectedRoute] = useState('Fastest');

  return (
    <div className="route-personality-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="eyebrow" style={{ margin: 0 }}>🧭 ROUTE PERSONALITY</span>
          <h3 style={{ margin: '2px 0' }}>Choose Your Trip Style</h3>
        </div>
        <span className="badge ghost">Chandigarh → Manali</span>
      </div>

      <div className="route-personality-grid">
        <div
          className={`route-personality-chip ${selectedRoute === 'Fastest' ? 'selected' : ''}`}
          onClick={() => setSelectedRoute('Fastest')}
        >
          <strong>⚡ Fastest</strong>
          <span>5h 20m · Expressway</span>
        </div>
        <div
          className={`route-personality-chip ${selectedRoute === 'Scenic' ? 'selected' : ''}`}
          onClick={() => setSelectedRoute('Scenic')}
        >
          <strong>🏔️ Scenic</strong>
          <span>6h 40m · Mountain Pass</span>
        </div>
        <div
          className={`route-personality-chip ${selectedRoute === 'Nature' ? 'selected' : ''}`}
          onClick={() => setSelectedRoute('Nature')}
        >
          <strong>🍃 Nature</strong>
          <span>7h 10m · Forest & River</span>
        </div>
        <div
          className={`route-personality-chip ${selectedRoute === 'Foodie' ? 'selected' : ''}`}
          onClick={() => setSelectedRoute('Foodie')}
        >
          <strong>☕ Foodie</strong>
          <span>8h · Dhaba Trail</span>
        </div>
      </div>
    </div>
  );
}
