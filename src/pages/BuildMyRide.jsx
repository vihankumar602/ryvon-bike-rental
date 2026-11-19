import React, { useEffect } from 'react';
import BuildMyRideView from '../components/build/BuildMyRideView';

export default function BuildMyRide() {
  useEffect(() => {
    document.title = 'Build My Ride AI — RYVON Intelligent Motorcycle Planner';
  }, []);

  return (
    <main id="app" tabIndex="-1" className="build-my-ride-page-container">
      <BuildMyRideView isModal={false} />
    </main>
  );
}
