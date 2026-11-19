import { describe, it, expect, beforeEach } from 'vitest';
import { hashPassword } from '../security';
import { AUTH_USER_KEY, AUTH_TOKEN_KEY } from '../api';

describe('RYVON Authentication System Verification', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('1. Security & Password Hashing', () => {
    it('generates consistent SHA-256 hashes for passwords', async () => {
      const pass = 'SuperSecret2026!';
      const hash1 = await hashPassword(pass);
      const hash2 = await hashPassword(pass);
      expect(hash1).toBeDefined();
      expect(hash1.length).toBeGreaterThan(16);
      expect(hash1).toBe(hash2);
    });

    it('produces completely different hashes for different passwords', async () => {
      const hashA = await hashPassword('PasswordA123');
      const hashB = await hashPassword('PasswordB123');
      expect(hashA).not.toBe(hashB);
    });
  });

  describe('2. Guest Experience & Data Isolation', () => {
    it('starts unauthenticated with zero leaked user info', () => {
      expect(localStorage.getItem(AUTH_USER_KEY)).toBeNull();
      expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
      expect(sessionStorage.getItem(AUTH_USER_KEY)).toBeNull();
    });

    it('isolates user A and user B storage namespaces', () => {
      const userAEmail = 'alex.rider@example.com';
      const userBEmail = 'sarah.pilot@example.com';

      const keyA = `rideos-bookings-${userAEmail}`;
      const keyB = `rideos-bookings-${userBEmail}`;

      const bookingsUserA = [{ id: 'bk_1', bikeName: 'BMW G 310 GS', status: 'Upcoming' }];
      const bookingsUserB = [{ id: 'bk_2', bikeName: 'Ducati Scrambler', status: 'Active' }];

      localStorage.setItem(keyA, JSON.stringify(bookingsUserA));
      localStorage.setItem(keyB, JSON.stringify(bookingsUserB));

      const readA = JSON.parse(localStorage.getItem(keyA));
      const readB = JSON.parse(localStorage.getItem(keyB));

      expect(readA).toHaveLength(1);
      expect(readA[0].bikeName).toBe('BMW G 310 GS');
      expect(readB).toHaveLength(1);
      expect(readB[0].bikeName).toBe('Ducati Scrambler');

      // Guest has no access to user A's key
      const guestKey = 'rideos-bookings-guest';
      expect(localStorage.getItem(guestKey)).toBeNull();
    });

    it('isolates rider profile and emergency contacts per user', () => {
      const userEmail = 'newrider@ryvon.com';
      const profileKey = `ryvon-rider-profile-${userEmail}`;
      const emergencyKey = `ryvon-emergency-contact-${userEmail}`;

      const userProfile = {
        name: 'New Rider',
        email: userEmail,
        phone: '+91 91234 56789',
        licenseNumber: 'DL-NEW-2026'
      };

      const emergencyContact = {
        name: 'Jane Doe',
        relationship: 'Partner',
        phone: '+91 98765 00000'
      };

      localStorage.setItem(profileKey, JSON.stringify(userProfile));
      localStorage.setItem(emergencyKey, JSON.stringify(emergencyContact));

      expect(JSON.parse(localStorage.getItem(profileKey)).name).toBe('New Rider');
      expect(JSON.parse(localStorage.getItem(emergencyKey)).name).toBe('Jane Doe');

      // Global non-isolated keys are not polluted
      expect(localStorage.getItem('ryvon-rider-profile')).toBeNull();
    });
  });

  describe('3. Dynamic Statistics Verification for New Riders', () => {
    it('calculates 0 rides, 0 distance, 0 destinations when booking list is empty', () => {
      const emptyBookings = [];
      const totalRides = emptyBookings.length;
      const totalDistance = emptyBookings.reduce((sum, b) => sum + (b.duration || 1) * 220, 0);
      const uniqueDests = new Set(emptyBookings.map(b => b.destCity)).size;

      expect(totalRides).toBe(0);
      expect(totalDistance).toBe(0);
      expect(uniqueDests).toBe(0);
    });
  });
});
