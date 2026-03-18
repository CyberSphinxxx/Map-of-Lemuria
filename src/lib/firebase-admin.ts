import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const getServiceAccount = () => {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) return null;

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

// Use Proxies to prevent module-level crashes during Vercel's early lifecycle
export const db: any = new Proxy({} as any, {
  get(target, prop) {
    const app = getSafeApp();
    if (!app) {
      throw new Error('[Firebase Admin] FIREBASE_PRIVATE_KEY or other variables are missing/invalid. Please check your Vercel Environment Variables.');
    }
    return (getFirestore(app) as any)[prop];
  }
});

export const auth: any = new Proxy({} as any, {
  get(target, prop) {
    const app = getSafeApp();
    if (!app) {
      throw new Error('[Firebase Admin] Firebase Auth not available. Missing environment variables.');
    }
    return (getAuth(app) as any)[prop];
  }
});
