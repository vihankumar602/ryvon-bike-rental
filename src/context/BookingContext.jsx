import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getSeedBookings } from '../data/seedBookings';
import { getTodayDateString } from '../utils/dateValidation';
import { useAuth } from './AuthContext';

const LEGACY_STORAGE_KEY = 'rideos-bookings';
const DELETED_BOOKINGS_STORAGE_KEY = 'ryvon-deleted-booking-ids';

const getDeletedBookingIds = () => {
  try {
    const raw = localStorage.getItem(DELETED_BOOKINGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const BookingContext = createContext(null);

const normalizeBookingStatuses = (list) => {
  if (!Array.isArray(list)) return [];
  const today = getTodayDateString();
  return list.map(item => {
    if (item.status === 'Cancelled' || item.bookingStatus === 'Cancelled') {
      return {
        ...item,
        status: 'Cancelled',
        bookingStatus: 'Cancelled'
      };
    }

    let computedStatus = item.status || item.bookingStatus || 'Upcoming';
    const sDate = item.startDate || item.pickupDate;
    const eDate = item.endDate || item.returnDate;
    if (sDate && eDate) {
      if (sDate > today) {
        computedStatus = 'Upcoming';
      } else if (sDate <= today && eDate >= today) {
        computedStatus = 'Active';
      } else if (eDate < today) {
        computedStatus = 'Completed';
      }
    }

    return {
      ...item,
      status: computedStatus,
      bookingStatus: computedStatus
    };
  });
};

export function BookingProvider({ children }) {
  const { user } = useAuth();
  const userEmail = (user?.email || '').toLowerCase().trim();
  const storageKey = userEmail ? `rideos-bookings-${userEmail}` : 'rideos-bookings-guest';

  const loadUserBookings = useCallback((emailKey, currentUser) => {
    if (!currentUser || !currentUser.email) {
      return [];
    }
    const key = `rideos-bookings-${currentUser.email.toLowerCase().trim()}`;
    const deletedIds = getDeletedBookingIds();
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return normalizeBookingStatuses(parsed.filter(b => !deletedIds.includes(b.id)));
        }
      }

      // Check legacy key for existing demo/admin account only
      const isDemoAccount = currentUser.email.toLowerCase().includes('vihan') || currentUser.isDemo;
      if (isDemoAccount) {
        const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacy) {
          const parsedLegacy = JSON.parse(legacy);
          if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
            const cleaned = parsedLegacy.filter(b => !deletedIds.includes(b.id));
            localStorage.setItem(key, JSON.stringify(cleaned));
            return normalizeBookingStatuses(cleaned);
          }
        }
        // Seed bookings for demo account
        const seeds = getSeedBookings().filter(b => !deletedIds.includes(b.id));
        localStorage.setItem(key, JSON.stringify(seeds));
        return normalizeBookingStatuses(seeds);
      }

      // Fresh new user gets 0 bookings initially
      return [];
    } catch (e) {
      console.error('Error loading user bookings:', e);
      return [];
    }
  }, []);

  const [bookings, setBookings] = useState(() => {
    return loadUserBookings(storageKey, user);
  });

  // Re-synchronize when authenticated user changes
  useEffect(() => {
    setBookings(loadUserBookings(storageKey, user));
  }, [userEmail, loadUserBookings]);

  // Listen for storage events so cross-tab changes stay synchronized
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === storageKey && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setBookings(normalizeBookingStatuses(parsed));
          }
        } catch (err) {
          console.error('Error syncing bookings from storage event:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [storageKey]);

  const persistBookings = useCallback((newList) => {
    const normalized = normalizeBookingStatuses(newList);
    setBookings(normalized);
    try {
      localStorage.setItem(storageKey, JSON.stringify(normalized));
    } catch (err) {
      console.error('Error writing bookings to localStorage:', err);
    }
    return normalized;
  }, [storageKey]);

  const addBooking = useCallback((newBooking) => {
    let resultBooking = null;
    setBookings(prev => {
      const updated = [newBooking, ...prev.filter(b => b.id !== newBooking.id)];
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving new booking:', err);
      }
      resultBooking = newBooking;
      return normalizeBookingStatuses(updated);
    });
    return resultBooking;
  }, [storageKey]);

  const cancelBooking = useCallback((bookingId) => {
    let cancelledSuccess = false;
    setBookings(prev => {
      const cleanId = String(bookingId).replace(/^#/, '').trim();
      const target = prev.find(b => b.id === cleanId || b.id === bookingId || b.bookingId === cleanId);
      if (!target) {
        return prev;
      }
      if (target.status === 'Completed' || target.bookingStatus === 'Completed') {
        console.warn('Completed bookings cannot be cancelled.');
        return prev;
      }
      cancelledSuccess = true;
      const updated = prev.map(b => {
        if (b.id === cleanId || b.id === bookingId || b.bookingId === cleanId) {
          return {
            ...b,
            status: 'Cancelled',
            bookingStatus: 'Cancelled',
            paymentStatus: 'CANCELLED',
            cancelledAt: new Date().toISOString(),
            userModified: true
          };
        }
        return b;
      });
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (err) {
        console.error('Error updating cancelled booking:', err);
      }
      return updated;
    });
    return cancelledSuccess;
  }, [storageKey]);

  const deleteBooking = useCallback((bookingId) => {
    let deletedSuccess = false;
    const cleanId = String(bookingId).replace(/^#/, '').trim();

    try {
      const deletedIds = getDeletedBookingIds();
      if (!deletedIds.includes(cleanId)) {
        deletedIds.push(cleanId);
        localStorage.setItem(DELETED_BOOKINGS_STORAGE_KEY, JSON.stringify(deletedIds));
      }
    } catch (e) {
      console.error('Error persisting deleted booking ID:', e);
    }

    setBookings(prev => {
      const target = prev.find(b => b.id === cleanId || b.id === bookingId || b.bookingId === cleanId);
      if (!target) return prev;
      deletedSuccess = true;
      const updated = prev.filter(b => b.id !== cleanId && b.id !== bookingId && b.bookingId !== cleanId);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (err) {
        console.error('Error deleting booking:', err);
      }
      return normalizeBookingStatuses(updated);
    });
    return deletedSuccess;
  }, [storageKey]);

  const updateBooking = useCallback((bookingId, updatedFields) => {
    let updatedBooking = null;
    setBookings(prev => {
      const cleanId = String(bookingId).replace(/^#/, '').trim();
      const updated = prev.map(b => {
        if (b.id === cleanId || b.id === bookingId || b.bookingId === cleanId) {
          updatedBooking = {
            ...b,
            ...updatedFields,
            userModified: true
          };
          return updatedBooking;
        }
        return b;
      });
      const normalized = normalizeBookingStatuses(updated);
      try {
        localStorage.setItem(storageKey, JSON.stringify(normalized));
      } catch (err) {
        console.error('Error updating booking:', err);
      }
      return normalized;
    });
    return updatedBooking;
  }, [storageKey]);

  const extendBooking = useCallback((bookingId, extraDays = 1) => {
    let result = null;
    setBookings(prev => {
      const cleanId = String(bookingId).replace(/^#/, '').trim();
      const target = prev.find(b => b.id === cleanId || b.id === bookingId || b.bookingId === cleanId);
      if (!target) return prev;
      
      const currentEndDate = target.endDate || target.returnDate;
      let newEndDate = currentEndDate;
      if (currentEndDate && currentEndDate.includes('-')) {
        const parts = currentEndDate.split('-');
        if (parts.length === 3) {
          const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          d.setDate(d.getDate() + Number(extraDays));
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          newEndDate = `${y}-${m}-${day}`;
        }
      }
      const newDuration = (Number(target.duration) || 1) + Number(extraDays);
      const rate = Number(target.dailyRate || target.pricePerDay || 1499);
      const newTotal = (Number(target.total || target.totalAmount || 0)) + rate * Number(extraDays);

      const updated = prev.map(b => {
        if (b.id === cleanId || b.id === bookingId || b.bookingId === cleanId) {
          result = {
            ...b,
            endDate: newEndDate,
            returnDate: newEndDate,
            duration: newDuration,
            total: newTotal,
            totalAmount: newTotal,
            userModified: true
          };
          return result;
        }
        return b;
      });
      const normalized = normalizeBookingStatuses(updated);
      try {
        localStorage.setItem(storageKey, JSON.stringify(normalized));
      } catch (err) {
        console.error('Error extending booking:', err);
      }
      return normalized;
    });
    return result;
  }, [storageKey]);

  const getBooking = useCallback((bookingId) => {
    if (!bookingId) return null;
    const cleanId = String(bookingId).replace(/^#/, '').trim();
    return bookings.find(b => b.id === cleanId || b.id === bookingId || b.bookingId === cleanId) || null;
  }, [bookings]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = bookings.length;
    const active = bookings.filter(b => b.status === 'Active').length;
    const upcoming = bookings.filter(b => b.status === 'Upcoming').length;
    const completed = bookings.filter(b => b.status === 'Completed').length;
    const cancelled = bookings.filter(b => b.status === 'Cancelled').length;

    const distance = bookings
      .filter(b => b.status !== 'Cancelled')
      .reduce((sum, b) => sum + (Number(b.duration) || 1) * 260, 0);

    return {
      total,
      active,
      upcoming,
      completed,
      cancelled,
      distance
    };
  }, [bookings]);

  const value = useMemo(() => ({
    bookings,
    stats,
    addBooking,
    cancelBooking,
    deleteBooking,
    updateBooking,
    extendBooking,
    getBooking,
    reloadBookings: () => {
      setBookings(loadUserBookings(storageKey, user));
    }
  }), [bookings, stats, addBooking, cancelBooking, deleteBooking, updateBooking, extendBooking, getBooking, loadUserBookings, storageKey, user]);

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingProvider');
  }
  return context;
}
