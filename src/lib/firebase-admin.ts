import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const getServiceAccount = () => {
  // Use process.env for reliable runtime access on Vercel
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.error('[Firebase Admin] Environment variables missing on Vercel runtime.');
    return null;
  }

  // Handle various private key escaping formats
  const formattedKey = privateKey.replace(/\\n/g, '\n');

  return {
    projectId,
    clientEmail,
    privateKey: formattedKey,
  };
};

let _db: any = null;
let _auth: any = null;

if (getApps().length === 0) {
  const serviceAccount = getServiceAccount();
  if (serviceAccount) {
    const app = initializeApp({
      credential: cert(serviceAccount),
    });
    _db = getFirestore(app);
    _auth = getAuth(app);
  } else {
    console.warn('[Firebase Admin] Initialization skipped due to missing credentials.');
  }
} else {
  _db = getFirestore();
  _auth = getAuth();
}

export const db = _db;
export const auth = _auth;
