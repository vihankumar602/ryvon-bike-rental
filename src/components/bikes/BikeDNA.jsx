import React from 'react';

export default function BikeDNA({ bike }) {
  const d = bike?.dna || {
    comfort: 92,
    adventure: 97,
    city: 82,
    beginner: 74,
    longRide: 95,
    mileage: 84,
    bestFor: 'Mountain + Long Distance'
  };

  return (
    <div className="bike-dna-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span className="eyebrow" style={{ margin: 0 }}>🧬 VEHICLE DNA TELEMETRY</span>
        <span className="badge ghost">Rider Performance Genome</span>
      </div>
      <h3 style={{ margin: '2px 0 10px' }}>Vehicle Capability Profile</h3>

      <div className="dna-grid">
        <div className="dna-bar-item">
          <div className="dna-bar-head">
            <span>Comfort</span>
            <strong>{d.comfort}%</strong>
          </div>
          <div className="dna-bar-track">
            <div className="dna-bar-fill" style={{ width: `${d.comfort}%` }}></div>
          </div>
        </div>

        <div className="dna-bar-item">
          <div className="dna-bar-head">
            <span>Adventure</span>
            <strong>{d.adventure}%</strong>
          </div>
          <div className="dna-bar-track">
            <div className="dna-bar-fill" style={{ width: `${d.adventure}%` }}></div>
          </div>
        </div>

        <div className="dna-bar-item">
          <div className="dna-bar-head">
            <span>City Maneuverability</span>
            <strong>{d.city}%</strong>
          </div>
          <div className="dna-bar-track">
            <div className="dna-bar-fill" style={{ width: `${d.city}%` }}></div>
          </div>
        </div>

        <div className="dna-bar-item">
          <div className="dna-bar-head">
            <span>Beginner Friendly</span>
            <strong>{d.beginner}%</strong>
          </div>
          <div className="dna-bar-track">
            <div className="dna-bar-fill" style={{ width: `${d.beginner}%` }}></div>
          </div>
        </div>

        <div className="dna-bar-item">
          <div className="dna-bar-head">
            <span>Long Ride Endurance</span>
            <strong>{d.longRide}%</strong>
          </div>
          <div className="dna-bar-track">
            <div className="dna-bar-fill" style={{ width: `${d.longRide}%` }}></div>
          </div>
        </div>

        <div className="dna-bar-item">
          <div className="dna-bar-head">
            <span>Mileage Efficiency</span>
            <strong>{d.mileage}%</strong>
          </div>
          <div className="dna-bar-track">
            <div className="dna-bar-fill" style={{ width: `${d.mileage}%` }}></div>
          </div>
        </div>
      </div>

      <div className="dna-best-for-box">
        <span>🏆 Best for:</span>
        <span><strong>{d.bestFor}</strong></span>
      </div>
    </div>
  );
}
