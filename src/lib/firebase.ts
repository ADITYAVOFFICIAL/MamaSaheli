// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAjdxCVHgX_FmhLpB8nKfDMu3LMMDq2JkE",
  authDomain: "mamasaheli-b0d52.firebaseapp.com",
  projectId: "mamasaheli-b0d52",
  storageBucket: "mamasaheli-b0d52.firebasestorage.app",
  messagingSenderId: "483594741503",
  appId: "1:483594741503:web:8e6becd2ad64417205ceca",
  measurementId: "G-GKKMCC3H95"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestFirebaseNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    console.log('[FCM] Notification permission:', permission);
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'BOlJIRBbSyAcQimWHzZcywOGOYixk4VTC1cFSJIg7wvEk5IE81u3DFmvD3a4yQKtK4JHOYm7s_iH-a_sY5gtLoI'
      });
      console.log('[FCM] FCM token:', token);
      return token;
    } else {
      console.warn('[FCM] Notification permission not granted:', permission);
    }
    return null;
  } catch (err) {
    console.error('[FCM] FCM permission error:', err);
    return null;
  }
};

export const onFirebaseMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
