import CryptoJS from 'crypto-js';

// Default system security salt & key seed
const DEFAULT_SYSTEM_SEED = 'Web2App-Military-Grade-AES256-PBKDF2-HMAC-Key-984712039128';

export interface EncryptedPayload {
  ciphertext: string;
  hmac: string;
  iv: string;
  algorithm: string;
  timestamp: string;
}

/**
 * Derives a strong 256-bit encryption key using PBKDF2 (10000 iterations)
 */
export function deriveKey(secret: string, salt: string): string {
  return CryptoJS.PBKDF2(secret, salt, {
    keySize: 256 / 32,
    iterations: 10000,
  }).toString();
}

/**
 * Encrypts data object with AES-256 and computes HMAC-SHA256 signature for anti-tamper protection
 */
export function encryptData(data: any, customPassphrase?: string): EncryptedPayload {
  const jsonString = JSON.stringify(data);
  const passphrase = customPassphrase || DEFAULT_SYSTEM_SEED;
  
  // Generate random salt and initialization vector (IV)
  const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
  const iv = CryptoJS.lib.WordArray.random(128 / 8).toString();
  
  const key = deriveKey(passphrase, salt);
  
  // AES-256 CBC Mode Encryption
  const encrypted = CryptoJS.AES.encrypt(jsonString, CryptoJS.enc.Hex.parse(key), {
    iv: CryptoJS.enc.Hex.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const ciphertext = salt + ':' + encrypted.toString();
  
  // HMAC-SHA256 anti-tamper digital signature
  const hmac = CryptoJS.HmacSHA256(ciphertext, key).toString();

  return {
    ciphertext,
    hmac,
    iv,
    algorithm: 'AES-256-CBC-PBKDF2-HMAC-SHA256',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validates HMAC signature and decrypts the AES-256 payload safely
 */
export function decryptData<T = any>(payload: EncryptedPayload, customPassphrase?: string): T | null {
  try {
    const passphrase = customPassphrase || DEFAULT_SYSTEM_SEED;
    const parts = payload.ciphertext.split(':');
    if (parts.length !== 2) throw new Error('Invalid ciphertext format');
    
    const [salt, rawCiphertext] = parts;
    const key = deriveKey(passphrase, salt);
    
    // Validate HMAC anti-tamper signature
    const computedHmac = CryptoJS.HmacSHA256(payload.ciphertext, key).toString();
    if (computedHmac !== payload.hmac) {
      throw new Error('SECURITY VIOLATION: HMAC signature mismatch! Data was tampered with.');
    }

    // Decrypt
    const bytes = CryptoJS.AES.decrypt(rawCiphertext, CryptoJS.enc.Hex.parse(key), {
      iv: CryptoJS.enc.Hex.parse(payload.iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedText) throw new Error('Decryption failed or invalid key');
    
    return JSON.parse(decryptedText) as T;
  } catch (err) {
    console.error('Crypto Decryption Security Alert:', err);
    return null;
  }
}

/**
 * Generates an anti-hijack session fingerprint token based on browser environment
 */
export function generateSessionFingerprint(): string {
  const nav = typeof window !== 'undefined' ? window.navigator : { userAgent: 'node', language: 'en' };
  const screenInfo = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '1920x1080';
  const rawFingerprint = `${nav.userAgent}-${nav.language}-${screenInfo}-${Date.now()}`;
  return CryptoJS.SHA256(rawFingerprint).toString().substring(0, 32);
}

/**
 * XSS & Script Injection Sanitizer
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '[REMOVED_SCRIPT]')
    .replace(/javascript:/gi, 'nojavascript:')
    .replace(/onerror=/gi, 'noerror=')
    .replace(/onload=/gi, 'noload=');
}
