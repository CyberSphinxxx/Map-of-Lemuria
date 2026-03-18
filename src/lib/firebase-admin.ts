import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

const getServiceAccount = () => {
  const projectId = process.env.FIREBASE_PROJECT_ID || (import.meta as any).env?.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || (import.meta as any).env?.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY || (import.meta as any).env?.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.error('[Firebase Admin] Missing Environment Variables:', {
      projectId: !!projectId,
      clientEmail: !!clientEmail,
      privateKey: !!privateKey,
      processEnv: Object.keys(process.env).filter(k => k.includes('FIREBASE')),
    });
    return null;
  }

  // Robust cleaning for Vercel environment variables
  const cleanedKey = privateKey
    .replace(/^["']|["']$/g, '') // Remove accidental wrapping quotes
    .replace(/\\n/g, '\n');     // Correct literal \n characters

  return {
    projectId,
    clientEmail,
    privateKey: cleanedKey,
  };
};

const getSafeApp = () => {
  const existingApps = getApps();
  if (existingApps.length > 0) return existingApps[0];

  const serviceAccount = getServiceAccount();
  if (!serviceAccount) return null;

  try {
    return initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (e) {
    console.error('[Firebase Admin] App initialization failed:', e);
    return null;
  }
};

/**
 * Resilient Firestore Instance.
 * Uses a Proxy to prevent boot-time crashes on Vercel if credentials 
 * are missing or incorrectly formatted.
 */
export const db: Firestore = new Proxy({} as Firestore, {
  get(target, prop) {
    const app = getSafeApp();
    if (!app) {
      throw new Error('[Firebase Admin] FIREBASE_PRIVATE_KEY or other variables are missing/invalid. Please check your Vercel Environment Variables.');
    }
    const firestore = getFirestore(app);
    const value = (firestore as any)[prop];
    return typeof value === 'function' ? value.bind(firestore) : value;
  }
});

/**
 * Resilient Auth Instance.
 */
export const auth: Auth = new Proxy({} as Auth, {
  get(target, prop) {
    const app = getSafeApp();
    if (!app) {
      throw new Error('[Firebase Admin] Firebase Auth not available. Missing environment variables.');
    }
    const authInstance = getAuth(app);
    const value = (authInstance as any)[prop];
    return typeof value === 'function' ? value.bind(authInstance) : value;
  }
});
