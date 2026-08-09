import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection, 
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfigData.firestoreDatabaseId || undefined);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export interface UserProfileData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  providerId: string;
  balance: number; // Saldo dalam IDR
  tokens: number; // Token Convert
  subscriptionPlan: 'Free' | 'Starter' | 'Pro' | 'Enterprise';
  subscriptionExpiry: string | null; // ISO timestamp
  lastLogin: string;
  createdAt: string;
  isAdmin?: boolean;
}

export function isAdminUser(email?: string | null): boolean {
  if (!email) return false;
  const e = email.toLowerCase().trim();
  return e === 'johnisdimz@gmail.com' || e.includes('admin') || e.includes('developer') || e.includes('joo.exe');
}

export interface UserTransaction {
  id?: string;
  userId: string;
  type: 'topup' | 'token_purchase' | 'subscription' | 'token_use';
  amount: number; // IDR or negative for spent
  tokensDelta?: number;
  description: string;
  timestamp: string;
}

export const DEMO_USER_PROFILE: UserProfileData = {
  uid: 'demo-user-jooexe',
  email: 'jooexe.demo@gmail.com',
  displayName: 'Joo.exe (Demo Account)',
  photoURL: null,
  providerId: 'demo',
  balance: 50000,
  tokens: 25,
  subscriptionPlan: 'Pro',
  subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  lastLogin: new Date().toISOString(),
  createdAt: new Date().toISOString(),
};

/**
 * Sign in with Google Auth Provider
 */
export async function signInWithGoogle(): Promise<{ user: User; isNewUser: boolean }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Save or update profile in Firestore (only user login data)
    const profile = await saveUserProfile(user);
    const isNewUser = (profile as any).isNewUser ?? false;
    return { user, isNewUser };
  } catch (error: any) {
    console.error("Google Sign-In Error:", error);
    if (error.code === 'auth/api-key-not-valid' || error.message?.includes('api-key-not-valid') || error.message?.includes('API key') || error.code === 'auth/operation-not-allowed') {
      throw new Error("Google Login memerlukan pengaktifan Google Sign-In Provider di Firebase Console project baru Anda. Silakan daftar/masuk dengan Email & Kata Sandi di atas.");
    }
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error("Popup Google Login ditutup oleh pengguna sebelum proses selesai. Silakan coba lagi atau gunakan Email & Kata Sandi di atas.");
    }
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
      throw new Error("Popup Google Login ditutup/terblokir oleh browser. Silakan izinkan popup atau gunakan Email & Kata Sandi di atas.");
    }
    if (error.code === 'auth/unauthorized-domain') {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
      throw new Error(`Domain "${currentHost}" belum ditambahkan di Authorized Domains Firebase Console. Silakan tambahkan domain ini di Firebase Console -> Authentication -> Settings -> Authorized Domains, atau masuk menggunakan Email & Kata Sandi.`);
    }
    throw new Error("Google Login belum dapat digunakan pada project Firebase ini. Silakan masuk menggunakan Email & Kata Sandi di atas.");
  }
}

/**
 * Save / Init User Profile Data in Firestore
 * Database specifically used for storing user login data, balance, tokens & subscription status
 */
