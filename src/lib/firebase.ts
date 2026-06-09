// lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import type { FirebaseApp } from 'firebase/app';
import type { Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

interface FirebaseConfigType {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

// Guard: only initialize if all required config values are present and non-placeholder
const isFirebaseConfigValid = () => {
  const { apiKey, projectId, appId, messagingSenderId } = firebaseConfig;
  const placeholders = ['YOUR_REAL_KEY', 'YOUR_REAL_VAPID_KEY', '123456789', '1:123456789:web:abcdef'];
  if (!apiKey || !projectId || !appId || !messagingSenderId) return false;
  if (placeholders.some(p => [apiKey, appId, messagingSenderId].includes(p))) return false;
  return true;
};

let app: FirebaseApp | undefined;
let messaging: Messaging | undefined;

if (typeof window !== 'undefined') {
  if (isFirebaseConfigValid()) {
    app = getApps().length === 0
      ? initializeApp(firebaseConfig as FirebaseConfigType)
      : getApps()[0];
    try {
      messaging = getMessaging(app);
    } catch (e) {
      console.warn('⚠️ Firebase Messaging init failed:', e);
    }
  } else {
    console.warn('⚠️ Firebase config is missing or uses placeholder values. FCM features are disabled.');
  }
}

export const getFCMToken = async (): Promise<string | null> => {
  try {
    if (!messaging) return null;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

// 🆕 NEW: Handle foreground messages
export const onForegroundMessage = (callback: (payload: any) => void) => {
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log('📩 [FCM] Foreground message received:', payload);
    callback(payload);
  });
};
