import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

// Context Providers
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { ModalProvider } from './context/ModalContext';
import { ToastProvider } from './context/ToastContext';
import { BookingProvider } from './context/BookingContext';

// Common Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import RyvonLoader from './components/common/RyvonLoader';
import ReadingProgress from './components/common/ReadingProgress';
import BackToTop from './components/common/BackToTop';
import MobileBottomNav from './components/common/MobileBottomNav';
import ModalRoot from './components/modals/ModalRoot';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Bikes from './pages/Bikes';
import BikeDetails from './pages/BikeDetails';
import Destinations from './pages/Destinations';
import BuildMyRide from './pages/BuildMyRide';
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';
import BookingHistory from './pages/BookingHistory';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import UrbanStriker from './pages/UrbanStriker';
import About from './pages/About';
import Contact from './pages/Contact';
import Faq from './pages/Faq';
import Login from './pages/Login';
import Register from './pages/Register';

// Helper component to scroll to top on path change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  return (
    <>
      <ScrollToTop />
      <RyvonLoader />
      <ReadingProgress />
      <Header />

      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />
        <Route path="/index.html" element={<Home />} />

        {/* Fleet & Bikes */}
        <Route path="/bikes" element={<Bikes />} />
        <Route path="/pages/bikes.html" element={<Bikes />} />
        <Route path="/bike-details" element={<BikeDetails />} />
        <Route path="/pages/bike-details.html" element={<BikeDetails />} />
        <Route path="/details" element={<BikeDetails />} />

        {/* Destinations */}
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/pages/destinations.html" element={<Destinations />} />

        {/* Build My Ride AI Planner */}
        <Route path="/build-my-ride" element={<BuildMyRide />} />
        <Route path="/pages/build-my-ride.html" element={<BuildMyRide />} />
        <Route path="/ai-build" element={<BuildMyRide />} />

        {/* Booking */}
        <Route path="/booking" element={<Booking />} />
        <Route path="/pages/booking.html" element={<Booking />} />
        <Route path="/checkout" element={<Booking />} />
        <Route path="/pages/checkout.html" element={<Booking />} />

        {/* Dashboard & Journeys */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/pages/dashboard.html" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/booking-history" element={<BookingHistory />} />
        <Route path="/pages/booking-history.html" element={<BookingHistory />} />
        <Route path="/history" element={<BookingHistory />} />

        {/* Profile */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/pages/profile.html" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Urban Striker Rider DNA Experience */}
        <Route path="/urban-striker" element={<UrbanStriker />} />
        <Route path="/urban-striker-profile" element={<UrbanStriker />} />
        <Route path="/pages/urban-striker.html" element={<UrbanStriker />} />

        {/* Wishlist / Smart Garage */}
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/pages/wishlist.html" element={<Wishlist />} />

        {/* Brand Story (About) */}
        <Route path="/about" element={<About />} />
        <Route path="/pages/about.html" element={<About />} />

        {/* Contact Command Hub */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/pages/contact.html" element={<Contact />} />

        {/* Help Center (FAQs) */}
        <Route path="/faq" element={<Faq />} />
        <Route path="/pages/faq.html" element={<Faq />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/pages/login.html" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pages/register.html" element={<Register />} />

        {/* Fallback */}
        <Route path="*" element={<Home />} />
      </Routes>

      <Footer />
      <BackToTop />
      <MobileBottomNav />
      <ModalRoot />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <ThemeProvider>
            <CurrencyProvider>
              <AuthProvider>
                <WishlistProvider>
                  <BookingProvider>
                    <ModalProvider>
                      <AppContent />
                    </ModalProvider>
                  </BookingProvider>
                </WishlistProvider>
              </AuthProvider>
            </CurrencyProvider>
          </ThemeProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
