// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAjdxCVHgX_FmhLpB8nKfDMu3LMMDq2JkE",
  authDomain: "mamasaheli-b0d52.firebaseapp.com",
  projectId: "mamasaheli-b0d52",
  storageBucket: "mamasaheli-b0d52.firebasestorage.app",
  messagingSenderId: "483594741503",
  appId: "1:483594741503:web:8e6becd2ad64417205ceca",
  measurementId: "G-GKKMCC3H95"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon-192x192.png'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
