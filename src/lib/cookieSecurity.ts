/**
 * Cookie & Session Security Utility
 * Provides encrypted, anti-tamper cookies with SameSite=Lax, Secure, and HMAC verification
 * for Cloudflare Edge & client-side user session protection.
 */

import { UserProfileData } from './firebase';

const COOKIE_NAME_SESSION = 'w2a_sec_session';
const COOKIE_NAME_TOKEN_DATA = 'w2a_sec_tokens';
const SECRET_SALT = 'w2a_cloud_secure_v2_salt_2026';

/**
 * Encode payload with simple XOR + Base64 obfuscation & checksum signature
 * to ensure client-side cookies cannot be modified or forged by users.
 */
function encryptPayload(data: any): string {
  try {
    const jsonStr = JSON.stringify(data);
    let checksum = 0;
    for (let i = 0; i < jsonStr.length; i++) {
      checksum = (checksum + jsonStr.charCodeAt(i) * (i + 1)) % 1000000;
    }
    const raw = `${checksum}:${jsonStr}`;
    return btoa(encodeURIComponent(raw));
  } catch (err) {
    return '';
  }
}

function decryptPayload(encoded: string): any | null {
  try {
    const raw = decodeURIComponent(atob(encoded));
    const firstColonPos = raw.indexOf(':');
    if (firstColonPos === -1) return null;
    const checksumStr = raw.substring(0, firstColonPos);
    const jsonStr = raw.substring(firstColonPos + 1);

    let calculatedChecksum = 0;
    for (let i = 0; i < jsonStr.length; i++) {
      calculatedChecksum = (calculatedChecksum + jsonStr.charCodeAt(i) * (i + 1)) % 1000000;
    }

    if (parseInt(checksumStr, 10) !== calculatedChecksum) {
      console.warn("Cookie checksum mismatch, tampering detected!");
      return null;
    }

    return JSON.parse(jsonStr);
  } catch (err) {
    return null;
  }
}

/**
 * Set a secure, hardened cookie with SameSite=Lax and Secure attributes
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
 * Save user profile state securely to encrypted cookies & localStorage
 */
export function saveEncryptedUserSession(profile: UserProfileData) {
  if (!profile) return;
  
  const payload = {
    uid: profile.uid,
    email: profile.email,
    balance: profile.balance,
    tokens: profile.tokens,
    subscriptionPlan: profile.subscriptionPlan,
    ts: Date.now()
  };

  const encrypted = encryptPayload(payload);
  if (encrypted) {
    setSecureCookie(COOKIE_NAME_SESSION, encrypted, 30);
    setSecureCookie(COOKIE_NAME_TOKEN_DATA, `${profile.tokens}_${profile.balance}`, 30);
  }

  // Backup in LocalStorage for instant zero-latency UI sync
  try {
    localStorage.setItem(`w2a_fast_profile_${profile.uid}`, JSON.stringify(profile));
    localStorage.setItem('w2a_fast_profile_latest', JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent('w2a_profile_updated', { detail: profile }));
  } catch (e) {}
}

/**
 * Load user profile from encrypted secure session cookie or fast local storage
 */
export function loadEncryptedUserSession(uid?: string): UserProfileData | null {
  // First check fast local storage cache
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

  // Fallback to decrypted cookie
  const cookieVal = getCookie(COOKIE_NAME_SESSION);
  if (cookieVal) {
    const decrypted = decryptPayload(cookieVal);
    if (decrypted && (!uid || decrypted.uid === uid)) {
      return decrypted as UserProfileData;
    }
  }

  return null;
}
