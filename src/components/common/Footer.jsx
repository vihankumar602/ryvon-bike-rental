import React from 'react';
import { Link } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';

export default function Footer() {
  const { openModal } = useModal();

  return (
    <footer id="site-footer" className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link className="brand" to="/">
              <img className="brand-logo" src="/assets/images/ryvon-logo.png" alt="RYVON logo" />
              <span className="brand-text">RYVON</span>
            </Link>
            <p>The world’s most intelligent motorcycle rental platform. Designed for pure freedom on the open road.</p>
            <div className="socials">
              <a className="social" href="#instagram" aria-label="Instagram">ig</a>
              <a className="social" href="#twitter" aria-label="Twitter">𝕏</a>
              <a className="social" href="#youtube" aria-label="YouTube">yt</a>
            </div>
          </div>
          <div className="footer-col">
            <h3>Fleet & Routes</h3>
            <Link to="/bikes">All Motorcycles</Link>
            <Link to="/destinations">Expedition Zones</Link>
            <Link to="/bikes?type=Adventure">Adventure Fleet</Link>
            <Link to="/wishlist">Saved Shortlist</Link>
          </div>
          <div className="footer-col">
            <h3>RYVON Intelligence</h3>
            <Link to="/faq">FAQs & Safety</Link>
            <Link to="/contact">Ride Command Hub</Link>
            <a href="#ai-assistant" onClick={(e) => { e.preventDefault(); openModal('ai-assistant'); }}>
              AI Ride Planner
            </a>
          </div>
          <div className="footer-col">
            <h3>Members Circle</h3>
            <Link to="/dashboard">Telemetry Dashboard</Link>
            <Link to="/booking-history">Journey Logs</Link>
            <Link to="/profile">Rider Profile</Link>
            <Link to="/login">Member Sign in</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 RYVON Technologies. Engineered for the scenic detour.</span>
          <span>Privacy Policy · Terms of Service · Safety Charter</span>
        </div>
      </div>
    </footer>
  );
}
