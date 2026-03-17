import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const getServiceAccount = () => {
  console.log('[Firebase Admin v3] Attempting to load credentials...');
  
  // Use indirect access to bypass Vite's static replacement/crash
  const env = import.meta.env || {};
  const proc = process.env || {};

  const projectId = env['FIREBASE_PROJECT_ID'] || proc['FIREBASE_PROJECT_ID'];
  const clientEmail = env['FIREBASE_CLIENT_EMAIL'] || proc['FIREBASE_CLIENT_EMAIL'];
  const privateKey = env['FIREBASE_PRIVATE_KEY'] || proc['FIREBASE_PRIVATE_KEY'];

  if (!projectId || !clientEmail || !privateKey) {
    console.error('[Firebase Admin v3] Missing variables:', { 
      projectId: !!projectId, 
      clientEmail: !!clientEmail, 
      privateKey: !!privateKey 
    });
    throw new Error('Firebase Admin environment variables are missing.');
  }

  console.log('[Firebase Admin v3] Credentials found. Initializing...');

  return {
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, '\n'),
  };
};

if (getApps().length === 0) {
  const serviceAccount = getServiceAccount();
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export const db = getFirestore();
export const auth = getAuth();
