import React, { useState } from 'react';
import { useCurrency } from '../../context/CurrencyContext';

export default function TripCostSimulator({ bike }) {
  const { money } = useCurrency();
  const defaultRate = bike ? bike.price : 1499;

  const [days, setDays] = useState(3);
  const [rate, setRate] = useState(defaultRate);

  const rental = days * rate;
  const fuel = Math.round(days * 500);
  const tolls = Math.round(days * 130);
  const food = Math.round(days * 600);
  const hotel = Math.round(days * 1050);
  const activities = Math.round(days * 330);
  const total = rental + fuel + tolls + food + hotel + activities;

  return (
    <div className="cost-simulator-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="eyebrow" style={{ margin: 0 }}>📊 TRIP COST SIMULATOR</span>
          <h3 style={{ margin: '2px 0' }}>Dynamic Trip Financial Estimator</h3>
        </div>
        <span className="badge ghost">Real-time Telemetry</span>
      </div>

      <div className="sim-controls-grid">
        <div>
          <label style={{ fontSize: '11px', fontWeight: 800 }}>
            Trip Duration: <strong id="sim-days-val" style={{ color: 'var(--lime-dark)' }}>{days} Day{days === 1 ? '' : 's'}</strong>
          </label>
          <input
            type="range"
            id="sim-days-range"
            min="1"
            max="14"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '11px', fontWeight: 800 }}>
            Daily Rate: <strong id="sim-rate-val" style={{ color: 'var(--lime-dark)' }}>{money(rate)}/day</strong>
          </label>
          <input
            type="range"
            id="sim-rate-range"
            min="500"
            max="3500"
            step="100"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <div className="sim-cost-breakdown">
        <div className="sim-cost-tile"><span>Rental</span><strong>{money(rental)}</strong></div>
        <div className="sim-cost-tile"><span>Fuel</span><strong>{money(fuel)}</strong></div>
        <div className="sim-cost-tile"><span>Tolls</span><strong>{money(tolls)}</strong></div>
        <div className="sim-cost-tile"><span>Food Estimate</span><strong>{money(food)}</strong></div>
        <div className="sim-cost-tile"><span>Hotel Estimate</span><strong>{money(hotel)}</strong></div>
        <div className="sim-cost-tile"><span>Activities</span><strong>{money(activities)}</strong></div>
      </div>

      <div className="sim-total-box">
        <div>
          <span style={{ fontSize: '11px', color: '#cbd5e1' }}>TOTAL ESTIMATED TRIP COST</span>
          <strong style={{ display: 'block', fontSize: '11px', color: '#cbd5e1' }}>Includes Rental, Fuel, Tolls & Stay</strong>
        </div>
        <div className="sim-total-val" id="sim-total-cost">{money(total)}</div>
      </div>
    </div>
  );
}
