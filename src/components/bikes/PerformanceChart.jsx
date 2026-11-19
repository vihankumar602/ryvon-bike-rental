import React from 'react';

export default function PerformanceChart({ bike }) {
  if (!bike) return null;

  return (
    <div className="perf-graph-container">
      <div className="perf-graph-header">
        <h4>Engine Telemetry (Power & Torque Curve)</h4>
        <div className="perf-legend">
          <span className="legend-power">Power ({bike.power})</span>
          <span className="legend-torque">Torque ({bike.torque})</span>
        </div>
      </div>
      <svg className="perf-svg" viewBox="0 0 400 140">
        <path d="M 30 110 Q 100 80, 200 40 T 370 20" fill="none" stroke="var(--lime)" strokeWidth="3" />
        <path d="M 30 100 Q 120 40, 240 50 T 370 70" fill="none" stroke="var(--cyber)" strokeWidth="3" />
        <line x1="30" y1="120" x2="370" y2="120" stroke="var(--line)" strokeWidth="1" />
        <text x="30" y="135" fill="var(--ink-soft)" fontSize="10">2K RPM</text>
        <text x="130" y="135" fill="var(--ink-soft)" fontSize="10">4K RPM</text>
        <text x="230" y="135" fill="var(--ink-soft)" fontSize="10">6K RPM</text>
        <text x="330" y="135" fill="var(--ink-soft)" fontSize="10">9K RPM</text>
      </svg>
    </div>
  );
}
