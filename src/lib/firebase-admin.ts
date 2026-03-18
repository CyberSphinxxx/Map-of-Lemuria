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

let _app: any = null;

if (getApps().length === 0) {
  const serviceAccount = getServiceAccount();
  if (serviceAccount) {
    _app = initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    console.warn('[Firebase Admin] Initialization skipped due to missing credentials.');
  }
} else {
  _app = getApps()[0];
}

// We export them directly; if they are used without an app, Firebase Admin usually throws a helpful error.
// To keep the rest of the code clean, we typeset these as the actual types.
export const db = getFirestore(_app || undefined);
export const auth = getAuth(_app || undefined);