export async function saveUserProfile(user: User): Promise<UserProfileData & { isNewUser?: boolean }> {
  if (!user) throw new Error("User required");
  
  const isDevAdmin = isAdminUser(user.email);
  const defaultAdminProfile: UserProfileData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || 'Developer VIP Admin',
    photoURL: user.photoURL || null,
    providerId: user.providerData[0]?.providerId || 'password',
    balance: 999999999,
    tokens: 999999,
    subscriptionPlan: 'Enterprise',
    subscriptionExpiry: '2099-12-31T23:59:59.000Z',
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isAdmin: true
  };

  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const existing = snap.data() as UserProfileData;
      const updatedData: Partial<UserProfileData> = {
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || (isDevAdmin ? 'Developer VIP Admin' : 'User'),
        photoURL: user.photoURL || existing.photoURL,
        lastLogin: new Date().toISOString()
      };

      if (isDevAdmin) {
        updatedData.subscriptionPlan = 'Enterprise';
        updatedData.subscriptionExpiry = '2099-12-31T23:59:59.000Z'; // Lifetime / Anti-Kadaluwarsa
        updatedData.isAdmin = true;
        updatedData.balance = 999999999;
        updatedData.tokens = 999999;
      } else {
        if (existing.tokens === undefined || existing.tokens === null || typeof existing.tokens !== 'number') {
          updatedData.tokens = 0;
        }
        if (existing.balance === undefined || existing.balance === null || typeof existing.balance !== 'number') {
          updatedData.balance = 0;
        }
        if (!existing.subscriptionPlan) {
          updatedData.subscriptionPlan = 'Free';
        }
      }

      await setDoc(userRef, updatedData, { merge: true });
      return {
        ...existing,
        ...updatedData,
        tokens: updatedData.tokens ?? existing.tokens ?? 0,
        balance: updatedData.balance ?? existing.balance ?? 0,
        subscriptionPlan: updatedData.subscriptionPlan ?? existing.subscriptionPlan ?? 'Free',
        isNewUser: false
      };
    } else {
      // New User Profile
      const newProfile: UserProfileData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || (isDevAdmin ? 'Developer VIP Admin' : 'User'),
        photoURL: user.photoURL || null,
        providerId: user.providerData[0]?.providerId || 'password',
        balance: isDevAdmin ? 999999999 : 0,
        tokens: isDevAdmin ? 999999 : 10,
        subscriptionPlan: isDevAdmin ? 'Enterprise' : 'Free',
        subscriptionExpiry: isDevAdmin ? '2099-12-31T23:59:59.000Z' : null,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isAdmin: isDevAdmin
      };
      await setDoc(userRef, newProfile);

      // Record Welcome Transaction
      await recordTransaction(user.uid, {
        userId: user.uid,
        type: 'topup',
        amount: isDevAdmin ? 999999999 : 0,
        tokensDelta: isDevAdmin ? 999999 : 10,
        description: isDevAdmin ? 'Aktivasi Akun Developer VIP Anti-Kadaluwarsa' : 'Bonus 10 Token Gratis Pendaftaran Baru',
        timestamp: new Date().toISOString()
      });

      return { ...newProfile, isNewUser: true };
    }
  } catch (err) {
    console.warn("Firestore offline / read profile warning:", err);
    if (isDevAdmin) {
      return defaultAdminProfile;
    }
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      photoURL: user.photoURL || null,
      providerId: user.providerData[0]?.providerId || 'password',
      balance: 0,
      tokens: 0,
      subscriptionPlan: 'Free',
      subscriptionExpiry: null,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isAdmin: false
    };
  }
}

/**
 * Subscribe to User Profile Firestore Document realtime updates
 */
