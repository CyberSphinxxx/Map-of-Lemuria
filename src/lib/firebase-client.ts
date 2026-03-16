import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID as string,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);
