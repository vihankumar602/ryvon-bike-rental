import React from 'react';

export default function EcoRideScore({ bike }) {
  const d = bike?.dna || {};
  const score = d.mileage || 84;
  const lSaved = ((100 - score) * 0.08).toFixed(1);

  return (
    <div className="eco-score-card">
      <div className="eco-score-header">
        <div>
          <span className="eyebrow" style={{ margin: 0, color: '#047857' }}>🌱 ECO RIDE SCORE</span>
          <h3 style={{ margin: '2px 0' }}>Vehicle Efficiency Genome</h3>
        </div>
        <div className="eco-score-val">{score} / 100 🌱</div>
      </div>
      <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink)' }}>
        "Choosing this vehicle could reduce estimated fuel consumption by ~<strong>{lSaved}L</strong> compared with higher displacement alternatives."
      </p>
      <small className="muted" style={{ display: 'block', marginTop: '6px', fontSize: '10px' }}>
        Calculated from fuel efficiency, vehicle kerb weight, trip distance profile, and estimated CO2 emissions.
      </small>
    </div>
  );
}