export function subscribeUserProfile(uid: string, callback: (profile: UserProfileData | null) => void) {
  const sendFallback = () => {
    if (auth.currentUser) {
      // Check cached profile first to guarantee balance/tokens persistence
      try {
        const cached = localStorage.getItem(`web2app_user_profile_${uid}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed.balance === 'number') {
            callback(parsed);
            return;
          }
        }
      } catch (e) {
        // Ignore JSON error
      }

      const email = auth.currentUser.email;
      const admin = isAdminUser(email);
      callback({
        uid: auth.currentUser.uid,
        email: email,
        displayName: auth.currentUser.displayName || (admin ? 'Developer VIP Admin' : 'User'),
        photoURL: auth.currentUser.photoURL || null,
        providerId: 'password',
        balance: admin ? 999999999 : 0,
        tokens: admin ? 999999 : 0,
        subscriptionPlan: admin ? 'Enterprise' : 'Free',
        subscriptionExpiry: admin ? '2099-12-31T23:59:59.000Z' : null,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isAdmin: admin
      });
    } else {
      callback(null);
    }
  };

  const userRef = doc(db, 'users', uid);
  return onSnapshot(userRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data() as UserProfileData;
      if (isAdminUser(data.email) || isAdminUser(auth.currentUser?.email)) {
        data.isAdmin = true;
        data.subscriptionPlan = 'Enterprise';
        data.subscriptionExpiry = '2099-12-31T23:59:59.000Z';
        data.balance = Math.max(data.balance || 0, 999999999);
        data.tokens = Math.max(data.tokens || 0, 999999);
      } else {
        if (data.tokens === undefined || data.tokens === null || typeof data.tokens !== 'number') {
          data.tokens = 0;
        }
        if (data.balance === undefined || data.balance === null || typeof data.balance !== 'number') {
          data.balance = 0;
        }
        if (!data.subscriptionPlan) {
          data.subscriptionPlan = 'Free';
        }
      }

      // Persist to local storage to protect against offline loss
      try {
        localStorage.setItem(`web2app_user_profile_${uid}`, JSON.stringify(data));
      } catch (e) {
        // Storage full or unavailable
      }

      callback(data);
    } else {
      sendFallback();
    }
  }, (err) => {
    console.warn("User profile snapshot warning (offline mode fallback):", err);
    sendFallback();
  });
}

/**
 * Helper to safely get user profile or construct fallback if offline
 */
async function getUserProfileSafe(uid: string): Promise<UserProfileData> {
  const userRef = doc(db, 'users', uid);
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data() as UserProfileData;
      try {
        localStorage.setItem(`web2app_user_profile_${uid}`, JSON.stringify(data));
      } catch (e) {}
      return data;
    }
  } catch (err) {
    console.warn("Firestore getDoc warning (falling back to cached profile):", err);
  }

  // Try local storage cache before default fallback
  try {
    const cached = localStorage.getItem(`web2app_user_profile_${uid}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed.balance === 'number') {
        return parsed;
      }
    }
  } catch (e) {}

  // Fallback profile if offline or doc doesn't exist yet
  const currentUser = auth.currentUser;
  const isDevAdmin = isAdminUser(currentUser?.email);
  return {
    uid: uid,
    email: currentUser?.email || 'user@example.com',
    displayName: currentUser?.displayName || (isDevAdmin ? 'Developer VIP Admin' : 'User'),
    photoURL: currentUser?.photoURL || null,
    providerId: 'password',
    balance: isDevAdmin ? 999999999 : 0,
    tokens: isDevAdmin ? 999999 : 0,
    subscriptionPlan: isDevAdmin ? 'Enterprise' : 'Free',
    subscriptionExpiry: isDevAdmin ? '2099-12-31T23:59:59.000Z' : null,
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isAdmin: isDevAdmin
  };
}

/**
 * Top Up / Deposit User Balance (Instant Real-time Payment)
 */
export async function topUpBalance(uid: string, amount: number, paymentMethod: string): Promise<number> {
  const userRef = doc(db, 'users', uid);
  const current = await getUserProfileSafe(uid);
  const newBalance = (current.balance || 0) + amount;

  const updatedProfile: UserProfileData = {
    ...current,
    balance: newBalance,
    lastLogin: new Date().toISOString()
  };

  // Cache immediately locally
  try {
    localStorage.setItem(`web2app_user_profile_${uid}`, JSON.stringify(updatedProfile));
  } catch (e) {}

  try {
    await setDoc(userRef, {
      balance: newBalance,
      lastLogin: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn("Firestore update balance offline warning:", err);
  }

  try {
    await recordTransaction(uid, {
      userId: uid,
      type: 'topup',
      amount: amount,
      description: `Deposit Saldo via ${paymentMethod} (+Rp ${amount.toLocaleString('id-ID')})`,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.warn("Record transaction offline warning:", err);
  }

  return newBalance;
}

/**
 * Buy Token Package with Balance
 */
export async function buyTokenPackage(uid: string, tokenCount: number, priceIdr: number): Promise<{ newBalance: number; newTokens: number }> {
  const userRef = doc(db, 'users', uid);
  const current = await getUserProfileSafe(uid);

  if ((current.balance || 0) < priceIdr) {
    throw new Error(`Saldo tidak mencukupi (Saldo: Rp ${(current.balance || 0).toLocaleString('id-ID')}, Dibutuhkan: Rp ${priceIdr.toLocaleString('id-ID')}). Silakan Deposit Saldo lebih dulu.`);
  }

  const newBalance = (current.balance || 0) - priceIdr;
  const newTokens = (current.tokens || 0) + tokenCount;

  try {
    await setDoc(userRef, {
      balance: newBalance,
      tokens: newTokens
    }, { merge: true });
  } catch (err) {
    console.warn("Firestore update tokens offline warning:", err);
  }

  try {
    await recordTransaction(uid, {
      userId: uid,
      type: 'token_purchase',
      amount: -priceIdr,
      tokensDelta: tokenCount,
      description: `Pembelian ${tokenCount} Token (+${tokenCount} Token)`,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.warn("Record transaction offline warning:", err);
  }

  return { newBalance, newTokens };
}

/**
 * Subscribe to Monthly Subscription Plan
 */
export async function buyMonthlySubscription(
  uid: string, 
  planName: 'Starter' | 'Pro' | 'Enterprise', 
  priceIdr: number, 
  monthlyBonusTokens: number
): Promise<{ newBalance: number; newTokens: number; expiry: string }> {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);
  const expiryIso = expiryDate.toISOString();

  const userRef = doc(db, 'users', uid);
  const current = await getUserProfileSafe(uid);

  if ((current.balance || 0) < priceIdr) {
    throw new Error(`Saldo tidak cukup (Saldo: Rp ${(current.balance || 0).toLocaleString('id-ID')}, Harga Langganan: Rp ${priceIdr.toLocaleString('id-ID')}). Silakan Deposit Saldo.`);
  }

  const newBalance = (current.balance || 0) - priceIdr;
  const newTokens = (current.tokens || 0) + monthlyBonusTokens;

  try {
    await setDoc(userRef, {
      balance: newBalance,
      tokens: newTokens,
      subscriptionPlan: planName,
      subscriptionExpiry: expiryIso
    }, { merge: true });
  } catch (err) {
    console.warn("Firestore update subscription offline warning:", err);
  }

  try {
    await recordTransaction(uid, {
      userId: uid,
      type: 'subscription',
      amount: -priceIdr,
      tokensDelta: monthlyBonusTokens,
      description: `Langganan Bulanan Paket ${planName} (30 Hari) (+${monthlyBonusTokens} Bonus Token)`,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.warn("Record transaction offline warning:", err);
  }

  return { newBalance, newTokens, expiry: expiryIso };
}

/**
 * Deduct token when creating/converting app
 */
export async function deductToken(uid: string, costTokens = 1): Promise<number> {
  const userRef = doc(db, 'users', uid);
  const current = await getUserProfileSafe(uid);

  // Developer VIP Admin / Enterprise has unlimited tokens
  if (current.isAdmin || current.subscriptionPlan === 'Enterprise' || isAdminUser(current.email)) {
    return current.tokens || 999999;
  }

  if ((current.tokens || 0) < costTokens) {
    throw new Error("Token Build Anda tidak mencukupi (0 Token). Silakan Beli Token atau Berlangganan.");
  }

  const newTokens = Math.max(0, (current.tokens || 0) - costTokens);

  try {
    await setDoc(userRef, { tokens: newTokens }, { merge: true });
  } catch (err) {
    console.warn("Firestore update tokens offline warning:", err);
  }

  try {
    await recordTransaction(uid, {
      userId: uid,
      type: 'token_use',
      amount: 0,
      tokensDelta: -costTokens,
      description: `Unduh Proyek ZIP / Kompilasi APK (-${costTokens} Token)`,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.warn("Record transaction offline warning:", err);
  }

  return newTokens;
}

/**
 * Record Transaction in Firestore
 */
async function recordTransaction(uid: string, tx: UserTransaction) {
  try {
    const txRef = collection(db, 'users', uid, 'transactions');
    await addDoc(txRef, tx);
  } catch (err) {
    console.error("Gagal mencatat transaksi:", err);
  }
}

/**
 * Get User Transaction History
 */
export async function getUserTransactions(uid: string): Promise<UserTransaction[]> {
  try {
    const txRef = collection(db, 'users', uid, 'transactions');
    const q = query(txRef, orderBy('timestamp', 'desc'), limit(20));
    const querySnap = await getDocs(q);
    
    return querySnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as UserTransaction));
  } catch (err) {
    console.error("Gagal mengambil riwayat transaksi:", err);
    return [];
  }
}

/**
 * Sign out from Firebase
 */
export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Subscribe to Auth State Changes
 */
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
