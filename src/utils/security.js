/**
 * Client-side security utilities for offline / local-fallback authentication
 */

export async function hashPassword(password, salt = 'ryvon_salt_2026') {
  if (!password) return '';
  try {
    const enc = new TextEncoder();
    const data = enc.encode(String(password) + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    // Basic fallback for non-crypto environments
    let hash = 0;
    const str = String(password) + salt;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(16);
  }
}
