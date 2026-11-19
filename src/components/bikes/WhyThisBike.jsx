import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';

export default function WhyThisBike({ bike }) {
  const { money } = useCurrency();
  if (!bike) return null;

  const d = bike.dna || { comfort: 92, adventure: 97, city: 82, beginner: 74, longRide: 95, mileage: 84 };
  const matchVal = bike.aiMatch || '94% Match';

  const reasons = [
    `Fits your ${money(1500)} daily budget`,
    bike.type === 'Scooter'
      ? 'Optimized for smooth city commute & underseat storage'
      : (bike.type === 'Adventure'
        ? 'Excellent for mountain roads & offroad passes'
        : 'Optimized for smooth highway cruising & city commute'),
    `High rider comfort score (${d.comfort}% ergonomics rating)`,
    'Strong braking stability & chassis control',
    'Suitable for multi-day rental touring'
  ];

  return (
    <div className="why-recommend-card">
      <div className="why-match-header">
        <div>
          <span className="eyebrow" style={{ margin: 0 }}>💡 AI "WHY THIS VEHICLE?"</span>
          <h3 style={{ margin: '2px 0' }}>Why We Recommend This</h3>
        </div>
        <div className="why-match-score">{matchVal}</div>
      </div>

      <div className="why-reason-list">
        {reasons.map((r, i) => (
          <div key={i} className="why-reason-item">
            <span className="why-reason-icon">✓</span>
            <span>{r}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
