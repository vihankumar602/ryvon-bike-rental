const test = require('node:test');
const assert = require('node:assert/strict');
const schemas = require('../src/schemas');

test('schemas: register requires name, valid email, and secure password', () => {
  const valid = {
    name: 'Inder Rider',
    email: 'inder@example.com',
    password: 'SecurePassword123!',
    phone: '+91 98765 43210',
    licenseNumber: 'DL-04-2026-0001',
  };
  assert.ok(schemas.register.safeParse(valid).success);

  // Rejects empty name or too short name
  assert.equal(schemas.register.safeParse({ ...valid, name: 'A' }).success, false);
  assert.equal(schemas.register.safeParse({ ...valid, name: '' }).success, false);

  // Rejects invalid email
  assert.equal(schemas.register.safeParse({ ...valid, email: 'notanemail' }).success, false);
  assert.equal(schemas.register.safeParse({ ...valid, email: '@domain.com' }).success, false);

  // Rejects short password (< 8 chars)
  assert.equal(schemas.register.safeParse({ ...valid, password: 'short' }).success, false);

  // Rejects password > 72 bytes (bcrypt limit)
  assert.equal(schemas.register.safeParse({ ...valid, password: 'A'.repeat(80) }).success, false);
});

test('schemas: login requires valid email and non-empty password', () => {
  assert.ok(schemas.login.safeParse({ email: 'user@example.com', password: 'password123' }).success);
  assert.equal(schemas.login.safeParse({ email: 'bad-email', password: 'password123' }).success, false);
  assert.equal(schemas.login.safeParse({ email: 'user@example.com', password: '' }).success, false);
  assert.equal(schemas.login.safeParse({}).success, false);
});

test('schemas: googleAuth has been completely removed', () => {
  assert.equal(schemas.googleAuth, undefined);
});
