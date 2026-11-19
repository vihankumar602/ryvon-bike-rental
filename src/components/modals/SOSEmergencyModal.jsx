import React, { useState } from 'react';
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { useBookings } from '../../context/BookingContext';

export default function SOSEmergencyModal({ activeBooking }) {
  const { closeModal } = useModal();
  const { toast } = useToast();
  const { bookings } = useBookings();
  const [dispatched, setDispatched] = useState(false);

  const currentLive = activeBooking || bookings.find(b => b.status === 'Active') || bookings.find(b => b.status === 'Upcoming') || bookings[0];

  const refId = currentLive ? currentLive.id : 'RDS-EMERGENCY';
  const hub = currentLive ? currentLive.pickupCity : 'Manali Base Hub';
  const vehicleName = currentLive ? currentLive.bikeName : 'Fleet Vehicle';

  const handleDispatch = (e) => {
    e.preventDefault();
    setDispatched(true);
    toast('🚨 Highway SOS Signal Dispatched! Ground recovery unit alerted.');
  };

  return (
    <div
      className="modal"
      style={{
        width: 'min(640px, 94vw)',
        border: '2px solid #ef4444',
        boxShadow: '0 10px 40px rgba(239, 68, 68, 0.35)',
        padding: '24px',
        position: 'relative'
      }}
      onClick={e => e.stopPropagation()}
    >
      <button className="icon-btn modal-close" type="button" aria-label="Close" onClick={closeModal}>✕</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <span className="badge" style={{ background: '#ef4444', color: '#fff', fontWeight: 800, letterSpacing: '0.04em' }}>
          🚨 SMART EMERGENCY DISPATCH
        </span>
        <span style={{ fontSize: '11px', fontWeight: 800, color: '#ef4444' }}>
          LIVE SATELLITE TELEMETRY CONNECTED
        </span>
      </div>

      <h2 style={{ fontSize: '22px', margin: '4px 0 10px' }}>24/7 Roadside Command Center</h2>
      <p className="muted" style={{ fontSize: '13px', margin: '0 0 16px' }}>
        If you are stranded, facing a mechanical breakdown, or need emergency assistance on any highway corridor:
      </p>

      <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
          <span>Active Vehicle:</span> <strong>{vehicleName} (#{refId})</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
          <span>Nearest Base Hub:</span> <strong>{hub}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
          <span>Simulated Coordinates:</span> <strong style={{ color: '#ef4444' }}>32.2396° N, 77.1887° E (Himalayan Pass)</strong>
        </div>
      </div>

      {dispatched ? (
        <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(16,185,129,0.1)', borderRadius: '12px', border: '1px solid #10b981', marginBottom: '16px' }}>
          <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>✅</span>
          <h3 style={{ margin: '0 0 6px', color: '#10b981' }}>Recovery Partner Dispatched</h3>
          <p style={{ margin: 0, fontSize: '13px' }}>
            Estimated arrival: 25 minutes. Our operator is dialing your registered phone number.
          </p>
        </div>
      ) : (
        <form onSubmit={handleDispatch} style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
              Describe Emergency
            </label>
            <select className="filter-select" style={{ width: '100%' }}>
              <option value="flat">Flat Tire / Puncture Assistance</option>
              <option value="engine">Engine Stall / Mechanical Breakdown</option>
              <option value="fuel">Emergency Fuel Supply (5 Litres)</option>
              <option value="medical">Medical First-Aid Assistance &amp; Evac</option>
            </select>
          </div>
          <button className="btn btn-primary" type="submit" style={{ background: '#ef4444', color: '#fff', boxShadow: '0 4px 15px rgba(239,68,68,0.4)', padding: '12px', fontWeight: 800 }}>
            Transmit Satellite SOS Distress Signal →
          </button>
        </form>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--line)', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontSize: '12px' }}>Toll-Free SOS Hotline: <strong>+91 1800-RIDE-OS</strong></span>
        <button className="btn btn-outline btn-sm" type="button" onClick={closeModal}>Close</button>
      </div>
    </div>
  );
}
