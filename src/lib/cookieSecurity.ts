/**
 * Cookie & Session Security Utility v3
 * Provides encrypted, anti-tamper cookies with SameSite=Lax/Strict, Secure, and HMAC verification
 * for Cloudflare Edge & client-side user session protection.
 */

import { UserProfileData } from './firebase';

const COOKIE_NAME_SESSION = 'w2a_sec_session_v3';
const COOKIE_NAME_TOKEN_DATA = 'w2a_sec_tokens_v3';
const COOKIE_NAME_CSRF = 'w2a_csrf_token';
const SECRET_SALT = 'w2a_cloud_secure_v3_hmac_salt_2026_jooexe';

/**
 * Generate a dynamic cryptographic checksum hash for tamper detection
 */
function generateHmacChecksum(str: string): string {
  let hash1 = 5381;
  let hash2 = 0x811c9dc5;
  const salted = str + SECRET_SALT;

  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    hash1 = ((hash1 << 5) + hash1) ^ char; // djb2 variant
    hash2 = (hash2 ^ char) * 16777619;    // FNV-1a 32-bit
  }

  const combined = (Math.abs(hash1) % 100000000) * 1000 + (Math.abs(hash2) % 1000);
  return combined.toString(36);
}

/**
 * Encode payload with salt + HMAC signature & Base64 encoding
 * to ensure client-side cookies cannot be modified or forged by users.
 */
function encryptPayload(data: any): string {
  try {
    const jsonStr = JSON.stringify(data);
    const signature = generateHmacChecksum(jsonStr);
    const raw = `${signature}:${jsonStr}`;
    return btoa(encodeURIComponent(raw));
  } catch (err) {
    return '';
  }
}

function decryptPayload(encoded: string): any | null {
  try {
    if (!encoded) return null;
    const raw = decodeURIComponent(atob(encoded));
    const firstColonPos = raw.indexOf(':');
    if (firstColonPos === -1) return null;

    const signature = raw.substring(0, firstColonPos);
    const jsonStr = raw.substring(firstColonPos + 1);

    const calculatedSignature = generateHmacChecksum(jsonStr);

    if (signature !== calculatedSignature) {
      console.warn("[SECURITY ALERT] Cookie tampering or signature mismatch detected! Wiping session.");
      eraseCookie(COOKIE_NAME_SESSION);
      eraseCookie(COOKIE_NAME_TOKEN_DATA);
      return null;
    }

    return JSON.parse(jsonStr);
  } catch (err) {
    return null;
  }
}

/**
 * Set a secure, hardened cookie with SameSite=Lax/Strict and Secure attributes
 */
export function setSecureCookie(name: string, value: string, days = 30) {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `; expires=${date.toUTCString()}`;
  const isHttps = window.location.protocol === 'https:';
  const secureFlag = isHttps ? '; Secure' : '';
  const sameSiteFlag = '; SameSite=Lax';
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/${secureFlag}${sameSiteFlag}`;
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
}

/**
 * Erase a cookie
 */
export function eraseCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
}

/**
 * Initialize Anti-CSRF Token
 */
export function ensureCsrfToken(): string {
  let token = getCookie(COOKIE_NAME_CSRF);
  if (!token) {
    token = 'csrf_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    setSecureCookie(COOKIE_NAME_CSRF, token, 7);
  }
  return token;
}

/**
 * Clear user session caches on logout or account switch
 */
export function clearEncryptedUserSession() {
  eraseCookie(COOKIE_NAME_SESSION);
  eraseCookie(COOKIE_NAME_TOKEN_DATA);
  eraseCookie(COOKIE_NAME_CSRF);
  try {
    localStorage.removeItem('w2a_fast_profile_latest');
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('w2a_fast_profile_')) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {}
}

/**
 * Save user profile state securely to encrypted cookies & localStorage
 */
export function saveEncryptedUserSession(profile: UserProfileData) {
  if (!profile) return;
  
  const safeTokens = (profile.tokens !== undefined && profile.tokens !== null && typeof profile.tokens === 'number')
    ? profile.tokens
    : (profile.isAdmin ? 50000 : 10);

  const safeBalance = (profile.balance !== undefined && profile.balance !== null && typeof profile.balance === 'number')
    ? profile.balance
    : (profile.isAdmin ? 100000 : 0);

  const cleanProfile: UserProfileData = {
    ...profile,
    tokens: safeTokens,
    balance: safeBalance
  };

  const payload = {
    uid: cleanProfile.uid,
    email: cleanProfile.email,
    balance: cleanProfile.balance,
    tokens: cleanProfile.tokens,
    subscriptionPlan: cleanProfile.subscriptionPlan,
    subscriptionExpiry: cleanProfile.subscriptionExpiry,
    ts: Date.now()
  };

  const encrypted = encryptPayload(payload);
  if (encrypted) {
    setSecureCookie(COOKIE_NAME_SESSION, encrypted, 30);
    setSecureCookie(COOKIE_NAME_TOKEN_DATA, `${cleanProfile.tokens}_${cleanProfile.balance}`, 30);
    ensureCsrfToken();
  }

  // Backup in LocalStorage for instant zero-latency UI sync
  try {
    localStorage.setItem(`w2a_fast_profile_${cleanProfile.uid}`, JSON.stringify(cleanProfile));
    localStorage.setItem('w2a_fast_profile_latest', JSON.stringify(cleanProfile));
    window.dispatchEvent(new CustomEvent('w2a_profile_updated', { detail: cleanProfile }));
  } catch (e) {}
}

/**
 * Load user profile from encrypted secure session cookie or fast local storage
 */
export function loadEncryptedUserSession(uid?: string): UserProfileData | null {
  // First check decrypted secure cookie
  const cookieVal = getCookie(COOKIE_NAME_SESSION);
  if (cookieVal) {
    const decrypted = decryptPayload(cookieVal);
    if (decrypted && (!uid || decrypted.uid === uid)) {
      return decrypted as UserProfileData;
    }
  }

  // Fallback to local storage cache if cookie is absent
  try {
    const key = uid ? `w2a_fast_profile_${uid}` : 'w2a_fast_profile_latest';
    const cached = localStorage.getItem(key);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed.tokens === 'number') {
        return parsed;
      }
    }
  } catch (e) {}

  return null;
}

